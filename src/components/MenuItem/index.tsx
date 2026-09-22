import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import type { MenuItemData } from "../../constants/menus";

function MenuItem({ name, url }: MenuItemData) {
  const nav = useNavigate();

  return (
    <div>
      <Button
        type="link"
        onClick={() => {
          nav(url);
        }}
      >
        {name}
      </Button>
    </div>
  );
}

export default MenuItem;
