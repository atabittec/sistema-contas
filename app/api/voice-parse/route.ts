import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getCategories } from "@/lib/data";
import { parseVoiceTransaction } from "@/lib/voice-parse";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { transcript } = await request.json();
  if (!transcript || typeof transcript !== "string") {
    return Response.json({ error: "Transcrição vazia." }, { status: 400 });
  }

  const loggedInPerson = session.username === "andre" ? "ANDRE" : "USUARIA";

  try {
    const categories = await getCategories();
    const result = await parseVoiceTransaction({
      transcript,
      categories,
      loggedInPerson,
    });
    return Response.json(result);
  } catch (error) {
    console.error("Erro ao interpretar lançamento por voz:", error);
    return Response.json(
      { error: "Não consegui interpretar o que foi dito. Tenta de novo." },
      { status: 500 }
    );
  }
}
