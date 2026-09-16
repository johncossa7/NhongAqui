import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Text } from "react-native";

import { apiRequest } from "../src/api/client";
import { Button, Input, Screen, styles } from "../src/components/ui";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const mutation = useMutation({
    mutationFn: () => apiRequest("/auth/password-reset/", {
      method: "POST",
      body: JSON.stringify({ email })
    })
  });
  return (
    <Screen>
      <Text style={styles.title}>Recuperar password</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Button title="Enviar instrucoes" onPress={() => void mutation.mutate()} />
      {mutation.isSuccess ? <Text style={styles.muted}>Se o email existir, enviaremos instrucoes.</Text> : null}
    </Screen>
  );
}
