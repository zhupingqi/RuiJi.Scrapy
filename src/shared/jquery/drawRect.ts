/// <reference path="../../@types/jquery.fn.d.ts" />
import $ from 'jquery';
import { RectViewer } from "@/core/ruiji/viewer";

$.fn.drawRect = function (opt) {
    var ary = Array.from(this);
    ary.forEach(function (d) {
        opt = $.extend({}, opt);
        opt.dom = d;

        RectViewer.Draw(opt);
    });
};