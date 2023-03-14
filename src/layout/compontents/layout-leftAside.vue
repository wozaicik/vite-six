<template>
    <div>
        <span class="topIcon">
            <el-icon :size="18" @click="toggle()">
                <Expand v-if="!isLeftCollapse" />
                <Fold v-if="isLeftCollapse" />
            </el-icon>
        </span>
        <div>
            <el-menu
                active-text-color="#ffd04b"
                background-color="#545c64"
                text-color="#fff"
                :collapse="isLeftCollapse"
                unique-opened
                router
            >
                <el-sub-menu
                    v-for="sub in leftAsideOptions"
                    :key="sub.id"
                    :index="sub.id"
                >
                    <template #title>
                        <el-icon><component :is="sub.icon" /></el-icon>
                        <span>{{ sub.name }}</span>
                    </template>
                    <el-menu-item
                        v-for="item in sub.children"
                        :key="item.id"
                        :index="item.path"
                        @click="changeCS(sub.id, item)"
                    >
                        <el-icon><component :is="item.icon" /></el-icon>
                        <span>{{ item.name }}</span>
                    </el-menu-item>
                </el-sub-menu>
            </el-menu>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import { leftAsideOptions } from '@/api/constants.js'
import { layoutStore } from '@/store/index'
import { storeToRefs } from 'pinia'

export default defineComponent({
    name: 'LayOutLeftAside',
    setup () {
        const store = layoutStore()
        const { isLeftCollapse } = storeToRefs(store)
        const toggle = () => {
            isLeftCollapse.value = !isLeftCollapse.value
        }

        const changeCS = (id, item) => {
            if (id === 'CS') {
                store.setCoorSystem(item.id)
            }
        }
        return {
            leftAsideOptions,
            isLeftCollapse,
            toggle,
            changeCS
        }
    }
})
</script>

<style scoped lang="scss">
div {
    width: 100%;
    height: 100%;
    .topIcon {
        display: block;
        width: 100%;
        height: 20px;
        margin: 0;
        padding: 5px;
        color: #fff;
        background-color: #545c64;
        text-align: center;
        .el-icon {
            width: 100%;
            line-height: 20px;
        }
    }
    > div {
        width: 100%;
        height: 100%;
        .el-menu {
            border: 0;
            width: 100%;
            height: 100%;
        }
    }
}
</style>
