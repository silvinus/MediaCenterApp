import { NextFunction, Request, Response, Router } from "express";
import { IRoute } from "./route";
import { inject, multiInject, injectable } from "inversify";
import { IUpnpService } from "../services/upnp/upnpService";
import { IHTTPUtils } from "../utils/httpUtils";
import TOOLS from "../utils/toolsType"
import { ISettings } from "../services/data/settings";

@injectable()
export class UpnpRoute implements IRoute {
    readonly APP_BASE_URL = "/upnp";
    private _service: IUpnpService;
    private _httpUtils: IHTTPUtils;

    constructor(@inject("upnp") service: IUpnpService,
                @inject("settings") private settings: ISettings,
                @inject(TOOLS.HTTPUtils) httpUtils: IHTTPUtils){
        this._service = service;
        this._httpUtils = httpUtils;
    }

    configure(router: Router) {
        console.log("[UpnpRoute::create] Creating upnp routes.");

        router.get(this.APP_BASE_URL + "/devices", (req: Request, res: Response, next: NextFunction) => {
            this._httpUtils.configureJSONResponse(req, res, this._service.devices());
        });

        router.post(this.APP_BASE_URL + "/play", async (req: Request, res: Response, next: NextFunction) => {
            let params = req.body;
            let device = this._service.devices()
                                      .filter(w => w.address === params.device._address && w.name === params.device._name);
            if(device.length == 0) {
                res.send(404);
            }
            let sett = (await this.settings.settings())
                                        .slaves.filter(s => s.name === params.movie.host);
            if(sett.length == 0) {
                res.send(404);
            }        

            let streamUrl = 'http://' + sett[0].ip + ":" + sett[0].port + "/app/movie/" + params.movie.metadata.imdbId + "/stream/" + encodeURIComponent(params.movie.fileName);
            this._service.playOn(device[0], streamUrl);
            console.log(req);
        });
    }
}