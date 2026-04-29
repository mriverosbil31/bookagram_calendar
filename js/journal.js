// ─── Reading Journal ──────────────────────────────────────────────
const JOURNAL_KEY        = 'thc_journal';
const JNL_SAGA_BOOKS_KEY = 'thc_jnl_saga_books';
let jnlState = { sort: 'date', author: 'all', tag: 'all', page: 1 };
let _jnlEditIdx = -1;
let _jnlAuthExpanded = false;

function getJournal() {
  try { return JSON.parse(localStorage.getItem(JOURNAL_KEY)) || []; }
  catch { return []; }
}
function saveJournal(arr) { localStorage.setItem(JOURNAL_KEY, JSON.stringify(arr)); }

function getJnlSagaBooks() {
  try { return JSON.parse(localStorage.getItem(JNL_SAGA_BOOKS_KEY)) || {}; }
  catch { return {}; }
}
function saveJnlSagaBooks(obj) { localStorage.setItem(JNL_SAGA_BOOKS_KEY, JSON.stringify(obj)); }

// ── Helpers ───────────────────────────────────────────────────────
function sagaInitials(name) {
  return name.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase()).join('');
}

// ── Half-star picker ──────────────────────────────────────────────
function clickStarPicker(event, hiddenId, pickerId) {
  const slot = event.target.closest('.star-slot');
  if (!slot) return;
  const n    = parseFloat(slot.dataset.n);
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

// ── Toggle helpers ────────────────────────────────────────────────
function toggleSagaInput(inputId, show) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.display = show ? '' : 'none';
  if (!show) el.value = '';
}

function toggleOwnedInput(show) {
  const el = document.getElementById('jnl-own-format');
  if (el) el.style.display = show ? '' : 'none';
}

function toggleEditOwnedInput(show) {
  const el = document.getElementById('edit-own-format');
  if (el) el.style.display = show ? '' : 'none';
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
  saveAndSync(j);

  const ownsBook  = document.getElementById('jnl-owns-book')?.checked;
  const ownFormat = document.getElementById('jnl-own-format')?.value || 'physical';
  if (ownsBook) {
    const lib = getLibrary();
    const already = lib.some(b => b.title.toLowerCase() === title.toLowerCase());
    if (!already) {
      lib.unshift({ addedAt: Date.now() + 1, title, author: author || '', format: ownFormat, read: true });
      saveAndSyncLibrary(lib);
    }
  }

  renderJournalView();
}

function removeJournalEntry(idx) {
  const j = getJournal();
  j.splice(idx, 1);
  saveAndSync(j);
  renderJournalView();
}

// ── Edit modal ────────────────────────────────────────────────────
function openEditModal(idx) {
  const entry = getJournal()[idx];
  if (!entry) return;
  _jnlEditIdx = idx;

  document.getElementById('jnl-edit-ov')?.remove();

  const ov = document.createElement('div');
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
      <div class="jnl-saga-row">
        <label class="jnl-saga-label">
          <input type="checkbox" id="edit-owns-book" onchange="toggleEditOwnedInput(this.checked)">
          <span>I own this book</span>
        </label>
        <select id="edit-own-format" class="jnl-input lib-select" style="display:none;color-scheme:dark">
          <option value="physical">Physical copy</option>
          <option value="ebook">eBook</option>
        </select>
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

  document.getElementById('edit-title').value      = entry.title;
  document.getElementById('edit-author').value     = entry.author   || '';
  document.getElementById('edit-date').value       = entry.dateRead || '';
  document.getElementById('edit-thoughts').value   = entry.thoughts;
  document.getElementById('edit-rating-val').value = entry.rating   || 0;
  document.getElementById('edit-is-saga').checked  = !!entry.sagaName;
  const sn = document.getElementById('edit-saga-name');
  sn.value = entry.sagaName || '';
  sn.style.display = entry.sagaName ? '' : 'none';
  updatePickerDisplay('edit-picker', entry.rating || 0);

  const inLib = getLibrary().find(b => b.title.toLowerCase() === entry.title.toLowerCase());
  document.getElementById('edit-owns-book').checked = !!inLib;
  const editFmt = document.getElementById('edit-own-format');
  if (inLib) { editFmt.value = inLib.format || 'physical'; editFmt.style.display = ''; }

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
  saveAndSync(j);

  const ownsBook  = document.getElementById('edit-owns-book')?.checked;
  const ownFormat = document.getElementById('edit-own-format')?.value || 'physical';
  if (ownsBook) {
    const lib = getLibrary();
    const existingIdx = lib.findIndex(b => b.title.toLowerCase() === title.toLowerCase());
    if (existingIdx === -1) {
      lib.unshift({ addedAt: Date.now() + 1, title, author: author || '', format: ownFormat, read: true });
    } else {
      lib[existingIdx].format = ownFormat;
    }
    saveAndSyncLibrary(lib);
  }

  closeEditModal();
  renderJournalView();
}

