import {TableData} from "@/api/table/types/table";

export interface ILoginLogData {
  id: number;
  userId: number;
  userName: string;
  ip: string;
  address: string;
  browser: string;
  os: string;
  loginTime: string;
  loginResult: number;
  loginMsg: string;
}


export interface ILoginLogTableRequestData {
  /** 当前页码 */
  pageNo: number
  /** 查询条数 */
  pageSize: number
  /** 查询参数：用户名 */
  account?: string
  /** 查询参数：姓名 */
  realName?: string
  loginStartTime?: string
  loginEndTime?: string
  loginState?: number
  userId?: string
}


export type TableResponseData = ApiResponseData<{
  list: ILoginLogData[]
  total: number
}>
