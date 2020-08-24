<template>
    <table class="selector">
        <tr>
            <td>
                {{i18n("rule_name")}}
            </td>
            <td>

                <div class="input-group">
                    <b-form-select :options="dataTypes" v-model="sc.type" size="sm" />
                    <b-form-input v-model="sc.name" size="sm"></b-form-input>
                </div>
            </td>
            <td>
                <a href="javascript:;" @click="add" :title="i18n('add')"><i class="fa fa-plus"></i></a>
            </td>
        </tr>
        <tr v-for="(s,index) in sc.selectors">
            <td>
                <div style="margin: 0;padding: 0;height: 16px;line-height: 16px; text-align: left;">
                    <a href="javascript:;" @click="inspect(s, target)" :title="i18n('select')" v-if="s.type === 0"><i class="fa fa-location-arrow" style="transform: rotateY(180deg);" v-bind:class="{ active : $parent.inspect === s }"></i></a>
                    <a href="javascript:;" @click="preview(sc,s)" :title="i18n('preview')" v-if="index === 0"><i class="fa fa-eye" v-bind:class="{ active: previews.includes(s) }"></i></a>
                </div>
            </td>
            <td>
                <div class="input-group">
                    <b-form-select v-model="s.type" :options="types" size="sm" :disabled="index === 0" />
                    <template v-if="s.type===0">
                        <b-form-input v-model="s.selector" size="sm" :title="getTitle(s.type)" data-toggle="tooltip" data-original-title="this is alert content"></b-form-input>
                        <b-form-input v-if="s.ctype===3" v-model="s.attr" size="sm" style="max-width:45px"></b-form-input>
                        <b-form-select v-model="s.ctype" :options="cssTypes" size="sm" />
                    </template>
                    <template v-if="s.type===1||s.type===2">
                        <b-form-input v-model="s.pattern" size="sm" :title="getTitle(s.type)"></b-form-input>
                        <b-form-input v-model="s.index" size="sm"></b-form-input>
                    </template>
                    <template v-if="s.type===6">
                        <b-form-input v-model="s.pattern" size="sm" :title="getTitle(s.type)"></b-form-input>
                        <b-form-input v-model="s.newString" size="sm"></b-form-input>
                    </template>
                    <template v-if="s.type===3">
                        <b-form-input v-model="s.begin" size="sm" :title="getTitle(s.type)"></b-form-input>
                        <b-form-input v-model="s.end" size="sm"></b-form-input>
                    </template>
                    <template v-if="s.type===4">
                        <b-form-input v-model="s.pattern" size="sm" :title="getTitle(s.type)"></b-form-input>
                        <b-form-select v-model="s.etype" :options="exTypes" size="sm" />
                    </template>
                    <template v-if="s.type===10">
                        <b-form-input v-model="s.expression" size="sm" :title="getTitle(s.type)"></b-form-input>
                        <b-form-input v-model="s.split" size="sm"></b-form-input>
                    </template>
                    <template v-if="s.type===7">
                        <b-form-input v-model="s.jsonPath" size="sm" :title="getTitle(s.type)"></b-form-input>
                    </template>
                    <template v-if="s.type===8">
                        <b-form-input v-model="s.xpath" size="sm" :title="getTitle(s.type)"></b-form-input>
                        <b-form-input v-if="s.xtype===3" v-model="s.attr" size="sm" style="max-width:45px"></b-form-input>
                        <b-form-select v-model="s.xtype" :options="xTypes" size="sm" />
                    </template>
                    <template v-if="s.type===9">
                        <b-form-input v-model="s.tags" size="sm" :title="getTitle(s.type)"></b-form-input>
                    </template>
                    <template v-if="s.type===11">
                        <b-form-input v-model="s.name" size="sm" :title="getTitle(s.type)" disabled="disabled"></b-form-input>
                        <b-input-group-append>
                            <b-btn variant="info" size="sm" @click="editFunc(s)">{{i18n("edit")}}</b-btn>
                        </b-input-group-append>
                    </template>
                    <template v-if="s.type===12">
                        <b-form-input v-model="s.pattern" size="sm" :title="getTitle(s.type)"></b-form-input>
                    </template>
                    <div class="input-group-append">
                        <div class="input-group-text">
                            <input type="checkbox" title="remove" :disabled="index == 0" v-model="s.remove">
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <a href="javascript:;" @click="remove(s)" :title="i18n('remove')" v-if="index > 0"><i class="fa fa-minus"></i></a>
            </td>
        </tr>
    </table>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

    import Bus from '@/core/utils';
    import { Outline } from '@/core/ruiji/outline';
    import { RectViewer } from '@/core/ruiji/viewer';
    import { Utils } from '@/core/ruiji/utils';

    @Component
    export default class SelectorEditor extends Vue {
        types: any[] = [
            { value: 0, text: 'css' },
            { value: 1, text: 'reg' },
            { value: 2, text: 'regS' },
            { value: 3, text: 'text' },
            { value: 4, text: 'ex' },
            { value: 6, text: 'regR' },
            { value: 7, text: 'jpath' },
            { value: 8, text: 'xpath' },
            { value: 9, text: 'clear' },
            { value: 10, text: 'exp' },
            { value: 11, text: 'proc' },
            { value: 12, text: 'wildcard' }
        ];
        dataTypes: any[] = [
            { value: 18, text: 'str' },
            { value: 9, text: 'int' },
            { value: 11, text: 'long' },
            { value: 16, text: 'date' },
            { value: 3, text: 'bool' },
            { value: 13, text: 'float' },
            { value: 14, text: 'double' }
        ];
        cssTypes: any[] = [
            { value: 0, text: 'html' },
            { value: 1, text: 'ohtml' },
            { value: 2, text: 'text' },
            { value: 3, text: 'attr' }
        ];
        exTypes: any[] = [
            { value: 0, text: 'all' },
            { value: 1, text: 'begin' },
            { value: 2, text: 'end' }
        ];
        xTypes: any[] = [
            { value: 2, text: 'xml' },
            { value: 1, text: 'oxml' },
            { value: 0, text: 'text' },
            { value: 3, text: 'attr' }
        ];
        previews: any[] = [];
        outline: Outline | null = null;
        inspectSelector!: HTMLElement;
        createModel: boolean = true;
        static hasModel: boolean = false;

        @Prop() sc!: any;

        //@Watch("sc.selectors", { deep: true })
        //indexChange(newValue: any[], oldValue: any[]) {
        //    newValue.forEach(o => {
        //        if (o.index)
        //            o.index = o.index.split(',');
        //    });
        //}

        add() {
            this.sc.selectors.push({
                attr: null,
                ctype: 1,
                remove: false,
                selector: "",
                type: 0,
                index: []
            });
        }

        remove(s: any) {
            this.sc.selectors = this.sc.selectors.remove(s);
        }

        preview(s: any, current: any) {
            let parent = this.$parent as any;

            if (this.outline !== null) {
                this.outline.destory();
                parent.inspect = null;
            }

            if (this.previews.contains(current)) {
                this.previews = this.previews.remove(current);
                RectViewer.Clear(current);
            } else {
                this.previews.push(current);

                var color;
                var block;
                var tile;
                var content: any[] = [];
                var rule = (this.$parent as any).rule;

                var block = rule.expression.selectors.length > 0 ? rule.expression.selectors[0].selector : "";
                var tile = rule.expression.tile.selectors.length > 0 ? rule.expression.tile.selectors[0].selector : "";

                switch (this.$attrs.target) {
                    case "block": {
                        content = [block];
                        break;
                    }
                    case "tile": {
                        content = [block, tile];

                        break;
                    }
                    case "tile.meta": {
                        content = [block, tile, current.selector];

                        break;
                    }
                    case "meta": {
                        content = [block, current.selector];

                        break;
                    }
                    case "paging":
                    case "tile.paging": {
                        content = [current.selector];

                        break;
                    }
                }

                var cls = this.$attrs.target === "tile.meta" ? "meta" : this.$attrs.target;

                var doms = Utils.GetDoms(content, false);

                $(doms).drawRect({
                    indenty: current,
                    class: cls,
                    selectors: s.selectors
                });
            }
        }

        inspect(s: any, target: string) {
            this.previews = [];
            Bus.$emit("clear");

            if (this.outline === null)
                this.outline = new Outline();

            let parent = this.$parent as any;

            if (parent.inspect === s) {
                this.outline.destory();
                parent.inspect = null;
            } else {
                parent.inspect = s;

                this.outline.inspect({
                    data: s,
                    expression: parent.rule.expression,
                    target: this.$attrs.target,
                    change(selector: any) {
                        s.selector = selector;
                    },
                    finish(selector: any) {
                        parent.inspect = null;
                    }
                });
            }
        }

        getTitle(t: number): string {
            return this.i18n("selector_title" + t);
        }

        editFunc(s: any) {
            let parent = this.$parent as any;
            parent.editFunc(s);
        }

        created() {
            let parent = this.$parent as any;
            let _this = this;

            Bus.$on("dock", (position: string) => {
                if (position === "hide") {
                    _this.previews = [];

                    if (_this.outline !== null) {
                        _this.outline.destory();
                        parent.inspect = null;
                    }
                }
            });
        }
    }
</script>

<style>
</style>