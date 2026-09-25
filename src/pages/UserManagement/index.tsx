import {
  CheckCircleOutlined,
  IdcardOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getAdminEmail, getUserPermissions } from "../../common/auth";
import { formatDateTime } from "../../common/format";
import { HttpError } from "../../common/http";
import TableCard from "../../components/TableCard";
import {
  addAdminUser,
  assignRolesToUser,
  changeAdminUserStatus,
  getRoleList,
  getUserList,
  type AdminRole,
  type AdminUser,
} from "../../services/admin";

interface AddUserFormValues {
  email: string;
}

function UserManagement() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<AddUserFormValues>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [roleOptionsLoading, setRoleOptionsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<AdminRole[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const permissions = getUserPermissions();
  const currentEmail = getAdminEmail();
  const canAdd = permissions.includes("admin:user:add");
  const canChangeStatus = permissions.includes(
    "admin:user:enable_and_disable",
  );
  const canAssignRoles =
    permissions.includes("admin:user:assign_role") &&
    permissions.includes("admin:role:read");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUserList());
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : "用户列表加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getUserList()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof HttpError
            ? requestError.message
            : "用户列表加载失败，请稍后重试",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAddUser = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await addAdminUser(values.email);
      message.success("新增用户成功");
      setAddModalOpen(false);
      form.resetFields();
      await loadUsers();
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : "新增用户失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmStatusChange = (user: AdminUser) => {
    const enabling = user.status === "DISABLED";
    const nextStatus: AdminUser["status"] = enabling ? "ACTIVE" : "DISABLED";

    modal.confirm({
      title: enabling ? "确认启用该用户？" : "确认禁用该用户？",
      content: enabling
        ? `启用后，${user.email} 将可以重新登录后台。`
        : `禁用后，${user.email} 将无法继续登录后台。`,
      okText: enabling ? "确认启用" : "确认禁用",
      cancelText: "取消",
      okButtonProps: { danger: !enabling },
      async onOk() {
        try {
          await changeAdminUserStatus(user.id, nextStatus);
          message.success(enabling ? "用户已启用" : "用户已禁用");
          await loadUsers();
        } catch (requestError) {
          message.error(
            requestError instanceof HttpError
              ? requestError.message
              : "状态更新失败，请稍后重试",
          );
        }
      },
    });
  };

  const openAssignRolesModal = async (user: AdminUser) => {
    setAssigningUser(user);
    setSelectedRoleIds(user.roles.filter((role) => !role.builtIn).map((role) => role.id));
    setAvailableRoles([]);
    setAssignModalOpen(true);
    setRoleOptionsLoading(true);

    try {
      const roles = await getRoleList();
      setAvailableRoles(roles.filter((role) => !role.builtIn));
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : "角色列表加载失败，请稍后重试",
      );
      setAssignModalOpen(false);
      setAssigningUser(null);
      setSelectedRoleIds([]);
    } finally {
      setRoleOptionsLoading(false);
    }
  };

  const handleAssignRoles = async () => {
    if (!assigningUser) return;
    setAssignSubmitting(true);

    try {
      await assignRolesToUser(assigningUser.id, selectedRoleIds);
      message.success("用户角色更新成功");
      setAssignModalOpen(false);
      setAssigningUser(null);
      await loadUsers();
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : "角色分配失败，请稍后重试",
      );
    } finally {
      setAssignSubmitting(false);
    }
  };

  const columns: TableColumnsType<AdminUser> = [
    { title: "ID", dataIndex: "id", width: 90 },
    {
      title: "邮箱",
      dataIndex: "email",
      render: (email: string) => (
        <Space>
          <span className="user-email-cell">{email}</span>
          {email === currentEmail && <Tag color="blue">当前账号</Tag>}
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (status: AdminUser["status"]) =>
        status === "ACTIVE" ? <Tag color="success">正常</Tag> : <Tag>已停用</Tag>,
    },
    {
      title: "关联角色",
      dataIndex: "roles",
      width: 280,
      render: (roles: AdminUser["roles"]) =>
        roles.length ? (
          <Space size={[0, 6]} wrap>
            {roles.map((role) => (
              <Tag key={role.id} color={role.builtIn ? "blue" : "default"}>
                {role.name}
              </Tag>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">暂无角色</Typography.Text>
        ),
    },
    { title: "创建时间", dataIndex: "createdAt", width: 190, render: formatDateTime },
    { title: "更新时间", dataIndex: "updatedAt", width: 190, render: formatDateTime },
    ...(canChangeStatus || canAssignRoles
      ? [{
          title: "操作",
          key: "actions",
          width: 210,
          fixed: "right" as const,
          render: (_: unknown, user: AdminUser) => {
            const protectedUser = user.roles.some((role) => role.builtIn);

            return protectedUser ? (
              <Typography.Text type="secondary">—</Typography.Text>
            ) : (
              <Space size={0}>
                {canAssignRoles && (
                  <Button
                    type="link"
                    icon={<IdcardOutlined />}
                    onClick={() => void openAssignRolesModal(user)}
                  >
                    分配角色
                  </Button>
                )}
                {canChangeStatus && user.email !== currentEmail && (
                  <Button
                    type="link"
                    danger={user.status === "ACTIVE"}
                    icon={user.status === "ACTIVE" ? <StopOutlined /> : <CheckCircleOutlined />}
                    onClick={() => confirmStatusChange(user)}
                  >
                    {user.status === "ACTIVE" ? "禁用" : "启用"}
                  </Button>
                )}
              </Space>
            );
          },
        }]
      : []),
  ];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>用户管理</Typography.Title>
          <Typography.Text type="secondary">查看、添加后台用户并管理账户状态</Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void loadUsers()}>刷新</Button>
          {canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
              新增用户
            </Button>
          )}
        </Space>
      </div>

      {error && (
        <Alert
          showIcon
          type="error"
          message="加载失败"
          description={error}
          action={<Button size="small" danger onClick={() => void loadUsers()}>重试</Button>}
        />
      )}

      <TableCard icon={<TeamOutlined />} title="用户列表" count={users.length} unit="位用户">
        <Table<AdminUser>
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false}
          scroll={{ x: 1180 }}
          locale={{ emptyText: error ? "暂时无法获取数据" : "暂无用户" }}
        />
      </TableCard>

      <Modal
        title="新增后台用户"
        open={addModalOpen}
        okText="确认新增"
        cancelText="取消"
        confirmLoading={submitting}
        onOk={() => void handleAddUser()}
        onCancel={() => {
          setAddModalOpen(false);
          form.resetFields();
        }}
      >
        <Alert className="modal-tip" type="info" showIcon message="新用户将使用系统默认初始密码" />
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入正确的邮箱地址" },
            ]}
          >
            <Input placeholder="user@example.com" autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配角色"
        open={assignModalOpen}
        okText="保存角色"
        cancelText="取消"
        confirmLoading={assignSubmitting}
        okButtonProps={{ disabled: roleOptionsLoading }}
        onOk={() => void handleAssignRoles()}
        onCancel={() => {
          setAssignModalOpen(false);
          setAssigningUser(null);
          setAvailableRoles([]);
          setSelectedRoleIds([]);
        }}
      >
        <Typography.Paragraph type="secondary">
          为 <Typography.Text strong>{assigningUser?.email}</Typography.Text> 选择角色。
          保存时会以当前选择覆盖原有关联，清空选择将移除全部自定义角色。
        </Typography.Paragraph>
        <Select
          mode="multiple"
          className="relation-select"
          placeholder="请选择角色"
          loading={roleOptionsLoading}
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          options={availableRoles.map((role) => ({
            value: role.id,
            label: role.name,
          }))}
          optionFilterProp="label"
          allowClear
        />
      </Modal>
    </div>
  );
}

export default UserManagement;
