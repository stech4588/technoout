import { expect, test } from '@playwright/test';
import { assertHealthyPage, guardRuntime, loginAsAdmin } from './support';

const contentPages = [
    '/about-us',
    '/company-history',
    '/core-values',
    '/our-team',
    '/brand-partners',
    '/our-brands',
    '/certifications',
    '/careers',
    '/latest-news',
    '/solutions',
    '/loading-bay-solution',
    '/parking-management-guidance-solution',
    '/perimeter-security-solutions',
    '/personnel-access-control-solution',
    '/rfid-etag-vehicle-access-control-solution',
    '/road-safety-solutions',
    '/visitor-management-solution',
    '/our-projects',
    '/support',
    '/technical-support',
    '/warranty',
    '/product-demonstration',
];

test.describe('public portal', () => {
    test('all public pages render without runtime failures', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        await assertHealthyPage(page, '/', /Control every threshold/i);
        await assertHealthyPage(page, '/catalog', 'Product catalog');
        await assertHealthyPage(page, '/contact', /engineer the right solution/i);
        for (const path of contentPages) await assertHealthyPage(page, path);
        assertNoRuntimeErrors();
    });

    test('catalog search, category filtering, product details and quote handoff work', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        await page.goto('/catalog');
        await page.getByPlaceholder(/Search products/).fill('Automatic Doors');
        await Promise.all([
            page.waitForURL(/search=Automatic\+Doors|search=Automatic%20Doors/),
            page.getByRole('button', { name: 'Filter' }).click(),
        ]);
        const firstProduct = page.locator('article').first();
        await expect(firstProduct).toBeVisible();
        const productName = await firstProduct.getByRole('heading').innerText();
        await firstProduct.getByRole('link', { name: `View ${productName}` }).click();
        await expect(page.getByRole('heading', { level: 1, name: productName })).toBeVisible();
        await page.getByRole('link', { name: /Request quote/ }).first().click();
        await expect(page).toHaveURL(/\/contact\?product=\d+#request-quote/);
        await expect(page.getByText('1 selected')).toBeVisible();
        await expect(page.getByText(productName).last()).toBeVisible();
        assertNoRuntimeErrors();
    });

    test('contact form validates and submits a multi-product quote request', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        const marker = `Playwright ${Date.now()}`;
        await page.goto('/contact');
        await page.getByRole('button', { name: 'Submit request' }).click();
        await expect(page.getByPlaceholder('Full name *')).toBeFocused();

        await page.getByPlaceholder('Full name *').fill(marker);
        await page.getByPlaceholder('Company').fill('ViaTech E2E');
        await page.getByPlaceholder('Email *').fill(`e2e-${Date.now()}@example.test`);
        await page.getByPlaceholder('Phone').fill('+92 300 1234567');
        await page.getByPlaceholder('City').fill('Lahore');
        await page.getByPlaceholder('Subject').fill(marker);
        await page.getByPlaceholder(/Describe your site/).fill('Automated end-to-end browser test request.');

        const picker = page.getByRole('combobox', { name: 'Search and add products' });
        await picker.click();
        const productList = page.getByRole('listbox');
        const firstOption = productList.getByRole('option').first();
        await firstOption.click();
        const secondOption = productList.getByRole('option').first();
        const secondName = await secondOption.locator('span').first().innerText();
        await secondOption.click();
        await page.getByLabel(`Quantity for ${secondName}`).fill('2');
        await expect(page.getByText('2 selected')).toBeVisible();

        await page.getByRole('button', { name: 'Submit request' }).click();
        await expect(page.getByText('Your request has been received. Our team will contact you shortly.')).toBeVisible();

        await loginAsAdmin(page);
        await page.goto('/admin/inquiries');
        const testRows = page.getByRole('row').filter({ hasText: 'Playwright' });
        while (await testRows.count()) {
            const before = await testRows.count();
            page.once('dialog', (dialog) => dialog.accept());
            await testRows.first().getByRole('button', { name: 'Delete' }).click();
            await expect(testRows).toHaveCount(before - 1);
        }
        assertNoRuntimeErrors();
    });

    test('mobile navigation opens, navigates, and has no viewport overflow', async ({ page }) => {
        const assertNoRuntimeErrors = guardRuntime(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await assertHealthyPage(page, '/');
        await page.getByRole('button', { name: 'Toggle navigation' }).click();
        const mobileNav = page.locator('header nav').filter({ has: page.getByRole('link', { name: 'Company', exact: true }) });
        await expect(mobileNav.getByRole('link', { name: 'Company', exact: true })).toBeVisible();
        await mobileNav.getByRole('link', { name: 'Products', exact: true }).click();
        await expect(page).toHaveURL(/\/catalog$/);
        await expect(page.getByRole('heading', { level: 1, name: 'Product catalog' })).toBeVisible();
        assertNoRuntimeErrors();
    });
});
