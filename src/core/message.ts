import { User } from "@/ajax/user";
import { Rule } from "@/ajax/rule";
import { Chain } from "@/ajax/chain";
import { Pay } from "@/ajax/pay";
import { Course } from "@/ajax/course";
import { Extractor } from "@/core/ruiji/extractor";
import { db } from "@/core/ruiji/db";
import { autoPaging } from "@/core/ruiji/paging";
import { chain } from "@/core/ruiji/chain";
import { _browser } from "@/core/utils";
import { resolve } from "url";

class MessageHandler {
    user: User = new User();
    rule: Rule = new Rule();
    chain: Chain = new Chain();
    pay: Pay = new Pay();
    course: Course = new Course();

    constructor() {

    }

    getRule(userRule: boolean, ruleId: number) {
        if (userRule) {
            return this.user.getRuleExt(ruleId);
        } else {
            return this.rule.getRuleExt(ruleId);
        }
    }

    setBadge(code: number) {
        if (code === 200) {
            let inject = localStorage.getItem('inject');
            let on = true;

            if (inject === null) {
                localStorage.setItem('inject', "true");
            } else {
                on = localStorage.getItem('inject') === "true";
            }

            if (on)
                _browser.setBadge('on', 'green');
            else
                _browser.setBadge('off', 'red');
        } else {
            _browser.setBadge('', 'red');
        }
    }

