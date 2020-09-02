<template>
    <div>
        <Loading v-if="loading===true"></Loading>
        <template v-else>
            <template v-if="message!==''">
                {{ message }}
            </template>
            <template>
                <b-alert show variant="success" v-if="overdue && isMax" dismissible>
                    {{i18n("ovcerdue")}}
                </b-alert>
                <b-alert show variant="success" v-if="!overdue && isMax" dismissible>
                    {{$attrs.target == "star-rules" ? i18n("stars_max") : i18n("rules_max")}}
                </b-alert>
                <div v-if="private && !overdue" class="private-rules-tool d-flex">
                    <span>{{i18n("host")}}</span>
                    <b-form-checkbox v-model="privateFilter.current" :disabeld="free" value="1" unchecked-value="0">
                        {{i18n("current")}}
                    </b-form-checkbox>
                    <span>{{i18n("type")}}</span>
                    <b-form-radio-group v-model="privateFilter.hub" :disabeld="free" :options="hubOpts">
                    </b-form-radio-group>
                </div>
                <Vis v-if="!private"></Vis>
                <template v-if="rules.length === 0">                    
                    <b-alert variant="success" show style="margin:10px">{{i18n("empty")}}</b-alert>
                </template>
                <template v-else>
                    <b-table hover :items="rules" :fields="fields" class="ellipsis rules">
                        <template slot="HEAD_template" slot-scope="data">
                        </template>
                        <template v-slot:cell(template)="data">
                            <div class="name">
                                <h5>{{data.item.name}}</h5>
                                &nbsp;&nbsp;
                                <i class="fa fa-info-circle" :title="i18n('metas_count')">
                                    <em>{{ data.item.metas.length }}</em>
                                </i>
                                <i :class="data.item.myPraise? 'fa fa-thumbs-up':'fa fa-thumbs-o-up'" :title="i18n('praise')" style="cursor:pointer" @click="praise(data.item)" v-if="data.item.pub === true">
                                    <em>{{ data.item.praise }}</em>
                                </i>
                                <i :class="data.item.myStar? 'fa fa-star':'fa fa-star-o'" :title="i18n('star')" style="cursor:pointer" @click="star(data.item)" v-if="data.item.pub === true">
                                    <em>{{ data.item.star }}</em>
                                </i>
                                <i class="fa fa-random" :title="i18n('branch_count')" v-if="data.item.pub === true">
                                    <em>{{ data.item.branch }}</em>
                                </i>

                                <div v-if="private === true">
                                    <i :class="data.item.status === 2 ? 'fa fa-unlock': data.item.status === 1 ? 'fa fa-unlock-alt':'fa fa-lock'" :title="data.item.status === 2 ? i18n('status_public'): data.item.status === 1 ? i18n('status_inPublic'):i18n('status_private')" @click="share(data.item)"></i>
                                    <i class="fa fa-times" :title="i18n('remove')" @click="remove(data.item)"></i>
                                </div>
                                <div v-else>
                                    <i class="fa fa-user-secret" :title="i18n('report_title')" @click="report(data.item)"></i>
                                </div>
                            </div>
                            <div>
                                <ul class="metas">
                                    <li v-for="meta in data.item.metas">
                                        {{ meta }}
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <ul class="support">
                                    <li v-bind:class="{ active: data.item.jsFun }">JsFun</li>
                                    <li v-bind:class="{ active: data.item.paging }">Paging</li>
                                </ul>
                            </div>
                            <div>
                                <b-button variant="success" size="sm" @click="view(data.item)"><i class="fa fa-eye"></i> {{i18n("preview")}}</b-button>
                                <b-button variant="success" size="sm" @click="edit(data.item)"><i class="fa fa-pencil"></i> {{i18n("edit")}}</b-button>
                                <b-button-group style="position:absolute">
                                    <b-dropdown size="sm" variant="success" left split  @click="extract(data.item)" :html=" '<i class=\'fa fa-external-link\'></i> ' + i18n('extract')">
                                        <b-dropdown-item href="javascript:;" style="font-size:12px" @click="extractPage(data.item)" :disabled="free || !data.item.paging"><i class="fa fa-external-link"></i> {{i18n("extract_paging")}}</b-dropdown-item>
                                    </b-dropdown>
                                </b-button-group>
                            </div>
                        </template>
                    </b-table>
                    <b-pagination size="sm" :total-rows="total" v-if="showPaging === true" v-model="currentPage" :per-page="10"></b-pagination>
                </template>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser, TargetName } from '@/core/utils';
    import Loading from '@/components/Loading.vue';
    import { RectViewer } from '@/core/ruiji/viewer'
    import { Extractor } from "@/core/ruiji/extractor";
