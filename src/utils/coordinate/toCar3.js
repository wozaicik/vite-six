import * as Cesium from 'cesium'
import proj4 from 'proj4'
import { ref } from 'vue'

export const lonLatDegreeToCar3 = (x, y, z) => {
    const car3 = ref(null)
    if (x && y && z) {
        car3.value = Cesium.Cartesian3.fromDegrees(x, y, z)
    } else {
        return car3
    }
    return car3
}

export const CGCSToCar3 = (x, y, z) => {
    const car3 = ref(null)
    if (x && y && z) {
        proj4.defs([
            [
                'EPSG:4326',
                '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
            ],
            [
                'EPSG:CGCS2000',
                '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs'
            ]
        ])
        const lonLat = proj4('EPSG:CGCS2000', 'EPSG:4326', [x, y])
        return lonLatDegreeToCar3(lonLat[0], lonLat[1], z)
    } else {
        return car3
    }
}

export const localToCar3 = (x, y, z) => {
    const car3 = ref(null)
    if (x && y && z) {
        const dx = 386470
        const dy = 2529990
        const m = 1.0000198625012 // 缩放比例
        const da = -0.00486696148627 // 旋转角度
        const cgcsx = dx + m * Math.cos(da) * x - m * Math.sin(da) * y
        const cgcsy = dy + m * Math.sin(da) * x + m * Math.cos(da) * y
        return CGCSToCar3(cgcsx, cgcsy, z)
    } else {
        return car3
    }
}
