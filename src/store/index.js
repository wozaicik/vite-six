import { defineStore } from 'pinia'

export const layoutStore = defineStore('layout', {
    state: () => ({
        isLeftCollapse: true, // 左侧菜单栏的缩放控制
        isViewer: false, // 判断地球是否加载完毕
        isFooterOpen: false, // 底部界面的上升下降控制
        coordinateSystem: 'lonLat'
    }),
    actions: {
        setIsViewer (isBool) {
            this.isViewer = isBool
        },
        setCoorSystem (cs) {
            this.coordinateSystem = cs
        }
    },
    getters: {}
})
