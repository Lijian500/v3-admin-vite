export interface CreateOrUpdateTableRequestData {
  id?: string
  account: string
  identity: number
  realName: string
  pwd: string
}

export interface TableRequestData {
  /** 当前页码 */
  pageNo: number
  /** 查询条数 */
  pageSize: number
  /** 查询参数：用户名 */
  account?: string
  /** 查询参数：手机号 */
  realName?: string
}

export interface TableData {
  id: number
  pwd: string
  createTime: string
  updateTime: string
  userId: string
  realName: string
  identity: number
  userState: boolean
  account: string
}

export type TableResponseData = ApiResponseData<{
  list: TableData[]
  total: number
}>
