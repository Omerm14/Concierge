import { test, expect } from "@playwright/test";

test("pricing page renders the anchor line and the flat-pricing claims", async ({ page }) => {
  await page.goto("/pricing");
  await expect(
    page.getByText(/No per-guest games\. No "VIP" tricks\. One honest price, unlimited everything\./i),
  ).toBeVisible();
  await expect(page.getByText(/unlimited guests/i).first()).toBeVisible();
  await expect(page.getByText(/unlimited messages/i).first()).toBeVisible();
  await expect(page.getByText(/no per-record/i).first()).toBeVisible();
});
