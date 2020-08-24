import $ from 'jquery';
import Vue from 'vue';

import Register from '@/components/Register.vue';

import '@/core/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';

new Vue({
    render: h => h(Register)
}).$mount("#register");