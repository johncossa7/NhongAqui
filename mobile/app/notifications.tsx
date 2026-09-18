import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Bell, CheckCheck } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../src/api/client";
import type { Notification, Paginated } from "../src/api/types";
import { AuthGate } from "../src/components/AuthGate";
import { Button, Card, EmptyState, ErrorMessage, Loading, Screen, colors, styles } from "../src/components/ui";
import { formatDate } from "../src/lib/products";
import { useAuth } from "../src/lib/auth";

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Notification>>("/notifications/")),
    refetchInterval: 30000,
    enabled: isAuthenticated
  });
  const mark = useMutation({
    mutationFn: (id: number) => apiRequest<Notification>("/notifications/" + id + "/mark-read/", { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    }
  });
  const markAll = useMutation({
    mutationFn: () => apiRequest("/notifications/mark-all-read/", { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    }
  });

  function openNotification(item: Notification) {
    if (!item.read_at) mark.mutate(item.id);
    const conversationId = item.data.conversation_id;
    if (typeof conversationId === "number" || typeof conversationId === "string") {
      router.push(("/conversation/" + conversationId) as never);
      return;
    }
    const productMatch = item.target_url.match(/\/produto\/([^/?]+)/);
    if (productMatch?.[1]) router.push(("/product/" + productMatch[1]) as never);
  }

  return (
    <AuthGate message="Entre para consultar as suas notificações.">
      <Screen>
        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={styles.title}>Notificações</Text>
          <Button title="Marcar lidas" compact variant="ghost" icon={<CheckCheck color={colors.brand} size={18} />} onPress={() => markAll.mutate()} />
        </View>
        {notifications.isLoading ? <Loading /> : null}
        <ErrorMessage error={notifications.error} />
        {!notifications.isLoading && !notifications.data?.length ? (
          <EmptyState title="Tudo em dia" text="As novas mensagens e alterações dos produtos aparecem aqui." />
        ) : null}
        <FlatList
          data={notifications.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshing={notifications.isFetching}
          onRefresh={() => void notifications.refetch()}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => openNotification(item)}>
              <Card style={!item.read_at ? { borderColor: colors.brand, backgroundColor: colors.brandSoft } : undefined}>
                <View style={styles.row}>
                  <Bell color={!item.read_at ? colors.brand : colors.muted} size={20} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={{ color: colors.text, fontWeight: "900" }}>{item.title}</Text>
                    <Text style={styles.muted}>{item.body}</Text>
                    <Text style={[styles.muted, { fontSize: 11 }]}>{formatDate(item.created_at)}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          )}
        />
      </Screen>
    </AuthGate>
  );
}
