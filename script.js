(() => {
  'use strict';

  const resultEl = document.querySelector('#result');
  const expressionEl = document.querySelector('#expression');
  const keys = document.querySelector('.button-grid');

  if (!resultEl || !expressionEl || !keys) return;

  let current = '0';
  let stored = null;
  let operator = null;
  let waiting = false;
  let expression = '';

  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function render() {
    resultEl.textContent = current;
    expressionEl.textContent = expression || '0';
  }

  function format(value) {
    if (!Number.isFinite(value)) return 'Error';
    const rounded = Math.abs(value) < 1e-12 ? 0 : Number(value.toPrecision(12));
    return String(rounded);
  }

  function inputNumber(n) {
    if (current === 'Error' || waiting) {
      current = n;
      waiting = false;
    } else {
      current = current === '0' ? n : current + n;
    }
    render();
  }

  function decimal() {
    if (current === 'Error' || waiting) {
      current = '0.';
      waiting = false;
    } else if (!current.includes('.')) {
      current += '.';
    }
    render();
  }

  function calculate(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b === 0 ? NaN : a / b;
    return b;
  }

  function chooseOperator(op) {
    if (current === 'Error') return clearAll();
    const value = Number(current);

    if (stored !== null && !waiting) {
      stored = calculate(stored, value, operator);
      current = format(stored);
    } else {
      stored = value;
    }

    operator = op;
    waiting = true;
    expression = `${format(stored)} ${symbols[op]}`;
    render();
  }

  function equals() {
    if (operator === null || stored === null || waiting) return;

    const left = stored;
    const right = Number(current);
    const op = operator;
    const value = calculate(left, right, op);

    expression = `${format(left)} ${symbols[op]} ${format(right)} =`;
    current = format(value);
    stored = null;
    operator = null;
    waiting = false;
    render();
  }

  function clearAll() {
    current = '0';
    stored = null;
    operator = null;
    waiting = false;
    expression = '';
    render();
  }

  function clearEntry() {
    current = '0';
    waiting = false;
    render();
  }

  function backspace() {
    if (waiting || current === 'Error') return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-') current = '0';
    render();
  }

  keys.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.number !== undefined) {
      inputNumber(button.dataset.number);
      return;
    }

    const action = button.dataset.action;
    if (action === 'decimal') decimal();
    else if (action === 'operator') chooseOperator(button.dataset.value);
    else if (action === 'equals') equals();
    else if (action === 'clear') clearAll();
    else if (action === 'clear-entry') clearEntry();
    else if (action === 'backspace') backspace();
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/^[0-9]$/.test(key)) inputNumber(key);
    else if (key === '.') decimal();
    else if (['+', '-', '*', '/'].includes(key)) chooseOperator(key);
    else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      equals();
    } else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') backspace();
  });

  render();
})();
