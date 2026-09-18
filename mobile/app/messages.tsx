import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../src/api/client";
import type { Conversation, Paginated } from "../src/api/types";
import { AuthGate } from "../src/components/AuthGate";
import { Card, EmptyState, ErrorMessage, Loading, Screen, colors, productImageSource, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";
import { formatDate } from "../src/lib/products";

export default function MessagesScreen() {
  const { product } = useLocalSearchParams<{ product?: string }>();
  const { user } = useAuth();
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Conversation>>("/conversations/")),
    refetchInterval: 15000,
    enabled: Boolean(user)
  });
  const visible = product ? (conversations.data ?? []).filter((item) => String(item.product.id) === product) : conversations.data ?? [];

  return (
    <AuthGate message="Entre para falar com compradores e vendedores.">
      <Screen>
        <Text style={styles.title}>Mensagens</Text>
        {conversations.isLoading ? <Loading /> : null}
        <ErrorMessage error={conversations.error} />
        {!conversations.isLoading && !visible.length ? <EmptyState title="Sem conversas" text="Quando contactar um vendedor ou receber uma mensagem, a conversa aparece aqui." /> : null}
        <FlatList
          data={visible}
          keyExtractor={(item) => String(item.id)}
          refreshing={conversations.isFetching}
          onRefresh={() => void conversations.refetch()}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => {
            const other = item.buyer.id === user?.id ? item.seller : item.buyer;
            const last = item.messages.at(-1);
            return (
              <Pressable onPress={() => router.push(("/conversation/" + item.id) as never)}>
                <Card style={item.unread_count ? { borderColor: colors.brand } : undefined}>
                  <View style={styles.row}>
                    <Image source={productImageSource(item.product)} style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: colors.cream }} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={[styles.row, { justifyContent: "space-between" }]}>
                        <Text style={{ flex: 1, color: colors.text, fontWeight: "900" }} numberOfLines={1}>{other.full_name}</Text>
                        {item.unread_count ? <View style={{ minWidth: 23, height: 23, borderRadius: 12, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.white, fontSize: 11, fontWeight: "900" }}>{item.unread_count}</Text></View> : null}
                      </View>
                      <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={1}>{item.product.title}</Text>
                      <Text style={styles.muted} numberOfLines={1}>{last?.content ?? "Conversa iniciada"}</Text>
                      <Text style={[styles.muted, { fontSize: 11 }]}>{formatDate(last?.created_at ?? item.last_message_at)}</Text>
                    </View>
                    <MessageCircle color={colors.brand} size={20} />
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      </Screen>
    </AuthGate>
  );
}
