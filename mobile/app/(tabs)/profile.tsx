import { router } from "expo-router";
import { Text } from "react-native";

import { useAuth } from "../../src/lib/auth";
import { Button, Card, Screen, styles } from "../../src/components/ui";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  if (!user) {
    return (
      <Screen>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Entre para publicar, guardar favoritos e enviar mensagens.</Text>
        <Button title="Entrar" onPress={() => router.push("/login")} />
        <Button title="Criar conta" muted onPress={() => router.push("/register")} />
      </Screen>
    );
  }
  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      <Card>
        <Text style={{ fontWeight: "800", fontSize: 18 }}>{user.full_name}</Text>
        <Text style={styles.muted}>{user.email}</Text>
        <Text style={styles.muted}>{user.city}</Text>
      </Card>
      <Button title="Editar perfil" onPress={() => router.push("/edit-profile")} />
      <Button title="Meus anuncios" muted onPress={() => router.push("/my-listings")} />
      <Button title="Mensagens" muted onPress={() => router.push("/messages")} />
      <Button title="Sair" muted onPress={() => void logout()} />
    </Screen>
  );
}
