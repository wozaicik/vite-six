<template>
    <div id="cesiumContainer" ref="target">
        <displayCoor
            :elementX="elementX"
            :elementY="elementY"
            :isOutside="isOutside"
        ></displayCoor>
        <KeepAlive>
            <component :is="id" :key="id"></component>
        </KeepAlive>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { initViewer } from './viewer'
import displayCoor from '../coor/display-coor.vue'
import { useMouseInElement } from '@vueuse/core'

onMounted(() => {
    initViewer()
})

// 绑定DOM元素
const target = ref(null)
// 使用vueUse函数库，获得鼠标在元素的坐标值
const { elementX, elementY, isOutside } = useMouseInElement(target)

const id = ref(null)
const route = useRoute()
watch(
    () => route.params.id,
    (newVal) => {
        id.value = newVal
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
#cesiumContainer {
    width: 100%;
    height: 100%;
    margin: 0;
    border: 0;
    padding: 0;
    position: relative;
    overflow: hidden;
}
</style>
