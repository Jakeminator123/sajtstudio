// Cross-platform script to kill Node.js processes
// Kills all Node processes running on port 3000 and other Next.js processes

const { execSync } = require('child_process');
const os = require('os');
const platform = os.platform();

function killNodeProcesses() {
  console.log('🔍 Letar efter Node-processer...\n');

  try {
    if (platform === 'win32') {
      // Windows: Find and kill processes on port 3000
      console.log('Windows: Dödar processer på port 3000...');
      
      try {
        // Find PID using port 3000
        const netstatOutput = execSync('netstat -ano | findstr :3000', { encoding: 'utf-8' });
        const lines = netstatOutput.split('\n').filter(line => line.includes('LISTENING'));
        
        const pids = new Set();
        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });

        // Also find node.exe processes
        const tasklistOutput = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { encoding: 'utf-8' });
        const tasklistLines = tasklistOutput.split('\n').slice(1); // Skip header
        tasklistLines.forEach(line => {
          if (line.includes('node.exe')) {
            const match = line.match(/"([^"]+)","([^"]+)","([^"]+)"/);
            if (match && match[2]) {
              pids.add(match[2]);
            }
          }
        });

        // Kill all found processes
        if (pids.size > 0) {
          console.log(`Hittade ${pids.size} process(er) att döda...`);
          pids.forEach(pid => {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
              console.log(`✅ Dödade process ${pid}`);
            } catch (err) {
              // Process might already be dead, ignore
            }
          });
        } else {
          console.log('Inga Node-processer hittades på port 3000');
        }
      } catch (err) {
        // No processes found or netstat failed
        console.log('Inga processer hittades (kan vara bra!)');
      }

      // Also kill any node.exe processes that might be hanging
      try {
        execSync('taskkill /F /IM node.exe 2>nul', { stdio: 'ignore' });
        console.log('✅ Rensade alla node.exe processer');
      } catch (err) {
        // No processes to kill
        console.log('Inga node.exe processer att döda');
      }

    } else {
      // Linux/Mac: Find and kill processes on port 3000
      console.log('Unix: Dödar processer på port 3000...');
      
      try {
        // Find PID using lsof (Mac/Linux)
        const lsofOutput = execSync('lsof -ti:3000', { encoding: 'utf-8' });
        const pids = lsofOutput.trim().split('\n').filter(pid => pid);
        
        if (pids.length > 0) {
          console.log(`Hittade ${pids.length} process(er) på port 3000...`);
          pids.forEach(pid => {
            try {
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              console.log(`✅ Dödade process ${pid}`);
            } catch (err) {
              // Process might already be dead
            }
          });
        } else {
          console.log('Inga processer hittades på port 3000');
        }
      } catch (err) {
        // No processes found
        console.log('Inga processer hittades på port 3000');
      }

      // Also kill any node processes
      try {
        execSync('pkill -9 node 2>/dev/null', { stdio: 'ignore' });
        console.log('✅ Rensade alla node-processer');
      } catch (err) {
        console.log('Inga node-processer att döda');
      }
    }

    console.log('\n✅ Klar! Alla Node-processer är dödade.');
    
  } catch (error) {
    console.error('Fel vid dödning av processer:', error.message);
    if (require.main === module) {
      process.exit(1);
    }
  }
}

// Run if called directly, otherwise export function
if (require.main === module) {
  killNodeProcesses();
} else {
  module.exports = killNodeProcesses;
}
