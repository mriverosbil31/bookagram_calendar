// ─── Storage keys ─────────────────────────────────────────────────
const ARCHIVED_KEY = 'thc_archived';
const BOOKS_KEY    = 'thc_books';

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
  return getAllBooks()[id] || [];
}

// ─── Book actions (no page re-render) ────────────────────────────
function addBook(postId) {
  const input = document.getElementById('binput-' + postId);
  if (!input) return;
  const title = input.value.trim();
  if (!title) return;
  const all = getAllBooks();
  if (!all[postId]) all[postId] = [];
  if (!all[postId].includes(title)) all[postId].push(title);
  saveAllBooks(all);
  input.value = '';
  refreshChips(postId);
}

function removeBook(postId, idx) {
  const all = getAllBooks();
  if (all[postId]) {
    all[postId].splice(idx, 1);
    if (!all[postId].length) delete all[postId];
    saveAllBooks(all);
  }
  refreshChips(postId);
}

function refreshChips(postId) {
  const el = document.getElementById('bchips-' + postId);
  if (!el) return;
  const books = getBooksForPost(postId);
  el.innerHTML = books.map((b, i) =>
    `<span class="book-chip">${esc(b)}<button class="chip-x" onclick="removeBook('${postId}',${i})" title="Remove">×</button></span>`
  ).join('');
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Archive action (re-renders calendar) ────────────────────────
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
    `<span class="book-chip">${esc(b)}<button class="chip-x" onclick="removeBook('${id}',${i})" title="Remove">×</button></span>`
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
      <div class="book-input-row">
        <input id="binput-${id}" type="text" class="book-input" placeholder="Add book title…" onkeydown="if(event.key==='Enter')addBook('${id}')">
        <button class="book-add-btn" onclick="addBook('${id}')">+</button>
      </div>
    </div>
  </div>`;
}

// ─── Calendar view ────────────────────────────────────────────────
function renderCalendar() {
  const m        = months[currentMonth];
  const archived = getArchived();
  const archCards = [];

  let html = `
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
}

function toggleArchivedPanel(btn) {
  archivedOpen = !archivedOpen;
  btn.nextElementSibling.classList.toggle('open', archivedOpen);
  btn.querySelector('.archived-chevron').classList.toggle('open', archivedOpen);
}

// ─── Books view ───────────────────────────────────────────────────
function renderBooksView() {
  const allBooks = getAllBooks();
  // bookMap: title -> [{monthName, postTitle, id}]
  const bookMap = {};

  months.forEach((m, mi) => {
    m.weeks.forEach((w, wi) => {
      const collect = (items, prefix) => {
        items.forEach((item, ii) => {
          const id = `m${mi}-w${wi}-${prefix}${ii}`;
          (allBooks[id] || []).forEach(title => {
            if (!bookMap[title]) bookMap[title] = [];
            bookMap[title].push({ id, monthName: m.fullName, postTitle: item.title });
          });
        });
      };
      collect(w.posts, 'p');
      collect(w.stories || [], 's');
    });
  });

  const entries = Object.entries(bookMap)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  let html = `<div class="books-view">
    <div class="view-header">
      <div class="view-header-title">Books Mentioned</div>
      <div class="view-header-sub">Every book you've added across all posts, sorted by how often they appear.</div>
    </div>`;

  if (!entries.length) {
    html += `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">No books added yet</div>
      <div class="empty-desc">Go to any post in the Calendar and type a book title in the field at the bottom of the card.</div>
    </div>`;
  } else {
    html += `<div class="books-list">`;
    entries.forEach(([title, mentions]) => {
      const months_set = [...new Set(mentions.map(m => m.monthName))].join(' · ');
      html += `<div class="book-row">
        <div class="book-row-info">
          <div class="book-row-title">${esc(title)}</div>
          <div class="book-row-months">${months_set}</div>
        </div>
        <div class="book-row-count">${mentions.length}</div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  document.getElementById('main-content').innerHTML = html;
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
  let html = `<div class="resources-view">
    <div class="view-header">
      <div class="view-header-title">Reading Lists</div>
      <div class="view-header-sub">Curated Goodreads lists to help you plan content and discover what to feature next.</div>
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

  html += `</div></div>`;
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
  if (view === 'calendar')   { renderMonthNav(); renderCalendar(); }
  else if (view === 'books')     renderBooksView();
  else if (view === 'resources') renderResourcesView();
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
  renderMonthNav();
  renderCalendar();
});
