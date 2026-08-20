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
  const defaults = { sound: true, vibration: true, motion: true, compact: false };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('cal-settings') || '{}') || {}; } catch (_) { saved = {}; }
  const settings = { ...defaults, ...saved };
  const $ = id => document.getElementById(id);

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
    if (current === 'Error' || waiting) { current = n; waiting = false; }
    else current = current === '0' ? n : current + n;
    render();
  }

  function decimal() {
    if (current === 'Error' || waiting) { current = '0.'; waiting = false; }
    else if (!current.includes('.')) current += '.';
    render();
  }

  function calculate(a, b, op) {
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    if (op === '*') return a * b;
    if (op === '/') return b === 0 ? NaN : a / b;
    return b;
  }

  function clearAll() {
    current = '0'; stored = null; operator = null; waiting = false; expression = ''; render();
  }

  function clearEntry() { current = '0'; waiting = false; render(); }

  function backspace() {
    if (waiting || current === 'Error') return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
    if (current === '-') current = '0';
    render();
  }

  function chooseOperator(op) {
    if (current === 'Error') return clearAll();
    const value = Number(current);
    if (stored !== null && !waiting) {
      stored = calculate(stored, value, operator);
      current = format(stored);
      if (current === 'Error') { stored = null; operator = null; waiting = false; expression = 'Division by zero'; render(); return; }
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
    stored = null; operator = null; waiting = false;
    render();
  }

  function beep() {
    if (!settings.sound) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 520;
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.045);
    } catch (_) {}
  }

  function vibrate() { if (settings.vibration && navigator.vibrate) navigator.vibrate(8); }
  function feedback() { beep(); vibrate(); }

  function saveSettings() {
    try { localStorage.setItem('cal-settings', JSON.stringify(settings)); } catch (_) {}
    document.documentElement.classList.toggle('no-motion', !settings.motion);
    document.documentElement.classList.toggle('compact-mode', settings.compact);
  }

  function syncSettings() {
    ['sound', 'vibration', 'motion', 'compact'].forEach(k => {
      const el = $(k + 'Toggle');
      if (el) el.checked = Boolean(settings[k]);
    });
    saveSettings();
  }

  function openSettings() {
    const panel = $('settingsPanel');
    if (!panel) return;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    $('settingsTrigger')?.setAttribute('aria-expanded', 'true');
  }

  function closeSettings() {
    const panel = $('settingsPanel');
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    $('settingsTrigger')?.setAttribute('aria-expanded', 'false');
  }

  keys.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    feedback();
    if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
    else {
      const action = button.dataset.action;
      if (action === 'decimal') decimal();
      else if (action === 'operator') chooseOperator(button.dataset.value);
      else if (action === 'equals') equals();
      else if (action === 'clear') clearAll();
      else if (action === 'clear-entry') clearEntry();
      else if (action === 'backspace') backspace();
    }
  });

  document.addEventListener('keydown', event => {
    const key = event.key;
    if (/^[0-9]$/.test(key)) { inputNumber(key); feedback(); }
    else if (key === '.') { decimal(); feedback(); }
    else if (['+', '-', '*', '/'].includes(key)) { chooseOperator(key); feedback(); }
    else if (key === 'Enter' || key === '=') { event.preventDefault(); equals(); feedback(); }
    else if (key === 'Escape') {
      if ($('settingsPanel')?.classList.contains('open')) closeSettings(); else clearAll();
    } else if (key === 'Backspace') { backspace(); feedback(); }
  });

  $('settingsTrigger')?.addEventListener('click', openSettings);
  $('closeSettings')?.addEventListener('click', closeSettings);
  $('settingsBackdrop')?.addEventListener('click', closeSettings);

  ['sound', 'vibration', 'motion', 'compact'].forEach(k => {
    $(k + 'Toggle')?.addEventListener('change', event => {
      settings[k] = event.target.checked;
      saveSettings();
    });
  });

  $('resetSettings')?.addEventListener('click', () => {
    Object.assign(settings, defaults);
    syncSettings();
  });

  syncSettings();
  render();
})();
