import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { HeartOff } from "lucide-react-native";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Favorite, Paginated } from "../../src/api/types";
import { AuthGate } from "../../src/components/AuthGate";
import { Button, Card, EmptyState, ErrorMessage, Loading, Price, Screen, colors, productImageSource, styles } from "../../src/components/ui";
import { useAuth } from "../../src/lib/auth";

export default function FavoritesScreen() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const favorites = useQuery({ queryKey: ["favorites"], queryFn: async () => normalizePage(await apiRequest<Paginated<Favorite>>("/favorites/")), enabled: isAuthenticated });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest("/favorites/" + id + "/", { method: "DELETE" }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["favorites"] })
  });
  return (
    <AuthGate message="Entre para guardar e consultar os seus produtos favoritos.">
      <Screen>
        <Text style={styles.title}>Favoritos</Text>
        {favorites.isLoading ? <Loading /> : null}
        <ErrorMessage error={favorites.error ?? remove.error} />
        {!favorites.isLoading && !favorites.data?.length ? <EmptyState title="Sem favoritos" text="Toque no coração de um produto para o guardar aqui." action={<Button title="Explorar produtos" onPress={() => router.push("/search")} />} /> : null}
        <FlatList
          data={favorites.data ?? []}
          keyExtractor={(item) => String(item.id)}
          refreshing={favorites.isFetching}
          onRefresh={() => void favorites.refetch()}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Card>
              <Pressable onPress={() => router.push(("/product/" + item.product.slug) as never)} style={{ flexDirection: "row", gap: 12 }}>
                <Image source={productImageSource(item.product)} style={{ width: 96, height: 96, borderRadius: 8, backgroundColor: colors.cream }} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Text numberOfLines={2} style={{ fontWeight: "900", color: colors.text }}>{item.product.title}</Text>
                  <Price value={item.product.price} />
                  <Text style={styles.muted}>{item.product.city}</Text>
                </View>
              </Pressable>
              <Button title="Remover dos favoritos" compact variant="ghost" icon={<HeartOff color={colors.red} size={17} />} onPress={() => remove.mutate(item.id)} />
            </Card>
          )}
        />
      </Screen>
    </AuthGate>
  );
}
