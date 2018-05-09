import { metadata } from "../metadataExtractor/metadataExtractor";

export class Movie {
    public static fromMetadata(meta: metadata.Metadata): Movie {
        let m = new Movie();
        m.directory = meta.directory;
        m.fileName = meta.fileName;
        m.host = meta.host;
        m.metadata = meta;
        return m;
    }
    fileName: String;
    directory: String;
    host: String;
    metadata: metadata.Metadata;
}