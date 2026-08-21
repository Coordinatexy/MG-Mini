const listEl = document.getElementById('feedbackRecordList');
const emptyEl = document.getElementById('feedbackRecordEmpty');
const statusTabsEl = document.getElementById('feedbackStatusTabs');

const params = new URLSearchParams(window.location.search);
const statusFromQuery = params.get('status');
const statusFromStorage = window.sessionStorage.getItem('mg-mini-feedback-history-status');
let activeStatus = ['all', 'pending', 'processing', 'completed'].includes(statusFromQuery)
  ? statusFromQuery
  : ['all', 'pending', 'processing', 'completed'].includes(statusFromStorage)
    ? statusFromStorage
    : 'all';

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const showEmptyState = (title, description) => {
  if (!emptyEl) return;
  const titleEl = emptyEl.querySelector('h2');
  const descEl = emptyEl.querySelector('p');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = description;
  emptyEl.hidden = false;
};

const syncStatusTabs = () => {
  if (!statusTabsEl) return;
  statusTabsEl.querySelectorAll('.feedback-status-tab').forEach((tab) => {
    const isActive = tab.dataset.status === activeStatus;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
};

const renderList = () => {
  if (!listEl || !emptyEl) return;

  const store = window.MGFeedbackStore;
  if (!store?.getFeedbackRecords) {
    listEl.innerHTML = '';
    showEmptyState('数据加载失败', '请刷新页面后重试');
    return;
  }

  try {
    const { FEEDBACK_STATUS, formatDateTime, getFeedbackRecords } = store;
    const status = activeStatus;
    const fallbackStatus = FEEDBACK_STATUS?.pending ?? { label: '待受理', tone: 'pending' };
    const records = getFeedbackRecords().filter((item) => status === 'all' || item.status === status);

    if (!records.length) {
      listEl.innerHTML = '';
      showEmptyState(
        status === 'all' ? '暂无反馈记录' : '暂无匹配记录',
        status === 'all' ? '提交问题后，可在此查看处理进度与结果' : '请切换其他状态后再查看',
      );
      return;
    }

    emptyEl.hidden = true;
    listEl.innerHTML = records
      .map((item) => {
        const statusMeta = FEEDBACK_STATUS?.[item.status] ?? fallbackStatus;
        const imageHint = item.imageCount > 0 ? `${item.imageCount} 张图片` : '无图片';
        return `
          <a class="feedback-record-card" href="./function-feedback-detail.html?id=${encodeURIComponent(item.id)}" aria-label="查看反馈详情">
            <div class="feedback-record-card__header">
              <span class="feedback-status-badge feedback-status-badge--${statusMeta.tone}">${statusMeta.label}</span>
              <time class="feedback-record-card__time">${formatDateTime(item.createdAt)}</time>
            </div>
            <p class="feedback-record-card__desc">${escapeHtml(item.description)}</p>
            <div class="feedback-record-card__footer">
              <span class="feedback-record-card__site">${escapeHtml(item.site)}</span>
              <span class="feedback-record-card__meta">
                <i class="fa-solid fa-image" aria-hidden="true"></i>
                ${imageHint}
              </span>
            </div>
          </a>
        `;
      })
      .join('');
  } catch {
    listEl.innerHTML = '';
    showEmptyState('数据加载失败', '请刷新页面后重试');
  }
};

statusTabsEl?.addEventListener('click', (event) => {
  const tab = event.target.closest('.feedback-status-tab');
  if (!tab || !statusTabsEl.contains(tab)) return;
  const nextStatus = tab.dataset.status || 'all';
  if (nextStatus === activeStatus) return;
  activeStatus = nextStatus;
  window.sessionStorage.setItem('mg-mini-feedback-history-status', activeStatus);
  syncStatusTabs();
  renderList();
});

window.sessionStorage.setItem('mg-mini-feedback-history-status', activeStatus);
syncStatusTabs();
renderList();
