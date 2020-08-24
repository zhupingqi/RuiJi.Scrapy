<template>
    <div class="vis">
        <div>
            <h5>{{i18n('visual')}}</h5>
            <label style="color: #666666" class="float-right">{{i18n('vis_intro')}}</label>
        </div>
        <!--<div>
            <label class="title">{{i18n("direction")}}</label>
            <input type="radio" name="direction" value="2" v-model="opt.direction" />  <label>{{i18n("all")}}</label>
            <input type="radio" name="direction" value="0" v-model="opt.direction" />  <label>{{i18n("horizontal")}}</label>
            <input type="radio" name="direction" value="1" v-model="opt.direction" />  <label>{{i18n("vertical")}}</label>
        </div>-->
        <div>
            <label class="title">{{i18n("width")}}</label> <b-form-input v-model="opt.minWidth" size="sm" /> - <b-form-input v-model="opt.maxWidth" size="sm" />
            <label class="title">{{i18n("height")}}</label> <b-form-input v-model="opt.minHeight" size="sm" /> - <b-form-input v-model="opt.maxHeight" size="sm" />
        </div>
        <div>
            <label class="title">{{i18n("deep")}}</label>
            <b-form-input v-model="opt.minDeep" size="sm"></b-form-input> - <b-form-input v-model="opt.maxDeep" size="sm"></b-form-input>
            <label class="title">{{i18n("subBlock")}}</label>
            <b-form-input v-model="opt.minSub" size="sm" />
        </div>
        <div>
            <label class="title">{{i18n("option")}}</label>
            <template v-if="!free">
                <input type="checkbox" v-model="visOpt.rerange" :disabled="free" />
                <label>{{i18n("rerange")}}</label>
                <input type="checkbox" v-model="visOpt.removesame" :disabled="free" />
                <label>{{i18n("removesame")}}</label>
            </template>
            <template v-else>
                <input type="checkbox" disabled="disabled" />
                <label>{{i18n("rerange")}}</label>
                <input type="checkbox" disabled="disabled" />
                <label>{{i18n("removesame")}}</label>
            </template>
        </div>
        <div>
            <b-button variant="success" size="sm" @click="divide()">{{i18n("divide")}}</b-button>
            <b-button variant="success" size="sm" @click="clear">{{i18n("clear")}}</b-button>
            <b-button variant="success" size="sm" @click="copy" v-if="rows.length > 0">{{i18n("export")}}</b-button>
        </div>
        <div class="vis-result" v-if="showResult">
            <b-table striped hover :items="rows" class="ellipsis" style="table-layout:fixed"></b-table>
        </div>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser } from '@/core/utils';
    import { Block, DrawOptions } from "@/core/vis/block";
    import { Scraper, ScraperOption } from '@/core/vis/scraper';
    import { Direction } from '@/core/vis/enum';
    import { Outline } from '@/core/ruiji/outline';

    import { BTooltip } from 'bootstrap-vue';

    @Component
    export default class Vis extends Vue {
        opt: DrawOptions = new DrawOptions();
        visOpt: ScraperOption = new ScraperOption();
        outline: Outline | null = null;
        rows: any[][] = [];
        selector: any;
        free: boolean = false;
        showResult: boolean = false;

        @Watch("opt.direction")
        watchDirection(curVal: any, oldVal: any) {
            this.opt.direction = parseInt(curVal);
        }

        selectDivide() {
            Bus.$emit("clear");
            let _this = this;

            if (this.outline !== null) {
                this.outline.destory();
                this.outline = null;
            } else {
                this.outline = new Outline();

                this.outline.inspect({
                    change(selector: any) {
                        _this.selector = selector;
                    },
                    finish() {
                        _this.divide($(_this.selector).get(0));
                        if (_this.outline) {
                            _this.outline.destory();
                            _this.outline = null;
                        }
                    }
                });
            }
        }

        divide(dom?: HTMLElement) {
            Bus.$emit("clear");
            Block.maxDeep = this.opt.maxDeep;

            let el = $("body").get(0);
            if (dom)
                el = dom;

            let b = new Block(el);
            b.divide();
            Block.DrawSplitter(b, this.opt);
        };

        clear() {
            Bus.$emit("clear");
            Bus.$emit("rule.view.reset");

            this.rows = [];
            this.showResult = false;
        };

        showData(block: Block) {
            let scraper = new Scraper(block, this.visOpt);
            this.rows = scraper.getResult();
            this.showResult = true;
        };

        copy() {
            let iWindow = ($("#ruiji_inject_frame") as any).get(0).contentWindow;
            let $body = $(iWindow.document.body);

            $("div.vis-result table", $body).tableExport({
                type: "csv"
            });
        }

        created() {
            var _this = this;
            this.opt.direction = Direction.Unknown;

            _browser.sendMessage({ cmd: "rule.get", ruleId: 0 }, (response) => {
                _this.free = response.data.free;
            });

            $(document).off("click").on("click", "ruiji-num", function () {
                var block = $(this).data("block");
                _this.showData(block);
            });
        };
    }
</script>

<style>
    div.vis input[type="text"] {
        width: 50px;
        display:inline-block;
    }

    div.vis input[type="radio"] {
        padding-right: 15px;
    }

    div.vis label.title{
        width:75px;
        font-weight:600;
    }

    div.vis label.title:not(:first-child) {
        margin-left:20px;
    }

    div.vis {
        padding: 5px;
        margin: 5px;
        background-color: aliceblue;
        border-radius: 5px;
    }

    div.vis label {
        padding-left: 5px;
        padding-right:5px;
    }

    div.vis button {
        padding: 2px 5px !important;
        font-size: 12px !important;
    }

    div.vis h5 {
        display: inline-block;
        font-family: arial;
        font-weight:bold;
    }

    div.vis-result table{
        padding:0;
        margin:0;
    }

</style>