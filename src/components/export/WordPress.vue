<template>
    <table style="width:100%">
        <tr>
            <td colspan="2"><h6>Please Input Wordpress Account</h6></td>
        </tr>
        <tr>
            <td>endpoint <i class="fa fa-info-circle" v-b-tooltip.hover title="sample http://www.abc.com/wp-json"></i></td>
            <td>
                <b-form-input v-model="api.endpoint" size="sm" placeholder="(http|https)://yourdomain/wp-json"></b-form-input>                
            </td>
        </tr>
        <tr>
            <td>nonce <i class="fa fa-info-circle" v-b-tooltip.hover title="get nonce at wordpress ruiJi scraper plugin"></i></td>
            <td>
                <b-form-input v-model="api.nonce" size="sm" placeholder="cookie nonce"></b-form-input>                
            </td>
        </tr>
        <tr>
            <td colspan="2"><h6>Template</h6></td>
        </tr>
        <tr>
            <td valign="top">title <i class="fa fa-info-circle" v-b-tooltip.hover title="use [field]"></i></td>
            <td>
                <b-form-textarea v-model="api.title" placeholder="Enter title template" :rows="3" :max-rows="6">
                </b-form-textarea>
            </td>
        </tr>
        <tr>
            <td valign="top">content <i class="fa fa-info-circle" v-b-tooltip.hover title="like [content]\n[url]"></i></td>
            <td>
                <b-form-textarea v-model="api.content" placeholder="Enter content template" :rows="3" :max-rows="6">
                </b-form-textarea>
            </td>
        </tr>
        <tr>
            <td>status</td>
            <td>
                 <b-form-select v-model="api.status" :options="types" size="sm" />
            </td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>{{ error_result }}</td>
        </tr>
    </table>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Vue } from 'vue-property-decorator';
    import { db } from '@/core/ruiji/db';
    import WPAPI, { WPRequest } from 'wpapi';
    import { _browser } from '@/core/utils';

    @Component
    export default class WordPress extends Vue {
        api: any = {
            endpoint: '',
            nonce: '',
            title: '[title]',
            content: '[content]\n[media]\n[url]',
            status:'publish'
        };
        types: any[] = [{
            value: "publish",
            text: 'publish'
        },{
            value: "future",
            text: 'future'
        },{
            value: "draft",
            text: 'draft'
        },{
            value: "pending",
            text: 'pending'
        },{
            value: "private",
            text: 'private'
            }];
        error_result: string = "";

        exportData(data: any[]): Promise<boolean> {
            if (this.api.endpoint === "" || this.api.nonce === "") {
                this.error_result = "need endpoint and nonce";
                return Promise.resolve(false);                
            }

            _browser.sendMessage({
                cmd: 'options.update',
                name: 'wordpress-endpoint',
                value: this.api.endpoint
            }, res => {});

            _browser.sendMessage({
                cmd: 'options.update',
                name: 'wordpress-nonce',
                value: this.api.nonce
            }, res => { });

            _browser.sendMessage({
                cmd: 'options.update',
                name: 'wordpress-title',
                value: this.api.title
            }, res => { });

            _browser.sendMessage({
                cmd: 'options.update',
                name: 'wordpress-content',
                value: this.api.content
            }, res => {});

            var wp = new WPAPI({
                endpoint: this.api.endpoint,
                nonce: this.api.nonce
            });

            let ps: Promise<any>[] = [];
            let result = true;

            data.forEach((d: any) => {
                let keys = Object.keys(d);

                let title = this.getValue(d, this.api.title);
                let content = this.getValue(d, this.api.content);

                let p = wp.posts().create({
                    title: title,
                    content: content,
                    status: 'publish'
                }).catch(r => {
                    this.error_result = r.message;
                    result = false;
                });

                ps.push(p);
            });

            return Promise.all(ps).then(() => {
                return result;
            });
        }

        getValue(d: any, value: string) {
            let keys = Object.keys(d);

            let reg = new RegExp(/\[(.*?)\]/ig);
            let ms: RegExpExecArray | null;
            let fs: string[] = [];

            while (ms = reg.exec(value)) {
                fs.push(ms[1]);
            }

            fs.forEach(key => {
                let v = "";

                if (keys.contains(key)) {
                    v = $.trim(d[key]);
                }

                value = value.replace("[" + key + "]", v);
            });

            return value;
        }

        created() {
            _browser.sendMessage({
                cmd: 'options.get',
                name: 'wordpress-endpoint'
            }, res => {
                if (res)
                    this.api.endpoint = res;
            });

            _browser.sendMessage({
                cmd: 'options.get',
                name: 'wordpress-nonce'
            }, res => {
                if (res)
                    this.api.nonce = res;
                });

            _browser.sendMessage({
                cmd: 'options.get',
                name: 'wordpress-title'
            }, res => {
                if (res)
                    this.api.title = res;
            });

            _browser.sendMessage({
                cmd: 'options.get',
                name: 'wordpress-content'
            }, res => {
                if (res)
                    this.api.content = res;
            });
        }
    }
</script>

<style>
</style>