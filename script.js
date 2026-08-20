(() => {
  const resultEl = document.querySelector('#result');
  const expressionEl = document.querySelector('#expression');
  const keys = document.querySelector('.keys');
  const themeButton = document.querySelector('#themeButton');

  let current = '0';
  let stored = null;
  let operator = null;
  let waiting = false;
  let expression = '';

  const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  const render = () => {
    resultEl.textContent = current;
    expressionEl.textContent = expression || '\u00a0';
  };

  const format = value => {
    if (!Number.isFinite(value)) return 'Error';
    const rounded = Math.abs(value) < 1e-12 ? 0 : Number(value.toPrecision(12));
    return String(rounded);
  };

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
    } else if (!current.includes('.')) current += '.';
    render();
  }

  function calculate(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function chooseOperator(op) {
    if (current === 'Error') return clear();
    const value = Number(current);
    if (stored !== null && !waiting) {
      stored = calculate(stored, value, operator);
      current = format(stored);
    } else stored = value;
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

  function clear() {
    current = '0'; stored = null; operator = null; waiting = false; expression = ''; render();
  }

  function sign() {
    if (current !== '0' && current !== 'Error') current = current.startsWith('-') ? current.slice(1) : '-' + current;
    render();
  }

  function percent() {
    if (current !== 'Error') current = format(Number(current) / 100);
    render();
  }

  function backspace() {
    if (waiting || current === 'Error') return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-') current = '0';
    render();
  }

  keys.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.number !== undefined) return inputNumber(button.dataset.number);
    const action = button.dataset.action;
    if (action === 'decimal') return decimal();
    if (action === 'operator') return chooseOperator(button.dataset.value);
    if (action === 'equals') return equals();
    if (action === 'clear') return clear();
    if (action === 'sign') return sign();
    if (action === 'percent') return percent();
  });

  document.addEventListener('keydown', event => {
    const key = event.key;
    if (/^[0-9]$/.test(key)) inputNumber(key);
    else if (key === '.') decimal();
    else if (['+', '-', '*', '/'].includes(key)) chooseOperator(key);
    else if (key === 'Enter' || key === '=') { event.preventDefault(); equals(); }
    else if (key === 'Escape') clear();
    else if (key === 'Backspace') backspace();
    else if (key === '%') percent();
  });

  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('cal-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  });

  if (localStorage.getItem('cal-theme') === 'light') document.body.classList.add('light');
  render();
})();
