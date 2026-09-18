import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ShieldCheck, Star } from "lucide-react-native";
import { FlatList, Text, View } from "react-native";

import { apiRequest, normalizePage, toQuery } from "../../src/api/client";
import type { Paginated, Product, Review, User } from "../../src/api/types";
import { Card, EmptyState, ErrorMessage, Loading, ProductCard, colors, styles } from "../../src/components/ui";

export default function SellerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const seller = useQuery({ queryKey: ["seller", id], queryFn: () => apiRequest<User>("/users/" + id + "/"), enabled: Boolean(id) });
  const products = useQuery({
    queryKey: ["seller-products", id],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/" + toQuery({ seller: id }))),
    enabled: Boolean(id)
  });
  const reviews = useQuery({
    queryKey: ["seller-reviews", id],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Review>>("/reviews/" + toQuery({ reviewed_user: id }))),
    enabled: Boolean(id)
  });
  if (seller.isLoading) return <Loading label="A carregar o vendedor..." />;
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      numColumns={2}
      data={products.data ?? []}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={{ gap: 12 }}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 14 }}>
          <ErrorMessage error={seller.error ?? products.error} />
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{seller.data?.seller_profile?.display_name ?? seller.data?.full_name ?? "Vendedor"}</Text>
                <Text style={styles.muted}>{seller.data?.city}</Text>
              </View>
              {seller.data?.seller_profile?.verified ? <ShieldCheck color={colors.brand} size={27} /> : null}
            </View>
            {seller.data?.seller_profile?.bio ? <Text style={{ color: colors.text, lineHeight: 21 }}>{seller.data.seller_profile.bio}</Text> : null}
            <View style={styles.row}><Star color={colors.yellow} fill={colors.yellow} size={18} /><Text style={{ fontWeight: "800" }}>{Number(seller.data?.seller_profile?.rating_average ?? 0).toFixed(1)} ({seller.data?.seller_profile?.rating_count ?? 0} avaliações)</Text></View>
          </Card>
          {reviews.data?.slice(0, 3).map((review) => <Card key={review.id}><View style={styles.row}><Text style={{ fontWeight: "900" }}>{review.reviewer.full_name}</Text><Text style={styles.muted}>{review.rating}/5</Text></View><Text>{review.comment}</Text></Card>)}
          <Text style={styles.sectionTitle}>Anúncios</Text>
        </View>
      }
      ListEmptyComponent={!products.isLoading ? <EmptyState title="Sem anúncios ativos" text="Este vendedor não tem produtos disponíveis neste momento." /> : <Loading />}
      refreshing={products.isFetching}
      onRefresh={() => { void products.refetch(); void seller.refetch(); void reviews.refetch(); }}
      renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(("/product/" + item.slug) as never)} />}
    />
  );
}
