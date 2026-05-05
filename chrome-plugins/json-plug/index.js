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

  const open = '<span class="json-toggle">{</span>';
  const close = '<span class="json-close json-bracket">}</span>';
  const collapsedPreview = '<span class="json-collapsed-preview">...}</span>';

  let items = '';
  keys.forEach((key, i) => {
    const comma = i < keys.length - 1 ? '<span class="json-comma">,</span>' : '';
    items += `\n${'  '.repeat(indent + 1)}<span class="json-key">"${escapeHtml(key)}"</span><span class="json-colon">:</span> `;
    items += renderJson(obj[key], indent + 1);
    items += `${comma}`;
  });

  const content = `<span class="json-content"><span class="json-item">${items}\n${'  '.repeat(indent)}</span></span>`;

  return `<span class="json-line">${open}${collapsedPreview}${content}${close}</span>`;
}

function renderArray(arr, indent) {
  if (arr.length === 0) {
    return '<span class="json-bracket">[]</span>';
  }

  const open = '<span class="json-toggle" data-type="array">[</span>';
  const close = '<span class="json-close json-bracket">]</span>';
  const collapsedPreview = '<span class="json-collapsed-preview">...]</span>';

  let items = '';
  arr.forEach((item, i) => {
    const comma = i < arr.length - 1 ? '<span class="json-comma">,</span>' : '';
    items += `\n${'  '.repeat(indent + 1)}${renderJson(item, indent + 1)}${comma}`;
  });

  const content = `<span class="json-content"><span class="json-item">${items}\n${'  '.repeat(indent)}</span></span>`;

  return `<span class="json-line">${open}${collapsedPreview}${content}${close}</span>`;
}

function handleToggle(e) {
  const target = e.target;
  if (target.classList.contains('json-toggle')) {
    target.closest('.json-line').classList.toggle('collapsed');
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
