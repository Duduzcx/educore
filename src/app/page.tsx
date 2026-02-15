
import { redirect } from 'next/navigation';

/**
 * Página raiz resiliente para a apresentação EduCore.
 * Redireciona para o login via servidor para otimizar o carregamento inicial.
 */
export default function HomePage() {
  redirect('/login');
}
