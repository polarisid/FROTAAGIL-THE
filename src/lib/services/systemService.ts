// src/lib/services/systemService.ts
'use server';

import { getChecklists } from './checklistService';
import { getFines } from './fineService';
import { getMaintenances } from './maintenanceService';
import { getVehicleUsageLogs } from './vehicleUsageLogService';

/**
 * Executes a series of complex queries across different services.
 * The primary purpose is to trigger Firestore's automatic index creation prompts
 * in the developer console if any required composite indexes are missing.
 * This function should be called from an admin settings page.
 */
export async function triggerIndexCreationQueries(): Promise<void> {
  console.log('[System Check] Iniciando disparo de consultas para verificação de índices...');

  const testDate = new Date().toISOString().split('T')[0];

  try {
    // Each of these calls a query that may require a composite index.
    // We don't need the results, just the action of querying.
    await getChecklists({ vehicleId: 'test', operatorId: 'test', date: testDate });
    console.log('[System Check] Consulta de Checklist verificada.');

    await getFines({ vehicleId: 'test', status: 'pending', startDate: testDate, endDate: testDate });
    console.log('[System Check] Consulta de Multas verificada.');

    await getMaintenances({ vehicleId: 'test', status: 'planned' });
    console.log('[System Check] Consulta de Manutenções verificada.');
    
    await getVehicleUsageLogs({ vehicleId: 'test', operatorId: 'test', status: 'completed', startDate: testDate, endDate: testDate });
    console.log('[System Check] Consulta de Logs de Uso verificada.');
    
    // Add any new complex queries here in the future.

    console.log('[System Check] Verificação de índices concluída. Se algum índice for necessário, o Firestore exibirá um link para criá-lo no console do navegador.');
  } catch (error: any) {
    // An error here is expected if an index is missing.
    // The browser console will show the specific error from Firestore with a link.
    if (error.code === 'failed-precondition') {
      console.warn('[System Check] Uma ou mais consultas falharam, o que é esperado se um índice estiver faltando. Verifique o console de erros para um link de criação de índice do Firestore.');
    } else {
      console.error('[System Check] Um erro inesperado ocorreu durante a verificação de índices:', error);
    }
  }
}
