import * as Cesium from 'cesium'
import proj4 from 'proj4'
import { ref } from 'vue'

export const car3ToLonLatDegree = (car3) => {
    const lonLatDegree = ref({ x: 0, y: 0, z: 0 })
    if (car3) {
        const lonLatRadian = Cesium.Cartographic.fromCartesian(car3)
        lonLatDegree.value.x = Cesium.Math.toDegrees(
            lonLatRadian?.longitude ? lonLatRadian.longitude : 0
        )
        lonLatDegree.value.y = Cesium.Math.toDegrees(
            lonLatRadian?.latitude ? lonLatRadian.latitude : 0
        )
        lonLatDegree.value.z = lonLatRadian?.height ? lonLatRadian.height : 0
    } else {
        return lonLatDegree
    }
    return lonLatDegree
}

export const car3ToCGCS = (car3) => {
    const CGCS = ref({ x: 0, y: 0, z: 0 })
    if (car3) {
        const lonLatDegree = car3ToLonLatDegree(car3)
        const N = Math.ceil(lonLatDegree.value.x / 3)
        const L = N * 3
        proj4.defs([
            [
                'EPSG:4326',
                '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
            ],
            [
                'EPSG:CGCS2000',
                `+proj=tmerc +lat_0=0 +lon_0=${L} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs`
            ]
        ])
        const gsProj = proj4('EPSG:4326', 'EPSG:CGCS2000', [
            lonLatDegree.value.x,
            lonLatDegree.value.y
        ])
        CGCS.value.x = gsProj[0]
        CGCS.value.y = gsProj[1]
        CGCS.value.z = lonLatDegree.value.z
    } else {
        return CGCS
    }
    return CGCS
}

export const car3ToLocal = (car3) => {
    const local = ref({ x: 0, y: 0, z: 0 })
    if (car3) {
        const cgcs = car3ToCGCS(car3)
        const dx = -374140
        const dy = -2531790
        const m = 0.9999804396131 // 缩放比例
        const da = 0.0048672455037 // 旋转角度
        local.value.x =
            dx +
            m * Math.cos(da) * cgcs.value.x -
            m * Math.sin(da) * cgcs.value.y
        local.value.y =
            dy +
            m * Math.sin(da) * cgcs.value.x +
            m * Math.cos(da) * cgcs.value.y
        local.value.z = cgcs.value.z
    } else {
        return local
    }
    return local
}
