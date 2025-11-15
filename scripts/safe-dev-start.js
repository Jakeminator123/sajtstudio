// Safe dev server start script
// Kills existing processes, cleans cache, then starts dev server

const { execSync, spawn } = require('child_process');
const path = require('path');

console.log('🚀 Säker start av dev-server...\n');

// Step 1: Kill existing Node processes
console.log('1️⃣ Dödar befintliga Node-processer...');
try {
  const killNodeProcesses = require('./kill-node-processes.js');
  if (typeof killNodeProcesses === 'function') {
    killNodeProcesses();
  }
} catch (err) {
  console.log('Kunde inte köra kill-script, fortsätter ändå...');
}

// Step 2: Clean .next cache
console.log('\n2️⃣ Rensar .next cache...');
const fs = require('fs');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .next mapp borttagen');
  } catch (err) {
    console.log('Kunde inte ta bort .next (kan ignoreras)');
  }
}

// Step 3: Wait a moment for processes to fully terminate
console.log('\n3️⃣ Väntar på att processer ska avslutas...');
// Use setTimeout with callback instead of await
setTimeout(() => {
  startDevServer();
}, 1000);

function startDevServer() {

  // Step 4: Start dev server
  console.log('\n4️⃣ Startar Next.js dev-server...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 Dev-server körs på: http://localhost:3000');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  // Handle exit
  devProcess.on('exit', (code) => {
    console.log(`\n\nDev-server avslutad med kod: ${code}`);
    process.exit(code);
  });

  // Handle errors
  devProcess.on('error', (err) => {
    console.error('Fel vid start av dev-server:', err);
    process.exit(1);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stänger dev-server...');
    devProcess.kill('SIGINT');
    
    // Kill any remaining processes
    setTimeout(() => {
      try {
        const killNodeProcesses = require('./kill-node-processes.js');
        if (typeof killNodeProcesses === 'function') {
          killNodeProcesses();
        }
      } catch (err) {
        // Ignore
      }
      process.exit(0);
    }, 1000);
  });
}

