import { KeyOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Table, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { formatDateTime } from "../../common/format";
import { HttpError } from "../../common/http";
import TableCard from "../../components/TableCard";
import {
  getPermissionList,
  type AdminPermission,
} from "../../services/admin";

const columns: TableColumnsType<AdminPermission> = [
  { title: "ID", dataIndex: "id", width: 80 },
  {
    title: "权限名称",
    dataIndex: "name",
    width: 220,
    render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
  },
  {
    title: "权限标识",
    dataIndex: "code",
    width: 290,
    render: (code: string) => <Typography.Text code>{code}</Typography.Text>,
  },
  {
    title: "描述",
    dataIndex: "description",
    render: (description: string | null) => description || "—",
  },
  { title: "创建时间", dataIndex: "createdAt", width: 180, render: formatDateTime },
  { title: "更新时间", dataIndex: "updatedAt", width: 180, render: formatDateTime },
];

function PermissionManagement() {
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPermissions(await getPermissionList());
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : "权限列表加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getPermissionList()
      .then((data) => {
        if (active) setPermissions(data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof HttpError
            ? requestError.message
            : "权限列表加载失败，请稍后重试",
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
          <Typography.Title level={2}>权限管理</Typography.Title>
          <Typography.Text type="secondary">
            查看系统中定义的后台操作权限
          </Typography.Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void loadPermissions()}>
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
            <Button size="small" danger onClick={() => void loadPermissions()}>
              重试
            </Button>
          }
        />
      )}

      <TableCard
        icon={<KeyOutlined />}
        title="权限列表"
        count={permissions.length}
        unit="项权限"
      >
        <Table<AdminPermission>
          rowKey="id"
          columns={columns}
          dataSource={permissions}
          loading={loading}
          pagination={false}
          scroll={{ x: 1100 }}
          locale={{ emptyText: error ? "暂时无法获取数据" : "暂无权限" }}
        />
      </TableCard>
    </div>
  );
}

export default PermissionManagement;
