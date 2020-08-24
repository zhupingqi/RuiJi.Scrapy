<template>
    <div id="sheet" class="container-fluid">
        <div class="row">
            <div class="col-3">
                <b-list-group>
                    <b-list-group-item href="#" @click="loadPage(1)" :active="ruleId === undefined">{{i18n("all")}}</b-list-group-item>
                    <b-list-group-item href="#" v-for="rule in rules" @click="loadPage(1,rule.ruleId)" :active="ruleId === rule.ruleId">{{ rule.name }}<b-badge variant="primary" pill class="float-right">{{ rule.count }}</b-badge> <b-badge v-if="rule.ruleId >= 10000000" pill class="float-right">p</b-badge></b-list-group-item>
                </b-list-group>
            </div>
            <div class="col-9">
                <div class="row tool">
                    <b-button type="button" class="btn btn-default btn-sm" @click="checkAll">{{i18n("checkAll")}}</b-button>
                    <b-button type="button" class="btn btn-default btn-sm" @click="clear(0)">{{i18n("removeChecked")}}</b-button>
                    <b-button type="button" class="btn btn-default btn-sm" @click="clear(1)">{{i18n("clearAll")}}</b-button>
                    <b-form-select v-model="type" :options="types" size="sm" />
                    <b-button type="button" class="btn btn-default btn-sm" @click="exportData">{{i18n("export")}}</b-button>
                    <b-button type="button" class="btn btn-default btn-sm" @click="detect">{{i18n("detect")}}</b-button>
                    <b-dropdown right split text="Export To">
                        <b-dropdown-item @click="showExport('WordPress')">WordPress</b-dropdown-item>
                    </b-dropdown>
                </div>
                <b-table striped hover :items="rows" :fields="fields" class="ellipsis" style="table-layout:fixed" id="tb_worksheet">
                    <template v-slot:cell(_hash)="data">
                        <input type="checkbox" :value="data.value" />
                    </template>
                </b-table>
            </div>
        </div>
        <b-modal ref="downloader" title="Url Donwloader" @ok="start" ok-title="Start">
            <div v-for="url in downloader.getShort()">{{ url }}</div>
            <div>total: {{ downloader.urls.length }}</div>
            <div>{{ currentDownUrl }}</div>
        </b-modal>
        <b-modal ref="exportTo" title="Export To Wordpress" @ok="exportTo" ok-title="Export">            
            <WordPress ref="WordPress" v-if="currentView==='WordPress'"></WordPress>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Vue } from 'vue-property-decorator';
    import { db } from '@/core/ruiji/db';
    import { Downloader } from '@/core/downloader';
    import '@/shared/array';
    import '../../public/libs/tableExport.js';
    import { _browser } from '@/core/utils';
    import WordPress from '@/components/export/WordPress.vue';

    //https://github.com/hhurz/tableExport.jquery.plugin/

    @Component({
        components: {
            WordPress
        }
    })

    export default class Sheet extends Vue {
        rows: any[] = [];
        fields: any[] = [];
        rules: any[] = [];
        types: any[] = [
            { value: "csv", text: "CSV" },
            { value: "doc", text: "DOC" },
            { value: "json", text: "JSON" },
            //{ value: "pdf", text: "PDF" },
            { value: "png", text: "PNG" },
            { value: "sql", text: "SQL" },
            { value: "tsv", text: "TSV" },
            { value: "txt", text: "TXT" },
            { value: "excel", text: "XLS" },
            { value: "xlsx", text: "XLSX" },
            { value: "xml", text: "XML" }
        ];
        type: string = "csv";
        all: boolean = false;
        ruleId?: number;
        currentDownUrl: string = "";
        downloader: Downloader = new Downloader();
        currentView: string = "";

        detect() {
            this.currentDownUrl = "";
            this.downloader.clear();

            let tds = Array.from($('#tb_worksheet td'));

            tds.forEach(td => {
                let txt = $(td).text();
                if (txt.trim() !== "" && this.isURL(txt)) {
                    this.downloader.add(txt);
                }
            });

            let m = this.$refs.downloader as any;
            m.show();
        }

        start(evt: Event) {
            evt.preventDefault();

            this.downloader.start((url, current) => {
                this.currentDownUrl = "[" + current + "]" + url;

                //return Promise.resolve(true);
            });
        }

        isURL(str_url: string) {// 验证url
            var strRegex = "^(https|http)?://.*";

            var re = new RegExp(strRegex);
            return re.test(str_url);
        }

        checkAll() {
            this.all = !this.all;
            $("td > input").prop("checked", this.all);
        }

        loadPage(page: number, ruleId?: number) {
            var _this = this;
            this.ruleId = ruleId;

            _browser.sendMessage({
                cmd: 'db.rule.load'
            }, rules => {
                this.rules = rules;
            });

            _browser.sendMessage({
                cmd: 'db.article.load',
                page: 1,
                limit: 10000,
                ruleId: ruleId
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
                        sortable: true
                    };
                });

                let fields = [{ key: '_hash', label: '' }].concat(fs);

                _this.fields = fields;
                _this.rows = rows;                
            });
        }

        clear(all: boolean) {
            if (!!all) {
                db.article.clear();
            } else {
                var selects: number[] = Array.from($("#tb_worksheet tr td :checked")).map(d => { return parseInt($(d).val() as string) });
                if (selects.length === 0) {
                    alert(this.i18n("alert_removeChecked"));
                }
                else {
                    db.article.remove(selects);
                }
            }

            $(":checked").prop("checked", "");
            this.loadPage(0, this.ruleId);
        }

        exportData() {
            $('#tb_worksheet').tableExport({
                type: this.type,
                csvUseBOM: true,
                jspdf: {
                    noBom: true,
                    onDocCreated: (doc: any) => {
                        doc.addFont('NotoSansCJKjp-Regular.ttf', 'NotoSansCJKjp', 'normal');
                        doc.setFont('NotoSansCJKjp');
                        console.log(doc);
                    }
                }
            });

            db.outputs.insert({
                total: $('#tb_worksheet tbody tr').length
            });
        }

        showExport(target: string) {
            var selects: number[] = Array.from($("#tb_worksheet tr td :checked")).map(d => { return parseInt($(d).val() as string) });
            if (selects.length === 0) {
                alert("please select export row");
            }
            else {
                let m = this.$refs.exportTo as any;
                this.currentView = target;
                m.show();
            }
        }

        exportTo(e: Event) {
            e.preventDefault();

            var selects: number[] = Array.from($("#tb_worksheet tr td :checked")).map(d => { return parseInt($(d).val() as string) });
            let data = this.rows.filter((f) => {
                return selects.contains(f._hash);
            });

            let m = this.$refs[this.currentView] as any;
            let p = m.exportData(data) as Promise<boolean>;
            p.then(r => {
                if (r) 
                    (this.$refs.exportTo as any).hide();
            });                
        }

        created() {
            this.loadPage(1);
        }
    }
</script>

<style>
    body {
        font-size: 12px;
        margin-left: -10px;
        margin-top: 5px;
    }

    #sheet div.tool > * {
        display: inline-block;
        margin: 5px;
    }

    #sheet div.tool select {
        max-width: 120px;
    }

    table.ellipsis td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100px;
    }

    table#tb_worksheet tr > td:first-child, table#tb_worksheet tr > th:first-child {
        width: 40px !important;
    }
</style>