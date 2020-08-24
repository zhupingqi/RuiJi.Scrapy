export class RuiJiParser {
    constructor() { }

    convert(block: any) {
        var expression: any[] = [];
        if (block.selectors.length > 0) {
            var b = this.getBaseSelectorsExpression(block);
            if (b.length > 0) {
                expression.push("[block]");
                expression.push(...b);
            }
        }

        if (block.tile.selectors.length > 0) {
            var t = this.getBaseSelectorsExpression(block.tile);

            if (t.length > 0) {
                expression.push("[tile]");
                expression.push(...t);
            }

            let keys = Object.keys(block.tile.metas);
            if (keys.length > 0) {                
                let metas: any[] = [];

                keys.forEach(key => {
                    let ms = this.getBaseSelectorsExpression(block.tile.metas[key], 1);
                    if (ms.length > 0)
                        metas.push(...ms);
                });

                if (metas.length > 0) {
                    expression.push("\t[meta]");
                    expression.push(...metas);
                }
            }
        }

        if (block.tile.paging.tile && block.tile.paging.tile.selectors.length > 0) {
            let p = this.getBaseSelectorsExpression(block.tile.paging.tile, 1);
            if (p.length > 0) {
                expression.push("\t[paging]");
                expression.push(...p);
            }
        }

        let keys = Object.keys(block.metas);
        if (keys.length > 0) {
            let metas: any[] = [];

            keys.forEach(key => {
                let ms = this.getBaseSelectorsExpression(block.metas[key], 1);
                if (ms.length > 0)
                    metas.push(...ms);
            });

            if (metas.length > 0) {
                expression.push("[meta]");
                expression.push(...metas);
            }
        }

        if (block.paging.tile && block.paging.tile.selectors.length > 0) {
            let p = this.getBaseSelectorsExpression(block.paging.tile);
            if (p.length > 0) {
                expression.push("[paging]");
                expression.push(...p);
            }
        }

        return expression.join("\r\n");
    };

    getBaseSelectorsExpression(extractBase: any, t = 0) {
        var tab = "";
        for (let i = 0; i < t; i++) {
            tab += "\t";
        }

        var expression = [];
        var name = "";

        if (extractBase.name && extractBase.name.trim() !== "") {
            var dateType = "";
            switch (extractBase.type) {
                case 3:
                    {
                        dateType = "_b";
                        break;
                    }
                case 9:
                    {
                        dateType = "_i";
                        break;
                    }
                case 11:
                    {
                        dateType = "_l";
                        break;
                    }
                case 13:
                    {
                        dateType = "_f";
                        break;
                    }
                case 14:
                    {
                        dateType = "_d";
                        break;
                    }
                case 16:
                    {
                        dateType = "_dt";
                        break;
                    }
            }

            name = tab + "#" + extractBase.name + dateType;
        }

        if (extractBase.selectors.length > 0) {
            var s = this.getSelectorsExpression(extractBase.selectors, tab);
            if (s.length > 0) {
                if(name !== "")
                    expression.push(name);
                expression.push(...s);
            }
        }

        if (expression.length > 0)
            expression[expression.length - 1] += "\r\n";

        return expression;
    };

    getSelectorsExpression(selectors: any[], tab = "") {
        var expression: any[] = [];

        selectors.forEach(selector => {
            var exp = this.convertSelector(selector);
            if (exp.split(' ').remove(['']).length > 1)
                expression.push(tab + exp);
        });

        return expression;
    };

    convertSelector(s: any) {
        let remove = s.remove ? " -r" : "";
        let expression = s.selector + remove;

        switch (s.type) {
            case 0: {
                var cmd = "css";
                var exp = "";

                switch (s.ctype) {
                    case 3:
                        {
                            exp = s.selector + ":[" + s.attr + "]";
                            break;
                        }
                    case 0:
                        {
                            exp = s.selector + ":html";
                            break;
                        }
                    case 1:
                        {
                            exp = s.selector;
                            break;
                        }
                    case 2:
                        {
                            exp = s.selector + ":text";
                            break;
                        }
                }

                expression = [cmd, exp, remove.trim()].join(" ");
                break;
            }
            case 1: {
                s.index = $.trim(s.index);
                if (s === "") {
                    expression = "reg /" + s.pattern + "/" + remove;
                }
                else {
                    expression = "reg /" + s.pattern + "/ " + s.index + remove;
                }

                break;
            }
            case 2: {
                s.index = $.trim(s.index);
                if (s === "") {
                    expression = "regS /" + s.pattern + "/" + remove;
                }
                else {
                    expression = "regS /" + s.pattern + "/ " + s.index + remove;
                }

                break;
            }
            case 3: {
                expression = "text /" + s.begin + "/ /" + s.end + "/" + remove;
                break;
            }
            case 4: {
                var cmd = "ex";
                var exp = "";

                switch (s.etype) {
                    case 1:
                        {
                            exp = "/" + s.pattern + "/ -b";
                            break;
                        }
                    case 2:
                        {
                            exp = "/" + s.pattern + "/ -e";
                            break;
                        }
                    case 0:
                        {
                            exp = "/" + s.pattern + "/ -a";
                            break;
                        }
                }

                expression = [cmd, exp, remove.trim()].join(' ');
                break;
            }
            case 6: {
                if (s.newString === "") {
                    expression = "regR /" + s.pattern + "/" + remove;
                }
                else {
                    expression = "regR /" + s.pattern + "/ " + s.newString + remove;
                }

                break;
            }
            case 7: {
                expression = "jpath " + s.jsonPath;
                break;
            }
            case 8: {
                var cmd = "xpath";
                var exp = "";

                switch (s.xtype) {
                    case 3:
                        {
                            exp = s.xpath + ":[" + s.attr + "]";
                            break;
                        }
                    case 2:
                        {
                            exp = s.xpath + ":xml";
                            break;
                        }
                    case 1:
                        {
                            exp = s.xpath;
                            break;
                        }
                    case 0:
                        {
                            exp = s.xpath + ":text";
                            break;
                        }
                }

                expression = [cmd, exp, remove.trim()].join(' ');
                break;
            }
            case 9: {
                expression = "clear " + s.tags.join(' ') + remove;
                break;
            }
            case 10: {
                if (s.split === "") {
                    expression = "exp " + s.expression + remove;
                }
                else {
                    expression = "exp " + s.expression + " /" + s.split + "/" + remove;
                }

                break;
            }
            case 11: {
                expression = "proc " + s.name + remove;
                break;
            }
            case 12: {
                expression = "wildcard " + s.pattern + remove;
                break;
            }
        }

        return expression.trim();
    };
};