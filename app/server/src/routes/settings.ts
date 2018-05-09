import { NextFunction, Request, Response, Router } from "express";
import { IRoute } from "./route";
import { inject, injectable } from "inversify";
import { ISettings } from "../services/data/settings";
import { settings } from "cluster";
let CONST = require("../IoC/constantes");

@injectable()
export class SettingsRoute implements IRoute {
    private readonly collection: ISettings;

    constructor(
        @inject("settings") collection: ISettings
    ) {
        this.collection = collection;
    }

    configure(router: Router) {
        if(this.collection.isMaster()) {
            console.log("[SettingsRoute::create] Creating settings routes.");
            router.get(CONST.BASE_APP_URL + "/settings", (req: Request, res: Response, next: NextFunction) => {
                this.collection.settings().then(resp => {
                    res.json(resp);
                });
            });

            router.post(CONST.BASE_APP_URL + "/settings", (req: Request, res: Response, next: NextFunction) => {
                console.log(req.body);
                this.collection.save(req.body).then(resp => {
                    res.json(resp);
                });
            });
        }
    }
}