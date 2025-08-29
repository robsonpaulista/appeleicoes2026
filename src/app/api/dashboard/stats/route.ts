import { NextResponse } from 'next/server';
import { conversationLogService } from '@/lib/services';

export async function GET() {
  try {
    const stats = await conversationLogService.getStats();
    
    if (stats.length > 0) {
      const latest = stats[0];
      return NextResponse.json({
        totalMessages: parseInt(latest.total_messages) || 0,
        uniqueUsers: parseInt(latest.unique_users) || 0,
        vipMessages: parseInt(latest.vip_messages) || 0,
        generalMessages: parseInt(latest.general_messages) || 0
      });
    }
    
    return NextResponse.json({
      totalMessages: 0,
      uniqueUsers: 0,
      vipMessages: 0,
      generalMessages: 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
