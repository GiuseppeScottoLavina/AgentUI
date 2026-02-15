/**
 * @fileoverview TDD Tests for version synchronization (P0.2)
 * Ensures the version in AuElement.js matches package.json.
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dir, '../..');

describe('Version Synchronization', () => {

    test('AuElement.js version should match package.json version', () => {
        const packageJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
        const auElementSource = readFileSync(join(ROOT, 'src/core/AuElement.js'), 'utf-8');

        const versionMatch = auElementSource.match(/version:\s*'([^']+)'/);
        expect(versionMatch).not.toBeNull();

        const auElementVersion = versionMatch[1];
        const packageVersion = packageJson.version;

        expect(auElementVersion).toBe(packageVersion);
    });
});
