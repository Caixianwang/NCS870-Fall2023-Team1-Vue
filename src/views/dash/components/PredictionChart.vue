<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import * as echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import resize from '@/views/dashboard/admin/components/mixins/resize'
import global from '@/Globl'
import request from '@/utils/request'

export default {
  mixins: [resize],
  props: {
    algo: {
      type: String,
      default: 'VFBLS'
    },
    datas: {
      type: Array,
      default: []
    },
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null,
      currInterval: null,
      option: {
        title: {
          text: 'Prediction vs. time'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            saveAsImage: { show: true }
          }
        },
        grid: {
          left: '3%',
          right: '2%',

          containLabel: true
        },
        legend: {
          data: ['Predicted class']
        },
        xAxis: {
          data: [],
          name: 'Time (min)',
          nameLocation: 'middle',
          nameGap: 25,
          boundaryGap: false,
          splitLine: {
            show: true
          },
          axisLine: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: ['Regular', 'Anomaly']
        },
        series: [
          {
            name: 'Predicted class',
            data: [],  //y values
            type: 'scatter',
            symbolSize: function(val) {
              // return val[2] * 1;
              return 15
            },
            animationDelay: function(idx) {
              return idx * 5
            },
            color: 'rgb(255, 70, 131)'
          }
        ]
      }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$el, 'macarons')
    this.chart.setOption(this.option)
    this.$nextTick(() => {
      for (let i = 0; i < 1; i++) {
        this.option.xAxis.data.splice(0, 0, '')
        this.option.series[0].data.splice(0, 0, '')
      }
      this.initList()
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    // this.chart.dispose()
    // this.chart = null
    // clearInterval(this.currInterval)
  },
  methods: {
    initList() {
        for (let data of this.datas) {
          for (let key1 in data) {
            if (this.algo == key1) {
              for (let key2 in data[key1]) {
                if (key2 === 'prediction') {
                  let currJson = data[key1][key2]
                  let times = currJson.times
                  let values = currJson.values
                  for (let t of times) {
                    this.option.xAxis.data.push(t)
                  }
                  for (let v of values) {
                    this.option.series[0].data.push(v)
                  }
                  this.chart.setOption(this.option)
                }
              }
            }
          }
        }
    },
    queryList() {
      request({
        url: '/getList',
        method: 'get'
      }).then(response => {
        // console.log("---------------"+response)
        let datas = response.res
        for (let data of datas) {
          for (let key1 in data) {
            if (this.algo == key1) {
              for (let key2 in data[key1]) {
                if (key2 === 'prediction') {
                  let currJson = data[key1][key2]
                  let times = currJson.times
                  let values = currJson.values
                  for (let t of times) {
                    this.option.xAxis.data.push(t)
                  }
                  for (let v of values) {
                    this.option.series[0].data.push(v)
                  }
                  this.chart.setOption(this.option)
                }
              }
            }
          }
        }
      }).catch(error => {

      })
    },
    loopChart() {
      this.currInterval = setInterval(() => {

        this.option.xAxis.data.shift()
        this.option.series[0].data.shift()
        this.option.series[0].data.shift()

        let dt = new Date()
        let time = dt.getHours() + ':' + dt.getMinutes()
        let regularValue = Math.floor(Math.random() * 15 + 80)
        let anomalyValue = Math.floor(Math.random() * 15 + 10)
        this.option.xAxis.data.push(time)
        this.option.series[0].data.push([time, 0, regularValue])
        this.option.series[0].data.push([time, 1, anomalyValue])
        this.chart.setOption(this.option)
      }, 60001)
    },

    initChart() {
      // this.chart = echarts.init(this.$el, 'macarons')
      // this.chart.setOption(this.option)
      // this.loopChart()
      this.websocket()
    },
    websocket() {
      let ws = new WebSocket(global.WS_APP_BASE_API)
      ws.onopen = () => {
      }
      ws.onmessage = evt => {
        // console.log('数据已接收...')
        // console.log(evt.data)
        let resJson = JSON.parse(evt.data)
        for (let key1 in resJson) {
          if (this.algo == key1) {
            for (let key2 in resJson[key1]) {
              if (key2 === 'prediction') {
                let currJson = resJson[key1][key2]
                let tlen = this.option.xAxis.data.data
                if(tlen>50){
                  this.option.xAxis.data.splice(0, tlen-50)
                  this.option.series[0].data.splice(0, tlen-50)
                }

                let times = currJson.times
                let values = currJson.values
                for (let t of times) {
                  this.option.xAxis.data.push(t)
                }
                for (let v of values) {
                  this.option.series[0].data.push(v)
                }
                this.chart.setOption(this.option)
              }
            }
          }
        }
      }
      ws.onclose = function() {
        // 关闭 websocket
        console.log('连接已关闭...')
      }
      // 路由跳转时结束websocket链接
      this.$router.afterEach(function() {
        ws.close()
      })
    }
  }
}
</script>
