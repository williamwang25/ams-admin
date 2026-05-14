<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-base-content">教师用户管理</h1>
        <p class="mt-1 text-xs text-base-content/50">共 {{ total }} 条</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" @click="openCreateModal">
        <Plus :size="16" />
        新增教师
      </button>
    </header>

    <div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-card">
      <form class="grid gap-3 md:grid-cols-4" @submit.prevent="applyFilter">
        <input
          v-model.trim="form.keyword"
          class="input input-bordered input-sm"
          placeholder="账号 / 姓名 / 手机 / 部门"
        />
        <input
          v-model.trim="form.department"
          class="input input-bordered input-sm"
          placeholder="部门精确筛选"
        />
        <select v-model="form.bound" class="select select-bordered select-sm">
          <option value="">绑定状态（全部）</option>
          <option value="true">已绑定微信</option>
          <option value="false">未绑定微信</option>
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

    <div v-if="temporaryPassword" class="alert alert-info py-3 text-sm">
      <KeyRound :size="16" />
      <span>
        {{ temporaryPassword.name }} 的临时密码：
        <code class="rounded bg-base-100 px-2 py-0.5">{{ temporaryPassword.password }}</code>
      </span>
      <button type="button" class="btn btn-ghost btn-xs" @click="temporaryPassword = null">
        <X :size="14" />
      </button>
    </div>

    <div class="rounded-lg border border-base-300 bg-base-100 shadow-card overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>账号</th>
            <th>姓名</th>
            <th>部门</th>
            <th>手机号</th>
            <th>微信绑定</th>
            <th>更新时间</th>
            <th class="text-right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="py-10 text-center text-sm text-base-content/40">
              <span class="loading loading-spinner loading-sm" /> 加载中
            </td>
          </tr>
          <tr v-else-if="teachers.length === 0">
            <td colspan="7" class="py-10 text-center text-sm text-base-content/40">
              暂无符合条件的教师账号
            </td>
          </tr>
          <tr v-for="teacher in teachers" :key="teacher._id" class="hover">
            <td class="font-mono text-xs">{{ teacher.username }}</td>
            <td>{{ teacher.name || "-" }}</td>
            <td>{{ teacher.department || "-" }}</td>
            <td>{{ teacher.phone || "-" }}</td>
            <td>
              <div v-if="teacher.is_bound" class="space-y-0.5">
                <span class="badge badge-success badge-sm">已绑定</span>
                <div class="text-xs text-base-content/50">{{ formatDateTime(teacher.bound_at) }}</div>
              </div>
              <span v-else class="badge badge-ghost badge-sm">未绑定</span>
            </td>
            <td class="text-xs">{{ formatDateTime(teacher.updated_at) }}</td>
            <td>
              <div class="flex justify-end gap-1">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  :disabled="Boolean(actionBusy)"
                  @click="openEditModal(teacher)"
                >
                  <Pencil :size="14" />
                  编辑
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  :disabled="Boolean(actionBusy)"
                  @click="onResetPassword(teacher)"
                >
                  <KeyRound :size="14" />
                  重置
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  :disabled="Boolean(actionBusy) || !teacher.is_bound"
                  @click="onUnbind(teacher)"
                >
                  <Link2Off :size="14" />
                  解绑
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-xs text-error"
                  :disabled="Boolean(actionBusy)"
                  @click="onDelete(teacher)"
                >
                  <Trash2 :size="14" />
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between text-sm">
      <div class="text-base-content/60">
        第 {{ page }} / {{ totalPages }} 页，共 {{ total }} 条
      </div>
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="page <= 1 || loading" @click="goPage(page - 1)">上一页</button>
        <button class="join-item btn btn-sm btn-disabled">{{ page }} / {{ totalPages }}</button>
        <button class="join-item btn btn-sm" :disabled="page >= totalPages || loading" @click="goPage(page + 1)">下一页</button>
      </div>
    </div>

    <dialog v-if="modalOpen" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="text-base font-semibold">{{ editingTeacher ? "编辑教师" : "新增教师" }}</h3>
        <form class="mt-4 grid gap-3 md:grid-cols-2" @submit.prevent="submitTeacher">
          <label class="form-control">
            <span class="label-text text-xs">教师账号</span>
            <input v-model.trim="teacherForm.username" class="input input-bordered input-sm" />
          </label>
          <label v-if="!editingTeacher" class="form-control">
            <span class="label-text text-xs">初始密码</span>
            <input
              v-model="teacherForm.password"
              type="password"
              class="input input-bordered input-sm"
              autocomplete="new-password"
            />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">姓名</span>
            <input v-model.trim="teacherForm.name" class="input input-bordered input-sm" />
          </label>
          <label class="form-control">
            <span class="label-text text-xs">手机号</span>
            <input v-model.trim="teacherForm.phone" class="input input-bordered input-sm" />
          </label>
          <label class="form-control md:col-span-2">
            <span class="label-text text-xs">部门</span>
            <input v-model.trim="teacherForm.department" class="input input-bordered input-sm" />
          </label>
        </form>
        <div v-if="modalError" class="alert alert-error mt-3 py-2 text-xs">
          <span>{{ modalError }}</span>
        </div>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost btn-sm" @click="closeModal">取消</button>
          <button type="button" class="btn btn-primary btn-sm" :disabled="submitting" @click="submitTeacher">
            <span v-if="submitting" class="loading loading-spinner loading-sm" />
            保存
          </button>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeModal"></div>
    </dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { KeyRound, Link2Off, Pencil, Plus, Trash2, X } from "lucide-vue-next";
