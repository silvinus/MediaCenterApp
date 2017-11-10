import * as express from "express";

export interface IRoute {
   configure(router: express.Router)
}