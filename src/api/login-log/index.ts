import {request} from "@/utils/service";
import type * as LoginLog from "./types/login-log"

/** 分页列表 */
export function getLoginLogPageApi(params: LoginLog.ILoginLogTableRequestData) {
  return request<LoginLog.TableResponseData>({
    url: "/login/log/page",
    method: "get",
    params
  })
}

/** 详情 */
export function getLogDetailApi(id: number) {
  return request<LoginLog.ILoginLogData>({
    url: "/login/log/info/" + id,
    method: "get"
  })
}
