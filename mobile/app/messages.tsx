import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, Text } from "react-native";

import { apiRequest, normalizePage } from "../src/api/client";
import type { Conversation, Paginated } from "../src/api/types";
import { Card, Screen, styles } from "../src/components/ui";

export default function MessagesScreen() {
  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Conversation>>("/conversations/"))
  });
  return (
    <Screen>
      <Text style={styles.title}>Mensagens</Text>
      <FlatList
        data={conversations.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/conversation/${item.id}`)}>
            <Card>
              <Text style={{ fontWeight: "800" }}>{item.product.title}</Text>
              <Text style={styles.muted}>{item.messages.at(-1)?.content ?? "Sem mensagens ainda"}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
