// Script para testar a extração de informações de entrega

import notificationService from './src/lib/notification-service.js';

function testarExtracaoInfo() {
  console.log('🔍 Testando extração de informações de entrega...\n');

  // Teste 1: Resposta estruturada da página administrativa
  const respostaEstruturada = `Sua solicitação foi aprovada com sucesso! O material está disponível para coleta.

📍 Local de Coleta: Sede do partido - Rua das Flores, 123, Centro
🕐 Horário: Segunda a sexta-feira, das 8h às 18h
👤 Procurar por: Ana Silva (Coordenadora de Materiais)
📅 Data de Entrega: 2024-01-20

Por favor, traga um documento de identificação para retirar o material.`;

  console.log('1️⃣ Testando resposta estruturada:');
  const info1 = notificationService.extractDeliveryInfo(respostaEstruturada);
  console.log('Resultado:', info1);
  console.log('✅ Local:', info1.local);
  console.log('✅ Horário:', info1.horario);
  console.log('✅ Responsável:', info1.responsavel);

  // Teste 2: Resposta genérica
  const respostaGenerica = `Sua solicitação foi aprovada. O material pode ser retirado na sede do partido, 
  localizada na Rua das Flores, 123. Horário de funcionamento: segunda a sexta, das 8h às 18h. 
  Procurar por João Silva no setor administrativo.`;

  console.log('\n2️⃣ Testando resposta genérica:');
  const info2 = notificationService.extractDeliveryInfo(respostaGenerica);
  console.log('Resultado:', info2);
  console.log('✅ Local:', info2.local);
  console.log('✅ Horário:', info2.horario);
  console.log('✅ Responsável:', info2.responsavel);

  // Teste 3: Resposta de rejeição (sem informações de entrega)
  const respostaRejeicao = `Infelizmente sua solicitação não pôde ser aprovada no momento.

Motivo: Material temporariamente indisponível no estoque.

Sugestão: Entre em contato conosco em 2 semanas para verificar nova disponibilidade.`;

  console.log('\n3️⃣ Testando resposta de rejeição:');
  const info3 = notificationService.extractDeliveryInfo(respostaRejeicao);
  console.log('Resultado:', info3);
  console.log('✅ Local:', info3.local);
  console.log('✅ Horário:', info3.horario);
  console.log('✅ Responsável:', info3.responsavel);

  // Teste 4: Resposta vazia
  console.log('\n4️⃣ Testando resposta vazia:');
  const info4 = notificationService.extractDeliveryInfo('');
  console.log('Resultado:', info4);
  console.log('✅ Local:', info4.local);
  console.log('✅ Horário:', info4.horario);
  console.log('✅ Responsável:', info4.responsavel);

  // Teste 5: Resposta com apenas algumas informações
  const respostaParcial = `Sua solicitação foi aprovada!

📍 Local de Coleta: Escritório central
👤 Procurar por: Maria Santos

Obrigado!`;

  console.log('\n5️⃣ Testando resposta parcial:');
  const info5 = notificationService.extractDeliveryInfo(respostaParcial);
  console.log('Resultado:', info5);
  console.log('✅ Local:', info5.local);
  console.log('✅ Horário:', info5.horario);
  console.log('✅ Responsável:', info5.responsavel);

  console.log('\n✅ Teste de extração concluído!');
  console.log('\n📋 Resumo dos testes:');
  console.log('- ✅ Resposta estruturada (página admin)');
  console.log('- ✅ Resposta genérica');
  console.log('- ✅ Resposta de rejeição');
  console.log('- ✅ Resposta vazia');
  console.log('- ✅ Resposta parcial');
}

// Executar teste
testarExtracaoInfo();
