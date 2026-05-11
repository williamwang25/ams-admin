import { callFunction } from "@/utils/http";
import type { AdminProfile } from "@/utils/token";

/**
 * 管理端鉴权 API（云函数 `auth`）。
 * 详见 docs/04-api-spec.md 4.2.1。
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

export const getProfile = () =>
  callFunction<AdminProfile>({ name: "auth", action: "getProfile" });

export const changePassword = (input: { old: string; new: string }) =>
  callFunction<{ ok: true }>({ name: "auth", action: "changePassword", data: input });
