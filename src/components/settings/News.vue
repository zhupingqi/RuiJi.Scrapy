<template>
    <div>
        <Loading v-if="loading"></Loading>
        <template v-else>
            <table>
                <tr v-for="row in rows">
                    <td><b-button variant="link" @click="show(row)">{{row.title}}</b-button></td>
                    <td width="88" :title="row.lDate">{{row.cDate}}</td>
                </tr>
            </table>
            <b-modal :title="content.title" v-model="showModal">
                <table>
                    <tr>
                        <td v-html="content.content"></td>
                    </tr>
                </table>
                <div slot="modal-footer" class="w-100">
                    <span class="float-left">{{content.cDate}}</span>
                    <b-button size="sm" class="float-right" variant="primary" @click="showModal=false">
                        {{i18n("close")}}
                    </b-button>
                </div>
            </b-modal>
        </template>
    </div>
</template>

<script lang="ts">
    /// <reference path="../../@types/date.d.ts" />

    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Loading from '@/components/Loading.vue';
    import { _browser } from '@/core/utils';
    import '@/shared/date.ts';

    @Component({
        components: {
            Loading
        }
    })

    export default class News extends Vue {
        loading: boolean = true;
        rows: any[] = [];
        content: any = {
            title: "",
            content: "",
            cDate: null
        };
        showModal: boolean = false;

        created() {
            var _this = this;
            let lan: string = _browser.getUILanguage();
            _browser.sendMessage({ cmd: "news", local: lan }, response => {
                if (response.code === 200) {
                    _this.rows = response.data.rows;
                    _this.rows.forEach(row => {                        
                        row.lDate = (new Date(row.cDate)).format('yyyy-MM-dd');
                        row.cDate = (new Date(row.cDate)).format('MM-dd');
                    });
                    _this.loading = false;
                }
            });
        }

        show(news: any) {
            var _this = this;
            _browser.sendMessage({ cmd: "news.content", id: news.newsId }, response => {
                if (response.data) {
                    _this.content = {
                        title: news.title,
                        content: response.data.content,
                        cDate: news.lDate
                    };
                    _this.showModal = true;
                }
            });
        }
    }
</script>

<style>
</style>