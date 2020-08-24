import $ from 'jquery';

export class DomLocator {
    $dom: JQuery<HTMLElement>;
    opt: any;
    class: string[] = [];
    tagName: string = "";
    id: string | undefined;
    xpath: any;

    constructor(dom: HTMLElement, opt: any) {
        this.$dom = $(dom);
        if (this.$dom.length === 0)
            return;

        this.opt = $.extend({
            unique: true,
            priority: ["id, class, tag, xpath"],
            content: ['body'],
            same: {
                parent: true,
                deep: true,
                tag: true
            }
        }, opt);

        let c = this.$dom.attr("class") || "";

        this.class = c.split(/[\s\n]+/).remove(['']);
        this.tagName = this.$dom.get(0).tagName;
        this.id = this.$dom.attr("id") || "";
        this.xpath = this.$dom.xpath();
    };

    locate() {
        if (this.$dom.length === 0)
            return;

        //need change
        var owner = Array.from($(this.opt.content[0], document));
        for (var i = 1; i < this.opt.content.length; i++) {
            let tmp: HTMLElement[] = [];
            owner.forEach(o => {
                tmp.push(...$(this.opt.content[i], o));
            });
            owner = tmp;
        }

        var result: any = {
            type: "",
            locator: "",
            tagName: this.tagName,
            class: this.class,
            id: this.id,
            xpath: this.xpath.path
        };

        this.opt.priority.every((p: string) => {
            switch (p) {
                case "class": {
                    var css = this.locateCss(owner);
                    if (css.length > 0) {
                        result.type = "css";
                        result.locator = css;

                        return false;
                    }
                    break;
                }
                case "id": {
                    var id = this.locateId(owner);
                    if (id !== "") {
                        result.type = "id";
                        result.locator = id;

                        return false;
                    }

                    break;;
                }
                case "tag": {
                    result.type = "tag";
                    result.locator = this.tagName;

                    return true;
                }
                default: {
                    result.type = "xpath";
                    result.locator = this.$dom.xpath().path;

                    return false;
                }
            }

            return true;
        });

        return result;
    };

    locateCss(owner: HTMLElement[]) {
        var css = this.class;

        if (this.class.length > 0) {
            owner.forEach(o => {
                this.class.forEach(c => {
                    if (this.opt.unique) {
                        let doms = $(this.tagName + "." + c, o);
                        if (doms.length === 1) {
                            css = [];
                            css.push(c);
                        }
                    }
                    else {
                        let map = new Map();
                        let doms = Array.from($(this.tagName + "." + c, o));

                        if (this.opt.same.deep) {
                            doms.forEach(d => {
                                map.set(d, $(d).xpath());
                            });

                            if (map.size !== Array.from(map.values()).filter(m => { return m.deep === this.xpath.deep; }).length) {
                                css.remove(c);
                            }
                        }

                        if (this.opt.same.parent) {
                            let p = doms[0].parentNode;
                            doms.every(d => {
                                if (p !== d.parentNode) {
                                    css.remove(c);
                                    return false;
                                }
                                return true;
                            });
                        }
                    }
                });
            });
        }

        return css;
    };

    locateId(owner: HTMLElement[]) {
        //var el = this.$dom.get(0);

        //for (; el && el.nodeType == 1; el = el.parentNode) {
        //    var idx = $(el.parentNode).children(el.tagName).index(el) + 1;
        //    if (el.tagName.substring(0, 1) != "/") { //IE oddity: some tagNames can begin with backslash.
        //        if (el.id != 'undefined' && el.id != '' && eloc.isUniqueId(el.id, uniqIds)) {
        //            uniqIds.push(el.id);
        //            var idPath = "[@id=" + "'" + el.id + "'" + "]";
        //            locator.xpath = '/' + el.tagName.toLowerCase() + idPath + locator.xpath;
        //            locator.css = el.tagName.toLowerCase() + '#' + el.id + ' > ' + locator.css;
        //        }
        //        else {
        //            idx = '[' + idx + ']';
        //            locator.xpath = '/' + el.tagName.toLowerCase() + idx + locator.xpath;
        //            locator.css = el.tagName.toLowerCase() + eloc.getClass(el) + ' > ' + locator.css;
        //        }
        //    }
        //}

        return this.$dom.attr("id") ? this.$dom.attr("id") : "";
    };
};