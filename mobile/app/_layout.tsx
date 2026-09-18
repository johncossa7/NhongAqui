import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "../src/components/ui";
import { AuthProvider } from "../src/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15000 }, mutations: { retry: 0 } }
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerStyle: { backgroundColor: colors.white }, headerShadowVisible: false, headerTintColor: colors.text }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[slug]" options={{ title: "Produto" }} />
          <Stack.Screen name="seller/[id]" options={{ title: "Vendedor" }} />
          <Stack.Screen name="messages" options={{ title: "Mensagens" }} />
          <Stack.Screen name="conversation/[id]" options={{ title: "Conversa" }} />
          <Stack.Screen name="notifications" options={{ title: "Notificações" }} />
          <Stack.Screen name="login" options={{ title: "Entrar" }} />
          <Stack.Screen name="register" options={{ title: "Criar conta" }} />
          <Stack.Screen name="edit-profile" options={{ title: "Editar perfil" }} />
          <Stack.Screen name="change-password" options={{ title: "Alterar palavra-passe" }} />
          <Stack.Screen name="delete-account" options={{ title: "Eliminar conta" }} />
          <Stack.Screen name="verification" options={{ title: "Verificação" }} />
          <Stack.Screen name="my-listings" options={{ title: "Os meus anúncios" }} />
          <Stack.Screen name="edit-listing/[slug]" options={{ title: "Editar anúncio" }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
