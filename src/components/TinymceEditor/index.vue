<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
// 修改引入方式
import Editor from '@tinymce/tinymce-vue'
// 引入 tinymce
import tinymce from 'tinymce/tinymce'
// 引入主题
import 'tinymce/themes/silver'
// 引入插件
import 'tinymce/icons/default'
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
import 'tinymce/plugins/help'
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
  }
})

const emit = defineEmits(['update:modelValue'])

// 配置 tinymce
const init = {
  selector: 'textarea',
  language: 'zh_CN',
  skin: 'oxide', // 皮肤
  height: props.height,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | formatselect | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  branding: false,
  resize: false,
  readonly: props.disabled,
  // 配置 tinymce 静态资源的位置
  base_url: '/tinymce',
  setup: (editor) => {
    editor.on('init', () => {
      if (props.disabled) {
        editor.setMode('readonly')
      }
    })
  }
}

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}

// 组件卸载时销毁编辑器实例
onBeforeUnmount(() => {
  tinymce.remove()
})
</script>

<template>
  <Editor
    :modelValue="modelValue"
    :init="init"
    :disabled="disabled"
    @update:modelValue="handleInput"
  />
</template>

<style scoped>
:deep(.tox-tinymce) {
  border-radius: 4px;
}
</style>