// ── Claude integration ────────────────────────────────────────────
// Keyed by groupId so saga names with special chars never need inline escaping
const _jnlSagaRef = {};

function buildSagaClaudePrompt(sagaName, entries) {
  const sorted = [...entries].sort((a, b) => (a.sagaOrder ?? 999) - (b.sagaOrder ?? 999) || a.addedAt - b.addedAt);
  const booksText = sorted.map((e, i) => {
    const r    = Math.min(Math.max(parseFloat(e.rating) || 0, 0), 5);
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    const stars = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
    return `Book ${i + 1}: "${e.title}" — ${stars} (${r}/5)${e.dateRead ? ` · Read: ${e.dateRead}` : ''}
${e.thoughts}`;
  }).join('\n\n---\n\n');

  const author = [...new Set(entries.map(e => e.author).filter(Boolean))].join(', ');
  return `You are helping The Husband's Corner — a Bookstagram & BookTok account focused on thriller, mystery and suspense.

Series: ${sagaName}${author ? `\nAuthor: ${author}` : ''}
Total books: ${entries.length}

${booksText}

Please give me:
1. A series overview paragraph — ideal for a "should you binge this series?" carousel (no spoilers, opinionated)
2. A book-by-book ranking caption with one punchy line per book and a final verdict
3. A TikTok hook for "is this series worth it?" — 5 seconds, scroll-stopping
4. Three series-level content angle ideas for The Husband's Corner (e.g. re-read order, darkest moment, who to recommend it to)

Voice: passionate, slightly obsessed — a husband who reads every thriller his wife is too scared to pick up alone.`;
}

function openSagaWithClaude(groupId) {
  const sagaName = _jnlSagaRef[groupId];
  if (!sagaName) return;
  const entries = getJournal().filter(e => e.sagaName === sagaName);
  if (!entries.length) return;
  const prompt  = buildSagaClaudePrompt(sagaName, entries);
  const doOpen  = () => window.open('https://claude.ai', '_blank', 'noopener');
  const fallback = () => { showPromptModal(prompt); doOpen(); };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(prompt)
      .then(() => { showJnlToast('Series prompt copied! Paste it into Claude ↗'); doOpen(); })
      .catch(fallback);
  } else { fallback(); }
}

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
  const prompt  = buildClaudePrompt(entry);
  const doOpen  = () => window.open('https://claude.ai', '_blank', 'noopener');
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
  jnlState.page   = 1;
  applyJournalFilters();
}

function filterJournalByTag(tag) {
  jnlState.tag  = tag;
  jnlState.page = 1;
  applyJournalFilters();
}

function toggleJnlAuthors() {
  _jnlAuthExpanded = !_jnlAuthExpanded;
  const pills = document.getElementById('jnl-author-pills');
  const btn   = document.getElementById('jnl-auth-toggle');
  if (!pills || !btn) return;
  pills.classList.toggle('expanded', _jnlAuthExpanded);
  const extra = parseInt(btn.dataset.extra) || 0;
  btn.textContent = _jnlAuthExpanded ? '↑ Less' : `+${extra} more`;
}

