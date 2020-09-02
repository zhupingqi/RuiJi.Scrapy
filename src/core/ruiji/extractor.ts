import $ from 'jquery';
import { baseUrl } from '@/core/common';
import { Processor } from '@/core/ruiji/processor';
import { Uri } from './utils';

export class ExtractResult {
    tiles: ExtractResult[] | null = null;
    blocks: ExtractResult[] | null = null;
    metas: any | null = null;
    paging: string[] | null = null;

    constructor(public name: string, public content: any) {

    }
}

export class Extractor {
    processor!: Processor;
    funcs: any[] = [];
    url: string = "";

    constructor(url: string) {
        this.processor = new Processor();
        this.url = url;
    }

    online(d: any, fn: any) {
        var _this = this;

        $.ajax({
            url: baseUrl + "api/extractor/extract",
            data: JSON.stringify(d),
            type: "POST",
            contentType: "application/json",
            success: function (res) {
                if (res.code === 200) {
                    fn(res);
                }
            }
        });
    }

    setUrl(url: string) {
        this.url = url;
    }

    setFuncs(funcs: any[]) {
        this.funcs = funcs;
    }

    extract(content: string, rule: any, paging: boolean = false) {
        console.log(rule);

        this.processor.funcs = this.funcs;
        var pr = this.processor.process(content, rule.selectors);
        var c = pr.getContent();

        var result = new ExtractResult(rule.name, c);

        if (rule.blocks != null && rule.blocks.length > 0) {
            result.blocks = this.extractBlocks(content, rule.blocks);

            var pagingResult = result.blocks.filter(m => { return m.name === "_paging" }).first();
            if (paging && pagingResult && pagingResult.tiles !== null && pagingResult.tiles.length === 0) {
                pagingResult = this.extract(content, rule.blocks.filter((m: any) => {
                    return m.name === "_paging"
                }).first(), true);
            }

            if (pagingResult && pagingResult.tiles !== null && pagingResult.tiles.length > 0) {
                result.paging = pagingResult.tiles.map((p: any) => { return p.content });
                result.paging = Uri.fixUrl(result.paging, this.url);
            }
        }

        if (rule.tile != null && rule.tile.selectors.length > 0) {
            result.tiles = this.extractTile(c, rule.tile);
        }

        if (rule.metas) {
            result.metas = this.extractMeta(c, rule.metas);
        }

        return result;
    }

    extractBlocks(content: string, blocks: any[]) {
        var results: any[] = [];
    
        blocks.forEach(b => {
            var r = this.extract(content, b);
            results.push(r);
        });

        return results;
    }

    extractTile(content: string, tile: any) {
        var pr = this.processor.process(content, tile.selectors);

        var results: any[] = [];

        pr.matches.forEach(m => {
            var result = new ExtractResult("tile", m);

            if (tile.metas) {
                result.metas = this.extractMeta(m, tile.metas);
            }

            results.push(result);
        });

        return results;
    }

    extractMeta(content: string, metas: any) {
        var results: any = {};
        var keys = Object.keys(metas);

        keys.forEach(key => {
            var value = this.extractSelector(content, metas[key]);
            
            if (value.length > 0) {
                var u = value[0].content;

                if ((key == "link" || key == "href" || key == "url") && !u.startsWith("http")) {
                    u = Uri.fixUrl([u], this.url).first();
                }

                results[key] = u;
            }            
        });

        return results;
    }

    extractSelector(content: string, s: any) {
        var pr = this.processor.process(content, s.selectors);

        var results: any[] = [];

        pr.matches.forEach(m => {
            try {
                let result = new ExtractResult("tile", this.changeType(m, s.type));
                results.push(result);
            }
            catch
            {
                let result = new ExtractResult("tile", m);
                results.push(result);
            }
        });

        return results;
    }

    changeType(content: string, type: number) {
        switch (type) {
            case 18: {
                return content;
            }
            case 9:
            case 11:
                {
                    var r = parseInt(content);
                    if (r === NaN)
                        return content;

                    return r;
                }
            case 16: {
                var r = Date.parse(content);
                if (r === NaN)
                    return content;

                return r;
            }
            case 3: {
                return content === "true" ? true : content === "false" ? false : content;
            }
            case 13:
            case 14: {
                var r = parseFloat(content);
                if (r === NaN)
                    return content;

                return r;
            }
            default: {
                return content;
            }
        }
    }
}