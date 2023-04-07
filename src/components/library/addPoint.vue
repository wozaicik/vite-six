<template>
    <div class="add-point">
        <el-text size="large">新建地标</el-text>
        <el-card
            class="name-card"
            :body-style="{ padding: '3px' }"
            shadow="hover"
        >
            <el-row class="name" justify="space-around">
                <el-col :span="4"><span>名称</span></el-col>
                <el-col :span="16"><el-input v-model="labelText" /></el-col>
                <el-col :span="4"><el-button text>选择样式</el-button></el-col>
            </el-row>
        </el-card>
        <el-card class="coor-card" shadow="hover">
            <el-row class="coor-ll" justify="space-around">
                <el-col :span="8">
                    <span>L：</span>
                    <el-input-number
                        v-model="LonLat.x"
                        :precision="8"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'lonlat')"
                    />
                </el-col>
                <el-col :span="8">
                    <span>L：</span>
                    <el-input-number
                        v-model="LonLat.y"
                        :precision="8"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'lonlat')"
                    />
                </el-col>
                <el-col :span="8">
                    <span>H：</span>
                    <el-input-number
                        v-model="LonLat.z"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'lonlat')"
                    />
                </el-col>
            </el-row>
            <el-row class="coor-ll" justify="space-around">
                <el-col :span="8">
                    <span>X：</span>
                    <el-input-number
                        v-model="cgcs.x"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'cgcs')"
                    />
                </el-col>
                <el-col :span="8">
                    <span>Y：</span>
                    <el-input-number
                        v-model="cgcs.y"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'cgcs')"
                    />
                </el-col>
                <el-col :span="8">
                    <span>H：</span>
                    <el-input-number
                        v-model="cgcs.z"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'cgcs')"
                    />
                </el-col>
            </el-row>
            <el-row class="coor-ll" justify="space-around">
                <el-col :span="8">
                    <span>x：</span>
                    <el-input-number
                        v-model="local.x"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'local')"
                    />
                </el-col>
                <el-col :span="8">
                    <span>y：</span>
                    <el-input-number
                        v-model="local.y"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'local')"
                    />
                </el-col>
                <el-col :span="8">
                    <span>H：</span>
                    <el-input-number
                        v-model="local.z"
                        :precision="3"
                        :controls="false"
                        size="small"
                        @change="changeCoorFn($event, 'local')"
                    />
                </el-col>
            </el-row>
        </el-card>
        <el-card
            class="style-card"
            :body-style="{ padding: '8px' }"
            shadow="hover"
        >
            <el-row justify="space-between">
                <el-col :span="4">
                    <span>标签</span>
                </el-col>
                <el-col :span="10">
                    <span>颜色：</span>
                    <el-color-picker show-alpha size="small" />
                </el-col>
                <el-col :span="10">
                    <span>比例：</span>
                    <el-input-number
                        :min="0"
                        :max="10"
                        :precision="2"
                        :step="0.1"
                        size="small"
                        controls-position="right"
                    />
                </el-col>
            </el-row>
            <el-row justify="space-between">
                <el-col :span="4">
                    <span>图标</span>
                </el-col>
                <el-col :span="10">
                    <span>颜色：</span>
                    <el-color-picker show-alpha size="small" />
                </el-col>
                <el-col :span="10">
                    <span>比例：</span>
                    <el-input-number
                        :min="0"
                        :max="10"
                        :precision="2"
                        :step="0.1"
                        size="small"
                        controls-position="right"
                    />
                </el-col>
            </el-row>
        </el-card>
        <el-card
            class="desc-card"
            shadow="hover"
            :body-style="{ padding: '10px' }"
        >
            <el-row class="card-header" justify="space-between">
                <el-col :span="4"><span>说明描述</span></el-col>
                <el-col :span="4"><el-button text>插入图片</el-button></el-col>
            </el-row>
            <el-input :rows="4" type="textarea" placeholder="Please input" />
        </el-card>
        <el-row justify="center" class="bt">
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
                <el-button round size="small">批量插入</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { defineComponent, ref, watch, watchEffect, toRaw } from 'vue'
