import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Criar Conta"
            description="Preencha os seus dados abaixo para configurar o primeiro administrador"
        >
            <Head title="Criar Conta" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nome completo"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>
                            <input type="hidden" name="role" value="admin" />

                            <div className="grid gap-2">
                                <Label htmlFor="email">Endereço de Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="exemplo@ukb.edu.ao"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Palavra-passe</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    toggleTabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmar palavra-passe
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={5}
                                    toggleTabIndex={6}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-blue-600 text-white hover:bg-blue-700"
                                tabIndex={7}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Finalizar Cadastro
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Já tem uma conta no sistema?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={8}
                                className="font-medium text-blue-600 hover:text-blue-700"
                            >
                                Entrar
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
