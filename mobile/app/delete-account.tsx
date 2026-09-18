import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";

import { apiRequest } from "../src/api/client";
import { AuthGate } from "../src/components/AuthGate";
import { Button, Card, ErrorMessage, Input, Screen, colors, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

export default function DeleteAccountScreen() {
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const remove = useMutation({
    mutationFn: () => apiRequest("/auth/account-delete/", { method: "POST", body: JSON.stringify({ current_password: password, confirmation }) }),
    onSuccess: async () => {
      await logout();
      Alert.alert("Conta eliminada", "Os seus dados pessoais foram removidos ou anonimizados.");
      router.replace("/");
    }
  });
  function confirmRemoval() {
    Alert.alert("Eliminar definitivamente?", "Esta ação não pode ser anulada. Os anúncios deixam de estar disponíveis.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove.mutate() }
    ]);
  }
  return (
    <AuthGate message="Entre para gerir a eliminação da sua conta.">
      <Screen>
        <Text style={styles.title}>Eliminar conta</Text>
        <Card style={{ borderColor: colors.red }}>
          <Text style={{ color: colors.red, fontWeight: "900" }}>Atenção: esta ação é definitiva.</Text>
          <Text style={styles.muted}>Confirme a sua palavra-passe e escreva ELIMINAR. As obrigações legais aplicáveis podem exigir a conservação limitada de alguns registos.</Text>
        </Card>
        <Input placeholder="Palavra-passe atual" value={password} onChangeText={setPassword} secureTextEntry />
        <Input placeholder='Escreva "ELIMINAR"' value={confirmation} onChangeText={setConfirmation} autoCapitalize="characters" />
        <ErrorMessage error={remove.error} />
        <Button title={remove.isPending ? "A eliminar..." : "Eliminar a minha conta"} variant="danger" disabled={remove.isPending || confirmation !== "ELIMINAR" || !password} onPress={confirmRemoval} />
      </Screen>
    </AuthGate>
  );
}
