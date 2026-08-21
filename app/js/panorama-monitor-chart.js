/**
 * 能量全景 · 监控视图 — 多指标时序图表（ECharts）
 */
(function () {
  const HOURS = 24;
  const INTERVAL_MIN = 1;
  const POINTS = (HOURS * 60) / INTERVAL_MIN;
  const DEFAULT_VIEW_HOURS = 3;
  const DEFAULT_ZOOM_START = 100 - (DEFAULT_VIEW_HOURS / HOURS) * 100;
  const DEFAULT_ZOOM_END = 100;
  const AXIS_LABEL_STEP_MIN = 30;

  const COLORS = {
    soc: '#4c75f2',
    grid: '#33c46a',
    storage: '#9b59f5',
    pv: '#f5a623',
    load: '#e74c5c',
    threshold: '#333',
  };

  const THRESHOLD_VALUES = {
    overLimit: 490,
    reverseFlow: 10,
  };

  const THRESHOLD_META = [
    { key: 'overLimit', name: '超限阈值', value: THRESHOLD_VALUES.overLimit, unit: 'kW' },
    { key: 'reverseFlow', name: '逆流阈值', value: THRESHOLD_VALUES.reverseFlow, unit: 'kW' },
  ];

  const THRESHOLD_KEYS = new Set(THRESHOLD_META.map((item) => item.key));

  const PANORAMA_LAYOUT_TRANSITION_MS = 400;

  const lerp = (a, b, t) => a + (b - a) * t;

  const pseudo = (seed) => {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  };

  const formatTime = (index) => {
    const totalMin = index * INTERVAL_MIN;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const buildSoc = (hour, minute) => {
    const t = hour + minute / 60;
    if (t < 7) return 85;
    if (t < 11.5) return lerp(85, 40, (t - 7) / 4.5);
    if (t < 14) return lerp(40, 100, (t - 11.5) / 2.5);
    if (t < 18) return lerp(100, 72, (t - 14) / 4);
    return lerp(72, 88, (t - 18) / 6);
  };

  const buildPv = (hour) => {
    if (hour < 6 || hour > 19) return 0;
    const peak = Math.sin(((hour - 6) / 13) * Math.PI);
    return Math.max(0, peak * 920 + (pseudo(hour * 17)() - 0.5) * 40);
  };

  const buildLoad = (hour, rnd) => 420 + Math.sin((hour / 24) * Math.PI * 2) * 80 + rnd() * 120;

  const buildStorage = (hour, soc, load, pv, rnd) => {
    if (hour >= 7 && hour < 11.5) return 180 + rnd() * 80;
    if (hour >= 11.5 && hour < 14) return -(220 + rnd() * 60);
    if (hour >= 17 && hour < 21) return 140 + rnd() * 50;
    if (soc > 90) return -(30 + rnd() * 40);
    return (rnd() - 0.5) * 60;
  };

  const buildGrid = (load, storage, pv, rnd) => load - pv - storage + (rnd() - 0.5) * 30;

  const generateDataset = (dateSeed = '') => {
    const seedBase = dateSeed.split('-').reduce((sum, part) => sum + Number(part), 0);
    const times = [];
    const soc = [];
    const grid = [];
    const storage = [];
    const pv = [];
    const load = [];

    for (let i = 0; i <= POINTS; i += 1) {
      const hour = (i * INTERVAL_MIN) / 60;
      const minute = (i * INTERVAL_MIN) % 60;
      const rnd = pseudo(i * 13 + 7 + seedBase * 3);
      const h = Math.floor(hour);
      const socVal = buildSoc(h, minute) + ((seedBase % 7) - 3);
      const pvVal = buildPv(hour) * (0.92 + (seedBase % 5) * 0.02);
      const loadVal = buildLoad(hour, rnd) + (seedBase % 11) * 3;
      const storageVal = buildStorage(hour, socVal, loadVal, pvVal, rnd);
      const gridVal = buildGrid(loadVal, storageVal, pvVal, rnd);

      times.push(formatTime(i));
      soc.push(Number(Math.max(0, Math.min(100, socVal)).toFixed(1)));
      grid.push(Number(gridVal.toFixed(1)));
      storage.push(Number(storageVal.toFixed(1)));
      pv.push(Number(Math.max(0, pvVal).toFixed(1)));
      load.push(Number(loadVal.toFixed(1)));
    }

    return { times, soc, grid, storage, pv, load };
  };

  let currentDate = '';
  let DATA = generateDataset();

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getTodayDateString = () => formatDateKey(new Date());

  const isHistoricalDate = () => Boolean(currentDate) && currentDate !== getTodayDateString();

  const getDefaultDataZoom = () => {
    if (isHistoricalDate()) {
      return { start: 0, end: 100 };
    }
    return { start: DEFAULT_ZOOM_START, end: DEFAULT_ZOOM_END };
  };

  const SERIES_META = [
    { key: 'soc', name: '储能SOC', group: 'core', color: COLORS.soc, unit: '%', yAxis: 1 },
    { key: 'grid', name: '电网功率', group: 'core', color: COLORS.grid, unit: 'kW', yAxis: 0 },
    { key: 'storage', name: '储能功率', group: 'ref', color: COLORS.storage, unit: 'kW', yAxis: 0 },
    { key: 'pv', name: '光伏发电功率', group: 'ref', color: COLORS.pv, unit: 'kW', yAxis: 0 },
    { key: 'load', name: '总负荷功率', group: 'ref', color: COLORS.load, unit: 'kW', yAxis: 0 },
  ];

  const chartInstances = new Map();
  const chartWrapObservers = new Map();
  let activeLegendKeys = new Set([
    ...SERIES_META.map((s) => s.key),
    ...THRESHOLD_META.map((item) => item.key),
  ]);

  const getActiveMetricCount = () => SERIES_META.filter((item) => activeLegendKeys.has(item.key)).length;

  const syncLegendItemState = (key, isActive) => {
    document.querySelectorAll(`[data-legend-key="${key}"]`).forEach((item) => {
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  };

  const getCurrentDataZoom = (chart) => {
    const option = chart.getOption();
    const insideZoom = option?.dataZoom?.find((item) => item.type === 'inside');
    if (!insideZoom || insideZoom.start == null || insideZoom.end == null) return null;
    return { start: insideZoom.start, end: insideZoom.end };
  };

  const applyChartUpdate = (chart, { preserveZoom = true } = {}) => {
    const currentZoom = preserveZoom ? getCurrentDataZoom(chart) : null;
    const nextOption = getChartOption();
    const defaultZoom = getDefaultDataZoom();
    const nextZoom = currentZoom ?? defaultZoom;
    nextOption.dataZoom.forEach((item) => {
      item.start = nextZoom.start;
      item.end = nextZoom.end;
    });
    chart.setOption(nextOption, true);
    chart.resize();
  };

  const isMobileLayout = () => window.matchMedia('(max-width: 768px)').matches;
  const isExpanded = () => document.querySelector('.microgrid-panorama-body.is-expanded-host') !== null;

  const getChartOption = () => {
    const expanded = isExpanded();
    const compact = !expanded;
    const mobile = isMobileLayout() && compact;

    const series = [];

    ['grid', 'storage', 'pv', 'load', 'soc'].forEach((key) => {
      if (!activeLegendKeys.has(key)) return;
      const meta = SERIES_META.find((s) => s.key === key);
      series.push({
        name: meta.name,
        type: 'line',
        yAxisIndex: meta.yAxis,
        data: DATA[key],
        symbol: 'none',
        lineStyle: { width: mobile ? 1.8 : key === 'load' ? 1.2 : 1.6, color: meta.color },
        itemStyle: { color: meta.color },
        z: key === 'soc' ? 5 : 3,
        smooth: mobile ? 0.15 : false,
      });
    });

    const showThresholdLabel = expanded || !mobile;

    if (activeLegendKeys.has('overLimit')) {
      series.push({
        name: '超限阈值',
        type: 'line',
        yAxisIndex: 0,
        data: DATA.times.map(() => THRESHOLD_VALUES.overLimit),
        symbol: 'none',
        lineStyle: { type: 'dashed', color: COLORS.threshold, width: 1 },
        markPoint: showThresholdLabel
          ? {
              symbol: 'none',
              data: [{ coord: [DATA.times.length - 1, THRESHOLD_VALUES.overLimit], value: `超限阈值：${THRESHOLD_VALUES.overLimit}kW` }],
              label: { show: true, position: 'left', color: '#888', fontSize: 10 },
            }
          : undefined,
        z: 2,
      });
    }

    if (activeLegendKeys.has('reverseFlow')) {
      series.push({
        name: '逆流阈值',
        type: 'line',
        yAxisIndex: 0,
        data: DATA.times.map(() => THRESHOLD_VALUES.reverseFlow),
        symbol: 'none',
        lineStyle: { type: 'dashed', color: COLORS.threshold, width: 1 },
        markPoint: showThresholdLabel
          ? {
              symbol: 'none',
              data: [{ coord: [DATA.times.length - 1, THRESHOLD_VALUES.reverseFlow], value: `逆流阈值：${THRESHOLD_VALUES.reverseFlow}kW` }],
              label: { show: true, position: 'left', color: '#888', fontSize: 10 },
            }
          : undefined,
        z: 2,
      });
    }

    const defaultZoom = getDefaultDataZoom();

    return {
      animation: false,
      grid: {
        top: compact ? 6 : mobile ? 8 : 12,
        left: compact ? 2 : mobile ? 4 : 8,
        right: compact ? 2 : mobile ? 4 : 12,
        bottom: compact ? 52 : mobile ? 52 : 58,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderColor: '#e8ecf4',
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: '#333', fontSize: mobile ? 11 : 12 },
        formatter(params) {
          if (!params?.length) return '';
          const time = params[0].axisValue;
          const rows = [`<strong style="font-size:12px">${time}</strong>`];
          const thresholdRowStyle =
            'display:inline-flex;align-items:center;gap:4px;margin-top:4px;color:#666';
          const metricRowStyle = 'display:inline-flex;align-items:center;gap:4px;margin-top:4px';

          params.forEach((p) => {
            const thresholdMeta = THRESHOLD_META.find((s) => s.name === p.seriesName);
            if (thresholdMeta) {
              const val = typeof p.value === 'number' ? p.value.toFixed(1) : p.value;
              rows.push(
                `<span style="${thresholdRowStyle}">` +
                  `<i style="display:inline-block;width:10px;height:0;border-top:2px dashed ${COLORS.threshold}"></i>` +
                  `${p.seriesName}：<b>${val}</b> ${thresholdMeta.unit}` +
                  `</span>`,
              );
              return;
            }
            const meta = SERIES_META.find((s) => s.name === p.seriesName);
            if (!meta) return;
            const unit = meta.unit;
            const val = typeof p.value === 'number' ? p.value.toFixed(1) : p.value;
            rows.push(
              `<span style="${metricRowStyle}">` +
                `<i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${meta.color}"></i>` +
                `${p.seriesName}：<b>${val}</b> ${unit}` +
                `</span>`,
            );
          });
          return rows.join('<br/>');
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: DATA.times,
        axisLine: { lineStyle: { color: '#d9dde8' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#80889a',
          fontSize: mobile ? 9 : 10,
          interval: (index) => index % AXIS_LABEL_STEP_MIN === 0,
        },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: mobile ? 'kW' : 'kW',
          nameTextStyle: { color: '#80889a', fontSize: 10, padding: [0, 0, 0, 0] },
          min: -600,
          max: 1200,
          interval: 300,
          axisLabel: {
            color: '#80889a',
            fontSize: mobile ? 9 : 10,
            formatter: (v) => (mobile ? `${v}` : `${v}`),
          },
          splitLine: { lineStyle: { color: '#eef1f7', type: 'dashed' } },
        },
        {
          type: 'value',
          name: mobile ? '' : '%',
          show: !mobile || expanded,
          min: 0,
          max: 100,
          interval: 50,
          position: 'right',
          offset: mobile ? 0 : 0,
          axisLabel: { color: '#80889a', fontSize: 9 },
          splitLine: { show: false },
          axisLine: { show: false },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: defaultZoom.start,
          end: defaultZoom.end,
          zoomOnMouseWheel: !mobile,
          moveOnMouseMove: true,
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          height: mobile ? 16 : 18,
          bottom: mobile ? 4 : 6,
          borderColor: 'transparent',
          backgroundColor: '#f0f3fa',
          fillerColor: 'rgba(76, 117, 242, 0.12)',
          handleStyle: { color: '#4c75f2', borderColor: '#4c75f2' },
          moveHandleStyle: { color: '#4c75f2' },
          dataBackground: { lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 } },
          selectedDataBackground: { lineStyle: { opacity: 0 }, areaStyle: { opacity: 0 } },
          textStyle: { color: '#80889a', fontSize: 9 },
          start: defaultZoom.start,
          end: defaultZoom.end,
        },
      ],
      series,
    };
  };

  const bindChartWrapObserver = (chartEl) => {
    if (chartWrapObservers.has(chartEl)) return;
    const wrap = chartEl.closest('.panorama-monitor__chart-wrap');
    if (!wrap || typeof ResizeObserver === 'undefined') return;

    let frameId = 0;
    const observer = new ResizeObserver(() => {
      const chart = chartInstances.get(chartEl);
      if (!chart) return;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => applyChartUpdate(chart));
    });
    observer.observe(wrap);
    chartWrapObservers.set(chartEl, observer);
  };

  const initChart = (root) => {
    if (!root || typeof echarts === 'undefined') return null;
    const chartEl = root.querySelector('[data-monitor-chart]');
    if (!chartEl) return null;

    let chart = chartInstances.get(chartEl);
    const isNewChart = !chart;
    if (isNewChart) {
      chart = echarts.init(chartEl, null, { renderer: 'canvas' });
      chartInstances.set(chartEl, chart);
      bindChartWrapObserver(chartEl);
    }

    applyChartUpdate(chart, { preserveZoom: !isNewChart });

    return chart;
  };

  const resizeCharts = () => {
    chartInstances.forEach((chart) => applyChartUpdate(chart));
  };

  const resizeAfterLayout = () => {
    requestAnimationFrame(() => {
      resizeCharts();
      requestAnimationFrame(resizeCharts);
    });
    clearTimeout(window.__panoramaChartLayoutTimer);
    window.__panoramaChartLayoutTimer = setTimeout(resizeCharts, PANORAMA_LAYOUT_TRANSITION_MS);
  };

  const bindLegend = (root) => {
    const legendRoot = root.querySelector('[data-monitor-legend]');
    if (!legendRoot || legendRoot.dataset.bound) return;
    legendRoot.dataset.bound = 'true';

    legendRoot.addEventListener('click', (event) => {
      const item = event.target.closest('[data-legend-key]');
      if (!item) return;
      const key = item.dataset.legendKey;
      const isThreshold = THRESHOLD_KEYS.has(key);

      if (isThreshold && !isExpanded()) return;

      if (activeLegendKeys.has(key)) {
        if (!isThreshold && getActiveMetricCount() <= 1) return;
        activeLegendKeys.delete(key);
        syncLegendItemState(key, false);
      } else {
        activeLegendKeys.add(key);
        syncLegendItemState(key, true);
      }
      initChart(root);
    });
  };

  const setupMonitorPanel = (root) => {
    if (!root) return;
    if (!root.dataset.monitorReady) {
      root.dataset.monitorReady = 'true';
      bindLegend(root);
    }
    initChart(root);
  };

  const observePanel = () => {
    const panel = document.querySelector('[data-panorama-panel="strategy"]');
    if (!panel) return;

    if (!panel.dataset.monitorReady) {
      panel.dataset.monitorReady = 'true';
      bindLegend(panel);
    }

    const observer = new MutationObserver(() => {
      if (!panel.hidden) {
        requestAnimationFrame(() => {
          initChart(panel);
          resizeAfterLayout();
        });
      }
    });
    observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });

    if (!panel.hidden) {
      initChart(panel);
    }
  };

  const setChartLoading = (isLoading) => {
    document.querySelectorAll('[data-monitor-loading]').forEach((el) => {
      el.hidden = !isLoading;
      el.setAttribute('aria-busy', String(isLoading));
    });
  };

  const refreshAllCharts = ({ preserveZoom = true } = {}) => {
    chartInstances.forEach((chart) => {
      applyChartUpdate(chart, { preserveZoom });
    });
  };

  const loadDate = (dateValue) => {
    currentDate = dateValue;
    DATA = generateDataset(dateValue);
    refreshAllCharts({ preserveZoom: false });
  };

  window.PanoramaMonitorChart = {
    init: setupMonitorPanel,
    resize: resizeCharts,
    resizeAfterLayout,
    refresh: refreshAllCharts,
    loadDate,
    setLoading: setChartLoading,
  };

  document.addEventListener('DOMContentLoaded', () => {
    observePanel();
    window.addEventListener('resize', () => {
      clearTimeout(window.__panoramaChartResizeTimer);
      window.__panoramaChartResizeTimer = setTimeout(resizeCharts, 120);
    });
  });
})();
