#!/bin/bash
set -e

echo "🚀 MyFlexio Deploy Başlıyor..."

cd /var/www/myflexio.com

# 1. Kodu güncelle
echo "📥 Kod güncelleniyor..."
git pull origin main

# 2. Frontend build
echo "⚙️  Frontend build ediliyor..."
cd frontend
npm install --legacy-peer-deps --silent
npm run build
cd ..

# 3. Backend rebuild & restart
echo "🐳 Backend yeniden başlatılıyor..."
docker compose build backend
docker compose up -d --no-recreate mysql
docker compose up -d

echo "✅ Deploy tamamlandı!"
