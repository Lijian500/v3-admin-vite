<script setup lang="ts">
import { useRouter } from "vue-router"
import { ref, onMounted } from "vue"
import { useUserStore } from "@/store/modules/user"
import { logoutApi } from "@/api/login"

const userStore = useUserStore()
const router = useRouter()
const isLogin = ref(false)
const showDropdown = ref(false)

// 检查登录状态
const checkLoginStatus = () => {
  isLogin.value = !!userStore.token
}

// 退出登录
const handleLogout = () => {
  // localStorage.removeItem("token")
  // isLogin.value = false
  // showDropdown.value = false
  logoutApi()
  userStore.logout()
  // router.push("/")
}

// 进入后台
const goToDashboard = () => {
  router.push("/dashboard")
}

const handleLogin = () => {
  router.push("/login")
}

// 监听点击事件，点击外部时关闭下拉菜单
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest(".user-profile")) {
    showDropdown.value = false
  }
}

onMounted(() => {
  checkLoginStatus()
  document.addEventListener("click", closeDropdown)
})

interface AITool {
  id: number
  name: string
  icon: string
  description: string
  url: string
  isHot?: boolean
}

const aiTools: AITool[] = [
  {
    id: 1,
    name: "秘塔AI搜索",
    icon: "/icons/meta-search.png",
    description: "智能搜索引擎",
    url: "https://metaso.cn",
    isHot: true
  },
  {
    id: 2,
    name: "Kimi.ai",
    icon: "/icons/kimi.png",
    description: "AI助手",
    url: "https://kimi.ai"
  }
  // 其他AI工具数据...
]

const categories = [
  { name: "站内", active: true },
  { name: "搜索", active: false },
  { name: "工具", active: false },
  { name: "社区", active: false },
  { name: "生活", active: false }
]
</script>

<template>
  <div class="home-container">
    <!-- 根据登录状态显示不同按钮 -->
    <div class="header-right">
      <template v-if="!isLogin">
        <button class="login-btn" @click="handleLogin">登录</button>
      </template>
      <template v-else>
        <div class="user-profile" @click="showDropdown = !showDropdown">
          <div class="avatar">
            <img src="/avatar-default.png" alt="用户头像" />
          </div>
          <!-- 下拉菜单 -->
          <div v-show="showDropdown" class="dropdown-menu">
            <div class="dropdown-item" @click="goToDashboard">
              <i class="icon-dashboard" />
              进入后台系统
            </div>
            <div class="dropdown-item" @click="handleLogout">
              <i class="icon-logout" />
              退出登录
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 头部标题 -->
    <div class="header">
      <h1 class="title">未来之路，AI先行</h1>

      <!-- 搜索框 -->
      <div class="search-box">
        <input type="text" placeholder="站内搜索" />
        <button class="search-btn">
          <i class="search-icon" />
        </button>
      </div>

      <!-- 分类导航 -->
      <div class="categories">
        <button v-for="cat in categories" :key="cat.name" :class="['category-btn', { active: cat.active }]">
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- AI工具列表 -->
    <div class="tools-container">
      <div class="tools-header">
        <div class="tab-group">
          <button class="tab active">我的导航</button>
          <button class="tab">最近使用</button>
        </div>
        <div class="tags">
          <span class="tag">热门工具</span>
          <span class="tag">大家喜欢</span>
        </div>
      </div>

      <div class="tools-grid">
        <a v-for="tool in aiTools" :key="tool.id" :href="tool.url" class="tool-card">
          <img :src="tool.icon" :alt="tool.name" class="tool-icon" />
          <div class="tool-info">
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
          </div>
          <span v-if="tool.isHot" class="hot-tag">热门</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  position: relative;
  padding: 2rem;
  min-height: 100vh;
  background: linear-gradient(120deg, #ffd700, #7fff00, #40e0d0);
}

.header {
  text-align: center;
  margin-bottom: 2rem;

  .title {
    font-size: 2.5rem;
    color: #fff;
    margin-bottom: 2rem;
  }
}

.search-box {
  max-width: 600px;
  margin: 0 auto 1.5rem;
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.5rem;

  input {
    flex: 1;
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    color: #fff;
    font-size: 1rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

.categories {
  display: flex;
  justify-content: center;
  gap: 1rem;

  .category-btn {
    padding: 0.5rem 1.5rem;
    border: none;
    background: transparent;
    color: #fff;
    cursor: pointer;

    &.active {
      font-weight: bold;
      border-bottom: 2px solid #fff;
    }
  }
}

.tools-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 1.5rem;
}

.tools-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.tab-group {
  .tab {
    padding: 0.5rem 1rem;
    margin-right: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;

    &.active {
      color: #ff4757;
      font-weight: bold;
    }
  }
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  position: relative;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tool-icon {
    width: 40px;
    height: 40px;
    margin-right: 1rem;
  }

  .tool-info {
    h3 {
      margin: 0;
      font-size: 1rem;
    }

    p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #666;
    }
  }

  .hot-tag {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: #ff4757;
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }
}

// 修改登录按钮容器为header-right
.header-right {
  position: absolute;
  top: 1rem;
  right: 2rem;
  z-index: 10;
}

// 保持现有登录按钮样式...

// 添加用户信息相关样式
.user-profile {
  position: relative;
  cursor: pointer;

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #fff;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
    min-width: 150px;

    .dropdown-item {
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
      transition: background-color 0.2s;

      i {
        font-size: 1.1rem;
      }

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
