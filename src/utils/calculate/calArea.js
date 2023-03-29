// import * as Cesium from 'cesium'
import * as turf from '@turf/turf'

export const calArea = (lonLatArray) => {
    const coorArray = [...lonLatArray]
    coorArray.push(lonLatArray[0])
    const polygon = turf.polygon([[...coorArray]])
    const area = turf.area(polygon)
    return area
}
