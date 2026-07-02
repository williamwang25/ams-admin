/**
 * 通知模块类型，对齐 docs/03-data-model.md 3.7。
 */

export type NoticeLevel = "INFO" | "IMPORTANT";

export interface Notice {
  _id: string;
  title: string;
  content: string;
  level: NoticeLevel;
  published: boolean;
  published_at: number | null;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface NoticeListInput {
  published_only?: boolean;
  published?: boolean;
  level?: NoticeLevel;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface NoticeListResult {
  total: number;
  list: Notice[];
}

export interface NoticeCreateInput {
  title: string;
  content: string;
  level?: NoticeLevel;
}

export interface NoticeUpdateInput {
  id: string;
  title: string;
  content: string;
  level?: NoticeLevel;
}

export interface NoticePublishInput {
  id: string;
  published: boolean;
}
