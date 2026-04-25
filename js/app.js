// ─── Storage keys ─────────────────────────────────────────────────
const ARCHIVED_KEY      = 'thc_archived';
const BOOKS_KEY         = 'thc_books';
const CUSTOM_LINKS_KEY  = 'thc_custom_links';

// ─── State ────────────────────────────────────────────────────────
let currentView  = 'calendar';
let currentMonth = 0;
let archivedOpen = false;

// ─── Storage helpers ──────────────────────────────────────────────
function getArchived() {
  try { return new Set(JSON.parse(localStorage.getItem(ARCHIVED_KEY)) || []); }
  catch { return new Set(); }
}
function saveArchived(set) {
  localStorage.setItem(ARCHIVED_KEY, JSON.stringify([...set]));
}
function getAllBooks() {
  try { return JSON.parse(localStorage.getItem(BOOKS_KEY)) || {}; }
  catch { return {}; }
}
function saveAllBooks(obj) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(obj));
}
function getBooksForPost(id) {
  return (getAllBooks()[id] || []).map(normBook);
}
function getCustomLinks() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_LINKS_KEY)) || []; }
  catch { return []; }
}
function saveCustomLinks(arr) {
  localStorage.setItem(CUSTOM_LINKS_KEY, JSON.stringify(arr));
}

// ─── Backward compat: stored entries may be plain strings ─────────
function normBook(b) {
  if (typeof b === 'string') return { title: b, author: '' };
  return { title: b.title || '', author: b.author || '' };
}

function getAllAuthors() {
  const authors = new Set();
  Object.values(getAllBooks()).forEach(arr =>
    arr.forEach(b => { const a = normBook(b).author; if (a) authors.add(a); })
  );
  return [...authors].sort();
}

// ─── Book actions ────────────────────────────────────────────────
function addBook(postId) {
  const titleInput  = document.getElementById('binput-'  + postId);
  const authorInput = document.getElementById('bauthor-' + postId);
  if (!titleInput) return;
  const title  = titleInput.value.trim();
  if (!title) { titleInput.focus(); return; }
  const author = authorInput ? authorInput.value.trim() : '';
  const all = getAllBooks();
  if (!all[postId]) all[postId] = [];
  const exists = all[postId].some(b => normBook(b).title.toLowerCase() === title.toLowerCase());
  if (!exists) all[postId].push({ title, author });
  saveAllBooks(all);
  titleInput.value = '';
  if (authorInput) authorInput.value = '';
  titleInput.focus();
  refreshChips(postId);
  refreshAuthorsList();
}

function removeBook(postId, idx) {
  const all = getAllBooks();
  if (all[postId]) {
    all[postId].splice(idx, 1);
    if (!all[postId].length) delete all[postId];
    saveAllBooks(all);
  }
  refreshChips(postId);
  refreshAuthorsList();
}

function refreshChips(postId) {
  const el = document.getElementById('bchips-' + postId);
  if (!el) return;
  const books = getBooksForPost(postId);
  el.innerHTML = books.map((b, i) =>
    `<span class="book-chip">${esc(b.title)}${b.author ? `<span class="chip-author"> — ${esc(b.author)}</span>` : ''}<button class="chip-x" onclick="removeBook('${postId}',${i})" title="Remove">×</button></span>`
  ).join('');
}

