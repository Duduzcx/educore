
"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, BookCheck, Target, Award, RotateCw, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/AuthProvider';

const SIMULATION_SIZE = 4; // Número de questões no simulado

type Question = {
  id: string;
  question_text: string;
  options: { letter: string; text: string }[];
  correct_answer: string;
};

type Answer = {
  questionId: string;
  selected: string;
  correct: string;
};

export default function SimuladoPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'active' | 'finished' | 'error'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!user) return;

    setGameState('loading');
    setError(null);

    try {
      // 1. Buscar IDs das questões já respondidas pelo usuário
      const { data: answeredQuestionsData, error: answeredError } = await supabase
        .from('exam_answers')
        .select('question_id')
        .eq('user_id', user.id);

      if (answeredError) throw answeredError;

      const answeredQuestionIds = answeredQuestionsData.map(a => a.question_id);

      // 2. Buscar novas questões, excluindo as já respondidas
      const { data, error: questionsError } = await supabase
        .from('exam_questions')
        .select('*')
        .not('id', 'in', `(${answeredQuestionIds.join(',')})`)
        .limit(SIMULATION_SIZE);

      if (questionsError) throw questionsError;

      if (!data || data.length === 0) {
        setError("Você já respondeu todas as questões disponíveis! Reinicie seu histórico se quiser praticar novamente.");
        setGameState('error');
        return;
      }
      
      // Para garantir aleatoriedade no cliente, já que .order('random()') pode ser ineficiente
      const shuffledData = [...data].sort(() => 0.5 - Math.random());

      setQuestions(shuffledData.slice(0, SIMULATION_SIZE) as Question[]);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setGameState('active');
    } catch (e: any) {
      console.error('Erro detalhado:', e);
      setError(e.message || "Ocorreu um erro ao carregar o simulado.");
      setGameState('error');
    }
  }, [user]);

  const saveAnswers = useCallback(async (finalAnswers: Answer[]) => {
    if (!user) return;

    const recordsToInsert = finalAnswers.map(answer => ({
        user_id: user.id,
        question_id: answer.questionId,
        selected_answer: answer.selected,
        is_correct: answer.selected === answer.correct
    }));

    const { error } = await supabase.from('exam_answers').insert(recordsToInsert);

    if (error) {
        console.error("Erro ao salvar respostas:", error);
        // Opcional: Adicionar um toast para informar o usuário sobre o erro ao salvar.
    }
  }, [user]);

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswer = {
      questionId: questions[currentQuestionIndex].id,
      selected: selectedAnswer,
      correct: questions[currentQuestionIndex].correct_answer,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState('finished');
      saveAnswers(newAnswers); // Salva as respostas no final
    }
  };

  const resetSimulation = () => {
    setGameState('idle');
  };

  const score = answers.filter(a => a.selected === a.correct).length;

  if (gameState === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
        <p className="text-lg font-black text-primary italic">Carregando simulado...</p>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
        <div className="h-full w-full flex items-center justify-center animate-in fade-in">
            <Card className="w-full max-w-lg text-center p-8 shadow-2xl rounded-[3rem] bg-white">
                <CardHeader>
                    <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
                    <CardTitle className="text-3xl font-black text-primary italic mt-4">Ops! Algo deu errado</CardTitle>
                    <CardDescription className="text-md font-medium text-muted-foreground mt-2">
                        {error}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={resetSimulation} className="h-14 rounded-2xl font-black text-lg px-10">
                        <RotateCw className="h-5 w-5 mr-3" />
                        Voltar ao Início
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (gameState === 'finished') {
    const performance = (score / questions.length) * 100;
    return (
      <div className="h-full w-full flex items-center justify-center animate-in fade-in">
        <Card className="w-full max-w-2xl text-center p-8 shadow-2xl rounded-[3rem] bg-white">
          <CardHeader>
            <Award className="h-16 w-16 mx-auto text-yellow-500" />
            <CardTitle className="text-4xl font-black text-primary italic mt-4">Simulado Concluído!</CardTitle>
            <CardDescription className="text-xl font-medium text-muted-foreground mt-2">
              Você acertou {score} de {questions.length} questões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-8">
                <Progress value={performance} className="h-4" />
                <p className='font-bold text-accent text-lg mt-2'>{performance.toFixed(0)}% de acerto</p>
            </div>
            <Button onClick={resetSimulation} className="h-14 rounded-2xl font-black text-lg px-10">
              <RotateCw className="h-5 w-5 mr-3" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in">
        <div className='mb-8'>
            <div className='flex justify-between items-center mb-2'>
                <p className='font-black text-accent text-sm'>QUESTÃO {currentQuestionIndex + 1} DE {questions.length}</p>
                <p className='font-bold text-sm text-primary'>{currentQuestion.subject} - {currentQuestion.year}</p>
            </div>
            <Progress value={progress} className="h-3" />
        </div>

        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white">
          <CardHeader className='p-8'>
            <CardDescription className="text-lg font-medium text-justify">{currentQuestion.question_text}</CardDescription>
          </CardHeader>
          <CardContent className='p-8 pt-4'>
            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} className="space-y-4">
              {currentQuestion.options.map((opt) => (
                <Label key={opt.letter} className='flex items-center gap-4 text-base p-5 rounded-2xl border-2 has-[input:checked]:border-accent has-[input:checked]:bg-accent/5 transition-all cursor-pointer'>
                  <RadioGroupItem value={opt.letter} id={opt.letter} />
                  <span className='font-bold mr-2'>{opt.letter}.</span>
                  <span>{opt.text}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="h-14 rounded-2xl font-black text-lg px-12 shadow-xl">
            {currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Finalizar'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
        <Card className="w-full max-w-lg text-center p-8 shadow-2xl rounded-[3rem] bg-white animate-in fade-in">
            <CardHeader>
                <BookCheck className="h-16 w-16 mx-auto text-accent" />
                <CardTitle className="text-4xl font-black text-primary italic mt-4">Simulado ENEM</CardTitle>
                <CardDescription className="text-lg font-medium text-muted-foreground mt-2">
                    Teste seus conhecimentos com questões reais de provas anteriores.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={fetchQuestions} className="h-16 rounded-2xl font-black text-xl px-12 mt-4 shadow-lg shadow-accent/20">
                    <Target className="h-6 w-6 mr-3" />
                    Começar Agora
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
