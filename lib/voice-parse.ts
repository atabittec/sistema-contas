import "server-only";
import type { Category } from "@prisma/client";
import { todayInBrazil } from "@/lib/format";

export type VoiceParseResult = {
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: string | null;
  person: "ANDRE" | "USUARIA" | "CASAL";
  competenceMonth: string;
  dueDate: string | null;
  cardName: string | null;
  notes: string | null;
};

const SCHEMA = {
  name: "transaction_from_speech",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      description: { type: "string" },
      amount: { type: "number" },
      type: { type: "string", enum: ["INCOME", "EXPENSE"] },
      categoryId: { type: ["string", "null"] },
      person: { type: "string", enum: ["ANDRE", "USUARIA", "CASAL"] },
      competenceMonth: { type: "string", description: "formato AAAA-MM" },
      dueDate: { type: ["string", "null"], description: "formato AAAA-MM-DD ou null" },
      cardName: { type: ["string", "null"] },
      notes: { type: ["string", "null"] },
    },
    required: [
      "description",
      "amount",
      "type",
      "categoryId",
      "person",
      "competenceMonth",
      "dueDate",
      "cardName",
      "notes",
    ],
  },
  strict: true,
};

export async function parseVoiceTransaction({
  transcript,
  categories,
  loggedInPerson,
}: {
  transcript: string;
  categories: Category[];
  loggedInPerson: "ANDRE" | "USUARIA";
}): Promise<VoiceParseResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurado no servidor.");
  }

  const today = todayInBrazil();
  const categoryList = categories
    .map((c) => `${c.id} | ${c.name} | ${c.type === "INCOME" ? "receita" : "despesa"}`)
    .join("\n");

  const systemPrompt = `Você transforma uma frase falada em português sobre um gasto ou recebimento doméstico em um lançamento financeiro estruturado.

Data de hoje: ${today} (use isso pra resolver "hoje", "ontem", "esse mês" etc).
Quem está logado dizendo a frase: ${loggedInPerson === "ANDRE" ? "André" : "Paula"}.

Categorias cadastradas (id | nome | tipo) — escolha o id mais adequado, NUNCA invente um id que não esteja na lista. Se nenhuma categoria combinar bem, use null:
${categoryList}

Regras:
- type: "EXPENSE" é o padrão. Só use "INCOME" se a frase claramente for sobre receber/ganhar dinheiro (salário, recebimento, venda, etc).
- person: "CASAL" é o padrão.
  - Use "ANDRE" ou "USUARIA" se a frase disser um nome explicitamente, OU se o verbo estiver na primeira pessoa do singular (ex: "paguei", "comprei", "recebi", "gastei", "eu paguei") — nesse caso é a pessoa logada (${loggedInPerson === "ANDRE" ? "André" : "Paula"}) que fez a ação.
  - Frases no imperativo ou impessoais, sem verbo na primeira pessoa e sem nome (ex: "registre um gasto de X", "lança um gasto de X", "gasto de X com Y"), NÃO têm pessoa identificada — use "CASAL".
  - Exemplo: "registre um gasto de 300 reais de um coco" → CASAL (imperativo, sem sujeito). "comprei um coco de 300 reais" → pessoa logada (verbo em 1ª pessoa).
- description: um resumo curto e natural do que foi comprado/recebido (ex: "Coco", "Uber pro trabalho"), não repita a frase inteira.
- amount: valor em reais, sempre em número positivo (ex: 300 para "trezentos reais"). Atenção a valores com centavos ditos como "X e Y" (ex: "45 e 90", "quarenta e cinco e noventa") sem a palavra "mil" entre os números — isso é X reais e Y centavos, ou seja amount = X + Y/100 (ex: "45 e 90" = 45.90, NUNCA some os dois números como 135).
- competenceMonth: mês de competência no formato AAAA-MM, geralmente o mês atual a menos que a frase diga outro mês.
- dueDate: só preencha se a frase mencionar uma data de vencimento específica, senão null.
- cardName: só preencha se a frase mencionar um cartão específico (ex: "no cartão Nubank"), senão null.
- notes: null, a menos que haja uma observação clara que não caiba em description.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      response_format: { type: "json_schema", json_schema: SCHEMA },
      temperature: 0,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro na API da OpenAI (${response.status}): ${body}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Resposta vazia da OpenAI.");
  }

  const parsed = JSON.parse(content) as VoiceParseResult;

  if (parsed.categoryId && !categories.some((c) => c.id === parsed.categoryId)) {
    parsed.categoryId = null;
  }

  return parsed;
}
