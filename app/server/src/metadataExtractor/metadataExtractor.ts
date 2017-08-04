import fs = require("fs");

export interface IMetadataExtractor {
    extract(fileName: String, directoryPath: String): Promise<metadata.Metadata>;
}


export namespace metadata {
    export class Metadata {
        public static builder(): Builder {
            return new Builder();
        }

        public static merge(first: metadata.Metadata, second: metadata.Metadata): metadata.Metadata {
            return Metadata.builder()
                            .title(first.title || second.title)
                            .subTitle(first.subTitle || second.subTitle)
                            .build();
        }

        private readonly _title: String;
        private readonly _subTitle: String;

        constructor(title: String, subTitle: String) {
            this._title = title;
            this._subTitle = subTitle; 
        }

        get title(): String {
            return this._title;
        }

        get subTitle(): String {
            return this._subTitle;
        }
    }

    export class Builder {
        private _title: String = "";
        private _subTitle: String = "";

        public title(title: String): Builder {
            this._title = title;
            return this;
        }

        public subTitle(subTitle: String): Builder {
            this._subTitle = subTitle;
            return this;
        }

        public build(): Metadata {
            return new Metadata(this._title, this._subTitle);
        }
    }
}