import { ExtractResult, Extractor } from "@/core/ruiji/extractor";
import { _browser } from '@/core/utils';
import { User } from "@/ajax/user";
import { InlineDiff } from '@/core/diff/inline';
import { ResultManger, HubResultManger, ArticleResultManager } from '@/core/ruiji/resultManger';
import { db } from "@/core/ruiji/db";
import { Wildcard } from "./wildcard";

export class ChainSetting {
    name: string = "";
    url: string = "";
    hub: boolean = true;
    save: boolean = false;
    interval: number = 10;
    stop: boolean = true;
    autoPaging: boolean = true;
    maxPages: number = 10;
    ruleId: number = 0;
    rule: any = null;
}

class ChainNode {
    children: ChainNode[] = [];
    parent: ChainNode | null = null;
    index: number = 0;
    setting: ChainSetting = new ChainSetting();
    urls: string[] = [];
    queue: string[] = [];
    pageUrls: string[] = [];
    results: Map<string, ExtractResult> = new Map();
    complete: boolean = false;

    static history: string[] = [];

    addNode(node: ChainNode) {
        node.parent = this;
        node.index = this.count();

        this.children.push(node);
    }

    prev(): ChainNode | null {
        if (!this.parent)
            return null;

        var index = this.parent.children.indexOf(this);
        if (index == 0) {
            return null;
        }

        return this.parent.children[index - 1];
    }

    next(): ChainNode | null {
        if (!this.parent)
            return null;

        var index = this.parent.children.indexOf(this);
        if (index >= this.parent.count() - 1) {
            return null;
        }

        return this.parent.children[index + 1];
    }

    count(): number {
        return this.children.length;
    }

    addPageUrl(urls: string[]) {
        var d = new InlineDiff();
        var model = d.buildDiffModel(this.pageUrls.join("\n"), urls.join("\n"));

        this.pageUrls = Array.from(new Set(model.lines.map(l => { return l.text; })));
    }

    pageLeft(): number {
        return this.pageUrls.length - this.results.size;
    }

    getResultCount(): number {
        return this.results.size;
    }

    save() {
        if (this.setting.hub) {
            let resolves: any[] = [];

            this.results.forEach(result => {
                if (result.tiles) {
                    var c = 0;
                    result.tiles.forEach((r: ExtractResult) => {
                        if (this.setting.save)
                            resolves.push(db.article.update(r.metas, this.setting.rule.ruleId, this.setting.rule.name));

                        if (!this.setting.stop) {
                            var url = "";
                            if (r.metas.link) {
                                url = r.metas.link;
                            } else if (r.metas.href) {
                                url = r.metas.href;
                            }
                            else if (r.metas.url) {
                                url = r.metas.url;
                            }

                            if (!ChainNode.history.contains(url) && !this.urls.contains(url)) {
                                //console.log(url);

                                //if (++c > 2)
                                //    return;

                                this.urls.push(url);
                                ChainNode.history.push(url);
                            }
                        }
                    });
                }
            });

            Promise.all(resolves).then(() => {
                this.results.clear();
            });
        } else {
            let field = this.setting.rule.cf || "content";
            let content = "";
            let result: ExtractResult = Array.from(this.results.values()).first();

            this.results.forEach(r => {
                content += r.metas[field];
            });

            result.metas[field] = content;
            var key = this.results.keys().next().value;

            db.article.update(result.metas, this.setting.rule.ruleId, this.setting.rule.name, key).then(() => {
                this.results.clear();
            });
        }
    }

    getNextPage(): string | undefined {
        let find = this.pageUrls.find(u => {
            if (!this.results.has(u))
                return u;
        });

        return find;
    }

    getNextUrl() {
        if (!this.parent)
            return null;

        if (this.complete || this.parent.urls.length == 0)
            return null;

        if (!this.complete && this.queue.length == 0) {
            this.queue = this.parent.urls.slice(0);
        }

        let u = this.queue.shift();

        while (u) {
            if (Wildcard.Match(this.setting.rule.wildcard, u)) {
                if (this.queue.length == 0)
                    this.complete = true;

                return u;
            }

            u = this.queue.shift();
        }

        this.complete = true;
        return null;
    }
}

class Chain {
    user: User = new User();
    currentNode!: ChainNode;
    rootNode!: ChainNode;
    //预留 方便同样页面匹配多种规则
    contentMap: Map<string, string> = new Map();

    constructor() { }

    start(data: any) {
        this.rootNode = new ChainNode();
        this.rootNode.setting = data.data;
        this.contentMap.clear();
        ChainNode.history = [];

        this.buildTree(this.rootNode, data);
        this.currentNode = this.rootNode.children.first();
    }

    buildTree(root: ChainNode, d: any) {
        d.child.forEach((m: any, index: number) => {
            var node = new ChainNode();
            node.setting = m.data;

            this.user.getRuleExt(node.setting.ruleId, false).done(response => {
                node.setting.rule = response.data.rule;
                root.addNode(node);
                this.buildTree(node, m);
            });
        });
    }

    excute(url: string, content: string): any {
        let rule = this.currentNode.setting.rule;
        let extractor = new Extractor(url);
        extractor.setFuncs(rule.extended);

        let result = extractor.extract(content, rule.expression);
        this.contentMap.set(url, content);
        this.currentNode.results.set(url, result);

        console.log(this.currentNode);

        let d = this.currentNode.setting;
        if (d.autoPaging && d.rule.paging) {
            let pages = result.paging || [];
            this.currentNode.addPageUrl(pages);

            //分页
            if ((d.maxPages == 0 && this.currentNode.pageLeft() == 0) || (d.maxPages > 0 && this.currentNode.getResultCount() >= d.maxPages)) {
                //文章页需要合并结果
                this.currentNode.save();
                return this.getNextUrl();
            }

            var find = this.currentNode.getNextPage();

            if (!find) {
                return null;
            }

            return {
                url: find,
                interval: d.interval
            };
        } else {
            this.currentNode.save();
            return this.getNextUrl();
        }

        return null;
    }

    getNextUrl() {
        let u = this.currentNode.getNextUrl();
        if (u)
            return {
                url: u,
                interval: this.currentNode.setting.autoPaging ? this.currentNode.setting.interval : this.rootNode.setting.interval
            };

        return this.getNextNode();
    }

    getNextNode(): any {
        var _this = this;
        let next = this.currentNode.next();
        let find: any = null;

        if (next) {
            this.currentNode = next;
        } else {
            this.currentNode.parent?.children.forEach(m => {
                m.children.forEach(n => {
                    if (!find && !n.complete) {
                        this.currentNode = n;

                        let u = n.getNextUrl()

                        if (u) {
                            find = {
                                url: u,
                                interval: _this.rootNode.setting.interval
                            };
                        }
                    }
                });
            });
        }

        return find;
    }

    stop() {
        this.contentMap.clear();
        ChainNode.history = [];
    }
}

export const chain = new Chain();