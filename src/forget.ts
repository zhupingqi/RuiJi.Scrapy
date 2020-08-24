import $ from 'jquery';
import Vue from 'vue';

import Forget from '@/components/Forget.vue';

import '@/core/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';

new Vue({
    render: h => h(Forget)
}).$mount("#forget");