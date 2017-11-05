import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// import { Movie } from '../../../../server/src/entity/movie';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class MovieService {
    private appUrl = 'app';

    constructor(private http: Http) {
    }

    movies(): Observable<any[]> {
        return this.http.get(this.appUrl + '/movies')
                        .map(resp => {
                            return resp.json();
                        });
    }

    movie(id: Number): any {
        return this.http.get(this.appUrl + '/movie/' + id)
                        .toPromise()
                        .then(response => response.json())
                        .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
