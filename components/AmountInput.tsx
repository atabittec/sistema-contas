"use client";

import { useState, useTransition } from "react";
import { updateAmountAction } from "@/app/(app)/lancamentos/actions";

// Valor editável direto na lista: salva ao sair do campo ou apertar Enter.
export function AmountInput({
  id,
  amount,
  tone,
}: {
  id: string;
  amount: number;
  tone: "income" | "expense";
}) {
  const [value, setValue] = useState(amount.toFixed(2));
  const [saved, setSaved] = useState(amount);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function save() {
    const next = Number(value.replace(",", "."));
    if (!Number.isFinite(next) || next <= 0) {
      setError("Valor inválido");
      setValue(saved.toFixed(2));
      return;
    }
    if (next === saved) return;

    startTransition(async () => {
      const result = await updateAmountAction(id, next);
      if (result.error) {
        setError(result.error);
        setValue(saved.toFixed(2));
      } else {
        setError(undefined);
        setSaved(next);
        setValue(next.toFixed(2));
      }
    });
  }

  const isIncome = tone === "income";

  return (
    <div>
      <div
        className={`flex items-center gap-1 font-medium ${
          isIncome ? "text-emerald-700" : "text-rose-700"
        }`}
      >
        <span>{isIncome ? "+" : "-"}R$</span>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Valor"
          value={value}
          disabled={pending}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setValue(saved.toFixed(2));
              e.currentTarget.blur();
            }
          }}
          className="w-24 rounded-md border border-transparent bg-transparent px-1.5 py-0.5 text-right hover:border-slate-200 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
