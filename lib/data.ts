import "server-only";
import { prisma } from "@/lib/prisma";
import { EntryType, Person } from "@prisma/client";
import { currentCompetenceMonth, lastNCompetenceMonths } from "@/lib/format";

export async function getCategories(type?: EntryType) {
  return prisma.category.findMany({
    where: type ? { type } : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getRecurringItems() {
  return prisma.recurringItem.findMany({
    include: { category: true },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
}

export async function ensureMonthlyTransactions(competenceMonth: string) {
  const activeItems = await prisma.recurringItem.findMany({
    where: { active: true },
  });

  // Já gerados neste mês (mesmo que o lançamento tenha sido apagado depois).
  const generated = await prisma.recurringGeneration.findMany({
    where: {
      competenceMonth,
      recurringItemId: { in: activeItems.map((i) => i.id) },
    },
    select: { recurringItemId: true },
  });
  const generatedIds = new Set(generated.map((g) => g.recurringItemId));

  const toCreate = activeItems.filter((item) => !generatedIds.has(item.id));
  if (toCreate.length === 0) return 0;

  // Contas como luz e água variam: usa o valor do último mês anterior
  // lançado para a conta; sem histórico, o valor padrão.
  const previous = await prisma.transaction.findMany({
    where: {
      recurringItemId: { in: toCreate.map((i) => i.id) },
      competenceMonth: { lt: competenceMonth },
    },
    orderBy: [{ competenceMonth: "desc" }, { createdAt: "desc" }],
    select: { recurringItemId: true, amount: true },
  });
  const lastAmount = new Map<string, number>();
  for (const p of previous) {
    if (p.recurringItemId && !lastAmount.has(p.recurringItemId)) {
      lastAmount.set(p.recurringItemId, p.amount);
    }
  }

  const [year, month] = competenceMonth.split("-").map(Number);

  await prisma.$transaction([
    prisma.transaction.createMany({
      data: toCreate.map((item) => ({
        description: item.name,
        amount: lastAmount.get(item.id) ?? item.defaultAmount,
        type: item.type,
        categoryId: item.categoryId,
        person: item.person,
        competenceMonth,
        paid: false,
        recurringItemId: item.id,
        // Meia-noite UTC, igual às datas digitadas no formulário.
        dueDate: item.dayOfMonth
          ? new Date(Date.UTC(year, month - 1, item.dayOfMonth))
          : null,
      })),
    }),
    prisma.recurringGeneration.createMany({
      data: toCreate.map((item) => ({
        recurringItemId: item.id,
        competenceMonth,
      })),
    }),
  ]);

  return toCreate.length;
}

export type TransactionFilters = {
  competenceMonth?: string;
  type?: EntryType;
  person?: Person;
  categoryId?: string;
};

export async function getTransactions(filters: TransactionFilters) {
  return prisma.transaction.findMany({
    where: {
      competenceMonth: filters.competenceMonth,
      type: filters.type,
      person: filters.person,
      categoryId: filters.categoryId,
    },
    include: { category: true, recurringItem: true },
    orderBy: [{ paid: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getMonthSummary(competenceMonth: string) {
  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where: { competenceMonth },
    _sum: { amount: true },
  });

  const income = rows.find((r) => r.type === EntryType.INCOME)?._sum.amount ?? 0;
  const expense = rows.find((r) => r.type === EntryType.EXPENSE)?._sum.amount ?? 0;

  return { income, expense, balance: income - expense };
}

/** Despesas ainda não pagas do mês, com vencimento primeiro. */
export async function getPendingExpenses(competenceMonth: string) {
  const items = await prisma.transaction.findMany({
    where: { competenceMonth, type: EntryType.EXPENSE, paid: false },
    select: {
      id: true,
      description: true,
      amount: true,
      dueDate: true,
      paid: true,
      cardName: true,
    },
  });

  // Sem vencimento vai para o fim da lista.
  items.sort(
    (a, b) =>
      (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity)
  );

  const total = items.reduce((sum, t) => sum + t.amount, 0);
  return { items, total };
}

export async function getMonthlySeries(months = 12) {
  const monthList = lastNCompetenceMonths(months);
  const rows = await prisma.transaction.groupBy({
    by: ["competenceMonth", "type"],
    where: { competenceMonth: { in: monthList } },
    _sum: { amount: true },
  });

  return monthList.map((month) => {
    const income =
      rows.find((r) => r.competenceMonth === month && r.type === EntryType.INCOME)
        ?._sum.amount ?? 0;
    const expense =
      rows.find((r) => r.competenceMonth === month && r.type === EntryType.EXPENSE)
        ?._sum.amount ?? 0;
    return { month, income, expense };
  });
}

export async function getExpenseByCategory(competenceMonth: string) {
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { competenceMonth, type: EntryType.EXPENSE },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({
    where: { id: { in: rows.map((r) => r.categoryId) } },
  });

  return rows
    .map((r) => ({
      categoryId: r.categoryId,
      categoryName:
        categories.find((c) => c.id === r.categoryId)?.name ?? "Outros",
      total: r._sum.amount ?? 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Nomes de cartão já usados, para sugerir no formulário. */
export async function getCardNames() {
  const rows = await prisma.transaction.findMany({
    where: { cardName: { not: null } },
    distinct: ["cardName"],
    select: { cardName: true },
    orderBy: { cardName: "asc" },
  });
  return rows.map((r) => r.cardName as string);
}

/**
 * Usa a grafia de um cartão já existente ("nubank " vira "Nubank"),
 * para não separar o mesmo cartão em dois.
 */
export async function normalizeCardName(cardName: string | undefined) {
  const name = cardName?.trim().replace(/\s+/g, " ");
  if (!name) return null;
  const existing = await getCardNames();
  return (
    existing.find((c) => c.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR")) ??
    name
  );
}

export async function getCardTotals(competenceMonth: string) {
  const rows = await prisma.transaction.findMany({
    where: {
      competenceMonth,
      cardName: { not: null },
    },
  });

  const totals = new Map<string, number>();
  for (const row of rows) {
    const key = row.cardName ?? "Cartão";
    totals.set(key, (totals.get(key) ?? 0) + row.amount);
  }

  return Array.from(totals.entries()).map(([cardName, total]) => ({
    cardName,
    total,
  }));
}

export async function getDefaultCompetenceMonth() {
  return currentCompetenceMonth();
}
