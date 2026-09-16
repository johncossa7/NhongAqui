import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Category, Paginated, Product } from "../../src/api/types";
import { Button, ProductCard, Screen, styles } from "../../src/components/ui";

export default function HomeScreen() {
  const products = useQuery({
    queryKey: ["products", "home"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/?page_size=10"))
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Category> | Category[]>("/categories/"))
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Maputo e Matola primeiro</Text>
        <Text style={styles.heroTitle}>Encontre. Venda. Confie.</Text>
        <Text style={styles.heroText}>Um mercado digital moderno para comprar e vender com mais cuidado.</Text>
        <View style={styles.row}>
          <Button title="Explorar" onPress={() => router.push("/search")} />
          <Button title="Vender" muted onPress={() => router.push("/sell")} />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Categorias</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </View>
        )}
      />
      <Text style={styles.sectionTitle}>Novidades</Text>
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
