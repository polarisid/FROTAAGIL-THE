// src/app/admin/operator-indicators/page.tsx

'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageTitle } from '@/components/shared/PageTitle';
import { Container } from '@/components/shared/Container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangleIcon, UsersIcon } from 'lucide-react';
import type { User, VehicleUsageLog, Incident, Checklist } from '@/lib/types';
import { getUsers } from '@/lib/services/userService';
import { getUsageLogsForPeriod } from '@/lib/services/vehicleUsageLogService';
import { getIncidents } from '@/lib/services/incidentService';
import { getChecklists } from '@/lib/services/checklistService';
import { startOfWeek, endOfWeek } from 'date-fns';

interface OperatorIndicator {
  operator: User;
  kmDrivenThisWeek: number;
  incidentsThisWeek: number;
  checklistsThisWeek: number;
}

export default function OperatorIndicatorsPage() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: usageLogs, isLoading: logsLoading, error: logsError } = useQuery<VehicleUsageLog[], Error>({
    queryKey: ['usageLogsForIndicators', weekStart, weekEnd],
    queryFn: () => getUsageLogsForPeriod(weekStart, weekEnd),
    enabled: !!users,
  });
  
  const { data: incidents, isLoading: incidentsLoading, error: incidentsError } = useQuery<Incident[], Error>({
      queryKey: ['incidentsForIndicators', weekStart, weekEnd],
      queryFn: () => getIncidents({ 
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
       }),
      enabled: !!users,
  });
  
  const { data: checklists, isLoading: checklistsLoading, error: checklistsError } = useQuery<Checklist[], Error>({
      queryKey: ['checklistsForIndicators', weekStart.toISOString().split('T')[0]],
      queryFn: () => getChecklists({ 
          date: weekStart.toISOString().split('T')[0] // simplified for demo, full range would need more logic
       }),
      enabled: !!users,
  });

  const isLoading = usersLoading || logsLoading || incidentsLoading || checklistsLoading;
  const queryError = usersError || logsError || incidentsError || checklistsError;

  // This effect will run on mount and trigger the queries.
  // If indexes are missing, Firestore will log errors with creation links in the browser console.
  useEffect(() => {
    console.log("Página de Indicadores montada. Verificando console para erros de índice do Firestore...");
  }, []);

  if (isLoading) {
    return (
      <Container>
        <PageTitle title="Indicadores por Operador" description="Carregando dados de performance..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  if (queryError) {
    return (
      <Container>
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Indicadores</AlertTitle>
          <AlertDescription>
            <p>{queryError.message}</p>
            <p className="mt-2 font-semibold">
              Se esta é a primeira vez que você acessa esta página, verifique o console do navegador (F12). 
              O Firestore pode ter gerado um link para criar um índice necessário.
            </p>
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  const operatorIndicators: OperatorIndicator[] = (users || [])
    .filter(u => u.role === 'operator')
    .map(operator => {
      const operatorLogs = usageLogs?.filter(log => log.operatorId === operator.id) || [];
      const operatorIncidents = incidents?.filter(inc => inc.operatorId === operator.id) || [];
      const operatorChecklists = checklists?.filter(chk => chk.operatorId === operator.id) || [];
      
      const kmDrivenThisWeek = operatorLogs.reduce((acc, log) => acc + (log.kmDriven || 0), 0);

      return {
        operator,
        kmDrivenThisWeek,
        incidentsThisWeek: operatorIncidents.length,
        checklistsThisWeek: operatorChecklists.length,
      };
    });


  return (
    <Container>
      <PageTitle
        title="Indicadores por Operador"
        description={`Performance semanal dos operadores, de ${weekStart.toLocaleDateString('pt-BR')} a ${weekEnd.toLocaleDateString('pt-BR')}.`}
        icon={<UsersIcon className="h-6 w-6 mr-2" />}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operatorIndicators.length > 0 ? operatorIndicators.map(indicator => (
          <Card key={indicator.operator.id}>
            <CardHeader>
              <CardTitle>{indicator.operator.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><strong>KM Rodado (Semana):</strong> {indicator.kmDrivenThisWeek.toLocaleString('pt-BR')} km</p>
              <p><strong>Ocorrências (Semana):</strong> {indicator.incidentsThisWeek}</p>
              <p><strong>Checklists (Semana):</strong> {indicator.checklistsThisWeek}</p>
            </CardContent>
          </Card>
        )) : (
            <p className="text-muted-foreground col-span-full">Nenhum dado de operador encontrado para o período.</p>
        )}
      </div>
    </Container>
  );
}
