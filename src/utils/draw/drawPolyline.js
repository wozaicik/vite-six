import * as Cesium from 'cesium'
// import { toRaw } from 'vue'

/**
 *  绘制线entity
 * @param {Array} coordinates - 线段的坐标数组
 * @param {Cartesian3} tpMidPoint - label的坐标
 * @param {String} id - entity的id
 * @param {Number} distance - 线段的距离
 * @returns
 */
export const drawPolyline = (coordinates, id) => {
    let viewer = window.viewer
    viewer.entities.add({
        id,
        polyline: {
            positions: [coordinates[0], coordinates[1]],
            width: 1.5,
            material: Cesium.Color.YELLOW,
            clampToGround: true
        }
    })
    viewer = null
}
