<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import tinymce from 'tinymce/tinymce'

// 引入主题和图标
import 'tinymce/themes/silver'
import 'tinymce/icons/default'

// 引入核心插件
import 'tinymce/models/dom'

// 引入其他插件
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
// import 'tinymce/plugins/help'
import 'tinymce/plugins/wordcount'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容'
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
    default: 'full' // 可选值：'full' | 'simple'
  }
})

const emit = defineEmits(['update:modelValue'])

// 定义工具栏配置
const getToolbarConfig = (mode: string) => {
  const simple = 'undo redo | formatselect | ' +
    'bold italic | alignleft aligncenter alignright | ' +
    'bullist numlist | link image'

  const full = 'undo redo | blocks fontfamily fontsize | ' +
    'bold italic strikethrough forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
    'bullist numlist outdent indent | ' +
    'removeformat | link image media table | ' +
    'fullscreen preview code | help'

  return mode === 'simple' ? simple : full
}

// 模拟上传图片的API - 实际使用时替换为你的真实上传API
const uploadImage = async (file: File): Promise<string> => {
  // 这里替换为你的实际上传逻辑
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    // 示例：使用 fetch 上传
    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        resolve(data.url)
      })
      .catch(error => {
        reject(error)
      })
  })
}

// TinyMCE 初始化配置
const init = {
  selector: 'textarea',
  language: 'zh_CN',
  skin: 'oxide',
  height: props.height,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
    'preview', 'anchor', 'searchreplace', 'visualblocks',
    'code', 'fullscreen', 'insertdatetime', 'media', 'table',
    'help', 'wordcount'
  ],
  toolbar: getToolbarConfig(props.toolbarMode),
  menubar: props.toolbarMode === 'full',
  statusbar: true,
  resize: true,
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  branding: false,
  promotion: false,
  // readonly: props.disabled,
  base_url: '/tinymce',

  // 图片上传配置
  images_upload_handler: async (blobInfo: any, progress: any) => {
    try {
      const file = blobInfo.blob()
      const url = await uploadImage(file)
      return url
    } catch (error) {
      console.error('Upload failed:', error)
      throw new Error('Image upload failed')
    }
  },

  // 文件选择配置
  file_picker_types: 'file image media',
  file_picker_callback: (callback: any, value: any, meta: any) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')

    input.onchange = async function () {
      const file = (input as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const url = await uploadImage(file)
        callback(url, { title: file.name })
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    input.click()
  },

  // 配置
  block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6;',
  fontsize_formats: '12px 14px 16px 18px 24px 36px 48px',

  setup: (editor) => {
    editor.on('init', () => {
      if (props.disabled) {
        // editor.setMode('readonly')
      }
    })
  }
}

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

// 组件卸载时清理
onBeforeUnmount(() => {
  tinymce.remove()
})
</script>

<template>
  <div class="tinymce-container">
    <Editor
      :model-value="modelValue"
      :init="init"
      :disabled="disabled"
      @update:model-value="handleInput"
    />
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
