import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 获取登录验证码 */
export function getLoginCodeApi() {
  return request<Login.LoginCodeResponseData>({
    url: "/api/login/code",
    method: "get"
  })
}

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/api/login",
    method: "post",
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi(id:number) {
  return request<Login.UserInfoResponseData>({
    url: "/user/info/" + id,
    method: "get"
  })
}
