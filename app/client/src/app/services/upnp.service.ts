import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
// import { Movie } from '../../../../server/src/entity/movie';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/concatAll';

@Injectable()
export class UpnpService {
    private appUrl = 'upnp';

    constructor(private http: Http) {
    }

    devices(): Observable<Device[]> {
        return this.http.get(this.appUrl + '/devices')
                        .map(resp => {
                            console.log(resp);
                            return <Device[]>resp.json().map(w => new Device(w._name, w._address));
                        });
    }

    play(device: Device, movie: any) {
        this.http.post(this.appUrl + '/play', {
            device: device,
            movie: movie
        }).subscribe();
    }
}

export class Device {
    private _name: String;
    private _address: String;

    constructor(name: String,
                adress: String) {
        this._name = name;
        this._address = adress;
    }

    public get name(): String {
        return this._name;
    }

    public get address(): String {
        return this._address;
    }
}
