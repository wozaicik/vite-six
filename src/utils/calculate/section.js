import * as Cesium from 'cesium'
import { car3ToLonLatDegree } from '../coordinate/car3To'
import { turfDistance } from '@/utils/calculate/distance.js'

export const calSection = async (entityId) => {
    const sectionData = []
    const length = 50

    const viewer = window.viewer

    const ployLineEntity = viewer.entities.getById(entityId)

    const coorArray = ployLineEntity.polyline.positions.getValue()

    const terrainSamplePositions = []
    const positionsLerpDistance = []
    let startDistance = 0

    let lastLon = 0
    let lastLat = 0
    let lastDis = 0

    for (let i = 0; i < coorArray.length - 1; i++) {
        const startCar3 = coorArray[i]
        const endCar3 = coorArray[i + 1]

        const endDistance =
            Number(startDistance) + Number(turfDistance(startCar3, endCar3))

        const startLonLat = car3ToLonLatDegree(startCar3)
        const endLonLat = car3ToLonLatDegree(endCar3)

        const startLon = Cesium.Math.toRadians(startLonLat.value.x)
        const endLon = Cesium.Math.toRadians(endLonLat.value.x)

        const startLat = Cesium.Math.toRadians(startLonLat.value.y)
        const endLat = Cesium.Math.toRadians(endLonLat.value.y)

        for (let j = 0; j < length - 1; ++j) {
            const lon = Cesium.Math.lerp(startLon, endLon, j / (length - 1))
            const lat = Cesium.Math.lerp(startLat, endLat, j / (length - 1))

            const distance = Cesium.Math.lerp(
                startDistance,
                endDistance,
                j / (length - 1)
            )

            const position = new Cesium.Cartographic(lon, lat)
            terrainSamplePositions.push(position)
            positionsLerpDistance.push(distance)
        }
        lastLon = endLon
        lastLat = endLat
        lastDis = endDistance
        startDistance = endDistance
    }
    const position = new Cesium.Cartographic(lastLon, lastLat)
    terrainSamplePositions.push(position)
    positionsLerpDistance.push(lastDis)

    await Promise.resolve(
        Cesium.sampleTerrainMostDetailed(
            viewer.terrainProvider,
            terrainSamplePositions
        )
    ).then((samples) => {
        for (let i = 0; i < samples.length; i++) {
            const tempArray = [
                Number(positionsLerpDistance[i].toFixed(2)),
                Number(samples[i].height.toFixed(2))
            ]
            sectionData.push(tempArray)
        }
    })
    // console.log(sectionData)
    return sectionData
}
