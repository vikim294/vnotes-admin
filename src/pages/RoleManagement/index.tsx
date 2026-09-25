import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
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
import { getUserPermissions } from "../../common/auth";
import { formatDateTime } from "../../common/format";
import { HttpError } from "../../common/http";
import TableCard from "../../components/TableCard";
import {
  createRole,
  assignPermissionsToRole,
  deleteRole,
  getPermissionList,
  getRoleList,
  updateRole,
  type AdminRole,
  type AdminPermission,
} from "../../services/admin";

interface RoleFormValues {
  name: string;
  description?: string;
}

function RoleManagement() {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<RoleFormValues>();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [assigningRole, setAssigningRole] = useState<AdminRole | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [permissionOptionsLoading, setPermissionOptionsLoading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<AdminPermission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const permissions = getUserPermissions();
  const canAdd = permissions.includes("admin:role:add");
  const canEdit = permissions.includes("admin:role:edit");
  const canDelete = permissions.includes("admin:role:delete");
  const canAssignPermissions =
    permissions.includes("admin:role:assign_permission") &&
    permissions.includes("admin:permission:read");

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRoles(await getRoleList());
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : "角色列表加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getRoleList()
      .then((data) => {
        if (active) setRoles(data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof HttpError
            ? requestError.message
            : "角色列表加载失败，请稍后重试",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    form.resetFields();
    setFormModalOpen(true);
  };

  const openEditModal = (role: AdminRole) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      description: role.description || undefined,
    });
    setFormModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSubmitting(true);

    try {
      if (editingRole) {
        await updateRole({
          id: editingRole.id,
          name: values.name,
          description: values.description || null,
        });
        message.success("角色更新成功");
      } else {
        await createRole({
          name: values.name,
          description: values.description || null,
        });
        message.success("角色创建成功");
      }

      setFormModalOpen(false);
      setEditingRole(null);
      form.resetFields();
      await loadRoles();
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : editingRole
            ? "角色更新失败，请稍后重试"
            : "角色创建失败，请稍后重试",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (role: AdminRole) => {
    modal.confirm({
      title: "确认删除该角色？",
      content: `删除“${role.name}”后不可恢复。`,
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteRole(role.id);
          message.success("角色删除成功");
          await loadRoles();
        } catch (requestError) {
          message.error(
            requestError instanceof HttpError
              ? requestError.message
              : "角色删除失败，请稍后重试",
          );
        }
      },
    });
  };

  const openAssignPermissionsModal = async (role: AdminRole) => {
    setAssigningRole(role);
    setSelectedPermissionIds(role.permissions.map((permission) => permission.id));
    setAvailablePermissions([]);
    setAssignModalOpen(true);
    setPermissionOptionsLoading(true);

    try {
      setAvailablePermissions(await getPermissionList());
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : "权限列表加载失败，请稍后重试",
      );
      setAssignModalOpen(false);
      setAssigningRole(null);
      setSelectedPermissionIds([]);
    } finally {
      setPermissionOptionsLoading(false);
    }
  };

  const handleAssignPermissions = async () => {
    if (!assigningRole) return;
    setAssignSubmitting(true);

    try {
      await assignPermissionsToRole(assigningRole.id, selectedPermissionIds);
      message.success("角色权限更新成功");
      setAssignModalOpen(false);
      setAssigningRole(null);
      await loadRoles();
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : "权限分配失败，请稍后重试",
      );
    } finally {
      setAssignSubmitting(false);
    }
  };

  const showActions = canEdit || canDelete || canAssignPermissions;
  const columns: TableColumnsType<AdminRole> = [
    { title: "ID", dataIndex: "id", width: 80 },
    {
      title: "角色名称",
      dataIndex: "name",
      width: 180,
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "角色标识",
      dataIndex: "code",
      width: 260,
      render: (code: string) => <Typography.Text code>{code}</Typography.Text>,
    },
    {
      title: "类型",
      dataIndex: "builtIn",
      width: 110,
      render: (builtIn: boolean) =>
        builtIn ? <Tag color="blue">系统内置</Tag> : <Tag>自定义</Tag>,
    },
    {
      title: "描述",
      dataIndex: "description",
      render: (description: string | null) => description || "—",
    },
    {
      title: "关联权限",
      dataIndex: "permissions",
      width: 380,
      render: (rolePermissions: AdminRole["permissions"]) =>
        rolePermissions.length ? (
          <Space size={[0, 6]} wrap>
            {rolePermissions.map((permission) => (
              <Tag key={permission.id}>{permission.name}</Tag>
            ))}
          </Space>
        ) : (
          <Typography.Text type="secondary">暂无权限</Typography.Text>
        ),
    },
    { title: "创建时间", dataIndex: "createdAt", width: 180, render: formatDateTime },
    { title: "更新时间", dataIndex: "updatedAt", width: 180, render: formatDateTime },
    ...(showActions
      ? [{
          title: "操作",
          key: "actions",
          width: 250,
          fixed: "right" as const,
          render: (_: unknown, role: AdminRole) =>
            role.builtIn ? (
              <Typography.Text type="secondary">不可操作</Typography.Text>
            ) : (
              <Space size={0}>
                {canAssignPermissions && (
                  <Button
                    type="link"
                    icon={<KeyOutlined />}
                    onClick={() => void openAssignPermissionsModal(role)}
                  >
                    分配权限
                  </Button>
                )}
                {canEdit && (
                  <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(role)}>
                    编辑
                  </Button>
                )}
                {canDelete && (
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => confirmDelete(role)}>
                    删除
                  </Button>
                )}
              </Space>
            ),
        }]
      : []),
  ];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>角色管理</Typography.Title>
          <Typography.Text type="secondary">维护后台角色的名称与描述</Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void loadRoles()}>刷新</Button>
          {canAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              新增角色
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
          action={<Button size="small" danger onClick={() => void loadRoles()}>重试</Button>}
        />
      )}

      <TableCard
        icon={<SafetyCertificateOutlined />}
        title="角色列表"
        count={roles.length}
        unit="个角色"
      >
        <Table<AdminRole>
          rowKey="id"
          columns={columns}
          dataSource={roles}
          loading={loading}
          pagination={false}
          scroll={{ x: 1540 }}
          locale={{ emptyText: error ? "暂时无法获取数据" : "暂无角色" }}
        />
      </TableCard>

      <Modal
        title={editingRole ? "编辑角色" : "新增角色"}
        open={formModalOpen}
        okText={editingRole ? "保存修改" : "确认新增"}
        cancelText="取消"
        confirmLoading={submitting}
        onOk={() => void handleSubmit()}
        onCancel={() => {
          setFormModalOpen(false);
          setEditingRole(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            label="角色名称"
            name="name"
            rules={[
              { required: true, whitespace: true, message: "请输入角色名称" },
            ]}
          >
            <Input placeholder="例如：内容管理员" maxLength={100} />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea
              placeholder="简要说明这个角色的职责"
              maxLength={500}
              showCount
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="分配权限"
        open={assignModalOpen}
        okText="保存权限"
        cancelText="取消"
        confirmLoading={assignSubmitting}
        okButtonProps={{ disabled: permissionOptionsLoading }}
        onOk={() => void handleAssignPermissions()}
        onCancel={() => {
          setAssignModalOpen(false);
          setAssigningRole(null);
          setAvailablePermissions([]);
          setSelectedPermissionIds([]);
        }}
      >
        <Typography.Paragraph type="secondary">
          为 <Typography.Text strong>{assigningRole?.name}</Typography.Text> 选择权限。
          保存时会以当前选择覆盖原有关联，清空选择将移除全部权限。
        </Typography.Paragraph>
        <Select
          mode="multiple"
          className="relation-select"
          placeholder="请选择权限"
          loading={permissionOptionsLoading}
          value={selectedPermissionIds}
          onChange={setSelectedPermissionIds}
          options={availablePermissions.map((permission) => ({
            value: permission.id,
            label: `${permission.name} · ${permission.code}`,
          }))}
          optionFilterProp="label"
          allowClear
        />
      </Modal>
    </div>
  );
}

export default RoleManagement;
