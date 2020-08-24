/// <reference path="i18n.d.ts" />
import Vue from "vue";
import { _browser } from "@/core/utils";

Vue.prototype.i18n = function (...args: string[]): string {
    let message: string[] = [];

    args.forEach(m => {
        message.push(_browser.getI18nMessage(m));
    });

    let lan: string = _browser.getUILanguage();
    if (lan =="zh-CN") {
        return message.join("");
    } else if ("en-US") {
        return message.join(" ");
    }{
        return message.join(" ");
    }
};