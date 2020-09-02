import $ from 'jquery';
import { RectViewer } from "@/core/ruiji/viewer";
import { DomLocator } from "@/core/ruiji/locator";
import { Utils } from "@/core/ruiji/utils";

export class Outline {
    currentDom!: HTMLElement;
    inspectDom!: JQuery<HTMLElement>;
    inspectTool!: JQuery<HTMLElement>;
    domSelector!: JQuery<HTMLElement>;
    opt!: any;

    constructor() {

    }

    inspect(opt: any) {
        var self = this;
        this.opt = $.extend({
            unique: true
        }, opt);
        this.initRect(document.body);

        this.inspectDom = $("<ruiji-inspect-dom></ruiji-inspect-dom>");
        this.inspectDom.data("opt", opt);
        $(document.body).append(this.inspectDom);

        this.inspectTool = $("<ruiji-inspect-tool><ruiji-inspect-i>&uarr;</ruiji-inspect-i><ruiji-inspect-i>&darr;</ruiji-inspect-i><ruiji-inspect-i>&larr;</ruiji-inspect-i><ruiji-inspect-i>&rarr;</ruiji-inspect-i><ruiji-inspect-i>&times;</ruiji-inspect-i></ruiji-inspect-tool>");
        this.inspectTool.css({
            opacity: 0.5
        });
        this.inspectTool.data("opt", opt);
        this.inspectTool.hide();
        $(document.body).append(this.inspectTool);

        this.domSelector = $("<ruiji-inspect-dom-selector></ruiji-inspect-dom-selector>");
        this.domSelector.data("opt", opt);
        this.domSelector.hide();
        $(document.body).append(this.domSelector);

        this.bind();
    }

    initRect(dom: HTMLElement) {
        var _this = this;
        if (!$(dom).is(":visible") || dom.tagName.startsWith("ruiji-") || dom.tagName === "IFRAME")
            return;

        $(dom).rect();
        var ary = Array.from(dom.children) as HTMLElement[];
        ary.forEach(function (d) {
            if (d.children.length > 0) {
                _this.initRect(d);
            }
            $(d).rect();
        });
    }

    matchDom(dom: HTMLElement, x: number, y: number): HTMLElement[] {
        var _this = this;
        var rect = $(dom).rect();
        var rs: HTMLElement[] = [];

        if ($(dom).is(":visible") && rect.contains(x, y) && $(dom).css("opacity")!=="0")
            rs.push(dom);

        var ary = Array.from(dom.children) as HTMLElement[];
        ary.forEach(function (d) {
            rs = rs.concat(_this.matchDom(d, x, y));
        });
        return rs;
    }

    drawRect() {
        var $dom = $(this.currentDom);
        var rect = $dom.rect();

        this.inspectDom.css({
            left: rect.left,
            top: rect.top,
            width: rect.width(),
            height: rect.height()
        });
    }

    bind() {
        var _this = this;

        $(document.body).bind("mousemove", function (e) {
            var doms = _this.matchDom(document.body, e.pageX, e.pageY);            

            let g = doms.group((a) => {
                return $(a).zIndex();
            });            

            let key = Array.from(g.keys()).max((a) => { return a; });

            var dom = g.get(key)!.last();

            if (_this.currentDom !== dom) {
                _this.currentDom = dom;
                _this.drawRect();               
            }
            return false;
        });

        this.inspectDom.click(function () {
            $(document.body).unbind("mousemove");

            _this.showTool();
        });

        this.inspectTool.find("ruiji-inspect-i").click(function () {
            var $this = $(this);
            if ($this.attr("disabled"))
                return;

            var $parent = $this.parent();
            var $dom = $parent.data("dom");

            switch ($this.index()) {
                case 0: {
                    $dom = $dom.parent();
                    break;
                }
                case 1: {
                    $dom = $($dom.children()[0]);
                    break;
                }
                case 2: {
                    $dom = $dom.prev();
                    break;
                }
                case 3: {
                    $dom = $dom.next();
                    break;
                }
                case 4: {
                    if ($.isFunction(_this.opt.finish)) {
                        _this.opt.finish(true);
                    }

                    _this.destory();
                    return;
                }
            }

            _this.currentDom = $dom.get(0);
            _this.showTool();
        });

        this.inspectTool.mouseenter(function () {
            _this.inspectTool.css({ opacity: 1 });
        });

        this.inspectTool.mouseleave(function () {
            _this.inspectTool.css({ opacity: 0.5 });
        });
    }

