export interface LoginRequestData {
  /** admin 或 editor */
  account: "admin" | "editor" | "lijian" | ""
  /** 密码 */
  pwd: string
  /** 验证码 */
  code?: string
}

export type LoginCodeResponseData = ApiResponseData<string>

export type LoginResponseData = ApiResponseData<{ token: string }>

export type UserInfoResponseData = ApiResponseData<{ id: number, userId: string, account: string; roles: string[] }>
