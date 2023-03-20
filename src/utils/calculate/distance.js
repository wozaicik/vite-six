import * as turf from '@turf/turf'
import { car3ToLonLatDegree } from '../coordinate/car3To'

/**
 * 计算两点之间的距离
 * @param {Cartesian3} car3PointFrom car3格式的点
 * @param {Cartesian3} car3PointTo car格式的点
 */
export const turfDistance = (car3PointFrom, car3PointTo) => {
    const latLonFrom = car3ToLonLatDegree(car3PointFrom)
    const latLonTo = car3ToLonLatDegree(car3PointTo)

    const from = turf.point([latLonFrom.value.x, latLonFrom.value.y])
    const to = turf.point([latLonTo.value.x, latLonTo.value.y])

    const dis = (turf.distance(from, to) * 1000).toFixed(3)

    return dis
}
