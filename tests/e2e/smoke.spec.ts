import { test, expect } from "@playwright/test";

test("homepage renders placeholder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/concierge/i)).toBeVisible();
});
