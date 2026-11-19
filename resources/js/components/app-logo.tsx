import { NOME_SISTEMA } from '@/lib/sistema';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-xs">
                <span className="mb-0.5 leading-tight font-semibold break-words">
                    {NOME_SISTEMA}
                </span>
            </div>
        </>
    );
}
