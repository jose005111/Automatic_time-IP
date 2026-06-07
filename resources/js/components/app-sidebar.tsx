import {
    LayoutDashboard,
    Users,
    UserPlus,
    ArrowRightLeft,
    MapPin,
    FileText,
} from 'lucide-react';
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
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { Link, usePage } from '@inertiajs/react';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutDashboard },
    { title: 'Munícipes', href: '/municipes', icon: Users },
    { title: 'Recrutamentos', href: '/recrutamentos', icon: UserPlus },
    { title: 'Transferências', href: '/transferencias', icon: ArrowRightLeft },
    { title: 'Localizações', href: '/localizacoes', icon: MapPin },
    { title: 'Relatórios', href: '/relatorios', icon: FileText },
    { title: 'Utilizadores', href: '/utilizadores', icon: Users },
];

export function AppSidebar() {
    const { props } = usePage();
    const user = props.auth?.user;

    // ============================================
    // Verifica se o utilizador é administrador
    // ============================================
    const isAdmin =
        !!user &&
        (user.is_admin === true ||
            user.role === 'admin' ||
            user.role === 'administrador');

    // Filtra os itens do menu consoante o tipo de utilizador
    const visibleNavItems = mainNavItems.filter((item) => {
        if (item.title === 'Utilizadores') {
            return isAdmin; // só admins veem este menu
        }
        return true;
    });

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
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>{<NavUser />}</SidebarFooter>
        </Sidebar>
    );
}
