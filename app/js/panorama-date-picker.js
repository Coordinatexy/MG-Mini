/**
 * 能量全景 · 放大态监控日期选择器（近 30 日）
 */
(function () {
  const RANGE_DAYS = 30;
  const LOAD_DELAY_MS = 680;

  const datePickerEl = document.getElementById('panoramaExpandDatePicker');
  const dateLabelEl = document.getElementById('panoramaDateLabel');
  const prevBtn = document.getElementById('panoramaDatePrev');
  const nextBtn = document.getElementById('panoramaDateNext');
  const dateTrigger = document.getElementById('panoramaDateTrigger');
  const pickerOverlay = document.getElementById('panoramaDatePickerOverlay');
  const pickerClose = document.getElementById('panoramaDatePickerClose');
  const calendarEl = document.getElementById('panoramaDateCalendar');
  const toastEl = document.getElementById('appToast');
  const expandOverlay = document.getElementById('panoramaExpandOverlay');

  if (!datePickerEl || !dateLabelEl || !prevBtn || !nextBtn || !dateTrigger) return;

  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseDate = (value) => {
    const [y, m, d] = value.split('-').map(Number);
    return startOfDay(new Date(y, m - 1, d));
  };

  const addDays = (date, amount) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return startOfDay(next);
  };

  const today = startOfDay(new Date());
  const minDate = addDays(today, -(RANGE_DAYS - 1));

  let selectedDate = today;
  let calendarViewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let toastTimer = null;

  const isFutureDate = (date) => date.getTime() > today.getTime();
  const isBeforeMinDate = (date) => date.getTime() < minDate.getTime();
  const isSelectableDate = (date) => !isFutureDate(date) && !isBeforeMinDate(date);

  const showToast = (message) => {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
      setTimeout(() => {
        toastEl.hidden = true;
      }, 220);
    }, 1800);
  };

  const getActivePanoramaTab = () => {
    if (isExpandedOpen()) {
      return expandOverlay?.querySelector('[data-panorama-tab].is-active')?.dataset.panoramaTab ?? 'flow';
    }
    return document.querySelector('[data-panorama-tab].is-active')?.dataset.panoramaTab ?? 'flow';
  };

  const isExpandedOpen = () => expandOverlay?.classList.contains('is-open');

  const syncVisibility = () => {
    const visible = isExpandedOpen() && getActivePanoramaTab() === 'strategy';
    datePickerEl.hidden = !visible;
    datePickerEl.classList.toggle('is-visible', visible);
    if (!visible) setPickerOpen(false);
  };

  const syncNavState = () => {
    const atMin = selectedDate.getTime() <= minDate.getTime();
    const atMax = selectedDate.getTime() >= today.getTime();
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    prevBtn.classList.toggle('is-disabled', atMin);
    nextBtn.classList.toggle('is-disabled', atMax);
    prevBtn.setAttribute('aria-disabled', String(atMin));
    nextBtn.setAttribute('aria-disabled', String(atMax));
    dateLabelEl.textContent = formatDate(selectedDate);
  };

  const setLoading = (isLoading) => {
    window.PanoramaMonitorChart?.setLoading?.(isLoading);
  };

  const loadMonitorData = (date) => {
    setLoading(true);
    window.setTimeout(() => {
      window.PanoramaMonitorChart?.loadDate?.(formatDate(date));
      setLoading(false);
    }, LOAD_DELAY_MS);
  };

  const applyDate = (date, options = {}) => {
    if (!isSelectableDate(date)) {
      if (isFutureDate(date)) showToast('不可选择未来日期');
      else showToast('仅支持查询近30日数据');
      return false;
    }

    selectedDate = startOfDay(date);
    syncNavState();

    if (options.openCalendar !== true) {
      calendarViewMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }

    if (options.skipLoad) return true;

    loadMonitorData(selectedDate);
    return true;
  };

  const shiftDate = (delta) => {
    const target = addDays(selectedDate, delta);
    if (!isSelectableDate(target)) {
      if (delta > 0) showToast('不可选择未来日期');
      else showToast('仅支持查询近30日数据');
      return;
    }
    applyDate(target);
  };

  const setPickerOpen = (isOpen) => {
    if (!pickerOverlay) return;
    pickerOverlay.classList.toggle('is-open', isOpen);
    pickerOverlay.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) {
      calendarViewMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      renderCalendar();
    }
  };

  const monthLabel = (date) => `${date.getFullYear()}年${date.getMonth() + 1}月`;

  const canNavigateMonth = (direction) => {
    const probe = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + direction, 1);
    const monthStart = startOfDay(probe);
    const monthEnd = addDays(new Date(probe.getFullYear(), probe.getMonth() + 1, 0), 0);
    return monthEnd.getTime() >= minDate.getTime() && monthStart.getTime() <= today.getTime();
  };

  const renderCalendar = () => {
    if (!calendarEl) return;

    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

    const dayCells = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      dayCells.push('<span class="panorama-date-sheet__day is-outside" aria-hidden="true"></span>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = startOfDay(new Date(year, month, day));
      const value = formatDate(date);
      const selectable = isSelectableDate(date);
      const isSelected = date.getTime() === selectedDate.getTime();
      const isToday = date.getTime() === today.getTime();
      const classes = [
        'panorama-date-sheet__day',
        isSelected ? 'is-selected' : '',
        isToday ? 'is-today' : '',
        !selectable ? 'is-outside' : '',
      ]
        .filter(Boolean)
        .join(' ');

      dayCells.push(
        `<button class="${classes}" type="button" data-date-value="${value}" aria-label="${value}">${day}</button>`,
      );
    }

    calendarEl.innerHTML = `
      <div class="panorama-date-sheet__month-nav">
        <button class="panorama-date-sheet__month-btn" type="button" data-calendar-nav="-1" aria-label="上一月" ${canNavigateMonth(-1) ? '' : 'disabled'}>
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <span class="panorama-date-sheet__month-label">${monthLabel(calendarViewMonth)}</span>
        <button class="panorama-date-sheet__month-btn" type="button" data-calendar-nav="1" aria-label="下一月" ${canNavigateMonth(1) ? '' : 'disabled'}>
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
      <div class="panorama-date-sheet__weekdays" aria-hidden="true">
        ${weekdays.map((label) => `<span class="panorama-date-sheet__weekday">${label}</span>`).join('')}
      </div>
      <div class="panorama-date-sheet__days">${dayCells.join('')}</div>
    `;
  };

  prevBtn.addEventListener('click', () => {
    if (prevBtn.classList.contains('is-disabled')) {
      showToast('仅支持查询近30日数据');
      return;
    }
    shiftDate(-1);
  });
  nextBtn.addEventListener('click', () => {
    if (nextBtn.classList.contains('is-disabled')) {
      showToast('不可选择未来日期');
      return;
    }
    shiftDate(1);
  });
  dateTrigger.addEventListener('click', () => setPickerOpen(true));
  pickerClose?.addEventListener('click', () => setPickerOpen(false));

  pickerOverlay?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains('picker-backdrop')) {
      setPickerOpen(false);
      return;
    }

    const monthNav = target.closest('[data-calendar-nav]');
    if (monthNav instanceof HTMLElement) {
      const direction = Number(monthNav.dataset.calendarNav);
      if (!Number.isNaN(direction) && canNavigateMonth(direction)) {
        calendarViewMonth = new Date(calendarViewMonth.getFullYear(), calendarViewMonth.getMonth() + direction, 1);
        renderCalendar();
      }
      return;
    }

    const dayBtn = target.closest('[data-date-value]');
    if (dayBtn instanceof HTMLElement) {
      const value = dayBtn.dataset.dateValue;
      if (!value) return;
      const date = parseDate(value);
      if (!isSelectableDate(date)) {
        if (isFutureDate(date)) showToast('不可选择未来日期');
        else showToast('仅支持查询近30日数据');
        return;
      }
      setPickerOpen(false);
      applyDate(date);
    }
  });

  document.querySelectorAll('[data-panorama-tab]').forEach((tab) => {
    tab.addEventListener('click', () => syncVisibility());
  });

  const expandObserver = expandOverlay ? new MutationObserver(syncVisibility) : null;
  expandObserver?.observe(expandOverlay, { attributes: true, attributeFilter: ['class'] });

  syncNavState();
  syncVisibility();

  window.PanoramaDatePicker = {
    getDate: () => formatDate(selectedDate),
    setDate: (value, options) => applyDate(parseDate(value), options),
    syncVisibility,
    showToast,
  };
})();
