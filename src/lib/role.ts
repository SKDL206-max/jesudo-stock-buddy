export type Role = "admin";

const RK = "jesudo_role";

export function getRole(): Role | null {
  return localStorage.getItem(RK) === "admin" ? "admin" : null;
}

export function setRole(_r: Role) {
  localStorage.setItem(RK, "admin");
  window.dispatchEvent(new Event("jesudo:role"));
}

export function clearRole() {
  localStorage.removeItem(RK);
  window.dispatchEvent(new Event("jesudo:role"));
}

export const ADMIN_ROUTES = [
  "/dashboard", "/stock", "/entree", "/sortie", "/bilan-semaine",
  "/historique", "/alertes", "/rapports", "/parametres",
];

export function isRouteAllowed(_role: Role, path: string): boolean {
  return ADMIN_ROUTES.includes(path);
}
