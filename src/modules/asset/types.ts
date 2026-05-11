/**
 * 资产模块前端类型定义。
 *
 * 字段事实唯一源：`docs/03-data-model.md` 3.4.2 / 3.5。
 * 与 `cloudfunctions/asset/utils/validate.js` 字段白名单保持同步。
 */

import type { AssetBusinessStatus } from "@/utils/status";

/**
 * 资产主表（`ams_asset`）。
 * 所有字段都是可选（除 `_id` 与 `asset_no`），因为部分历史数据可能字段缺失。
 */
export interface Asset {
  _id: string;
  asset_no: string;

  // 基础
  voucher_no?: string;
  name?: string;
  brand?: string;
  spec?: string;
  category_national?: string;
  category_industry?: string;

  // 数量
  unit_price?: number;
  quantity?: number;
  unit?: string;

  // 财务
  book_date?: string;
  original_value?: number;
  accumulated_depreciation?: number;
  net_value?: number;
  depreciation_years?: number;
  depreciated_months?: number;

  // 归属
  dept_code?: string;
  dept_name?: string;
  user_name?: string;
  location_code?: string;
  location_name?: string;

  // 取得
  purchase_mode?: string;
  acquire_date?: string;
  book_in_date?: string;
  supplier?: string;
  manufacturer?: string;
  invoice_no?: string;
  contract_no?: string;

  // 业务
  usage?: string;
  edu_direction?: string;
  vehicle_no?: string;
  project_name?: string;
  claim_status?: string;
  status_raw?: string;
  business_status: AssetBusinessStatus;
  remark?: string;

  // 媒体
  image_urls?: string[];

  // 元数据
  current_borrow_id?: string | null;
  is_large?: boolean;
  created_at?: number;
  updated_at?: number;
  created_by?: string;
  updated_by?: string;
}

/** 资产变动日志（`ams_asset_log`） */
export interface AssetLog {
  _id: string;
  asset_id: string;
  asset_no?: string;
  op_type:
    | "CREATE"
    | "UPDATE"
    | "BORROW"
    | "RETURN"
    | "STATUS_CHANGE"
    | "LOCATION_CHANGE"
    | "USER_CHANGE"
    | "SCRAP";
  changes: Array<{ field: string; before: unknown; after: unknown }>;
  operator_id: string;
  operator_role: "admin" | "teacher" | "system";
  operator_name?: string;
  related_id?: string | null;
  remark?: string;
  created_at: number;
}

/** 资产列表筛选条件 */
export interface AssetListFilter {
  business_status?: AssetBusinessStatus | AssetBusinessStatus[];
  dept_code?: string;
  is_large?: boolean;
  category_national?: string;
  location_code?: string;
  keyword?: string;
}

export interface AssetListSort {
  field?: "created_at" | "updated_at" | "unit_price" | "asset_no" | "name";
  order?: "asc" | "desc";
}

export interface AssetListInput {
  page?: number;
  pageSize?: number;
  filter?: AssetListFilter;
  sort?: AssetListSort;
}

export interface AssetListResult {
  total: number;
  page: number;
  pageSize: number;
  list: Asset[];
}

/** 入库表单（与 `cloudfunctions/asset/utils/validate.js` ASSET_EDITABLE_FIELDS 对齐） */
export type AssetCreateInput = Partial<Omit<Asset, "_id" | "asset_no" | "business_status" | "current_borrow_id" | "is_large" | "created_at" | "updated_at" | "created_by" | "updated_by">> & {
  name: string;
  unit_price: number;
  /** 可选前缀，默认 'YQJJ' */
  prefix?: string;
};

export type AssetUpdateInput = Partial<AssetCreateInput> & { id: string };

export interface AssetChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AssetCreateResult {
  _id: string;
  asset_no: string;
  is_large: boolean;
  asset: Asset;
}

export interface AssetUpdateResult {
  _id: string;
  changes: AssetChange[];
  asset: Asset;
}

export interface AssetTimelineResult {
  list: AssetLog[];
  total: number;
}

export type AssetStatusBucket = Record<AssetBusinessStatus, { count: number; value: number }>;

export interface AssetDeptBucket {
  dept_name: string;
  count: number;
  value: number;
}

export interface AssetSummary {
  total: number;
  total_value: number;
  large_count: number;
  large_value: number;
  by_status: AssetStatusBucket;
  by_dept: AssetDeptBucket[];
}
