
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, BookCheck, Target, Award, RotateCw, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/lib/AuthProvider';

const SIMULATION_SIZE = 10;

type Question = {
  id: string;
  question_text: string;
  options: { letter: string; text: string }[];
  correct_answer: string;
  subject: string;
  year: number;
};

type Answer = {
  questionId: string;
  selected: string;
  correct: string;
};

const mockQuestions: Question[] = [
  {
    id: 'q1',
    question_text: 'Em uma competição de ciências, uma equipe constrói um pequeno robô que se move em linha reta. A função que descreve a posição (P) do robô em metros, em relação ao tempo (t) em segundos, é P(t) = 2t + 3. Qual é a posição do robô após 5 segundos?',
    options: [
      { letter: 'a', text: '10 metros' },
      { letter: 'b', text: '13 metros' },
      { letter: 'c', text: '8 metros' },
      { letter: 'd', text: '15 metros' },
    ],
    correct_answer: 'b',
    subject: 'Matemática',
    year: 2023,
  },
  {
    id: 'q2',
    question_text: 'Qual das seguintes organelas celulares é responsável pela respiração celular e produção de ATP?',
    options: [
      { letter: 'a', text: 'Retículo Endoplasmático' },
      { letter: 'b', text: 'Complexo de Golgi' },
      { letter: 'c', text: 'Mitocôndria' },
      { letter: 'd', text: 'Lisossomo' },
    ],
    correct_answer: 'c',
    subject: 'Biologia',
    year: 2022,
  },
  {
    id: 'q3',
    question_text: 'A Lei da Inércia, ou Primeira Lei de Newton, afirma que um corpo em repouso tende a permanecer em repouso, a menos que uma força externa atue sobre ele. Essa afirmação está...',
    options: [
      { letter: 'a', text: 'Correta' },
      { letter: 'b', text: 'Incorreta' },
      { letter: 'c', text: 'Parcialmente correta' },
      { letter: 'd', text: 'Relativa' },
    ],
    correct_answer: 'a',
    subject: 'Física',
    year: 2023,
  },
  {
    id: 'q4',
    question_text: 'Qual movimento literário brasileiro teve como uma de suas principais características o sentimentalismo e a idealização da natureza?',
    options: [
      { letter: 'a', text: 'Barroco' },
      { letter: 'b', text: 'Arcadismo' },
      { letter: 'c', text: 'Modernismo' },
      { letter: 'd', text: 'Romantismo' },
    ],
    correct_answer: 'd',
    subject: 'Linguagens',
    year: 2021,
  },
  {
    id: 'q5',
    question_text: 'Durante o período da Guerra Fria, a polarização do mundo entre os blocos capitalista e socialista gerou diversos conflitos indiretos. Qual evento é considerado o marco da queda simbólica dessa divisão?',
    options: [
      { letter: 'a', text: 'Conferência de Ialta' },
      { letter: 'b', text: 'Queda do Muro de Berlim' },
      { letter: 'c', text: 'Crise dos Mísseis' },
      { letter: 'd', text: 'Guerra do Vietnã' },
    ],
    correct_answer: 'b',
    subject: 'História',
    year: 2022,
  },
  {
    id: 'q6',
    question_text: 'O fenômeno climático caracterizado pelo aquecimento anormal das águas do Oceano Pacífico e que altera os padrões de chuva no Brasil é conhecido como:',
    options: [
      { letter: 'a', text: 'La Niña' },
      { letter: 'b', text: 'El Niño' },
      { letter: 'c', text: 'Inversão Térmica' },
      { letter: 'd', text: 'Efeito Estufa' },
    ],
    correct_answer: 'b',
    subject: 'Geografia',
    year: 2023,
  },
  {
    id: 'q7',
    question_text: 'Na tabela periódica, os elementos situados no grupo 18 são conhecidos por sua baixa reatividade química. Eles são chamados de:',
    options: [
      { letter: 'a', text: 'Metais Alcalinos' },
      { letter: 'b', text: 'Halogênios' },
      { letter: 'c', text: 'Gases Nobres' },
      { letter: 'd', text: 'Actinídios' },
    ],
    correct_answer: 'c',
    subject: 'Química',
    year: 2022,
  },
  {
    id: 'q8',
    question_text: 'A obra "Dom Casmurro", de Machado de Assis, é narrada por Bento Santiago e levanta a dúvida eterna sobre a fidelidade de:',
    options: [
      { letter: 'a', text: 'Lucíola' },
      { letter: 'b', text: 'Capitu' },
      { letter: 'c', text: 'Iracema' },
      { letter: 'd', text: 'Aurélia' },
    ],
    correct_answer: 'b',
    subject: 'Linguagens',
    year: 2021,
  },
  {
    id: 'q9',
    question_text: 'Qual o valor da soma dos ângulos internos de um triângulo equilátero?',
    options: [
      { letter: 'a', text: '90 graus' },
      { letter: 'b', text: '180 graus' },
      { letter: 'c', text: '360 graus' },
      { letter: 'd', text: '60 graus' },
    ],
    correct_answer: 'b',
    subject: 'Matemática',
    year: 2023,
  },
  {
    id: 'q10',
    question_text: 'O processo de independência do Brasil em 1822 resultou na manutenção do regime:',
    options: [
      { letter: 'a', text: 'Republicano' },
      { letter: 'b', text: 'Parlamentarista' },
      { letter: 'c', text: 'Monárquico' },
      { letter: 'd', text: 'Ditatorial' },
    ],
    correct_answer: 'c',
    subject: 'História',
    year: 2022,
  }
];

