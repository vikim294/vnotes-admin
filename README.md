# VNote Admin

VNote 后台管理前端，基于 React、TypeScript、Vite、React Router 和 Ant Design。

## 本地开发

```bash
pnpm install
pnpm dev
```

默认访问地址为 `http://localhost:5174`，后端默认地址为
`http://localhost:8080`。

如需修改后端地址，复制 `.env.example` 为 `.env.local` 并调整：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## 可用页面

- `/login`：管理员登录
- `/`：仪表盘
- `/user-management`：用户列表，需要 `admin:user:read` 权限
- `/unauthorized`：无权限提示

操作日志功能暂未开放，等待后端接口完成后再接入。

## 检查命令

```bash
pnpm lint
pnpm build
```
