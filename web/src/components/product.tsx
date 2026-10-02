import { Camera, Heart, MapPin, ShieldCheck, Star, Tag } from "lucide-react";
import { Link } from "react-router-dom";

import { fallbackImage, productImage } from "../lib/images";
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
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 text-sm text-gray-500">
      <MapPin className="shrink-0" size={15} />
      <span className="truncate">{neighborhood ? `${neighborhood}, ${city}` : city}</span>
    </span>
  );
}

export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) {
    return null;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-brand-700">
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
    <Card className="group min-w-0 overflow-hidden bg-white shadow-soft transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <Link to={`/produto/${product.slug}`} className="block min-w-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eceeea]">
          <img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={productImage(product)}
            alt={product.title}
            onError={(event) => {
              event.currentTarget.src = fallbackImage(product.id);
            }}
          />
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {product.featured ? (
              <span className="rounded-full bg-accent-yellow px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-gray-950 shadow-sm">
                Destaque
              </span>
            ) : null}
            <span className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-brand-700 backdrop-blur">
              {conditionLabels[product.condition] ?? "Produto"}
            </span>
          </div>
          <span className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-sm backdrop-blur">
            <Heart size={18} className={product.is_favorited ? "fill-brand-500 text-brand-500" : ""} />
          </span>
          {product.images.length ? (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-black text-gray-700 shadow-sm">
              <Camera size={13} />
              {product.images.length}
            </span>
          ) : null}
        </div>
        <div className="space-y-2 bg-white p-2.5 sm:space-y-2.5 sm:p-3.5">
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-black leading-5 text-gray-950 sm:text-sm">{product.title}</h3>
          <div className="flex min-w-0 items-end justify-between gap-1.5 sm:gap-3">
            <span className="min-w-0 text-sm sm:text-base"><PriceDisplay value={product.price} /></span>
            {product.negotiable ? <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-black text-brand-700">Neg.</span> : null}
          </div>
          <LocationDisplay city={product.city} neighborhood={product.neighborhood} />
        </div>
      </Link>
    </Card>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-2.5 gap-y-4 md:grid-cols-3 md:gap-x-3 md:gap-y-5 lg:grid-cols-4 xl:grid-cols-5">
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
      className="group flex min-h-16 min-w-0 items-center gap-2 rounded-xl border border-gray-200 bg-white p-2.5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift sm:min-h-20 sm:gap-3 sm:rounded-2xl sm:p-3.5"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white sm:size-10">
        <Tag size={18} />
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 block text-xs font-black leading-4 text-gray-950 sm:text-sm sm:leading-5">{category.name}</span>
        <span className="mt-0.5 hidden text-xs font-black text-brand-700 sm:block">Explorar</span>
      </span>
    </Link>
  );
}
