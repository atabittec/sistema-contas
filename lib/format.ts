export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// O servidor roda em UTC; o mês "atual" é sempre o de Brasília.
const competenceMonthFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
});

export function currentCompetenceMonth() {
  return competenceMonthFormatter.format(new Date()).slice(0, 7);
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
  USUARIA: "Paula",
  CASAL: "Casal",
};
