<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">通知公告</h1>
        <p class="mt-1 text-xs text-base-content/50">共 {{ total }} 条</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" @click="openCreate">
        <Plus :size="16" />
        新建通知
      </button>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
      <form class="grid gap-3 md:grid-cols-4" @submit.prevent="applyFilter">
        <input
          v-model.trim="form.keyword"
          class="input input-bordered input-sm"
          placeholder="标题关键字"
        />
        <select v-model="form.level" class="select select-bordered select-sm">
          <option value="">级别（全部）</option>
          <option value="INFO">普通</option>
          <option value="IMPORTANT">重要</option>
        </select>
        <select v-model="form.published" class="select select-bordered select-sm">
          <option value="">发布状态（全部）</option>
          <option value="true">已发布</option>
          <option value="false">未发布</option>
        </select>
        <div class="flex gap-2">
          <button type="submit" class="btn btn-primary btn-sm flex-1">筛选</button>
          <button type="button" class="btn btn-ghost btn-sm" @click="resetFilter">重置</button>
        </div>
      </form>
    </div>

    <div v-if="pageError" class="alert alert-error py-2 text-sm">
      <span>{{ pageError }}</span>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 shadow-card overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>标题</th>
            <th>级别</th>
            <th>发布状态</th>
            <th>更新时间</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="py-10 text-center text-sm text-base-content/40">
              <span class="loading loading-spinner loading-sm" /> 加载中
            </td>
          </tr>
          <tr v-else-if="notices.length === 0">
            <td colspan="5" class="py-10 text-center text-sm text-base-content/40">暂无通知</td>
          </tr>
          <tr v-for="row in notices" :key="row._id" class="hover">
            <td>
              <button
                type="button"
                class="link link-hover text-left text-sm"
                @click="openPreview(row)"
              >
                {{ row.title }}
              </button>
            </td>
            <td>
              <span
                class="badge badge-sm"
                :class="row.level === 'IMPORTANT' ? 'badge-warning' : 'badge-ghost'"
              >
                {{ row.level === "IMPORTANT" ? "重要" : "普通" }}
              </span>
            </td>
            <td>
              <span class="badge badge-sm" :class="row.published ? 'badge-success' : 'badge-ghost'">
                {{ row.published ? "已发布" : "草稿" }}
              </span>
            </td>
            <td class="text-xs">{{ formatDateTime(row.updated_at) }}</td>
            <td>
              <div class="flex justify-end gap-1">
                <button type="button" class="btn btn-ghost btn-xs" @click="openEdit(row)">
                  <Pencil :size="14" />
                  编辑
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  :disabled="Boolean(actionBusy)"
                  @click="togglePublish(row)"
                >
                  {{ row.published ? "下架" : "发布" }}
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error"
                  :disabled="Boolean(actionBusy)"
                  @click="confirmDelete(row)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <span class="text-xs text-base-content/50">第 {{ page }} / {{ totalPages }} 页</span>
      <div class="join">
        <button class="btn btn-sm join-item" :disabled="page <= 1" @click="goPage(page - 1)">
          上一页
        </button>
        <button class="btn btn-sm join-item" :disabled="page >= totalPages" @click="goPage(page + 1)">
          下一页
        </button>
      </div>
    </div>

    <!-- 新建 / 编辑 -->
    <dialog v-if="editorOpen" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="text-base font-semibold">{{ editingId ? "编辑通知" : "新建通知" }}</h3>
        <form class="mt-4 space-y-3" @submit.prevent="submitEditor">
          <label class="form-control">
            <span class="label-text text-xs">标题</span>
            <input v-model.trim="editor.title" required class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">级别</span>
            <select v-model="editor.level" class="select select-bordered select-sm">
              <option value="INFO">普通</option>
              <option value="IMPORTANT">重要</option>
            </select>
          </label>
          <label class="form-control">
            <span class="label-text text-xs">内容（Markdown）</span>
            <textarea
              v-model.trim="editor.content"
              required
              class="textarea textarea-bordered textarea-sm font-mono"
              rows="10"
              placeholder="支持 Markdown 纯文本"
            />
          </label>
          <div v-if="editorError" class="alert alert-error py-2 text-xs">
            <span>{{ editorError }}</span>
          </div>
          <div class="modal-action">
            <button type="button" class="btn btn-ghost btn-sm" @click="closeEditor">取消</button>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="editorSaving">
              {{ editorSaving ? "保存中..." : "保存" }}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeEditor">
        <button type="button">close</button>
      </form>
    </dialog>

    <!-- 预览 -->
    <dialog v-if="previewNotice" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-base font-semibold">{{ previewNotice.title }}</h3>
          <span
            class="badge badge-sm shrink-0"
            :class="previewNotice.level === 'IMPORTANT' ? 'badge-warning' : 'badge-ghost'"
          >
            {{ previewNotice.level === "IMPORTANT" ? "重要" : "普通" }}
          </span>
        </div>
        <p class="mt-1 text-xs text-base-content/50">
          {{ previewNotice.published ? "已发布" : "草稿" }}
          · {{ formatDateTime(previewNotice.updated_at) }}
        </p>
        <pre class="mt-4 whitespace-pre-wrap text-sm text-base-content/80">{{ previewNotice.content }}</pre>
        <div class="modal-action">
          <button type="button" class="btn btn-sm" @click="previewNotice = null">关闭</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="previewNotice = null">
        <button type="button">close</button>
      </form>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Pencil, Plus, Trash2 } from "lucide-vue-next";
