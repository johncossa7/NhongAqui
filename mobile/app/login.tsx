import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button, Input, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => router.replace("/profile")
  });

  return (
    <Screen>
      <Text style={styles.title}>Entrar</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input placeholder="Palavra-passe" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={mutation.isPending ? "A entrar..." : "Entrar"} onPress={() => void mutation.mutate()} />
      <Button title="Criar conta" muted onPress={() => router.push("/register")} />
      <Button title="Esqueci a password" muted onPress={() => router.push("/forgot-password")} />
    </Screen>
  );
}
