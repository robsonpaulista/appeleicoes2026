import { NextRequest, NextResponse } from 'next/server';
import { whitelistService, knowledgeBaseService, conversationLogService, materiaisService, solicitacoesService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log da mensagem recebida
    console.log('📥 Mensagem recebida:', JSON.stringify(body, null, 2));
    
    // Verificar se é uma mensagem válida
    if (!body.entry || !body.entry[0]?.changes || !body.entry[0].changes[0]?.value) {
      return NextResponse.json({ status: 'ok' });
    }
    
    const change = body.entry[0].changes[0];
    
    // Verificar se é uma mensagem
    if (change.value.messages && change.value.messages.length > 0) {
      const message = change.value.messages[0];
      
      // Extrair dados da mensagem
      const phoneNumber = message.from;
      const messageText = message.text?.body || '';
      const messageId = message.id;
      
      console.log(`📱 Mensagem de ${phoneNumber}: ${messageText}`);
      
      // Processar a mensagem
      const response = await processMessage(phoneNumber, messageText);
      
      // Enviar resposta (aqui você implementaria a API do WhatsApp)
      console.log(`🤖 Resposta para ${phoneNumber}: ${response}`);
      
      // TODO: Implementar envio real via WhatsApp API
      // await sendWhatsAppMessage(phoneNumber, response);
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Verificação do webhook (para configuração inicial)
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  
  console.log('🔗 Verificação do webhook:', { mode, token, challenge });
  
  // Seu token de verificação (configure no .env)
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'seu_token_aqui';
  
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verificado com sucesso!');
    return new Response(challenge, { status: 200 });
  }
  
  return new Response('Forbidden', { status: 403 });
}

async function processMessage(phoneNumber: string, message: string) {
  try {
    // Verificar se é VIP
    const isVip = await whitelistService.isVip(phoneNumber);
    
    // Detectar intent
    const intent = detectIntent(message);
    let response = '';
    let confidenceScore = null;

    if (intent === 'menu' || intent === 'saudacao') {
      if (isVip) {
        // Buscar informações do VIP para personalizar a saudação
        const vipInfo = await whitelistService.getVipInfo(phoneNumber);
        const nome = vipInfo?.name || 'Líder';
        response = `Olá ${nome}! Bem-vindo ao gabinete do deputado Jadyel Alencar, será um prazer atendê-lo. Como posso ajudá-lo?`;
      } else {
        response = 'Olá! Bem-vindo ao gabinete do deputado Jadyel Alencar, será um prazer atendê-lo. Posso ajudar com informações sobre projetos, realizações e bandeiras. Digite "menu" para ver as opções.';
      }
          } else if (intent === 'despedida') {
        response = 'Até logo! Se precisar de mais informações, estarei aqui.';
          } else if (intent === 'faq') {
        // Verificar se é uma pergunta sobre projetos ou materiais
        const normalizedMessage = message.toLowerCase();
        
        if (normalizedMessage.includes('material') || normalizedMessage.includes('materiais') || 
            normalizedMessage.includes('bandeira') || normalizedMessage.includes('bandeiras') ||
            normalizedMessage.includes('santinho') || normalizedMessage.includes('santinhos') ||
            normalizedMessage.includes('adesivo') || normalizedMessage.includes('adesivos') ||
            normalizedMessage.includes('camiseta') || normalizedMessage.includes('camisetas') ||
            normalizedMessage.includes('boné') || normalizedMessage.includes('bonés') ||
            normalizedMessage.includes('panfleto') || normalizedMessage.includes('panfletos') ||
            normalizedMessage.includes('preciso') || normalizedMessage.includes('quero') ||
            normalizedMessage.includes('solicito') || normalizedMessage.includes('solicitação')) {
          
          // Registrar solicitação de material
          const vipInfo = await whitelistService.getVipInfo(phoneNumber);
          const nome_solicitante = vipInfo?.name || 'Líder';
          const municipio_solicitante = vipInfo?.municipio || 'Não informado';
          
          const solicitacao = await solicitacoesService.add({
            phone_number: phoneNumber,
            nome_solicitante: nome_solicitante,
            municipio_solicitante: municipio_solicitante,
            material_solicitado: message,
            quantidade: 1,
            valor_unitario: 0.00,
            valor_total: 0.00,
            observacoes: `Solicitação via bot: ${message}`
          });
          
          response = `Solicitação registrada com sucesso! Sua solicitação de material foi enviada para o administrativo. Em breve entraremos em contato para confirmar a disponibilidade.`;
          confidenceScore = 0.9;
        } else if (normalizedMessage.includes('PL-2628') || normalizedMessage.includes('2628/2022')) {
        // Busca específica para o PL-2628/2022
        const pl2628 = await knowledgeBaseService.search('PL-2628');
        
        if (pl2628.length > 0) {
          response = pl2628[0].resposta;
          confidenceScore = 0.95;
        } else {
          response = 'O deputado Jadyel Alencar foi relator do PL-2628/2022, conhecido como "ECA Digital", um projeto de alcance nacional que cria regras para a proteção de crianças e adolescentes em ambientes digitais. Este projeto foi aprovado por ampla maioria na Câmara dos Deputados em 20/08/2025 e combate a pedofilia, sexualização precoce, automutilação e jogos de azar online.';
        }
      } else if (normalizedMessage.includes('projeto') || normalizedMessage.includes('projetos')) {
        // Busca específica para projetos
        const projetos = await knowledgeBaseService.searchProjetos();
        
        if (projetos.length > 0) {
          if (projetos.length === 1) {
            response = projetos[0].resposta;
          } else {
                         // Resposta com resumo dos projetos
             const projetosRecentes = projetos.slice(0, 3);
             response = `O deputado Jadyel Alencar tem ${projetos.length} projetos em tramitação na Câmara dos Deputados. Aqui estão os mais recentes:\n\n`;
             
             projetosRecentes.forEach((projeto, index) => {
               const titulo = projeto.titulo.split(' - ')[0]; // Remove a parte do link
               response += `${index + 1}. ${titulo}\n`;
             });
             
             response += `\nPara saber mais sobre um projeto específico, me pergunte pelo número ou tipo (ex: "PL 1234" ou "PEC 567").`;
          }
          confidenceScore = 0.9;
                   } else {
             response = 'O deputado Jadyel Alencar tem vários projetos em tramitação na Câmara dos Deputados. Para obter informações atualizadas, entre em contato com o gabinete.';
           }
      } else {
        // Busca geral na base de conhecimento
        const searchResults = await knowledgeBaseService.search(message);
        
        if (searchResults.length > 0) {
          response = searchResults[0].resposta;
          confidenceScore = 0.8;
        } else {
          response = 'Posso ajudar com assuntos relacionados ao Deputado. Tente perguntar sobre projetos, realizações ou bandeiras.';
        }
      }
    }

    // Log da conversa
    await conversationLogService.log(
      phoneNumber,
      isVip,
      message,
      response,
      intent,
      confidenceScore
    );

    console.log(`📱 [${isVip ? 'VIP' : 'GERAL'}] ${phoneNumber}: ${message}`);
    console.log(`🤖 Resposta: ${response}`);

    return response;
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.';
  }
}

// Função para detectar intent
function detectIntent(text: string): string {
  const t = (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (/^menu$|^ajuda$|^inicio$/.test(t)) return 'menu';
  if (/(oi|ola|bom dia|boa tarde|boa noite)\b/.test(t)) return 'saudacao';
  if (/^sair$|^encerrar$|^tchau$/.test(t)) return 'despedida';
  
  return 'faq';
}
