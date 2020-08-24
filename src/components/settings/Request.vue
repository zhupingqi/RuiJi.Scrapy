<template>
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th>{{i18n("address")}}</th>
                    <th>{{i18n("createDate")}}</th>
                    <th>{{i18n("state")}}</th>
                    <th>{{i18n("operation")}}</th>
                </tr>
                <tr></tr>
            </thead>
            <tbody>
                <tr v-for="row in rows">
                    <td>{{ row.address }}</td>
                    <td>{{ row.cdate }}</td>
                    <td>{{ status(row.status) }}</td>
                    <td> {{i18n("view")}} <label @click="cancel(row.id)">{{i18n("cancel")}}</label> </td>
                </tr>
            </tbody>
        </table>
        <b-pagination size="sm" :total-rows="total" v-model="currentPage" :per-page="10"></b-pagination>
        <div class="row">
            <div class="col-lg-9">
                <form method="POST" @submit.prevent="submit">
                    <table width="100%">
                        <tr>
                            <td style="width:100px">
                                <span class="input-group-addon">{{i18n("address")}}</span>
                            </td>
                            <td>
                                <input name="address" type="text" class="form-control" required="required" :placeholder="i18n('input_address')" id="email" v-model="form.address">
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <span class="input-group-addon">{{i18n("desc")}}</span>
                            </td>
                            <td>
                                <textarea name="description" rows="10" class="form-control" required="required" :placeholder="i18n('input_desc')" id="password" v-model="form.description" />
                            </td>
                        </tr>
                        <tr>
                            <td>&nbsp;</td>
                            <td>
                                <p class="text-danger" v-if="message"><span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span>{{ message }}</p>
                                <button name="submit" type="submit" class="btn btn-lg btn-primary btn-block" id="submit">{{i18n("commit")}}</button>
                            </td>
                        </tr>
                    </table>
                </form>
            </div>
            <div class="col-lg-3 alert alert-success">
                <i class="glyphicon glyphicon-warning-sign"></i> {{i18n("input_desc")}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
    import Loading from '@/components/Loading.vue';
    import { _browser } from '@/core/utils';

    @Component
    export default class Request extends Vue {
        loading: boolean = true;
        rows: any[] = [];
        currentPage: number = 1;
        total: number = 0;
        message: string = '';
        form: any = {
            address: '',
            description: ''
        };

        @Watch('currentPage')
        pageChange(oldV: number, newV: number) {
            this.loadPage();
        }

        status(s: number): string {
            switch (s) {
                case 0: {
                    return this.i18n("unprocess");
                    break;
                }
                case 1: {
                    return this.i18n("processing");
                    break;
                }
                case 2: {
                    return this.i18n("url_error");
                    break;
                }
                case 3: {
                    return this.i18n("processed");
                    break;
                }
            }

            return "unkown";
        }

        loadPage() {
            this.loading = true;
            var _this = this;

            _browser.sendMessage({ cmd: "user.request", page: this.currentPage }, response => {
                if (response.code === 200) {
                    _this.loading = false;
                    _this.rows = response.data.rows;
                    _this.total = response.data.total;
                } else {
                    window.location.replace('login.html');
                }
            });
        }

        cancel(id: number) {
            this.loading = true;
            var _this = this;

            if (confirm(_this.i18n("confrim_delete"))) {
                _browser.sendMessage({ cmd: "user.request.cancel", requestId: id }, response => {
                    if (response.code === 200) {
                        _this.loading = false;
                        _this.currentPage = 1;
                        _this.loadPage();
                    } else {
                        window.location.replace('login.html');
                    }
                });
            }
        }

        submit() {
            this.message = "";
            var _this = this;

            _browser.sendMessage({ cmd: "user.request.update", data: this.form }, response => {
                if (response.code == 200) {
                    _this.message = _this.i18n("success_commit");
                    _this.form.address = _this.form.description = "";
                    _this.loadPage();
                }
                else {
                    _this.message = _this.i18n("unknown_error");
                }
            });
        }

        created() {
            this.loadPage();
        }
    }
</script>

<style>

</style>