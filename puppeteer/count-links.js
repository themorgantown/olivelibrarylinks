const puppeteer = require('puppeteer');

const SITE_URL = 'https://olivelibrarylinks.vercel.app';
const MIN_LINKS = 4;
const SCREENSHOT_PATH = 'latest-screenshot.png';
const NAV_TIMEOUT = 30_000;
const LINK_WAIT_TIMEOUT = 30_000;

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: NAV_TIMEOUT });

    // Wait until at least MIN_LINKS distinct external hrefs are present
    await page.waitForFunction(
      (min) => {
        const anchors = Array.from(document.querySelectorAll('a[href^="http"]'));
        const unique = new Set(anchors.map((a) => a.href));
        return unique.size >= min;
      },
      { timeout: LINK_WAIT_TIMEOUT },
      MIN_LINKS,
    );

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href^="http"]')).map((a) => a.href),
    );

    const uniqueLinks = [...new Set(hrefs)];
    const count = uniqueLinks.length;

    console.log(`FINAL_LINK_COUNT: ${count}`);
    console.log('Unique external links found:');
    uniqueLinks.forEach((url) => console.log(`  - ${url}`));

    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  } catch (err) {
    console.error('Link checker error:', err.message);
    await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
