// lib/scheduler.ts
// Sistema de agendamento para sincronização automática da API da Câmara

import { buscarProposicoesDoDeputado } from './camara-api';
import { knowledgeBaseService } from './services';

interface SyncResult {
  success: boolean;
  novosItens: number;
  itensAtualizados: number;
  totalProjetos: number;
  timestamp: string;
  error?: string;
}

interface SyncHistory {
  id: string;
  timestamp: string;
  success: boolean;
  novosItens: number;
  itensAtualizados: number;
  totalProjetos: number;
  error?: string;
  duration: number;
}

class CamaraScheduler {
  private isRunning = false;
  private lastSync: SyncResult | null = null;
  private syncHistory: SyncHistory[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Inicia o scheduler de sincronização automática
   * Executa uma vez por dia às 6:00 da manhã
   */
  async startScheduler() {
    if (this.intervalId) {
      console.log('⚠️ Scheduler já está rodando');
      return;
    }

    console.log('🚀 Iniciando scheduler de sincronização automática da Câmara...');
    
    // Executar sincronização imediatamente na primeira vez
    await this.executeSync();
    
    // Agendar para executar diariamente às 6:00 da manhã
    this.scheduleDailySync();
    
    console.log('✅ Scheduler iniciado com sucesso');
  }

  /**
   * Para o scheduler
   */
  stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Scheduler parado');
    }
  }

  /**
   * Agenda a sincronização diária
   */
  private scheduleDailySync() {
    const now = new Date();
    const nextRun = new Date();
    
    // Próxima execução às 6:00 da manhã
    nextRun.setHours(6, 0, 0, 0);
    
    // Se já passou das 6:00 hoje, agendar para amanhã
    if (now.getHours() >= 6) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    const timeUntilNextRun = nextRun.getTime() - now.getTime();
    
    console.log(`📅 Próxima sincronização agendada para: ${nextRun.toLocaleString('pt-BR')}`);
    console.log(`⏰ Tempo até a próxima execução: ${Math.round(timeUntilNextRun / 1000 / 60)} minutos`);
    
    // Executar na próxima hora programada
    setTimeout(async () => {
      await this.executeSync();
      // Agendar para executar a cada 24 horas
      this.intervalId = setInterval(async () => {
        await this.executeSync();
      }, 24 * 60 * 60 * 1000); // 24 horas em milissegundos
    }, timeUntilNextRun);
  }

  /**
   * Executa a sincronização
   */
  async executeSync(): Promise<SyncResult> {
    if (this.isRunning) {
      console.log('⚠️ Sincronização já está em andamento');
      return {
        success: false,
        novosItens: 0,
        itensAtualizados: 0,
        totalProjetos: 0,
        timestamp: new Date().toISOString(),
        error: 'Sincronização já está em andamento'
      };
    }

    const startTime = Date.now();
    this.isRunning = true;

    console.log('🔄 Iniciando sincronização automática da Câmara...');

    try {
      // Buscar projetos da API da Câmara
      const projetos = await buscarProposicoesDoDeputado({
        idDeputado: 220697, // Jadyel Alencar
        tipos: ["PL", "PEC", "PLP"],
        itensPorPagina: 100
      });

      if (projetos.length === 0) {
        const result: SyncResult = {
          success: false,
          novosItens: 0,
          itensAtualizados: 0,
          totalProjetos: 0,
          timestamp: new Date().toISOString(),
          error: 'Nenhum projeto encontrado via API oficial'
        };

        this.lastSync = result;
        this.logSyncResult(result, Date.now() - startTime);
        
        console.log('⚠️ Nenhum projeto encontrado na sincronização automática');
        return result;
      }

      let novosItens = 0;
      let itensAtualizados = 0;

      // Processar cada projeto
      for (const projeto of projetos) {
        const kbId = `PROJ-${projeto.tipo}-${projeto.numero}-${projeto.ano}`;
        
        // Verificar se o projeto já existe na base
        const itemExistente = await knowledgeBaseService.getById(kbId);
        
        if (!itemExistente) {
          // Criar novo item
          const novoItem = {
            kb_id: kbId,
            titulo: `${projeto.tipo} ${projeto.numero}/${projeto.ano} - ${projeto.ementa.substring(0, 100)}... [Ver projeto](${projeto.url})`,
            conteudo: `Projeto de Lei ${projeto.tipo} ${projeto.numero}/${projeto.ano} apresentado pelo deputado Jadyel Alencar. ${projeto.ementa}`,
            resposta: `O deputado Jadyel Alencar apresentou o ${projeto.tipo} ${projeto.numero}/${projeto.ano} que ${projeto.ementa.toLowerCase()}. O projeto está em tramitação na Câmara dos Deputados.`,
            fonte: 'API Oficial da Câmara dos Deputados',
            tags: `projetos, ${projeto.tipo.toLowerCase()}, camara, legislativo, ${projeto.ano}`
          };
          
          await knowledgeBaseService.add(novoItem);
          novosItens++;
        }
      }

      const duration = Date.now() - startTime;
      const result: SyncResult = {
        success: true,
        novosItens,
        itensAtualizados,
        totalProjetos: projetos.length,
        timestamp: new Date().toISOString()
      };

      this.lastSync = result;
      this.logSyncResult(result, duration);

      console.log(`✅ Sincronização automática concluída: ${novosItens} novos, ${itensAtualizados} atualizados, ${projetos.length} total`);
      console.log(`⏱️ Duração: ${duration}ms`);

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      const result: SyncResult = {
        success: false,
        novosItens: 0,
        itensAtualizados: 0,
        totalProjetos: 0,
        timestamp: new Date().toISOString(),
        error: errorMessage
      };

      this.lastSync = result;
      this.logSyncResult(result, duration);

      console.error('❌ Erro na sincronização automática:', error);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Executa sincronização manual (forçada)
   */
  async executeManualSync(): Promise<SyncResult> {
    console.log('🔧 Executando sincronização manual...');
    return await this.executeSync();
  }

  /**
   * Registra o resultado da sincronização no histórico
   */
  private logSyncResult(result: SyncResult, duration: number) {
    const syncRecord: SyncHistory = {
      id: `sync-${Date.now()}`,
      timestamp: result.timestamp,
      success: result.success,
      novosItens: result.novosItens,
      itensAtualizados: result.itensAtualizados,
      totalProjetos: result.totalProjetos,
      error: result.error,
      duration
    };

    this.syncHistory.push(syncRecord);
    
    // Manter apenas os últimos 30 registros
    if (this.syncHistory.length > 30) {
      this.syncHistory = this.syncHistory.slice(-30);
    }
  }

  /**
   * Retorna o status do scheduler
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isSchedulerActive: !!this.intervalId,
      lastSync: this.lastSync,
      nextSync: this.getNextSyncTime(),
      syncHistory: this.syncHistory.slice(-10) // Últimos 10 registros
    };
  }

  /**
   * Calcula a próxima execução programada
   */
  private getNextSyncTime(): string | null {
    if (!this.intervalId) {
      return null;
    }

    const now = new Date();
    const nextRun = new Date();
    nextRun.setHours(6, 0, 0, 0);
    
    if (now.getHours() >= 6) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.toISOString();
  }

  /**
   * Retorna estatísticas de sincronização
   */
  getStats() {
    const totalSyncs = this.syncHistory.length;
    const successfulSyncs = this.syncHistory.filter(s => s.success).length;
    const failedSyncs = totalSyncs - successfulSyncs;
    
    const totalNewItems = this.syncHistory.reduce((sum, s) => sum + s.novosItens, 0);
    const totalUpdatedItems = this.syncHistory.reduce((sum, s) => sum + s.itensAtualizados, 0);
    
    const avgDuration = this.syncHistory.length > 0 
      ? this.syncHistory.reduce((sum, s) => sum + s.duration, 0) / this.syncHistory.length 
      : 0;

    return {
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      successRate: totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0,
      totalNewItems,
      totalUpdatedItems,
      averageDuration: Math.round(avgDuration),
      lastSync: this.lastSync
    };
  }
}

// Instância singleton do scheduler
export const camaraScheduler = new CamaraScheduler();

// Iniciar scheduler automaticamente quando o módulo for carregado
if (process.env.NODE_ENV === 'production') {
  // Em produção, iniciar automaticamente
  camaraScheduler.startScheduler().catch(console.error);
} else {
  // Em desenvolvimento, não iniciar automaticamente
  console.log('🔧 Scheduler não iniciado automaticamente em desenvolvimento');
  console.log('💡 Use camaraScheduler.startScheduler() para iniciar manualmente');
}
