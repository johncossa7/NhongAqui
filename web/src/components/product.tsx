import { Heart, MapPin, ShieldCheck, Star, Tag } from "lucide-react";
import { Link } from "react-router-dom";

import { productImage } from "../lib/images";
import type { Category, Product } from "../types";
import { Card } from "./ui";

const conditionLabels: Record<string, string> = {
  new: "Novo",
  like_new: "Como novo",
  good: "Bom estado",
  used: "Usado",
  parts: "Para pecas"
};

export function PriceDisplay({ value }: { value: string | number }) {
  const amount = Number(value);
  return <span className="font-extrabold tracking-tight text-gray-950">{amount.toLocaleString("pt-MZ")} MT</span>;
}

export function LocationDisplay({ city, neighborhood }: { city: string; neighborhood?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
      <MapPin size={15} />
      {neighborhood ? `${neighborhood}, ${city}` : city}
    </span>
  );
}

export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) {
    return null;
  }
  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-brand-700">
      <ShieldCheck size={14} />
      Verificado
    </span>
  );
}

export function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-yellow-600">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={15} fill={index < Math.round(rating) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/produto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eceeea]">
          <img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={productImage(product)}
            alt={product.title}
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {product.featured ? (
              <span className="rounded bg-white/95 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-950 shadow-sm">
                Destaque
              </span>
            ) : null}
            <span className="rounded bg-brand-700 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white backdrop-blur">
              {conditionLabels[product.condition] ?? "Produto"}
            </span>
          </div>
          <span className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-sm backdrop-blur">
            <Heart size={18} className={product.is_favorited ? "fill-brand-500 text-brand-500" : ""} />
          </span>
        </div>
        <div className="space-y-2.5 bg-white p-3.5">
          <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-gray-950">{product.title}</h3>
          <div className="flex items-end justify-between gap-3">
            <PriceDisplay value={product.price} />
            {product.negotiable ? <span className="text-xs font-black text-brand-700">Neg.</span> : null}
          </div>
          <LocationDisplay city={product.city} neighborhood={product.neighborhood} />
        </div>
      </Link>
    </Card>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/shop?category=${category.id}`}
      className="group flex min-h-20 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3.5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-gray-950 hover:shadow-lift"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gray-950 text-white transition group-hover:bg-brand-700">
        <Tag size={18} />
      </span>
      <span>
        <span className="block text-sm font-black leading-5 text-gray-950">{category.name}</span>
        <span className="mt-0.5 block text-xs font-black text-brand-700">Explorar</span>
      </span>
    </Link>
  );
}
