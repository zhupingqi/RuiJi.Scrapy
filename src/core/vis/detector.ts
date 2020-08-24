import $ from 'jquery';
import { Block } from "@/core/vis/block";
import { Splitter } from "@/core/vis/splitter";
import { Direction } from "@/core/vis/enum";
import Rectangle from "@/core/vis/rectangle";

export class SplitterDetector {
    doms: HTMLElement[];
    ignores: string[] = ["BLOCKQUOTE", "PRE", "CODE", "EM", "SCRIPT"];
    horizontalSplitters: Splitter[] = [];
    verticalSplitters: Splitter[] = [];
    block: Block;

    constructor(block: Block) {
        var _this = this;
        this.block = block;
        this.horizontalSplitters = [];
        this.verticalSplitters = [];
        this.doms = this.detectDoms(this.block.doms);

        this.doms = this.doms.filter(function (d) {
            var $d = $(d);
            var rect = $d.rect();
            var pTag = d.parentElement ? d.parentElement.tagName : "";
            return $d.is(":visible") && rect.isVisible() && !Block.ignores.contains(pTag) && !Block.ignores.contains(d.tagName) && d.id !== "ruiji_inject_frame";
        });

        this.doms.map(function (dom) {
            var $dom = $(dom);

            if (!block.rect.contains($dom.rect())) {
                var rect = $dom.rect();
                $dom.rect(rect.intersect(block.rect));
            }
        });
    }
    /**
     * 节点数量小于1，继续查找节点下的节点
     * @param doms
     */
    detectDoms(doms: HTMLElement[]): HTMLElement[] {
        if (doms.length > 1) {
            return doms;
        }
        else if (doms.length == 1) {
            if (Block.ignores.contains(doms[0].tagName)) {
                return [];
            }

            if (doms[0].children.length === 0)
                return doms

            let d = this.detectDoms(Array.from(doms[0].children) as HTMLElement[]);
            if (d.length === 0)
                return doms;
            else
                return d;
        }
        else {
            return [];
        }
    };

    /** 检测布局Block方向 */
    detectDirection() {
        var hs = this.detectSplitter(Direction.Horizontal);
        var vs = this.detectSplitter(Direction.Vertical);
        this.block.direction = Direction.Horizontal;
        if (hs.length == 0 && vs.length == 0)
            this.block.direction = Direction.Unknown;
        else if (hs.length == 0 && vs.length > 0)
            this.block.direction = Direction.Vertical;
        else if (hs.length > 0 && vs.length == 0)
            this.block.direction = Direction.Horizontal;
        else
            this.block.direction = Direction.Vertical;
        if (this.block.direction == Direction.Unknown) {
            if (this.block.rect.width() >= this.block.rect.height())
                this.block.direction = Direction.Horizontal;
            else
                this.block.direction = Direction.Vertical;
        }
        if (this.block.direction == Direction.Horizontal) {
            this.block.sub_splitters = this.block.sub_splitters.concat(hs);
        }
        else {
            this.block.sub_splitters = this.block.sub_splitters.concat(vs);
        }
        this.setAround(hs, vs);
        return this.block.direction;
    };

    detectSplitter(direction: Direction) {
        var splitters = [new Splitter(this.block.rect, direction)];
        var self = this;

        this.doms.map(function (dom) {
            var $dom = $(dom);
            var removes: Splitter[] = [];
            var adds: Splitter[] = [];
            var domRect = $dom.rect();

            splitters.map(function (sp) {
                if (Rectangle.Cross(sp.rect, domRect)) {
                    removes.push(sp);
                    return;
                }

                if (sp.rect.contains(domRect)) {
                    if (direction == Direction.Horizontal) {
                        var rect = new Rectangle(sp.rect.left, sp.rect.top, sp.rect.right, domRect.top);
                        adds.push(new Splitter(rect, direction));
                        rect = new Rectangle(sp.rect.left, domRect.bottom, sp.rect.right, sp.rect.bottom);
                        adds.push(new Splitter(rect, direction));
                    }
                    else {
                        var rect = new Rectangle(sp.rect.left, sp.rect.top, domRect.left, sp.rect.bottom);
                        adds.push(new Splitter(rect, direction));
                        rect = new Rectangle(domRect.right, sp.rect.top, sp.rect.right, sp.rect.bottom);
                        adds.push(new Splitter(rect, direction));
                    }
                    removes.push(sp);
                    return;
                }

                if (sp.rect.intersectWith(domRect)) {
                    if (direction == Direction.Horizontal) {
                        if (sp.rect.top < domRect.top) {
                            sp.rect = new Rectangle(sp.rect.left, sp.rect.top, sp.rect.right, domRect.top);
                        }
                        if (sp.rect.bottom > domRect.bottom) {
                            sp.rect = new Rectangle(sp.rect.left, domRect.bottom, sp.rect.right, sp.rect.bottom);
                        }
                    }
                    else {
                        if (sp.rect.left < domRect.left) {
                            sp.rect = new Rectangle(sp.rect.left, sp.rect.top, domRect.left, sp.rect.bottom);
                        }
                        if (sp.rect.right > domRect.right) {
                            sp.rect = new Rectangle(domRect.right, sp.rect.top, sp.rect.right, sp.rect.bottom);
                        }
                    }
                }
            });

            splitters = splitters.remove(removes);
            splitters = splitters.concat(adds);
        });

        splitters = this.removeMarginalSplitter(splitters, direction);

        var removes: Splitter[] = [];
        this.doms.map(function (dom) {
            var $dom = $(dom);
            splitters.map(function (sp) {
                if (sp.rect.intersectWith($dom.rect())) {
                    removes.push(sp);
                }
                if (!self.block.rect.contains(sp.rect)) {
                    removes.push(sp);
                }
            });
        });
        splitters = splitters.remove(removes);

        if (direction == Direction.Horizontal) {
            this.horizontalSplitters = splitters;
        }
        else {
            this.verticalSplitters = splitters;
        }
        return splitters;
    };

