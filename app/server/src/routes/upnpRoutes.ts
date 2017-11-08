import { NextFunction, Request, Response, Router } from "express";
import { BaseRoute, IRoute } from "./route";
import { inject, multiInject, injectable } from "inversify";
import { IUpnpService } from "../services/upnp/upnpService";
import { IHTTPUtils } from "../utils/httpUtils";
import TOOLS from "../utils/toolsType"

@injectable()
export class UpnpRoute implements IRoute {
    readonly APP_BASE_URL = "/upnp";
    private _service: IUpnpService;
    private _httpUtils: IHTTPUtils;

    constructor(@inject("upnp") service: IUpnpService,
                @inject(TOOLS.HTTPUtils) httpUtils: IHTTPUtils){
        this._service = service;
        this._httpUtils = httpUtils;
    }

    configure(router: Router) {
        console.log("[UpnpRoute::create] Creating upnp routes.");

        router.get(this.APP_BASE_URL + "/devices", (req: Request, res: Response, next: NextFunction) => {
            this._httpUtils.configureJSONResponse(req, res, this._service.devices());
        });

        router.post(this.APP_BASE_URL + "/play", (req: Request, res: Response, next: NextFunction) => {
            let params = req.body;
            let device = this._service.devices()
                                      .filter(w => w.address === params.device._address && w.name === params.device._name);
            if(device.length == 0) {
                res.send(404);
            }
            let streamUrl = 'http://' + params.movie._host + ":8080/app/movie/" + params.movie._metadata._imdbId + "/stream/" + encodeURIComponent(params.movie._fileName);
            this._service.playOn(device[0], streamUrl);
            console.log(req);
        });
    }
}