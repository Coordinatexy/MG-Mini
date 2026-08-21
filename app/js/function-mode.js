const modeTabs = Array.from(document.querySelectorAll('[data-mode-tab]'));
const modePanels = Array.from(document.querySelectorAll('[data-mode-panel]'));

const setActiveMode = (mode) => {
  modeTabs.forEach((tab) => {
    const isActive = tab.dataset.modeTab === mode;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  modePanels.forEach((panel) => {
    panel.hidden = panel.dataset.modePanel !== mode;
  });
};

modeTabs.forEach((tab) => {
  tab.addEventListener('click', () => setActiveMode(tab.dataset.modeTab));
});
