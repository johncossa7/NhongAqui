import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Image, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Favorite, Paginated } from "../../src/api/types";
import { Button, Card, Price, Screen, productImage, styles } from "../../src/components/ui";

export default function FavoritesScreen() {
  const queryClient = useQueryClient();
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Favorite>>("/favorites/"))
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiRequest(`/favorites/${id}/`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] })
  });
  return (
    <Screen>
      <Text style={styles.title}>Favoritos</Text>
      <FlatList
        data={favorites.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Image source={{ uri: productImage(item.product) }} style={{ width: 96, height: 96, borderRadius: 8 }} />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontWeight: "800" }} onPress={() => router.push(`/product/${item.product.slug}`)}>{item.product.title}</Text>
                <Price value={item.product.price} />
                <Button title="Remover" muted onPress={() => void remove.mutate(item.id)} />
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
