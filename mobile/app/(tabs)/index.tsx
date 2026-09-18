import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Category, Paginated, Product } from "../../src/api/types";
import { Button, EmptyState, ErrorMessage, Input, Loading, ProductCard, colors, styles } from "../../src/components/ui";
import { useState } from "react";

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const products = useQuery({ queryKey: ["products", "home"], queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/?page_size=20")) });
  const categories = useQuery({ queryKey: ["categories"], queryFn: async () => normalizePage(await apiRequest<Paginated<Category> | Category[]>("/categories/")) });
  function submitSearch() {
    router.push({ pathname: "/search", params: search ? { search } : undefined });
  }
  const header = (
    <View style={{ gap: 14 }}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Marketplace para Moçambique</Text>
        <Text style={styles.heroTitle}>Compre e venda com conversa direta.</Text>
        <Text style={styles.heroText}>Encontre oportunidades por cidade e fale diretamente com compradores ou vendedores.</Text>
        <View style={styles.row}>
          <Input style={{ flex: 1 }} placeholder="O que procura?" value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={submitSearch} />
          <Button title="" compact icon={<Search color={colors.white} size={19} />} onPress={submitSearch} />
        </View>
        <View style={styles.row}>
          <Button title="Explorar produtos" style={{ flex: 1 }} onPress={() => router.push("/search")} />
          <Button title="Vender agora" style={{ flex: 1 }} variant="secondary" onPress={() => router.push("/sell")} />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Categorias</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable style={styles.categoryPill} onPress={() => router.push({ pathname: "/search", params: { category: String(item.id) } })}>
            <Text style={styles.categoryText}>{item.name}</Text>
          </Pressable>
        )}
      />
      <Text style={styles.sectionTitle}>Novidades</Text>
      <ErrorMessage error={products.error ?? categories.error} />
    </View>
  );
  if (products.isLoading && !products.data) return <Loading label="A descobrir produtos..." />;
  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      numColumns={2}
      data={products.data ?? []}
      keyExtractor={(item) => String(item.id)}
      columnWrapperStyle={{ gap: 12 }}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ marginBottom: 12 }}
      ListEmptyComponent={<EmptyState title="Ainda sem produtos" text="Os novos anúncios irão aparecer aqui." />}
      refreshing={products.isFetching}
      onRefresh={() => { void products.refetch(); void categories.refetch(); }}
      renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(("/product/" + item.slug) as never)} />}
    />
  );
}
