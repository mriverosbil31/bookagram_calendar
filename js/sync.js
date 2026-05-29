// ─── Supabase direct fetch helpers ───────────────────────────────
const _SUPA_URL = 'https://zuzpfvpbvmpkegfbjpdh.supabase.co/rest/v1/journal';
const _SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enBmdnBidm1wa2VnZmJqcGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDIxOTEsImV4cCI6MjA5Mjc3ODE5MX0.5pds87uuuX7aZ0sgYQhjFi3WQ3eeHGxGlGogL45yrJ0';
const _SUPA_HDR = {
  'apikey': _SUPA_KEY,
  'Authorization': 'Bearer ' + _SUPA_KEY,
  'Content-Type': 'application/json',
};

async function _sbGet(id) {
  const res = await fetch(_SUPA_URL + '?id=eq.' + id + '&select=entries', { headers: _SUPA_HDR });
  if (!res.ok) throw new Error('GET ' + id + ' failed: ' + res.status);
  const rows = await res.json();
  return rows[0]?.entries ?? null;
}

async function _sbSet(id, entries) {
  const res = await fetch(_SUPA_URL, {
    method: 'POST',
    headers: { ..._SUPA_HDR, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({ id, entries, updated_at: new Date().toISOString() })
  });
  if (!res.ok) console.warn('[sync] push failed', id, res.status);
}

// ─── Journal sync ─────────────────────────────────────────────────
async function syncJournalFromCloud() {
  try {
    const remote = await _sbGet('main') || [];
    const local  = getJournal();
    if (remote.length === 0 && local.length > 0) { _sbSet('main', local); return; }
    if (JSON.stringify(remote) !== JSON.stringify(local)) {
      saveJournal(remote);
      if (currentView === 'journal') renderJournalView();
    }
  } catch(e) { console.warn('[sync] journal fetch failed', e); }
}

function saveAndSync(arr) {
  saveJournal(arr);
  _sbSet('main', arr);
}

// ─── Library sync ─────────────────────────────────────────────────
async function syncLibraryFromCloud() {
  try {
    const remote = await _sbGet('library') || [];
    const local  = getLibrary();
    if (remote.length === 0 && local.length > 0) { _sbSet('library', local); return; }
    if (JSON.stringify(remote) !== JSON.stringify(local)) {
      saveLibrary(remote);
      if (currentView === 'library') { renderLibGrid(); refreshLibraryTitlesList(); }
    }
  } catch(e) { console.warn('[sync] library fetch failed', e); }
}

function saveAndSyncLibrary(arr) {
  saveLibrary(arr);
  _sbSet('library', arr);
}

// ─── Todos sync ───────────────────────────────────────────────────
async function syncTodosFromCloud() {
  try {
    const remote = await _sbGet('todos') || [];
    const local  = getTodos();
    if (remote.length === 0 && local.length > 0) { _sbSet('todos', local); return; }
    if (JSON.stringify(remote) !== JSON.stringify(local)) {
      saveTodos(remote);
      if (currentView === 'todos') renderTodosView();
    }
  } catch(e) { console.warn('[sync] todos fetch failed', e); }
}

function saveAndSyncTodos(arr) {
  saveTodos(arr);
  _sbSet('todos', arr);
}

// ─── Calendar data sync ───────────────────────────────────────────
const _calLastWrite = {};
const _SYNC_GRACE   = 10_000;
function _calTouch(type) { _calLastWrite[type] = Date.now(); }
function _calFresh(type) { return (Date.now() - (_calLastWrite[type] || 0)) < _SYNC_GRACE; }

function saveAndSyncCalBooks(obj)      { saveAllBooks(obj);    _calTouch('books');     _sbSet('cal_books',     obj); }
function saveAndSyncArchived(set)      { saveArchived(set);    _calTouch('archived');  _sbSet('cal_archived',  [...set]); }
function saveAndSyncCustomPosts(arr)   { saveCustomPosts(arr); _calTouch('custom');    _sbSet('cal_custom',    arr); }
function saveAndSyncPostOverrides(obj) { savePostOverrides(obj);_calTouch('overrides');_sbSet('cal_overrides', obj); }
function saveAndSyncDeletedPosts(set)  { saveDeletedPosts(set);_calTouch('deleted');   _sbSet('cal_deleted',   [...set]); }

async function syncCalendarFromCloud() {
  try {
    const [remoteBooks, remoteArchived, remoteCustom, remoteOverrides, remoteDeleted] = await Promise.all([
      _sbGet('cal_books'), _sbGet('cal_archived'), _sbGet('cal_custom'),
      _sbGet('cal_overrides'), _sbGet('cal_deleted')
    ]);

    let changed = false;

    const books = remoteBooks || {};
    const localBooks = getAllBooks();
    if (!Object.keys(books).length && Object.keys(localBooks).length) { _sbSet('cal_books', localBooks); }
    else if (JSON.stringify(books) !== JSON.stringify(localBooks) && !_calFresh('books')) { saveAllBooks(books); changed = true; }

    const arch = remoteArchived || [];
    const localArch = [...getArchived()].sort();
    if (!arch.length && localArch.length) { _sbSet('cal_archived', localArch); }
    else if (JSON.stringify([...arch].sort()) !== JSON.stringify(localArch) && !_calFresh('archived')) { saveArchived(new Set(arch)); changed = true; }

    const custom = remoteCustom || [];
    const localCustom = getCustomPosts();
    if (!custom.length && localCustom.length) { _sbSet('cal_custom', localCustom); }
    else if (JSON.stringify(custom) !== JSON.stringify(localCustom) && !_calFresh('custom')) { saveCustomPosts(custom); changed = true; }

    const overrides = remoteOverrides || {};
    const localOverrides = getPostOverrides();
    if (!Object.keys(overrides).length && Object.keys(localOverrides).length) { _sbSet('cal_overrides', localOverrides); }
    else if (JSON.stringify(overrides) !== JSON.stringify(localOverrides) && !_calFresh('overrides')) { savePostOverrides(overrides); changed = true; }

    const deleted = remoteDeleted || [];
    const localDeleted = [...getDeletedPosts()].sort();
    if (!deleted.length && localDeleted.length) { _sbSet('cal_deleted', localDeleted); }
    else if (JSON.stringify([...deleted].sort()) !== JSON.stringify(localDeleted) && !_calFresh('deleted')) { saveDeletedPosts(new Set(deleted)); changed = true; }

    if (changed && currentView === 'calendar') renderCalendar();
  } catch(e) { console.warn('[sync] calendar fetch failed', e); }
}
