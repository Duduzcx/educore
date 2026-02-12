
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Construction, FileCheck, FileX, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function LibraryCurationPage() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Card className="bg-white shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-slate-800">Gestão da Biblioteca e Curadoria</span>
          </CardTitle>
          <CardDescription className="pt-2">Revise, aprove ou rejeite materiais de estudo sugeridos pela comunidade.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 border-2 border-dashed rounded-xl">
                <Construction className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">Curadoria em Desenvolvimento</h3>
                <p className="text-sm text-slate-500 max-w-lg mx-auto mt-2">
                    Esta área está sendo preparada para que você possa gerenciar todo o acervo da Biblioteca Digital. Em breve, você poderá aprovar ou rejeitar materiais enviados por alunos, garantindo a qualidade do nosso conteúdo.
                </p>
            </div>
        </CardContent>
      </Card>

       {/* Placeholder para a interface de curadoria */}
      <div className="space-y-4 opacity-40">
        <div className="flex items-center gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Buscar por título ou autor..." className="pl-10 rounded-lg" disabled />
            </div>
            <Badge variant="outline" className="font-semibold">3 Itens Pendentes</Badge>
        </div>

        <Card className="bg-white shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="font-bold text-sm text-slate-700">Resumo de Sociologia</p>
                    <p className="text-xs text-slate-500">Enviado por: Joana Silva</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200"><FileCheck className="h-5 w-5" /></button>
                    <button className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200"><FileX className="h-5 w-5" /></button>
                </div>
            </CardContent>
        </Card>
         <Card className="bg-white shadow-sm rounded-xl">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="font-bold text-sm text-slate-700">Exercícios de Trigonometria</p>
                    <p className="text-xs text-slate-500">Enviado por: Carlos Andrade</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200"><FileCheck className="h-5 w-5" /></button>
                    <button className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200"><FileX className="h-5 w-5" /></button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
