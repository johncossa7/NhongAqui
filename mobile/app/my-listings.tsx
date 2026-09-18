import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Edit3, MessageCircle, Trash2 } from "lucide-react-native";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../src/api/client";
import type { Conversation, Paginated, Product } from "../src/api/types";
import { AuthGate } from "../src/components/AuthGate";
import { Button, Card, EmptyState, ErrorMessage, Loading, Price, Screen, StatusBadge, colors, productImageSource, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

export default function MyListingsScreen() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const products = useQuery({
    queryKey: ["my-products"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/mine/")),
    enabled: isAuthenticated
  });
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Conversation>>("/conversations/")),
    enabled: isAuthenticated
  });
  const action = useMutation({
    mutationFn: ({ slug, next }: { slug: string; next: "mark_reserved" | "mark_sold" }) =>
      apiRequest("/products/" + slug + "/" + next + "/", { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-products"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
  const remove = useMutation({
    mutationFn: (slug: string) => apiRequest("/products/" + slug + "/", { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  function confirmDelete(product: Product) {
    Alert.alert("Eliminar anúncio?", product.title, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(product.slug) }
    ]);
  }

  return (
    <AuthGate message="Entre para gerir os seus anúncios.">
      <Screen>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={styles.title}>Os meus anúncios</Text>
          <Button title="Novo" compact onPress={() => router.push("/sell")} />
        </View>
        {products.isLoading ? <Loading label="A carregar os anúncios..." /> : null}
        <ErrorMessage error={products.error ?? action.error ?? remove.error} />
        {!products.isLoading && !products.data?.length ? (
          <EmptyState title="Ainda não publicou" text="O seu primeiro anúncio pode ficar pronto em poucos minutos." action={<Button title="Publicar anúncio" onPress={() => router.push("/sell")} />} />
        ) : null}
        <FlatList
          data={products.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshing={products.isFetching}
          onRefresh={() => void products.refetch()}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const productConversations = (conversations.data ?? []).filter((conversation) => conversation.product.id === item.id);
            const unread = productConversations.reduce((count, conversation) => count + conversation.unread_count, 0);
            return (
              <Card>
                <Pressable onPress={() => router.push(("/product/" + item.slug) as never)} style={{ flexDirection: "row", gap: 12 }}>
                  <Image source={productImageSource(item)} style={{ width: 104, height: 104, borderRadius: 8, backgroundColor: colors.cream }} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <StatusBadge value={item.status} />
                    <Text numberOfLines={2} style={{ fontWeight: "900", color: colors.text }}>{item.title}</Text>
                    <Price value={item.price} />
                    <Text style={styles.muted}>{item.images.length} foto(s) · {item.views_count} visualizações</Text>
                  </View>
                </Pressable>
                <View style={styles.row}>
                  <Button title="Editar" compact variant="secondary" icon={<Edit3 color={colors.brand} size={16} />} style={{ flex: 1 }} onPress={() => router.push(("/edit-listing/" + item.slug) as never)} />
                  <Button title="Eliminar" compact variant="ghost" icon={<Trash2 color={colors.red} size={16} />} style={{ flex: 1 }} onPress={() => confirmDelete(item)} />
                </View>
                {productConversations.length ? (
                  <Button title={unread ? "Mensagens (" + unread + " novas)" : "Ver " + productConversations.length + " conversa(s)"} compact variant="ghost" icon={<MessageCircle color={colors.brand} size={17} />} onPress={() => router.push({ pathname: "/messages", params: { product: String(item.id) } })} />
                ) : <Text style={styles.muted}>Ainda não recebeu mensagens para este produto.</Text>}
                {item.status === "active" ? <Button title="Marcar como reservado" compact variant="secondary" onPress={() => action.mutate({ slug: item.slug, next: "mark_reserved" })} /> : null}
                {item.status !== "sold" ? <Button title="Marcar como vendido" compact onPress={() => action.mutate({ slug: item.slug, next: "mark_sold" })} /> : null}
              </Card>
            );
          }}
        />
      </Screen>
    </AuthGate>
  );
}
