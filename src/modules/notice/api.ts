/**
 * 通知模块 API（云函数 notice）。
 * 契约：docs/04-api-spec.md 4.2.6。
 */

import { callFunction } from "@/utils/http";
import type {
  Notice,
  NoticeCreateInput,
  NoticeListInput,
  NoticeListResult,
  NoticePublishInput,
  NoticeUpdateInput,
} from "@/modules/notice/types";

export const listNotices = (input: NoticeListInput = {}) =>
  callFunction<NoticeListResult>({ name: "notice", action: "list", data: input });

export const getNoticeDetail = (id: string) =>
  callFunction<Notice>({ name: "notice", action: "getDetail", data: { id } });

export const createNotice = (input: NoticeCreateInput) =>
  callFunction<{ _id: string; notice: Notice }>({ name: "notice", action: "create", data: input });

export const updateNotice = (input: NoticeUpdateInput) =>
  callFunction<{ _id: string; notice: Notice }>({ name: "notice", action: "update", data: input });

export const publishNotice = (input: NoticePublishInput) =>
  callFunction<{ _id: string; published: boolean; published_at: number | null }>({
    name: "notice",
    action: "publish",
    data: input,
  });

export const deleteNotice = (id: string) =>
  callFunction<{ _id: string }>({ name: "notice", action: "delete", data: { id } });
