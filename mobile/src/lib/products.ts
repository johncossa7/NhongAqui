export const conditionOptions = [
  { label: "Novo", value: "new" },
  { label: "Como novo", value: "like_new" },
  { label: "Bom estado", value: "good" },
  { label: "Usado", value: "used" },
  { label: "Para peças", value: "parts" }
];

export const sortOptions = [
  { label: "Mais recentes", value: "-created_at" },
  { label: "Preço mais baixo", value: "price" },
  { label: "Preço mais alto", value: "-price" },
  { label: "Mais vistos", value: "-views_count" }
];

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
