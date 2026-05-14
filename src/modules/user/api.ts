/**
 * 用户管理模块 API（云函数 `user`）。
 * 契约：docs/04-api-spec.md 4.2.8。
 */

import { callFunction } from "@/utils/http";
import type {
  DeleteTeacherResult,
  ResetTeacherPasswordResult,
  TeacherCreateInput,
  TeacherListInput,
  TeacherListResult,
  TeacherMutationResult,
  TeacherUpdateInput,
} from "@/modules/user/types";

export const listTeachers = (input: TeacherListInput = {}) =>
  callFunction<TeacherListResult>({ name: "user", action: "listTeachers", data: input });

export const createTeacher = (input: TeacherCreateInput) =>
  callFunction<TeacherMutationResult>({ name: "user", action: "createTeacher", data: input });

export const updateTeacher = (input: TeacherUpdateInput) =>
  callFunction<TeacherMutationResult>({ name: "user", action: "updateTeacher", data: input });

export const resetTeacherPassword = (id: string, password?: string) =>
  callFunction<ResetTeacherPasswordResult>({
    name: "user",
    action: "resetTeacherPassword",
    data: password ? { id, password } : { id },
  });

export const unbindTeacherOpenid = (id: string) =>
  callFunction<TeacherMutationResult>({ name: "user", action: "unbindTeacherOpenid", data: { id } });

export const deleteTeacher = (id: string) =>
  callFunction<DeleteTeacherResult>({ name: "user", action: "deleteTeacher", data: { id } });
