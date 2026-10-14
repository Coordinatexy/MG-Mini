const segmentTabs = document.querySelectorAll('.segment-tab');
const tabPanels = Array.from(document.querySelectorAll('[data-tab-panel]'));
const appShell = document.querySelector('.app-shell');
const tabPanelMap = new Map(tabPanels.map((panel) => [panel.dataset.tabPanel, panel]));

const messagePanels = Array.from(document.querySelectorAll('[data-message-panel]'));
const messageTabCountMap = new Map(
  Array.from(document.querySelectorAll('.segment-tab')).map((tab) => [tab.dataset.messageStatus, tab.querySelector('.segment-tab__count')]),
);
const messageEmptyStateId = 'messageEmptyState';

const messageData = [
  {
    id: 'unrecover-1',
    status: 'unrecovered',
    title: '逆变器通信中断',
    badge: '紧急',
    tone: 'urgent',
    alarmType: '离线告警',
    alarmLevel: '紧急',
    deviceName: '1#逆变器-08',
    deviceType: '光伏设备',
    deviceSn: 'PV-INV-00128',
    occurredAt: '2026-06-30 08:14',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'unrecover-2',
    status: 'unrecovered',
    title: '储能电池温度过高',
    badge: '重要',
    tone: 'important',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '2#储能柜',
    deviceType: '储能设备',
    deviceSn: 'ESS-BAT-05471',
    occurredAt: '2026-06-30 09:02',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'unrecover-3',
    status: 'unrecovered',
    title: '配电箱电压波动',
    badge: '普通',
    tone: 'normal',
    alarmType: '故障告警',
    alarmLevel: '普通',
    deviceName: '配电箱 A-03',
    deviceType: '配电设备',
    deviceSn: 'PD-BOX-2203',
    occurredAt: '2026-06-30 09:20',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'unrecover-4',
    status: 'unrecovered',
    title: 'PCS 模块异常',
    badge: '紧急',
    tone: 'urgent',
    alarmType: '故障告警',
    alarmLevel: '紧急',
    deviceName: '1#PCS 主机',
    deviceType: '储能设备',
    deviceSn: 'ESS-PCS-00912',
    occurredAt: '2026-06-30 10:05',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'recover-1',
    status: 'recovered',
    title: '充电桩离线',
    badge: '重要',
    tone: 'resolved',
    alarmType: '离线告警',
    alarmLevel: '重要',
    deviceName: '3#直流充电桩',
    deviceType: '充电设备',
    deviceSn: 'EV-CHG-00813',
    occurredAt: '2026-06-30 11:12',
    recoveredAt: '2026-06-30 11:16',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'recover-2',
    status: 'recovered',
    title: '光伏组串通信恢复',
    badge: '普通',
    tone: 'resolved',
    alarmType: '离线告警',
    alarmLevel: '普通',
    deviceName: '组串监测器 5',
    deviceType: '光伏设备',
    deviceSn: 'PV-MON-00671',
    occurredAt: '2026-06-30 12:24',
    recoveredAt: '2026-06-30 12:31',
    enterpriseName: '天合富家',
    siteName: '天合富家3#站点',
  },
  {
    id: 'unrecover-5',
    status: 'unrecovered',
    title: '直流充电桩过温保护',
    badge: '重要',
    tone: 'important',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '1#直流充电桩',
    deviceType: '充电设备',
    deviceSn: 'EV-CHG-00201',
    occurredAt: '2026-06-30 07:48',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'unrecover-6',
    status: 'unrecovered',
    title: '组串逆变器离线',
    badge: '紧急',
    tone: 'urgent',
    alarmType: '离线告警',
    alarmLevel: '紧急',
    deviceName: '3#组串逆变器',
    deviceType: '光伏设备',
    deviceSn: 'PV-INV-00356',
    occurredAt: '2026-06-30 08:02',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'unrecover-7',
    status: 'unrecovered',
    title: 'BMS 通信超时',
    badge: '普通',
    tone: 'normal',
    alarmType: '离线告警',
    alarmLevel: '普通',
    deviceName: '1#储能 BMS',
    deviceType: '储能设备',
    deviceSn: 'ESS-BMS-01002',
    occurredAt: '2026-06-30 08:35',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'unrecover-8',
    status: 'unrecovered',
    title: '环境监测仪数据异常',
    badge: '提示',
    tone: 'normal',
    alarmType: '故障告警',
    alarmLevel: '提示',
    deviceName: '环境传感器 A1',
    deviceType: '配套系统',
    deviceSn: 'ENV-SEN-0088',
    occurredAt: '2026-06-30 09:15',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'unrecover-9',
    status: 'unrecovered',
    title: '并网柜开关状态异常',
    badge: '紧急',
    tone: 'urgent',
    alarmType: '故障告警',
    alarmLevel: '紧急',
    deviceName: '并网柜 01',
    deviceType: '配电设备',
    deviceSn: 'PD-GRID-0001',
    occurredAt: '2026-06-30 10:22',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'unrecover-10',
    status: 'unrecovered',
    title: '光伏汇流箱绝缘偏低',
    badge: '重要',
    tone: 'important',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '汇流箱 B-12',
    deviceType: '光伏设备',
    deviceSn: 'PV-CBX-1208',
    occurredAt: '2026-06-30 11:05',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'unrecover-11',
    status: 'unrecovered',
    title: '储能 SOC 低于阈值',
    badge: '普通',
    tone: 'normal',
    alarmType: '故障告警',
    alarmLevel: '普通',
    deviceName: '2#储能柜',
    deviceType: '储能设备',
    deviceSn: 'ESS-BAT-05472',
    occurredAt: '2026-06-30 11:30',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'unrecover-12',
    status: 'unrecovered',
    title: '消防主机通信中断',
    badge: '紧急',
    tone: 'urgent',
    alarmType: '离线告警',
    alarmLevel: '紧急',
    deviceName: '消防主机',
    deviceType: '配套系统',
    deviceSn: 'FIRE-CTL-001',
    occurredAt: '2026-06-30 12:08',
    enterpriseName: '天合富家',
    siteName: '天合富家3#站点',
  },
  {
    id: 'unrecover-13',
    status: 'unrecovered',
    title: '交流充电桩枪头故障',
    badge: '重要',
    tone: 'important',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '2#交流充电桩',
    deviceType: '充电设备',
    deviceSn: 'EV-CHG-00456',
    occurredAt: '2026-06-30 13:18',
    enterpriseName: '天合富家',
    siteName: '天合富家3#站点',
  },
  {
    id: 'unrecover-14',
    status: 'unrecovered',
    title: '南区变压器温度偏高',
    badge: '重要',
    tone: 'important',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '南区变压器 T1',
    deviceType: '配电设备',
    deviceSn: 'PD-TRF-3301',
    occurredAt: '2026-06-30 14:02',
    enterpriseName: '天合富家',
    siteName: '天合富家南区站点',
  },
  {
    id: 'unrecover-15',
    status: 'unrecovered',
    title: '视频监控离线',
    badge: '提示',
    tone: 'normal',
    alarmType: '离线告警',
    alarmLevel: '提示',
    deviceName: '监控摄像头 C-07',
    deviceType: '配套系统',
    deviceSn: 'CAM-VID-0707',
    occurredAt: '2026-06-30 14:45',
    enterpriseName: '天合富家',
    siteName: '天合富家南区站点',
  },
  {
    id: 'recover-3',
    status: 'recovered',
    title: '储能 PCS 通信恢复',
    badge: '紧急',
    tone: 'resolved',
    alarmType: '离线告警',
    alarmLevel: '紧急',
    deviceName: '1#PCS 主机',
    deviceType: '储能设备',
    deviceSn: 'ESS-PCS-00911',
    occurredAt: '2026-06-29 16:20',
    recoveredAt: '2026-06-29 16:45',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'recover-4',
    status: 'recovered',
    title: '逆变器过压告警恢复',
    badge: '重要',
    tone: 'resolved',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '2#组串逆变器',
    deviceType: '光伏设备',
    deviceSn: 'PV-INV-00289',
    occurredAt: '2026-06-29 18:10',
    recoveredAt: '2026-06-29 18:32',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'recover-5',
    status: 'recovered',
    title: '配电箱漏电保护恢复',
    badge: '普通',
    tone: 'resolved',
    alarmType: '故障告警',
    alarmLevel: '普通',
    deviceName: '配电箱 A-01',
    deviceType: '配电设备',
    deviceSn: 'PD-BOX-2201',
    occurredAt: '2026-06-29 20:05',
    recoveredAt: '2026-06-29 20:18',
    enterpriseName: '天合富家',
    siteName: '天合富家1#站点',
  },
  {
    id: 'recover-6',
    status: 'recovered',
    title: '组串监测器离线恢复',
    badge: '普通',
    tone: 'resolved',
    alarmType: '离线告警',
    alarmLevel: '普通',
    deviceName: '组串监测器 3',
    deviceType: '光伏设备',
    deviceSn: 'PV-MON-00653',
    occurredAt: '2026-06-29 22:40',
    recoveredAt: '2026-06-29 22:55',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'recover-7',
    status: 'recovered',
    title: 'BMS 温度告警恢复',
    badge: '重要',
    tone: 'resolved',
    alarmType: '故障告警',
    alarmLevel: '重要',
    deviceName: '2#储能 BMS',
    deviceType: '储能设备',
    deviceSn: 'ESS-BMS-02001',
    occurredAt: '2026-06-30 06:15',
    recoveredAt: '2026-06-30 06:42',
    enterpriseName: '天合富家',
    siteName: '天合富家2#站点',
  },
  {
    id: 'recover-8',
    status: 'recovered',
    title: '消防烟感误报恢复',
    badge: '提示',
    tone: 'resolved',
    alarmType: '故障告警',
    alarmLevel: '提示',
    deviceName: '烟感探测器 S-02',
    deviceType: '配套系统',
    deviceSn: 'FIRE-SEN-0202',
    occurredAt: '2026-06-30 07:30',
    recoveredAt: '2026-06-30 07:35',
    enterpriseName: '天合富家',
    siteName: '天合富家3#站点',
  },
  {
    id: 'recover-9',
    status: 'recovered',
    title: '充电桩通信恢复',
    badge: '重要',
    tone: 'resolved',
    alarmType: '离线告警',
    alarmLevel: '重要',
    deviceName: '4#直流充电桩',
    deviceType: '充电设备',
    deviceSn: 'EV-CHG-00820',
    occurredAt: '2026-06-30 05:50',
    recoveredAt: '2026-06-30 06:08',
    enterpriseName: '天合富家',
    siteName: '天合富家南区站点',
  },
  {
    id: 'recover-10',
    status: 'recovered',
    title: '环境监测数据恢复',
    badge: '提示',
    tone: 'resolved',
    alarmType: '离线告警',
    alarmLevel: '提示',
    deviceName: '环境传感器 B2',
    deviceType: '配套系统',
    deviceSn: 'ENV-SEN-0099',
    occurredAt: '2026-06-29 23:10',
    recoveredAt: '2026-06-29 23:22',
    enterpriseName: '天合富家',
    siteName: '天合富家南区站点',
  },
];

