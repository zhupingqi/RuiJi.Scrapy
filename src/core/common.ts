import $ from 'jquery';

//"http://api.ruijihg.com/";
//"http://localhost:10215/";

export const baseUrl: string = "http://api.ruijihg.com/";

$.ajaxSettings.beforeSend = function (jqXHR: JQuery.jqXHR, settings: JQueryAjaxSettings) {
    jqXHR.setRequestHeader('AppKey', localStorage.getItem('app_key') || '');
    jqXHR.setRequestHeader('Token', localStorage.getItem('token') || '');
};

$.ajaxSettings.success = function (data: any, textStatus: JQuery.Ajax.SuccessTextStatus, jqXHR: JQuery.jqXHR) {
    var appkey = jqXHR.getResponseHeader("Appkey");
    if (appkey) {
        localStorage.setItem('app_key', appkey);
    }

    var token = jqXHR.getResponseHeader("Token");
    if (token) {
        localStorage.setItem('token', token);
    }

    var uname = jqXHR.getResponseHeader("UserId");
    if (uname) {
        localStorage.setItem("uname", name);
    }

    var re = jqXHR.getResponseHeader("Recommend");
    if (re) {
        localStorage.setItem("recommend", re);
    }
};