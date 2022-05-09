<template>
    <o-slider
        v-model="internal_value"
        :max="max"
        :step="step"
        :min="min"
        :custom-formatter="customFormatter"/>
        
</template>