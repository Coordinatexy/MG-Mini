const createBottomSheetSelector = ({
  triggerId,
  pickerId,
  listId,
  closeId,
  currentNameId,
  searchInputId,
  items: initialItems,
  defaultValue,
  onChange,
  truncateLength = 4,
}) => {
  const trigger = document.getElementById(triggerId);
  const picker = document.getElementById(pickerId);
  const list = document.getElementById(listId);
  const closeButton = document.getElementById(closeId);
  const searchInput = searchInputId ? document.getElementById(searchInputId) : null;
  const currentName = currentNameId ? document.getElementById(currentNameId) : null;

  if (!trigger || !picker || !list) {
    return null;
  }

  const truncateName = (value) => {
    if (!value) return '';
    return value.length > truncateLength ? `${value.slice(0, truncateLength)}...` : value;
  };

  let items = Array.isArray(initialItems) ? [...initialItems] : [];
  let selectedValue = defaultValue ?? items[0]?.name ?? '';
  let searchText = '';

  const syncDisplay = (value) => {
    if (currentName) {
      currentName.textContent = truncateName(value);
    }
  };

  const getValue = () => selectedValue;

  const getFilteredItems = () => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => item.name.toLowerCase().includes(keyword));
  };

  const render = () => {
    const visibleItems = getFilteredItems();
    list.innerHTML = visibleItems
      .map(
        (item) => `
          <button class="picker-option${item.name === selectedValue ? ' is-active' : ''}" type="button" data-selector-value="${item.name}" aria-checked="${item.name === selectedValue}">
            <span class="picker-option__name">${item.name}</span>
            <span class="picker-option__check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
          </button>
        `,
      )
      .join('');

    if (!visibleItems.length) {
      list.innerHTML = '<div class="picker-empty">未找到匹配的企业</div>';
    }

    updateActiveState();
  };

  const updateActiveState = () => {
    list.querySelectorAll('.picker-option').forEach((option) => {
      const isActive = option.dataset.selectorValue === selectedValue;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-checked', String(isActive));
    });
  };

  const setSelectedValue = (value, options = {}) => {
    const nextValue = items.some((option) => option.name === value) ? value : items[0]?.name ?? '';
    selectedValue = nextValue;
    syncDisplay(nextValue);
    updateActiveState();

    if (typeof onChange === 'function') {
      onChange(nextValue, {
        source: options.source ?? 'programmatic',
        setItems,
        getItems,
        setValue: setSelectedValue,
        getValue,
      });
    }
  };

  const setOpen = (isOpen) => {
    picker.classList.toggle('is-open', isOpen);
    picker.setAttribute('aria-hidden', String(!isOpen));
    trigger.setAttribute('aria-expanded', String(isOpen));

    if (isOpen && searchInput instanceof HTMLInputElement) {
      window.setTimeout(() => {
        searchInput.focus();
        searchInput.select();
      }, 0);
    }
  };

  const setItems = (nextItems, nextDefaultValue = selectedValue) => {
    items = Array.isArray(nextItems) ? [...nextItems] : [];
    selectedValue = items.some((item) => item.name === nextDefaultValue) ? nextDefaultValue : items[0]?.name ?? '';
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = '';
    }
    searchText = '';
    render();
    syncDisplay(selectedValue);
  };

  const getItems = () => [...items];

  render();
  syncDisplay(selectedValue);
  updateActiveState();

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', () => {
      searchText = searchInput.value;
      render();
    });
  }

  trigger.addEventListener('click', () => setOpen(true));

  if (closeButton) {
    closeButton.addEventListener('click', () => setOpen(false));
  }

  picker.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const optionButton = target.closest('[data-selector-value]');
    if (optionButton instanceof HTMLElement) {
      const value = optionButton.dataset.selectorValue;
      if (value) {
        setSelectedValue(value, { source: 'user' });
      }
      setOpen(false);
      return;
    }

    if (target.classList.contains('picker-backdrop')) {
      setOpen(false);
    }
  });

  picker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
    }
  });

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    setValue: (value) => setSelectedValue(value, { source: 'programmatic' }),
    getValue,
    setItems,
    getItems,
  };
};

const enterpriseItems = [
  { name: '天合富家' },
  { name: '阳光电源科技有限公司' },
  { name: '晶科能源股份有限公司' },
  { name: '锦浪科技集团' },
  { name: '正泰安能数字能源' },
  { name: '隆基绿能科技股份有限公司' },
  { name: '特变电工新能源公司' },
  { name: '固德威技术股份有限公司' },
  { name: '科士达科技发展有限公司' },
  { name: '协鑫集成科技股份有限公司' },
];