function refreshAuthorsList() {
  const el = document.getElementById('global-authors-list');
  if (!el) return;
  el.innerHTML = getAllAuthors().map(a => `<option value="${esc(a)}">`).join('');
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Archive action ───────────────────────────────────────────────
function toggleArchived(id) {
  const archived = getArchived();
  if (archived.has(id)) { archived.delete(id); } else { archived.add(id); }
  saveArchived(archived);
  renderCalendar();
}

// ─── Platform badge ───────────────────────────────────────────────
function plBadge(pl) {
  if (pl === 'ig')    return '<span class="pbadge ig">Instagram</span>';
  if (pl === 'tt')    return '<span class="pbadge tt">TikTok</span>';
  if (pl === 'story') return '<span class="pbadge story">Story</span>';
  return '<span class="pbadge both">Both</span>';
}

// ─── Card builder ─────────────────────────────────────────────────
function buildCard(item, id, isStory, isArchived) {
  const title = item.title;
  const desc  = item.desc;
  const day   = isStory ? 'Story' : item.day;
  const pl    = isStory ? 'story' : item.pl;
  const books = getBooksForPost(id);
  const chips = books.map((b, i) =>
    `<span class="book-chip">${esc(b.title)}${b.author ? `<span class="chip-author"> — ${esc(b.author)}</span>` : ''}<button class="chip-x" onclick="removeBook('${id}',${i})" title="Remove">×</button></span>`
  ).join('');

  return `<div class="post-card${isStory ? ' story-card' : ''}${isArchived ? ' is-archived' : ''}" data-id="${id}">
    <div class="card-top-row">
      <div class="pday">${day}</div>
      ${plBadge(pl)}
      <button class="check-btn${isArchived ? ' checked' : ''}" onclick="toggleArchived('${id}')" title="${isArchived ? 'Unmark as posted' : 'Mark as posted'}">
        <span class="check-icon">${isArchived ? '✓' : ''}</span>
      </button>
    </div>
    <div class="ptitle">${esc(title)}</div>
    <div class="pdesc">${esc(desc)}</div>
    ${isStory ? '<div class="story-tip">Run throughout the week for max engagement</div>' : ''}
    ${isArchived ? '<div class="posted-label">Posted</div>' : ''}
    <div class="book-section">
      <div id="bchips-${id}" class="book-chips">${chips}</div>
      <div class="book-inputs">
        <input id="binput-${id}" type="text" class="book-input" placeholder="Book title…"
          onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('bauthor-${id}').focus();}">
        <div class="book-author-row">
          <input id="bauthor-${id}" type="text" class="book-input book-author-input" placeholder="Author…"
            list="global-authors-list"
            onkeydown="if(event.key==='Enter'){event.preventDefault();addBook('${id}');}">
          <button class="book-add-btn" onclick="addBook('${id}')">+</button>
        </div>
      </div>
    </div>
  </div>`;
}

// ─── Calendar view ────────────────────────────────────────────────
function renderCalendar() {
  const m         = months[currentMonth];
  const archived  = getArchived();
  const archCards = [];

  let html = `
    <datalist id="global-authors-list"></datalist>
    <div class="month-title-block">
      <div>
        <div class="month-title">${m.fullName}: ${m.label}</div>
        <div class="month-label">${m.theme}</div>
      </div>
      <div class="focus-badges">${m.focus.map(f => `<span class="fbadge">${f}</span>`).join('')}</div>
    </div>`;

  m.weeks.forEach((w, wi) => {
    const activePosts = [], activeStories = [];

    w.posts.forEach((p, pi) => {
      const id = `m${currentMonth}-w${wi}-p${pi}`;
      (archived.has(id) ? archCards : activePosts).push(buildCard(p, id, false, archived.has(id)));
    });

    (w.stories || []).forEach((s, si) => {
      const id = `m${currentMonth}-w${wi}-s${si}`;
      (archived.has(id) ? archCards : activeStories).push(buildCard(s, id, true, archived.has(id)));
    });

    if (!activePosts.length && !activeStories.length) return;

    html += `<div class="week-section">
      <div class="week-label">${w.label}</div>`;
    if (activePosts.length)   html += `<div class="posts-grid">${activePosts.join('')}</div>`;
    if (activeStories.length) html += `
      <div class="stories-label"><span>Instagram Stories</span></div>
      <div class="posts-grid">${activeStories.join('')}</div>`;
    html += `</div>`;
  });

  if (archCards.length) {
    html += `
    <div class="archived-section">
      <button class="archived-header" onclick="toggleArchivedPanel(this)">
        <span class="archived-title">Archived <span class="archived-count">${archCards.length}</span></span>
        <span class="archived-chevron${archivedOpen ? ' open' : ''}">▼</span>
      </button>
      <div class="archived-body${archivedOpen ? ' open' : ''}">
        <div class="posts-grid">${archCards.join('')}</div>
      </div>
    </div>`;
  }

  html += `
    <div class="cta-bar">
      <div class="cta-label">Ready to create content for ${m.fullName}?</div>
      <a class="cta-btn primary" href="https://claude.ai" target="_blank" rel="noopener">Write captions →</a>
      <a class="cta-btn" href="https://claude.ai" target="_blank" rel="noopener">Get TikTok scripts →</a>
    </div>`;

  document.getElementById('main-content').innerHTML = html;
  refreshAuthorsList();
}

function toggleArchivedPanel(btn) {
  archivedOpen = !archivedOpen;
  btn.nextElementSibling.classList.toggle('open', archivedOpen);
  btn.querySelector('.archived-chevron').classList.toggle('open', archivedOpen);
}

// ─── Books view ───────────────────────────────────────────────────
function filterBooks(author) {
  document.querySelectorAll('.book-card').forEach(card => {
    const match = author === 'all' || (card.dataset.author || '') === author;
    card.style.display = match ? '' : 'none';
  });
  document.querySelectorAll('.author-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.author === author);
  });
}

