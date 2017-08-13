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

        private readonly _fileName: string = "";
        private readonly _directory: string = "";
        private readonly _title: string = "";
        private readonly _subTitle: string = "";
        private readonly _imageUrl: string = "";
        private readonly _posterImageUrl: string = "";
        private readonly _overview: string = "";
        private readonly _imdbId: number;
        private readonly _genres: number[] = [];
        private readonly _releaseDate: string = "";
        private readonly _popularity: number;
        private readonly _alternative: any[];


        constructor(fileName: string, directory: string, title: string, subtitle: string,
                        imageUrl: string, posterImageUrl: string, overview: string, imdbId: number,
                        genres: number[], releaseDate: string, popularity: number, alternative: any[]) {
            this._fileName = fileName;
            this._directory = directory;
            this._title = title;
            this._subTitle = subtitle;
            this._imageUrl = imageUrl;
            this._posterImageUrl = posterImageUrl;
            this._overview = overview;
            this._imdbId = imdbId;
            this._genres = genres;
            this._releaseDate = releaseDate;
            this._popularity = popularity;
            this._alternative = alternative;
        }
        

        public get fileName(): string  {
            return this._fileName;
        }
            
        public get directory(): string  {
            return this._directory;
        }
        
        public get title(): string  {
            return this._title;
        }
        
        public get subTitle(): string  {
            return this._subTitle;
        }
        
        public get imageUrl(): string  {
            return this._imageUrl;
        }
        
        public get posterImageUrl(): string  {
            return this._posterImageUrl;
        }

        public get overview(): string  {
            return this._overview;
        }

        public get imdbId(): number {
            return this._imdbId;
        }

        public get genres(): number[]  {
            return this._genres;
        }

        public get releaseDate(): string  {
            return this._releaseDate;
        }

        public get popularity(): number  {
            return this._popularity;
        }

        public get alternative(): any[] {
            return this._alternative;
        }
        
    }

    export class Builder {
        private _fileName: string = "";
        private _directory: string = "";
        private _title: string = "";
        private _subTitle: string = "";
        private _imageUrl: string = "";
        private _posterImageUrl: string = "";
        private _overview: string = "";
        private _imdbId: number;
        private _genres: number[] = [];
        private _releaseDate: string = "";
        private _popularity: number = 0;
        private _alternative: any[];

        public get fileName(): string  {
            return this._fileName;
        }

        public set fileName(value: string ) {
            this._fileName = value;
        }
            
        public get directory(): string  {
            return this._directory;
        }

        public set directory(value: string ) {
            this._directory = value;
        }
        
        public get title(): string  {
            return this._title;
        }

        public set title(value: string ) {
            this._title = value;
        }
        
        public get subTitle(): string  {
            return this._subTitle;
        }

        public set subTitle(value: string ) {
            this._subTitle = value;
        }
        
        public get imageUrl(): string  {
            return this._imageUrl;
        }

        public set imageUrl(value: string ) {
            this._imageUrl = value;
        }
        
        public get posterImageUrl(): string  {
            return this._posterImageUrl;
        }

        public set posterImageUrl(value: string ) {
            this._posterImageUrl = value;
        }

        public get overview(): string  {
            return this._overview;
        }

        public set overview(value: string ) {
            this._overview = value;
        }

        public get imdbId(): number {
            return this._imdbId;
        }

        public set imdbId(value: number) {
            this._imdbId = value;
        }

        public get genres(): number[]  {
            return this._genres;
        }

        public set genres(value: number[] ) {
            this._genres = value;
        }

        public get releaseDate(): string  {
            return this._releaseDate;
        }

        public set releaseDate(value: string ) {
            this._releaseDate = value;
        }

        public get popularity(): number  {
            return this._popularity;
        }

        public set popularity(value: number ) {
            this._popularity = value;
        }

        public get alternative(): any[] {
            return this._alternative;
        }

        public set alternative(value: any[]) {
            this._alternative = value;
        }

        public build(): Metadata {
            return new Metadata(this._fileName, 
                this._directory, 
                this._title, 
                this._subTitle,
                this._imageUrl, this._posterImageUrl,
                this._overview, this._imdbId,
                this._genres,
                this._releaseDate, this._popularity, this._alternative);
        }
    }
}