document.addEventListener('DOMContentLoaded', () => {
  const titlebarTitle = document.getElementById('windowTitle');
  const tabs = document.querySelectorAll('.tab[role="tab"]');
  const panels = document.querySelectorAll('.editor-panel[role="tabpanel"]');
  const tabCloseButtons = document.querySelectorAll('.tab-close');
  const newTabButton = document.querySelector('.tab-new');
  const fileTreeItems = document.querySelectorAll('.file-tree-item[role="treeitem"]');
  const themeToggle = document.getElementById('themeToggle');
  const editor = document.querySelector('.editor');
  const cursorPosition = document.getElementById('cursorPosition');

  let activeTabIndex = 0;
  let isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function updateTheme() {
    document.documentElement.style.setProperty('--color-surface', isDark ? '#1e1e1e' : '#ffffff');
    document.documentElement.style.setProperty('--color-surface-elevated', isDark ? '#252526' : '#fafafa');
    document.documentElement.style.setProperty('--color-chrome', isDark ? '#2d2d2d' : '#f5f5f5');
    document.documentElement.style.setProperty('--color-chrome-border', isDark ? '#3c3c3c' : '#e0e0e0');
    document.documentElement.style.setProperty('--color-editor', '#1e1e1e');
    document.documentElement.style.setProperty('--color-editor-text', '#d4d4d4');
    document.documentElement.style.setProperty('--color-text-primary', isDark ? '#e0e0e0' : '#1a1a1a');
    document.documentElement.style.setProperty('--color-text-secondary', isDark ? '#999999' : '#666666');
    document.documentElement.style.setProperty('--color-text-muted', isDark ? '#666666' : '#999999');
    themeToggle.textContent = isDark ? '☀' : '☾';
    themeToggle.setAttribute('aria-pressed', isDark);
  }

  function activateTab(index) {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', selected);
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      if (panels[i]) {
        panels[i].classList.toggle('hidden', !selected);
        if (selected) {
          const panelEditor = panels[i].querySelector('.editor');
          if (panelEditor) panelEditor.focus();
        }
      }
    });
    activeTabIndex = index;
  }

  function closeTab(index) {
    if (tabs.length <= 1) return;
    tabs[index].remove();
    panels[index].remove();
    const newTabs = document.querySelectorAll('.tab[role="tab"]');
    const newPanels = document.querySelectorAll('.editor-panel[role="tabpanel"]');
    if (index >= newTabs.length) index = newTabs.length - 1;
    activateTab(index);
  }

  function createNewTab() {
    const tabBar = document.querySelector('.tab-bar');
    const newIndex = tabs.length;
    const tabId = `tab-new-${Date.now()}`;
    const panelId = `panel-new-${Date.now()}`;

    const newTab = document.createElement('button');
    newTab.className = 'tab';
    newTab.setAttribute('role', 'tab');
    newTab.setAttribute('aria-selected', 'false');
    newTab.setAttribute('aria-controls', panelId);
    newTab.setAttribute('id', tabId);
    newTab.setAttribute('tabindex', '-1');
    newTab.innerHTML = `
      <span class="tab-title">Untitled-${newIndex + 1}</span>
      <button class="tab-close" aria-label="Close Untitled-${newIndex + 1}" tabindex="-1">×</button>
    `;

    const newPanel = document.createElement('div');
    newPanel.className = 'editor-panel hidden';
    newPanel.setAttribute('role', 'tabpanel');
    newPanel.setAttribute('id', panelId);
    newPanel.setAttribute('aria-labelledby', tabId);
    newPanel.innerHTML = '<textarea class="editor" spellcheck="false" aria-label="Editor for Untitled"></textarea>';

    tabBar.insertBefore(newTab, newTabButton);
    document.querySelector('.editor-area').appendChild(newPanel);

    newTab.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTabs = document.querySelectorAll('.tab[role="tab"]');
      const idx = Array.from(currentTabs).indexOf(newTab);
      closeTab(idx);
    });

    newTab.addEventListener('click', () => {
      const currentTabs = document.querySelectorAll('.tab[role="tab"]');
      activateTab(Array.from(currentTabs).indexOf(newTab));
    });

    activateTab(newIndex);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(index));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateTab(index);
      }
    });
  });

  tabCloseButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(index);
    });
  });

  newTabButton.addEventListener('click', createNewTab);
  newTabButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      createNewTab();
    }
  });

  fileTreeItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      fileTreeItems.forEach(i => i.setAttribute('aria-selected', 'false'));
      item.setAttribute('aria-selected', 'true');
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileTreeItems.forEach(i => i.setAttribute('aria-selected', 'false'));
        item.setAttribute('aria-selected', 'true');
      }
    });
  });

  themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    updateTheme();
  });

  themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isDark = !isDark;
      updateTheme();
    }
  });

  if (editor) {
    editor.addEventListener('input', () => {
      const pos = editor.selectionStart;
      const text = editor.value.substring(0, pos);
      const lines = text.split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      cursorPosition.textContent = `Ln ${line}, Col ${col}`;
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDark = e.matches;
    updateTheme();
  });

  window.matchMedia('prefers-contrast: more').addEventListener('change', () => {
    document.documentElement.style.setProperty('--color-chrome-border', '#000');
    document.documentElement.style.setProperty('--color-focus', '#ffff00');
  });

  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    document.documentElement.style.setProperty('--transition-fast', '0.01ms');
    document.documentElement.style.setProperty('--transition-normal', '0.01ms');
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
      e.preventDefault();
      closeTab(activeTabIndex);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      createNewTab();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      alert('Save not implemented in demo');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
      e.preventDefault();
      alert('Open not implemented in demo');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      alert('Settings not implemented in demo');
    }
  });

  updateTheme();
  activateTab(0);
});