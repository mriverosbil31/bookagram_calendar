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
  getJournal().forEach(e => { if (e.author) authors.add(e.author); });
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

// ─── Reading Journal ──────────────────────────────────────────────
const JOURNAL_KEY = 'thc_journal';
let jnlState = { sort: 'date', author: 'all' };
let _jnlEditIdx = -1;

function getJournal() {
  try { return JSON.parse(localStorage.getItem(JOURNAL_KEY)) || []; }
  catch { return []; }
}
function saveJournal(arr) { localStorage.setItem(JOURNAL_KEY, JSON.stringify(arr)); }

// ── Half-star picker ──────────────────────────────────────────────
function clickStarPicker(event, hiddenId, pickerId) {
  const slot = event.target.closest('.star-slot');
  if (!slot) return;
  const n   = parseFloat(slot.dataset.n);
  const rect = slot.getBoundingClientRect();
  const val  = (event.clientX - rect.left) < rect.width / 2 ? n - 0.5 : n;
  const final = Math.max(0.5, val);
  document.getElementById(hiddenId).value = final;
  updatePickerDisplay(pickerId, final);
}

function updatePickerDisplay(pickerId, val) {
  val = parseFloat(val) || 0;
  const picker = document.getElementById(pickerId);
  if (!picker) return;
  picker.querySelectorAll('.star-slot').forEach((s, i) => {
    const n = i + 1;
    s.dataset.fill = val >= n ? 'full' : val >= n - 0.5 ? 'half' : 'empty';
  });
  const hint = document.getElementById(pickerId + '-hint');
  if (hint) hint.textContent = val > 0 ? `${val} / 5` : '';
}

function starPickerHtml(pickerId, hiddenId) {
  return `<div class="jnl-star-picker" id="${pickerId}"
      onclick="clickStarPicker(event,'${hiddenId}','${pickerId}')">${
    [1,2,3,4,5].map(n =>
      `<span class="star-slot" data-n="${n}" data-fill="empty">★</span>`
    ).join('')
  }</div><input type="hidden" id="${hiddenId}" value="0">`;
}

// ── Saga input toggle ─────────────────────────────────────────────
function toggleSagaInput(inputId, show) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.display = show ? '' : 'none';
  if (!show) el.value = '';
}

// ── CRUD ──────────────────────────────────────────────────────────
function addJournalEntry() {
  const title    = document.getElementById('jnl-title').value.trim();
  const author   = document.getElementById('jnl-author').value.trim();
  const rating   = parseFloat(document.getElementById('jnl-rating-val')?.value) || 0;
  const dateRead = document.getElementById('jnl-date').value;
  const thoughts = document.getElementById('jnl-thoughts').value.trim();
  const isSaga   = document.getElementById('jnl-is-saga')?.checked;
  const sagaName = isSaga ? (document.getElementById('jnl-saga-name')?.value.trim() || null) : null;
  if (!title)    { document.getElementById('jnl-title').focus(); return; }
  if (!thoughts) { document.getElementById('jnl-thoughts').focus(); return; }
  const j = getJournal();
  j.unshift({ title, author, rating, dateRead, thoughts, sagaName, addedAt: Date.now() });
  saveJournal(j);
  renderJournalView();
}

function removeJournalEntry(idx) {
  const j = getJournal();
  j.splice(idx, 1);
  saveJournal(j);
  renderJournalView();
}

