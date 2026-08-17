#!/usr/bin/env node

/**
 * ⚒️ DailyForge — Master Automated Test Orchestrator
 *
 * Runs the complete multi-layer testing pyramid:
 * 1. Static Analysis & Type Checking
 * 2. Pure Unit & Business Logic Tests
 * 3. Domain Service & API Integration Tests
 * 4. Authentication & Cryptographic OTP Tests
 * 5. Security, IDOR & Multi-Tenant Authorization Tests
 * 6. Grounded AI Multi-Agent & Orchestrator Tests
 * 7. Multi-Domain End-to-End Workflow Verification
 * 8. Production Bundle & Packaging Validation
 */

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  orange: '\x1b[38;5;208m',
};

const phases = [
  {
    id: 1,
    name: 'Static Analysis & TypeScript Type Checking',
    cmd: 'npx tsc --noEmit',
    cwd: frontendDir,
  },
  {
    id: 2,
    name: 'Unit & Pure Business Logic Tests',
    cmd: 'npx jest tests/streak.test.js tests/behaviorMetrics.test.js tests/performance.test.js --runInBand --forceExit',
    cwd: backendDir,
  },
  {
    id: 3,
    name: 'Domain Service & API Integration Tests',
    cmd: 'npx jest tests/habits.test.js tests/goals.test.js tests/planner.test.js tests/dailyReview.test.js tests/onboarding.test.js --runInBand --forceExit',
    cwd: backendDir,
  },
  {
    id: 4,
    name: 'Authentication & Cryptographic OTP Tests',
    cmd: 'npx jest tests/auth.test.js tests/otpAuth.test.js --runInBand --forceExit',
    cwd: backendDir,
  },
  {
    id: 5,
    name: 'Security, IDOR & Multi-Tenant Isolation Tests',
    cmd: 'npx jest tests/security.test.js tests/userIsolation.test.js --runInBand --forceExit',
    cwd: backendDir,
  },
  {
    id: 6,
    name: 'Grounded AI Multi-Agent Orchestrator Tests',
    cmd: 'npx jest tests/aiOrchestrator.test.js --runInBand --forceExit',
    cwd: backendDir,
  },
  {
    id: 7,
    name: 'Comprehensive 12-Domain End-to-End Verification',
    cmd: 'node scripts/run_e2e_verification.js',
    cwd: backendDir,
  },
  {
    id: 8,
    name: 'Production Bundle & Packaging Validation',
    cmd: 'npm run build',
    cwd: frontendDir,
  },
];

async function runTestSuite() {
  const startTime = Date.now();
  console.log(`\n${colors.orange}${colors.bright}====================================================${colors.reset}`);
  console.log(`${colors.orange}${colors.bright} ⚒️  DAILYFORGE AUTOMATED TEST PYRAMID ORCHESTRATOR  ${colors.reset}`);
  console.log(`${colors.orange}${colors.bright}====================================================${colors.reset}\n`);

  let passedCount = 0;
  const results = [];

  for (const phase of phases) {
    const phaseStart = Date.now();
    process.stdout.write(
      `[${phase.id}/${phases.length}] ${phase.name.padEnd(50, '.')} `
    );

    try {
      execSync(phase.cmd, {
        cwd: phase.cwd,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'test', CI: 'true' },
      });
      const durationMs = Date.now() - phaseStart;
      passedCount++;
      results.push({ ...phase, status: 'PASS', durationMs });
      console.log(`${colors.green}${colors.bright}PASS${colors.reset} ${colors.dim}(${durationMs}ms)${colors.reset}`);
    } catch (error) {
      const durationMs = Date.now() - phaseStart;
      results.push({ ...phase, status: 'FAIL', durationMs, error: error.message });
      console.log(`${colors.red}${colors.bright}FAIL${colors.reset} ${colors.dim}(${durationMs}ms)${colors.reset}`);
      if (error.stdout) console.log(error.stdout.toString());
      if (error.stderr) console.error(error.stderr.toString());
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  const allPassed = passedCount === phases.length;

  console.log(`\n${colors.bright}====================================================${colors.reset}`);
  if (allPassed) {
    console.log(`${colors.green}${colors.bright}🎉 OVERALL RESULT: ALL ${phases.length} PHASES PASSED! (100% SUCCESS)${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bright}❌ OVERALL RESULT: FAILED (${passedCount}/${phases.length} passed)${colors.reset}`);
  }
  console.log(`${colors.bright}Total Duration: ${totalDuration}s${colors.reset}`);
  console.log(`${colors.bright}====================================================${colors.reset}\n`);

  if (!allPassed) {
    process.exit(1);
  }
}

runTestSuite();
