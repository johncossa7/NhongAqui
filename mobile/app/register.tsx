import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Button, ErrorMessage, Input, Screen, SelectField, colors, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://web-production-d7b9f.up.railway.app";
const accountTypes = [
  { label: "Particular", value: "individual" },
  { label: "Profissional", value: "professional" },
  { label: "Empresa", value: "business" }
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    province: "Maputo",
    city: "Maputo",
    neighborhood: "",
    account_type: "individual"
  });
  const [legalAccepted, setLegalAccepted] = useState(false);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.phone.trim() || !form.password || !form.city.trim()) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }
      if (form.password.length < 8) throw new Error("A palavra-passe deve ter pelo menos 8 caracteres.");
      await register({ ...form, email: form.email.trim().toLowerCase(), accept_terms: legalAccepted, accept_privacy: legalAccepted });
    },
    onSuccess: () => router.replace("/profile")
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <Screen>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Crie uma conta para comprar, vender e conversar com segurança.</Text>
          <View style={styles.row}>
            <Input style={{ flex: 1 }} placeholder="Nome" value={form.first_name} onChangeText={(first_name) => setForm({ ...form, first_name })} />
            <Input style={{ flex: 1 }} placeholder="Apelido" value={form.last_name} onChangeText={(last_name) => setForm({ ...form, last_name })} />
          </View>
          <Input placeholder="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
          <Input placeholder="Telefone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" />
          <SelectField label="Tipo de conta" value={form.account_type} options={accountTypes} onChange={(account_type) => setForm({ ...form, account_type })} />
          <Input placeholder="Província" value={form.province} onChangeText={(province) => setForm({ ...form, province })} />
          <View style={styles.row}>
            <Input style={{ flex: 1 }} placeholder="Cidade" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
            <Input style={{ flex: 1 }} placeholder="Bairro" value={form.neighborhood} onChangeText={(neighborhood) => setForm({ ...form, neighborhood })} />
          </View>
          <Input placeholder="Palavra-passe" value={form.password} onChangeText={(password) => setForm({ ...form, password })} secureTextEntry textContentType="newPassword" />
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: legalAccepted }} onPress={() => setLegalAccepted((value) => !value)} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{ width: 22, height: 22, borderWidth: 1, borderRadius: 4, borderColor: colors.text, backgroundColor: legalAccepted ? colors.brand : colors.white, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.white, fontWeight: "900" }}>{legalAccepted ? "✓" : ""}</Text>
            </View>
            <Text style={{ flex: 1, color: colors.text, lineHeight: 21 }}>
              Li e aceito os <Text style={{ color: colors.brand, fontWeight: "800" }} onPress={() => void Linking.openURL(WEB_URL + "/termos")}>Termos</Text> e a <Text style={{ color: colors.brand, fontWeight: "800" }} onPress={() => void Linking.openURL(WEB_URL + "/privacidade")}>Política de Privacidade</Text>.
            </Text>
          </Pressable>
          <ErrorMessage error={mutation.error} />
          <Button title={mutation.isPending ? "A criar..." : legalAccepted ? "Criar conta" : "Aceite os termos"} disabled={mutation.isPending || !legalAccepted} onPress={() => mutation.mutate()} />
          <Button title="Já tenho conta" variant="ghost" onPress={() => router.replace("/login")} />
        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
