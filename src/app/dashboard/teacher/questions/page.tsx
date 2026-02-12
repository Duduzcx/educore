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

// --- Advanced Parser Logic ---
const parseExamText = (rawText: string): { questions: ParsedQuestion[], errors: string[] } => {
    const questions: ParsedQuestion[] = [];
    let errors: string[] = [];

    // 1. Gabarito Extraction
    const answers: { [key: number]: string } = {};
    const gabaritoSection = rawText.split(/GABARITO/i)[1];
    if (gabaritoSection) {
        const answerRegex = /(\d+)\s*[-–—]\s*([A-Ea-e])/g;
        let match;
        while ((match = answerRegex.exec(gabaritoSection)) !== null) {
            answers[parseInt(match[1])] = match[2].toUpperCase();
        }
    }

    // 2. Structural Mapping
    const questionMarkers = Array.from(rawText.matchAll(/Quest\s*ão\s*(\d+)/gi)).map(match => ({
        number: parseInt(match[1]),
        index: match.index,
        rawText: match[0],
    }));

    if (questionMarkers.length === 0) {
        return { questions: [], errors: ["Nenhuma questão encontrada. Verifique o formato do texto."] };
    }

    // 3. Block-by-Block Contextual Analysis
    questionMarkers.forEach((marker, i) => {
        const startIdx = marker.index;
        const endIdx = (i + 1 < questionMarkers.length) ? questionMarkers[i + 1].index : rawText.length;
        let block = rawText.substring(startIdx, endIdx);

        // 3.1. Filter out ignored text patterns
        if (IGNORE_TEXTS.some(term => block.toLowerCase().includes(term))) {
             // Check if it's just instruction text before real content
            if (block.length < 200 || !block.match(/[A-E]\)/)) { 
                errors.push(`Bloco da questão ${marker.number} ignorado (provavelmente instruções).`);
                return;
            }
        }
        
        // 3.2. Contextual Language Detection
        let language_option: 'inglês' | 'espanhol' | undefined = undefined;
        if (marker.number >= 1 && marker.number <= 5) {
             if (block.toLowerCase().includes('(opção inglês)') || block.toLowerCase().includes('option')) {
                language_option = 'inglês';
            } else if (block.toLowerCase().includes('(opção espanhol)')) {
                language_option = 'espanhol';
            }
        }

        // 3.3. Flexible Alternative Marker Detection
        const altMarkers = Array.from(block.matchAll(/^([A-E])(?:\)|\.)?\s/gm)).map(m => ({ letter: m[1], index: m.index }));

        if (altMarkers.length < 5) {
            errors.push(`Questão ${marker.number}: Não foi possível encontrar todas as 5 alternativas com o padrão esperado (ex: A) ... B) ...).`);
            return;
        }

        // 3.4. Precise Content Extraction based on markers
        try {
            const enunciadoStart = block.indexOf(marker.rawText) + marker.rawText.length;
            const enunciadoEnd = altMarkers[0].index;
            const question_text = block.substring(enunciadoStart, enunciadoEnd).replace(/\s+/g, ' ').trim();

            const options = altMarkers.map((alt, j) => {
                const optStart = alt.index + alt.letter.length + 1; // After marker letter and separator
                const optEnd = (j + 1 < altMarkers.length) ? altMarkers[j + 1].index : block.length;
                const text = block.substring(optStart, optEnd).replace(/\s+/g, ' ').trim();
                return { letter: alt.letter, text };
            });

            if (question_text.length < 10 || options.some(o => !o.text)) {
                 errors.push(`Questão ${marker.number}: Falha na extração (enunciado ou alternativas parecem vazios).`);
                 return;
            }

            questions.push({
                tempId: `q-${Date.now()}-${marker.number}-${i}`, // Ensure unique key
                question_number_in_source: marker.number,
                question_text,
                options,
                correct_answer: answers[marker.number] || 'A',
                year: new Date().getFullYear(),
                subject: language_option ? 'Linguagens' : 'Ciências Humanas', // Simple logic
                language_option
            });

        } catch(e) {
            errors.push(`Questão ${marker.number}: Erro crítico durante a extração.`);
        }
    });

    // Remove duplicates from errors
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
        if (!rawText.trim()) {
            toast({ variant: "destructive", title: "Texto vazio!", description: "Por favor, cole o texto do PDF antes de analisar." });
            return;
        }
        setIsAnalyzing(true);
        setTimeout(() => {
            const { questions, errors } = parseExamText(rawText);
            setExtractedQuestions(questions);
            setParsingErrors(errors);
            setView('validate');
            toast({
                title: `Análise Concluída: ${questions.length} questões extraídas.`,
                description: errors.length > 0 ? `${errors.length} blocos não puderam ser analisados.` : 'Todos os blocos foram analisados com sucesso.'
            });
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
        
        if (error) {
            toast({ variant: "destructive", title: "Erro ao Salvar", description: `Ocorreu um erro no banco de dados: ${error.message}` });
        } else {
            toast({ title: "Sucesso!", description: `${recordsToInsert.length} questões foram salvas no banco de dados.` });
            setView('finished');
        }
        setIsSaving(false);
    };

     if (view === 'validate') {
        return (
            <div className='space-y-8 animate-in fade-in'>
                <div className='flex items-center gap-3'>
                    <ListChecks className="h-8 w-8 text-accent" />
                    <div>
                        <h3 className='text-2xl font-black text-primary italic'>Valide as Questões ({extractedQuestions.length})</h3>
                        <p className='text-muted-foreground text-sm'>Confira os dados extraídos, ajuste a matéria e a resposta correta antes de salvar.</p>
                    </div>
                </div>

                {parsingErrors.length > 0 && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md">
                        <h4 className="font-bold">Avisos da Análise ({parsingErrors.length}):</h4>
                        <ul className="list-disc list-inside text-sm mt-2 max-h-24 overflow-y-auto">
                            {parsingErrors.map((err, i) => <li key={i}>{err}</li>)}
                        </ul>
                    </div>
                )}
                
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 -mr-4">
                    {extractedQuestions.map((q) => (
                        <Card key={q.tempId} className="bg-muted/30 p-4 rounded-2xl">
                             <p className="font-bold text-sm text-primary mb-2">QUESTÃO {q.question_number_in_source} {q.language_option ? `(${q.language_option})` : ''}</p>
                            <p className="text-sm text-justify mb-4 font-medium">{q.question_text}</p>
                            <div className="grid grid-cols-2 gap-4">
                                <Select defaultValue={q.subject}>
                                    <SelectTrigger className="h-11 rounded-lg bg-white font-bold text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>{subjects.map(s => <SelectItem key={s} value={s} className="font-bold text-xs">{s}</SelectItem>)}</SelectContent>
                                </Select>
                                <Select defaultValue={q.correct_answer}>
                                    <SelectTrigger className="h-11 rounded-lg bg-white font-bold text-xs">Correta: <SelectValue /></SelectTrigger>
                                    <SelectContent>{q.options.map(opt => <SelectItem key={opt.letter} value={opt.letter} className="font-bold text-xs">{opt.letter}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-6 border-t">
                    <Button variant="ghost" onClick={() => setView('upload')}>Voltar e Editar</Button>
                    <Button onClick={handleSaveAll} disabled={isSaving || extractedQuestions.length === 0} className="h-14 rounded-2xl font-black text-lg px-10 shadow-xl bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Salvar {extractedQuestions.length} Questões</>}
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
                <p className="text-muted-foreground mb-8">As novas questões já estão disponíveis para os alunos nos simulados.</p>
                <Button onClick={() => { setView('upload'); setRawText(''); }} className="h-14 rounded-2xl font-black text-lg px-10">
                    Importar Novo Arquivo
                </Button>
            </div>
        )
    }

    return (
        <div className='space-y-8 animate-in fade-in'>
            <div>
                <h3 className='text-lg font-bold text-primary'>Importação Rápida de PDF</h3>
                <p className='text-muted-foreground text-sm'>Copie o conteúdo de um arquivo de prova (Ctrl+A, Ctrl+C) e cole no campo abaixo.</p>
            </div>
            <Textarea 
                placeholder="Cole aqui o texto completo copiado de um PDF de prova..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="rounded-xl bg-muted/50 text-xs p-4 min-h-[40vh] font-mono"
                required
            />
            <div className="flex justify-end">
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !rawText} className="h-14 rounded-2xl font-black text-lg px-12 shadow-xl bg-blue-500 hover:bg-blue-600 text-white">
                    {isAnalyzing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Wand2 className="h-6 w-6 mr-3" /> Analisar Texto</>}
                </Button>
            </div>
        </div>
    )
}

export default function QuestionBankPage() {
  return (
    <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <div className="flex items-center gap-4">
                <FilePlus className="h-10 w-10 text-accent"/>
                <div>
                    <h1 className="text-3xl font-black text-primary italic">Banco de Questões</h1>
                    <p className="text-muted-foreground font-medium">Adicione novas questões para os simulados da plataforma.</p>
                </div>
            </div>
        </div>
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white mt-6">
            <CardContent className="p-8">
                <PdfImportManager />
            </CardContent>
        </Card>
    </div>
  );
}
