import { LockOutlined, MailOutlined, ReadOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAccessToken, saveAuthSession } from "../../common/auth";
import { HttpError } from "../../common/http";
import { login, type LoginParams } from "../../services/admin";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (values: LoginParams) => {
    setLoading(true);

    try {
      const data = await login(values);
      saveAuthSession({
        accessToken: data.accessToken,
        permissions: data.permissions,
        email: values.email,
      });

      message.success("登录成功");
      const from = (location.state as { from?: string } | null)?.from || "/";
      navigate(from, { replace: true });
    } catch (error) {
      message.error(
        error instanceof HttpError ? error.message : "登录失败，请稍后重试",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark"><ReadOutlined /></span>
          <span>VNote</span>
        </div>

        <div className="login-heading">
          <Typography.Title id="login-title" level={2}>欢迎回来</Typography.Title>
          <Typography.Text type="secondary">
            登录管理后台，继续管理你的 VNote 服务
          </Typography.Text>
        </div>

        <Form<LoginParams>
          layout="vertical"
          requiredMark={false}
          size="large"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "请输入正确的邮箱地址" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="admin@example.com"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            className="login-submit"
            type="primary"
            htmlType="submit"
            loading={loading}
            block
          >
            登录
          </Button>
        </Form>
      </section>
      <p className="login-footer">VNote Admin · 简单、专注、高效</p>
    </main>
  );
}

export default Login;
