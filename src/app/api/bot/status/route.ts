import { NextRequest, NextResponse } from 'next/server';
import { getBotStatus, updateBotStatus, markAsDisconnected } from '@/lib/bot-status';
import { spawn } from 'child_process';
import path from 'path';

let botProcess: any = null;

export async function GET() {
  try {
    // Obter status atual do bot do arquivo compartilhado
    const botStatus = getBotStatus();
    
    return NextResponse.json(botStatus);
  } catch (error) {
    console.error('Erro ao obter status do bot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'start') {
      // Verificar se o bot já está rodando
      if (botProcess && !botProcess.killed) {
        return NextResponse.json({ 
          success: false, 
          message: 'Bot já está rodando',
          status: 'running'
        });
      }
      
      // Iniciar o bot
      console.log('🚀 Iniciando bot via API...');
      
      // Atualizar status para iniciando
      updateBotStatus({
        status: 'connecting',
        message: 'Iniciando bot WhatsApp...'
      });
      
      // Caminho para o script de início do bot
      const scriptPath = path.join(process.cwd(), 'scripts', 'start-bot.js');
      
      try {
        // Iniciar o bot usando o script
        botProcess = spawn('node', [scriptPath], {
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        console.log(`📱 Bot iniciado com PID: ${botProcess.pid}`);
        
        // Capturar saída do bot
        botProcess.stdout?.on('data', (data) => {
          const output = data.toString().trim();
          console.log(`[BOT] ${output}`);
        });
        
        // Capturar erros do bot
        botProcess.stderr?.on('data', (data) => {
          const error = data.toString().trim();
          console.error(`[BOT ERROR] ${error}`);
        });
        
        // Capturar quando o processo termina
        botProcess.on('close', (code) => {
          console.log(`🛑 Bot finalizado com código: ${code}`);
          markAsDisconnected();
          botProcess = null;
        });
        
        // Capturar erros do processo
        botProcess.on('error', (error) => {
          console.error('❌ Erro ao iniciar bot:', error);
          markAsDisconnected();
          botProcess = null;
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Bot iniciado com sucesso!',
          status: 'connecting',
          pid: botProcess.pid
        });
        
      } catch (error) {
        console.error('Erro ao executar script do bot:', error);
        markAsDisconnected();
        return NextResponse.json(
          { error: 'Erro ao executar script do bot' },
          { status: 500 }
        );
      }
    }
    
    if (action === 'stop') {
      // Parar o bot
      console.log('🛑 Parando bot via API...');
      
      if (botProcess && !botProcess.killed) {
        try {
          botProcess.kill('SIGTERM');
          console.log('✅ Sinal de parada enviado para o bot');
        } catch (error) {
          console.error('Erro ao parar bot:', error);
        }
      }
      
      // Marcar como desconectado
      markAsDisconnected();
      botProcess = null;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Bot parado com sucesso!',
        status: 'disconnected'
      });
    }
    
    if (action === 'reset') {
      // Resetar status do bot
      console.log('🔄 Resetando status do bot...');
      
      updateBotStatus({
        status: 'disconnected',
        message: 'Status resetado',
        qrCode: null,
        qrData: null
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Status do bot resetado!',
        status: 'disconnected'
      });
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro na API do bot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
