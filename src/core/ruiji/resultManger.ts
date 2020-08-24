import { InlineDiff } from '@/core/diff/inline';
import { Extractor, ExtractResult } from "@/core/ruiji/extractor";
import { db } from "@/core/ruiji/db";

export interface ResultManger {
    set(url: string, result: ExtractResult, save: boolean, rule: any): void;
    addUrl(urls: string[]): void;
    left(): number;
    clear(): void;
    save(rule: any): void;
    getOne(): string | undefined;
    getResultCount(): number;
    count: number;
}

export class HubResultManger implements ResultManger{
    urls: string[] = [];
    count: number = 0;
    results: Map<string, ExtractResult> = new Map();

    constructor() {

    }

    set(url: string, result: ExtractResult, save: boolean = false, rule: any = null) {
        this.results.set(url, result);
        this.count++;

        if (save && rule && result) {
            let resolves: any[] = [];
            if (result.tiles) {
                result.tiles.forEach((r: any) => {
                    resolves.push(db.article.update(r.metas, rule.ruleId, rule.name));
                });
            }
            Promise.all(resolves);
        }
    }

    addUrl(urls: string[]) {
        var d = new InlineDiff();
        var model = d.buildDiffModel(this.urls.join("\n"), urls.join("\n"));

        this.urls = Array.from(new Set(model.lines.map(l => { return l.text; })));
    }

    left(): number {
        return this.urls.length - this.results.size;
    }

    getResultCount(): number {
        return this.count;
    }

    clear() {
        this.results.clear();
        this.urls = [];
    }

    save(rule: any) {
        let resolves: any[] = [];

        this.results.forEach(result => {
            if (result.tiles) {
                result.tiles.forEach((r: any) => {
                    resolves.push(db.article.update(r.metas, rule.ruleId, rule.name));
                });
            }
        });

        Promise.all(resolves);
    }

    getOne(): string | undefined {
        let find = this.urls.find(u => {
            if (!this.results.has(u))
                return u;
        });

        return find;
    }
}

export class ArticleResultManager extends HubResultManger{
    save(rule: any) {
        let field = rule.cf || "content";
        let content = "";
        let result: ExtractResult = Array.from(this.results.values()).first();

        this.results.forEach(r => {
            content += r.metas[field];
        });

        result.metas[field] = content;

        db.article.update(result.metas, rule.ruleId, rule.name);
    }
}