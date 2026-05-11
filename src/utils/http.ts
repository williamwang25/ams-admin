import { app } from "@/utils/cloudbase";
import { getToken } from "@/utils/token";

/**
 * 云函数统一调用封装。
 *
 * 契约：所有云函数入参 `{ action, data }`，返回 `{ code, message, data }`（详见 docs/04-api-spec.md 4.1）。
 * 本封装：
 *   1. 自动注入 `auth.token`（从 localStorage 取，云函数侧通过 `event.auth.token` 校验）。
 *   2. 把非 0 的 `code` 抛成 `CloudFunctionError`，调用方只需 try/catch。
 *   3. 成功时直接返回 `data` 字段（业务负载）。
 */

export class CloudFunctionError extends Error {
  code: number;
  raw: unknown;
  constructor(code: number, message: string, raw?: unknown) {
    super(message);
    this.name = "CloudFunctionError";
    this.code = code;
    this.raw = raw;
  }
}

export interface CloudFunctionResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface CallOptions {
  /** 云函数名，例如 "asset" / "auth" / "borrow" */
  name: string;
  /** action 字段，例如 "create" / "adminLogin" */
  action: string;
  /** 业务参数（任意可序列化对象） */
  data?: object;
}

interface RawCallResult {
  result?: CloudFunctionResponse<unknown>;
  requestID?: string;
}

export async function callFunction<T = unknown>(opts: CallOptions): Promise<T> {
  const token = getToken();
  const payload = {
    action: opts.action,
    data: opts.data ?? {},
    auth: { token: token ?? "" },
  };

  let raw: RawCallResult;
  try {
    raw = (await app.callFunction({
      name: opts.name,
      data: payload,
    })) as RawCallResult;
  } catch (err) {
    const message = err instanceof Error ? err.message : "网络请求失败";
    throw new CloudFunctionError(-1, message, err);
  }

  const result = raw.result;
  if (!result || typeof result.code !== "number") {
    throw new CloudFunctionError(-1, "云函数返回格式异常", raw);
  }

  if (result.code !== 0) {
    throw new CloudFunctionError(result.code, result.message || "云函数执行失败", result);
  }

  return result.data as T;
}
