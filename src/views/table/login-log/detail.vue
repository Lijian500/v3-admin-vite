<template>
  <div class="login-log-details">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>登录日志详情</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="账号">{{ logDetails.account }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ logDetails.realName }}</el-descriptions-item>
        <el-descriptions-item label="登录时间">{{ logDetails.loginTime }}</el-descriptions-item>
        <el-descriptions-item label="登录结果">
          <!-- 1登录成功 2登录失败 3退出登录 -->
          <el-tag :type="getLogResultType(logDetails.loginState)" effect="plain">
            {{ getLogResultText(logDetails.loginState) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ logDetails.ip }}</el-descriptions-item>
        <el-descriptions-item label="设备信息">{{
            logDetails.deviceInfo ? logDetails.deviceInfo : '-'
          }}
        </el-descriptions-item>
        <el-descriptions-item label="来源类型">{{ logDetails.sourceType ? logDetails.sourceType : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ logDetails.userId }}</el-descriptions-item>
        <el-descriptions-item label="登录日志ID">{{ logDetails.loginLogId }}</el-descriptions-item>
        <el-descriptions-item label="ID">{{ logDetails.id }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {ElCard, ElDescriptions, ElDescriptionsItem, ElTag} from 'element-plus'
import {getLogDetailApi} from "@/api/login-log";
import {useRoute} from "vue-router";

interface LoginLogDetails {
  account: string
  deviceInfo: string
  id: number
  ip: string
  loginLogId: string
  loginResult: string
  loginState: number
  loginTime: string
  realName: string
  sourceType: string
  userId: string
}

const logDetails = ref<LoginLogDetails>({
  account: '',
  deviceInfo: '',
  id: 0,
  ip: '',
  loginLogId: '',
  loginResult: '',
  loginState: 0,
  loginTime: '',
  realName: '',
  sourceType: '',
  userId: ''
})


// 从路由中获取id,查询详情数据
const loadLoginLogDetails = async (id: number) => {
  try {
    const response = await getLogDetailApi(id)
    logDetails.value = response.data
  } catch (error) {
    console.error('获取日志详情失败', error)
  }
}
const getLogResultType = (state: number) => {
  switch (state) {
    case 1:
      return 'success';
    case 2:
      return 'danger';
    default:
      return 'primary';
  }
};

const getLogResultText = (state: number) => {
  switch (state) {
    case 1:
      return '登录成功';
    case 2:
      return '登录失败';
    case 3:
      return '退出登录';
    default:
      return '未知状态';
  }
};

const route = useRoute();
const id = Number(route.params.id);

// 挂载后, 获取日志详情数据
onMounted(() => {
  loadLoginLogDetails(id)
})
</script>

<style scoped>
.login-log-details {
  /*
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
*/
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
