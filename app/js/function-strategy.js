const screenRoot = document.getElementById('strategyScreenRoot');
const detailSheet = document.getElementById('strategyDetail');
const fullSheet = document.getElementById('strategyDetailFull');
const detailName = document.getElementById('strategyDetailName');
const detailToggle = document.getElementById('strategyDetailToggle');
const dateTrigger = document.getElementById('strategyDateTrigger');
const datePicker = document.getElementById('strategyDatePicker');
const dateLabel = document.getElementById('strategyDateLabel');
const monthLabel = document.getElementById('strategyMonthLabel');
const calendarDays = document.getElementById('strategyCalendarDays');
const previousMonth = document.getElementById('strategyMonthPrev');
const nextMonth = document.getElementById('strategyMonthNext');
const dateConfirm = document.getElementById('strategyDateConfirm');

const STRATEGY_META = {
  'ai-schedule': { name: 'AI排程测试' },
  summer: { name: '夏季' },
};

const getToggleState = (key) => {
  const listToggle = document.querySelector(`.strategy-group-card[data-strategy-group="${key}"] [data-strategy-toggle]`);
  return listToggle?.classList.contains('strategy-switch--on') ?? false;
};

const applyToggleVisual = (toggle, isOn) => {
  if (!toggle) return;
  toggle.classList.toggle('strategy-switch--on', isOn);
  toggle.classList.toggle('strategy-switch--off', !isOn);
  toggle.setAttribute('aria-pressed', String(isOn));
  const baseLabel = (toggle.getAttribute('aria-label') || '策略开关').replace(/，当前(开启|关闭)$/, '');
  toggle.setAttribute('aria-label', `${baseLabel}，当前${isOn ? '开启' : '关闭'}`);
};

const syncGroupState = (key, isOn) => {
  document.querySelectorAll(`[data-strategy-toggle="${key}"]`).forEach((toggle) => applyToggleVisual(toggle, isOn));
  const card = document.querySelector(`.strategy-group-card[data-strategy-group="${key}"]`);
  card?.classList.toggle('strategy-group-card--inactive', !isOn);
};

const setSheetOpenState = () => {
  const anyOpen = Boolean(document.querySelector('.strategy-detail-sheet.is-open, .strategy-full-sheet.is-open'));
  screenRoot?.classList.toggle('is-strategy-sheet-open', anyOpen);
  detailSheet?.setAttribute('aria-hidden', String(!detailSheet?.classList.contains('is-open')));
  fullSheet?.setAttribute('aria-hidden', String(!fullSheet?.classList.contains('is-open')));
};

const showPanel = (panelId) => {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  document.querySelectorAll('.strategy-detail-sheet, .strategy-full-sheet').forEach((sheet) => {
    sheet.classList.toggle('is-open', sheet === panel);
  });
  const scroll = panel.querySelector('.strategy-detail-sheet__scroll, .strategy-full-sheet__scroll');
  if (scroll) scroll.scrollTop = 0;
  setSheetOpenState();
};

const closePanels = () => {
  document.querySelectorAll('.strategy-detail-sheet, .strategy-full-sheet').forEach((sheet) => sheet.classList.remove('is-open'));
  setSheetOpenState();
  if (window.location.hash === '#strategyDetail' || window.location.hash === '#strategyDetailFull') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
};

const openDetail = (strategyKey = 'ai-schedule') => {
  const meta = STRATEGY_META[strategyKey] || STRATEGY_META['ai-schedule'];
  const isOn = getToggleState(strategyKey);
  if (detailName) detailName.textContent = meta.name;
  if (detailToggle) {
    detailToggle.dataset.strategyToggle = strategyKey;
    applyToggleVisual(detailToggle, isOn);
  }
  showPanel('strategyDetail');
};

document.querySelectorAll('[data-strategy-open-detail]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    openDetail(link.getAttribute('data-strategy-open-detail') || 'ai-schedule');
  });
});

document.querySelector('[href="#strategyDetailFull"]')?.addEventListener('click', (event) => {
  event.preventDefault();
  showPanel('strategyDetailFull');
});

