const params = new URLSearchParams(window.location.search);
const feedbackId = params.get('id');

const rootEl = document.getElementById('feedbackDetailRoot');
const missingEl = document.getElementById('feedbackDetailMissing');
const statusBadgeEl = document.getElementById('feedbackDetailStatusBadge');
const updatedAtEl = document.getElementById('feedbackDetailUpdatedAt');
const statusHintEl = document.getElementById('feedbackDetailStatusHint');
const enterpriseEl = document.getElementById('feedbackDetailEnterprise');
const siteEl = document.getElementById('feedbackDetailSite');
const createdAtEl = document.getElementById('feedbackDetailCreatedAt');
const descriptionEl = document.getElementById('feedbackDetailDescription');
const imagesEl = document.getElementById('feedbackDetailImages');
const timelineEl = document.getElementById('feedbackDetailTimeline');
const previewEl = document.getElementById('feedbackImagePreview');
const previewImgEl = document.getElementById('feedbackImagePreviewImg');
const previewCounterEl = document.getElementById('feedbackImagePreviewCounter');
const previewCloseEl = document.getElementById('feedbackImagePreviewClose');
const previewPrevEl = document.getElementById('feedbackImagePreviewPrev');
const previewNextEl = document.getElementById('feedbackImagePreviewNext');
const previewBackdropEl = document.getElementById('feedbackImagePreviewBackdrop');

const previewState = {
  images: [],
  index: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  dragStartX: 0,
  dragStartY: 0,
  dragOriginX: 0,
  dragOriginY: 0,
  activePointers: new Map(),
  startDistance: 0,
  startScale: 1,
  startMidpointX: 0,
  startMidpointY: 0,
  swipeStartX: 0,
  swipeStartY: 0,
  swipeStartTime: 0,
};

const STATUS_HINTS = {
  pending: '您的反馈已收到，我们将尽快安排处理。',
  processing: '您的反馈处理中，我们将持续跟进处理进展。',
  completed: '该反馈已处理完成，感谢你的耐心与支持。',
};

