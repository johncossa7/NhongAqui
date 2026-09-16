import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Crown,
  Flag,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  Users,
  UserRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { CategoryCard, LocationDisplay, PriceDisplay, ProductGrid, ReviewStars, VerifiedBadge } from "./components/product";
import { Button, Card, EmptyState, Input, Select, SkeletonCard, Textarea } from "./components/ui";
import { API_URL, apiRequest, normalizePage, toQuery } from "./lib/api";
import { useAuth } from "./lib/auth";
import { fallbackImage, productImage } from "./lib/images";
import { setSeo } from "./lib/seo";
import type { Category, Conversation, Favorite, Paginated, Product, User } from "./types";

const conditionLabels: Record<string, string> = {
  new: "Novo",
  like_new: "Como novo",
  good: "Bom estado",
  used: "Usado",
  parts: "Para pecas"
};

function Shell({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <main className={`mx-auto w-full flex-1 ${narrow ? "max-w-3xl" : "max-w-[1500px]"} px-4 py-7 md:py-10 lg:px-8`}>
      {children}
    </main>
  );
}

function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Category> | Category[]>("/categories/"))
  });
}

function useProducts(params: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>(`/products/${toQuery(params)}`))
  });
}

function SearchBar({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();
  return (
    <form
      className="flex border border-gray-950 bg-white p-1 shadow-[10px_10px_0_rgba(0,128,55,0.12)]"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(`/shop${toQuery({ search: value })}`);
      }}
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search size={19} className="text-brand-600" />
        <Input
          className="border-0 bg-transparent px-0 focus:border-transparent focus:ring-0"
          placeholder="O que procura?"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <Button type="submit" aria-label="Pesquisar" className="px-5">
        <Search size={18} />
        <span className="hidden sm:inline">Pesquisar</span>
      </Button>
    </form>
  );
}

function FeaturedTile({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <Link
      to={`/produto/${product.slug}`}
      className={`group relative overflow-hidden bg-gray-200 ${large ? "row-span-2 min-h-80" : "min-h-40"}`}
    >
      <img
        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        src={productImage(product)}
        alt={product.title}
        onError={(event) => {
          event.currentTarget.src = fallbackImage(product.id);
        }}
      />
      <div className="absolute left-3 top-3 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-brand-700">
        Curado
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/90 to-transparent p-4 text-white">
        <p className="line-clamp-1 text-sm font-black uppercase tracking-[0.08em]">{product.title}</p>
        <p className="mt-1 text-lg font-black">{Number(product.price).toLocaleString("pt-MZ")} MT</p>
      </div>
    </Link>
  );
}

export function HomePage() {
  useEffect(() => setSeo("Encontre. Venda. Confie.", "Um mercado digital feito para Mocambique."), []);
  const categories = useCategories();
  const featured = useProducts({ featured: true, page_size: 4 });
  const recent = useProducts({ page_size: 8, ordering: "-created_at" });
  const showcase = (featured.data?.length ? featured.data : recent.data ?? []).slice(0, 3);

  return (
    <Shell>
      <section className="grid gap-10 border-b border-gray-950 pb-12 md:grid-cols-[1.02fr_0.98fr] md:items-center">
        <div className="space-y-7">
          <div>
            <p className="inline-flex bg-gray-950 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
              Maputo e Matola primeiro
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.03em] text-gray-950 md:text-7xl">
              Encontre o que procura. Venda o que ja nao precisa.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
              Um mercado digital feito para Mocambique, com anuncios rapidos, pesquisa simples e contacto direto.
            </p>
          </div>
          <SearchBar />
          <div className="flex flex-wrap gap-3">
            <Link to="/shop">
              <Button>
                Explorar produtos
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/vender"><Button variant="secondary">Vender agora</Button></Link>
          </div>
          <div className="grid max-w-xl grid-cols-3 border border-gray-950 bg-white">
            {[
              ["20+", "produtos"],
              ["14", "categorias"],
              ["1", "conta gratis"]
            ].map(([value, label]) => (
              <div key={label} className="border-r border-gray-950 p-4 last:border-r-0">
                <p className="text-2xl font-black text-gray-950">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border border-gray-950 bg-gray-950 p-3">
          {showcase[0] ? <FeaturedTile product={showcase[0]} large /> : null}
          {showcase.slice(1).map((product) => <FeaturedTile key={product.id} product={product} />)}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Explorar</p>
            <h2 className="text-3xl font-black uppercase tracking-[-0.02em] text-gray-950">Categorias populares</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.16em] text-gray-950 hover:text-brand-700">
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {(categories.data ?? []).slice(0, 14).map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Novidades</p>
            <h2 className="text-3xl font-black uppercase tracking-[-0.02em] text-gray-950">Produtos recentes</h2>
          </div>
          <Link to="/shop?ordering=-created_at" className="hidden text-xs font-black uppercase tracking-[0.16em] text-gray-950 hover:text-brand-700 sm:inline">
            Ver mais
          </Link>
        </div>
        {recent.data?.length ? <ProductGrid products={recent.data} /> : <EmptyState title="Sem produtos ainda" text="Depois de correr o seed, os anuncios aparecem aqui." />}
      </section>
    </Shell>
  );
}

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categories = useCategories();
  const params = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      min_price: searchParams.get("min_price") ?? undefined,
      max_price: searchParams.get("max_price") ?? undefined,
      ordering: searchParams.get("ordering") ?? "-created_at"
    }),
    [searchParams]
  );
  const products = useProducts(params);
  const [draft, setDraft] = useState(params);
  useEffect(() => setSeo("Pesquisar produtos", "Compre e venda em Maputo, Matola e todo Mocambique."), []);

  function update(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams();
    Object.entries(draft).forEach(([key, value]) => {
      if (value) next.set(key, String(value));
    });
    setSearchParams(next);
  }

  return (
    <Shell>
      <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-soft md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">Comprar</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Explorar produtos</h1>
          <p className="mt-1 text-sm text-gray-600">Filtre por preco, cidade, categoria e ordenacao.</p>
        </div>
        <Link to="/vender">
          <Button>
            <Camera size={18} />
            Publicar anuncio
          </Button>
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <form onSubmit={update} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:self-start">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-black text-gray-950">Filtros</h2>
            <button
              type="button"
              className="text-xs font-bold text-gray-500 hover:text-brand-700"
              onClick={() => {
                setDraft({
                  search: undefined,
                  category: undefined,
                  city: undefined,
                  min_price: undefined,
                  max_price: undefined,
                  ordering: "-created_at"
                });
                setSearchParams(new URLSearchParams());
              }}
            >
              Limpar
            </button>
          </div>
          <Input placeholder="O que procura?" value={draft.search ?? ""} onChange={(event) => setDraft({ ...draft, search: event.target.value })} />
          <Select value={draft.category ?? ""} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
            <option value="">Todas as categorias</option>
            {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
          <Input placeholder="Cidade" value={draft.city ?? ""} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Min MT" value={draft.min_price ?? ""} onChange={(event) => setDraft({ ...draft, min_price: event.target.value })} />
            <Input placeholder="Max MT" value={draft.max_price ?? ""} onChange={(event) => setDraft({ ...draft, max_price: event.target.value })} />
          </div>
          <Select value={draft.ordering ?? "-created_at"} onChange={(event) => setDraft({ ...draft, ordering: event.target.value })}>
            <option value="-created_at">Mais recentes</option>
            <option value="price">Menor preco</option>
            <option value="-price">Maior preco</option>
            <option value="-views_count">Mais vistos</option>
          </Select>
          <Button type="submit" className="w-full"><Search size={18} /> Filtrar</Button>
        </form>
        <section>
          <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-soft">
            <p className="text-sm font-bold text-gray-950">
              {products.isLoading ? "A carregar produtos..." : `${products.data?.length ?? 0} resultados nesta pagina`}
            </p>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">NhongAqui</p>
          </div>
          {products.isLoading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          ) : products.isError ? (
            <EmptyState
              title="Nao foi possivel carregar produtos"
              text={`Confirme se a API esta online e se o backend permite este dominio. API configurada: ${API_URL}`}
            />
          ) : products.data?.length ? (
            <ProductGrid products={products.data} />
          ) : (
            <EmptyState title="Nenhum produto encontrado" text="Tente pesquisar por outro termo ou remover filtros." />
          )}
        </section>
      </div>
    </Shell>
  );
}

