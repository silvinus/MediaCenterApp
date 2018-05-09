export class Settings {
    private key: String;
    slaves: Slave[];

    constructor() {
        this.key = 'settings';
        this.slaves = [];
    }
}

export class Slave {
    public name: String;
    public ip: string;
    public port: number;
    public scanPaths: String[];

    constructor() {
        this.scanPaths = [];
    }
}
