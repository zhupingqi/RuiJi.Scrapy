<template>
    <div class="container">
        <div class="main">
            <div class="spinner">
                <div class="rect1"></div>&nbsp;<div class="rect2"></div>&nbsp;<div class="rect3"></div>&nbsp;<div class="rect4"></div>&nbsp;<div class="rect5"></div>&nbsp;<div class="rect6"></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue } from 'vue-property-decorator';

    @Component
    export default class Loading extends Vue { }

</script>

<style>
    .spinner {
        margin: 100px auto;
        width: 60px;
        height: 60px;
        text-align: center;
        font-size: 10px;
        padding: 0px !important;
    }

        .spinner > div {
            padding: 0px !important;
            background-color: #007bff;
            height: 100%;
            width: 6px;
            display: inline-block !important;
            -webkit-animation: stretchdelay 1.2s infinite ease-in-out;
            animation: stretchdelay 1.2s infinite ease-in-out;
        }

        .spinner .rect2 {
            -webkit-animation-delay: -1.1s;
            animation-delay: -1.1s;
        }

        .spinner .rect3 {
            -webkit-animation-delay: -1.0s;
            animation-delay: -1.0s;
        }

        .spinner .rect4 {
            -webkit-animation-delay: -0.9s;
            animation-delay: -0.9s;
        }

        .spinner .rect5 {
            -webkit-animation-delay: -0.8s;
            animation-delay: -0.8s;
        }

        .spinner .rect6 {
            -webkit-animation-delay: -0.7s;
            animation-delay: -0.7s;
        }

    @-webkit-keyframes stretchdelay {
        0%, 40%, 100% {
            -webkit-transform: scaleY(0.4)
        }

        20% {
            -webkit-transform: scaleY(1.0)
        }
    }
</style>