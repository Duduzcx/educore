
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Compass, BookOpen, Video, Library, HelpCircle, Wallet, Settings, LogOut, Bell, Search, User, ClipboardList, Users, BarChart3, LayoutDashboard, FilePenLine, MessageSquare, MessagesSquare, Loader2, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/AuthProvider"; // Nosso novo hook de autenticação
import { supabase } from "@/lib/supabaseClient"; // Cliente Supabase

// Tipos para os perfis
interface Profile {
  id: string;
  name: string;
  email: string;
  // adicione outros campos se necessário
}

interface TeacherProfile extends Profile {
  // campos específicos de professor
}

const studentItems = [
  { icon: Home, label: "Página Inicial", href: "/dashboard/home" },
  { icon: Compass, label: "Trilhas de Estudo", href: "/dashboard/trails" },
  { icon: MessagesSquare, label: "Fóruns de Discussão", href: "/dashboard/forum" },
  { icon: MessageSquare, label: "Chat com Mentores", href: "/dashboard/chat", badge: true },
  { icon: Library, label: "Biblioteca Digital", href: "/dashboard/library" },
  { icon: Video, label: "Aulas ao Vivo", href: "/dashboard/live" },
  { icon: Wallet, label: "Simulador de Isenção", href: "/dashboard/financial-aid" },
  { icon: HelpCircle, label: "Central da Aurora", href: "/dashboard/support" },
];

