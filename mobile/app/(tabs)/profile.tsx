import { router } from "expo-router";
import { Bell, ChevronRight, FileCheck2, KeyRound, LogOut, MessageCircle, Package, ShieldCheck, Trash2, UserRound } from "lucide-react-native";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { Button, Card, Loading, Screen, StatusBadge, colors, styles } from "../../src/components/ui";
import { useUnreadCounts } from "../../src/hooks/useUnreadCounts";
import { useAuth } from "../../src/lib/auth";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://web-production-d7b9f.up.railway.app";

function MenuRow({ title, icon, badge, onPress, danger = false }: { title: string; icon: React.ReactNode; badge?: number; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, borderBottomColor: colors.border, borderBottomWidth: 1 }}>
      {icon}
      <Text style={{ flex: 1, color: danger ? colors.red : colors.text, fontWeight: "800" }}>{title}</Text>
      {badge ? <View style={{ minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 7, backgroundColor: colors.red, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.white, fontWeight: "900", fontSize: 11 }}>{badge}</Text></View> : null}
      <ChevronRight color={colors.muted} size={18} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, isLoading, logout } = useAuth();
  const unread = useUnreadCounts();
  if (isLoading) return <Loading label="A carregar o perfil..." />;
  if (!user) {
    return (
      <Screen>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Entre para publicar, guardar favoritos e enviar mensagens.</Text>
        <Button title="Entrar" onPress={() => router.push("/login")} />
        <Button title="Criar conta" variant="secondary" onPress={() => router.push("/register")} />
      </Screen>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
      <Screen>
        <Text style={styles.title}>A minha conta</Text>
        <Card>
          <View style={styles.row}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" }}><UserRound color={colors.brand} size={24} /></View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontWeight: "900", fontSize: 18, color: colors.text }}>{user.full_name}</Text>
              <Text style={styles.muted}>{user.email}</Text>
              <Text style={styles.muted}>{[user.neighborhood, user.city].filter(Boolean).join(", ")}</Text>
            </View>
            <StatusBadge value={user.verification_status} />
          </View>
          <Button title="Editar perfil" variant="secondary" compact onPress={() => router.push("/edit-profile")} />
        </Card>

        <Card>
          <MenuRow title="Os meus anúncios" icon={<Package color={colors.brand} size={21} />} onPress={() => router.push("/my-listings")} />
          <MenuRow title="Mensagens" badge={unread.messages} icon={<MessageCircle color={colors.brand} size={21} />} onPress={() => router.push("/messages")} />
          <MenuRow title="Notificações" badge={unread.notifications} icon={<Bell color={colors.brand} size={21} />} onPress={() => router.push("/notifications")} />
          <MenuRow title="Verificação da conta" icon={<FileCheck2 color={colors.brand} size={21} />} onPress={() => router.push("/verification")} />
        </Card>

        <Card>
          <MenuRow title="Alterar palavra-passe" icon={<KeyRound color={colors.text} size={21} />} onPress={() => router.push("/change-password")} />
          <MenuRow title="Termos de utilização" icon={<ShieldCheck color={colors.text} size={21} />} onPress={() => void Linking.openURL(WEB_URL + "/termos")} />
          <MenuRow title="Política de privacidade" icon={<ShieldCheck color={colors.text} size={21} />} onPress={() => void Linking.openURL(WEB_URL + "/privacidade")} />
          <MenuRow title="Anúncios proibidos" icon={<ShieldCheck color={colors.text} size={21} />} onPress={() => void Linking.openURL(WEB_URL + "/politica-de-anuncios")} />
          <MenuRow title="Ajuda e contactos" icon={<MessageCircle color={colors.text} size={21} />} onPress={() => void Linking.openURL(WEB_URL + "/contactos")} />
          <MenuRow title="Eliminar conta" danger icon={<Trash2 color={colors.red} size={21} />} onPress={() => router.push("/delete-account")} />
        </Card>
        <Button title="Sair" variant="secondary" icon={<LogOut color={colors.brand} size={18} />} onPress={() => void logout()} />
      </Screen>
    </ScrollView>
  );
}
