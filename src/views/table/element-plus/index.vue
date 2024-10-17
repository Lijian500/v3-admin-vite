<script lang="ts" setup>
import {reactive, ref, watch} from "vue"
import {
  createTableDataApi,
  deleteTableDataApi,
  updateTableDataApi,
  getTableDataApi,
  getUserOneApi,
  deleteBatch,
  updateUserStateApi, resetPasswordApi
} from "@/api/table"
import {type CreateOrUpdateTableRequestData, type TableData} from "@/api/table/types/table"
import {type FormInstance, type FormRules, ElMessage, ElMessageBox} from "element-plus"
import {Search, Refresh, CirclePlus, Delete, Download, RefreshRight} from "@element-plus/icons-vue"
import {usePagination} from "@/hooks/usePagination"
import {cloneDeep} from "lodash-es"
import router from "@/router/index"
import {UserStateEnum, IdentityEnum} from "@/constants/user-constant";

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const {paginationData, handleCurrentChange, handleSizeChange} = usePagination()

const userState = [
  {value: 1, label: "启用"},
  {value: 2, label: "禁用"}
]

//#region 增
const DEFAULT_FORM_DATA: CreateOrUpdateTableRequestData = {
  id: undefined,
  identity: "",
  userState: "",
  realName: "",
  account: "",
  pwd: ""
}
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref<CreateOrUpdateTableRequestData>(cloneDeep(DEFAULT_FORM_DATA))
const formRules: FormRules<CreateOrUpdateTableRequestData> = {
  account: [
    {required: true, trigger: "blur", message: "请输入用户名"},
    {
      validator: (rule, value) => /^[a-zA-Z0-9]{6,15}$/.test(value),
      message: "用户名必须为6到15位字母或数字",
      trigger: "blur"
    }
  ],
  realName: [{required: true, trigger: "blur", message: "请输入真实姓名"}],
  identity: [{required: true, trigger: "blur", message: "请选择身份"}],
  pwd: [{required: true, trigger: "blur", message: "请输入密码"}]
}
const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createTableDataApi : updateTableDataApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getTableData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}
const resetForm = () => {
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
//#endregion

//#region 删
const handleDelete = (row: TableData) => {
  ElMessageBox.confirm(`正在删除用户：${row.account}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}
//#endregion

//#region 删-批量
const selectedRows = ref([]);

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const deleteSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage('请先选择要删除的项');
    return;
  }

  deleteBatch({ids: selectedRows.value.map(item => item.id.toString())})
    .then(() => {
      ElMessage.success('删除成功');
      getTableData();
  }).finally(() => {
    selectedRows.value = [];
  })
};
//#endregion

//#region 改
const handleUpdate = (row: TableData) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)

}
//#endregion

//#region 重置密码
const handleResetPassword = (id: number) => {

  ElMessageBox.confirm(`正在重置密码，确认重置？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    resetPasswordApi(id).then(() => {
      ElMessage.success("重置密码成功")
      getTableData()
    })
  })
}
//#endregion

//#region 详情
const goToDetails = (id: number) => {
  router.push({ name: 'UserDetail', params: { id: id } })
}
//#endregion

