
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Search, Filter, User, Calendar, MapPin, Shield } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Users = () => {
  // In a real implementation, these would come from Supabase
  const users = [
    {
      id: '1',
      name: 'Administrador',
      username: 'admin',
      email: 'admin@carflow.com',
      role: 'admin',
      shift: 'day',
      unit: 'Matriz',
      status: 'active',
    },
    {
      id: '2',
      name: 'Porteiro',
      username: 'porteiro',
      email: 'porteiro@carflow.com',
      role: 'operator',
      shift: 'day',
      unit: 'Matriz',
      status: 'active',
    },
    {
      id: '3',
      name: 'Operador Noturno',
      username: 'noturno',
      email: 'noturno@carflow.com',
      role: 'operator',
      shift: 'night',
      unit: 'Filial 6',
      status: 'inactive',
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Usuários</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8 max-w-[300px]"
                placeholder="Buscar usuário..." 
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{user.role === 'admin' ? 'Administrador' : 'Operador'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{user.shift === 'day' ? 'Turno Diurno' : 'Turno Noturno'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{user.unit}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Ações</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Gerenciar usuário</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Editar Detalhes</DropdownMenuItem>
                    <DropdownMenuItem>Alterar Senha</DropdownMenuItem>
                    <DropdownMenuItem>Gerenciar Permissões</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className={user.status === 'active' ? 'text-red-500 focus:text-red-500' : 'text-green-500 focus:text-green-500'}>
                      {user.status === 'active' ? 'Desativar Usuário' : 'Ativar Usuário'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Users;
