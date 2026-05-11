/**
 * 借用模块 API（云函数 `borrow`）。
 * 契约：docs/04-api-spec.md 4.2.3。
 * 实现：cloudfunctions/borrow/actions/*.js（9 个 action）。
 *
 * 管理端使用：approve / reject / return / cancel 不暴露 / adminList / detail / summary
 * （submit / cancel / listMine 是教师专属，由 app/ 工作区调用，不在此封装。）
 */

import { callFunction } from "@/utils/http";
import type {
  AdminListInput,
  AdminListResult,
  ApproveResult,
  BorrowRequest,
  BorrowSummary,
  RejectResult,
  ReturnResult,
} from "@/modules/borrow/types";

export const adminListBorrows = (input: AdminListInput = {}) =>
  callFunction<AdminListResult>({ name: "borrow", action: "adminList", data: input });

export const getBorrowDetail = (borrow_id: string) =>
  callFunction<BorrowRequest>({ name: "borrow", action: "detail", data: { borrow_id } });

export const approveBorrow = (borrow_id: string) =>
  callFunction<ApproveResult>({ name: "borrow", action: "approve", data: { borrow_id } });

export const rejectBorrow = (borrow_id: string, reject_reason: string) =>
  callFunction<RejectResult>({
    name: "borrow",
    action: "reject",
    data: { borrow_id, reject_reason },
  });

/** 管理员代教师归还（双身份接口，admin 视角） */
export const returnBorrow = (borrow_id: string) =>
  callFunction<ReturnResult>({ name: "borrow", action: "return", data: { borrow_id } });

export const getBorrowSummary = () =>
  callFunction<BorrowSummary>({ name: "borrow", action: "summary" });
