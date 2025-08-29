# 🤖 Sincronização Automática da API da Câmara

## ✅ **SISTEMA DE SINCRONIZAÇÃO AUTOMÁTICA IMPLEMENTADO**

O sistema agora possui **sincronização automática diária** que mantém o conteúdo sempre atualizado, independente da intervenção manual do usuário.

## 🕐 **AGENDAMENTO AUTOMÁTICO**

### **Horário de Execução**
- **Frequência:** Diária
- **Horário:** 6:00 da manhã
- **Execução:** Automática e silenciosa
- **Duração:** ~30-60 segundos

### **Comportamento**
- ✅ Executa automaticamente todos os dias
- ✅ Busca novos projetos da API oficial
- ✅ Adiciona apenas projetos novos (não duplica)
- ✅ Logs detalhados para monitoramento
- ✅ Fallback automático em caso de erro

## 🔧 **COMO FUNCIONA**

### **1. Scheduler Automático**
```typescript
// Inicia automaticamente em produção
camaraScheduler.startScheduler()

// Agenda para 6:00 da manhã
// Executa diariamente
// Mantém histórico de execuções
```

### **2. Processo de Sincronização**
1. **Verificação:** Checa se já está rodando
2. **Busca:** Acessa API oficial da Câmara
3. **Processamento:** Filtra projetos novos
4. **Inserção:** Adiciona à base de conhecimento
5. **Log:** Registra resultado e estatísticas

### **3. Tratamento de Erros**
- ✅ Retry automático em caso de falha
- ✅ Logs detalhados para debug
- ✅ Sistema continua funcionando
- ✅ Notificação de erros

## 📊 **MONITORAMENTO**

### **Status em Tempo Real**
```bash
# Verificar status do scheduler
GET /api/scheduler/status

# Resposta:
{
  "success": true,
  "status": {
    "isRunning": false,
    "isSchedulerActive": true,
    "lastSync": {
      "success": true,
      "novosItens": 2,
      "totalProjetos": 34,
      "timestamp": "2025-08-29T06:00:00.000Z"
    },
    "nextSync": "2025-08-30T06:00:00.000Z",
    "syncHistory": [...]
  },
  "stats": {
    "totalSyncs": 15,
    "successfulSyncs": 14,
    "failedSyncs": 1,
    "successRate": 93.3,
    "totalNewItems": 45,
    "averageDuration": 2340
  }
}
```

### **Estatísticas Disponíveis**
- **Total de sincronizações:** Número de execuções
- **Taxa de sucesso:** Porcentagem de sucessos
- **Itens novos:** Total de projetos adicionados
- **Duração média:** Tempo médio de execução
- **Última execução:** Data/hora da última sincronização
- **Próxima execução:** Data/hora da próxima sincronização

## 🎛️ **CONTROLE MANUAL**

### **Endpoints de Controle**
```bash
# Iniciar scheduler
POST /api/scheduler/control
{
  "action": "start"
}

# Parar scheduler
POST /api/scheduler/control
{
  "action": "stop"
}

# Executar sincronização manual
POST /api/scheduler/control
{
  "action": "sync"
}
```

### **Scripts NPM**
```bash
# Testar scheduler
npm run test:scheduler

# Iniciar scheduler manualmente
npm run scheduler:start

# Parar scheduler
npm run scheduler:stop
```

## 🚀 **CONFIGURAÇÃO**

### **Ambiente de Desenvolvimento**
- Scheduler **não inicia automaticamente**
- Use `npm run test:scheduler` para testar
- Controle manual via endpoints

### **Ambiente de Produção**
- Scheduler **inicia automaticamente**
- Execução diária às 6:00 da manhã
- Logs detalhados para monitoramento

### **Variáveis de Ambiente**
```env
# Configuração do scheduler
NODE_ENV=production  # Inicia automaticamente
NODE_ENV=development # Controle manual
```

## 📈 **BENEFÍCIOS**

### **Para o Usuário**
- ✅ **Conteúdo sempre atualizado** sem intervenção manual
- ✅ **Novos projetos** aparecem automaticamente
- ✅ **Sistema confiável** com tratamento de erros
- ✅ **Monitoramento** em tempo real

### **Para o Sistema**
- ✅ **Eficiência:** Execução otimizada
- ✅ **Confiabilidade:** Fallback automático
- ✅ **Monitoramento:** Logs e estatísticas
- ✅ **Escalabilidade:** Processamento assíncrono

## 🔍 **LOGS E DEBUG**

### **Logs de Execução**
```
🚀 Iniciando scheduler de sincronização automática da Câmara...
📅 Próxima sincronização agendada para: 29/08/2025 06:00:00
⏰ Tempo até a próxima execução: 720 minutos
✅ Scheduler iniciado com sucesso

🔄 Iniciando sincronização automática da Câmara...
📋 Buscando proposições por nome do deputado...
✅ Encontrados 19 projetos via busca por nome
✅ Encontrados 15 projetos via busca por nome
✅ Sincronização automática concluída: 2 novos, 0 atualizados, 34 total
⏱️ Duração: 2340ms
```

### **Histórico de Sincronizações**
- Últimas 30 execuções mantidas
- Detalhes de cada execução
- Estatísticas de performance
- Logs de erro para debug

## 🛡️ **SEGURANÇA E CONFIABILIDADE**

### **Proteções Implementadas**
- ✅ **Prevenção de duplicação:** Verifica projetos existentes
- ✅ **Controle de concorrência:** Evita execuções simultâneas
- ✅ **Tratamento de erros:** Fallback automático
- ✅ **Logs de auditoria:** Histórico completo

### **Monitoramento**
- ✅ **Status em tempo real**
- ✅ **Estatísticas de performance**
- ✅ **Alertas de erro**
- ✅ **Histórico de execuções**

## 🎯 **PRÓXIMOS PASSOS**

### **Melhorias Futuras**
1. **Notificações:** Alertas por email/Slack
2. **Dashboard:** Interface visual para monitoramento
3. **Configuração:** Horário personalizável
4. **Múltiplas fontes:** Outras APIs legislativas

### **Monitoramento Avançado**
- Métricas de performance
- Alertas automáticos
- Dashboard de estatísticas
- Relatórios periódicos

---

## 🎉 **RESULTADO FINAL**

**✅ SISTEMA TOTALMENTE AUTOMATIZADO**
- Sincronização diária automática
- Conteúdo sempre atualizado
- Monitoramento em tempo real
- Controle manual disponível
- Logs detalhados para debug

**🤖 Funcionamento:** Automático e silencioso
**📅 Frequência:** Diária às 6:00 da manhã
**📊 Monitoramento:** Status e estatísticas em tempo real
**🛡️ Confiabilidade:** Tratamento robusto de erros
