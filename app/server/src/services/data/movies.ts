import Datastore = require("nedb");
import { inject, injectable } from "inversify";
import { Movie } from "../../model/movie"
import { metadata } from "../../metadataExtractor/metadataExtractor"
import { configureDatastore } from "./dataStoreDecorator"

export interface IMovies {
    find(query: any): Promise<Array<Movie>>;
    movies(): Promise<Array<Movie>>;
    insertMovie(movie: Movie): void;
    updateMovie(key: string, update: Movie): void;
    remove(fileName: string): void;
}

@injectable()
export class MoviesRepository implements IMovies {
    private instance: any;

    @configureDatastore('mediacenter')
    private readonly master;
    @configureDatastore('mediacenterslave')
    private readonly slave;

    constructor(private slaveMode: boolean) {
        // Using a unique constraint with the index
        this.master.ensureIndex({ fieldName: '_fileName', unique: true }, function (err) { });
        this.slave.ensureIndex({ fieldName: '_fileName', unique: true }, function (err) { });
        if(this.slaveMode) {
            this.instance = this.slave;
        }
        else {
            this.instance = this.master;
        }
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

    public insertMovie(movie: Movie): void {
        this.instance.insert(movie, err => err ? console.error(err) : console.log("Movie inserted " + movie.metadata.title));
    }

    public updateMovie(key: string, update: Movie): void {
        this.instance.update({ fileName: key }, update, {}, (err, numReplaced) => { 
            console.log(numReplaced, "document replace")
        })
    }

    public remove(fileName: string): void {
        this.instance.remove({ fileName: fileName });
    }
}