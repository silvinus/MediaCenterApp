
import { injectable, inject } from "inversify";
import "reflect-metadata";
import fs = require("fs");
import ffmpeg = require('ffmpeg');
import extend = require('util-extend');

export interface IFileSystem {
    files(directory: String): Array<File>
}

@injectable()
export class FileSystemUtil implements IFileSystem {
    private walkInternal(directory: String, fileList: File[]): void {
        let files = fs.readdirSync(directory.toString());
        files.forEach((value: String) => {
            if(fs.statSync(directory.toString() + "/" + value).isDirectory()) {
                this.walkInternal(directory.toString() + "/" + value, fileList);
            }
            else {
                fileList.push(new File(value, directory));
            }
        });
    }

    public files(directory: String): Array<File> {
        console.debug("walk in directory", directory);
        let fileList: File[] = new Array();
        this.walkInternal(directory, fileList);
        return fileList;
    }
}

export class File {
    private readonly _fileName: String;
    private readonly _directory: String;

    constructor(fileName: String, directory: String) {
        this._fileName = fileName;
        this._directory = directory;
    }

    get fileName(): String {
        return this._fileName;
    }

    get directory(): String {
        return this._directory;
    }
}