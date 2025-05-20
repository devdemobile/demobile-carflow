
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, KeyRound, User, AlertCircle } from 'lucide-react';
import { supabase, directSupabaseLogin, testSupabaseConnection } from '@/integrations/supabase/client';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const { user, login, error: authError } = useAuth();
  const navigate = useNavigate();

  // Verificar status da sessão atual e conexão com o Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar sessão atual
        const { data } = await supabase.auth.getSession();
        console.log("Status da sessão ao carregar Login:", data.session ? "Autenticado" : "Não autenticado");
        
        // Verificar usuários registrados no auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        console.log("Usuários registrados no Supabase Auth:", authUsers || "Erro ao listar usuários");
        
        if (authError) {
          console.error("Erro ao listar usuários do Auth:", authError);
        }
        
        // Testar conexão com o Supabase
        const isConnected = await testSupabaseConnection();
        setConnectionStatus(isConnected ? 'connected' : 'error');
      } catch (e) {
        console.error("Erro ao verificar sessão ou conexão:", e);
        setConnectionStatus('error');
      }
    };
    
    checkSession();
  }, []);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Exibir erro do contexto de autenticação
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username || !password) {
      setError("Nome de usuário e senha são obrigatórios.");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Tentando login com:", username);
      
      // Usando a função atualizada de login direto com Supabase Auth
      const directResult = await directSupabaseLogin(username, password);
      
      if (directResult.success) {
        console.log("Login direto bem-sucedido! Redirecionando...");
        
        // Atualizar o contexto de autenticação
        const success = await login({ username, password });
        
        if (success) {
          console.log("Contexto de autenticação atualizado com sucesso");
          navigate('/');
          return;
        } else {
          console.error("Falha ao atualizar o contexto de autenticação mesmo após login bem-sucedido");
        }
      }
      
      // Se o login direto falhar, tentar o login normal como fallback
      if (!directResult.success) {
        console.log("Login direto falhou, tentando login normal...");
        const success = await login({ username, password });
        
        if (success) {
          navigate('/');
          return;
        }
      }
      
      // Se ambos falharem, exibir mensagem de erro
      setError("Credenciais inválidas. Verifique seu nome de usuário e senha.");
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(`Ocorreu um erro ao fazer login: ${err.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Car<span className="text-carflow-700">Flow</span>
          </CardTitle>
          <CardDescription>
            Faça login para acessar o sistema
          </CardDescription>
          {connectionStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Problema de conexão com o banco de dados. Verifique se o Supabase está configurado corretamente.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="username" 
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || connectionStatus === 'checking'}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Status da conexão: {
                connectionStatus === 'checking' ? 'Verificando...' :
                connectionStatus === 'connected' ? 'Conectado ao Supabase' :
                'Erro de conexão'
              }
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
