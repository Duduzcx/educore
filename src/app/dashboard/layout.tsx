"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger, SidebarInset, SidebarFooter } from "@/components/ui/sidebar";
import { Home, Compass, BookOpen, Video, Library, HelpCircle, Wallet, LogOut, Bell, LayoutDashboard, ClipboardList, Users, BarChart3, MessageSquare, MessagesSquare, Loader2, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo, memo } from "react";
import { useAuth } from "@/lib/AuthProvider"; 
import { supabase } from "@/lib/supabase"; 

const studentItems = [
  { icon: Home, label: "Página Inicial", href: "/dashboard/home" },
  { icon: Compass, label: "Trilhas de Estudo", href: "/dashboard/trails" },
  { icon: MessagesSquare, label: "Fóruns de Discussão", href: "/dashboard/forum" },
  { icon: MessageSquare, label: "Chat com Mentores", href: "/dashboard/chat", badge: true },
  { icon: Library, label: "Biblioteca Digital", href: "/dashboard/library" },
  { icon: Video, label: "Aulas ao Vivo", href: "/dashboard/live" },
  { icon: Wallet, label: "Simulador de Isenção", href: "/dashboard/financial-aid" },
];

const teacherItems = [
  { icon: LayoutDashboard, label: "Painel de Gestão", href: "/dashboard/teacher/home" },
  { icon: ClipboardList, label: "Gestão de Trilhas", href: "/dashboard/teacher/trails" },
  { icon: MonitorPlay, label: "Gerenciar Lives", href: "/dashboard/teacher/live" },
  { icon: BookOpen, label: "Gestão da Biblioteca", href: "/dashboard/teacher/library" },
  { icon: MessagesSquare, label: "Fórum Pedagógico", href: "/dashboard/forum" },
  { icon: MessageSquare, label: "Chats com Alunos", href: "/dashboard/chat", badge: true },
  { icon: Bell, label: "Mural de Avisos", href: "/dashboard/teacher/communication" },
  { icon: BarChart3, label: "BI & Analytics", href: "/dashboard/teacher/analytics" },
];

const NavMenu = memo(({ items, pathname, unreadCount }: { items: any[], pathname: string, unreadCount: number }) => {
  return (
    <SidebarMenu className="gap-1">
      {items.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label} className="h-11 rounded-xl data-[active=true]:bg-accent data-[active=true]:text-accent-foreground transition-all duration-200">
            <Link href={item.href} className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span className="font-bold text-sm">{item.label}</span>
              {unreadCount > 0 && item.badge && (
                <Badge className="ml-auto bg-white/20 text-white text-[8px] h-5 min-w-5 rounded-full animate-in zoom-in">{unreadCount}</Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
});
NavMenu.displayName = "NavMenu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: isUserLoading } = useAuth();
  
  const isTeacher = useMemo(() => 
    user?.user_metadata?.role === 'teacher' || user?.user_metadata?.role === 'admin'
  , [user?.user_metadata?.role]);
  
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const table = isTeacher ? 'teachers' : 'profiles';
      const { data } = await supabase.from(table).select('name').eq('id', user.id).maybeSingle();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, [user?.id, isTeacher]);

  useEffect(() => {
    if (!isUserLoading && !user) router.replace("/login");
  }, [user, isUserLoading, router]);

  const isAppPage = useMemo(() => {
    return pathname.includes('/chat/') || 
           pathname.includes('/forum/') || 
           pathname.includes('/classroom/') ||
           pathname.includes('/teacher/live/');
  }, [pathname]);

  const navItems = useMemo(() => isTeacher ? teacherItems : studentItems, [isTeacher]);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (isUserLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-accent" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sincronizando Identidade...</p>
    </div>
  );

  if (!user) return null;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-sidebar border-none transition-[width] duration-300 ease-in-out">
        <SidebarHeader className="p-6">
           <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-headline text-lg font-black text-white italic">EduCore</span>
              <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Smart Education</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3">
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 py-4 text-[9px] font-black text-white/30 uppercase tracking-widest">
              {isTeacher ? "Gestão Docente" : "Estudante"}
            </SidebarGroupLabel>
            <NavMenu items={navItems} pathname={pathname} unreadCount={unreadCount} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-white/5">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} disabled={isSignOutLoading} className="text-red-400 hover:bg-red-500/10 h-11 rounded-xl transition-colors">
                {isSignOutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span className="font-bold text-xs">Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-6 shrink-0">
          <SidebarTrigger className="h-9 w-9 rounded-full hover:bg-muted transition-colors" />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-primary italic leading-none">{profile?.name || "Usuário"}</span>
              <span className="text-[8px] font-black text-accent uppercase tracking-widest">{isTeacher ? "Docente" : "Aluno"}</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/5 shadow-xl transition-transform hover:scale-105">
              <AvatarImage src={`https://picsum.photos/seed/${user.id}/100/100`} />
              <AvatarFallback className="bg-primary text-white text-xs">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        <main className={`flex-1 flex flex-col min-h-0 ${isAppPage ? 'overflow-hidden' : 'overflow-y-auto'} p-4 md:p-8 animate-in fade-in`}>
          <div className={isAppPage ? 'app-container' : ''}>
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}