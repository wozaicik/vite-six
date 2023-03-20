import * as Cesium from 'cesium'
import { toRaw } from 'vue'

/**
 * 绘制point entity
 * @param {Cartesian3} coor - 点的坐标
 * @param {*} id - entity的id
 * @param {*} index label的文字显示内容
 * @returns entity
 */
export const drawPoint = (coor, id, index) => {
    let viewer = window.viewer
    const entityPoint = viewer.entities.add({
        id,
        position: toRaw(coor),
        // position: toRaw(coor.value),
        point: {
            color: Cesium.Color.RED,
            pixelSize: 1.5,
            outlineColor: Cesium.Color.YELLOW,
            // outlineWidth: 1,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            // disableDepthTestDistance: 0
            disableDepthTestDistance: Number.POSITIVE_INFINITY
            // heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
            // heightReference: Cesium.HeightReference.NONE
        },
        label: {
            text: index.toString(),
            font: '16px sans-serif',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: Cesium.VerticalOrigin.BASELINE,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            // disableDepthTestDistance: 0 // draws the label in front of terrain
            disableDepthTestDistance: Number.POSITIVE_INFINITY // draws the label in front of terrain
        }
    })
    viewer = null

    return { entityPoint }
}
