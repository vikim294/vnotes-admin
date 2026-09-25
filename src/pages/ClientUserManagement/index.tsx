import {
  CheckCircleOutlined,
  ReloadOutlined,
  StopOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Avatar,
  Button,
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
  changeClientUserStatus,
  getClientUserList,
  type ClientUser,
} from "../../services/admin";

function ClientUserManagement() {
  const { message, modal } = App.useApp();
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canChangeStatus = getUserPermissions().includes(
    "client:user:enable_and_disable",
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getClientUserList());
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : "客户端用户列表加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void getClientUserList()
      .then((data) => {
        if (active) setUsers(data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof HttpError
            ? requestError.message
            : "客户端用户列表加载失败，请稍后重试",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const confirmStatusChange = (user: ClientUser) => {
    const enabling = user.status === "DISABLED";
    const nextStatus: ClientUser["status"] = enabling ? "ACTIVE" : "DISABLED";
    const userName = user.username || user.email || `用户 ${user.id}`;

    modal.confirm({
      title: enabling ? "确认启用该客户端用户？" : "确认禁用该客户端用户？",
      content: enabling
        ? `启用后，${userName} 将可以重新登录客户端。`
        : `禁用后，${userName} 将无法再次登录客户端。`,
      okText: enabling ? "确认启用" : "确认禁用",
      cancelText: "取消",
      okButtonProps: { danger: !enabling },
      async onOk() {
        try {
          await changeClientUserStatus(user.id, nextStatus);
          message.success(enabling ? "客户端用户已启用" : "客户端用户已禁用");
          await loadUsers();
        } catch (requestError) {
          message.error(
            requestError instanceof HttpError
              ? requestError.message
              : "状态更新失败，请稍后重试",
          );
          throw requestError;
        }
      },
    });
  };

  const columns: TableColumnsType<ClientUser> = [
    { title: "ID", dataIndex: "id", width: 80 },
    {
      title: "用户",
      key: "user",
      width: 250,
      render: (_: unknown, user: ClientUser) => (
        <Space>
          <Avatar src={user.avatarUrl || undefined} icon={<UserOutlined />} />
          <div className="client-user-identity">
            <Typography.Text strong>
              {user.username || "未设置用户名"}
            </Typography.Text>
            <Typography.Text type="secondary">
              {user.email || "未绑定邮箱"}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 110,
      render: (status: ClientUser["status"]) =>
        status === "ACTIVE" ? <Tag color="success">正常</Tag> : <Tag>已停用</Tag>,
    },
    {
      title: "笔记数",
      dataIndex: "noteCount",
      width: 100,
      align: "right",
    },
    {
      title: "分享笔记数",
      dataIndex: "sharedNoteCount",
      width: 120,
      align: "right",
    },
    {
      title: "文章数",
      dataIndex: "articleCount",
      width: 100,
      align: "right",
    },
    {
      title: "注册时间",
      dataIndex: "createdAt",
      width: 190,
      render: formatDateTime,
    },
    ...(canChangeStatus
      ? [
          {
            title: "操作",
            key: "actions",
            width: 100,
            fixed: "right" as const,
            render: (_: unknown, user: ClientUser) => (
              <Button
                type="link"
                danger={user.status === "ACTIVE"}
                icon={
                  user.status === "ACTIVE" ? (
                    <StopOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={() => confirmStatusChange(user)}
              >
                {user.status === "ACTIVE" ? "禁用" : "启用"}
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>客户端用户管理</Typography.Title>
          <Typography.Text type="secondary">
            查看客户端用户、内容数量并管理账户状态
          </Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void loadUsers()}>
          刷新
        </Button>
      </div>

      {error && (
        <Alert
          showIcon
          type="error"
          message="加载失败"
          description={error}
          action={
            <Button size="small" danger onClick={() => void loadUsers()}>
              重试
            </Button>
          }
        />
      )}

      <TableCard
        icon={<UsergroupAddOutlined />}
        title="客户端用户列表"
        count={users.length}
        unit="位用户"
      >
        <Table<ClientUser>
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false}
          scroll={{ x: 1050 }}
          locale={{ emptyText: error ? "暂时无法获取数据" : "暂无客户端用户" }}
        />
      </TableCard>
    </div>
  );
}

export default ClientUserManagement;
