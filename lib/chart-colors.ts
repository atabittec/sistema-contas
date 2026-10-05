// Validated default palette (see dataviz skill: references/palette.md)
export const CHART_COLORS = {
  income: "#2a78d6", // categorical slot 1 (blue) — diverging "positive" pole
  expense: "#e34948", // categorical slot 8 (red) — diverging "negative" pole
  neutral: "#2a78d6",
  ink: "#0b0b0b",
  secondaryInk: "#52514e",
  mutedInk: "#898781",
  gridline: "#e1e0d9",
  surface: "#fcfcfb",
};

// Cor fixa por pessoa (slots categóricos 1–3, validados juntos). A cor segue a
// pessoa, nunca a posição: quem não tem entradas some sem repintar os outros.
export const PERSON_COLORS = {
  ANDRE: "#2a78d6", // slot 1 (blue)
  USUARIA: "#eb6834", // slot 2 (orange)
  CASAL: "#1baf7a", // slot 3 (aqua) — contraste < 3:1, por isso a tabela ao lado
} as const;
