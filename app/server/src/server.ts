import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import errorHandler = require("errorHandler");
import methodOverride = require("method-override");
import { StaticRoute } from "./routes/static";
import { IRoute } from "./routes/route";
import container from "./IoC/inversify.config";
let CONST = require("./IoC/constantes");

/**
 * The server.
 *
 * @class Server
 */
export class Server {

  public app: express.Application;

  /**
   * Bootstrap the application.
   *
   * @class Server
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): Server {
    return new Server();
  }

  /**
   * Constructor.
   *
   * @class Server
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();

    //configure application
    this.config();

    //add routes
    this.routes(
      container.getAll<IRoute>(CONST.ROUTES_COMPONENTS)
    );

    //add api
    this.api();
  }
  /**
   * Create REST API routes
   *
   * @class Server
   * @method api
   */
  public api() {
    //empty for now
  }

  /**
   * Configure application
   *
   * @class Server
   * @method config
   */
  public config() {
    //add static paths
    // console.log('Static path', "app/client/dist");
    // console.log('Static path', "node_modules");

    // this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(express.static("app/client/dist"));
    //this.app.use('/swimlane', express.static('app/client/node_modules/@swimlane'));

    //configure pug
    // this.app.set("views", path.join(__dirname, "views"));
    // this.app.set("view engine", "pug");

    //use logger middlware
    this.app.use(logger("dev"));

    //use json form parser middlware
    this.app.use(bodyParser.json());

    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
        extended: false
    }));

    //use cookie parker middleware middlware
    this.app.use(cookieParser("SECRET_GOES_HERE"));

    //use override middlware
    this.app.use(methodOverride());

    //catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });

    //error handling
    this.app.use(errorHandler());
  }

  /**
   * Create router
   *
   * @class Server
   * @method api
   */
  public routes(routes: IRoute[]) {
    let router: express.Router;
    router = express.Router();

    //StaticRoute
    // StaticRoute.create(router);
    
    //rest app route
    //AppRoute.create(router);
    routes.forEach(r => r.configure(router));

    //use router middleware
    this.app.use(router);
  }
}