const getCurrentMessageSiteContext = () => window.getMGSiteContext?.('message') ?? { enterprise: '', site: '' };

const DEFAULT_MESSAGE_FILTER_PRESET = { alarmLevel: ['紧急', '重要'] };

const createFilterState = () =>
  ({ alarmType: new Set(), alarmLevel: new Set(), deviceType: new Set() });

const createDefaultFilterState = () => {
  const state = createFilterState();
  DEFAULT_MESSAGE_FILTER_PRESET.alarmLevel.forEach((level) => state.alarmLevel.add(level));
  return state;
};

const messageSearchState = {
  applied: createDefaultFilterState(),
  pending: createDefaultFilterState(),
};

const filterTrigger = document.getElementById('messageFilterTrigger');
const filterCountBadge = document.getElementById('messageFilterCount');
const filterPicker = document.getElementById('messageFilterPicker');
const filterClose = document.getElementById('messageFilterPickerClose');
const filterReset = document.getElementById('messageFilterPickerReset');
const filterSubmit = document.getElementById('messageFilterPickerSubmit');
const filterGroups = document.getElementById('messageFilterGroups');

const getActiveTabStatus = () => document.querySelector('.segment-tab.active')?.dataset.messageStatus ?? 'unrecovered';

const getFilterConfig = () => [
  { title: '告警类型', key: 'alarmType', options: ['故障告警', '离线告警'] },
  { title: '告警级别', key: 'alarmLevel', options: ['紧急', '重要', '普通', '提示'] },
  { title: '设备类型', key: 'deviceType', options: ['光伏设备', '储能设备', '充电设备', '配电设备', '配套系统'] },
];

