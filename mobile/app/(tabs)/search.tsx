import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { SlidersHorizontal } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

import { apiRequest, normalizePage, toQuery } from "../../src/api/client";
import type { Category, Paginated, Product } from "../../src/api/types";
import { Button, EmptyState, ErrorMessage, Input, Loading, ProductCard, Screen, SelectField, colors, styles } from "../../src/components/ui";
import { conditionOptions, sortOptions } from "../../src/lib/products";

type Filters = { search: string; city: string; category: string; condition: string; min_price: string; max_price: string; ordering: string };

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string; search?: string }>();
  const initial = { search: params.search ?? "", city: "", category: params.category ?? "", condition: "", min_price: "", max_price: "", ordering: "-created_at" };
  const [draft, setDraft] = useState<Filters>(initial);
  const [filters, setFilters] = useState<Filters>(initial);
  useEffect(() => {
    if (params.category === undefined && params.search === undefined) return;
    setDraft((current) => {
      const next = { ...current, category: params.category ?? "", search: params.search ?? "" };
      setFilters(next);
      return next;
    });
  }, [params.category, params.search]);
  const categories = useQuery({ queryKey: ["categories"], queryFn: async () => normalizePage(await apiRequest<Paginated<Category> | Category[]>("/categories/")) });
  const products = useQuery({
    queryKey: ["products", "search", filters],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>("/products/" + toQuery(filters)))
  });

  return (
    <Screen>
      <Text style={styles.title}>Pesquisar</Text>
      <Input placeholder="O que procura?" value={draft.search} onChangeText={(search) => setDraft({ ...draft, search })} returnKeyType="search" onSubmitEditing={() => setFilters(draft)} />
      <View style={styles.row}>
        <Input style={{ flex: 1 }} placeholder="Cidade" value={draft.city} onChangeText={(city) => setDraft({ ...draft, city })} />
        <Button title="Filtrar" compact icon={<SlidersHorizontal color={colors.white} size={17} />} onPress={() => setFilters(draft)} />
      </View>
      <View style={styles.row}>
        <Input style={{ flex: 1 }} placeholder="Preço mínimo" keyboardType="number-pad" value={draft.min_price} onChangeText={(min_price) => setDraft({ ...draft, min_price })} />
        <Input style={{ flex: 1 }} placeholder="Preço máximo" keyboardType="number-pad" value={draft.max_price} onChangeText={(max_price) => setDraft({ ...draft, max_price })} />
      </View>
      <View style={{ gap: 8 }}>
        <SelectField label="Categoria" value={draft.category} options={[{ label: "Todas as categorias", value: "" }, ...(categories.data ?? []).map((category) => ({ label: category.name, value: String(category.id) }))]} onChange={(category) => setDraft({ ...draft, category })} />
        <SelectField label="Estado" value={draft.condition} options={[{ label: "Qualquer estado", value: "" }, ...conditionOptions]} onChange={(condition) => setDraft({ ...draft, condition })} />
        <SelectField label="Ordenar" value={draft.ordering} options={sortOptions} onChange={(ordering) => { const next = { ...draft, ordering }; setDraft(next); setFilters(next); }} />
      </View>
      {products.isLoading ? <Loading /> : null}
      <ErrorMessage error={products.error} />
      {!products.isLoading && !products.data?.length ? <EmptyState title="Nenhum resultado" text="Tente retirar alguns filtros ou pesquisar outro produto." /> : null}
      <FlatList
        numColumns={2}
        data={products.data ?? []}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={{ gap: 12 }}
        refreshing={products.isFetching}
        onRefresh={() => void products.refetch()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(("/product/" + item.slug) as never)} />}
      />
    </Screen>
  );
}
