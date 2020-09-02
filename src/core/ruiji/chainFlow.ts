import $ from 'jquery';
import Raphael, { RaphaelPaper, RaphaelElement, RaphaelBasicEventHandler, RaphaelPath, RaphaelAxisAlignedBoundingBox } from "raphael";
import { _browser } from "@/core/utils";

export enum ChainType {
    START,
    END,
    BRANCH,
    TASK
}

export type ItemClickHandler = (item: ChainFlowItem) => void;
export type MouseEventHandler = (event: JQuery.ClickEvent) => any;

class ChainLine {
    public path!: RaphaelPath;
    paper!: RaphaelPaper;

    constructor(public startItem: ChainFlowItem, public endItem: ChainFlowItem, paper: RaphaelPaper) {
        this.paper = paper;

        this.drawLine();
    }

    drawLine() {
        var start = this.startItem.element;
        var end = this.endItem.element;

        var opp: Position = { x: 0, y: 0 };
        var edp: Position = { x: 0, y: 0 };
        var sbox = start.getBBox();
        var ebox = end.getBBox();

        if (start.type == 'circle') {
            opp = { x: start.attr("cx") as number, y: start.attr("cy") as number };
        } else {
            opp = { x: start.attr("x") as number, y: start.attr("y") as number };
            opp.x += sbox.width / 2;
            opp.y += sbox.height / 2;
        }

        if (end.type == 'circle') {
            edp = { x: end.attr("cx") as number, y: end.attr("cy") as number };
        } else {
            edp = { x: end.attr("x") as number, y: end.attr("y") as number };
            edp.x += ebox.width / 2;
            edp.y += ebox.height / 2;
        }

        //延长线段
        if (opp.x == edp.x) {
            if (opp.y <= edp.y) {
                opp.y -= 100;
                edp.y += 100;
            } else {
                opp.y += 100;
                edp.y -= 100;
            }
        } else if (opp.y == edp.y) {
            if (opp.x <= edp.x) {
                opp.x -= 100;
                edp.x += 100;
            } else {
                opp.x += 100;
                edp.x -= 100;
            }
        }
        else {
            var tanA = (edp.y - opp.y) / (edp.x - opp.x);
            if (opp.x > edp.x) {
                opp.x += Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2)));
                opp.y += Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2))) * tanA;

                edp.x -= Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2)));
                edp.y -= Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2))) * tanA;
            } else {
                opp.x -= Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2)));
                opp.y -= Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2))) * tanA;

                edp.x += Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2)));
                edp.y += Math.sqrt(Math.pow(100, 2) / (1 + Math.pow(tanA, 2))) * tanA;
            }
        }

        opp.x = Math.round(opp.x);
        opp.y = Math.round(opp.y);
        edp.x = Math.round(edp.x);
        edp.y = Math.round(edp.y);

        //计算与边界交点
        var op = this.boxIntr(sbox, opp, edp);
        var ep = this.boxIntr(ebox, opp, edp);

        var d = Math.pow(440, 2) + Math.pow(500, 2);

        if (op.length == 0 || ep.length == 0) {
            console.log(sbox);
            console.log(ebox);
            console.log(opp);
            console.log(edp);
            console.log(op);
            console.log(ep);
        }

        //选择距离大于5的最短线段
        op.forEach(m => {
            ep.forEach(n => {
                var dd = Math.pow((m.x - n.x), 2) + Math.pow((m.y - n.y), 2);

                if (dd < d && dd >= 25) {
                    d = dd;
                    opp = m;
                    edp = n;
                }
            });
        });

        var path = 'M' + opp.x + ' ' + opp.y + 'L' + edp.x + ' ' + edp.y;

        if (this.path) {
            this.path.attr("path", path);
        } else {
            this.path = this.paper.path(path).attr({ 'stroke': '#808080', 'arrow-end': 'block-wide-long',"stroke-width":2 });
        }
    }

    private boxIntr(box: RaphaelAxisAlignedBoundingBox, c: Position, d: Position): Position[] {
        var x = Math.round(box.x);
        var y = Math.round(box.y);
        var w = Math.round(box.width);
        var h = Math.round(box.height);

        var ls = [
            [x - 5, y - 5]
            , [x + w + 5, y - 5]
            , [x + w + 5, y - 5]
            , [x + w + 5, y + h + 5]
            , [x + w + 5, y + h + 5]
            , [x - 5, y + h + 5]
            , [x - 5, y + h + 5]
            , [x - 5, y - 5]
        ];

        var ps: Position[] = [];

        for (var i = 0; i < ls.length; i += 2) {
            var a = new Position(ls[i][0], ls[i][1]);
            var b = new Position(ls[i + 1][0], ls[i + 1][1]);

            var p = this.segmentsIntr(a, b, c, d);

            if (typeof (p) !== "boolean") {
                ps.push({
                    x: Math.round(p.x),
                    y: Math.round(p.y)
                });
            }
        }

        return ps;
    }

    private segmentsIntr(a: Position, b: Position, c: Position, d: Position): Position | boolean {
        /** 1 解线性方程组, 求线段交点. **/
        // 如果分母为0 则平行或共线, 不相交  
        var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return false;
        }

        // 线段所在直线的交点坐标 (x , y)      
        var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

        x = Math.round(x);
        y = Math.round(y);

        /** 2 判断交点是否在两条线段上 **/
        if (
            // 交点在线段1上  
            (x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
            // 且交点也在线段2上  
            && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0
        ) {

            // 返回交点p  
            return {
                x: x,
                y: y
            }
        }

        return false;
    }  
}

