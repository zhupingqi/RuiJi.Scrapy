import $ from 'jquery';
import { Extractor, ExtractResult } from "@/core/ruiji/extractor";
import { db } from "@/core/ruiji/db";
import { InlineDiff } from '@/core/diff/inline';
import { _browser } from '@/core/utils';
import { ResultManger, HubResultManger, ArticleResultManager } from '@/core/ruiji/resultManger';
import URI from "urijs";

class AutoPaging {
    timer: number = 0;
    rule!: any;
    currentPage: number = 0;
    totalPage: number = 0;
    url: string = "";
    resultManager!: ResultManger;
    interval: number = 10;
    deep: boolean = false;
    tab!: chrome.tabs.Tab;
    tabId: number | undefined = -1;
    win: Window | null = null;
    funcs: any[] = [];

    constructor() {

    }

    start(url: string, rule: any, funcs: any[], interval: number, pages: number, deep: boolean = false) {
        clearInterval(this.timer);
        if (rule.hub) {
            this.resultManager = new HubResultManger();
        } else {
            this.resultManager = new ArticleResultManager();
        }
        this.timer = 0;

        this.rule = rule;
        this.currentPage = pages;
        this.totalPage = pages;
        this.resultManager.clear();
        this.url = url;
        this.interval = interval;
        this.deep = deep;
        this.funcs = funcs;
    }

    excute(url: string, content: string): any {
        this.currentPage--;

        let extractor = new Extractor(this.url);
        extractor.setFuncs(this.funcs);

        let result = extractor.extract(content, this.rule.expression);
        let pages = result.paging || [];
        this.resultManager.set(url, result, false, null);

        this.resultManager.addUrl(pages);

        if (this.currentPage <= 0 || this.resultManager.left() === 0) {
            this.stop();
            return null;
        } else {
            var find = this.resultManager.getOne();
            
            if (!find) {
                this.stop();
                return null;
            }

            return {
                url: find,
                interval: this.interval,
                current: this.currentPage,
                deep: this.deep,
                total: this.totalPage
            };
        }
    }

    stop() {
        clearInterval(this.timer);

        this.resultManager.save(this.rule);
        this.resultManager.clear();
        this.currentPage = 0;
        this.timer = 0;        
    }
}

export const autoPaging = new AutoPaging();