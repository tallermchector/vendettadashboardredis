
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal, Eye, EyeOff } from 'lucide-react';
import { login } from '@/lib/actions/session.actions';
import { registerUser } from '@/lib/actions/auth.actions';

export function AuthForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoginView, setIsLoginView] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Form state
    const [username, setUsername] = useState('bomberox');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    
    // Registration state (optional)
    const [ciudad, setCiudad] = useState(1);
    const [barrio, setBarrio] = useState(1);
    const [edificio, setEdificio] = useState(1);

    const handleLogin = async () => {
        try {
            // La verificacion de credenciales ocurre en el servidor: aqui solo
            // se lanza UNA llamada. Antes el componente hacia dos (buscar
            // usuario y luego crear sesion) y comparaba el hash de la
            // contrasena en el navegador.
            const result = await login(username, password);

            if (!result.ok) {
                setError(result.error);
                return;
            }

            toast({ title: "Inicio de sesión exitoso", description: "Bienvenido de nuevo, Jefe." });
            // `router.push` + `router.refresh()` juntos renderizan el dashboard
            // DOS veces. Como el layout ya es `force-dynamic`, un unico
            // `replace` trae datos frescos y ademas deja fuera /login del
            // historial del navegador.
            router.replace('/overview');
        } catch (err) {
            console.error("Login error:", err);
            setError('Ocurrió un error en el servidor.');
        }
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const result = await registerUser({
            username,
            password,
            location: { ciudad, barrio, edificio }
        });

        if (result.error) {
            setError(result.error);
        } else {
            toast({ title: "¡Registro exitoso!", description: `Bienvenido a Vendetta, ${username}.` });
            router.replace('/overview');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // El callback de startTransition debe DEVOLVER la promesa: si se
        // descarta, React pierde el seguimiento de la transicion y el estado
        // `isPending` miente sobre el progreso real de la operacion.
        startTransition(async () => {
            if (isLoginView) {
                await handleLogin();
            } else {
                await handleRegister();
            }
        });
    };

    return (
        <Card className="w-full max-w-md bg-background/70 text-white border-white/20 backdrop-blur-md animate-fade-in">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold tracking-wider">
                    {isLoginView ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                </CardTitle>
                <CardDescription className="text-white/70">
                    {isLoginView ? 'Introduce tus credenciales para acceder a tu imperio.' : 'Únete a la familia y comienza tu legado.'}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Usuario</Label>
                        <Input id="username" type="text" placeholder="Tu nombre de guerra" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={isPending} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Tu código secreto"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                )}
                            </Button>
                        </div>
                    </div>
                    {!isLoginView && (
                         <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                            <Input id="confirm-password" type="password" placeholder="Repite tu código secreto" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isPending} />
                        </div>
                    )}
                    {error && (
                        <Alert variant="destructive" className="bg-destructive/20 border-destructive/50 text-destructive-foreground">
                            <Terminal className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoginView ? 'Entrar' : 'Registrarse'}
                    </Button>
                    <p className="text-xs text-center text-white/60">
                        {isLoginView ? '¿No tienes una cuenta?' : '¿Ya eres parte de la familia?'}
                        <Button variant="link" type="button" size="sm" className="p-0 h-auto ml-1 text-accent" onClick={() => { setIsLoginView(!isLoginView); setError('') }}>
                             {isLoginView ? 'Regístrate aquí.' : 'Inicia sesión.'}
                        </Button>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
