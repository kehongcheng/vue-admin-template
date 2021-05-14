<template>
  <div class="app-container">
    <!-- 添加用户 -->
    <el-button style="margin-bottom: 10px" type="primary" icon="el-icon-plus" @click="handleAdd()">添加职位</el-button>
    
    <!-- 表格 -->
    <el-table
      :data="renderData.filter(data => !search || data.company.toLowerCase().includes(search.toLowerCase()))"
      style="width: 100%"
      border
      :header-cell-style="{backgroundColor: '#F0F0F0', color: 'grey', textAlign:'center'}"
      :cell-style="{textAlign:'center'}">
      <el-table-column
        label="LOGO"
        prop="companyLogoUrl"
        width= "102px">
        <template v-slot:default="scope">
          <img style="width: 80px"  :src="scope.row.companyLogoUrl" alt="">
        </template>
      </el-table-column>
      <el-table-column
        label="公司名称"
        prop="companyName">
      </el-table-column>
      <el-table-column
        label="职位名称"
        prop="positionName">
      </el-table-column>
      <el-table-column
        label="城市"
        prop="city">
      </el-table-column>
      <el-table-column
        label="岗位薪资"
        prop="salary">
      </el-table-column>
      <el-table-column
        label="发布时间"
        prop="createTime">
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
          <el-button
            size="mini"
            type="info"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
    <el-dialog title="添加职位" :visible.sync="dialogFormVisible"  width="90%">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="logo" :label-width="formLabelWidth">
          <el-upload
            ref="upload"
            action="https://ke123.net:3000/uploadfile"
            :file-list="fileList"
            list-type="picture"
            :auto-upload="false"
            :limit="1"
            :on-success="uploadSuccess"
            :on-remove="fileRemove">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            
            <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="公司名称" :label-width="formLabelWidth" prop="companyName">
          <el-input v-model="form.companyName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="职位名称" :label-width="formLabelWidth" prop="positionName">
          <el-input v-model="form.positionName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="城市" :label-width="formLabelWidth" prop="city">
          <el-input v-model="form.city" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="薪资" :label-width="formLabelWidth" prop="salary">
          <el-input v-model="form.salary" autocomplete="off"></el-input>
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
import { getList, addList, delList, editList } from '@/api/position-list'
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
          id: '',
          companyLogo: '',
          companyLogoUrl: '',
          companyName: '',
          positionName: '',
          city: '',
          salary: '',

          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        rules:{
          companyName: [
            {required: true, message: '请输入公司名称', trigger: 'blur'},
          ],
          positionName: [
            {required: true, message: '请输入职位名称', trigger: 'blur'},
          ],
          city: [
            {required: true, message: '请输入城市', trigger: 'blur'},
          ],
          salary: [
            {required: true, message: '请输入薪资', trigger: 'blur'},
          ],
        },
        formLabelWidth: '80px',
        fileList: [],
        upload_data: {}
      }
    },

    methods: {
      handleEdit(index, row) {
        this.dialogFormVisible = true
        this.form.id = row.id
        this.form.companyLogo = row.companyLogo
        this.form.companyLogoUrl = row.companyLogoUrl
        this.form.companyName = row.companyName
        this.form.positionName = row.positionName
        this.form.city = row.city
        this.form.salary = row.salary
        this.form.desc = 'edit'
        this.fileList = this.form.companyLogo?[
          {
            name: this.form.companyLogo, 
            url: this.form.companyLogoUrl
          },
        ]: []
      },

      async handleDelete(index, row) {
        // 删除数据
        let result = this.tableData.findIndex(data=>data.id == row.id)
        console.log(row.id)
        // 后端删除 成功返回1 失败返回0
        let _res = await delList({id: row.id})
        if (_res.data){
          // 前端删除
          this.tableData.splice(result, 1)
          // 渲染
          this.filterData = this.tableData.filter(data => !this.search || data.companyName.toLowerCase().includes(this.search.toLowerCase()))
          let start = (this.currentPage-1) * this.pageSize
          let end = start + this.pageSize
          this.renderData = this.filterData.slice(start, end)
          // 当前页数据为0，页码-1
          if(this.renderData.length == 0 && this.filterData != 0){
            this.handlePageChange(--this.currentPage)
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
        this.filterData = this.tableData.filter(data => !value || data.companyName.toLowerCase().includes(value.toLowerCase()))
        this.renderData = this.filterData.slice(0, this.pageSize)
      },
      
      formInit() {
        this.form.id = ""
        this.form.companyLogo = ""
        this.form.companyLogoUrl = ""
        this.form.companyName = ""
        this.form.positionName = ""
        this.form.city = ""
        this.form.salary = ""
        this.form.desc = ""
        this.form.delivery = false
        this.form.type = []
        this.form.resource = ''
        this.fileList = []
      },

      handleAdd() {
        this.formInit()
        this.dialogFormVisible = true
        this.form.desc = 'add'
      },

      handleCancel() {
        this.dialogFormVisible = false
        this.fileList = []
      },

      submitUpload() {
        this.$refs.upload.action = `${process.env.VUE_APP_BASE_AGREEMENT}://${process.env.VUE_APP_BASE_DOMAIN}/uploadfile`;
        this.$refs.upload.submit();
      },
      fileRemove() {
        this.fileList = []
      },
      uploadSuccess(response, file, fileList) {
        let companyLogo = response.data.fileName
        let companyLogoUrl = response.data.hashName

        editList({id:this.form.id?this.form.id:'add',companyLogo: companyLogo, companyLogoUrl: (`${process.env.VUE_APP_BASE_AGREEMENT}://${process.env.VUE_APP_BASE_DOMAIN}/upload/` + companyLogoUrl)})
        
        
      },

      handleSubmit() {
        this.$refs['form'].validate(async (valid) => {
          if(valid){
            // 上传图片
            
            await new Promise((resolve, reject)=>{
              this.$refs.upload.action = `${process.env.VUE_APP_BASE_AGREEMENT}://${process.env.VUE_APP_BASE_DOMAIN}/uploadfile`;
              this.$refs.upload.submit();
              resolve();
            })
            console.log(this.fileList);
            this.dialogFormVisible = false
            let form = {
                id: this.form.id || "",
                companyLogo: this.form.companyLogo,
                companyLogoUrl: this.form.companyLogoUrl,
                companyName: this.form.companyName,
                positionName: this.form.positionName, 
                city: this.form.city,
                salary: this.form.salary, 
            }
            if(this.fileList.length == 0){
              console.log("length: 0");
              form.companyLogo = ""
              form.companyLogoUrl = ""
            }
            
            // 提交数据
            if(this.form.desc == 'add'){
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
            }else if (this.form.desc == 'edit'){
              let res = await editList(form)
              if (res.data == 1){
                this.popTips('修改成功', 'success')
                // 渲染数据
                this.tableData = (await getList()).data
                this.renderUserData(this.search)
              }else{
                this.popTips('修改失败', 'error')
              }
            }
          }else{
            return false
          }
          this.fileList = []
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
      console.log(this.tableData);
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