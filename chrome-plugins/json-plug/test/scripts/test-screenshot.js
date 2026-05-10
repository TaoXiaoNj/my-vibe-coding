const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TEST_JSON = '{"name":"产品列表","items":[{"id":1,"name":"商品A","price":99.9,"inStock":true,"tags":["热门","促销"]},{"id":2,"name":"商品B","price":199,"inStock":false,"tags":["新品"]},{"id":3,"name":"商品C","price":49.5,"inStock":true,"tags":["清仓"]}],"total":348.4,"discount":null,"shipping":{"available":true,"methods":["普通快递","顺丰","EMS"]}}';

async function takeScreenshot() {
  const browser = await chromium.launch({ dangerouslyDisableSandbox: true });
  const page = await browser.newPage();

  // Open index.html
  const htmlPath = path.resolve(__dirname, 'index.html');
  await page.goto(`file://${htmlPath}`);

  // Fill in test JSON
  await page.fill('#input', TEST_JSON);

  // Click format button
  await page.click('#formatBtn');

  // Wait for rendering
  await page.waitForTimeout(500);

  // Ensure screenshots directory exists
  const screenshotDir = path.resolve(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Save screenshot
  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotDir, `test-json-formatter-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();
  console.log(`Screenshot saved to: ${screenshotPath}`);
}

takeScreenshot().catch(console.error);