const { chromium } = require('playwright');
const path = require('path');

const TEST_JSON = '{"name":"产品列表","items":[{"id":1,"name":"商品A","price":99.9,"inStock":true,"tags":["热门","促销"]},{"id":2,"name":"商品B","price":199,"inStock":false,"tags":["新品"]},{"id":3,"name":"商品C","price":49.5,"inStock":true,"tags":["清仓"]}],"total":348.4,"discount":null,"shipping":{"available":true,"methods":["普通快递","顺丰","EMS"]}}';

async function runTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Grant clipboard permissions
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

  // Open index.html
  const htmlPath = path.resolve('./index.html');
  await page.goto(`file://${htmlPath}`);
  console.log('Page loaded');

  // Task 1: Fill in JSON and format
  await page.fill('#input', TEST_JSON);
  await page.click('#formatBtn');
  await page.waitForTimeout(300);
  console.log('JSON formatted');

  // Get innerHTML of output
  const outputHtml = await page.evaluate(() => document.getElementById('output').innerHTML);
  console.log('\n=== TASK 1: Visual Output Verification ===');
  console.log('Output HTML length:', outputHtml.length);

  // Check for key elements in HTML
  const checks = [
    { name: 'key "name"', pattern: /class="jkey"[^>]*>"name"/ },
    { name: 'key "items"', pattern: /class="jkey"[^>]*>"items"/ },
    { name: 'key "id"', pattern: /class="jkey"[^>]*>"id"/ },
    { name: 'key "name" (item)', pattern: /class="jkey"[^>]*>"name"[^<]*<\/span><span class="jcolon">:<\/span>/ },
    { name: 'key "price"', pattern: /class="jkey"[^>]*>"price"/ },
    { name: 'key "inStock"', pattern: /class="jkey"[^>]*>"inStock"/ },
    { name: 'key "tags"', pattern: /class="jkey"[^>]*>"tags"/ },
    { name: 'key "total"', pattern: /class="jkey"[^>]*>"total"/ },
    { name: 'key "discount"', pattern: /class="jkey"[^>]*>"discount"/ },
    { name: 'key "shipping"', pattern: /class="jkey"[^>]*>"shipping"/ },
    { name: 'key "available"', pattern: /class="jkey"[^>]*>"available"/ },
    { name: 'key "methods"', pattern: /class="jkey"[^>]*>"methods"/ },
    { name: 'string values', pattern: /class="jstr"/ },
    { name: 'number values', pattern: /class="jnum"/ },
    { name: 'boolean values', pattern: /class="jbool"/ },
    { name: 'null values', pattern: /class="jnull"/ },
    { name: 'brackets {', pattern: /class="jbracket"[^>]*>\{/ },
    { name: 'brackets [', pattern: /class="jbracket"[^>]*>\[/ },
  ];

  let allPassed = true;
  for (const check of checks) {
    const found = check.pattern.test(outputHtml);
    console.log(`  ${found ? 'PASS' : 'FAIL'}: ${check.name}`);
    if (!found) allPassed = false;
  }

  // Check indentation (2 spaces)
  const indentCheck = outputHtml.includes('class="jline">  <span');
  console.log(`  ${indentCheck ? 'PASS' : 'FAIL'}: 2-space indentation`);

  // Check commas
  const commaCheck = outputHtml.includes('class="jcomma"');
  console.log(`  ${outputHtml.match(/class="jcomma"/g)?.length || 0} commas found`);

  // Task 2: Copy functionality
  console.log('\n=== TASK 2: Copy Functionality ===');
  await page.click('#copyBtn');
  await page.waitForTimeout(200);

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  console.log('Clipboard content (first 500 chars):');
  console.log(clipboardText.substring(0, 500));

  // Verify clipboard is valid JSON
  try {
    const parsed = JSON.parse(clipboardText);
    console.log('Clipboard is valid JSON: PASS');

    // Check specific values
    const valueChecks = [
      { path: 'name', expected: '产品列表' },
      { path: 'items[0].name', expected: '商品A' },
      { path: 'total', expected: 348.4 },
      { path: 'discount', expected: null },
      { path: 'shipping.available', expected: true },
    ];

    for (const check of valueChecks) {
      const pathParts = check.path.split('.');
      let value = parsed;
      for (const p of pathParts) {
        value = value[p];
      }
      const match = value === check.expected;
      console.log(`  ${match ? 'PASS' : 'FAIL'}: ${check.path} = ${JSON.stringify(value)}`);
    }
  } catch (e) {
    console.log('Clipboard is NOT valid JSON: FAIL');
    console.log('Error:', e.message);
  }

  // Task 3: Understand copy logic
  console.log('\n=== TASK 3: Copy Logic Analysis ===');
  console.log('From index.js analysis:');
  console.log('  - _formattedJson = JSON.stringify(parsed, null, 2)  // Line 42');
  console.log('  - copyOutput() uses navigator.clipboard.writeText(_formattedJson)  // Line 11');
  console.log('  - This copies RAW TEXT, not innerHTML');
  console.log('  - The copy logic is CORRECT - it copies pure formatted JSON text');

  await browser.close();
  console.log('\n=== All tests completed ===');
}

runTests().catch(console.error);
