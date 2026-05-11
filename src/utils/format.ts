import dayjs from "dayjs";

/**
 * 金额格式化：保留两位小数 + 千分位。
 * 入参单位为「元」（number）；详见 docs/02-architecture.md 2.4。
 */
export const formatMoney = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return value.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatDate = (
  value: string | number | Date | null | undefined,
  pattern = "YYYY-MM-DD"
): string => {
  if (!value) return "-";
  const d = dayjs(value);
  if (!d.isValid()) return "-";
  return d.format(pattern);
};

export const formatDateTime = (value: string | number | Date | null | undefined): string =>
  formatDate(value, "YYYY-MM-DD HH:mm");
