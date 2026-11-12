import { test, expect } from '@playwright/test';

/* =========================================================
   OUTILS
========================================================= */

async function expectPageLoaded(page, path) {
  await page.goto(path);
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
}

async function expectProtected(page, path) {
  await page.goto(path);

  await page.waitForURL(
    url => url.pathname !== path,
    { timeout: 10000 }
  );

  expect(new URL(page.url()).pathname).not.toBe(path);
}


/* =========================================================
   PAGES PUBLIQUES
========================================================= */

test('01 - page accueil accessible', async ({ page }) => {
  await expectPageLoaded(page, '/');
});

test('02 - page carte accessible', async ({ page }) => {
  await expectPageLoaded(page, '/menu');
  await expect(page).toHaveURL(/\/menu/);
});

test('03 - page réservation accessible', async ({ page }) => {
  await expectPageLoaded(page, '/reservation');
  await expect(page).toHaveURL(/\/reservation/);
});

test('04 - page contact accessible', async ({ page }) => {
  await expectPageLoaded(page, '/contact');
  await expect(page).toHaveURL(/\/contact/);
});

test('05 - page galerie accessible', async ({ page }) => {
  await expectPageLoaded(page, '/galerie');
  await expect(page).toHaveURL(/\/galerie/);
});

test('06 - page commande accessible', async ({ page }) => {
  await expectPageLoaded(page, '/commander');
  await expect(page).toHaveURL(/\/commander/);
});


/* =========================================================
   AUTHENTIFICATION
========================================================= */

test('07 - page connexion accessible', async ({ page }) => {
  await expectPageLoaded(page, '/connexion');
  await expect(page).toHaveURL(/\/connexion/);
});

test('08 - page inscription accessible', async ({ page }) => {
  await expectPageLoaded(page, '/inscription');
  await expect(page).toHaveURL(/\/inscription/);
});

test('09 - formulaire de connexion présent', async ({ page }) => {
  await page.goto('/connexion');

  expect(
    await page.locator('input').count()
  ).toBeGreaterThanOrEqual(2);
});

test('10 - champ mot de passe présent', async ({ page }) => {
  await page.goto('/connexion');

  await expect(
    page.locator('input[type="password"]').first()
  ).toBeVisible();
});


/* =========================================================
   ESPACE CLIENT
========================================================= */

test('11 - espace client protégé sans connexion', async ({ page }) => {
  await expectProtected(page, '/mon-compte');
});

test('12 - réservations client protégées sans connexion', async ({ page }) => {
  await expectProtected(page, '/mon-compte/reservations');
});

test('13 - commandes client protégées sans connexion', async ({ page }) => {
  await expectProtected(page, '/mon-compte/commandes');
});


/* =========================================================
   ESPACE AGENT / ADMIN
========================================================= */

test('14 - dashboard staff protégé sans connexion', async ({ page }) => {
  await expectProtected(page, '/admin/dashboard');
});

test('15 - réservations agent protégées sans connexion', async ({ page }) => {
  await expectProtected(page, '/admin/reservations');
});

test('16 - commandes agent protégées sans connexion', async ({ page }) => {
  await expectProtected(page, '/admin/commandes');
});

test('17 - gestion des agents protégée sans connexion', async ({ page }) => {
  await expectProtected(page, '/admin/agents');
});


/* =========================================================
   REDIRECTION
========================================================= */

test('18 - route inconnue redirigée vers accueil', async ({ page }) => {
  await page.goto('/page-inexistante-test');

  await expect(page).toHaveURL(/\/$/);
});


/* =========================================================
   RESPONSIVE
========================================================= */

test('19 - accueil fonctionne sur mobile', async ({ page }) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });

  await page.goto('/');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).not.toBeEmpty();
});

test('20 - réservation fonctionne sur mobile', async ({ page }) => {
  await page.setViewportSize({
    width: 390,
    height: 844
  });

  await page.goto('/reservation');

  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('body')).toContainText(
    /réservation|réserver/i
  );
});