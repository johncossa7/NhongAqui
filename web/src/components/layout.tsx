import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, Home, MessageCircle, Package, PlusCircle, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import brandIcon from "../assets/branding/NhongAqui_Icon.png";
import { apiRequest, normalizePage } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Notification, Paginated } from "../types";
import { Button } from "./ui";

function useNotificationFeed(enabled: boolean) {
  return useQuery({
    queryKey: ["notifications"],
    enabled,
    queryFn: async () => normalizePage(await apiRequest<Paginated<Notification>>("/notifications/?page_size=8")),
    refetchInterval: enabled ? 8_000 : false
  });
}

function useNotificationSummary(enabled: boolean) {
  return useQuery({
    queryKey: ["notifications", "summary"],
    enabled,
    queryFn: () => apiRequest<{ unread_count: number }>("/notifications/summary/"),
    refetchInterval: enabled ? 8_000 : false
  });
}

function useUnreadMessages(enabled: boolean) {
  return useQuery({
    queryKey: ["unread-messages"],
    enabled,
    queryFn: () => apiRequest<{ count: number }>("/conversations/unread-count/"),
    refetchInterval: enabled ? 8_000 : false
  });
}

function CountBadge({ value }: { value: number }) {
  if (!value) return null;
  return (
    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-black text-white">
      {value > 99 ? "99+" : value}
    </span>
  );
}

function NotificationCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const feed = useNotificationFeed(Boolean(user));
  const summary = useNotificationSummary(Boolean(user));
  const markRead = useMutation({
    mutationFn: (id: number) => apiRequest(`/notifications/${id}/mark-read/`, { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
  const markAllRead = useMutation({
    mutationFn: () => apiRequest("/notifications/mark-all-read/", { method: "POST" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  if (!user) return null;
  return (
    <div className="relative">
      <button
        type="button"
        title="Notificacoes"
        aria-label="Abrir notificacoes"
        className="relative flex size-11 items-center justify-center rounded-full text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={20} />
        <CountBadge value={summary.data?.unread_count ?? 0} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-gray-200 bg-white text-left shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="font-black text-gray-950">Notificacoes</p>
            <button type="button" className="text-xs font-bold text-brand-700" onClick={() => void markAllRead.mutate()}>
              Marcar lidas
            </button>
          </div>
          <div className="max-h-96 divide-y divide-gray-100 overflow-auto">
            {(feed.data ?? []).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`block w-full px-4 py-3 text-left transition hover:bg-brand-50 ${item.read_at ? "bg-white" : "bg-green-50"}`}
                onClick={() => {
                  if (!item.read_at) void markRead.mutate(item.id);
                  setOpen(false);
                  navigate(item.target_url || "/notificacoes");
                }}
              >
                <span className="block text-sm font-black text-gray-950">{item.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs text-gray-600">{item.body}</span>
              </button>
            ))}
            {!feed.data?.length ? <p className="p-4 text-sm text-gray-500">Ainda nao tem notificacoes.</p> : null}
          </div>
          <Link className="block border-t border-gray-100 px-4 py-3 text-center text-sm font-black text-brand-700" to="/notificacoes" onClick={() => setOpen(false)}>
            Ver todas
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function LiveNotificationAlert() {
  const { user } = useAuth();
  const feed = useNotificationFeed(Boolean(user));
  const initialized = useRef(false);
  const latestId = useRef<number | null>(null);
  const [alert, setAlert] = useState<Notification | null>(null);

  useEffect(() => {
    initialized.current = false;
    latestId.current = null;
    setAlert(null);
  }, [user?.id]);

  useEffect(() => {
    if (!feed.data) return;
    const latest = feed.data[0];
    if (!initialized.current) {
      initialized.current = true;
      latestId.current = latest?.id ?? null;
      return;
    }
    if (latest && latest.id !== latestId.current && !latest.read_at) {
      latestId.current = latest.id;
      setAlert(latest);
      const timer = window.setTimeout(() => setAlert(null), 6_000);
      return () => window.clearTimeout(timer);
    }
  }, [feed.data]);

  if (!alert) return null;
  return (
    <div className="fixed right-4 top-20 z-50 flex w-[min(23rem,calc(100vw-2rem))] items-start gap-3 rounded-md border border-brand-200 bg-white p-4 shadow-2xl" role="status">
      <Bell className="mt-0.5 shrink-0 text-brand-700" size={20} />
      <Link className="min-w-0 flex-1" to={alert.target_url || "/notificacoes"} onClick={() => setAlert(null)}>
        <span className="block font-black text-gray-950">{alert.title}</span>
        <span className="mt-1 line-clamp-2 block text-sm text-gray-600">{alert.body}</span>
      </Link>
      <button type="button" aria-label="Fechar aviso" onClick={() => setAlert(null)}><X size={18} /></button>
    </div>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 font-black ${inverted ? "text-white" : "text-gray-950"}`}
      aria-label="NhongAqui"
    >
      <img className="size-10 shrink-0 rounded-full object-cover" src={brandIcon} alt="" />
      <span className="text-[1.05rem] uppercase tracking-[0.12em]">NhongAqui</span>
    </Link>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadMessages = useUnreadMessages(Boolean(user));
  const notificationSummary = useNotificationSummary(Boolean(user));
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.25rem] max-w-[1500px] items-center gap-4 px-4 lg:px-8">
        <Brand />
        {user ? (
          <Link className="relative ml-auto flex size-11 items-center justify-center rounded-full text-gray-700 md:hidden" to="/notificacoes" aria-label="Notificacoes">
            <Bell size={20} />
            <CountBadge value={notificationSummary.data?.unread_count ?? 0} />
          </Link>
        ) : null}
        <button
          className="hidden min-h-12 max-w-2xl flex-1 items-center gap-2 rounded-full border border-gray-200 bg-accent-cream px-4 text-left text-sm text-gray-500 transition hover:border-brand-600 hover:bg-white md:flex"
          onClick={() => navigate("/shop")}
        >
          <Search size={18} className="text-brand-600" />
          <span>Pesquisar telemoveis, moveis, consolas...</span>
        </button>
        <nav className="ml-auto hidden items-center gap-1.5 md:flex">
          <NavLink className="rounded-full px-3 py-2 text-sm font-black text-gray-700 transition hover:bg-brand-50 hover:text-brand-700" to="/shop">
            Categorias
          </NavLink>
          <NavLink className="rounded-full px-3 py-2 text-sm font-black text-gray-700 transition hover:bg-brand-50 hover:text-brand-700" to="/favoritos">
            Favoritos
          </NavLink>
          <NavLink className="relative rounded-full px-3 py-2 text-sm font-black text-gray-700 transition hover:bg-brand-50 hover:text-brand-700" to="/mensagens">
            Mensagens
            <CountBadge value={unreadMessages.data?.count ?? 0} />
          </NavLink>
          {user ? (
            <NavLink className="rounded-full px-3 py-2 text-sm font-black text-gray-700 transition hover:bg-brand-50 hover:text-brand-700" to="/vendas">
              Vendas
            </NavLink>
          ) : null}
          {user?.is_staff ? (
            <NavLink className="rounded-full px-3 py-2 text-sm font-black text-brand-700 transition hover:bg-brand-50 hover:text-brand-700" to="/admin">
              Admin
            </NavLink>
          ) : null}
          <NotificationCenter />
          <Button onClick={() => navigate("/vender")}>
            <PlusCircle size={18} />
            Vender
          </Button>
          {user ? (
            <Button variant="secondary" onClick={() => navigate("/perfil")}>
              <UserRound size={18} />
              Perfil
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate("/login")}>
              Entrar
            </Button>
          )}
          {user ? (
            <button className="px-2 text-sm text-gray-500 hover:text-gray-950" onClick={() => void logout()}>
              Sair
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function MobileNav() {
  const { user } = useAuth();
  const unreadMessages = useUnreadMessages(Boolean(user));
  const items = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/shop", label: "Pesquisar", icon: Search },
    { to: "/vender", label: "Vender", icon: PlusCircle, raised: true },
    user
      ? { to: "/mensagens", label: "Mensagens", icon: MessageCircle, badge: unreadMessages.data?.count ?? 0 }
      : { to: "/favoritos", label: "Favoritos", icon: Heart },
    user?.is_staff
      ? { to: "/admin", label: "Admin", icon: ShieldCheck }
      : user
        ? { to: "/vendas", label: "Vendas", icon: Package }
        : { to: "/perfil", label: "Perfil", icon: UserRound }
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-950/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 px-1 py-2 text-xs font-black transition ${
                item.raised ? "-mt-5 rounded-2xl bg-brand-600 py-3 text-white shadow-glow ring-2 ring-accent-yellow" : isActive ? "text-brand-700" : "text-gray-500"
              }`
            }
          >
            <item.icon size={20} />
            <CountBadge value={item.badge ?? 0} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-accent-ink bg-accent-ink text-white">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-10 text-sm text-gray-300 md:grid-cols-5 lg:grid-cols-[1.4fr_repeat(9,auto)] lg:px-8">
        <div>
          <Brand inverted />
          <p className="mt-3 text-gray-400">Encontre. Venda. Confie.</p>
        </div>
        {[
          ["Sobre", "/sobre"],
          ["Como funciona", "/como-funciona"],
          ["Seguranca", "/seguranca"],
          ["Ajuda", "/ajuda"],
          ["Contactos", "/contactos"],
          ["Anuncios", "/politica-de-anuncios"],
          ["Termos", "/termos"],
          ["Privacidade", "/privacidade"],
          ["Eliminar conta", "/eliminar-conta"]
        ].map(([label, to]) => (
          <Link key={to} to={to} className="font-bold hover:text-white">
            {label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-transparent safe-bottom md:pb-0">
      <Header />
      <LiveNotificationAlert />
      <Outlet />
      <Footer />
      <MobileNav />
    </div>
  );
}