const teacherItems = [
  { icon: LayoutDashboard, label: "Painel de Gestão", href: "/dashboard/teacher/home" },
  { icon: ClipboardList, label: "Gestão de Trilhas", href: "/dashboard/teacher/trails" },
  { icon: MonitorPlay, label: "Gerenciar Lives", href: "/dashboard/teacher/live" },
  { icon: BookOpen, label: "Gestão da Biblioteca", href: "/dashboard/teacher/library" },
  { icon: MessagesSquare, label: "Fórum Pedagógico", href: "/dashboard/forum" },
  { icon: MessageSquare, label: "Chats com Alunos", href: "/dashboard/chat", badge: true },
  { icon: Bell, label: "Mural de Avisos", href: "/dashboard/teacher/communication" },
  { icon: FilePenLine, label: "Avaliações IA", href: "/dashboard/teacher/essays" },
  { icon: Users, label: "Gestão de Alunos", href: "/dashboard/teacher/students" },
  { icon: BarChart3, label: "BI & Analytics", href: "/dashboard/teacher/analytics" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useAuth(); // Usando nosso hook do Supabase
  const { toast } = useToast();
  const [isTeacher, setIsTeacher] = useState(false);
  const [profile, setProfile] = useState<Profile | TeacherProfile | null>(null);
  const [isProfileLoading, setProfileLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastToastRef = useRef<string | null>(null);

  // Efeito para buscar o perfil do usuário (aluno ou professor)
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setProfileLoading(true);
        // Tenta buscar primeiro na tabela de professores
        let { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (teacherData) {
          setProfile(teacherData as TeacherProfile);
          setIsTeacher(true);
        } else {
          // Se não for professor, busca na tabela de perfis de alunos
          let { data: studentData, error: studentError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (studentData) {
            setProfile(studentData as Profile);
            setIsTeacher(false);
          }
        }
        setProfileLoading(false);
      };
      fetchProfile();
    }
  }, [user]);

  // Efeito para verificar se o usuário está logado
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  // Efeito para escutar novas mensagens (substituindo useCollection)
  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel('chat_messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `receiver_id=eq.${user.id}` },
          (payload) => {
            console.log('Nova mensagem recebida!', payload);
            setUnreadCount(current => current + 1);
            const newMessage = payload.new as { id: string, sender_id: string }; // Ajuste o tipo conforme sua tabela
            if (newMessage.id !== lastToastRef.current) {
              lastToastRef.current = newMessage.id;
              toast({
                title: "Nova Mensagem!",
                description: `Você recebeu uma mensagem. Clique para responder.`,
                action: (
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/chat/${newMessage.sender_id}`)}>
                    Ver Chat
                  </Button>
                ),
              });
            }
          }
        )
        .subscribe();

      // Função de limpeza
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, toast, router]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Sessão encerrada" });
      router.push("/login");
    } catch (error: any) {
      toast({ title: "Erro ao sair", variant: "destructive", description: error.message });
    }
  };

  if (isUserLoading || (user && isProfileLoading)) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-bold text-primary animate-pulse italic">Iniciando Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) return null; // Redirecionamento já é feito pelo useEffect

  const navItems = isTeacher ? teacherItems : studentItems;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0 shadow-2xl bg-sidebar">
        <SidebarHeader className="p-6 pt-safe">
           <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="font-headline text-lg font-black leading-tight text-white truncate italic">EduCore</span>
              <span className="text-[9px] text-sidebar-foreground/60 font-black tracking-widest uppercase">Smart Education</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-4 uppercase tracking-[0.25em] text-[9px] opacity-40 font-black text-white">
              {isTeacher ? "ÁREA ADMINISTRATIVA" : "MENU DO ESTUDANTE"}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="h-12 px-4 rounded-xl data-[active=true]:bg-accent data-[active=true]:text-accent-foreground transition-all duration-300"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <div className="relative">
                        <item.icon className={`h-5 w-5 ${pathname === item.href ? 'scale-110' : 'opacity-70'}`} />
                        {item.badge && unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-sidebar animate-pulse" />
                        )}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      {item.badge && unreadCount > 0 && (
                        <Badge className="ml-auto bg-white/20 text-white text-[8px] font-black h-5 min-w-5 flex items-center justify-center rounded-full">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border/20 gap-2 pb-safe">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-11 rounded-xl hover:bg-white/5 transition-colors">
                <Link href="/dashboard/settings" className="flex items-center gap-3">
                  <Settings className="h-4 w-4 opacity-70" />
                  <span className="font-bold text-xs text-white">Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} className="h-11 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer">
                <div className="flex items-center gap-3 w-full">
                  <LogOut className="h-4 w-4" />
                  <span className="font-bold text-xs">Desconectar</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background min-w-0 max-w-full overflow-hidden flex-1 flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 md:h-20 items-center gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur-md pt-safe shrink-0">
          <SidebarTrigger className="hover:bg-muted transition-colors rounded-full h-10 w-10 shrink-0" />
           <div className="flex-1 min-w-0">
            <div className="relative max-w-md hidden lg:block group">
              <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input 
                placeholder={isTeacher ? "Buscar dados..." : "Encontrar materiais..."} 
                className="pl-11 h-11 bg-muted/50 border-none rounded-2xl focus-visible:ring-accent/50 transition-all w-full text-sm font-medium" 
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-full h-10 w-10">
              <Bell className="h-5 w-5 text-muted-foreground" />
               {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-background animate-pulse"></span>
              )}
            </Button>
            <div className="h-8 w-px bg-border/40 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex text-right leading-none gap-1">
                <span className="text-sm font-black text-primary italic truncate max-w-[120px]">
                  {profile?.name || (isTeacher ? "Docente" : "Estudante")}
                </span>
                <span className="text-[8px] font-black text-accent uppercase tracking-widest">
                  {isTeacher ? "Docente/Gestor" : "Portal do Aluno"}
                </span>
              </div>
              <Avatar className="h-9 w-9 md:h-11 md:w-11 border-2 border-primary/10 shadow-xl ring-2 ring-background">
                <AvatarImage src={`https://picsum.photos/seed/${user?.id}/100/100`} />
                <AvatarFallback className="bg-primary text-white font-black text-xs uppercase">
                  {user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-3 md:p-8 lg:p-10 max-w-full mx-auto w-full flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-hide pb-safe">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
