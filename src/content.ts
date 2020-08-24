/// <reference path="../node_modules/@types/chrome/index.d.ts" />
/// <reference path="../node_modules/@types/firefox-webext-browser/index.d.ts" />

import $ from 'jquery';
import Vue from 'vue';
import Bus, { _browser, TargetName } from '@/core/utils';

import '@/shared/jquery/rect';
import '@/shared/jquery/drawRect';
import '@/shared/jquery/xpath';
import '@/shared/jquery/zindex';
import '@/shared/array';

import '@/core/i18n';

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import Pane from '@/components/content/Pane.vue';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.min.css';

import { Block } from '@/core/vis/block';
import { RectViewer } from '@/core/ruiji/viewer';
import { baseUrl } from '@/core/common';
import { Outline } from '@/core/ruiji/outline';
import { Extractor } from '@/core/ruiji/extractor';

import '../public/libs/tableExport.js';
import { Uri } from '@/core/ruiji/utils';

$(() => {
    _browser.sendMessage({ cmd: "inject.get" }, response => {
        if (response)
            init();
    });
});

function init() {
    if (top !== self)
        return;

    var html = $(document.body).html();
    if ($.trim(html) === "")
        return;

    if ($.trim(document.URL) === "")
        return;

    var widget = new RuiJiWidget();

    _browser.addContentListener();
    _browser.sendMessage({ cmd: "user.check" }, response => {
        var btn = $("ruiji-button");
        if (btn.length === 0) {
            widget.createButton();
            btn = $("ruiji-button");
            btn.hide();
        }

        if (response.code === 200) {
            if (window.name === TargetName.PagingWindow) {
                widget.extractPaging();
            }
            else if (window.name === TargetName.ChainWindow) {
                widget.extracChain();
            }
            else {
                btn.show();
            }
        }
        else {
            btn.hide();
        }
    });
}

class RuiJiWidget {
    private $frame: JQuery<HTMLElement> | any = $("#ruiji_inject_frame");

    constructor() { }

    createButton() {
        let _this = this;

        $(document.body).append("<ruiji-button><ruiji-radar></ruiji-radar></ruiji-button>");

        $("ruiji-button").click(() => {
            if (_this.$frame.length === 0)
                _this.createPane();
            else
                _this.$frame.show();

            $(this).hide();
        });
    }

    extractPaging() {
        let _this = this;

        $(document.body).drawRect({
            class:'auto-paging'
        });

        $(document.body).append("<ruiji-paging><ruiji-paging-info>total:</ruiji-paging-info><ruiji-countdown>0</ruiji-countdown><ruiji-paging-stop>&otimes; Stop</ruiji-paging-stop><ruiji-next></ruiji-next></ruiji-paging>");

        _browser.sendMessage({
            cmd: "extract.paging.rule.get",
            url: document.URL
        }, res => {
                let extractor = new Extractor(document.URL);
                extractor.setFuncs(res.funcs);

                let content = $(document.body).prop("outerHTML");
                let result = extractor.extract(content, res.rule.expression);

                _browser.sendMessage({ cmd: "extract.paging.excute", url: document.URL, content: content }, (response) => {
                    if (response && response.current > 0) {
                        $("ruiji-paging-info").text(response.current + "/" + response.total);
                        $("ruiji-countdown").text(response.interval);
                        $("ruiji-next").text(response.url);

                        window.setInterval(() => {
                            let num = parseInt($("ruiji-countdown").text());
                            if (num > 0) {
                                $("ruiji-countdown").text(--num);
                            }
                            else {
                                window.location.replace(response.url);
                            }
                        }, 1000);
                    }
                    else {
                        window.close();
                        _browser.openWorksheet();
                    }
                });
        });        

        $(document).off("click").on("click", "ruiji-paging-stop", () => {
            _browser.sendMessage({ cmd: "extract.paging.stop" }, response => {
                window.close();
            });
        });
    }