import {
  createTeacher,
  deleteTeacher,
  listTeachers,
  resetTeacherPassword,
  unbindTeacherOpenid,
  updateTeacher,
} from "@/modules/user/api";
import type {
  TeacherCreateInput,
  TeacherListInput,
  TeacherUpdateInput,
  TeacherUser,
} from "@/modules/user/types";
import { formatDateTime } from "@/utils/format";
import { CloudFunctionError } from "@/utils/http";

type BoundFilter = "" | "true" | "false";

interface FilterForm {
  keyword: string;
  department: string;
  bound: BoundFilter;
}

interface TeacherForm {
  username: string;
  password: string;
  name: string;
  phone: string;
  department: string;
}

interface TemporaryPassword {
  name: string;
  password: string;
}

const PAGE_SIZE = 20;

const form = reactive<FilterForm>({
  keyword: "",
  department: "",
  bound: "",
});

const teachers = ref<TeacherUser[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const pageError = ref<string | null>(null);
const actionBusy = ref<string | null>(null);
const temporaryPassword = ref<TemporaryPassword | null>(null);

const modalOpen = ref(false);
const editingTeacher = ref<TeacherUser | null>(null);
const teacherForm = reactive<TeacherForm>({
  username: "",
  password: "",
  name: "",
  phone: "",
  department: "",
});
const submitting = ref(false);
const modalError = ref<string | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

const readError = (err: unknown, fallback: string): string => {
  if (err instanceof CloudFunctionError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
};

const buildInput = (): TeacherListInput => {
  const input: TeacherListInput = { page: page.value, pageSize: PAGE_SIZE };
  if (form.keyword) input.keyword = form.keyword;
  if (form.department) input.department = form.department;
  if (form.bound === "true") input.bound = true;
  if (form.bound === "false") input.bound = false;
  return input;
};

const fetchPage = async () => {
  loading.value = true;
  pageError.value = null;
  try {
    const res = await listTeachers(buildInput());
    teachers.value = res.list;
    total.value = res.total;
  } catch (err) {
    pageError.value = readError(err, "加载失败");
    teachers.value = [];
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
  form.department = "";
  form.bound = "";
  applyFilter();
};

const goPage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value) return;
  page.value = nextPage;
  fetchPage();
};

const resetTeacherForm = () => {
  teacherForm.username = "";
  teacherForm.password = "";
  teacherForm.name = "";
  teacherForm.phone = "";
  teacherForm.department = "";
};

const openCreateModal = () => {
  editingTeacher.value = null;
  resetTeacherForm();
  modalError.value = null;
  modalOpen.value = true;
};

const openEditModal = (teacher: TeacherUser) => {
  editingTeacher.value = teacher;
  teacherForm.username = teacher.username;
  teacherForm.password = "";
  teacherForm.name = teacher.name;
  teacherForm.phone = teacher.phone;
  teacherForm.department = teacher.department;
  modalError.value = null;
  modalOpen.value = true;
};

const closeModal = () => {
  if (submitting.value) return;
  modalOpen.value = false;
  editingTeacher.value = null;
  resetTeacherForm();
};

const submitTeacher = async () => {
  if (submitting.value) return;
  submitting.value = true;
  modalError.value = null;
  try {
    if (editingTeacher.value) {
      const input: TeacherUpdateInput = {
        id: editingTeacher.value._id,
        username: teacherForm.username,
        name: teacherForm.name,
        phone: teacherForm.phone,
        department: teacherForm.department,
      };
      await updateTeacher(input);
    } else {
      const input: TeacherCreateInput = {
        username: teacherForm.username,
        password: teacherForm.password,
        name: teacherForm.name,
        phone: teacherForm.phone,
        department: teacherForm.department,
      };
      await createTeacher(input);
    }
    closeModal();
    await fetchPage();
  } catch (err) {
    modalError.value = readError(err, "保存失败");
  } finally {
    submitting.value = false;
  }
};

const onResetPassword = async (teacher: TeacherUser) => {
  if (!window.confirm(`确定重置 ${teacher.name || teacher.username} 的登录密码吗？`)) return;
  actionBusy.value = teacher._id;
  pageError.value = null;
  temporaryPassword.value = null;
  try {
    const res = await resetTeacherPassword(teacher._id);
    temporaryPassword.value = {
      name: teacher.name || teacher.username,
      password: res.temporary_password,
    };
    await fetchPage();
  } catch (err) {
    pageError.value = readError(err, "重置失败");
  } finally {
    actionBusy.value = null;
  }
};

const onUnbind = async (teacher: TeacherUser) => {
  if (!teacher.is_bound) return;
  if (!window.confirm(`确定解除 ${teacher.name || teacher.username} 的微信绑定吗？`)) return;
  actionBusy.value = teacher._id;
  pageError.value = null;
  try {
    await unbindTeacherOpenid(teacher._id);
    await fetchPage();
  } catch (err) {
    pageError.value = readError(err, "解绑失败");
  } finally {
    actionBusy.value = null;
  }
};

const onDelete = async (teacher: TeacherUser) => {
  if (!window.confirm(`确定删除教师账号 ${teacher.username} 吗？`)) return;
  actionBusy.value = teacher._id;
  pageError.value = null;
  try {
    await deleteTeacher(teacher._id);
    if (teachers.value.length === 1 && page.value > 1) page.value -= 1;
    await fetchPage();
  } catch (err) {
    pageError.value = readError(err, "删除失败");
  } finally {
    actionBusy.value = null;
  }
};

onMounted(() => {
  fetchPage();
});
</script>