// ── Edit modal ────────────────────────────────────────────────────
function openEditModal(idx) {
  const entry = getJournal()[idx];
  if (!entry) return;
  _jnlEditIdx = idx;

  let ov = document.getElementById('jnl-edit-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'jnl-edit-ov';
    ov.className = 'jnl-modal-overlay';
    ov.innerHTML = `<div class="jnl-modal jnl-edit-modal">
      <div class="jnl-modal-hd">Edit entry</div>
      <div class="jnl-form" style="gap:10px">
        <div class="jnl-row">
          <input id="edit-title"  type="text" class="jnl-input" placeholder="Book title *">
          <input id="edit-author" type="text" class="jnl-input" placeholder="Author" list="global-authors-list">
          <input id="edit-date"   type="date" class="jnl-input jnl-date-fld">
        </div>
        <div class="jnl-rating-row">
          <span class="jnl-label">Rating:</span>
          ${starPickerHtml('edit-picker','edit-rating-val')}
          <span class="jnl-rating-hint" id="edit-picker-hint"></span>
        </div>
        <div class="jnl-saga-row">
          <label class="jnl-saga-label">
            <input type="checkbox" id="edit-is-saga" onchange="toggleSagaInput('edit-saga-name',this.checked)">
            <span>Part of a saga / trilogy</span>
          </label>
          <input id="edit-saga-name" type="text" class="jnl-input" placeholder="Saga name…" style="display:none">
        </div>
        <textarea id="edit-thoughts" class="jnl-input jnl-ta" rows="6" placeholder="Raw thoughts…"></textarea>
      </div>
      <div class="jnl-modal-ft">
        <button class="jnl-modal-close" onclick="closeEditModal()">Cancel</button>
        <button class="jnl-modal-save"  onclick="saveEditModal()">Save changes</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) closeEditModal(); });
  }

  document.getElementById('edit-title').value    = entry.title;
  document.getElementById('edit-author').value   = entry.author   || '';
  document.getElementById('edit-date').value     = entry.dateRead || '';
  document.getElementById('edit-thoughts').value = entry.thoughts;
  document.getElementById('edit-rating-val').value = entry.rating || 0;
  document.getElementById('edit-is-saga').checked  = !!entry.sagaName;
  const sn = document.getElementById('edit-saga-name');
  sn.value = entry.sagaName || '';
  sn.style.display = entry.sagaName ? '' : 'none';
  updatePickerDisplay('edit-picker', entry.rating || 0);
  ov.style.display = 'flex';
}

function closeEditModal() {
  const ov = document.getElementById('jnl-edit-ov');
  if (ov) ov.style.display = 'none';
}

function saveEditModal() {
  if (_jnlEditIdx < 0) return;
  const title    = document.getElementById('edit-title').value.trim();
  const author   = document.getElementById('edit-author').value.trim();
  const rating   = parseFloat(document.getElementById('edit-rating-val').value) || 0;
  const dateRead = document.getElementById('edit-date').value;
  const thoughts = document.getElementById('edit-thoughts').value.trim();
  const isSaga   = document.getElementById('edit-is-saga').checked;
  const sagaName = isSaga ? (document.getElementById('edit-saga-name').value.trim() || null) : null;
  if (!title)    { document.getElementById('edit-title').focus(); return; }
  if (!thoughts) { document.getElementById('edit-thoughts').focus(); return; }
  const j = getJournal();
  if (!j[_jnlEditIdx]) return;
  Object.assign(j[_jnlEditIdx], { title, author, rating, dateRead, thoughts, sagaName });
  saveJournal(j);
  closeEditModal();
  renderJournalView();
}

// ── Claude ────────────────────────────────────────────────────────
function buildClaudePrompt(entry) {
  const r    = Math.min(Math.max(parseFloat(entry.rating) || 0, 0), 5);
  const full = Math.floor(r);
  const half = r % 1 >= 0.5;
  const stars = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  return `You are helping The Husband's Corner — a Bookstagram & BookTok account focused on thriller, mystery and suspense.

Book: "${entry.title}"${entry.author ? ` by ${entry.author}` : ''}
My rating: ${stars} (${r}/5)${entry.dateRead ? `\nDate read: ${entry.dateRead}` : ''}${entry.sagaName ? `\nSaga / Trilogy: ${entry.sagaName}` : ''}

My raw thoughts:
${entry.thoughts}

Please give me:
1. A polished one-paragraph review for my records (authentic, opinionated, no spoilers)
2. An Instagram carousel caption (strong hook · body · CTA · 5 hashtags, thriller-niche tone)
3. A TikTok hook for the first 5 seconds (punchy, scroll-stopping, makes people stop)
4. Three content angle ideas tailored to The Husband's Corner (dark, literary, husband-perspective)

Voice: passionate, slightly obsessed — a husband who reads every thriller his wife is too scared to pick up alone.`;
}

function openWithClaude(idx) {
  const entry = getJournal()[idx];
  if (!entry) return;
  const prompt = buildClaudePrompt(entry);
  const doOpen = () => window.open('https://claude.ai', '_blank', 'noopener');
  const fallback = () => { showPromptModal(prompt); doOpen(); };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(prompt)
      .then(() => { showJnlToast('Prompt copied! Paste it into Claude ↗'); doOpen(); })
      .catch(fallback);
  } else { fallback(); }
}

function showJnlToast(msg) {
  let t = document.getElementById('jnl-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'jnl-toast';
    t.className = 'jnl-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(t._tmr);
  t._tmr = setTimeout(() => t.classList.remove('visible'), 4000);
}

function showPromptModal(prompt) {
  let ov = document.getElementById('jnl-prompt-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'jnl-prompt-ov';
    ov.className = 'jnl-modal-overlay';
    ov.innerHTML = `<div class="jnl-modal">
      <div class="jnl-modal-hd">Copy this prompt and paste into Claude</div>
      <textarea class="jnl-modal-ta" id="jnl-prompt-ta" readonly></textarea>
      <div class="jnl-modal-ft">
        <button class="jnl-modal-close" onclick="document.getElementById('jnl-prompt-ov').style.display='none'">Close</button>
        <button class="jnl-modal-save" onclick="var ta=document.getElementById('jnl-prompt-ta');ta.select();document.execCommand('copy');showJnlToast('Copied!')">Copy all</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.style.display = 'none'; });
  }
  document.getElementById('jnl-prompt-ta').value = prompt;
  ov.style.display = 'flex';
}

