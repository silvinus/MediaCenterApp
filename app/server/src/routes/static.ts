import { NextFunction, Request, Response, Router } from "express";
import { IRoute } from './route';
import { injectable } from "inversify";


/**
 * / route
 * Route for static content like index.html and other angular template
 * @class User
 */
@injectable()
export class StaticRoute implements IRoute {
  configure(router: Router) {
    console.log("[StaticRoute::create] Creating index route.");
    
      //add home page route
      router.get("/", (req: Request, res: Response, next: NextFunction) => {
        this.index(req, res, next);
      });
  }

  /**
   * Constructor
   *
   * @class IndexRoute
   * @constructor
   */
  constructor() {
  }

  /**
   * The home page route.
   *
   * @class IndexRoute
   * @method index
   * @param req {Request} The express Request object.
   * @param res {Response} The express Response object.
   * @next {NextFunction} Execute the next method.
   */
  public index(req: Request, res: Response, next: NextFunction) {
    //set custom title
    // this.title = "Home | Tour of Heros";

    //set options
    let options: Object = {
      "message": "Welcome to the Tour of Heros"
    };

    //render template
    // this.render(req, res, "index", options);
        //add constants
    res.locals.BASE_URL = "/";
    //add scripts
    // res.locals.scripts = this.scripts;
    //add title
    res.locals.title = "index";

    //render view
    res.render("index", options);
  }
}