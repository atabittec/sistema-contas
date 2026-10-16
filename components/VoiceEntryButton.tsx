"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Loader2 } from "lucide-react";

type Status = "idle" | "listening" | "processing" | "unsupported";

export function VoiceEntryButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  function start() {
    setError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("unsupported");
      setError(
        "Reconhecimento de voz não é suportado nesse navegador. Tenta pelo Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setStatus("listening");

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (!transcript) {
        setStatus("idle");
        return;
      }
      setStatus("processing");
      try {
        const res = await fetch("/api/voice-parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao interpretar o lançamento.");
        }

        const params = new URLSearchParams();
        params.set("description", data.description ?? "");
        params.set("amount", String(data.amount ?? ""));
        params.set("type", data.type ?? "EXPENSE");
        if (data.categoryId) params.set("categoryId", data.categoryId);
        params.set("person", data.person ?? "CASAL");
        params.set("month", data.competenceMonth ?? "");
        if (data.dueDate) params.set("dueDate", data.dueDate);
        if (data.cardName) params.set("cardName", data.cardName);
        if (data.notes) params.set("notes", data.notes);
        params.set("fromVoice", "1");

        router.push(`/lancamentos/novo?${params.toString()}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao interpretar o lançamento.");
        setStatus("idle");
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setError("Permissão de microfone negada.");
      } else if (event.error === "no-speech") {
        setError("Não entendi, pode falar de novo?");
      } else {
        setError("Erro ao ouvir o microfone.");
      }
      setStatus("idle");
    };

    recognition.onend = () => {
      setStatus((current) => (current === "listening" ? "idle" : current));
    };

    recognition.start();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={status === "listening" || status === "processing"}
        title="Registrar lançamento por voz"
        className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-70 ${
          status === "listening"
            ? "border-rose-300 bg-rose-50 text-rose-600"
            : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:text-brand"
        }`}
      >
        {status === "processing" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Mic size={16} />
        )}
        {status === "listening"
          ? "Ouvindo..."
          : status === "processing"
            ? "Interpretando..."
            : "Falar lançamento"}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
