<template>
    <div class="layout-page">
        <el-container>
            <el-aside :class="{ leftcollapse: isLeftCollapse }">
                <layoutLeftAside></layoutLeftAside>
            </el-aside>
            <el-container>
                <el-main>
                    <viewer></viewer>
                </el-main>
                <el-footer v-show="isFooterOpen">
                    <div id="Footer"></div>
                </el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import { defineComponent } from 'vue'
import layoutLeftAside from './compontents/layout-leftAside.vue'
import { layoutStore } from '@/store/index'
import { storeToRefs } from 'pinia'
import viewer from '../views/viewer/viewer.vue'

export default defineComponent({
    name: 'Layout',
    components: {
        layoutLeftAside,
        viewer
    },
    // eslint-disable-next-line space-before-function-paren
    setup() {
        const store = layoutStore()
        const { isLeftCollapse, isFooterOpen } = storeToRefs(store)
        return {
            isLeftCollapse,
            isFooterOpen
        }
    }
})
</script>

<style scoped lang="scss">
.layout-page {
    width: 100%;
    height: 100%;
    > .el-container {
        width: 100%;
        height: 100%;
        .el-aside {
            width: 200px;
            height: 100%;
            overflow: hidden;
            background-color: #545c64;
            transition: width 0.5s ease;
        }
        .leftcollapse {
            width: 64px;
            transition: width 0.5s ease;
        }
        .el-main {
            margin: 0;
            padding: 0;
        }
        .el-footer {
            margin: 0;
            padding: 0;
            height: 300px;
            div {
                height: 100%;
                width: 100%;
            }
        }
    }
}
</style>
