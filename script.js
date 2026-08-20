(() => {
  'use strict';
  const resultEl = document.getElementById('result');
  const expressionEl = document.getElementById('expression');
  const keys = document.querySelector('.keys');
  const themeButton = document.getElementById('themeButton');
  if (!resultEl || !expressionEl || !keys) return;

  let current = '0', previous = null, operator = null;
  let waiting = false, justCalculated = false, expression = '';
  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function format(value) {
    if (!Number.isFinite(value)) return 'Error';
    if (Object.is(value, -0) || Math.abs(value) < 1e-12) value = 0;
    return Number(value.toPrecision(12)).toString();
  }
  function render() {
    resultEl.textContent = current;
    expressionEl.textContent = expression || '\u00a0';
  }
  function calculate(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b === 0 ? NaN : a / b;
    return b;
  }
  function inputNumber(n) {
    if (current === 'Error' || waiting || justCalculated) {
      current = n; waiting = false; justCalculated = false;
      if (operator === null) expression = '';
    } else current = current === '0' ? n : current + n;
    render();
  }
  function decimal() {
    if (current === 'Error' || waiting || justCalculated) {
      current = '0.'; waiting = false; justCalculated = false;
      if (operator === null) expression = '';
    } else if (!current.includes('.')) current += '.';
    render();
  }
  function chooseOperator(op) {
    if (current === 'Error') clear();
    const value = Number(current);
    if (previous !== null && operator !== null && !waiting) {
      previous = calculate(previous, value, operator);
      current = format(previous);
    } else previous = value;
    operator = op; waiting = true; justCalculated = false;
    expression = `${format(previous)} ${symbols[op]}`;
    render();
  }
  function equals() {
    if (current === 'Error' || previous === null || operator === null || waiting) return;
    const left = previous, right = Number(current), op = operator;
    current = format(calculate(left, right, op));
    expression = `${format(left)} ${symbols[op]} ${format(right)} =`;
    previous = null; operator = null; waiting = false; justCalculated = true;
    render();
  }
  function clear() {
    current = '0'; previous = null; operator = null;
    waiting = false; justCalculated = false; expression = ''; render();
  }
  function sign() {
    if (current !== 'Error' && current !== '0') current = current.startsWith('-') ? current.slice(1) : '-' + current;
    render();
  }
  function percent() {
    if (current !== 'Error') current = format(Number(current) / 100);
    render();
  }
  function backspace() {
    if (waiting || justCalculated || current === 'Error') return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-') current = '0';
    render();
  }
  keys.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !keys.contains(button)) return;
    if (button.dataset.number !== undefined) return inputNumber(button.dataset.number);
    switch (button.dataset.action) {
      case 'decimal': return decimal();
      case 'operator': return chooseOperator(button.dataset.value);
      case 'equals': return equals();
      case 'clear': return clear();
      case 'sign': return sign();
      case 'percent': return percent();
    }
  });
  document.addEventListener('keydown', event => {
    const k = event.key;
    if (/^[0-9]$/.test(k)) { event.preventDefault(); inputNumber(k); }
    else if (k === '.') { event.preventDefault(); decimal(); }
    else if (['+', '-', '*', '/'].includes(k)) { event.preventDefault(); chooseOperator(k); }
    else if (k === 'Enter' || k === '=') { event.preventDefault(); equals(); }
    else if (k === 'Escape') { event.preventDefault(); clear(); }
    else if (k === 'Backspace') { event.preventDefault(); backspace(); }
    else if (k === '%') { event.preventDefault(); percent(); }
  });
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      document.body.classList.toggle('light');
      try { localStorage.setItem('cal-theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch (_) {}
    });
    try { if (localStorage.getItem('cal-theme') === 'light') document.body.classList.add('light'); } catch (_) {}
  }
  render();
})();
