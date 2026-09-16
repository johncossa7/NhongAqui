import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Image, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../src/api/client";
import type { Paginated, Product } from "../src/api/types";
import { Button, Card, Price, Screen, productImage, styles } from "../src/components/ui";

export default function MyListingsScreen() {
  const queryClient = useQueryClient();
  const products = useQuery({
    queryKey: ["my-products"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/mine/"))
  });
  const action = useMutation({
    mutationFn: ({ slug, next }: { slug: string; next: "mark_reserved" | "mark_sold" }) =>
      apiRequest(`/products/${slug}/${next}/`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-products"] })
  });

  return (
    <Screen>
      <Text style={styles.title}>Meus anuncios</Text>
      <FlatList
        data={products.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Image source={{ uri: productImage(item) }} style={{ width: 96, height: 96, borderRadius: 8 }} />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ fontWeight: "800" }} onPress={() => router.push(`/product/${item.slug}`)}>{item.title}</Text>
                <Price value={item.price} />
                <Text style={styles.muted}>{item.status}</Text>
                <View style={styles.row}>
                  <Button title="Reservar" muted onPress={() => void action.mutate({ slug: item.slug, next: "mark_reserved" })} />
                  <Button title="Vendido" onPress={() => void action.mutate({ slug: item.slug, next: "mark_sold" })} />
                </View>
              </View>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
