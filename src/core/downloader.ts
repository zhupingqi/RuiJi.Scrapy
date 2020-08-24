import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { mimeDetect, mimes } from '@/core/ruiji/mime';

import Vue from "vue";
import VueResource from 'vue-resource';
import utf8 from 'utf8';
Vue.use(VueResource);

import { HttpResponse } from 'vue-resource/types/vue_resource';
import { Charset } from '@/core/charset';

export class Downloader {
    urls: string[] = [];
    vue: Vue = new Vue();

    constructor() {

    }

    getShort() {
        if (this.urls.length <= 10)
            return this.urls;

        let urls = this.urls.slice(0, 9);
        urls.push("......");

        return urls;
    }

    add(url: string) {
        this.urls.push(url.trim());
    }

    start(callbcak: (url: string, current: number) => void) {
        var zip = new JSZip();
        var total = this.urls.length;
        var finish = 0;

        this.urls.forEach((url: string, index: number) => {//blob we have decode bug here
            this.vue.$http.get(url, { responseType: 'arraybuffer' }).then((response: HttpResponse) => {
                let type = (response.headers as any as Map<string, string>).get("content-type");

                let raw = false;
                if (type)
                    raw = mimeDetect.isRaw(type);
                else
                    raw = mimeDetect.urlIsRaw(new URL(url));

                let ext = mimes.getExt(type || "").first();
                let body = (response as any).body;

                if (!raw) {
                    let dbody = Charset.Decode(body, 'utf-8');
                    let cs = Charset.Detect(type, dbody);
                    if (cs.toLowerCase() !== "utf-8") {
                        body = Charset.Decode(body, cs);
                    }
                    zip.file(index + "." + ext, body);
                }
                else {
                    zip.file<"binarystring">(index + "." + ext, body);
                }

                finish++;
                callbcak(url, finish);

                if (finish === total) {
                    this.finish(zip);
                }
            }, () => {
                finish++;
                if (finish === total) {
                    this.finish(zip);
                }
            });         
        });
    }

    private finish(zip: JSZip) {
        zip.generateAsync({ type: "blob" }).then(function (content) {
            FileSaver.saveAs(content, "down.zip");
        });
    }

    clear() {
        this.urls = [];
    }
}