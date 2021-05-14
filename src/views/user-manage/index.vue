<template>
  <div class="app-container">
    <!-- 添加用户 -->
    <el-button style="margin-bottom: 10px" type="primary" icon="el-icon-plus" @click="dialogFormVisible = true">添加用户</el-button>
    
    <!-- 表格 -->
    <el-table
      :data="renderData.filter(data => !search || data.username.toLowerCase().includes(search.toLowerCase()))"
      style="width: 100%"
      border
      :header-cell-style="{backgroundColor: '#F0F0F0', color: 'grey', textAlign:'center'}"
      :cell-style="{textAlign:'center'}">
      <el-table-column
        label="日期"
        prop="date">
      </el-table-column>
      <el-table-column
        label="用户名"
        prop="username">
      </el-table-column>

      <el-table-column
        align="right"
        width="150px">
        
        <template slot="header">
          <el-input
            v-model="search"
            size="mini"
            placeholder="输入关键字搜索"/>
        </template>

        <template slot-scope="scope">
          <!-- <el-button
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button> -->
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="filterData.length"
      @current-change="handlePageChange"
      :current-page="currentPage">
    </el-pagination>

    <!-- dialog -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisible" width="80%">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
          <el-input type="password" v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList, addList, delList } from '@/api/user-list'
 export default {
   created(){
     this.pageSize = 5
     this.currentPage = 1
   },
    data() {
      return {
        tableData: [],
        filterData: [],
        renderData: [],
        search: '',

        // dialog data
        dialogFormVisible: false,
        form: {
          username: '',
          password: '',

          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        formLabelWidth: '80px',

        rules: {
          username: [
            { required: true, message: '请输入用户名称', trigger: 'blur' },
            { min: 1, max: 8, message: '长度在 1 到 8 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
          ]
        }

      }
    },

    methods: {
      handleEdit(index, row) {
        console.log(index, row);
      },

      async handleDelete(index, row) {
        // 删除数据
        let result = this.tableData.findIndex(data=>data.username == row.username)
        if (result != -1){
          // 后端删除 成功返回1 失败返回0
          let _res = await delList({username: this.tableData[result].username})
          if (_res.data){
            // 前端删除
            this.tableData.splice(result, 1)
            // 渲染
            this.filterData = this.tableData.filter(data => !this.search || data.username.toLowerCase().includes(this.search.toLowerCase()))
            let start = (this.currentPage-1) * this.pageSize
            let end = start + this.pageSize
            this.renderData = this.filterData.slice(start, end)
            // 当前页数据为0，页码-1
            if(this.renderData.length == 0 && this.filterData != 0){
              this.handlePageChange(--this.currentPage)
            }
          }
        }
      },

      handlePageChange(index) {
        let start = (index-1) * this.pageSize
        let end = start + this.pageSize
        this.renderData = this.filterData.slice(start, end)
        this.currentPage = index
      },

      renderUserData(value) {
        this.filterData = this.tableData.filter(data => !value || data.username.toLowerCase().includes(value.toLowerCase()))
        this.renderData = this.filterData.slice(0, this.pageSize)
      },

      handleCancel() {
        this.dialogFormVisible = false
        this.form.username = ""
        this.form.password = ""
      },

      handleSubmit() {
        this.$refs['form'].validate(async (valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let form = {username: this.form.username, password: this.form.password}
            this.form.username = ""
            this.form.password = ""
            // 提交数据
            let res = await addList(form)
            if (res.data == 1){
              this.popTips('添加成功', 'success')
              // 渲染数据
              this.tableData = (await getList()).data
              this.renderUserData(this.search)
            }else if(res.data == 2){
              this.popTips('用户已存在', 'warning')
            }else if(res.data == 3){
              this.popTips('存不下了', 'warning')
            }
          } else {
            return false;
          }
        });
      },

        // type：success/warning/error
      popTips(msg, type) {
        this.$message({
          showClose: true,
          message: msg,
          type: type
        });
      },
    },

    async mounted() {
      // 请求数据
      this.loading = true
      this.tableData = (await getList()).data
      this.loading = false

      // 渲染数据
      this.renderUserData(this.search)
    },

    watch: {
      search(newval){
        this.renderUserData(newval)
        this.currentPage = 1
      }
    }
  }
</script>

<style lang="scss" scoped>
.el-pagination {
  text-align: center;
  margin: 10px 0;
}
</style>