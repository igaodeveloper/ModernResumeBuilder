import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Página não encontrada</h2>
      <p className="mb-4">A página que você procura não existe.</p>
      <a href="/login" className="text-blue-700 underline">Voltar para o início</a>
    </div>
  );
}
