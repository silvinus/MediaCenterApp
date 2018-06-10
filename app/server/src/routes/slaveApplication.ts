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
let logger = require("debug")("mediacenter");


/**
 * / route
 * Route for static content like index.html and other angular template
 * @class User
 */
@injectable()
export class SlaveRoute implements IRoute {
  private readonly fsTools: IFileSystem;
  private readonly httpUtils: IHTTPUtils;
  private readonly collection: IMovies;
  private readonly executor: IMetadataExtractorExecutor;
  private readonly settings: ISettings;
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
    @inject("slavemovies") collection: IMovies,
    @inject("extractorsExecutor") executor: IMetadataExtractorExecutor, 
    @inject("upnp") upnpService: IUpnpService,
    @inject("settings") settings: ISettings
  ) {
    this.fsTools = fsTools;
    this.httpUtils = httpUtils;
    this.collection = collection;
    this.executor = executor;
    this.settings = settings;
  }

  public configure(router: Router) {
    if(this.settings.isSlave()) {
      //log
      logger("[SlaveRoute::create] Creating slave app routes.");

      // slave route      
      router.get(this.APP_BASE_URL + "/healthCheck", (req: Request, res: Response, next: NextFunction) => {
        this.httpUtils.configureJSONResponse(req, res, { isAlive: true });
      });
      router.post(this.APP_BASE_URL + "/scan/:name", (req: Request, res: Response, next: NextFunction) => {
        this.scan(req, res, next);
      });
      router.get(this.APP_BASE_URL + "/movie/:id/stream/*", (req: Request, res: Response, next: NextFunction) => {
        this.collection.find({'fileName': req.params.id }).then(resp => {
          let result = resp[0] || undefined;
          if(!result) {
            res.send(404);
            return;
          }
          res.sendFile(result.directory + '\\' + result.fileName.toString());
        });
      });
    }
  }

  public async scan(req: Request, res: Response, next: NextFunction) {
    let result: SlaveReport = new SlaveReport();

    await Promise.all(req.body.map(async p => {
      let report = await this.scanPath(p, req.params.name);
      report.toRemove.forEach(w => result.toRemove.push(w));
      report.toAdd.forEach(w => result.toAdd.push(w));
    }));

    this.httpUtils.configureJSONResponse(req, res, result);
  }

  private async scanPath(p: String, device: String): Promise<SlaveReport> {
    let allowedExtension: string[] = ['avi', 'mkv', 'mp4']; // todo in settings

    return new Promise<SlaveReport>(async (resolve, reject) => {
      let result: SlaveReport;
      // first check for removed items
      result = new SlaveReport();
      let all = await this.collection.find({ 'host': device });
      // remove phase
      all.forEach(item => {
        // remove if file doesn't exists
        if(!this.fsTools.fileExists(item.directory + '\\' + item.fileName)) {
          result.toRemove.push(item);
          // remove local
          this.collection.remove(item.fileName.toString());
        }
      });

      // update phase
      // loop on each files not with extension allowed and not in items (new files)
      // nothing will be do for existings items.
      let filtered = this.fsTools.files(p)
                                .filter(w => allowedExtension.indexOf(w.extension) != -1) // be carefull if ext not at the end but part of title
                                .filter(w => all.filter(x => x.fileName === w.fileName).length === 0);
      await Promise.all(filtered.map(async file => {
        let item = new Movie();
        item.fileName = file.fileName.toString();
        item.directory = file.directory.toString();
        item.host = device.toString();

        // let final = Movie.fromMetadata((await this.executor.execute(builder)).build());
        // insert local
        this.collection.insertMovie(item);
        result.toAdd.push(item);
      }));

      resolve(result);
    });        
  }
}