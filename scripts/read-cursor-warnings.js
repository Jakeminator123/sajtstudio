// Script to read and display warnings from Cursor/TypeScript
// This helps you copy warnings to share with AI agent

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔍 Reading TypeScript/ESLint warnings...\n");

try {
  // Try to get TypeScript errors
  const tscOutput = execSync("npx tsc --noEmit --pretty false 2>&1", {
    encoding: "utf-8",
    cwd: process.cwd(),
    stdio: "pipe",
  });

  if (tscOutput && tscOutput.trim()) {
    console.log("📋 TypeScript Warnings/Errors:\n");
    console.log(tscOutput);
    console.log("\n" + "=".repeat(80) + "\n");
  } else {
    console.log("✅ No TypeScript errors found!\n");
  }
} catch (error) {
  // TSC returns non-zero exit code when there are errors, which is expected
  const output = error.stdout || error.message;
  if (output && output.includes("error TS")) {
    console.log("📋 TypeScript Warnings/Errors:\n");
    console.log(output);
  } else {
    console.log("✅ No TypeScript errors found!\n");
  }
}

console.log("💡 Tips:");
console.log("1. Kopiera varningarna från Cursor och ge till AI-agenten");
console.log("2. Eller kör: npm run fix:warnings för automatisk fix");
console.log(
  "3. För Microsoft Edge Tools varningar: Ignorera eller stäng av extensionen"
);
