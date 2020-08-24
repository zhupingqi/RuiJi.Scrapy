import Vue from 'vue';

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import Popup from '@/components/Popup.vue';

import '@/core/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';

new Vue({
    render: h => h(Popup)
}).$mount("#popup");