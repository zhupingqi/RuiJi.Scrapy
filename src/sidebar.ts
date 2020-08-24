//import Vue from 'vue';

//import BootstrapVue from 'bootstrap-vue';
//Vue.use(BootstrapVue);

//import Pane from '@/components/content/Pane.vue';

//import '@/core/i18n';
//import 'bootstrap/dist/css/bootstrap.min.css';

//new Vue({
//    render: h => h(Pane)
//}).$mount("#pane");

class Sidebar{
    constructor(public msg: string = "") { }

    alert() {
        alert(this.msg);
    }
}

const sidebar = new Sidebar();
sidebar.alert();