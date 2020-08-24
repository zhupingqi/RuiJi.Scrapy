<template>
    <div>
        <div class="form-signin">
            <img src="img/icon128.png">
        </div>
        <form method="POST" action="" class="form-signin">
            <div class="form-group">
                <input name="email" type="email" class="form-control" v-bind:placeholder="i18n('login','email')" required="required" id="email" value="" v-model="email">
            </div>
            <div class="form-group">
                <input name="password" type="password" class="form-control" v-bind:placeholder="i18n('login','password')" required="required" id="password" v-model="password">
            </div>
            <p class="text-danger" v-if="message!==''"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span>{{ message }}</p>
            <button class="btn btn-lg btn-info btn-block"><i class="glyphicon glyphicon-log-in"></i> {{i18n("login")}}</button>
        </form>
        <p class="form-signin">
            <span class="float-left"><a class="" href="register.html">{{i18n("register")}}</a></span>
            <span class="float-right"><a class="" href="forget.html">{{i18n("forget")+'?'+i18n("click")}}</a></span>
        </p>
        <p class="form-signin">
            <a href="mailto:lixiang@ruijihg.com">
                {{i18n("official","email")}}:
                <i class="glyphicon glyphicon-envelope"></i>
                lixiang@ruijihg.com
            </a>
        </p>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import { _browser } from '@/core/utils';

    @Component
    export default class Login extends Vue {
        email: string = '';
        password: string = '';
        message: string = '';

        submit() {
            var _this = this;

            _browser.sendMessage({
                cmd: "user.login", data: {
                    email: _this.email,
                    password: _this.password
                }
            }, response => {
                if (response.code === 400) {
                    $("input[name='password']").focus();
                    _this.password = "";
                    _this.message = _this.i18n("login_faild");
                }

                if (response.code === 200) {
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
    body {
        padding-top: 40px;
        padding-bottom: 40px;
        background-color: #eee;
        font-size: 14px;
    }

    .form-signin {
        max-width: 330px;
        padding: 15px;
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
</style>