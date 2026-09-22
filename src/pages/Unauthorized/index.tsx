import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="state-page">
      <Result
        status="403"
        title="无权访问"
        subTitle="当前账号没有访问这个页面的权限。"
        extra={<Button type="primary" onClick={() => navigate("/")}>返回仪表盘</Button>}
      />
    </div>
  );
}

export default Unauthorized;