const cloneFilterState = (source) =>
  Object.entries(source).reduce((state, [key, value]) => {
    state[key] = new Set(value);
    return state;
  }, {});

const getFilterSelectionCount = (filterState) =>
  Object.values(filterState).reduce((total, selectedValues) => total + selectedValues.size, 0);

const renderCard = (item) => `
  <article class="alarm-card alarm-card--${item.tone}" data-message-card data-message-id="${item.id}" data-alarm-type="${item.alarmType}" data-alarm-level="${item.alarmLevel}" data-device-type="${item.deviceType}">
    <div class="alarm-card__header">
      <h2 class="alarm-card__title">${item.title}</h2>
      <span class="alarm-card__badge">${item.badge}</span>
    </div>
    <dl class="alarm-card__grid">
      <div><dt>告警类型</dt><dd>${item.alarmType}</dd></div>
      <div><dt>设备名称</dt><dd>${item.deviceName}</dd></div>
      <div><dt>设备类型</dt><dd>${item.deviceType}</dd></div>
      <div><dt>设备 SN</dt><dd>${item.deviceSn}</dd></div>
      <div><dt>发生时间</dt><dd>${item.occurredAt}</dd></div>
      ${item.recoveredAt ? `<div><dt>恢复时间</dt><dd>${item.recoveredAt}</dd></div>` : ''}
    </dl>
  </article>
`;

