#!/bin/bash

# Script de backup para o banco de dados PostgreSQL
# Configurações
DB_NAME="bot_whatsapp"
DB_USER="postgres"
BACKUP_DIR="/var/backups/bot-whatsapp"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="bot_whatsapp_$DATE.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Função de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a $BACKUP_DIR/backup.log
}

# Iniciar backup
log "Iniciando backup do banco $DB_NAME..."

# Executar backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# Verificar se o backup foi bem-sucedido
if [ $? -eq 0 ]; then
    log "Backup concluído com sucesso: $BACKUP_FILE"
    
    # Comprimir o arquivo
    gzip $BACKUP_DIR/$BACKUP_FILE
    log "Arquivo comprimido: $BACKUP_FILE.gz"
    
    # Manter apenas os últimos 7 backups
    cd $BACKUP_DIR
    ls -t *.sql.gz | tail -n +8 | xargs -r rm
    log "Backups antigos removidos (mantidos últimos 7)"
    
    # Calcular tamanho do backup
    BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_FILE.gz | cut -f1)
    log "Tamanho do backup: $BACKUP_SIZE"
    
else
    log "ERRO: Falha no backup do banco $DB_NAME"
    exit 1
fi

# Backup dos arquivos de configuração
log "Iniciando backup dos arquivos de configuração..."

# Backup do .env.local (se existir)
if [ -f .env.local ]; then
    cp .env.local $BACKUP_DIR/env_backup_$DATE
    log "Arquivo .env.local copiado"
fi

# Backup da sessão do WhatsApp (se existir)
if [ -d .wwebjs_auth ]; then
    tar -czf $BACKUP_DIR/whatsapp_session_$DATE.tar.gz .wwebjs_auth
    log "Sessão WhatsApp copiada"
fi

log "Backup completo finalizado"
