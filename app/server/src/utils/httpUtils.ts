import { Request, Response } from "express";
import { injectable } from "inversify";

export interface IHTTPUtils {
    configureJSONResponse(req: Request, res: Response, data: Object)
}

@injectable()
export class HTTPUtils implements IHTTPUtils {
    public configureJSONResponse(req: Request, res: Response, data: Object) {
        res.setHeader("accept", "application/json");
        res.setHeader("content-type", "application/json");
        res.json(data);
    }
}