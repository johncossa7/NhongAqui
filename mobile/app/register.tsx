import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button, Input, Screen, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";

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
  const mutation = useMutation({
    mutationFn: () => register(form),
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
      <Button title={mutation.isPending ? "A criar..." : "Registar"} onPress={() => void mutation.mutate()} />
    </Screen>
  );
}
