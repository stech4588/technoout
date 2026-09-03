import { expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

export function envValue(name: string): string {
    const configured = process.env[name]?.trim();
    if (configured) return configured;
    const match = readFileSync('.env', 'utf8').match(new RegExp(`^${name}=(.*)$`, 'm'));
    const value = match?.[1]?.trim().replace(/^(["'])(.*)\1$/, '$2');
    if (!value) throw new Error(`${name} must be configured in .env for the admin browser tests.`);
    return value;
}

export function guardRuntime(page: Page) {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
        const source = message.location().url;
        const isLocal = !source || source.startsWith('http://technoout.test') || source.startsWith('http://127.0.0.1');
        const blockedExternalResource = message.text().includes('ERR_NETWORK_ACCESS_DENIED');
        if (message.type() === 'error' && isLocal && !blockedExternalResource) {
            errors.push(`console: ${message.text()}${source ? ` (${source})` : ''}`);
        }
    });
    page.on('response', (response) => {
        const hostname = new URL(response.url()).hostname;
        if (['technoout.test', '127.0.0.1', 'localhost'].includes(hostname) && response.status() >= 500) {
            errors.push(`http ${response.status()}: ${response.url()}`);
        }
    });
    return () => expect(errors, errors.join('\n')).toEqual([]);
}

export async function assertHealthyPage(page: Page, path: string, heading?: RegExp | string) {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.status(), `${path} returned ${response?.status()}`).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
    if (heading) await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.locator('body')).not.toContainText(/Application error|Server Error|Undefined variable|Uncaught Error/i);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} has ${overflow}px horizontal overflow`).toBeLessThanOrEqual(1);
}

export async function loginAsAdmin(page: Page) {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(envValue('ADMIN_EMAIL'));
    await page.getByLabel('Password').fill(envValue('ADMIN_PASSWORD'));
    await Promise.all([
        page.waitForURL(/\/admin(?:\/)?$/),
        page.getByRole('button', { name: 'Log in' }).click(),
    ]);
}
