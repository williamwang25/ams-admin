import cloudbase from "@cloudbase/js-sdk";

/**
 * CloudBase 环境与实例（管理端单例）。
 *
 * - 读操作：通过 `app.database()` 直连（详见 docs/02-architecture.md 2.2）。
 * - 写操作：通过 `app.callFunction()` 调云函数。
 * - 鉴权：管理端使用云函数 `auth.adminLogin` 自管 token；不使用 CloudBase 内置匿名/邮箱登录。
 *   `accessKey`（Publishable Key）仅用于让 SDK 可以发起匿名读，不代表用户已登录。
 */

export const ENV_ID = import.meta.env.VITE_ENV_ID || "your-env-id";

export const isValidEnvId = Boolean(ENV_ID) && ENV_ID !== "your-env-id";

const PUBLISHABLE_KEY = import.meta.env.VITE_PUBLISHABLE_KEY || "";

export const init = (config: { env?: string; timeout?: number; accessKey?: string } = {}) => {
  const appConfig = {
    env: config.env || ENV_ID,
    timeout: config.timeout || 15000,
    accessKey: config.accessKey || PUBLISHABLE_KEY,
    auth: { detectSessionInUrl: true },
  };

  if (!appConfig.accessKey) {
    console.warn("[cloudbase] 客户端 Publishable Key 未配置，SDK 直连读会被拒绝");
  }

  return cloudbase.init(appConfig);
};

export const app = init();

export const auth = app.auth;

/**
 * 获取数据库实例（用于 SDK 直连白名单中的只读集合）。
 * 详见 docs/04-api-spec.md 4.4。
 */
export const db = () => app.database();

export const checkEnvironment = () => {
  if (!isValidEnvId) {
    console.error(
      "[cloudbase] 云开发环境 ID 未配置：请创建 .env.local 并设置 VITE_ENV_ID 与 VITE_PUBLISHABLE_KEY，然后重启 dev server。"
    );
    return false;
  }
  return true;
};

export default { init, app, auth, db, checkEnvironment, isValidEnvId };
