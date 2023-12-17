<template>
  <div class="app-container">
    <div style="margin-bottom:5px;display: flex;justify-content:space-between">
      <div style="color: #909399"><span>列表</span></div>
      <div>
        <el-button type="primary" icon="el-icon-plus" @click="addDlg">增加</el-button>
      </div>
    </div>
    <el-table :data="datas" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="code" sortable align="center" label="校区代号" min-width="100" />
      <el-table-column prop="name" align="center" label="名称" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="leader" align="center" label="校长" min-width="70" />
      <el-table-column prop="www" align="center" label="学校网址" min-width="110" />
      <el-table-column prop="contact" align="center" label="联系人" min-width="80" />
      <el-table-column prop="tecNum" align="center" label="教职工人数" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.num1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="stuNum" align="center" label="学生人数" min-width="100" />
      <el-table-column align="center" label="" min-width="150">
        <template slot-scope="{row,$index}">
          <el-button type="text" icon="el-icon-edit" @click="editDlg(row)">编辑</el-button>
          <el-button type="text" icon="el-icon-delete" @click="delRow(row,$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog width="900px" :title="title" :visible.sync="dialogVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="currForm"
        label-width="92px"
        style="width: 860px; margin-left:0;"
      >
        <el-row>
          <el-col :span="8">
            <el-form-item label="校区代号" prop="code">
              <el-input v-model="currForm.code" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="名称" prop="code">
              <el-input v-model="currForm.name" maxlength="35" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="上级校区" prop="pcode">
              <el-input v-model="currForm.pcode" maxlength="15" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="addr">
          <el-input v-model="currForm.addr" maxlength="100" />
        </el-form-item>
        <el-row>
          <el-col :span="8">
            <el-form-item label="学校网址" prop="www">
              <el-input v-model="currForm.www" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="currForm.email" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="行政级别" prop="level">
              <el-input v-model="currForm.level" maxlength="15" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="办学类型" prop="type">
              <el-input v-model="currForm.type" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学校办别" prop="level1">
              <el-input v-model="currForm.level1" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学校电话" prop="tel">
              <el-input v-model="currForm.tel" maxlength="15" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="校长" prop="leader">
              <el-input v-model="currForm.leader" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="校长电话" prop="leaderTel">
              <el-input v-model="currForm.leaderTel" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="currForm.contact" maxlength="15" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="联系人电话" prop="contactTel">
              <el-input v-model="currForm.contactTel" maxlength="15" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="教职工人数" prop="tecNum">
              <el-input-number v-model="currForm.tecNum" :step="5" :min="50" :max="200" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学生人数" prop="stuNum">
              <el-input-number v-model="currForm.stuNum" :step="10" :min="50" :max="2000" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label="平行班个数" prop="num1">
              <el-input-number v-model="currForm.num1" :step="1" :min="1" :max="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="平行班人数" prop="num2">
              <el-input-number v-model="currForm.num2" :step="1" :min="1" :max="100" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否考点" prop="exam">
              <el-radio-group v-model="currForm.exam">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="学校简介" prop="content'">
          <el-input v-model="currForm.content" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
        <el-form-item label="备注" prop="remark'">
          <el-input v-model="currForm.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { querySchool, editSchool } from '@/api/school'

const typeOptions = [
  { code: 'A', name: 'A' },
  { code: 'B', name: 'B' },
  { code: 'C', name: 'C' },
  { code: 'D', name: 'D' }
]

export default {
  name: 'School',
  components: {},
  data() {
    return {
      typeOptions,
      datas: null,
      total: 0,
      pager: {
        page: 1,
        limit: 20
      },
      currForm: {
        id: '',
        code: '',
        pcode: '',
        name: '',
        addr: '',
        www: '',
        email: '',
        levle: '',
        type: '',
        level1: '',
        tel: '',
        leader: '',
        leaderTel: '',
        contact: '',
        contactTel: '',
        tecNum: '',
        stuNum: '',
        num1: 2,
        num2: 2,
        exam: 0,
        content: '',
        remark: ''
      },
      title: '增加学校',
      dialogVisible: false,
      rules: {
        code: [{ required: true, message: '校区代号必须输入', trigger: 'blur' }],
        name: [{ required: true, message: '校区名称必须输入', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.queryList()
  },
  methods: {
    question(surId) {
      this.$router.push({ path: '/base/Question', query: { surId }})
    },
    submitForm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          editSchool(this.currForm).then((res) => {
            const index = this.datas.findIndex(v => v.code === this.currForm.code)
            if (index > -1) {
              this.datas.splice(index, 1, this.currForm)
            } else {
              this.datas.unshift(this.currForm)
            }

            this.dialogVisible = false
            // this.queryList()
            this.$notify({
              title: '信息提示',
              message: this.title + '成功！',
              type: 'success',
              duration: 3000
            })
          })
        }
      })
    },
    delRow(row, index) {
      this.$confirm('确定要删除吗？')
        .then(_ => {
          this.$notify({
            title: '信息提示',
            message: '删除成功！',
            type: 'success',
            duration: 3000
          })
          this.datas.splice(index, 1)
        })
        .catch(_ => {
        })
    },
    editDlg(row) {
      this.dialogVisible = true
      this.title = '修改学校'
      this.currForm = Object.assign({}, row) // copy obj
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    addDlg() {
      this.dialogVisible = true
      this.title = '增加学校'
      this.currForm = this.$options.data().currForm
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    queryList() {
      querySchool(this.pager).then(res => {
        this.datas = res.res.rows
        this.total = res.res.total
      })
    }
  }
}
</script>

<style scoped>
  .edit-input {
    padding-right: 100px;
  }

  .cancel-btn {
    position: absolute;
    right: 15px;
    top: 10px;
  }
</style>