document.querySelectorAll('[data-strategy-close-sheet]').forEach((button) => {
  button.addEventListener('click', closePanels);
});

document.querySelectorAll('[data-strategy-back-to-detail]').forEach((button) => {
  button.addEventListener('click', () => showPanel('strategyDetail'));
});

document.querySelectorAll('[data-strategy-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const key = toggle.getAttribute('data-strategy-toggle');
    if (!key) return;
    const nextOn = !toggle.classList.contains('strategy-switch--on');
    syncGroupState(key, nextOn);
  });
});

document.querySelectorAll('[data-period-card]').forEach((card) => {
  const head = card.querySelector('.strategy-detail-card__head');
  const chevron = card.querySelector('.strategy-detail-card__chevron');
  if (!head) return;

  head.addEventListener('click', () => {
    const willExpand = card.classList.contains('is-collapsed');
    card.classList.toggle('is-collapsed', !willExpand);
    card.classList.toggle('is-expanded', willExpand);
    head.setAttribute('aria-expanded', String(willExpand));
    if (chevron) {
      chevron.classList.toggle('fa-chevron-down', !willExpand);
      chevron.classList.toggle('fa-chevron-up', willExpand);
    }
  });
});

const today = new Date(2026, 6, 22);
let selectedDate = new Date(today);
let draftDate = new Date(selectedDate);
let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const formatDate = (date) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const sameDate = (first, second) => formatDate(first) === formatDate(second);

const renderCalendar = () => {
  if (!monthLabel || !calendarDays) return;
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthLabel.textContent = `${year}年${month + 1}月`;
  calendarDays.innerHTML = '';

  Array.from({ length: firstWeekday }, () => {
    const spacer = document.createElement('span');
    spacer.className = 'strategy-date-picker__blank';
    calendarDays.appendChild(spacer);
  });

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(day);
    button.className = 'strategy-date-picker__day';
    button.disabled = date > today;
    if (sameDate(date, draftDate)) button.classList.add('is-selected');
    if (sameDate(date, today)) button.classList.add('is-today');
    button.addEventListener('click', () => {
      draftDate = date;
      renderCalendar();
    });
    calendarDays.appendChild(button);
  }
};

const setDatePickerOpen = (isOpen) => {
  if (!datePicker || !dateTrigger) return;
  datePicker.classList.toggle('is-open', isOpen);
  datePicker.setAttribute('aria-hidden', String(!isOpen));
  dateTrigger.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    draftDate = new Date(selectedDate);
    calendarMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderCalendar();
  }
};

dateTrigger?.addEventListener('click', () => setDatePickerOpen(true));
previousMonth?.addEventListener('click', () => {
  calendarMonth.setMonth(calendarMonth.getMonth() - 1);
  renderCalendar();
});
nextMonth?.addEventListener('click', () => {
  const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) {
    calendarMonth = next;
    renderCalendar();
  }
});
dateConfirm?.addEventListener('click', () => {
  selectedDate = new Date(draftDate);
  if (dateLabel) dateLabel.textContent = formatDate(selectedDate);
  setDatePickerOpen(false);
});
document.querySelectorAll('[data-strategy-date-close]').forEach((button) => {
  button.addEventListener('click', () => setDatePickerOpen(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (datePicker?.classList.contains('is-open')) {
    setDatePickerOpen(false);
    return;
  }
  if (fullSheet?.classList.contains('is-open')) {
    showPanel('strategyDetail');
    return;
  }
  if (detailSheet?.classList.contains('is-open')) {
    closePanels();
  }
});

const syncFromHash = () => {
  if (window.location.hash === '#strategyDetailFull') {
    openDetail('ai-schedule');
    showPanel('strategyDetailFull');
    return;
  }
  if (window.location.hash === '#strategyDetail') {
    openDetail('ai-schedule');
  }
};

syncFromHash();
window.addEventListener('hashchange', syncFromHash);

document.querySelectorAll('[data-strategy-toggle]').forEach((toggle) => {
  const isOn = toggle.classList.contains('strategy-switch--on');
  applyToggleVisual(toggle, isOn);
});
