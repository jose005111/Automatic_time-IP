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
import { Link } from '@inertiajs/react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Munícipes',
        href: '/municipes',
        icon: Users,
    },
    {
        title: 'Recrutamentos',
        href: '/recrutamentos',
        icon: UserPlus,
    },
    {
        title: 'Transferências',
        href: '/transferencias', // Note: we can add later, for now redirect to recrutamentos
        icon: ArrowRightLeft,
    },
    {
        title: 'Localizações',
        href: '/localizacoes',
        icon: MapPin,
    },
    {
        title: 'Relatórios',
        href: '/relatorios',
        icon: FileText,
    },
    {
        title: 'Utilizadores',
        href: '/utilizadores',
        icon: Users,
    },
];

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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
