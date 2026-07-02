<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">
          借用申请
          <span v-if="borrow" class="ml-2 font-mono text-base text-base-content/60">
            {{ borrow.serial_no }}
          </span>
        </h1>
        <p v-if="borrow" class="text-xs text-base-content/50 mt-1">
          创建于 {{ formatDateTime(borrow.created_at) }}
        </p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" :disabled="loading" @click="reload">
          <RefreshCw :size="14" :class="loading ? 'animate-spin' : ''" />
          刷新
        </button>
        <RouterLink to="/borrows" class="btn btn-ghost btn-sm">返回列表</RouterLink>
      </div>
    </header>

    <div v-if="error" class="alert alert-error py-2 text-sm">
      <span>{{ error }}</span>
    </div>

    <div v-if="loading && !borrow" class="rounded-lg border border-base-300 bg-base-100 p-10 text-center shadow-card">
      <span class="loading loading-spinner loading-md" />
    </div>

    <template v-else-if="borrow">
      <!-- 头部信息卡 -->
      <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <dl class="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3 flex-1">
            <div class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">申请人</dt>
              <dd class="flex-1">{{ borrow.teacher_name || "-" }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">联系电话</dt>
              <dd class="flex-1">{{ borrow.teacher_phone || "-" }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">教师工号</dt>
              <dd class="flex-1 break-all">{{ borrow.teacher_id }}</dd>
            </div>
            <div class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">状态</dt>
              <dd class="flex-1"><StatusTag type="borrow" :status="borrow.status" /></dd>
            </div>
            <div v-if="borrow.approved_at" class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">审批时间</dt>
              <dd class="flex-1">{{ formatDateTime(borrow.approved_at) }}</dd>
            </div>
            <div v-if="borrow.approved_by_name" class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">审批人</dt>
              <dd class="flex-1">{{ borrow.approved_by_name }}</dd>
            </div>
            <div v-if="borrow.returned_at" class="flex gap-2">
              <dt class="w-20 shrink-0 text-base-content/50">归还时间</dt>
              <dd class="flex-1">{{ formatDateTime(borrow.returned_at) }}</dd>
            </div>
            <div v-if="borrow.reject_reason" class="flex gap-2 lg:col-span-3">
              <dt class="w-20 shrink-0 text-base-content/50">拒绝原因</dt>
              <dd class="flex-1 text-error">{{ borrow.reject_reason }}</dd>
            </div>
          </dl>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap gap-2">
            <button
              v-if="borrow.status === 'PENDING'"
              class="btn btn-primary btn-sm"
              :disabled="mutating"
              @click="onApprove"
            >
              <CheckCircle2 :size="14" />
              审批通过
            </button>
            <button
              v-if="borrow.status === 'PENDING'"
              class="btn btn-error btn-sm"
              :disabled="mutating"
              @click="openReject"
            >
              <XCircle :size="14" />
              拒绝
            </button>
            <button
              v-if="borrow.status === 'APPROVED'"
              class="btn btn-warning btn-sm"
              :disabled="mutating"
              @click="onReturn"
            >
              <Undo2 :size="14" />
              代教师归还
            </button>
          </div>
        </div>
      </div>

      <!-- 资产明细 -->
      <div class="rounded-lg border border-base-300 bg-base-100 shadow-card">
        <div class="flex items-baseline justify-between p-5 pb-3">
          <h2 class="text-base font-medium text-base-content">资产明细</h2>
          <span class="text-xs text-base-content/50">共 {{ borrow.items.length }} 条</span>
        </div>
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>序号</th>
                <th>资产编号</th>
                <th>名称</th>
                <th>品牌 / 型号</th>
                <th class="text-right">单价</th>
                <th class="text-right">数量</th>
                <th>地点</th>
                <th>用途</th>
                <th>拟归还</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in borrow.items" :key="it.asset_id" class="hover">
                <td>{{ idx + 1 }}</td>
                <td class="font-mono text-xs">{{ it.asset_no || "-" }}</td>
                <td>{{ it.name || "-" }}</td>
                <td>
                  <div class="text-sm">{{ it.brand || "-" }}</div>
                  <div class="text-xs text-base-content/50">{{ it.spec || "" }}</div>
                </td>
                <td class="text-right">¥{{ formatMoney(it.unit_price ?? 0) }}</td>
                <td class="text-right">{{ it.quantity }}</td>
                <td>{{ it.location_name || "-" }}</td>
                <td>{{ it.usage || "-" }}</td>
                <td class="text-xs">{{ formatDate(it.expected_return_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 签名预览 + 凭证 -->
      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
          <h2 class="mb-3 text-base font-medium text-base-content">教师手写签名</h2>
          <div v-if="signatureLoading" class="flex h-40 items-center justify-center">
            <span class="loading loading-spinner loading-sm" />
          </div>
          <div
            v-else-if="signatureUrl"
            class="flex h-40 items-center justify-center rounded border border-dashed border-base-300 bg-base-200"
          >
            <img :src="signatureUrl" alt="signature" class="max-h-full max-w-full object-contain" />
          </div>
          <div v-else class="flex h-40 items-center justify-center text-sm text-base-content/40">
            {{ signatureError || "暂无签名" }}
          </div>
          <div class="mt-2 break-all text-xs text-base-content/40">
            fileID: {{ borrow.signature_file_id || "-" }}
          </div>
        </div>

        <div class="rounded-lg border border-base-300 bg-base-100 p-5 shadow-card">
          <h2 class="mb-3 text-base font-medium text-base-content">借用凭证</h2>
          <div
            v-if="hasVoucher"
            class="space-y-2 text-sm text-base-content/70"
          >
            <p class="text-xs text-base-content/50">凭证 payload（base64 编码，含 borrow_id / serial_no / approved_at）：</p>
            <textarea
              class="textarea textarea-bordered textarea-xs h-20 w-full font-mono"
              readonly
              :value="borrow.voucher_qr_payload"
            />
            <p class="text-xs text-base-content/40">
              教师端可据此渲染二维码；管理员可向教师核验本字段一致性。
            </p>
          </div>
          <div v-else class="flex h-40 items-center justify-center text-sm text-base-content/40">
            待审批通过后生成
          </div>
        </div>
      </div>
    </template>

    <!-- 拒绝弹窗 -->
    <div v-if="rejectOpen" class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-medium">拒绝借用申请</h3>
        <p class="mt-1 text-xs text-base-content/50">流水号 {{ borrow?.serial_no }}</p>
        <textarea
          v-model.trim="rejectReason"
          class="textarea textarea-bordered mt-4 w-full"
          rows="4"
          placeholder="请填写拒绝原因（≤ 200 字）"
          maxlength="200"
        />
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" :disabled="mutating" @click="rejectOpen = false">
            取消
          </button>
          <button
            class="btn btn-error btn-sm"
            :disabled="mutating || !rejectReason"
            @click="onReject"
          >
            <span v-if="mutating" class="loading loading-spinner loading-xs" />
            确认拒绝
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="rejectOpen = false" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { RefreshCw, CheckCircle2, XCircle, Undo2 } from "lucide-vue-next";
import StatusTag from "@/components/StatusTag.vue";
import {
  approveBorrow,
  getBorrowDetail,
  rejectBorrow,
  returnBorrow,
} from "@/modules/borrow/api";
import type { BorrowRequest } from "@/modules/borrow/types";
import { resolveAssetImageTempUrls } from "@/modules/asset/storage";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";

const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));

const borrow = ref<BorrowRequest | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const mutating = ref(false);
const rejectOpen = ref(false);
const rejectReason = ref("");

const signatureUrl = ref<string | null>(null);
const signatureLoading = ref(false);
const signatureError = ref<string | null>(null);

/** 审批通过或已归还后凭证 payload 仍保留，需继续展示 */
const hasVoucher = computed(() => {
  const b = borrow.value;
  if (!b?.voucher_qr_payload?.trim()) return false;
  return b.status === "APPROVED" || b.status === "RETURNED";
});

const reload = async () => {
  if (!id.value) return;
  loading.value = true;
  error.value = null;
  try {
    borrow.value = await getBorrowDetail(id.value);
    void resolveSignature(borrow.value.signature_file_id);
  } catch (err) {
    if (err instanceof CloudFunctionError) error.value = err.message;
    else if (err instanceof Error) error.value = err.message;
    else error.value = "加载失败";
    borrow.value = null;
  } finally {
    loading.value = false;
  }
};

const resolveSignature = async (fileID: string) => {
  signatureUrl.value = null;
  signatureError.value = null;
  if (!fileID) {
    signatureError.value = "暂无签名";
    return;
  }
  signatureLoading.value = true;
  try {
    const urlMap = await resolveAssetImageTempUrls([fileID]);
    const url = urlMap.get(fileID);
    if (url) {
      signatureUrl.value = url;
    } else {
      signatureError.value = "签名链接获取失败";
    }
  } catch (err) {
    signatureError.value =
      err instanceof CloudFunctionError
        ? err.message
        : err instanceof Error
          ? err.message
          : "签名加载失败";
  } finally {
    signatureLoading.value = false;
  }
};

const onApprove = async () => {
  if (!borrow.value || mutating.value) return;
  if (!confirm(`确定通过借用申请 ${borrow.value.serial_no}？通过后涉及资产将变为「出借中」。`)) return;
  mutating.value = true;
  try {
    await approveBorrow(borrow.value._id);
    await reload();
  } catch (err) {
    error.value = err instanceof CloudFunctionError ? err.message : "审批失败";
  } finally {
    mutating.value = false;
  }
};

const openReject = () => {
  rejectReason.value = "";
  rejectOpen.value = true;
};

const onReject = async () => {
  if (!borrow.value || mutating.value || !rejectReason.value) return;
  mutating.value = true;
  try {
    await rejectBorrow(borrow.value._id, rejectReason.value);
    rejectOpen.value = false;
    await reload();
  } catch (err) {
    error.value = err instanceof CloudFunctionError ? err.message : "操作失败";
  } finally {
    mutating.value = false;
  }
};

const onReturn = async () => {
  if (!borrow.value || mutating.value) return;
  if (!confirm(`确定代教师归还 ${borrow.value.serial_no}？资产将恢复为「闲置」。`)) return;
  mutating.value = true;
  try {
    await returnBorrow(borrow.value._id);
    await reload();
  } catch (err) {
    error.value = err instanceof CloudFunctionError ? err.message : "归还失败";
  } finally {
    mutating.value = false;
  }
};

watch(id, reload);
onMounted(reload);
</script>