export function ProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiRequest<Product>(`/products/${slug}/`)
  });
  const favorites = useQuery({
    queryKey: ["favorites"],
    enabled: isAuthenticated,
    queryFn: async () => normalizePage(await apiRequest<Paginated<Favorite>>("/favorites/"))
  });
  const reviews = useQuery({
    queryKey: ["reviews", product.data?.id],
    enabled: Boolean(product.data?.id),
    queryFn: async () => normalizePage(await apiRequest<Paginated<{ id: number; rating: number; comment: string; reviewer: User }>>(`/reviews/?product=${product.data?.id}`))
  });

  useEffect(() => {
    if (product.data) {
      setSeo(product.data.title, product.data.description, productImage(product.data));
      void apiRequest(`/products/${product.data.slug}/view/`, { method: "POST" }).catch(() => undefined);
    }
  }, [product.data]);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!product.data) return;
      const favorite = favorites.data?.find((item) => item.product.id === product.data?.id);
      if (favorite) {
        await apiRequest(`/favorites/${favorite.id}/`, { method: "DELETE" });
      } else {
        await apiRequest("/favorites/", { method: "POST", body: JSON.stringify({ product_id: product.data.id }) });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
      await queryClient.invalidateQueries({ queryKey: ["product", slug] });
    }
  });

  async function contactSeller() {
    if (!product.data) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const conversation = await apiRequest<Conversation>("/conversations/", {
      method: "POST",
      body: JSON.stringify({ product_id: product.data.id })
    });
    navigate(`/mensagens?conversation=${conversation.id}`);
  }

  if (!product.data) {
    return <Shell><EmptyState title="A carregar" text="Estamos a abrir o anuncio." /></Shell>;
  }

  const currentFavorite = favorites.data?.find((item) => item.product.id === product.data.id);
  const seller = product.data.seller;
  const galleryImages = product.data.images.slice(0, maxProductImages);
  const selectedImage = galleryImages.find((image) => image.id === selectedImageId) ?? galleryImages[0];
  const selectedImageIndex = selectedImage ? galleryImages.findIndex((image) => image.id === selectedImage.id) : -1;

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg bg-white shadow-soft">
            <img
              className="aspect-[4/3] w-full object-cover"
              src={selectedImage?.image ?? productImage(product.data)}
              alt={product.data.title}
              onError={(event) => {
                if (product.data) event.currentTarget.src = fallbackImage(product.data.id);
              }}
            />
            <div className="absolute bottom-3 right-3 rounded-md bg-gray-950/85 px-3 py-1 text-sm font-black text-white">
              {galleryImages.length ? `${selectedImageIndex + 1}/${galleryImages.length}` : "0/0"}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {galleryImages.map((image, index) => {
              const selected = selectedImage?.id === image.id;
              return (
                <button
                  key={image.id}
                  type="button"
                  className={`relative overflow-hidden rounded-md border bg-white transition ${
                    selected ? "border-gray-950 ring-2 ring-brand-500" : "border-gray-200 hover:border-gray-950"
                  }`}
                  onClick={() => setSelectedImageId(image.id)}
                  aria-label={`Ver fotografia ${index + 1}`}
                >
                  <img
                    className="aspect-square w-full object-cover"
                    src={image.image}
                    alt={product.data?.title}
                    onError={(event) => {
                      if (product.data) event.currentTarget.src = fallbackImage(product.data.id);
                    }}
                  />
                  {image.is_primary ? (
                    <span className="absolute left-1 top-1 rounded bg-gray-950 px-1.5 py-0.5 text-[10px] font-black text-white">Capa</span>
                  ) : null}
                </button>
              );
            })}
            {!galleryImages.length ? (
              <img
                className="aspect-square rounded-md object-cover"
                src={fallbackImage(product.data.id)}
                alt={product.data.title}
                onError={(event) => {
                  if (product.data) event.currentTarget.src = fallbackImage(product.data.id);
                }}
              />
            ) : null}
          </div>
        </div>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-950">{product.data.title}</h1>
              <p className="mt-2 text-2xl"><PriceDisplay value={product.data.price} /></p>
            </div>
            <Button variant="secondary" onClick={() => void favoriteMutation.mutate()} aria-label="Favorito">
              <Heart size={20} className={currentFavorite ? "fill-brand-500 text-brand-500" : ""} />
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1">{conditionLabels[product.data.condition]}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">{product.data.negotiable ? "Negociavel" : "Preco fixo"}</span>
            <span className="rounded-full bg-gray-100 px-3 py-1">{product.data.views_count} vistas</span>
          </div>
          <p className="mt-4 text-gray-700">{product.data.description}</p>
          <div className="mt-4"><LocationDisplay city={product.data.city} neighborhood={product.data.neighborhood} /></div>
          <div className="mt-5 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <Link to={`/vendedor/${seller.id}`} className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-md bg-gray-100"><UserRound size={22} /></span>
                <span>
                  <span className="block font-semibold">{seller.seller_profile?.display_name ?? seller.full_name}</span>
                  <span className="text-sm text-gray-500">{seller.city}</span>
                </span>
              </Link>
              <VerifiedBadge verified={seller.seller_profile?.verified || seller.verification_status === "verified"} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button onClick={() => void contactSeller()}><MessageCircle size={18} /> Contactar</Button>
            <Button variant="secondary" onClick={() => void navigator.share?.({ title: product.data?.title, url: location.href })}><Share2 size={18} /> Partilhar</Button>
            <Button variant="ghost" onClick={() => setReportOpen((value) => !value)}><Flag size={18} /> Denunciar</Button>
            <Button variant="ghost" onClick={() => setReviewOpen((value) => !value)}>Avaliar</Button>
          </div>
          {reportOpen ? <ReportForm productId={product.data.id} /> : null}
          {reviewOpen ? <ReviewForm productId={product.data.id} onDone={() => void reviews.refetch()} /> : null}
        </Card>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">Avaliacoes</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(reviews.data ?? []).map((review) => (
            <Card key={review.id} className="p-4">
              <ReviewStars rating={review.rating} />
              <p className="mt-2 text-sm text-gray-700">{review.comment || "Sem comentario."}</p>
            </Card>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function ReportForm({ productId }: { productId: number }) {
  const [reason, setReason] = useState("fraud");
  const [description, setDescription] = useState("");
  const report = useMutation({
    mutationFn: () => apiRequest("/reports/", { method: "POST", body: JSON.stringify({ product_id: productId, reason, description }) })
  });
  return (
    <form className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4" onSubmit={(event) => { event.preventDefault(); void report.mutate(); }}>
      <Select value={reason} onChange={(event) => setReason(event.target.value)}>
        <option value="fraud">Fraude</option>
        <option value="fake_product">Produto falso</option>
        <option value="misleading">Enganoso</option>
        <option value="inappropriate">Inapropriado</option>
        <option value="prohibited">Proibido</option>
        <option value="spam">Spam</option>
        <option value="other">Outro</option>
      </Select>
      <Textarea placeholder="Descreva o problema" value={description} onChange={(event) => setDescription(event.target.value)} />
      <Button type="submit" disabled={report.isPending}>Enviar denuncia</Button>
    </form>
  );
}

