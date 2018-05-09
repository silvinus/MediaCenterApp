import { inject, injectable } from "inversify";
import { Slave } from "../../model/settings";
import { Movie } from "../../model/movie";
import * as rm from 'typed-rest-client/RestClient';

export interface ISlave {
    sync(slave: Slave): Promise<SlaveReport>;
}

export class SlaveReport {
    toRemove: Movie[];
    toAdd: Movie[];

    constructor() {
        this.toRemove = [];
        this.toAdd = [];
    }
}

@injectable()
export class SlaveService implements ISlave {
    constructor() { }

    public async sync(slave: Slave): Promise<SlaveReport> {
        let rest: rm.RestClient = new rm.RestClient('master', 'http://' + slave.ip + ':' + slave.port);
        return (await rest.create<SlaveReport>('/app/scan/' + slave.name, slave.scanPaths)).result;
    }
}