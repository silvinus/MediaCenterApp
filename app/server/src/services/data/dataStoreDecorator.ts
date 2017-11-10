import Datastore = require("nedb");
import { inject, injectable } from "inversify";
let CONST = require("./../../IoC/constantes");

function configureDatastore(collectionName) {
    return function decorator(target, propertyKey) {
        target[propertyKey] = new Datastore({ 
            filename: CONST.DB_PATH + collectionName,
            autoload: true
        });
    }
}

 export { configureDatastore }