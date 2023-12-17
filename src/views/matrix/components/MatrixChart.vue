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
      default: '750px'
    }
  },
  data() {
    return {
      chart: null,
      currInterval: null,
      // eachSize:600,
      axisData:[],
      topos: [],
      option: {
        title: {
          text: 'Path correlation'
        },
        legend: {
          show:false,
          data: ['Path correlation'],
          left: 'right'
        },
        tooltip: {
          // show:false,
          position: 'top',
          backgroundColor: 'rgba(255,255,150,0.1)', // 设置提示框背景颜色，这里使用了半透明的黑色
          textStyle: {
            color: '#a41a1a', // 设置提示框文字颜色为白色
            fontSize:20,
            fontWeight:'bold'
          },
          formatter: function (params) {
            let data = params['data']
            // let str = 'Path ['+data[0]+' , '+data[1]+'] -> '+data[2]
            let str = 'The times of routes from AS'+data[0]+' to AS'+data[1]+' is '+ data[2]
            return (
              str
            );
          }
        },
        grid: {
          left: 2,
          bottom: 10,
          right: 20,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: [],
          boundaryGap: false,
          splitLine: {
            show: true
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            rotate: -45,
            interval: 45 // 设置为 0 表示强制显示所有标签
          }
        },
        yAxis: {
          type: 'category',
          data: [],
          axisLine: {
            show: false
          },
          axisLabel: {
            rotate: -45,
            interval: 65 // 设置为 0 表示强制显示所有标签
          }
        },
        series: [
          {
            name: 'Path correlation',
            type: 'scatter',
            symbolSize: function (val) {
              if(val[2]<5){
                return 3
              }else if(val[2]<20){
                return 6
              }else if(val[2]<50){
                return 8
              }else if(val[2]<100){
                return 10
              }else if(val[2]<200){
                return 15
              }else if(val[2]<300){
                return 20
              }else{
                return 26
              }

            },
            data: [],
            animationDelay: function (idx) {
              return idx * 5;
            }
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
              this.buildData()
              // console.log(JSON.stringify(this.topos))
              let topo = this.topos.splice(0, this.eachSize);
                this.drawTopo(topo)
                this.loopChart()
                break
            }
        }
      }).catch(error => {

      })
    },
    shuffleArray(array) { //Scramble array
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    buildData(){
      let mySet = new Set();
      for(let topo of this.topos){
        mySet.add(topo[0])
        mySet.add(topo[1])
      }
      this.option.xAxis.data = this.shuffleArray(Array.from(mySet))
      this.option.yAxis.data = this.shuffleArray(Array.from(mySet))

      let coupleMap = new Map();
      for(let topo of this.topos){
        if(topo[0] != topo[1]) {
          let couple = topo[0] + ',' + topo[1]
          let value = 1
          if (coupleMap.has(couple)) {
            value += coupleMap.get(couple)
            // console.log(value)
          }
          coupleMap.set(couple, value)
        }
      }
      for (let [key, value] of coupleMap) {
        let arr = key.split(",");
        this.option.series[0].data.push([arr[1],arr[0],value])
      }
      this.chart.setOption(this.option)


    },
    buildData1(){
      let mySet = new Set();
      for(let topo of this.topos){
        mySet.add(topo[0])
        mySet.add(topo[1])
      }
      let count = 1
      let myMap = new Map();
      mySet.forEach(value => {
        this.option.xAxis.data.push(count)
        this.option.yAxis.data.push(count)
        myMap.set(value,count)
        count +=1
      });

      let coupleMap = new Map();
      for(let topo of this.topos){
        if(topo[0] != topo[1]) {
          let couple = myMap.get(topo[0]) + ',' + myMap.get(topo[1])
          let value = 1
          if (coupleMap.has(couple)) {
            value += coupleMap.get(couple)
            console.log(value)
          }
          coupleMap.set(couple, value)
        }
      }
      for (let [key, value] of coupleMap) {
        let arr = key.split(",");
        this.option.series[0].data.push([arr[0],arr[1],value])
      }
      this.chart.setOption(this.option)


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
