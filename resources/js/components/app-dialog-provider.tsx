import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { ConfirmDialog, NoticeDialog } from '@/components/app-dialogs';

type ConfirmOptions = {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
};

type NoticeOptions = {
    title: string;
    description?: ReactNode;
};

type AppDialogContextValue = {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
    alert: (options: NoticeOptions) => Promise<void>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

type ConfirmState = ConfirmOptions & { resolve: (confirmed: boolean) => void };
type NoticeState = NoticeOptions & { resolve: () => void };

export function AppDialogProvider({ children }: { children: ReactNode }) {
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [noticeState, setNoticeState] = useState<NoticeState | null>(null);

    const confirm = useCallback(
        (options: ConfirmOptions) =>
            new Promise<boolean>((resolve) => {
                setConfirmState({ ...options, resolve });
            }),
        [],
    );

    const alert = useCallback(
        (options: NoticeOptions) =>
            new Promise<void>((resolve) => {
                setNoticeState({ ...options, resolve });
            }),
        [],
    );

    const value = useMemo(() => ({ confirm, alert }), [confirm, alert]);

    return (
        <AppDialogContext.Provider value={value}>
            {children}

            <ConfirmDialog
                open={!!confirmState}
                onOpenChange={(open) => {
                    if (!open) {
                        confirmState?.resolve(false);
                        setConfirmState(null);
                    }
                }}
                title={confirmState?.title ?? ''}
                description={confirmState?.description}
                confirmLabel={confirmState?.confirmLabel}
                cancelLabel={confirmState?.cancelLabel}
                destructive={confirmState?.destructive}
                onConfirm={() => {
                    confirmState?.resolve(true);
                    setConfirmState(null);
                }}
            />

            <NoticeDialog
                open={!!noticeState}
                onOpenChange={(open) => {
                    if (!open) {
                        noticeState?.resolve();
                        setNoticeState(null);
                    }
                }}
                title={noticeState?.title ?? ''}
                description={noticeState?.description}
            />
        </AppDialogContext.Provider>
    );
}

export function useAppDialog() {
    const context = useContext(AppDialogContext);

    if (!context) {
        throw new Error(
            'useAppDialog deve ser usado dentro de AppDialogProvider',
        );
    }

    return context;
}
