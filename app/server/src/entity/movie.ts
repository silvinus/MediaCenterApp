import { metadata } from "../metadataExtractor/metadataExtractor";
import fs = require("fs");

export class Movie {
    private _fileName: String;
    private _directory: fs.PathLike;
    private _metadata: metadata.Metadata;

    get fileName():String {
        return this.fileName;
    }
    set fileName(fileName:String) {
        this._fileName = fileName;
    }

    get directory():fs.PathLike {
        return this.directory;
    }
    set directory(directory:fs.PathLike) {
        this._directory = directory;
    }

    get metadata():metadata.Metadata {
        return this._metadata;
    }
    set metadata(metadata:metadata.Metadata) {
        this._metadata = metadata;
    }
}