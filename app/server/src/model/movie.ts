import { metadata } from "../metadataExtractor/metadataExtractor";

// TODO: Review class and remove private and getter. Simplify it
export class Movie {
    public static fromMetadata(meta: metadata.Metadata): Movie {
        let m = new Movie();
        m.directory = meta.directory;
        m.fileName = meta.fileName;
        m.host = meta.host;
        m.metadata = meta;
        return m;
    }
    private _fileName: String;
    private _directory: String;
    private _host: String;
    private _metadata: metadata.Metadata;

    get fileName(): String {
        return this._fileName;
    }
    set fileName(fileName: String) {
        this._fileName = fileName;
    }

    get host(): String {
        return this._host;
    }
    set host(host: String) {
        this._host = host;
    }

    get directory(): String {
        return this._directory;
    }
    set directory(directory: String) {
        this._directory = directory;
    }

    get metadata():metadata.Metadata {
        return this._metadata;
    }
    set metadata(metadata:metadata.Metadata) {
        this._metadata = metadata;
    }
}