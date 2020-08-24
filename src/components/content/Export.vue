<template>
    <div>
        <b-button variant="success" size="sm" @click="exportData('wordpress')">{{ i18n('export') }} To Wordpress</b-button>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import Bus, { _browser, TargetName } from '@/core/utils';
    import { db } from '@/core/ruiji/db';

    @Component
    export default class Export extends Vue {
        exportData(target: string) {
            let id = "#ruiji-export-" + target;
            let $table = $(id);

            if ($table.length === 0) {
                this.$emit("alert", "need wordpress ruiji scraper plugin page");
                return;
            }

            _browser.sendMessage({
                cmd: 'db.article.load',
                page: 1,
                limit: 10000,
                ruleId: undefined
            }, (rows: any[]) => {
                let fs: any[] = [];

                rows.forEach(row => {
                    fs = Array.from(new Set(fs.concat(Object.keys(row))));
                });

                fs = fs.filter((f: string) => {
                    return !f.startsWith("_");
                });

                fs.forEach((f, index) => {
                    fs[index] = {
                        key: f,
                        label:f
                    };
                });

                let fields = [{ key: '_hash', label: '' }].concat(fs);

                let thead = $("<tr />");
                fields.forEach(f => {
                    thead.append(`<th>${f.label}</th>`);
                });
                $table.append(thead);

                rows.forEach(row => {
                    let tr = $("<tr />");
                    tr.append("<td><input type='checkbox' /></td>");

                    Object.keys(row).forEach(key => {
                        if (key.startsWith("_"))
                            return;

                        let v = $.trim(row[key]);
                        if (v.length > 150)
                            v = v.substr(0, 50);
                        let td = $(`<td>${v}</td>`);
                        td.data("data", $.trim(row[key]));

                        tr.append(td);
                    });

                    $table.append(tr);
                });
            });            
        }
    }
</script>

<style scoped>
</style>