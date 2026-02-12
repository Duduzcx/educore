"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus, CheckCircle, ListChecks } from 'lucide-react';

type ParsedQuestion = {
    tempId: string;
    question_number_in_source: number;
    question_text: string;
    options: { letter: string; text: string }[];
    correct_answer: string;
    year: number;
    subject: string;
};

const parseExamText = (rawText: string): { questions: ParsedQuestion[], errors: string[] } => {
    const questions: ParsedQuestion[] = [];
    let errors: string[] = [];

    const questionMarkers = Array.from(rawText.matchAll(/Quest\s*ão\s*(\d+)/gi)).map(match => ({
        number: parseInt(match[1]),
        index: match.index,
        rawText: match[0],
    }));

    if (questionMarkers.length === 0) {
        return { questions: [], errors: ["Nenhuma questão encontrada. Verifique o formato do texto."] };
    }

    questionMarkers.forEach((marker, i) => {
        const startIdx = marker.index;
        const endIdx = (i + 1 < questionMarkers.length) ? questionMarkers[i + 1].index : rawText.length;
        let block = rawText.substring(startIdx!, endIdx);

        const altMarkers = Array.from(block.matchAll(/^([A-E])(?:\)|\.)?\s/gm)).map(m => ({ letter: m[1], index: m.index }));

        if (altMarkers.length < 5) {
            errors.push(`Questão ${marker.number}: Formato de alternativas inválido.`);
            return;
        }

        try {
            const enunciadoStart = block.indexOf(marker.rawText) + marker.rawText.length;
            const enunciadoEnd = altMarkers[0].index;
            const question_text = block.substring(enunciadoStart, enunciadoEnd).trim();

            const options = altMarkers.map((alt, j) => {
                const optStart = alt.index + alt.letter.length + 1;
                const optEnd = (j + 1 < altMarkers.length) ? altMarkers[j + 1].index : block.length;
                return { letter: alt.letter, text: block.substring(optStart, optEnd).trim() };
            });

            questions.push({
                tempId: `q-${marker.number}`,
                question_number_in_source: marker.number,
                question_text,
                options,
                correct_answer: 'A',
                year: new Date().getFullYear(),
                subject: 'Geral'
            });
        } catch(e) {
            errors.push(`Questão ${marker.number}: Erro no processamento.`);
        }
    });

    return { questions, errors };
};

export default function QuestionBankPage() {
    const { toast } = useToast();
    const [rawText, setRawText] = useState('');
    const [extractedQuestions, setExtractedQuestions] = useState<ParsedQuestion[]>([]);
    const [view, setView] = useState<'upload' | 'validate' | 'finished'>('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAnalyze = () => {
        if (!rawText.trim()) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            const { questions } = parseExamText(rawText);
            setExtractedQuestions(questions);
            setView('validate');
            setIsAnalyzing(false);
        }, 500);
    };
    
    const handleSaveAll = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('learning_contents').insert(
            extractedQuestions.map(q => ({
                title: `Questão ${q.question_number_in_source}`,
                type: 'quiz',
                description: JSON.stringify([q])
            }))
        );
        if (!error) {
            toast({ title: "Questões Importadas!", description: "O banco foi atualizado." });
            setView('finished');
        } else {
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <FilePlus className="h-10 w-10 text-accent"/>
                <h1 className="text-3xl font-black text-primary italic">Banco de Questões</h1>
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-10">
                    {view === 'upload' && (
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Importar Texto de Prova</Label>
                            <Textarea 
                                placeholder="Cole o texto da prova aqui (ex: Questão 1... A) opção...)"
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                className="rounded-xl bg-muted/30 border-none min-h-[300px] font-medium"
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleAnalyze} disabled={isAnalyzing || !rawText} className="h-14 rounded-2xl font-black px-12 bg-primary">
                                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : "Analisar Conteúdo"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === 'validate' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <ListChecks className="h-8 w-8 text-accent" />
                                <h3 className="text-2xl font-black text-primary italic">Validar Importação ({extractedQuestions.length})</h3>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                                {extractedQuestions.map((q) => (
                                    <div key={q.tempId} className="p-4 bg-muted/20 rounded-xl border border-muted/30">
                                        <p className="font-bold text-primary text-sm mb-1">Questão {q.question_number_in_source}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{q.question_text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t">
                                <Button variant="ghost" onClick={() => setView('upload')} className="font-bold">Voltar</Button>
                                <Button onClick={handleSaveAll} disabled={isSaving} className="h-14 rounded-2xl font-black px-10 bg-accent text-accent-foreground">
                                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : "Salvar no Banco"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === 'finished' && (
                        <div className="text-center py-10 space-y-6">
                            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle className="h-10 w-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-primary italic">Importação Concluída!</h3>
                                <p className="text-muted-foreground font-medium mt-2">As questões já estão disponíveis para suas trilhas.</p>
                            </div>
                            <Button onClick={() => { setView('upload'); setRawText(''); }} className="h-14 rounded-2xl font-black px-10">Novo Arquivo</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
