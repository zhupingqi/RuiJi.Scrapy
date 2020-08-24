<template>
    <div>
        <Loading v-if="loading===true"></Loading>
        <template v-else>
            <div id="edit_tool">
                <a href="javascript:;" @click="test" :title="测试"><i class="fa fa-external-link"></i></a>
                <a href="javascript:;" @click="save" :title="i18n('save')"><i class="fa fa-save"></i></a>
                <a href="javascript:;" @click="cancelEdit" :title="i18n('cancel')"><i class="fa fa-ban"></i></a>
            </div>
            <template v-if="currentFlowItem">
                <div class="chain-edit-item-model">
                    <table class="chainEdit">
                        <template v-if="currentFlowItem.data.type === 0">
                            <tr>
                                <td>
                                    {{i18n("rule_name")}}
                                </td>
                                <td>
                                    <b-form-input v-model="currentFlowItem.data.name" size="sm"></b-form-input>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    开始地址
                                </td>
                                <td>
                                    <b-input-group size="sm">
                                        <b-form-input v-model="currentFlowItem.data.url"></b-form-input>
                                        <b-input-group-append>
                                            <b-button variant="info" @click="testChainItem()">匹配规则</b-button>
                                        </b-input-group-append>
                                    </b-input-group>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {{i18n("interval_s")}}
                                </td>
                                <td>
                                    <b-form-input v-model="currentFlowItem.data.interval" size="sm"></b-form-input>
                                </td>
                            </tr>
                        </template>
                        <template v-if="currentFlowItem.data.type === 3">
                            <tr>
                                <td>规则类型</td>
                                <td>
                                    <template v-if="currentFlowItem.data.hub">
                                        列表页面
                                    </template>
                                    <template v-else>
                                        文章页面
                                    </template>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    保存结果
                                </td>
                                <td>
                                    <b-form-checkbox v-model="currentFlowItem.data.save"></b-form-checkbox>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    抓取分页
                                </td>
                                <td>
                                    <b-form-checkbox v-model="currentFlowItem.data.autoPaging"></b-form-checkbox>
                                </td>
                            </tr>
                            <template v-if="currentFlowItem.data.autoPaging === true">
                                <tr>
                                    <td>
                                        最多抓取
                                    </td>
                                    <td>
                                        <b-input-group size="sm" append="页">
                                            <b-form-input v-model="currentFlowItem.data.maxPages"></b-form-input>
                                        </b-input-group>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {{i18n("interval_s")}}
                                    </td>
                                    <td>
                                        <b-form-input v-model="currentFlowItem.data.interval" size="sm"></b-form-input>
                                    </td>
                                </tr>
                            </template>
                            <tr v-if="currentFlowItem.data.hub === true">
                                <td>
                                    停止
                                </td>
                                <td>
                                    <b-form-checkbox v-model="currentFlowItem.data.stop"></b-form-checkbox>
                                </td>
                            </tr>
                            <tr v-if="currentFlowItem.data.stop === false">
                                <td>
                                    目标地址
                                </td>
                                <td>
                                    <b-input-group size="sm">
                                        <b-form-input v-model="currentFlowItem.data.url"></b-form-input>
                                        <b-input-group-append>
                                            <b-button variant="info" @click="testChainItem()">匹配规则</b-button>
                                        </b-input-group-append>
                                    </b-input-group>
                                </td>
                            </tr>
                        </template>
                        <tr>
                            <td colspan="2">
                                <b-button variant="success" size="sm" @click="close()"><i class="fa fa-pencil"></i> 关闭</b-button>
                                <b-button variant="success" size="sm" @click="removeChainItem()" v-if="currentFlowItem.data.type !== 0"><i class="fa fa-pencil"></i> 删除</b-button>
                            </td>
                        </tr>
                    </table>
                </div>
            </template>
            <div id="chain_flow_wrapper"></div>
        </template>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser } from '@/core/utils';
    import Loading from '@/components/Loading.vue';
    import { ChainFlow, ChainType, ChainFlowItem } from '@/core/ruiji/chainFlow';
    import { Wildcard } from '../../core/ruiji/wildcard';

    @Component({
        components: {
            Loading
        }
    })
    //@Component
    export default class ChainEditor extends Vue {
        message: string = "";
        loading: boolean = true;
        rules: any[] = [];
        currentFlowItem: ChainFlowItem | null = null;
        chainFlow!: ChainFlow;
        step: number = 0;
        chainId: number = 0;

        save() {
            var _this = this;
            this.step = 0;
            let d = this.getFlowTreeData(this.chainFlow.root);

            var data: any = {
                chainId: _this.chainId,
                name: d.data.name,
                step: _this.step - 1,
                rule: JSON.stringify(d),
                interval: d.data.interval  //待添加
            };
            _browser.sendMessage({
                cmd: "chain.save",
                chain: data
            }, res => {
                if (res.code == 200) {
                    _this.cancelEdit();
                } else {
                    Bus.$emit("alert", "保存出错，请稍后重试。");
                }
            });
        }

        test() {
            let tree = this.getFlowTreeData(this.chainFlow.root);
            Bus.$emit("extractChain", tree);
        }

        getFlowTreeData(item: ChainFlowItem): any {
            this.step++;
            var children: any[] = [];

            item.children.forEach(m => {
                children.push(this.getFlowTreeData(m));
            });

            return {
                data: item.data,
                child: children,
                text: item.text,
                position: item.getPosition()
            };
        }

        close() {
            this.currentFlowItem = null;
        }

        cancelEdit() {
            Bus.$emit("cancelEdit");
        }

        editRule(node: any) {
            this.currentFlowItem = node.model;
        }

        buildChain(item: ChainFlowItem, d: any) {
            item.data = d.data;
            item.setText(d.text);
            item.setPosition(d.position.x, d.position.y);

            if (d.child) {
                d.child.forEach((m: any) => {
                    let i = item.addItem(ChainType.TASK, m.name);
                    this.buildChain(i, m);
                });
            }
        }

        edit(chain: any | null = null) {
            if (chain) {
                this.chainId = chain.chainId;
                _browser.sendMessage({
                    cmd: "chain.get",
                    chainId: chain.chainId
                }, res => {
                    if (res && res.data) {
                        this.buildChain(this.chainFlow.root, JSON.parse(res.data));
                        this.chainFlow.root.updateLine(true);
                    }
                });
            } else {
                this.chainFlow.root.data = {
                    url: "",
                    name: "",
                    type: ChainType.START,
                    interval: 10,
                    stop: false
                };
            }
        }

        testChainItem() {
            var _this = this;

            if (this.currentFlowItem) {
                if ($.trim(this.currentFlowItem.data.url) === "")
                    return;

                var message: any = {
                    cmd: "user.rule",
                    url: this.currentFlowItem.data.url,
                    page: 1,
                    filter: {
                        current: true,
                        hub: -1
                    }
                };

                _browser.sendMessage(message, function (response) {
                    if (response === undefined)
                        return;

                    if (response.code !== 200) {
                        _this.message = response.msg;
                        _this.loading = false;
                        return;
                    }

                    _this.currentFlowItem?.remove(true);

                    var rules: any[] = response.data.rules || [];

                    rules.forEach(m => {
                        if (!Wildcard.Match(m.wildcard, _this.currentFlowItem?.data.url))
                            return;

                        var item = _this.currentFlowItem?.addItem(ChainType.TASK, m.name);
                        if (item) {
                            item.autoPosition();
                            item.data = {
                                url: "",
                                hub: m.hub,
                                name: m.name,
                                autoPaging: true,
                                interval: 10,
                                save: true,
                                stop: true,
                                maxPages: m.hub ? 10 : 0,
                                type: ChainType.TASK,
                                ruleId: m.ruleId
                            };
                        }
                    });
                });
            }
        }

        removeChainItem() {
            this.currentFlowItem?.remove();
            this.currentFlowItem = null;
        }

        created() {
            this.loading = false;
        }

        mounted() {
            var _this = this;
            let newwin = ($("#ruiji_inject_frame").get(0) as any).contentWindow;
            this.chainFlow = new ChainFlow("chain_flow_wrapper", newwin);

            this.chainFlow.itemClick((item: ChainFlowItem) => {
                _this.currentFlowItem = item;
            });

            this.chainFlow.paperClick((e: JQuery.ClickEvent) => {
                //_this.saveChainItem(true);
            });
        }
    }
</script>

<style lang="less">
    @import "../../../node_modules/vue-jstree/src/less/style.less";

    table.chainEdit {
        width: 100%;
        margin: 0 auto
    }

        table.chainEdit td {
            padding: 2px 5px;
            line-height: 35px;
        }

        table.chainEdit tr > td:first-child {
            width: 80px;
        }

            table.chainEdit tr > td:first-child div {
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

    .input-group button {
        margin: 0;
        background-color: #e9ecef;
        color: #495057;
        border-color: #ced4da;
    }

    .chain-edit-item-model {
        border: 1px solid #e3e3e3;
        padding: 5px;
        background-color: white;
    }

    path {
        stroke-width: 2px;
    }
</style>
