import { Button } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import { menus } from "../../constants/menus";
import MenuItem from "../../components/MenuItem";
import { useUserPermissions } from "../../common/hooks";

function Home() {
  const nav = useNavigate();

  const userPermissions = useUserPermissions()

  return (
    <div>
      <div>home</div>

      <div>
        <Button
          onClick={() => {
            localStorage.removeItem("vnote-admin-token");
            localStorage.removeItem("vnote-admin-permissions");
            nav("/login");
          }}
        >
          log out
        </Button>
      </div>

      {/* 根据权限 渲染菜单 */}
      {menus
        .filter(
          (menu) =>
            !menu.needPermission ||
            userPermissions.includes(menu.needPermission),
        )
        .map((menu) => (
          <MenuItem name={menu.name} url={menu.url}></MenuItem>
        ))}

      <div>
        <Outlet></Outlet>
      </div>
    </div>
  );
}

export default Home;
