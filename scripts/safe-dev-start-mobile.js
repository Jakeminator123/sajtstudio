// Safe dev server start script for mobile testing
// Kills existing processes, cleans cache, then starts dev server with network access

const { execSync, spawn } = require('child_process');
const path = require('path');
const os = require('os');

console.log('📱 Säker start av dev-server för mobil-testning...\n');

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

// Step 3: Get local IP address
console.log('\n3️⃣ Hämtar lokal IP-adress...');
let localIP = 'localhost';
try {
  const networkInterfaces = os.networkInterfaces();
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }
} catch (err) {
  console.log('Kunde inte hitta IP-adress, använder localhost');
}

// Step 4: Wait a moment for processes to fully terminate
console.log('\n4️⃣ Väntar på att processer ska avslutas...');
// Use setTimeout with callback instead of await
setTimeout(() => {
  startDevServer();
}, 1000);

function startDevServer() {

  // Step 5: Start dev server with network access
  console.log('\n5️⃣ Startar Next.js dev-server med nätverksåtkomst...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 Desktop: http://localhost:3000');
  console.log(`📍 Mobil (samma WiFi): http://${localIP}:3000`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const devProcess = spawn('npm', ['run', 'dev', '--', '--hostname', '0.0.0.0'], {
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

