<template>
    <div class="cal-area">
        <el-text size="large">测量地面上几何形状的距离或面积</el-text>
        <el-table
            :data="tableData"
            style="width: 100%"
            max-height="500"
            @row-dblclick="(row) => doubleClik(row)"
        >
            <template #empty>
                <el-text size="large"
                    >---- 编辑完成后，请点击保存！ ----</el-text
                >
                <el-text size="large">--可双击选中行跳转位置--</el-text>
            </template>
            <el-table-column
                label="图形"
                header-align="center"
                align="center"
                prop="index"
            />
            >
            <el-table-column
                label="周长"
                header-align="center"
                align="center"
                prop="length"
            />
            <el-table-column
                label="面积"
                header-align="center"
                align="center"
                prop="area"
            />
        </el-table>
        <el-row justify="center">
            <el-col :span="8"
                ><el-button round size="small" @click="savaAll()"
                    >保存</el-button
                ></el-col
            >
            <el-col :span="8"
                ><el-button round size="small" @click="clearAll()"
                    >清除</el-button
                ></el-col
            >
            <el-col :span="8"></el-col>
        </el-row>
    </div>
</template>

<script>
import { defineComponent, watch, watchEffect, ref, toRaw, reactive } from 'vue'
import { nanoid } from 'nanoid'
import { leftEvent, rightEvent } from './twoPointDistance.vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { layoutStore } from '@/store/index.js'
import { ElMessage } from 'element-plus'
import * as Cesium from 'cesium'
import { car3ToLonLatDegree } from '@/utils/coordinate/car3To.js'
import { drawPointColor } from '@/utils/draw/drawPoint.js'
import { drawPolygon } from '@/utils/draw/drawPolygon.js'
import { calArea } from '@/utils/calculate/calArea.js'
import { calLength } from '@/utils/calculate/calLength.js'

