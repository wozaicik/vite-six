<template>
    <div class="dis-coor">
        <el-row justify="space-evenly">
            <el-col :span="2">
                <el-text>{{ displayText.x }}:</el-text>
            </el-col>
            <el-col :span="5">
                <el-text>{{ displayCoor?.x.toFixed(4) }}</el-text>
            </el-col>
            <el-col :span="2">
                <el-text>{{ displayText.y }}:</el-text>
            </el-col>
            <el-col :span="5">
                <el-text>{{ displayCoor?.y.toFixed(4) }}</el-text>
            </el-col>
            <el-col :span="2">
                <el-text>{{ displayText.z }}:</el-text>
            </el-col>
            <el-col :span="5">
                <el-text>{{ displayCoor?.z.toFixed(3) }}</el-text>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import * as Cesium from 'cesium'
import { computed, ref, watch } from 'vue'
import { layoutStore } from '@/store/index'
import { storeToRefs } from 'pinia'
import proj4 from 'proj4'
const props = defineProps({
    elementX: { type: Number, default: 0 },
    elementY: { type: Number, default: 0 },
    isOutside: { type: Boolean, default: false }
})

const car2 = computed(() => {
    return new Cesium.Cartesian2(props.elementX, props.elementY)
})
const car3 = ref(null)

const displayText = ref({ x: 'Lon', y: 'Lat', z: 'Alt' })
const displayCoor = ref({ x: 0, y: 0, z: 0 })

const store = layoutStore()
const { isViewer, coordinateSystem } = storeToRefs(store)

watch([isViewer, car2], () => {
    if (isViewer.value) {
        const scene = window.scene
        car3.value = scene.pickPosition(car2.value)
        if (coordinateSystem.value === 'lonLat') {
            const lonLatDegree = car3ToLonLatDegree(car3.value ? car3 : null)
            displayCoor.value = lonLatDegree.value
        } else if (coordinateSystem.value === 'CGCS') {
            const CGCS = car3ToCGCS(car3.value ? car3 : null)
            displayCoor.value = CGCS.value
        } else if (coordinateSystem.value === 'local') {
            const local = car3ToLocal(car3.value ? car3 : null)
            displayCoor.value = local.value
        }
    }
})

watch(coordinateSystem, (newVal) => {
    if (newVal === 'lonLat') {
        displayText.value.x = 'Lon'
        displayText.value.y = 'Lat'
        displayText.value.z = 'Alt'
    } else {
        displayText.value.x = 'X'
        displayText.value.y = 'Y'
        displayText.value.z = 'Z'
    }
})

const car3ToLonLatDegree = (car3) => {
    const lonLatDegree = ref({ x: 0, y: 0, z: 0 })
    if (car3) {
        const lonLatRadian = Cesium.Cartographic.fromCartesian(car3.value)
        lonLatDegree.value.x = Cesium.Math.toDegrees(lonLatRadian.longitude)
        lonLatDegree.value.y = Cesium.Math.toDegrees(lonLatRadian.latitude)
        lonLatDegree.value.z = lonLatRadian.height
    } else {
        return lonLatDegree
    }
    return lonLatDegree
}
const car3ToCGCS = (car3) => {
    const CGCS = ref({ x: 0, y: 0, z: 0 })
    if (car3) {
        const lonLatDegree = car3ToLonLatDegree(car3)
        const N = Math.ceil(lonLatDegree.value.x / 3)
        const L = N * 3
        proj4.defs([
            [
                'EPSG:4326',
                '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
            ],
            [
                'EPSG:CGCS2000',
                `+proj=tmerc +lat_0=0 +lon_0=${L} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs`
            ]
        ])
        const gsProj = proj4('EPSG:4326', 'EPSG:CGCS2000', [
            lonLatDegree.value.x,
            lonLatDegree.value.y
        ])
        CGCS.value.x = gsProj[0]
        CGCS.value.y = gsProj[1]
        CGCS.value.z = lonLatDegree.value.z
    } else {
        return CGCS
    }
    return CGCS
}
const car3ToLocal = (car3) => {
    const local = ref({ x: 0, y: 0, z: 0 })
    if (car3) {
        const cgcs = car3ToCGCS(car3)
        const dx = -374100
        const dy = -2531700
        const m = 0.999977 // 缩放比例
        const da = 0.00485289032 // 旋转角度
        local.value.x =
            dx +
            m * Math.cos(da) * cgcs.value.x -
            m * Math.sin(da) * cgcs.value.y
        local.value.y =
            dy +
            m * Math.sin(da) * cgcs.value.x +
            m * Math.cos(da) * cgcs.value.y
        local.value.z = cgcs.value.z
    } else {
        return local
    }
    return local
}
</script>

<style scoped lang="scss">
.dis-coor {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 480px;
    height: 25px;
    z-index: 99;
    line-height: 25px;
    background-color: rgba(211, 211, 211, 0);
    .el-row {
        width: 100%;
        height: 100%;
        .el-col {
            text-align: center;
            .el-text {
                color: #fff;
            }
        }
    }
}
</style>
