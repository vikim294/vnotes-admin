import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserPermissions } from "../../common/hooks";
import { menus } from "../../constants/menus";
import NotFound from "../../pages/NotFound";

const whitelist = ["/unauthorized"];

function AuthGuard({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const userPermissions = useUserPermissions();

  const token = localStorage.getItem("vnote-admin-token");

  if (!token) {
    return <Navigate to={"/login"}></Navigate>;
  }

  // 先精确匹配，再用 startsWith 匹配
  // 访问 / -> menuItem 为 dashboard
  // 访问 /user-management -> menuItem 为 /user-management
  // 访问 /user-management/ -> menuItem 为 /user-management
  // 访问 /user-management?a=b -> menuItem 为 /user-management（loc.pathname 还是 /user-management）
  // 访问 /user-management-detail -> menuItem 为 /user-management-detail
  const menuItem = menus.find(
    (menu) =>
      loc.pathname === menu.url ||
      (menu.url !== "/" && loc.pathname.startsWith(`${menu.url}/`)),
  );

  console.log(loc.pathname, menuItem);

  if (!menuItem) {
    // 用户访问的路由在菜单中不存在

    // 是白名单路由 -> 放行
    if (
      whitelist.some(
        (item) => loc.pathname === item || loc.pathname.startsWith(`${item}/`),
      )
    ) {
      return children;
    }
    // 不是白名单路由（/unauthorized） -> 404
    else {
      return <NotFound></NotFound>;
    }
  } else {
    // 用户访问的路由在菜单中存在

    // 是公共菜单 -> 放行
    if (!menuItem.needPermission) {
      return children;
    }
    // 是受限菜单，但用户有权限
    else if (userPermissions.includes(menuItem.needPermission)) {
      return children;
    }
  }

  // /unauthorized
  return <Navigate to={"/unauthorized"}></Navigate>;
}

export default AuthGuard;
