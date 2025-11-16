// Script to automatically fix common warnings
// Run with: node scripts/auto-fix-warnings.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Scanning for fixable warnings...\n');

// Common fixes for inline styles that can be replaced with Tailwind
const fixes = [
  {
    pattern: /style=\{\{\s*position:\s*['"]relative['"]\s*\}\}/g,
    replacement: 'className="relative"',
    description: 'Replace position: relative with Tailwind class'
  },
  {
    pattern: /style=\{\{\s*overflowX:\s*['"]hidden['"]\s*\}\}/g,
    replacement: 'className="overflow-x-hidden"',
    description: 'Replace overflowX: hidden with Tailwind class'
  },
  {
    pattern: /style=\{\{\s*width:\s*['"]100%['"]\s*\}\}/g,
    replacement: 'className="w-full"',
    description: 'Replace width: 100% with Tailwind class'
  },
  {
    pattern: /style=\{\{\s*aspectRatio:\s*['"]16\/9['"]\s*\}\}/g,
    replacement: 'className="aspect-video"',
    description: 'Replace aspectRatio: 16/9 with Tailwind class'
  },
];

// Find all .tsx and .ts files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const srcDir = path.join(process.cwd(), 'src');
const files = findFiles(srcDir);

let totalFixes = 0;
const fixedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fileFixed = false;
  let fileFixes = 0;
  
  fixes.forEach(fix => {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      fileFixed = true;
      fileFixes += matches.length;
    }
  });
  
  if (fileFixed) {
    fs.writeFileSync(file, content, 'utf8');
    fixedFiles.push({ file, fixes: fileFixes });
    totalFixes += fileFixes;
  }
});

if (totalFixes > 0) {
  console.log(`✅ Fixed ${totalFixes} warnings in ${fixedFiles.length} files:\n`);
  fixedFiles.forEach(({ file, fixes }) => {
    console.log(`  - ${path.relative(process.cwd(), file)} (${fixes} fixes)`);
  });
  console.log('\n✨ Done!');
} else {
  console.log('✅ No fixable warnings found.');
}

