import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "../src/lib/auth";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[slug]" options={{ title: "Produto" }} />
          <Stack.Screen name="seller/[id]" options={{ title: "Vendedor" }} />
          <Stack.Screen name="messages" options={{ title: "Mensagens" }} />
          <Stack.Screen name="conversation/[id]" options={{ title: "Conversa" }} />
          <Stack.Screen name="login" options={{ title: "Entrar" }} />
          <Stack.Screen name="register" options={{ title: "Registar" }} />
          <Stack.Screen name="forgot-password" options={{ title: "Recuperar password" }} />
          <Stack.Screen name="edit-profile" options={{ title: "Editar perfil" }} />
          <Stack.Screen name="my-listings" options={{ title: "Meus anuncios" }} />
        </Stack>
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
