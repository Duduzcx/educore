
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FilePenLine, Image as ImageIcon, MapPin, Send, MessageSquare, CheckCircle2, AlertCircle, Search, ClipboardCheck } from "lucide-react";
import Image from "next/image";

const submissions = [
  { id: 1, student: "Ana Clara Silva", date: "Há 2 horas", topic: "Impactos da IA no Trabalho", status: "pending", type: "Redação" },
  { id: 2, student: "Marcos Pereira", date: "Há 5 horas", topic: "Sustentabilidade Urbana", status: "pending", type: "Redação" },
  { id: 3, student: "Julia Mendes", date: "Ontem", topic: "Simulado 04 - Matemática", status: "graded", score: 850, type: "Simulado" },
];

export default function AssessmentsGraderPage() {
  const [selectedEssay, setSelectedEssay] = useState<number | null>(null);
  const [pins, setPins] = useState<{ x: number, y: number, text: string }[]>([]);
  const [activePinInput, setActivePinInput] = useState<{ x: number, y: number } | null>(null);
  const [newPinText, setNewPinText] = useState("");

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedEssay) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActivePinInput({ x, y });
  };

  const addPin = () => {
    if (activePinInput && newPinText.trim()) {
      setPins([...pins, { ...activePinInput, text: newPinText }]);
      setActivePinInput(null);
      setNewPinText("");
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden min-h-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-primary italic flex items-center gap-3">
            Avaliações a Corrigir
            <Badge className="bg-accent text-accent-foreground border-none">PROFESSOR</Badge>
          </h1>
          <p className="text-muted-foreground font-medium">Analise submissões, fotos de redações e simulados pendentes.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar aluno..." className="pl-9 h-10 rounded-xl bg-white" />
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Lista de Envios */}
        <Card className="w-80 shrink-0 border-none shadow-xl flex flex-col overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-sm font-bold">Submissões Pendentes</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {submissions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedEssay(item.id)}
                  className={`p-4 text-left border-b last:border-0 hover:bg-accent/5 transition-all ${
                    selectedEssay === item.id ? 'bg-accent/10 border-l-4 border-l-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm text-primary">{item.student}</p>
                    <Badge variant={item.status === 'graded' ? 'secondary' : 'default'} className="text-[8px] h-4">
                      {item.status === 'graded' ? `NOTA: ${item.score}` : 'PENDENTE'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-accent">{item.type}</span>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{item.topic}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{item.date}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Interface de Correção */}
        <Card className="flex-1 border-none shadow-2xl bg-white flex flex-col overflow-hidden relative">
          {selectedEssay ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative bg-muted/20 overflow-auto flex items-center justify-center p-8">
                <div 
                  className="relative cursor-crosshair shadow-2xl rounded-sm border-2 border-white group"
                  onClick={handleImageClick}
                >
                  <Image 
                    src={`https://picsum.photos/seed/${selectedEssay}/800/1200`} 
                    alt="Avaliação do Aluno" 
                    width={600} 
                    height={900} 
                    className="max-w-full h-auto select-none"
                    draggable={false}
                  />
                  
                  {/* Pins existentes */}
                  {pins.map((pin, i) => (
                    <div 
                      key={i} 
                      className="absolute group/pin"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    >
                      <div className="h-6 w-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg -translate-x-1/2 -translate-y-1/2 border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                        <MapPin className="h-3 w-3" />
                      </div>
                      <div className="absolute top-8 left-0 z-20 w-48 bg-white p-3 rounded-xl shadow-2xl opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none border border-border/50">
                        <p className="text-[10px] font-bold text-primary">{pin.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Input de novo Pin */}
                  {activePinInput && (
                    <div 
                      className="absolute z-30"
                      style={{ left: `${activePinInput.x}%`, top: `${activePinInput.y}%` }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg -translate-x-1/2 -translate-y-1/2 animate-bounce">
                        <MapPin className="h-3 w-3" />
                      </div>
                      <Card className="absolute top-8 left-0 w-64 p-3 shadow-2xl border-none">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/50 mb-2 block">Anotação Pedagógica</Label>
                        <Textarea 
                          value={newPinText}
                          onChange={(e) => setNewPinText(e.target.value)}
                          placeholder="Digite o erro ou elogio..."
                          className="text-xs min-h-[60px] mb-3"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 text-[10px] h-8 font-bold" onClick={addPin}>Salvar</Button>
                          <Button size="sm" variant="ghost" className="h-8 text-[10px]" onClick={() => setActivePinInput(null)}>Cancelar</Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="h-20 border-t bg-muted/5 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Anotações</span>
                    <span className="text-lg font-black text-primary">{pins.length} pins inseridos</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="h-11 rounded-xl font-bold">Salvar Rascunho</Button>
                  <Button className="h-11 rounded-xl bg-primary text-white font-bold px-8 shadow-lg">Lançar Nota e Finalizar</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
              <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black text-primary italic">Selecione uma avaliação</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">Clique em um aluno na lista ao lado para iniciar a correção pedagógica.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
