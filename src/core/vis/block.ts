import $ from 'jquery';
import Rectangle from "@/core/vis/rectangle";
import { Direction } from "@/core/vis/enum";
import { AroundSplitter, Splitter } from "@/core/vis/splitter";
import { SplitterDetector } from "@/core/vis/detector";

export class DrawOptions {
    direction: Direction | boolean = true;
    block: boolean = true;
    splitter: boolean = false;
    minWidth: number = 0;
    minHeight: number = 0;
    minSub: number = 5;
    minDeep: number = 0;
    maxDeep: number = 50;
    blocks: string = "";
    maxWidth: number = 1024;
    maxHeight: number = 5000;
}

export class Block {
    doms: HTMLElement[];
    all: HTMLElement[] = [];
    deep: number;
    direction: Direction;
    sub_blocks: Block[] = [];
    sub_splitters: Splitter[] = [];
    around: AroundSplitter = new AroundSplitter(null, null, null, null);
    rect: Rectangle;

    static ignores: Array<string> = ["BLOCKQUOTE", "PRE", "CODE", "EM", "SCRIPT"];
    static drawCount: number = 0;
    static maxDeep: number = 9999;

    constructor(dom: HTMLElement[] | HTMLElement, deep: number = 0) {
        if (!Array.isArray(dom))
            this.doms = [dom];
        else
            this.doms = dom;
        this.deep = deep;

        this.doms = this.doms.filter(function (d) {
            var $d = $(d);
            var rect = $d.rect();
            var pTag = d.parentElement ? d.parentElement.tagName : "";

            return $d.is(":visible") && rect.isVisible() && !Block.ignores.contains(pTag) && !Block.ignores.contains(d.tagName) && d.id !== "ruiji_inject_frame";
        });

        this.direction = Direction.Horizontal;
        this.rect = Rectangle.Create(this.doms);
    }

    divide () {
        if (this.doms.length > 0) {
            var detector = new SplitterDetector(this);
            detector.detect();

            this.sub_blocks.map(sub => {
                if (sub.doms.length > 0 && sub.rect.isVisible() && sub.deep <= Block.maxDeep)
                    sub.divide();
            });
        }
    };

    static Clear () {
        Block.drawCount = 0;

        $("ruiji-block").remove();
        $("ruiji-splitter").remove();
    };

    static DrawSplitter(block: Block, options: DrawOptions) {
        options = $.extend({
            direction: "true",
            block: true,
            splitter: false
        }, options);

        if (block.direction === options.direction || options.direction === Direction.Unknown) {
            if (options.block &&
                block.rect.width() >= options.minWidth &&
                block.rect.height() >= options.minHeight &&
                block.sub_blocks.length >= options.minSub &&
                block.deep >= options.minDeep && block.deep <= options.maxDeep) {
                var s = $("<ruiji-block><ruiji-num>" + block.deep + ":" + Block.drawCount++ + "</ruiji-num></ruiji-block>");
                s.css({
                    position: 'absolute',
                    left: block.rect.left + "px",
                    top: block.rect.top + "px",
                    width: block.rect.width() + 'px',
                    height: block.rect.height() + 'px',
                    border: '1px solid green',
                    'background-color': 'transparent',
                    'box-sizing': 'border-box'
                });
                s.find("ruiji-num").data("block", block);

                $(document.body).append(s);
            }

            if (options.splitter && block.deep >= options.minDeep && block.deep <= options.maxDeep) {
                block.sub_splitters.map(function (sp) {
                    var s = $("<ruiji-splitter></ruiji-splitter>");
                    s.css({
                        position: 'absolute',
                        left: sp.rect.left + "px",
                        top: sp.rect.top + "px",
                        width: sp.rect.width() + 'px',
                        height: sp.rect.height() + 'px',
                        border: '1px solid red',
                        'background-color': '#007bff',
                        opacity: 0.3
                    });
                    $(document.body).append(s);
                });
            }
        }

        block.sub_blocks.map(function (b) {
            Block.DrawSplitter(b, options);
        });
    };
}