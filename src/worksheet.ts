import $ from 'jquery';
import Vue from 'vue';

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue/dist/bootstrap-vue.min.css';
import '@/core/i18n'

import Sheet from '@/components/Sheet.vue';

new Vue({
    render: h => h(Sheet),    
}).$mount("#sheet");