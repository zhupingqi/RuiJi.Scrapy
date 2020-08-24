import $ from 'jquery';
import { Utils } from '@/core/ruiji/utils';

export class RectViewer {
    constructor() {
    };

    static DrawExp(exp: any, hub: boolean) {
        var block = exp.selectors.length > 0 ? exp.selectors[0].selector : "";
        var tile = exp.tile.selectors.length > 0 ? exp.tile.selectors[0].selector : "";
        var metas: any[] = [];
        if (hub) {
            var keys = Object.keys(exp.tile.metas);
            keys.forEach(function (m) {
                metas.push(exp.tile.metas[m].selectors[0].selector);
            });
        } else {
            var keys = Object.keys(exp.metas);
            keys.forEach(function (m) {
                metas.push(exp.metas[m].selectors[0].selector);
            });
        }

        var content = [block];
        var doms = Utils.GetDoms(content);

        $(doms).drawRect({class:'block'});

        content = [block, tile];
        doms = Utils.GetDoms(content, false);

        $(doms).drawRect({ class: 'tile' });

        content = [block, tile, metas];
        doms = Utils.GetDoms(content, false);
        $(doms).drawRect({ class: 'meta' });
    };

    static Draw(opt: any) {
        if (opt.dom) {
            opt.rect = $(opt.dom).rect();
        }

        var s = $("<ruiji-rect-viewer></ruiji-rect-viewer>");
        s.css({
            left: opt.rect.left + "px",
            top: opt.rect.top + "px",
            width: opt.rect.width() + 'px',
            height: opt.rect.height() + 'px'
        });

        s.data("opt", opt);
        if (opt.class) {
            s.addClass(opt.class);
        }

        $(document.body).append(s);
    };

    static Clear(s?: any) {
        if (s === undefined)
            $("ruiji-rect-viewer").remove();
        else {
            Array.from($("ruiji-rect-viewer")).forEach(function (m) {
                if ($(m).data("opt").indenty === s) {
                    $(m).remove();
                }
            });
        }
    };
};