<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import {
  createToolApi,
  deleteToolApi,
  updateToolApi,
  getToolListApi,
  deleteBatchApi
} from "@/api/tool"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"
import router from "@/router"

defineOptions({
  name: "ToolManagement"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const toolState = [
  { value: 10, label: "停用" },
  { value: 20, label: "启用" },
  { value: 30, label: "草稿" }
]

// 表格数据
const tableData = ref([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  instrumentTitle: "",
  instrumentCategoryId: "",
  state: undefined,
  dataTime: [] as [string, string] | []
})

// 获取表格数据
const getTableData = () => {
  loading.value = true
  const startTime = searchData.dataTime && searchData.dataTime[0] ? searchData.dataTime[0] + " 00:00:00" : undefined
  const endTime = searchData.dataTime && searchData.dataTime[1] ? searchData.dataTime[1] + " 23:59:59" : undefined

  getToolListApi({
    pageNo: paginationData.pageNo,
    pageSize: paginationData.pageSize,
    instrumentTitle: searchData.instrumentTitle || undefined,
    instrumentCategoryId: searchData.instrumentCategoryId || undefined,
    state: searchData.state,
    startTime: startTime,
    endTime: endTime
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

// 搜索和重置
const handleSearch = () => {
  paginationData.pageNo === 1 ? getTableData() : (paginationData.pageNo = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

// 批量删除相关
const selectedRows = ref([])
const handleSelectionChange = (val) => {
  selectedRows.value = val
}
const deleteSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage('请先选择要删除的项')
    return
  }

  ElMessageBox.confirm(`正在删除选中的${selectedRows.value.length}条数据，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteBatchApi({ ids: selectedRows.value.map(item => item.id) })
      .then(() => {
        ElMessage.success('删除成功')
        getTableData()
      })
  })
}

// 单个删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`正在删除工具：${row.instrumentTitle}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteToolApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getTableData()
    })
  })
}

// 跳转到详情/编辑页面
const goToDetails = (id: number) => {
  router.push({ name: 'ToolDetail', params: { id: id } })
}

const goToEdit = (id: number) => {
  router.push({ name: 'ToolEdit', params: { id: id } })
}

const goToAdd = () => {
  router.push({ name: 'ToolAdd' })
}

// 监听分页变化
watch([() => paginationData.pageNo, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="instrumentTitle" label="工具名称">
          <el-input v-model="searchData.instrumentTitle" placeholder="请输入工具名称"/>
        </el-form-item>
        <el-form-item prop="instrumentCategoryId" label="分类">
          <el-input v-model="searchData.instrumentCategoryId" placeholder="请输入分类"/>
        </el-form-item>
        <el-form-item prop="state" label="状态">
          <el-select v-model="searchData.state" clearable style="width: 100px" placeholder="请选择状态">
            <el-option
              v-for="state in toolState"
              :key="state.value"
              :label="state.label"
              :value="state.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="dataTime" label="创建时间">
          <el-date-picker
            v-model="searchData.dataTime"
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="goToAdd">新增工具</el-button>
          <el-button type="danger" :icon="Delete" @click="deleteSelected">批量删除</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData"/>
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center"/>
          <el-table-column prop="instrumentId" label="工具ID" align="center"/>
          <el-table-column prop="instrumentTitle" label="工具名称" align="center"/>
          <el-table-column prop="instrumentCategoryId" label="分类" align="center"/>
          <el-table-column prop="instrumentTags" label="标签" align="center"/>
          <el-table-column prop="likeNum" label="点赞数" align="center"/>
          <el-table-column prop="score" label="评分" align="center"/>
          <el-table-column prop="state" label="状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.state === 1" type="success" effect="plain">启用</el-tag>
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
              <el-button type="primary" text bg size="small" @click="goToEdit(scope.row.id)">修改</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
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
