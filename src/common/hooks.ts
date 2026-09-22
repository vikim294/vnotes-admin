export const useUserPermissions = () => {
  try {
    const userPermissions = JSON.parse(
      localStorage.getItem("vnote-admin-permissions") || "[]",
    ) as string[];

    if (!Array.isArray(userPermissions)) {
      return [];
    }
    return userPermissions;
  } catch {
    return [];
  }
};
