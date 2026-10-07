export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// O servidor roda em UTC; o mês "atual" é sempre o de Brasília.
export function currentCompetenceMonth() {
  return todayInBrazil().slice(0, 7);
}

/** Data de hoje em Brasília, no formato AAAA-MM-DD. */
export function todayInBrazil() {
  return dayFormatter.format(new Date());
}

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Vencimentos são gravados como meia-noite UTC; mostra só dia/mês. */
export function formatDueDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

/** Rótulo curto pro eixo dos gráficos ("jan", "fev"...). */
export function monthTickLabel(competenceMonth: string) {
  const [year, m] = competenceMonth.split("-").map(Number);
  const date = new Date(year, m - 1, 1);
  return new Intl.DateTimeFormat("pt-BR", { month: "short" })
    .format(date)
    .replace(".", "");
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

export function currentYear() {
  return Number(currentCompetenceMonth().slice(0, 4));
}

/** Os 12 meses de competência (AAAA-01 .. AAAA-12) de um ano. */
export function monthsInYear(year: number) {
  return Array.from(
    { length: 12 },
    (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`
  );
}

export const PERSON_LABELS: Record<string, string> = {
  ANDRE: "André",
  USUARIA: "Paula",
  CASAL: "Casal",
};
