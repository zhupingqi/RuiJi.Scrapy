/// <reference path="../../@types/jquery.fn.d.ts" />
import $ from 'jquery';

$.fn.zIndex = function (): number {
    let self = this;

    let index = self.css("zIndex");
    let total = 0;

    let p = self;
    while (p.get(0).tagName !== "BODY") {
        index = p.css("zIndex");
        total += index === "auto" ? 0 : parseInt(index);      

        p = p.parent();
    }

    return total;
};