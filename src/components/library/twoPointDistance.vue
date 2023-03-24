<template>
    <div class="two-point">
        <el-text size="large">测量地面上两个点之间的距离</el-text>
        <el-table
            :data="tableData"
            style="width: 100%"
            max-height="500"
            @row-dblclick="(row) => doubleClik(row)"
        >
            <template #empty>
                <el-text size="large">---请使用鼠标左键点击选择位置---</el-text>
                <el-text size="large">--可双击选中行跳转位置--</el-text>
            </template>
            <el-table-column type="expand" fixed>
                <template #default="props">
                    <div>
                        <h3>坐标</h3>
                        <el-table
                            :data="props.row.coor"
                            style="width: 100%"
                            border
                            header-align="center"
                            align="center"
                        >
                            <el-table-column
                                label="序号"
                                prop="num"
                                width="60"
                                header-align="center"
                                align="center"
                            />
                            <el-table-column
                                label="国家-x"
                                prop="cgcsx"
                                header-align="center"
                                align="center"
                            />
                            <el-table-column
                                label="国家-y"
                                prop="cgcsy"
                                header-align="center"
                                align="center"
                            />
                            <el-table-column
                                label="地方-x"
                                prop="localx"
                                header-align="center"
                                align="center"
                            />
                            <el-table-column
                                label="地方-y"
                                prop="localy"
                                header-align="center"
                                align="center"
                            />
                            <el-table-column
                                label="高程"
                                prop="height"
                                width="75"
                                header-align="center"
                                align="center"
                            />
                        </el-table>
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                label="线段"
                prop="lineName"
                header-align="center"
                align="center"
            />
            <el-table-column
                label="地图上的距离"
                prop="distacne"
                header-align="center"
                align="center"
            />
        </el-table>
        <el-row justify="space-evenly">
            <el-col :span="6"
                ><el-button round size="small" @click="clearAll()"
                    >清除所有</el-button
                ></el-col
            >
            <el-col :span="6"></el-col>
            <el-col :span="6"></el-col>
        </el-row>
    </div>
</template>

<script>
import { defineComponent, ref, watch, watchEffect, reactive } from 'vue'
import * as Cesium from 'cesium'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { layoutStore } from '@/store/index.js'
import { ElMessage } from 'element-plus'
import { drawPoint } from '@/utils/draw/drawPoint.js'
import { drawPolyline } from '@/utils/draw/drawPolyline.js'
import { nanoid } from 'nanoid'
import { turfDistance } from '@/utils/calculate/distance.js'
import { car3ToCGCS, car3ToLocal } from '@/utils/coordinate/car3To.js'

export default defineComponent({
    name: 'twoPointDistance',
    setup () {
        const index = ref(1) // 序号
        const coorArray = [] // 存储坐标的集合
        const itemCoor = ref(null) // 存储单个坐标
        const ids = [] // 存储entity-id的集合
        let handlerLeft // 鼠标左键点击事件
        let handlerRight // 鼠标右键点击事件
        const tableData = reactive([])
        // ////
        const route = useRoute()
        const store = layoutStore()
        const { isViewer } = storeToRefs(store)
        watch(
            () => [isViewer, route.params.id],
            ([newIsV, newId]) => {
                if (newIsV.value && newId === 'twoPointDistance') {
                    const { handler } = leftEvent(itemCoor)
                    handlerLeft = handler
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
                ElMessage({
                    message: '请点击地球上任意位置',
                    type: 'success'
                })
            }
        })

        // ///
        watchEffect(() => {
            if (itemCoor.value instanceof Cesium.Cartesian3) {
                coorArray.push(itemCoor.value)
                const idRandom = 'point' + nanoid(6) // 设置随机id
                ids.push(idRandom)
                if (coorArray.length === 1) {
                    drawPoint(coorArray[0], idRandom, index.value)
                } else if (coorArray.length === 2) {
                    const idline = 'polyliny' + nanoid(6) // 设置随机id
                    ids.push(idline)
                    drawPoint(coorArray[1], idRandom, index.value)
                    drawPolyline(coorArray, idline)
                    const dis = turfDistance(coorArray[0], coorArray[1])
                    const CGCSFrom = car3ToCGCS(coorArray[0])
                    const localFrom = car3ToLocal(coorArray[0])
                    const CGCSTo = car3ToCGCS(coorArray[1])
                    const localTo = car3ToLocal(coorArray[1])
                    const lineName = index.value - 1 + '-' + index.value
                    const tableDataItem = {
                        lineName,
                        distacne: dis,
                        id: idline,
                        coor: [
                            {
                                num: index.value - 1,
                                cgcsx: CGCSFrom.value.x.toFixed(2),
                                cgcsy: CGCSFrom.value.y.toFixed(2),
                                localx: localFrom.value.x.toFixed(2),
                                localy: localFrom.value.y.toFixed(2),
                                height: CGCSFrom.value.z.toFixed(2)
                            },
                            {
                                num: index.value,
                                cgcsx: CGCSTo.value.x.toFixed(2),
                                cgcsy: CGCSTo.value.y.toFixed(2),
                                localx: localTo.value.x.toFixed(2),
                                localy: localTo.value.y.toFixed(2),
                                height: CGCSTo.value.z.toFixed(2)
                            }
                        ]
                    }
                    tableData.push(tableDataItem)
                    coorArray.length = 0
                }
                index.value++
            }
        })
        // ///
        // 鼠标双击事件，跳转线段所在位置
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
        //
        const clearAll = () => {
            if (ids.length) {
                for (let i = 0; i < ids.length; i++) {
                    const entity = window.viewer.entities.getById(ids[i])
                    window.viewer.entities.remove(entity)
                }
                index.value = 1 // 序号
                coorArray.length = 0 // 存储坐标的集合
                itemCoor.value = null // 存储单个坐标
                ids.length = 0 // 存储entity-id的集合
                tableData.length = 0
            }
        }
        // 销毁事件和停止监听
        watch(
            () => route.params.id,
            (newVal) => {
                if (newVal !== 'twoPointDistance' && handlerLeft) {
                    // 当路由变化，销毁事件
                    handlerLeft.destroy()
                    handlerLeft = null
                }
            },
            { immediate: true }
        )
        // ///
        return {
            tableData,
            index,
            ids,
            handlerLeft,
            handlerRight,
            coorArray,
            itemCoor,
            leftEvent,
            doubleClik,
            clearAll
        }
    }
})

export const leftEvent = (itemCoor) => {
    const viewer = window.viewer
    const cartesian = itemCoor
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.setInputAction((movement) => {
        cartesian.value = viewer.scene.pickPosition(movement.position)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    return { handler }
}

export const rightEvent = (isRightClick) => {
    const isclick = isRightClick
    const viewer = window.viewer
    const handlerRightIs = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handlerRightIs.setInputAction((movement) => {
        isclick.value = !isclick.value
        // console.log(isclick.value)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    return { handlerRightIs }
}
</script>

<style scoped lang="scss">
.two-point {
    width: 550px;
    min-height: 180px;
    padding: 5px;
    position: absolute;
    top: 5px;
    right: 5px;
    border-radius: 10px 10px 10px 10px;
    background-color: #fff;
    z-index: 999;
    .el-table {
        div {
            h3 {
                margin-left: 10px;
            }
            margin: 8px 0;
        }
    }
    .el-text {
        margin-left: 15px;
        height: 30px;
        line-height: 30px;
        text-align: center;
    }
    .el-row {
        border-radius: 0 0 8px 8px;
        margin-top: 10px;
        height: 28px;
        line-height: 28px;
        // background-color: skyblue;
        text-align: center;
    }
}
</style>
