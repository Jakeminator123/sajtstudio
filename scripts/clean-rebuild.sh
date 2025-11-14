#!/bin/bash
# Cleanup och Rebuild Script för Sajtstudio (Bash/Git Bash)
# Kör: bash scripts/clean-rebuild.sh

echo "🧹 Rensar projektet..."

# 1. Stoppa alla Node-processer
echo "1. Stoppar Node-processer..."
pkill -f node || true
sleep 2

# 2. Ta bort .next mapp
echo "2. Tar bort .next mapp..."
rm -rf .next

# 3. Ta bort node_modules (valfritt)
echo "3. Tar bort node_modules..."
rm -rf node_modules

# 4. Ta bort package-lock.json
echo "4. Tar bort package-lock.json..."
rm -f package-lock.json

# 5. Rensa npm cache
echo "5. Rensar npm cache..."
npm cache clean --force

# 6. Installera dependencies
echo ""
echo "📦 Installerar dependencies..."
npm install

# 7. Bygg projektet
echo ""
echo "🔨 Bygger projektet..."
npm run build

# 8. Starta dev-servern
echo ""
echo "🚀 Startar dev-servern..."
echo "Servern kommer starta på http://localhost:3000"
npm run dev
