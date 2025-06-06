import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useShopping } from '@/context/AppContext'; // Vamos renomear o hook em breve
import { toast } from "sonner";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail } = useShopping();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleSignIn = async (data: any) => {
    setLoading(true);
    const { error } = await signInWithEmail(data.email, data.password);
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
    const { error } = await signUpWithEmail(data.email, data.password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu e-mail para confirmação.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Bem-vindo!</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
           <div className="text-center text-sm">
            <p>Não tem uma conta?</p>
            <Button variant="link" onClick={handleSubmit(handleSignUp)} disabled={loading}>
              {loading ? 'Criando...' : 'Crie uma agora'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};