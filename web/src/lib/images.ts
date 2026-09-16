import type { Product } from "../types";

const fallbackImages = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=75",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=75"
];

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
  return fallbackImages[product.id % fallbackImages.length];
}
