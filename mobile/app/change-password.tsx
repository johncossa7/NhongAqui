import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";

import { apiRequest } from "../src/api/client";
import { AuthGate } from "../src/components/AuthGate";
import { Button, ErrorMessage, Input, Screen, styles } from "../src/components/ui";

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const change = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) throw new Error("A nova palavra-passe deve ter pelo menos 8 caracteres.");
      if (newPassword !== confirmation) throw new Error("As novas palavras-passe não coincidem.");
      return apiRequest("/auth/password-change/", { method: "POST", body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) });
    },
    onSuccess: () => {
      Alert.alert("Palavra-passe alterada", "A sua palavra-passe foi atualizada.");
      router.back();
    }
  });
  return (
    <AuthGate message="Entre para alterar a palavra-passe.">
      <Screen>
        <Text style={styles.title}>Alterar palavra-passe</Text>
        <Input placeholder="Palavra-passe atual" value={oldPassword} onChangeText={setOldPassword} secureTextEntry />
        <Input placeholder="Nova palavra-passe" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <Input placeholder="Confirmar nova palavra-passe" value={confirmation} onChangeText={setConfirmation} secureTextEntry />
        <ErrorMessage error={change.error} />
        <Button title={change.isPending ? "A alterar..." : "Alterar palavra-passe"} disabled={change.isPending} onPress={() => change.mutate()} />
      </Screen>
    </AuthGate>
  );
}
