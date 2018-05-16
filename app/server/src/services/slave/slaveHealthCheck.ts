import { inject, injectable } from "inversify";
import { Slave } from "../../model/settings";
import { Movie } from "../../model/movie";
import * as rm from 'typed-rest-client/RestClient';
import { ISettings } from "../data/settings";
import { ISlave } from "./slaveService";

export interface ISlaveHealthCheck {
    getReport(): HealthCheck[];
}

export class HealthCheck {
    isAlive: boolean;
    slave: Slave;
    error: any;
}

@injectable()
export class SlaveHealthCheck implements ISlaveHealthCheck {
    private healthCheckReport: HealthCheck[];
    constructor(@inject("settings") private settings: ISettings) { 

        setInterval(async __ => {
            this.healthCheckReport = await this.check();
        }, 5000);
    }

    async check(): Promise<HealthCheck[]> {
        let slave = (await this.settings.settings()).slaves;

        return Promise.all(slave.map(async slave => {
            let healthCheck = new HealthCheck();
            try {
                let rest: rm.RestClient = new rm.RestClient('master', 'http://' + slave.ip + ':' + slave.port);
                let response = await rest.get<HealthCheck>('/app/healthcheck');
                if(response.statusCode != 200) {
                    healthCheck.isAlive = false;
                    healthCheck.slave = slave
                    healthCheck.error = response.statusCode;
                }
                else {
                    healthCheck = response.result;
                }
                healthCheck.slave = slave;
            } catch(err) {
                healthCheck.isAlive = false;
                healthCheck.slave = slave
                healthCheck.error = err;
            }
            return healthCheck;
        }));
    }

    getReport(): HealthCheck[] {
        return this.healthCheckReport;
    }
}