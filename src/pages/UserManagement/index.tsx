import { useEffect } from "react";

function UserManagement() {
  useEffect(() => {
    fetch("http://localhost:8080/admin/user/list", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("vnote-admin-token")
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log(res);
      });
  }, []);

  return <div>UserManagement</div>;
}

export default UserManagement;