const matchesFilters = (item, filterState) =>
  Object.entries(filterState).every(([key, selectedValues]) => !selectedValues || selectedValues.size === 0 || selectedValues.has(item[key]));

const matchesSiteContext = (item) => {
  if (!filterGroups) return true;
  const { enterprise, site } = getCurrentMessageSiteContext();
  if (enterprise && item.enterpriseName !== enterprise) return false;
  if (site && item.siteName !== site) return false;
  return true;
};

const getVisibleMessages = (status, filterState) =>
  messageData.filter((item) => item.status === status && matchesSiteContext(item) && matchesFilters(item, filterState));

const renderEmptyState = (panel, status) => {
  panel.innerHTML = `
    <div class="message-empty" id="${messageEmptyStateId}">
      <div class="message-empty__icon" aria-hidden="true"><i class="fa-solid fa-bell-slash"></i></div>
      <h2>${status === 'recovered' ? '暂无已恢复消息' : '暂无未恢复消息'}</h2>
      <p>当前站点暂无相关告警记录</p>
    </div>
  `;
};

const syncTabCounts = () => {
  const countByStatus = messageData.reduce((result, item) => {
    if (matchesSiteContext(item) && matchesFilters(item, messageSearchState.applied)) result[item.status] += 1;
    return result;
  }, { unrecovered: 0, recovered: 0 });
  messageTabCountMap.forEach((countEl, status) => {
    if (status !== 'unrecovered' || !countEl) return;
    const count = countByStatus.unrecovered ?? 0;
    countEl.textContent = String(count);
    countEl.hidden = count === 0;
  });
};

