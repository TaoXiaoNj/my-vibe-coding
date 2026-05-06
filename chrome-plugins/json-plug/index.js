document.getElementById('formatBtn').addEventListener('click', formatJson);
document.getElementById('clearBtn').addEventListener('click', clearAll);
document.getElementById('copyBtn').addEventListener('click', copyOutput);

let _formattedJson = '';

function copyOutput() {
  if (!_formattedJson) {
    return;
  }
  navigator.clipboard.writeText(_formattedJson).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '已复制';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '复制结果';
      btn.classList.remove('copied');
    }, 1500);
  });
}

let _uid = 0;

function formatJson() {
  const input = document.getElementById('input').value.trim();
  const output = document.getElementById('output');
  const error = document.getElementById('error');

  error.textContent = '';
  error.classList.remove('show');
  output.innerHTML = '';
  _uid = 0;

  if (!input) {
    error.textContent = '请输入 JSON 字符串';
    error.classList.add('show');
    return;
  }

  try {
    const parsed = JSON.parse(input);
    _formattedJson = JSON.stringify(parsed, null, 2);
    const lines = buildLines(parsed, 0, true, null);
    output.innerHTML = lines.join('');
  } catch (e) {
    _formattedJson = '';
    error.textContent = 'JSON 解析错误: ' + e.message;
    error.classList.add('show');
  }
}

function sp(n) { return '  '.repeat(n); }

function buildLines(value, indent, isRoot, parentId, keyName) {
  if (value === null) return [`<div class="jline">${sp(indent)}<span class="jnull">null</span></div>`];
  if (typeof value === 'boolean') return [`<div class="jline">${sp(indent)}<span class="jbool">${value}</span></div>`];
  if (typeof value === 'number') return [`<div class="jline">${sp(indent)}<span class="jnum">${value}</span></div>`];
  if (typeof value === 'string') return [`<div class="jline">${sp(indent)}<span class="jstr">"${escapeHtml(value)}"</span></div>`];
  if (Array.isArray(value)) return buildArrayLines(value, indent, isRoot, parentId, keyName);
  if (typeof value === 'object') return buildObjectLines(value, indent, isRoot, parentId, keyName);
  return [`<div class="jline">${sp(indent)}${value}</div>`];
}

function buildObjectLines(obj, indent, isRoot, parentId, keyName) {
  const keys = Object.keys(obj);
  const lines = [];

  if (keys.length === 0) {
    return [`<div class="jline">${sp(indent)}<span class="jbracket">{</span><span class="jbracket">}</span></div>`];
  }

  const nodeId = 'n' + (_uid++);

  // Open line
  if (isRoot) {
    lines.push(`<div class="jline">${sp(indent)}<span class="jbracket">{</span></div>`);
  } else {
    const keyHtml = keyName ? `<span class="jkey">"${escapeHtml(keyName)}"</span><span class="jcolon">:</span> ` : '';
    lines.push(`<div class="jline jnode" data-id="${nodeId}">${sp(indent)}<span class="jtoggle" data-id="${nodeId}"></span>${keyHtml}<span class="jbracket">{</span><span class="jpreview" data-id="${nodeId}">...</span><span class="jclose" data-id="${nodeId}">}</span></div>`);
  }

  // Key-value pairs
  keys.forEach((key, i) => {
    const comma = i < keys.length - 1 ? ',' : '';
    const nested = buildLines(obj[key], indent + 1, false, nodeId, key);

    // Add comma to last line: insert comma span before </div>
    // Example: <div class="jline">  <span class="jnum">1</span></div>
    // Becomes:   <div class="jline">  <span class="jnum">1</span><span class="jcomma">,</span></div>
    const last = nested[nested.length - 1];
    nested[nested.length - 1] = last.replace(/(<\/div>)$/, `<span class="jcomma">${comma}</span></div>`);

    lines.push(...nested);
  });

  // Close line
  lines.push(`<div class="jline">${sp(indent)}<span class="jbracket">}</span></div>`);

  return lines;
}

function buildArrayLines(arr, indent, isRoot, parentId, keyName) {
  const lines = [];

  if (arr.length === 0) {
    return [`<div class="jline">${sp(indent)}<span class="jbracket">[</span><span class="jbracket">]</span></div>`];
  }

  const nodeId = 'n' + (_uid++);

  // Open line
  if (isRoot) {
    lines.push(`<div class="jline">${sp(indent)}<span class="jbracket">[</span></div>`);
  } else {
    const keyHtml = keyName ? `<span class="jkey">"${escapeHtml(keyName)}"</span><span class="jcolon">:</span> ` : '';
    lines.push(`<div class="jline jnode" data-id="${nodeId}">${sp(indent)}<span class="jtoggle" data-id="${nodeId}"></span>${keyHtml}<span class="jbracket">[</span><span class="jpreview" data-id="${nodeId}">...</span><span class="jclose" data-id="${nodeId}">]</span></div>`);
  }

  // Items
  arr.forEach((item, i) => {
    const comma = i < arr.length - 1 ? ',' : '';
    const nested = buildLines(item, indent + 1, false, nodeId, null);
    const last = nested[nested.length - 1];
    nested[nested.length - 1] = last.replace(/(<\/div>)$/, `<span class="jcomma">${comma}</span></div>`);
    lines.push(...nested);
  });

  // Close line
  lines.push(`<div class="jline">${sp(indent)}<span class="jbracket">]</span></div>`);

  return lines;
}

document.getElementById('output').addEventListener('click', (e) => {
  const target = e.target;
  if (target.classList.contains('jtoggle')) {
    const id = target.getAttribute('data-id');
    const nodeDiv = target.closest('.jline');
    const allLines = Array.from(document.querySelectorAll('.jline'));
    const nodeIdx = allLines.indexOf(nodeDiv);
    const nodeLvl = parseInt(nodeDiv.getAttribute('data-lvl') || indentLevel(nodeDiv));
    const isCollapsed = target.classList.contains('collapsed');

    target.classList.toggle('collapsed');

    // Toggle preview/close
    const preview = document.querySelector(`.jpreview[data-id="${id}"]`);
    const close = document.querySelector(`.jclose[data-id="${id}"]`);
    if (preview) preview.style.display = isCollapsed ? '' : 'none';
    if (close) close.style.display = isCollapsed ? '' : 'none';

    // Toggle children
    for (let i = nodeIdx + 1; i < allLines.length; i++) {
      const line = allLines[i];
      const lvl = indentLevel(line);
      if (lvl <= nodeLvl) break;
      line.style.display = isCollapsed ? 'none' : '';
    }
  }
});

function indentLevel(div) {
  // Count leading spaces in text content, divide by 2
  const text = div.textContent;
  let spaces = 0;
  for (const ch of text) {
    if (ch === ' ') spaces++;
    else break;
  }
  return spaces / 2;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('error').textContent = '';
  document.getElementById('error').classList.remove('show');
  _formattedJson = '';
}