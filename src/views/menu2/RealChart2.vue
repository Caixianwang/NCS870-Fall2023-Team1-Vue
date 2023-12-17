<template>
  <div :class="className" :style="{height:height,width:width}">
    <div v-if="loading" style="text-align: center">
      <el-link v-loading="loading"
               element-loading-background="rgba(0, 0, 0, 0.8)" style="margin-top: 160px" type="info" disabled></el-link>
    </div>

  </div>
</template>

<script>
import * as echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import resize from '../dashboard/admin/components/mixins/resize'
import request from '@/utils/request'
import { login } from '@/api/user'
import { setToken } from '@/utils/auth'

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
      default: '600px'
    }
  },
  data() {
    return {
      loading: true,
      currInterval: null,
      chart: null,
      option: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: ['2020', '2019', '2018', '2017']
        },
        series: [
          {
            name: '开展实验次数',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: [],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      // this.initChart()
      this.loopChart()
      this.websocket();
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
    if (this.currInterval) {
      clearTimeout(this.currInterval)
    }
    // if (this.ws) {
    //   this.ws.close()
    //   this.ws = null
    // }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption(this.option)
    },
    loopChart() {
      this.currInterval = setTimeout(() => {
        return request({
          url: '/login',
          method: 'post',
          data: { userId: '22', passwd: '999' }
        }).then(response => {
          console.log(response)
          this.loading = false
          this.chart = echarts.init(this.$el, 'macarons')
          this.option.series[0].data.push({ value: 32, name: 'A' })
          this.option.series[0].data.push({ value: 42, name: 'B' })
          this.option.series[0].data.push({ value: 5, name: 'C' })
          this.option.series[0].data.push({ value: 62, name: 'D' })
          this.chart.setOption(this.option)
          // console.log(this.option.series[0].data)
        }).catch(error => {

        })

      }, 5000)
    },
    websocket () {
     let ws = new WebSocket('ws://127.0.0.1:8080/websocket/defense');
      ws.onopen = () => {
        // Web Socket 已连接上，使用 send() 方法发送数据
        //console.log('数据发送中...')
        //ws.send('Holle')
        //console.log('数据发送完成')
      }
      ws.onmessage = evt => {
        console.log('数据已接收...')
        var received_msg = evt.data;
        console.log(received_msg);
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
