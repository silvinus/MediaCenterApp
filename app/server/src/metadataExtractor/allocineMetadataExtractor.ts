import { IMetadataExtractor, metadata } from "./metadataExtractor";
import { injectable } from "inversify";
import fs = require("fs");

@injectable()
export class AllocineMetadataExtractor implements IMetadataExtractor {
    extract(fileName: String, directoryPath: String): Promise<metadata.Metadata> {
        console.log("Method not implemented.");
        return Promise.resolve(metadata.Metadata.builder().build());
    }

}