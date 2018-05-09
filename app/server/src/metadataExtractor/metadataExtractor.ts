import fs = require("fs");
import { multiInject, injectable } from "inversify";

export interface IMetadataExtractor {
    extract(builder: metadata.Builder): Promise<void>;
}

export interface IMetadataExtractorExecutor {
    execute(builder: metadata.Builder): Promise<metadata.Builder>;
}

@injectable()
export class MetadataExtractorExecutor implements IMetadataExtractorExecutor {
    private readonly extractors: IMetadataExtractor[];

    constructor(
        @multiInject("extractors")extractors: IMetadataExtractor[],
    ) {
        this.extractors = extractors;
    }

    /**
     * Execute in order of registration all extractors. That allow extractors to use 
     * some resolution of previous extractor.
     * By default Ffmpeg is the first extractor and can extract movie name from file metadata.
     * Next extractors can use the finded movie name to search more information about it
     */
    execute(builder: metadata.Builder): Promise<metadata.Builder> {
        return new Promise<metadata.Builder>(async (resolve, reject) => {
            for(let e of this.extractors) {
               await e.extract(builder);
            }

            resolve(builder);
        });
    }

}

export namespace metadata {
    export class Metadata {
        public static builder(): Builder {
            return new Builder();
        }
        public static fromObject(obj: any): Metadata {
            return new Metadata(obj.fileName, obj.directory, obj.host, obj.title,
                                    obj.subTitle, obj.imageUrl, obj.posterImageUrl,
                                    obj.overview, obj.imdbId, obj.genres, obj.releaseDate,
                                    obj.popularity, obj.alternative);
        }
        
        fileName: string = "";
        directory: string = "";
        host: string = "";
        title: string = "";
        subTitle: string = "";
        imageUrl: string = "";
        posterImageUrl: string = "";
        overview: string = "";
        imdbId: number;
        genres: number[] = [];
        releaseDate: string = "";
        popularity: number;
        alternative: any[];

        constructor(fileName: string, directory: string, host: string, title: string, subtitle: string,
                        imageUrl: string, posterImageUrl: string, overview: string, imdbId: number,
                        genres: number[], releaseDate: string, popularity: number, alternative: any[]) {
            this.fileName = fileName;
            this.directory = directory;
            this.host = host;
            this.title = title;
            this.subTitle = subtitle;
            this.imageUrl = imageUrl;
            this.posterImageUrl = posterImageUrl;
            this.overview = overview;
            this.imdbId = imdbId;
            this.genres = genres;
            this.releaseDate = releaseDate;
            this.popularity = popularity;
            this.alternative = alternative;
        }
    }

    export class Builder {
        fileName: string = "";
        directory: string = "";
        host: string = "";
        title: string = "";
        subTitle: string = "";
        imageUrl: string = "";
        posterImageUrl: string = "";
        overview: string = "";
        imdbId: number;
        genres: number[] = [];
        releaseDate: string = "";
        popularity: number = 0;
        alternative: any[];

        public build(): Metadata {
            return new Metadata(this.fileName, 
                this.directory, 
                this.host,
                this.title, 
                this.subTitle,
                this.imageUrl, this.posterImageUrl,
                this.overview, this.imdbId,
                this.genres,
                this.releaseDate, this.popularity, this.alternative);
        }
    }
}