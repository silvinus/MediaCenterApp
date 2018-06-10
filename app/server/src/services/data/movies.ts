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
        if(this.slaveMode) {
            this.slave.ensureIndex({ fieldName: 'fileName', unique: true }, function (err) { });
            this.instance = this.slave;
        }
        else {
            this.master.ensureIndex({ fieldName: 'fileName', unique: true }, function (err) { });
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

    public insertMovie(movie: Movie): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.instance.insert(movie, err => {
                if(err) {
                    console.error(err)
                    resolve(false);
                }
                else {
                    console.log("Movie inserted " + (movie.metadata ? movie.metadata.title : movie.fileName));
                    resolve(true);
                }
            });
        });
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