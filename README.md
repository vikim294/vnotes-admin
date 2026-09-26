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
- `/client-user-management`：客户端用户列表，需要 `client:user:read` 权限
- `/role-management`：角色管理，需要 `admin:role:read` 权限
- `/permission-management`：权限列表，需要 `admin:permission:read` 权限
- `/audit-logs`：审计日志，需要 `admin:audit:read` 权限
- `/unauthorized`：无权限提示

用户列表会展示关联角色，并支持覆盖分配自定义角色；角色列表会展示关联权限，
并支持覆盖分配权限。客户端用户列表会展示内容数量，并支持启用、禁用。
审计日志支持拥有 `admin:audit:export_excel` 权限的管理员导出 Excel。
系统内置角色及关联用户不可执行这些变更操作。

## 检查命令

```bash
pnpm lint
pnpm build
```