    extracChain() {
        let _this = this;

        $(document.body).drawRect({
            class: 'chain-extractor'
        });

        $(document.body).append("<ruiji-chain><ruiji-chain-info>wait:</ruiji-chain-info><ruiji-countdown>0</ruiji-countdown><ruiji-chain-stop>&otimes; Stop</ruiji-chain-stop><ruiji-next></ruiji-next></ruiji-chain>");

        let content = $(document.body).prop("outerHTML");
        _browser.sendMessage({ cmd: "extract.chain.excute", url: document.URL, content: content }, (response) => {
            if (response && response.url) {
                $("ruiji-countdown").text(response.interval);
                //$("ruiji-next").text(response.url);

                window.setInterval(() => {
                    let num = parseInt($("ruiji-countdown").text());
                    if (num > 0) {
                        $("ruiji-countdown").text(--num);
                    }
                    else {
                        window.location.replace(response.url);
                    }
                }, 1000);
            }
            else {
                window.close();
                _browser.openWorksheet();
            }
        });

        $(document).off("click").on("click", "ruiji-chain-stop", () => {
            _browser.sendMessage({ cmd: "extract.chain.stop" }, response => {
                window.close();
            });
        });
    }

    createPane() {
        let _this = this;

        _this.$frame = $("<iframe id='ruiji_inject_frame' style='right:0' />");
        $(document.body).append(_this.$frame);

        _this.$frame.ready(() => {
            _this.$frame.css({
                height: $(window).height() + "px"
            });

            let iWindow = (_this.$frame.get(0) as any).contentWindow;

            let $head = $(iWindow.document.head);

            let url = _browser.getExtensionURL();
            let links = `<link href="${url}css/content.css" rel="stylesheet" />
                         <link href="${url}css/codemirror.css" rel="stylesheet" />
                         <link href="${url}css/blackboard.css" rel="stylesheet" />`;

            if (_browser.getName() === "edge")
                links += `<link href="http://api.ruijihg.com/fonts/font-awesome.min.css" rel="stylesheet" />`;
            else
                links += `<link href="${url}css/font-awesome.min.css" rel="stylesheet" />`;

            $head.append(links);

            let $body = $(iWindow.document.body);
            $body.append("<div id='pane'></div>");

            new Vue({
                render: h => h(Pane),
                methods: {
                    resizePane() {
                        if (_this.$frame.length === 0)
                            return;

                        if (_this.$frame.attr("style").indexOf("bottom") !== -1)
                            return;

                        _this.$frame.css({
                            height: $(window).height() + "px"
                        });
                    },
                    dock(position: string) {
                        switch (position) {
                            case "left": {
                                _this.$frame.attr("style", "").css({
                                    width: "450px",
                                    top: '0',
                                    left: 0,
                                    right: 'auto',
                                    'border-right-color': '#999'
                                });

                                this.resizePane();
                                break;
                            }
                            case "right": {
                                _this.$frame.attr("style", "").css({
                                    width: "450px",
                                    top: '0',
                                    right: 0,
                                    left: 'auto',
                                    'border-left-color': '#999'
                                });

                                this.resizePane();
                                break;
                            }
                            case "bottom": {
                                _this.$frame.attr("style", "").css({
                                    width: "100%",
                                    bottom: 0,
                                    height: '250px',
                                    top: 'auto',
                                    left: 'auto',
                                    right: 'auto',
                                    'border-top': '1px solid #999'
                                });

                                break;
                            }
                            case "hide": {
                                Bus.$emit("clear");

                                $("ruiji-button").show();
                                _this.$frame.hide();

                                break;
                            }
                        }
                    }
                },
                created() {
                    let _this = this;

                    $(window).resize(() => {
                        _this.resizePane();
                    });

                    Bus.$on("dock", (position: any) => {
                        _this.dock(position);
                    });

                    Bus.$on("clear", () => {
                        RectViewer.Clear();
                        Block.Clear();
                        Outline.Clear();
                        Block.Clear();
                    });
                }
            }).$mount($body.find("#pane").get(0));

            $(iWindow.document.body).click((e) => {
                $(document.body).trigger("click");        
            });
        });
    }
}