<template>
    <div id="register" class="container">
        <div class="row">
            <div class="col-6">
                <div class="form-signin">
                    <img src="img/icon128.png">
                </div>
                <form method="POST" class="form-signin">
                    <div class="form-group">
                        <input name="email" type="email" class="form-control" required="required" v-bind:placeholder="i18n('email')" id="email" v-model="email">
                    </div>
                    <div class="form-group">
                        <div class="form-row justify-content-between" style="padding-left: 5px;padding-right: 5px;">
                            <input name="captcha" type="text" class="form-control col-5" required="required" v-bind:placeholder="i18n('captcha')" id="captcha" v-model="captcha">
                            <template v-if="countDown!==-1">
                                <button name="sendEmail" type="button" class="btn btn-info col-5" disabled="disabled">{{countDown+" "+i18n("seconds")}}</button>
                            </template>
                            <template v-else>
                                <button name="sendEmail" type="button" class="btn btn-info col-5" @click="sendEmail">{{i18n("sendEmail")}}</button>
                            </template>
                        </div>
                    </div>
                    <div class="form-group">
                        <input name="referee" type="text" class="form-control" v-bind:placeholder="i18n('proposer','code')" id="referee" v-model="referee">
                        <p class="alert alert-success" style="margin-top: .75rem;font-size: 12px;" v-html="i18n('proposer_warn')"></p>
                    </div>
                    <div class="form-group">
                        <input name="password" type="password" class="form-control" required="required" v-bind:placeholder="i18n('password')" id="password" v-model="password">
                    </div>
                    <div class="form-group">
                        <input name="password2" type="password" class="form-control" required="required" v-bind:placeholder="i18n('passwordAgain')" id="password2" v-model="password2">
                    </div>
                    <p class="text-danger" v-if="message!==''"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span>{{ message }}</p>
                    <button class="btn btn-info btn-block">{{i18n("commit")}}</button>
                </form>
                <p class="form-signin">
                    <span class="float-left"><a class="" href="login.html">{{i18n("login")}}</a></span>
                    <span class="float-right"><a class="" href="forget.html">{{i18n("forget")+'?'+i18n("click")}}</a></span>
                </p>
            </div>
            <div class="col-6">
                <div style="max-width: 330px;margin: 0 auto;margin-top: 127px;" class="alert alert-info">
                    <div>
                        <h4>{{i18n("reg_win")}}</h4>
                        <ul>
                            <li>{{i18n("reg_win2")}}</li>
                        </ul>
                    </div>
                    <h4>{{i18n('quota')}}</h4>
                    <ul>
                        <li>{{i18n("extractNum")}} &infin;</li>
                        <li>{{i18n("visual")}} &infin;</li>
                        <li>{{i18n("local_worksheet")}} &infin;</li>
                    </ul>
                    <h4>{{i18n('power')}}</h4>
                    <ul>
                        <li>{{i18n("rule_star")}} √</li>
                        <li>{{i18n("personal_rules")}} √</li>
                        <li>{{i18n("common_rules")}} √</li>
                        <li>{{i18n("export")}} √</li>
                        <!--<li>{{i18n("chain")}} √</li>-->
                    </ul>
                    <div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { _browser } from '@/core/utils';

    @Component
    export default class Register extends Vue {
        email: string = '';
        password: string = '';
        password2: string = '';
        captcha: string = '';
        referee: string = '';
        message: string = '';
        countDown: number = -1;

        sendEmail() {
            var _this = this;

            if (this.email === "") {
                this.message = _this.i18n("please", "input", "email");
                return false;
            }

            var times = 60;
            var timer = setInterval(function () {
                if (times >= 0) {
                    _this.countDown = times--;
                } else {
                    clearInterval(timer);
                    _this.countDown = -1;
                }
            }, 1000);

            _browser.sendMessage({ cmd: "sendMail", email: this.email }, (response) => {
                if (response.code !== 200) {
                    alert(response.msg);
                    clearInterval(timer);
                    _this.countDown = -1;
                }
            });
        }

        submit() {
            var _this = this;
            this.message = "";

            if (this.password !== this.password2) {
                $("input[name='password']").focus();
                this.password = this.password2 = "";
                this.message = _this.i18n("pwd_twice");

                return;
            }

            if (this.captcha.length === 0) {
                this.message = _this.i18n("please", "input", "captcha");

                return;
            }

            var d = {
                email: this.email,
                password: this.password
            };

            _browser.sendMessage({ cmd: "user.register", data: d, captcha: this.captcha, referee: this.referee }, (response) => {
                if (response.code === 401) {
                    _this.message = _this.i18n("captcha", "error");
                }
                if (response.code === 402) {
                    _this.message = _this.i18n("user_exists");
                }
                if (response.code === 200) {
                    alert(_this.i18n("register", "success"));
                    window.location.replace("settings.html");
                }
                if (response.code === -1) {
                    _this.message = _this.i18n("error_unknown");
                }
            });
        }

        mounted() {
            let _this = this;

            $('form').submit(() => {
                _this.submit();

                return false;
            });
        }
    }
</script>

<style>
    #register{
        max-width:700px;
    }

    body {
        padding-top: 40px;
        padding-bottom: 40px;
        background-color: #eee;
        font-size: 14px;
    }

    .form-signin {
        max-width: 330px;
        margin: 0 auto;
        text-align: center;
    }

        .form-signin .form-signin-heading,
        .form-signin .checkbox {
            margin-bottom: 10px;
        }

        .form-signin .checkbox {
            font-weight: normal;
        }

        .form-signin .form-control {
            position: relative;
            height: auto;
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
            padding: 10px;
            font-size: 16px;
        }

            .form-signin .form-control:focus {
                z-index: 2;
            }

    .input-120 {
        width: 120px;
        margin-bottom: 15px;
    }

    .form-signin input[type="email"] {
        margin-bottom: -1px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-signin input[type="password"] {
        margin-bottom: 10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    ul li{
        list-style:none;
    }
</style>