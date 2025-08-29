import { NextRequest, NextResponse } from 'next/server';
import { configService, whitelistService, knowledgeBaseService, conversationLogService, materiaisService, solicitacoesService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Telefone e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ 
      success: true,
      response,
      isVip,
      intent
    });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
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
