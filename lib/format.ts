export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function currentCompetenceMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCompetenceMonth(competenceMonth: string) {
  const [year, month] = competenceMonth.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function shiftCompetenceMonth(competenceMonth: string, delta: number) {
  const [year, month] = competenceMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function lastNCompetenceMonths(n: number, endMonth?: string) {
  const end = endMonth ?? currentCompetenceMonth();
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    months.push(shiftCompetenceMonth(end, -i));
  }
  return months;
}

export const PERSON_LABELS: Record<string, string> = {
  ANDRE: "André",
  USUARIA: "Usuária",
  CASAL: "Casal",
};
