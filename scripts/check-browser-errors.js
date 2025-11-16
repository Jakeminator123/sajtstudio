// Script to automatically read and display browser errors
// Run with: npm run check:errors

const fs = require('fs');
const path = require('path');

const ERROR_LOG_FILE = path.join(process.cwd(), 'logs', 'browser-errors.json');
const ERROR_SUMMARY_FILE = path.join(process.cwd(), 'logs', 'errors-summary.txt');

function readErrors() {
  try {
    if (!fs.existsSync(ERROR_LOG_FILE)) {
      return [];
    }
    const content = fs.readFileSync(ERROR_LOG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

function groupErrors(errors) {
  const grouped = {};
  errors.forEach(error => {
    const key = error.message || 'Unknown error';
    if (!grouped[key]) {
      grouped[key] = {
        message: key,
        count: 0,
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        type: error.type,
        stack: error.stack,
        source: error.source,
      };
    }
    grouped[key].count++;
    if (new Date(error.timestamp) > new Date(grouped[key].lastSeen)) {
      grouped[key].lastSeen = error.timestamp;
    }
  });
  return Object.values(grouped);
}

function formatErrorSummary(errors) {
  if (errors.length === 0) {
    return '✅ No browser errors found!\n';
  }

  const grouped = groupErrors(errors);
  const summary = [];
  
  summary.push(`📊 Browser Error Summary (${errors.length} total errors, ${grouped.length} unique)\n`);
  summary.push('='.repeat(80));
  summary.push('');

  grouped.forEach((error, index) => {
    summary.push(`${index + 1}. ${error.type.toUpperCase()}: ${error.message}`);
    summary.push(`   Count: ${error.count}`);
    summary.push(`   First seen: ${new Date(error.firstSeen).toLocaleString()}`);
    summary.push(`   Last seen: ${new Date(error.lastSeen).toLocaleString()}`);
    if (error.source) {
      summary.push(`   Source: ${error.source}`);
    }
    if (error.stack) {
      const stackLines = error.stack.split('\n').slice(0, 3);
      summary.push(`   Stack: ${stackLines.join(' → ')}`);
    }
    summary.push('');
  });

  return summary.join('\n');
}

function main() {
  console.log('🔍 Checking browser errors...\n');
  
  const errors = readErrors();
  const summary = formatErrorSummary(errors);
  
  console.log(summary);
  
  // Write summary to file for AI agent to read
  fs.writeFileSync(ERROR_SUMMARY_FILE, summary, 'utf-8');
  console.log(`\n💾 Summary saved to: logs/errors-summary.txt`);
  console.log(`📋 Full errors available at: logs/browser-errors.json\n`);
  
  if (errors.length > 0) {
    console.log('💡 Tips:');
    console.log('   - Say "Kolla browser-errors.json" or "Analysera felen" to get help');
    console.log('   - The AI agent can automatically read logs/errors-summary.txt');
    console.log('   - Latest errors are always available in logs/browser-errors.json\n');
    process.exit(1); // Exit with error code if there are errors
  } else {
    process.exit(0); // Exit successfully if no errors
  }
}

main();

