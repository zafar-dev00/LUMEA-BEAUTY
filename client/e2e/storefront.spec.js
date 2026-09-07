import { expect, test } from '@playwright/test';

test('storefront renders the brand and primary navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/LUMÉA BEAUTY/i);
  await expect(page.getByRole('link', { name: 'LUMÉA' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Search products' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bag' })).toBeVisible();
});

test('shop and cart navigation work from the storefront', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Search products' }).click();
  await expect(page).toHaveURL(/\/shop$/);

  await page.getByRole('link', { name: 'Bag' }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByText('Your Shopping Bag is Empty')).toBeVisible();
});
