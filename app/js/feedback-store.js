const FEEDBACK_STORAGE_KEY = 'mg-mini-feedback-records';
const FEEDBACK_SEED_VERSION = 3;
const FEEDBACK_VERSION_KEY = 'mg-mini-feedback-seed-version';

const FEEDBACK_STATUS = {
  pending: { label: '待受理', tone: 'pending' },
  processing: { label: '处理中', tone: 'processing' },
  completed: { label: '已完成', tone: 'completed' },
};

/** 历史状态映射：已解决 / 已关闭 → 已完成 */
const normalizeFeedbackStatus = (status) => {
  if (status === 'resolved' || status === 'closed') return 'completed';
  if (FEEDBACK_STATUS[status]) return status;
  return 'pending';
};

const ENTERPRISE_SITE_OPTIONS = [
  {
    enterprise: '天合富家',
    sites: ['天合富家1#站点', '天合富家2#站点', '天合富家测试站点'],
  },
  {
    enterprise: '阳光电源科技有限公司',
    sites: ['阳光电源合肥一期站点', '阳光电源芜湖示范站点'],
  },
  {
    enterprise: '晶科能源股份有限公司',
    sites: ['晶科能源嘉兴1#站点', '晶科能源上海测试站点'],
  },
  {
    enterprise: '锦浪科技集团',
    sites: ['锦浪科技园区站点', '锦浪科技宁波研发站点'],
  },
  {
    enterprise: '正泰安能数字能源',
    sites: ['正泰安能华东示范站点', '正泰安能杭州试点站点'],
  },
  {
    enterprise: '隆基绿能科技股份有限公司',
    sites: ['隆基绿能西安研发站点', '隆基绿能咸阳测试站点'],
  },
  {
    enterprise: '特变电工新能源公司',
    sites: ['特变电工新疆一期站点', '特变电工西北测试站点'],
  },
  {
    enterprise: '固德威技术股份有限公司',
    sites: ['固德威苏州测试站点', '固德威南京研发站点'],
  },
  {
    enterprise: '协鑫集成科技股份有限公司',
    sites: ['协鑫集成南京站点', '协鑫集成苏州试点站点'],
  },
];

const formatDateTime = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
};

