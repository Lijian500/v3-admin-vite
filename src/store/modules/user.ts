import {ref, reactive} from "vue"
import store from "@/store"
import {defineStore} from "pinia"
import {useTagsViewStore} from "./tags-view"
import {useSettingsStore} from "./settings"
import {getToken, removeToken, setToken} from "@/utils/cache/cookies"
import {resetRouter} from "@/router"
import {loginApi, getUserInfoApi} from "@/api/login"
import {ILoginUser, type LoginRequestData} from "@/api/login/types/login"
import routeSettings from "@/config/route"

export const useUserStore = defineStore("user", () => {
    const token = ref<string>(getToken() || "")
    const roles = ref<string[]>([])
    const username = ref<string>("")
    const realName = ref<string>("")
    const id = ref<number>(0)
    const userId = ref<string>("")
    const loginUserInfo = ref<ILoginUser>()
    const tagsViewStore = useTagsViewStore()
    const settingsStore = useSettingsStore()

    /** 登录 */
    const login = async ({account, pwd, code}: LoginRequestData) => {
      const {data} = await loginApi({account, pwd, code})
      setToken(data.token)
      token.value = data.token
      id.value = data.id
      userId.value = data.userId
      loginUserInfo.value = data
      // roles.value = ["admin"]
      // data.identity 不为空 则创建一个数组 并赋值给 roles
      // roles.value = data.identity? Array.of(data.identity) : routeSettings.defaultRoles
      // roles.value = data.identity ? [String(data.identity)] : routeSettings.defaultRoles;
      // 暂时直接默认角色
      // roles.value = routeSettings.defaultRoles;
    }
    /** 获取用户详情 */
    const getInfo = async () => {
      const {data} = await getUserInfoApi(id.value)
      username.value = data.account
      realName.value = data.realName
      // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
      roles.value = data.roles?.length > 0 ? data.roles : routeSettings.defaultRoles

    }
    /** 模拟角色变化 */
    const changeRoles = async (role: string) => {
      const newToken = "token-" + role
      token.value = newToken
      setToken(newToken)
      // 用刷新页面代替重新登录
      window.location.reload()
    }
    /** 登出 */
    const logout = () => {
      removeToken()
      token.value = ""
      roles.value = []
      resetRouter()
      _resetTagsView()
    }
    /** 重置 Token */
    const resetToken = () => {
      removeToken()
      token.value = ""
      roles.value = []
    }
    /** 重置 Visited Views 和 Cached Views */
    const _resetTagsView = () => {
      if (!settingsStore.cacheTagsView) {
        tagsViewStore.delAllVisitedViews()
        tagsViewStore.delAllCachedViews()
      }
    }

    return {token, roles, username, realName, id, userId, loginUserInfo, login, getInfo, changeRoles, logout, resetToken}
  }
  ,
  {
    persist: {
      key: 'user-store',
      storage: localStorage,
      paths: ['token', 'roles', 'username', 'id', 'userId', 'loginUserInfo']
    },
  }
  )

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
