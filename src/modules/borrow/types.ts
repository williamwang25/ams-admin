/**
 * 借用模块 TypeScript 类型，与 docs/03-data-model.md 3.6 / 3.6.1
 * 与 docs/04-api-spec.md 4.2.3 严格对齐。
 *
 * 后端字段事实唯一源：cloudfunctions/borrow/actions/*.js
 * 前端只通过 callFunction 间接接触，本模块仅描述形状。
 */

import type { BorrowStatus } from "@/utils/status";

/** 借用申请单条资产明细（含资产快照 + 教师填字段） */
export interface BorrowItem {
  asset_id: string;
  asset_no: string;
  name: string;
  brand: string;
  spec: string;
  unit_price: number | null;
  location_name: string;
  /** 借用数量，提交时默认 1 */
  quantity: number;
  /** 'YYYY-MM-DD'，每条独立 */
  expected_return_date: string;
  /** 借用用途，每条独立（科研 / 教学 / 实验 / ...） */
  usage: string;
}

/** 借用申请完整结构（detail / adminList 完整字段） */
export interface BorrowRequest {
  _id: string;
  serial_no: string;
  teacher_id: string;
  teacher_name: string;
  teacher_phone: string;
  items: BorrowItem[];
  signature_file_id: string;
  status: BorrowStatus;
  reject_reason: string;
  approved_by: string;
  approved_by_name: string;
  approved_at: number | null;
  returned_at: number | null;
  voucher_qr_payload: string;
  created_at: number;
  updated_at: number;
}

/** listMine 返回的精简版（不含签名 / 凭证 / 教师冗余字段） */
export type BorrowListMineItem = Pick<
  BorrowRequest,
  | "_id"
  | "serial_no"
  | "status"
  | "items"
  | "reject_reason"
  | "approved_at"
  | "returned_at"
  | "created_at"
  | "updated_at"
>;

/** adminList 返回（管理端列表用） */
export type BorrowAdminListItem = Pick<
  BorrowRequest,
  | "_id"
  | "serial_no"
  | "status"
  | "items"
  | "reject_reason"
  | "teacher_id"
  | "teacher_name"
  | "teacher_phone"
  | "approved_by"
  | "approved_by_name"
  | "approved_at"
  | "returned_at"
  | "created_at"
  | "updated_at"
>;

// ---------------- 入参 / 出参 ----------------

export interface AdminListInput {
  status?: BorrowStatus;
  keyword?: string;
  /** 'YYYY-MM-DD'，按 created_at 过滤 */
  date_from?: string;
  date_to?: string;
  page?: number;
  /** 默认 20，上限 200 */
  pageSize?: number;
}

export interface AdminListResult {
  total: number;
  list: BorrowAdminListItem[];
}

export interface ApproveResult {
  _id: string;
  status: "APPROVED";
  voucher_qr_payload: string;
}

export interface RejectResult {
  _id: string;
  status: "REJECTED";
}

export interface ReturnResult {
  _id: string;
  status: "RETURNED";
  returned_at: number;
}

/** Dashboard 看板聚合：与 cloudfunctions/borrow/actions/summary.js 对齐 */
export interface BorrowSummary {
  pending_count: number;
  lent_count: number;
  today_borrow: number;
  today_return: number;
  trend_7d: Array<{
    /** 'YYYY-MM-DD' */
    date: string;
    borrow: number;
    return: number;
  }>;
}