const syncFilterButtons = () => {
  if (!filterGroups) return;
  filterGroups.querySelectorAll('.filter-option').forEach((button) => {
    const groupKey = button.dataset.filterOption;
    const value = button.dataset.filterValue;
    const isActive = Boolean(groupKey && value && messageSearchState.pending[groupKey]?.has(value));
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  if (filterTrigger) {
    const filterActive = getFilterSelectionCount(messageSearchState.applied) > 0;
    filterTrigger.classList.toggle('is-active', filterActive);
    filterTrigger.setAttribute(
      'aria-label',
      filterActive ? '打开筛选面板，筛选已激活' : '打开筛选面板',
    );
    if (filterCountBadge) {
      filterCountBadge.hidden = true;
      filterCountBadge.setAttribute('aria-hidden', 'true');
    }
  }
};

const syncPendingFromApplied = () => { messageSearchState.pending = cloneFilterState(messageSearchState.applied); };
const renderFilterGroups = () => {
  if (!filterGroups) return;
  filterGroups.innerHTML = getFilterConfig().map((group) => `
    <section class="filter-group" data-filter-group="${group.key}">
      <h3 class="filter-group__title">${group.title}</h3>
      <div class="filter-options">
        ${group.options.map((option) => `<button class="filter-option" type="button" data-filter-option="${group.key}" data-filter-value="${option}" aria-pressed="false">${option}</button>`).join('')}
      </div>
    </section>
  `).join('');
};

const resetFilters = () => {
  applyFilterPreset(DEFAULT_MESSAGE_FILTER_PRESET);
};

const applyFilterPreset = (preset = {}) => {
  messageSearchState.applied = createFilterState();
  messageSearchState.pending = createFilterState();
  Object.entries(preset).forEach(([key, values]) => {
    values.forEach((value) => {
      messageSearchState.applied[key]?.add(value);
      messageSearchState.pending[key]?.add(value);
    });
  });
  syncFilterButtons();
  syncTabCounts();
};

const parseInitialFiltersFromUrl = () => {
  if (!filterGroups) return;
  const params = new URLSearchParams(window.location.search);
  const alarmType = params.get('alarmType');
  const alarmLevels = params.get('alarmLevel');
  if (!alarmType && !alarmLevels) {
    applyFilterPreset(DEFAULT_MESSAGE_FILTER_PRESET);
    return;
  }

  const preset = {};
  if (alarmType) preset.alarmType = [alarmType];
  if (alarmLevels) preset.alarmLevel = alarmLevels.split(',').map((value) => value.trim()).filter(Boolean);
  applyFilterPreset(preset);
};

const applyPendingFilters = () => { messageSearchState.applied = cloneFilterState(messageSearchState.pending); syncTabCounts(); syncFilterButtons(); renderMessageList(); };

const renderMessageList = () => {
  const activeStatus = getActiveTabStatus();
  const visibleMessages = getVisibleMessages(activeStatus, messageSearchState.applied);
  messagePanels.forEach((panel) => {
    const isVisible = panel.dataset.messagePanel === activeStatus;
    panel.hidden = !isVisible;
    if (!isVisible) return;
    panel.innerHTML = visibleMessages.length ? visibleMessages.map(renderCard).join('') : '';
    if (visibleMessages.length === 0) renderEmptyState(panel, activeStatus);
  });
  syncTabCounts();
};

const setActiveTab = (button) => {
  segmentTabs.forEach((tab) => {
    const isActive = tab === button;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  const tabTarget = button.dataset.tabTarget ?? button.dataset.messageStatus;
  const isChargingTab = tabTarget === 'charging';

  appShell?.classList.toggle('is-charging-tab', isChargingTab);
  document.body.classList.toggle('is-charging-tab', isChargingTab);

  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== tabTarget;
  });

  const activePanel = tabPanelMap.get(tabTarget);
  if (activePanel) {
    activePanel.hidden = false;
  }

  renderMessageList();
};

segmentTabs.forEach((button) => button.addEventListener('click', () => setActiveTab(button)));
if (segmentTabs.length > 0) setActiveTab(document.querySelector('.segment-tab.active') || segmentTabs[0]);

const setFilterOpen = (isOpen, options = {}) => {
  if (!filterPicker || !filterTrigger) return;
  if (isOpen) {
    if (!options.keepPending) {
      syncPendingFromApplied();
      syncFilterButtons();
    }
  } else if (options.applyPending) {
    applyPendingFilters();
  } else {
    syncPendingFromApplied();
    syncFilterButtons();
  }
  filterPicker.classList.toggle('is-open', isOpen);
  filterPicker.setAttribute('aria-hidden', String(!isOpen));
  filterTrigger.setAttribute('aria-expanded', String(isOpen));
};

if (filterTrigger && filterPicker && filterGroups) {
  renderFilterGroups();
  syncPendingFromApplied();
  parseInitialFiltersFromUrl();
  syncFilterButtons();
  const toggleFilterValue = (groupKey, value) => {
    const groupState = messageSearchState.pending[groupKey];
    if (!groupState) return;
    groupState.has(value) ? groupState.delete(value) : groupState.add(value);
    syncFilterButtons();
  };
  filterTrigger.addEventListener('click', () => setFilterOpen(true));
  filterClose?.addEventListener('click', () => setFilterOpen(false));
  filterReset?.addEventListener('click', () => { messageSearchState.pending = createFilterState(); syncFilterButtons(); });
  filterSubmit?.addEventListener('click', () => setFilterOpen(false, { applyPending: true }));
  filterPicker.addEventListener('keydown', (event) => { if (event.key === 'Escape') setFilterOpen(false); });
  filterPicker.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const optionButton = target.closest('[data-filter-option][data-filter-value]');
    if (optionButton instanceof HTMLElement) {
      const groupKey = optionButton.dataset.filterOption;
      const value = optionButton.dataset.filterValue;
      if (groupKey && value) toggleFilterValue(groupKey, value);
      return;
    }
    if (target.classList.contains('picker-backdrop')) setFilterOpen(false);
  });
}

