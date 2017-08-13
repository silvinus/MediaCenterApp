import { IMetadataExtractor, metadata } from "./metadataExtractor";
import { injectable } from "inversify";
import ffmpeg = require('ffmpeg');
import fs = require("fs");

@injectable()
export class FfmpegMetadataExtractor implements IMetadataExtractor {
    extract(builder: metadata.Builder): Promise<void> {
        return new ffmpeg(builder.directory.toString() + "/" + builder.fileName)
                        .then((video) => {
                            builder.title = video.metadata.title;
                        }, (err) => {
                            console.log('Error: ' + err);
                        });
    }

}