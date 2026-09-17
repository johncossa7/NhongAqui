import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { AppLayout } from "./components/layout";
import { getTokens } from "./lib/api";
import {
  AdminPage,
  FavoritesPage,
  ForgotPasswordPage,
  HomePage,
  InfoPage,
  LoginPage,
  MessagesPage,
  MyListingsPage,
  ProductPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
  SellPage,
  SellerPage,
  ShopPage,
  VerifyEmailPage
} from "./pages";

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getTokens()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/produto/:slug", element: <ProductPage /> },
      { path: "/vender", element: <RequireAuth><SellPage /></RequireAuth> },
      { path: "/favoritos", element: <RequireAuth><FavoritesPage /></RequireAuth> },
      { path: "/mensagens", element: <RequireAuth><MessagesPage /></RequireAuth> },
      { path: "/perfil", element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: "/admin", element: <RequireAuth><AdminPage /></RequireAuth> },
      { path: "/editar-perfil", element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: "/vendas", element: <RequireAuth><MyListingsPage /></RequireAuth> },
      { path: "/meus-anuncios", element: <Navigate to="/vendas" replace /> },
      { path: "/vendedor/:id", element: <SellerPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/registar", element: <RegisterPage /> },
      { path: "/esqueci-password", element: <ForgotPasswordPage /> },
      { path: "/redefinir-password", element: <ResetPasswordPage /> },
      { path: "/verificar-email", element: <VerifyEmailPage /> },
      { path: "/sobre", element: <InfoPage title="Sobre" /> },
      { path: "/como-funciona", element: <InfoPage title="Como funciona" /> },
      { path: "/seguranca", element: <InfoPage title="Seguranca" /> },
      { path: "/ajuda", element: <InfoPage title="Ajuda" /> },
      { path: "/contactos", element: <InfoPage title="Contactos" /> },
      { path: "/termos", element: <InfoPage title="Termos e Condicoes" legal /> },
      { path: "/privacidade", element: <InfoPage title="Politica de Privacidade" legal /> }
    ]
  }
]);
