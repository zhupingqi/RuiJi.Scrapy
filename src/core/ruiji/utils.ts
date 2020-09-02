import $ from 'jquery';
import { extend } from 'vue/types/umd';
import URI from 'urijs';

export class Utils {

    static GetDoms = function (content: string[], all: boolean = true) {
        content = content.remove([''])

        var doms = Array.from($(content[0] + ":visible", document));
        doms.forEach(t => {
            $(t).attr("contentIndex", 0);
        });

        var results = doms.slice(0);

        for (var i = 1; i < content.length; i++) {
            let tmp: HTMLElement[] = [];
            doms.forEach(o => {
                var c = Array.isArray(content[i]) ? Array.from(content[i]) : [content[i]];
                c.forEach((ct) => {
                    tmp.push(...$(ct + ":visible", o));
                });
            });
            doms = tmp;
            tmp.forEach(t => {
                $(t).attr("contentIndex", i);
            });
            if (all)
                results.push(...tmp);
            else
                results = tmp;
        }

        return results;
    };
};

export class Uri {
    static fixUrl(urls: string[], baseUrl: string = ""): string[] {
        var ary = Array.from(new Set(urls.map(url => {
            if (url == "javascript:;" || url == "#" || url == "javascript:void(0)")
                return "";

            if (baseUrl === "") {
                try {
                    return decodeURI(url);
                } catch{
                    return "";
                }
            } else {     
                try {
                    var u = Uri.href(new URL(baseUrl), url);
                    return decodeURI(u);
                } catch{
                    return "";
                }
            }
        })));

        return ary.filter((m) => {
            return m !== "";
        });
    }

    static checkURL(url: string) {
        var objExp = /^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/;
        return objExp.test(url);
    }

    static href(url: URL, relativeUrl: string): string {
        if (relativeUrl.startsWith("http")) {
            return relativeUrl;
        }

        if (relativeUrl.startsWith("/")) {
            return url.origin + relativeUrl;
        }

        if (relativeUrl.startsWith("?")) {
            return url.origin + url.pathname + relativeUrl;
        }

        if (relativeUrl.startsWith("../")) {
            var ps = url.pathname.split("/").filter(u => {
                return u !== "";
            });

            while (relativeUrl.startsWith("../")) {
                relativeUrl = relativeUrl.substr(3);
                ps.pop();
            }

            var path = ps.join("/");
            if (path != "")
                path = "/" + path + "/";
            else
                path = "/";

            return url.origin + path + relativeUrl;
        }

        if (url.pathname === "/")
            return url.origin + url.pathname + relativeUrl;
        else {
            var p = url.pathname.substr(0, url.pathname.lastIndexOf("/") + 1);
            return url.origin + p + relativeUrl;
        }        
    }
}