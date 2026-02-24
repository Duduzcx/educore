'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus, CheckCircle, ListChecks } from 'lucide-react';
import { QuestionsDashboard } from '@/components/QuestionsDashboard';
import { createClient } from '@/app/lib/supabase';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Subject = {
    id: string;
    name: string;
};

type ParsedQuestion = {
    tempId: string;
    question_number_in_source: number;
    question_text: string;
    options: { letter: string; text: string }[];
    correct_answer: string;
    year: number;
    subject_id: string; // Changed from subject to subject_id
};

// This function remains mostly the same, but now assigns a default subject_id
const parseExamText = (rawText: string, defaultSubjectId: string): { questions: ParsedQuestion[], errors: string[] } => {
    const questions: ParsedQuestion[] = [];
    let errors: string[] = [];

    const questionMarkers = Array.from(rawText.matchAll(/Questão\s*(\d+)/gi)).map(match => ({
        number: parseInt(match[1]),
        index: match.index,
        rawText: match[0],
    }));

    if (questionMarkers.length === 0) {
        return { questions: [], errors: ["Nenhuma questão encontrada."] };
    }

    questionMarkers.forEach((marker, i) => {
        const startIdx = marker.index;
        const endIdx = (i + 1 < questionMarkers.length) ? questionMarkers[i + 1].index : rawText.length;
        let block = rawText.substring(startIdx!, endIdx);

        const altMarkers = Array.from(block.matchAll(/^[A-E][\.)]/gm)).map(m => ({
            letter: m[0][0],
            index: m.index,
        }));


        if (altMarkers.length >= 4) {
            try {
                const enunciadoStart = block.indexOf(marker.rawText) + marker.rawText.length;
                const enunciadoEnd = altMarkers[0].index;
                const question_text = block.substring(enunciadoStart, enunciadoEnd).trim();

                const options = altMarkers.map((alt, j) => {
                    const optStart = alt.index! + alt.letter.length + 1;
                    const optEnd = (j + 1 < altMarkers.length) ? altMarkers[j + 1].index : block.length;
                    return { letter: alt.letter, text: block.substring(optStart, optEnd).trim() };
                });

                questions.push({
                    tempId: `q-${marker.number}`,
                    question_number_in_source: marker.number,
                    question_text,
                    options,
                    correct_answer: 'A', // Default correct answer
                    year: new Date().getFullYear(),
                    subject_id: defaultSubjectId, // Assign default subject_id
                });
            } catch (e) {
                errors.push(`Erro na Questão ${marker.number}`);
            }
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
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [defaultSubject, setDefaultSubject] = useState<string>('');

    const supabase = createClient();

    // Fetch subjects from the database
    useEffect(() => {
        const fetchSubjects = async () => {
            const { data, error } = await supabase.from('subjects').select('id, name');
            if (error) {
                toast({ title: "Erro ao buscar matérias", description: error.message, variant: 'destructive' });
            } else {
                setSubjects(data);
                const uncat = data.find(s => s.name === 'Não Categorizado');
                if (uncat) {
                    setDefaultSubject(uncat.id);
                }
            }
        };
        fetchSubjects();
    }, [supabase, toast]);


    const handleAnalyze = () => {
        if (!rawText.trim() || !defaultSubject) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            const { questions, errors } = parseExamText(rawText, defaultSubject);
            if (errors.length > 0) {
                toast({ title: "Erro na Análise", description: errors.join('\n'), variant: 'destructive' });
            }
            setExtractedQuestions(questions);
            setView('validate');
            setIsAnalyzing(false);
        }, 500);
    };

    const handleSubjectChange = (questionTempId: string, newSubjectId: string) => {
        setExtractedQuestions(prev =>
            prev.map(q => q.tempId === questionTempId ? { ...q, subject_id: newSubjectId } : q)
        );
    };

    const handleMasterSubjectChange = (newSubjectId: string) => {
        setExtractedQuestions(prev => prev.map(q => ({ ...q, subject_id: newSubjectId })));
    };

    const handleSaveAll = async () => {
        setIsSaving(true);

        const questionsToInsert = extractedQuestions.map(q => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            year: q.year,
            subject_id: q.subject_id,
            question_number_in_source: q.question_number_in_source,
        }));

        const { error } = await supabase.from('questions').insert(questionsToInsert);

        if (error) {
            toast({ title: "Erro ao Salvar", description: error.message, variant: 'destructive' });
            setIsSaving(false);
        } else {
            toast({ title: "Sucesso!", description: `${extractedQuestions.length} questões foram salvas no banco.` });
            setView('finished');
            setRawText('');
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* The new Dashboard component is here */}
            <QuestionsDashboard />

            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <FilePlus className="h-6 w-6 text-accent" />
                </div>
                <h1 className="text-3xl font-black text-primary italic">Adicionar Novas Questões</h1>
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardContent className="p-10">
                    {view === 'upload' && (
                        <div className="space-y-6">
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Importar Texto de Prova</Label>
                            <Textarea
                                placeholder="Cole o texto da prova aqui..."
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                className="rounded-xl bg-muted/30 border-none min-h-[300px] font-medium"
                            />
                            <div className="flex justify-end">
                                <Button onClick={handleAnalyze} disabled={isAnalyzing || !rawText || !defaultSubject} className="h-14 rounded-2xl font-black px-12 bg-primary">
                                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : "Analisar Conteúdo"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {view === 'validate' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <ListChecks className="h-8 w-8 text-accent" />
                                    <h3 className="text-2xl font-black text-primary italic">Validar Questões ({extractedQuestions.length})</h3>
                                </div>
                                <div className="w-1/3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Matéria para Todos</Label>
                                    <Select onValueChange={handleMasterSubjectChange}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Definir matéria para todos..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                                {extractedQuestions.map((q) => (
                                    <div key={q.tempId} className="p-4 bg-muted/20 rounded-xl border border-muted/30 grid grid-cols-3 gap-4 items-center">
                                        <div className="col-span-2">
                                            <p className="font-bold text-primary text-sm mb-1">Questão {q.question_number_in_source}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{q.question_text}</p>
                                        </div>
                                        <Select value={q.subject_id} onValueChange={(newId) => handleSubjectChange(q.tempId, newId)}>
                                            <SelectTrigger className="rounded-xl bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
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
                            <h3 className="text-2xl font-black text-primary italic">Importação Concluída!</h3>
                            <Button onClick={() => { setView('upload'); setRawText(''); setExtractedQuestions([]); }} className="h-14 rounded-2xl font-black px-10">Novo Arquivo</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
