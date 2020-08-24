<template>
    <div>
        <template v-if="loading">
            <Loading></Loading>
        </template>
        <template v-else>
            <table class="table">
                <thead>
                    <tr>
                        <th>{{i18n("platfrom")}}</th>
                        <th>{{i18n("createDate")}}</th>
                        <th>{{i18n("orderNumber")}}</th>
                        <th>{{i18n("product")}}</th>
                        <th>{{i18n("month")}}</th>
                        <th>{{i18n("amount")}}</th>
                    </tr>
                    <tr></tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows">
                        <td>{{ row.platfrom }}</td>
                        <td>{{ row.cdate }}</td>
                        <td>{{ row.orderNumber }}</td>
                        <td>{{ i18n(getProductName(row.productId)) }}</td>
                        <td> {{ row.month }} </td>
                        <td> {{ row.price }} </td>
                    </tr>
                </tbody>
            </table>
            <b-pagination size="sm" :total-rows="total" v-model="currentPage" :per-page="10"></b-pagination>
        </template>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Loading from '@/components/Loading.vue';
    import { _browser } from '@/core/utils';
    import '@/shared/date.ts';

    @Component({
        components: {
            Loading
        }
    })

    export default class Order extends Vue {
        loading: boolean = true;
        currentPage: number = 1;
        rows: any[] = [];
        total: number = 0;
        products: any[] = [];

        loadPage() {
            this.loading = true;
            var _this = this;            

            _browser.sendMessage({ cmd: "user.order.get", page: this.currentPage }, response => {
                if (response.code === 200) {
                    _this.loading = false;
                    _this.rows = response.data.rows;
                    _this.rows.forEach(row => {
                        row.cdate = (new Date(row.cdate)).format('yyyy-MM-dd hh:mm');
                    });
                    _this.total = response.data.total;
                } else {
                    window.location.replace('login.html');
                }
            });
        }

        getProductName(productId: number) {
            return this.products.filter((p) => {
                return p.id === productId;
            }).first().name;
        }

        created() {
            var _this = this;

            _browser.sendMessage({ cmd: "product.all" }, response => {
                if (response.code === 200) {
                    _this.products = response.data.products;
                    this.loadPage();
                } else {
                    window.location.replace('login.html');
                }
            });            
        }
    }
</script>

<style scoped>
</style>