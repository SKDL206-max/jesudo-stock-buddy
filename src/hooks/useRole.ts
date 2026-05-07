import { useEffect, useState } from "react";
import { getRole, Role } from "@/lib/role";

export function useRole(): Role | null {
  const [role, setRoleState] = useState<Role | null>(() => getRole());
  useEffect(() => {
    const h = () => setRoleState(getRole());
    window.addEventListener("jesudo:role", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("jesudo:role", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return role;
}
