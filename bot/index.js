import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { whitelistService, knowledgeBaseService, conversationLogService, materiaisService, solicitacoesService } from '../src/lib/services.js';
import { updateBotStatus, updateQRCode, markAsConnected, markAsDisconnected, markAsError } from '../src/lib/bot-status.js';
import notificationService from '../src/lib/notification-service.js';

// Configuração do cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "bot-deputado",
        dataPath: "./.wwebjs_auth"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

console.log('🤖 Iniciando Bot WhatsApp Deputado...');

// Atualizar status para iniciando
updateBotStatus({
    status: 'connecting',
    message: 'Bot iniciando...'
});

// Evento quando recebe QR Code
client.on('qr', (qr) => {
    console.log('🔐 QR_CODE_START');
    console.log(qr);
    console.log('🔐 QR_CODE_END');
    console.log('📱 Escaneie o QR Code na página web para conectar!');
    
    // Atualizar status com QR code para a interface web
    updateQRCode(qr);
});

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('✅ Cliente WhatsApp conectado e pronto!');
    console.log('📱 Bot ativo e aguardando mensagens...');
    
    // Marcar como conectado
    const phoneNumber = client.info?.wid?.user || 'Número não disponível';
    markAsConnected(phoneNumber);
    
    // Inicializar e iniciar o serviço de notificação
    notificationService.init(client);
    notificationService.start();
    
    console.log('🔐 STATUS_CONNECTED');
    console.log('🔔 Serviço de notificação iniciado');
});

// Evento quando recebe uma mensagem
client.on('message', async (message) => {
    try {
        // Ignorar mensagens do próprio bot
        if (message.fromMe) return;

        const phoneNumber = message.from;
        const messageText = message.body || '';
        
        console.log(`📱 Mensagem recebida de ${phoneNumber}: ${messageText}`);

        // Processar a mensagem
        const response = await processMessage(phoneNumber, messageText);
        
        // Enviar resposta
        await message.reply(response);
        
        console.log(`🤖 Resposta enviada para ${phoneNumber}: ${response}`);
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        try {
            await message.reply('Desculpe, ocorreu um erro. Tente novamente em alguns instantes.');
        } catch (replyError) {
            console.error('❌ Erro ao enviar resposta de erro:', replyError);
        }
    }
});

// Evento de autenticação
client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    console.log('🔄 Tente reconectar o bot...');
    
    // Marcar como erro
    markAsError(`Falha na autenticação: ${msg}`);
    console.log('🔐 STATUS_AUTH_FAILED');
});

// Evento de desconexão
client.on('disconnected', (reason) => {
    console.log('🔌 Cliente desconectado:', reason);
    console.log('🔄 Tentando reconectar...');
    
    // Marcar como desconectado
    markAsDisconnected();
    console.log('🔐 STATUS_DISCONNECTED');
});

// Função para processar mensagens
async function processMessage(phoneNumber, message) {
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
                response = 'O deputado Jadyel Alencar foi relator do PL-2628/2022, um projeto de alcance nacional que modernizou o Marco Legal das Telecomunicações no Brasil. Este projeto foi aprovado por ampla maioria na Câmara dos Deputados e trouxe benefícios para milhões de brasileiros.';
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
function detectIntent(text) {
    const t = (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (/^menu$|^ajuda$|^inicio$/.test(t)) return 'menu';
    if (/(oi|ola|bom dia|boa tarde|boa noite)\b/.test(t)) return 'saudacao';
    if (/^sair$|^encerrar$|^tchau$/.test(t)) return 'despedida';
    
    return 'faq';
}

// Inicializar o cliente
client.initialize();

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    markAsError(`Erro não tratado: ${reason}`);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    markAsError(`Exceção não capturada: ${error.message}`);
});

// Tratamento de sinal de parada
process.on('SIGINT', () => {
    console.log('🛑 Recebido sinal de parada...');
    notificationService.stop();
    markAsDisconnected();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Recebido sinal de término...');
    notificationService.stop();
    markAsDisconnected();
    process.exit(0);
});

console.log('🚀 Bot iniciado! Aguardando conexão...');