renderMessageList();

if (filterGroups) {
  const handleMessageSiteChange = () => {
    resetFilters();
    setFilterOpen(false);
    renderMessageList();
  };
  window.addEventListener('mg-mini:message-site-change', handleMessageSiteChange);
}

const panoramaTabs = document.querySelectorAll('[data-panorama-tab]');
const panoramaPanels = document.querySelectorAll('[data-panorama-panel]');
const panoramaBody = document.querySelector('[data-panorama-body]');
const panoramaExpandHost = document.querySelector('[data-panorama-expand-host]');
const panoramaFlowCard = document.querySelector('.microgrid-flow-card');
const panoramaExpandOverlay = document.getElementById('panoramaExpandOverlay');
const panoramaExpandTrigger = document.getElementById('panoramaExpandTrigger');
const panoramaExpandClose = document.getElementById('panoramaExpandClose');
const iosScreen = document.querySelector('.ios-screen');
const iosFrameWrapper = document.querySelector('.ios-frame-wrapper');
const panoramaExpandIcon = panoramaExpandTrigger?.querySelector('i');
const panoramaExpandState = { isOpen: false };

const PANORAMA_LANDSCAPE_MARGIN = 32;
const PANORAMA_LANDSCAPE_WIDTH = 852;
const PANORAMA_LANDSCAPE_HEIGHT = 393;

