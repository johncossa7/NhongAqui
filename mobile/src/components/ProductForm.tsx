import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { ImagePlus, Trash2, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from "react-native";

import { apiRequest, normalizePage } from "../api/client";
import type { Category, Paginated, Product } from "../api/types";
import { conditionOptions } from "../lib/products";
import { Button, ErrorMessage, Input, Loading, Screen, SelectField, colors, styles } from "./ui";

type SelectedImage = { uri: string; fileName?: string | null; mimeType?: string };

const emptyForm = {
  title: "",
  description: "",
  category: "",
  price: "",
  condition: "good",
  province: "Maputo",
  city: "Maputo",
  neighborhood: "",
  negotiable: true
};

export function ProductForm({ product }: { product?: Product }) {
  const editing = Boolean(product);
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState<SelectedImage[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => normalizePage(await apiRequest<Paginated<Category> | Category[]>("/categories/"))
  });

  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title,
      description: product.description,
      category: String(product.category),
      price: product.price,
      condition: product.condition,
      province: product.province,
      city: product.city,
      neighborhood: product.neighborhood,
      negotiable: product.negotiable
    });
  }, [product]);

  const keptImages = useMemo(
    () => (product?.images ?? []).filter((image) => !removedIds.includes(image.id)),
    [product, removedIds]
  );
  const imageCount = keptImages.length + newImages.length;

  const save = useMutation({
    mutationFn: async () => {
      if (!form.title.trim() || !form.description.trim() || !form.category || !form.price || !form.city.trim()) {
        throw new Error("Preencha o título, descrição, categoria, preço e cidade.");
      }
      if (imageCount < 1) throw new Error("Adicione pelo menos uma fotografia.");
      if (imageCount > 8) throw new Error("Cada anúncio pode ter no máximo 8 fotografias.");

      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
      removedIds.forEach((id) => data.append("delete_image_ids", String(id)));
      newImages.forEach((image, index) => {
        data.append("uploaded_images", {
          uri: image.uri,
          name: image.fileName ?? `produto-${Date.now()}-${index}.jpg`,
          type: image.mimeType ?? "image/jpeg"
        } as unknown as Blob);
      });
      return apiRequest<Product>(editing ? `/products/${product?.slug}/` : "/products/", {
        method: editing ? "PATCH" : "POST",
        body: data
      });
    },
    onSuccess: async (saved) => {
      setNewImages([]);
      setRemovedIds([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["my-products"] }),
        queryClient.invalidateQueries({ queryKey: ["product", saved.slug] })
      ]);
      if (editing) router.back();
      else router.replace(`/product/${saved.slug}`);
    }
  });

  async function pickImages() {
    const available = 8 - imageCount;
    if (available <= 0) {
      Alert.alert("Limite atingido", "Pode publicar no máximo 8 fotografias por anúncio.");
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso às fotografias para as adicionar ao anúncio.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: available,
      mediaTypes: ["images"],
      quality: 0.82
    });
    if (!result.canceled) {
      const selected = result.assets.slice(0, available);
      setNewImages((current) => [...current, ...selected].slice(0, 8 - keptImages.length));
    }
  }

  if (categories.isLoading) return <Loading label="A preparar o formulário..." />;

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
      <Screen>
        <Text style={styles.title}>{editing ? "Editar anúncio" : "Vender agora"}</Text>
        <Text style={styles.subtitle}>Mostre bem o produto e dê informação clara ao comprador.</Text>

        <View style={{ gap: 10 }}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <Text style={styles.sectionTitle}>Fotografias</Text>
            <Text style={styles.muted}>{imageCount}/8</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {keptImages.map((image) => (
              <View key={image.id} style={{ position: "relative" }}>
                <Image source={{ uri: image.image }} style={{ width: 104, height: 104, borderRadius: 8 }} />
                <Pressable accessibilityLabel="Remover fotografia" onPress={() => setRemovedIds((ids) => [...ids, image.id])} style={{ position: "absolute", right: 5, top: 5, backgroundColor: colors.red, borderRadius: 16, padding: 5 }}>
                  <Trash2 color={colors.white} size={15} />
                </Pressable>
              </View>
            ))}
            {newImages.map((image, index) => (
              <View key={`${image.uri}-${index}`} style={{ position: "relative" }}>
                <Image source={{ uri: image.uri }} style={{ width: 104, height: 104, borderRadius: 8 }} />
                <Pressable accessibilityLabel="Retirar fotografia nova" onPress={() => setNewImages((images) => images.filter((_, itemIndex) => itemIndex !== index))} style={{ position: "absolute", right: 5, top: 5, backgroundColor: colors.black, borderRadius: 16, padding: 5 }}>
                  <X color={colors.white} size={15} />
                </Pressable>
              </View>
            ))}
            {imageCount < 8 ? (
              <Pressable onPress={() => void pickImages()} style={{ width: 104, height: 104, borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: colors.brand, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.brandSoft }}>
                <ImagePlus color={colors.brand} size={26} />
                <Text style={{ color: colors.brandDark, fontWeight: "800", fontSize: 12 }}>Adicionar</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>

        <Input placeholder="Título do produto" value={form.title} maxLength={140} onChangeText={(title) => setForm({ ...form, title })} />
        <Input placeholder="Descrição, tamanho, características e defeitos" value={form.description} maxLength={3000} onChangeText={(description) => setForm({ ...form, description })} multiline />
        <SelectField label="Categoria" value={form.category} options={(categories.data ?? []).map((category) => ({ label: category.name, value: String(category.id) }))} onChange={(category) => setForm({ ...form, category })} />
        <SelectField label="Estado" value={form.condition} options={conditionOptions} onChange={(condition) => setForm({ ...form, condition })} />
        <Input placeholder="Preço em MT" value={form.price} onChangeText={(price) => setForm({ ...form, price: price.replace(/[^0-9.]/g, "") })} keyboardType="decimal-pad" />
        <View style={[styles.card, styles.row, { justifyContent: "space-between" }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>Preço negociável</Text>
            <Text style={styles.muted}>Permitir propostas do comprador</Text>
          </View>
          <Switch value={form.negotiable} onValueChange={(negotiable) => setForm({ ...form, negotiable })} trackColor={{ false: colors.border, true: colors.brand }} />
        </View>
        <Input placeholder="Província" value={form.province} onChangeText={(province) => setForm({ ...form, province })} />
        <Input placeholder="Cidade" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
        <Input placeholder="Bairro" value={form.neighborhood} onChangeText={(neighborhood) => setForm({ ...form, neighborhood })} />
        <ErrorMessage error={save.error} />
        <Button title={save.isPending ? "A guardar..." : editing ? "Guardar alterações" : "Publicar anúncio"} disabled={save.isPending} onPress={() => save.mutate()} />
        {editing ? <Button title="Cancelar" variant="ghost" onPress={() => router.back()} /> : null}
      </Screen>
    </ScrollView>
  );
}