function ReviewForm({ productId, onDone }: { productId: number; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const review = useMutation({
    mutationFn: () => apiRequest("/reviews/", { method: "POST", body: JSON.stringify({ product_id: productId, rating, comment }) }),
    onSuccess: onDone
  });
  return (
    <form className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4" onSubmit={(event) => { event.preventDefault(); void review.mutate(); }}>
      <Select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
        {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} estrelas</option>)}
      </Select>
      <Textarea placeholder="Comentario" value={comment} onChange={(event) => setComment(event.target.value)} />
      <Button type="submit" disabled={review.isPending}>Publicar avaliacao</Button>
    </form>
  );
}

const maxProductImages = 8;
const maxImageSizeMb = 8;
const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;

const promotionPlans = [
  {
    id: "standard",
    name: "Anuncio normal",
    price: "Gratis",
    description: "Aparece na pesquisa e na categoria escolhida.",
    icon: CheckCircle2
  },
  {
    id: "boost",
    name: "Destaque local",
    price: "A definir",
    description: "Mais visibilidade na cidade e categoria.",
    icon: Crown
  },
  {
    id: "premium",
    name: "Topo da lista",
    price: "A definir",
    description: "Posicao premium para vender mais rapido.",
    icon: Sparkles
  }
];

export function SellPage() {
  const categories = useCategories();
  const auth = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [promotion, setPromotion] = useState("standard");
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    negotiable: true,
    condition: "good",
    province: "Maputo",
    city: "Maputo",
    neighborhood: ""
  });
  const create = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
      files.slice(0, 8).forEach((file) => data.append("uploaded_images", file));
      return apiRequest<Product>("/products/", { method: "POST", body: data });
    },
    onSuccess: (product) => navigate(`/produto/${product.slug}`)
  });
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );
  const selectedCategory = categories.data?.find((category) => String(category.id) === form.category);
  const errorMessage = localError ?? (create.error instanceof Error ? create.error.message : null);
  const checklist = [
    { label: "Fotos", done: files.length > 0 },
    { label: "Titulo", done: form.title.trim().length >= 8 },
    { label: "Categoria", done: Boolean(form.category) },
    { label: "Preco", done: Number(form.price) > 0 },
    { label: "Localizacao", done: Boolean(form.city.trim()) }
  ];

  useEffect(() => setSeo("Publicar anuncio", "Venda produtos no NhongAqui com fotos, preco e localizacao."), []);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  function addImages(selectedFiles: FileList | null) {
    const incoming = Array.from(selectedFiles ?? []);
    if (!incoming.length) return;

    const accepted = incoming.filter((file) => file.type.startsWith("image/") && file.size <= maxImageSizeBytes);
    const rejected = incoming.length - accepted.length;

    setFiles((current) => [...current, ...accepted].slice(0, maxProductImages));
    if (rejected) {
      setLocalError(`Algumas imagens foram ignoradas. Use JPG/PNG/WebP ate ${maxImageSizeMb}MB.`);
      return;
    }
    if (files.length + accepted.length > maxProductImages) {
      setLocalError(`Pode adicionar no maximo ${maxProductImages} fotografias.`);
      return;
    }
    setLocalError(null);
  }

  function removeImage(index: number) {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function makeCover(index: number) {
    setFiles((current) => {
      const next = [...current];
      const [cover] = next.splice(index, 1);
      return cover ? [cover, ...next] : current;
    });
  }

  function submitProduct(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    if (!auth.isAuthenticated) {
      setLocalError("Entre na sua conta antes de publicar o anuncio.");
      return;
    }
    if (!files.length) {
      setLocalError("Adicione pelo menos uma fotografia do produto.");
      return;
    }
    if (Number(form.price) <= 0) {
      setLocalError("Indique um preco valido em meticais.");
      return;
    }
    void create.mutate();
  }

  return (
    <Shell>
      <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-soft md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">Vender</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Publicar anuncio</h1>
          <p className="mt-1 text-sm text-gray-600">Adicione fotos reais, preco e localizacao para criar um anuncio completo.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
          <ShieldCheck size={18} />
          Imagens ficam em revisao
        </div>
      </div>

      <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={submitProduct}>
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-soft">
            <div className="border-b border-gray-200 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-gray-950">Fotografias do produto</h2>
                  <p className="mt-1 text-sm text-gray-500">A primeira imagem sera a capa do anuncio.</p>
                </div>
                <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-black text-gray-700">
                  {files.length}/{maxProductImages}
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-center transition hover:border-brand-600 hover:bg-brand-50">
                  <ImagePlus className="text-brand-600" size={30} />
                  <span className="mt-2 text-sm font-black text-gray-950">Adicionar fotos</span>
                  <span className="mt-1 text-xs text-gray-500">JPG, PNG, WebP</span>
                  <input
                    className="sr-only"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) => {
                      addImages(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
                {previews.map((preview, index) => (
                  <div key={`${preview.file.name}-${preview.file.lastModified}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    <img className="h-full w-full object-cover" src={preview.url} alt={preview.file.name} />
                    <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-white/95 px-2 py-1 text-[11px] font-black text-gray-950 shadow-sm"
                        onClick={() => makeCover(index)}
                      >
                        {index === 0 ? "Capa" : "Usar capa"}
                      </button>
                      <button
                        type="button"
                        className="flex size-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm hover:text-red-600"
                        aria-label="Remover fotografia"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5 shadow-soft">
            <div>
              <h2 className="text-xl font-black text-gray-950">Detalhes do produto</h2>
              <p className="mt-1 text-sm text-gray-500">Quanto mais claro for o anuncio, mais facil sera vender.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div>
                <Input
                  required
                  maxLength={160}
                  placeholder="Titulo do produto"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">{form.title.length}/160</p>
              </div>
              <Select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                <option value="">Categoria</option>
                {(categories.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
            </div>
            <Textarea
              required
              className="min-h-40"
              placeholder="Descreva o estado, marca, modelo, extras incluidos e motivo da venda"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <Select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })}>
                {Object.entries(conditionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </Select>
              <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-3">
                <span className="text-sm font-bold text-gray-700">Preco negociavel</span>
                <button
                  type="button"
                  className={`relative h-7 w-12 rounded-full transition ${form.negotiable ? "bg-brand-600" : "bg-gray-300"}`}
                  aria-pressed={form.negotiable}
                  onClick={() => setForm({ ...form, negotiable: !form.negotiable })}
                >
                  <span className={`absolute top-1 size-5 rounded-full bg-white transition ${form.negotiable ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="space-y-5 p-5 shadow-soft">
            <div>
              <h2 className="text-xl font-black text-gray-950">Preco e localizacao</h2>
              <p className="mt-1 text-sm text-gray-500">Mostre onde o comprador pode levantar ou combinar entrega.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-[220px_1fr_1fr]">
              <Input
                required
                inputMode="decimal"
                min="0"
                type="number"
                placeholder="Preco MT"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
              />
              <Input placeholder="Provincia" value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value })} />
              <Input required placeholder="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </div>
            <Input placeholder="Bairro ou zona" value={form.neighborhood} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} />
          </Card>

          <Card className="space-y-4 p-5 shadow-soft">
            <div>
              <h2 className="text-xl font-black text-gray-950">Promover anuncio</h2>
              <p className="mt-1 text-sm text-gray-500">Escolha como pretende destacar o produto quando a promocao estiver ativa.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {promotionPlans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  className={`rounded-lg border p-4 text-left transition hover:border-gray-950 ${
                    promotion === plan.id ? "border-gray-950 bg-gray-950 text-white" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setPromotion(plan.id)}
                >
                  <plan.icon className={promotion === plan.id ? "text-brand-100" : "text-brand-600"} size={22} />
                  <span className="mt-3 block text-sm font-black">{plan.name}</span>
                  <span className={`mt-1 block text-sm font-bold ${promotion === plan.id ? "text-brand-100" : "text-brand-700"}`}>{plan.price}</span>
                  <span className={`mt-2 block text-xs leading-5 ${promotion === plan.id ? "text-gray-200" : "text-gray-500"}`}>{plan.description}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden shadow-soft">
            <div className="aspect-[4/5] bg-gray-100">
              {previews[0] ? (
                <img className="h-full w-full object-cover" src={previews[0].url} alt="Capa do anuncio" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <Upload size={36} />
                  <span className="mt-2 text-sm font-bold">Capa do anuncio</span>
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <p className="line-clamp-2 min-h-10 text-base font-black text-gray-950">{form.title || "Titulo do produto"}</p>
              <p className="text-xl font-black text-gray-950">{form.price ? `${Number(form.price).toLocaleString("pt-MZ")} MT` : "Preco MT"}</p>
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={16} />
                {[form.neighborhood, form.city].filter(Boolean).join(", ") || "Localizacao"}
              </p>
              {selectedCategory ? <p className="text-xs font-black uppercase tracking-[0.12em] text-brand-700">{selectedCategory.name}</p> : null}
            </div>
          </Card>

          <Card className="p-4 shadow-soft">
            <h2 className="text-base font-black text-gray-950">Checklist do anuncio</h2>
            <div className="mt-3 space-y-2">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2">
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  <CheckCircle2 className={item.done ? "text-brand-600" : "text-gray-300"} size={18} />
                </div>
              ))}
            </div>
          </Card>

          {errorMessage ? (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert" aria-live="polite">
              <AlertCircle className="mt-0.5 shrink-0" size={17} />
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <Button className="w-full" type="submit" disabled={create.isPending}>
            <Camera size={18} />
            {create.isPending ? "A publicar..." : "Publicar anuncio"}
          </Button>
          <p className="text-center text-xs text-gray-500">
            Ao publicar, confirma que o produto e as fotografias respeitam as regras do NhongAqui.
          </p>
        </aside>
      </form>
    </Shell>
  );
}

export function FavoritesPage() {
  const queryClient = useQueryClient();
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Favorite>>("/favorites/"))
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest(`/favorites/${id}/`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] })
  });
  return (
    <Shell>
      <h1 className="mb-5 text-2xl font-bold">Favoritos</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {(favorites.data ?? []).map((favorite) => (
          <Card key={favorite.id} className="flex overflow-hidden">
            <img
              className="h-32 w-32 object-cover"
              src={productImage(favorite.product)}
              alt={favorite.product.title}
              onError={(event) => {
                event.currentTarget.src = fallbackImage(favorite.product.id);
              }}
            />
            <div className="flex flex-1 flex-col justify-between p-4">
              <Link to={`/produto/${favorite.product.slug}`} className="font-semibold">{favorite.product.title}</Link>
              <PriceDisplay value={favorite.product.price} />
              <Button variant="ghost" onClick={() => void remove.mutate(favorite.id)}>Remover</Button>
            </div>
          </Card>
        ))}
      </div>
    </Shell>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const products = useQuery({
    queryKey: ["admin-products"],
    enabled: Boolean(user?.is_staff),
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/?page_size=48&ordering=-created_at"))
  });
  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: Boolean(user?.is_staff),
    queryFn: async () => normalizePage(await apiRequest<Paginated<User>>("/users/?page_size=48"))
  });
  const deleteProduct = useMutation({
    mutationFn: (slug: string) => apiRequest(`/products/${slug}/`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
  });
  const deactivateUser = useMutation({
    mutationFn: (id: number) => apiRequest(`/users/${id}/`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });
  const activeProducts = products.data?.filter((product) => product.status === "active").length ?? 0;
  const featuredProducts = products.data?.filter((product) => product.featured).length ?? 0;
  const stats: { label: string; value: number; icon: LucideIcon }[] = [
    { label: "Anuncios ativos", value: activeProducts, icon: Package },
    { label: "Anuncios destacados", value: featuredProducts, icon: Sparkles },
    { label: "Contas visiveis", value: users.data?.length ?? 0, icon: Users }
  ];

  useEffect(() => setSeo("Admin", "Painel de administracao do NhongAqui."), []);

  if (!user?.is_staff) {
    return (
      <Shell narrow>
        <Card className="p-6 text-center shadow-soft">
          <ShieldCheck className="mx-auto text-gray-400" size={34} />
          <h1 className="mt-3 text-2xl font-black text-gray-950">Acesso reservado</h1>
          <p className="mt-2 text-sm text-gray-600">Entre com uma conta admin para gerir anuncios, contas e moderacao.</p>
          <Link to="/login" className="mt-5 inline-flex">
            <Button>Entrar como admin</Button>
          </Link>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 rounded-xl bg-white p-5 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">Administracao</p>
        <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Painel Admin</h1>
        <p className="mt-1 text-sm text-gray-600">Gerir anuncios, contas e atividade da plataforma.</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center gap-3 p-4 shadow-soft">
            <span className="flex size-11 items-center justify-center rounded-md bg-gray-950 text-white">
              <Icon size={20} />
            </span>
            <span>
              <span className="block text-2xl font-black text-gray-950">{value}</span>
              <span className="text-sm font-bold text-gray-500">{label}</span>
            </span>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <Card className="overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-black text-gray-950">Anuncios</h2>
            <span className="text-sm font-bold text-gray-500">{products.data?.length ?? 0} nesta pagina</span>
          </div>
          <div className="divide-y divide-gray-100">
            {products.isLoading ? (
              <p className="p-4 text-sm text-gray-500">A carregar anuncios...</p>
            ) : products.data?.length ? (
              products.data.map((product) => (
                <div key={product.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <Link to={`/produto/${product.slug}`} className="font-black text-gray-950 hover:text-brand-700">{product.title}</Link>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                      <span>{Number(product.price).toLocaleString("pt-MZ")} MT</span>
                      <span>{product.city}</span>
                      <span className="font-bold text-gray-700">{product.status}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deleteProduct.isPending}
                    onClick={() => {
                      if (window.confirm(`Apagar o anuncio "${product.title}"?`)) {
                        void deleteProduct.mutate(product.slug);
                      }
                    }}
                  >
                    <Trash2 size={17} />
                    Apagar
                  </Button>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">Sem anuncios para mostrar.</p>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden shadow-soft">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-black text-gray-950">Contas</h2>
            <span className="text-sm font-bold text-gray-500">{users.data?.length ?? 0} nesta pagina</span>
          </div>
          <div className="divide-y divide-gray-100">
            {users.isLoading ? (
              <p className="p-4 text-sm text-gray-500">A carregar contas...</p>
            ) : users.data?.length ? (
              users.data.map((account) => (
                <div key={account.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-black text-gray-950">{account.full_name}</p>
                    <p className="text-sm text-gray-500">{account.email ?? "Sem email visivel"}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">{account.is_staff ? "Admin" : account.account_type}</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={deactivateUser.isPending || account.id === user.id}
                    onClick={() => {
                      if (window.confirm(`Desativar a conta "${account.full_name}"?`)) {
                        void deactivateUser.mutate(account.id);
                      }
                    }}
                  >
                    <Trash2 size={17} />
                    Desativar
                  </Button>
                </div>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500">Sem contas para mostrar.</p>
            )}
          </div>
        </Card>
      </div>
    </Shell>
  );
}

export function MessagesPage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Conversation>>("/conversations/"))
  });
  const selected = conversations.data?.find((item) => String(item.id) === params.get("conversation")) ?? conversations.data?.[0];
  const send = useMutation({
    mutationFn: () => apiRequest("/messages/", { method: "POST", body: JSON.stringify({ conversation_id: selected?.id, content }) }),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });
  return (
    <Shell>
      <h1 className="mb-5 text-2xl font-bold">Mensagens</h1>
      <div className="grid min-h-[520px] gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-2">
          {(conversations.data ?? []).map((conversation) => (
            <button key={conversation.id} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left shadow-soft" onClick={() => setParams({ conversation: String(conversation.id) })}>
              <span className="block font-semibold">{conversation.product.title}</span>
              <span className="text-sm text-gray-500">{conversation.messages.at(-1)?.content ?? "Sem mensagens ainda"}</span>
            </button>
          ))}
        </aside>
        <Card className="flex flex-col p-4">
          {selected ? (
            <>
              <h2 className="border-b border-gray-200 pb-3 font-semibold">{selected.product.title}</h2>
              <div className="flex-1 space-y-3 overflow-auto py-4">
                {selected.messages.map((message) => (
                  <div key={message.id} className="rounded-lg bg-gray-100 p-3">
                    <p className="text-sm font-semibold">{message.sender.full_name}</p>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void send.mutate(); }}>
                <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Escreva uma mensagem" />
                <Button type="submit"><MessageCircle size={18} /></Button>
              </form>
            </>
          ) : (
            <EmptyState title="Sem conversas" text="Contacte um vendedor a partir de um anuncio." />
          )}
        </Card>
      </div>
    </Shell>
  );
}

export function ProfilePage() {
  const { refreshMe, logout } = useAuth();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => apiRequest<User>("/profile/") });
  const [form, setForm] = useState<Partial<User>>({});
  useEffect(() => {
    if (profile.data) setForm(profile.data);
  }, [profile.data]);
  const save = useMutation({
    mutationFn: () => apiRequest<User>("/profile/", { method: "PATCH", body: JSON.stringify(form) }),
    onSuccess: async () => {
      await refreshMe();
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });
  return (
    <Shell narrow>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <Button variant="secondary" onClick={() => void logout()}>Sair</Button>
      </div>
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void save.mutate(); }}>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Nome" value={form.first_name ?? ""} onChange={(event) => setForm({ ...form, first_name: event.target.value })} />
          <Input placeholder="Apelido" value={form.last_name ?? ""} onChange={(event) => setForm({ ...form, last_name: event.target.value })} />
        </div>
        <Input placeholder="Telefone" value={form.phone ?? ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Provincia" value={form.province ?? ""} onChange={(event) => setForm({ ...form, province: event.target.value })} />
          <Input placeholder="Cidade" value={form.city ?? ""} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        </div>
        <Input placeholder="Bairro" value={form.neighborhood ?? ""} onChange={(event) => setForm({ ...form, neighborhood: event.target.value })} />
        <Button type="submit">Guardar</Button>
      </form>
      <div className="mt-5 flex gap-3">
        <Link to="/vendas"><Button variant="secondary">Minhas vendas</Button></Link>
        <Link to="/vender"><Button>Vender agora</Button></Link>
      </div>
    </Shell>
  );
}

type ListingDraft = {
  title: string;
  description: string;
  category: string;
  price: string;
  negotiable: boolean;
  condition: string;
  province: string;
  city: string;
  neighborhood: string;
};

function ListingEditForm({
  product,
  categories,
  onCancel,
  onSaved
}: {
  product: Product;
  categories: Category[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<ListingDraft>({
    title: product.title,
    description: product.description,
    category: String(product.category),
    price: String(product.price),
    negotiable: product.negotiable,
    condition: product.condition,
    province: product.province,
    city: product.city,
    neighborhood: product.neighborhood
  });
  const [files, setFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );
  const visibleImages = product.images.filter((image) => !removedImageIds.includes(image.id));
  const availableSlots = Math.max(0, maxProductImages - visibleImages.length - files.length);
  const save = useMutation({
    mutationFn: () => {
      const data = new FormData();
      Object.entries(draft).forEach(([key, value]) => data.append(key, String(value)));
      removedImageIds.forEach((imageId) => data.append("delete_image_ids", String(imageId)));
      files.forEach((file) => data.append("uploaded_images", file));
      return apiRequest<Product>(`/products/${product.slug}/`, { method: "PATCH", body: data });
    },
    onSuccess: onSaved
  });

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  return (
    <Card className="space-y-4 p-4 shadow-soft">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-950">Editar anuncio</h2>
          <p className="mt-1 text-sm text-gray-500">Atualize preco, descricao, localizacao e acrescente fotografias.</p>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X size={17} />
          Fechar
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
        <div>
          <img
            className="aspect-square w-full rounded-lg object-cover"
            src={productImage(product)}
            alt={product.title}
            onError={(event) => {
              event.currentTarget.src = fallbackImage(product.id);
            }}
          />
          <p className="mt-2 text-xs font-bold text-gray-500">{visibleImages.length + files.length}/{maxProductImages} fotos apos guardar</p>
        </div>
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <Input required placeholder="Titulo" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <Select required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
              {(categories.length ? categories : [product.category_detail].filter(Boolean) as Category[]).map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
          </div>
          <Textarea required placeholder="Descricao" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            <Input required inputMode="decimal" type="number" placeholder="Preco MT" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
            <Select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value })}>
              {Object.entries(conditionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
            <label className="flex min-h-11 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-gray-700">
              <input type="checkbox" checked={draft.negotiable} onChange={(event) => setDraft({ ...draft, negotiable: event.target.checked })} />
              Preco negociavel
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Provincia" value={draft.province} onChange={(event) => setDraft({ ...draft, province: event.target.value })} />
            <Input required placeholder="Cidade" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} />
            <Input placeholder="Bairro" value={draft.neighborhood} onChange={(event) => setDraft({ ...draft, neighborhood: event.target.value })} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="font-black text-gray-950">Fotografias do anuncio</p>
            <p className="text-sm text-gray-500">
              Remova antigas ou adicione novas. Pode adicionar mais {availableSlots} foto{availableSlots === 1 ? "" : "s"}.
            </p>
          </div>
          <label className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-bold transition ${availableSlots ? "bg-gray-950 text-white hover:bg-brand-700" : "cursor-not-allowed bg-gray-200 text-gray-500"}`}>
            <ImagePlus size={17} />
            Adicionar fotos
            <input
              className="sr-only"
              type="file"
              multiple
              accept="image/*"
              disabled={!availableSlots}
              onChange={(event) => {
                setFiles((current) => [...current, ...Array.from(event.target.files ?? [])].slice(0, maxProductImages - visibleImages.length));
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {removedImageIds.length ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <span>{removedImageIds.length} foto{removedImageIds.length === 1 ? "" : "s"} marcada{removedImageIds.length === 1 ? "" : "s"} para remover.</span>
            <button
              className="font-black hover:text-amber-950"
              type="button"
              onClick={() => {
                setRemovedImageIds([]);
                setFiles((current) => current.slice(0, Math.max(0, maxProductImages - product.images.length)));
              }}
            >
              Desfazer
            </button>
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
          {visibleImages.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-md bg-white">
              <img
                className="aspect-square w-full object-cover"
                src={image.image}
                alt={product.title}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage(product.id);
                }}
              />
              {image.is_primary ? (
                <span className="absolute left-1 top-1 rounded bg-gray-950 px-1.5 py-0.5 text-[10px] font-black text-white">Capa</span>
              ) : null}
              <button
                className="absolute bottom-1 right-1 inline-flex min-h-8 items-center gap-1 rounded-md bg-red-600 px-2 text-xs font-black text-white shadow-soft transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={() => setRemovedImageIds((current) => [...new Set([...current, image.id])])}
              >
                <Trash2 size={14} />
                Remover
              </button>
            </div>
          ))}
          {previews.map((preview) => (
            <div key={`${preview.file.name}-${preview.file.lastModified}`} className="relative">
              <img className="aspect-square rounded-md object-cover" src={preview.url} alt={preview.file.name} />
              <span className="absolute left-1 top-1 rounded bg-brand-700 px-1.5 py-0.5 text-[10px] font-black text-white">Nova</span>
              <button
                className="absolute bottom-1 right-1 inline-flex min-h-8 items-center gap-1 rounded-md bg-gray-950 px-2 text-xs font-black text-white shadow-soft transition hover:bg-red-600"
                type="button"
                onClick={() => setFiles((current) => current.filter((file) => file !== preview.file))}
              >
                <X size={14} />
                Tirar
              </button>
            </div>
          ))}
        </div>
      </div>

      {save.error instanceof Error ? (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
          <AlertCircle className="mt-0.5 shrink-0" size={17} />
          <span>{save.error.message}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="button" disabled={save.isPending} onClick={() => void save.mutate()}>
          {save.isPending ? "A guardar..." : "Guardar alteracoes"}
        </Button>
      </div>
    </Card>
  );
}

function ConversationPreview({ conversation }: { conversation: Conversation }) {
  const lastMessage = conversation.messages.at(-1);
  const lastDate = conversation.last_message_at
    ? new Intl.DateTimeFormat("pt-MZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(conversation.last_message_at))
    : null;

  return (
    <div className="grid gap-2 rounded-md border border-gray-200 bg-white p-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-black text-gray-950">{conversation.buyer.full_name || "Comprador"}</p>
          {lastDate ? <span className="text-xs font-bold text-gray-400">{lastDate}</span> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{lastMessage?.content ?? "Ainda sem mensagens nesta conversa."}</p>
      </div>
      <Link
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-950/15 bg-white px-3 text-sm font-bold text-gray-950 transition hover:border-gray-950"
        to={`/mensagens?conversation=${conversation.id}`}
      >
        <MessageCircle size={16} />
        Abrir
      </Link>
    </div>
  );
}

function ProductMessagesPanel({
  conversations,
  isLoading
}: {
  conversations: Conversation[];
  isLoading: boolean;
}) {
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-black text-gray-950">Mensagens deste produto</p>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
            {conversations.length} conversa{conversations.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link className="text-sm font-bold text-gray-600 hover:text-brand-700" to="/mensagens">
          Ver mensagens
        </Link>
      </div>
      {isLoading ? (
        <p className="rounded-md bg-white p-3 text-sm text-gray-500">A carregar mensagens...</p>
      ) : conversations.length ? (
        <div className="space-y-2">
          {conversations.slice(0, 3).map((conversation) => (
            <ConversationPreview key={conversation.id} conversation={conversation} />
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-white p-3 text-sm text-gray-500">Ainda nao recebeu mensagens de compradores para este produto.</p>
      )}
    </div>
  );
}

export function MyListingsPage() {
  const queryClient = useQueryClient();
  const categories = useCategories();
  const [editingId, setEditingId] = useState<number | null>(null);
  const products = useQuery({
    queryKey: ["my-products"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/mine/"))
  });
  const conversations = useQuery({
    queryKey: ["seller-conversations"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Conversation>>("/conversations/"))
  });
  const sellerProductIds = useMemo(() => new Set((products.data ?? []).map((product) => product.id)), [products.data]);
  const sellerConversations = useMemo(
    () => (conversations.data ?? []).filter((conversation) => sellerProductIds.has(conversation.product.id)),
    [conversations.data, sellerProductIds]
  );
  const conversationsByProduct = useMemo(() => {
    const grouped = new Map<number, Conversation[]>();
    sellerConversations.forEach((conversation) => {
      const items = grouped.get(conversation.product.id) ?? [];
      grouped.set(conversation.product.id, [...items, conversation]);
    });
    return grouped;
  }, [sellerConversations]);
  const action = useMutation({
    mutationFn: ({ slug, next }: { slug: string; next: "mark_reserved" | "mark_sold" }) => apiRequest(`/products/${slug}/${next}/`, { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-products"] });
      await queryClient.invalidateQueries({ queryKey: ["seller-conversations"] });
    }
  });
  return (
    <Shell>
      <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow-soft md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-brand-700">Vendedor</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Minhas vendas</h1>
          <p className="mt-1 text-sm text-gray-600">Veja os seus produtos, edite o anuncio e responda aos compradores interessados.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-gray-500">
            <span className="rounded-full bg-gray-100 px-3 py-1">{products.data?.length ?? 0} produtos publicados</span>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-brand-700">{sellerConversations.length} conversas recebidas</span>
          </div>
        </div>
        <Link to="/vender">
          <Button>
            <Camera size={18} />
            Novo anuncio
          </Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {products.isLoading ? <p className="text-sm text-gray-500">A carregar os seus anuncios...</p> : null}
        {(products.data ?? []).map((product) => (
          editingId === product.id ? (
            <ListingEditForm
              key={product.id}
              product={product}
              categories={categories.data ?? []}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                void queryClient.invalidateQueries({ queryKey: ["my-products"] });
                void queryClient.invalidateQueries({ queryKey: ["seller-conversations"] });
              }}
            />
          ) : (
            <Card key={product.id} className="grid gap-4 p-4 shadow-soft lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-start">
              <img
                className="h-44 w-full rounded-md object-cover lg:h-40"
                src={productImage(product)}
                alt={product.title}
                onError={(event) => {
                  event.currentTarget.src = fallbackImage(product.id);
                }}
              />
              <div className="min-w-0">
                <Link to={`/produto/${product.slug}`} className="text-lg font-black text-gray-950 hover:text-brand-700">{product.title}</Link>
                <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                  <span>{product.status}</span>
                  <span>{product.images.length} foto{product.images.length === 1 ? "" : "s"}</span>
                  <span>{product.city}</span>
                </div>
                <p className="mt-2 text-xl"><PriceDisplay value={product.price} /></p>
                <ProductMessagesPanel
                  conversations={conversationsByProduct.get(product.id) ?? []}
                  isLoading={conversations.isLoading}
                />
              </div>
              <div className="flex flex-wrap gap-2 lg:max-w-44 lg:flex-col lg:items-stretch">
                <Button variant="secondary" onClick={() => setEditingId(product.id)}>
                  Editar
                </Button>
                <Button variant="secondary" onClick={() => void action.mutate({ slug: product.slug, next: "mark_reserved" })}>Reservar</Button>
                <Button onClick={() => void action.mutate({ slug: product.slug, next: "mark_sold" })}>Vendido</Button>
              </div>
            </Card>
          )
        ))}
        {!products.isLoading && !products.data?.length ? (
          <EmptyState title="Ainda nao tem anuncios" text="Publique o primeiro produto para comecar a vender." />
        ) : null}
      </div>
    </Shell>
  );
}

export function SellerPage() {
  const { id = "" } = useParams();
  const seller = useQuery({ queryKey: ["seller", id], queryFn: () => apiRequest<User>(`/users/${id}/`) });
  const products = useProducts({ seller: id, page_size: 8 });
  return (
    <Shell>
      <Card className="mb-6 p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-md bg-gray-100"><UserRound /></span>
          <div>
            <h1 className="text-2xl font-bold">{seller.data?.seller_profile?.display_name ?? seller.data?.full_name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <VerifiedBadge verified={seller.data?.seller_profile?.verified} />
              <ReviewStars rating={Number(seller.data?.seller_profile?.rating_average ?? 0)} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-700">{seller.data?.seller_profile?.bio}</p>
      </Card>
      <h2 className="mb-4 text-xl font-bold">Anuncios do vendedor</h2>
      {products.data?.length ? <ProductGrid products={products.data} /> : <EmptyState title="Sem anuncios" text="Este vendedor ainda nao tem anuncios ativos." />}
    </Shell>
  );
}

function AuthBox({ mode }: { mode: "login" | "register" }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    city: "Maputo"
  });
  const submit = useMutation({
    mutationFn: () => mode === "login" ? auth.login(form.email, form.password) : auth.register(form),
    onSuccess: () => navigate("/perfil")
  });
  const errorMessage = submit.error instanceof Error ? submit.error.message : null;
  return (
    <Shell narrow>
      <Card className="p-5">
        <h1 className="mb-5 text-2xl font-bold">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void submit.mutate(); }}>
          {mode === "register" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input required autoComplete="given-name" placeholder="Nome" value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} />
              <Input required autoComplete="family-name" placeholder="Apelido" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} />
            </div>
          ) : null}
          <Input required autoComplete="email" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <div>
            <Input
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              type="password"
              placeholder="Palavra-passe"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            {mode === "register" ? (
              <p className="mt-1.5 text-xs text-gray-500">
                Use pelo menos 8 caracteres com letras, numeros e simbolos. Evite 12345678.
              </p>
            ) : null}
          </div>
          {mode === "register" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Input autoComplete="tel" inputMode="tel" placeholder="Telefone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <Input autoComplete="address-level2" placeholder="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
            </div>
          ) : null}
          {errorMessage ? (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert" aria-live="polite">
              <AlertCircle className="mt-0.5 shrink-0" size={17} />
              <span>{errorMessage}</span>
            </div>
          ) : null}
          <Button className="w-full" type="submit" disabled={submit.isPending}>
            {submit.isPending ? (mode === "login" ? "A entrar..." : "A registar...") : (mode === "login" ? "Entrar" : "Registar")}
          </Button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          {mode === "login" ? <Link to="/registar" className="font-semibold text-brand-600">Criar conta</Link> : <Link to="/login" className="font-semibold text-brand-600">Ja tenho conta</Link>}
          <Link to="/esqueci-password" className="ml-4 text-gray-500">Esqueci a password</Link>
        </div>
      </Card>
    </Shell>
  );
}

export function LoginPage() {
  return <AuthBox mode="login" />;
}

export function RegisterPage() {
  return <AuthBox mode="register" />;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const reset = useMutation({ mutationFn: () => apiRequest("/auth/password-reset/", { method: "POST", body: JSON.stringify({ email }) }) });
  return (
    <Shell narrow>
      <Card className="p-5">
        <h1 className="mb-4 text-2xl font-bold">Recuperar palavra-passe</h1>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void reset.mutate(); }}>
          <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button type="submit">Enviar instrucoes</Button>
        </form>
      </Card>
    </Shell>
  );
}

