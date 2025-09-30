'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/shared/Container';
import { PageTitle } from '@/components/shared/PageTitle';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { initializeDefaultChecklistItems } from '@/lib/services/checklistDefinitionService';
import { triggerIndexCreationQueries } from '@/lib/services/systemService';
import { Loader2Icon, CheckCircle2Icon, AlertTriangleIcon, SettingsIcon } from 'lucide-react';

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleRunChecks = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // 1. Initialize Checklist Definitions
      const initializedItems = await initializeDefaultChecklistItems();
      if (initializedItems.length > 0) {
        toast({
          title: "Itens de Checklist Inicializados",
          description: `${initializedItems.length} itens padrão foram criados.`,
          className: "bg-green-100 dark:bg-green-900",
        });
      }

      // 2. Trigger queries to generate index creation links
      await triggerIndexCreationQueries();

      setResult({
        success: true,
        message: 'Verificação concluída com sucesso! Os itens de checklist padrão foram garantidos e as consultas para criação de índices foram acionadas. Por favor, verifique o console do navegador (F12) para encontrar links de criação de índices do Firestore, caso algum seja necessário.'
      });

    } catch (error: any) {
      console.error("System check failed:", error);
      setResult({
        success: false,
        message: `A verificação falhou: ${error.message}. Verifique o console para mais detalhes.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <PageTitle
        title="Configurações do Sistema"
        description="Ferramentas administrativas para manutenção e configuração do banco de dados."
      />
      <Card>
        <CardHeader>
          <CardTitle>Verificação e Inicialização de Dados</CardTitle>
          <CardDescription>
            Esta ação verifica se os dados essenciais do sistema (como os itens padrão do checklist) existem e os cria se necessário. 
            Ela também executa consultas complexas para que o Firebase gere links de criação de índices no console do navegador, facilitando a configuração inicial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start space-y-4">
            <Button onClick={handleRunChecks} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Verificar e Inicializar Dados do Sistema
                </>
              )}
            </Button>
            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                {result.success ? <CheckCircle2Icon className="h-4 w-4" /> : <AlertTriangleIcon className="h-4 w-4" />}
                <AlertTitle>{result.success ? 'Sucesso' : 'Erro'}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
