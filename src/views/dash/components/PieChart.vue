<template>
  <div style="display: flex;" :style="{flexDirection:Mobile?'column':'row'}">
    <div style="flex: 1" >
      <div style="">Coordinated Universal Time (UTC) when processing: </div>
        <div><span style="font-weight: bold;">{{tutc}}</span></div>
      <div style="font-weight: bold;margin-top: 5px">Predictions over the past five minutes:</div>
      <div style="height: 10px"></div>
      <div v-for="tt in webResults" style="margin-top: 5px">{{tt}}</div>
    </div>
    <div style="flex: 2.5" id="pie01" :class="className" :style="{height:height,width:width}"/>

  </div>

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
      webResults :[],
      tutc:'',
      Mobile:false,
      option: {
        title: {
          text: 'Detection Statistics',
          // subtext: '',
          left: 'center'
        },
        grid: {
          // left: '3%',
          // right: '1%',
          // containLabel: true
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: 'Number of data points',
            type: 'pie',
            radius: '65%',
            data: [
              { value: 0, name: 'Regular' },
              { value: 0, name: 'Anomaly' }
            ]
          }
        ]
      }
    }
  },
  mounted() {
    // this.Mobile = global.Mobile

    // this.$nextTick(() => {
      this.Mobile = global.Mobile
      this.chart = echarts.init(document.getElementById("pie01"), 'macarons')
      this.chart.setOption(this.option)
      this.queryList()
      this.initChart()
    // })
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
    queryList() {
      request({
        url: '/getStatistics',
        method: 'get'
      }).then(response => {
        // console.log(response)
        let data = response.res
          for (let key1 in data) {
            if ("statistics" == key1) {
              let currJson = data[key1]
              // console.log(currJson)
              this.option.series[0].data[0]['value'] = currJson.regularValue
              this.option.series[0].data[1]['value'] = currJson.anomalyValue
              this.webResults =currJson.results
              this.tutc =currJson.tutc
              break
            }
          }
        this.chart.setOption(this.option)
      }).catch(error => {

      })
    },
    loopChart() {
      this.currInterval = setInterval(() => {

        let regularValue = Math.floor(Math.random() * 15 + 20)
        let anomalyValue = Math.floor(Math.random() * 10 + 5)
        this.option.series[0].data[0]['value'] = regularValue
        this.option.series[0].data[1]['value'] = anomalyValue
        this.chart.setOption(this.option)
      }, 5001)
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
        // console.log(resJson)
        for (let key1 in resJson) {
          if ("statistics" == key1) {
            let currJson = resJson[key1]
            // console.log(currJson)
            this.option.series[0].data[0]['value'] = currJson.regularValue
            this.option.series[0].data[1]['value'] = currJson.anomalyValue
            this.webResults =currJson.results
            this.tutc =currJson.tutc
            break
          }
        }
        this.chart.setOption(this.option)
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
