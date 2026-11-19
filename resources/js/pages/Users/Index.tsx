import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

// ==================== SCHEMA ZOD ====================
const userSchema = z
    .object({
        name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
        email: z.string().email('Email inválido'),
        password: z
            .string()
            .min(8, 'A palavra-passe deve ter no mínimo 8 caracteres')
            .optional()
            .or(z.literal('')),
        password_confirmation: z.string().optional().or(z.literal('')),
        role: z.enum(['admin', 'custom', 'municipe']),
        data_nascimento: z.string().optional().or(z.literal('')),
        sexo: z.enum(['M', 'F']).optional().or(z.literal('')),
    })
    .refine(
        (data) => {
            if (data.password && data.password !== data.password_confirmation) {
                return false;
            }
            return true;
        },
        {
            message: 'As palavras-passe não coincidem',
            path: ['password_confirmation'],
        },
    )
    .refine((data) => data.role !== 'municipe' || !!data.data_nascimento, {
        message: 'A data de nascimento é obrigatória para munícipes',
        path: ['data_nascimento'],
    })
    .refine((data) => data.role !== 'municipe' || ['M', 'F'].includes(data.sexo ?? ''), {
        message: 'O sexo é obrigatório para munícipes',
        path: ['sexo'],
    });

type UserFormData = z.infer<typeof userSchema>;

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'custom' | 'municipe';
    id_municipe?: number | null;
    municipe?: { data_nascimento: string; sexo: string } | null;
    created_at: string;
}

interface Props {
    users: User[];
    filters?: any;
    roleOptions: Record<string, string>;
}

