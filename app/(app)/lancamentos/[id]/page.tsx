import { notFound } from "next/navigation";
import { getCategories } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { TransactionForm } from "@/components/TransactionForm";
import { updateTransactionAction } from "../actions";

export default async function EditarLancamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [transaction, categories] = await Promise.all([
    prisma.transaction.findUnique({ where: { id } }),
    getCategories(),
  ]);

  if (!transaction) notFound();

  const boundAction = updateTransactionAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Editar lançamento</h1>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <TransactionForm
          action={boundAction}
          categories={categories}
          defaultValues={{
            description: transaction.description,
            amount: transaction.amount,
            categoryId: transaction.categoryId,
            person: transaction.person,
            competenceMonth: transaction.competenceMonth,
            dueDate: transaction.dueDate
              ? transaction.dueDate.toISOString().slice(0, 10)
              : undefined,
            cardName: transaction.cardName ?? undefined,
            notes: transaction.notes ?? undefined,
            paid: transaction.paid,
          }}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