    removeMarginalSplitter(splitters: Splitter[], direction: Direction) {
        var removes: Splitter[] = [];
        var self = this;
        if (direction == Direction.Horizontal) {
            splitters.map(function (sp) {
                if (sp.rect.top == self.block.rect.top || sp.rect.bottom == self.block.rect.bottom)
                    removes.push(sp);
            });
        }
        else {
            splitters.map(function (sp) {
                if (sp.rect.left == self.block.rect.left || sp.rect.right == self.block.rect.right)
                    removes.push(sp);
            });
        }
        splitters = splitters.remove(removes);

        return splitters;
    };

    setAround(hs: Splitter[], vs: Splitter[]) {
        var self = this;
        var removes: HTMLElement[] = [];
        /** 去除dom分割条 */
        this.doms.map(function (dom) {
            var $dom = $(dom);
            var rect = $dom.rect();

            hs.map(function (sp) {
                if (rect.equal(sp.rect))
                    removes.push(dom);
            });

            vs.map(function (sp) {
                if (rect.equal(sp.rect))
                    removes.push(dom);
            });
        });

        this.doms = this.doms.remove(removes);
        var doms = this.doms.slice(0);

        if (hs.length === 0 && vs.length === 0) {
            doms.map(function (dom) {
                var block = new Block(dom, self.block.deep + 1);
                self.block.sub_blocks.push(block);
            });

            return;
        }
        if (this.block.direction == Direction.Horizontal) {
            hs = hs.sort((a, b) => {
                return a.rect.top - b.rect.top;
            });

            hs.map(function (sp) {
                var tmpDoms = doms.filter(function (dom) {
                    return $(dom).rect().bottom <= sp.rect.top;
                });

                if (tmpDoms.length === 0)
                    return;

                doms = doms.remove(tmpDoms);

                var block = new Block(tmpDoms, self.block.deep + 1);
                block.around.up = hs.filter(function (m) {
                    return m.rect.bottom <= block.rect.top;
                }).sort((a, b) => {
                    return b.rect.bottom - a.rect.bottom;
                }).first();

                block.around.down = hs.filter(function (m) {
                    return m.rect.top >= block.rect.bottom;
                }).sort((a, b) => {
                    return a.rect.top - b.rect.top;
                }).first();

                self.block.sub_blocks.push(block);
            });
            if (doms.length > 0)
                this.block.sub_blocks.push(new Block(doms, this.block.deep + 1));
        }
        else {
            vs = vs.sort((a, b) => {
                return a.rect.left - b.rect.left;
            });

            vs.map(function (sp) {
                var tmpDoms = doms.filter(function (dom) {
                    return $(dom).rect().right <= sp.rect.left;
                });

                if (tmpDoms.length === 0)
                    return;

                doms = doms.remove(tmpDoms);

                var block = new Block(tmpDoms, self.block.deep + 1);
                block.around.left = vs.filter(function (m) {
                    return m.rect.right <= block.rect.left;
                }).sort((a, b) => {
                    return b.rect.right - a.rect.right;
                }).first();

                block.around.right = vs.filter(function (m) {
                    return m.rect.left >= block.rect.right;
                }).sort((a, b) => {
                    return a.rect.left - b.rect.left;
                }).first();

                self.block.sub_blocks.push(block);
            });
            if (doms.length > 0)
                this.block.sub_blocks.push(new Block(doms, this.block.deep + 1));
        }
    };

    detect() {
        if (this.doms.length < 1)
            return;

        if (this.doms.length === 1 && this.doms[0].children.length === 0) {
            return;
        }

        this.detectDirection();
    };
};
