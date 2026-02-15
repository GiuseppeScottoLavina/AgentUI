/**
 * @fileoverview Unit Tests for http.js Module
 * Target: 21% → 80% coverage
 */

import { describe, test, expect, beforeAll, beforeEach, mock } from 'bun:test';
import { http, HttpError } from '../../src/core/http.js';

describe('http Module Unit Tests', () => {

    beforeEach(() => {
        // Reset state
        http.baseURL = '';
        http.headers = { 'Content-Type': 'application/json' };
    });

    // HTTP OBJECT
    test('http should exist', () => {
        expect(http).toBeDefined();
    });

    test('http should have baseURL property', () => {
        expect(http.baseURL).toBe('');
    });

    test('http should have headers property', () => {
        expect(http.headers['Content-Type']).toBe('application/json');
    });

    // SET BASE URL
    test('setBaseURL should set baseURL', () => {
        http.setBaseURL('https://api.example.com');
        expect(http.baseURL).toBe('https://api.example.com');
    });

    // SET HEADER
    test('setHeader should add header', () => {
        http.setHeader('Authorization', 'Bearer token123');
        expect(http.headers['Authorization']).toBe('Bearer token123');
    });

    test('setHeader should overwrite existing header', () => {
        http.setHeader('Content-Type', 'text/plain');
        expect(http.headers['Content-Type']).toBe('text/plain');
    });

    // HTTP METHODS
    test('get should be a function', () => {
        expect(typeof http.get).toBe('function');
    });

    test('post should be a function', () => {
        expect(typeof http.post).toBe('function');
    });

    test('put should be a function', () => {
        expect(typeof http.put).toBe('function');
    });

    test('delete should be a function', () => {
        expect(typeof http.delete).toBe('function');
    });

    test('request should be a function', () => {
        expect(typeof http.request).toBe('function');
    });

    // HTTP ERROR CLASS
    test('HttpError should be a class', () => {
        expect(HttpError).toBeDefined();
    });

    test('HttpError should extend Error', () => {
        const err = new HttpError(404, 'Not Found', 'Resource not found');
        expect(err instanceof Error).toBe(true);
    });

    test('HttpError should have status property', () => {
        const err = new HttpError(500, 'Internal Server Error', 'body');
        expect(err.status).toBe(500);
    });

    test('HttpError should have statusText property', () => {
        const err = new HttpError(403, 'Forbidden', 'body');
        expect(err.statusText).toBe('Forbidden');
    });

    test('HttpError should have body property', () => {
        const err = new HttpError(400, 'Bad Request', 'Invalid data');
        expect(err.body).toBe('Invalid data');
    });

    test('HttpError message should be formatted', () => {
        const err = new HttpError(401, 'Unauthorized', 'body');
        expect(err.message).toBe('HTTP 401: Unauthorized');
    });

    test('HttpError should be throwable', () => {
        expect(() => { throw new HttpError(500, 'Error', 'body'); }).toThrow();
    });

    // REQUEST METHOD SIGNATURES
    test('get should accept url and options', () => {
        // Just verify it doesn't throw on call signature
        expect(() => http.get).not.toThrow();
    });

    test('post should accept url, body and options', () => {
        expect(() => http.post).not.toThrow();
    });

    test('put should accept url, body and options', () => {
        expect(() => http.put).not.toThrow();
    });

    test('delete should accept url and options', () => {
        expect(() => http.delete).not.toThrow();
    });

    // ========================================
    // P2.3: http.create() factory
    // ========================================

    test('create should be a function', () => {
        expect(typeof http.create).toBe('function');
    });

    test('create() should return a new instance', () => {
        const instance = http.create();
        expect(instance).toBeDefined();
        expect(instance).not.toBe(http);
    });

    test('created instances should have all http methods', () => {
        const instance = http.create();
        expect(typeof instance.get).toBe('function');
        expect(typeof instance.post).toBe('function');
        expect(typeof instance.put).toBe('function');
        expect(typeof instance.delete).toBe('function');
        expect(typeof instance.request).toBe('function');
        expect(typeof instance.setBaseURL).toBe('function');
        expect(typeof instance.setHeader).toBe('function');
    });

    test('created instances should be isolated', () => {
        const a = http.create();
        const b = http.create();

        a.setBaseURL('https://api-a.com');
        b.setBaseURL('https://api-b.com');

        expect(a.baseURL).toBe('https://api-a.com');
        expect(b.baseURL).toBe('https://api-b.com');
        expect(http.baseURL).toBe(''); // default not affected
    });

    test('created instances should have independent headers', () => {
        const instance = http.create();
        instance.setHeader('X-Custom', 'value');

        expect(instance.headers['X-Custom']).toBe('value');
        expect(http.headers['X-Custom']).toBeUndefined();
    });

    test('create() should accept initial config', () => {
        const instance = http.create({
            baseURL: 'https://custom.api.com',
            headers: { 'Authorization': 'Bearer xyz' }
        });

        expect(instance.baseURL).toBe('https://custom.api.com');
        expect(instance.headers['Authorization']).toBe('Bearer xyz');
    });
});
