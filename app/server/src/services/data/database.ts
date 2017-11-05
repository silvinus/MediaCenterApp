import Datastore = require("nedb");
import { inject, injectable } from "inversify";
import CONST from "../../IoC/constantes"
import { Movie } from "../../model/movie"
import { metadata } from "../../metadataExtractor/metadataExtractor"

export interface IDatabase {
    find(query: any): Promise<Array<Movie>>;
    movies(): Promise<Array<Movie>>;
    insertMovie(movie: Movie): void;
    updateMovie(key: string, update: Movie): void;
}

@injectable()
export class Database implements IDatabase {
    private readonly instance;

    constructor(
        @inject(CONST.dbPath) dbPath: String
    ) {
        this.instance = new Datastore({ 
            filename: dbPath, 
            autoload: true,
            beforeDeserialization: s => {
                return s;
            },
            afterSerialization: s => {
                return s;
            }});
        // Using a unique constraint with the index
        this.instance.ensureIndex({ fieldName: '_fileName', unique: true }, function (err) {
        });
        // this.instance.ensureIndex({ fieldName: '_imdbId', unique: true }, function (err) {
        // });
    }

    private executeQuery(query: any): Promise<Array<Movie>> {
        return new Promise((resolve, reject) => { 
            this.instance.find(query, (err, docs) => {
                if(err) {
                    reject(err);
                }
                let all: Array<Movie> = [];
                docs.forEach(e => {
                    // TODO: Find a better way, a typed way...
                    var t = new Movie();
                    t.directory = e._directory;
                    t.fileName = e._fileName;
                    t.host = e._host;
                    t.metadata = metadata.Metadata.fromObject(e._metadata);
                    all.push(t);
                });
                resolve(all);
            }) 
        });
    }

    public find(query: any): Promise<Array<Movie>> {
        return this.executeQuery(query);
    }

    public movies(): Promise<Array<Movie>> {
        return this.executeQuery({});
    }

    public insertMovie(movie: Movie): void {
        this.instance.insert(movie, err => err ? console.error(err) : undefined);
    }

    public updateMovie(key: string, update: Movie): void {
        this.instance.update({ _fileName: key }, update, {}, (err, numReplaced) => { 
            console.log(numReplaced, "document replace")
        })
    }
}