import { Heart, Home, PlusCircle, Search, UserRound } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import brandIcon from "../assets/branding/NhongAqui_Icon.png";
import { useAuth } from "../lib/auth";
import { Button } from "./ui";

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 font-black ${inverted ? "text-white" : "text-gray-950"}`}
      aria-label="NhongAqui"
    >
      <span className="flex size-10 items-center justify-center bg-white ring-1 ring-gray-950/15">
        <img className="size-8 object-contain" src={brandIcon} alt="" />
      </span>
      <span className="text-[1.05rem] uppercase tracking-[0.12em]">NhongAqui</span>
    </Link>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[1500px] items-center gap-4 px-4 lg:px-8">
        <Brand />
        <button
          className="hidden min-h-11 max-w-2xl flex-1 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-4 text-left text-sm text-gray-500 transition hover:border-gray-950 hover:bg-white md:flex"
          onClick={() => navigate("/shop")}
        >
          <Search size={18} className="text-brand-600" />
          <span>Pesquisar telemoveis, moveis, consolas...</span>
        </button>
        <nav className="ml-auto hidden items-center gap-1.5 md:flex">
          <NavLink className="rounded-md px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 hover:text-gray-950" to="/shop">
            Categorias
          </NavLink>
          <NavLink className="rounded-md px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 hover:text-gray-950" to="/favoritos">
            Favoritos
          </NavLink>
          <NavLink className="rounded-md px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-100 hover:text-gray-950" to="/mensagens">
            Mensagens
          </NavLink>
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
  const items = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/shop", label: "Pesquisar", icon: Search },
    { to: "/vender", label: "Vender", icon: PlusCircle, raised: true },
    { to: "/favoritos", label: "Favoritos", icon: Heart },
    { to: "/perfil", label: "Perfil", icon: UserRound }
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-950/10 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-1 py-2 text-xs font-black transition ${
                item.raised ? "-mt-5 bg-gray-950 py-3 text-white shadow-lift ring-2 ring-brand-500" : isActive ? "text-brand-700" : "text-gray-500"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-950 bg-gray-950 text-white">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-10 text-sm text-gray-300 md:grid-cols-[1.4fr_repeat(7,auto)] lg:px-8">
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
          ["Termos", "/termos"],
          ["Privacidade", "/privacidade"]
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
    <div className="flex min-h-screen flex-col bg-[#f6f7f5] safe-bottom md:pb-0">
      <Header />
      <Outlet />
      <Footer />
      <MobileNav />
    </div>
  );
}
