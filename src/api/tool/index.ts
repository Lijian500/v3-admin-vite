import { request } from '@/utils/service'

// 获取工具列表
export function getToolListApi(params: any) {
  return request({
    url: '/instrument/page',
    method: 'get',
    params
  })
}

// 获取工具详情
export function getToolDetailApi(id: string | number) {
  return request({
    url: `/instrument/info/${id}`,
    method: 'get'
  })
}

// 创建工具
export function createToolApi(data: any) {
  return request({
    url: '/instrument/add',
    method: 'post',
    data
  })
}

// 更新工具
export function updateToolApi(data: any) {
  return request({
    url: '/instrument/mod',
    method: 'put',
    data
  })
}

// 删除工具
export function deleteToolApi(id: string | number) {
  return request({
    url: `/instrument/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除
export function deleteBatchApi(data: any) {
  return request({
    url: '/tool/batch',
    method: 'delete',
    data
  })
}

// 点赞
export function likeToolApi(id: string | number) {
  return request({
    url: `/instrument/like/${id}`,
    method: 'post'
  })
}
