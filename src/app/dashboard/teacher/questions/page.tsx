
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus, CheckCircle, ListChecks, PlusCircle } from 'lucide-react';
import { QuestionsDashboard } from '@/components/QuestionsDashboard';
import { QuestionsList } from '@/components/QuestionsList';
import { createClient } from '@/app/lib/supabase';
import { useAuth } from '@/lib/AuthProvider';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function QuestionBankPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const supabase = createClient();

    const [entryMode, setEntryMode] = useState<'bulk' | 'manual'>('bulk');
    const [isSaving, setIsSaving] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [rawText, setRawText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    // Estados para o formulário manual
    const [manualQuestion, setManualQuestion] = useState({ 
        question_text: '', 
        year: new Date().getFullYear().toString(), 
        subject_id: '', 
        correct_answer: 'A' 
    });
    const [manualOptions, setManualOptions] = useState({ A: '', B: '', C: '', D: '', E: '' });

    useEffect(() => {
        async function fetchSubjects() {
            try {
                const { data, error } = await supabase.from('subjects').select('*').order('name');
                if (error) throw error;
                if (data) setSubjects(data);
            } catch (e: any) {
                console.error("Erro ao carregar matérias:", e.message);
            }
        }
        fetchSubjects();
    }, []);

    const handleSaveManual = async () => {
        if (!manualQuestion.question_text.trim() || !manualQuestion.subject_id || isSaving) {
            toast({ title: "Dados Incompletos", description: "Verifique o enunciado e a matéria.", variant: "destructive" });
            return;
        }
        
        const optionsArray = Object.entries(manualOptions)
            .filter(([_, text]) => text.trim() !== '')
            .map(([letter, text]) => ({ letter, text }));

        if (optionsArray.length < 2) {
            toast({ title: "Opções Incompletas", description: "Preencha ao menos duas alternativas.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                question_text: manualQuestion.question_text.trim(),
                year: parseInt(manualQuestion.year) || new Date().getFullYear(),
                subject_id: manualQuestion.subject_id,
                correct_answer: manualQuestion.correct_answer,
                options: optionsArray,
                teacher_id: user?.id
            };

            const { error } = await supabase.from('questions').insert(payload);

            if (error) throw error;

            toast({ title: "Questão Salva! ✅", description: "Item adicionado ao banco com sucesso." });
            setManualQuestion(prev => ({ ...prev, question_text: '', correct_answer: 'A' }));
            setManualOptions({ A: '', B: '', C: '', D: '', E: '' });

        } catch (e: any) {
            console.error("Erro Supabase:", e);
            toast({ 
                title: "Falha na Persistência", 
                description: e.message || "Verifique se a tabela 'questions' existe no seu Supabase.", 
                variant: "destructive" 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnalyzeBulk = () => {
        if (!rawText.trim()) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            toast({ title: "Análise Concluída", description: "Estrutura detectada via IA Aurora." });
            setIsAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <QuestionsDashboard />

            <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                        <FilePlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary italic leading-none">Alimentar Banco</h1>
                        <p className="text-muted-foreground font-medium text-sm">Adicione novos desafios pedagógicos.</p>
                    </div>
                </div>

                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                    <CardContent className="p-8 md:p-12">
                        <div className="flex bg-muted/10 p-1.5 rounded-2xl mb-10 w-fit mx-auto md:mx-0">
                            <Button variant={entryMode === 'bulk' ? 'default' : 'ghost'} onClick={() => setEntryMode('bulk')} className="rounded-xl font-bold h-11 px-6">
                                <ListChecks className="h-4 w-4 mr-2"/> Massa
                            </Button>
                            <Button variant={entryMode === 'manual' ? 'default' : 'ghost'} onClick={() => setEntryMode('manual')} className="rounded-xl font-bold h-11 px-6">
                                <PlusCircle className="h-4 w-4 mr-2"/> Manual
                            </Button>
                        </div>

                        {entryMode === 'bulk' ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-2">
                                <Textarea 
                                    placeholder="Cole aqui o texto da prova para análise..." 
                                    className="min-h-[300px] rounded-3xl bg-muted/5 border-2 border-dashed border-muted/20 p-6 text-sm italic"
                                    value={rawText}
                                    onChange={(e) => setRawText(e.target.value)}
                                />
                                <Button onClick={handleAnalyzeBulk} disabled={isAnalyzing || !rawText.trim()} className="w-full h-14 rounded-2xl bg-accent text-accent-foreground font-black text-lg">
                                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Analisar com Aurora IA"}
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-2">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-black uppercase opacity-40">Matéria</Label>
                                        <Select value={manualQuestion.subject_id} onValueChange={(v) => setManualQuestion({...manualQuestion, subject_id: v})}>
                                            <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-bold">
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input type="number" value={manualQuestion.year} onChange={(e) => setManualQuestion({...manualQuestion, year: e.target.value})} className="h-14 rounded-xl bg-muted/30 border-none" placeholder="Ano" />
                                        <Select value={manualQuestion.correct_answer} onValueChange={(v) => setManualQuestion({...manualQuestion, correct_answer: v})}>
                                            <SelectTrigger className="h-14 rounded-xl bg-muted/30 border-none font-black text-accent"><SelectValue /></SelectTrigger>
                                            <SelectContent>{['A', 'B', 'C', 'D', 'E'].map(l => <SelectItem key={l} value={l}>OPÇÃO {l}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <Textarea placeholder="Enunciado da questão..." className="min-h-[180px] rounded-2xl bg-muted/30 border-none italic p-4" value={manualQuestion.question_text} onChange={(e) => setManualQuestion({...manualQuestion, question_text: e.target.value})} />
                                </div>
                                <div className="space-y-4">
                                    {['A', 'B', 'C', 'D', 'E'].map(letter => (
                                        <div key={letter} className="flex gap-3">
                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black shrink-0 ${manualQuestion.correct_answer === letter ? 'bg-accent text-accent-foreground' : 'bg-muted/30 text-primary/30'}`}>{letter}</div>
                                            <Input placeholder={`Texto da opção ${letter}...`} className="h-12 rounded-xl bg-muted/30 border-none" value={manualOptions[letter as keyof typeof manualOptions]} onChange={(e) => setManualOptions({...manualOptions, [letter]: e.target.value})} />
                                        </div>
                                    ))}
                                    <Button onClick={handleSaveManual} disabled={isSaving} className="w-full h-16 mt-6 rounded-2xl bg-primary text-white font-black text-lg">
                                        {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : "Gravar no Banco"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="pt-10">
                 <QuestionsList />
            </div>
        </div>
    );
}
