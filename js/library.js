// ─── My Library ───────────────────────────────────────────────────
const LIBRARY_KEY = 'thc_library';
let libState        = { page: 1, format: 'all', read: 'all', search: '', author: 'all', tag: 'all' };
let libExpandedSagas = new Set();

const TAG_PALETTE = [
  { bg: '#fde8e8', color: '#8b1a1a', border: '#f5c0c0' },
  { bg: '#f0e8fa', color: '#6B3FA0', border: '#d8c0f0' },
  { bg: '#e0f5ee', color: '#1a5c4a', border: '#b0dfcf' },
  { bg: '#fdf3dc', color: '#7a5500', border: '#e8d090' },
  { bg: '#e8e8f4', color: '#1a4060', border: '#b0b8d8' },
  { bg: '#f0ede8', color: '#4a3828', border: '#c8b8a0' },
];

function tagColor(name) {
  let h = 0;
  for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return TAG_PALETTE[Math.abs(h) % TAG_PALETTE.length];
}

// ─── Storage ──────────────────────────────────────────────────────
function getLibrary() {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || []; }
  catch { return []; }
}
function saveLibrary(arr) { localStorage.setItem(LIBRARY_KEY, JSON.stringify(arr)); }

// ─── Normalize (backward compat) ──────────────────────────────────
function normLibBook(b) {
  return {
    addedAt:   b.addedAt || Date.now(),
    title:     b.title   || '',
    author:    b.author  || '',
    format:    b.format  || 'physical',
    read:      !!b.read,
    sagaName:  b.sagaName  || '',
    sagaOrder: b.sagaOrder != null ? b.sagaOrder : null,
    tags:      Array.isArray(b.tags) ? b.tags : [],
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────
function addLibraryBook() {
  const title    = document.getElementById('lib-add-title')?.value.trim();
  const author   = document.getElementById('lib-add-author')?.value.trim() || '';
  const format   = document.getElementById('lib-add-format')?.value || 'physical';
  const read     = document.getElementById('lib-add-read')?.checked || false;
  const sagaName = document.getElementById('lib-add-saga')?.value.trim() || '';
  const sagaOrderRaw = document.getElementById('lib-add-order')?.value.trim();
  const sagaOrder = sagaOrderRaw ? parseInt(sagaOrderRaw, 10) : null;
  const tagsRaw  = document.getElementById('lib-add-tags')?.value.trim();
  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim().replace(/['"`<>]/g, '')).filter(Boolean)
    : [];

  if (!title) { document.getElementById('lib-add-title')?.focus(); return; }

  const lib = getLibrary();
  lib.unshift({ addedAt: Date.now(), title, author, format, read, sagaName, sagaOrder, tags });
  saveAndSyncLibrary(lib);

  document.getElementById('lib-add-title').value  = '';
  document.getElementById('lib-add-author').value = '';
  document.getElementById('lib-add-saga').value   = '';
  document.getElementById('lib-add-order').value  = '';
  document.getElementById('lib-add-tags').value   = '';
  document.getElementById('lib-add-read').checked = false;
  renderLibGrid();
}

function deleteLibraryBook(bookId) {
  saveAndSyncLibrary(getLibrary().filter(b => b.addedAt !== bookId));
  renderLibGrid();
}

function cycleLibFormat(bookId) {
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book) return;
  const cycle = { physical: 'ebook', ebook: 'both', both: 'physical' };
  book.format = cycle[book.format] || 'physical';
  saveAndSyncLibrary(lib);
  renderLibGrid();
}

function toggleLibRead(bookId) {
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book) return;
  book.read = !book.read;
  saveAndSyncLibrary(lib);
  renderLibGrid();
}

function updateLibField(bookId, field, value) {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  if (!trimmed && field === 'title') return;
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book) return;
  const newVal = field === 'sagaOrder' ? (trimmed ? parseInt(trimmed, 10) : null) : (trimmed || '');
  if (book[field] === newVal) return;
  book[field] = newVal;
  saveAndSyncLibrary(lib);
  if (field === 'sagaName' || field === 'sagaOrder') renderLibGrid();
}

function addLibTag(bookId, tag) {
  tag = tag.trim().replace(/['"`<>]/g, '');
  if (!tag) return;
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book || (book.tags || []).includes(tag)) return;
  if (!Array.isArray(book.tags)) book.tags = [];
  book.tags.push(tag);
  saveAndSyncLibrary(lib);
  renderLibGrid();
}

function removeLibTag(bookId, tag) {
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book) return;
  book.tags = (book.tags || []).filter(t => t !== tag);
  saveAndSyncLibrary(lib);
  renderLibGrid();
}

// ─── Filters & pagination ─────────────────────────────────────────
function filterLib(key, value) {
  libState[key] = value;
  libState.page = 1;
  renderLibGrid();
}

function setLibPage(n) {
  libState.page = n;
  renderLibGrid();
  document.getElementById('lib-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function libSearch(q) {
  libState.search = q;
  libState.page   = 1;
  renderLibGrid();
}

// ─── Cross-feature helpers ────────────────────────────────────────
function autoFillFromLibrary(title) {
  const match = getLibrary().find(b => b.title.toLowerCase() === title.toLowerCase());
  if (match) {
    const a = document.getElementById('jnl-author');
    if (a && !a.value) a.value = match.author || '';
  }
}

function refreshLibraryTitlesList() {
  const dl = document.getElementById('library-titles-list');
  if (!dl) return;
  dl.innerHTML = getLibrary().map(b => `<option value="${esc(b.title)}">`).join('');
}

// ─── Format badges HTML ───────────────────────────────────────────
function libFmtBadges(b) {
  const fmt = b.format || 'physical';
  let out = '';
  if (fmt === 'physical' || fmt === 'both')
    out += `<button class="lib-fmt-badge" data-fmt="physical" onclick="cycleLibFormat(${b.addedAt})" title="Click to cycle format">Physical</button>`;
  if (fmt === 'ebook' || fmt === 'both')
    out += `<button class="lib-fmt-badge" data-fmt="ebook" onclick="cycleLibFormat(${b.addedAt})" title="Click to cycle format">eBook</button>`;
  return out;
}

// ─── Row HTML ─────────────────────────────────────────────────────
// context: 'saga' (inside a saga group) | 'book' (standalone books panel)
function libRowHTML(b, context) {
  if (context === 'saga') {
    return `<div class="lib-row lib-row--saga" data-lib-id="${b.addedAt}">
      <div class="lib-cell lib-cell-num">
        <input class="lib-order-in" type="number" min="1" value="${b.sagaOrder ?? ''}" placeholder="—"
          onblur="updateLibField(${b.addedAt},'sagaOrder',this.value)">
      </div>
      <div class="lib-cell lib-cell-title">
        <input class="lib-title-in" value="${esc(b.title)}" placeholder="Title"
          onblur="updateLibField(${b.addedAt},'title',this.value)">
        <input class="lib-author-in" value="${esc(b.author)}" placeholder="Author"
          list="global-authors-list"
          onblur="updateLibField(${b.addedAt},'author',this.value)">
      </div>
      <div class="lib-cell lib-cell-format">${libFmtBadges(b)}</div>
      <div class="lib-cell lib-cell-status">
        <button class="lib-read-badge" data-read="${b.read}" onclick="toggleLibRead(${b.addedAt})">
          ${b.read ? '✓ Read' : 'Unread'}
        </button>
      </div>
      <div class="lib-cell lib-cell-del">
        <button class="lib-del-btn" onclick="deleteLibraryBook(${b.addedAt})" title="Remove">×</button>
      </div>
    </div>`;
  }

  // standalone 'book' context
  return `<div class="lib-row" data-lib-id="${b.addedAt}">
    <div class="lib-cell lib-cell-title">
      <input class="lib-title-in" value="${esc(b.title)}" placeholder="Title"
        onblur="updateLibField(${b.addedAt},'title',this.value)">
      <input class="lib-saga-in--row" value="${esc(b.sagaName || '')}" placeholder="Move to series…"
        onblur="updateLibField(${b.addedAt},'sagaName',this.value)">
    </div>
    <div class="lib-cell lib-cell-author">
      <input class="lib-author-in" value="${esc(b.author)}" placeholder="Author"
        list="global-authors-list"
        onblur="updateLibField(${b.addedAt},'author',this.value)">
    </div>
    <div class="lib-cell lib-cell-format">${libFmtBadges(b)}</div>
    <div class="lib-cell lib-cell-status">
      <button class="lib-read-badge" data-read="${b.read}" onclick="toggleLibRead(${b.addedAt})">
        ${b.read ? '✓ Read' : 'Unread'}
      </button>
    </div>
    <div class="lib-cell lib-cell-del">
      <button class="lib-del-btn" onclick="deleteLibraryBook(${b.addedAt})" title="Remove">×</button>
    </div>
  </div>`;
}

// ─── Inline tag input ─────────────────────────────────────────────
function showLibTagInput(bookId, btn) {
  if (btn.previousElementSibling?.classList.contains('lib-tag-inp')) return;
  const inp = document.createElement('input');
  inp.className     = 'lib-tag-inp';
  inp.placeholder   = 'Tag…';
  inp.onkeydown = e => {
    if (e.key === 'Enter')  { addLibTag(bookId, inp.value); }
    if (e.key === 'Escape') { inp.remove(); }
  };
  inp.onblur = () => setTimeout(() => { if (inp.parentNode) inp.remove(); }, 200);
  btn.insertAdjacentElement('beforebegin', inp);
  inp.focus();
}

// ─── Filter UI helpers ────────────────────────────────────────────
function renderLibTagFilters(allBooks) {
  const row = document.getElementById('lib-tag-filter-row');
  if (!row) return;
  const tags = new Set();
  allBooks.forEach(b => (b.tags || []).forEach(t => tags.add(t)));
  if (!tags.size) { row.innerHTML = ''; return; }

  let html = `<span class="lib-filter-label">Tags:</span>
    <button class="lib-fpill${libState.tag === 'all' ? ' active' : ''}" data-ftype="tag" data-fval="all" onclick="filterLib('tag','all')">All</button>`;
  tags.forEach(t => {
    const c = tagColor(t);
    const active = libState.tag === t;
    const tSafe = esc(t).replace(/'/g, '&#39;');
    html += `<button class="lib-fpill lib-tag-fpill${active ? ' active' : ''}"
      data-ftype="tag" data-fval="${esc(t)}"
      style="${active ? `background:${c.bg};color:${c.color};border-color:${c.border};` : ''}"
      onclick="filterLib('tag','${tSafe}')">${esc(t)}</button>`;
  });
  row.innerHTML = html;
}

function updateLibAuthorSelect(libAuthors) {
  const sel = document.querySelector('.lib-author-select');
  if (!sel) return;
  if (libState.author !== 'all' && !libAuthors.includes(libState.author)) libState.author = 'all';
  sel.innerHTML = `<option value="all"${libState.author === 'all' ? ' selected' : ''}>All authors</option>` +
    libAuthors.map(a => `<option value="${esc(a)}"${a === libState.author ? ' selected' : ''}>${esc(a)}</option>`).join('');
}

function syncLibFilterPills() {
  document.querySelectorAll('.lib-fpill[data-ftype]').forEach(p =>
    p.classList.toggle('active', p.dataset.fval === libState[p.dataset.ftype]));
}

// ─── Saga toggle (proper height animation) ────────────────────────
function toggleLibSaga(hdEl) {
  const group = hdEl.closest('.lib-saga-group');
  const rows  = group?.querySelector('.lib-saga-rows');
  const name  = group?.dataset.sagaName;
  if (!group || !rows || !name) return;

  if (libExpandedSagas.has(name)) {
    libExpandedSagas.delete(name);
    group.classList.remove('open');
    rows.style.height = rows.scrollHeight + 'px';
    rows.offsetHeight; // force reflow
    rows.style.height = '0';
  } else {
    libExpandedSagas.add(name);
    group.classList.add('open');
    rows.style.height = rows.scrollHeight + 'px';
    rows.addEventListener('transitionend', function onEnd() {
      rows.removeEventListener('transitionend', onEnd);
      if (libExpandedSagas.has(name)) rows.style.height = 'auto';
    });
  }
}

// ─── Saga group HTML (table section) ─────────────────────────────
function sagaGroupHTML(name, books) {
  const isOpen   = libExpandedSagas.has(name);
  const count    = books.length;
  const initials = sagaInitials(name);
  let layers = '';
  if (count >= 3) layers += '<div class="lib-stk-sq lib-stk-sq--3"></div>';
  if (count >= 2) layers += '<div class="lib-stk-sq lib-stk-sq--2"></div>';
  layers += `<div class="lib-stk-sq lib-stk-sq--1"><span class="lib-stk-initial">${esc(initials)}</span></div>`;

  const authStr = [...new Set(books.map(b => b.author).filter(Boolean))].slice(0, 2).join(', ');
  const bookRows = books.map(b => libRowHTML(b, 'saga')).join('');

  return `<div class="lib-saga-group${isOpen ? ' open' : ''}" data-saga-name="${esc(name)}">
    <div class="lib-saga-hdr-row" onclick="toggleLibSaga(this)">
      <div class="lib-saga-hdr-left">
        <div class="lib-saga-stk-vis">${layers}</div>
        <div class="lib-saga-hdr-text">
          <span class="lib-saga-hdr-name">${esc(name)}</span>
          ${authStr ? `<span class="lib-saga-hdr-meta">${esc(authStr)}</span>` : ''}
        </div>
      </div>
      <div class="lib-saga-hdr-right">
        <span class="lib-saga-hdr-count">${count} book${count !== 1 ? 's' : ''}</span>
        <span class="lib-saga-chevron">▾</span>
      </div>
    </div>
    <div class="lib-saga-rows" style="${isOpen ? 'height:auto' : 'height:0'}">
      ${bookRows}
    </div>
  </div>`;
}

// ─── Views ────────────────────────────────────────────────────────
function renderLibraryView() {
  libExpandedSagas = new Set();
  const allAuthors = getAllAuthors();

  document.getElementById('main-content').innerHTML = `<div class="library-view">
    <datalist id="global-authors-list">${allAuthors.map(a => `<option value="${esc(a)}">`).join('')}</datalist>

    <div class="view-header">
      <div class="view-header-title">My Library</div>
      <div class="view-header-sub">Your book shelf — track what you own and what you've read.</div>
    </div>

    <div class="lib-add-panel">
      <div class="jnl-panel-title">+ Add a book to your shelf</div>
      <div class="lib-add-form">
        <input id="lib-add-title" type="text" class="jnl-input" placeholder="Book title *"
          list="library-titles-list"
          onkeydown="if(event.key==='Enter')document.getElementById('lib-add-author').focus()">
        <datalist id="library-titles-list"></datalist>
        <input id="lib-add-author" type="text" class="jnl-input" placeholder="Author"
          list="global-authors-list"
          onkeydown="if(event.key==='Enter')document.getElementById('lib-add-format').focus()">
        <select id="lib-add-format" class="jnl-input lib-select">
          <option value="physical">Physical</option>
          <option value="ebook">eBook</option>
          <option value="both">Both</option>
        </select>
        <label class="lib-read-chk-label">
          <input id="lib-add-read" type="checkbox" class="lib-read-chk"> Already read
        </label>
      </div>
      <div class="lib-add-form lib-add-form-row2">
        <input id="lib-add-saga" type="text" class="jnl-input" placeholder="Saga / series name (optional)"
          onkeydown="if(event.key==='Enter')document.getElementById('lib-add-order').focus()">
        <input id="lib-add-order" type="number" min="1" class="jnl-input lib-order-fld" placeholder="Book #"
          onkeydown="if(event.key==='Enter')document.getElementById('lib-add-tags').focus()">
        <input id="lib-add-tags" type="text" class="jnl-input" placeholder="Tags (comma-separated)"
          onkeydown="if(event.key==='Enter')addLibraryBook()">
        <button class="jnl-save-btn" onclick="addLibraryBook()">Add</button>
      </div>
    </div>

    <div class="lib-filter-bar">
      <input class="lib-search" type="search" placeholder="Search title, author, tag…"
        value="${esc(libState.search)}"
        oninput="libSearch(this.value)">
      <div class="lib-filter-row">
        <div class="lib-filter-group">
          <span class="lib-filter-label">Format:</span>
          <button class="lib-fpill" data-ftype="format" data-fval="all"      onclick="filterLib('format','all')">All</button>
          <button class="lib-fpill" data-ftype="format" data-fval="physical" onclick="filterLib('format','physical')">Physical</button>
          <button class="lib-fpill" data-ftype="format" data-fval="ebook"    onclick="filterLib('format','ebook')">eBook</button>
          <button class="lib-fpill" data-ftype="format" data-fval="both"     onclick="filterLib('format','both')">Both</button>
        </div>
        <div class="lib-filter-group">
          <span class="lib-filter-label">Status:</span>
          <button class="lib-fpill" data-ftype="read" data-fval="all"    onclick="filterLib('read','all')">All</button>
          <button class="lib-fpill" data-ftype="read" data-fval="unread" onclick="filterLib('read','unread')">Unread</button>
          <button class="lib-fpill" data-ftype="read" data-fval="read"   onclick="filterLib('read','read')">Read</button>
        </div>
        <div class="lib-filter-group">
          <span class="lib-filter-label">Author:</span>
          <select class="lib-author-select" onchange="filterLib('author',this.value)">
            <option value="all">All authors</option>
            ${allAuthors.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="lib-tag-filter-row" id="lib-tag-filter-row"></div>
    </div>

    <div id="lib-grid" class="lib-grid-wrap"></div>
  </div>`;

  refreshLibraryTitlesList();
  renderLibGrid();
  syncLibraryFromCloud();
}

function renderLibGrid() {
  const container = document.getElementById('lib-grid');
  if (!container) return;

  const allBooks = getLibrary().map(normLibBook);
  let items = [...allBooks];

  // Search
  const q = libState.search.toLowerCase().trim();
  if (q) items = items.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.tags.some(t => t.toLowerCase().includes(q))
  );

  // Format filter
  if (libState.format === 'physical') items = items.filter(b => b.format === 'physical' || b.format === 'both');
  if (libState.format === 'ebook')    items = items.filter(b => b.format === 'ebook'    || b.format === 'both');
  if (libState.format === 'both')     items = items.filter(b => b.format === 'both');

  // Read / author / tag filters
  if (libState.read === 'read')      items = items.filter(b => b.read);
  if (libState.read === 'unread')    items = items.filter(b => !b.read);
  if (libState.author !== 'all')     items = items.filter(b => b.author === libState.author);
  if (libState.tag    !== 'all')     items = items.filter(b => b.tags.includes(libState.tag));

  // Sync filter UI
  renderLibTagFilters(allBooks);
  syncLibFilterPills();
  const libAuthors = [...new Set(allBooks.map(b => b.author).filter(Boolean))].sort();
  updateLibAuthorSelect(libAuthors);

  const filtered = items.length;
  const totalLib = allBooks.length;

  if (!filtered) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">${totalLib ? 'No books match' : 'No books yet'}</div>
      <div class="empty-desc">${totalLib ? 'Try adjusting your filters.' : 'Add the books you own above to build your shelf.'}</div>
    </div>`;
    return;
  }

  // ── Split ALL filtered items into saga groups + standalone (before paginating) ──
  const sagaMap   = {};
  const sagaNames = [];
  const standalone = [];

  items.forEach(b => {
    if (b.sagaName) {
      if (!sagaMap[b.sagaName]) { sagaMap[b.sagaName] = []; sagaNames.push(b.sagaName); }
      sagaMap[b.sagaName].push(b);
    } else {
      standalone.push(b);
    }
  });

  // Sort each saga by sagaOrder
  sagaNames.forEach(name =>
    sagaMap[name].sort((a, b) => (a.sagaOrder ?? 999) - (b.sagaOrder ?? 999))
  );

  // Paginate standalone books only
  const totalPages = standalone.length ? Math.ceil(standalone.length / ITEMS_PER_PAGE) : 1;
  const page = Math.max(1, Math.min(libState.page, totalPages));
  libState.page = page;
  const pageStandalone = standalone.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const countLabel = `${totalLib} book${totalLib !== 1 ? 's' : ''} in your library` +
    (filtered !== totalLib ? ` · ${filtered} matching` : '');

  // ── Sagas panel ──────────────────────────────────────────────────
  const sagasPanel = sagaNames.length
    ? `<div class="lib-table lib-table--sagas">${sagaNames.map(name => sagaGroupHTML(name, sagaMap[name])).join('')}</div>`
    : `<p class="lib-panel-empty">No series yet — type a series name on any book and it will appear here.</p>`;

  // ── Books panel ───────────────────────────────────────────────────
  let booksTable = '';
  if (standalone.length) {
    booksTable = `<div class="lib-table lib-table--books">
      <div class="lib-table-head">
        <div class="lib-th">Title</div>
        <div class="lib-th">Author</div>
        <div class="lib-th">Format</div>
        <div class="lib-th">Status</div>
        <div class="lib-th"></div>
      </div>
      ${pageStandalone.map(b => libRowHTML(b, 'book')).join('')}
    </div>`;
    if (standalone.length > ITEMS_PER_PAGE) {
      booksTable += `<div class="jnl-pagination">
        <button class="jpag-btn" onclick="setLibPage(${page - 1})"${page === 1 ? ' disabled' : ''}>‹</button>`;
      for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
          if (i === 3 || i === totalPages - 2) booksTable += `<span class="jpag-ellipsis">…</span>`;
          continue;
        }
        booksTable += `<button class="jpag-btn${i === page ? ' active' : ''}" onclick="setLibPage(${i})">${i}</button>`;
      }
      booksTable += `<button class="jpag-btn" onclick="setLibPage(${page + 1})"${page === totalPages ? ' disabled' : ''}>›</button></div>`;
    }
  } else {
    booksTable = `<p class="lib-panel-empty">All your books are in a series!</p>`;
  }

  const sagaBookCount = items.filter(b => b.sagaName).length;
  const html = `<div class="lib-count">${countLabel}</div>
  <div class="lib-split">
    <div class="lib-panel lib-panel--sagas">
      <div class="lib-panel-hd">
        <span class="lib-panel-title">Sagas & Series</span>
        ${sagaNames.length ? `<span class="lib-panel-count">${sagaNames.length} series · ${sagaBookCount} book${sagaBookCount !== 1 ? 's' : ''}</span>` : ''}
      </div>
      ${sagasPanel}
    </div>
    <div class="lib-panel lib-panel--books">
      <div class="lib-panel-hd">
        <span class="lib-panel-title">Books</span>
        ${standalone.length ? `<span class="lib-panel-count">${standalone.length} book${standalone.length !== 1 ? 's' : ''}</span>` : ''}
      </div>
      ${booksTable}
    </div>
  </div>`;

  container.innerHTML = html;
}
