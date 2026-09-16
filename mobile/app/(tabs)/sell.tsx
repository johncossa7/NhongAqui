import { useMutation, useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Category, Paginated, Product } from "../../src/api/types";
import { Button, Input, Screen, styles } from "../../src/components/ui";

type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
};

export default function SellScreen() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Category> | Category[]>("/categories/"))
  });
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    condition: "good",
    province: "Maputo",
    city: "Maputo",
    neighborhood: ""
  });
  const create = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      Object.entries({ ...form, negotiable: "true" }).forEach(([key, value]) => data.append(key, value));
      images.slice(0, 8).forEach((image, index) => {
        data.append("uploaded_images", {
          uri: image.uri,
          name: image.fileName ?? `produto-${index}.jpg`,
          type: image.mimeType ?? "image/jpeg"
        } as unknown as Blob);
      });
      return apiRequest<Product>("/products/", { method: "POST", body: data });
    },
    onSuccess: (product) => router.push(`/product/${product.slug}`)
  });

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });
    if (!result.canceled) {
      setImages(result.assets.slice(0, 8));
    }
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
      <Screen>
        <Text style={styles.title}>Vender agora</Text>
        <Button title="Selecionar fotografias" onPress={() => void pickImages()} />
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {images.map((image) => <Image key={image.uri} source={{ uri: image.uri }} style={{ width: 72, height: 72, borderRadius: 8 }} />)}
        </View>
        <Input placeholder="Titulo" value={form.title} onChangeText={(title) => setForm({ ...form, title })} />
        <Input placeholder="Descricao" value={form.description} onChangeText={(description) => setForm({ ...form, description })} multiline />
        <Input placeholder={`Categoria ID (${categories.data?.[0]?.name ?? "ex: 1"})`} value={form.category} onChangeText={(category) => setForm({ ...form, category })} />
        <Input placeholder="Preco MT" value={form.price} onChangeText={(price) => setForm({ ...form, price })} keyboardType="numeric" />
        <Input placeholder="Estado: new, like_new, good, used, parts" value={form.condition} onChangeText={(condition) => setForm({ ...form, condition })} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Input placeholder="Cidade" value={form.city} onChangeText={(city) => setForm({ ...form, city })} /></View>
          <View style={{ flex: 1 }}><Input placeholder="Bairro" value={form.neighborhood} onChangeText={(neighborhood) => setForm({ ...form, neighborhood })} /></View>
        </View>
        <Button title={create.isPending ? "A publicar..." : "Publicar"} onPress={() => void create.mutate()} />
      </Screen>
    </ScrollView>
  );
}
