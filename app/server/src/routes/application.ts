import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute, IRoute } from "./route";
import { inject, multiInject, injectable } from "inversify";
import { IDatabase } from "../data/database"
import { IFileSystem } from "../utils/fileSystemUtils";
import { IHTTPUtils } from "../utils/httpUtils";
import TOOLS from "../utils/toolsType"
import "reflect-metadata";
import { Movie } from "../entity/movie";
import { IMetadataExtractor, metadata } from "../metadataExtractor/metadataExtractor";


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
  private readonly extractors: IMetadataExtractor[];
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
    @multiInject("extractors")extractors: IMetadataExtractor[]
  ) {
    this.fsTools = fsTools;
    this.httpUtils = httpUtils;
    this.collection = collection;
    this.extractors = extractors;
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

    this.fsTools.files("D:\\test")
        .forEach(file => {
          allPromise.push(this.collection.find({ _fileName: file.fileName })
              .then(movies => {
                if(movies.length == 0) {
                  // TODO: export into service ?
                  let extractorPromises: Promise<metadata.Metadata>[] = new Array(); // TODO: Why any ?
                  this.extractors.forEach(extractor => {
                    extractorPromises.push(extractor.extract(file.fileName, file.directory));
                  });

                  return Promise.all(extractorPromises)
                                .then(metas => {
                                        let movie = new Movie();
                                        movie.fileName = file.fileName;
                                        movie.directory = file.directory;
                                        let fileMeta = metadata.Metadata.builder().build();
                                        metas.forEach(m => fileMeta = metadata.Metadata.merge(fileMeta, m));
                                        movie.metadata = fileMeta;
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