function renderBooksView() {
  const allBooks = getAllBooks();
  const bookMap  = {};

  months.forEach((m, mi) => {
    m.weeks.forEach((w, wi) => {
      const collect = (items, prefix) => {
        items.forEach((item, ii) => {
          const id = `m${mi}-w${wi}-${prefix}${ii}`;
          (allBooks[id] || []).map(normBook).forEach(b => {
            const key = `${b.title}||${b.author}`;
            if (!bookMap[key]) bookMap[key] = { title: b.title, author: b.author, mentions: [] };
            bookMap[key].mentions.push({ monthName: m.fullName, postTitle: item.title });
          });
        });
      };
      collect(w.posts, 'p');
      collect(w.stories || [], 's');
    });
  });

  const entries = Object.values(bookMap)
    .sort((a, b) => b.mentions.length - a.mentions.length || a.title.localeCompare(b.title));

  const authors = [...new Set(entries.map(e => e.author).filter(Boolean))].sort();

  let html = `<div class="books-view">
    <div class="view-header">
      <div class="view-header-title">Books Mentioned</div>
      <div class="view-header-sub">Every book you've tagged across all posts. Filter by author or browse the full list.</div>
    </div>`;

  if (!entries.length) {
    html += `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">No books added yet</div>
      <div class="empty-desc">Go to any post in the Calendar and add a book title — you can also tag the author for filtering here.</div>
    </div>`;
  } else {
    html += `<div class="books-filter-bar">
      <button class="author-pill active" data-author="all" onclick="filterBooks(this.dataset.author)">All <span class="pill-count">${entries.length}</span></button>`;
    authors.forEach(a => {
      const count = entries.filter(e => e.author === a).length;
      html += `<button class="author-pill" data-author="${esc(a)}" onclick="filterBooks(this.dataset.author)">${esc(a)} <span class="pill-count">${count}</span></button>`;
    });
    html += `</div><div class="books-grid">`;

    entries.forEach(e => {
      const initial   = e.title.charAt(0).toUpperCase();
      const monthsSet = [...new Set(e.mentions.map(m => m.monthName))].join(' · ');
      html += `<div class="book-card" data-author="${esc(e.author)}">
        <div class="book-card-initial">${esc(initial)}</div>
        <div class="book-card-body">
          <div class="book-card-title">${esc(e.title)}</div>
          ${e.author ? `<div class="book-card-author">${esc(e.author)}</div>` : ''}
          <div class="book-card-months">${esc(monthsSet)}</div>
          <div class="book-card-count">${e.mentions.length} post${e.mentions.length !== 1 ? 's' : ''}</div>
        </div>
      </div>`;
    });

    html += `</div>`;
  }

  html += `</div>`;
  document.getElementById('main-content').innerHTML = html;
}

// ─── Custom links actions ─────────────────────────────────────────
let addResourceOpen = false;

function toggleAddResourceForm() {
  addResourceOpen = !addResourceOpen;
  const form = document.getElementById('add-resource-form');
  const btn  = document.getElementById('add-resource-toggle');
  if (form) form.classList.toggle('open', addResourceOpen);
  if (btn)  btn.textContent = addResourceOpen ? '− Cancel' : '+ Add a link';
}

function addCustomLink() {
  const title = document.getElementById('rl-title').value.trim();
  const url   = document.getElementById('rl-url').value.trim();
  const desc  = document.getElementById('rl-desc').value.trim();
  const cat   = document.getElementById('rl-cat').value.trim() || 'Custom';
  if (!title || !url) {
    document.getElementById('rl-error').textContent = 'Title and URL are required.';
    return;
  }
  const links = getCustomLinks();
  links.push({ title, url, desc, category: cat });
  saveCustomLinks(links);
  addResourceOpen = false;
  renderResourcesView();
}

function removeCustomLink(idx) {
  const links = getCustomLinks();
  links.splice(idx, 1);
  saveCustomLinks(links);
  renderResourcesView();
}

