import $ from 'jquery';
import { baseUrl } from '@/core/common';

export class Course {
    constructor() {

    }

    get(lang: string) {
        return $.get(baseUrl + "api/course/get?lang=" + lang);
    }
}