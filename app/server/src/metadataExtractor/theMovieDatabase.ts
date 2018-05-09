import { IMetadataExtractor, metadata } from "./metadataExtractor";
import { injectable } from "inversify";
import fs = require("fs");
import http = require("https");
import qs = require('querystring');

@injectable()
export class TheMovieDatabaseMetadataExtractor implements IMetadataExtractor {
    // TODO: export on settings
    private readonly _apiKey: String = "api_key=8c46bd4597983f80f3281bcb4568e066";
    private readonly _conf: Promise<any>;
    private readonly promises: Array<Promise<void>>;
    private readonly queue: Array<metadata.Builder>;

	constructor() {
        this.promises = [];
        this.queue = [];

        this._conf = this.configuration().then((conf) => {
                            return conf;
                        });
        setInterval(() => {
            if(this.queue.length > 0) {
                this.queue.slice(0, 35)
                          .forEach(w => this.extract(w));
            }
        }, 5000)
	}
    

    public async extract(builder: metadata.Builder): Promise<void> {
        // first find configurations
        if(builder.imageUrl) {
            return Promise.resolve();
        }

        let promise = new Promise<void>((resolve, reject) => {
            this._conf.then((conf) => {
                    const _conf = conf;
                    // finally search movie
                    this.search(builder.title || builder.fileName).then((result) => {
                        console.log(result);
                        if(result.total_results > 0) {
                            let bestResult = result.results[0];
                            builder.title = bestResult.original_title;
                            builder.subTitle = bestResult.title;
                            builder.imageUrl = _conf.images.secure_base_url + "w185" +  bestResult.poster_path;
                            builder.posterImageUrl = _conf.images.secure_base_url + "original" +  bestResult.poster_path;
                            builder.overview = bestResult.overview;
                            builder.imdbId = bestResult.id;
                            builder.genres = bestResult.genre_ids;
                            builder.releaseDate = bestResult.release_date;
                            builder.popularity = bestResult.popularity;
                            builder.alternative = result.results.splice(0, 1);
                        }
                        resolve();
                    }, e => reject(e));
                }, e => reject(e));
        });

        if(this.promises.length > 35) {
            await Promise.all(this.promises)
                         .then(_ => this.promises.splice(0));

            this.queue.push(builder);
        }
        else {
            this.promises.push(promise);
        }

        return promise;
    }

    private configuration(): Promise<any> {
        //https://api.themoviedb.org/3/configuration?api_key=8c46bd4597983f80f3281bcb4568e066
        return new Promise((resolve, reject) => {
            var options = {
                "method": "GET",
                "hostname": "api.themoviedb.org",
                "port": null,
                "path": "/3/configuration?" + this._apiKey,
                "headers": {}
            };

            this.sendRequest(options, resolve);
        });
    }

    private search(calculatedTitle: string): Promise<any> {
        //https://api.themoviedb.org/3/search/movie?api_key=8c46bd4597983f80f3281bcb4568e066&language=fr-FR&query=rogue%20one&include_adult=false

        return new Promise((resolve, rejest) => {
            let includeAdulte = "include_adult=false";
            let query = "query=" + qs.escape(calculatedTitle);
            let language = "language=fr-FR";
            var options = {
                "method": "GET",
                "hostname": "api.themoviedb.org",
                "port": null,
                "path": "/3/search/movie?" + includeAdulte + "&" + query + "&" + language + "&" + this._apiKey,
                "headers": {}
            };

            this.sendRequest(options, resolve);
        });
    }

    private sendRequest(options, callback): void {
        var req = http.request(options, function (res) {
                    var chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function () {
                        var body = Buffer.concat(chunks);
                        callback(JSON.parse(body.toString()));
                    });
                });

        req.on('error', function(err) {
            console.log(err);
        });

        req.write("{}");
        req.end();
    }
}