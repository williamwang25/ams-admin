/**
 * AMS auth 云函数入口（精简版：固定账号 / 固定 token，不依赖数据库与 JWT）。
 *
 * 鉴权契约：
 *   - 登录走 adminLogin，比对环境变量 ADMIN_USERNAME / ADMIN_PASSWORD。
 *   - 成功返回 token = ADMIN_TOKEN（环境变量），失败返回 2003。
 *   - 其他云函数若需要校验 token，比对 event.auth.token 与 process.env.ADMIN_TOKEN 即可。
 *
 * 之后接入多管理员 / 教师端时，本函数可重新实现为 DB 查询 + JWT。
 */

const actions = {
  adminLogin: require('./actions/adminLogin'),
};

exports.main = async (event) => {
  try {
    const action = event && event.action;
    if (!action || !actions[action]) {
      return { code: 1001, message: `unknown action: ${action || ''}`, data: null };
    }
    return await actions[action](event);
  } catch (e) {
    console.error('[auth] error:', event && event.action, e);
    return { code: 5000, message: (e && e.message) || 'internal error', data: null };
  }
};
