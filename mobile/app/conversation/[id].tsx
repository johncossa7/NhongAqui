import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";

import { apiRequest } from "../../src/api/client";
import type { Conversation } from "../../src/api/types";
import { Button, Card, Input, Screen, styles } from "../../src/components/ui";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const conversation = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => apiRequest<Conversation>(`/conversations/${id}/`),
    enabled: Boolean(id)
  });
  const send = useMutation({
    mutationFn: () => apiRequest("/messages/", {
      method: "POST",
      body: JSON.stringify({ conversation_id: Number(id), content })
    }),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  return (
    <Screen>
      <Text style={styles.title}>{conversation.data?.product.title ?? "Conversa"}</Text>
      <FlatList
        data={conversation.data?.messages ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800" }}>{item.sender.full_name}</Text>
            <Text>{item.content}</Text>
          </Card>
        )}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Input placeholder="Escreva uma mensagem" value={content} onChangeText={setContent} />
        </View>
        <Button title="Enviar" onPress={() => void send.mutate()} />
      </View>
    </Screen>
  );
}
