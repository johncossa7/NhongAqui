import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { Button, Input, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://web-production-d7b9f.up.railway.app";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    city: "Maputo"
  });
  const [legalAccepted, setLegalAccepted] = useState(false);
  const mutation = useMutation({
    mutationFn: () => register({ ...form, accept_terms: legalAccepted, accept_privacy: legalAccepted }),
    onSuccess: () => router.replace("/profile")
  });

  return (
    <Screen>
      <Text style={styles.title}>Criar conta</Text>
      <Input placeholder="Nome" value={form.first_name} onChangeText={(first_name) => setForm({ ...form, first_name })} />
      <Input placeholder="Apelido" value={form.last_name} onChangeText={(last_name) => setForm({ ...form, last_name })} />
      <Input placeholder="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} autoCapitalize="none" keyboardType="email-address" />
      <Input placeholder="Telefone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
      <Input placeholder="Cidade" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
      <Input placeholder="Palavra-passe" value={form.password} onChangeText={(password) => setForm({ ...form, password })} secureTextEntry />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: legalAccepted }}
        onPress={() => setLegalAccepted((value) => !value)}
        style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
      >
        <View style={{ width: 22, height: 22, borderWidth: 1, borderColor: "#111111", backgroundColor: legalAccepted ? "#008037" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ffffff", fontWeight: "900" }}>{legalAccepted ? "✓" : ""}</Text>
        </View>
        <Text style={{ flex: 1, color: "#374151", lineHeight: 21 }}>
          Li e aceito os <Text style={{ color: "#008037", fontWeight: "800" }} onPress={() => void Linking.openURL(`${WEB_URL}/termos`)}>Termos</Text> e a <Text style={{ color: "#008037", fontWeight: "800" }} onPress={() => void Linking.openURL(`${WEB_URL}/privacidade`)}>Política de Privacidade</Text>.
        </Text>
      </Pressable>
      <Button
        title={mutation.isPending ? "A criar..." : legalAccepted ? "Registar" : "Aceite os termos"}
        onPress={legalAccepted ? () => void mutation.mutate() : undefined}
      />
    </Screen>
  );
}
