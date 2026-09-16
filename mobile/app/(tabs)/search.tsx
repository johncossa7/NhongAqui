import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";

import { apiRequest, normalizePage, toQuery } from "../../src/api/client";
import type { Paginated, Product } from "../../src/api/types";
import { Button, Input, ProductCard, Screen } from "../../src/components/ui";

export default function SearchScreen() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const products = useQuery({
    queryKey: ["products", search, city],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Product>>(`/products/${toQuery({ search, city })}`))
  });

  return (
    <Screen>
      <Input placeholder="O que procura?" value={search} onChangeText={setSearch} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}><Input placeholder="Cidade" value={city} onChangeText={setCity} /></View>
        <Button title="Filtrar" onPress={() => void products.refetch()} />
      </View>
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
