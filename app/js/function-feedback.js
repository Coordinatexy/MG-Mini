const MAX_TEXT_LENGTH = 200;
const CHAR_COUNT_SHOW_THRESHOLD = 100;
const MAX_IMAGES = 4;
const IMAGE_ACCEPT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/heic',
  'image/heif',
]);

const store = window.MGFeedbackStore;
const defaultEnterprises = store?.ENTERPRISE_SITE_OPTIONS ?? [];

const descriptionInput = document.getElementById('feedbackDescription');
const charCountEl = document.getElementById('feedbackCharCount');
const uploaderEl = document.getElementById('feedbackUploader');
const fileInput = document.getElementById('feedbackFileInput');
const formEl = document.getElementById('feedbackForm');
const submitBtn = document.getElementById('feedbackSubmitBtn');
const enterpriseSelect = document.getElementById('feedbackEnterpriseSelect');
const siteSelect = document.getElementById('feedbackSiteSelect');

let uploadedImages = [];
let toastTimer = null;

const showToast = (message) => {
  const toastEl = document.getElementById('appToast');
  if (!toastEl) {
    window.alert(message);
    return;
  }
  toastEl.textContent = message;
  toastEl.hidden = false;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('is-visible');
    setTimeout(() => {
      toastEl.hidden = true;
    }, 200);
  }, 1800);
};

const getSiteContext = () => {
  const enterprise = enterpriseSelect?.value || defaultEnterprises[0]?.enterprise || '天合富家';
  const sites = store?.getSitesByEnterprise?.(enterprise) ?? defaultEnterprises.find((item) => item.enterprise === enterprise)?.sites ?? [];
  const site = siteSelect?.value || sites[0] || '天合富家1#站点';
  return { enterprise, site, sites };
};

const persistContext = (context) => {
  try {
    sessionStorage.setItem('mg-mini-site-context', JSON.stringify({ enterprise: context.enterprise, site: context.site }));
  } catch {
    // ignore storage failures
  }
};

const syncSiteOptions = (enterprise, preferredSite) => {
  if (!siteSelect) return;
  const sites = store?.getSitesByEnterprise?.(enterprise) ?? defaultEnterprises.find((item) => item.enterprise === enterprise)?.sites ?? [];
  siteSelect.innerHTML = '';
  sites.forEach((site) => {
    const option = document.createElement('option');
    option.value = site;
    option.textContent = site;
    siteSelect.appendChild(option);
  });
  if (!sites.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '暂无可选站点';
    siteSelect.appendChild(option);
    siteSelect.disabled = true;
    return;
  }
  siteSelect.disabled = false;
  const nextSite = sites.includes(preferredSite) ? preferredSite : sites[0];
  siteSelect.value = nextSite;
};

const syncEnterpriseOptions = () => {
  if (!enterpriseSelect) return;
  enterpriseSelect.innerHTML = '';
  defaultEnterprises.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.enterprise;
    option.textContent = item.enterprise;
    enterpriseSelect.appendChild(option);
  });
};

const loadContextFromStorage = () => {
  let enterprise = defaultEnterprises[0]?.enterprise || '天合富家';
  let site = defaultEnterprises[0]?.sites?.[0] || '天合富家1#站点';

  try {
    const saved = sessionStorage.getItem('mg-mini-site-context');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.enterprise) enterprise = parsed.enterprise;
      if (parsed.site) site = parsed.site;
    }
  } catch {
    sessionStorage.removeItem('mg-mini-site-context');
  }

  syncEnterpriseOptions();
  if (enterpriseSelect) enterpriseSelect.value = enterprise;
  syncSiteOptions(enterprise, site);
  if (enterpriseSelect && siteSelect) {
    persistContext({ enterprise: enterpriseSelect.value, site: siteSelect.value });
  }
};

const updateCharCount = () => {
  const length = descriptionInput?.value.length ?? 0;
  if (!charCountEl) return;
  charCountEl.textContent = `${length}/${MAX_TEXT_LENGTH}`;
  charCountEl.classList.toggle('is-limit', length >= MAX_TEXT_LENGTH);
  charCountEl.hidden = length <= CHAR_COUNT_SHOW_THRESHOLD;
};

const updateSubmitState = () => {
  const hasText = Boolean(descriptionInput?.value.trim());
  if (submitBtn) submitBtn.disabled = !hasText;
};

