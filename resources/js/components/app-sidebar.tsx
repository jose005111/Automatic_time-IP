import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    GraduationCap,
    CalendarDays,
    DoorOpen,
    User,
    Clock,
    Users,
    BookOpen,
    Calendar,
} from 'lucide-react';
// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Departamentos',
        href: '/departamentos',
        icon: Building2,
    },
    {
        title: 'Cursos',
        href: '/cursos',
        icon: GraduationCap,
    },
    {
        title: 'Periodo Lectivo',
        href: '/periodos_lectivos',
        icon: CalendarDays,
    },
    {
        title: 'Salas',
        href: '/salas',
        icon: DoorOpen,
    },
    {
        title: 'Professores',
        href: '/professores',
        icon: User,
    },
    {
        title: 'Tempos',
        href: '/tempos_aula', // Nota: Ajustei aqui para coincidir com a rota de tempos de aula que definimos antes
        icon: Clock,
    },
    {
        title: 'Turmas',
        href: '/turmas',
        icon: Users,
    },
    {
        title: 'Disciplinas',
        href: '/disciplinas',
        icon: BookOpen,
    },
    {
        title: 'Alunos',
        href: '/alunos',
        icon: User,
    },
    {
        title: 'Horários',
        href: '/horarios',
        icon: Calendar,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