    handle(message: any) {
        let cmd = message.cmd;

        switch (cmd) {
            ///user
            case "user.check": {
                return this.user.check().done((res: any) => {
                    this.setBadge(res.code);
                });
            }
            case "user.login": {
                return this.user.login(message.data).done((res: any) => {
                    this.setBadge(res.code);
                });
            }
            case "user.logout": {
                return this.user.logout().done((res: any) => {
                    if (res.code === 200) {
                        _browser.setBadge('', 'red');
                    }
                });
            }
            case "user.info": {
                return this.user.info();
            }
            case "user.register": {
                return this.user.register(message.data, message.captcha, message.referee);
            }
            case "user.forget": {
                return this.user.forget(message.data, message.captcha);
            }
            /// user data
            case "user.stat": {
                return this.user.stat();
            }
            case "user.star": {
                return this.user.getStar(message.page);
            }
            case "user.rule": {
                let filter: any = {
                    current: true,
                    hub: -1
                };

                if (message.firstLoad) {
                    let json = localStorage.getItem("user-rule-filter");
                    if (json !== null) {
                        filter = JSON.parse(json);
                    }
                }
                else {
                    filter = {
                        current: message.filter.current,
                        hub: message.filter.hub
                    };

                    localStorage.setItem("user-rule-filter", JSON.stringify(filter));
                }

                if (filter.current)
                    filter.url = message.url;

                return this.user.getRule(message.page, filter).done(res => {
                    res.data.filter = filter;

                    return res;
                });
            }
            /// user rule
            case "user.rule.save": {
                return this.user.updateRule(message.rule);
            }
            case "user.rule.share": {
                return this.user.shareRule(message.ruleId);
            }
            case "user.rule.remove": {
                return this.user.removeRule(message.ruleId);
            }
            case "user.rule.get": {
                return this.user.getRuleExt(message.ruleId);
            }
            /// user request
            case "user.request": {
                return this.user.request(message.page);
            }
            case "user.message.update": {
                return this.user.updateRequest(message.data);
            }
            case "user.message.cancel": {
                return this.user.cancelRequest(message.requestId);
            }
            case "user.order.get": {
                return this.user.getOrder(message.page);
            }
            /// product
            case "product.all": {
                let lang = _browser.getUILanguage();
                return this.user.products(lang);
            }
            /// pub rule
            case "rule.report": {
                return this.rule.report(message.ruleId);
            }
            case "rule.praise": {
                return this.rule.praise(message.ruleId);
            }
            case "rule.star": {
                return this.rule.star(message.ruleId);
            }
            case "rule.match": {
                return this.rule.match(message.url);
            }
            case "rule.get": {
                return this.rule.getRuleExt(message.ruleId);
            }
            case "sendMail": {
                return this.user.sendMail(message.email, message.lang);
            }
            /// chain 
            case "chain.list": {
                return this.chain.list(message.page);
            }
            case "chain.get": {
                return this.chain.get(message.chainId);
            }
            case "chain.save": {
                return this.chain.update(message.chain);
            }
            case "chain.remove": {
                return this.chain.delete(message.chainId);
            }
            /// utils
            case "utils.rule.get": {
                return this.getRule(message.userRule, message.ruleId);
            }
            case "extract": {
                var p = $.Deferred();
                this.getRule(message.userRule, message.ruleId).done((res: any) => {
                    var extractor: Extractor = new Extractor(message.url);
                    extractor.setFuncs(res.data.rule.extended);

                    let result = extractor.extract(message.content, res.data.rule.expression, res.data.rule.paging);
                    if (message.update) {
                        if (message.hub) {
                            if (result.tiles) {
                                let resolves: any[] = [];
                                result.tiles.forEach((r: any, i: number) => {
                                    resolves.push(db.article.update(r.metas, message.ruleId, message.name));
                                });

                                Promise.all(resolves);

                                resolves = [];
                                resolves.push(db.extracts.insert({
                                    ruleId: message.ruleId,
                                    hub: message.hub,
                                    update: message.update,
                                }));

                                Promise.all(resolves).then(() => {
                                    p.resolve(true);
                                });
                            }
                        }
                        else {
                            db.article.update(result.metas, message.ruleId, message.name).then(() => {
                                db.extracts.insert({
                                    ruleId: message.ruleId,
                                    hub: message.hub,
                                    update: message.update,
                                }).then(() => {
                                    p.resolve(true);
                                });
                            });
                        }
                    } else {
                        p.resolve(true);
                    }
                });

                return p.promise();
            }
            case "extract.update": {
                let result = message.result;
                if (message.update) {
                    if (message.hub) {
                        if (result.tiles) {
                            let resolves: any[] = [];
                            result.tiles.forEach((r: any, i: number) => {
                                resolves.push(db.article.update(r.metas, message.ruleId, message.name));
                            });

                            Promise.all(resolves);

                            resolves = [];
                            resolves.push(db.extracts.insert({
                                ruleId: message.ruleId,
                                hub: message.hub,
                                update: message.update,
                            }));

                            Promise.all(resolves);
                        }
                    }
                    else {
                        db.article.update(result.metas, message.ruleId, message.name, message.url).then(() => {
                            db.extracts.insert({
                                ruleId: message.ruleId,
                                hub: message.hub,
                                update: message.update,
                            });
                        });
                    }
                }

                break;
            }
            case "extract.paging": {
                var p = $.Deferred();
                this.getRule(message.paging.rule.userRule, message.paging.rule.ruleId).done((res: any) => {
                    autoPaging.start(message.paging.url, res.data.rule, res.data.rule.extended, message.paging.interval, message.paging.pages);

                    p.resolve(true);
                })

                return p.promise().then(() => {
                    return db.extracts.insert(message.paging.rule);
                });
            }
            case "extract.chain.start": {
                let p = $.Deferred();
                p.resolve(chain.start(message.chain));
                return p.promise();
            }
            case "extract.chain.excute": {
                var p = $.Deferred();
                p.resolve(chain.excute(message.url, message.content));
                return p.promise();
            }
            case "extract.chain.stop": {
                let p = $.Deferred();
                p.resolve(chain.stop());
                return p.promise();
            }
            case "extract.paging.rule.get": {
                var p = $.Deferred();
                p.resolve({
                    rule: autoPaging.rule,
                    funcs: autoPaging.funcs
                });

                return p.promise();
            }
            case "extract.paging.excute": {
                var p = $.Deferred();
                p.resolve(autoPaging.excute(message.url, message.content));

                return p.promise();
            }
            case "extract.paging.stop": {
                let p = $.Deferred();
                p.resolve(autoPaging.stop());

                return p.promise();
            }
            case "window.open": {
                window.open(message.url, message.target, message.features);
                break;
            }
            case "inject.get": {
                var p = $.Deferred();
                p.resolve(localStorage.getItem('inject') === "true");
                return p.promise();
            }
            case "paypal.token.get": {
                return this.pay.getPaypalToken();
            }
            case "paypal.purchase": {
                return this.pay.paypalPurchase(message.payload);
            }
            case "news": {
                return this.user.news(message.local);
            }
            case "news.content": {
                return this.user.newsContent(message.id);
            }
            case "course.get": {
                return this.course.get(_browser.getUILanguage());
            }
            case "db.article.load": {
                let p = $.Deferred();
                db.article.loadPage(message.page, message.limit, message.ruleId).then(rows => {
                    p.resolve(rows);
                });

                return p.promise();
            }
            case "db.rule.load": {
                let p = $.Deferred();
                db.rule.getAll().then(rules => {
                    p.resolve(rules);
                });

                return p.promise();
            }
            case "options.get": {
                let p = $.Deferred();
                db.options.get(message.name).then(v => {
                    p.resolve(v);
                });

                return p.promise();
            }
            case "options.update": {
                let p = $.Deferred();
                db.options.update(message.name, message.value).then(() => {
                    p.resolve(true);
                });

                return p.promise();
            }
        }

        return $.Deferred().resolve(true).promise();
    }
}

export const messageHandler: MessageHandler = new MessageHandler();