export function ResetPasswordPage() {
  const [form, setForm] = useState({ uid: "", token: "", new_password: "" });
  const reset = useMutation({ mutationFn: () => apiRequest("/auth/password-reset/confirm/", { method: "POST", body: JSON.stringify(form) }) });
  return (
    <Shell narrow>
      <Card className="p-5">
        <h1 className="mb-4 text-2xl font-bold">Redefinir palavra-passe</h1>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void reset.mutate(); }}>
          <Input placeholder="UID" value={form.uid} onChange={(event) => setForm({ ...form, uid: event.target.value })} />
          <Input placeholder="Token" value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} />
          <Input type="password" placeholder="Nova palavra-passe" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} />
          <Button type="submit">Guardar nova palavra-passe</Button>
        </form>
      </Card>
    </Shell>
  );
}

export function InfoPage({ title, legal = false }: { title: string; legal?: boolean }) {
  useEffect(() => setSeo(title, `${title} - NhongAqui`), [title]);
  return (
    <Shell narrow>
      <h1 className="mb-4 text-3xl font-bold">{title}</h1>
      <div className="space-y-4 rounded-lg bg-white p-5 text-gray-700 shadow-soft">
        <p>NhongAqui e um marketplace digital criado para ajudar compradores e vendedores em Mocambique a encontrarem oportunidades com mais confianca.</p>
        {legal ? (
          <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">Texto provisorio. Requer revisao juridica antes do lancamento publico.</p>
        ) : (
          <p>A plataforma prioriza pesquisa rapida, anuncios com fotografias, contacto direto e moderacao responsavel.</p>
        )}
      </div>
    </Shell>
  );
}
