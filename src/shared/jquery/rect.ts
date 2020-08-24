/// <reference path="../../@types/jquery.fn.d.ts" />
import $ from 'jquery';
import Rectangle from "@/core/vis/rectangle";

$.fn.rect = function (r?: any): any {
    let self = this;

    if (r)
        self.data("rect", r);

    var d = self.data("rect");
    if (d === undefined)
        self.data("rect", Rectangle.Create(self.get(0)));

    return self.data("rect");
};