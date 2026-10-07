import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatCurrency, monthsInYear, PERSON_LABELS } from "@/lib/format";
import { Person, EntryType } from "@prisma/client";

function csvField(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Não autenticado.", { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const person = searchParams.get("person") as Person | null;
  const categoryId = searchParams.get("categoryId");
  const type = searchParams.get("type") as EntryType | null;
  const q = searchParams.get("q");

  const competenceMonth = year
    ? { in: monthsInYear(Number(year)) }
    : month
      ? month
      : undefined;

  const transactions = await prisma.transaction.findMany({
    where: {
      competenceMonth,
      person: person ?? undefined,
      categoryId: categoryId ?? undefined,
      type: type ?? undefined,
      description: q ? { contains: q } : undefined,
    },
    include: { category: true },
    orderBy: [{ competenceMonth: "asc" }, { createdAt: "asc" }],
  });

  const header = [
    "Mês",
    "Descrição",
    "Categoria",
    "Tipo",
    "Responsável",
    "Valor",
    "Pago",
    "Vencimento",
    "Cartão",
  ];

  const rows = transactions.map((t) =>
    [
      t.competenceMonth,
      t.description,
      t.category.name,
      t.type === "INCOME" ? "Receita" : "Despesa",
      PERSON_LABELS[t.person],
      formatCurrency(t.amount),
      t.paid ? "Sim" : "Não",
      t.dueDate ? t.dueDate.toISOString().slice(0, 10) : "",
      t.cardName ?? "",
    ]
      .map((v) => csvField(String(v)))
      .join(",")
  );

  const csv = "﻿" + [header.join(","), ...rows].join("\n");
  const filename = year
    ? `lancamentos-${year}.csv`
    : month
      ? `lancamentos-${month}.csv`
      : "lancamentos.csv";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
