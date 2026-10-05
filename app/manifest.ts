import type { MetadataRoute } from "next";

// Permite "Adicionar à tela inicial" no celular e abrir sem a barra do navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Contas da Casa",
    short_name: "Contas",
    description: "Controle financeiro doméstico",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
