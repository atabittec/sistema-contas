import { getCategories } from "@/lib/data";
import { currentCompetenceMonth } from "@/lib/format";
import { TransactionForm } from "@/components/TransactionForm";
import { createTransactionAction } from "../actions";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month ?? currentCompetenceMonth();
  const categories = await getCategories();

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Novo lançamento</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <TransactionForm
          action={createTransactionAction}
          categories={categories}
          defaultValues={{ competenceMonth: month, person: "CASAL" }}
          submitLabel="Criar lançamento"
        />
      </div>
    </div>
  );
}
