import $ from 'jquery';
import { Wildcard } from "@/core/ruiji/wildcard";
import { Selector } from '@/core/ruiji/selector';
import '@/shared/array';

export class ProcessResult {
    constructor(public matches: string[]) {
    };

    getContent(): string {
        return this.matches.join("\r\n");
    };
};

export class Processor {
    constructor(public funcs: any[] = []) {

    };

    process(content: string, selectors: Selector.ISelector[]) {
        var _this = this;
        var result = new ProcessResult([content]);
        selectors = selectors.slice(0);

        selectors.forEach(selector => {
            switch (selector.type) {
                case Selector.SelectorTypeEnum.CSS: {
                    let processor = new CssProcessor();
                    result = processor.process(selector as Selector.CssSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.REGEX: {
                    let processor = new RegexProcessor();
                    result = processor.process(selector as Selector.RegexSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.REGEXSPLIT: {
                    let processor = new RegexSplitSelectorProcessor();
                    result = processor.process(selector as Selector.RegexSplitSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.TEXTRANGE: {
                    let processor = new TextRangeProcessor();
                    result = processor.process(selector as Selector.TextRangeSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.EXCLUDE: {
                    let processor = new ExcludeProcessor();
                    result = processor.process(selector as Selector.ExcludeSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.REGEXREPLACE: {
                    let processor = new RegexReplaceProcessor();
                    result = processor.process(selector as Selector.RegexReplaceSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.JPATH: {
                    let processor = new JsonPathProcessor();
                    result = processor.process(selector as Selector.JsonPathSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.XPATH: {
                    let processor = new XPathProcessor();
                    result = processor.process(selector as Selector.XPathSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.CLEAR: {
                    let processor = new ClearTagProcessor();
                    result = processor.process(selector as Selector.ClearTagSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.EXPRESSION: {
                    let processor = new ExpressionProcessor();
                    result = processor.process(selector as Selector.ExpressionSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.FUNCTION: {
                    let processor = new FunctionProcessor(_this.funcs);
                    result = processor.process(selector as Selector.FunctionSelector, result);
                    break;
                }
                case Selector.SelectorTypeEnum.WILDCARD: {
                    let processor = new WildcardProcessor();
                    result = processor.process(selector as Selector.WildcardSelector, result); 
                    break;
                }
            }
        });

        return result;
    };

    parserSelector(expression: string) {
        expression = expression.trim();
        var sp = expression.split(/\s+/);
        sp = sp.remove(['']);
        if (sp.length === 0)
            return null;

        var cmd = sp[0];
        var remove = expression.match(/-r$/) !== null;
        var p = expression.replace(new RegExp("^" + cmd, 'g'), "");
        p = p.replace(/-r$/, "").trim();
        var selector: any = {
            remove: remove
        };

        switch (cmd) {
            case "clear":
                {
                    selector.tags = p.split(' ').remove(['']);

                    if (selector.tags.length == 0)
                        return null;

                    return selector;
                }
            case "css":
                {
                    if (p.endsWith(":ohtml")) {
                        selector.ctype = 1;
                        selector.selector = p.replace(/:ohtml$/, "").trim();
                    }
                    else if (p.endsWith(":html")) {
                        selector.ctype = 0;
                        selector.selector = p.replace(/:html$/, "").trim();
                    }
                    else if (p.endsWith(":text")) {
                        selector.ctype = 2;
                        selector.selector = p.replace(/:text$/, "").trim();
                    }
                    else {
                        selector.ctype = 3;
                        var ms = p.match(/(.*)\[(.*?)\]/);
                        if (ms !== null && ms.length == 3) {
                            selector.selector = ms[1].trim();
                            selector.attrName = ms[2].trim();
                        }
                        else {
                            selector.ctype = 1;
                            selector.selector = p.replace(/:ohtml$/, "").trim();
                        }
                    }

                    return selector;
                }
            case "ex":
                {
                    selector.pattern = p.replace(/\s-[bea]$/, "").trim();
                    if (selector.pattern.startWith("/"))
                        selector.pattern = selector.pattern.substr(1, selector.pattern.length - 2);

                    if (p.endsWith("-b")) {
                        selector.etype = 1;
                    }
                    else if (p.endsWith("-e")) {
                        selector.etype = 2;
                    }
                    else {
                        selector.etype = 0;
                    }

                    return selector;
                }
            case "exp":
                {
                    selector.expression = p;
                    var ssp = p.split(' ').remove(['']);
                    if (ssp.length == 2) {
                        selector.expression = ssp[0];
                        selector.split = ssp[1];
                    }

                    return selector;
                }
            case "reg":
                {
                    var ms = p.match(/^\/(.*)\/([\d\s]*)?/);
                    if (ms !== null && ms.length === 3) {
                        selector.pattern = ms[1];
                        if (ms[2] !== "")
                            selector.index = ms[2].split(' ').remove(['']);
                        else
                            selector.index = [];

                        return selector;
                    }
                    return null;
                }
            case "regR":
                {
                    var ms = p.match(/^\/(.*?)\/(.*)?/);
                    if (ms !== null && ms.length == 3) {
                        selector.pattern = ms[1];
                        if (ms[2] !== "")
                            selector.newString = ms[2].substr(1);
                        else
                            selector.newString = "";

                        return selector;
                    }
                    return null;
                }
            case "regS":
                {
                    var ms = p.match(/^\/(.*?)\/([\d\s]*)?/);
                    if (ms !== null && ms.length == 3) {
                        selector.pattern = ms[1];
                        if (ms[2] !== "")
                            selector.index = ms[2].split(' ').remove(['']);
                        else
                            selector.index = [];

                        return selector;
                    }

                    return null;
                }
            case "text":
                {
                    var ms = p.match(/\/(.*?[^\\\/])\//g);

                    if (ms !== null && ms.length == 2) {
                        selector.begin = ms[0].match(/^\/(.*)\/$/)![1];
                        selector.end = ms[1].match(/^\/(.*)\/$/)![1];

                        return selector;
                    }

                    return null;
                }
            case "xpath":
                {
                    selector.xpath = p;

                    return selector;
                }
            case "jpath":
                {
                    selector.jpath = p;

                    return selector;
                }
            case "proc":
                {
                    selector.name = p;

                    return selector;
                }
        }

        return null;
    };
};

interface IProcessor {
    process(selector: Selector.ISelector, result: ProcessResult): ProcessResult;
}

abstract class ProcessorBase<T extends Selector.ISelector> implements IProcessor {
    abstract process(selector: T, result: ProcessResult): ProcessResult;
}

class CssProcessor extends ProcessorBase<Selector.CssSelector>{
    process(selector: Selector.CssSelector, result: ProcessResult): ProcessResult {
        try {
            var content = result.getContent();
            var $c = $("<ruiji-doc>" + content + "</ruiji-doc>");
            var $elem;

            if (selector.selector === "") {
                return result;
            }

            try {
                if (selector.remove) {
                    $c.find(selector.selector).remove();
                    $elem = $c;
                } else {
                    $elem = $c.find(selector.selector);
                }
            } catch (e) {
                return result;
            }

            return this.processResult($elem, selector);
        } catch (e) {
            return result;
        }
    }

    processResult($elems: JQuery<HTMLElement>, selector: Selector.CssSelector): ProcessResult {
        let pr = new ProcessResult([]);
        var elems = Array.from($elems);

        switch (selector.ctype) {
            case Selector.CssTypeEnum.INNERHTML:
                {
                    elems.forEach((ele) => {
                        pr.matches.push($(ele).html());
                    });
                    break;
                }
            case Selector.CssTypeEnum.TEXT:
                {
                    elems.forEach((ele) => {
                        pr.matches.push($(ele).text());
                    });
                    break;
                }
            case Selector.CssTypeEnum.ATTR:
                {
                    elems.forEach((ele) => {
                        if (selector.attr) {
                            let attr = $(ele).attr(selector.attr as string);
                            if (attr)
                                pr.matches.push(attr);
                        }
                    });
                    break;
                }
            case Selector.CssTypeEnum.OUTERHTML:
                {
                    elems.forEach((ele) => {
                        pr.matches.push($(ele).prop("outerHTML").replace("<ruiji-doc>", "").replace("</ruiji-doc>", ""));
                    });
                    break;
                }
        }

        return pr;
    }
}

class ExcludeProcessor extends ProcessorBase<Selector.ExcludeSelector>{
    process(selector: Selector.ExcludeSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var pr = new ProcessResult([]);

        switch (selector.etype) {
            case Selector.ExcludeTypeEnum.ALL: {
                pr.matches.push(content.replace(new RegExp(selector.pattern, "g"), ""));
                break;
            }
            case Selector.ExcludeTypeEnum.BEGIN: {
                pr.matches.push(content.replace(new RegExp("^" + selector.pattern), ""));
                break;
            }
            case Selector.ExcludeTypeEnum.END: {
                pr.matches.push(content.replace(new RegExp(selector.pattern + "$"), ""));
                break;
            }
        }

        return pr;
    }
}

class ExpressionProcessor extends ProcessorBase<Selector.ExpressionSelector>{
    process(selector: Selector.ExpressionSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var pr = new ProcessResult([]);

        result.matches.forEach((r) => {
            var ary = [r];
            if (selector.split) {
                ary = r.split(new RegExp(selector.split, "g")).remove(['']);
            }

            ary.forEach((u) => {
                if (u === undefined)
                    return;

                var m = Wildcard.Match(selector.expression, u);
                if (selector.remove && !m)
                    pr.matches.push(u);
                if (!selector.remove && m)
                    pr.matches.push(u);
            });
        });

        return pr;
    }
}

class FunctionProcessor extends ProcessorBase<Selector.FunctionSelector>{
    constructor(public funcs: any[] = []) {
        super();
    }

    process(selector: Selector.FunctionSelector, result: ProcessResult): ProcessResult {
        var fun = this.funcs.filter((f) => {
            return f.name === selector.name;
        }).first();

        if (fun !== null) {
            try {
                var content = result.getContent();
                let func = new Function("content", "let c = content; let f = " + fun.code + ";return f(c);");
                let ruiji_proc_result = func(content);

                var pr = new ProcessResult([]);
                if (ruiji_proc_result) {
                    pr.matches.push(ruiji_proc_result);
                    return pr;
                }
            } catch (e) {

            }
        }

        return result;
    }
}

class JsonPathProcessor extends ProcessorBase<Selector.JsonPathSelector>{
    process(selector: Selector.JsonPathSelector, result: ProcessResult): ProcessResult {
        return result;
    }
}

class RegexProcessor extends ProcessorBase<Selector.RegexSelector>{
    process(selector: Selector.RegexSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var pr = new ProcessResult([]);

        if (selector.remove) {
            pr.matches.push(content.replace(new RegExp(selector.pattern, "g"), ""));
        } else {
            var ms = content.match(selector.pattern);
            if (ms === null)
                return result;

            if (selector.index.length > 0) {
                let results: string[] = [];
                selector.index.forEach((i: number) => {
                    if (i < ms!.length) {
                        results.push(ms![i]);
                    }
                });
                pr.matches.push(results.join(" "));
            } else {
                Array.from(ms).forEach((m) => {
                    pr.matches.push(m);
                });
            }
        }

        return pr;
    }
}

class ClearTagProcessor extends ProcessorBase<Selector.ClearTagSelector>{
    process(selector: Selector.ClearTagSelector, result: ProcessResult): ProcessResult {
        if (!selector.tags || selector.tags.length === 0)
            return result;

        var content = result.getContent();
        var pr = new ProcessResult([]);
        var $c = $(content);

        selector.tags.forEach((tag: string) => {
            $c.find(tag).remove();
        });

        pr.matches.push($c.prop("outerHTML"));
        return pr;
    }
}

class XPathProcessor extends ProcessorBase<Selector.XPathSelector>{
    process(selector: Selector.XPathSelector, result: ProcessResult): ProcessResult {
        var content = "<xpath>" + result.getContent() + "</xpath>";
        var $c = $(content);
        var $elems = $c.find("*");

        if ($elems.length === 0)
            return result;

        try {
            Array.from($elems).every(e => {
                let $e = $(e);
                if ($e.xpath().path === "/xpath[1]" + selector.xpath) {
                    if (selector.remove) {
                        $e.remove();
                    } else {
                        $elems = $e;
                    }

                    return false;
                }

                return true;
            });
        } catch (e) {
            return result;
        }

        return this.processResult($elems, selector);
    }

    processResult($elems: JQuery<HTMLElement>, selector: Selector.XPathSelector) {
        let pr = new ProcessResult([]);
        let elems: HTMLElement[] = Array.from($elems);

        switch (selector.xtype) {
            case Selector.XPathTypeEnum.INNERXML:
                {
                    elems.forEach((ele) => {
                        pr.matches.push($(ele).html());
                    });
                    break;
                }
            case Selector.XPathTypeEnum.TEXT:
                {
                    elems.forEach((ele) => {
                        pr.matches.push($(ele).text());
                    });
                    break;
                }
            case Selector.XPathTypeEnum.ATTR:
                {
                    elems.forEach((ele) => {
                        if (selector.attr) {
                            let attr = $(ele).attr(selector.attr as string);
                            if (attr)
                                pr.matches.push(attr);
                        }
                    });
                    break;
                }
            case Selector.XPathTypeEnum.OUTERXML:
                {
                    elems.forEach((ele) => {
                        pr.matches.push($(ele).prop("outerHTML"));
                    });
                    break;
                }
        }

        return pr;
    }
}

class RegexReplaceProcessor extends ProcessorBase<Selector.RegexReplaceSelector>{
    process(selector: Selector.RegexReplaceSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var pr = new ProcessResult([]);

        pr.matches.push(content.replace(new RegExp(selector.pattern, "g"), selector.newString));

        return pr;
    }
}

class RegexSplitSelectorProcessor extends ProcessorBase<Selector.RegexSplitSelector>{
    process(selector: Selector.RegexSplitSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var sp: string[] = content.split(new RegExp(selector.pattern, "g")).remove(['']);
        var pr = new ProcessResult([]);

        if (selector.remove) {
            selector.index.sort((a: number, b: number) => {
                return b - a;
            }).forEach((i: number) => {
                if (i < sp.length)
                    sp.remove(i);
            });
        } else {
            var results: string[] = [];
            if (selector.index.length > 0) {
                selector.index.forEach((i: number) => {
                    if (i < sp.length)
                        results.push(sp[i]);
                });
            } else {
                results = sp;
            }

            pr.matches.push(results.join(" "));
        }

        return pr;
    }
}

class TextRangeProcessor extends ProcessorBase<Selector.TextRangeSelector>{
    process(selector: Selector.TextRangeSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var pr = new ProcessResult([]);
        var b = content.match(selector.begin);
        var e = content.match(selector.end);//right to left

        if (b === null || e === null) {
            return result;
        }
        let bt = b[0];
        let et = e[0];

        let begin = content.indexOf(bt);
        let end = content.lastIndexOf(et);

        if (selector.remove) {
            let t = content.substr(0, end);
            t = t.substr(begin + bt.length);

            pr.matches.push(content.replace(t, ""));
        } else {
            content = content.substr(0, end);
            content = content.substr(begin + bt.length);

            pr.matches.push(content);
        }

        return pr;
    }
}

class WildcardProcessor extends ProcessorBase<Selector.WildcardSelector>{
    process(selector: Selector.WildcardSelector, result: ProcessResult): ProcessResult {
        var content = result.getContent();
        var pr = new ProcessResult([]);

        if (selector.remove) {
            if (Wildcard.Match(selector.pattern, content))
                return pr;
        } else {
            if (Wildcard.Match(selector.pattern, content)) {
                pr.matches.push(content);
            }
        }

        return pr;
    }
}