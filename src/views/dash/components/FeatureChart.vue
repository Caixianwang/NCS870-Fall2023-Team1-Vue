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
    algo:{
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
      default: '450px'
    }
  },
  data() {
    return {
      chart: null,
      currInterval: null,
      option:{
        title: {
          text: 'Volume features vs. time'
        },
        // The border frame is shown when using grid function
        grid: [
          {
            left: '3%',
            right: '2%',
            containLabel: true,
            bottom: '55%', show: true
          },
          {
            left: '3%',
            right: '2%',
            containLabel: true,
            top: '55%', show: true
          }
        ],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
        },
        toolbox: {
          feature: {
            dataView: {show: true, readOnly: false},
            saveAsImage: {show: true}
          }
        },
        legend: {
          data: ['BGP announcements', 'BGP withdrawals']
        },
        xAxis: [
          {
            data: [],
            gridIndex: 0,
          },
          {
            data: [],
            gridIndex: 1,
            name: 'Time (min)',
            nameLocation: 'middle',
            nameGap: 25,
          }
        ],
        yAxis: [
          {
            gridIndex: 0,
            name: 'Number of announcements',
            nameLocation: 'middle',
            nameGap: 50
          },
          {
            gridIndex: 1,
            name: 'Number of withdrawals',
            nameLocation: 'middle',
            nameGap: 50
          },
        ],
        series: [
          {
            name: 'BGP announcements',
            data: [],  //y values
            type: 'bar',
            xAxisIndex: 0,
            yAxisIndex: 0,
            // barWidth: 8,
            barGap:'80%',
            color: 'rgba(0,51,180,0.62)'

          },
          {
            name: 'BGP withdrawals',
            data: [],  //y values
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            // barWidth: 8,
            color: 'rgba(99,140,78,0.69)'  // '#25afb4'
          }
        ],
      }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$el, 'macarons')
    this.chart.setOption(this.option)
    this.$nextTick(() => {
      for(let i=0;i<1;i++){
        this.option.xAxis[0].data.splice(0,0,"")
        this.option.series[0].data.splice(0,0,"")
        this.option.xAxis[1].data.splice(0,0,"")
        this.option.series[1].data.splice(0,0,"")
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
                if (key2 === 'feature') {
                  let currJson = data[key1][key2]
                  let times = currJson.times
                  let announcementValue = currJson.announcementValue
                  let withdrawalValue = currJson.withdrawalValue
                  for (let t of times) {
                    this.option.xAxis[0].data.push(t)
                    this.option.xAxis[1].data.push(t)
                  }
                  for (let v of announcementValue) {
                    this.option.series[0].data.push(v)
                  }
                  for (let v of withdrawalValue) {
                    this.option.series[1].data.push(v)
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
        // console.log(response)
        let datas = response.res
        for (let data of datas) {
          for (let key1 in data) {
            if (this.algo == key1) {
              for (let key2 in data[key1]) {
                if (key2 === 'feature') {
                  let currJson = data[key1][key2]
                  let times = currJson.times
                  let announcementValue = currJson.announcementValue
                  let withdrawalValue = currJson.withdrawalValue
                  for (let t of times) {
                    this.option.xAxis[0].data.push(t)
                    this.option.xAxis[1].data.push(t)
                  }
                  for (let v of announcementValue) {
                    this.option.series[0].data.push(v)
                  }
                  for (let v of withdrawalValue) {
                    this.option.series[1].data.push(v)
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

        this.option.xAxis[0].data.shift()
        this.option.series[0].data.shift()
        this.option.xAxis[1].data.shift()
        this.option.series[1].data.shift()

        let dt = new Date()
        let time = dt.getHours()+":"+dt.getMinutes();
        let announcementValue= Math.floor(Math.random()*5+10)
        let withdrawalValue= Math.floor(Math.random()*15+10)
        this.option.xAxis[0].data.push(time)
        this.option.series[0].data.push(announcementValue)
        this.option.xAxis[1].data.push(time)
        this.option.series[1].data.push(withdrawalValue)
        this.chart.setOption(this.option)
        // this.chart.hideLoading()
      }, 60001)
    },
    initChart() {

      // this.chart = echarts.init(this.$el, 'macarons')
      // this.chart.setOption(this.option)
      // this.chart.showLoading()
      // this.loopChart()
      this.websocket()


    },
    websocket () {

      let ws = new WebSocket(global.WS_APP_BASE_API);
      ws.onopen = () => {
        // Web Socket 已连接上，使用 send() 方法发送数据
        //console.log('数据发送中...')
        //ws.send('Holle')
        //console.log('数据发送完成')
      }
      ws.onmessage = evt => {

        // console.log('数据已接收...')
        let resJson = JSON.parse(evt.data)
        for (let key1 in resJson) {
          if (this.algo == key1) {
            for (let key2 in resJson[key1]) {
              if (key2 === "feature") {
                let currJson = resJson[key1][key2]
                this.option.xAxis[0].data.splice(0, 5)
                this.option.series[0].data.splice(0, 5)
                this.option.xAxis[1].data.splice(0, 5)
                this.option.series[1].data.splice(0, 5)

                let tlen = this.option.xAxis[0].data
                if(tlen>50){
                  this.option.xAxis[0].data.splice(0, tlen-50)
                  this.option.series[0].data.splice(0, tlen-50)
                  this.option.xAxis[1].data.splice(0, tlen-50)
                  this.option.series[1].data.splice(0, tlen-50)
                }

                let times = currJson.times
                let announcementValue = currJson.announcementValue
                let withdrawalValue = currJson.withdrawalValue
                for (let t of times) {
                  this.option.xAxis[0].data.push(t)
                  this.option.xAxis[1].data.push(t)
                }
                for (let v of announcementValue) {
                  this.option.series[0].data.push(v)
                }
                for (let v of withdrawalValue) {
                  this.option.series[1].data.push(v)
                }
                this.chart.setOption(this.option)
              }
            }
          }
        }
      }
      ws.onclose = function () {
        // 关闭 websocket
        console.log('连接已关闭...')
      }
      // 路由跳转时结束websocket链接
      this.$router.afterEach(function () {
        ws.close()
      })
    },
    }
  }
</script>
