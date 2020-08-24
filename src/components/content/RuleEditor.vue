<template>
    <div>
        <div id="edit_tool">
            <a href="javascript:;" @click="save" :title="i18n('save')"><i class="fa fa-save"></i></a>
            <a href="javascript:;" @click="cancelEdit" :title="i18n('cancel')"><i class="fa fa-ban"></i></a>
        </div>
        <b-alert variant="success" v-if="free" dismissible>
            {{i18n("rule_editor_free")}}
        </b-alert>
        <table class="rule" v-if="rule!=null">
            <tr>
                <td>{{i18n("rule_name")}}</td>
                <td>
                    <b-form-input v-model="rule.name" size="sm" required></b-form-input>
                </td>
            </tr>
            <tr>
                <td>{{i18n("wildcard")}}</td>
                <td>
                    <b-form-input v-model="rule.wildcard" size="sm" required></b-form-input>
                </td>
            </tr>
            <tr>
                <td>{{i18n("host")}}</td>
                <td>
                    <b-form-input v-model="rule.host" size="sm" required></b-form-input>
                </td>
            </tr>
            <tr>
                <td>{{i18n("option")}}</td>
                <td>
                    <input type="radio" name="hub" value="true" v-model="rule.hub" :disabled="(rule.branchId > 0 || rule.ruleId > 0)" /> {{i18n("hub")}}
                    <input type="radio" name="hub" value="false" v-model="rule.hub" :disabled="(rule.branchId > 0 || rule.ruleId > 0)" /> {{i18n("article")}}
                </td>
            </tr>
            <tr>
                <td valign="top">{{i18n("block")}}</td>
                <td>
                    <SelectorEditor v-bind:sc="rule.expression" target="block"></SelectorEditor>
                </td>
            </tr>
            <tr v-if="rule.hub === true">
                <td valign="top">{{i18n("tile")}}</td>
                <td>
                    <SelectorEditor v-bind:sc="rule.expression.tile" target="tile"></SelectorEditor>
                </td>
            </tr>
            <template v-if="rule.hub === true">
                <tr>
                    <td valign="top">
                        {{i18n("metas")}}
                        <div><a href="javascript:;" @click="addMeta" :title="i18n('meta_add')"><i class="fa fa-plus"></i></a></div>
                    </td>
                    <td>
                        <SelectorEditor v-for="meta in rule.expression.tile.metas" v-bind:sc="meta" target="tile.meta"></SelectorEditor>
                    </td>
                </tr>
                <tr>
                    <td valign="top">{{i18n("paging")}}</td>
                    <td>
                        <SelectorEditor v-bind:sc="rule.expression.tile.paging.tile" target="tile.paging"></SelectorEditor>
                    </td>
                </tr>
            </template>
            <template v-else>
                <tr>
                    <td valign="top">
                        {{i18n("metas")}}
                        <div><a href="javascript:;" @click="addMeta" title="i18n('meta_add')"><i class="fa fa-plus"></i></a></div>
                    </td>
                    <td>
                        <SelectorEditor v-for="meta in rule.expression.metas" v-bind:sc="meta" target="meta"></SelectorEditor>
                    </td>
                </tr>
                <tr>
                    <td valign="top">{{i18n("paging")}}</td>
                    <td>
                        <SelectorEditor v-bind:sc="rule.expression.paging.tile" target="paging"></SelectorEditor>
                    </td>
                </tr>
            </template>
            <tr>
                <td></td>
                <td>
                    <a href="javascript:;" @click="clear" :title="i18n('clear')" class="float-left"><i class="fa fa-check"></i> {{i18n("clear")}}</a>
                    <a href="javascript:;" @click="convert" :title="i18n('convert2ruiji')" class="float-right"><i class="fa fa-eye"></i> {{i18n("convert2ruiji")}}</a>
                </td>
            </tr>
            <tr>
                <td></td>
                <td>
                    <b-form-textarea style="font-size:12px" v-model="expression" v-if="showExp === true" :rows="3" :max-rows="9">
                    </b-form-textarea>
                </td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser } from '@/core/utils';
    import { RectViewer } from '@/core/ruiji/viewer';
    import { RuiJiParser } from '@/core/ruiji/parser';
    import { Processor } from '@/core/ruiji/processor';
    import { JSONPath } from 'jsonpath-plus';
    import SelectorEditor from '@/components/content/SelectorEditor.vue';

    @Component({
        components: {
            SelectorEditor
        }
    })

    export default class RuleEditor extends Vue {
        rule: any = null;
        inspect = null;
        expression: string = "";
        showExp: boolean = false;
        paging: any = "";
        funcs: any[] = [];
        funSelector: any;
        overdue: boolean = false;
        free: boolean = true;

        @Watch("rule.hub")
        watchHub(curVal: any, oldVal: any) {
            if (this.rule)
                this.rule.hub = (curVal === "false" || curVal === false) ? false : true;
        }

        edit(rule: any) {
            Bus.$emit("clear");

            var _this = this;
            if (rule === undefined) {
                _browser.sendMessage({ cmd: "rule.get", ruleId: 0 }, (response) => {
                    if (response.data.isMax) {
                        _this.cancelEdit();
                        Bus.$emit("alert", this.i18n("rules_max"));
                    }
                    _this.overdue = response.data.overdue;
                    _this.free = response.data.free;
                });

                this.rule = {
                    name: 'name',
                    host: '',
                    wildcard: '',
                    hub: true,
                    ruleId: 0,
                    branchId: 0,
                    pub: false,
                    expression: {
                        blocks: [],
                        metas: {
                            name: {
                                selectors: [{
                                    attr: null,
                                    ctype: 1,
                                    remove: false,
                                    selector: "",
                                    type: 0
                                }],
                                type: 18
                            }
                        },
                        selectors: [{
                            attr: null,
                            ctype: 1,
                            remove: false,
                            selector: "",
                            type: 0
                        }],
                        tile: {
                            selectors: [{
                                attr: null,
                                ctype: 1,
                                remove: false,
                                selector: "",
                                type: 0
                            }],
                            metas: {
                                name: {
                                    selectors: [{
                                        attr: null,
                                        ctype: 1,
                                        remove: false,
                                        selector: "",
                                        type: 0
                                    }],
                                    type: 18
                                }
                            },
                            type: 18,
                            paging: JSON.parse(JSON.stringify(this.paging))
                        },
                        type: 18,
                        paging: JSON.parse(JSON.stringify(this.paging))
                    }
                };

                this.funcs = [];
            } else {
                let exp = JSON.parse(JSON.stringify(rule.expression));
                JSONPath({
                    json: exp, path: "$..index",resultType:"parent", callback: (o) => {
                        o.index = o.index.join(' ');
                    }
                });

                this.rule = {
                    ruleId: rule.ruleId,
                    branchId: rule.branchId,
                    name: rule.name,
                    host: rule.host,
                    wildcard: rule.wildcard,
                    hub: rule.hub,
                    pub: rule.pub,
                    userRule: rule.userRule,
                    expression: exp
                };

                if (rule.userRule) {
                    this.rule.ruleId = rule.ruleId;

                    _browser.sendMessage({ cmd: "user.rule.get", ruleId: this.rule.ruleId }, (response) => {
                        if (response.data.rule.extended) {
                            this.funcs = response.data.rule.extended;
                        }
                        _this.free = response.data.free;
                    });

                } else {
                    _browser.sendMessage({ cmd: "rule.get", ruleId: this.rule.ruleId }, (response) => {
                        if (response.data.isMax) {
                            _this.cancelEdit();
                            Bus.$emit("alert", this.i18n("rules_max"));
                        }
                        _this.overdue = response.data.overdue;
                        _this.free = response.data.free;
                        if (response.data.rule.extended) {
                            this.funcs = response.data.rule.extended;
                        }
                    });

                    this.rule.ruleId = 0;
                    this.rule.branchId = rule.ruleId;
                }

                if (this.rule.hub && !this.rule.expression.tile.paging) {
                    this.rule.expression.tile.paging = JSON.parse(JSON.stringify(this.paging));
                    this.rule.expression.tile.paging.name = "_paging";
                }

                if (!this.rule.hub && !this.rule.expression.paging) {
                    this.rule.expression.paging = JSON.parse(JSON.stringify(this.paging));
                    this.rule.expression.paging.name = "_paging";
                }
            }
        }

        addMeta() {
            var metas = {};

            if (this.rule.hub) {
                metas = this.rule.expression.tile.metas;
            } else {
                metas = this.rule.expression.metas;
            }

            var metaName = "name_" + new Date().getTime();
            var meta: any = {};
            meta[metaName] = {
                name: metaName,
                selectors: [{
                    attr: null,
                    ctype: 1,
                    remove: false,
                    selector: "",
                    type: 0
                }],
                type: 0
            };

            if (this.rule.hub) {
                this.rule.expression.tile.metas = Object.assign(meta, metas);
            } else {
                this.rule.expression.metas = Object.assign(meta, metas);
            }
        }

        editFunc(s: any) {
            this.funSelector = s;
            let code = "";

            if (s.name && s.name.length > 0) {
                let c = this.funcs.filter((f) => {
                    return f.name === s.name;
                }).first();

                if (c !== null) {
                    code = c.code;
                }
            }

            Bus.$emit("editFunction", {
                code: code,
                $ref: this
            });
        }

        editFuncOk(code: string) {
            if (code !== "") {
                if (!this.funSelector.name || this.funSelector.name === "") {
                    this.funSelector.name = "func_" + new Date().getTime();
                    this.funcs.push({
                        name: this.funSelector.name,
                        code: code
                    });
                } else {
                    var f = this.funcs.filter((f) => {
                        return f.name === this.funSelector.name;
                    }).first();

                    if (f !== null)
                        f.code = code;
                }
            } else {
                if (this.funSelector.name !== "") {
                    this.funcs = this.funcs.filter((f) => {
                        return f.name !== this.funSelector.name;
                    });
                }
            }
        }

        clear() {
            var metas: any = {};
            if (this.rule.hub) {
                metas = this.rule.expression.tile.metas;

            } else {
                metas = this.rule.expression.metas;
            }

            metas = metas || {};
            metas = JSON.parse(JSON.stringify(metas));
            var keys = Object.keys(metas);
            if (keys.length > 1) {
                keys.forEach((key, index) => {
                    if (Object.keys(metas).length > 1 && (metas[key] === undefined || metas[key].name === undefined || metas[key].name.trim() === '')) {
                        delete metas[key];
                        return;
                    }

                    if (metas[key].name != key) {
                        metas[metas[key].name] = metas[key];
                        delete metas[key];
                    }
                });
            }

            if (this.rule.hub) {
                this.rule.expression.tile.metas = metas;
            } else {
                this.rule.expression.metas = metas;
            }
        }

        convert() {
            this.showExp = !this.showExp;
            if (!this.showExp)
                return;

            this.clear();

            var p = new RuiJiParser();
            var exp = JSON.parse(JSON.stringify(this.rule.expression));
            if (this.rule.hub) {
                exp.paging = {};
                exp.metas = [];
            } else {
                exp.tile.paging = {};
                exp.tile.metas = [];
            }

            this.expression = p.convert(exp);
        }

        cancelEdit() {
            this.expression = "";
            this.rule = null;

            RectViewer.Clear();

            Bus.$emit("cancelEdit");
            Bus.$emit("clear");
        }

        save() {
            var _this = this;
            this.clear();

            if (this.rule.host === "" || this.rule.wildcard === "") {
                Bus.$emit("alert", "require host and wildcard");
                return;
            }

            let paging;

            if (this.rule.hub) {
                this.rule.expression.metas = null;
                paging = this.rule.expression.tile.paging;
            } else {
                this.rule.expression.tile = null;
                paging = this.rule.expression.paging;
            }

            let fs = this.findFunc(this.rule.expression);

            this.funcs = this.funcs.filter(f => {
                return fs.contains(f.name);
            });

            if (this.funcs.length > 0) {
                this.rule.extended = this.funcs;
                this.rule.jsFun = true;
            }
            else {
                this.rule.extended = "";
                this.rule.jsFun = false;
            }

            if (paging && paging.tile.selectors.length > 0 && paging.tile.selectors[0].selector.trim() !== "")
                this.rule.paging = true;
            else {
                this.rule.paging = false;
            }                

            let rule = JSON.parse(JSON.stringify(this.rule));
            JSONPath({
                json: rule.expression, path: "$..index", resultType: "parent", callback: (o) => {
                    if (typeof (o.index) === "string") {
                        o.index = o.index.split(' ').map(Number);
                    }
                }
            });

            _browser.sendMessage({ cmd: "user.rule.save", rule: rule }, function (response) {
                if (response.data.isMax && !response.data.isAdd) {
                    Bus.$emit("alert", _this.i18n("rules_max"));
                }

                _this.cancelEdit();
            });
        }

        findFunc(obj: any): string[] {
            if (obj && typeof (obj) === "object") {
                let fs: string[] = [];

                let keys = Object.keys(obj);
                keys.forEach(key => {
                    fs = fs.concat(this.findFunc(obj[key]));
                });

                if (obj.name !== "" && obj.type === 11 && obj.remove !== undefined)
                    fs = fs.concat(obj.name);

                return fs;
            }

            return [];
        }

        created() {
            this.paging = {
                name: '_paging',
                type: 18,
                tile: {
                    name: '_paging',
                    type: 18,
                    selectors: [{
                        attr: null,
                        ctype: 1,
                        remove: false,
                        selector: "",
                        type: 0
                    }]
                }
            };

            let _this = this;

            $(document).off("mouseenter").on("mouseenter", "ruiji-rect-viewer", function () {
                let $this = $(this);
                let opt = $this.data("opt");

                if (opt && opt.dom && opt.selectors) {
                    let p = new Processor(_this.funcs);
                    let html = $(opt.dom).prop("outerHTML");
                    let selectors = JSON.parse(JSON.stringify(opt.selectors));
                    selectors[0].selector = ">:first-child";

                    let result = p.process(html, selectors);

                    $this.attr("title", result.getContent());
                }
            });

            Bus.$on("removeFunc", (name: string) => {
                let fun = _this.funcs.filter((f) => { return f.name === name }).first();
                _this.funcs = _this.funcs.remove(fun);
            });
        }
    }
</script>

<style>
    table.selector {
        width: 100%;
        border: 1px solid #c7c7c7;
        margin: 2px;
    }

        table.selector select {
            font-size: 12px;
            margin: 0;
            padding: 0 5px;
            height: 31px;
            max-width: 55px !important;
            background-position-x: 43px;
        }

        table.selector tr > td:first-child {
            width: 50px;
        }

    table.rule {
        width: 100%;
        margin: 0 auto
    }

        table.rule td {
            padding: 2px 5px;
            line-height: 35px;
        }

        table.rule tr > td:first-child {
            width: 50px;
        }

            table.rule tr > td:first-child div {
                text-align: center;
            }

    #edit_tool {
        height: 21px;
        line-height: 21px;
        font-size: 16px;
        margin-top: 10px;
    }

    i.fa-eye.active {
        color: red;
    }

    i.fa-location-arrow.active {
        color: red;
    }

    div.input-group-text {
        padding: 5px;
        background-color: white;
    }

    table.selector .input-group button {
        margin: 0;
        background-color: #e9ecef;
        color: #495057;
        border-color: #ced4da;
    }
</style>