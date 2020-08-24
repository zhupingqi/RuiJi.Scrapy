/// <reference path="../../node_modules/vue/types/vue.d.ts" />

import { DefaultData, DefaultMethods, DefaultComputed, PropsDefinition, DefaultProps } from "vue/types/options";

interface Vue {
    i18n(...args: string[]): string;
}

interface ComponentOptions<
    V extends Vue,
    Data=DefaultData<V>,
    Methods=DefaultMethods<V>,
    Computed=DefaultComputed,
    PropsDef=PropsDefinition<DefaultProps>,
    Props=DefaultProps> {
    i18n(...args: string[]): string;
}

declare module 'vue/types/vue' {
    interface Vue {
        i18n(...args: string[]): string;
    }
}