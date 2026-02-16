"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, PlusCircle, Megaphone, AlertOctagon, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const initialAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Boas-vindas à Plataforma Compromisso!',
    message: 'Sejam todos bem-vindos! Explore as trilhas de estudo e não hesite em usar o fórum para tirar dúvidas.',
    priority: 'low',
    createdAt: new Date().toLocaleDateString('pt-BR'),
  },
  {
    id: 2,
    title: 'Manutenção Programada',
    message: 'A plataforma passará por uma manutenção rápida na próxima sexta-feira às 23h. Agradecemos a compreensão.',
    priority: 'medium',
    createdAt: new Date().toLocaleDateString('pt-BR'),
  },
];

type BadgeVariant = "secondary" | "destructive" | "default" | "outline";

const priorityStyles: Record<'low' | 'medium' | 'high', { variant: BadgeVariant; icon: any; label: string }> = {
  low: { variant: 'secondary', icon: Info, label: 'Normal' },
  medium: { variant: 'default', icon: Megaphone, label: 'Importante' },
  high: { variant: 'destructive', icon: AlertOctagon, label: 'Urgente' },
};

export default function CommunicationPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAnnouncement = () => {
    if (!newTitle.trim() || !newMessage.trim()) return;

    setIsCreating(true);
    setTimeout(() => {
      const newAnnouncement: Announcement = {
        id: Date.now(),
        title: newTitle,
        message: newMessage,
        priority: newPriority,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      };
      setAnnouncements([newAnnouncement, ...announcements]);
      setNewTitle('');
      setNewMessage('');
      setNewPriority('low');
      setIsCreating(false);
    }, 1000);
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-white shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PlusCircle className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-slate-800">Criar Novo Aviso</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Título do Aviso</label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Aula extra de matemática" className="rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Mensagem</label>
              <Textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Detalhes sobre o aviso..." className="rounded-lg min-h-[120px]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1 block">Prioridade</label>
              <Select value={newPriority} onValueChange={(v: any) => setNewPriority(v)}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Defina a urgência" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Normal</SelectItem>
                  <SelectItem value="medium">Importante</SelectItem>
                  <SelectItem value="high">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateAnnouncement} disabled={isCreating} className="w-full font-bold rounded-lg">
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />} Publicar Aviso
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-bold text-slate-700">Avisos Publicados</h2>
        {announcements.map((ann) => {
          const styles = priorityStyles[ann.priority];
          const Icon = styles.icon;
          return (
            <Card key={ann.id} className="bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-5 flex items-start gap-4">
                 <div className={`mt-1 p-2 rounded-full ${ann.priority === 'high' ? 'bg-red-100' : 'bg-slate-100'}`}>
                    <Icon className={`h-5 w-5 ${ann.priority === 'high' ? 'text-red-600' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">{ann.title}</h3>
                    <Badge variant={styles.variant}>{styles.label}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 mb-2">{ann.message}</p>
                  <p className="text-xs text-slate-400 font-medium">Publicado em: {ann.createdAt}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
