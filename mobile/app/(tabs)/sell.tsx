import { AuthGate } from "../../src/components/AuthGate";
import { ProductForm } from "../../src/components/ProductForm";

export default function SellScreen() {
  return (
    <AuthGate message="Entre para publicar os seus produtos e falar com compradores.">
      <ProductForm />
    </AuthGate>
  );
}
