<script lang="ts" setup>
import { onBeforeUnmount } from "vue"
import Editor from "@tinymce/tinymce-vue"
import tinymce from "tinymce/tinymce"
// import ObsClient from 'esdk-obs-browserjs'
import { uploadToOBS } from "@/utils/uploadService"

// 引入主题和图标
import "tinymce/themes/silver"
import "tinymce/icons/default"

// 引入核心插件
import "tinymce/models/dom"

// 引入其他插件
import "tinymce/plugins/advlist"
import "tinymce/plugins/autolink"
import "tinymce/plugins/lists"
import "tinymce/plugins/link"
import "tinymce/plugins/image"
import "tinymce/plugins/charmap"
import "tinymce/plugins/preview"
import "tinymce/plugins/anchor"
import "tinymce/plugins/searchreplace"
import "tinymce/plugins/visualblocks"
import "tinymce/plugins/code"
import "tinymce/plugins/fullscreen"
import "tinymce/plugins/insertdatetime"
import "tinymce/plugins/media"
import "tinymce/plugins/table"
import "tinymce/plugins/wordcount"

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  placeholder: {
    type: String,
    default: "请输入内容"
  },
  height: {
    type: [Number, String],
    default: 300
  },
  disabled: {
    type: Boolean,
    default: false
  },
  toolbarMode: {
    type: String,
    default: "full"
  }
})

const emit = defineEmits(["update:modelValue"])

// // OBS基础配置
// const obsConfig = {
//   server: 'obs.cn-north-4.myhuaweicloud.com', // 替换为您的 OBS 服务器地址
//   bucket: 'tb-train-dev', // 替换为您的 bucket 名称
//   prefix: 'richEditor/' // 文件存储的前缀路径
// }
//
// // 创建一个响应式的 obsClient 引用
// const obsClient = ref<any>(null)
//
// // 定义获取临时凭证的接口
// interface TempCredentials {
//   accessKeyId: string
//   secretAccessKey: string
//   securityToken: string
//   expiration: string
// }
//
// // 获取临时凭证
// const fetchTemporaryCredentials = async (): Promise<TempCredentials> => {
//   try {
//     const response = await fetch('https://basic-service-api.d1.tb.com/api/oss/token?ossType=HUAWEI') // 替换为您的实际接口
//     if (!response.ok) {
//       throw new Error('Failed to fetch credentials')
//     }
//     return await response.json()
//   } catch (error) {
//     console.error('Error fetching temporary credentials:', error)
//     throw error
//   }
// }
//
// // 初始化或更新 OBS 客户端
// const initObsClient = async () => {
//   try {
//     const credentials = await fetchTemporaryCredentials()
//
//     obsClient.value = new ObsClient({
//       access_key_id: credentials.accessKeyId,
//       secret_access_key: credentials.secretAccessKey,
//       security_token: credentials.securityToken,
//       server: obsConfig.server
//     })
//
//     return obsClient.value
//   } catch (error) {
//     console.error('Failed to initialize OBS client:', error)
//     throw error
//   }
// }
//
// // 获取文件扩展名
// const getFileExtension = (filename: string): string => {
//   return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
// }
//
// // 生成唯一文件名
// const generateUniqueFilename = (originalFilename: string): string => {
//   const ext = getFileExtension(originalFilename)
//   const timestamp = Date.now()
//   const random = Math.floor(Math.random() * 1000)
//   return `${timestamp}-${random}.${ext}`
// }

// // 上传文件到华为云 OBS
// const uploadToOBS = async (file: File): Promise<string> => {
//   try {
//     // 每次上传前确保使用最新的临时凭证
//     const client = await initObsClient()
//
//     const uniqueFilename = generateUniqueFilename(file.name)
//     const objectKey = `${obsConfig.prefix}${uniqueFilename}`
//
//     const result = await client.putObject({
//       Bucket: obsConfig.bucket,
//       Key: objectKey,
//       Body: file
//     })
//
//     if (result.CommonMsg.Status === 200) {
//       return `https://${obsConfig.bucket}.${obsConfig.server}/${objectKey}`
//     } else {
//       throw new Error('Upload failed')
//     }
//   } catch (error) {
//     console.error('OBS upload error:', error)
//     throw error
//   }
// }

// 定义工具栏配置
const getToolbarConfig = (mode: string) => {
  const simple =
    "undo redo | formatselect | " + "bold italic | alignleft aligncenter alignright | " + "bullist numlist | link image"

  const full =
    "undo redo | blocks fontfamily fontsize | " +
    "bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | " +
    "bullist numlist outdent indent | " +
    "removeformat | link image media table | " +
    "fullscreen preview code | help"

  return mode === "simple" ? simple : full
}

// TinyMCE 初始化配置
const init = {
  selector: "textarea",
  language: "zh_CN",
  skin: "oxide",
  height: props.height,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "help",
    "wordcount"
  ],
  toolbar: getToolbarConfig(props.toolbarMode),
  menubar: props.toolbarMode === "full",
  statusbar: true,
  resize: true,
  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  branding: false,
  promotion: false,
  base_url: "/tinymce",

  // 图片上传配置
  images_upload_handler: async (blobInfo: any, progress: any) => {
    try {
      const file = blobInfo.blob()
      const url = await uploadToOBS(file)
      return url
    } catch (error) {
      console.error("Upload failed:", error)
      throw new Error("Image upload failed")
    }
  },

  // 文件选择配置
  file_picker_types: "file image media",
  file_picker_callback: (callback: any, value: any, meta: any) => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")

    input.onchange = async function () {
      const file = (input as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const url = await uploadToOBS(file)
        callback(url, { title: file.name })
      } catch (error) {
        console.error("Upload failed:", error)
      }
    }

    input.click()
  },

  block_formats: "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6;",
  fontsize_formats: "12px 14px 16px 18px 24px 36px 48px",

  setup: (editor: any) => {
    editor.on("init", () => {
      if (props.disabled) {
        // editor.setMode('readonly')
      }
    })
  }
}

const handleInput = (value: string) => {
  emit("update:modelValue", value)
}

// 组件卸载时清理
onBeforeUnmount(() => {
  tinymce.remove()
})
</script>

<template>
  <div class="tinymce-container">
    <Editor :model-value="modelValue" :init="init" :disabled="disabled" @update:model-value="handleInput" />
  </div>
</template>

<style lang="scss" scoped>
.tinymce-container {
  :deep(.tox-tinymce) {
    border-radius: 4px;

    .tox-toolbar__primary {
      background-color: #f8f9fa;
      border-bottom: 1px solid #e2e6ea;
    }

    .tox-statusbar {
      border-top: 1px solid #e2e6ea;
    }
  }
}
</style>
