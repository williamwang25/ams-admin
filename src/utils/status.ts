/**
 * 业务状态枚举与展示映射（与 docs/03-data-model.md / 08-ui-guidelines.md 8.8 对齐）。
 */

export type AssetBusinessStatus =
  | "IDLE"
  | "IN_USE"
  | "LENT"
  | "PENDING"
  | "MAINTAIN"
  | "SCRAPPED";

export type BorrowStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "RETURNED";

export const ASSET_STATUS_LABEL: Record<AssetBusinessStatus, string> = {
  IDLE: "闲置",
  IN_USE: "使用中",
  LENT: "出借中",
  PENDING: "审批中",
  MAINTAIN: "维修中",
  SCRAPPED: "已报废",
};

/** 对应 daisyui badge 类（见 8.8 状态标签建议色） */
export const ASSET_STATUS_BADGE: Record<AssetBusinessStatus, string> = {
  IDLE: "badge-ghost",
  IN_USE: "badge-info",
  LENT: "badge-primary",
  PENDING: "badge-warning",
  MAINTAIN: "badge-warning",
  SCRAPPED: "badge-error",
};

export const BORROW_STATUS_LABEL: Record<BorrowStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
  CANCELLED: "已取消",
  RETURNED: "已归还",
};

export const BORROW_STATUS_BADGE: Record<BorrowStatus, string> = {
  PENDING: "badge-warning",
  APPROVED: "badge-primary",
  REJECTED: "badge-error",
  CANCELLED: "badge-ghost",
  RETURNED: "badge-success",
};
