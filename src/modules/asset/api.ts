/**
 * 资产模块 API（云函数 `asset`）。
 * 契约：`docs/04-api-spec.md` 4.2.2。
 * 实现：`cloudfunctions/asset/`（8 个 action）。
 */

import { callFunction } from "@/utils/http";
import type {
  Asset,
  AssetCreateInput,
  AssetCreateResult,
  AssetListInput,
  AssetListResult,
  AssetSummary,
  AssetTimelineResult,
  AssetUpdateInput,
  AssetUpdateResult,
} from "@/modules/asset/types";
import type { AssetBusinessStatus } from "@/utils/status";

export const createAsset = (input: AssetCreateInput) =>
  callFunction<AssetCreateResult>({ name: "asset", action: "create", data: input });

export const updateAsset = (input: AssetUpdateInput) =>
  callFunction<AssetUpdateResult>({ name: "asset", action: "update", data: input });

export const changeAssetStatus = (input: {
  id: string;
  status: AssetBusinessStatus;
  remark?: string;
}) => callFunction<{ _id: string; before: string; after: string; noop?: boolean }>({
  name: "asset",
  action: "changeStatus",
  data: input,
});

export const changeAssetLocation = (input: {
  id: string;
  location_code?: string;
  location_name?: string;
  remark?: string;
}) => callFunction<{ _id: string; changes: unknown[]; noop?: boolean }>({
  name: "asset",
  action: "changeLocation",
  data: input,
});

export const changeAssetUser = (input: {
  id: string;
  user_name?: string;
  dept_code?: string;
  dept_name?: string;
  remark?: string;
}) => callFunction<{ _id: string; changes: unknown[]; noop?: boolean }>({
  name: "asset",
  action: "changeUser",
  data: input,
});

export const getAssetDetail = (input: { id?: string; asset_no?: string }) =>
  callFunction<Asset>({ name: "asset", action: "getDetail", data: input });

export const getAssetTimeline = (input: { asset_id: string; limit?: number }) =>
  callFunction<AssetTimelineResult>({ name: "asset", action: "getTimeline", data: input });

export const listAssets = (input: AssetListInput = {}) =>
  callFunction<AssetListResult>({ name: "asset", action: "list", data: input });

export const getAssetSummary = () =>
  callFunction<AssetSummary>({ name: "asset", action: "summary" });
