import {
  DashboardOutlined,
  AuditOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Layout, Menu, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAdminEmail, getUserPermissions } from "../../common/auth";
import { menus } from "../../constants/menus";

const { Header, Sider, Content } = Layout;

const menuIcons = {
  dashboard: <DashboardOutlined />,
  users: <TeamOutlined />,
  clientUsers: <UsergroupAddOutlined />,
  roles: <SafetyCertificateOutlined />,
  permissions: <KeyOutlined />,
  audit: <AuditOutlined />,
};

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const permissions = getUserPermissions();

  const visibleMenus = menus.filter(
    (menu) => !menu.needPermission || permissions.includes(menu.needPermission),
  );

  const selectedKey =
    visibleMenus.find(
      (menu) =>
        location.pathname === menu.url ||
        (menu.url !== "/" && location.pathname.startsWith(`${menu.url}/`)),
    )?.key || "";

  const currentPage = location.pathname === "/unauthorized"
    ? "无权访问"
    : visibleMenus.find((menu) => menu.key === selectedKey)?.name || "管理后台";

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  return (
    <Layout className="admin-shell">
      <Sider
        className="admin-sider"
        width={240}
        collapsedWidth={72}
        collapsed={collapsed}
        trigger={null}
      >
        <button
          type="button"
          className="sidebar-brand"
          onClick={() => navigate("/")}
          aria-label="返回仪表盘"
        >
          <span className="brand-mark brand-mark-small"><ReadOutlined /></span>
          {!collapsed && <span className="sidebar-brand-name">VNote</span>}
        </button>

        <Menu
          className="sidebar-menu"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={visibleMenus.map((menu) => ({
            key: menu.key,
            icon: menuIcons[menu.icon],
            label: menu.name,
            onClick: () => navigate(menu.url),
          }))}
        />

        <div className="sidebar-bottom">
          <Tooltip title={collapsed ? "展开菜单" : "收起菜单"} placement="right">
            <Button
              className="collapse-button"
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((value) => !value)}
            >
              {!collapsed && "收起菜单"}
            </Button>
          </Tooltip>
        </div>
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Typography.Title level={4}>{currentPage}</Typography.Title>

          <div className="header-actions">
            <div className="admin-profile">
              <Avatar size={34} icon={<UserOutlined />} />
              <span className="admin-email">{getAdminEmail()}</span>
            </div>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
          </div>
        </Header>

        <Content className="admin-content"><Outlet /></Content>
      </Layout>
    </Layout>
  );
}

export default Home;
