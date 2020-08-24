/// <reference path="../../../node_modules/zangodb/src/zangodb.d.ts" />
import zango from 'zangodb';

//https://github.com/erikolson186/zangodb

export namespace db {
    let db = new zango.Db('ruiji.db', 3, {
        article: { _hash: true, _ruleId: true },
        rule: { ruleId: true },
        classify: { classifyId: true },
        extracts: { ctime: true, ruleId: true },
        outputs: { ctime: true },
        options: ['name', 'value']
    });
    db.open();

    class Article {
        context : zango.Collection = db.collection("article");

        hash(obj: object) {
            var str = Object.keys(obj).contains("url") ? (obj as any)["url"] : JSON.stringify(obj);

            var hash = 0, i, chr, len;
            if (str.length === 0) return hash;
            for (i = 0, len = str.length; i < len; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0;
            }
            return hash;
        }

        update(metas: any, ruleId: number, name: string, url?: string): Promise<any> {
            metas._hash = this.hash(metas);
            metas._name = name;
            metas._ctime = new Date().getTime();
            metas._ruleId = ruleId;
            if (url)
                metas.url = url;

            return this.context.findOne({
                _hash: metas._hash
            }).then(v => {
                if (v) {
                    return this.context.update(metas, v).catch(error => console.error(error));
                } else {
                    metas._status = 0;
                    return this.context.insert(metas).catch(error => console.error(error));
                }
            });
        }

        getAll() {
            return this.context.find({
                _id: { $gt: 0 }
            }).toArray();
        }

        count() {
            return this.context.find({
                _id: { $gt: 0 }
            }).toArray().then(rows => {
                return rows.length;
            });
        }

        loadPage(page: number, rows: number = 10000, ruleId?: number) {
            return this.context.find({
                _ruleId: ruleId ? ruleId : { $gt: 0 }
            }).skip(0).limit(rows).toArray();
        }

        remove(hashs: number[]) {
            hashs.forEach(hash => {
                this.context.remove({
                    _hash: hash
                });
            });
        }

        clear() {
            this.context.remove(() => { return true });
            rule.clear();
        }
    }

    class Rule {
        context : zango.Collection = db.collection("rule");

        updateCount(ruleId: number, name: string, count: number) {
            let rule: any = {
                name: name,
                ruleId: ruleId,
                count: count
            };

            return this.context.findOne({
                ruleId: ruleId
            }).then(v => {
                if (v) {
                    return this.context.update(rule, v).catch(error => console.error(error));
                } else {
                    return this.context.insert(rule).catch(error => console.error(error));
                }
            });
        }

        getAll() {
            return article.context.find({
                _id: { $gt: 0 }
            }).group({
                _id: '$_ruleId',
                count: { $sum: 1 }
            }).toArray().then((g: any) => {
                let resolves: any[] = [];
                let rules: any[] = [];

                g.forEach((v: any) => {
                    resolves.push(article.context.findOne({ _ruleId: v._id }).then((r: any) => {
                        rules.push({ ruleId: v._id, name: r._name,count: v.count });
                    }));
                });

                return Promise.all(resolves).then(() => {
                    return rules;
                });
            });

            //return this.context.find({
            //    ruleId: { $gt: 0 }
            //}).toArray();
        }

        update() {
            return this.context.remove({ _id: { $gt: 0 }}).then(() => {
                return article.context.find({
                    _id: { $gt: 0 }
                }).group({
                    _id: '$_ruleId',
                    count: { $sum: 1 }
                }).toArray().then((g: any) => {
                    let resolves: any[] = [];

                    g.forEach((v: any) => {
                        resolves.push(article.context.findOne({ _ruleId: v._id }).then((r: any) => {
                            return rule.updateCount(v._id, r._name, v.count);
                        }));
                    });

                    return Promise.resolve(resolves);
                });
            });
        }

        clear() {
            this.context.remove(() => { return true });
        }
    }

    class Classify {
        context: zango.Collection = db.collection("classify");
    }

    class Extracts {
        context: zango.Collection = db.collection("extracts");

        insert(message: any): Promise<any> {
            message.ctime = new Date().getTime();

            return this.context.insert(message);
        }

        count() {
            return this.context.find({
                _id: { $gt: 0 }
            }).toArray().then(rows => {
                return rows.length;
            });
        }
    }

    class Outputs {
        context: zango.Collection = db.collection("outputs");

        insert(message: any): Promise<any> {
            message.ctime = new Date().getTime();

            return this.context.insert(message);
        }

        count() {
            return this.context.find({
                _id: { $gt: 0 }
            }).toArray().then(rows => {
                return rows.length;
            });
        }
    }

    class Options {
        context: zango.Collection = db.collection("options");

        get(name: string): Promise<any> {
            return this.context.findOne({ name: name }).then((v: any) => {
                return v.value;
            });
        }

        update(name: string, value: any): Promise<any> {
            return this.context.findOne({
                name: name
            }).then(v => {
                if (v) {
                    return this.context.update({ name: name },{ value: value }).catch(error => console.error(error));
                } else {
                    return this.context.insert({ name: name, value: value }).catch(error => console.error(error));
                }
            });
        }
    }

    export const article: Article = new Article();
    export const rule: Rule = new Rule();
    export const classify: Classify = new Classify();
    export const extracts: Extracts = new Extracts();
    export const outputs: Outputs = new Outputs();
    export const options: Options = new Options();
}