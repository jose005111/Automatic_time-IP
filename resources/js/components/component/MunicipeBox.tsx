import { CheckCircle, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Municipe } from '@/types';

interface MunicipeBox {
    value?: number;
    onChange: (id: number | undefined) => void;
    listas: Municipe[];
}

function MunicipeBox({ value, onChange, listas }: MunicipeBox) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = listas.find((p) => p.id === value);

    const lista = listas
        .filter(
            (p) =>
                !query ||
                p.nome_completo.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 20);

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            )
                setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <div
                onClick={() => setOpen((o) => !o)}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring"
            >
                <span className={selected ? '' : 'text-muted-foreground'}>
                    {selected ? selected.nome_completo : 'Selecione o munícipe'}
                </span>
                <div className="flex items-center gap-1">
                    {value && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(undefined);
                                setQuery('');
                            }}
                            className="rounded p-0.5 hover:bg-muted"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    )}
                    <Search className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
                    <div className="border-b p-2">
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Pesquisar nome..."
                            className="w-full rounded border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                        {lista.length === 0 && (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Nenhum resultado
                            </p>
                        )}
                        {lista.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                    onChange(p.id);
                                    setOpen(false);
                                    setQuery('');
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent ${value === p.id ? 'bg-accent font-medium' : ''}`}
                            >
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                    {p.nome_completo.charAt(0)}
                                </div>
                                <p className="leading-tight">
                                    {p.nome_completo}
                                </p>
                                {value === p.id && (
                                    <CheckCircle className="ml-auto h-4 w-4 text-emerald-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MunicipeBox;
