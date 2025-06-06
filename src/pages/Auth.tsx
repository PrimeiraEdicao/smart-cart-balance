import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext'; // 1. Usar o hook renomeado
import { toast } from "sonner";
import { supabase } from '@/lib/supabase'; // Importar supabase diretamente para as funções de auth

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { session } = useAppContext(); // Pegar a sessão para verificar se já está logado
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  // 2. Funções de auth agora são chamadas diretamente do supabase client
  const handleSignIn = async (data: any) => {
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
  
  const handleSignUp = async (data: any) => {
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

  // 3. Se o usuário já estiver logado, redireciona para a home
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
            <Button variant="outline" className="w-full" onClick={handleSubmit(handleSignUp)} disabled={loading}>
              {loading ? 'Criando...' : 'Criar nova conta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};