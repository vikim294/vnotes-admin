import { ReloadOutlined, TeamOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { HttpError } from "../../common/http";
import { getUserList, type AdminUser } from "../../services/admin";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

const columns: TableColumnsType<AdminUser> = [
  { title: "ID", dataIndex: "id", width: 90 },
  {
    title: "邮箱",
    dataIndex: "email",
    render: (email: string) => <span className="user-email-cell">{email}</span>,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 120,
    render: (status: AdminUser["status"]) =>
      status === "ACTIVE" ? <Tag color="success">正常</Tag> : <Tag>已停用</Tag>,
  },
  { title: "创建时间", dataIndex: "createdAt", width: 190, render: formatDate },
  { title: "更新时间", dataIndex: "updatedAt", width: 190, render: formatDate },
];

function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>用户管理</Typography.Title>
          <Typography.Text type="secondary">查看后台管理员账户及当前状态</Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void loadUsers()}>刷新</Button>
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

      <Card className="table-card" bordered={false}>
        <div className="table-card-header">
          <Space>
            <span className="table-icon"><TeamOutlined /></span>
            <Typography.Text strong>用户列表</Typography.Text>
          </Space>
          <Typography.Text type="secondary">共 {users.length} 位用户</Typography.Text>
        </div>
        <Table<AdminUser>
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false}
          scroll={{ x: 850 }}
          locale={{ emptyText: error ? "暂时无法获取数据" : "暂无用户" }}
        />
      </Card>
    </div>
  );
}

export default UserManagement;
