<script setup lang="ts">

import {reactive, ref, watch} from "vue";
import {Refresh, Search} from "@element-plus/icons-vue";
import {usePagination} from "@/hooks/usePagination";
import type {ILoginLogData, ILoginLogTableRequestData} from "@/api/login-log/types/login-log";
import type {FormInstance} from "element-plus";
import {getLoginLogPageApi} from "@/api/login-log";
import router from "@/router";


defineOptions({
  name: "LoginLog"
})

const loading = ref<boolean>(false)
const {paginationData, handleCurrentChange, handleSizeChange} = usePagination()

//region 列表
const tableData = ref<ILoginLogData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  account: undefined,
  realName: undefined,
  loginState: undefined,
  dataTime: [] as [string, string] | []
})
//endregion

const handleSearch = () => {
  paginationData.pageNo === 1 ? getTableData() : (paginationData.pageNo = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
const getTableData = () => {
  loading.value = true

  getLoginLogPageApi({
    pageNo: paginationData.pageNo,
    pageSize: paginationData.pageSize,
    account: searchData.account || undefined,
    realName: searchData.realName || undefined,
    loginState: searchData.loginState || undefined,
    loginStartTime: searchData.dataTime && searchData.dataTime[0] ? searchData.dataTime[0] + " 00:00:00" : undefined,
    loginEndTime: searchData.dataTime && searchData.dataTime[1] ? searchData.dataTime[1] + " 23:59:59" : undefined
  }).then(res => {
    paginationData.total = res.total
    tableData.value = res.data
  }).catch(() => {
    tableData.value = []
  }).finally(() => {
    loading.value = false
  })

}

//region 详情
const goToDetails = (id: number) => {
  router.push({
    name: "LoginLogDetail",
    params: {
      id: id
    }
  })
}
//endregion

const loginState = [
  {
    label: '成功',
    value: 1
  },
  {
    label: '失败',
    value: 2
  }
]

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
        <el-form-item prop="loginState" label="登录状态">
          <el-select v-model="searchData.loginState" clearable style="width: 100px" placeholder="请选择状态">
            <el-option
              v-for="state in loginState"
              :key="state.value"
              :label="state.label"
              :value="state.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="dataTime" label="登录时间">
          <el-date-picker
            v-model="searchData.dataTime"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="登录开始时间"
            end-placeholder="登录结束时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div class="vxe-grid--toolbar-wrapper"></div>
      <div class="table-wrapper">
        <el-table :data="tableData" >
          <el-table-column label="序号" type="index" align="center"/>
<!--          <el-table-column prop="id" label="id" width="80" align="center"/>-->
<!--          <el-table-column prop="userId" label="用户ID" align="center"/>-->
          <el-table-column prop="account" label="用户名" align="center"/>
          <el-table-column prop="identity" label="身份" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.identity === 1" type="primary" effect="plain">超级管理员</el-tag>
              <el-tag v-else type="warning" effect="plain">普通管理员</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="realName" label="真实姓名" align="center"/>
          <el-table-column prop="loginState" label="登录状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.loginState == 1" type="success" effect="plain">成功</el-tag>
              <el-tag v-else type="danger" effect="plain">失败</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="loginResult" label="登录结果" align="center">
            <template #default="scope">
              {{ scope.row.loginResult ? scope.row.loginResult : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="ip" label="ip" align="center">
            <template #default="scope">
              {{ scope.row.ip ? scope.row.ip : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="deviceInfo" label="设备信息" align="center">
            <template #default="scope">
              {{ scope.row.deviceInfo ? scope.row.deviceInfo : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="sourceType" label="来源" align="center">
            <template #default="scope">
              {{ scope.row.sourceType ? scope.row.sourceType : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="loginTime" label="登录时间" align="center">
            <template #default="scope">
              {{ scope.row.loginTime ? scope.row.loginTime : '-' }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="goToDetails(scope.row.id)">详情</el-button>
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
          :current-page="paginationData.pageNo"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
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
