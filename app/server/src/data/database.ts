import Datastore = require("nedb");
import { inject, injectable } from "inversify";
import CONST from "../IoC/constantes"
import { Movie } from "../model/movie"

export interface IDatabase {
    find(query: any): Promise<Array<Movie>>;
    movies(): Promise<Array<Movie>>;
    insertMovie(movie: Movie)
}

@injectable()
export class Database implements IDatabase {
    private readonly instance;

    constructor(
        @inject(CONST.dbPath) dbPath: String
    ) {
        this.instance = new Datastore({ filename: dbPath, autoload: true });
        // Using a unique constraint with the index
        this.instance.ensureIndex({ fieldName: '_fileName', unique: true }, function (err) {
        });
    }

    private executeQuery(query: any): Promise<Array<Movie>> {
        return new Promise((resolve, reject) => { 
            this.instance.find(query, (err, docs) => {
                if(err) {
                    reject(err);
                }

                resolve(docs);
            }) 
        });
    }

    public find(query: any): Promise<Array<Movie>> {
        return this.executeQuery(query);
    }

    public movies(): Promise<Array<Movie>> {
        return this.executeQuery({});
    }

    public insertMovie(movie: Movie) {
        this.instance.insert(movie, err => err ? console.error(err) : undefined);
    }
}