export default defineComponent({
    name: 'calarea',
    // eslint-disable-next-line space-before-function-paren
    setup() {
        let index = 1
        let car3Array = []
        let lonLatArray = []
        let polygonId = 'pg' + nanoid(6)
        let handlerLeft
        let handlerRight

        const itemCoor = ref(null)
        const isRightClick = ref(false)

        let itemPointId = []

        let entityIds = []

        const tableData = reactive([])

        // ////
        const route = useRoute()
        const store = layoutStore()
        const { isViewer } = storeToRefs(store)
        watch(
            () => [isViewer, route.params.id],
            ([newIsV, newId]) => {
                if (newIsV.value && newId === 'calarea') {
                    const { handler } = leftEvent(itemCoor)
                    handlerLeft = handler
                    const { handlerRightIs } = rightEvent(isRightClick)
                    handlerRight = handlerRightIs
                    ElMessage({
                        message: '请点击地球上任意位置',
                        type: 'success'
                    })
                }
            },
            { immediate: true }
        )
        watchEffect(() => {
            if (isViewer.value && !handlerLeft) {
                const { handler } = leftEvent(itemCoor)
                handlerLeft = handler
                const { handlerRightIs } = rightEvent(isRightClick)
                handlerRight = handlerRightIs
                ElMessage({
                    message: '请点击地球上任意位置',
                    type: 'success'
                })
            }
        })
        //
        // ///左键点击添加
        watchEffect(() => {
            if (itemCoor.value instanceof Cesium.Cartesian3) {
                car3Array.push(toRaw(itemCoor.value))
                const lonlat = car3ToLonLatDegree(toRaw(itemCoor.value))
                lonLatArray.push([toRaw(lonlat.value.x), toRaw(lonlat.value.y)])
                // 绘制点
                const pointId = 'point' + nanoid(6) // 设置随机id
                itemPointId.push(pointId)
                drawPointColor(itemCoor.value, pointId, index, 'yellow') // 绘制点
                //
                const PolygonEntity = window.viewer.entities.getById(polygonId) // 获取当前线段
                if (car3Array.length >= 3 && PolygonEntity) {
                    PolygonEntity.polygon.hierarchy = [...toRaw(car3Array)]
                    const area = calArea(lonLatArray).toFixed(3)
                    const length = calLength(lonLatArray).toFixed(3)
                    const lastTableDataItem = tableData.at(-1)
                    if (polygonId === lastTableDataItem.id) {
                        lastTableDataItem.length = toRaw(length)
                        lastTableDataItem.area = toRaw(area)
                    }
                } else if (car3Array.length === 3 && !PolygonEntity) {
                    drawPolygon(polygonId, [...toRaw(car3Array)])
                    const area = calArea(lonLatArray).toFixed(3)
                    const length = calLength(lonLatArray).toFixed(3)
                    const tableDataItem = {
                        id: polygonId,
                        index: toRaw(tableData.length) + 1,
                        length,
                        area
                    }
                    tableData.push(tableDataItem)
                }
                index++
            }
        })
        //
        //
        watchEffect(() => {
            if (isRightClick.value) {
                const PolygonEntity = window.viewer.entities.getById(polygonId) // 获取当前线段
                if (PolygonEntity && itemPointId.length) {
                    // 线
                    car3Array.pop()
                    lonLatArray.pop()
                    PolygonEntity.polygon.hierarchy = [...toRaw(car3Array)]
                    //
                    if (lonLatArray.length >= 3) {
                        const area = calArea(lonLatArray).toFixed(3)
                        const length = calLength(lonLatArray).toFixed(3)
                        const lastTableDataItem = tableData.at(-1)
                        if (polygonId === lastTableDataItem.id) {
                            lastTableDataItem.length = toRaw(length)
                            lastTableDataItem.area = toRaw(area)
                        }
                    } else {
                        const lastTableDataItem = tableData.at(-1)
                        if (polygonId === lastTableDataItem.id) {
                            lastTableDataItem.length = 0
                            lastTableDataItem.area = 0
                        }
                    }

                    // 点
                    const lastPointId = itemPointId.pop()
                    window.viewer.entities.removeById(lastPointId)
                    if (index-- < 0) {
                        index = 1
                    }
                }

                isRightClick.value = false
            }
        })
        //
        const savaAll = () => {
            if (itemPointId.length >= 3) {
                // 点
                entityIds.push(...itemPointId)
                itemPointId = []
                // 线
                entityIds.push(polygonId)
                polygonId = 'pg' + nanoid(6)
                //
                car3Array = []
                lonLatArray = []
                //
                index = 1
            }
        }
        //
        const clearAll = () => {
            for (let i = 0; i < entityIds.length; i++) {
                window.viewer.entities.removeById(entityIds[i])
            }
            entityIds = []
            for (let i = 0; i < itemPointId.length; i++) {
                window.viewer.entities.removeById(itemPointId[i])
            }
            itemPointId = []
            window.viewer.entities.removeById(polygonId)
            polygonId = 'pg' + nanoid(6)
            //
            car3Array = []
            lonLatArray = []
            tableData.length = 0
            index = 1
            itemCoor.value = null
        }
        //
        const doubleClik = (row) => {
            if (window.viewer) {
                const heading = Cesium.Math.toRadians(0.0)
                const pitch = Cesium.Math.toRadians(-90.0)
                const entity = window.viewer.entities.getById(row.id)
                window.viewer.zoomTo(
                    entity,
                    new Cesium.HeadingPitchRange(heading, pitch, 1000)
                )
            }
        }
        // 销毁事件和停止监听
        watch(
            () => route.params.id,
            (newVal) => {
                if (newVal !== 'calarea' && handlerLeft) {
                    // 当路由变化，销毁事件
                    handlerLeft.destroy()
                    handlerLeft = null
                    handlerRight.destroy()
                    handlerRight = null
                }
            },
            { immediate: true }
        )
        // ///

        return {
            index,
            polygonId,
            tableData,
            entityIds,
            savaAll,
            clearAll,
            doubleClik
        }
    }
})
</script>

<style scoped lang="scss">
.cal-area {
    width: 550px;
    padding: 5px;
    position: absolute;
    top: 5px;
    right: 5px;
    border-radius: 10px 10px 10px 10px;
    background-color: #fff;
    z-index: 999;
    .el-text {
        margin: 0 0 5px 10px;
    }
    // .el-table {
    //     margin: 0 0 10px 0;
    // }
    .el-row {
        margin: 10px 0 5px 0;
        text-align: center;
    }
}
</style>
