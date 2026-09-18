import { Tabs } from "expo-router";
import { Heart, Home, PlusCircle, Search, UserRound } from "lucide-react-native";
import { Image, Text, View } from "react-native";

import { colors } from "../../src/components/ui";
import { useUnreadCounts } from "../../src/hooks/useUnreadCounts";

const brandIcon = require("../../assets/branding/NhongAqui_Icon.png");

function BrandTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image source={brandIcon} style={{ width: 30, height: 30, borderRadius: 15 }} resizeMode="contain" />
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 1.6 }}>NHONGAQUI</Text>
    </View>
  );
}

export default function TabsLayout() {
  const unread = useUnreadCounts();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800" },
        tabBarStyle: { minHeight: 64, paddingTop: 7, borderTopColor: colors.border, backgroundColor: colors.white },
        tabBarBadgeStyle: { backgroundColor: colors.red, color: colors.white, fontSize: 10 },
        headerStyle: { backgroundColor: colors.white },
        headerShadowVisible: false,
        headerTitle: () => <BrandTitle />
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="search" options={{ title: "Pesquisar", tabBarIcon: ({ color }) => <Search color={color} size={22} /> }} />
      <Tabs.Screen name="sell" options={{ title: "Vender", tabBarIcon: ({ color }) => <PlusCircle color={color} size={26} /> }} />
      <Tabs.Screen name="favorites" options={{ title: "Favoritos", tabBarIcon: ({ color }) => <Heart color={color} size={22} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarBadge: unread.total || undefined, tabBarIcon: ({ color }) => <UserRound color={color} size={22} /> }} />
    </Tabs>
  );
}