import { nanoid } from 'nanoid'
import { leftEvent } from './twoPointDistance.vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { layoutStore } from '@/store/index.js'
import { ElMessage } from 'element-plus'
import {
    car3ToLonLatDegree,
    car3ToCGCS,
    car3ToLocal
} from '@/utils/coordinate/car3To.js'
import {
    lonLatDegreeToCar3,
    CGCSToCar3,
    localToCar3
} from '@/utils/coordinate/toCar3.js'
import * as Cesium from 'cesium'

export default defineComponent({
    name: 'addPoint',
    // eslint-disable-next-line space-before-function-paren
    setup() {
        // 事件相关
        let handlerLeft
        // 名称
        const entityId = 'mark' + nanoid(6) // id
        const labelText = ref('未命名地标') // label中显示的文字

        // 坐标
        const itemCoor = ref(null)
        const LonLat = ref({ x: 0, y: 0, z: 0 })
        const cgcs = ref({ x: 0, y: 0, z: 0 })
        const local = ref({ x: 0, y: 0, z: 0 })

        // 开启事件
        const route = useRoute()
        const store = layoutStore()
        const { isViewer } = storeToRefs(store)
        watch(
            () => [isViewer, route.params.id],
            ([newIsV, newId]) => {
                if (newIsV.value && newId === 'addPoint') {
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
        // 鼠标点击后，car3坐标改变，其它坐标也要做相应计算
        watch(itemCoor, (newCoor) => {
            if (newCoor instanceof Cesium.Cartesian3) {
                LonLat.value = car3ToLonLatDegree(toRaw(newCoor)).value
                cgcs.value = car3ToCGCS(toRaw(newCoor)).value
                local.value = car3ToLocal(toRaw(newCoor)).value
            }
        })
        //
        const changeCoorFn = (changeValue, coorStyle) => {
            const car3 = ref(null)
            if (coorStyle === 'lonlat') {
                car3.value = lonLatDegreeToCar3(
                    toRaw(LonLat.value.x),
                    toRaw(LonLat.value.y),
                    toRaw(LonLat.value.z)
                ).value
            } else if (coorStyle === 'cgcs') {
                car3.value = CGCSToCar3(
                    toRaw(cgcs.value.x),
                    toRaw(cgcs.value.y),
                    toRaw(cgcs.value.z)
                ).value
            } else if (coorStyle === 'local') {
                car3.value = localToCar3(
                    toRaw(local.value.x),
                    toRaw(local.value.y),
                    toRaw(local.value.z)
                ).value
            }
            if (car3.value) {
                itemCoor.value = car3.value
            }
        }
        //
        //
        //
        return {
            labelText,
            entityId,
            itemCoor,
            LonLat,
            cgcs,
            local,
            changeCoorFn
        }
    }
})
</script>

<style scoped lang="scss">
.add-point {
    width: 530px;
    height: 508px;
    padding: 5px;
    position: absolute;
    top: 5px;
    right: 5px;
    border-radius: 10px 10px 10px 10px;
    background-color: #fff;
    z-index: 999;
    .el-text {
        margin: 10px 10px 10px 10px;
        // padding: 10px 0;
        // font-size: 16px;
    }
    .name-card {
        margin: 10px 0 5px 0;
        .name {
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 15px;
            // border: 1px solid;
        }
    }
    .coor-card {
        // padding: 5px 10px;
        margin-bottom: 5px;
        .coor-ll {
            font-size: 15px;
            text-align: center;
            .el-input-number {
                width: 130px;
            }
        }
        .coor-ll:nth-child(2) {
            margin: 10px 0;
        }
    }
    .style-card {
        // padding: 0;
        font-size: 15px;
        text-align: center;
        margin-bottom: 5px;
        .el-row {
            .el-col {
                height: 30px;
                line-height: 30px;
            }
        }
    }
    .desc-card {
        font-size: 15px;
        margin-bottom: 8px;
        .card-header {
            height: 32px;
            line-height: 32px;
            text-align: center;
        }
    }
    .bt {
        text-align: center;
    }
}
</style>
