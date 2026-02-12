
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Construction } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Card className="bg-white shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-800">BI & Analytics</span>
          </CardTitle>
          <CardDescription className="pt-2">Métricas de engajamento e performance da plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 border-2 border-dashed rounded-xl">
                <Construction className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Página em Construção</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                    Nosso futuro painel de Business Intelligence está sendo desenvolvido. Em breve, você poderá visualizar gráficos interativos sobre o engajamento dos alunos, progresso nas trilhas e muito mais.
                </p>
            </div>
        </CardContent>
      </Card>

      {/* Placeholder para futuros gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-40">
          <Card className="bg-white shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base font-bold text-slate-600">Alunos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">[Gráfico de Linha]</div>
            </CardContent>
          </Card>
           <Card className="bg-white shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base font-bold text-slate-600">Progresso nas Trilhas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">[Gráfico de Barra]</div>
            </CardContent>
          </Card>
           <Card className="bg-white shadow-sm rounded-2xl">
            <CardHeader>
                <CardTitle className="text-base font-bold text-slate-600">Engajamento (Fóruns)</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-medium">[Gráfico de Pizza]</div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
