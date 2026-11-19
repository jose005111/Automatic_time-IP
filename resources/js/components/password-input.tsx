import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type'
> & {
    toggleTabIndex?: number;
};

export default function PasswordInput({
    className,
    toggleTabIndex,
    ...props
}: PasswordInputProps) {
    const [visivel, setVisivel] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                type={visivel ? 'text' : 'password'}
                className={cn('pr-10', className)}
            />
            <button
                type="button"
                onClick={() => setVisivel((valor) => !valor)}
                tabIndex={toggleTabIndex}
                aria-label={
                    visivel ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'
                }
                aria-pressed={visivel}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                {visivel ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}
