import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../../common/auth";

function NotFound() {
  const navigate = useNavigate();
  const target = getAccessToken() ? "/" : "/login";

  return (
    <main className="standalone-state-page">
      <Result
        status="404"
        title="页面不存在"
        subTitle="你访问的页面可能已被移动或删除。"
        extra={
          <Button type="primary" onClick={() => navigate(target)}>
            {target === "/" ? "返回仪表盘" : "前往登录"}
          </Button>
        }
      />
    </main>
  );
}

export default NotFound;
