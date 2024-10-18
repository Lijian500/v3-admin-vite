export interface LoginRequestData {
  /** admin 或 editor */
  account: "admin" | "editor" | "lijian" | ""
  /** 密码 */
  pwd: string
  /** 验证码 */
  code?: string
}

export interface ILoginUser{
  id: number;
  userId: string;
  account: string;
  realName: string;
  identity: number;
  token: string;
}

export type LoginCodeResponseData = ApiResponseData<string>

// export type LoginResponseData = ApiResponseData<{ token: string, id: number, userId: string }>
export type LoginResponseData = ApiResponseData<ILoginUser>

export type UserInfoResponseData = ApiResponseData<{ id: number, userId: string, account: string; roles: string[]; identity: number; }>
