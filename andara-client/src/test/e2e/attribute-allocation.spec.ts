import { test, expect } from '@playwright/test';

test.describe('Attribute Allocation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /new game/i }).click();
    // Select an origin first
    await page.getByText('Vault Dweller').click();
    await page.getByRole('button', { name: /continue/i }).click();
  });

  test('displays attribute allocation step with all six attributes', async ({ page }) => {
    await expect(page.getByText(/distribute attributes/i)).toBeVisible();
    await expect(page.getByText(/strength/i)).toBeVisible();
    await expect(page.getByText(/agility/i)).toBeVisible();
    await expect(page.getByText(/endurance/i)).toBeVisible();
    await expect(page.getByText(/intellect/i)).toBeVisible();
    await expect(page.getByText(/perception/i)).toBeVisible();
    await expect(page.getByText(/charisma/i)).toBeVisible();
  });

  test('shows remaining points', async ({ page }) => {
    await expect(page.getByText(/27/i)).toBeVisible();
  });

  test('has reset button', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();
  });

  test('disables Next button when points remain', async ({ page }) => {
    const nextButton = page.getByRole('button', { name: /continue/i });
    await expect(nextButton).toBeDisabled();
  });
});
