import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ScrollView, Text } from "react-native";

import { apiRequest, normalizePage } from "../src/api/client";
import type { Paginated, VerificationRequest } from "../src/api/types";
import { AuthGate } from "../src/components/AuthGate";
import { Button, Card, ErrorMessage, Input, Loading, Screen, SelectField, StatusBadge, styles } from "../src/components/ui";
import { useAuth } from "../src/lib/auth";
import { formatDate } from "../src/lib/products";

const documentTypes = [
  { label: "BI", value: "bi" },
  { label: "Passaporte", value: "passport" },
  { label: "DIRE", value: "dire" },
  { label: "Outro", value: "other" }
];

export default function VerificationScreen() {
  const { user, refreshMe } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: user?.full_name ?? "", phone: user?.phone ?? "", nuit: "", document_type: "bi", document_number: "" });
  useEffect(() => {
    if (user) setForm((current) => ({ ...current, full_name: current.full_name || user.full_name, phone: current.phone || user.phone || "" }));
  }, [user]);
  const requests = useQuery({ queryKey: ["verification"], queryFn: async () => normalizePage(await apiRequest<Paginated<VerificationRequest>>("/verification/")), enabled: Boolean(user) });
  const submit = useMutation({
    mutationFn: () => apiRequest<VerificationRequest>("/verification/", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["verification"] });
      await refreshMe();
    }
  });
  const pending = requests.data?.some((request) => request.status === "pending");
  const verified = user?.verification_status === "verified";

  return (
    <AuthGate message="Entre para pedir a verificação da conta.">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <Screen>
          <Text style={styles.title}>Verificação da conta</Text>
          <Text style={styles.subtitle}>O pedido é analisado manualmente por um administrador. Nesta fase não enviamos códigos por email nem recebemos documentos pela app.</Text>
          {requests.isLoading ? <Loading /> : null}
          {requests.data?.map((request) => (
            <Card key={request.id}>
              <StatusBadge value={request.status} />
              <Text style={{ fontWeight: "800" }}>{request.document_type.toUpperCase()} {request.document_number}</Text>
              <Text style={styles.muted}>Enviado em {formatDate(request.submitted_at)}</Text>
              {request.rejection_reason ? <Text style={styles.errorText}>{request.rejection_reason}</Text> : null}
            </Card>
          ))}
          {!pending && !verified ? (
            <>
              <Input placeholder="Nome completo" value={form.full_name} onChangeText={(full_name) => setForm({ ...form, full_name })} />
              <Input placeholder="Telefone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" />
              <Input placeholder="NUIT (opcional)" value={form.nuit} onChangeText={(nuit) => setForm({ ...form, nuit })} keyboardType="number-pad" />
              <SelectField label="Tipo de documento" value={form.document_type} options={documentTypes} onChange={(document_type) => setForm({ ...form, document_type })} />
              <Input placeholder="Número do documento" value={form.document_number} onChangeText={(document_number) => setForm({ ...form, document_number })} />
              <ErrorMessage error={submit.error} />
              <Button title={submit.isPending ? "A enviar..." : "Enviar para análise"} disabled={submit.isPending || !form.full_name || !form.phone || !form.document_number} onPress={() => submit.mutate()} />
            </>
          ) : null}
        </Screen>
      </ScrollView>
    </AuthGate>
  );
}
