<script lang="ts" setup>
import { nextTick, onMounted, reactive, ref, watch } from "vue"
import {
  createCategoryApi,
  deleteBatchApi,
  deleteCategoryApi,
  getCategoryListApi,
  getCategoryTreeApi,
  updateCategoryApi,
  updateCategoryStateApi
} from "@/api/category/index.ts"
import {ElMessage, ElMessageBox, type FormInstance, type FormRules, UploadProps} from "element-plus"
import * as ElementPlusIconsVue from "@element-plus/icons-vue"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { cloneDeep } from "lodash-es"
import { useUserStoreHook } from "@/store/modules/user"
import { uploadToOBS } from "@/utils/uploadService"

defineOptions({
  name: "CategoryManagement"
})

const userStore = useUserStoreHook()

// 获取所有图标
const icons = ref<{ name: string; component: any }[]>([])
const iconVisible = ref(false)

// 初始化图标列表
const initIcons = () => {
  icons.value = Object.keys(ElementPlusIconsVue).map((key) => ({
    name: key,
    component: ElementPlusIconsVue[key as keyof typeof ElementPlusIconsVue]
  }))
}

// 选择图标
const handleSelectIcon = (iconName: string) => {
  formData.value.icon = iconName
  iconVisible.value = false
}

const categoryTreeData = ref([]) // 存储分类树数据

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const categoryState = [
  { label: "草稿", value: 1 },
  { label: "启用", value: 2 },
  { label: "停用", value: 3 },
  { label: "无效", value: 4 }
]

const cascaderRef = ref()

//#region 增
const DEFAULT_FORM_DATA = {
  id: undefined,
  categoryId: undefined,
  categoryName: "",
  parentId: "",
  parentName: "",
  icon: "",
  sort: 0,
  createUser: userStore.username,
  createUserId: userStore.userId,
  updateUser: userStore.username,
  updateUserId: userStore.userId
}

const dialogVisible = ref<boolean>(false)
const formDetailBut = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = ref(cloneDeep(DEFAULT_FORM_DATA))

const formRules: FormRules = {
  categoryName: [{ required: true, trigger: "blur", message: "请输入分类名称" }],
  sort: [{ required: true, trigger: "blur", message: "请输入排序号" }],
  icon: [{ required: true, trigger: "blur", message: "请选择图标" }]
}

const handleCreateOrUpdate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (!valid) return console.error("表单校验不通过", fields)
    loading.value = true
    const api = formData.value.id === undefined ? createCategoryApi : updateCategoryApi
    api(formData.value)
      .then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getCategoryData()
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 打开对话框时加载分类树数据
const handleDialogOpen = async () => {
  try {
    loading.value = true
    const response = await getCategoryTreeApi()
    categoryTreeData.value = response.data

    // 如果是修改操作，需要设置级联选择器的默认值
    if (formData.value.id !== undefined && formData.value.parentId) {
      // 这里可能需要根据实际数据结构处理父级ID的路径
      await nextTick() // 等待DOM更新
      formRef.value?.validateField("parentId")
    }

    // 如果是详情方式打开，则所有选项都不能编辑
  } catch (error) {
    console.error("加载分类树失败：", error)
    ElMessage.error("加载分类树失败")
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formDetailBut.value = false
  formData.value.icon = ""
  formRef.value?.clearValidate()
  formData.value = cloneDeep(DEFAULT_FORM_DATA)
}
//#endregion

//#region 删
const handleDelete = (row) => {
  ElMessageBox.confirm(`正在删除分类：${row.categoryName}，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteCategoryApi(row.id).then(() => {
      ElMessage.success("删除成功")
      getCategoryData()
    })
  })
}
//#endregion

//#region 批量删除
const selectedRows = ref([])

const handleSelectionChange = (val) => {
  selectedRows.value = val
}

const deleteSelected = () => {
  if (selectedRows.value.length === 0) {
    ElMessage("请先选择要删除的项")
    return
  }

  ElMessageBox.confirm(`正在删除选中的${selectedRows.value.length}条数据，确认删除？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteBatchApi({ ids: selectedRows.value.map((item) => item.id) }).then(() => {
      ElMessage.success("删除成功")
      getCategoryData()
    })
  })
}
//#endregion

