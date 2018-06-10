import { IMetadataExtractor, metadata } from "./metadataExtractor";
import { injectable } from "inversify";

@injectable()
export class TitleFromFileExtractor implements IMetadataExtractor {
    extract(builder: metadata.Builder): Promise<void> {
        if (builder.title == null || builder.title == undefined ||
            builder.title == '') {
            let tmp = this.formatString(builder.fileName);
            tmp = this.supressUnexpectedChar(tmp);

            let seriesTypo = this.findSeriesTypo(tmp);

            tmp = this.supressYear(tmp);
            tmp = this.supressKnowWords(tmp);
            console.log("Finded title : " + tmp, seriesTypo);

            if(seriesTypo.isSerie) {
                builder.isSerie = true;
                builder.saisonEpisodes = new metadata.SaisonEpisode(seriesTypo.saison, seriesTypo.episode, builder.fileName);
                builder.title = seriesTypo.title;
            }
            else {
                builder.title = tmp;
            }
        }
        console.log("Title not extracted. already present : " + builder.title);

        return Promise.resolve();
    }

    private formatString(entry: string): string {
        let tmp: string = entry;
        return tmp.substr(0, tmp.lastIndexOf('.')).toLowerCase();
    }

    private supressUnexpectedChar(entry: string): string {
        return entry.replace(new RegExp(/\W/g), ' ')
                    .replace(new RegExp(/\s{2,}/), ' ');
    }

    private supressYear(entry: string): string {
        let reg = new RegExp(/(19|20|21)\d{2}/);
        let match = reg.exec(entry);
        if(match != null) {
            return entry.substr(0, entry.indexOf(match[1])).trim();
        }
        return entry;
    }

    private findSeriesTypo(title: string): any {
        let reg = new RegExp(/(.*)[sS]([0-9]{1,2})[eE]([0-9]{1,2})/);
        let match = reg.exec(title);

        if(match != null) {
            return { 
                isSerie: true,
                saison: match[2],
                episode: match[3],
                title: match[1].trim()
             }
        }
        return { isSerie: false };
    }

    private supressKnowWords(entry: string): string {
        let containWords = entry.split(' ').filter(w => w !== '');
        let tmp: string = '';
        for(let w of containWords) {
            if(this.unexpectedWords.indexOf(w) != -1) {
                if(tmp != '') {
                    break;
                }
            }
            else {
                tmp += w + " ";
            }
        }
        return tmp.trim();
    }

    private unexpectedWords: string[] = [
        'nextorrent',
        'torrent9',
        'pw',
        'net',
        'org',
        'cx',
        'ws',
        'www', 'cpasbien', 'io',
    'imax',
    '1080p',
    '1080i',
    '720p',
    '720i',
    'dvd',
    'dvdrip',
    'bd',
    'bdrip',
    'bluray',
    'vhs',
    'screener',
    'cam',
    'ld',
    'hq',
    'hd',
    'hdtv',
    'tv',
    'french',
    'vf',
    'truefrench',
    'vff',
    'vfq',
    'multi',
    'vo',
    'h264',
    'AVC',
    'divx',
    'xvid',
    'pal',
    'ntsc',
    'ac3',
    'dolby',
    'dts',
    'mp3',
    'vorbis',
    '51',
    '71',
    'vostfr',
    'vost',
    'deleted scenes',
    'stfr',
    'str',
    'subtitle',
    'subtitles',
    'fastsub',
    'fansub',
    'subforced',
    'extended',
    'director',
    'directors',
    'cut',
    'uncut',
    'remastered',
    'limited',
    'unrated',
    '3d',
    'doc',
    'noname',
    'fhd',
    'by',
    'up',
    'repack',
    'proper',
    '3d',
    'side',
    'by',
    'sbs',
    'sidebyside',
    'ac3',
    'x264',
    'BluRayRip'];
}