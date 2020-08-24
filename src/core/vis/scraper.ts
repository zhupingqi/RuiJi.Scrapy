import $ from 'jquery';
import { Block } from "@/core/vis/block";

export class ScraperOption {
    rerange: boolean = false;
    removesame: boolean = false;
}

class Table {
    fields: string[];
    rows: any[][];
    rowIndex: number = 0;

    constructor(fields: Set<string>, rows: number) {
        this.fields = Array.from(fields.keys());
        this.rows = new Array<string[]>(rows);
        this.rows.fill(this.fields.slice(0));

        this.rows.forEach((row, index) => {
            this.rows[index] = new Array<string>(this.fields.length);
            this.rows[index].fill({ text:'' });
        });
    }

    insert(map: Map<any, any[]>) {
        map.forEach((v: any[], key: any) => {
            let i = this.fields.indexOf(key);
            this.rows[this.rowIndex][i] = v.first();
        });

        this.rowIndex++;
    }
}

export class Scraper {
    constructor(public block: Block, public opt: ScraperOption) { }

    getDoms(block: Block) {
        let subs: HTMLElement[] = [];

        if (block.sub_blocks.length === 0) {
            subs = subs.concat(block.doms);
        } else {
            block.sub_blocks.map(b => {
                subs = subs.concat(this.getDoms(b));
            });
        }

        return subs;
    }

    getSubDoms(doms: HTMLElement[]) {
        let _this = this;
        let subs: HTMLElement[] = [];

        doms.forEach(function (dom) {
            if (dom.tagName === "A") {
                subs.push(dom);
                return;
            }

            if (dom.children.length > 0) {
                subs = subs.concat(_this.getSubDoms(Array.from(dom.children) as HTMLElement[]));
            } else {
                subs.push(dom);
            }
        });

        return subs;
    }

    fixUrl(url: string) {
        if (url === undefined)
            return "";

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return new URL(document.URL).origin + url;
        }

        return url;
    }

    getPath(el: HTMLElement, subBlock: HTMLElement[]) {
        let xpath = '';

        while (el !== null && !subBlock.contains(el) && el.nodeType === 1 && el.parentElement !== null) {
            if (el.tagName.substr(0, 1) !== "/") {
                let idx: string = ($(el.parentElement).children(el.tagName).index(el) + 1).toString();
                idx = '[' + idx + ']';
                xpath = '/' + el.tagName.toLowerCase() + idx + xpath;
            }

            el = el.parentElement;
        }

        return xpath;
    }

    getHash(dom: HTMLElement, fix: string) {
        var $dom = $(dom);
        if ($dom.attr("id"))
            return $dom.attr("id");

        if ($dom.parent().children().length === 1 && $dom.parent().attr("class")) {
            let tag = $dom.parent().get(0).tagName;
            let cls = $dom.parent().attr("class");
            let path = "$$" + tag + "$$" + cls + "$$" + fix + "$$";

            return path;
        }

        if ($dom.attr("class")) {
            let tag = dom.tagName;
            let cls = $dom.attr("class");
            let path = "$$" + tag + "$$" + cls + "$$" + fix + "$$";

            return path;
        }

        return $dom.text();
    }

    getMeta(dom: HTMLElement, rowIndex: number) {
        let $dom = $(dom).clone();
        $dom.find("script").remove();
        let doms: any[] = [];

        switch (dom.tagName) {
            case "A": {
                doms.push({
                    text: $dom.text().trim()
                });

                doms.push({
                    href: true,
                    text: this.fixUrl($dom.attr("href") as string).trim()
                });

                break;
            }
            case "IMG": {
                doms.push({
                    text: ($dom.attr("src") as string).trim()
                });

                break;
            }
            default: {
                doms.push({
                    text: $dom.text().trim() === "" ? $(dom).parent().text().trim() : $dom.text().trim()
                });

                break;
            }
        }

        doms.forEach(d => {
            d.row = rowIndex;
            d.dom = dom;
            d.text = d.text ? d.text.trim() : "";
        });

        return doms;
    }

    getClass(dom: JQuery<HTMLElement>, index: number, href?: boolean) {
        let _class = $(dom).attr("class") || "";
        let cls: string[] = [];
        if (_class.trim() === "" || _class === undefined)
            return cls;

        let sp = _class.split(/\s+/g);

        sp.forEach(c => {
            if (c === "")
                return;

            let rowCount = $(this.block.sub_blocks[index].doms).find("." + c).length;
            let count = $(this.block.doms).find("." + c).length;

            if (rowCount === 1 && count > 1)
                cls.push(c);
        });

        if (href && cls.length > 0)
            cls = cls.concat("ruiji-href");

        return cls;
    }

    group(row: any[][]): Map<any, any[]> {
        let g = row.group((g: any) => {
            if (g.class.length > 0)
                return g.class.join(' ');

            if (g.class.length === 0 && g.href) {
                return g.path + "/" + g.tag + "[href]";
            }

            //let pPath = g.path.substr(0, g.path.lastIndexOf('/'));

            return g.path;
        });

        return g;
    }

    reArrange(rows: any[][]): any[][] {
        let groups: Map<any, any[]>[] = [];
        let fields: Set<string> = new Set();

        rows.forEach(row => {
            row.forEach(d => {
                let dom = d.dom;
                let $dom = $(dom);

                d.dom = dom;
                d.tag = dom.tagName.toLowerCase();
                d.path = this.getPath(dom, this.block.sub_blocks[d.row].doms);
                d.type = "";
                d.class = this.getClass(dom, d.row, d.href);
            });
        });

        rows.forEach(m => {
            let g = this.group(m);
            g.forEach((v: any[], key: any) => {
                fields.add(key);
            });

            groups.push(g);
        });

        let table = new Table(fields, rows.length);
        groups.forEach(v => {
            table.insert(v);
        });

        return table.rows;
    }

    removeSame(rows: any[][]): any[][] {
        let fields: number = rows[0].length;

        let removes: number[] = [];

        for (let i: number = 0; i < fields; i++) {
            let v = "";

            let col = rows.map(m => {
                if (m[i].text !== "")
                    v = m[i].text;

                return m[i];
            });

            let c = col.filter(m => {
                return m.text === v || m.text.trim() === "";
            }).length;

            if (c === rows.length) {
                removes.push(i);
            }
        }

        rows.forEach(m => {
            removes.forEach(n => {
                delete m[n];
            });
        });

        return rows;
    }

    getResult(): any[][] {
        let _this = this;

        let rows = this.block.sub_blocks.map((block: Block, index: number) => {
            let html = "";
            let doms = _this.getDoms(block);

            let d: any[] = [];

            doms.map((dom: HTMLElement) => {
                let v = _this.getMeta(dom, index);
                d = d.concat(v);
            });

            return d;
        });

        if (this.opt.rerange) {
            rows = this.reArrange(rows);
        }

        if (this.opt.removesame) {
            rows = this.removeSame(rows);
        }

        return rows.map(m => {
            return m.map(n => n.text);
        });
    }
}