// ── Display helpers ───────────────────────────────────────────────
function renderJnlStars(n) {
  n = Math.min(Math.max(parseFloat(n) || 0, 0), 5);
  return [1,2,3,4,5].map(i => {
    if (n >= i)       return '<span class="jnl-star full">★</span>';
    if (n >= i - 0.5) return '<span class="jnl-star half">★</span>';
    return '<span class="jnl-star empty">★</span>';
  }).join('');
}

function jnlFormatDate(d) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Filter / sort ─────────────────────────────────────────────────
function filterJournalByAuthor(author) {
  jnlState.author = author;
  applyJournalFilters();
}

function sortJournal(by) {
  jnlState.sort = by;
  applyJournalFilters();
}

function applyJournalFilters() {
  const all = getJournal();
  let filtered = jnlState.author === 'all'
    ? [...all]
    : all.filter(e => (e.author || '') === jnlState.author);
  if (jnlState.sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.addedAt - a.addedAt);
  }
  document.querySelectorAll('.jnl-sort-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.sort === jnlState.sort));
  document.querySelectorAll('.jnl-apill').forEach(p =>
    p.classList.toggle('active', p.dataset.author === jnlState.author));
  renderJournalGrid(filtered, all);
}

// ── Card toggle ───────────────────────────────────────────────────
function toggleCard(idx) {
  document.getElementById('jnl-card-' + idx)?.classList.toggle('open');
}

function toggleSagaStack(id) {
  document.getElementById(id)?.classList.toggle('open');
}

// ── Standalone card ───────────────────────────────────────────────
function renderStandaloneCard(e, all) {
  const idx     = all.indexOf(e);
  const initial = e.title.charAt(0).toUpperCase();
  const dt      = e.dateRead ? jnlFormatDate(e.dateRead) : '';
  return `<div class="jnl-card" id="jnl-card-${idx}">
    <div class="jnl-card-hd" onclick="toggleCard(${idx})">
      <div class="jnl-initial">${esc(initial)}</div>
      <div class="jnl-meta">
        <div class="jnl-ttl">${esc(e.title)}</div>
        ${e.author ? `<span class="jnl-auth" onclick="filterJournalByAuthor(this.dataset.author);event.stopPropagation()" data-author="${esc(e.author)}" title="Filter by author">${esc(e.author)}</span>` : ''}
        <div class="jnl-stars-row">${renderJnlStars(e.rating)}${dt ? `<span class="jnl-dt">· ${dt}</span>` : ''}${e.sagaName ? `<span class="jnl-saga-tag">📚 ${esc(e.sagaName)}</span>` : ''}</div>
      </div>
      <span class="jnl-chevron">▾</span>
    </div>
    <div class="jnl-card-body">
      <div class="jnl-thoughts">${esc(e.thoughts).replace(/\n/g, '<br>')}</div>
      <div class="jnl-footer">
        <button class="jnl-del-btn" onclick="removeJournalEntry(${idx});event.stopPropagation()" title="Delete">Delete</button>
        <button class="jnl-edit-btn" onclick="openEditModal(${idx});event.stopPropagation()">Edit</button>
        <button class="claude-btn" onclick="openWithClaude(${idx});event.stopPropagation()">
          <span class="claude-icon">✦</span> Ask Claude
        </button>
      </div>
    </div>
  </div>`;
}

