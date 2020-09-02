<template>
    <div id="tools">
        <a href="javascript:;" @click="edit" :title="i18n('add')"><i class="fa fa-plus"></i></a>
        <b-dropdown variant="link" right size="sm" class="m-md-2" no-caret>
            <template slot="button-content">
                <i class="fa fa-chevron-circle-down" :title="i18n('dock')"></i>
            </template>
            <b-dropdown-item @click="dock('left')" href="javascript:;"><i class="fa fa-align-left"></i> {{i18n("left")}}</b-dropdown-item>
            <b-dropdown-item @click="dock('bottom')" href="javascript:;"><i class="fa fa-window-minimize"></i> {{i18n("bottom")}}</b-dropdown-item>
            <b-dropdown-item @click="dock('right')" href="javascript:;"><i class="fa fa-align-right"></i> {{i18n("right")}}</b-dropdown-item>
        </b-dropdown>
        <a href="javascript:;" @click="dock('hide')" :title="i18n('hide')"><i class="fa fa-arrow-circle-right"></i></a>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Bus from '@/core/utils';

    @Component
    export default class Tool extends Vue {
        edit() {
            Bus.$emit('edit');
        };

        dock(positon: string) {
            Bus.$emit('dock', positon);
        };
    }
</script>

<style>
    div#tools {
        position: absolute;
        right: 10px;
        top: 10px;
    }

        div#tools .dropdown-menu a {
            font-size: 14px;
            padding: 0 5px;
        }

        div#tools .dropdown-menu {
            min-width: unset;
        }

        div#tools .dropdown button {
            margin-top: -3px;
            padding: 0;
        }
</style>
