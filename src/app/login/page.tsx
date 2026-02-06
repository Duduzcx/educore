
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-black p-4 sm:p-8 relative overflow-hidden">
      {/* CAMADA DE GRADIENTE ESTÁTICO (SUBSTITUIÇÃO DO VÍDEO) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-950 via-blue-950 to-primary" />

      {/* Importa e renderiza o formulário interativo como um Client Component */}
      <LoginForm />
    </div>
  );
}
