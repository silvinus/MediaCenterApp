import { IMetadataExtractor, metadata } from "./metadataExtractor";
import { injectable } from "inversify";
import ffmpeg = require('ffmpeg');
import fs = require("fs");

@injectable()
export class FfmpegMetadataExtractor implements IMetadataExtractor {
    extract(fileName: String, directoryPath: String): Promise<metadata.Metadata> {
        return new ffmpeg(directoryPath.toString() + "/" + fileName)
                        .then((video) => {
                            return metadata.Metadata.builder()
                                                .title(video.metadata.title)
                                                .subTitle("")
                                                .build();
                        }, (err) => {
                            console.log('Error: ' + err);
                        });
    }

}