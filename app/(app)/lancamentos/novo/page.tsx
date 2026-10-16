import { getCardNames, getCategories } from "@/lib/data";
import { currentCompetenceMonth } from "@/lib/format";
import { TransactionForm } from "@/components/TransactionForm";
import { createTransactionAction } from "../actions";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    description?: string;
    amount?: string;
    categoryId?: string;
    person?: string;
    dueDate?: string;
    cardName?: string;
    notes?: string;
    fromVoice?: string;
  }>;
}) {
  const params = await searchParams;
  const month = params.month || currentCompetenceMonth();
  const [categories, cardNames] = await Promise.all([
    getCategories(),
    getCardNames(),
  ]);

  const fromVoice = params.fromVoice === "1";

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Novo lançamento</h1>
      {fromVoice && (
        <p className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand-dark">
          Preenchi os campos a partir do que você falou. Confira e ajuste antes de salvar.
          {!params.categoryId && " Não encontrei uma categoria certa — selecione uma."}
        </p>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <TransactionForm
          action={createTransactionAction}
          categories={categories}
          cardNames={cardNames}
          defaultValues={{
            competenceMonth: month,
            description: params.description || undefined,
            amount: params.amount ? Number(params.amount) : undefined,
            categoryId: params.categoryId || undefined,
            person: params.person || "CASAL",
            dueDate: params.dueDate || undefined,
            cardName: params.cardName || undefined,
            notes: params.notes || undefined,
          }}
          submitLabel="Criar lançamento"
        />
      </div>
    </div>
  );
}
