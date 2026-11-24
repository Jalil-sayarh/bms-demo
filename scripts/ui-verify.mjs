import { chromium } from "playwright";

const base = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Luxury chalet rentals/i }).waitFor();
  console.log("OK: homepage loaded");

  await page.locator('select').first().selectOption("saint-tropez");
  await page.locator('input[type="date"]').nth(0).fill("2026-06-06");
  await page.locator('input[type="date"]').nth(1).fill("2026-06-13");
  await page.locator('input[type="number"]').first().fill("4");
  await page.getByRole("button", { name: "Search" }).click();
  await page.waitForURL(/\/stays/);
  await page.getByText(/stay/i).first().waitFor();
  console.log("OK: search results page");

  await page.getByRole("link", { name: /Villa Lina/i }).first().click();
  await page.waitForURL(/villa-lina/);
  await page.getByRole("heading", { name: "Villa Lina" }).waitFor();
  console.log("OK: property page");

  // Invalid short stay: pick 3 nights via date inputs hidden fields are driven by calendar.
  // Fill guest form and try with incomplete range first.
  const requestBtn = page.getByRole("button", { name: /Request to book/i });
  await requestBtn.waitFor();

  // Use calendar: click two days 7 nights apart is hard in headless rdp.
  // Drive by setting range through page.evaluate on DayPicker is brittle.
  // Instead navigate with query params then submit.
  await page.goto(
    `${base}/stays/villa-lina?checkIn=2026-06-06&checkOut=2026-06-09&guests=4`,
    { waitUntil: "networkidle" },
  );
  await page.getByText(/at least 7 nights/i).waitFor();
  console.log("OK: minimum stay validation shown");

  await page.goto(
    `${base}/stays/villa-lina?checkIn=2026-06-06&checkOut=2026-06-13&guests=4`,
    { waitUntil: "networkidle" },
  );
  await page.locator('input[name="guestName"]').fill("Prospect Guest");
  await page.locator('input[name="guestEmail"]').fill("guest@example.com");
  await page.locator('input[name="guestPhone"]').fill("+33 600000000");
  await page.locator('textarea[name="message"]').fill("Demo booking request");
  await page.getByRole("button", { name: /Request to book/i }).click();
  await page.getByText(/Request received/i).waitFor({ timeout: 10000 });
  console.log("OK: booking request submitted");

  await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill("admin@demo.local");
  await page.locator('input[name="password"]').fill("admin123");
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForURL(/\/admin$/);
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
  console.log("OK: admin login");

  await page.getByText("Prospect Guest").first().waitFor();
  await page.getByRole("button", { name: "Confirm" }).first().click();
  await page.waitForTimeout(1000);
  console.log("OK: booking confirmed from dashboard");

  await page.goto(
    `${base}/stays?destination=saint-tropez&checkIn=2026-06-06&checkOut=2026-06-13&guests=4`,
    { waitUntil: "networkidle" },
  );
  const body = await page.textContent("body");
  if (body.includes("Villa Lina")) {
    throw new Error("Villa Lina should disappear after confirmation");
  }
  console.log("OK: confirmed stay removed from search");

  await browser.close();
  console.log("UI verification passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
