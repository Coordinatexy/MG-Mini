/**
 * 经营分析报告 — 图表与月份切换
 */
(function () {
  const COLORS = {
    pv: '#2B6AFF',
    charge: '#00B5FF',
    storage: '#9AD66A',
    barGreen: '#52C41A',
    barBlue: '#1890FF',
    barPurple: '#B066FF',
    barIndigo: '#5C4CE5',
    lineBlue: '#2B6AFF',
    lineGreen: '#90EE90',
    lineCyan: '#4FC3F7',
    lineOrange: '#FA8C16',
    axis: '#98A2B3',
    split: '#EEF1F6',
  };

  const charts = [];
  let currentYear = 2026;
  let currentMonth = 6;

  const monthTrigger = document.getElementById('reportMonthTrigger');
  const monthLabel = document.getElementById('reportMonthLabel');
  const periodLabel = document.getElementById('reportPeriodLabel');
  const siteNameEl = document.getElementById('reportSiteName');
  const companyNameEl = document.getElementById('reportCompanyName');
  const picker = document.getElementById('reportMonthPicker');
  const pickerClose = document.getElementById('reportMonthPickerClose');
  const yearList = document.getElementById('reportYearList');
  const monthList = document.getElementById('reportMonthList');
  const monthConfirm = document.getElementById('reportMonthConfirm');
  const backdrop = picker?.querySelector('.picker-backdrop');

  const loadSiteContext = () => {
    let enterprise = '天合富家';
    let site = '天合富家1#站点';

    try {
      const saved = sessionStorage.getItem('mg-mini-site-context');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.targetPage || parsed.targetPage === 'function-report') {
          if (parsed.enterprise) enterprise = parsed.enterprise;
          if (parsed.site) site = parsed.site;
        }
        sessionStorage.removeItem('mg-mini-site-context');
      }
    } catch {
      sessionStorage.removeItem('mg-mini-site-context');
    }

    if (siteNameEl) siteNameEl.textContent = site;
    if (companyNameEl) companyNameEl.textContent = enterprise;

    return { enterprise, site };
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

  const formatMonthLabel = (year, month) => `${year}年${pad2(month)}月`;

  const formatPeriod = (year, month) => {
    const last = daysInMonth(year, month);
    return `${year}-${pad2(month)}-01～${year}-${pad2(month)}-${pad2(last)}`;
  };

  const pseudo = (seed) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };

  const dayLabels = (year, month) => {
    const n = daysInMonth(year, month);
    return Array.from({ length: n }, (_, i) => String(i + 1));
  };

  const buildDailySeries = (year, month) => {
    const n = daysInMonth(year, month);
    const rnd = pseudo(year * 100 + month * 17);
    const pvGen = [];
    const pvRev = [];
    const stCharge = [];
    const stDischarge = [];
    const stRev = [];
    const selfUse = [];
    const load = [];
    const grid = [];
    const costOrigin = [];
    const costSaved = [];

    for (let d = 1; d <= n; d += 1) {
      const weather = 0.55 + rnd() * 0.45;
      const weekendDip = d % 7 === 0 || d % 7 === 6 ? 0.92 : 1;
      const gen = Math.round((42000 + rnd() * 48000) * weather * weekendDip);
      const rev = Math.round(gen * (0.48 + rnd() * 0.08));
      const charge = Math.round((18000 + rnd() * 28000) * weather);
      const discharge = Math.round(charge * (0.82 + rnd() * 0.12));
      const sRev = Math.round(discharge * (0.42 + rnd() * 0.1));
      const self = gen;
      const loadVal = Math.round(420000 + rnd() * 40000);
      const gridVal = Math.round(loadVal - gen * 0.35 - discharge * 0.2);

      pvGen.push(gen);
      pvRev.push(rev);
      stCharge.push(charge);
      stDischarge.push(discharge);
      stRev.push(sRev);
      selfUse.push(self);
      load.push(loadVal);
      grid.push(Math.max(gridVal, 280000));
      costOrigin.push(Number((0.55 + rnd() * 0.05).toFixed(2)));
      costSaved.push(Number((0.45 + rnd() * 0.08).toFixed(2)));
    }

    // 贴近参考图：月初峰值、第 3 日低谷
    if (n >= 3) {
      pvGen[0] = 88000;
      pvRev[0] = 46000;
      pvGen[2] = 8000;
      pvRev[2] = 4200;
      stCharge[0] = 50000;
      stDischarge[0] = 46000;
      stRev[0] = 24000;
      stCharge[2] = 1200;
      stDischarge[2] = 800;
      stRev[2] = 400;
    }

    return {
      labels: dayLabels(year, month),
      pvGen,
      pvRev,
      stCharge,
      stDischarge,
      stRev,
      selfUse,
      load,
      grid,
      costOrigin,
      costSaved,
      zeros: Array(n).fill(0),
    };
  };

  const baseAxis = {
    axisLine: { lineStyle: { color: COLORS.split } },
    axisTick: { show: false },
    axisLabel: { color: COLORS.axis, fontSize: 10 },
    splitLine: { lineStyle: { color: COLORS.split, type: 'dashed' } },
  };

  const tooltip = {
    trigger: 'axis',
    confine: true,
    backgroundColor: 'rgba(50, 50, 50, 0.9)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontSize: 12 },
  };

  const legendStyle = {
    bottom: 0,
    left: 'center',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#5A6578', fontSize: 11 },
  };

  const dataZoom = [
    {
      type: 'inside',
      xAxisIndex: 0,
      start: 0,
      end: 50,
      zoomOnMouseWheel: false,
      moveOnMouseMove: true,
      moveOnMouseWheel: false,
    },
  ];

  const initChart = (el) => {
    if (!el || typeof echarts === 'undefined') return null;
    const chart = echarts.init(el, null, { renderer: 'canvas' });
    charts.push(chart);
    return chart;
  };

  const renderDonut = () => {
    const el = document.getElementById('reportDonutChart');
    const chart = initChart(el);
    if (!chart) return;
    chart.setOption({
      series: [
        {
          type: 'pie',
          radius: ['62%', '82%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'center',
            formatter: '{a|137.38}\n{b|总收益 (万元)}',
            rich: {
              a: { fontSize: 22, fontWeight: 700, color: '#1F2430', lineHeight: 28 },
              b: { fontSize: 11, color: '#8B95A7', lineHeight: 18 },
            },
          },
          labelLine: { show: false },
          data: [
            { value: 86.1, name: '光伏收益', itemStyle: { color: COLORS.pv } },
            { value: 51.28, name: '储能收益', itemStyle: { color: COLORS.storage } },
            { value: 0.001, name: '充电收益', itemStyle: { color: COLORS.charge } },
          ],
          emphasis: { scale: false },
        },
      ],
    });
  };

  const renderPvChart = (data) => {
    const chart = initChart(document.getElementById('reportPvChart'));
    if (!chart) return;
    chart.setOption({
      color: [COLORS.barGreen, COLORS.lineBlue],
      tooltip,
      legend: {
        ...legendStyle,
        data: [
          { name: '光伏发电量', icon: 'roundRect' },
          { name: '光伏收益', icon: 'path://M0 5 H20 M10 0 A5 5 0 1 1 10 10 A5 5 0 1 1 10 0 Z' },
        ],
      },
      grid: { top: 28, left: 8, right: 8, bottom: 36, containLabel: true },
      dataZoom,
      xAxis: {
        type: 'category',
        data: data.labels,
        ...baseAxis,
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          nameTextStyle: { color: COLORS.axis, fontSize: 10, padding: [0, 0, 0, 0] },
          ...baseAxis,
        },
        {
          type: 'value',
          name: '元',
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '光伏发电量',
          type: 'bar',
          barMaxWidth: 10,
          itemStyle: { color: COLORS.barGreen, borderRadius: [2, 2, 0, 0] },
          data: data.pvGen,
        },
        {
          name: '光伏收益',
          type: 'line',
          yAxisIndex: 1,
          smooth: false,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: COLORS.lineBlue, borderColor: '#fff', borderWidth: 1 },
          lineStyle: { width: 2, color: COLORS.lineBlue },
          data: data.pvRev,
        },
      ],
    });
  };

  const renderStorageChart = (data) => {
    const chart = initChart(document.getElementById('reportStorageChart'));
    if (!chart) return;
    chart.setOption({
      color: [COLORS.barPurple, COLORS.barIndigo, COLORS.lineGreen],
      tooltip,
      legend: {
        ...legendStyle,
        data: [
          { name: '储能充电量', icon: 'roundRect' },
          { name: '储能放电量', icon: 'roundRect' },
          { name: '储能收益', icon: 'path://M0 5 H20 M10 0 A5 5 0 1 1 10 10 A5 5 0 1 1 10 0 Z' },
        ],
      },
      grid: { top: 28, left: 8, right: 8, bottom: 36, containLabel: true },
      dataZoom,
      xAxis: {
        type: 'category',
        data: data.labels,
        ...baseAxis,
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
        },
        {
          type: 'value',
          name: '元',
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '储能充电量',
          type: 'bar',
          barGap: '10%',
          barMaxWidth: 8,
          itemStyle: { color: COLORS.barPurple },
          data: data.stCharge,
        },
        {
          name: '储能放电量',
          type: 'bar',
          barMaxWidth: 8,
          itemStyle: { color: COLORS.barIndigo },
          data: data.stDischarge,
        },
        {
          name: '储能收益',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: COLORS.lineGreen, borderColor: '#fff', borderWidth: 1 },
          lineStyle: { width: 2, color: COLORS.lineGreen },
          data: data.stRev,
        },
      ],
    });
  };

  const renderChargeChart = (data) => {
    const chart = initChart(document.getElementById('reportChargeChart'));
    if (!chart) return;
    chart.setOption({
      color: [COLORS.barGreen, COLORS.lineBlue],
      tooltip,
      legend: {
        ...legendStyle,
        data: [
          { name: '充电桩充电量', icon: 'roundRect' },
          { name: '充电桩收益', icon: 'path://M0 5 H20 M10 0 A5 5 0 1 1 10 10 A5 5 0 1 1 10 0 Z' },
        ],
      },
      grid: { top: 28, left: 8, right: 8, bottom: 36, containLabel: true },
      dataZoom,
      xAxis: {
        type: 'category',
        data: data.labels,
        ...baseAxis,
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          min: 0,
          max: 10,
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
        },
        {
          type: 'value',
          name: '元',
          min: 0,
          max: 10,
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '充电桩充电量',
          type: 'bar',
          barMaxWidth: 10,
          itemStyle: { color: COLORS.barGreen },
          data: data.zeros,
        },
        {
          name: '充电桩收益',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: COLORS.lineBlue, borderColor: '#fff', borderWidth: 1 },
          lineStyle: { width: 2, color: COLORS.lineBlue },
          data: data.zeros,
        },
      ],
    });
  };

  const renderConsumeChart = (data) => {
    const chart = initChart(document.getElementById('reportConsumeChart'));
    if (!chart) return;
    chart.setOption({
      color: [COLORS.barBlue, COLORS.barGreen, '#40A9FF'],
      tooltip,
      legend: {
        ...legendStyle,
        data: [
          { name: '自发自用电量', icon: 'roundRect' },
          { name: '发电量', icon: 'roundRect' },
          { name: '消纳率', icon: 'path://M0 5 H20 M10 0 A5 5 0 1 1 10 10 A5 5 0 1 1 10 0 Z' },
        ],
      },
      grid: { top: 28, left: 8, right: 8, bottom: 36, containLabel: true },
      dataZoom,
      xAxis: {
        type: 'category',
        data: data.labels,
        ...baseAxis,
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
        },
        {
          type: 'value',
          name: '%',
          min: 0,
          max: 100,
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '自发自用电量',
          type: 'bar',
          barGap: '10%',
          barMaxWidth: 8,
          itemStyle: { color: COLORS.barBlue },
          data: data.selfUse,
        },
        {
          name: '发电量',
          type: 'bar',
          barMaxWidth: 8,
          itemStyle: { color: COLORS.barGreen },
          data: data.pvGen,
        },
        {
          name: '消纳率',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#40A9FF', borderColor: '#fff', borderWidth: 1 },
          lineStyle: { width: 2, color: '#40A9FF' },
          data: data.labels.map(() => 100),
        },
      ],
    });
  };

  const renderLcoeChart = (data) => {
    const chart = initChart(document.getElementById('reportLcoeChart'));
    if (!chart) return;
    chart.setOption({
      color: [COLORS.barBlue, COLORS.barGreen, COLORS.lineCyan, COLORS.lineOrange],
      tooltip,
      legend: {
        ...legendStyle,
        itemGap: 8,
        data: [
          { name: '负载总用电量', icon: 'roundRect' },
          { name: '电网用电量', icon: 'roundRect' },
          { name: '原始度电成本', icon: 'path://M0 5 H20 M10 0 A5 5 0 1 1 10 10 A5 5 0 1 1 10 0 Z' },
          { name: '节约后度电成本', icon: 'path://M0 5 H20 M10 0 A5 5 0 1 1 10 10 A5 5 0 1 1 10 0 Z' },
        ],
      },
      grid: { top: 28, left: 8, right: 8, bottom: 48, containLabel: true },
      dataZoom,
      xAxis: {
        type: 'category',
        data: data.labels,
        ...baseAxis,
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
        },
        {
          type: 'value',
          name: '元/kWh',
          min: 0,
          max: 0.75,
          nameTextStyle: { color: COLORS.axis, fontSize: 10 },
          ...baseAxis,
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '负载总用电量',
          type: 'bar',
          barGap: '10%',
          barMaxWidth: 8,
          itemStyle: { color: COLORS.barBlue },
          data: data.load,
        },
        {
          name: '电网用电量',
          type: 'bar',
          barMaxWidth: 8,
          itemStyle: { color: COLORS.barGreen },
          data: data.grid,
        },
        {
          name: '原始度电成本',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: COLORS.lineCyan, borderColor: '#fff', borderWidth: 1 },
          lineStyle: { width: 2, color: COLORS.lineCyan },
          data: data.costOrigin,
        },
        {
          name: '节约后度电成本',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: COLORS.lineOrange, borderColor: '#fff', borderWidth: 1 },
          lineStyle: { width: 2, color: COLORS.lineOrange },
          data: data.costSaved,
        },
      ],
    });
  };

  const disposeCharts = () => {
    while (charts.length) {
      const chart = charts.pop();
      chart.dispose();
    }
  };

  const renderAllCharts = () => {
    disposeCharts();
    const data = buildDailySeries(currentYear, currentMonth);
    renderDonut();
    renderPvChart(data);
    renderStorageChart(data);
    renderChargeChart(data);
    renderConsumeChart(data);
    renderLcoeChart(data);
  };

  const syncLabels = () => {
    if (monthLabel) monthLabel.textContent = formatMonthLabel(currentYear, currentMonth);
    if (periodLabel) periodLabel.textContent = formatPeriod(currentYear, currentMonth);
  };

  let draftYear = currentYear;
  let draftMonth = currentMonth;

  const setPickerOpen = (open) => {
    if (!picker || !monthTrigger) return;
    picker.classList.toggle('is-open', open);
    picker.setAttribute('aria-hidden', open ? 'false' : 'true');
    monthTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const renderPickerLists = () => {
    if (!yearList || !monthList) return;
    const years = [2024, 2025, 2026];
    yearList.innerHTML = years
      .map(
        (y) =>
          `<button class="report-month-option${y === draftYear ? ' is-active' : ''}" type="button" data-year="${y}" role="option" aria-selected="${y === draftYear}">${y}年</button>`
      )
      .join('');
    monthList.innerHTML = Array.from({ length: 12 }, (_, i) => i + 1)
      .map(
        (m) =>
          `<button class="report-month-option${m === draftMonth ? ' is-active' : ''}" type="button" data-month="${m}" role="option" aria-selected="${m === draftMonth}">${pad2(m)}月</button>`
      )
      .join('');
  };

  const bindPicker = () => {
    monthTrigger?.addEventListener('click', () => {
      draftYear = currentYear;
      draftMonth = currentMonth;
      renderPickerLists();
      setPickerOpen(true);
    });
    pickerClose?.addEventListener('click', () => setPickerOpen(false));
    backdrop?.addEventListener('click', () => setPickerOpen(false));
    yearList?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-year]');
      if (!btn) return;
      draftYear = Number(btn.dataset.year);
      renderPickerLists();
    });
    monthList?.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-month]');
      if (!btn) return;
      draftMonth = Number(btn.dataset.month);
      renderPickerLists();
    });
    monthConfirm?.addEventListener('click', () => {
      currentYear = draftYear;
      currentMonth = draftMonth;
      syncLabels();
      renderAllCharts();
      setPickerOpen(false);
    });
  };

  const resizeCharts = () => {
    charts.forEach((chart) => chart.resize());
  };

  bindPicker();
  loadSiteContext();
  syncLabels();
  renderAllCharts();
  window.addEventListener('resize', resizeCharts);
})();
