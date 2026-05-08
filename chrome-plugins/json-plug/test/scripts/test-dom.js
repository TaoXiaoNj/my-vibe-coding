const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TEST_JSON = '{"name":"产品列表","items":[{"id":1,"name":"商品A","price":99.9,"inStock":true,"tags":["热门","促销"]},{"id":2,"name":"商品B","price":199,"inStock":false,"tags":["新品"]},{"id":3,"name":"商品C","price":49.5,"inStock":true,"tags":["清仓"]}],"total":348.4,"discount":null,"shipping":{"available":true,"methods":["普通快递","顺丰","EMS"]}}';

async function runTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Open index.html
  const htmlPath = path.resolve('./index.html');
  await page.goto(`file://${htmlPath}`);

  // Fill in the test JSON
  await page.fill('#input', TEST_JSON);

  // Click format button
  await page.click('#formatBtn');

  // Wait for rendering
  await page.waitForTimeout(500);

  // Use evaluate to check DOM structure
  const results = await page.evaluate(() => {
    const output = document.getElementById('output');
    const lines = output.querySelectorAll('.jline');

    const report = {
      totalLines: lines.length,
      lineDetails: [],
      classCounts: {},
      issues: []
    };

    // Count classes
    const allSpans = output.querySelectorAll('span[class]');
    allSpans.forEach(span => {
      const cls = span.className;
      report.classCounts[cls] = (report.classCounts[cls] || 0) + 1;
    });

    // Check each line
    lines.forEach((line, idx) => {
      const text = line.textContent;
      const hasCorrectIndent = text.startsWith('  ') || text.trim() === '' || text === '{' || text === '}' || text === '[' || text === ']';

      // Check for proper closing brackets
      const hasCloseSpan = line.querySelector('.jbracket') !== null ||
                           line.querySelector('.jclose') !== null ||
                           line.querySelector('.jcomma') !== null;

      report.lineDetails.push({
        lineNum: idx + 1,
        text: text.substring(0, 80),
        hasCloseSpan,
        spanClasses: Array.from(line.querySelectorAll('span[class]')).map(s => s.className).join(', ')
      });
    });

    // Verify expected structure
    const expectedKeys = ['name', 'items', 'total', 'discount', 'shipping'];
    const allText = output.textContent;

    expectedKeys.forEach(key => {
      if (!allText.includes(`"${key}"`)) {
        report.issues.push(`Missing key: ${key}`);
      }
    });

    // Check for proper nesting
    if (!allText.includes('"产品列表"')) {
      report.issues.push('Missing value: 产品列表');
    }

    // Check for arrays
    if (!allText.includes('"热门"') || !allText.includes('"促销"')) {
      report.issues.push('Missing array items in tags');
    }

    // Check for null
    if (!allText.includes('null')) {
      report.issues.push('Missing null value');
    }

    // Check for numbers
    if (!allText.includes('99.9') || !allText.includes('348.4')) {
      report.issues.push('Missing number values');
    }

    // Check for booleans
    if (!allText.includes('true') || !allText.includes('false')) {
      report.issues.push('Missing boolean values');
    }

    return report;
  });

  console.log('=== JSON Formatter Test Results ===\n');
  console.log(`Total lines rendered: ${results.totalLines}`);
  console.log('\nClass distribution:');
  Object.entries(results.classCounts).forEach(([cls, count]) => {
    console.log(`  ${cls}: ${count}`);
  });

  console.log('\nLine details (first 30 lines):');
  results.lineDetails.slice(0, 30).forEach(line => {
    console.log(`  Line ${line.lineNum}: "${line.text}" [${line.spanClasses}]`);
  });

  if (results.issues.length > 0) {
    console.log('\n=== ISSUES FOUND ===');
    results.issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('\n=== No structural issues found ===');
  }

  // Additional DOM checks
  const toggleCheck = await page.evaluate(() => {
    const toggles = document.querySelectorAll('.jtoggle');
    const collapsed = document.querySelectorAll('.jtoggle.collapsed');
    const previews = document.querySelectorAll('.jpreview');
    const closes = document.querySelectorAll('.jclose');

    return {
      toggleCount: toggles.length,
      collapsedCount: collapsed.length,
      previewCount: previews.length,
      closeCount: closes.length,
      firstToggleHtml: toggles[0]?.outerHTML || 'none'
    };
  });

  console.log('\n=== Toggle/Collapse Structure ===');
  console.log(`Toggle elements: ${toggleCheck.toggleCount}`);
  console.log(`Collapsed toggles: ${toggleCheck.collapsedCount}`);
  console.log(`Preview spans: ${toggleCheck.previewCount}`);
  console.log(`Close spans: ${toggleCheck.closeCount}`);
  console.log(`First toggle HTML: ${toggleCheck.firstToggleHtml}`);

  // Test collapse functionality
  console.log('\n=== Testing Collapse/Expand ===');

  // Get toggle count before click
  const togglesBefore = await page.evaluate(() => document.querySelectorAll('.jtoggle').length);

  // Click first toggle (items array)
  await page.evaluate(() => {
    const firstToggle = document.querySelector('.jtoggle');
    if (firstToggle) firstToggle.click();
  });
  await page.waitForTimeout(200);

  const afterClick = await page.evaluate(() => {
    const firstToggle = document.querySelector('.jtoggle');
    const isCollapsed = firstToggle?.classList.contains('collapsed');
    const visibleLines = Array.from(document.querySelectorAll('.jline')).filter(l => l.style.display !== 'none').length;
    return { isCollapsed, visibleLines };
  });

  console.log(`Before click: ${togglesBefore} toggles`);
  console.log(`After click - collapsed: ${afterClick.isCollapsed}, visible lines: ${afterClick.visibleLines}`);

  // Click again to expand
  await page.evaluate(() => {
    const firstToggle = document.querySelector('.jtoggle');
    if (firstToggle) firstToggle.click();
  });
  await page.waitForTimeout(200);

  const afterExpand = await page.evaluate(() => {
    const firstToggle = document.querySelector('.jtoggle');
    const isCollapsed = firstToggle?.classList.contains('collapsed');
    const visibleLines = Array.from(document.querySelectorAll('.jline')).filter(l => l.style.display !== 'none').length;
    return { isCollapsed, visibleLines };
  });

  console.log(`After expand - collapsed: ${afterExpand.isCollapsed}, visible lines: ${afterExpand.visibleLines}`);

  // Check indentation correctness
  console.log('\n=== Indentation Check ===');
  const indentCheck = await page.evaluate(() => {
    const lines = document.querySelectorAll('.jline');
    const issues = [];

    lines.forEach((line, idx) => {
      const text = line.textContent;
      // Count leading spaces
      let spaces = 0;
      for (const ch of text) {
        if (ch === ' ') spaces++;
        else break;
      }

      // Expected indent based on nesting depth
      const expectedBase = Math.floor(spaces / 2) * 2;
      const actualSpaces = spaces;

      // Check if indent is a multiple of 2
      if (spaces % 2 !== 0) {
        issues.push(`Line ${idx + 1}: Odd number of spaces (${spaces}): "${text.substring(0, 40)}..."`);
      }
    });

    return issues;
  });

  if (indentCheck.length > 0) {
    console.log('Indentation issues:');
    indentCheck.forEach(i => console.log(`  - ${i}`));
  } else {
    console.log('All indentation looks correct (multiples of 2 spaces)');
  }

  // Save screenshot
  const screenshotDir = path.resolve('./screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = Date.now();
  const screenshotPath = path.join(screenshotDir, `test-json-formatter-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\nScreenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('\n=== Test Complete ===');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
