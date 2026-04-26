// ─── My Library ───────────────────────────────────────────────────
const LIBRARY_KEY = 'thc_library';
let libState = { page: 1, format: 'all', read: 'all' };

function getLibrary() {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || []; }
  catch { return []; }
}
function saveLibrary(arr) { localStorage.setItem(LIBRARY_KEY, JSON.stringify(arr)); }

// ── CRUD ──────────────────────────────────────────────────────────
function addLibraryBook() {
  const title  = document.getElementById('lib-add-title')?.value.trim();
  const author = document.getElementById('lib-add-author')?.value.trim() || '';
  const format = document.getElementById('lib-add-format')?.value || 'physical';
  if (!title) { document.getElementById('lib-add-title')?.focus(); return; }
  const lib = getLibrary();
  lib.unshift({ addedAt: Date.now(), title, author, format, read: false });
  saveAndSyncLibrary(lib);
  document.getElementById('lib-add-title').value  = '';
  document.getElementById('lib-add-author').value = '';
  renderLibGrid();
}

function deleteLibraryBook(bookId) {
  saveAndSyncLibrary(getLibrary().filter(b => b.addedAt !== bookId));
  renderLibGrid();
}

function toggleLibFormat(bookId) {
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book) return;
  book.format = book.format === 'physical' ? 'ebook' : 'physical';
  saveAndSyncLibrary(lib);
  const badge = document.querySelector(`[data-lib-id="${bookId}"] .lib-fmt-badge`);
  if (badge) { badge.textContent = book.format === 'physical' ? 'Physical' : 'eBook'; badge.dataset.fmt = book.format; }
}

function toggleLibRead(bookId) {
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book) return;
  book.read = !book.read;
  saveAndSyncLibrary(lib);
  const badge = document.querySelector(`[data-lib-id="${bookId}"] .lib-read-badge`);
  if (badge) { badge.textContent = book.read ? 'Read' : 'Unread'; badge.dataset.read = book.read; }
}

function updateLibField(bookId, field, value) {
  const trimmed = value.trim();
  if (!trimmed && field === 'title') return;
  const lib  = getLibrary();
  const book = lib.find(b => b.addedAt === bookId);
  if (!book || book[field] === trimmed) return;
  book[field] = trimmed;
  saveAndSyncLibrary(lib);
}

// ── Filters & pagination ──────────────────────────────────────────
function filterLib(type, value) {
  libState[type] = value;
  libState.page  = 1;
  renderLibGrid();
}

function setLibPage(n) {
  libState.page = n;
  renderLibGrid();
  document.getElementById('lib-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Cross-feature helpers ─────────────────────────────────────────
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

// ── Views ─────────────────────────────────────────────────────────
function renderLibraryView() {
  document.getElementById('main-content').innerHTML = `<div class="library-view">
    <div class="view-header">
      <div class="view-header-title">My Library</div>
      <div class="view-header-sub">Your book inventory — physical and digital. Track what you own and what you've read.</div>
    </div>
    <div class="lib-add-panel">
      <div class="jnl-panel-title">+ Add a book to your shelf</div>
      <div class="lib-add-form">
        <input id="lib-add-title"  type="text" class="jnl-input" placeholder="Book title *"
          onkeydown="if(event.key==='Enter')document.getElementById('lib-add-author').focus()">
        <input id="lib-add-author" type="text" class="jnl-input" placeholder="Author"
          onkeydown="if(event.key==='Enter')addLibraryBook()">
        <select id="lib-add-format" class="jnl-input lib-select">
          <option value="physical">Physical</option>
          <option value="ebook">eBook</option>
        </select>
        <button class="jnl-save-btn" onclick="addLibraryBook()">Add</button>
      </div>
    </div>
    <div class="lib-filter-bar">
      <div class="lib-filter-group">
        <span class="lib-filter-label">Format:</span>
        <button class="lib-fpill active" data-ftype="format" data-fval="all"      onclick="filterLib('format','all')">All</button>
        <button class="lib-fpill"        data-ftype="format" data-fval="physical" onclick="filterLib('format','physical')">Physical</button>
        <button class="lib-fpill"        data-ftype="format" data-fval="ebook"    onclick="filterLib('format','ebook')">eBook</button>
      </div>
      <div class="lib-filter-group">
        <span class="lib-filter-label">Status:</span>
        <button class="lib-fpill active" data-ftype="read" data-fval="all"    onclick="filterLib('read','all')">All</button>
        <button class="lib-fpill"        data-ftype="read" data-fval="unread" onclick="filterLib('read','unread')">Unread</button>
        <button class="lib-fpill"        data-ftype="read" data-fval="read"   onclick="filterLib('read','read')">Read</button>
      </div>
    </div>
    <div id="lib-grid" class="lib-grid-wrap"></div>
  </div>`;
  renderLibGrid();
  syncLibraryFromCloud();
}

function renderLibGrid() {
  const container = document.getElementById('lib-grid');
  if (!container) return;

  let items = getLibrary();
  if (libState.format !== 'all') items = items.filter(b => b.format === libState.format);
  if (libState.read === 'read')   items = items.filter(b => b.read);
  if (libState.read === 'unread') items = items.filter(b => !b.read);

  document.querySelectorAll('.lib-fpill').forEach(p =>
    p.classList.toggle('active', p.dataset.fval === libState[p.dataset.ftype]));

  const total = getLibrary().length;

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">No books here yet</div>
      <div class="empty-desc">Add the books you own above to build your shelf.</div>
    </div>`;
    return;
  }

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const page       = Math.max(1, Math.min(libState.page, totalPages));
  libState.page    = page;
  const pageItems  = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const cards = pageItems.map(b => `
    <div class="lib-card" data-lib-id="${b.addedAt}">
      <div class="lib-card-top">
        <input class="lib-title-in" value="${esc(b.title)}" placeholder="Title"
          onblur="updateLibField(${b.addedAt},'title',this.value)">
        <button class="lib-del-btn" onclick="deleteLibraryBook(${b.addedAt})" title="Remove">×</button>
      </div>
      <input class="lib-author-in" value="${esc(b.author)}" placeholder="Author"
        onblur="updateLibField(${b.addedAt},'author',this.value)">
      <div class="lib-badges">
        <button class="lib-fmt-badge" data-fmt="${b.format}" onclick="toggleLibFormat(${b.addedAt})">
          ${b.format === 'physical' ? 'Physical' : 'eBook'}
        </button>
        <button class="lib-read-badge" data-read="${b.read}" onclick="toggleLibRead(${b.addedAt})">
          ${b.read ? 'Read' : 'Unread'}
        </button>
      </div>
    </div>`).join('');

  let pag = '';
  if (totalPages > 1) {
    pag = `<div class="jnl-pagination">
      <button class="jpag-btn" onclick="setLibPage(${page-1})"${page===1?' disabled':''}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
        if (i === 3 || i === totalPages - 2) pag += `<span class="jpag-ellipsis">…</span>`;
        continue;
      }
      pag += `<button class="jpag-btn${i===page?' active':''}" onclick="setLibPage(${i})">${i}</button>`;
    }
    pag += `<button class="jpag-btn" onclick="setLibPage(${page+1})"${page===totalPages?' disabled':''}>›</button></div>`;
  }

  container.innerHTML = `<div class="lib-count">${total} book${total!==1?'s':''} in your library</div>
    <div class="lib-grid">${cards}</div>${pag}`;
}
