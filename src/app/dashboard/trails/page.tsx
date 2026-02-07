
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Layers, 
  PlayCircle, 
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  Loader2,
  ChevronRight,
  Zap,
  Star,
  Flame
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabase";

const TRAIL_CATEGORIES = ["Todos", "Matemática", "Tecnologia", "Linguagens", "Física", "História"];
const AUDIENCE_FILTERS = [
  { id: "all", label: "Toda a Comunidade" },
  { id: "etec", label: "Perfil ETEC" },
  { id: "uni", label: "Perfil Vestibular" }
];

const EXAMPLE_TRAILS = [
  {
    id: "ex-math-1",
    title: "Cálculo I: O Poder das Derivadas",
    category: "Matemática",
    description: "Explore os fundamentos do cálculo diferencial, desde limites até aplicações reais de taxas de variação e otimização.",
    modulesCount: 5,
    teacherName: "Prof. Ricardo Silva",
    image: "https://images.unsplash.com/photo-1613563696452-c7239f5ae99c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxtYXRoZW1hdGljcyUyMGVkdWNhdGlvbnxlbnwwfHx8fDE3NzAwODU2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    targetAudience: "uni",
    teacherId: "demo-1",
    isNew: true,
    isFundamental: true
  }
];

export default function LearningTrailsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeAudience, setActiveAudience] = useState("all");
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [dbTrails, setDbTrails] = useState<any[]>([]);
  const [allProgress, setAllProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      
      try {
        // Busca perfil no Supabase
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        // Busca trilhas ativas
        const { data: trails } = await supabase.from('learning_trails').select('*').eq('status', 'active');
        setDbTrails(trails || []);

        // Busca progresso do usuário
        const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', user.id);
        setAllProgress(progress || []);
      } catch (err) {
        console.error("Erro ao carregar trilhas do Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const filteredTrails = useMemo(() => {
    const all = [...dbTrails, ...EXAMPLE_TRAILS];
    
    return all.filter(trail => {
      const matchesSearch = trail.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            trail.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === "Todos" || trail.category === activeCategory;
      const matchesAudience = activeAudience === "all" || trail.targetAudience === activeAudience || trail.targetAudience === "both";
      
      return matchesSearch && matchesCategory && matchesAudience;
    });
  }, [dbTrails, searchTerm, activeCategory, activeAudience]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="mt-4 text-muted-foreground font-bold italic animate-pulse uppercase tracking-widest text-[10px]">Sincronizando portal de conhecimento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-primary italic leading-none">Trilhas de Aprendizado</h1>
            {userProfile && (
              <Badge className="bg-accent text-accent-foreground font-black text-[9px] uppercase px-3 shadow-lg border-none h-6 tracking-widest animate-pulse">
                {userProfile.profile_type === 'etec' ? 'PERFIL ETEC' : 'PERFIL VESTIBULAR'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-medium text-lg">Caminhos pedagógicos estruturados para sua evolução.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input 
            placeholder="Buscar trilha..." 
            className="pl-12 h-14 bg-white border-none shadow-xl rounded-[1.25rem] text-lg font-medium italic focus-visible:ring-accent transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="Todos" className="w-full">
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2 scrollbar-hide gap-4">
          <TabsList className="bg-white/50 backdrop-blur-md p-1.5 h-14 rounded-2xl border-none shadow-sm shrink-0">
            {TRAIL_CATEGORIES.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat} 
                onClick={() => setActiveCategory(cat)}
                className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 duration-300"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0 h-14 w-14 rounded-2xl bg-white border-none shadow-xl hover:bg-accent hover:text-white transition-all group active:scale-95 duration-300">
                <Filter className={`h-6 w-6 ${activeAudience !== 'all' ? 'text-accent group-hover:text-white' : ''}`} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-none shadow-2xl animate-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 py-3">Público Alvo</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-muted/50 mx-2" />
              {AUDIENCE_FILTERS.map(filter => (
                <DropdownMenuItem 
                  key={filter.id} 
                  onClick={() => setActiveAudience(filter.id)}
                  className={`rounded-xl px-3 py-2.5 font-bold text-sm cursor-pointer mb-1 last:mb-0 transition-colors ${activeAudience === filter.id ? 'bg-primary text-white' : 'hover:bg-muted'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    {filter.label}
                    {activeAudience === filter.id && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredTrails.length > 0 ? (
            filteredTrails.map((trail, index) => {
              const userProgress = allProgress?.find(p => p.trail_id === trail.id);
              const percentage = userProgress?.percentage || 0;
              const isCompleted = percentage === 100;

              return (
                <Card key={trail.id} className={`overflow-hidden border-none shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group bg-white rounded-[2.5rem] flex flex-col relative group/card ${isCompleted ? 'ring-4 ring-green-500/10' : ''} ${trail.isFundamental ? 'ring-4 ring-accent/20' : ''} animate-in fade-in slide-in-from-bottom-4 duration-700`} style={{ animationDelay: `${index * 100}ms` }}>
                  
                  <div className="relative aspect-[16/10] overflow-hidden cursor-pointer">
                    <Link href={`/dashboard/classroom/${trail.id}`}>
                      <Image 
                        src={trail.image_url || trail.image || `https://picsum.photos/seed/trail-${trail.id}/600/400`} 
                        alt={trail.title} 
                        fill 
                        className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Badge className="bg-white/80 backdrop-blur-md text-primary border-none shadow-lg flex items-center gap-2 px-4 py-1.5 rounded-xl">
                            <Layers className="h-4 w-4 text-accent" />
                            <span className="text-[10px] font-black uppercase tracking-wider">{trail.modules_count || trail.modulesCount || 0} Módulos</span>
                          </Badge>
                          {(trail.is_new || trail.isNew) && (
                            <Badge className="bg-orange-500 text-white border-none shadow-lg px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-bounce">
                              <Zap className="h-3 w-3 fill-white" />
                              <span className="text-[8px] font-black uppercase">NOVO</span>
                            </Badge>
                          )}
                        </div>
                        {(trail.is_fundamental || trail.isFundamental) && (
                          <Badge className="bg-accent text-accent-foreground border-none shadow-xl px-4 py-1.5 rounded-xl flex items-center gap-2 w-fit animate-pulse">
                            <Flame className="h-3.5 w-3.5 fill-accent-foreground" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">ALTA RECORRÊNCIA</span>
                          </Badge>
                        )}
                      </div>
                      {isCompleted && (
                        <div className="absolute top-4 right-4 animate-in zoom-in duration-500">
                          <Badge className="bg-green-500 text-white border-none text-[8px] font-black uppercase px-3 py-1.5 shadow-lg flex items-center gap-1.5 rounded-xl">
                            <CheckCircle2 className="h-3 w-3" /> CONCLUÍDO
                          </Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 p-8 backdrop-blur-sm">
                        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-black h-12 rounded-xl shadow-2xl scale-90 group-hover/card:scale-100 transition-transform duration-500">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {percentage > 0 ? 'Continuar Jornada' : 'Iniciar Aprendizado'}
                        </Button>
                      </div>
                    </Link>
                  </div>
                  
                  <CardHeader className="p-8 space-y-4 flex-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9px] border-accent/20 text-accent font-black uppercase px-2 py-0.5 bg-accent/5 transition-all group-hover/card:bg-accent group-hover/card:text-white">
                        {trail.category}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3 text-accent fill-accent animate-pulse" />
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-60 italic">Curadoria Docente</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <CardTitle className="text-xl font-black text-primary italic leading-tight group-hover/card:text-accent transition-colors duration-300 line-clamp-2">
                        {trail.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed line-clamp-3 italic opacity-80">
                        {trail.description || "Jornada estruturada com materiais digitais e simulados IA para sua aprovação."}
                      </p>
                    </div>

                    {percentage > 0 && (
                      <div className="pt-4 space-y-2 animate-in fade-in duration-1000">
                        <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3 text-accent" />
                            Progresso: {percentage}%
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5 rounded-full bg-muted overflow-hidden" />
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardFooter className="p-8 pt-0 mt-auto">
                    <div className="flex items-center justify-between w-full pt-6 border-t border-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0 transition-transform duration-500 group-hover/card:scale-110">
                          <Image 
                            src={`https://picsum.photos/seed/prof-${trail.teacher_id || trail.teacherId || 'default'}/100/100`} 
                            alt="Professor" 
                            width={36} 
                            height={36} 
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] font-black text-primary italic truncate max-w-[120px]">
                            {trail.teacher_name || trail.teacherName || "Mentor da Rede"}
                          </span>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Docente</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/classroom/${trail.id}`} className="text-accent hover:underline text-[9px] font-black uppercase flex items-center gap-1 group/btn active:translate-x-1 transition-all duration-300">
                        Estudar <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-muted/20 rounded-[3rem] bg-muted/5 animate-in fade-in duration-1000">
              <Layers className="h-20 w-20 text-muted-foreground/20 mx-auto mb-4" />
              <p className="font-black text-primary italic text-2xl">Nenhuma trilha encontrada</p>
              <p className="text-muted-foreground font-medium mt-2">Tente ajustar seus filtros ou pesquisar por outro termo.</p>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
