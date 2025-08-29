// Serviço de notificação para enviar respostas automáticas aos líderes

import { solicitacoesService, solicitacoesMarketingService } from './services.js';

class NotificationService {
  constructor() {
    this.lastCheck = new Date();
    this.isRunning = false;
    this.checkInterval = null;
    this.botClient = null;
  }

  // Inicializar o serviço com o cliente do bot
  init(botClient) {
    this.botClient = botClient;
    console.log('🔔 Serviço de notificação inicializado');
  }

  // Iniciar monitoramento
  start() {
    if (this.isRunning) {
      console.log('⚠️ Serviço de notificação já está rodando');
      return;
    }

    this.isRunning = true;
    console.log('🔔 Iniciando monitoramento de notificações...');

    // Verificar a cada 30 segundos
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000); // 30 segundos

    // Primeira verificação imediata
    this.checkForUpdates();
  }

  // Parar monitoramento
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🔔 Monitoramento de notificações parado');
  }

  // Verificar por atualizações nas solicitações
  async checkForUpdates() {
    try {
      // Buscar solicitações de materiais atualizadas
      const updatedSolicitacoes = await this.getUpdatedSolicitacoes();
      
      // Buscar solicitações de marketing atualizadas
      const updatedSolicitacoesMarketing = await this.getUpdatedSolicitacoesMarketing();
      
      const totalUpdates = updatedSolicitacoes.length + updatedSolicitacoesMarketing.length;
      
      if (totalUpdates > 0) {
        console.log(`🔔 Encontradas ${totalUpdates} solicitações atualizadas (${updatedSolicitacoes.length} materiais + ${updatedSolicitacoesMarketing.length} marketing)`);
        
        // Enviar notificações de materiais
        for (const solicitacao of updatedSolicitacoes) {
          await this.sendNotification(solicitacao, 'material');
        }
        
        // Enviar notificações de marketing
        for (const solicitacao of updatedSolicitacoesMarketing) {
          await this.sendNotification(solicitacao, 'marketing');
        }
      }

      // Atualizar timestamp da última verificação
      this.lastCheck = new Date();
      
    } catch (error) {
      console.error('❌ Erro ao verificar atualizações:', error);
    }
  }

  // Buscar solicitações de materiais atualizadas
  async getUpdatedSolicitacoes() {
    try {
      const allSolicitacoes = await solicitacoesService.getAll();
      
      return allSolicitacoes.filter(solicitacao => {
        const updatedAt = new Date(solicitacao.updated_at);
        return updatedAt > this.lastCheck && 
               solicitacao.status !== 'pendente' &&
               solicitacao.resposta_administrativo;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações de materiais atualizadas:', error);
      return [];
    }
  }

  // Buscar solicitações de marketing atualizadas
  async getUpdatedSolicitacoesMarketing() {
    try {
      const allSolicitacoesMarketing = await solicitacoesMarketingService.getAll();
      
      return allSolicitacoesMarketing.filter(solicitacao => {
        const updatedAt = new Date(solicitacao.updated_at);
        return updatedAt > this.lastCheck && 
               solicitacao.status !== 'pendente' &&
               solicitacao.resposta_administrativo;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar solicitações de marketing atualizadas:', error);
      return [];
    }
  }

  // Enviar notificação para o líder
  async sendNotification(solicitacao, tipo = 'material') {
    try {
      if (!this.botClient) {
        console.error('❌ Cliente do bot não disponível');
        return;
      }

      const phoneNumber = solicitacao.phone_number;
      const message = this.formatNotificationMessage(solicitacao, tipo);

      console.log(`📱 Enviando notificação de ${tipo} para ${phoneNumber}: ${solicitacao.status}`);

      // Enviar mensagem via bot
      await this.botClient.sendMessage(phoneNumber, message);

      console.log(`✅ Notificação de ${tipo} enviada com sucesso para ${phoneNumber}`);

    } catch (error) {
      console.error(`❌ Erro ao enviar notificação de ${tipo} para ${solicitacao.phone_number}:`, error);
    }
  }

  // Formatar mensagem de notificação
  formatNotificationMessage(solicitacao, tipo = 'material') {
    if (tipo === 'marketing') {
      return this.formatMarketingNotificationMessage(solicitacao);
    } else {
      return this.formatMaterialNotificationMessage(solicitacao);
    }
  }

  // Formatar mensagem de notificação de materiais
  formatMaterialNotificationMessage(solicitacao) {
    const { status, material_solicitado, quantidade, resposta_administrativo, data_entrega } = solicitacao;

    if (status === 'aprovada') {
      return this.formatApprovalMessage(solicitacao);
    } else if (status === 'rejeitada') {
      return this.formatRejectionMessage(solicitacao);
    }

    return 'Sua solicitação foi processada. Entre em contato com o administrativo para mais informações.';
  }

  // Formatar mensagem de notificação de marketing
  formatMarketingNotificationMessage(solicitacao) {
    const { status, servico_solicitado, resposta_administrativo, data_entrega } = solicitacao;

    if (status === 'aprovada') {
      return this.formatMarketingApprovalMessage(solicitacao);
    } else if (status === 'rejeitada') {
      return this.formatMarketingRejectionMessage(solicitacao);
    }

    return 'Sua solicitação de marketing foi processada. Entre em contato com o administrativo para mais informações.';
  }

  // Formatar mensagem de aprovação
  formatApprovalMessage(solicitacao) {
    const { material_solicitado, quantidade, resposta_administrativo, data_entrega } = solicitacao;
    
    let message = `✅ SOLICITAÇÃO APROVADA!\n\n`;
    message += `Material: ${material_solicitado}\n`;
    message += `Quantidade: ${quantidade}\n\n`;

    // Extrair informações da resposta administrativa
    const info = this.extractDeliveryInfo(resposta_administrativo);
    
    if (info.local) {
      message += `📍 Local de Coleta: ${info.local}\n`;
    }
    
    if (info.horario) {
      message += `🕐 Horário: ${info.horario}\n`;
    }
    
    if (info.responsavel) {
      message += `👤 Procurar por: ${info.responsavel}\n`;
    }
    
    if (data_entrega) {
      message += `📅 Data de Entrega: ${new Date(data_entrega).toLocaleDateString('pt-BR')}\n`;
    }

    message += `\n${resposta_administrativo}`;
    message += `\n\nEm caso de dúvidas, entre em contato com o administrativo.`;

    return message;
  }

  // Formatar mensagem de rejeição
  formatRejectionMessage(solicitacao) {
    const { material_solicitado, resposta_administrativo } = solicitacao;
    
    let message = `❌ SOLICITAÇÃO NÃO APROVADA\n\n`;
    message += `Material: ${material_solicitado}\n\n`;
    message += `Motivo: ${resposta_administrativo}\n\n`;
    message += `Para mais informações ou para solicitar outros materiais, entre em contato com o administrativo.`;

    return message;
  }

  // Formatar mensagem de aprovação de marketing
  formatMarketingApprovalMessage(solicitacao) {
    const { servico_solicitado, resposta_administrativo, data_entrega } = solicitacao;
    
    let message = `✅ SOLICITAÇÃO DE MARKETING APROVADA!\n\n`;
    message += `Serviço: ${servico_solicitado}\n\n`;

    // Extrair informações da resposta administrativa
    const info = this.extractDeliveryInfo(resposta_administrativo);
    
    if (info.local) {
      message += `📍 Local de Coleta: ${info.local}\n`;
    }
    
    if (info.horario) {
      message += `🕐 Horário: ${info.horario}\n`;
    }
    
    if (info.responsavel) {
      message += `👤 Procurar por: ${info.responsavel}\n`;
    }
    
    if (data_entrega) {
      message += `📅 Data de Entrega: ${new Date(data_entrega).toLocaleDateString('pt-BR')}\n`;
    }

    message += `\n${resposta_administrativo}`;
    message += `\n\nEm caso de dúvidas, entre em contato com o administrativo.`;

    return message;
  }

  // Formatar mensagem de rejeição de marketing
  formatMarketingRejectionMessage(solicitacao) {
    const { servico_solicitado, resposta_administrativo } = solicitacao;
    
    let message = `❌ SOLICITAÇÃO DE MARKETING NÃO APROVADA\n\n`;
    message += `Serviço: ${servico_solicitado}\n\n`;
    message += `Motivo: ${resposta_administrativo}\n\n`;
    message += `Para mais informações ou para solicitar outros serviços de marketing, entre em contato com o administrativo.`;

    return message;
  }

  // Extrair informações de entrega da resposta administrativa
  extractDeliveryInfo(resposta) {
    const info = {
      local: null,
      horario: null,
      responsavel: null
    };

    if (!resposta) return info;

    // Padrões específicos para o formato estruturado da página administrativa
    const structuredPatterns = {
      local: /📍 Local de Coleta: ([^\n]+)/,
      horario: /🕐 Horário: ([^\n]+)/,
      responsavel: /👤 Procurar por: ([^\n]+)/
    };

    // Primeiro tentar padrões estruturados (da página admin)
    for (const [key, pattern] of Object.entries(structuredPatterns)) {
      const match = resposta.match(pattern);
      if (match) {
        info[key] = match[1].trim();
      }
    }

    // Se não encontrou padrões estruturados, tentar padrões genéricos
    if (!info.local || !info.horario || !info.responsavel) {
      const genericPatterns = {
        local: /(?:local|endereço|local de coleta|onde|sede|escritório)[:\s]*([^.\n]+)/i,
        horario: /(?:horário|hora|às|entre)[:\s]*([^.\n]+)/i,
        responsavel: /(?:procurar por|falar com|responsável|atendente)[:\s]*([^.\n]+)/i
      };

      for (const [key, pattern] of Object.entries(genericPatterns)) {
        if (!info[key]) {
          const match = resposta.match(pattern);
          if (match) {
            info[key] = match[1].trim();
          }
        }
      }
    }

    // Fallback: buscar informações específicas
    if (!info.local && resposta.includes('sede')) {
      info.local = 'Sede do partido';
    }
    
    if (!info.horario && resposta.includes('segunda')) {
      info.horario = 'Segunda a sexta, 8h às 18h';
    }

    return info;
  }

  // Enviar notificação manual (para testes)
  async sendManualNotification(phoneNumber, message) {
    try {
      if (!this.botClient) {
        console.error('❌ Cliente do bot não disponível');
        return false;
      }

      await this.botClient.sendMessage(phoneNumber, message);
      console.log(`✅ Notificação manual enviada para ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar notificação manual para ${phoneNumber}:`, error);
      return false;
    }
  }

  // Verificar status do serviço
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      botClientAvailable: !!this.botClient
    };
  }
}

// Instância singleton
const notificationService = new NotificationService();

export default notificationService;
