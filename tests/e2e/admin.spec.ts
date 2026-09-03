import { expect, test } from '@playwright/test';
import { guardRuntime, loginAsAdmin } from './support';

test.describe('admin portal', () => {
    test.beforeEach(async ({ page }) => loginAsAdmin(page));

    test('rejects invalid credentials and supports the full authenticated session', async ({ page, context }) => {
        await page.getByRole('button', { name: 'Sign out' }).click();
        await expect(page).toHaveURL(/\/$/);
        await page.goto('/login');
        await page.getByLabel('Email address').fill('nobody@example.test');
        await page.getByLabel('Password').fill('DefinitelyWrong123!');
        await page.getByRole('button', { name: 'Log in' }).click();
        await expect(page.getByText(/credentials do not match/i)).toBeVisible();
        await context.clearCookies();
        await loginAsAdmin(page);
        await expect(page.getByText('ViaTech control center')).toBeVisible();
    });

    test('every admin module opens without UI crashes or server errors', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        const modules = [
            ['Requests', '/admin/inquiries'],
            ['Quotations', '/admin/quotations'],
            ['Invoices', '/admin/invoices'],
            ['Payments', '/admin/payments'],
            ['Products', '/admin/products'],
            ['Categories', '/admin/categories'],
            ['Content pages', '/admin/pages'],
            ['Business profile', '/admin/business'],
            ['Locations', '/admin/locations'],
            ['Contact channels', '/admin/contacts'],
            ['Social links', '/admin/social-links'],
            ['Bank accounts', '/admin/bank-accounts'],
            ['Administrators', '/admin/users'],
        ] as const;

        for (const [label, path] of modules) {
            const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
            expect(response?.status(), `${label} (${path})`).toBeLessThan(400);
            await expect(page.getByRole('heading', { level: 1, name: label })).toBeVisible();
        }
        assertNoRuntimeErrors();
    });

    test('every supported admin creation form renders and validates safely', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        const forms = [
            ['products', 'New Products'],
            ['categories', 'New Categories'],
            ['pages', 'New Content pages'],
            ['locations', 'New Locations'],
            ['contacts', 'New Contact channels'],
            ['social-links', 'New Social links'],
            ['bank-accounts', 'New Bank accounts'],
            ['inquiries', 'New Requests'],
            ['users', 'New Administrators'],
        ] as const;

        for (const [resource, heading] of forms) {
            const response = await page.goto(`/admin/${resource}/create`, { waitUntil: 'domcontentloaded' });
            expect(response?.status(), resource).toBeLessThan(400);
            await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
        }
        assertNoRuntimeErrors();
    });

    test('category CRUD and server-side validation work through the UI', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        const name = `E2E Category ${Date.now()}`;
        const updated = `${name} Updated`;
        await page.goto('/admin/categories');
        const staleRows = page.getByRole('row').filter({ hasText: 'E2E Category' });
        while (await staleRows.count()) {
            const before = await staleRows.count();
            page.once('dialog', (dialog) => dialog.accept());
            await staleRows.first().getByRole('button', { name: 'Delete' }).click();
            await expect(staleRows).toHaveCount(before - 1);
        }
        await page.goto('/admin/categories/create');
        await page.getByRole('button', { name: 'Save changes' }).click();
        await expect(page.getByText(/name field is required/i)).toBeVisible();

        await page.getByLabel('name').fill(name);
        await page.getByLabel('sort order').fill('99');
        await page.getByRole('button', { name: 'Save changes' }).click();
        await expect(page).toHaveURL(/\/admin\/categories$/);
        await page.goto('/admin/categories');
        const row = page.getByRole('row').filter({ hasText: name });
        await expect(row).toBeVisible();

        const editUrl = await row.getByRole('link', { name: 'Edit' }).getAttribute('href');
        expect(editUrl).toBeTruthy();
        await page.goto(editUrl!);
        await expect(page.getByRole('heading', { level: 1, name: 'Edit Categories' })).toBeVisible();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('name').fill(updated);
        await page.locator('form').evaluate((form: HTMLFormElement) => form.requestSubmit());
        await expect(page).toHaveURL(/\/admin\/categories$/);
        const updatedRow = page.getByRole('row').filter({ hasText: updated });
        await expect(updatedRow).toBeVisible();

        page.once('dialog', (dialog) => dialog.accept());
        await updatedRow.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByRole('row').filter({ hasText: updated })).toHaveCount(0);
        assertNoRuntimeErrors();
    });

    test('content page CRUD is available to the CMS workflow', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        const title = `E2E Page ${Date.now()}`;
        await page.goto('/admin/pages');
        const staleRows = page.getByRole('row').filter({ hasText: 'E2E Page' });
        while (await staleRows.count()) {
            const before = await staleRows.count();
            page.once('dialog', (dialog) => dialog.accept());
            await staleRows.first().getByRole('button', { name: 'Delete' }).click();
            await expect(staleRows).toHaveCount(before - 1);
        }

        await page.getByRole('link', { name: 'Create new' }).click();
        await expect(page.getByRole('heading', { level: 1, name: 'New Content pages' })).toBeVisible();
        await page.getByLabel('title', { exact: true }).fill(title);
        await page.getByLabel('eyebrow', { exact: true }).fill('Browser verified');
        await page.getByLabel('body', { exact: true }).fill('This page was created and verified through the complete browser workflow.');
        await page.getByLabel('is published', { exact: true }).check();
        await page.getByRole('button', { name: 'Save changes' }).click();
        await expect(page).toHaveURL(/\/admin\/pages$/);
        const row = page.getByRole('row').filter({ hasText: title });
        await expect(row).toContainText(/e2e-page-/);
        page.once('dialog', (dialog) => dialog.accept());
        await row.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByRole('row').filter({ hasText: title })).toHaveCount(0);
        assertNoRuntimeErrors();
    });

    test('profile and password settings render and remain reachable from admin', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        await page.goto('/settings/profile');
        await expect(page.getByRole('heading', { name: /Profile/i }).first()).toBeVisible();
        await page.goto('/settings/password');
        await expect(page.getByRole('heading', { name: /Password/i }).first()).toBeVisible();
        await page.goto('/settings/appearance');
        await expect(page.getByRole('heading', { name: /Appearance/i }).first()).toBeVisible();
        assertNoRuntimeErrors();
    });
});
