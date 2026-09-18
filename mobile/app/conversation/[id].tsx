import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Send } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from "react-native";

import { apiRequest } from "../../src/api/client";
import type { Conversation } from "../../src/api/types";
import { AuthGate } from "../../src/components/AuthGate";
import { Button, ErrorMessage, Input, Loading, Screen, colors, styles } from "../../src/components/ui";
import { useAuth } from "../../src/lib/auth";
import { formatDate } from "../../src/lib/products";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const listRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();
  const conversation = useQuery({
    queryKey: ["conversation", id],
    queryFn: () => apiRequest<Conversation>("/conversations/" + id + "/"),
    enabled: Boolean(id && user),
    refetchInterval: 8000
  });
  const markRead = useMutation({
    mutationFn: () => apiRequest("/conversations/" + id + "/mark-read/", { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      void queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
      void queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    }
  });
  const send = useMutation({
    mutationFn: () => apiRequest("/messages/", { method: "POST", body: JSON.stringify({ conversation_id: Number(id), content: content.trim() }) }),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({ queryKey: ["conversation", id] });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    }
  });

  useEffect(() => {
    if (conversation.data?.unread_count) markRead.mutate();
  }, [conversation.data?.unread_count]);
  useEffect(() => {
    if (conversation.data?.messages.length) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [conversation.data?.messages.length]);

  const other = conversation.data && (conversation.data.buyer.id === user?.id ? conversation.data.seller : conversation.data.buyer);
  return (
    <AuthGate message="Entre para abrir esta conversa.">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <Screen>
          {conversation.isLoading ? <Loading /> : null}
          {conversation.data ? (
            <>
              <View>
                <Text style={styles.sectionTitle}>{conversation.data.product.title}</Text>
                <Text style={styles.muted}>Conversa com {other?.full_name}</Text>
              </View>
              <FlatList
                ref={listRef}
                data={conversation.data.messages}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
                renderItem={({ item }) => {
                  const mine = item.sender.id === user?.id;
                  return (
                    <View style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "82%", backgroundColor: mine ? colors.brand : colors.white, borderColor: mine ? colors.brand : colors.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9, gap: 3 }}>
                      <Text style={{ color: mine ? colors.white : colors.text, lineHeight: 20 }}>{item.content}</Text>
                      <Text style={{ color: mine ? "#d8f4e3" : colors.muted, fontSize: 10 }}>{formatDate(item.created_at)}</Text>
                    </View>
                  );
                }}
              />
              <ErrorMessage error={send.error ?? conversation.error} />
              <View style={styles.row}>
                <Input style={{ flex: 1 }} placeholder="Escreva uma mensagem" value={content} onChangeText={setContent} maxLength={2000} />
                <Button title="" compact icon={<Send color={colors.white} size={19} />} disabled={!content.trim() || send.isPending} onPress={() => send.mutate()} />
              </View>
            </>
          ) : <ErrorMessage error={conversation.error} />}
        </Screen>
      </KeyboardAvoidingView>
    </AuthGate>
  );
}