const createId = () => `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const getEnterpriseSiteOptions = () =>
  ENTERPRISE_SITE_OPTIONS.map((item) => ({
    enterprise: item.enterprise,
    sites: [...item.sites],
  }));

const getSitesByEnterprise = (enterprise) =>
  getEnterpriseSiteOptions().find((item) => item.enterprise === enterprise)?.sites ?? [];

const seedRecords = () => [
  {
    id: 'fb-seed-001',
    enterprise: '天合富家',
    site: '天合富家1#站点',
    description: '能量全景看板中储能功率曲线偶尔出现数据断点，刷新后恢复正常，希望排查是否为采集延迟导致。',
    imageCount: 2,
    images: [],
    status: 'completed',
    createdAt: '2026-07-08T09:24:00.000Z',
    updatedAt: '2026-07-09T14:10:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-08 17:24', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-08 18:05', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-09 10:30', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
      { key: 'completed', label: '已完成', time: '2026-07-09 22:10', desc: '您的反馈已完成处理，感谢您的支持与耐心。' },
    ],
    result: {
      summary: '采集节点缓存策略已优化，曲线断点问题已修复。',
      detail: '经排查为边缘网关短时离线导致的数据缺口，已调整补传策略并补全历史数据。如 48 小时内仍有异常，请再次反馈。',
    },
  },
  {
    id: 'fb-seed-002',
    enterprise: '天合富家',
    site: '天合富家2#站点',
    description: '消息页筛选条件切换后，未恢复告警数量角标未同步更新。',
    imageCount: 1,
    images: [],
    status: 'processing',
    createdAt: '2026-07-09T11:08:00.000Z',
    updatedAt: '2026-07-10T03:20:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-09 19:08', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-09 20:15', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-10 11:20', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
    ],
    result: null,
  },
  {
    id: 'fb-seed-003',
    enterprise: '阳光电源科技有限公司',
    site: '阳光电源合肥一期站点',
    description: '建议在工作台增加快捷入口，便于一线人员快速切换常用功能模块。',
    imageCount: 0,
    images: [],
    status: 'pending',
    createdAt: '2026-07-10T06:42:00.000Z',
    updatedAt: '2026-07-10T06:42:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-10 14:42', desc: '您的反馈已收到，我们将尽快安排处理。' },
    ],
    result: null,
  },
  {
    id: 'fb-seed-004',
    enterprise: '晶科能源股份有限公司',
    site: '晶科能源嘉兴1#站点',
    description: '概览页站点离线时，顶部状态提示与下方微网流向图状态不一致，容易造成误判。',
    imageCount: 3,
    images: [],
    status: 'completed',
    createdAt: '2026-07-05T02:18:00.000Z',
    updatedAt: '2026-07-07T08:40:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-05 10:18', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-05 14:30', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-06 09:15', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
      { key: 'completed', label: '已完成', time: '2026-07-07 16:40', desc: '您的反馈已完成处理，感谢您的支持与耐心。' },
    ],
    result: {
      summary: '离线状态在各模块间已统一同步。',
      detail: '修复了站点切换与离线 banner 触发顺序问题，微网流向图将与顶部状态保持一致。建议升级至最新版本后观察。',
    },
  },
  {
    id: 'fb-seed-005',
    enterprise: '锦浪科技集团',
    site: '锦浪科技园区站点',
    description: '策略运行页中，策略启停后状态刷新有 10–15 秒延迟，无法立即看到最新执行结果。',
    imageCount: 1,
    images: [],
    status: 'processing',
    createdAt: '2026-07-09T07:55:00.000Z',
    updatedAt: '2026-07-10T05:10:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-09 15:55', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-09 17:20', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-10 13:10', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
    ],
    result: null,
  },
  {
    id: 'fb-seed-006',
    enterprise: '正泰安能数字能源',
    site: '正泰安能华东示范站点',
    description: '排班管理模块缺少导出功能，希望支持导出 Excel 便于线下核对值班安排。',
    imageCount: 0,
    images: [],
    status: 'pending',
    createdAt: '2026-07-10T04:30:00.000Z',
    updatedAt: '2026-07-10T04:30:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-10 12:30', desc: '您的反馈已收到，我们将尽快安排处理。' },
    ],
    result: null,
  },
  {
    id: 'fb-seed-007',
    enterprise: '隆基绿能科技股份有限公司',
    site: '隆基绿能西安研发站点',
    description: '同一问题重复提交了两次，请帮忙合并处理，避免运维同事重复跟进。',
    imageCount: 0,
    images: [],
    status: 'completed',
    createdAt: '2026-07-03T08:12:00.000Z',
    updatedAt: '2026-07-04T01:50:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-03 16:12', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-03 17:05', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-03 22:40', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
      { key: 'completed', label: '已完成', time: '2026-07-04 09:50', desc: '您的反馈已完成处理，感谢您的支持与耐心。' },
    ],
    result: {
      summary: '重复反馈已合并，本条记录关闭。',
      detail: '您的问题已在工单 fb-seed-004 中跟进处理，本条为重复提交记录，无需重复关注。',
    },
  },
  {
    id: 'fb-seed-008',
    enterprise: '特变电工新能源公司',
    site: '特变电工新疆一期站点',
    description: '能量全景日期选择器在跨月切换时，偶发无法选中边界日期（近 30 日首日）。',
    imageCount: 2,
    images: [],
    status: 'completed',
    createdAt: '2026-07-01T10:40:00.000Z',
    updatedAt: '2026-07-03T06:25:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-01 18:40', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-01 20:10', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-02 11:00', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
      { key: 'completed', label: '已完成', time: '2026-07-03 14:25', desc: '您的反馈已完成处理，感谢您的支持与耐心。' },
    ],
    result: {
      summary: '跨月边界日期选择问题已修复。',
      detail: '修正了近 30 日范围的起止计算方式，跨月场景下首日可正常选中。请清除缓存后重试。',
    },
  },
  {
    id: 'fb-seed-009',
    enterprise: '固德威技术股份有限公司',
    site: '固德威苏州测试站点',
    description: '监控图表放大后，双指缩放偶发失效，需要退出重进才能恢复交互。',
    imageCount: 4,
    images: [],
    status: 'processing',
    createdAt: '2026-07-08T13:20:00.000Z',
    updatedAt: '2026-07-10T02:45:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-08 21:20', desc: '您的反馈已收到，我们将尽快安排处理。' },
      { key: 'accepted', label: '已受理', time: '2026-07-09 09:40', desc: '您的反馈已受理，我们将尽快安排处理。' },
      { key: 'processing', label: '处理中', time: '2026-07-10 10:45', desc: '您的反馈处理中，我们将持续跟进处理进展。' },
    ],
    result: null,
  },
  {
    id: 'fb-seed-010',
    enterprise: '协鑫集成科技股份有限公司',
    site: '协鑫集成南京站点',
    description: '建议深色模式下增强卡片对比度，部分数据标签在暗色背景下可读性偏低。',
    imageCount: 2,
    images: [],
    status: 'pending',
    createdAt: '2026-07-10T07:18:00.000Z',
    updatedAt: '2026-07-10T07:18:00.000Z',
    timeline: [
      { key: 'submitted', label: '已提交', time: '2026-07-10 15:18', desc: '您的反馈已收到，我们将尽快安排处理。' },
    ],
    result: null,
  },
];

const memoryStore = {
  version: null,
  records: null,
};

const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const readSeedVersion = () => {
  if (memoryStore.version != null) return memoryStore.version;
  const saved = safeGetItem(FEEDBACK_VERSION_KEY);
  if (saved != null) memoryStore.version = saved;
  return saved;
};

const writeSeedVersion = (version) => {
  memoryStore.version = String(version);
  safeSetItem(FEEDBACK_VERSION_KEY, String(version));
};

const readRecords = () => {
  if (Array.isArray(memoryStore.records)) return memoryStore.records;

  try {
    const raw = safeGetItem(FEEDBACK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    memoryStore.records = parsed;
    return parsed;
  } catch {
    return Array.isArray(memoryStore.records) ? memoryStore.records : null;
  }
};

const writeRecords = (records) => {
  memoryStore.records = Array.isArray(records) ? [...records] : [];
  safeSetItem(FEEDBACK_STORAGE_KEY, JSON.stringify(memoryStore.records));
};

const ensureRecords = () => {
  try {
    const currentVersion = readSeedVersion();
    if (currentVersion !== String(FEEDBACK_SEED_VERSION)) {
      const seeded = seedRecords();
      writeRecords(seeded);
      writeSeedVersion(FEEDBACK_SEED_VERSION);
      return seeded;
    }

    const existing = readRecords();
    if (existing?.length) return existing;

    const seeded = seedRecords();
    writeRecords(seeded);
    writeSeedVersion(FEEDBACK_SEED_VERSION);
    return seeded;
  } catch {
    if (!memoryStore.records?.length) {
      memoryStore.records = seedRecords();
      memoryStore.version = String(FEEDBACK_SEED_VERSION);
    }
    return memoryStore.records;
  }
};

const createPlaceholderFeedbackImages = (count) =>
  Array.from({ length: Math.max(0, Number(count) || 0) }, (_, index) => {
    const hue = [217, 187, 162, 145][index % 4];
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(${hue} 80% 72%)"/>
            <stop offset="1" stop-color="hsl(${(hue + 42) % 360} 78% 52%)"/>
          </linearGradient>
        </defs>
        <rect width="720" height="480" rx="28" fill="url(#bg)"/>
        <circle cx="560" cy="120" r="92" fill="rgba(255,255,255,.24)"/>
        <path d="M0 390 180 250 300 340 430 210 720 430V480H0Z" fill="rgba(255,255,255,.3)"/>
        <text x="36" y="72" fill="white" font-family="Arial,sans-serif" font-size="28" font-weight="700">反馈附件 ${index + 1}</text>
      </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  });

const normalizeRecord = (record) => {
  if (!record || typeof record !== 'object') return record;
  const status = normalizeFeedbackStatus(record.status);
  const images = Array.isArray(record.images) && record.images.length
    ? record.images
    : createPlaceholderFeedbackImages(record.imageCount);
  const timeline = Array.isArray(record.timeline)
    ? record.timeline.map((step) => {
        if (!step || typeof step !== 'object') return step;
        if (step.key === 'resolved' || step.key === 'closed' || step.label === '已解决' || step.label === '已关闭') {
          return { ...step, key: 'completed', label: '已完成' };
        }
        return step;
      })
    : record.timeline;
  return { ...record, status, timeline, images };
};

const getFeedbackRecords = () => {
  const records = ensureRecords();
  return [...records]
    .map(normalizeRecord)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const getFeedbackById = (id) => getFeedbackRecords().find((item) => item.id === id) ?? null;

const filesToDataUrls = (files) =>
  Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    ),
  );

const addFeedbackRecord = async ({ enterprise, site, description, files = [] }) => {
  const now = new Date();
  const timeLabel = formatDateTime(now);
  const images = files.length ? await filesToDataUrls(files) : [];

  const record = {
    id: createId(),
    enterprise,
    site,
    description,
    imageCount: images.length,
    images,
    status: 'pending',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    timeline: [
      {
        key: 'submitted',
        label: '已提交',
        time: timeLabel,
        desc: '您的反馈已收到，我们将尽快安排处理。',
      },
    ],
    result: null,
  };

  const records = getFeedbackRecords();
  records.unshift(record);
  writeRecords(records);
  return record;
};

window.MGFeedbackStore = {
  FEEDBACK_STATUS,
  ENTERPRISE_SITE_OPTIONS: getEnterpriseSiteOptions(),
  getSitesByEnterprise,
  formatDateTime,
  normalizeFeedbackStatus,
  getFeedbackRecords,
  getFeedbackById,
  addFeedbackRecord,
};
