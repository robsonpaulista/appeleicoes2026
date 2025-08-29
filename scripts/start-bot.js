import { spawn } from 'child_process';
import { updateBotStatus, markAsDisconnected } from '../src/lib/bot-status.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando Bot WhatsApp Deputado...');

// Atualizar status para iniciando
updateBotStatus({
    status: 'connecting',
    message: 'Iniciando bot via script...'
});

// Caminho para o arquivo do bot
const botPath = path.join(__dirname, '..', 'bot', 'index.js');

// Iniciar processo do bot
const botProcess = spawn('node', [botPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: path.join(__dirname, '..')
});

console.log(`📱 Bot iniciado com PID: ${botProcess.pid}`);

// Capturar saída padrão
botProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[BOT] ${output}`);
    
    // Verificar se há QR code na saída
    if (output.includes('QR_CODE_START') && output.includes('QR_CODE_END')) {
        console.log('🔍 QR Code detectado na saída do bot');
    }
    
    // Verificar se está conectado
    if (output.includes('STATUS_CONNECTED')) {
        console.log('✅ Bot conectado com sucesso!');
    }
});

// Capturar erros
botProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    console.error(`[BOT ERROR] ${error}`);
});

// Capturar quando o processo termina
botProcess.on('close', (code) => {
    console.log(`🛑 Bot finalizado com código: ${code}`);
    markAsDisconnected();
});

// Capturar quando o processo é interrompido
botProcess.on('SIGINT', () => {
    console.log('🛑 Recebido sinal de interrupção...');
    botProcess.kill('SIGINT');
});

botProcess.on('SIGTERM', () => {
    console.log('🛑 Recebido sinal de término...');
    botProcess.kill('SIGTERM');
});

// Tratamento de erros do processo
botProcess.on('error', (error) => {
    console.error('❌ Erro ao iniciar bot:', error);
    markAsDisconnected();
});

// Tratamento de sinais do sistema
process.on('SIGINT', () => {
    console.log('🛑 Recebido sinal de interrupção no script principal...');
    botProcess.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Recebido sinal de término no script principal...');
    botProcess.kill('SIGTERM');
    process.exit(0);
});

console.log('✅ Script de início do bot executado com sucesso!');
console.log('📱 Bot rodando em background...');
console.log('💡 Use Ctrl+C para parar o bot');
