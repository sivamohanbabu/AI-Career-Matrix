/* ==========================================================================
   THE DEFINITIVE AI ROLES, TECHNOLOGIES & ROADMAP MASTER PORTAL
   Interactive Application Logic & Controller
   Author: Siva Veludurthi
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initReadingProgress();
  initScrollspy();
  initSearchPalette();
  initRoleFilters();
  initRoadmapTabs();
  initDrawioHelpers();
  initMobileMenu();
});

/* --------------------------------------------------------------------------
   1. Theme Management
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('ai-roles-portal-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const active = document.documentElement.getAttribute('data-theme');
      const next = active === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ai-roles-portal-theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next} theme`);
    });
  }
}

function updateThemeIcon(theme) {
  const iconSpan = document.getElementById('theme-icon');
  if (!iconSpan) return;
  if (theme === 'dark') {
    iconSpan.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  } else {
    iconSpan.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  }
}

/* --------------------------------------------------------------------------
   2. Reading Progress
   -------------------------------------------------------------------------- */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   3. Scrollspy
   -------------------------------------------------------------------------- */
function initScrollspy() {
  const headings = Array.from(document.querySelectorAll('.main-content h2, .main-content h3'));
  const tocLinks = Array.from(document.querySelectorAll('.toc-nav-link'));

  if (!headings.length || !tocLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px' });

  headings.forEach(heading => {
    if (heading.id) observer.observe(heading);
  });
}

/* --------------------------------------------------------------------------
   4. Search Palette / Command Center (Ctrl+K)
   -------------------------------------------------------------------------- */
function initSearchPalette() {
  const modal = document.getElementById('search-modal');
  const triggerBtn = document.getElementById('search-trigger');
  const input = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  
  if (!modal || !input || !resultsContainer) return;

  const index = [];
  document.querySelectorAll('.role-card').forEach(card => {
    const name = card.querySelector('.role-name')?.textContent.trim() || '';
    const summary = card.querySelector('.role-summary')?.textContent.slice(0, 140) + '...' || '';
    const id = card.id || '';
    index.push({ title: `Role: ${name}`, id, category: 'AI Roles', snippet: summary });
  });

  document.querySelectorAll('.main-content h2, .main-content h3').forEach(el => {
    const title = el.textContent.replace('#', '').trim();
    const id = el.id || '';
    const nextP = el.nextElementSibling?.tagName === 'P' ? el.nextElementSibling.textContent.slice(0, 120) + '...' : '';
    index.push({ title, id, category: 'Section', snippet: nextP });
  });

  const openSearch = () => {
    modal.classList.add('open');
    input.value = '';
    renderSearchResults('');
    setTimeout(() => input.focus(), 50);
  };

  const closeSearch = () => modal.classList.remove('open');

  if (triggerBtn) triggerBtn.addEventListener('click', openSearch);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.classList.contains('open') ? closeSearch() : openSearch();
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeSearch();
    }
  });

  input.addEventListener('input', (e) => {
    renderSearchResults(e.target.value.trim().toLowerCase());
  });

  function renderSearchResults(query) {
    resultsContainer.innerHTML = '';
    const filtered = query 
      ? index.filter(item => item.title.toLowerCase().includes(query) || item.snippet.toLowerCase().includes(query))
      : index.slice(0, 7);

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `<li style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">No matching roles or topics found for "${query}"</li>`;
      return;
    }

    filtered.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = `search-result-item ${idx === 0 ? 'selected' : ''}`;
      li.innerHTML = `
        <div class="search-result-title">${item.title}</div>
        <div class="search-result-snippet"><strong style="color: var(--accent-primary);">${item.category}:</strong> ${item.snippet}</div>
      `;
      li.addEventListener('click', () => {
        closeSearch();
        if (item.id) {
          const target = document.getElementById(item.id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, '', `#${item.id}`);
          }
        }
      });
      resultsContainer.appendChild(li);
    });
  }
}

/* --------------------------------------------------------------------------
   5. Interactive Role Filters
   -------------------------------------------------------------------------- */
function initRoleFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const roleCards = document.querySelectorAll('.role-card');

  if (!filterPills.length || !roleCards.length) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.getAttribute('data-filter');

      roleCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   6. Career Roadmap Stepper Tabs
   -------------------------------------------------------------------------- */
function initRoadmapTabs() {
  const tabButtons = document.querySelectorAll('.roadmap-tab-btn');
  const roadmapPanes = document.querySelectorAll('.roadmap-content-pane');

  if (!tabButtons.length || !roadmapPanes.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      roadmapPanes.forEach(pane => pane.style.display = 'none');

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const activePane = document.getElementById(targetId);
      if (activePane) {
        activePane.style.display = 'block';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Draw.io Interactive Helpers
   -------------------------------------------------------------------------- */
function initDrawioHelpers() {
  document.querySelectorAll('.btn-copy-drawio').forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetPre = document.getElementById(btn.getAttribute('data-source'));
      if (!targetPre) return;
      try {
        await navigator.clipboard.writeText(targetPre.innerText);
        showToast('Draw.io XML copied to clipboard! Paste into diagrams.net');
      } catch (e) {
        showToast('Failed to copy XML');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Mobile Drawer Menu
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar-left');
  
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* --------------------------------------------------------------------------
   9. Toast Utility
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
