// Teste do sistema de agendamento de sincronização automática
import { camaraScheduler } from './src/lib/scheduler.js';

async function testarScheduler() {
  console.log('🧪 Testando sistema de agendamento de sincronização automática...\n');
  
  // Teste 1: Verificar status inicial
  console.log('1️⃣ Verificando status inicial do scheduler...');
  const statusInicial = camaraScheduler.getStatus();
  console.log('Status inicial:', JSON.stringify(statusInicial, null, 2));
  
  // Teste 2: Iniciar scheduler
  console.log('\n2️⃣ Iniciando scheduler...');
  await camaraScheduler.startScheduler();
  
  // Teste 3: Verificar status após iniciar
  console.log('\n3️⃣ Verificando status após iniciar...');
  const statusAposIniciar = camaraScheduler.getStatus();
  console.log('Status após iniciar:', JSON.stringify(statusAposIniciar, null, 2));
  
  // Teste 4: Executar sincronização manual
  console.log('\n4️⃣ Executando sincronização manual...');
  const resultadoSync = await camaraScheduler.executeManualSync();
  console.log('Resultado da sincronização:', JSON.stringify(resultadoSync, null, 2));
  
  // Teste 5: Verificar estatísticas
  console.log('\n5️⃣ Verificando estatísticas...');
  const stats = camaraScheduler.getStats();
  console.log('Estatísticas:', JSON.stringify(stats, null, 2));
  
  // Teste 6: Verificar status final
  console.log('\n6️⃣ Verificando status final...');
  const statusFinal = camaraScheduler.getStatus();
  console.log('Status final:', JSON.stringify(statusFinal, null, 2));
  
  console.log('\n✅ Teste do scheduler concluído!');
  console.log('\n📋 Resumo:');
  console.log(`   - Scheduler ativo: ${statusFinal.isSchedulerActive}`);
  console.log(`   - Sincronização em andamento: ${statusFinal.isRunning}`);
  console.log(`   - Última sincronização: ${statusFinal.lastSync?.timestamp || 'N/A'}`);
  console.log(`   - Próxima sincronização: ${statusFinal.nextSync || 'N/A'}`);
  console.log(`   - Total de sincronizações: ${stats.totalSyncs}`);
  console.log(`   - Taxa de sucesso: ${stats.successRate.toFixed(1)}%`);
  
  // Não parar o scheduler para manter a sincronização automática ativa
  console.log('\n🔄 Scheduler mantido ativo para sincronização automática diária');
  console.log('💡 Use camaraScheduler.stopScheduler() para parar manualmente');
}

testarScheduler().catch(console.error);
