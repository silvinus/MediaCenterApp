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
export class SlaveRoute implements IRoute {
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
      console.log("[SlaveRoute::create] Creating slave app routes.");

      // slave route
      router.post(this.APP_BASE_URL + "/scan/:name", (req: Request, res: Response, next: NextFunction) => {
        this.scan(req, res, next);
      });
      router.get(this.APP_BASE_URL + "/movie/:id/stream/*", (req: Request, res: Response, next: NextFunction) => {
        this.collection.find({'metadata.imdbId': +req.params.id }).then(resp => {
          let result = resp[0] || undefined;
          if(!result) {
            res.send(404);
          }
          res.sendFile(result.directory + '\\' +result.fileName.toString());
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
                                .filter(w => allowedExtension.indexOf(w.extension) != -1)
                                .filter(w => all.filter(x => x.fileName === w.fileName).length === 0);
      await Promise.all(filtered.map(async file => {
        let builder = metadata.Metadata.builder();
        builder.fileName = file.fileName.toString();
        builder.directory = file.directory.toString();
        builder.host = device.toString();
        builder.imdbId = this.generateUUIDString();

        let final = Movie.fromMetadata((await this.executor.execute(builder)).build());
        // insert local
        this.collection.insertMovie(final);
        result.toAdd.push(final);
      }));

      resolve(result);
    });        
  }
}