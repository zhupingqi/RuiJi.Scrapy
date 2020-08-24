<template>
    <div class="row">
        <div class="col-2 card-out fadeIn animated" v-for="product in products">
            <b-card :class="userProduct.productId===product.id && userProduct.productId != 1 ? getProductClass(product.id):''">
                <h2>{{i18n(product.name)}}</h2>
                <h3><sup>{{currency}} {{product.price}}</sup></h3>
                <p>{{i18n("perMonth")}}</p>
                <ul>
                    <li><b>{{i18n("extractNum")}} &infin;</b></li>
                    <li><b>{{i18n("visual")}} &infin;</b></li>
                    <li><b>{{i18n("local_worksheet")}} &infin;</b></li>
                </ul>
                <ul>
                    <li>{{i18n("rule_star")}} {{product.stars}}</li>
                    <li>{{i18n("personal_rules")}} {{product.rules}}</li>
                    <!--<li>{{i18n("online_worksheet")}} {{product.onlineSheets}}</li>-->
                    <!--<li>{{i18n("maxWorkOrder")}} {{product.workOrder}}</li>-->
                </ul>
                <ul>
                    <li>{{i18n("common","rules")}} √</li>
                    <li>{{i18n("export")}} √</li>
                    <li>{{i18n("webPage_download")}} √</li>
                    <li>{{i18n("img_download")}} √</li>
                    <li v-html="i18n('shared_rules') + (product.id==1 ? ' &Chi;' : ' √')"></li>
                    <li v-html="i18n('visual_regroup') + (product.id==1 ? ' &Chi;' : ' √' )"></li>
                    <li v-html="i18n('sharing_rules') + (product.id==1 ? ' &Chi;' : ' √' )"></li>
                    <!--<li v-html="i18n('webPage_screen_capture') + (product.id==1 ? ' &Chi;' : ' √' )"></li>-->
                    <li v-html="i18n('autoPaging') + (product.id==1 ? ' &Chi;' : ' √' )"></li>
                    <li v-html="i18n('excute_func') + (product.id==1 ? ' &Chi;' : ' √' )"></li>
                </ul>
                <b-button @click="show(product)" v-if="product.id > 1" :disabled="userProduct.productId > 1 && new Date() < new Date(userProduct.expired)">{{i18n("upgrade")}}</b-button>
                <b-button v-else disabled>{{i18n("free")}}</b-button>
                <b-badge pill variant="danger">
                    {{i18n(productState)}}
                </b-badge>
            </b-card>
        </div>
        <b-modal :title="i18n('modal_title_upgrade')" lazy="true" @ok="pay" @cancel="showModel=false" :ok-title="i18n('ok')" :cancel-title="i18n('cancel')" v-model="showModel">
            <div class="container">
                <div class="row">
                    <div class="col-4">{{i18n("upgrade_type")}}</div>
                    <div class="col-8">{{ i18n(product.name) }}</div>
                </div>
                <div class="row">
                    <div class="col-4">{{i18n("upgrade_duration")}}</div>
                    <div class="col-8">
                        <b-form-radio-group v-model="seletedMonth" :options="monthOpts" stacked></b-form-radio-group>
                    </div>
                </div>
                <div class="row">
                    <div class="col-4">&nbsp;</div>
                    <div class="col-4">{{i18n("total")}}:{{ product.price * seletedMonth - getDiscount() }}</div>
                    <div class="col-4">{{i18n("discount")}}:{{ getDiscount() }}</div>
                </div>
                <div class="row">
                    <div class="col-4">{{i18n("paymethod")}}</div>
                    <div class="col-8">
                        <b-form-radio-group v-model="payMethod" :options="payOpts" stacked></b-form-radio-group>
                    </div>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script lang="ts">
    /// <reference path="../../@types/paypal-checkout.d.ts" />

    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Loading from '@/components/Loading.vue';
    import { _browser } from '@/core/utils';
    import { baseUrl } from '../../core/common';

    @Component
    export default class Upgrade extends Vue {
        loading: boolean = true;
        products: any[] = [];
        userProduct: any = null;
        showModel: boolean = false;
        discount: number[] = [];
        seletedMonth: number = 1;
        currency: string = "$";
        product: any = {
            name: "",
            price: 0
        };
        monthOpts: any[] = [{
            text: "1" + this.i18n("months"), value: 1
        }, {
            text: "3" + this.i18n("months"), value: 3
        }, {
            text: "6" + this.i18n("months"), value: 6
        }, {
            text: "12" + this.i18n("months"), value: 12
        }];
        payMethod: number = 1;
        payOpts: any[] = [];
        productState: string = "";

        show(product: any) {
            this.seletedMonth = 1;
            this.product = product;

            this.showModel = true;
        }

        getProductClass(pid: number) {
            let c: string = "text-white";
            if (new Date() > new Date(this.userProduct.expired)) {
                c += " bg-warning";
                this.productState = "overdue_badge";
            } else {
                c += " bg-success";
                this.productState = "current";
            }
            return c;
        }

        getDiscount() {
            let dis = 0;

            switch (this.seletedMonth) {
                case 1: {
                    dis = this.discount[0];
                    break;
                }
                case 3: {
                    dis = this.discount[1];
                    break;
                }
                case 6: {
                    dis = this.discount[2];
                    break;
                }
                case 12: {
                    dis = this.discount[3];
                    break;
                }
            }

            return (this.product.price * this.seletedMonth * (1 - dis)).toFixed(2);
        }

        getPayUrl() {
            let u = localStorage.getItem("app_key");

            return baseUrl + "pay?u=" + u + "&p=" + this.product.id + "&m=" + this.seletedMonth + "&g=" + this.payMethod;
        }

        pay() {
            let url = this.getPayUrl();

            _browser.openTab(url);
        }

        created() {
            this.loading = true;
            var _this = this;

            _browser.sendMessage({ cmd: "product.all" }, response => {
                if (response.code === 200) {
                    _this.loading = false;
                    _this.products = response.data.products;
                    _this.userProduct = response.data.userProduct;
                    _this.currency = response.data.currency;
                    _this.discount = [1, 0.98, 0.95, 0.9];

                    if (_this.currency === "$") {
                        _this.payOpts = [{
                            text: "Paypal", value: 2
                        }];
                        _this.payMethod = 2;
                    } else {
                        _this.payOpts = [{
                            text: this.i18n("alipay"), value: 1, checked: true
                        }];
                        _this.payMethod = 1;
                    }

                }
            });
        }
    }
</script>

<style>

    .card-out {
        box-sizing: border-box;
        text-align: center;
    }

    .card {
        background-color: #fff;
        background-clip: border-box;
        border: 1px solid rgba(0,0,0,.125);
        border-radius: .25rem;
        padding: 10px;
        margin: 10px;
    }

        .card p {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 20px;
        }

        .card ul {
            padding: 0;
        }

        .card li {
            list-style: none;
        }

    .free-engines img {
        width: 120px;
        float: left;
        max-height: 40px;
        margin: 10px;
    }

    span.badge-danger {
        display: none;
    }

    div.bg-success span.badge-danger, div.bg-warning span.badge-danger {
        display: inline-block;
        position: absolute;
        top: -10px;
        left: -10px;
        font-size: 14px;
        font-family: arial;
    }
</style>