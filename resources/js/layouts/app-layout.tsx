import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

type Flash = {
    success?: string;
    error?: string;
    warning?: string;
};

export function FlashToaster() {
    const { flash } = usePage().props as { flash?: Flash };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                duration: 4000,
                style: {
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    color: '#14532d',
                    border: '1px solid #bbf7d0',
                    fontWeight: '500',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
                iconTheme: {
                    primary: '#22c55e',
                    secondary: '#f0fdf4',
                },
            });
        }

        if (flash?.error) {
            toast.error(flash.error, {
                duration: 5000,
                style: {
                    borderRadius: '10px',
                    background: '#fef2f2',
                    color: '#7f1d1d',
                    border: '1px solid #fecaca',
                    fontWeight: '500',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
                iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fef2f2',
                },
            });
        }

        if (flash?.warning) {
            toast(flash.warning, {
                duration: 5000,
                icon: '⚠️',
                style: {
                    borderRadius: '10px',
                    background: '#fffbeb',
                    color: '#78350f',
                    border: '1px solid #fde68a',
                    fontWeight: '500',
                    fontSize: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
            });
        }
    }, [flash, flash?.success, flash?.error, flash?.warning]);

    return (
        <Toaster
            position="top-right"
            gutter={10}
            toastOptions={{
                duration: 4000,
                style: {
                    borderRadius: '10px',
                    fontFamily: 'inherit',
                    maxWidth: '420px',
                },
            }}
        />
    );
}

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-900/20 backdrop-blur-sm">
            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
                <FlashToaster />
            </AppLayoutTemplate>
        </div>
    );
}
