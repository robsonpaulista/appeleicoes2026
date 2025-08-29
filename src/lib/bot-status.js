import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'bot-status.json');

// Estrutura do status do bot
const defaultStatus = {
  status: 'disconnected', // 'disconnected' | 'connecting' | 'connected' | 'error'
  message: 'Bot não conectado',
  qrCode: null,
  qrData: null,
  lastUpdate: new Date().toISOString(),
  botInfo: {
    phoneNumber: null,
    isReady: false,
    sessionPath: null
  }
};

// Função para ler o status atual
export function getBotStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return defaultStatus;
  } catch (error) {
    console.error('Erro ao ler status do bot:', error);
    return defaultStatus;
  }
}

// Função para atualizar o status do bot
export function updateBotStatus(updates) {
  try {
    const currentStatus = getBotStatus();
    const newStatus = {
      ...currentStatus,
      ...updates,
      lastUpdate: new Date().toISOString()
    };
    
    fs.writeFileSync(STATUS_FILE, JSON.stringify(newStatus, null, 2));
    return newStatus;
  } catch (error) {
    console.error('Erro ao atualizar status do bot:', error);
    return null;
  }
}

// Função para atualizar QR code
export function updateQRCode(qrData) {
  return updateBotStatus({
    status: 'connecting',
    message: 'QR Code disponível! Escaneie com seu WhatsApp',
    qrData: qrData,
    qrCode: null // Será gerado pela interface web
  });
}

// Função para marcar como conectado
export function markAsConnected(phoneNumber) {
  return updateBotStatus({
    status: 'connected',
    message: 'Bot conectado e funcionando!',
    qrCode: null,
    qrData: null,
    botInfo: {
      phoneNumber: phoneNumber,
      isReady: true,
      sessionPath: './.wwebjs_auth'
    }
  });
}

// Função para marcar como desconectado
export function markAsDisconnected() {
  return updateBotStatus({
    status: 'disconnected',
    message: 'Bot desconectado',
    qrCode: null,
    qrData: null,
    botInfo: {
      phoneNumber: null,
      isReady: false,
      sessionPath: null
    }
  });
}

// Função para marcar erro
export function markAsError(message) {
  return updateBotStatus({
    status: 'error',
    message: message || 'Erro no bot',
    qrCode: null,
    qrData: null
  });
}

// Função para limpar status
export function clearBotStatus() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      fs.unlinkSync(STATUS_FILE);
    }
    return defaultStatus;
  } catch (error) {
    console.error('Erro ao limpar status do bot:', error);
    return defaultStatus;
  }
}