export default function SimuladoPage() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'idle' | 'loading' | 'active' | 'finished' | 'error'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const fetchQuestions = useCallback(() => {
    setGameState('loading');
    setTimeout(() => {
      const shuffledData = [...mockQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffledData.slice(0, SIMULATION_SIZE));
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setGameState('active');
    }, 1000);
  }, []);

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
    }
  };

  const resetSimulation = () => {
    setGameState('idle');
  };

  const score = answers.filter(a => a.selected === a.correct).length;

  if (gameState === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col gap-4 px-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-sm font-black text-primary italic animate-pulse">Aurora calibrando questões...</p>
      </div>
    );
  }

  if (gameState === 'active') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className='bg-white p-4 md:p-6 rounded-2xl shadow-sm border-b-4 border-accent'>
            <div className='flex justify-between items-center mb-4 gap-2'>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-accent" />
                  <p className='font-black text-primary text-xs md:text-sm uppercase tracking-widest'>QUESTÃO {currentQuestionIndex + 1} / {questions.length}</p>
                </div>
                <Badge variant="outline" className='font-black text-[10px] uppercase bg-primary text-white border-none h-7 px-4'>
                  {currentQuestion.subject} • {currentQuestion.year}
                </Badge>
            </div>
            <Progress value={progress} className="h-1.5 bg-muted rounded-full" />
        </div>

        <Card className="border-none shadow-xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className='p-6 md:p-12 bg-muted/5'>
            <CardDescription className="text-sm md:text-xl font-medium text-slate-800 leading-relaxed italic">
              "{currentQuestion.question_text}"
            </CardDescription>
          </CardHeader>
          <CardContent className='p-6 md:p-12 pt-2'>
            <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} className="space-y-3">
              {currentQuestion.options.map((opt) => (
                <Label 
                  key={opt.letter} 
                  className={`flex items-start gap-4 text-xs md:text-base p-4 md:p-6 rounded-xl md:rounded-[1.5rem] border-2 transition-all cursor-pointer ${
                    selectedAnswer === opt.letter ? 'border-accent bg-accent/5' : 'border-muted/20 hover:border-accent/40'
                  }`}
                >
                  <RadioGroupItem value={opt.letter} id={opt.letter} className="mt-1" />
                  <div className="flex gap-2 md:gap-4">
                    <span className={`font-black italic ${selectedAnswer === opt.letter ? 'text-accent' : 'text-primary/30'}`}>
                      {opt.letter.toUpperCase()}.
                    </span>
                    <span className="font-medium text-slate-700">{opt.text}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-3 rounded-2xl border border-white shadow-xl">
          <p className="hidden md:block text-[10px] font-black uppercase text-primary/40 px-4 italic">Analise com calma.</p>
          <Button 
            onClick={handleNextQuestion} 
            disabled={selectedAnswer === null} 
            className="w-full md:w-auto h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-sm md:text-lg px-8 bg-primary shadow-xl"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'}
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-xl text-center p-8 md:p-16 shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white border-none">
          <CardHeader>
            <div className="h-20 w-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-black text-primary italic">Simulado Concluído!</CardTitle>
            <CardDescription className="text-lg font-medium mt-2">Você acertou {score} de {questions.length} questões.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted/20 rounded-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Desempenho Aurora</p>
              <p className="text-sm italic font-medium">"{score >= 7 ? 'Excelente! Você está dominando os temas base. Continue focado nas revisões.' : 'Bom começo! Foque nos temas que você teve dúvida hoje para melhorar seu rendimento.'}"</p>
            </div>
            <Button onClick={resetSimulation} className="w-full h-14 rounded-xl bg-primary font-black">
              <RotateCw className="h-5 w-5 mr-2" /> Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
        <Card className="w-full max-w-xl text-center p-8 md:p-16 shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white border-none">
            <CardHeader>
                <div className="h-16 w-16 md:h-24 md:w-24 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <BookCheck className="h-8 w-8 md:h-12 w-12 text-accent" />
                </div>
                <CardTitle className="text-2xl md:text-5xl font-black text-primary italic tracking-tighter">
                  Simulado <span className="text-accent">Compromisso</span>
                </CardTitle>
                <CardDescription className="text-sm md:text-xl font-medium text-muted-foreground mt-4 italic">
                    Avalie seus conhecimentos com questões reais.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mt-4">
                <Button onClick={fetchQuestions} className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl font-black text-lg md:text-xl bg-primary shadow-2xl">
                    <Target className="h-5 w-5 md:h-6 md:w-6 mr-3" />
                    Começar Agora
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
