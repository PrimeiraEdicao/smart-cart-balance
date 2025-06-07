import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';
import { GoogleIcon } from '@/components/GoogleIcon'; // Importe o ícone do Google

interface AuthFormData {
  email: string;
  password: string;
}

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { session } = useAppContext();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<AuthFormData>();

  const handleSignIn: SubmitHandler<AuthFormData> = async (data) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp: SubmitHandler<AuthFormData> = async (data) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu e-mail para confirmação.");
    }
    setLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    const email = prompt("Por favor, digite o e-mail para redefinição da senha:");
    if (!email) return;

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Link para redefinição de senha enviado para seu e-mail!");
    }
    setLoading(false);
  };


  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Smart Cart</CardTitle>
          <CardDescription>Acesse ou crie sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email", { required: true })} />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...register("password", { required: true })} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleSignInWithGoogle} disabled={loading}>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Entrar com Google
            </Button>
            
            <Button variant="secondary" className="w-full" onClick={handleSubmit(handleSignUp)} disabled={loading}>
              Criar nova conta com e-mail
            </Button>

            <div className="text-center text-sm">
              <button onClick={handlePasswordReset} className="underline text-muted-foreground hover:text-primary">
                Esqueci minha senha
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};