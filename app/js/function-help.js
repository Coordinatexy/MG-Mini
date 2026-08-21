(() => {
  const searchInput = document.querySelector('#helpSearch');
  const clearButton = document.querySelector('#helpSearchClear');
  const faqItems = [...document.querySelectorAll('.help-faq')];
  const resultCount = document.querySelector('#helpResultCount');
  const emptyState = document.querySelector('#helpEmpty');
  const videoSection = document.querySelector('#strategyVideoSection');

  const closeFaq = (item) => {
    item.classList.remove('is-open');
    const button = item.querySelector('.help-faq__question');
    button.setAttribute('aria-expanded', 'false');
    item.querySelector('.help-faq__answer').hidden = true;
  };

  const filterFaqs = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    const videoContent = `${videoSection.textContent} ${videoSection.dataset.keywords}`.toLowerCase();
    const videoVisible = !keyword || videoContent.includes(keyword);
    videoSection.hidden = !videoVisible;

    faqItems.forEach((item) => {
      const content = `${item.textContent} ${item.dataset.keywords}`.toLowerCase();
      const isVisible = !keyword || content.includes(keyword);
      item.hidden = !isVisible;
      if (!isVisible) closeFaq(item);
      if (isVisible) visibleCount += 1;
    });

    resultCount.textContent = `${visibleCount} 个问题`;
    emptyState.hidden = visibleCount !== 0 || videoVisible;
    clearButton.hidden = keyword.length === 0;
  };

  faqItems.forEach((item) => {
    const button = item.querySelector('.help-faq__question');
    button.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      faqItems.forEach(closeFaq);
      if (shouldOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
        item.querySelector('.help-faq__answer').hidden = false;
      }
    });
  });

  searchInput.addEventListener('input', filterFaqs);
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    filterFaqs();
  });

  const videoTrigger = document.querySelector('#strategyVideoTrigger');
  const videoOverlay = document.querySelector('#strategyVideoOverlay');
  const videoCloseButtons = videoOverlay.querySelectorAll('.help-video-backdrop, .help-video-close');

  const closeVideo = () => {
    videoOverlay.classList.remove('is-open');
    videoOverlay.setAttribute('aria-hidden', 'true');
    videoTrigger.focus();
  };

  videoTrigger.addEventListener('click', () => {
    videoOverlay.classList.add('is-open');
    videoOverlay.setAttribute('aria-hidden', 'false');
    videoOverlay.querySelector('.help-video-close').focus();
  });
  videoCloseButtons.forEach((button) => button.addEventListener('click', closeVideo));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && videoOverlay.classList.contains('is-open')) closeVideo();
  });
})();