import {
  createNotice,
  deleteNotice,
  listNotices,
  publishNotice,
  updateNotice,
} from "@/modules/notice/api";
import type { Notice, NoticeLevel } from "@/modules/notice/types";
import { formatDateTime } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";

const PAGE_SIZE = 20;

const form = reactive({ keyword: "", level: "", published: "" });
const notices = ref<Notice[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const pageError = ref<string | null>(null);
const actionBusy = ref<string | null>(null);

const editorOpen = ref(false);
const editingId = ref<string | null>(null);
const editor = reactive({ title: "", content: "", level: "INFO" as NoticeLevel });
const editorError = ref<string | null>(null);
const editorSaving = ref(false);
const previewNotice = ref<Notice | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const buildInput = () => {
  const input: Parameters<typeof listNotices>[0] = { page: page.value, pageSize: PAGE_SIZE };
  if (form.keyword) input.keyword = form.keyword;
  if (form.level === "INFO" || form.level === "IMPORTANT") input.level = form.level;
  if (form.published === "true") input.published = true;
  if (form.published === "false") input.published = false;
  return input;
};

const fetchPage = async () => {
  loading.value = true;
  pageError.value = null;
  try {
    const res = await listNotices(buildInput());
    notices.value = res.list;
    total.value = res.total;
  } catch (err) {
    pageError.value = err instanceof CloudFunctionError ? err.message : "加载失败";
    notices.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const applyFilter = () => {
  page.value = 1;
  fetchPage();
};

const resetFilter = () => {
  form.keyword = "";
  form.level = "";
  form.published = "";
  applyFilter();
};

const goPage = (n: number) => {
  page.value = n;
  fetchPage();
};

const openCreate = () => {
  editingId.value = null;
  editor.title = "";
  editor.content = "";
  editor.level = "INFO";
  editorError.value = null;
  editorOpen.value = true;
};

const openEdit = (row: Notice) => {
  editingId.value = row._id;
  editor.title = row.title;
  editor.content = row.content;
  editor.level = row.level;
  editorError.value = null;
  editorOpen.value = true;
};

const openPreview = (row: Notice) => {
  previewNotice.value = row;
};

const closeEditor = () => {
  editorOpen.value = false;
  editorError.value = null;
};

const submitEditor = async () => {
  editorSaving.value = true;
  editorError.value = null;
  try {
    if (editingId.value) {
      await updateNotice({
        id: editingId.value,
        title: editor.title,
        content: editor.content,
        level: editor.level,
      });
    } else {
      await createNotice({
        title: editor.title,
        content: editor.content,
        level: editor.level,
      });
    }
    closeEditor();
    await fetchPage();
  } catch (err) {
    editorError.value = err instanceof CloudFunctionError ? err.message : "保存失败";
  } finally {
    editorSaving.value = false;
  }
};

const togglePublish = async (row: Notice) => {
  actionBusy.value = row._id;
  try {
    await publishNotice({ id: row._id, published: !row.published });
    await fetchPage();
  } catch (err) {
    pageError.value = err instanceof CloudFunctionError ? err.message : "操作失败";
  } finally {
    actionBusy.value = null;
  }
};

const confirmDelete = async (row: Notice) => {
  if (!window.confirm(`确定删除通知「${row.title}」？此操作不可撤销。`)) return;
  actionBusy.value = row._id;
  try {
    await deleteNotice(row._id);
    await fetchPage();
  } catch (err) {
    pageError.value = err instanceof CloudFunctionError ? err.message : "删除失败";
  } finally {
    actionBusy.value = null;
  }
};

onMounted(fetchPage);
</script>
