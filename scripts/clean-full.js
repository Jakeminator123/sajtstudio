// Cross-platform full clean script (Windows/Linux/Mac)
// Fullständig cleanup - tar bort .next, node_modules och lock-filer

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Rensar projektet...\n');

// 1. Ta bort .next mapp
console.log('1. Tar bort .next mapp...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// 2. Ta bort node_modules (valfritt - kan ta tid)
console.log('2. Tar bort node_modules...');
const nodeModulesDir = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesDir)) {
  fs.rmSync(nodeModulesDir, { recursive: true, force: true });
}

// 3. Ta bort package-lock.json
console.log('3. Tar bort package-lock.json...');
const lockFile = path.join(process.cwd(), 'package-lock.json');
if (fs.existsSync(lockFile)) {
  fs.unlinkSync(lockFile);
}

// 4. Rensa npm cache
console.log('4. Rensar npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (err) {
  console.log('Kunde inte rensa npm cache (kan ignoreras)');
}

// 5. Installera dependencies
console.log('\n📦 Installerar dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (err) {
  console.error('Fel vid installation av dependencies');
  process.exit(1);
}

// 6. Bygg projektet
console.log('\n🔨 Bygger projektet...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (err) {
  console.error('Fel vid byggning av projektet');
  process.exit(1);
}

console.log('\n✅ Klart! Kör nu: npm run dev');

