/**
 * 管理端 token 与登录态本地存取。
 *
 * AMS 管理端使用云函数 `auth.adminLogin` 自管 token：
 *   - 登录成功后将 token 写 localStorage。
 *   - 每次调用云函数时由 src/utils/http.ts 自动带入 Authorization。
 */

const TOKEN_KEY = "ams.admin.token";
const PROFILE_KEY = "ams.admin.profile";

export interface AdminProfile {
  _id: string;
  username: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  dept_id?: string;
  dept_name?: string;
}

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
};

export const getProfile = (): AdminProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminProfile;
  } catch {
    return null;
  }
};

export const setProfile = (profile: AdminProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
};
