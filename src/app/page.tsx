import { redirect } from "next/navigation";

/**
 * Página raiz que gerencia o fluxo de entrada.
 * Força o redirecionamento para o login de forma limpa.
 */
export default function HomePage() {
  redirect("/login");
}