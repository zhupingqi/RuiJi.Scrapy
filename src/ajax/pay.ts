import $ from 'jquery';
import { baseUrl } from '@/core/common';

export class Pay {
    constructor() {

    }

    getPaypalToken() {
        return $.ajax({
            url: baseUrl + "api/paypal/token",
            type: 'GET',
        });
    }

    paypalPurchase(payload: any) {
        return $.post(baseUrl + "api/paypal/purchase?nonce=" + payload.nonce, payload); 
    }
}