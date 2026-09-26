import {
  AuditOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Alert, App, Button, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getUserPermissions } from "../../common/auth";
import { formatDateTime } from "../../common/format";
import { HttpError } from "../../common/http";
import TableCard from "../../components/TableCard";
import {
  exportAuditLogsToExcel,
  getAuditLogList,
  type AdminAuditAction,
  type AdminAuditLog,
} from "../../services/admin";

const actionLabels: Record<AdminAuditAction, { label: string; color: string }> = {
  ADD_USER: { label: "新增用户", color: "blue" },
  ENABLE_USER: { label: "启用用户", color: "green" },
  DISABLE_USER: { label: "禁用用户", color: "orange" },
  ASSIGN_ROLE: { label: "分配角色", color: "purple" },
  CREATE_ROLE: { label: "新增角色", color: "cyan" },
  UPDATE_ROLE: { label: "更新角色", color: "geekblue" },
  DELETE_ROLE: { label: "删除角色", color: "red" },
  ASSIGN_PERMISSION: { label: "分配权限", color: "magenta" },
  ENABLE_CLIENT_USER: { label: "启用客户端用户", color: "green" },
  DISABLE_CLIENT_USER: { label: "禁用客户端用户", color: "orange" },
  EXPORT_AUDIT_LOGS_TO_EXCEL: { label: "导出审计日志", color: "gold" },
};

function createFallbackFileName() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `audit-logs-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

const columns: TableColumnsType<AdminAuditLog> = [
  { title: "ID", dataIndex: "id", width: 90 },
  { title: "操作人 ID", dataIndex: "userId", width: 130 },
  {
    title: "操作类型",
    dataIndex: "action",
    width: 140,
    render: (action: AdminAuditAction) => {
      const item = actionLabels[action];
      return item ? <Tag color={item.color}>{item.label}</Tag> : <Tag>{action}</Tag>;
    },
  },
  {
    title: "操作详情",
    dataIndex: "description",
    render: (description: string | null) => (
      <span className="audit-description">{description || "—"}</span>
    ),
  },
  { title: "操作时间", dataIndex: "createdAt", width: 190, render: formatDateTime },
];

function AuditLogs() {
  const { message } = App.useApp();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const canExport = getUserPermissions().includes("admin:audit:export_excel");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLogs(await getAuditLogList());
    } catch (requestError) {
      setError(
        requestError instanceof HttpError
          ? requestError.message
          : "审计日志加载失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getAuditLogList()
      .then((data) => {
        if (active) setLogs(data);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(
          requestError instanceof HttpError
            ? requestError.message
            : "审计日志加载失败，请稍后重试",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const file = await exportAuditLogsToExcel();
      saveBlob(file.blob, file.fileName || createFallbackFileName());
      message.success("审计日志导出成功");
      await loadLogs();
    } catch (requestError) {
      message.error(
        requestError instanceof HttpError
          ? requestError.message
          : "审计日志导出失败，请稍后重试",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>审计日志</Typography.Title>
          <Typography.Text type="secondary">
            追踪后台用户、客户端用户、角色与权限相关的管理操作
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void loadLogs()}>
            刷新
          </Button>
          {canExport && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={() => void handleExport()}
            >
              导出 Excel
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
          action={
            <Button size="small" danger onClick={() => void loadLogs()}>
              重试
            </Button>
          }
        />
      )}

      <TableCard
        icon={<AuditOutlined />}
        title="日志列表"
        count={logs.length}
        unit="条记录"
      >
        <Table<AdminAuditLog>
          rowKey="id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          locale={{ emptyText: error ? "暂时无法获取数据" : "暂无审计日志" }}
        />
      </TableCard>
    </div>
  );
}

export default AuditLogs;
