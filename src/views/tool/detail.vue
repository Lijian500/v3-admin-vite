<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import {
  getToolDetailApi,
  updateToolApi,
  createToolApi,
  likeToolApi
} from "@/api/tool"
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
// import { ArrowLeft, ThumbsUp } from "@element-plus/icons-vue"
import { ArrowLeft} from "@element-plus/icons-vue"
import TinymceEditor from '@/components/TinymceEditor/index.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const isEdit = ref(false)
const isAdd = ref(false)
const readonly = ref(true)

// 根据路由判断当前模式
onMounted(() => {
  const mode = route.name
  if (mode === 'ToolEdit') {
    isEdit.value = true
    readonly.value = false
  } else if (mode === 'ToolAdd') {
    isAdd.value = true
    readonly.value = false
  }

  if (!isAdd.value) {
    getToolData()
  }
})

// 表单相关
const formRef = ref<FormInstance | null>(null)
const formData = ref({
  id: undefined,
  instrumentTitle: "",
  instrumentCategoryId: "",
  instrumentCategoryName: "212",
  instrumentTags: "",
  instrumentDes: "",
  instrumentIcon: "",
  instrumentLink: "",
  exampleEffect: "",
  operatingDes: "",
  suggestDes: "",
  state: 1,
  sort: 0,
  score: 0,
  likeNum: 0,
  createUser: "",
  createUserId: "",
  updateUser: "",
  updateUserId: "",
  createTime: "",
  updateTime: ""
})

const formRules: FormRules = {
  instrumentTitle: [{ required: true, message: "请输入工具名称", trigger: "blur" }],
  instrumentCategoryId: [{ required: true, message: "请输入分类", trigger: "blur" }],
  instrumentDes: [{ required: true, message: "请输入工具描述", trigger: "blur" }],
  instrumentLink: [{ required: true, message: "请输入工具链接", trigger: "blur" }]
}

// 获取工具详情
const getToolData = () => {
  const id = route.params.id
  if (!id) return

  loading.value = true
  getToolDetailApi(id)
    .then(res => {
      formData.value = res.data
    })
    .catch(() => {
      ElMessage.error("获取工具详情失败")
    })
    .finally(() => {
      loading.value = false
    })
}

// 保存
const handleSave = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return

    loading.value = true
    const api = isAdd.value ? createToolApi : updateToolApi
    api(formData.value)
      .then(() => {
        ElMessage.success(isAdd.value ? "创建成功" : "更新成功")
        router.push({ name: "ToolManagement" })
      })
      .finally(() => {
        loading.value = false
      })
  })
}

// 点赞功能
const handleLike = () => {
  if (!formData.value.id) return

  likeToolApi(formData.value.id)
    .then(() => {
      formData.value.likeNum++
      ElMessage.success("点赞成功")
    })
}

const goBack = () => {
  router.go(-1)
}

// 添加工具状态选项
const toolState = [
  { value: 1, label: "启用" },
  { value: 0, label: "禁用" }
]
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <template #header>
        <div class="card-header">
          <el-button :icon="ArrowLeft" link @click="goBack">返回</el-button>
          <span>{{ isAdd ? '新增工具' : (isEdit ? '编辑工具' : '工具详情') }}</span>
          <div v-if="!isAdd && !isEdit" class="like-wrapper">
            <el-button type="primary" :icon="ArrowLeft" @click="handleLike">
              点赞 ({{ formData.likeNum }})
            </el-button>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        :disabled="readonly"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="instrumentTitle" label="工具名称">
              <el-input v-model="formData.instrumentTitle" placeholder="请输入工具名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="instrumentCategoryId" label="分类">
              <el-input v-model="formData.instrumentCategoryId" placeholder="请输入分类"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="instrumentTags" label="标签">
              <el-input v-model="formData.instrumentTags" placeholder="请输入标签，多个标签用逗号分隔"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="instrumentLink" label="工具链接">
              <el-input v-model="formData.instrumentLink" placeholder="请输入工具链接"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="instrumentIcon" label="工具图标">
              <el-input v-model="formData.instrumentIcon" placeholder="请输入图标链接"/>
            </el-form-item>
          </el-col>
<!--          <el-col :span="12">-->
<!--            <el-form-item prop="state" label="状态">-->
<!--              <el-select v-model="formData.state" placeholder="请选择状态">-->
<!--                <el-option-->
<!--                  v-for="item in toolState"-->
<!--                  :key="item.value"-->
<!--                  :label="item.label"-->
<!--                  :value="item.value"-->
<!--                />-->
<!--              </el-select>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
        </el-row>

<!--        <el-row :gutter="20">-->
<!--          <el-col :span="12">-->
<!--            <el-form-item prop="sort" label="排序">-->
<!--              <el-input-number v-model="formData.sort" :min="0" placeholder="请输入排序号"/>-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--          <el-col :span="12">-->
<!--            <el-form-item prop="score" label="评分">-->
<!--              <el-input-number-->
<!--                v-model="formData.score"-->
<!--                :min="0"-->
<!--                :max="5"-->
<!--                :step="0.5"-->
<!--                placeholder="请输入评分"-->
<!--              />-->
<!--            </el-form-item>-->
<!--          </el-col>-->
<!--        </el-row>-->

        <el-form-item prop="instrumentDes" label="工具描述">
          <el-input
            v-model="formData.instrumentDes"
            type="textarea"
            :rows="3"
            placeholder="请输入工具描述"
          />
        </el-form-item>

        <el-form-item prop="exampleEffect" label="示例效果">
          <TinymceEditor
            v-model="formData.exampleEffect"
            placeholder="请输入示例效果"
          />
        </el-form-item>

        <el-form-item prop="operatingDes" label="操作说明">
          <TinymceEditor
            v-model="formData.operatingDes"
            placeholder="请输入操作说明"
          />
        </el-form-item>

        <el-form-item prop="suggestDes" label="使用建议">
          <el-input
            v-model="formData.suggestDes"
            type="textarea"
            :rows="3"
            placeholder="请输入使用建议"
          />
        </el-form-item>

        <el-row v-if="!readonly">
          <el-col :span="24">
            <el-form-item>
              <div class="form-buttons">
                <el-button @click="goBack">取消</el-button>
                <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 只读模式下显示创建和更新信息 -->
        <template v-if="readonly && !isAdd">
          <el-divider />
          <el-descriptions :column="2">
            <el-descriptions-item label="创建人">{{ formData.createUser }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formData.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新人">{{ formData.updateUser }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formData.updateTime }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.like-wrapper {
  margin-left: auto;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

:deep(.el-form-item__content) {
  justify-content: flex-start;
}

.el-divider {
  margin: 24px 0;
}
</style>
