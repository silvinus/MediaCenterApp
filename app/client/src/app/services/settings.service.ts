import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Settings } from '../model/settings';

@Injectable()
export class SettingService {
    private appUrl = 'app';

    constructor(private http: Http) {
    }

    settings(): Observable<Settings> {
        return this.http.get(this.appUrl + '/settings')
                        .map(resp => {
                            console.log(resp);
                            return resp.json();
                        });
    }

    setting(name: String): any {
        return this.http.get(this.appUrl + '/setting/' + name)
                        .toPromise()
                        .then(response => response.json())
                        .catch(this.handleError);
    }

    save(settings: Settings): Observable<Settings> {
        return this.http.post(this.appUrl + '/settings', settings)
                .map(resp => {
                    console.log(resp);
                    return resp.json();
                });
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Promise.reject(error.message || error);
    }
}
