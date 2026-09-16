import type { ComponentProps, PropsWithChildren } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Product } from "../api/types";

export const colors = {
  brand: "#008037",
  black: "#111111",
  red: "#e11d2e",
  yellow: "#f4c400",
  text: "#111111",
  muted: "#6b7280",
  border: "#d6d8d2",
  background: "#f6f7f5",
  white: "#ffffff"
};

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function Button({ title, onPress, muted = false }: { title: string; onPress?: () => void; muted?: boolean }) {
  return (
    <Pressable style={[styles.button, muted && styles.buttonMuted]} onPress={onPress}>
      <Text style={[styles.buttonText, muted && styles.buttonMutedText]}>{title}</Text>
    </Pressable>
  );
}

export function Input(props: ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor="#9ca3af" style={styles.input} {...props} />;
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brand} />
    </View>
  );
}

export function Price({ value }: { value: string | number }) {
  return <Text style={styles.price}>{Number(value).toLocaleString("pt-MZ")} MT</Text>;
}

export function productImage(product: Product | { primary_image?: string | null; id: number }) {
  if ("images" in product) {
    const primary = product.images.find((image) => image.is_primary) ?? product.images[0];
    if (primary?.image) return primary.image;
  }
  if ("primary_image" in product && product.primary_image) return product.primary_image;
  return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=75";
}

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      <Image source={{ uri: productImage(product) }} style={styles.productImage} />
      <View style={styles.productBody}>
        <Text numberOfLines={2} style={styles.productTitle}>{product.title}</Text>
        <Price value={product.price} />
        <Text style={styles.muted}>{product.city}</Text>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 14
  },
  hero: {
    backgroundColor: colors.black,
    padding: 18,
    gap: 12
  },
  heroTitle: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 36,
    textTransform: "uppercase"
  },
  heroText: {
    color: "#d1d5db",
    fontSize: 15,
    lineHeight: 22
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.black,
    borderRadius: 0,
    borderWidth: 1,
    padding: 14,
    gap: 8
  },
  input: {
    minHeight: 48,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    color: colors.text
  },
  button: {
    minHeight: 48,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
    paddingHorizontal: 16
  },
  buttonMuted: {
    backgroundColor: colors.white,
    borderColor: colors.black,
    borderWidth: 1
  },
  buttonText: {
    color: colors.white,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontSize: 12
  },
  buttonMutedText: {
    color: colors.text,
    fontWeight: "900"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  productCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "transparent",
    borderRadius: 0,
    overflow: "hidden",
    marginBottom: 18
  },
  productImage: {
    width: "100%",
    aspectRatio: 0.82,
    backgroundColor: "#eceeea"
  },
  productBody: {
    paddingTop: 9,
    gap: 5
  },
  productTitle: {
    color: colors.text,
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 17
  },
  price: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15
  },
  muted: {
    color: colors.muted,
    fontSize: 12
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  categoryPill: {
    minWidth: 156,
    backgroundColor: colors.white,
    borderColor: colors.black,
    borderWidth: 1,
    padding: 14,
    marginRight: 8
  },
  categoryText: {
    color: colors.text,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  }
});
