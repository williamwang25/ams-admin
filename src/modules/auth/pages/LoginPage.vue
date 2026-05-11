<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-base-200 to-base-100 px-4">
    <div class="w-full max-w-md rounded-xl bg-base-100 p-8 shadow-card border border-base-300">
      <div class="mb-6 flex flex-col items-center text-center">
        <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-content">
          <Boxes :size="24" />
        </div>
        <h1 class="text-xl font-semibold text-base-content">AMS 资产管理系统</h1>
        <p class="mt-1 text-sm text-base-content/60">管理员登录</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <label class="form-control w-full">
          <div class="label py-1">
            <span class="label-text text-sm">用户名</span>
          </div>
          <input
            v-model="form.username"
            type="text"
            class="input input-bordered w-full"
            placeholder="请输入用户名"
            autocomplete="username"
            required
          />
        </label>

        <label class="form-control w-full">
          <div class="label py-1">
            <span class="label-text text-sm">密码</span>
          </div>
          <input
            v-model="form.password"
            type="password"
            class="input input-bordered w-full"
            placeholder="请输入密码"
            autocomplete="current-password"
            required
          />
        </label>

        <label class="flex cursor-pointer items-center gap-2 text-sm text-base-content/70">
          <input v-model="form.remember" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
          记住我
        </label>

        <div v-if="error" class="alert alert-error py-2 text-sm">
          <span>{{ error }}</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm"></span>
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>

      <p class="mt-6 text-center text-xs text-base-content/50">
        如忘记密码，请联系超级管理员重置
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Boxes } from "lucide-vue-next";
import { adminLogin } from "@/modules/auth/api";
import { useAuthStore } from "@/store/auth";
import { CloudFunctionError } from "@/utils/http";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const form = reactive({ username: "", password: "", remember: true });
const loading = ref(false);
const error = ref<string | null>(null);

const onSubmit = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;
  try {
    const result = await adminLogin({ username: form.username, password: form.password });
    auth.setSession(result);
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await router.replace(redirect);
  } catch (err) {
    if (err instanceof CloudFunctionError) {
      error.value = err.message;
    } else if (err instanceof Error) {
      error.value = err.message;
    } else {
      error.value = "登录失败，请稍后重试";
    }
  } finally {
    loading.value = false;
  }
};
</script>
