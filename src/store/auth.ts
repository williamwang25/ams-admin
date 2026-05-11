import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getToken,
  setToken,
  clearToken,
  getProfile,
  setProfile,
  type AdminProfile,
} from "@/utils/token";

/**
 * 管理员登录态全局 store。
 *
 * - 仅持有内存中的 token + profile，源数据保留在 localStorage（详见 utils/token.ts）。
 * - 登录 / 登出由 modules/auth/api.ts 调用。
 */
export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(getToken());
  const profile = ref<AdminProfile | null>(getProfile());

  const isLoggedIn = computed(() => Boolean(token.value));
  const isSuperAdmin = computed(() => profile.value?.role === "SUPER_ADMIN");

  const setSession = (next: { token: string; profile: AdminProfile }) => {
    token.value = next.token;
    profile.value = next.profile;
    setToken(next.token);
    setProfile(next.profile);
  };

  const clearSession = () => {
    token.value = null;
    profile.value = null;
    clearToken();
  };

  return {
    token,
    profile,
    isLoggedIn,
    isSuperAdmin,
    setSession,
    clearSession,
  };
});
