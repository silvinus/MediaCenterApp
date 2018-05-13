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
import { ISettings } from "../services/data/settings";
import { ISlave, SlaveService, SlaveReport } from "../services/slave/slaveService";


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
  private readonly settings: ISettings;
  private readonly slaveService: ISlave;
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
    @inject("upnp") upnpService: IUpnpService,
    @inject("settings") settings: ISettings,
    @inject("slave") slaveService: ISlave
  ) {
    this.fsTools = fsTools;
    this.httpUtils = httpUtils;
    this.collection = collection;
    this.executor = executor;
    this.settings = settings;
    this.slaveService = slaveService;
  }

  public configure(router: Router) {
    //log
    if(this.settings.isMaster()) {
      console.log("[AppRoute::create] Creating app routes.");

      router.get(this.APP_BASE_URL + "/movies", (req: Request, res: Response, next: NextFunction) => {
        this.movies(req, res, next);
      });
      router.get(this.APP_BASE_URL + "/movie/:id", (req: Request, res: Response, next: NextFunction) => {
        this.movie(req, res, next);
      });
      router.post(this.APP_BASE_URL + "/sync", (req: Request, res: Response, next: NextFunction) => {
        this.sync(req, res, next);
      });
    }
  }

  generateUUIDString(): any {
    let d = new Date().getTime();
    // if(window.performance && typeof window.performance.now === 'function') {
    //   d += performance.now(); 
    // }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d/16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  public sync(req: Request, res: Response, next: NextFunction) {
    let allPromise: Promise<any>[] = new Array();

    this.settings.settings()
                 .then(all => {
                    all.slaves.forEach(s => {
                      this.slaveService.sync(s)
                                      .then(async (result) => {
                                        console.log("result from " + s.name, result);
                                        result.toRemove.forEach(element => {
                                          this.collection.remove(element.fileName.toString());
                                        });
                                        await Promise.all(result.toAdd.map(async (element) => {
                                          let builder = new metadata.Builder();
                                          builder.directory = element.directory.toString();
                                          builder.fileName = element.fileName.toString();
                                          builder.host = element.host.toString();
                                          builder.imdbId = this.generateUUIDString();
                                          
                                          let populateBuilder = await this.executor.execute(builder);
                                          this.collection.insertMovie(Movie.fromMetadata(populateBuilder.build()));
                                        }));
                                      })

                    });
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
    this.collection.find({'metadata.imdbId': +req.params.id }).then(resp => {
      let result = resp[0] || undefined;
      this.httpUtils.configureJSONResponse(req, res, result);
    });
  }
}