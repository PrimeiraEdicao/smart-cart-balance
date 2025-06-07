import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";
import { Session } from '@supabase/supabase-js';

interface UpdatePasswordFormData {
  password: string;
}

export const UpdatePasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<UpdatePasswordFormData>();

  useEffect(() => {
    // Captura a sessão de recuperação de senha da URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword: SubmitHandler<UpdatePasswordFormData> = async (data) => {
    if (!session) {
      setError("Sessão inválida ou expirada. Por favor, solicite a redefinição de senha novamente.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      setError(error.message);
    } else {
      toast.success("Senha atualizada com sucesso!");
      navigate('/');
    }
    setLoading(false);
  };

  if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Erro</CardTitle>
                    <CardDescription>Não foi possível redefinir sua senha.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-red-500">{error}</p>
                    <Button onClick={() => navigate('/auth')} className="w-full mt-4">Voltar para o Login</Button>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Redefinir Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleUpdatePassword)} className="space-y-4">
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: true, minLength: 6 })}
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};