class Position {
    public x: number = 0;
    public y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class ChainFlowItem {
    public parent: ChainFlowItem | null = null;
    public children: ChainFlowItem[] = [];
    public data: any = {};
    public type: ChainType;
    chainFlow: ChainFlow;
    lines: ChainLine[] = [];
    paper!: RaphaelPaper;
    element!: RaphaelElement;
    textElement!: RaphaelElement;
    text: string = "";
    ox: number | undefined = 0;
    oy: number | undefined = 0;

    constructor(type: ChainType, chainFlow: ChainFlow, name: string = "", x: number = 0, y: number = 0) {
        this.chainFlow = chainFlow;
        this.type = type;
        this.paper = this.chainFlow.paper;

        switch (type) {
            case ChainType.START: {
                this.element = this.paper.circle(x, y, 20).attr({ fill: '#E0F1D0', stroke: "#03689a", cursor: "pointer" });
                this.text = _browser.getI18nMessage("start");
                break;
            }
            case ChainType.END: {
                this.element = this.paper.circle(x, y, 20).attr({ fill: '#FFCCCC', stroke: "#03689a", cursor: "pointer" });
                this.text = _browser.getI18nMessage("end");
                break;
            }
            case ChainType.BRANCH: {
                this.element = this.paper.rect(x, y, 100, 50, 5).attr({ fill: '#F4F4CC', stroke: "#03689a", cursor: "pointer" });
                this.text = _browser.getI18nMessage("branch");
                break;
            }
            case ChainType.TASK: {
                this.element = this.paper.rect(x, y, 100, 50, 5).attr({ fill: '#f6f7ff', stroke: "#03689a", cursor: "pointer" });
                this.text = _browser.getI18nMessage("task");
                break;
            }
        }

        if (name !== "")
            this.text = name;

        var box = this.element.getBBox();
        var tx = x;
        var ty = y;

        if (this.element.type != 'circle') {
            tx = x + box.width / 2;
            ty = y + box.height / 2;
        }

        this.textElement = this.paper.text(tx, ty, this.text).attr({ cursor: 'pointer' });

        this.element.drag(this.move, this.start, this.end, this, this, this);
        this.textElement.drag(this.move, this.start, this.end, this, this, this);

        this.element.click((e: MouseEvent) => {
            this.click(e);
        });

        this.textElement.click((e: MouseEvent) => {
            this.click(e);
        });
    }

    click(e: MouseEvent) {
        e.stopPropagation();

        if (this.chainFlow.current) {
            this.chainFlow.current.textElement.attr("font-weight", "normal");
        }

        this.chainFlow.current = this;
        this.textElement.attr("font-weight", "bold");        

        if (this.chainFlow.itemClickHandle !== null)
            this.chainFlow.itemClickHandle(this);
    }

    addItem(type: ChainType = ChainType.TASK, name: string = "", x: number = 0, y: number = 0): ChainFlowItem {
        var item = new ChainFlowItem(type, this.chainFlow, name);
        this.children.push(item);
        item.parent = this;
        var box = this.element.getBBox();
        item.setPosition(box.x, box.y + 100);
        item.lines.push(new ChainLine(this, item, this.chainFlow.paper));

        return item;
    }

    setPosition(x: number, y: number) {
        if (this.element.type == 'circle') {
            this.element.attr({ cx: x, cy: y });
            this.textElement.attr({ x: x, y: y });
        } else {
            this.element.attr({ x: x, y: y });
            var box = this.element.getBBox();
            this.textElement.attr({ x: x + box.width / 2, y: y + box.height / 2 });
        }
    }

    setText(text: string) {
        this.text = text;
        this.textElement.attr("text", text);
    }

    getPosition(): Position {
        var p = new Position();

        if (this.element.type == 'circle') {
            p.x = this.element.attr("cx") as number;
            p.y = this.element.attr("cy") as number;
        } else {
            p.x = this.element.attr("x") as number;
            p.y = this.element.attr("y") as number;
        }

        p.x = Math.round(p.x);
        p.y = Math.round(p.y);

        return p;
    }

    autoPosition() {

    }

    start(x: number, y: number, event: Event) {
        if (this.element.type == 'circle') {
            this.ox = this.element.attr("cx");
            this.oy = this.element.attr("cy");
        } else {
            this.ox = this.element.attr("x");
            this.oy = this.element.attr("y");
        }

        this.element.attr("opacity", 0.25);
    }

    move(dx: number, dy: number, x: number, y: number, event: Event) {
        let box = this.element.getBBox();
        if (this.ox === undefined)
            this.ox = 0;
        if (this.oy === undefined)
            this.oy = 0;

        var nx = this.ox + dx;
        var ny = this.oy + dy;

        if (this.element.type == 'circle') {
            this.element.attr({ cx: nx, cy: ny });
            this.textElement.attr({ x: nx, y: ny });
        } else {
            this.element.attr({ x: nx, y: ny, });
            this.textElement.attr({ x: nx + box.width / 2, y: ny + box.height / 2 });
        }

        this.updateLine();
    }

    end(event: Event) {
        this.element.attr("opacity", 1);
    }

    remove(child: boolean = false) {
        if (child) {
            if (this.children.length > 0) {
                this.children.forEach((m) => {
                    m.remove(true);
                    m.element.remove();
                    m.textElement.remove();
                    m.lines.forEach(n => {
                        n.path.remove();
                    });
                    m.lines = [];
                });
                this.children = [];
            }
        } else {
            this.remove(true);
            this.lines.forEach(m => {
                m.path.remove();
            });
            this.lines = [];
            this.element.remove();
            this.textElement.remove();
            if (this.parent) {
                this.parent.children = this.parent.children.remove(this);
            }            
        }

        this.chainFlow.current = null;
    }

    updateLine(deep: boolean = true) {
        this.lines.forEach((m) => {
            m.drawLine();
        });

        if (!deep)
            return;

        this.children.forEach((m) => {
            m.updateLine(true);
        });
    }
}

export class ChainFlow {
    window: Window;
    useRulePaging: boolean = true;
    interval: number = 10;
    url: string = "";
    urlFields: string[] = ["url"];
    rule: any | null = null;
    matched: string[] = [];
    paper!: RaphaelPaper;
    itemClickHandle: ItemClickHandler | null = null;
    paperClickHandle: MouseEventHandler | null = null;
    lines: ChainLine[] = [];
    root: ChainFlowItem;
    current: ChainFlowItem | null = null;

    constructor(domId: string, w: Window | null  = null) {
        if (this.paper) {
            this.paper.remove();
            this.lines = [];
        }

        if (w) {
            this.window = w;
            Raphael.setWindow(w);
        } else {
            this.window = window;
        }

        let _this = this;

        this.paper = Raphael(domId, 440, 500);

        $('svg', this.window).bind('click', function (e) {
            e.stopPropagation();

            if (_this.paperClickHandle)
                _this.paperClickHandle(e);
        });

        this.root = new ChainFlowItem(ChainType.START, this);
        this.root.setPosition(220, 50);
    }

    itemClick(fn: ItemClickHandler) {
        this.itemClickHandle = fn;
    }

    paperClick(fn: MouseEventHandler) {
        this.paperClickHandle = fn;
    }
}