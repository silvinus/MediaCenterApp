import { NextFunction, Request, Response, Router } from "express";
import { IRoute } from "./route";
import { inject, multiInject, injectable } from "inversify";
import { IMovies } from "../services/data/movies"
import { IFileSystem } from "../utils/fileSystemUtils";
import { IHTTPUtils } from "../utils/httpUtils";
import TOOLS from "../utils/toolsType"
import "reflect-metadata";
import { Movie } from "../model/movie";
import { IMetadataExtractorExecutor, metadata } from "../metadataExtractor/metadataExtractor";
import { IUpnpService } from "../services/upnp/upnpService";


/**
 * / route
 * Route for static content like index.html and other angular template
 * @class User
 */
@injectable()
export class AppRoute implements IRoute {
  private readonly fsTools: IFileSystem;
  private readonly httpUtils: IHTTPUtils;
  private readonly collection: IMovies;
  private readonly executor: IMetadataExtractorExecutor;
  readonly APP_BASE_URL = "/app";

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor(
    @inject(TOOLS.FsUTils) fsTools: IFileSystem,
    @inject(TOOLS.HTTPUtils) httpUtils: IHTTPUtils,
    @inject("movies") collection: IMovies,
    @inject("extractorsExecutor") executor: IMetadataExtractorExecutor, 
    @inject("upnp") upnpService: IUpnpService
  ) {
    this.fsTools = fsTools;
    this.httpUtils = httpUtils;
    this.collection = collection;
    this.executor = executor;
  }

  public configure(router: Router) {
    //log
    console.log("[AppRoute::create] Creating app routes.");

    router.get(this.APP_BASE_URL + "/movies", (req: Request, res: Response, next: NextFunction) => {
      this.movies(req, res, next);
    });
    router.get(this.APP_BASE_URL + "/movie/:id", (req: Request, res: Response, next: NextFunction) => {
      this.movie(req, res, next);
    });
    router.get(this.APP_BASE_URL + "/scan", (req: Request, res: Response, next: NextFunction) => {
      this.scan(req, res, next);
    });
    router.get(this.APP_BASE_URL + "/movie/:id/stream/*", (req: Request, res: Response, next: NextFunction) => {
      this.collection.find({'_metadata._imdbId': +req.params.id }).then(resp => {
        let result = resp[0] || undefined;
        if(!result) {
          res.send(404);
        }
        res.sendFile(result.directory + '\\' +result.fileName.toString());
      });
    });
  }

  //https://www.npmjs.com/package/fs-explorer
  public scan(req: Request, res: Response, next: NextFunction) {
    let allPromise: Promise<any>[] = new Array();
    let allowedExtension: string[] = ['avi', 'mkv', 'mp4'];

    this.fsTools.files("D:\\temp")
        .filter(w => allowedExtension.indexOf(w.extension) != -1)
        .forEach(file => {
          allPromise.push(this.collection.find({ _fileName: file.fileName })
                    .then(movies => {
                      if(movies.length == 0 || movies[0].metadata.title == ''
                          || movies[0].metadata.imageUrl == ''
                          || !movies[0].host) { 
                        if(!movies[0].host) {
                          return new Promise((resolve) => {
                            movies[0].host = "localhost";
                            this.collection.updateMovie(movies[0].fileName.toString(), movies[0]);
                            resolve();
                          });
                        }

                        let builder = metadata.Metadata.builder();
                        builder.fileName = file.fileName.toString();
                        builder.directory = file.directory.toString();
                        builder.host = "localhost"; //TODO

                        return this.executor.execute(builder)
                                            .then((final) => {
                                                let movie = Movie.fromMetadata(final.build());
                                                if(movies.length > 0) {
                                                    return this.collection.updateMovie(movies[0].fileName.toString(), movie);
                                                }
                                                return this.collection.insertMovie(movie);
                                            }, err => err);
                      }
                    }, err => err));
        });

        Promise.all(allPromise)
                .then(
                  promises => { 
                    Promise.all(promises.filter(_ => _ != null))
                           .then(movies => this.httpUtils.configureJSONResponse(req, res, { 'movies': movies }))
                  },
                  err => this.httpUtils.configureJSONResponse(req, res, { 'error': err }));
  }

  public movies(req: Request, res: Response, next: NextFunction) {
    this.collection.movies().then(resp => {
      this.httpUtils.configureJSONResponse(req, res, resp);
    });
  }

  public movie(req: Request, res: Response, next: NextFunction) {
    console.log(req);
    this.collection.find({'_metadata._imdbId': +req.params.id }).then(resp => {
      let result = resp[0] || undefined;
      this.httpUtils.configureJSONResponse(req, res, result);
    });
  }
}