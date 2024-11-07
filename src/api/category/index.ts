import { request } from "@/utils/service"
import type * as Category from "./types/category"
import {CategoryStateUpdate} from "./types/category";

/** 增 */
export function createCategoryApi(data: Category.CreateCategoryRequest) {
  return request({
    url: "/category/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteCategoryApi(id: number) {
  return request({
    url: `category/delete/${id}`,
    method: "delete"
  })
}

/** 批量删 */
export function deleteBatchApi(data: Category.CreateCategoryRequest) {
  return request({
    url: `category/delete/batch`,
    method: "delete",
    data
  })
}

/** 改 */
export function updateCategoryApi(data: Category.CreateCategoryRequest) {
  return request({
    url: "/category/update",
    method: "put",
    data
  })
}

/** 列表 */
export function getCategoryListApi(params: Category.TableRequestData) {
  return request<Category.TableResponseData>({
    url: "/category/page",
    method: "get",
    params
  })
}

/** 详情 */
export function getUserOneApi(id: number) {
  return request<Category.TableResponseData>({
    url: "/category/info/" + id,
    method: "get"
  })
}

/** 启用禁用 */
export function updateCategoryStateApi(data: Category.CategoryStateUpdate) {
  return request({
    url: "/category/update/state",
    method: "put",
    data
  })
}

/** 重置密码 */
export function resetPasswordApi(id: number) {
  return request({
    url: "/category/reset/pwd/" + id,
    method: "post"
  })
}

/** 分类树 */
export function getCategoryTreeApi() {
  return request({
    url: "/category/tree",
    method: "get"
  })
}
