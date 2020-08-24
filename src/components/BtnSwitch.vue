<template>
    <div class="d-inline-block align-self-center">
        <label class="control-label" for="inject">{{ i18n("turn_on") }}</label>
        <b-button-group class="d-inline-block" size="sm">
            <b-button :class="on?'btn-success':'btn-info'" @click="switchBtn">On</b-button>
            <b-button :class="on?'btn-info':'btn-danger'" @click="switchBtn">Off</b-button>
        </b-button-group>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

    @Component
    export default class BtnSwitch extends Vue {
        //switchOn: boolean = true;

        @Prop() on!: boolean;

        @Watch("on")
        switchChange(newValue: boolean, oldValue: boolean) {
            this.$emit("change", newValue);
        }

        switchBtn() {
            this.on = !this.on;
        }

        created() {
        }
    }
</script>

<style>
</style>