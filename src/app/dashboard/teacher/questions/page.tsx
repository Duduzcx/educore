"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FilePlus, Wand2, CheckCircle, ListChecks } from 'lucide-react';

const subjects = ["Matemática", "Física", "Química", "Biologia", "Linguagens", "História", "Geografia", "Filosofia", "Sociologia"];
const IGNORE_TEXTS = [
    "*010375BR", "leia atentamente as instruções", "enem2025", "caderno 3 | branco",
    "rascunho da redação", "transcreva no espaço apropriado", "ciências humanas e suas tecnologias"
];

type ParsedQuestion = {
    tempId: string;
    question_number_in_source: number;
    question_text: string;
    options: { letter: string; text: string }[];
    correct_answer: string;
    year: number;
    subject: string;
    language_option?: 'inglês' | 'espanhol';
};

const parseExamText = (rawText: string): { questions: ParsedQuestion[], errors: string[] } => {
    const questions: ParsedQuestion[] = [];
    let errors: string[] = [];

    const answers: { [key: number]: string } = {};
    const gabaritoSection = rawText.split(/GABARITO/i)[1];
    if (gabaritoSection) {
        const answerRegex = /(\d+)\s*[-–—]\s*([A-Ea-e])/g;
        let match;
        while ((match = answerRegex.exec(gabaritoSection)) !== null) {
            answers[parseInt(match[1])] = match[2].toUpperCase();
        }
    }

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
        let block = rawText.substring(startIdx, endIdx);

        if (IGNORE_TEXTS.some(term => block.toLowerCase().includes(term))) {
            if (block.length < 200 || !block.match(/[A-E]\)/)) { 
                errors.push(`Bloco da questão ${marker.number} ignorado.`);
                return;
            }
        }
        
        let language_option: 'inglês' | 'espanhol' | undefined = undefined;
        if (marker.number >= 1 && marker.number <= 5) {
             if (block.toLowerCase().includes('(opção inglês)') || block.toLowerCase().includes('option')) {
                language_option = 'inglês';
            } else if (block.toLowerCase().includes('(opção espanhol)')) {
                language_option = 'espanhol';
            }
        }

        const altMarkers = Array.from(block.matchAll(/^([A-E])(?:\)|\.)?\s/gm)).map(m => ({ letter: m[1], index: m.index }));

        if (altMarkers.length < 5) {
            errors.push(`Questão ${marker.number}: Erro nas alternativas.`);
            return;
        }

        try {
            const enunciadoStart = block.indexOf(marker.rawText) + marker.rawText.length;
            const enunciadoEnd = altMarkers[0].index;
            const question_text = block.substring(enunciadoStart, enunciadoEnd).replace(/\s+/g, ' ').trim();

            const options = altMarkers.map((alt, j) => {
                const optStart = alt.index + alt.letter.length + 1;
                const optEnd = (j + 1 < altMarkers.length) ? altMarkers[j + 1].index : block.length;
                const text = block.substring(optStart, optEnd).replace(/\s+/g, ' ').trim();
                return { letter: alt.letter, text };
            });

            questions.push({
                tempId: `q-${Date.now()}-${marker.number}-${i}`,
                question_number_in_source: marker.number,
                question_text,
                options,
                correct_answer: answers[marker.number] || 'A',
                year: new Date().getFullYear(),
                subject: language_option ? 'Linguagens' : 'Ciências Humanas',
                language_option
            });

        } catch(e) {
            errors.push(`Questão ${marker.number}: Erro crítico.`);
        }
    });

    return { questions, errors: [...new Set(errors)] };
};

function PdfImportManager() {
    const { toast } = useToast();
    const [rawText, setRawText] = useState('');
    const [extractedQuestions, setExtractedQuestions] = useState<ParsedQuestion[]>([]);
    const [parsingErrors, setParsingErrors] = useState<string[]>([]);
    const [view, setView] = useState<'upload' | 'validate' | 'finished'>('upload');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAnalyze = () => {
        if (!rawText.trim()) return;
        setIsAnalyzing(true);
        setTimeout(() => {
            const { questions, errors } = parseExamText(rawText);
            setExtractedQuestions(questions);
            setParsingErrors(errors);
            setView('validate');
            setIsAnalyzing(false);
        }, 500);
    };
    
    const handleSaveAll = async () => {
        setIsSaving(true);
        const recordsToInsert = extractedQuestions.map(q => ({
            year: q.year,
            subject: q.subject,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
        }));

        const { error } = await supabase.from('exam_questions').insert(recordsToInsert);
        if (!error) setView('finished');
        setIsSaving(false);
    };

    if (view === 'validate') {
        return (
            <div className='space-y-8 animate-in fade-in'>
                <div className='flex items-center gap-3'>
                    <ListChecks className="h-8 w-8 text-accent" />
                    <div>
                        <h3 className='text-2xl font-black text-primary italic'>Valide as Questões ({extractedQuestions.length})</h3>
                    </div>
                </div>
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4">
                    {extractedQuestions.map((q) => (
                        <Card key={q.tempId} className="bg-muted/30 p-4 rounded-2xl">
                            <p className="font-bold text-sm text-primary mb-2">QUESTÃO {q.question_number_in_source}</p>
                            <p className="text-sm mb-4">{q.question_text}</p>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-6 border-t">
                    <Button variant="ghost" onClick={() => setView('upload')}>Voltar</Button>
                    <Button onClick={handleSaveAll} disabled={isSaving} className="h-14 rounded-2xl font-black px-10 bg-accent text-accent-foreground">
                        {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Salvar Questões</>}
                    </Button>
                </div>
            </div>
        )
    }
    
    if (view === 'finished') {
        return (
             <div className="text-center p-8 animate-in fade-in">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-primary italic mb-2">Operação Concluída!</h3>
                <Button onClick={() => { setView('upload'); setRawText(''); }} className="h-14 rounded-2xl font-black px-10">Novo Arquivo</Button>
            </div>
        )
    }

    return (
        <div className='space-y-8 animate-in fade-in'>
            <Textarea 
                placeholder="Cole o texto aqui..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="rounded-xl bg-muted/50 text-xs p-4 min-h-[40vh]"
            />
            <div className="flex justify-end">
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !rawText} className="h-14 rounded-2xl font-black px-12 bg-blue-500 text-white">
                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : "Analisar Texto"}
                </Button>
            </div>
        </div>
    )
}

export default function QuestionBankPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
            <FilePlus className="h-10 w-10 text-accent"/>
            <div>
                <h1 className="text-3xl font-black text-primary italic">Banco de Questões</h1>
            </div>
        </div>
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white">
            <CardContent className="p-8">
                <PdfImportManager />
            </CardContent>
        </Card>
    </div>
  );
}
