/// <reference path="../@types/jschardet.d.ts" />
import $ from 'jquery';
//import jschardet from 'jschardet';

export class Charset {
    static CHARTSET_RE: RegExp = /(?:charset|encoding)\s{0,10}=\s{0,10}['"]? {0,10}([\w\-]{1,100})/i;

    constructor() {

    }

    static Detect(contentType: string | undefined, data: string) {
        let matchs = null;
        if (contentType) {
            matchs = Charset.CHARTSET_RE.exec(contentType);
        }
        if (!matchs) {
            matchs = data.match(/\<head\>[.\s\S]*?\<meta.*?charset\s*=\s*['"]?(.*?)['"]?\s*\/?\>[.\s\S]*\<\/head\>/i);
        }

        let cs = null;
        if (matchs) {
            cs = matchs[1].toLowerCase();
        }

        if (cs === null) {
            cs = jschardet.detect(data).encoding;
        }

        return cs;
    }

    static Convert(str: string, from: string, to: string = "utf-8"): string {
        str = str || '';
        if (from.toLowerCase() === to.toLowerCase()) {
            return str;
        }

        var encoder = new TextEncoder();
        var bytes = encoder.encode(str);

        var de = new TextDecoder(from);
        return de.decode(bytes);
    }

    static Decode(bytes: Uint8Array, to: string): string {
        var de = new TextDecoder(to);
        return de.decode(bytes);
    }
}