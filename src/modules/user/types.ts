/**
 * 用户管理模块类型。
 *
 * 当前管理范围：教师账号（ams_teacher）。字段事实源见 docs/03-data-model.md 3.3。
 */

export interface TeacherUser {
  _id: string;
  username: string;
  name: string;
  phone: string;
  department: string;
  openid: string | null;
  unionid: string | null;
  bound_at: number | null;
  created_at: number | null;
  updated_at: number | null;
  is_bound: boolean;
}

export interface TeacherListInput {
  keyword?: string;
  department?: string;
  bound?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TeacherListResult {
  total: number;
  page: number;
  pageSize: number;
  list: TeacherUser[];
}

export interface TeacherCreateInput {
  username: string;
  password: string;
  name: string;
  phone?: string;
  department?: string;
}

export interface TeacherUpdateInput {
  id: string;
  username?: string;
  name?: string;
  phone?: string;
  department?: string;
}

export interface TeacherMutationResult {
  _id: string;
  teacher: TeacherUser;
  noop?: boolean;
}

export interface ResetTeacherPasswordResult {
  _id: string;
  temporary_password: string;
}

export interface DeleteTeacherResult {
  _id: string;
  deleted: boolean;
}