function sortJournal(by) {
  jnlState.sort = by;
  jnlState.page = 1;
  applyJournalFilters();
}

function applyJournalFilters() {
  const all = getJournal();
  let filtered = jnlState.author === 'all'
    ? [...all]
    : all.filter(e => (e.author || '') === jnlState.author);

  if (jnlState.tag !== 'all') {
    const libTagMap = new Map(getLibrary().map(b => [b.title.toLowerCase(), b.tags || []]));
    filtered = filtered.filter(e =>
      (libTagMap.get(e.title.toLowerCase()) || []).includes(jnlState.tag)
    );
  }

  if (jnlState.sort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.addedAt - a.addedAt);
  }
  document.querySelectorAll('.jnl-sort-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.sort === jnlState.sort));
  document.querySelectorAll('.jnl-apill[data-author]').forEach(p =>
    p.classList.toggle('active', p.dataset.author === jnlState.author));
  document.querySelectorAll('.jnl-tag-fpill').forEach(p => {
    const active = p.dataset.tag === jnlState.tag;
    p.classList.toggle('active', active);
    const c = active ? tagColor(p.dataset.tag) : null;
    p.style.background  = c ? c.bg    : '';
    p.style.color       = c ? c.color : '';
    p.style.borderColor = c ? c.border : '';
  });
  renderJournalGrid(filtered, all);
}

// ── Expand / collapse ─────────────────────────────────────────────
function toggleEntry(idx) {
  document.getElementById('jnl-e-' + idx)?.classList.toggle('open');
}

function toggleSagaGroup(id) {
  document.getElementById(id)?.classList.toggle('open');
}

// ── Entry renderers ───────────────────────────────────────────────
function renderEntryRow(e, all, libDataMap, inSaga = false) {
  const idx        = all.indexOf(e);
  const initial    = e.title.charAt(0).toUpperCase();
  const dt         = e.dateRead ? jnlFormatDate(e.dateRead) : '';
  const libData    = libDataMap?.get(e.title.toLowerCase()) || {};
  const tags       = libData.tags || [];
  const sagaOrder  = libData.sagaOrder;
  const tagPills   = tags.map(t => {
    const c = tagColor(t);
    return `<span class="lib-tag-pill jnl-lib-tag" style="background:${c.bg};color:${c.color};border-color:${c.border}">${esc(t)}</span>`;
  }).join('');
  const numBadge   = e.sagaName && sagaOrder != null
    ? `<span class="jnl-saga-num">#${sagaOrder}</span>` : '';
  const dragHandle = inSaga
    ? `<span class="jnl-entry-drag-handle" onclick="event.stopPropagation()" title="Drag to reorder">⠿</span>`
    : '';

  return `<div class="jnl-entry" id="jnl-e-${idx}" data-added-at="${e.addedAt}">
    <div class="jnl-entry-hd" onclick="toggleEntry(${idx})">
      ${dragHandle}
      <div class="jnl-initial">${esc(initial)}</div>
      <div class="jnl-entry-info">
        <div class="jnl-entry-title">${numBadge}${esc(e.title)}</div>
        <div class="jnl-entry-meta">
          ${e.author ? `<span class="jnl-entry-author" data-author="${esc(e.author)}" onclick="filterJournalByAuthor(this.dataset.author);event.stopPropagation()" title="Filter by this author">${esc(e.author)}</span><span class="jnl-meta-sep">·</span>` : ''}
          <span class="jnl-stars-inline">${renderJnlStars(e.rating)}</span>
          ${dt ? `<span class="jnl-meta-sep">·</span><span class="jnl-entry-date">${dt}</span>` : ''}
        </div>
        ${tagPills ? `<div class="jnl-lib-tags">${tagPills}</div>` : ''}
      </div>
      <div class="jnl-entry-acts" onclick="event.stopPropagation()">
        <button class="jnl-act-btn" onclick="openEditModal(${idx})" title="Edit">✎</button>
        <button class="jnl-act-btn danger" onclick="removeJournalEntry(${idx})" title="Delete">×</button>
      </div>
      <span class="jnl-caret">›</span>
    </div>
    <div class="jnl-entry-body">
      <p class="jnl-thoughts">${esc(e.thoughts).replace(/\n/g, '<br>')}</p>
      <div class="jnl-entry-footer">
        <button class="claude-btn" onclick="openWithClaude(${idx})">
          <span class="claude-icon">✦</span> Ask Claude
        </button>
      </div>
    </div>
  </div>`;
}

