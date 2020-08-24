import Vue from 'vue';
import Login from '@/components/Login.vue';

import '@/core/i18n';
import 'bootstrap/dist/css/bootstrap.min.css';

new Vue({
    render: h => h(Login)
}).$mount("#login");