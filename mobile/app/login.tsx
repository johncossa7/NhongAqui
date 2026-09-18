import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text } from "react-native";

import { Button, ErrorMessage, Input, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      if (!email.trim() || !password) throw new Error("Introduza o email e a palavra-passe.");
      await login(email.trim().toLowerCase(), password);
    },
    onSuccess: () => router.replace("/profile")
  });
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Aceda aos seus anúncios, favoritos e conversas.</Text>
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" />
        <Input placeholder="Palavra-passe" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" />
        <ErrorMessage error={mutation.error} />
        <Button title={mutation.isPending ? "A entrar..." : "Entrar"} disabled={mutation.isPending} onPress={() => mutation.mutate()} />
        <Button title="Criar conta" variant="secondary" onPress={() => router.push("/register")} />
        <Text style={[styles.muted, { textAlign: "center" }]}>A recuperação por email está temporariamente indisponível. O suporte poderá ajudar a recuperar o acesso.</Text>
      </Screen>
    </KeyboardAvoidingView>
  );
}
