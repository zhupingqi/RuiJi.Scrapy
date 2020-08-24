<template>
    <div id="pane">
        <template v-if="connectError===true">
            <b-alert show variant="danger">
                Connection lost, you need to refresh the current page
            </b-alert>
        </template>
        <template v-else>
            <Tool></Tool>
            <template v-if="editRule === true">
                <RuleEditor ref="rule-editor"></RuleEditor>
                <FunctionEditor ref="editFunc"></FunctionEditor>
            </template>
            <template v-else-if="editChain === true">
                <ChainEditor ref="chain-editor"></ChainEditor>
            </template>
            <template v-else>
                <b-tabs lazy="true" v-model="tabIndex">
                    <b-tab :title="i18n('public')">
                        <Vis></Vis>
                        <Rules target="public-rules"></Rules>
                    </b-tab>
                    <b-tab :title="i18n('rule_star')">
                        <Rules target="star-rules"></Rules>
                    </b-tab>
                    <b-tab :title="i18n('rule_my')">
                        <Rules target="my-rules"></Rules>
                    </b-tab>
                    <b-tab :title="i18n('chain')">
                        <Chain></Chain>
                    </b-tab>
                </b-tabs>
                <b-modal ref="paging" title="Paging Extract" @ok="extract" size="sm" id="extractPaing" static>
                    <table>
                        <tr>
                            <td colspan="2">{{i18n("rules")}} {{ autoPaging.rule.name }}</td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <b-form-checkbox v-model="autoPaging.deep" value="true" unchecked-value="false">
                                    Deep
                                </b-form-checkbox>
                            </td>
                        </tr>
                        <tr>
                            <td>{{i18n("interval")}}</td>
                            <td><b-form-input v-model="autoPaging.interval" size="sm"></b-form-input></td>
                        </tr>
                        <tr>
                            <td>{{i18n("extract_pages")}}</td>
                            <td><b-form-input v-model="autoPaging.pages" size="sm"></b-form-input></td>
                        </tr>
                    </table>
                </b-modal>
            </template>
            <b-modal ref="alert" :title="i18n('message')" size="sm" id="alert_message" :ok-title="i18n('cancel')" ok-only static>
                <table>
                    <tr>
                        <td v-html="alertMessage"></td>
                    </tr>
                </table>
            </b-modal>
            <b-modal ref="confirm" :title="i18n('confirm')" size="sm" lazy="true" id="confirm_message" @ok="confirmFunc" :ok-title="i18n('ok')" :cancel-title="i18n('cancel')" static>
                <table>
                    <tr>
                        <td v-html="confirmMessage"></td>
                    </tr>
                </table>
            </b-modal>
        </template>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser, TargetName } from '@/core/utils';
    import Tool from '@/components/content/Tool.vue';
    import Vis from '@/components/content/Vis.vue';
    import Chain from '@/components/content/Chain.vue';
    import Rules from '@/components/content/Rules.vue';
    import RuleEditor from '@/components/content/RuleEditor.vue';
    import ChainEditor from '@/components/content/ChainEditor.vue';
    import FunctionEditor from '@/components/content/FunctionEditor.vue';

    @Component({
        components: {
            Tool,
            Vis,
            Rules,
            RuleEditor,
            FunctionEditor,
            Chain,
            ChainEditor
        }
    })

    export default class Pane extends Vue {
        editRule: boolean = false;
        editChain: boolean = false;
        tabIndex: number = 0;
        connectError: boolean = false;
        alertMessage: string = "";
        confirmMessage: string = "";
        confirmFunc: Function = () => { };
        autoPaging: any = {
            deep: false,
            rule: {},
            interval: 10,
            pages: 5,
            url: ''
        };

        @Watch("tabIndex")
        tabIndexChange(curVal: number, oldVal: number) {
            Bus.$emit("clear");
        }

        @Watch("editRule")
        editChange(curVal: boolean, oldVal: boolean) {
            if (!curVal)
                Bus.$emit("clear");
        }

        extract() {
            var _this = this;
            _browser.sendMessage({ cmd: "extract.paging", paging: this.autoPaging }, response => {
                _browser.openWindow(top.document.URL, TargetName.PagingWindow);
                if (_browser.getName() === "firefox") {
                    Bus.$emit("alert", _this.i18n("openWorksheet"));
                }
            });
        }

        created() {
            var _this = this;

            Bus.$on("edit", (model: any) => {
                if (_this.tabIndex == 3) {
                    _this.editChain = true;

                    this.$nextTick(function () {
                        var editor: any = this.$refs['chain-editor'];
                        editor.edit(model);
                    });
                } else {
                    _this.editRule = true;

                    this.$nextTick(function () {
                        var editor: any = this.$refs['rule-editor'];
                        editor.edit(model);
                    });
                }
            });

            Bus.$on("cancelEdit", (rule: any) => {
                _this.editRule = false;
                _this.editChain = false;
                Bus.$emit("clear");
            });

            Bus.$on("autoPaging", (rule: any) => {
                _this.autoPaging.rule = rule;
                _this.autoPaging.url = window.top.document.URL;

                let m = _this.$refs['paging'] as any;
                m.setScrollbar = function () { };
                m.show();
            });

            Bus.$on("extractChain", (chain: any) => {
                _browser.sendMessage({ cmd: "extract.chain.start", chain: chain }, response => {
                    _browser.openWindow(chain.data.url, TargetName.ChainWindow);
                    if (_browser.getName() === "firefox") {
                        Bus.$emit("alert", _this.i18n("openWorksheet"));
                    }
                });
            });

            Bus.$on("connectError", (rule: any) => {
                _this.connectError = true;
            });

            Bus.$on("alert", (message: any) => {
                _this.alertMessage = message;

                let m = _this.$refs['alert'] as any;
                m.setScrollbar = function () { };
                m.show();
            });

            Bus.$on("confirm", (message: any) => {
                _this.confirmMessage = message.text;
                _this.confirmFunc = message.func;

                let m = _this.$refs['confirm'] as any;
                m.setScrollbar = function () { };
                m.show();
            });

            Bus.$on("editFunction", (message: any) => {
               let editor = this.$refs['editFunc'] as any;
                editor.show(message);
            });

            Bus.$on("editChain", (chain: any) => {
                _this.editChain = true;

                this.$nextTick(function () {
                    var editor: any = this.$refs['chain-editor'];
                    editor.edit(chain);
                });
            });

            //Bus.$on("chainExtract", (chain: any) => {
            //    _this.autoPaging.rule = chain.rule;
            //    _this.autoPaging.url = window.top.document.URL;

            //    let m = _this.$refs.paging as any;
            //    m.setScrollbar = function () { };
            //    m.show();
            //});
        }
    }
</script>

<style>
    .pagination {
        padding-left: 10px !important;
    }

    body {
        width: 100%;
        overflow-wrap: break-word;
        overflow-x: hidden;
        font-size: 14px !important;
    }

    .btn-sm {
        font-size: 14px;
        padding: 2px 5px;
        margin: 2px;
    }

    .tab-pane label {
        display: inline-block;
        padding-right: 5px;
    }

    table, table th, table td {
        font-size: 12px !important;
    }

        table > td {
            line-height: 41px;
        }

        table input {
            display: inline-block !important;
        }

    .multi-input input {
        width: 80px;
    }

    table.ellipsis th {
        width: 10px;
    }

    table.ellipsis td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
        width: 10px;
    }
</style>