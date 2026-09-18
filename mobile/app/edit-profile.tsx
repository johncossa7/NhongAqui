import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";

import { apiRequest } from "../src/api/client";
import type { User } from "../src/api/types";
import { AuthGate } from "../src/components/AuthGate";
import { Button, ErrorMessage, Input, Loading, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

export default function EditProfileScreen() {
  const { isAuthenticated, refreshMe } = useAuth();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => apiRequest<User>("/profile/"), enabled: isAuthenticated });
  const [form, setForm] = useState<Partial<User>>({});
  useEffect(() => {
    if (profile.data) setForm(profile.data);
  }, [profile.data]);
  const save = useMutation({
    mutationFn: () => apiRequest<User>("/profile/", { method: "PATCH", body: JSON.stringify(form) }),
    onSuccess: async () => {
      await refreshMe();
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.back();
    }
  });
  return (
    <AuthGate message="Entre para editar o seu perfil.">
    {profile.isLoading ? <Loading label="A carregar o perfil..." /> :
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
    <Screen>
      <Text style={styles.title}>Editar perfil</Text>
      <Input placeholder="Nome" value={form.first_name ?? ""} onChangeText={(first_name) => setForm({ ...form, first_name })} />
      <Input placeholder="Apelido" value={form.last_name ?? ""} onChangeText={(last_name) => setForm({ ...form, last_name })} />
      <Input placeholder="Telefone" value={form.phone ?? ""} onChangeText={(phone) => setForm({ ...form, phone })} />
      <Input placeholder="Provincia" value={form.province ?? ""} onChangeText={(province) => setForm({ ...form, province })} />
      <Input placeholder="Cidade" value={form.city ?? ""} onChangeText={(city) => setForm({ ...form, city })} />
      <Input placeholder="Bairro" value={form.neighborhood ?? ""} onChangeText={(neighborhood) => setForm({ ...form, neighborhood })} />
      <ErrorMessage error={profile.error ?? save.error} />
      <Button title={save.isPending ? "A guardar..." : "Guardar"} disabled={save.isPending} onPress={() => void save.mutate()} />
    </Screen>
    </ScrollView>}
    </AuthGate>
  );
}
