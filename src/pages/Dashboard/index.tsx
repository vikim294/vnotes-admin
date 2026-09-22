import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { getUserPermissions } from "../../common/auth";

function Dashboard() {
  const navigate = useNavigate();
  const canViewUsers = getUserPermissions().includes("admin:user:read");

  return (
    <div className="page-stack dashboard-page">
      <Card className="welcome-card" bordered={false}>
        <div className="welcome-copy">
          <Typography.Text className="eyebrow">VNOTE ADMIN</Typography.Text>
          <Typography.Title level={1}>Welcome back.</Typography.Title>
          <Typography.Paragraph>
            欢迎来到 VNote 管理后台。这里可以查看并管理后台用户。
          </Typography.Paragraph>
          {canViewUsers && (
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              onClick={() => navigate("/user-management")}
            >
              查看用户
            </Button>
          )}
        </div>
        <div className="welcome-visual" aria-hidden="true"><span>V</span></div>
      </Card>
    </div>
  );
}

export default Dashboard;
