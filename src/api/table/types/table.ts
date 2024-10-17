export interface CreateOrUpdateTableRequestData {
  id?: string
  account: string
  identity: number
  realName: string
  pwd: string
  userState?: number
}

export interface TableRequestData {
  /** 当前页码 */
  pageNo: number
  /** 查询条数 */
  pageSize: number
  /** 查询参数：用户名 */
  account?: string
  /** 查询参数：姓名 */
  realName?: string
  createStartTime?: string
  createEndTime?: string
  userState?: number
}

export interface UserDeleteBatchRequestData {
  ids: string
}


export interface UpdateUserStateRequestData {
  userId: string
}

export interface TableData {
  id: number
  pwd: string
  createTime: string
  updateTime: string
  userId: string
  realName: string
  identity: number
  userState: number
  account: string
}

export type TableResponseData = ApiResponseData<{
  list: TableData[]
  total: number
}>
