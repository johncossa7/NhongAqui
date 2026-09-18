import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Flag, Heart, MapPin, MessageCircle, Share2, ShieldX, Star } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Share, Text, useWindowDimensions, View } from "react-native";

import { apiRequest, normalizePage } from "../../src/api/client";
import type { Conversation, Favorite, Paginated, Product } from "../../src/api/types";
import { Button, Card, ErrorMessage, Input, Loading, Price, Screen, SelectField, StatusBadge, colors, productImageSource, styles } from "../../src/components/ui";
import { useAuth } from "../../src/lib/auth";
import { conditionOptions } from "../../src/lib/products";

const reportReasons = [
  { label: "Possível fraude", value: "fraud" },
  { label: "Produto falso", value: "fake_product" },
  { label: "Informação enganosa", value: "misleading" },
  { label: "Conteúdo inapropriado", value: "inappropriate" },
  { label: "Produto proibido", value: "prohibited" },
  { label: "Spam", value: "spam" },
  { label: "Outro", value: "other" }
];

export default function ProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();
  const [imageIndex, setImageIndex] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [report, setReport] = useState({ reason: "fraud", description: "" });
  const [review, setReview] = useState({ rating: "5", comment: "" });
  const product = useQuery({ queryKey: ["product", slug], queryFn: () => apiRequest<Product>("/products/" + slug + "/"), enabled: Boolean(slug) });
  const favorites = useQuery({
    queryKey: ["favorites"],
    enabled: isAuthenticated,
    queryFn: async () => normalizePage(await apiRequest<Paginated<Favorite>>("/favorites/"))
  });
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!product.data) return;
      const favorite = favorites.data?.find((item) => item.product.id === product.data?.id);
      if (favorite) await apiRequest("/favorites/" + favorite.id + "/", { method: "DELETE" });
      else await apiRequest("/favorites/", { method: "POST", body: JSON.stringify({ product_id: product.data.id }) });
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["favorites"] })
  });
  const reportMutation = useMutation({
    mutationFn: () => apiRequest("/reports/", { method: "POST", body: JSON.stringify({ product_id: product.data?.id, ...report }) }),
    onSuccess: () => {
      setReportOpen(false);
      Alert.alert("Denúncia enviada", "A equipa irá analisar este anúncio.");
    }
  });
  const reviewMutation = useMutation({
    mutationFn: () => apiRequest("/reviews/", { method: "POST", body: JSON.stringify({ product_id: product.data?.id, rating: Number(review.rating), comment: review.comment }) }),
    onSuccess: () => {
      setReviewOpen(false);
      Alert.alert("Avaliação enviada", "Obrigado por partilhar a sua experiência.");
    }
  });
  const blockMutation = useMutation({
    mutationFn: () => apiRequest("/users/" + product.data?.seller.id + "/block/", { method: "POST" }),
    onSuccess: () => Alert.alert("Utilizador bloqueado", "Deixará de poder trocar mensagens com este utilizador.")
  });

  useEffect(() => {
    if (slug) void apiRequest("/products/" + slug + "/view/", { method: "POST" }).catch(() => undefined);
  }, [slug]);

  async function contactSeller() {
    if (!product.data) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const conversation = await apiRequest<Conversation>("/conversations/", { method: "POST", body: JSON.stringify({ product_id: product.data.id }) });
    router.push(("/conversation/" + conversation.id) as never);
  }
  function requireAuth(action: () => void) {
    if (!isAuthenticated) router.push("/login");
    else action();
  }

  if (product.isLoading) return <Loading label="A carregar o produto..." />;
  if (product.error || !product.data) return <Screen><ErrorMessage error={product.error ?? new Error("Produto não encontrado.")} /></Screen>;

  const item = product.data;
  const owner = user?.id === item.seller.id;
  const isFavorite = favorites.data?.some((favorite) => favorite.product.id === item.id);
  const images = item.images.length ? item.images : [{ id: 0, image: null }];
  const galleryWidth = Math.max(width - 32, 280);
  const conditionLabel = conditionOptions.find((option) => option.value === item.condition)?.label ?? item.condition;

  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 26 }}>
        <Screen>
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => setImageIndex(Math.round(event.nativeEvent.contentOffset.x / galleryWidth))}
            >
              {images.map((image) => (
                <Image key={image.id} source={image.image ? { uri: image.image } : productImageSource(item)} style={{ width: galleryWidth, aspectRatio: 1.12, borderRadius: 8, backgroundColor: colors.cream }} resizeMode="cover" />
              ))}
            </ScrollView>
            <View style={{ position: "absolute", right: 10, bottom: 10, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: "rgba(12,17,20,0.78)" }}>
              <Text style={{ color: colors.white, fontWeight: "900", fontSize: 12 }}>{imageIndex + 1}/{images.length}</Text>
            </View>
          </View>
          {images.length > 1 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {images.map((image, index) => <Image key={image.id} source={image.image ? { uri: image.image } : productImageSource(item)} style={{ width: 62, height: 62, borderRadius: 8, borderWidth: 2, borderColor: imageIndex === index ? colors.brand : colors.border }} />)}
            </ScrollView>
          ) : null}
          <Card>
            <View style={[styles.row, { alignItems: "flex-start" }]}>
              <View style={{ flex: 1, gap: 7 }}>
                <StatusBadge value={item.status} />
                <Text style={styles.title}>{item.title}</Text>
                <Price value={item.price} />
              </View>
              {!owner ? (
                <Pressable accessibilityLabel="Adicionar aos favoritos" onPress={() => requireAuth(() => favoriteMutation.mutate())} style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", borderColor: colors.border, borderWidth: 1 }}>
                  <Heart color={isFavorite ? colors.brand : colors.text} fill={isFavorite ? colors.brand : "transparent"} size={22} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.row}><MapPin color={colors.muted} size={17} /><Text style={styles.muted}>{[item.neighborhood, item.city, item.province].filter(Boolean).join(", ")}</Text></View>
            <Text style={{ color: colors.text, lineHeight: 22 }}>{item.description}</Text>
            <Text style={styles.muted}>{conditionLabel} · {item.negotiable ? "Preço negociável" : "Preço fixo"} · {item.views_count} visualizações</Text>
          </Card>
          <Card>
            <Text style={styles.sectionTitle}>Vendedor</Text>
            <Pressable onPress={() => router.push(("/seller/" + item.seller.id) as never)} style={styles.row}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" }}><MessageCircle color={colors.brand} size={21} /></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "900" }}>{item.seller.seller_profile?.display_name ?? item.seller.full_name}</Text>
                <Text style={styles.muted}>{item.seller.city} {item.seller.seller_profile?.verified ? "· Verificado" : ""}</Text>
              </View>
            </Pressable>
          </Card>
          {owner ? <Button title="Editar este anúncio" onPress={() => router.push(("/edit-listing/" + item.slug) as never)} /> : <Button title="Contactar vendedor" icon={<MessageCircle color={colors.white} size={19} />} onPress={() => void contactSeller()} />}
          <View style={styles.row}>
            <Button title="Partilhar" style={{ flex: 1 }} variant="secondary" icon={<Share2 color={colors.brand} size={17} />} onPress={() => { const url = (process.env.EXPO_PUBLIC_WEB_URL ?? "https://web-production-d7b9f.up.railway.app") + "/produto/" + item.slug; void Share.share({ message: item.title + " - " + item.price + " MT\n" + url, url }); }} />
            {!owner ? <Button title="Avaliar" style={{ flex: 1 }} variant="secondary" icon={<Star color={colors.brand} size={17} />} onPress={() => requireAuth(() => setReviewOpen(true))} /> : null}
          </View>
          {!owner ? (
            <View style={styles.row}>
              <Button title="Denunciar" style={{ flex: 1 }} variant="ghost" icon={<Flag color={colors.red} size={17} />} onPress={() => requireAuth(() => setReportOpen(true))} />
              <Button title="Bloquear" style={{ flex: 1 }} variant="ghost" icon={<ShieldX color={colors.red} size={17} />} onPress={() => requireAuth(() => Alert.alert("Bloquear utilizador?", "Não poderá trocar mensagens com este utilizador.", [{ text: "Cancelar", style: "cancel" }, { text: "Bloquear", style: "destructive", onPress: () => blockMutation.mutate() }] ))} />
            </View>
          ) : null}
        </Screen>
      </ScrollView>

      <Modal visible={reportOpen} transparent animationType="slide" onRequestClose={() => setReportOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(12,17,20,0.45)" }}>
          <View style={{ backgroundColor: colors.white, padding: 18, gap: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Text style={styles.sectionTitle}>Denunciar anúncio</Text>
            <SelectField label="Motivo" value={report.reason} options={reportReasons} onChange={(reason) => setReport({ ...report, reason })} />
            <Input multiline placeholder="Descreva o problema (opcional)" value={report.description} onChangeText={(description) => setReport({ ...report, description })} />
            <ErrorMessage error={reportMutation.error} />
            <Button title={reportMutation.isPending ? "A enviar..." : "Enviar denúncia"} disabled={reportMutation.isPending} variant="danger" onPress={() => reportMutation.mutate()} />
            <Button title="Cancelar" variant="ghost" onPress={() => setReportOpen(false)} />
          </View>
        </View>
      </Modal>
      <Modal visible={reviewOpen} transparent animationType="slide" onRequestClose={() => setReviewOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(12,17,20,0.45)" }}>
          <View style={{ backgroundColor: colors.white, padding: 18, gap: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Text style={styles.sectionTitle}>Avaliar vendedor</Text>
            <SelectField label="Classificação" value={review.rating} options={[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: value + " estrela(s)" }))} onChange={(rating) => setReview({ ...review, rating })} />
            <Input multiline placeholder="Conte como foi a experiência" value={review.comment} onChangeText={(comment) => setReview({ ...review, comment })} />
            <ErrorMessage error={reviewMutation.error} />
            <Button title={reviewMutation.isPending ? "A enviar..." : "Enviar avaliação"} disabled={reviewMutation.isPending} onPress={() => reviewMutation.mutate()} />
            <Button title="Cancelar" variant="ghost" onPress={() => setReviewOpen(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}
