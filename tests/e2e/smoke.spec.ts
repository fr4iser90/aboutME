import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = process.env.AUDIT_BASE || 'http://localhost:3000';

function adminPassword(): string {
  const env = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  const m = env.match(/^ADMIN_PASSWORD=(.*)$/m);
  if (!m) throw new Error('ADMIN_PASSWORD missing in .env');
  return m[1].trim();
}

test.describe('aboutME production smoke', () => {
  test('public homepage loads when published', async ({ page }) => {
    const statusPath = path.join(process.cwd(), 'public/data/config/site-status.json');
    const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    test.skip(!status.published, 'Site not published');

    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/login/);
    await expect(page.locator('body')).not.toContainText('Application error');
    await expect(page.locator('body')).not.toContainText('Loading portfolio', {
      timeout: 15000,
    });
    await expect(page.locator('html')).toHaveAttribute('data-design', /minimal|glassmorphism|clean/);
  });

  test('public site-status is readable', async ({ request }) => {
    const res = await request.get(BASE + '/api/site/status');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.published === true || body.validated === true).toBeTruthy();
  });

  test('login → validate → publish', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('#password', adminPassword());
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    const validate = await page.request.get(BASE + '/api/setup/validate-files');
    expect(validate.ok()).toBeTruthy();
    const v = await validate.json();
    expect(v.invalid).toBe(0);

    const publish = await page.request.post(BASE + '/api/setup/publish', {
      data: {},
    });
    expect(publish.ok()).toBeTruthy();
    const p = await publish.json();
    expect(p.success).toBeTruthy();
    expect(p.siteStatus?.published).toBeTruthy();
  });

  test('review queue loads for admin', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('#password', adminPassword());
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    await page.goto(BASE + '/admin/review');
    await expect(page.locator('body')).toContainText(/Review|draft/i);
    const drafts = await page.request.get(BASE + '/api/agent/drafts');
    expect(drafts.ok()).toBeTruthy();
  });

  test('layout save enables after selecting a different layout', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('#password', adminPassword());
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin/, { timeout: 20000 });

    await page.goto(BASE + '/admin/layout');
    await page.waitForSelector('[data-layout-id]', { timeout: 15000 });
    const save = page.getByRole('button', { name: /Save Changes/i }).first();
    await expect(save).toBeDisabled();

    const current = await page.locator('[data-layout-id].global-layout-editor__mode-card--selected').getAttribute('data-layout-id');
    const target = current === 'dashboard' ? 'magazine' : 'dashboard';
    await page.locator(`[data-layout-id="${target}"]`).click();
    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.locator('body')).toContainText(/saved successfully/i);
  });

  test('unauth publish is blocked', async ({ request }) => {
    const res = await request.post(BASE + '/api/setup/publish', {
      data: {},
      maxRedirects: 0,
    });
    expect([401, 307, 302]).toContain(res.status());
  });
});
