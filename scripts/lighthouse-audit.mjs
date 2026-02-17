import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Find Chrome
function findChrome() {
    const cachePath = join(process.env.HOME, '.cache', 'puppeteer');
    if (!existsSync(cachePath)) throw new Error('Chrome not found');
    const dirs = readdirSync(cachePath);
    for (const dir of dirs) {
        if (dir.startsWith('chrome-headless-shell')) {
            const versions = readdirSync(join(cachePath, dir)).sort().reverse();
            for (const v of versions) {
                const path = join(cachePath, dir, v, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
                if (existsSync(path)) return path;
            }
        }
    }
    throw new Error('Chrome not found');
}

const page = process.argv[2] || '#dividers';
const chromePath = findChrome();
const port = 9334;

// Spawn Chrome via bash (bypass SEGV)
const chromeProcess = spawn('/bin/bash', [
    '-c',
    `exec "${chromePath}" --headless --no-sandbox --disable-gpu --remote-debugging-port=${port} --user-data-dir=/tmp/puppeteer-lh-${Date.now()} about:blank`
], { stdio: ['ignore', 'ignore', 'ignore'], detached: true });
chromeProcess.unref();

// Poll for WebSocket URL
let wsUrl;
for (let i = 0; i < 30; i++) {
    try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        const json = await res.json();
        wsUrl = json.webSocketDebuggerUrl;
        break;
    } catch (_) {
        await new Promise(r => setTimeout(r, 200));
    }
}
if (!wsUrl) { console.error('Chrome failed to start'); process.exit(1); }

// Import lighthouse
const globalNodeModules = execSync('npm root -g', { encoding: 'utf-8' }).trim();
const lighthouse = (await import(`${globalNodeModules}/lighthouse/core/index.js`)).default;

// Run audit
const url = `http://localhost:5001/demo/${page}`;
console.error(`Auditing: ${url}`);

const result = await lighthouse(url, {
    port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    output: 'json',
    formFactor: 'desktop',
    screenEmulation: { disabled: true },
    throttling: { cpuSlowdownMultiplier: 1 }
});

const cats = result.lhr.categories;
const audits = result.lhr.audits;

// Collect a11y failures
const a11yFailures = Object.values(audits)
    .filter(a => a.score === 0 && cats.accessibility.auditRefs.some(r => r.id === a.id))
    .map(a => ({
        id: a.id,
        title: a.title,
        items: a.details?.items?.length || 0,
        elements: a.details?.items?.slice(0, 3).map(i => i.node?.snippet || i.node?.selector || '').filter(Boolean) || []
    }));

// Collect SEO failures
const seoFailures = Object.values(audits)
    .filter(a => a.score === 0 && cats.seo.auditRefs.some(r => r.id === a.id))
    .map(a => ({ id: a.id, title: a.title }));

console.log(JSON.stringify({
    page,
    performance: Math.round(cats.performance.score * 100),
    accessibility: Math.round(cats.accessibility.score * 100),
    bestPractices: Math.round(cats['best-practices'].score * 100),
    seo: Math.round(cats.seo.score * 100),
    cls: parseFloat(audits['cumulative-layout-shift']?.numericValue?.toFixed(4) || 0),
    clsScore: Math.round((audits['cumulative-layout-shift']?.score || 0) * 100),
    a11yFailures,
    seoFailures
}, null, 2));

// Cleanup
try { process.kill(-chromeProcess.pid); } catch (_) { }
process.exit(0);
