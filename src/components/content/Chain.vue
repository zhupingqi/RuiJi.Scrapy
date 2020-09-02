<template>
    <div>
        <Loading v-if="loading===true"></Loading>
        <template v-else>
            <template v-if="message!==''">
                {{ message }}
            </template>
            <template>
                <b-table hover :items="chains" :fields="fields" class="ellipsis chains">
                    <template slot="HEAD_template" slot-scope="data">
                    </template>
                    <template v-slot:cell(template)="data">
                        <div class="name">
                            <h5>{{data.item.name}}</h5>
                            &nbsp;&nbsp;
                            <i class="fa fa-list-ul" :title="i18n('step')">
                                <em>{{ data.item.step }}</em>
                            </i>
                            <div>
                                <i class="fa fa-times" :title="i18n('remove')" @click="remove(data.item)"></i>
                            </div>
                        </div>
                        <div>
                            <b-button variant="success" size="sm" @click="extract(data.item)"><i class="fa fa-external-link"></i> {{i18n("extract")}}</b-button>
                            <b-button variant="success" size="sm" @click="edit(data.item)"><i class="fa fa-pencil"></i> {{i18n("edit")}}</b-button>
                        </div>
                    </template>
                </b-table>
                <b-pagination size="sm" :total-rows="total" v-model="currentPage" :per-page="10"></b-pagination>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser, TargetName } from '@/core/utils';
    import Loading from '@/components/Loading.vue';

    @Component({
        components: {
            Loading
        }
    })

    export default class Chain extends Vue {
        loading: boolean = true;
        fields: string[] = ["template"];
        chains: any[] = [];
        currentPage: number = 1;
        total: number = 0;
        message: string = "";

        loadPage() {
            var _this = this;
            this.loading = true;
            this.chains = [];

            _browser.sendMessage({ cmd: "chain.list", page: this.currentPage }, function (response) {
                if (response === undefined)
                    return;

                if (response.code !== 200) {
                    _this.message = _this.i18n("chain_error");
                    _this.loading = false;
                    return;
                }

                _this.total = response.data.total;

                var chains: any[] = response.data.chains || [];

                _this.chains.push(...chains);
                _this.loading = false;
            });
        }

        extract(chain: any) {
            var _this = this;
            _browser.sendMessage({
                cmd: "chain.get",
                chainId: chain.chainId
            }, res => {
                if (res && res.data) {
                    Bus.$emit("extractChain", JSON.parse(res.data));
                } else {
                    Bus.$emit("alert", _this.i18n("chain_error"));
                }
            });
        }

        created() {
            this.loadPage();
        }

        edit(chain: any) {
            Bus.$emit('editChain', chain);
        };

        remove(chain: any) {
            var _this = this;

            Bus.$emit("confirm", {
                text: chain.name + "<br/>" + _this.i18n("chain_remove_alert"),
                func: () => {
                    _browser.sendMessage({ cmd: "chain.remove", chainId: chain.chainId }, response => {
                        _this.chains = _this.chains.remove(chain);
                    });
                }
            });
        }
    }
</script>

<style>
    table.chains thead {
        display: none;
    }

    table.chains h5 {
        display: inline-block;
        font-family: arial;
        font-weight: bold;
    }

    table.chains h6 {
        display: inline-block;
        color: #999999;
        margin-left: 10px;
        font-family: arial;
    }

    table.chains ul {
        display: inline-block;
        padding: 0;
        margin: 5px 0;
    }

    table.chains li {
        display: inline-block;
        list-style: none;
        padding: 0 2px;
        margin: 3px;
        float: left;
    }

    table.chains ul.support li {
        color: #ccc;
        background-color: #e9ecef;
        border: 1px solid #dee2e6;
        border-radius: .25rem;
    }

        table.chains ul.support li.active {
            color: #fff;
            background-color: #17a2b8;
            border: 1px solid #17a2b8;
            border-radius: .25rem;
        }

    table.chains div.name div {
        float: right;
        height: 32px;
        line-height: 32px;
    }

        table.chains div.name div i {
            cursor: pointer;
        }

    table.chains ul.actions {
    }

    table.chains div.snapshot {
        right: 5px;
        position: absolute;
        margin-top: -95px;
    }

        table.chains div.snapshot .thumbnail {
            max-width: 120px;
            max-height: 80px;
            position: absolute;
            margin-left: -120px;
            margin-top: -5px;
        }

        table.chains div.snapshot img.snapshot {
            display: none;
            position: absolute;
            margin-left: -550px;
            width: 550px;
            margin-top: -5px;
        }

    table.chains i {
        font-size: 14px;
        padding: 0;
        margin: 0;
    }

        table.chains i em {
            font-size: 12px;
            padding: 0 0 0 3px;
            margin: 0;
            font-weight: normal;
            font-style: normal;
        }

    table.chains button {
        padding: 2px 5px !important;
        font-size: 12px !important;
    }

    table.chains div.name i {
        margin-left: 5px;
    }

    table.chains tr:first-child td {
        border-top: none !important;
    }
</style>