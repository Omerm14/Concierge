import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function dragChipTo(page: import("@playwright/test").Page, chipTestId: string, targetTestId: string) {
  const chip = page.getByTestId(chipTestId);
  const target = page.getByTestId(targetTestId);

  // Both ends of the drag must be within the viewport, or elementFromPoint
  // at drop time returns null (this is a real mobile viewport, not desktop).
  await chip.scrollIntoViewIfNeeded();
  const chipBox = await chip.boundingBox();
  await target.scrollIntoViewIfNeeded();
  const targetBox = await target.boundingBox();
  if (!chipBox || !targetBox) throw new Error("missing bounding box");

  await page.mouse.move(chipBox.x + chipBox.width / 2, chipBox.y + chipBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 10,
  });
  await page.mouse.up();
}

test("dragging a guest chip from the tray onto a table seats them", async ({ page }) => {
  await page.goto("/seating");

  await dragChipTo(page, "chip-guest-001", "table-table-01");

  await expect(page.getByTestId("table-table-01").getByTestId("chip-guest-001")).toBeVisible();
  await expect(page.getByTestId("unassigned-tray").getByTestId("chip-guest-001")).toHaveCount(0);
});

test("dragging a seated guest to another table moves them", async ({ page }) => {
  await page.goto("/seating");

  await dragChipTo(page, "chip-guest-001", "table-table-01");
  await expect(page.getByTestId("table-table-01").getByTestId("chip-guest-001")).toBeVisible();

  await dragChipTo(page, "chip-guest-001", "table-table-02");

  await expect(page.getByTestId("table-table-02").getByTestId("chip-guest-001")).toBeVisible();
  await expect(page.getByTestId("table-table-01").getByTestId("chip-guest-001")).toHaveCount(0);
});

test("dropping onto a full table is rejected with a visible message", async ({ page }) => {
  await page.goto("/seating");

  // table-01 has capacity 8; seat 8 guests there, then try a 9th.
  const guestIds = Array.from({ length: 9 }, (_, i) => `guest-${String(i + 1).padStart(3, "0")}`);
  for (const guestId of guestIds.slice(0, 8)) {
    await dragChipTo(page, `chip-${guestId}`, "table-table-01");
  }
  await expect(page.getByTestId("table-table-01-count")).toHaveText("8/8");

  await dragChipTo(page, `chip-${guestIds[8]}`, "table-table-01");

  await expect(page.getByTestId("rejection-message")).toBeVisible();
  await expect(page.getByTestId("table-table-01").getByTestId(`chip-${guestIds[8]}`)).toHaveCount(0);
});

test("a guest with a dietary restriction shows a badge on their chip", async ({ page }) => {
  await page.goto("/seating");

  await expect(page.getByTestId("dietary-badge-guest-001-vegetarian")).toBeVisible();
});

test("Auto-seat proposes an arrangement, the couple can still drag, and Undo restores the prior state", async ({
  page,
}) => {
  await page.goto("/seating");

  const initialUnassignedText = await page.getByTestId("unassigned-count").textContent();
  await expect(page.getByTestId("chip-guest-001")).toBeVisible();

  await page.getByTestId("auto-seat-button").click();

  await expect(page.getByTestId("auto-seat-review")).toBeVisible();
  await expect(page.getByTestId("auto-seat-score")).toBeVisible();
  const afterAutoSeatText = await page.getByTestId("unassigned-count").textContent();
  expect(afterAutoSeatText).not.toBe(initialUnassignedText);

  // Still draggable after Auto-seat: move guest-001 into the tray.
  await dragChipTo(page, "chip-guest-001", "unassigned-tray");
  await expect(page.getByTestId("unassigned-tray").getByTestId("chip-guest-001")).toBeVisible();

  await page.getByTestId("auto-seat-undo").click();

  await expect(page.getByTestId("auto-seat-review")).toHaveCount(0);
  await expect(page.getByTestId("unassigned-count")).toHaveText(initialUnassignedText ?? "");
});
