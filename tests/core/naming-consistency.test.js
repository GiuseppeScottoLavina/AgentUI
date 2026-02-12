/**
 * @fileoverview Naming Consistency Tests
 * Ensures all public-facing APIs use "AgentUI" / "au" naming,
 * not legacy "MicroUI" / "mu" naming.
 * 
 * TDD: These tests are written FIRST, expected to FAIL,
 * then source is updated to make them pass.
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(import.meta.dir, '../../src');

describe('Naming Consistency (MicroUI → AgentUI)', () => {

    describe('Source code — no MICROUI globals in window namespace', () => {
        const filesToCheck = [
            'core/AuElement.js',
            'core/bus.js',
            'index.js'
        ];

        for (const file of filesToCheck) {
            test(`${file} should not reference window.__MICROUI_*`, () => {
                const content = readFileSync(join(SRC_DIR, file), 'utf-8');
                const matches = content.match(/window\.__MICROUI_/g) || [];
                expect(matches).toHaveLength(0);
            });

            test(`${file} should not reference window.MICROUI_DEBUG`, () => {
                const content = readFileSync(join(SRC_DIR, file), 'utf-8');
                expect(content).not.toContain('window.MICROUI_DEBUG');
            });
        }
    });

    describe('Source code — no MICROUI_* constants', () => {
        test('bus.js should not export MICROUI_VERSION', () => {
            const content = readFileSync(join(SRC_DIR, 'core/bus.js'), 'utf-8');
            expect(content).not.toContain('export const MICROUI_VERSION');
        });

        test('bus.js should not have MICROUI_CAPABILITIES', () => {
            const content = readFileSync(join(SRC_DIR, 'core/bus.js'), 'utf-8');
            expect(content).not.toContain('MICROUI_CAPABILITIES');
        });

        test('bus.js should not have MICROUI_META', () => {
            const content = readFileSync(join(SRC_DIR, 'core/bus.js'), 'utf-8');
            expect(content).not.toContain('MICROUI_META');
        });

        test('bus.js should export AGENTUI_VERSION', () => {
            const content = readFileSync(join(SRC_DIR, 'core/bus.js'), 'utf-8');
            expect(content).toContain('export const AGENTUI_VERSION');
        });
    });

    describe('Source code — muConfirm → auConfirm', () => {
        test('au-confirm.js should export auConfirm, not muConfirm', () => {
            const content = readFileSync(join(SRC_DIR, 'components/au-confirm.js'), 'utf-8');
            expect(content).not.toContain('export async function muConfirm');
            expect(content).toContain('export async function auConfirm');
        });

        test('index.js should export auConfirm, not muConfirm', () => {
            const content = readFileSync(join(SRC_DIR, 'index.js'), 'utf-8');
            expect(content).not.toContain('muConfirm');
            expect(content).toContain('auConfirm');
        });

        test('describe-catalog.js should reference auConfirm, not muConfirm', () => {
            const content = readFileSync(join(SRC_DIR, 'core/describe-catalog.js'), 'utf-8');
            expect(content).not.toContain('muConfirm');
        });
    });

    describe('Global scan — no mu- prefix in public API names', () => {
        test('no source file should have "muConfirm" (case-sensitive)', () => {
            const components = readdirSync(join(SRC_DIR, 'components'))
                .filter(f => f.endsWith('.js'));

            for (const file of components) {
                const content = readFileSync(join(SRC_DIR, 'components', file), 'utf-8');
                const matches = (content.match(/muConfirm/g) || []);
                expect(matches).toHaveLength(0);
            }
        });
    });
});
