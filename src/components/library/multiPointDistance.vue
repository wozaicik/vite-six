<template>
    <div class="mul-point">
        <el-text size="large">测量地面上多个点之间的距离</el-text>
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
                label="线段"
                header-align="center"
                align="center"
                prop="index"
            />
            >
            <el-table-column
                label="地图上的距离"
                header-align="center"
                align="center"
                prop="distance"
            />
            <el-table-column label="断面" header-align="center" align="center">
                <template #default="{ row }">
                    <el-button
                        link
                        type="primary"
                        size="small"
                        @click="claSection(row)"
                        >Section</el-button
                    >
                </template>
            </el-table-column>
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
            <el-col :span="8">
                <el-button round size="small" @click="closeFooter()"
                    >关闭断面</el-button
                >
            </el-col>
        </el-row>
    </div>
</template>

<script>
import {
    defineComponent,
    ref,
    reactive,
    watch,
    watchEffect,
    toRaw,
    computed
} from 'vue'
import * as Cesium from 'cesium'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { layoutStore } from '@/store/index.js'
import { ElMessage } from 'element-plus'
import { leftEvent, rightEvent } from './twoPointDistance.vue'
import { nanoid } from 'nanoid'
import { drawPoint } from '@/utils/draw/drawPoint.js'
import { drawPolyline } from '@/utils/draw/drawPolyline.js'
import { turfDistance } from '@/utils/calculate/distance.js'
import { calSection } from '@/utils/calculate/section.js'
import { drawSection } from '@/utils/draw/drawSection'

export default defineComponent({
    name: 'multipointDistance',
    // eslint-disable-next-line space-before-function-paren
    setup() {
        let index = 1 // 序号
        let itemLineId = 'line' + nanoid(6) // 存储当前线段的ID
        let coorArray = [] // 存储当前线段的坐标
        let itemPointId = [] // 存储当前线段点的id
        const itemCoor = ref(null) // 存储当前点的临时坐标
        const isRightClick = ref(false)

        let entityIds = [] // 存储已保存的线段id

        let handlerLeft // 存储鼠标左键事件
        let handlerRight // 存储鼠标右键事件

        const tableData = reactive([]) // 存储表格数据
        const disArray = reactive([])

        const tableLength = computed(() => {
            return tableData.length
        })
        const totalDis = computed(() => {
            return disArray.reduce(
                (p, c) => (Number(p) + Number(c)).toFixed(3),
                0
            )
        })
        // ////
        const route = useRoute()
        const store = layoutStore()
        const { isViewer } = storeToRefs(store)
        watch(
            () => [isViewer, route.params.id],
            ([newIsV, newId]) => {
                if (newIsV.value && newId === 'multipointDistance') {
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
                coorArray.push(toRaw(itemCoor.value))
                const pointId = 'point' + nanoid(6) // 设置随机id
                itemPointId.push(pointId)
                drawPoint(itemCoor.value, pointId, index) // 绘制点名
                const ployLineEntity =
                    window.viewer.entities.getById(itemLineId) // 获取当前线段
                if (coorArray.length >= 2 && ployLineEntity) {
                    ployLineEntity.polyline.positions.setValue([])
                    ployLineEntity.polyline.positions.setValue(coorArray)
                    const dis = turfDistance(coorArray.at(-1), coorArray.at(-2))
                    disArray.push(dis)
                } else if (coorArray.length === 2 && !ployLineEntity) {
                    drawPolyline(coorArray, itemLineId) // 绘制线段
                    const dis = turfDistance(coorArray[0], coorArray[1])
                    const tableDataItem = {
                        id: itemLineId,
                        index: toRaw(tableLength.value) + 1,
                        distance: dis
                    }
                    tableData.push(tableDataItem)
                    disArray.push(dis)
                }
                index++
            }
        })
        // 右键点击回退
        watch(isRightClick, (newVal) => {
            if (newVal && itemPointId.length) {
                const ployLineEntity =
                    window.viewer.entities.getById(itemLineId) // 获取当前线段
                const cArray = ployLineEntity.polyline.positions.getValue()
                cArray.pop()
                ployLineEntity.polyline.positions.setValue([])
                ployLineEntity.polyline.positions.setValue(cArray)
                disArray.pop()
                // //
                const pointId = itemPointId.pop()
                window.viewer.entities.removeById(pointId) // 移除当前id
                // //
                if (index-- <= 0) {
                    index = 1
                }
                isRightClick.value = false
            }
        })
        // // 修改当前线段的长度
        watch(
            () => disArray.length,
            (newVal) => {
                const itemTable = tableData[tableLength.value - 1]
                if (tableLength.value && itemTable.id === itemLineId) {
                    tableData[tableLength.value - 1].distance = toRaw(
                        totalDis.value
                    )
                }
            }
        )
        // 保存当前线段，同时初始化
        const savaAll = () => {
            if (index >= 2) {
                entityIds.push(itemLineId)
                entityIds.push(...itemPointId)
                itemPointId.length = 0
                itemLineId = 'line' + nanoid(6) // 新的线段id
                coorArray = []
                index = 1
                disArray.length = 0
            }
        }
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
            for (let i = 0; i < entityIds.length; i++) {
                window.viewer.entities.removeById(entityIds[i]) // 移除当前id
            }
            entityIds = []
            //
            for (let i = 0; i < itemPointId.length; i++) {
                window.viewer.entities.removeById(itemPointId[i]) // 移除当前id
            }
            itemPointId = []
            //
            window.viewer.entities.removeById(itemLineId)
            //
            tableData.length = 0
            coorArray = []
            disArray.length = 0
            index = 1 // 序号
            itemLineId = 'line' + nanoid(6) // 新的线段id
        }
        //
        // 关闭断面
        const { isFooterOpen } = storeToRefs(store)
        const closeFooter = () => {
            if (isFooterOpen.value) {
                isFooterOpen.value = false
            }
        }
        // 绘制断面
        const claSection = (row) => {
            if (!isFooterOpen.value) {
                isFooterOpen.value = true
            }
            const sectionDate = calSection(row.id)
            sectionDate.then((value) => {
                drawSection(value)
            })
        }
        //
        // 销毁事件和停止监听
        watch(
            () => route.params.id,
            (newVal) => {
                if (newVal !== 'multipointDistance' && handlerLeft) {
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
            itemLineId,
            coorArray,
            itemCoor,
            entityIds,
            handlerLeft,
            handlerRight,
            tableData,
            savaAll,
            doubleClik,
            clearAll,
            claSection,
            closeFooter
        }
    }
})
</script>

<style scoped lang="scss">
.mul-point {
    width: 550px;
    // min-height: 180px;
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
