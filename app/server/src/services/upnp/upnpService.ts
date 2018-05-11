
import { injectable, postConstruct } from "inversify";
const NodeCast = require('../../extern/nodecast-js');

export interface IUpnpService {
    start(): void;
    stop(): void;
    playOn(device: any, url: String): void;
    devices(): Array<Device>;
}

export class Device {
    _name: String;
    _address: String;
    _wrap: any;

    constructor(name: String, addr: String, wrap: any) {
        this._name = name;
        this._address = addr;
        this._wrap = wrap;
    }

    public get name(): String  {
        return this._name;
    }

    public get address(): String  {
        return this._address;
    }

    public get wrap(): any  {
        return this._wrap;
    }
}

@injectable()
export class DefaultUpnpService implements IUpnpService {
    _nodecast: any;
    @postConstruct()
    start(): void {
        this._nodecast = new NodeCast();
        
        this._nodecast.onDevice(device => {
            device.onError(err => {
                console.log(err);
            });
        
            console.log(this.devices()); // list of currently discovered devices
        });
        
        this._nodecast.start();
    }
    stop(): void {
        this._nodecast.destroy();
    }
    devices(): Device[] {
        return this._nodecast.getList()
                             .map(w => new Device(w.name, w.host, w));
    }
    playOn(device: Device, url: String): void {
        device.wrap.play(url, 60);
    }
}