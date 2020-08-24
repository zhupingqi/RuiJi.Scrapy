import $ from 'jquery';
import { baseUrl } from '@/core/common';

export class Rule {
    constructor() {

    }

    report(ruleId: number) {
        return $.ajax({
            url: baseUrl + 'api/report/add/' + ruleId,
            type: 'GET'
        });
    }

    praise(ruleId: number) {
        return $.ajax({
            url: baseUrl + 'api/user/praise/' + ruleId,
            type: 'GET'
        });
    }

    star(ruleId: number) {
        return $.ajax({
            url: baseUrl + 'api/user/star/' + ruleId,
            type: 'GET'
        });
    }

    //匹配符合指定链接地址规则
    match(url: string) {
        return $.ajax({
            url: baseUrl + 'api/rule/match?url=' + encodeURIComponent(url),
            type: 'GET'
        });
    }

    //获取
    getRuleExt(ruleId: number) {
        return $.ajax({
            url: baseUrl + 'api/rule/get/' + ruleId,
            type: 'GET'
        });
    }
}