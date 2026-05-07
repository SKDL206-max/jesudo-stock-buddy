export type Role = "admin" | "employe";

const RK = "jesudo_role";

export function getRole(): Role | null {
  const v = localStorage.getItem(RK);
  return v === "admin" || v === "employe" ? v : null;
}

export function setRole(r: Role) {
  localStorage.setItem(RK, r);
  window.dispatchEvent(new Event("jesudo:role"));
}

export function clearRole() {
  localStorage.removeItem(RK);
  window.dispatchEvent(new Event("jesudo:role"));
}

// Routes accessible per role
export const ADMIN_ROUTES = [
  "/dashboard", "/stock", "/entree", "/sortie", "/bilan-semaine",
  "/historique", "/alertes", "/rapports", "/parametres",
];

export const EMPLOYE_ROUTES = [
  "/dashboard", "/bilan-semaine", "/historique", "/alertes",
];

export function isRouteAllowed(role: Role, path: string): boolean {
  const list = role === "admin" ? ADMIN_ROUTES : EMPLOYE_ROUTES;
  return list.includes(path);
}