export default function UsersIndex({ users, roleOptions }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

    // ==================== FORM ====================
    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'custom',
            data_nascimento: '',
            sexo: '',
        },
    });

    // ==================== OPEN CREATE ====================
    const openCreate = () => {
        form.reset({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'custom',
            data_nascimento: '',
            sexo: '',
        });
        setIsCreateOpen(true);
    };

    // ==================== OPEN EDIT ====================
    const openEdit = (user: User) => {
        setSelectedUser(user);
        form.reset({
            name: user.name,
            email: user.email,
            password: '', // nunca preenchemos a password
            password_confirmation: '',
            role: user.role,
            data_nascimento: user.municipe?.data_nascimento?.slice(0, 10) ?? '',
            sexo: user.municipe?.sexo ?? '',
        });
        setIsEditOpen(true);
    };

    const buildPayload = (values: UserFormData) => {
        const payload: Record<string, unknown> = { ...values };

        if (payload.role !== 'municipe') {
            delete payload.data_nascimento;
            delete payload.sexo;
        }

        return payload;
    };

    const applyServerErrors = (errors: Record<string, string>) => {
        Object.entries(errors).forEach(([field, message]) => {
            if (field in form.getValues()) {
                form.setError(field as keyof UserFormData, { message });
            } else {
                toast.error(message);
            }
        });
    };

    const renderMunicipeFields = () =>
        form.watch('role') === 'municipe' ? (
            <>
                <div className="grid gap-2">
                    <Label>Data de Nascimento</Label>
                    <Input type="date" {...form.register('data_nascimento')} />
                    {form.formState.errors.data_nascimento && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.data_nascimento.message}
                        </p>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label>Sexo</Label>
                    <select
                        {...form.register('sexo')}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                    {form.formState.errors.sexo && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.sexo.message}
                        </p>
                    )}
                </div>
            </>
        ) : null;

    // ==================== SUBMIT CREATE ====================
    const onSubmitCreate = (values: UserFormData) => {
        router.post('/utilizadores', buildPayload(values), {
            onSuccess: () => {
                setIsCreateOpen(false);
                form.reset();
            },
            onError: (errors) => {
                applyServerErrors(errors);
            },
        });
    };

    // ==================== SUBMIT EDIT ====================
    const onSubmitEdit = (values: UserFormData) => {
        if (!selectedUser) return;

        router.put(`/utilizadores/${selectedUser.id}`, buildPayload(values), {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedUser(null);
                form.reset();
            },
            onError: (errors) => {
                applyServerErrors(errors);
            },
        });
    };

    // ==================== DELETE ====================
    const handleDelete = () => {
        if (!confirmDelete) return;

        router.delete(`/utilizadores/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete(null);
            },
            onError: () => toast.error('Erro ao eliminar utilizador.'),
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Utilizadores', href: '/utilizadores' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestão de Utilizadores | SIGID" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Gestão de Utilizadores
                        </h1>
                        <p className="text-muted-foreground">
                            Controlo de acessos ao sistema SIGID
                        </p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="h-4 w-4" /> Novo Utilizador
                    </Button>
                </div>

                {/* TABELA */}
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Papel</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        Nenhum utilizador encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                user.role === 'admin'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {roleOptions[user.role]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString('pt-PT')}
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEdit(user)}
                                        >
                                            <Edit className="mr-1 h-4 w-4" />{' '}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setConfirmDelete(user)
                                            }
                                        >
                                            <Trash2 className="mr-1 h-4 w-4" />{' '}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {/* ==================== MODAL CRIAR ==================== */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Novo Utilizador</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={form.handleSubmit(onSubmitCreate)}
                        className="space-y-4"
                    >
                        {/* Nome */}
                        <div className="grid gap-2">
                            <Label>Nome Completo</Label>
                            <Input {...form.register('name')} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input type="email" {...form.register('email')} />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="grid gap-2">
                            <Label>Palavra-passe</Label>
                            <Input
                                type="password"
                                {...form.register('password')}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Confirmar Palavra-passe</Label>
                            <Input
                                type="password"
                                {...form.register('password_confirmation')}
                            />
                            {form.formState.errors.password_confirmation && (
                                <p className="text-sm text-red-500">
                                    {
                                        form.formState.errors
                                            .password_confirmation.message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="grid gap-2">
                            <Label>Papel</Label>
                            <Select
                                value={form.watch('role')}
                                onValueChange={(value) =>
                                    form.setValue(
                                        'role',
                                        value as 'admin' | 'custom' | 'municipe',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleOptions).map(
                                        ([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.role && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.role.message}
                                </p>
                            )}
                        </div>

                        {renderMunicipeFields()}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting
                                    ? 'A criar...'
                                    : 'Criar Utilizador'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ==================== MODAL EDITAR ==================== */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Editar Utilizador</DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={form.handleSubmit(onSubmitEdit)}
                        className="space-y-4"
                    >
                        {/* Nome */}
                        <div className="grid gap-2">
                            <Label>Nome Completo</Label>
                            <Input {...form.register('name')} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input type="email" {...form.register('email')} />
                        </div>

                        <div className="-mt-2 text-xs text-muted-foreground">
                            Deixe os campos de palavra-passe em branco para
                            manter a atual.
                        </div>

                        <div className="grid gap-2">
                            <Label>Nova Palavra-passe (opcional)</Label>
                            <Input
                                type="password"
                                {...form.register('password')}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Confirmar Nova Palavra-passe</Label>
                            <Input
                                type="password"
                                {...form.register('password_confirmation')}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Papel</Label>
                            <Select
                                value={form.watch('role')}
                                onValueChange={(value) =>
                                    form.setValue(
                                        'role',
                                        value as 'admin' | 'custom' | 'municipe',
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleOptions).map(
                                        ([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.role && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.role.message}
                                </p>
                            )}
                        </div>

                        {renderMunicipeFields()}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting
                                    ? 'A guardar...'
                                    : 'Atualizar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de Confirmação de Eliminação */}
            <Dialog
                open={!!confirmDelete}
                onOpenChange={() => setConfirmDelete(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Utilizador</DialogTitle>
                    </DialogHeader>
                    <p>
                        Tem a certeza que deseja eliminar{' '}
                        <strong>{confirmDelete?.name}</strong>?
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmDelete(null)}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Sim, eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
