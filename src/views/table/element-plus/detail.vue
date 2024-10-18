<template>
  <div class="user-details">
    <el-card shadow="never" class="user-card">
      <template #header>
        <div class="card-header">
          <span>用户详情</span>
        </div>
      </template>
      <el-descriptions title="" :column="2" border>
        <el-descriptions-item label="账号">{{ user.account }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ user.realName }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ user.userId }}</el-descriptions-item>
        <el-descriptions-item label="身份">{{ formattedIdentity }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ formattedUserState }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ user.createTime }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ user.createUser }}</el-descriptions-item>
        <el-descriptions-item label="创建人ID">{{ user.createUserId }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ user.lastLoginTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ user.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="更新人">{{ user.updateUser }}</el-descriptions-item>
        <el-descriptions-item label="更新人ID">{{ user.updateUserId }}</el-descriptions-item>

      </el-descriptions>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import { ElCard, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import {getUserOneApi} from "@/api/table"
import { useRoute } from 'vue-router';

interface User {
  account: string
  createTime: string
  createUser: string
  createUserId: string
  id: number
  identity: number
  isDelete: number
  lastLoginTime: string
  pwd: string
  realName: string
  token: string
  updateTime: string
  updateUser: string
  updateUserId: string
  userId: string
  userState: number
}

const user = ref<User>({
  account: '',
  createTime: '',
  createUser: '',
  createUserId: '',
  id: 0,
  identity: 0,
  isDelete: 0,
  lastLoginTime: '',
  pwd: '',
  realName: '',
  token: '',
  updateTime: '',
  updateUser: '',
  updateUserId: '',
  userId: '',
  userState: 0
})

const loadUserDetails = async (id: number) => {
  try {
    const response = await getUserOneApi(id)
    user.value = response.data
  } catch (error) {
    console.error('获取用户详情失败', error)
  }
}

const route = useRoute();
const id = route.params.id;

onMounted(() => {
  loadUserDetails(id)
})

// 计算属性，用于格式化身份值
const formattedIdentity = computed(() => {
  if (user.value.identity === 1) {
    return '超级管理员';
  } else if (user.value.identity === 2) {
    return '普通管理员';
  } else {
    return '未知身份';
  }
});

// 计算属性，用于格式化用户状态值
const formattedUserState = computed(() => {
  if (user.value.userState === 1) {
    return '启用';
  } else if (user.value.userState === 2) {
    return '禁用';
  } else {
    return '未知状态';
  }
});
</script>
<style scoped lang="scss">
/*
.user-details {
  padding: 15px;
  .user-card {
    margin: 0 auto;
  }
  .header {
    font-size: 18px;
    font-weight: bold;
  }
}

 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
