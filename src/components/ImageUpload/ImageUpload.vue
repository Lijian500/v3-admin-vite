<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue"
import { ElInput, ElButton, ElImage } from "element-plus"
import { uploadToOBS } from "@/utils/uploadService"

interface Props {
  modelValue: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void
}>()

const imageUrl = ref<string | null>(props.modelValue)

const handleImageUpload = async () => {
  try {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")

    input.onchange = async () => {
      const file = (input as HTMLInputElement).files?.[0]
      if (!file) return

      const url = await uploadToOBS(file)
      imageUrl.value = url
      emit("update:modelValue", url)
    }

    input.click()
  } catch (error) {
    console.error("Image upload failed:", error)
  }
}

const handleRemove = () => {
  imageUrl.value = null
  emit("update:modelValue", null)
}
</script>

<template>
  <div class="icon-upload">
    <el-input v-model="imageUrl" placeholder="Upload an image" readonly>
      <template #append>
        <el-button @click="handleImageUpload">
          {{ imageUrl ? "Change" : "Upload" }}
        </el-button>
      </template>
    </el-input>
    <div v-if="imageUrl" class="mt-4 flex items-center">
      <el-image :src="imageUrl" :alt="'Uploaded Image'" class="h-12 w-12 mr-4" />
      <el-button type="danger" @click="handleRemove">Remove</el-button>
    </div>
  </div>
</template>
