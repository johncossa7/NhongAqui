import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Heart, MessageCircle } from "lucide-react-native";
import { Image, ScrollView, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Conversation, Favorite, Paginated, Product } from "../../src/api/types";
import { Button, Card, Loading, Price, Screen, colors, productImage, styles } from "../../src/components/ui";
import { useAuth } from "../../src/lib/auth";

export default function ProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const product = useQuery({
    queryKey: ["product", slug],
    queryFn: () => apiRequest<Product>(`/products/${slug}/`),
    enabled: Boolean(slug)
  });
  const favorites = useQuery({
    queryKey: ["favorites"],
    enabled: isAuthenticated,
    queryFn: async () => normalizePage(await apiRequest<Paginated<Favorite>>("/favorites/"))
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!product.data) return;
      const favorite = favorites.data?.find((item) => item.product.id === product.data?.id);
      if (favorite) {
        await apiRequest(`/favorites/${favorite.id}/`, { method: "DELETE" });
      } else {
        await apiRequest("/favorites/", {
          method: "POST",
          body: JSON.stringify({ product_id: product.data.id })
        });
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites"] });
      await queryClient.invalidateQueries({ queryKey: ["product", slug] });
    }
  });

  async function contactSeller() {
    if (!product.data) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const conversation = await apiRequest<Conversation>("/conversations/", {
      method: "POST",
      body: JSON.stringify({ product_id: product.data.id })
    });
    router.push(`/conversation/${conversation.id}`);
  }

  if (!product.data) return <Loading />;
  const isFavorite = favorites.data?.some((item) => item.product.id === product.data?.id);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <Screen>
        <Image source={{ uri: productImage(product.data) }} style={{ width: "100%", aspectRatio: 1.15, borderRadius: 8 }} />
        <Card>
          <Text style={styles.title}>{product.data.title}</Text>
          <Price value={product.data.price} />
          <Text style={styles.muted}>{product.data.neighborhood ? `${product.data.neighborhood}, ` : ""}{product.data.city}</Text>
          <Text>{product.data.description}</Text>
          <View style={styles.row}>
            <Button title="Contactar" onPress={() => void contactSeller()} />
            <Button
              title={isFavorite ? "Guardado" : "Favorito"}
              muted
              onPress={() => void favoriteMutation.mutate()}
            />
          </View>
          <View style={styles.row}>
            <MessageCircle color={colors.brand} size={18} />
            <Text style={styles.muted}>Vendedor: {product.data.seller.seller_profile?.display_name ?? product.data.seller.full_name}</Text>
          </View>
          <View style={styles.row}>
            <Heart color={isFavorite ? colors.brand : colors.muted} fill={isFavorite ? colors.brand : "transparent"} size={18} />
            <Text style={styles.muted}>{product.data.views_count} visualizacoes</Text>
          </View>
          <Button title="Ver vendedor" muted onPress={() => router.push(`/seller/${product.data?.seller.id}`)} />
        </Card>
      </Screen>
    </ScrollView>
  );
}