import { cwd } from 'process';

    @Component({
        components: {
            Loading
        }
    })

    export default class Rules extends Vue {
        loading: boolean = true;
        fields: string[] = ["template"];
        target: string = "";
        rules: any[] = [];
        private: boolean = false;
        showPaging: boolean = false;
        currentPage: number = 1;
        total: number = 0;
        message: string = "";
        static viewRuleId: number = 0;
        isMax: boolean = false;
        overdue: boolean = false;
        free: boolean = true;        
        firstLoad: boolean = true;
        privateFilter: any = {
            current: -1,
            hub: -1
        };
        hubOpts: any[] = [{ text: this.i18n("all"), value: -1 }, { text: this.i18n("hub"), value: 1 }, { text: this.i18n("article"), value: 0 }];

        @Watch('currentPage')
        pageChange(oldV: number, newV: number) {
            this.loadPage();
        }

        @Watch('privateFilter.current')
        domainCurrentChange(oldV: number, newV: number) {
            if (!this.firstLoad)
                this.loadPage();
        }

        @Watch('privateFilter.hub')
        hubChange(oldV: number, newV: number) {
            if (!this.firstLoad)
                this.loadPage();
        }

        praise(rule: any) {
            _browser.sendMessage({ cmd: "rule.praise", ruleId: rule.ruleId }, function (response) {
                rule.myPraise = !rule.myPraise;
                if (response.data) {
                    rule.praise = response.data.praise;
                    rule.star = response.data.star;
                }
            });
        };

        star(rule: any) {
            var _this = this;
            _browser.sendMessage({ cmd: "rule.star", ruleId: rule.ruleId }, function (response) {
                if (response.data.isMax) {
                    Bus.$emit("alert", _this.i18n("stars_max"));
                    return;
                }
                _this.isMax = response.data.isMax;
                _this.overdue = response.data.overdue;

                rule.myStar = !rule.myStar;
                if (response.data.ruleExtra) {
                    rule.praise = response.data.ruleExtra.praise;
                    rule.star = response.data.ruleExtra.star;
                }
            });
        };

        view(rule: any) {
            Bus.$emit("clear");

            if (rule.ruleId === Rules.viewRuleId) {
                Rules.viewRuleId = 0;
            } else {
                Rules.viewRuleId = rule.ruleId;
                RectViewer.DrawExp(rule.expression, rule.hub);
            }
        };

        extract(rule: any) {
            let content = $(document.body).prop("outerHTML");
            let _this = this;
            _browser.sendMessage({
                cmd: "utils.rule.get",
                userRule: rule.userRule,
                ruleId: rule.ruleId
            }, res => {
                    let funcs: any[] = res.data.rule.extended === "" ? [] : res.data.rule.extended;
                    let extractor: Extractor = new Extractor(document.URL);
                    extractor.setFuncs(funcs);
                    let result = extractor.extract(content, res.data.rule.expression);
                _browser.sendMessage({
                    cmd: "extract.update",
                    userRule: rule.userRule,
                    ruleId: rule.ruleId,
                    hub: rule.hub,
                    name: rule.name,
                    openSheet: true,
                    update: true,
                    result: result,
                    url: rule.hub ? undefined : document.URL
                }, response => {
                    _browser.openWorksheet();
                    if (_browser.getName() === "firefox") {
                        Bus.$emit("alert", _this.i18n("openWorksheet"));
                    }
                });
            });
        }

        extractPage(rule: any) {
            var _this = this;
            if (_this.free) {
                Bus.$emit("alert", _this.i18n("overdue_alert"));
                return;
            }

            Bus.$emit("autoPaging", rule);
        }

        edit(rule: any) {
            Bus.$emit('edit', rule);
        };

        share(rule: any) {
            let message = "";
            let status = 0;

            switch (rule.status) {
                case 0: {
                    message = this.i18n("msg_status_private");
                    status = 1;
                    break;
                }
                case 1: {
                    message = this.i18n("msg_status_inPublic");
                    status = 0;
                    break;
                }
                case 2: {
                    message = this.i18n("msg_status_public");
                    status = 0;
                    break;
                }
            }

            Bus.$emit("confirm", {
                text: rule.name + "<br/>" + message,
                func: () => {
                    _browser.sendMessage({ cmd: "user.rule.share", ruleId: rule.ruleId }, response => {
                        if (response.code === 200 && response.data)
                            rule.status = status;
                    });
                }
            });
        };

        report(rule: any) {
            var _this = this;
            Bus.$emit("confirm", {
                text: rule.name + "<br/>" + _this.i18n("report"),
                func: () => {
                    _browser.sendMessage({
                        cmd: "rule.report",
                        ruleId: rule.ruleId
                    }, response => {
                        Bus.$emit("alert", _this.i18n("report_success"));
                    });
                }
            });
        };

        remove(rule: any) {
            var _this = this;

            Bus.$emit("confirm", {
                text: rule.name + "<br/>" + _this.i18n("rule_remove_alert"),
                func: () => {
                    _browser.sendMessage({ cmd: "user.rule.remove", ruleId: rule.ruleId }, response => {
                        _this.rules = _this.rules.remove(rule);
                        _this.isMax = response.data.isMax;
                        _this.overdue = response.data.overdue;
                    });
                }
            });
        };

        getMetaAry(rule: any) {
            if (rule.hub) {
                var keys = Object.keys(rule.expression.tile.metas);
                if (keys.length > 0)
                    return keys;

                return [rule.expression.name];
            } else {
                var keys = Object.keys(rule.expression.metas);
                if (keys.length > 0)
                    return keys;

                return [rule.expression.name];
            }
        }

        loadPage() {
            var _this = this;
            this.loading = true;
            this.isMax = false;
            this.rules = [];

            var message: any = {
                cmd: "rule.match",
                url: document.URL,
                page: this.currentPage
            };

            if (this.$attrs.target === "star-rules") {
                _this.showPaging = true;

                message.cmd = "user.star";
                message.page = this.currentPage;
            }

            if (this.$attrs.target === "my-rules") {
                _this.private = true;
                _this.showPaging = true;

                message.cmd = "user.rule";
                message.page = this.currentPage;
                message.firstLoad = this.firstLoad;
                message.filter = {
                    current: parseInt(this.privateFilter.current) === 1,
                    hub: parseInt(this.privateFilter.hub)
                };
            }

            _browser.sendMessage(message, function (response) {
                if (response === undefined)
                    return;

                if (response.code !== 200) {
                    _this.message = response.msg;
                    _this.loading = false;
                    return;
                }

                if (_this.showPaging) {
                    _this.total = response.data.total;
                }

                var rules: any[] = response.data.rules || [];
                var exts: any[] = response.data.exts || [];
                var userExts: any[] = response.data.userExts || [];
                var shares: any[] = response.data.shares || [];

                rules.forEach(m => {
                    var ext = exts.filter(e => {
                        return e.ruleId === m.ruleId
                    }).first();

                    var my = userExts.filter(e => { return e.ruleId === m.ruleId }).first();

                    m.metas = _this.getMetaAry(m);
                    m.praise = ext == null ? 0 : ext.praise;
                    m.star = ext == null ? 0 : ext.star;
                    m.branch = ext == null ? 0 : ext.branch;

                    m.myPraise = my === null ? false : my.praise;
                    m.myStar = my === null ? false : my.star;

                    if (_this.$attrs.target === "my-rules") {
                        var share = shares.filter(e => {
                            return e.ruleId === m.ruleId
                        }).first();

                        m.status = share.status;
                        m.userRule = true;
                    }
                    else
                        m.userRule = false;
                });

                _this.rules.push(...rules);
                _this.loading = false;

                if (_this.$attrs.target !== "public-rules") {
                    _this.isMax = response.data.isMax;
                }

                if (_this.$attrs.target === "my-rules") {
                    if (_this.firstLoad) {
                        _this.privateFilter.current = response.data.filter.current ? 1 : 0;
                        _this.privateFilter.hub = response.data.filter.hub;
                    }

                    _this.$nextTick(() => {
                        _this.firstLoad = false;
                    });
                }

                _this.overdue = response.data.overdue;
                _this.free = response.data.free;
            });
        }

        created() {
            this.loadPage();

            Bus.$on("rule.view.reset", () => {
                Rules.viewRuleId = 0;
            });
        }
    }