const revokeImageUrl = (item) => {
  if (item?.url?.startsWith('blob:')) {
    URL.revokeObjectURL(item.url);
  }
};

const renderUploader = () => {
  if (!uploaderEl || !fileInput) return;
  uploaderEl.querySelectorAll('.feedback-image-item, .feedback-upload-trigger').forEach((node) => node.remove());

  uploadedImages.forEach((item, index) => {
    const imageItem = document.createElement('div');
    imageItem.className = 'feedback-image-item';
    imageItem.innerHTML = `
      <img src="${item.url}" alt="已上传图片 ${index + 1}" />
      <button class="feedback-image-remove" type="button" data-remove-index="${index}" aria-label="删除图片 ${index + 1}">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    `;
    uploaderEl.appendChild(imageItem);
  });

  if (uploadedImages.length < MAX_IMAGES) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'feedback-upload-trigger';
    trigger.setAttribute('aria-label', '添加图片');
    trigger.innerHTML = `
      <i class="fa-solid fa-camera" aria-hidden="true"></i>
      <span>添加</span>
    `;
    trigger.addEventListener('click', () => fileInput.click());
    uploaderEl.appendChild(trigger);
  }

  uploaderEl.appendChild(fileInput);
};

const addImages = (files) => {
  const remain = MAX_IMAGES - uploadedImages.length;
  if (remain <= 0) {
    showToast(`最多上传 ${MAX_IMAGES} 张图片`);
    return;
  }

  const validFiles = [];
  Array.from(files).forEach((file) => {
    if (validFiles.length >= remain) return;
    const isImage = IMAGE_ACCEPT_TYPES.has(file.type) || file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage || isVideo) return;
    validFiles.push(file);
  });

  if (validFiles.length < Array.from(files).length) {
    showToast('仅支持上传图片，不支持视频');
  }

  validFiles.forEach((file) => {
    uploadedImages.push({
      file,
      url: URL.createObjectURL(file),
    });
  });

  if (validFiles.length && uploadedImages.length >= MAX_IMAGES) {
    showToast(`最多上传 ${MAX_IMAGES} 张图片`);
  }

  renderUploader();
};

enterpriseSelect?.addEventListener('change', () => {
  const nextEnterprise = enterpriseSelect.value;
  const currentSite = siteSelect?.value;
  syncSiteOptions(nextEnterprise, currentSite);
  persistContext(getSiteContext());
});

siteSelect?.addEventListener('change', () => {
  persistContext(getSiteContext());
});

descriptionInput?.addEventListener('input', () => {
  updateCharCount();
  updateSubmitState();
});

uploaderEl?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const removeButton = target.closest('[data-remove-index]');
  if (!(removeButton instanceof HTMLElement)) return;
  const index = Number(removeButton.dataset.removeIndex);
  if (Number.isNaN(index) || !uploadedImages[index]) return;
  revokeImageUrl(uploadedImages[index]);
  uploadedImages.splice(index, 1);
  renderUploader();
});

fileInput?.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.files?.length) return;
  addImages(input.files);
  input.value = '';
});

formEl?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const description = descriptionInput?.value.trim() ?? '';
  if (!description) {
    showToast('请填写问题描述');
    descriptionInput?.focus();
    return;
  }

  if (description.length > MAX_TEXT_LENGTH) {
    showToast(`问题描述不能超过 ${MAX_TEXT_LENGTH} 字`);
    return;
  }

  const context = getSiteContext();
  const files = uploadedImages.map((item) => item.file).filter(Boolean);

  if (submitBtn) submitBtn.disabled = true;

  try {
    if (window.MGFeedbackStore?.addFeedbackRecord) {
      await window.MGFeedbackStore.addFeedbackRecord({
        enterprise: context.enterprise,
        site: context.site,
        description,
        files,
      });
    }

    persistContext(context);
    showToast('反馈已提交');

    uploadedImages.forEach(revokeImageUrl);
    uploadedImages = [];
    if (descriptionInput) descriptionInput.value = '';
    updateCharCount();
    updateSubmitState();
    renderUploader();
  } catch {
    showToast('提交失败，请稍后重试');
  } finally {
    updateSubmitState();
  }
});

loadContextFromStorage();
updateCharCount();
updateSubmitState();
renderUploader();
