import { test, expect } from "@playwright/test";

test("homepage opens without error", async ({ page }) => {
  const response = await page.goto("/");

  expect(response, "home should respond").not.toBeNull();
  expect(response?.ok(), `unexpected status ${response?.status()}`).toBeTruthy();
  await expect(page).toHaveTitle(/ORU/);
  await expect(page.getByAltText("ORU 로고")).toBeVisible();
});
