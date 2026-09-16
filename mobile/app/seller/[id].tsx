import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Text } from "react-native";

import { apiRequest, normalizePage, toQuery } from "../../src/api/client";
import type { Paginated, Product, User } from "../../src/api/types";
import { Card, ProductCard, Screen, styles } from "../../src/components/ui";

export default function SellerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const seller = useQuery({
    queryKey: ["seller", id],
    queryFn: () => apiRequest<User>(`/users/${id}/`),
    enabled: Boolean(id)
  });
  const products = useQuery({
    queryKey: ["seller-products", id],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>(`/products/${toQuery({ seller: id })}`)),
    enabled: Boolean(id)
  });

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{seller.data?.seller_profile?.display_name ?? seller.data?.full_name ?? "Vendedor"}</Text>
        <Text style={styles.muted}>{seller.data?.city}</Text>
        <Text>{seller.data?.seller_profile?.bio}</Text>
      </Card>
      <Text style={{ fontWeight: "800" }}>Anuncios</Text>
      <FlatList
        numColumns={2}
        data={products.data ?? []}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(`/product/${item.slug}`)} />}
      />
    </Screen>
  );
}
