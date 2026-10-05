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

  const [year, month] = competenceMonth.split("-").map(Number);

  await prisma.$transaction([
    prisma.transaction.createMany({
      data: toCreate.map((item) => ({
        description: item.name,
        amount: item.defaultAmount,
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