</script>

<style>
    table.rules thead {
        display: none;
    }

    table.rules h5 {
        display: inline-block;
        font-family: arial;
        font-weight: bold;
    }

    table.rules h6 {
        display: inline-block;
        color: #999999;
        margin-left: 10px;
        font-family: arial;
    }

    table.rules ul.support, table.rules ul.metas {
        display: inline-block;
        padding: 0;
        margin: 5px 0;
    }

        table.rules ul.support li, table.rules ul.metas li {
            display: inline-block;
            list-style: none;
            padding: 0 2px;
            margin: 3px;
            float: left;
        }

    table.rules ul.metas li {
        color: #155724;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: .25rem;
    }

    table.rules ul.support li {
        color: #ccc;
        background-color: #e9ecef;
        border: 1px solid #dee2e6;
        border-radius: .25rem;
    }

        table.rules ul.support li.active {
            color: #fff;
            background-color: #17a2b8;
            border: 1px solid #17a2b8;
            border-radius: .25rem;
        }

    table.rules div.name div {
        float: right;
        height: 32px;
        line-height: 32px;
    }

        table.rules div.name div i {
            cursor: pointer;
        }

    table.rules ul.actions {
    }

    table.rules div.snapshot {
        right: 5px;
        position: absolute;
        margin-top: -95px;
    }

        table.rules div.snapshot .thumbnail {
            max-width: 120px;
            max-height: 80px;
            position: absolute;
            margin-left: -120px;
            margin-top: -5px;
        }

        table.rules div.snapshot img.snapshot {
            display: none;
            position: absolute;
            margin-left: -550px;
            width: 550px;
            margin-top: -5px;
        }

    table.rules i {
        font-size: 14px;
        padding: 0;
        margin: 0;
    }

        table.rules i em {
            font-size: 12px;
            padding: 0 0 0 3px;
            margin: 0;
            font-weight: normal;
            font-style: normal;
        }

    table.rules button {
        padding: 2px 5px !important;
        font-size: 12px !important;
    }

    table.rules div.name i {
        margin-left: 5px;
    }

    table.rules tr:first-child td {
        border-top: none !important;
    }

    .private-rules-tool {
        padding: 5px 15px;
    }

        .private-rules-tool > span {
            padding-right: 20px;
            font-weight: bold;
        }
</style>