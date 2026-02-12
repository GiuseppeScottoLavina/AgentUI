/**
 * @fileoverview Shared Puppeteer helper for E2E tests
 * 
 * Uses puppeteer-core with globally installed Chrome:
 * - puppeteer-core: NO automatic Chrome download
 * - Chrome: Installed via `npx @puppeteer/browsers install chrome-headless-shell@stable --path ~/.cache/puppeteer`
 *   Location: ~/.cache/puppeteer/ (persistent) or /tmp/puppeteer/ (sandbox fallback)
 * 
 * IMPORTANT: On macOS, Chrome headless shell crashes with SEGV when spawned
 * via Node/bun child_process.spawn() (likely due to com.apple.provenance xattr
 * + process group handling). The workaround is to spawn Chrome via a shell
 * wrapper and connect via puppeteer.connect() instead of puppeteer.launch().
 */

import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Find chrome-headless-shell in various cache locations
 * Searches: /tmp/puppeteer, ~/.cache/puppeteer
 * @returns {string|null} Path to Chrome executable
 */
export function findGlobalChrome() {
    const cachePaths = [
        '/tmp/puppeteer',  // macOS sandbox-friendly location
        join(process.env.HOME, '.cache', 'puppeteer')  // Standard puppeteer cache
    ];

    for (const cachePath of cachePaths) {
        if (!existsSync(cachePath)) continue;

        const dirs = readdirSync(cachePath);

        // Look for chrome-headless-shell first (preferred), then chrome
        for (const browserType of ['chrome-headless-shell', 'chrome']) {
            for (const dir of dirs) {
                if (dir.startsWith(browserType)) {
                    const chromeDir = join(cachePath, dir);

                    try {
                        const versions = readdirSync(chromeDir).sort().reverse(); // Latest first

                        for (const version of versions) {
                            const armPath = join(chromeDir, version, `${browserType}-mac-arm64`, browserType);
                            const x64Path = join(chromeDir, version, `${browserType}-mac-x64`, browserType);

                            if (existsSync(armPath)) return armPath;
                            if (existsSync(x64Path)) return x64Path;
                        }
                    } catch (e) {
                        // Not a directory with versions, skip
                    }
                }
            }
        }
    }

    return null;
}

/**
 * Generate a unique userDataDir in /tmp to avoid macOS sandbox issues
 * @param {string} testName - Name of the test for identification
 * @returns {string} Path to userDataDir
 */
export function getTmpUserDataDir(testName = 'e2e') {
    const sanitized = testName.replace(/[^a-z0-9_-]/gi, '_');
    return `/tmp/puppeteer-${sanitized}-${Date.now()}`;
}

/**
 * Launch Chrome manually via shell and connect with puppeteer.connect().
 * 
 * This bypasses puppeteer.launch() which uses child_process.spawn() internally,
 * causing Chrome to SEGV on macOS (signal 11 SEGV_ACCERR at 0x10).
 * Spawning Chrome via bash shell wrapper avoids this crash.
 * 
 * @param {Object} options - Optional overrides
 * @param {string} options.testName - Test name for userDataDir
 * @param {boolean} options.headless - Default: true
 * @param {string[]} options.args - Additional browser args
 * @returns {Promise<{browser: Browser, chromeProcess: ChildProcess}>}
 */
export async function launchBrowser(options = {}) {
    const {
        testName = 'test',
        headless = true,
        args = []
    } = options;

    const executablePath = findGlobalChrome();

    if (!executablePath) {
        throw new Error(
            '[puppeteer-helper] Chrome not found.\n' +
            'Install from Terminal.app (NOT IDE terminal):\n' +
            '  npx -y @puppeteer/browsers install chrome-headless-shell@stable --path ~/.cache/puppeteer'
        );
    }

    const userDataDir = getTmpUserDataDir(testName);
    // Use a random port to avoid conflicts
    const port = 9200 + Math.floor(Math.random() * 700);

    const chromeArgs = [
        '--headless',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${userDataDir}`,
        ...args,
        'about:blank'
    ];

    // Spawn Chrome via shell to bypass SEGV with direct spawn on macOS
    const chromeProcess = spawn('/bin/bash', [
        '-c',
        `exec "${executablePath}" ${chromeArgs.map(a => `'${a}'`).join(' ')}`
    ], {
        stdio: ['ignore', 'ignore', 'ignore'],
        detached: true
    });
    chromeProcess.unref();

    // Poll the DevTools HTTP endpoint until Chrome is ready
    // (bun's child_process doesn't deliver Chrome's stderr through pipes)
    const wsUrl = await pollForDevTools(port, 10000);

    // Connect puppeteer to the running Chrome instance
    const browser = await puppeteer.connect({
        browserWSEndpoint: wsUrl,
        defaultViewport: null
    });

    // Store chromeProcess on browser for cleanup
    browser._chromeProcess = chromeProcess;
    browser._chromePort = port;

    // Override browser.close to also kill the Chrome process
    const originalClose = browser.close.bind(browser);
    browser.close = async () => {
        await originalClose().catch(() => { });
        try {
            process.kill(-chromeProcess.pid, 'SIGTERM');
        } catch (e) {
            try { chromeProcess.kill('SIGTERM'); } catch (_) { }
        }
    };

    return browser;
}

/**
 * Poll Chrome's DevTools HTTP endpoint until it responds
 * @param {number} port - Chrome debugging port
 * @param {number} timeoutMs - Max wait time
 * @returns {Promise<string>} WebSocket debugger URL
 */
async function pollForDevTools(port, timeoutMs = 10000) {
    const start = Date.now();
    const url = `http://127.0.0.1:${port}/json/version`;

    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                if (json.webSocketDebuggerUrl) {
                    return json.webSocketDebuggerUrl;
                }
            }
        } catch (_) {
            // Chrome not ready yet
        }
        await new Promise(r => setTimeout(r, 200));
    }

    throw new Error(`Chrome DevTools did not respond on port ${port} within ${timeoutMs}ms`);
}

/**
 * Launch browser with remote debugging port (for Lighthouse)
 * @param {number} port - Debugging port (default: 9222)
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
export async function launchBrowserForLighthouse(port = 9222) {
    return launchBrowser({
        testName: `lighthouse-${port}`,
        args: [`--remote-debugging-port=${port}`]
    });
}

export default {
    findGlobalChrome,
    getTmpUserDataDir,
    launchBrowser,
    launchBrowserForLighthouse
};

// Re-export puppeteer-core for tests that need direct access
export { default as puppeteer } from 'puppeteer-core';