    enableAction(dom: JQuery<HTMLElement>, disabled: boolean) {
        if (disabled) {
            dom.css({
                'background-color': '#c7c7c7'
            });
            dom.attr("disabled", "disabled");
        } else {
            dom.css({
                'background-color': '#007bff'
            });
            dom.removeAttr("disabled");
        }
    }

    destory() {
        $(document.body).unbind("mousemove");

        RectViewer.Clear();
        Outline.Clear();
    }

    static Clear() {
        $(document.body).unbind("mousemove");

        $("ruiji-inspect-dom").remove();
        $("ruiji-inspect-tool").remove();
        $("ruiji-inspect-dom-selector").remove();
    }

    showTool() {
        var $dom = $(this.currentDom);
        if ($dom.length === 0)
            return;

        var _this = this;
        var locator = new DomLocator(this.currentDom, {
            unique: this.opt.unique,
            priority: this.opt.unique ? ["class", "id", "tag"] : ["class", "tag", "id"]
        });

        var result = locator.locate();
        var selector = "";
        if (result.type === "css")
            selector = "." + result.locator[0];
        if (result.type === "id")
            selector = "#" + result.locator;

        if ($.isFunction(this.opt.change)) {
            this.opt.change(selector);
        }

        //dom rect
        var rect = $dom.rect();
        this.inspectDom.css({
            left: rect.left,
            top: rect.top,
            width: rect.width(),
            height: rect.height()
        });
        this.inspectDom.data("dom", $dom);

        //inspect tool
        this.inspectTool.css({
            left: rect.left,
            top: rect.top > 22 ? rect.top - 22 : 0
        });
        this.inspectTool.data("dom", $dom);
        this.inspectTool.show();

        var acts = this.inspectTool.find("i");
        this.enableAction(acts.eq(0), $dom.get(0).tagName === "BODY");
        this.enableAction(acts.eq(1), $dom.children().length === 0);
        this.enableAction(acts.eq(2), $dom.prev().length === 0);
        this.enableAction(acts.eq(3), $dom.next().length === 0);

        //dom selector
        this.domSelector.css({
            left: rect.right,
            top: rect.top
        });
        this.domSelector.data("dom", $dom);
        this.domSelector.html("");
        if (result.id) {
            this.domSelector.append("<dom-selector style='display:block;cursor:pointer'>#" + result.id + "</dom-selector>");
        }
        result.class.forEach((c:string) => {
            this.domSelector.append("<dom-selector style='display:block;cursor:pointer'>." + c + "</dom-selector>");
        });
        this.domSelector.append("<dom-selector style='display:block;cursor:pointer'>" + result.tagName.toLowerCase() + "</dom-selector>");
        this.domSelector.show();

        $("dom-selector").mouseenter(function () {
            var $this = $(this);

            var exp = _this.opt.expression;
            if (!exp)
                return;

            var block = exp.selectors.length > 0 ? exp.selectors[0].selector : "";
            var tile = exp.tile.selectors.length > 0 ? exp.tile.selectors[0].selector : "";

            var content = [];
            if (_this.opt.target === "block") {
                content = [$this.text()];
            } else if (_this.opt.target === "tile") {
                content = [block, $this.text()];
            } else {
                content = [block, tile, $this.text()];
            }

            var doms = Utils.GetDoms(content, false);

            $(doms).drawRect();
        });

        $("dom-selector").mouseleave(function () {
            RectViewer.Clear();
        });

        $("dom-selector").click(function () {
            if ($.isFunction(_this.opt.change)) {
                _this.opt.change($(this).text());
            }

            if ($.isFunction(_this.opt.finish)) {
                _this.opt.finish($(this).text());
            }

            _this.destory();
        });
    }
};