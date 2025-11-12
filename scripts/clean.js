// Cross-platform clean script (Windows/Linux/Mac)
// Snabb cleanup - tar bort .next och lock-filer

const fs = require('fs');
const path = require('path');

console.log('🧹 Snabb cleanup...');

// Ta bort .next mapp
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('Tar bort .next mapp...');
  fs.rmSync(nextDir, { recursive: true, force: true });
}

// Ta bort lock-filer
const lockFiles = [
  path.join(process.cwd(), '.next', 'dev', 'lock'),
  path.join(process.cwd(), 'package-lock.json'),
];

lockFiles.forEach(lockFile => {
  if (fs.existsSync(lockFile)) {
    console.log(`Tar bort ${path.basename(lockFile)}...`);
    try {
      fs.unlinkSync(lockFile);
    } catch (err) {
      // Ignorera fel om filen är låst
    }
  }
});

console.log('✅ Klar! Kör nu: npm run dev');

