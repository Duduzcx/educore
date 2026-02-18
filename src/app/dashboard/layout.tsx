
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarTrigger, SidebarInset, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Home, Compass, BookOpen, Video, Library, HelpCircle, Wallet, LogOut, Bell, LayoutDashboard, ClipboardList, Users, BarChart3, MessageSquare, MessagesSquare, Loader2, MonitorPlay, Calculator, FileText, Database, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo, memo, useRef } from "react";
import { useAuth } from "@/lib/AuthProvider"; 

const studentItems = [
  { icon: Home, label: "Página Inicial", href: "/dashboard/home" },
  { icon: Compass, label: "Trilhas de Estudo", href: "/dashboard/trails" },
  { icon: FileText, label: "Simulados", href: "/dashboard/student/simulados" },
  { icon: MessagesSquare, label: "Fóruns de Discussão", href: "/dashboard/forum" },
  { icon: MessageSquare, label: "Chat com Mentores", href: "/dashboard/chat", badge: true },
  { icon: Library, label: "Biblioteca Digital", href: "/dashboard/library" },
  { icon: Video, label: "Aulas ao Vivo", href: "/dashboard/live" },
  { icon: Calculator, label: "Simulador de Isenção", href: "/dashboard/student/exemption-simulator" },
];

const teacherItems = [
  { icon: LayoutDashboard, label: "Painel de Gestão", href: "/dashboard/teacher/home" },
  { icon: ClipboardList, label: "Gestão de Trilhas", href: "/dashboard/teacher/trails" },
  { icon: Database, label: "Banco de Questões", href: "/dashboard/teacher/questions" },
  { icon: MonitorPlay, label: "Gerenciar Lives", href: "/dashboard/teacher/live" },
  { icon: BookOpen, label: "Gestão da Biblioteca", href: "/dashboard/teacher/library" },
  { icon: MessagesSquare, label: "Fórum Pedagógico", href: "/dashboard/forum" },
  { icon: MessageSquare, label: "Chats com Alunos", href: "/dashboard/chat", badge: true },
  { icon: Bell, label: "Mural de Avisos", href: "/dashboard/teacher/communication" },
  { icon: BarChart3, label: "BI & Analytics", href: "/dashboard/teacher/analytics" },
];

function SwipeHandler({ children }: { children: React.ReactNode }) {
  const { setOpenMobile, isMobile, openMobile } = useSidebar();
  const touchStart = useRef<number>(0);
  const touchEnd = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    const distance = touchEnd.current - touchStart.current;
    const isSwipeRight = distance > 70;
    const isSwipeLeft = distance < -70;

    if (isSwipeRight && !openMobile) {
      setOpenMobile(true);
    } else if (isSwipeLeft && openMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col min-h-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

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
  const { user, profile, loading: isUserLoading, signOut } = useAuth();
  
  const isTeacher = useMemo(() => 
    user?.user_metadata?.role === 'teacher' || user?.user_metadata?.role === 'admin'
  , [user?.user_metadata?.role]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

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

  const handleSignOutClick = async () => {
    setIsSignOutLoading(true);
    await signOut();
  };

  if (isUserLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-primary gap-6">
      <div className="relative">
        <div className="h-24 w-24 rounded-3xl bg-accent flex items-center justify-center shadow-2xl animate-pulse">
          <BookOpen className="h-12 w-12 text-accent-foreground" />
        </div>
        <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-accent animate-bounce" />
      </div>
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">Compromisso</h2>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 animate-pulse">Sintonizando Identidade...</p>
        </div>
      </div>
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
              <span className="font-headline text-lg font-black text-white italic">Compromisso</span>
              <span className="text-[8px] text-white/40 uppercase tracking-widest font-black">Smart Education</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3">
          <SidebarGroup>
            <NavMenu items={navItems} pathname={pathname} unreadCount={unreadCount} />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-white/5">
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOutClick} disabled={isSignOutLoading} className="text-red-400 hover:bg-red-500/10 h-11 rounded-xl transition-colors">
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
        
        <SwipeHandler>
          <main className={`flex-1 flex flex-col min-h-0 ${isAppPage ? 'overflow-hidden' : 'overflow-y-auto'} p-4 md:p-8 animate-in fade-in`}>
            <div className={isAppPage ? 'app-container' : ''}>
              {children}
            </div>
          </main>
        </SwipeHandler>
      </SidebarInset>
    </SidebarProvider>
  );
}
