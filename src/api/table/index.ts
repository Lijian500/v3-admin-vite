import { request } from "@/utils/service"
import type * as Table from "./types/table"

/** 增 */
export function createTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/user/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteTableDataApi(id: number) {
  return request({
    url: `user/delete/${id}`,
    method: "delete"
  })
}

/** 批量删 */
export function deleteBatch(data: Table.UserDeleteBatchRequestData) {
  return request({
    url: `user/delete/batch`,
    method: "delete",
    data
  })
}

/** 改 */
export function updateTableDataApi(data: Table.CreateOrUpdateTableRequestData) {
  return request({
    url: "/user/update",
    method: "put",
    data
  })
}

/** 列表 */
export function getTableDataApi(params: Table.TableRequestData) {
  return request<Table.TableResponseData>({
    url: "/user/page",
    method: "get",
    params
  })
}

/** 详情 */
export function getUserOneApi(id: number) {
  return request<Table.TableResponseData>({
    url: "/user/info/" + id,
    method: "get"
  })
}

/** 启用禁用 */
export function updateUserStateApi(data: Table.UpdateUserStateRequestData) {
    return request({
      url: "/user/update/state",
      method: "put",
      data
    })
}

/** 重置密码 */
export function resetPasswordApi(id: number) {
  return request({
    url: "/user/reset/pwd/" + id,
    method: "post"
  })
}


