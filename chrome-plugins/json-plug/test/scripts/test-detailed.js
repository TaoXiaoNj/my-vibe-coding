const { chromium } = require('playwright');
const path = require('path');

const TEST_JSON = '{"name":"产品列表","items":[{"id":1,"name":"商品A","price":99.9,"inStock":true,"tags":["热门","促销"]},{"id":2,"name":"商品B","price":199,"inStock":false,"tags":["新品"]},{"id":3,"name":"商品C","price":49.5,"inStock":true,"tags":["清仓"]}],"total":348.4,"discount":null,"shipping":{"available":true,"methods":["普通快递","顺丰","EMS"]}}';

async function runDetailedTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const htmlPath = path.resolve('./index.html');
  await page.goto(`file://${htmlPath}`);

  await page.fill('#input', TEST_JSON);
  await page.click('#formatBtn');
  await page.waitForTimeout(500);

  console.log('=== DETAILED DOM ANALYSIS ===\n');

  // Get full HTML of output
  const htmlOutput = await page.evaluate(() => document.getElementById('output').innerHTML);

  // Parse to understand structure
  console.log('--- First 2000 chars of HTML ---');
  console.log(htmlOutput.substring(0, 2000));
  console.log('\n...\n');

  // Check key elements properly
  const keyCheck = await page.evaluate(() => {
    const keys = document.querySelectorAll('.jkey');
    return Array.from(keys).map(k => k.textContent);
  });
  console.log('--- All jkey elements ---');
  console.log(keyCheck);

  // Check string values
  const strCheck = await page.evaluate(() => {
    const strs = document.querySelectorAll('.jstr');
    return Array.from(strs).map(s => s.textContent);
  });
  console.log('\n--- All jstr elements ---');
  console.log(strCheck);

  // Check numbers
  const numCheck = await page.evaluate(() => {
    const nums = document.querySelectorAll('.jnum');
    return Array.from(nums).map(n => n.textContent);
  });
  console.log('\n--- All jnum elements ---');
  console.log(numCheck);

  // Check booleans
  const boolCheck = await page.evaluate(() => {
    const bools = document.querySelectorAll('.jbool');
    return Array.from(bools).map(b => b.textContent);
  });
  console.log('\n--- All jbool elements ---');
  console.log(boolCheck);

  // Check null
  const nullCheck = await page.evaluate(() => {
    const nulls = document.querySelectorAll('.jnull');
    return Array.from(nulls).map(n => n.textContent);
  });
  console.log('\n--- All jnull elements ---');
  console.log(nullCheck);

  // Check brackets
  const bracketCheck = await page.evaluate(() => {
    const brackets = document.querySelectorAll('.jbracket');
    return Array.from(brackets).map(b => b.textContent);
  });
  console.log('\n--- All jbracket elements ---');
  console.log(bracketCheck);

  // Get complete line text
  const lineText = await page.evaluate(() => {
    const lines = document.querySelectorAll('.jline');
    return Array.from(lines).map(l => {
      // Get text content but preserve structure
      const spans = Array.from(l.querySelectorAll('span')).map(s => s.className + ':' + s.textContent);
      return {
        text: l.textContent,
        spans: spans,
        hasToggle: !!l.querySelector('.jtoggle'),
        hasPreview: !!l.querySelector('.jpreview'),
        hasClose: !!l.querySelector('.jclose')
      };
    });
  });

  console.log('\n--- Complete line analysis ---');
  lineText.forEach((line, idx) => {
    console.log(`Line ${idx + 1}: "${line.text}"`);
    if (line.hasToggle) {
      console.log(`  [Toggle detected, hasPreview: ${line.hasPreview}, hasClose: ${line.hasClose}]`);
    }
  });

  // Verify specific expected values
  console.log('\n--- Verification of Expected Values ---');
  const expectedValues = [
    '"name"', '"产品列表"', '"items"', '"id"', '1', '"name"', '"商品A"',
    '99.9', 'true', '"tags"', '"热门"', '"促销"', '2', '"商品B"', '199',
    'false', '"新品"', '3', '"商品C"', '49.5', 'true', '"清仓"',
    '"total"', '348.4', '"discount"', 'null', '"shipping"', '"available"',
    'true', '"methods"', '"普通快递"', '"顺丰"', '"EMS"'
  ];

  const allText = htmlOutput;
  let missing = [];
  expectedValues.forEach(val => {
    if (!allText.includes(val)) {
      missing.push(val);
    }
  });

  if (missing.length === 0) {
    console.log('All expected values found in output!');
  } else {
    console.log('Missing values:', missing);
  }

  // Check comma placement
  console.log('\n--- Comma Placement Check ---');
  const commaCheck = await page.evaluate(() => {
    const commas = document.querySelectorAll('.jcomma');
    return Array.from(commas).map(c => ({
      text: c.textContent,
      parentLine: c.closest('.jline')?.textContent?.substring(0, 50)
    }));
  });
  console.log(`Total commas: ${commaCheck.length}`);
  commaCheck.forEach((c, i) => {
    console.log(`  ${i + 1}: "${c.text}" in: "${c.parentLine}..."`);
  });

  // Check toggle collapse functionality more thoroughly
  console.log('\n--- Toggle Functionality Test ---');

  // Find all collapsible nodes
  const collapsibleNodes = await page.evaluate(() => {
    const toggles = document.querySelectorAll('.jtoggle');
    return Array.from(toggles).map(t => {
      const id = t.getAttribute('data-id');
      const preview = document.querySelector(`.jpreview[data-id="${id}"]`);
      const close = document.querySelector(`.jclose[data-id="${id}"]`);
      const parentLine = t.closest('.jline');
      return {
        id,
        previewText: preview?.textContent,
        closeText: close?.textContent,
        parentLineText: parentLine?.textContent?.substring(0, 60)
      };
    });
  });

  console.log('Collapsible nodes:');
  collapsibleNodes.forEach((node, i) => {
    console.log(`  ${i + 1}. id=${node.id}, preview="${node.previewText}", close="${node.closeText}"`);
    console.log(`     Parent: "${node.parentLineText}..."`);
  });

  await browser.close();
}

runDetailedTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
