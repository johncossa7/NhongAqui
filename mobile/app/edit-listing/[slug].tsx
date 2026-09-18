import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

import { apiRequest } from "../../src/api/client";
import type { Product } from "../../src/api/types";
import { AuthGate } from "../../src/components/AuthGate";
import { ProductForm } from "../../src/components/ProductForm";
import { ErrorMessage, Loading, Screen } from "../../src/components/ui";

export default function EditListingScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const product = useQuery({ queryKey: ["product", slug], queryFn: () => apiRequest<Product>(`/products/${slug}/`), enabled: Boolean(slug) });

  return (
    <AuthGate message="Entre para editar este anúncio.">
      {product.isLoading ? <Loading label="A carregar o anúncio..." /> : null}
      {product.error ? <Screen><ErrorMessage error={product.error} /></Screen> : null}
      {product.data ? <ProductForm product={product.data} /> : null}
    </AuthGate>
  );
}
