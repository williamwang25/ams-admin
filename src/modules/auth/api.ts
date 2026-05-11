import { callFunction } from "@/utils/http";
import type { AdminProfile } from "@/utils/token";

/**
 * 管理端鉴权 API（云函数 `auth`）。
 *
 * 当前精简实现：固定账号 + 固定 token，云函数只暴露 `adminLogin` 一个 action。
 * 接入多管理员 / 教师端时再补 `getProfile` / `changePassword` 等接口。
 */

export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface AdminLoginResult {
  token: string;
  profile: AdminProfile;
}

export const adminLogin = (input: AdminLoginInput) =>
  callFunction<AdminLoginResult>({ name: "auth", action: "adminLogin", data: input });
