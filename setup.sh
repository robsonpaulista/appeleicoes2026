#!/bin/bash

echo "🚀 Iniciando setup do Bot WhatsApp - Deputado"
echo "=============================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado. Por favor, instale o PostgreSQL primeiro."
    echo "   Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "   macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL encontrado: $(psql --version)"

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Criar arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo ""
    echo "🔧 Criando arquivo .env.local..."
    cat > .env.local << EOF
# Configuração do Banco de Dados PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/bot_whatsapp

# Chave secreta para JWT (gerar uma chave segura em produção)
JWT_SECRET=sua_chave_secreta_aqui_$(openssl rand -hex 32)

# Configurações do Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=sua_chave_secreta_aqui_$(openssl rand -hex 32)

# Configurações do WhatsApp Web.js
WHATSAPP_SESSION_PATH=./.wwebjs_auth
EOF
    echo "✅ Arquivo .env.local criado"
    echo "⚠️  IMPORTANTE: Configure o DATABASE_URL no arquivo .env.local com suas credenciais do PostgreSQL"
else
    echo "✅ Arquivo .env.local já existe"
fi

# Criar pasta de logs
mkdir -p logs

echo ""
echo "🗄️  Configurando banco de dados..."
echo "⚠️  Certifique-se de que o PostgreSQL está rodando e que você criou o banco 'bot_whatsapp'"
echo "   Comando para criar o banco: createdb bot_whatsapp"

# Perguntar se quer executar as migrações
read -p "Deseja executar as migrações do banco agora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Executando migrações..."
    npm run db:migrate
    
    echo "🌱 Populando banco com dados iniciais..."
    npm run db:seed
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o DATABASE_URL no arquivo .env.local"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000"
echo "4. Para o bot: npm run dev:bot"
echo ""
echo "📚 Documentação completa: README.md"
