import { Check, ChevronDown, ImageOff } from "lucide-react-native";
import { useState } from "react";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import type { Product } from "../api/types";

const fallbackProductImage = require("../../assets/branding/NhongAqui_Icon.png");

export const colors = {
  brand: "#008037",
  brandDark: "#00662d",
  brandSoft: "#e8f8ef",
  black: "#0c1114",
  red: "#df2f35",
  redSoft: "#fff0f0",
  yellow: "#f4c400",
  cream: "#fbfaf6",
  text: "#111827",
  muted: "#667085",
  border: "#dce1dc",
  background: "#f7f8f5",
  white: "#ffffff"
};

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

type ButtonProps = {
  title: string;
  onPress?: () => void;
  muted?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  compact?: boolean;
  icon?: ReactNode;
  style?: ComponentProps<typeof Pressable>["style"];
};

export function Button({
  title,
  onPress,
  muted = false,
  variant = muted ? "secondary" : "primary",
  disabled = false,
  compact = false,
  icon,
  style
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        variant === "secondary" && styles.buttonSecondary,
        variant === "ghost" && styles.buttonGhost,
        variant === "danger" && styles.buttonDanger,
        (disabled || !onPress) && styles.disabled,
        pressed && styles.pressed,
        typeof style === "function" ? style({ pressed }) : style
      ]}
    >
      {icon}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.buttonText,
          (variant === "secondary" || variant === "ghost") && styles.buttonSecondaryText
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function Input({ style, multiline, ...props }: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#98a2b3"
      style={[styles.input, multiline && styles.textarea, style]}
      multiline={multiline}
      {...props}
    />
  );
}

export function Card({ children, style }: PropsWithChildren<{ style?: ComponentProps<typeof View>["style"] }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Loading({ label = "A carregar..." }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.brand} size="large" />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorMessage({ error }: { error: unknown }) {
  if (!(error instanceof Error)) return null;
  return <Text style={styles.errorText}>{error.message}</Text>;
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <View style={styles.emptyState}>
      <ImageOff color={colors.muted} size={30} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={[styles.muted, { textAlign: "center" }]}>{text}</Text>
      {action}
    </View>
  );
}

export function Price({ value }: { value: string | number }) {
  return <Text style={styles.price}>{Number(value).toLocaleString("pt-MZ")} MT</Text>;
}

export function StatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    active: "Ativo",
    reserved: "Reservado",
    sold: "Vendido",
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    suspended: "Suspenso",
    unverified: "Não verificado",
    verified: "Verificado"
  };
  const danger = value === "rejected" || value === "suspended";
  return (
    <View style={[styles.badge, danger && styles.badgeDanger]}>
      <Text style={[styles.badgeText, danger && styles.badgeDangerText]}>{labels[value] ?? value}</Text>
    </View>
  );
}

export type SelectOption = { label: string; value: string };

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecionar"
}: {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return (
    <>
      <Pressable style={styles.select} onPress={() => setOpen(true)}>
        <View style={{ flex: 1 }}>
          {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
          <Text style={selected ? styles.selectValue : styles.selectPlaceholder}>{selected?.label ?? placeholder}</Text>
        </View>
        <ChevronDown color={colors.muted} size={18} />
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{label ?? placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.optionRow}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {item.value === value ? <Check color={colors.brand} size={20} /> : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function productImageSource(product: Product | { primary_image?: string | null; id: number }) {
  if ("images" in product) {
    const primary = product.images.find((image) => image.is_primary) ?? product.images[0];
    if (primary?.image) return { uri: primary.image };
  }
  if ("primary_image" in product && product.primary_image) return { uri: product.primary_image };
  return fallbackProductImage;
}

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      <Image source={productImageSource(product)} style={styles.productImage} resizeMode="cover" />
      <View style={styles.productBody}>
        <Text numberOfLines={2} style={styles.productTitle}>{product.title}</Text>
        <Price value={product.price} />
        <Text numberOfLines={1} style={styles.muted}>{product.neighborhood ? `${product.neighborhood}, ` : ""}{product.city}</Text>
      </View>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 16, gap: 14 },
  hero: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 18, gap: 12 },
  heroTitle: { color: colors.black, fontSize: 32, fontWeight: "900", letterSpacing: 0, lineHeight: 36 },
  heroText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  eyebrow: { color: colors.brand, fontSize: 11, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", letterSpacing: 0 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", letterSpacing: 0 },
  card: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: 8, borderWidth: 1, padding: 14, gap: 9 },
  input: { minHeight: 50, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 14, color: colors.text, fontSize: 15 },
  textarea: { minHeight: 112, paddingTop: 13, textAlignVertical: "top" },
  button: { minHeight: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: colors.brand, paddingHorizontal: 18 },
  buttonCompact: { minHeight: 40, paddingHorizontal: 14 },
  buttonSecondary: { backgroundColor: colors.white, borderColor: colors.brand, borderWidth: 1 },
  buttonGhost: { backgroundColor: "transparent" },
  buttonDanger: { backgroundColor: colors.red },
  buttonText: { color: colors.white, fontWeight: "900", letterSpacing: 0, fontSize: 13 },
  buttonSecondaryText: { color: colors.brandDark },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
  center: { flex: 1, minHeight: 180, gap: 12, alignItems: "center", justifyContent: "center" },
  productCard: { flex: 1, minWidth: "47%", backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, overflow: "hidden", marginBottom: 12 },
  productImage: { width: "100%", aspectRatio: 0.9, backgroundColor: colors.cream },
  productBody: { padding: 11, gap: 5 },
  productTitle: { color: colors.text, fontWeight: "800", fontSize: 13, letterSpacing: 0, lineHeight: 18 },
  price: { color: colors.text, fontWeight: "900", fontSize: 16 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  categoryPill: { minWidth: 150, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 14, marginRight: 8 },
  categoryText: { color: colors.text, fontWeight: "800", letterSpacing: 0 },
  errorText: { color: "#b42318", backgroundColor: colors.redSoft, borderColor: "#f3b8b8", borderWidth: 1, borderRadius: 8, padding: 12, lineHeight: 19 },
  emptyState: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 8, padding: 24, backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 8 },
  emptyTitle: { color: colors.text, fontWeight: "900", fontSize: 17 },
  badge: { alignSelf: "flex-start", borderRadius: 12, backgroundColor: colors.brandSoft, paddingHorizontal: 9, paddingVertical: 4 },
  badgeDanger: { backgroundColor: colors.redSoft },
  badgeText: { color: colors.brandDark, fontSize: 11, fontWeight: "900" },
  badgeDangerText: { color: "#b42318" },
  select: { minHeight: 54, flexDirection: "row", alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 8 },
  fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", marginBottom: 2 },
  selectValue: { color: colors.text, fontSize: 15 },
  selectPlaceholder: { color: "#98a2b3", fontSize: 15 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(12,17,20,0.45)" },
  modalSheet: { maxHeight: "72%", backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 18, paddingBottom: 28 },
  modalTitle: { fontSize: 20, fontWeight: "900", color: colors.text, marginBottom: 10 },
  optionRow: { minHeight: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomColor: colors.border, borderBottomWidth: 1 },
  optionText: { color: colors.text, fontSize: 15, fontWeight: "700" }
});
