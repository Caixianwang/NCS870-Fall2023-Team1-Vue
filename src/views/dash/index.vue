<template>
  <div class="dashboard-editor-container">
    <el-radio-group v-model="algo" size="medium" @change="algoChange">
      <el-radio label="VFBLS">VFBLS</el-radio>
      <el-radio label="BLS">BLS</el-radio>
      <el-radio label="GRU">GRU</el-radio>
    </el-radio-group>
    <div style="height: 10px"></div>
    <panel-group v-if="false" @handleSetLineChartData="handleSetLineChartData"/>
    <div v-if="changeShow">
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <pie-chart :algo="algo"/>
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <prediction-chart :algo="algo" :datas="datas"/>
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <feature-chart :algo="algo" :datas="datas"/>
      </el-row>
      <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
        <cpu-chart :algo="algo" :datas="datas"/>
      </el-row>
      <author v-if="false"/>
    </div>

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import FeatureChart from './components/FeatureChart'
import CpuChart from './components/CpuChart'
import PredictionChart from './components/PredictionChart.vue'
import PieChart from './components/PieChart'
import * as echarts from 'echarts'
import global from '@/Globl'
import Author from '../intr/Author.vue'
import request from '@/utils/request'

const lineChartData = {
  newVisitis: {
    expectedData: [100, 120, 161, 134, 105, 160, 165],
    actualData: [120, 82, 91, 154, 162, 140, 145]
  },
  messages: {
    expectedData: [200, 192, 120, 144, 160, 130, 140],
    actualData: [180, 160, 151, 106, 145, 150, 130]
  },
  purchases: {
    expectedData: [80, 100, 121, 104, 105, 90, 100],
    actualData: [120, 90, 100, 138, 142, 130, 130]
  },
  shoppings: {
    expectedData: [130, 140, 141, 142, 145, 150, 160],
    actualData: [120, 82, 91, 154, 162, 140, 130]
  }
}

export default {
  name: 'Dash01',
  components: {
    CpuChart,
    PanelGroup,
    FeatureChart,
    PredictionChart,
    PieChart,
    Author
  },
  data() {
    return {
      changeShow: true,
      datas:[],
      algo: 'VFBLS',
      lineChartData: lineChartData.newVisitis
    }
  },
  mounted() {
    this.queryList()
    this.deviceJudge()
  },
  methods: {
    queryList() {
      this.changeShow = false
      request({
        url: '/getList',
        method: 'get'
      }).then(response => {
        // console.log("---------------"+response)

        this.datas = response.res
        this.changeShow = true

      }).catch(error => {

      })
    },
    deviceJudge(){
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        console.log('当前在Mobile端');
        global.Mobile = true
      } else {
        global.Mobile = false
        console.log('当前在PC端');
      }
    },
    algoChange(currVal) {
      this.changeShow = false
      this.$nextTick(() => {
        this.changeShow = true
      })
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
