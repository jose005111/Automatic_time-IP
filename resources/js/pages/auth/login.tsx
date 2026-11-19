import { Form, Head } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

const ERRO_AUTENTICACAO =
    /palavra-passe incorretos|credenciais|demasiadas tentativas/i;

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Aceder ao Sistema"
            description="Introduza o seu email e palavra-passe para aceder ao sistema"
        >
            <Head title="Entrar" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => {
                    const mensagemAutenticacao = [
                        errors.email,
                        errors.password,
                    ].find(
                        (mensagem) =>
                            mensagem && ERRO_AUTENTICACAO.test(mensagem),
                    );

                    return (
                        <>
                            {mensagemAutenticacao && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                                >
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Não foi possível entrar
                                        </p>
                                        <p>{mensagemAutenticacao}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        Endereço de Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="exemplo@ukb.edu.ao"
                                    />
                                    <InputError
                                        message={
                                            mensagemAutenticacao
                                                ? undefined
                                                : errors.email
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">
                                            Palavra-passe
                                        </Label>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="ml-auto text-sm"
                                                tabIndex={5}
                                            >
                                                Esqueceu a palavra-passe?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        toggleTabIndex={3}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                    />
                                    <InputError
                                        message={
                                            mensagemAutenticacao
                                                ? undefined
                                                : errors.password
                                        }
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Entrar no Painel
                                </Button>
                            </div>

                            {/* O SISTEMA VAI ESCONDER ISTO SE CANREGISTER FOR FALSE */}
                            {canRegister && (
                                <div className="text-center text-sm text-muted-foreground">
                                    Primeiro acesso ao sistema?{' '}
                                    <TextLink
                                        href={register()}
                                        tabIndex={5}
                                        className="font-medium text-blue-600 hover:text-blue-700"
                                    >
                                        Criar Conta
                                    </TextLink>
                                </div>
                            )}
                        </>
                    );
                }}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
