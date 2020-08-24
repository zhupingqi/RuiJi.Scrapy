/// <reference path="../../@types/jquery.fn.d.ts" />
import $ from 'jquery';

$.fn.xpath = function (onlyTag: boolean = false) {
    let el: HTMLElement | null = this.get(0);
    let xpath = '';
    let deep = 1;

    while (el !== null && el.nodeType === 1 && el.parentElement !== null) {
        if (el.tagName.substr(0, 1) !== "/") {
            if (el.id !== undefined && el.id !== '' && $("#" + el.id).length === 1) {
                var idPath = onlyTag?"": "[@id=" + "'" + el.id + "'" + "]";
                xpath = '/' + el.tagName.toLowerCase() + idPath + xpath;
            }
            else {
                var idx: string = ($(el.parentElement).children(el.tagName).index(el) + 1).toString();
                idx = onlyTag ? "": '[' + idx + ']';
                xpath = '/' + el.tagName.toLowerCase() + idx + xpath;
            }

            deep++;
        }

        el = el.parentElement;
    }

    return {
        path: xpath,
        deep: deep
    };
};