// ── Saga stack card ───────────────────────────────────────────────
function renderSagaStack(sagaName, entries, all) {
  const sorted   = [...entries].sort((a, b) => b.addedAt - a.addedAt);
  const front    = sorted[0];
  const count    = entries.length;
  const stackId  = 'saga-' + all.indexOf(front);
  const initial  = front.title.charAt(0).toUpperCase();
  const dt       = front.dateRead ? jnlFormatDate(front.dateRead) : '';

  return `<div class="saga-stack${count >= 2 ? ' has-bg2' : ''}${count >= 3 ? ' has-bg3' : ''}" id="${stackId}">
    ${count >= 3 ? '<div class="saga-bg saga-bg3"></div>' : ''}
    ${count >= 2 ? '<div class="saga-bg saga-bg2"></div>' : ''}
    <div class="jnl-card saga-front">
      <div class="jnl-card-hd" onclick="toggleSagaStack('${stackId}')">
        <div class="jnl-initial">${esc(initial)}</div>
        <div class="jnl-meta">
          <div class="jnl-saga-label-row">
            <span class="saga-name-badge">📚 ${esc(sagaName)}</span>
            <span class="saga-count-badge">${count} book${count !== 1 ? 's' : ''}</span>
          </div>
          <div class="jnl-ttl">${esc(front.title)}</div>
          ${front.author ? `<span class="jnl-auth" onclick="filterJournalByAuthor(this.dataset.author);event.stopPropagation()" data-author="${esc(front.author)}" title="Filter by author">${esc(front.author)}</span>` : ''}
          <div class="jnl-stars-row">${renderJnlStars(front.rating)}${dt ? `<span class="jnl-dt">· ${dt}</span>` : ''}</div>
        </div>
        <span class="jnl-chevron">▾</span>
      </div>
      <div class="saga-expanded">
        ${sorted.map(e => {
          const idx = all.indexOf(e);
          const edt = e.dateRead ? jnlFormatDate(e.dateRead) : '';
          return `<div class="saga-book-row">
            <div class="saga-book-info">
              <div class="jnl-ttl" style="font-size:13px">${esc(e.title)}</div>
              <div class="jnl-stars-row">${renderJnlStars(e.rating)}${edt ? `<span class="jnl-dt">· ${edt}</span>` : ''}</div>
              ${e.thoughts ? `<div class="saga-book-thoughts">${esc(e.thoughts.length > 120 ? e.thoughts.slice(0,120)+'…' : e.thoughts).replace(/\n/g,'<br>')}</div>` : ''}
            </div>
            <div class="saga-book-actions">
              <button class="jnl-edit-btn sm" onclick="openEditModal(${idx})">Edit</button>
              <button class="claude-btn sm" onclick="openWithClaude(${idx})"><span class="claude-icon">✦</span></button>
              <button class="jnl-del-btn sm" onclick="removeJournalEntry(${idx})" title="Delete">×</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

// ── Grid renderer ─────────────────────────────────────────────────
function renderJournalGrid(filtered, all) {
  const grid = document.getElementById('jnl-grid');
  if (!grid) return;
  if (!filtered.length) {
    const isFiltered = jnlState.author !== 'all';
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-dash">—</div>
      <div class="empty-title">${isFiltered ? 'No entries for this author' : 'No entries yet'}</div>
      <div class="empty-desc">${isFiltered
        ? `Showing only books by <strong>${esc(jnlState.author)}</strong>. <a href="#" onclick="filterJournalByAuthor('all');return false">Clear filter</a>`
        : 'Log the first book above. Your raw thoughts become polished content.'}</div>
    </div>`;
    return;
  }
  const items = [];
  const sagaSeen = new Set();
  filtered.forEach(e => {
    if (e.sagaName) {
      if (!sagaSeen.has(e.sagaName)) {
        sagaSeen.add(e.sagaName);
        items.push({ type: 'saga', sagaName: e.sagaName, entries: filtered.filter(x => x.sagaName === e.sagaName) });
      }
    } else {
      items.push({ type: 'standalone', entry: e });
    }
  });
  grid.innerHTML = items.map(item =>
    item.type === 'saga'
      ? renderSagaStack(item.sagaName, item.entries, all)
      : renderStandaloneCard(item.entry, all)
  ).join('');
}

// ── Main view ─────────────────────────────────────────────────────
function renderJournalView() {
  const j = getJournal();
  const uniqueAuthors = [...new Set(j.map(e => e.author).filter(Boolean))].sort();

  let html = `<div class="journal-view">
    <div class="view-header">
      <div class="view-header-title">Reading Journal</div>
      <div class="view-header-sub">Your private reading log — raw thoughts, ratings, and one click to turn them into content.</div>
    </div>
    <div class="jnl-add-panel">
      <div class="jnl-panel-title">+ Log a book you've read</div>
      <datalist id="global-authors-list"></datalist>
      <div class="jnl-form">
        <div class="jnl-row">
          <input id="jnl-title"  type="text" class="jnl-input" placeholder="Book title *"
            onkeydown="if(event.key==='Enter')document.getElementById('jnl-author').focus()">
          <input id="jnl-author" type="text" class="jnl-input" placeholder="Author"
            list="global-authors-list"
            onkeydown="if(event.key==='Enter')document.getElementById('jnl-date').focus()">
          <input id="jnl-date" type="date" class="jnl-input jnl-date-fld">
        </div>
        <div class="jnl-rating-row">
          <span class="jnl-label">Rating:</span>
          ${starPickerHtml('jnl-star-picker', 'jnl-rating-val')}
          <span class="jnl-rating-hint" id="jnl-star-picker-hint"></span>
        </div>
        <div class="jnl-saga-row">
          <label class="jnl-saga-label">
            <input type="checkbox" id="jnl-is-saga" onchange="toggleSagaInput('jnl-saga-name',this.checked)">
            <span>Part of a saga / trilogy</span>
          </label>
          <input id="jnl-saga-name" type="text" class="jnl-input" placeholder="Saga name (e.g. Millennium Trilogy)…" style="display:none">
        </div>
        <textarea id="jnl-thoughts" class="jnl-input jnl-ta" rows="5"
          placeholder="Your raw thoughts — what worked, what didn't, what haunted you, what you'd tell a friend picking this up…"></textarea>
        <div class="jnl-form-footer">
          <span class="jnl-hint">After logging, hit <strong>Ask Claude</strong> on the card to get a polished review, caption &amp; TikTok hook.</span>
          <button class="jnl-save-btn" onclick="addJournalEntry()">Log book</button>
        </div>
      </div>
    </div>`;

  if (j.length) {
    if (uniqueAuthors.length) {
      html += `<div class="jnl-filter-bar">
        <button class="jnl-apill active" data-author="all" onclick="filterJournalByAuthor(this.dataset.author)">All <span class="pill-count">${j.length}</span></button>
        ${uniqueAuthors.map(a => {
          const cnt = j.filter(e => e.author === a).length;
          return `<button class="jnl-apill" data-author="${esc(a)}" onclick="filterJournalByAuthor(this.dataset.author)">${esc(a)} <span class="pill-count">${cnt}</span></button>`;
        }).join('')}
      </div>`;
    }
    html += `<div class="jnl-toolbar">
      <span class="jnl-count">${j.length} book${j.length !== 1 ? 's' : ''} logged</span>
      <div class="jnl-sort-group">
        <button class="jnl-sort-btn active" data-sort="date"   onclick="sortJournal('date')">Latest</button>
        <button class="jnl-sort-btn"        data-sort="rating" onclick="sortJournal('rating')">Top rated</button>
      </div>
    </div>`;
  }

  html += `<div id="jnl-grid" class="journal-grid"></div></div>`;
  document.getElementById('main-content').innerHTML = html;
  refreshAuthorsList();
  applyJournalFilters();
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
  else if (view === 'journal')    { jnlState = { sort: 'date', author: 'all' }; renderJournalView(); }
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
