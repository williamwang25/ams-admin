/**
 * 共享的 CloudBase Node SDK / 数据库实例。
 * 所有 action 通过 `require('../utils/db')` 拿到同一份连接。
 *
 * 同时提供 `ensureCollections()`：云函数实例级一次性建集合，免去人工到控制台建表。
 * 已存在的集合会被自动跳过（捕获 "already exists"）。
 */

const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({ env: cloud.SYMBOL_CURRENT_ENV });
const db = app.database();
const _ = db.command;

const COLLECTIONS = {
  ASSET: 'ams_asset',
  ASSET_LOG: 'ams_asset_log',
  SEQ: 'ams_seq',
  DICT: 'ams_dict',
};

// asset 云函数运行时必须存在的集合
const REQUIRED_COLLECTIONS = [COLLECTIONS.ASSET, COLLECTIONS.ASSET_LOG, COLLECTIONS.SEQ];

// 实例级 flag：同一个云函数实例只跑一次，热实例下后续调用零开销
let _ensuredPromise = null;

async function _ensureOnce() {
  for (const name of REQUIRED_COLLECTIONS) {
    try {
      await db.createCollection(name);
      console.log('[asset] created collection:', name);
    } catch (e) {
      const msg = String((e && (e.message || e.code)) || '');
      // CloudBase 返回的"集合已存在"错误形式：errCode -501001 或 message 含 "already" / "exists"
      if (msg.includes('already') || msg.includes('exists') || msg.includes('-501001')) {
        continue;
      }
      throw e;
    }
  }
}

/**
 * 幂等保证 asset 云函数依赖的所有集合都存在。
 * 通过 Promise 复用避免并发 action 重复跑。
 */
function ensureCollections() {
  if (!_ensuredPromise) {
    _ensuredPromise = _ensureOnce().catch((e) => {
      _ensuredPromise = null; // 失败后允许下次重试
      throw e;
    });
  }
  return _ensuredPromise;
}

module.exports = { app, db, _, COLLECTIONS, REQUIRED_COLLECTIONS, ensureCollections };