const TIMELINE_DESC_MAP = {
  submitted: '您的反馈已收到，我们将尽快安排处理。',
  accepted: '您的反馈已受理，我们将尽快安排处理。',
  processing: '您的反馈处理中，我们将持续跟进处理进展。',
  completed: '您的反馈已完成处理，感谢您的支持与耐心。',
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const showMissing = (title = '未找到该反馈', description = '记录可能已被删除或链接无效') => {
  if (rootEl) rootEl.hidden = true;
  if (!missingEl) return;
  const titleEl = missingEl.querySelector('h2');
  const descEl = missingEl.querySelector('p');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = description;
  missingEl.hidden = false;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const applyPreviewTransform = () => {
  if (!previewImgEl) return;
  previewImgEl.style.transform = `translate3d(${previewState.translateX}px, ${previewState.translateY}px, 0) scale(${previewState.scale})`;
  previewImgEl.style.cursor = previewState.scale > 1 ? 'grab' : 'default';
  previewImgEl.style.touchAction = 'none';
  if (previewCounterEl && previewState.images.length) {
    previewCounterEl.textContent = `${previewState.index + 1} / ${previewState.images.length}`;
  }
};

const resetPreviewTransform = () => {
  previewState.scale = 1;
  previewState.translateX = 0;
  previewState.translateY = 0;
  previewState.dragStartX = 0;
  previewState.dragStartY = 0;
  previewState.dragOriginX = 0;
  previewState.dragOriginY = 0;
  applyPreviewTransform();
};

const renderPreviewImage = () => {
  if (!previewImgEl || !previewState.images.length) return;
  const safeIndex = ((previewState.index % previewState.images.length) + previewState.images.length) % previewState.images.length;
  previewState.index = safeIndex;
  previewImgEl.src = previewState.images[safeIndex];
  previewImgEl.alt = `反馈图片预览 ${safeIndex + 1}`;
  if (previewCounterEl) previewCounterEl.textContent = `${safeIndex + 1} / ${previewState.images.length}`;
  resetPreviewTransform();
};

const closeImagePreview = () => {
  if (previewEl) previewEl.hidden = true;
  if (previewImgEl) previewImgEl.removeAttribute('src');
  previewState.images = [];
  previewState.index = 0;
  previewState.activePointers.clear();
  if (previewCounterEl) previewCounterEl.textContent = '1 / 1';
};

const openImagePreview = (images, index = 0) => {
  if (!previewEl || !previewImgEl || !Array.isArray(images) || !images.length) return;
  previewState.images = images;
  previewState.index = clamp(index, 0, images.length - 1);
  previewEl.hidden = false;
  renderPreviewImage();
};

const goToPreviewIndex = (nextIndex) => {
  if (!previewState.images.length) return;
  const total = previewState.images.length;
  previewState.index = (nextIndex + total) % total;
  renderPreviewImage();
};

const zoomPreview = (delta, anchorX = 0, anchorY = 0) => {
  if (!previewImgEl) return;
  const nextScale = clamp(Number((previewState.scale + delta).toFixed(3)), 1, 4);
  const prevScale = previewState.scale;
  if (nextScale === prevScale) return;

  const rect = previewImgEl.getBoundingClientRect();
  const offsetX = anchorX - (rect.left + rect.width / 2);
  const offsetY = anchorY - (rect.top + rect.height / 2);
  const ratio = nextScale / prevScale;

  previewState.translateX = previewState.translateX * ratio + offsetX * (1 - ratio);
  previewState.translateY = previewState.translateY * ratio + offsetY * (1 - ratio);
  previewState.scale = nextScale;
  applyPreviewTransform();
};

const panPreview = (dx, dy) => {
  previewState.translateX += dx;
  previewState.translateY += dy;
  applyPreviewTransform();
};

const getPointerMidpoint = () => {
  const pointers = Array.from(previewState.activePointers.values());
  if (pointers.length < 2) return null;
  return {
    x: (pointers[0].x + pointers[1].x) / 2,
    y: (pointers[0].y + pointers[1].y) / 2,
  };
};

const getPointerDistance = () => {
  const pointers = Array.from(previewState.activePointers.values());
  if (pointers.length < 2) return 0;
  return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
};

const getPreviewBounds = () => previewImgEl?.getBoundingClientRect() ?? null;
const settlePreviewPan = () => {
  const bounds = getPreviewBounds();
  if (!bounds) return;
  const maxX = Math.max(0, (bounds.width * previewState.scale - bounds.width) / 2);
  const maxY = Math.max(0, (bounds.height * previewState.scale - bounds.height) / 2);
  previewState.translateX = clamp(previewState.translateX, -maxX, maxX);
  previewState.translateY = clamp(previewState.translateY, -maxY, maxY);
  previewState.dragOriginX = previewState.translateX;
  previewState.dragOriginY = previewState.translateY;
  applyPreviewTransform();
};

const showDetail = () => {
  if (missingEl) missingEl.hidden = true;
  if (rootEl) rootEl.hidden = false;
};

const handleImageError = (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  const button = image.closest('.feedback-detail-image');
  if (button) button.hidden = true;
};

const renderDetail = () => {
  if (!rootEl || !missingEl) return;

  if (!feedbackId) {
    showMissing();
    return;
  }

  const store = window.MGFeedbackStore;
  if (!store?.getFeedbackById) {
    showMissing('数据加载失败', '请返回反馈记录后重试');
    return;
  }

  try {
    const { FEEDBACK_STATUS, formatDateTime, getFeedbackById } = store;
    const record = getFeedbackById(feedbackId);
    const fallbackStatus = FEEDBACK_STATUS?.pending ?? { label: '待受理', tone: 'pending' };

    if (!record) {
      showMissing();
      return;
    }

    const statusMeta = FEEDBACK_STATUS?.[record.status] ?? fallbackStatus;

    if (statusBadgeEl) {
      statusBadgeEl.textContent = statusMeta.label;
      statusBadgeEl.className = `feedback-status-badge feedback-status-badge--${statusMeta.tone}`;
    }
    if (updatedAtEl) updatedAtEl.textContent = `更新于 ${formatDateTime(record.updatedAt)}`;
    if (statusHintEl) statusHintEl.textContent = STATUS_HINTS[record.status] ?? STATUS_HINTS.pending;
    if (enterpriseEl) enterpriseEl.textContent = record.enterprise;
    if (siteEl) siteEl.textContent = record.site;
    if (createdAtEl) createdAtEl.textContent = formatDateTime(record.createdAt);
    if (descriptionEl) descriptionEl.textContent = record.description;

    if (imagesEl) {
      const images = Array.isArray(record.images) ? record.images.filter(Boolean) : [];
      window.__feedbackPreviewImages = images;
      if (images.length) {
        imagesEl.hidden = false;
        imagesEl.innerHTML = images
          .map(
            (src, index) => `
              <button type="button" class="feedback-detail-image" data-image-index="${index}" aria-label="预览反馈图片 ${index + 1}">
                <img src="${escapeHtml(src)}" alt="反馈图片 ${index + 1}" loading="lazy" />
              </button>
            `,
          )
          .join('');
      } else {
        imagesEl.hidden = true;
        imagesEl.innerHTML = '';
      }
    }

    if (timelineEl) {
      const timelineSteps = (record.timeline ?? []).filter((step) => step?.key !== 'accepted');
      const isCompleted = record.status === 'completed';
      timelineEl.innerHTML = timelineSteps
        .map((step, index, list) => {
          const isLast = index === list.length - 1;
          let stateClass = 'is-done';
          if (isLast) {
            stateClass = isCompleted ? 'is-done' : 'is-active';
          }
          const icon = stateClass === 'is-done' ? 'fa-check' : 'fa-circle';
          const desc = TIMELINE_DESC_MAP[step.key] ?? step.desc;
          return `
            <li class="feedback-timeline__item ${stateClass}">
              <span class="feedback-timeline__dot"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
              <div class="feedback-timeline__content">
                <h3>${escapeHtml(step.label)}</h3>
                <time>${escapeHtml(step.time)}</time>
                <p>${escapeHtml(desc)}</p>
              </div>
            </li>
          `;
        })
        .join('');
    }

    if (statusHintEl) {
      statusHintEl.textContent = STATUS_HINTS[record.status] ?? STATUS_HINTS.pending;
    }

    showDetail();
  } catch {
    showMissing('数据加载失败', '请返回反馈记录后重试');
  }
};

imagesEl?.addEventListener('error', handleImageError, true);

imagesEl?.addEventListener('click', (event) => {
  const target = event.target.closest('[data-image-index]');
  if (!target) return;
  const index = Number(target.dataset.imageIndex);
  if (Number.isNaN(index)) return;
  openImagePreview(Array.isArray(window.__feedbackPreviewImages) ? window.__feedbackPreviewImages : [], index);
});

previewCloseEl?.addEventListener('click', closeImagePreview);
previewPrevEl?.addEventListener('click', () => goToPreviewIndex(previewState.index - 1));
previewNextEl?.addEventListener('click', () => goToPreviewIndex(previewState.index + 1));
previewBackdropEl?.addEventListener('click', closeImagePreview);
previewEl?.addEventListener('click', (event) => {
  if (event.target === previewEl) closeImagePreview();
});
window.addEventListener('keydown', (event) => {
  if (!previewEl || previewEl.hidden) return;
  if (event.key === 'Escape') closeImagePreview();
  if (event.key === 'ArrowLeft') goToPreviewIndex(previewState.index - 1);
  if (event.key === 'ArrowRight') goToPreviewIndex(previewState.index + 1);
});

previewImgEl?.addEventListener('wheel', (event) => {
  if (previewEl?.hidden) return;
  event.preventDefault();
  zoomPreview(event.deltaY < 0 ? 0.12 : -0.12, event.clientX, event.clientY);
}, { passive: false });

previewImgEl?.addEventListener('pointerdown', (event) => {
  if (previewEl?.hidden) return;
  previewImgEl.setPointerCapture(event.pointerId);
  previewState.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  previewState.swipeStartX = event.clientX;
  previewState.swipeStartY = event.clientY;
  previewState.swipeStartTime = Date.now();
  if (previewState.activePointers.size === 1) {
    previewState.baseTranslateX = previewState.translateX;
    previewState.baseTranslateY = previewState.translateY;
    previewState.dragStartX = event.clientX;
    previewState.dragStartY = event.clientY;
    previewState.dragOriginX = previewState.translateX;
    previewState.dragOriginY = previewState.translateY;
  }
  if (previewState.activePointers.size === 2) {
    previewState.startDistance = getPointerDistance();
    previewState.startScale = previewState.scale;
    const midpoint = getPointerMidpoint();
    if (midpoint) {
      previewState.startMidpointX = midpoint.x;
      previewState.startMidpointY = midpoint.y;
    }
  }
});

previewImgEl?.addEventListener('pointermove', (event) => {
  if (previewEl?.hidden || !previewState.activePointers.has(event.pointerId)) return;
  previewState.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (previewState.activePointers.size >= 2) {
    const distance = getPointerDistance();
    if (!previewState.startDistance) previewState.startDistance = distance;
    const ratio = distance / previewState.startDistance;
    const nextScale = clamp(Number((previewState.startScale * ratio).toFixed(3)), 1, 4);
    previewState.scale = nextScale;
    const midpoint = getPointerMidpoint();
    if (midpoint) {
      const scaleRatio = previewState.scale / previewState.startScale;
      const offsetX = midpoint.x - previewState.startMidpointX;
      const offsetY = midpoint.y - previewState.startMidpointY;
      previewState.translateX = previewState.dragOriginX * scaleRatio + offsetX;
      previewState.translateY = previewState.dragOriginY * scaleRatio + offsetY;
    }
    settlePreviewPan();
    return;
  }

  if (previewState.scale > 1) {
    const dx = event.clientX - previewState.dragStartX;
    const dy = event.clientY - previewState.dragStartY;
    previewState.translateX = previewState.dragOriginX + dx;
    previewState.translateY = previewState.dragOriginY + dy;
    settlePreviewPan();
  }
});

const finishPointerGesture = (event) => {
  if (!previewState.activePointers.has(event.pointerId)) return;
  const startTime = previewState.swipeStartTime;
  const startX = previewState.swipeStartX;
  const startY = previewState.swipeStartY;
  previewState.activePointers.delete(event.pointerId);

  if (previewState.activePointers.size === 0) {
    if (previewState.scale <= 1.02) {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const elapsed = Date.now() - startTime;
      if (elapsed < 300 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        goToPreviewIndex(previewState.index + (dx < 0 ? 1 : -1));
      }
    }
    previewState.startDistance = 0;
    previewState.startScale = previewState.scale;
    previewState.dragOriginX = previewState.translateX;
    previewState.dragOriginY = previewState.translateY;
  }
};

previewImgEl?.addEventListener('pointerup', finishPointerGesture);
previewImgEl?.addEventListener('pointercancel', finishPointerGesture);
previewImgEl?.addEventListener('dblclick', (event) => {
  if (previewState.scale > 1) {
    resetPreviewTransform();
  } else {
    zoomPreview(1.2, event.clientX, event.clientY);
  }
});
previewImgEl?.addEventListener('load', () => {
  if (previewEl && !previewEl.hidden) settlePreviewPan();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goToPreviewIndex(previewState.index - 1);
  if (event.key === 'ArrowRight') goToPreviewIndex(previewState.index + 1);
});

renderDetail();
