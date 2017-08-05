import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
// import { Movie } from '../../../../server/src/entity/movie';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class MovieService {
    private appUrl = "app/movies";

    constructor(private http: Http) {
        
    }

    movies(): Promise<any[]> {
        return this.http.get(this.appUrl)
                        .toPromise()
                        .then(response => response.json())
                        .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}