/**
 * auth.adminLogin：管理员账密登录（精简版）。
 *
 * 入参：{ username, password }
 * 出参：{ token, profile: { _id, username, name, role } }
 * 逻辑：直接比对云函数环境变量。不查 DB、不加盐 hash、不签 JWT。
 *
 * 环境变量（缺失时回落到下方默认值以便开发，生产环境必须配置覆盖）：
 *   ADMIN_USERNAME  默认 'admin'
 *   ADMIN_PASSWORD  默认 'admin123'
 *   ADMIN_TOKEN     默认 'ams-dev-token-change-me'
 *
 * 错误码：
 *   1001 缺参 / 2003 账密错误
 */

const { ok, err } = require('../utils/response');

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';
const DEFAULT_TOKEN = 'ams-dev-token-change-me';

module.exports = async (event) => {
  const data = (event && event.data) || {};
  const inputUser = String(data.username || '').trim();
  const inputPwd = String(data.password || '');
  if (!inputUser || !inputPwd) return err(1001, '请输入用户名和密码');

  const expectedUser = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
  const expectedPwd = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const token = process.env.ADMIN_TOKEN || DEFAULT_TOKEN;

  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_TOKEN) {
    console.warn(
      '[auth.adminLogin] 警告：环境变量 ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_TOKEN 未全部设置，正在使用开发默认值，请勿用于生产。'
    );
  }

  if (inputUser !== expectedUser || inputPwd !== expectedPwd) {
    return err(2003, '用户名或密码错误');
  }

  return ok({
    token,
    profile: {
      _id: 'env-admin',
      username: expectedUser,
      name: '超级管理员',
      role: 'super_admin',
    },
  });
};
