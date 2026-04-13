/**
 * Web-Safe Mock for Administrative Provisioning
 * 
 * This file replaces provision.ts when the database package is bundled for the browser.
 * It prevents Node.js-only modules like 'child_process' and 'fs' from being resolved.
 */

export async function provisionTenant() {
    throw new Error('[Amisi Internal] Administrative provisioning must be executed in a server environment.');
}

export async function createTenantDatabase() {
    throw new Error('[Amisi Internal] Database orchestration must be executed in a server environment.');
}

export async function syncTenantSettings() {
    throw new Error('[Amisi Internal] Setting synchronization must be executed in a server environment.');
}
