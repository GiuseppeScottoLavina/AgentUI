#!/usr/bin/env bun
/**
 * @fileoverview Isolated Test Runner
 * 
 * Runs each test file in a separate Bun process to ensure complete isolation
 * of globalThis, module cache, and custom element registries.
 * 
 * This solves the linkedom globalThis pollution issue where tests pass
 * individually but fail when run together.
 * 
 * Usage: bun run scripts/test-isolated.js [pattern]
 */

import { spawn } from 'bun';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const args = process.argv.slice(2);
const filterPattern = args[0] || '';

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m'
};

// Find all test files
function findTestFiles(dir, files = []) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
            findTestFiles(fullPath, files);
        } else if (entry.endsWith('.test.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Run a single test file in isolation
async function runTestFile(testFile) {
    const relativePath = relative(process.cwd(), testFile);

    const proc = spawn({
        cmd: ['bun', 'test', testFile],
        cwd: process.cwd(),
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
            ...process.env,
            FORCE_COLOR: '1'
        }
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    // Combine output (bun test writes summary to stderr)
    const output = stdout + stderr;

    // Parse results from output
    const passMatch = output.match(/\s*(\d+)\s+pass/);
    const failMatch = output.match(/\s*(\d+)\s+fail/);
    const skipMatch = output.match(/\s*(\d+)\s+skip/);

    const pass = passMatch ? parseInt(passMatch[1]) : 0;
    const fail = failMatch ? parseInt(failMatch[1]) : 0;
    const skip = skipMatch ? parseInt(skipMatch[1]) : 0;

    return {
        file: relativePath,
        pass,
        fail,
        skip,
        exitCode,
        stdout,
        stderr
    };
}

// Main execution
async function main() {
    const testsDir = join(process.cwd(), 'tests');
    let testFiles = findTestFiles(testsDir);

    // Filter by pattern if provided
    if (filterPattern) {
        testFiles = testFiles.filter(f => f.includes(filterPattern));
    }

    // Filter out e2e tests (they have their own runner)
    testFiles = testFiles.filter(f => !f.includes('/e2e/'));

    console.log(`${colors.cyan}🧪 Isolated Test Runner${colors.reset}`);
    console.log(`${colors.dim}Running ${testFiles.length} test files in separate processes...${colors.reset}\n`);

    const startTime = Date.now();
    const results = [];

    for (const testFile of testFiles) {
        const result = await runTestFile(testFile);
        results.push(result);

        // Print inline status
        const status = result.fail === 0
            ? `${colors.green}✓${colors.reset}`
            : `${colors.red}✗${colors.reset}`;
        const counts = `${colors.green}${result.pass}${colors.reset}/${colors.red}${result.fail}${colors.reset}/${colors.yellow}${result.skip}${colors.reset}`;
        console.log(`${status} ${result.file} [${counts}]`);

        // Show errors for failed files
        if (result.fail > 0 && process.env.VERBOSE) {
            console.log(result.stdout);
        }
    }

    const duration = Date.now() - startTime;

    // Summary
    const totalPass = results.reduce((sum, r) => sum + r.pass, 0);
    const totalFail = results.reduce((sum, r) => sum + r.fail, 0);
    const totalSkip = results.reduce((sum, r) => sum + r.skip, 0);
    const failedFiles = results.filter(r => r.fail > 0);

    console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.green}${totalPass} pass${colors.reset} | ${colors.red}${totalFail} fail${colors.reset} | ${colors.yellow}${totalSkip} skip${colors.reset}`);
    console.log(`${colors.dim}Ran ${results.length} test files in ${(duration / 1000).toFixed(2)}s${colors.reset}`);

    if (failedFiles.length > 0) {
        console.log(`\n${colors.red}Failed files:${colors.reset}`);
        for (const f of failedFiles) {
            console.log(`  ${colors.red}✗${colors.reset} ${f.file} (${f.fail} failures)`);
        }
        process.exit(1);
    }

    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
    process.exit(0);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
