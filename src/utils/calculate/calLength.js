// import * as Cesium from 'cesium'
import * as turf from '@turf/turf'

export const calLength = (lonLatArray) => {
    const coorArray = [...lonLatArray]
    coorArray.push(lonLatArray[0])
    const line = turf.lineString([...coorArray])
    const length = turf.length(line) * 1000
    return length
}