const siteOptionsByEnterprise = {
  天合富家: [
    { name: '天合富家1#站点' },
    { name: '天合富家2#站点' },
    { name: '天合富家3#站点' },
    { name: '天合富家南区站点' },
    { name: '天合富家东区超长站点A' },
  ],
  阳光电源科技有限公司: [
    { name: '阳光电源合肥一期站点' },
    { name: '阳光电源芜湖二期站点' },
    { name: '阳光电源研发中心站点' },
    { name: '阳光电源园区北区超长站点' },
  ],
  晶科能源股份有限公司: [
    { name: '晶科能源嘉兴1#站点' },
    { name: '晶科能源嘉兴2#站点' },
    { name: '晶科能源海宁示范站点' },
    { name: '晶科能源东区超长站点名称' },
  ],
  默认: [
    { name: '天合富家1#站点' },
    { name: '天合富家2#站点' },
    { name: '天合富家3#站点' },
  ],
};

const siteStatusByEnterprise = {
  天合富家: {
    '天合富家1#站点': 'online',
    '天合富家2#站点': 'offline',
    '天合富家3#站点': 'offline',
    '天合富家南区站点': 'online',
    '天合富家东区超长站点A': 'online',
  },
  阳光电源科技有限公司: {
    '阳光电源合肥一期站点': 'online',
    '阳光电源芜湖二期站点': 'online',
    '阳光电源研发中心站点': 'online',
    '阳光电源园区北区超长站点': 'online',
  },
  晶科能源股份有限公司: {
    '晶科能源嘉兴1#站点': 'online',
    '晶科能源嘉兴2#站点': 'online',
    '晶科能源海宁示范站点': 'online',
    '晶科能源东区超长站点名称': 'online',
  },
  默认: {
    '天合富家1#站点': 'online',
    '天合富家2#站点': 'offline',
    '天合富家3#站点': 'offline',
  },
};

const pageSiteSelectors = {
  index: null,
  function: null,
  message: null,
};

const getSiteStatus = (siteName, enterpriseName) => {
  const statusMap = siteStatusByEnterprise[enterpriseName] ?? siteStatusByEnterprise.默认;
  return statusMap[siteName] ?? 'online';
};

const syncMicrogridFlowVisual = (isOnline) => {
  document.querySelectorAll('.microgrid-flow-visual').forEach((flowVisual) => {
    flowVisual.dataset.flowStatus = isOnline ? 'online' : 'offline';
  });
};

const syncSiteStatus = (siteName, enterpriseName) => {
  const statusPill = document.getElementById('siteOnlineStatusPill') ?? document.querySelector('.status-pill[data-site-status]');
  if (!statusPill) return;

  const statusText = statusPill.querySelector('[data-site-status-text]');
  const isOnline = getSiteStatus(siteName, enterpriseName) === 'online';

  statusPill.classList.toggle('online', isOnline);
  statusPill.classList.toggle('offline', !isOnline);
  statusPill.dataset.siteStatus = isOnline ? 'online' : 'offline';
  statusPill.setAttribute('aria-label', isOnline ? '站点在线状态' : '站点离线状态');

  if (statusText) {
    statusText.textContent = isOnline ? '在线' : '离线';
  }

  syncMicrogridFlowVisual(isOnline);
};

const syncSitesForEnterprise = (pageKey, enterpriseName) => {
  const siteSelector = pageSiteSelectors[pageKey];
  if (!siteSelector) return;

  const nextSites = siteOptionsByEnterprise[enterpriseName] ?? siteOptionsByEnterprise.默认;
  const currentSite = siteSelector.getValue();
  const nextValue = nextSites.some((site) => site.name === currentSite) ? currentSite : nextSites[0]?.name ?? '';
  siteSelector.setItems(nextSites, nextValue);
};

const createEnterpriseSelector = ({ triggerId, pickerId, listId, closeId, currentNameId, searchInputId, defaultValue, truncateLength, pageKey }) =>
  createBottomSheetSelector({
    triggerId,
    pickerId,
    listId,
    closeId,
    currentNameId,
    searchInputId,
    defaultValue,
    truncateLength,
    items: enterpriseItems,
    onChange: (value, context) => {
      if (context?.source === 'user') {
        syncSitesForEnterprise(pageKey, value);
        if (pageKey === 'index') {
          syncSiteStatus(pageSiteSelectors.index?.getValue?.() ?? '', value);
        }
        if (pageKey === 'message') {
          window.dispatchEvent(new CustomEvent('mg-mini:message-site-change'));
        }
      }
    },
  });

const indexEnterpriseSelector = createEnterpriseSelector({
  triggerId: 'enterpriseSelectorTrigger',
  pickerId: 'enterprisePicker',
  listId: 'enterprisePickerList',
  closeId: 'enterprisePickerClose',
  currentNameId: 'currentEnterpriseName',
  searchInputId: 'enterprisePickerSearch',
  defaultValue: '天合富家',
  truncateLength: 4,
  pageKey: 'index',
});

