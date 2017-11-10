import Datastore = require("nedb");
import { inject, injectable } from "inversify";
import { configureDatastore } from "../data/dataStoreDecorator";
import { Settings } from "../../model/settings"

export interface ISettings {
    settings(): Promise<Settings>;
}

@injectable()
export class SettingsRepository implements ISettings {
    
    @configureDatastore("settings")
    private readonly instance;

    constructor() { }

    private executeQuery(query: any): Promise<Settings> {
        return new Promise((resolve, reject) => { 
            this.instance.find(query, (err, docs) => {
                if(err) { reject(err); }
                let settings = docs[0] || new Settings();
                resolve(settings);
            }) 
        });
    }

    public settings(): Promise<Settings> {
        return this.executeQuery({});
    }
}