document.getElementById('formatBtn').addEventListener('click', formatJson);
document.getElementById('clearBtn').addEventListener('click', clearAll);

function formatJson() {
  const input = document.getElementById('input').value.trim();
  const output = document.getElementById('output');
  const error = document.getElementById('error');

  error.textContent = '';
  output.innerHTML = '';

  if (!input) {
    error.textContent = '请输入 JSON 字符串';
    return;
  }

  try {
    const parsed = JSON.parse(input);
    const html = renderJson(parsed);
    output.innerHTML = html;
    output.addEventListener('click', handleToggle);
  } catch (e) {
    error.textContent = 'JSON 解析错误: ' + e.message;
  }
}

function renderJson(value, indent = 0) {
  if (value === null) {
    return '<span class="json-null">null</span>';
  }
  if (typeof value === 'boolean') {
    return `<span class="json-boolean">${value}</span>`;
  }
  if (typeof value === 'number') {
    return `<span class="json-number">${value}</span>`;
  }
  if (typeof value === 'string') {
    return `<span class="json-string">"${escapeHtml(value)}"</span>`;
  }
  if (Array.isArray(value)) {
    return renderArray(value, indent);
  }
  if (typeof value === 'object') {
    return renderObject(value, indent);
  }
  return String(value);
}

function renderObject(obj, indent) {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return '<span class="json-bracket">{}</span>';
  }

  let html = '<span class="json-collapsible"><span class="json-bracket">{</span></span>';
  html += '<span class="json-content">';
  html += '<span class="json-item">';

  keys.forEach((key, i) => {
    const comma = i < keys.length - 1 ? '<span class="json-comma">,</span>' : '';
    html += `\n${'  '.repeat(indent + 1)}<span class="json-key">"${escapeHtml(key)}"</span><span class="json-colon">:</span> `;
    html += renderJson(obj[key], indent + 1);
    html += `${comma}`;
  });

  html += `\n${'  '.repeat(indent)}</span>`;
  html += '<span class="json-bracket">}</span>';
  html += '</span>';

  return html;
}

function renderArray(arr, indent) {
  if (arr.length === 0) {
    return '<span class="json-bracket">[]</span>';
  }

  let html = '<span class="json-collapsible"><span class="json-bracket">[</span></span>';
  html += '<span class="json-content">';
  html += '<span class="json-item">';

  arr.forEach((item, i) => {
    const comma = i < arr.length - 1 ? '<span class="json-comma">,</span>' : '';
    html += `\n${'  '.repeat(indent + 1)}${renderJson(item, indent + 1)}${comma}`;
  });

  html += `\n${'  '.repeat(indent)}</span>`;
  html += '<span class="json-bracket">]</span>';
  html += '</span>';

  return html;
}

function handleToggle(e) {
  const target = e.target;
  if (target.classList.contains('json-collapsible')) {
    target.classList.toggle('collapsed');
  }
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
}