const syncPanoramaLandscapeScale = () => {
  if (!iosFrameWrapper || !iosScreen) return;
  if (!panoramaExpandState.isOpen) {
    iosFrameWrapper.style.removeProperty('--panorama-landscape-scale');
    return;
  }
  const wrapperStyle = getComputedStyle(iosFrameWrapper);
  const paddingX = parseFloat(wrapperStyle.paddingLeft) + parseFloat(wrapperStyle.paddingRight);
  const paddingY = parseFloat(wrapperStyle.paddingTop) + parseFloat(wrapperStyle.paddingBottom);
  const frameWidth = PANORAMA_LANDSCAPE_WIDTH + paddingX;
  const frameHeight = PANORAMA_LANDSCAPE_HEIGHT + paddingY;
  const scaleW = (window.innerWidth - PANORAMA_LANDSCAPE_MARGIN) / frameWidth;
  const scaleH = (window.innerHeight - PANORAMA_LANDSCAPE_MARGIN) / frameHeight;
  const scale = Math.min(scaleW, scaleH, 1);
  iosFrameWrapper.style.setProperty('--panorama-landscape-scale', String(scale));
};

const syncPanoramaExpandTrigger = () => {
  if (!panoramaExpandTrigger || !panoramaExpandIcon) return;
  panoramaExpandTrigger.setAttribute('aria-label', panoramaExpandState.isOpen ? '收起能量全景，恢复竖屏展示' : '放大能量全景，横屏展示');
  panoramaExpandIcon.className = panoramaExpandState.isOpen ? 'fa-solid fa-compress' : 'fa-solid fa-up-right-and-down-left-from-center';
};

const setActivePanoramaTab = (button) => {
  const target = button.dataset.panoramaTab;
  panoramaTabs.forEach((tab) => {
    const isActive = tab.dataset.panoramaTab === target;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
  panoramaPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panoramaPanel !== target;
  });
  if (target === 'strategy') {
    const strategyPanel = document.querySelector('[data-panorama-panel="strategy"]');
    window.PanoramaMonitorChart?.init(strategyPanel);
    window.PanoramaDatePicker?.syncVisibility?.();
    window.PanoramaMonitorChart?.resizeAfterLayout?.();
  } else {
    window.PanoramaDatePicker?.syncVisibility?.();
  }
};

panoramaTabs.forEach((button) => button.addEventListener('click', () => setActivePanoramaTab(button)));

const openPanoramaExpand = () => {
  if (!panoramaBody || !panoramaExpandHost || panoramaExpandState.isOpen) return;
  panoramaExpandHost.appendChild(panoramaBody);
  panoramaBody.classList.add('is-expanded-host');
  panoramaExpandOverlay?.classList.add('is-open');
  panoramaExpandOverlay?.setAttribute('aria-hidden', 'false');
  iosScreen?.classList.add('is-panorama-expanded');
  document.body.classList.add('is-panorama-expanded');
  panoramaExpandState.isOpen = true;
  syncPanoramaExpandTrigger();
  syncPanoramaLandscapeScale();
  window.PanoramaDatePicker?.syncVisibility?.();
  const activePanoramaTab = document.querySelector('[data-panorama-tab].is-active')?.dataset.panoramaTab;
  if (activePanoramaTab === 'strategy') {
    window.PanoramaMonitorChart?.init(document.querySelector('[data-panorama-panel="strategy"]'));
  }
  window.PanoramaMonitorChart?.resizeAfterLayout?.();
  iosScreen?.addEventListener(
    'transitionend',
    (event) => {
      if (event.propertyName !== 'width' && event.propertyName !== 'height') return;
      syncPanoramaLandscapeScale();
      window.PanoramaMonitorChart?.resizeAfterLayout?.();
    },
    { once: true },
  );
};

