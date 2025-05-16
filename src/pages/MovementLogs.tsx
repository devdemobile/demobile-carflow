
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { MovementLog } from '@/types';
import { movementLogService } from '@/services/movements/movementLogService';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MovementLogs = () => {
  const { user, userPermissions } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const logsData = await movementLogService.getAllLogs();
        setLogs(logsData);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar logs');
        console.error('Erro ao carregar logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, navigate]);

  // Helper to format date/time
  const formatDateTime = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy HH:mm', { locale: pt });
    } catch (e) {
      return dateString;
    }
  };

  // Helper to format action type
  const formatActionType = (actionType: string): string => {
    switch (actionType) {
      case 'edit': return 'Edição';
      case 'delete': return 'Exclusão';
      default: return actionType;
    }
  };

  // Helper to format action details
  const formatActionDetails = (details: string): string => {
    try {
      const parsed = JSON.parse(details);
      if (parsed.before && parsed.after) {
        return 'Alteração de dados da movimentação';
      }
      return 'Movimentação excluída';
    } catch (e) {
      return details;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Logs de Movimentações</h1>
        
        {error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>ID Movimentação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                      <TableCell>{log.userName || log.userId}</TableCell>
                      <TableCell>
                        <span className={log.actionType === 'delete' ? 'text-destructive font-medium' : 'text-amber-600 font-medium'}>
                          {formatActionType(log.actionType)}
                        </span>
                      </TableCell>
                      <TableCell>{formatActionDetails(log.actionDetails)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.movementId}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MovementLogs;
