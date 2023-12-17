<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import * as echarts from 'echarts'
import request from '@/utils/request'

import global from '@/Globl'

require('echarts/theme/macarons') // echarts theme

import resize from '@/views/dashboard/admin/components/mixins/resize'
import { setToken } from '@/utils/auth'

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
          text: 'Multi-core CPU usage vs. time'
        },
        tooltip: {},
        // legend: {
        //     data: ['CPU']
        // },
        grid: {
          left: '3%',
          right: '2%',

          containLabel: true
        },
        xAxis: {
          data: [],
          name: 'Time (min)',
          nameLocation: 'middle',
          nameGap: 25,
          axisLabel: {
            // 坐标轴刻度标签的相关设置
            show: false,
            textStyle: {
              // color: '#6FCEFF', // 字体颜色
              fontSize: 12 // 刻度字体大小
            }
          }
        },
        yAxis: {
          name: 'CPU usage (%)',
          nameLocation: 'middle',
          nameGap: 35
        },
        series: [{
          name: 'CPU',
          data: [],
          type: 'bar'
          // barWidth: 8
        }],

        visualMap: [
          {
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 100
          }
        ]
      }
    }
  },
  mounted() {
    // console.log(this.algo)
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
                if (key2 === 'cpu') {
                  let cpuJson = data[key1][key2]
                  // this.option.xAxis.data.shift()
                  // this.option.series[0].data.shift()
                  this.option.xAxis.data.push(cpuJson.time)
                  this.option.series[0].data.push(cpuJson.value)
                  // console.log(JSON.stringify(cpuJson.time))
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
        // console.log(response)
        let datas = response.res
        for (let data of datas) {
          for (let key1 in data) {
            if (this.algo == key1) {
              for (let key2 in data[key1]) {
                if (key2 === 'cpu') {
                  let cpuJson = data[key1][key2]
                  // this.option.xAxis.data.shift()
                  // this.option.series[0].data.shift()
                  this.option.xAxis.data.push(cpuJson.time)
                  this.option.series[0].data.push(cpuJson.value)
                  // console.log(JSON.stringify(cpuJson.time))
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

        let dt = new Date()
        let time = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds()
        let value = Math.floor(Math.random() * 50 + 20)
        this.option.xAxis.data.push(time)
        this.option.series[0].data.push(value)
        this.chart.setOption(this.option)
      }, 5001)
    },
    initChart() {
      // this.chart = echarts.init(this.$el, 'macarons')
      //
      // this.chart.setOption(this.option)
      // this.chart.showLoading()
      this.websocket()
      // this.loopChart()
    },
    websocket() {

      let ws = new WebSocket(global.WS_APP_BASE_API)
      ws.onopen = () => {
        // Web Socket 已连接上，使用 send() 方法发送数据
        //console.log('数据发送中...')
        //ws.send('Holle')
        //console.log('数据发送完成')
      }
      ws.onmessage = evt => {
        console.log('数据已接收...')
        // console.log(evt.data)
        let resJson = JSON.parse(evt.data)
        for (let key1 in resJson) {
          if (this.algo == key1) {
            for (let key2 in resJson[key1]) {
              if (key2 === 'cpu') {
                let cpuJson = resJson[key1][key2]
                // this.option.xAxis.data.shift()
                // this.option.series[0].data.shift()
                let tlen = this.option.xAxis.data.length
                if(tlen>60){
                  this.option.xAxis.data.splice(0, tlen-60)
                  this.option.series[0].data.splice(0, tlen-60)
                }
                this.option.xAxis.data.push(cpuJson.time)
                this.option.series[0].data.push(cpuJson.value)
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
