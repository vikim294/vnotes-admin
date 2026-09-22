import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function Login() {
  const nav = useNavigate();

  return (
    <div>
      <Button
        onClick={() => {
          fetch("http://localhost:8080/admin/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "vikim294@163.com",
              password: "12345678",
            }),
          })
            .then((res) => {
              return res.json();
            })
            .then((res) => {
                console.log(res)
              if (res.data.accessToken) {
                localStorage.setItem("vnote-admin-token", res.data.accessToken);
                localStorage.setItem(
                  "vnote-admin-permissions",
                  JSON.stringify(res.data.permissions),
                );

                nav("/");
              }
            });
        }}
      >
        登录
      </Button>
    </div>
  );
}

export default Login;
