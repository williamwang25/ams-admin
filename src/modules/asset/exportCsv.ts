/**
 * 资产列表 CSV 导出：按当前筛选条件分页拉全量，纯前端生成文件。
 */

import dayjs from "dayjs";
import { listAssets } from "@/modules/asset/api";
import type { Asset, AssetListFilter, AssetListSort } from "@/modules/asset/types";
import { buildCsv, downloadCsv } from "@/utils/csv";
import { formatDateTime } from "@/utils/format";
import { ASSET_STATUS_LABEL } from "@/utils/status";

const EXPORT_PAGE_SIZE = 200;

const CSV_HEADERS = [
  "资产编号",
  "名称",
  "品牌",
  "规格型号",
  "部门代码",
  "使用部门",
  "使用人",
  "存放地点",
  "业务状态",
  "单价(元)",
  "是否大型",
  "国标分类",
  "更新时间",
] as const;

const assetToRow = (asset: Asset): (string | number)[] => [
  asset.asset_no,
  asset.name ?? "",
  asset.brand ?? "",
  asset.spec ?? "",
  asset.dept_code ?? "",
  asset.dept_name ?? "",
  asset.user_name ?? "",
  asset.location_name ?? asset.location_code ?? "",
  ASSET_STATUS_LABEL[asset.business_status] ?? asset.business_status,
  asset.unit_price ?? "",
  asset.is_large ? "是" : "否",
  asset.category_national ?? "",
  asset.updated_at ? formatDateTime(asset.updated_at) : "",
];

export interface ExportAssetsCsvOptions {
  filter?: AssetListFilter;
  sort?: AssetListSort;
}

/** 按筛选条件分页拉取全部资产（受云函数 pageSize 上限 200 约束）。 */
export const fetchAllAssetsForExport = async (
  options: ExportAssetsCsvOptions = {},
): Promise<Asset[]> => {
  const sort = options.sort ?? { field: "created_at", order: "desc" };
  const first = await listAssets({
    page: 1,
    pageSize: EXPORT_PAGE_SIZE,
    filter: options.filter,
    sort,
  });

  const all: Asset[] = [...first.list];
  const totalPages = Math.ceil(first.total / EXPORT_PAGE_SIZE);

  for (let page = 2; page <= totalPages; page += 1) {
    const res = await listAssets({
      page,
      pageSize: EXPORT_PAGE_SIZE,
      filter: options.filter,
      sort,
    });
    all.push(...res.list);
  }

  return all;
};

export const exportAssetsCsv = async (options: ExportAssetsCsvOptions = {}): Promise<number> => {
  const assets = await fetchAllAssetsForExport(options);
  const rows = assets.map(assetToRow);
  const csv = buildCsv([...CSV_HEADERS], rows);
  const filename = `ams-assets-${dayjs().format("YYYY-MM-DD-HHmmss")}.csv`;
  downloadCsv(filename, csv);
  return assets.length;
};
