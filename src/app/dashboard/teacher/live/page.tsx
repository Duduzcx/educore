
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonitorPlay, Construction, PlusCircle, Video, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ManageLivePage() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Card className="bg-white shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MonitorPlay className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-800">Gerenciar Aulas ao Vivo</span>
          </CardTitle>
          <CardDescription className="pt-2">Crie, agende e inicie suas transmissões e monitorias para os alunos.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 border-2 border-dashed rounded-xl">
                <Construction className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Ferramenta em Desenvolvimento</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                    Estamos finalizando nossa suíte de streaming. Em breve, você poderá agendar e gerenciar suas aulas ao vivo, com integração de chat e materiais, diretamente desta página.
                </p>
            </div>
        </CardContent>
      </Card>

       {/* Placeholder para a interface de gerenciamento */}
      <div className="space-y-4 opacity-40">
         <Button disabled className="font-bold rounded-lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Aula ao Vivo
        </Button>
        
        <h2 className="text-lg font-bold text-slate-700 pt-4">Suas Próximas Aulas</h2>

        <Card className="bg-white shadow-sm rounded-xl">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                     <div className="p-3 bg-blue-100 rounded-lg">
                        <Video className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">Revisão de Véspera: Ciências Humanas</p>
                        <p className="text-sm text-slate-500">Status: Agendada</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-600 pl-1 sm:pl-0">
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>28/07</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>19:00</span>
                    </div>
                    <Button variant="outline" size="sm" disabled>Iniciar</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
