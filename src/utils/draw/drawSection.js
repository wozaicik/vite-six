import * as echarts from 'echarts'
export const drawSection = (data) => {
    const chartDom = document.getElementById('Footer')
    const myChart = echarts.init(chartDom, null, {
        width: 1856,
        height: 300
    })
    myChart.resize()

    const option = {
        title: {
            left: 'center',
            top: 12,
            text: '断面图'
        },
        toolbox: {
            feature: {
                saveAsImage: {},
                dataView: {}
            }
        },
        xAxis: {
            // type: 'value',
            type: 'category',
            name: '里程',
            nameLocation: 'middle',
            nameGap: 40,
            axisTick: {
                show: true,
                alignWithLabel: true
            }
        },
        yAxis: {
            type: 'value',
            name: '高程',
            nameLocation: 'middle',
            nameGap: 45,
            nameRotate: 0,
            scale: true,
            axisLine: {
                show: true
            }
        },
        tooltip: {
            // position: ['83%', '15%'],
            trigger: 'axis',
            axisPointer: {
                // 十字准星
                type: 'cross'
            }
        },
        series: [
            {
                name: '高程',
                symbol: 'none',
                lineStyle: {
                    color: '#0d233a',
                    width: 2
                },
                data,
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: '#8bbc21'
                }
            }
        ]
    }

    option && myChart.setOption(option)
}
