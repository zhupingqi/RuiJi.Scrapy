<template>
    <div>
        <Loading v-if="loading"></Loading>
        <template v-else>
            <div class="popup-header row">
                <div class="logo">
                    <img src="img/icon48.png" />
                    <div>{{ version }}-beta</div>
                    <div><a href="http://www.scraper.top" target="_blank">{{i18n("homepage")}}</a></div>
                    <div><a href="http://www.iotsys.net" target="_blank">{{i18n(by)}}</a></div>
                </div>
            </div>
            <template v-if="error === true">
                <p class="text-danger">Error</p>
                <p class="text-info">Please check your network.</p>
                <b-button type="button" class="btn btn-warning" @click="tryLogin">Try again</b-button>
            </template>
            <template v-else>
                <div class="popup-body">
                    <div v-if="login" class="container">
                        <div class="row" style="text-align:center">
                            <BtnSwitch v-bind:on="on" @change="change"></BtnSwitch>
                        </div>
                        <div class="row text-center panel-body">
                            <b-button variant="link" @click="openSheet" v-if="supportTarget"><i class="glyphicon glyphicon-list-alt"></i> {{ i18n("worksheet") }}</b-button>
                            <b-button variant="link" @click="openTab('worksheet.html')" v-else><i class="glyphicon glyphicon-list-alt"></i> {{ i18n("worksheet") }}</b-button>
                        </div>
                    </div>
                    <div v-else class="container">
                        <p class="alert alert-success" style="margin-top: .75rem;font-size: 12px;" v-html="i18n('popup_alert')"></p>
                    </div>
                </div>
                <template v-if="login">
                    <div class="popup-footer">
                        <div class="float-left">
                            <b-button href="settings.html" target="_ruiji_" variant="link" v-if="supportTarget"><i class="fa fa-cog"></i> {{ i18n("settings") }}</b-button>
                            <b-button @click="openTab('settings.html')" variant="link" v-else><i class="fa fa-cog"></i> {{ i18n("settings") }}</b-button>
                        </div>
                        <div class="float-right">
                            <b-button variant="link" @click="logout"><i class="fa fa-sign-out"></i> {{ i18n("logout") }}</b-button>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="popup-footer container-fluid">
                        <div class="float-left">
                            <b-button href="login.html" target="_ruiji_" variant="link" v-if="supportTarget"><i class="fa fa-sign-in"></i> {{ i18n("login") }}</b-button>
                            <b-button @click="openTab('login.html')" variant="link" v-else><i class="fa fa-sign-in"></i> {{ i18n("login") }}</b-button>
                        </div>
                        <div class="float-right">
                            <b-button href="register.html" target="_ruiji_" variant="link" v-if="supportTarget"><i class="fa fa-registered"></i> {{ i18n("register") }}</b-button>
                            <b-button @click="openTab('register.html')" variant="link" v-else><i class="fa fa-registered"></i> {{ i18n("register") }}</b-button>
                        </div>
                    </div>
                </template>
            </template>
        </template>
    </div>
</template>

<script lang="ts">
    /// <reference path="../core/i18n.d.ts" />

    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Loading from '@/components/Loading.vue';
    import BtnSwitch from '@/components/BtnSwitch.vue';
    import { _browser, TargetName } from '@/core/utils';

    @Component({
        components: {
            Loading,
            BtnSwitch
        }
    })

    export default class Pane extends Vue {
        loading: boolean = true;
        login: boolean = false;
        error: boolean = false;
        version: string = "1.0";
        supportTarget: boolean = _browser.supportTarget();
        on: boolean = false;

        change(on: boolean) {
            this.on = on;

            localStorage.setItem('inject', this.on ? "true" : "flase");

            if (this.on)
                _browser.setBadge('on', 'green');
            else
                _browser.setBadge('off', 'red');
        }

        logout() {
            var _this = this;

            this.loading = true;
            _browser.sendMessage({ cmd: "user.logout" }, response => {
                _this.loading = false;
                _this.login = false;
            });
        }

        checkLogin() {
            this.loading = true;
            this.error = false;
            this.login = false;

            var _this = this;
            _browser.sendMessage({ cmd: "user.check" }, response => {
                if (response.error) {
                    _this.login = false;
                    _this.error = true;
                }
                else {
                    if (response.code === 200) {
                        _this.login = true;
                    } else {
                        _this.error = false;
                        _this.login = false;
                    }
                }
                _this.loading = false;
            });
        }

        openTab(url: string) {
            _browser.openTab(url);
        }

        openSheet() {
            _browser.openWorksheet();
        }

        created() {
            this.version = _browser.getVersion();

            this.checkLogin();

            this.on = localStorage.getItem('inject') === "true";            
        }
    };
</script>

<style>
    body {
        background: #fff;
        width: 250px;
        padding:1em 0;
        font-size: 14px !important;
        overflow:hidden;
    }

    button:focus{
        box-shadow:none!important;
    }

    div {
        display: block !important;
    }

    .popup-body {
        height: 80px;
    }

        .popup-body label {
            margin: 10px;
        }

    .popup-header > .logo {
        text-align: center;
    }

    .popup-footer{
        height:38px;
    }
</style>