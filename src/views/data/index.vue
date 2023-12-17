<template>
  <div style="" class="dashboard-editor-container">
    <el-table
      :data="tableData"
      :default-sort="{prop: 'd', order: 'ascending'}"
      empty-text="No data"
      style="width: 100%">
      <el-table-column
        prop="d"
        sortable
        label="Horizontal">
      </el-table-column>

      <el-table-column
        fixed="right"
        label="Operations"
        width="200">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="Download Data" placement="bottom">
            <el-button type="text" @click="downloadFile(scope.row.d,'h')" size="small">Horizontal</el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="Download Data" placement="bottom">
            <el-button type="text" @click="downloadFile(scope.row.d,'v')" size="small">Vertical</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 20px">
      <el-button-group>
        <el-button @click="prePage()" type="primary" >Pre Page</el-button>
        <el-button @click="nextPage()" :disabled="currDt.getTime()>new Date().getTime()" type="primary">Next page</el-button>
      </el-button-group><span style="margin-left: 20px;color: #909399">Date: {{ yyyyMMdd}}</span>
    </div>
  </div>
</template>

<script>


import request from '@/utils/request'
import global from '@/Globl'

export default {

  components: {},
  data() {
    return {
      currDt:new Date(),
      yyyyMMdd:'',
      tableData: [],
      pic01: require('@/assets/images/bgpGuard_framework.png')
    }
  },
  mounted() {
    this.currDt = new Date(this.currDt.getFullYear(),this.currDt.getMonth(),1)
    this.queryList()
  },
  methods: {

    prePage(){
      this.currDt.setDate(this.currDt.getDate() - 1);
      this.queryList()
    },
    nextPage(){
      this.currDt.setDate(this.currDt.getDate() + 1);
      this.queryList()
    },
    getYearMonthDay(){
      let year = this.currDt.getFullYear()
      let month = this.currDt.getMonth() + 1
      let day = this.currDt.getDate()
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      return {year,month,day}
    },
    queryList() {
      let {year,month,day}= this.getYearMonthDay()
      this.yyyyMMdd = year+''+month+day
     console.log(year,month,day)
      request({
        url: '/file/getFiles?yearMonth=' + year+month + '&day=' + day,
        method: 'get'
      }).then(response => {
        // console.log(response)
        this.tableData = []
        for (let item of response.res) {
          this.tableData.push({ 'd': item.replace('.txt', '') })
        }
      }).catch(error => {

      })
    },

    downloadFile(filename, type) {
      let yearMonth = filename.substring(0, 6)
      if (type == 'h') {
        filename = filename + '.txt'
      } else {
        filename = filename + 'M.txt'
      }
      window.open(global.APP_BASE_URL + '/file/downloadFile?yearMonth=' + yearMonth + '&fileName=' + filename, '_blank')
    },

    doReal() {
      this.$router.push({ path: 'dash' })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 20px;
  background-color: rgb(240, 242, 245);
  width: 98%;
  margin: 10px auto; /* 水平居中 */
  position: relative;
}
</style>
