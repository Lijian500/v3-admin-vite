// src/components/RichText/index.vue
<script lang="ts" setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/tinymce'

// 引入主题
import 'tinymce/themes/silver/theme'

// 引入图标
import 'tinymce/icons/default'

// 引入插件
import 'tinymce/plugins/advlist/plugin'
import 'tinymce/plugins/autolink/plugin'
import 'tinymce/plugins/lists/plugin'
import 'tinymce/plugins/link/plugin'
import 'tinymce/plugins/image/plugin'
import 'tinymce/plugins/charmap/plugin'
import 'tinymce/plugins/preview/plugin'
import 'tinymce/plugins/anchor/plugin'
import 'tinymce/plugins/searchreplace/plugin'
import 'tinymce/plugins/visualblocks/plugin'
import 'tinymce/plugins/code/plugin'
import 'tinymce/plugins/fullscreen/plugin'
import 'tinymce/plugins/insertdatetime/plugin'
import 'tinymce/plugins/media/plugin'
import 'tinymce/plugins/table/plugin'
import 'tinymce/plugins/paste/plugin'
import 'tinymce/plugins/help/plugin'
import 'tinymce/plugins/wordcount/plugin'

interface Props {
  modelValue: string
  height?: number | string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  placeholder: '请输入内容',
  disabled: false
})

const emit = defineEmits(['update:modelValue', 'change'])

// 使用 ref 来跟踪内部内容
const content = ref(props.modelValue)

// 监听 props.modelValue 的变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// 编辑器配置
const init = {
  selector: 'textarea',
  language: 'zh_CN',
  // 使用 TinyMCE 官方 CDN 的中文语言包
  language_url: 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/langs/zh_CN.js',
  height: props.height,
  menubar: true,
  relative_urls: false,
  remove_script_host: false,
  convert_urls: false,
  skin_url: '/tinymce/skins/ui/oxide',
  content_css: '/tinymce/skins/content/default/content.css',
  toolbar: [
    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify |' +
    'bullist numlist outdent indent | removeformat | help | image media table | preview fullscreen'
  ],
  plugins: [
    'advlist autolink lists link image charmap preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table paste help wordcount'
  ],
  placeholder: props.placeholder,
  branding: false,
  resize: false,
  statusbar: true,
  // 设置中文界面默认字体
  content_style: `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
  `,
  images_upload_handler: (blobInfo: any, success: Function, failure: Function) => {
    const file = blobInfo.blob()
    const reader = new FileReader()
    reader.onload = (e) => {
      success(e.target?.result)
    }
    reader.readAsDataURL(file)
  },
  setup: (editor) => {
    // 添加编辑器初始化后的自定义设置
    editor.on('init', () => {
      editor.setContent(content.value)
    })
  }
}

// 处理内容变化
const handleChange = (value: string) => {
  content.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

// 组件卸载前清理
onBeforeUnmount(() => {
  // @ts-ignore
  tinymce.remove()
})
</script>

<template>
  <div class="tinymce-container">
    <Editor
      :value="content"
      :init="init"
      :disabled="disabled"
      @input="handleChange"
    />
  </div>
</template>

<style scoped>
.tinymce-container {
  width: 100%;
  position: relative;
}
</style>