//#region 改
const handleUpdate = (row: any) => {
  dialogVisible.value = true
  formData.value = cloneDeep(row)
}
//#endregion

//#region 启用停用
const handleCategoryState = (row: any) => {
  const actionText = row.state === 1 || row.state === 3 ? "启用" : "停用"
  if (row.state === 1 || row.state === 3) {
    ElMessageBox.confirm(`正在${actionText}分类：${row.categoryName}，确认${actionText}？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      updateCategoryStateApi({ categoryId: row.categoryId, state: 2 }).then(() => {
        ElMessage.success(`${actionText}成功`)
        getCategoryData()
      })
    })
  } else {
    updateCategoryStateApi({ categoryId: row.categoryId, state: 3 }).then(() => {
      ElMessage.success(`${actionText}成功`)
      getCategoryData()
    })
  }
}
//#endregion

//#region 查
const tableData = ref([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  categoryName: "",
  state: undefined,
  dataTime: [] as [string, string] | []
})

const getCategoryData = () => {
  loading.value = true
  const startTime = searchData.dataTime && searchData.dataTime[0] ? searchData.dataTime[0] + " 00:00:00" : undefined
  const endTime = searchData.dataTime && searchData.dataTime[1] ? searchData.dataTime[1] + " 23:59:59" : undefined

  getCategoryListApi({
    pageNo: paginationData.pageNo,
    pageSize: paginationData.pageSize,
    categoryName: searchData.categoryName || undefined,
    state: searchData.state || undefined,
    createStartTime: startTime || undefined,
    createEndTime: endTime || undefined
  })
    .then((res) => {
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
  paginationData.pageNo === 1 ? getCategoryData() : (paginationData.pageNo = 1)
}

const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

//region 列表上图片预览
const previewImage = ref<string>("")
const previewVisible = ref<boolean>(false)

const showPreview = (imageUrl: string) => {
  previewImage.value = imageUrl
  previewVisible.value = true
}

//endregion

const handleChange = (value: any) => {
  if (!value) {
    formData.value.parentId = null
    formData.value.parentName = null
    return
  }

  // 通过 ref 获取选中节点
  const selectedNodes = cascaderRef.value.getCheckedNodes()
  if (selectedNodes && selectedNodes.length > 0) {
    const node = selectedNodes[0]
    formData.value.parentId = node.data.categoryId
    formData.value.parentName = node.data.categoryName
    console.log("选中的值:", node.data.categoryId)
    console.log("选中的标签:", node.data.categoryName)
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const uploadSubmit = async (options: any) => {
  const { file, onSuccess, onError } = options

  if (file.size > MAX_FILE_SIZE) {
    onError(new Error("文件大小超过限制，请上传小于5MB的图片"))
    return
  }
  if (file.type !== "image/jpeg") {
    onError(new Error("Avatar picture must be JPG format!"))
    return
  }

  try {
    formData.value.icon = await uploadToOBS(file)
  } catch (error: any) {
    onError(error)
    console.error("文件上传失败:", error)
    ElMessage.error("图片上传失败: " + error.message)
  }
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  previewImage.value = uploadFile.url!
  previewVisible.value = true
}

/** 监听分页参数的变化 */
watch([() => paginationData.pageNo, () => paginationData.pageSize], getCategoryData, { immediate: true })

// 组件挂载时初始化图标列表
onMounted(() => {
  initIcons()
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="categoryName" label="分类名称">
          <el-input v-model="searchData.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item prop="state" label="状态">
          <el-select v-model="searchData.state" clearable style="width: 100px" placeholder="请选择状态">
            <el-option v-for="state in categoryState" :key="state.value" :label="state.label" :value="state.value" />
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
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增分类</el-button>
          <!--          <el-button type="danger" :icon="Delete" @click="deleteSelected">批量删除</el-button>-->
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getCategoryData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="categoryId" label="分类ID" align="center" />
          <el-table-column prop="categoryName" label="分类名称" align="center" />
          <el-table-column prop="parentName" label="父级分类" align="center">
            <template #default="scope">
              {{ scope.row.parentName || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="icon" label="图标" align="center">
            <template #default="scope">
              <img
                v-if="scope.row.icon"
                :src="scope.row.icon"
                alt="图标"
                class="icon-image"
                @click="showPreview(scope.row.icon)"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="state" label="状态" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.state === 1" type="info" effect="plain">草稿</el-tag>
              <el-tag v-else-if="scope.row.state === 2" type="success" effect="plain">启用</el-tag>
              <el-tag v-else-if="scope.row.state === 3" type="warning" effect="plain">停用</el-tag>
              <el-tag v-else-if="scope.row.state === 4" type="warning" effect="plain">无效</el-tag>
              <el-tag v-else type="danger" effect="plain">未知状态</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" align="center">
            <template #default="scope">
              {{ scope.row.createTime || "-" }}
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="180" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                text
                bg
                size="small"
                @click="
                  handleUpdate(scope.row),
                  formDetailBut = true
                "
                >详情</el-button
              >
              <el-button
                v-if="scope.row.state === 1"
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row)"
                >修改
              </el-button>
              <el-button
                v-if="scope.row.state !== 4"
                :type="scope.row.state === 1 || scope.row.state === 3 ? 'success' : 'danger'"
                text
                bg
                size="small"
                @click="handleCategoryState(scope.row)"
              >
                {{ scope.row.state === 1 || scope.row.state === 3 ? "启用" : "停用" }}
              </el-button>
              <el-button
                v-if="scope.row.state === 1 || scope.row.state === 3"
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row)"
                >删除
              </el-button>
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
    <!-- 新增/修改/详情 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.id === undefined ? '新增分类' : formDetailBut ? '详情' : '修改分类'"
      @closed="resetForm"
      @open="handleDialogOpen"
      width="30%"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="left"
        :disabled="formDetailBut"
      >
        <el-form-item prop="categoryName" label="分类名称">
          <el-input v-model="formData.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item prop="parentId" label="父级分类">
          <el-cascader
            ref="cascaderRef"
            v-model="formData.parentId"
            :options="categoryTreeData"
            :props="{
              value: 'categoryId',
              label: 'categoryName',
              children: 'child',
              checkStrictly: true
            }"
            clearable
            filterable
            :show-all-levels="false"
            placeholder="请选择父级分类"
            @change="handleChange"
          />
        </el-form-item>
        <el-form-item prop="icon" label="图标">
          <el-upload
            v-model="formData.icon"
            :http-request="uploadSubmit"
            list-type="picture-card"
            :limit="1"
            show-file-list
            :on-preview="handlePictureCardPreview"
          >
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item prop="sort" label="排序">
          <el-input-number v-model="formData.sort" :min="0" placeholder="请输入排序号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button v-if="!formDetailBut" @click="dialogVisible = false">取消</el-button>
        <el-button v-if="!formDetailBut" type="primary" @click="handleCreateOrUpdate" :loading="loading">确认</el-button>
      </template>
    </el-dialog>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" @click="previewVisible = false" width="50%">
      <img :src="previewImage" alt="预览" style="width: 100%; height: auto" />
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

/**
 * 图标选择样式
 */
.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  padding: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #f5f7fa;
    border-color: #dcdfe6;
  }

  .icon-name {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
}

.icon-select {
  :deep(.el-input-group__append) {
    .el-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 12px;
    }
  }
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.icon-image {
  width: 80px; /* 根据需要调整图片大小 */
  height: 50px; /* 根据需要调整图片大小 */
  object-fit: cover; /* 保持图片比例 */
}
</style>
