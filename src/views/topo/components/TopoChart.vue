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
      default: '700px'
    }
  },
  data() {
    return {
      chart: null,
      currInterval: null,
      eachSize:600,
      topos: [],
      option: {
        // title: {
        //   text: 'Topology Statistics',
        //   show:false
        // },
        // grid: {
        //   left: 0,
        //   right: 0,
        //   top:0,
        //   bottom:0
        // },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'cubicOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 5,
            roam: true,
            // center: ['100px', '100px'], // 圆心坐标，可以使用百分比或像素值
            // radius: ['300px', '300px'], // 半径，可以使用百分比或像素值
            label: {
              // show: true
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
              fontSize: 10
            },
            data: [],
            links: []
          }
        ]
      }
    }
  },
  mounted() {

    this.$nextTick(() => {
      this.chart = echarts.init(this.$el, 'macarons')
      this.chart.setOption(this.option)
      this.queryList()
      this.initChart()
      // this.loopChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    // this.chart.dispose()
    // this.chart = null
    clearInterval(this.currInterval)
  },
  methods: {
    queryList() {
      request({
        url: '/getTopo',
        method: 'get'
      }).then(response => {
        let resJson = response.res
          for (let key1 in resJson) {
            if ("topo"== key1) {
              this.topos = resJson[key1]
              let topo = this.topos.splice(0, this.eachSize);
                this.drawTopo(topo)
                this.loopChart()
                break
            }
        }
      }).catch(error => {

      })
    },
    loopChart() {
      if(this.currInterval){
        clearInterval(this.currInterval)
      }
      this.currInterval = setInterval(() => {

        let topo = this.topos.splice(0, this.eachSize);
        this.drawTopo(topo)
        // console.log(JSON.stringify(topo))
        // let topo = [[262342, 262342], [262342, 267283], [25091, 1031], [1031, 14840], [14840, 262342], [262342, 262342]]

      }, 10000); // 2000毫秒 = 2秒

    },
    drawTopo(topo){

      let pointSet = new Set();
      let selfSet = new Set()
      for (let key in topo){
        pointSet.add(topo[key][0])
        pointSet.add(topo[key][1])
        if(topo[key][0]==topo[key][1]){
          selfSet.add(topo[key][0])
        }
      }
      // console.log(pointSet.size)
      this.buildCoordAxis(pointSet,selfSet)
      this.buildLinks(topo)
      this.chart.setOption(this.option)
    },
    buildLinks(topo){
      this.option.series[0].links.length =0;
      let allSet = new Set()
      for (let key in topo){
        if(!allSet.has(topo[key][0]+''+topo[key][1])){
          this.option.series[0].links.push({
            source: ''+topo[key][0],
            target: ''+topo[key][1],
          })
        }
        allSet.add(topo[key][0]+''+topo[key][1])
      }
    },

    buildCoordAxis(pointSet,selfSet){
      // 圆心坐标
      const x0 = 300; // 圆心的x坐标
      const y0 = 300; // 圆心的y坐标
      const r = 280; // 半径

      const numberOfPoints = pointSet.size;
      const xyPoints = [];
      const pointArr = [...pointSet];
      for (let i = 0; i < numberOfPoints; i++) {
        const angle = (i / numberOfPoints) * 2 * Math.PI;
        const x = x0 + r * Math.cos(angle);
        const y = y0 + r * Math.sin(angle);
        xyPoints.push({val:pointArr[i],x, y });
      }
      this.option.series[0].data.length=0
      for (let key in xyPoints) {
        let currItem = {
          name: xyPoints[key].val,
          x: xyPoints[key].x,
          y: xyPoints[key].y
        }
        if(selfSet.has(xyPoints[key].val)){
          currItem.itemStyle={
            borderColor:'blue',
            borderWidth:'5' ,
          }
        }
        this.option.series[0].data.push(currItem)
      }

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
          if ("topo" == key1) {
            this.topos = resJson[key1]
            let topo = this.topos.splice(0, this.eachSize);
            this.drawTopo(topo)
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
