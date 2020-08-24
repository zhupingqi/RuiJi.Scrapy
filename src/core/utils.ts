import Vue from "vue";

import browserDetect from "browser-detect";

const Bus = new Vue();
export default Bus;

export enum TargetName {
    None = "",
    WorkSheet = "_ruiji_worksheet",
    PagingWindow = "_ruiji_paging_window_",
    ChainWindow = "_ruiji_chain_window_"
}

interface IBrowser {
    init(): void;

    getName(): string;

    openExtensionWindow(url: string, target: TargetName): void;

    openWindow(url: string, target: TargetName): void;

    openTab(url: string): void;

    findWindow(type: TargetName): Promise<any>;

    setBadge(text: string, color: string): void;

    sendMessage(message: any, callback?: (response: any) => void): void;

    addContentListener(): void;

    getVersion(): string;

    getI18nMessage(message: string): string;

    getUILanguage(): string;

    getExtensionURL(): string;

    supportTarget(): boolean;

    openWorksheet(): void;
}

class ChromeBrowser implements IBrowser {
    init() {

    }

    getName(): string {
        return browserDetect().name || "";
    }

    openExtensionWindow(url: string, target: TargetName = TargetName.None) {
        let u = this.getExtensionURL() + url;
        this.sendMessage({
            cmd: "window.open",
            url: u,
            target: target,
            features: "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no"
        }, response => { });
    }

    openWorksheet() {
        this.openExtensionWindow("worksheet.html", TargetName.WorkSheet);
    }

    openWindow(url: string, target: TargetName = TargetName.None) {
        window.open(url, target, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no");
    }

    openTab(url: string): void {
        chrome.tabs.create({ url: url });
    }

    findWindow(type: TargetName): Promise<any> {
        var p = new Promise(resolve => {
            let info: any = {
                populate: true,
                windowTypes: ['normal']
            };

            chrome.windows.getAll(info, wins => {
                wins.forEach(win => {
                    console.log(win);
                });

                resolve(true);
            });
        });

        return p;
    }

    setBadge(text: string, color: string): void {
        chrome.browserAction.setBadgeText({ text: text });
        chrome.browserAction.setBadgeBackgroundColor({ color: color });
    }

    sendMessage(message: any, callback?: ((response: any) => void) | undefined): void {
        try {
            chrome.runtime.sendMessage(message, callback);
        } catch (e) {
            console.log(e);
            Bus.$emit("connectError");
        }
    }

    addContentListener() { }

    getVersion(): string {
        return chrome.runtime.getManifest().version;
    }

    getI18nMessage(message: string): string {
        return chrome.i18n.getMessage(message);
    }

    getUILanguage(): string {
        return chrome.i18n.getUILanguage();
    }

    getExtensionURL(): string {
        return chrome.runtime.getURL("");
    }

    supportTarget(): boolean {
        return true;
    }
}

class FirefoxBrowser extends ChromeBrowser {
    init() {
        if ((self as any).Promise)
            (global as any).Promise = (self as any).Promise;
    }

    openWorksheet() {
        let u = this.getExtensionURL() + "worksheet.html";
        this.openTab(u);
    }

    openTab(url: string): void {
        console.log(url);

        try {
            browser.tabs.create({ url: url });
        } catch (e) {

        }
    }

    sendMessage(message: any, callback?: ((response: any) => void)): void {
        try {
            var sending = browser.runtime.sendMessage(message).catch(r => { console.log(r); });

            sending.then((value: any) => {
                if (callback)
                    callback(value);
            });
        } catch (e) {
            Bus.$emit("connectError");
        }
    }
}

class EdgeBrowser extends ChromeBrowser {
    callback: Function | null = null;

    init() {

    }

    openTab(url: string): void {
        browser.tabs.create({ url: url });
    }

    setBadge(text: string, color: string): void {
        browser.browserAction.setBadgeText({ text: text });

        if (color === "red")
            color = "#ff0000";
        if (color === "green")
            color = "#008000";

        browser.browserAction.setBadgeBackgroundColor({ color: color });
    }

    sendMessage(message: any, callback?: ((response: any) => void)): void {
        try {
            browser.runtime.sendMessage(message, (res: any) => {
                if (callback)
                    callback(res);
            });
        } catch (e) {
            Bus.$emit("connectError");
        }
    }

    addContentListener() {

    }

    getVersion(): string {
        return browser.runtime.getManifest().version;
    }

    getI18nMessage(message: string): string {
        return browser.i18n.getMessage(message);
    }

    getUILanguage(): string {
        return browser.i18n.getUILanguage();
    }

    getExtensionURL(): string {
        return browser.runtime.getURL("");
    }

    supportTarget(): boolean {
        return false;
    }
}

class OperaBrowser extends ChromeBrowser {
    openWindow(type: TargetName, url?: string) {
        let u: string | undefined = "";
        switch (type) {
            case TargetName.WorkSheet: {
                u = this.getExtensionURL() + "worksheet.html";
                this.sendMessage({
                    cmd: "window.open",
                    url: u,
                    target: "_ruiji_",
                    features: "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no"
                }, response => { });

                return;
            }
            case TargetName.ChainWindow:
            case TargetName.PagingWindow: {
                u = url;
                break;
            }
        }

        window.open(u, type, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no");
    }
}

class BrowserBridge {
    static Detect(): IBrowser {
        let result = browserDetect();
        let browser: IBrowser;

        if (result.name === "chrome") {
            browser = new ChromeBrowser();
        } else if (result.name === "firefox") {
            browser = new FirefoxBrowser();
        } else if (result.name === "edge") {
            browser = new EdgeBrowser();
        } else if (result.name === "opera") {
            browser = new OperaBrowser();
        }
        else {
            browser = new ChromeBrowser();
        }

        browser.init();
        return browser;
    }
}

export const _browser: IBrowser = BrowserBridge.Detect();