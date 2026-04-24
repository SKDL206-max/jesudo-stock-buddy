export const formatFCFA = (n: number): string => {
  const v = Math.round(n || 0);
  return `${v.toLocaleString("fr-FR").replace(/,/g, " ")} F CFA`;
};

export const formatNumber = (n: number): string =>
  (n || 0).toLocaleString("fr-FR").replace(/,/g, " ");

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