// ─── Resources view ───────────────────────────────────────────────
const resources = [
  {
    title: "Wife & Husband in the Title",
    desc: "Books with 'wife' or 'husband' in the title — the core of The Husband's Corner identity and your richest source for Husband's Bait content.",
    category: "Account Niche",
    url: "https://www.goodreads.com/list/show/133358.Books_with_Wife_or_Husband_in_the_title"
  },
  {
    title: "Thrillers Worth Reading",
    desc: "A Goodreads-vetted collection of thrillers that genuinely deliver. Great pool for Two for Tuesday comparison ideas.",
    category: "Thrillers",
    url: "https://www.goodreads.com/list/show/186779.Thrillers_Worth_Reading"
  },
  {
    title: "Most Unexpected Plot Twists",
    desc: "Books celebrated for jaw-dropping reveals — perfect for reaction content, plot twist posts, and spoiler-free bait that gets followers desperate to guess.",
    category: "Plot Twists",
    url: "https://www.goodreads.com/list/show/72434.Books_with_Most_Unexpected_Plot_Twist_"
  },
  {
    title: "Twisted",
    desc: "Dark, disturbing, psychologically complex reads. Where thriller meets horror and nothing is what it seems. Your horror content source.",
    category: "Dark Reads",
    url: "https://www.goodreads.com/list/show/93138.Twisted"
  },
  {
    title: "Best Books to Ever Exist",
    desc: "A crowd-sourced all-time greats list — spot which titles cross into broader mainstream appeal beyond the thriller community.",
    category: "All-Time Greats",
    url: "https://www.goodreads.com/list/show/180274.Best_books_to_ever_exist"
  },
  {
    title: "Dead All Along",
    desc: "Mysteries and thrillers where the big reveal recontextualises everything. Books where the truth was hidden from page one — perfect for twist content.",
    category: "Mysteries",
    url: "https://www.goodreads.com/list/show/171658.Dead_All_Along"
  }
];

function renderResourcesView() {
  const custom = getCustomLinks();

  let html = `<div class="resources-view">
    <div class="view-header">
      <div class="view-header-title">Reading Lists</div>
      <div class="view-header-sub">Curated lists to help you plan content and discover what to feature next.</div>
    </div>
    <div class="resources-grid">`;

  resources.forEach(r => {
    html += `<div class="resource-card">
      <div class="resource-category">${r.category}</div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-desc">${r.desc}</div>
      <a class="resource-btn" href="${r.url}" target="_blank" rel="noopener">Open List →</a>
    </div>`;
  });

  custom.forEach((r, i) => {
    html += `<div class="resource-card resource-card--custom">
      <button class="resource-delete" onclick="removeCustomLink(${i})" title="Remove">×</button>
      <div class="resource-category">${esc(r.category)}</div>
      <div class="resource-title">${esc(r.title)}</div>
      ${r.desc ? `<div class="resource-desc">${esc(r.desc)}</div>` : ''}
      <a class="resource-btn" href="${esc(r.url)}" target="_blank" rel="noopener">Open List →</a>
    </div>`;
  });

  html += `</div>

    <div class="add-resource-panel">
      <button class="add-resource-toggle" id="add-resource-toggle" onclick="toggleAddResourceForm()">+ Add a link</button>
      <div class="add-resource-form" id="add-resource-form">
        <div class="rl-row">
          <input id="rl-title" type="text" class="rl-input" placeholder="List title *">
          <input id="rl-cat"   type="text" class="rl-input" placeholder="Category (e.g. Horror)">
        </div>
        <input id="rl-url"  type="url"  class="rl-input rl-full" placeholder="https://... *">
        <textarea id="rl-desc" class="rl-input rl-full rl-textarea" placeholder="Short description (optional)" rows="2"></textarea>
        <div class="rl-actions">
          <span id="rl-error" class="rl-error"></span>
          <button class="rl-save" onclick="addCustomLink()">Save link</button>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('main-content').innerHTML = html;
}

// ─── Navigation ───────────────────────────────────────────────────
function renderMonthNav() {
  document.getElementById('month-nav').innerHTML = months.map((m, i) =>
    `<button class="mnav${i === currentMonth ? ' active' : ''}" onclick="setMonth(${i})">${m.name}</button>`
  ).join('');
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.vnav').forEach(b => b.classList.remove('active'));
  document.getElementById('vnav-' + view).classList.add('active');
  const mnw = document.getElementById('month-nav-wrap');
  mnw.style.display = view === 'calendar' ? '' : 'none';
  if (view === 'calendar')        { renderMonthNav(); renderCalendar(); }
  else if (view === 'books')      renderBooksView();
  else if (view === 'resources')  renderResourcesView();
}

function setMonth(i) {
  currentMonth = i;
  archivedOpen = false;
  renderMonthNav();
  renderCalendar();
  const mainTop = document.querySelector('.main').offsetTop - 70;
  window.scrollTo({ top: mainTop, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  months.forEach(m => {
    const week4 = m.weeks[3];
    if (week4) {
      week4.posts.push({
        day: "Sun", pl: "both",
        title: "Monthly Wrap-Up",
        desc: `Round up every book read or featured in ${m.fullName}. Share your Goodreads challenge progress — books read vs annual goal — and show how your 2026 reading year is looking overall so far.`
      });
    }
  });

  renderMonthNav();
  renderCalendar();
});
