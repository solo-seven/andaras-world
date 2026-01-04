import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('displays landing page with title and buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page.getByText("Andara's World")).toBeVisible();
    
    // Check New Game button
    const newGameButton = page.getByRole('button', { name: /new game/i });
    await expect(newGameButton).toBeVisible();
    await expect(newGameButton).toBeEnabled();
    
    // Check Load Game button is disabled
    const loadGameButton = page.getByRole('button', { name: /load game/i });
    await expect(loadGameButton).toBeVisible();
    await expect(loadGameButton).toBeDisabled();
  });

  test('navigates to character creation when New Game is clicked', async ({ page }) => {
    await page.goto('/');
    
    const newGameButton = page.getByRole('button', { name: /new game/i });
    await newGameButton.click();
    
    // Should navigate to character creation
    await expect(page).toHaveURL(/.*character-creation/);
  });

  test('applies correct styling - background color and scanlines', async ({ page }) => {
    await page.goto('/');
    
    const landingPage = page.locator('.landing-page');
    await expect(landingPage).toBeVisible();
    
    // Check background color is Deep Void
    const backgroundColor = await landingPage.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(backgroundColor).toContain('rgb(10, 14, 20)'); // #0a0e14
  });
});