const closePanoramaExpand = () => {
  if (!panoramaBody || !panoramaFlowCard || !panoramaExpandState.isOpen) return;
  const cardHeader = panoramaFlowCard.querySelector('.card-header');
  cardHeader?.after(panoramaBody);
  panoramaBody.classList.remove('is-expanded-host');
  panoramaExpandOverlay?.classList.remove('is-open');
  panoramaExpandOverlay?.setAttribute('aria-hidden', 'true');
  iosScreen?.classList.remove('is-panorama-expanded');
  document.body.classList.remove('is-panorama-expanded');
  panoramaExpandState.isOpen = false;
  syncPanoramaExpandTrigger();
  syncPanoramaLandscapeScale();
  window.PanoramaDatePicker?.syncVisibility?.();
  window.PanoramaMonitorChart?.resizeAfterLayout?.();
  iosScreen?.addEventListener(
    'transitionend',
    (event) => {
      if (event.propertyName !== 'width' && event.propertyName !== 'height') return;
      syncPanoramaLandscapeScale();
      window.PanoramaMonitorChart?.resizeAfterLayout?.();
    },
    { once: true },
  );
};

syncPanoramaExpandTrigger();
panoramaExpandTrigger?.addEventListener('click', () => {
  panoramaExpandState.isOpen ? closePanoramaExpand() : openPanoramaExpand();
});
panoramaExpandClose?.addEventListener('click', closePanoramaExpand);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && panoramaExpandOverlay?.classList.contains('is-open')) {
    closePanoramaExpand();
  }
});
window.addEventListener('resize', syncPanoramaLandscapeScale);

/* 告警迁移引导 · 进入概览页弱提示（点击“不再提示”后不再展示） */
(() => {
  const guide = document.getElementById('alarmMigrateGuide');
  if (!guide) return;
  if (!document.querySelector('.home-screen')) return;
  const bubble = guide.querySelector('.migrate-guide__bubble');
  const closeBtn = document.getElementById('alarmMigrateGuideClose');
  const neverShowBtn = document.getElementById('alarmMigrateGuideDismiss');
  const goBtn = document.getElementById('alarmMigrateGuideGo');
  const messageTab = document.querySelector('.tab-bar .tab-item[href="./message.html"]');
  const NEVER_SHOW_KEY = 'mg-mini:alarm-migrate-guide-dismissed:v1';
  const AUTO_DISMISS_MS = 10000;
  let autoDismissTimer = 0;
  let isShown = false;

  const shouldNotShow = () => {
    try {
      return window.localStorage.getItem(NEVER_SHOW_KEY) === '1';
    } catch {
      return false;
    }
  };
  const markNeverShow = () => {
    try {
      window.localStorage.setItem(NEVER_SHOW_KEY, '1');
    } catch {
      /* 存储不可用时仅本次关闭，不阻断页面 */
    }
  };

  const hideGuide = (persist) => {
    if (persist) markNeverShow();
    if (!isShown) return;
    isShown = false;
    if (autoDismissTimer) {
      window.clearTimeout(autoDismissTimer);
      autoDismissTimer = 0;
    }
    messageTab?.classList.remove('is-guide-target');
    if (bubble) {
      bubble.classList.add('is-leaving');
      window.setTimeout(() => {
        guide.hidden = true;
        guide.setAttribute('aria-hidden', 'true');
      }, 200);
    } else {
      guide.hidden = true;
      guide.setAttribute('aria-hidden', 'true');
    }
  };

  const showGuide = () => {
    if (isShown || shouldNotShow()) return;
    if (panoramaExpandState.isOpen) return;
    isShown = true;
    bubble?.classList.remove('is-leaving');
    guide.hidden = false;
    guide.setAttribute('aria-hidden', 'false');
    messageTab?.classList.add('is-guide-target');
    autoDismissTimer = window.setTimeout(() => hideGuide(false), AUTO_DISMISS_MS);
  };

  closeBtn?.addEventListener('click', () => hideGuide(false));
  neverShowBtn?.addEventListener('click', () => hideGuide(true));
  goBtn?.addEventListener('click', () => {
    hideGuide(false);
    try {
      window.saveMGSiteContext?.('index', 'message');
    } catch {
      /* 忽略站点上下文透传失败，直接跳转 */
    }
    window.location.href = './message.html';
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isShown) hideGuide(false);
  });

  window.setTimeout(showGuide, 600);
})();