function renderSagaGroup(sagaName, entries, all, libDataMap) {
  // Sort by user-saved order, falling back to newest-first
  const savedOrder = getJnlSagaBooks()[sagaName] || [];
  const sorted = savedOrder.length
    ? [...entries].sort((a, b) => {
        const ai = savedOrder.indexOf(a.addedAt);
        const bi = savedOrder.indexOf(b.addedAt);
        if (ai === -1 && bi === -1) return b.addedAt - a.addedAt;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
    : [...entries].sort((a, b) => b.addedAt - a.addedAt);
  const count   = entries.length;
  const groupId = 'sg-' + all.indexOf(sorted[0]);
  _jnlSagaRef[groupId] = sagaName; // store for openSagaWithClaude lookup
  return `<div class="jnl-saga-group${count >= 3 ? ' stack3' : count >= 2 ? ' stack2' : ''}" id="${groupId}" data-saga-name="${esc(sagaName)}">
    <div class="jnl-saga-hd" onclick="toggleSagaGroup('${groupId}')">
      <div class="saga-initial">${sagaInitials(sagaName)}</div>
      <span class="jnl-saga-title">${esc(sagaName)}</span>
      <span class="jnl-saga-cnt">${count} book${count !== 1 ? 's' : ''}</span>
      <span class="jnl-caret saga-caret">›</span>
    </div>
    <div class="jnl-saga-books">
      ${sorted.map(e => renderEntryRow(e, all, libDataMap, true)).join('')}
      <div class="jnl-saga-footer">
        <button class="claude-btn claude-btn--series" onclick="openSagaWithClaude('${groupId}')">
          <span class="claude-icon">✦</span> Ask Claude — Full Series
        </button>
      </div>
    </div>
  </div>`;
}

function renderJournalGrid(filtered, all) {
  const list = document.getElementById('jnl-list');
  if (!list) return;
  if (!filtered.length) {
    const isFiltered = jnlState.author !== 'all';
    list.innerHTML = `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">${isFiltered ? 'No entries for this author' : 'No entries yet'}</div>
      <div class="empty-desc">${isFiltered
        ? `Filtered by <strong>${esc(jnlState.author)}</strong>. <a href="#" onclick="filterJournalByAuthor('all');return false">Clear</a>`
        : 'Log the first book above. Your raw thoughts become polished content.'}</div>
    </div>`;
    return;
  }

  // Build a title → { tags, sagaOrder } lookup from the library
  const libDataMap = new Map(
    getLibrary().map(b => [b.title.toLowerCase(), { tags: b.tags || [], sagaOrder: b.sagaOrder ?? null }])
  );

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

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const page       = Math.max(1, Math.min(jnlState.page || 1, totalPages));
  jnlState.page    = page;
  const pageItems  = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  list.innerHTML   = pageItems.map(item =>
    item.type === 'saga'
      ? renderSagaGroup(item.sagaName, item.entries, all, libDataMap)
      : renderEntryRow(item.entry, all, libDataMap)
  ).join('') + (totalPages > 1 ? renderJournalPagination(page, totalPages) : '');
  initJnlSagaBooksDrag();
}

function renderJournalPagination(page, totalPages) {
  let btns = `<button class="jpag-btn" onclick="setJournalPage(${page - 1})"${page === 1 ? ' disabled' : ''}>‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === totalPages - 2) btns += `<span class="jpag-ellipsis">…</span>`;
      continue;
    }
    btns += `<button class="jpag-btn${i === page ? ' active' : ''}" onclick="setJournalPage(${i})">${i}</button>`;
  }
  btns += `<button class="jpag-btn" onclick="setJournalPage(${page + 1})"${page === totalPages ? ' disabled' : ''}>›</button>`;
  return `<div class="jnl-pagination">${btns}</div>`;
}

function setJournalPage(n) {
  jnlState.page = n;
  applyJournalFilters();
  document.getElementById('jnl-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Main view ─────────────────────────────────────────────────────
function renderJournalView() {
  // Reset filters so navigating back always shows everything
  jnlState.author = 'all';
  jnlState.tag    = 'all';
  jnlState.page   = 1;
  _jnlAuthExpanded = false;

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
      <datalist id="library-titles-list"></datalist>
      <div class="jnl-form">
        <div class="jnl-row">
          <input id="jnl-title"  type="text" class="jnl-input" placeholder="Book title *"
            list="library-titles-list"
            oninput="autoFillFromLibrary(this.value)"
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
        <div class="jnl-saga-row">
          <label class="jnl-saga-label">
            <input type="checkbox" id="jnl-owns-book" onchange="toggleOwnedInput(this.checked)">
            <span>I own this book</span>
          </label>
          <select id="jnl-own-format" class="jnl-input lib-select" style="display:none;color-scheme:dark">
            <option value="physical">Physical copy</option>
            <option value="ebook">eBook</option>
          </select>
        </div>
        <textarea id="jnl-thoughts" class="jnl-input jnl-ta" rows="5"
          placeholder="Your raw thoughts — what worked, what didn't, what haunted you, what you'd tell a friend picking this up…"></textarea>
        <div class="jnl-form-footer">
          <span class="jnl-hint">After logging, hit <strong>Ask Claude</strong> on the entry for a review, caption &amp; TikTok hook.</span>
          <button class="jnl-save-btn" onclick="addJournalEntry()">Log book</button>
        </div>
      </div>
    </div>`;

  if (j.length) {
    // Build tag list from library entries that match journal books
    const libTagMapForFilter = new Map(getLibrary().map(b => [b.title.toLowerCase(), b.tags || []]));
    const journalTagsSet = new Set();
    j.forEach(e => (libTagMapForFilter.get(e.title.toLowerCase()) || []).forEach(t => journalTagsSet.add(t)));
    const journalTags = [...journalTagsSet];

    const SHOW_N   = 8;
    const hasExtra = uniqueAuthors.length > SHOW_N;
    const extraCnt = uniqueAuthors.length - SHOW_N;

    html += `<div class="jnl-filter-bar">
      <div class="jnl-filter-section">
        <span class="jnl-filter-label">Author:</span>
        <div class="jnl-author-pills${_jnlAuthExpanded ? ' expanded' : ''}" id="jnl-author-pills">
          <button class="jnl-apill" data-author="all" onclick="filterJournalByAuthor('all')">All <span class="pill-count">${j.length}</span></button>
          ${uniqueAuthors.map((a, i) => {
            const cnt  = j.filter(e => e.author === a).length;
            const xtra = i >= SHOW_N ? ' jnl-pill-extra' : '';
            return `<button class="jnl-apill${xtra}" data-author="${esc(a)}" onclick="filterJournalByAuthor('${esc(a).replace(/'/g,"\\'")}')">
              ${esc(a)} <span class="pill-count">${cnt}</span></button>`;
          }).join('')}
          ${hasExtra ? `<button class="jnl-pill-toggle" id="jnl-auth-toggle" data-extra="${extraCnt}" onclick="toggleJnlAuthors()">
            ${_jnlAuthExpanded ? '↑ Less' : `+${extraCnt} more`}
          </button>` : ''}
        </div>
      </div>
      ${journalTags.length ? `<div class="jnl-filter-section">
        <span class="jnl-filter-label">Tags:</span>
        <div class="jnl-tag-pills">
          <button class="jnl-apill" onclick="filterJournalByTag('all')">All</button>
          ${journalTags.map(t => {
            const c     = tagColor(t);
            const tSafe = esc(t).replace(/'/g, '&#39;');
            return `<button class="jnl-apill jnl-tag-fpill" data-tag="${esc(t)}"
              onclick="filterJournalByTag('${tSafe}')">${esc(t)}</button>`;
          }).join('')}
        </div>
      </div>` : ''}
    </div>`;
    html += `<div class="jnl-toolbar">
      <span class="jnl-count">${j.length} book${j.length !== 1 ? 's' : ''} logged</span>
      <div class="jnl-sort-group">
        <button class="jnl-sort-btn active" data-sort="date"   onclick="sortJournal('date')">Latest</button>
        <button class="jnl-sort-btn"        data-sort="rating" onclick="sortJournal('rating')">Top rated</button>
      </div>
    </div>`;
  }

  html += `<div id="jnl-list" class="jnl-list"></div></div>`;
  document.getElementById('main-content').innerHTML = html;
  refreshAuthorsList();
  refreshLibraryTitlesList();
  applyJournalFilters();
  syncJournalFromCloud();
}

// ─── Drag books within a journal saga to reorder ──────────────────
function initJnlSagaBooksDrag() {
  document.querySelectorAll('.jnl-saga-group').forEach(group => {
    const sagaName = group.dataset.sagaName;
    if (!sagaName) return;
    const books = group.querySelector('.jnl-saga-books');
    if (!books) return;

    let dragSrc = null;
    const getEntries = () => [...books.querySelectorAll(':scope > .jnl-entry')];

    function commitOrder() {
      const newOrder = getEntries().map(r => parseInt(r.dataset.addedAt, 10));
      const sagaBooks = getJnlSagaBooks();
      sagaBooks[sagaName] = newOrder;
      saveJnlSagaBooks(sagaBooks);
    }

    getEntries().forEach(entry => {
      const handle = entry.querySelector('.jnl-entry-drag-handle');
      if (!handle) return;

      // ── Desktop mouse drag ──────────────────────────────────────────
      handle.addEventListener('mousedown', () => { entry.draggable = true; });

      entry.addEventListener('dragstart', e => {
        dragSrc = entry;
        entry.classList.add('jnl-entry-dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      entry.addEventListener('dragend', () => {
        entry.draggable = false;
        entry.classList.remove('jnl-entry-dragging');
        getEntries().forEach(r => r.classList.remove('jnl-entry-over'));
        dragSrc = null;
      });
      entry.addEventListener('dragover', e => {
        e.preventDefault();
        if (dragSrc && entry !== dragSrc) {
          getEntries().forEach(r => r.classList.remove('jnl-entry-over'));
          entry.classList.add('jnl-entry-over');
        }
      });
      entry.addEventListener('drop', e => {
        e.preventDefault();
        entry.classList.remove('jnl-entry-over');
        if (!dragSrc || dragSrc === entry) return;
        const current = getEntries();
        if (current.indexOf(dragSrc) < current.indexOf(entry)) entry.after(dragSrc);
        else entry.before(dragSrc);
        commitOrder();
      });

      // ── Mobile touch drag ───────────────────────────────────────────
      handle.addEventListener('touchstart', e => {
        e.preventDefault();
        dragSrc = entry;
        entry.classList.add('jnl-entry-dragging');
      }, { passive: false });

      handle.addEventListener('touchmove', e => {
        if (!dragSrc) return;
        e.preventDefault();
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.jnl-entry');
        getEntries().forEach(r => r.classList.remove('jnl-entry-over'));
        if (target && target !== dragSrc && books.contains(target)) {
          target.classList.add('jnl-entry-over');
        }
      }, { passive: false });

      handle.addEventListener('touchend', e => {
        if (!dragSrc) return;
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.jnl-entry');
        dragSrc.classList.remove('jnl-entry-dragging');
        getEntries().forEach(r => r.classList.remove('jnl-entry-over'));
        if (target && target !== dragSrc && books.contains(target)) {
          const current = getEntries();
          if (current.indexOf(dragSrc) < current.indexOf(target)) target.after(dragSrc);
          else target.before(dragSrc);
          commitOrder();
        }
        dragSrc = null;
      });
    });
  });
}
