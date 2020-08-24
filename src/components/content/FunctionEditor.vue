<template>
    <div>
        <template v-if="showing">
            <div class="function-edit-model">
                <!--<div>{{ content }}</div>-->
                <div>
                    <textarea class="edit-area"></textarea>
                    <footer class="modal-footer">
                        <b-btn variant="secondary" @click="cancel">{{i18n("cancel")}}</b-btn>
                        <b-btn variant="primary" @click="ok">{{i18n("ok")}}</b-btn>
                    </footer>
                </div>
                <!--<div>{{ result }}</div>-->
            </div>
            <div class="model-back"></div>
        </template>
        <template v-else>
            <!---->
        </template>
    </div>
</template>

<script lang="ts">
    import $ from 'jquery';
    import { Component, Vue, Watch } from 'vue-property-decorator';
    import CodeMirror from 'codemirror';
    import '../../../node_modules/codemirror/mode/javascript/javascript.js';
    import '../../../node_modules/codemirror/addon/edit/matchbrackets.js';

    @Component
    export default class FunctionEditor extends Vue {
        editor: CodeMirror.EditorFromTextArea | null = null;
        showing: boolean = false;
        code: string = "";
        content: string = "";
        result: string = "";
        $ref!: any;

        show(message: any) {
            this.code = message.code;
            this.$ref = message.$ref;
            this.showing = true;
            let _this = this;

            this.$nextTick(() => {
                let iWindow = ($("#ruiji_inject_frame") as any).get(0).contentWindow;
                let $body = $(iWindow.document.body);

                $(".edit-area", $body).promise().then((dom: JQuery<HTMLElement>) => {
                    let area = dom.get(0) as HTMLTextAreaElement;

                    //http://codemirror.net/doc/manual.html#config
                    this.editor = CodeMirror.fromTextArea(area, {
                        mode: "javascript",
                        theme: "blackboard",
                        lineNumbers: true
                    });

                    this.editor.setValue(_this.code);
                });
            });
        }

        cancel() {
            this.code = "";
            this.showing = false;
        }

        ok() {
            let ref = this.$ref as any;
            let code = this.editor!.getValue();

            ref.editFuncOk(code);

            this.cancel();
        }
    }
</script>

<style>
    .function-edit-model {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 4;
        padding: 10px;
    }

        .function-edit-model > div {
            padding: 10px;
            width: 100%;
            background-color: #fff;
            background-clip: padding-box;
            border: 1px solid rgba(0,0,0,.2);
            border-radius: .3rem;
        }

    .model-back {
        background-color: #000;
        opacity: .5;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index:3;
    }
</style>