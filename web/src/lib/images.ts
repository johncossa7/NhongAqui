import type { Product } from "../types";

const placeholderSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#fbfaf6"/>
  <circle cx="450" cy="390" r="132" fill="#d9f8e7"/>
  <path d="M328 426c44-74 77-111 122-111s78 37 122 111" fill="none" stroke="#008037" stroke-width="28" stroke-linecap="round"/>
  <path d="M286 552h328" stroke="#101418" stroke-width="32" stroke-linecap="round"/>
  <path d="M332 614h236" stroke="#ffc928" stroke-width="28" stroke-linecap="round"/>
  <text x="450" y="724" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="800" fill="#101418">Foto indisponivel</text>
</svg>
`);

export function fallbackImage(id?: number) {
  void id;
  return `data:image/svg+xml;charset=utf-8,${placeholderSvg}`;
}

export function productImage(product: Product | { primary_image?: string | null; id: number }) {
  if ("images" in product) {
    const primary = product.images.find((image) => image.is_primary) ?? product.images[0];
    if (primary?.image) {
      return primary.image;
    }
  }
  if ("primary_image" in product && product.primary_image) {
    return product.primary_image;
  }
  return fallbackImage(product.id);
}
