管理员登录
（可选）配置 3 个环境变量
CloudBase 控制台「云函数 → auth → 环境变量」：
变量	例
ADMIN_USERNAME	admin
ADMIN_PASSWORD	自己定一个
ADMIN_TOKEN	自己定一串随机字符串，例 ams-prod-2026-xxxxx
不配也能跑，会用默认 admin / admin123 / ams-dev-token-change-me，云函数日志里会打 warn 提醒。