<template>
    <div>
        <template v-if="loading">
            <Loading></Loading>
        </template>
        <template v-else>
            <table class="table">
                <tbody>
                    <tr v-for="row in rows">
                        <td>
                            <b-button variant="link" @click="showCourse(row.url)">{{ row.name }} <b-badge pill variant="light">{{ row.cdate }}</b-badge></b-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
        <b-modal size="lg" v-model="showVideo" no-close-on-backdrop hide-footer centered @hide="hideCourse">
            <b-embed type="iframe" aspect="4by3" controls allowfullscreen :src="source">
            </b-embed>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';
    import Loading from '@/components/Loading.vue';
    import { _browser } from '@/core/utils';
    import '@/shared/date.ts';

    @Component({
        components: {
            Loading
        }
    })

    export default class Course extends Vue {
        loading: boolean = true;
        currentPage: number = 1;
        rows: any[] = [];
        total: number = 0;
        showVideo = false;
        source: string = "";

        showCourse(url: string) {
            this.source = url;
            this.showVideo = true;
        }

        hideCourse() {
            this.showVideo = false;
            this.source = "";
        }

        created() {
            var _this = this;

            _browser.sendMessage({ cmd: "course.get" }, response => {
                _this.loading = false;
                if (response.code === 200) {
                    _this.rows = response.data.rows;
                } else {
                    window.location.replace('login.html');
                }
            });
        }
    }
</script>

<style>
</style>