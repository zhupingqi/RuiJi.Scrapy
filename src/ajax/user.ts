import $ from 'jquery';
import { baseUrl } from '@/core/common';

export class User {
    constructor() {

    }

    check() {
        return $.ajax({
            url: baseUrl + 'api/user/test',
            type: 'GET',
        });
    }

    logout() {
        return $.ajax({
            url: baseUrl + 'api/user/logout',
            type: 'GET',
        });
    }

    login(data: any) {
        return $.ajax({
            url: baseUrl + "api/user/login",
            data: JSON.stringify(data),
            type: "POST",
            contentType: "application/json"
        });
    }

    info() {
        return $.ajax({
            url: baseUrl + 'api/user/info',
            type: 'GET'
        });
    }

    stat() {
        return $.ajax({
            url: baseUrl + 'api/user/stat',
            type: 'GET'
        });
    }

    news(local: string) {
        return $.ajax({
            url: baseUrl + 'api/news/list/' + local,
            type: 'GET'
        });
    }

    newsContent(id: number) {
        return $.ajax({
            url: baseUrl + 'api/news/content/' + id,
            type: 'GET'
        });
    }

    getStar(page: number) {
        return $.ajax({
            url: baseUrl + 'api/user/mystar?page=' + page,
            type: 'GET'
        });
    }

    getRule(page: number, filter: any) {
        filter.url = filter.url || "";

        return $.ajax({
            url: baseUrl + 'api/user/rule/my?page=' + page + "&current=" + filter.current + "&url=" + encodeURIComponent(filter.url) + "&hub=" + filter.hub,
            type: 'GET'
        });
    }

    getRuleExt(ruleId: number, async: boolean = true) {
        return $.ajax({
            url: baseUrl + 'api/user/rule/get/' + ruleId,
            type: 'GET',
            async: async
        });
    }

    updateRule(rule: any) {
        return $.ajax({
            url: baseUrl + 'api/user/rule/update',
            data: JSON.stringify(rule),
            type: "POST",
            contentType: "application/json"
        });
    }

    shareRule(ruleId: number) {
        return $.ajax({
            url: baseUrl + 'api/share/rule/' + ruleId,
            type: 'GET'
        });
    }

    removeRule(ruleId: number) {
        return $.ajax({
            url: baseUrl + 'api/user/rule/delete/' + ruleId,
            type: 'GET'
        });
    }

    request(page: number) {
        return $.ajax({
            url: baseUrl + 'api/request/get?page=' + page,
            type: 'GET'
        });
    }

    updateRequest(data: any) {
        return $.ajax({
            url: baseUrl + "api/request/update",
            data: JSON.stringify(data),
            type: "POST",
            contentType: "application/json"
        });
    }

    cancelRequest(requestId: number) {
        return $.ajax({
            url: baseUrl + 'api/request/delete/' + requestId,
            type: 'GET'
        });
    }

    sendMail(email: string, lang: string) {
        return $.ajax({
            url: baseUrl + 'api/user/email/' + email + '?lang=' + lang,
            type: 'GET'
        });
    }

    register(d: any, captcha: string, referee: string) {
        var url = baseUrl + "api/user/register/" + captcha;
        if (referee.length > 0) {
            url += "/" + referee;
        }

        return $.ajax({
            url: url,
            data: JSON.stringify(d),
            type: "POST",
            contentType: "application/json"
        });
    }

    forget(d: any, captcha: string) {
        var url = baseUrl + "api/user/forget/" + captcha;

        return $.ajax({
            url: url,
            data: JSON.stringify(d),
            type: "POST",
            contentType: "application/json"
        });
    }

    products(lang: string) {
        return $.ajax({
            url: baseUrl + 'api/product/getAll?lang=' + lang,
            type: 'GET'
        });
    }

    getOrder(page: number) {
        return $.ajax({
            url: baseUrl + 'api/order/get?page=' + page,
            type: 'GET'
        });
    }
}