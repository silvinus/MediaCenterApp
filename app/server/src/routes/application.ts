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
import { ISlaveHealthCheck } from "../services/slave/slaveHealthCheck";
let logger = require("debug")("mediacenter");


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
  private readonly slaveHealthCheck: ISlaveHealthCheck;
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
    @inject("slave") slaveService: ISlave,
    @inject("slaveHealthCheck") slaveHealthCheck: ISlaveHealthCheck
  ) {
    this.fsTools = fsTools;
    this.httpUtils = httpUtils;
    this.collection = collection;
    this.executor = executor;
    this.settings = settings;
    this.slaveService = slaveService;
    this.slaveHealthCheck = slaveHealthCheck;
  }

  public configure(router: Router) {
    //log
    if(this.settings.isMaster()) {
      logger("[AppRoute::create] Creating app routes.");

      router.get(this.APP_BASE_URL + "/movies", (req: Request, res: Response, next: NextFunction) => {
        this.movies(req, res, next);
      });
      router.get(this.APP_BASE_URL + "/movie/:id", (req: Request, res: Response, next: NextFunction) => {
        this.movie(req, res, next);
      });
      router.post(this.APP_BASE_URL + "/sync", (req: Request, res: Response, next: NextFunction) => {
        this.sync(req, res, next);
      });
      router.get(this.APP_BASE_URL + "/slave/healthcheck", (req: Request, res: Response, next: NextFunction) => {
        this.httpUtils.configureJSONResponse(req, res, this.slaveHealthCheck.getReport());
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

  public async sync(req: Request, res: Response, next: NextFunction) {
    let allMovies: Movie[] = new Array();

    let all = await this.settings.settings();
    await Promise.all(all.slaves.map(async s => {
      let result = await this.slaveService.sync(s);
      console.log("result from " + s.name, result);
      (await this.synchronize(result)).forEach(w => allMovies.push(w));
    }));
    this.httpUtils.configureJSONResponse(req, res, { 'movies': allMovies });
  }

  private async synchronize(result: SlaveReport): Promise<Movie[]> {
    result.toRemove.forEach(element => {
      this.collection.remove(element.fileName.toString());
    });
    return await Promise.all(result.toAdd.map(async (element) => {
      let builder = new metadata.Builder();
      builder.directory = element.directory.toString();
      builder.fileName = element.fileName.toString();
      builder.host = element.host.toString();
      builder.imdbId = this.generateUUIDString();
      
      return new Promise<Movie>((resolve, reject) => {
        this.executor.execute(builder).then(populateBuilder => {
          this.findMovie(populateBuilder.imdbId).then(async movie => {
            if(populateBuilder.isSerie) {
              if(movie !== undefined) {
                movie.metadata.saisonEpisodes.push(
                  new metadata.SaisonEpisode(populateBuilder.saisonEpisodes.saison, populateBuilder.saisonEpisodes.episode, populateBuilder.saisonEpisodes.filename))
                this.collection.updateMovie(movie.fileName.toString(), movie);
              }
              else {
                movie = Movie.fromMetadata(populateBuilder.build());
                await this.collection.insertMovie(movie);
              }
            }
            else {
              movie = Movie.fromMetadata(populateBuilder.build());
              await this.collection.insertMovie(movie);
            }
            resolve(movie);
          });
        });
      });
      // let populateBuilder = await this.executor.execute(builder)
      
      // let movie: Movie = await this.findMovie(populateBuilder.imdbId);

      
    }));
  }

  public movies(req: Request, res: Response, next: NextFunction) {
    this.collection.movies().then(resp => {
      this.httpUtils.configureJSONResponse(req, res, resp);
    });
  }

  public async movie(req: Request, res: Response, next: NextFunction) {
    logger(req.originalUrl);
    let query: any;

    //hack because in database we have number (real ImdbId) or UUID...
    // Have to fix it
    if(isNaN(+req.params.id)) {
      query = {'metadata.imdbId': req.params.id };
    }
    else {
      query = {'metadata.imdbId': +req.params.id };
    }
    this.httpUtils.configureJSONResponse(req, res, (await this.findMovie(req.params.id)));
  }

  private async findMovie(imdbId: any): Promise<Movie> {
    let query: any;
    //hack because in database we have number (real ImdbId) or UUID...
    // Have to fix it
    if(isNaN(+imdbId)) {
      query = {'metadata.imdbId': imdbId };
    }
    else {
      query = {'metadata.imdbId': +imdbId };
    }
    return (await this.collection.find(query))[0] || undefined;
  }
}