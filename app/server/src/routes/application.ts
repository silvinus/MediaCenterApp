import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute, IRoute } from "./route";
import { inject, multiInject, injectable } from "inversify";
import { IDatabase } from "../data/database"
import { IFileSystem } from "../utils/fileSystemUtils";
import { IHTTPUtils } from "../utils/httpUtils";
import TOOLS from "../utils/toolsType"
import "reflect-metadata";
import { Movie } from "../model/movie";
import { IMetadataExtractorExecutor, metadata } from "../metadataExtractor/metadataExtractor";


/**
 * / route
 * Route for static content like index.html and other angular template
 * @class User
 */
@injectable()
export class AppRoute implements IRoute {

  private readonly fsTools: IFileSystem;
  private readonly httpUtils: IHTTPUtils;
  private readonly collection: IDatabase;
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
    @inject("movies") collection: IDatabase,
    @inject("extractorsExecutor") executor: IMetadataExtractorExecutor 
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
    router.get(this.APP_BASE_URL + "/scan", (req: Request, res: Response, next: NextFunction) => {
      this.scan(req, res, next);
    });
  }

  public scan(req: Request, res: Response, next: NextFunction) {
    let allPromise: Promise<any>[] = new Array();

    this.fsTools.files("D:\\temp")
        .forEach(file => {
          allPromise.push(this.collection.find({ _fileName: file.fileName })
              .then(movies => {
                if(movies.length == 0) {
                  let builder = metadata.Metadata.builder();
                  builder.fileName = file.fileName.toString();
                  builder.directory = file.directory.toString();
                  return this.executor.execute(builder)
                              .then((final) => {
                                  let movie = Movie.fromMetadata(final.build());
                                  return this.collection.insertMovie(movie);
                              });
                }
              }));
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
}