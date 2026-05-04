document.getElementById('formatBtn').addEventListener('click', formatJson);
document.getElementById('clearBtn').addEventListener('click', clearAll);

function formatJson() {
  const input = document.getElementById('input').value.trim();
  const output = document.getElementById('output');
  const error = document.getElementById('error');

  error.textContent = '';
  output.textContent = '';

  if (!input) {
    error.textContent = '请输入 JSON 字符串';
    return;
  }

  try {
    const parsed = JSON.parse(input);
    output.textContent = JSON.stringify(parsed, null, 2);
  } catch (e) {
    error.textContent = 'JSON 解析错误: ' + e.message;
  }
}

function clearAll() {
  document.getElementById('input').value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('error').textContent = '';
}
