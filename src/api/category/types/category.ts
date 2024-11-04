
export interface CreateCategoryRequest {
  /** 分类id */
  categoryId: string;
  /** 分类名称 */
  categoryName: string;
  /** 分类图标 */
  icon: string;
  /** 父id */
  parentId?: string;
  /** 上级分类名称 */
  parentName?: string;
  /** 排序 */
  sort: number;
  /** 分类的状态 1 草稿 2启用 3停用 4无效 */
  state: number;
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

export interface TableData {
  categoryId: string
  categoryName: string
  createTime: string
  createUser: string
  createUserId: string
  icon: string
  id: number
  isDelete: number
  parentId: string
  parentName: string
  sort: number
  state: number
  updateTime: string
  updateUser: string
  updateUserId: string
}



export type TableResponseData = ApiResponseData<{
  list: TableData[]
  total: number
}>
