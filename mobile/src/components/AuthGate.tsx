import { router } from "expo-router";
import { LogIn } from "lucide-react-native";
import { Text } from "react-native";

import { Button, Loading, Screen, styles } from "./ui";
import { useAuth } from "../lib/auth";

export function AuthGate({ children, message }: { children: React.ReactNode; message: string }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading label="A verificar a sua sessão..." />;
  if (isAuthenticated) return <>{children}</>;

  return (
    <Screen>
      <Text style={styles.title}>Entre na sua conta</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <Button title="Entrar" icon={<LogIn color="#ffffff" size={18} />} onPress={() => router.push("/login")} />
      <Button title="Criar conta" variant="secondary" onPress={() => router.push("/register")} />
    </Screen>
  );
}