//@region 启用禁用
const handleUserState = (row: TableData) => {
  if (row.userState === UserStateEnum.Enabled.valueOf()) {
    ElMessageBox.confirm(`正在禁用用户：${row.account}，确认禁用？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      updateUserStateApi({userId: row.userId})
        .then(() => {
          ElMessage.success("禁用成功")
          getTableData()
        })
    })
  } else {
    // 启用不弹框提示
    updateUserStateApi({userId: row.userId})
      .then(() => {
        ElMessage.success("启用成功")
        getTableData()
      })
  }
}
//#endregion

//#region 查
const defaultTime = ref([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
])
const tableData = ref<TableData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  realName: "",
  account: "",
  userState: undefined,
  dataTime: [] as [string, string] | []
})
const getTableData = () => {
  loading.value = true
  const startTime = searchData.dataTime && searchData.dataTime[0] ? searchData.dataTime[0].replace("+", " ") : undefined
  const endTime = searchData.dataTime && searchData.dataTime[1] ? searchData.dataTime[1].replace("+", " ")  : undefined

  getTableDataApi({
    pageNo: paginationData.pageNo,
    pageSize: paginationData.pageSize,
    account: searchData.account || undefined,
    realName: searchData.realName || undefined,
    userState: searchData.userState || undefined,
    createStartTime: startTime || undefined,
    createEndTime: endTime || undefined,
  })
    .then(res => {
      paginationData.total = res.total
      tableData.value = res.data
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  paginationData.pageNo === 1 ? getTableData() : (paginationData.pageNo = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const getUserOneData = (id: number) => {
  getUserOneApi(id)
    .then(res => {
      formData.value = res.data
    })
    .catch(() => {
      ElMessage.error("获取用户信息失败")
    })
}

//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.pageNo, () => paginationData.pageSize], getTableData, {immediate: true})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="account" label="账户">
          <el-input v-model="searchData.account" placeholder="请输入账户名"/>
        </el-form-item>
        <el-form-item prop="realName" label="姓名">
          <el-input v-model="searchData.realName" placeholder="请输入真实姓名"/>
        </el-form-item>
        <el-form-item prop="userState" label="状态">
          <el-select v-model="searchData.userState" style="width: 100px" placeholder="请选择状态">
            <el-option
              v-for="state in userState"
              :key="state.value"
              :label="state.label"
              :value="state.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item lable="创建时间">
          <el-date-picker
            v-model="searchData.dataTime"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增用户</el-button>
          <el-button type="danger" :icon="Delete" @click="deleteSelected">批量删除</el-button>
        </div>
        <div>
          <!--          <el-tooltip content="下载">-->
          <!--            <el-button type="primary" :icon="Download" circle />-->
          <!--          </el-tooltip>-->
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData"/>
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column prop="id" label="id" width="80" align="center"/>
          <el-table-column prop="userId" label="用户ID" align="center"/>
          <el-table-column prop="account" label="用户名" align="center"/>
          <el-table-column prop="identity" label="身份" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.identity === 1" type="primary" effect="plain">超级管理员</el-tag>
              <el-tag v-else type="warning" effect="plain">普通管理员</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="真实姓名" align="center"/>
          <el-table-column prop="userState" label="用户状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.userState == 1" type="success" effect="plain">启用</el-tag>
              <el-tag v-else type="danger" effect="plain">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center">
            <template #default="scope">
              {{ scope.row.createTime ? scope.row.createTime : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" align="center">
            <template #default="scope">
              {{ scope.row.updateTime ? scope.row.updateTime : '-' }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="goToDetails(scope.row.id)">详情</el-button>
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button :type="scope.row.userState === 1 ? 'danger' : 'success'" text bg size="small" @click="handleUserState(scope.row)"> {{ scope.row.userState === 1 ? '禁用' : '启用' }}</el-button>
              <el-button v-if="scope.row.userState === 2" type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
              <el-button type="primary" text bg size="small" @click="handleResetPassword(scope.row.id)">重置密码</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.pageNo"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增用户' : '修改用户'"
      @closed="resetForm"
      width="30%">

      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="account" label="用户名">
          <el-input v-model="formData.account" placeholder="请输入"/>
        </el-form-item>
        <el-form-item prop="pwd" label="密码" v-if="formData.id === undefined">
          <el-input type="password" v-model="formData.pwd" placeholder="请输入" show-password/>
        </el-form-item>
        <el-form-item prop="realName" label="真实姓名">
          <el-input v-model="formData.realName" placeholder="真实姓名"/>
        </el-form-item>
        <el-form-item prop="identity" label="身份">
          <el-radio-group v-model="formData.identity" class="ml-4">
            <el-radio :label="1" size="large">超级管理员</el-radio>
            <el-radio :label="2" size="large">普通管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="userState" label="状态">
          <el-radio-group v-model="formData.userState" class="ml-4">
            <el-radio :label="1" size="large">启用</el-radio>
            <el-radio :label="2" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateOrUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
