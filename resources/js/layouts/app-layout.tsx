import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const { flash } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
        };
    };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { id: 'flash-success' });
        }

        if (flash?.error) {
            toast.error(flash.error, { id: 'flash-error' });
        }
    }, [flash?.success, flash?.error]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" />
        </AppLayoutTemplate>
    );
}
