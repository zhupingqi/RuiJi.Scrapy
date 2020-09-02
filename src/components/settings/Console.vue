<template>
    <div class="container-fluid row">
        <div class="col-md-9">
            <Loading v-if="loading"></Loading>
            <template v-else>
                <div class="row">
                    <div class="col-md-6 product-stat">
                        <div class="console-title">{{i18n("statistics")}}</div>
                        <div class="d-flex justify-content-between">
                            <div class="alert alert-success">
                                <div>
                                    <num>{{ sheetStat.extracts }}</num>
                                </div>
                                <p>{{i18n("extractTotal")}}</p>
                            </div>
                            <div class="alert alert-success">
                                <div>
                                    <num>{{ sheetStat.outputs }}</num>
                                </div>
                                <p>{{i18n("exportionTotal")}}</p>
                            </div>
                            <div class="alert alert-success">
                                <div>
                                    <num>{{i18n("rules")}} {{ sheetStat.rules }}</num>
                                    <num>{{i18n("records")}} {{ sheetStat.articles }}</num>
                                </div>
                                <p><b-button variant="link" @click="openSheet">{{i18n("worksheet")}}</b-button></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 info-list">
                        <div class="console-title">{{i18n("account")}}</div>
                        <div class="alert alert-success d-flex justify-content-between">
                            {{i18n("type")}}
                            <num>{{ i18n(stat.product.name) }}</num>
                            <num>&nbsp;</num>
                            <num>&nbsp;</num>
                        </div>
                        <div class="alert alert-success d-flex justify-content-between">
                            {{i18n("starsQuota")}}
                            <num :title="i18n('quota')">{{ stat.product.stars }}</num>
                            <num :title="i18n('used')">-{{ stat.current.stars }}</num>
                            <num :title="i18n('balance')">{{ stat.product.stars + stat.reward.stars - stat.current.stars }}</num>
                        </div>
                        <div class="alert alert-success d-flex justify-content-between">
                            {{i18n("rulesQuota")}}
                            <num :title="i18n('quota')">{{ stat.product.rules }}</num>
                            <num :title="i18n('used')">-{{ stat.current.rules }}</num>
                            <num :title="i18n('balance')">{{ stat.product.rules + stat.reward.rules - stat.current.rules }}</num>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="container-fluid" style="padding:15px">
                        <div class="console-title">{{i18n("myPower")}}</div>
                        <div class="d-flex justify-content-between current-right">
                            <span class="alert alert-success btn-sm">{{i18n("extractNum")}} &infin;</span>
                            <span class="alert alert-success btn-sm">{{i18n("visual")}} &infin;</span>
                            <span class="alert alert-success btn-sm">{{i18n("local_worksheet")}} &infin;</span>
                            <span class="alert alert-success btn-sm">{{i18n("common_rules")}} √</span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('shared_rules') + (stat.product.productId==1 ? ' &Chi;' : ' √')"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('visual_regroup') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('sharing_rules') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('webPage_download') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('img_download') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('autoPaging') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('excute_func') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                            <span :class="stat.product.productId===1?'alert alert-danger btn-sm':'alert alert-success btn-sm'" v-html="i18n('chain') + (stat.product.productId==1 ? ' &Chi;' : ' √' )"></span>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="container-fluid" style="padding:15px">
                        <div class="console-title">业务能力</div>
                        <div class="container-fluid current-right">
                            <b-list-group horizontal>
                                <b-list-group-item>软件开发</b-list-group-item>
                                <b-list-group-item>小程序开发</b-list-group-item>
                                <b-list-group-item>网络爬虫</b-list-group-item>
                                <b-list-group-item>全息显示</b-list-group-item>
                            </b-list-group>
                        </div>
                        <div class="console-title current-right">联系我们</div>
                        <div class="d-flex current-right"> QQ:271800249 <a href="mailto:lixiang@iotsys.net" style="margin-left:30px">lixiang@iotsys.net</a></div>
                        <div class="d-flex"> QQ:416803633 <a href="mailto:zpq@iotsys.net" style="margin-left:30px">zpq@iotsys.net</a></div>
                    </div>
                </div>
            </template>
        </div>
        <div class="col-md-3">
            <i class="glyphicon glyphicon-list-alt"></i> {{i18n("latestNews")}}
            <News></News>
            <div>
                <div>打赏</div>
                <img src="img/reward.jpg" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { _browser, TargetName } from '@/core/utils';
    import Loading from '@/components/Loading.vue';
    import SocialShare from '@/components/settings/SocialShare.vue';
    import News from '@/components/settings/News.vue';
    import { db } from '@/core/ruiji/db';

    @Component({
        components: {
            Loading,
            SocialShare,
            News
        }
    })

    export default class Console extends Vue {
        loading: boolean = true;
        stat: any = {
            quota: {
                total: 0,
                used: 0,
                max: 0,
                promote: 0
            },
            code: "",
            product: {
                name: 'unkonw'
            },
            reward: {
                rules: 0,
                stars: 0
            },
            recommend: 0,
            requests: [0, 0]
        };
        sheetStat: any = {
            articles: 0,
            rules: 0,
            extracts: 0,
            outputs: 0
        }

        openSheet() {
            _browser.openWorksheet();
        }

        created() {
            var _this = this;

            _browser.sendMessage({ cmd: "user.stat" }, response => {
                if (response.code === 200) {
                    _this.loading = false;
                    _this.stat = Object.assign(_this.stat, response.data);
                } else {
                    window.location.replace('login.html');
                }
            });

            db.article.count().then(c => {
                this.sheetStat.articles = c;
            });

            db.rule.getAll().then(rules => {
                this.sheetStat.rules = rules.length;
            });

            db.extracts.count().then(c => {
                this.sheetStat.extracts = c;
            });

            db.outputs.count().then(c => {
                this.sheetStat.outputs = c;
            });
        }
    }
</script>

<style>
    .product-stat > div > div {
        float: left;
        margin: 10px 20px 20px 0;
        width: 100%;
        height: 150px;
        min-width: 150px;
    }

    .product-stat div num {
        display: block;
        text-align: center;
    }

    .product-stat div > num {
        font-size: 28px;
        height: 100px;
        line-height: 100px;
    }

        .product-stat div > num:first-child:not(:last-child), .product-stat div > num:last-child:not(:first-child) {
            font-size: 18px;
            height: 50px;
            line-height: 50px;
        }

    .product-stat p {
        text-align: center;
        font-size: 16px;
        border: none !important;
    }

    .console-title {
        font-size: 16px;
    }

    .info-list > div:not(:first-child) {
        margin: 10px 0px;
        padding: 10px;
    }

        .info-list > div:not(:first-child) num {
            display: inline-block;
            float: right;
        }

    .promotion-intro {
        margin: 10px 0px;
    }

    .promotion {
        margin: 10px;
    }

    .current-right {
        padding-top: 10px;
    }

        .current-right > span {
            padding: 3px 5px;
        }
</style>