pageSiteSelectors.index = createBottomSheetSelector({
  triggerId: 'siteSelectorTriggerInline',
  pickerId: 'sitePicker',
  listId: 'sitePickerList',
  closeId: 'sitePickerClose',
  currentNameId: 'currentSiteNameInline',
  defaultValue: '天合富家1#站点',
  truncateLength: 8,
  items: siteOptionsByEnterprise.天合富家,
  onChange: (value, context) => {
    const enterpriseName = indexEnterpriseSelector?.getValue?.() ?? '天合富家';
    syncSiteStatus(value, enterpriseName);
    if (context?.source === 'user') {
      window.dispatchEvent(new CustomEvent('mg-mini:index-site-change', { detail: { siteName: value, enterpriseName } }));
    }
  },
});

const functionEnterpriseSelector = createEnterpriseSelector({
  triggerId: 'functionEnterpriseSelectorTrigger',
  pickerId: 'functionEnterprisePicker',
  listId: 'functionEnterprisePickerList',
  closeId: 'functionEnterprisePickerClose',
  currentNameId: 'functionCurrentEnterpriseName',
  searchInputId: 'functionEnterprisePickerSearch',
  defaultValue: '天合富家',
  truncateLength: 4,
  pageKey: 'function',
});

pageSiteSelectors.function = createBottomSheetSelector({
  triggerId: 'functionSiteSelectorTriggerInline',
  pickerId: 'functionSitePicker',
  listId: 'functionSitePickerList',
  closeId: 'functionSitePickerClose',
  currentNameId: 'functionCurrentSiteNameInline',
  defaultValue: '天合富家1#站点',
  truncateLength: 8,
  items: siteOptionsByEnterprise.天合富家,
});

const messageEnterpriseSelector = createEnterpriseSelector({
  triggerId: 'messageEnterpriseSelectorTrigger',
  pickerId: 'messageEnterprisePicker',
  listId: 'messageEnterprisePickerList',
  closeId: 'messageEnterprisePickerClose',
  currentNameId: 'messageCurrentEnterpriseName',
  searchInputId: 'messageEnterprisePickerSearch',
  defaultValue: '天合富家',
  truncateLength: 4,
  pageKey: 'message',
});

pageSiteSelectors.message = createBottomSheetSelector({
  triggerId: 'messageSiteSelectorTriggerInline',
  pickerId: 'messageSitePicker',
  listId: 'messageSitePickerList',
  closeId: 'messageSitePickerClose',
  currentNameId: 'messageCurrentSiteNameInline',
  defaultValue: '天合富家1#站点',
  truncateLength: 8,
  items: siteOptionsByEnterprise.天合富家,
  onChange: (_value, context) => {
    if (context?.source === 'user') {
      window.dispatchEvent(new CustomEvent('mg-mini:message-site-change'));
    }
  },
});

const restoreSiteContext = (pageKey, enterpriseSelector, siteSelector) => {
  try {
    const saved = sessionStorage.getItem('mg-mini-site-context');
    if (!saved) return;
    const { enterprise, site, targetPage } = JSON.parse(saved);
    if (targetPage && targetPage !== pageKey) return;
    if (enterprise && enterpriseSelector) {
      enterpriseSelector.setValue(enterprise);
      syncSitesForEnterprise(pageKey, enterprise);
    }
    if (site && siteSelector) {
      siteSelector.setValue(site);
    }
    sessionStorage.removeItem('mg-mini-site-context');
  } catch {
    sessionStorage.removeItem('mg-mini-site-context');
  }
};

window.getMGSiteContext = (pageKey = 'index') => {
  const enterpriseSelectorMap = {
    index: indexEnterpriseSelector,
    function: functionEnterpriseSelector,
    message: messageEnterpriseSelector,
  };
  const enterpriseSelector = enterpriseSelectorMap[pageKey];
  return {
    enterprise: enterpriseSelector?.getValue?.() ?? '',
    site: pageSiteSelectors[pageKey]?.getValue?.() ?? '',
  };
};

window.saveMGSiteContext = (pageKey, targetPage = 'message') => {
  const context = window.getMGSiteContext(pageKey);
  sessionStorage.setItem('mg-mini-site-context', JSON.stringify({ ...context, targetPage }));
};

document.querySelector('[data-feedback-link]')?.addEventListener('click', () => {
  window.saveMGSiteContext('function', 'function-feedback');
});

document.querySelector('[data-report-link]')?.addEventListener('click', () => {
  window.saveMGSiteContext('function', 'function-report');
});

restoreSiteContext('message', messageEnterpriseSelector, pageSiteSelectors.message);

syncSitesForEnterprise('index', indexEnterpriseSelector?.getValue?.() ?? '天合富家');
syncSitesForEnterprise('function', functionEnterpriseSelector?.getValue?.() ?? '天合富家');
syncSitesForEnterprise('message', messageEnterpriseSelector?.getValue?.() ?? '天合富家');
syncSiteStatus(pageSiteSelectors.index?.getValue?.() ?? '天合富家1#站点', indexEnterpriseSelector?.getValue?.() ?? '天合富家');
