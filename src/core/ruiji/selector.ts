export namespace Selector {

    export enum CssTypeEnum {
        INNERHTML = 0,
        OUTERHTML = 1,
        TEXT = 2,
        ATTR = 3
    }

    export enum ExcludeTypeEnum {
        ALL = 0,
        BEGIN = 1,
        END = 2
    }

    export enum SelectorTypeEnum {
        CSS = 0,
        REGEX = 1,
        REGEXSPLIT = 2,
        TEXTRANGE = 3,
        EXCLUDE = 4,
        INCLUDE = 5,
        REGEXREPLACE = 6,
        JPATH = 7,
        XPATH = 8,
        CLEAR = 9,
        EXPRESSION = 10,
        FUNCTION = 11,
        WILDCARD = 12
    }

    export enum XPathTypeEnum {
        TEXT = 0,
        OUTERXML = 1,
        INNERXML = 2,
        ATTR = 3
    }

    export interface ISelector {
        type: SelectorTypeEnum;
        remove: boolean;
    }

    export abstract class SelectorBase implements ISelector {
        remove: boolean;

        type: SelectorTypeEnum;

        protected abstract setSelectType(): SelectorTypeEnum;

        abstract toString(): string;

        constructor() {
            this.remove = false;
            this.type = this.setSelectType();
        }
    }

    export class ClearTagSelector extends SelectorBase {
        constructor(public tags: string[]) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.CLEAR;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            return "clear " + this.tags.join(' ') + r;
        }
    }

    export class CssSelector extends SelectorBase {
        constructor(public selector: string, public attr: string | undefined, public ctype: CssTypeEnum = CssTypeEnum.TEXT) {
            super();

            if (attr !== undefined) {
                ctype = CssTypeEnum.OUTERHTML;
            }
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.CSS;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";
            var cmd = "css";
            var exp = "";

            switch (this.ctype) {
                case CssTypeEnum.ATTR:
                    {
                        exp = this.selector + ":[" + this.attr + "]";
                        break;
                    }
                case CssTypeEnum.INNERHTML:
                    {
                        exp = this.selector + ":html";
                        break;
                    }
                case CssTypeEnum.OUTERHTML:
                    {
                        exp = this.selector;
                        break;
                    }
                case CssTypeEnum.TEXT:
                    {
                        exp = this.selector + ":text";
                        break;
                    }
            }

            return [cmd, exp, r.trim()].join(" ");
        }
    }

    export class ExcludeSelector extends SelectorBase {
        constructor(public pattern: string, public etype: ExcludeTypeEnum = ExcludeTypeEnum.BEGIN) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.EXCLUDE;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";
            var cmd = "ex";
            var exp = "";

            switch (this.etype) {
                case ExcludeTypeEnum.BEGIN:
                    {
                        exp = "/" + this.pattern + "/ -b";
                        break;
                    }
                case ExcludeTypeEnum.END:
                    {
                        exp = "/" + this.pattern + "/ -e";
                        break;
                    }
                case ExcludeTypeEnum.ALL:
                    {
                        exp = "/" + this.pattern + "/ -a";
                        break;
                    }
            }

            return [cmd, exp, r.trim()].join(' ');
        }
    }

    export class ExpressionSelector extends SelectorBase {
        constructor(public expression: string, public split: string | undefined) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.EXPRESSION;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            if (this.split === "" || this.split === undefined) {
                return "exp " + this.expression + r;
            }
            else {
                return "exp " + this.expression + " /" + this.split + "/" + r;
            }
        }
    }

    export class FunctionSelector extends SelectorBase {
        constructor(public name: string, public func: string) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.FUNCTION;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";
            return "proc " + this.name + r;
        }
    }

    export class JsonPathSelector extends SelectorBase {
        constructor(public jsonPath: string) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.JPATH;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            return "jpath " + this.jsonPath + r;
        }
    }

    export class RegexReplaceSelector extends SelectorBase {
        constructor(public pattern: string, public newString: string) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.REGEXREPLACE;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            if (this.newString === "") {
                return "regR /" + this.pattern + "/" + r;
            }
            else {
                return "regR /" + this.pattern + "/ " + this.newString + r;
            }
        }
    }

    export class RegexSelector extends SelectorBase {
        constructor(public pattern: string, public index: number[]) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.REGEX;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            if (this.index.length == 0) {
                return "reg /" + this.pattern + "/" + r;
            }
            else {
                return "reg /" + this.pattern + "/ " + this.index.join(' ') + r;
            }
        }
    }

    export class RegexSplitSelector extends SelectorBase {
        constructor(public pattern: string, public index: number[]) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.REGEXSPLIT;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            if (this.index.length == 0) {
                return "regS /" + this.pattern + "/" + r;
            }
            else {
                return "regS /" + this.pattern + "/ " + this.index.join(' ') + r;
            }
        }
    }

    export class TextRangeSelector extends SelectorBase {
        constructor(public begin: string, public end: string) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.TEXTRANGE;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            return "text /" + this.begin + "/ /" + this.end + "/" + r;
        }
    }

    export class XPathSelector extends SelectorBase {
        constructor(public xpath: string, public attr: string | undefined, public xtype: XPathTypeEnum = XPathTypeEnum.TEXT) {
            super();

            if (attr !== undefined)
                xtype = XPathTypeEnum.OUTERXML;
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.XPATH;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            var cmd = "xpath";
            var exp = "";

            switch (this.xtype) {
                case XPathTypeEnum.ATTR:
                    {
                        exp = this.xpath + ":[" + this.attr + "]";
                        break;
                    }
                case XPathTypeEnum.INNERXML:
                    {
                        exp = this.xpath + ":xml";
                        break;
                    }
                case XPathTypeEnum.OUTERXML:
                    {
                        exp = this.xpath;
                        break;
                    }
                case XPathTypeEnum.TEXT:
                    {
                        exp = this.xpath + ":text";
                        break;
                    }
            }

            return [cmd, exp, r.trim()].join(' ');
        }
    }

    export class WildcardSelector extends SelectorBase {
        constructor(public pattern: string) {
            super();
        }

        protected setSelectType(): SelectorTypeEnum {
            return SelectorTypeEnum.WILDCARD;
        }

        toString(): string {
            let r = this.remove ? " -r" : "";

            var cmd = "wildcard";
            var exp = "";

            return "wildcard " + this.pattern + " " + r;
        }
    }
}