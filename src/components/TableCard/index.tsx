import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

interface TableCardProps {
  icon: ReactNode;
  title: string;
  count: number;
  unit: string;
  children: ReactNode;
}

function TableCard({ icon, title, count, unit, children }: TableCardProps) {
  return (
    <Card className="table-card" bordered={false}>
      <div className="table-card-header">
        <Space>
          <span className="table-icon">{icon}</span>
          <Typography.Text strong>{title}</Typography.Text>
        </Space>
        <Typography.Text type="secondary">
          共 {count} {unit}
        </Typography.Text>
      </div>
      {children}
    </Card>
  );
}

export default TableCard;
