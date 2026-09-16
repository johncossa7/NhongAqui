import { Heart, Home, PlusCircle, Search, UserRound } from "lucide-react-native";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

import { colors } from "../../src/components/ui";

const brandIcon = require("../../assets/branding/NhongAqui_Icon.png");

function BrandTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image source={brandIcon} style={{ width: 28, height: 28, borderRadius: 6 }} resizeMode="contain" />
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 1.6 }}>NHONGAQUI</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
        tabBarStyle: { minHeight: 64, paddingTop: 8, borderTopColor: "#111111", backgroundColor: "#ffffff" },
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTitle: () => <BrandTitle />
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="search" options={{ title: "Pesquisar", tabBarIcon: ({ color }) => <Search color={color} size={22} /> }} />
      <Tabs.Screen name="sell" options={{ title: "Vender", tabBarIcon: ({ color }) => <PlusCircle color={color} size={26} /> }} />
      <Tabs.Screen name="favorites" options={{ title: "Favoritos", tabBarIcon: ({ color }) => <Heart color={color} size={22} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color }) => <UserRound color={color} size={22} /> }} />
    </Tabs>
  );
}
