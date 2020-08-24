<template>
    <div id="settings">
        <Loading v-if="loading"></Loading>
        <template v-else>
            <b-navbar toggleable="md" type="dark" variant="dark">
                <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
                <b-navbar-brand href="settings.html"><img height="30" src="img/icon48.png"><a href="http://www.iotsys.net" target="_blank" style="color:white">极创意想倾心出品</a></b-navbar-brand>
                <b-collapse is-nav id="nav_collapse">
                    <b-navbar-nav class="ml-auto">
                        <b-navbar-nav>
                            <b-nav-item href="https://github.com/zhupingqi/RuiJi.Scraper" target="_blank"> <i class="fa fa-github"></i> https://github.com/zhupingqi/RuiJi.Scraper</b-nav-item>
                        </b-navbar-nav>
                        <b-navbar-nav>
                            <b-nav-item href="#" v-if="vipdate === null || vipdate === ''" @click="showTab(3)"><i class="fa fa-user"></i> {{i18n("openVip")}}</b-nav-item>
                            <b-nav-item href="#" v-else>VIP <i class="glyphicon glyphicon-time"></i> {{vipdate}}</b-nav-item>
                        </b-navbar-nav>
                        <b-navbar-nav right>
                            <b-nav-item href="#"><i class="glyphicon glyphicon-user"></i> {{user}}</b-nav-item>
                            <b-nav-item href="#" @click="logout"><i class="fa fa-sign-in"></i> {{i18n("signout")}}</b-nav-item>
                        </b-navbar-nav>
                    </b-navbar-nav>
                </b-collapse>
            </b-navbar>
            <b-card no-body>
                <b-tabs pills card vertical lazy="true" v-model="tabIndex">
                    <b-tab active>
                        <template slot="title">
                            <i class="fa fa-address-card"></i> {{i18n('console')}}
                        </template>
                        <Console></Console>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <i class="fa fa-gift"></i> {{i18n('order')}}
                        </template>
                        <Order></Order>
                    </b-tab>
                    <!--<b-tab>
                        <template slot="title">
                            <i class="fa fa-handshake-o"></i> {{i18n('requests')}}
                        </template>
                        <Request></Request>
                    </b-tab>-->
                    <b-tab>
                        <template slot="title">
                            <i class="fa fa-shopping-cart"></i> {{i18n('member')}}
                        </template>
                        <Upgrade></Upgrade>
                    </b-tab>
                    <b-tab>
                        <template slot="title">
                            <i class="fa fa-play-circle"></i> {{i18n('course')}}
                        </template>
                        <Course></Course>
                    </b-tab>
                </b-tabs>
            </b-card>
        </template>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { _browser } from '@/core/utils';
    import Loading from '@/components/Loading.vue';
    import Console from '@/components/settings/Console.vue';
    import Request from '@/components/settings/Request.vue';
    import Upgrade from '@/components/settings/Upgrade.vue';
    import Order from '@/components/settings/Order.vue';
    import Course from '@/components/settings/Course.vue';
    import '@/shared/date.ts';

    @Component({
        components: {
            Loading,
            Console,
            Request,
            Upgrade,
            Order,
            Course
        }
    })

    export default class Home extends Vue {
        loading: boolean = true;
        vipdate: string | null = null;
        user: string = "";
        tabIndex: number = 0;

        showTab(tab: number) {
            this.tabIndex = tab;
        }

        logout() {
            _browser.sendMessage({ cmd: "user.logout" }, response => {
                window.location.replace('login.html');
            });
        }

        created() {
            var _this = this;

            _browser.sendMessage({ cmd: "user.info" }, response => {
                if (response.code === 200) {
                    _this.loading = false;
                    _this.user = response.data.name;
                    if (response.data.product.status) {
                        if (new Date() < new Date(response.data.product.status.expired)) {
                            _this.vipdate = (new Date(response.data.product.status.expired)).format('yyyy-MM-dd hh:mm');
                        }
                    }
                } else {
                    window.location.replace('login.html');
                }
            });
        }
    }
</script>

<style>
    body {
        font-family: 'Microsoft Yahei', '微软雅黑', '宋体', \5b8b\4f53, Tahoma, Arial, Helvetica, STHeiti;
        margin: 0;
    }

    #settings {
        min-width: 1550px !important;
    }
</style>