import * as Cesium from 'cesium'

export const drawPolygon = (id, car3Array) => {
    const viewer = window.viewer
    const entityPolygon = viewer.entities.add({
        id,
        polygon: {
            // extrudedHeight: 10,
            // height: 0,
            hierarchy: car3Array,
            material: Cesium.Color.RED.withAlpha(0.3)
            // fill: true,
            // outline: true,
            // outlineColor: Cesium.Color.YELLOW
            // outlineWidth: 1,
            // extrudedHeightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            // hierarchy: {
            //     positions: Cesium.Cartesian3.fromDegreesArray([
            //         -99.0, 30.0, -85.0, 30.0, -85.0, 40.0, -99.0, 40.0
            //     ])
            // },
            // material: Cesium.Color.BLUE.withAlpha(0.5),
            // height: 0,
            // outline: true // height is required for outline to display
        }
    })
    return entityPolygon
}
