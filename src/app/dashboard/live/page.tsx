
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video, Construction, MonitorPlay, Calendar, Clock } from "lucide-react";

export default function LiveClassesPage() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Card className="bg-white shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Video className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-800">Aulas ao Vivo</span>
          </CardTitle>
          <CardDescription className="pt-2">Participe de aulas e monitorias em tempo real com nossos professores.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 border-2 border-dashed rounded-xl">
                <Construction className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Recurso em Desenvolvimento</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
                    Estamos construindo um ambiente de aulas ao vivo totalmente integrado. Em breve, você poderá ver a agenda, se inscrever e participar de transmissões diretamente por aqui.
                </p>
            </div>
        </CardContent>
      </Card>

       {/* Placeholder para a interface de aulas */}
        <div className="space-y-4 opacity-40">
            <h2 className="text-lg font-bold text-slate-700">Próximas Sessões</h2>
            <Card className="bg-white shadow-sm rounded-xl">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                         <div className="p-3 bg-blue-100 rounded-lg">
                            <MonitorPlay className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Revisão de Véspera: Ciências Humanas</p>
                            <p className="text-sm text-slate-500">Com Prof. Ricardo</p>
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
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-white shadow-sm rounded-xl">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                         <div className="p-3 bg-green-100 rounded-lg">
                            <MonitorPlay className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">Aulão de Redação Nota 1000</p>
                            <p className="text-sm text-slate-500">Com Profa. Mariana</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-600 pl-1 sm:pl-0">
                         <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>30/07</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>20:00</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
