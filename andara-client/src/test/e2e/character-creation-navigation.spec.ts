import { test, expect } from '@playwright/test';

test.describe('Character Creation Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /new game/i }).click();
  });

  test('displays character creation wizard with stepper', async ({ page }) => {
    await expect(page.getByText('Origin')).toBeVisible();
    await expect(page.getByText('Attributes')).toBeVisible();
    await expect(page.getByText('Skills')).toBeVisible();
    await expect(page.getByText('Appearance')).toBeVisible();
    await expect(page.getByText('Name')).toBeVisible();
  });

  test('shows cancel button in wizard', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();
  });

  test('shows confirmation modal when cancel is clicked', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    await expect(
      page.getByText(/are you sure you want to cancel/i)
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel creation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('returns to landing page when cancel is confirmed', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    const confirmCancelButton = page.getByRole('button', { name: /cancel creation/i });
    await confirmCancelButton.click();

    await expect(page).toHaveURL('/');
  });

  test('closes modal when continue is clicked', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    const continueButton = page.getByRole('button', { name: /continue/i });
    await continueButton.click();

    await expect(
      page.getByText(/are you sure you want to cancel/i)
    ).not.toBeVisible();
    await expect(page.getByText(/choose your origin/i)).toBeVisible();
  });
});
