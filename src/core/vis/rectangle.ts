import $ from 'jquery';

export default class Rectangle {
    constructor(public left: number, public top: number, public right: number, public bottom: number) {
    }

    /** 宽度 */
    width() {
        return this.right - this.left;
    };
    
    /** 高度 */
    height() {
        return this.bottom - this.top;
    };

    contains(x: Rectangle): boolean;
    contains(x: number, y: number): boolean;

    /**
     * 是否包含
     * @param x
     * @param y
     */
    contains (x: Rectangle | number, y?: number) {
        if (y === undefined) {
            x = x as Rectangle;

            return this.left <= x.left && this.right >= x.right && this.top <= x.top && this.bottom >= x.bottom;
        }

        y = y as number;
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    };
    
    /** 可见 */
    isVisible() {
        //if (this.width() === 0 && this.height() === 0)
        //    return false;
        return true;
    };
    
    /**
     * 相交则合并
     * @param rect
     */
    intersect(rect: Rectangle) {
        if (!this.intersectWith(rect))
            return;
        this.merge(rect);
    };

    merge(rect: Rectangle) {
        this.left = Math.min(this.left, rect.left);
        this.top = Math.min(this.top, rect.top);
        this.right = Math.max(this.right, rect.right);
        this.bottom = Math.max(this.bottom, rect.bottom);
    };

    /**
     * 是否相交
     * @param rect
     */
    intersectWith(rect: Rectangle) {
        let a_x_w = Math.abs((this.left + this.width() / 2) - (rect.left + rect.width() / 2));
        let b_w_w = Math.abs((this.width() + rect.width()) / 2);
        let a_y_h = Math.abs((this.top + this.height() / 2) - (rect.top + rect.height() / 2));
        let b_h_h = Math.abs((this.height() + rect.height()) / 2);

        if (a_x_w < b_w_w && a_y_h < b_h_h)
            return true;
        else
            return false;
    };

    /**
     * 是否相等
     * @param rect
     */
    equal(rect: Rectangle) {
        return this.left == rect.left && this.top == rect.top && this.right == rect.right && this.bottom == rect.bottom;
    };

    static Create(dom: HTMLElement | HTMLElement[] | JQuery<HTMLElement>) {
        let _this = this;
        let ary: HTMLElement[];
        if (dom instanceof HTMLElement) {
            ary = [dom];
        }
        else if (Array.isArray(dom)) {
            ary = dom;
        }
        else {
            ary = Array.from(dom);
        }

        let rect = _this.ComputeDomRect(ary.first());

        ary.forEach(function (dom) {
            rect.merge(_this.ComputeDomRect(dom));
        });

        return rect;
    };

    static ComputeDomRect(dom: HTMLElement) {
        let $dom = $(dom);
        if ($dom.offset() === undefined)
            return new Rectangle(0, 0, 0, 0);

        let left: number = ($dom.offset() as JQuery.Coordinates).left;
        let top: number = ($dom.offset() as JQuery.Coordinates).top;
        let right: number = left + ($dom.outerWidth(false) as number);
        let bottom: number = top + ($dom.outerHeight(false) as number);
        let rect = new Rectangle(left, top, right, bottom);

        return rect;
    };

    /** 求交集 */
    static Intersect(a: Rectangle, b: Rectangle) {
        if ((a.right > b.left) &&
            (a.left < b.right) &&
            (a.bottom > b.top) &&
            (a.top < b.bottom)) {
            let rect = new Rectangle(0, 0, 0, 0);
            rect.left = (a.left > b.left) ? a.left : b.left;
            rect.right = (a.right < b.right) ? a.right : b.right;
            rect.top = (a.top > b.top) ? a.top : b.top;
            rect.bottom = (a.bottom < b.bottom) ? a.bottom : b.bottom;
            return rect;
        }
        else {
            return new Rectangle(0, 0, 0, 0);
        }
    };

    /** a是否穿过b */
    static Cross(a: Rectangle, b: Rectangle) {
        if (a.top > b.top && a.top < b.bottom && a.bottom > b.top && a.bottom < b.bottom)
            return true;
        if (a.left > b.left && a.left < b.right && a.right > b.left && a.right < b.right)
            return true;
        return false;
    };
}