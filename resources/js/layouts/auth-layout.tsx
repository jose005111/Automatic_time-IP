import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { FlashToaster } from '@/layouts/app-layout';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
            <FlashToaster />
        </AuthLayoutTemplate>
    );
}
