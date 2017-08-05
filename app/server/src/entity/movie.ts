import { metadata } from "../metadataExtractor/metadataExtractor";

export class Movie {
    private _fileName: String;
    private _directory: String;
    private _metadata: metadata.Metadata;

    get fileName(): String {
        return this.fileName;
    }
    set fileName(fileName: String) {
        this._fileName = fileName;
    }

    get directory(): String {
        return this.directory;
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