import $ from 'jquery';
import { baseUrl } from '@/core/common';

export class Chain {
    constructor() {

    }

    list(page: number) {
        return $.ajax({
            url: baseUrl + 'api/chain/list/' + page,
            type: 'GET',
        });
    }

    get(id: number) {
        return $.ajax({
            url: baseUrl + 'api/chain/rule/' + id,
            type: 'GET',
        });
    }

    update(chain: any) {
        return $.ajax({
            url: baseUrl + 'api/chain/update',
            data: JSON.stringify(chain),
            type: "POST",
            contentType: "application/json"
        });
    }

    delete(id: number) {
        return $.ajax({
            url: baseUrl + 'api/chain/delete/' + id,
            type: 'GET'
        });
    }
}