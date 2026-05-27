// ─── Supabase client ──────────────────────────────────────────────
const _supa = supabase.createClient(
  'https://zuzpfvpbvmpkegfbjpdh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1enBmdnBidm1wa2VnZmJqcGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDIxOTEsImV4cCI6MjA5Mjc3ODE5MX0.5pds87uuuX7aZ0sgYQhjFi3WQ3eeHGxGlGogL45yrJ0'
);

// ─── Journal sync ─────────────────────────────────────────────────
async function pushToSupabase(entries) {
  try {
    await _supa.from('journal').upsert({ id: 'main', entries, updated_at: new Date().toISOString() });
  } catch (e) {
    console.warn('[sync] journal push failed', e);
  }
}

async function syncJournalFromCloud() {
  try {
    const { data, error } = await _supa.from('journal').select('entries').eq('id', 'main').single();
    if (error) throw error;
    const remote = data?.entries || [];
    const local  = getJournal();
    if (remote.length === 0 && local.length > 0) {
      await pushToSupabase(local);
      return;
    }
    if (JSON.stringify(remote) !== JSON.stringify(local)) {
      saveJournal(remote);
      applyJournalFilters();
    }
  } catch (e) {
    console.warn('[sync] journal fetch failed, using local cache', e);
  }
}

function saveAndSync(arr) {
  saveJournal(arr);
  pushToSupabase(arr);
}

// ─── Library sync ─────────────────────────────────────────────────
async function pushLibraryToSupabase(entries) {
  try {
    await _supa.from('journal').upsert({ id: 'library', entries, updated_at: new Date().toISOString() });
  } catch (e) {
    console.warn('[sync] library push failed', e);
  }
}

async function syncLibraryFromCloud() {
  try {
    const { data, error } = await _supa.from('journal').select('entries').eq('id', 'library').single();
    if (error) throw error;
    const remote = data?.entries || [];
    const local  = getLibrary();
    if (remote.length === 0 && local.length > 0) { await pushLibraryToSupabase(local); return; }
    if (JSON.stringify(remote) !== JSON.stringify(local)) { saveLibrary(remote); renderLibGrid(); }
  } catch (e) {
    console.warn('[sync] library fetch failed, using local cache', e);
  }
}

function saveAndSyncLibrary(arr) {
  saveLibrary(arr);
  pushLibraryToSupabase(arr);
}

// ─── Todos sync ───────────────────────────────────────────────────
async function pushTodosToSupabase(entries) {
  try {
    await _supa.from('journal').upsert({ id: 'todos', entries, updated_at: new Date().toISOString() });
  } catch (e) { console.warn('[sync] todos push failed', e); }
}

async function syncTodosFromCloud() {
  try {
    const { data, error } = await _supa.from('journal').select('entries').eq('id', 'todos').single();
    if (error) throw error;
    const remote = data?.entries || [];
    const local  = getTodos();
    if (remote.length === 0 && local.length > 0) { await pushTodosToSupabase(local); return; }
    if (JSON.stringify(remote) !== JSON.stringify(local)) { saveTodos(remote); renderTodosView(); }
  } catch (e) { console.warn('[sync] todos fetch failed, using local cache', e); }
}

function saveAndSyncTodos(arr) {
  saveTodos(arr);
  pushTodosToSupabase(arr);
}

// ─── Calendar data sync (books, archived, custom posts) ───────────
// Track the last time each data type was written locally.
// syncCalendarFromCloud will not overwrite a type that was written
// within the last 10 s — this covers the in-flight push window and
// any sync triggered immediately after a user action (focus / visibility).
const _calLastWrite = {};
const _SYNC_GRACE   = 10_000;
function _calTouch(type) { _calLastWrite[type] = Date.now(); }
function _calFresh(type) { return (Date.now() - (_calLastWrite[type] || 0)) < _SYNC_GRACE; }

async function _pushCal(id, entries) {
  try {
    const { error } = await _supa.from('journal').upsert({ id, entries, updated_at: new Date().toISOString() });
    if (error) console.warn('[sync] push failed', id, error);
  } catch(e) { console.warn('[sync] push error', id, e); }
}

function saveAndSyncCalBooks(obj) {
  saveAllBooks(obj); _calTouch('books'); _pushCal('cal_books', obj);
}
function saveAndSyncArchived(set) {
  saveArchived(set); _calTouch('archived'); _pushCal('cal_archived', [...set]);
}
function saveAndSyncCustomPosts(arr) {
  saveCustomPosts(arr); _calTouch('custom'); _pushCal('cal_custom', arr);
}
function saveAndSyncPostOverrides(obj) {
  savePostOverrides(obj); _calTouch('overrides'); _pushCal('cal_overrides', obj);
}
function saveAndSyncDeletedPosts(set) {
  saveDeletedPosts(set); _calTouch('deleted'); _pushCal('cal_deleted', [...set]);
}

async function syncCalendarFromCloud() {
  try {
    const [booksRes, archivedRes, customRes, overridesRes, deletedRes] = await Promise.all([
      _supa.from('journal').select('entries').eq('id', 'cal_books').single(),
      _supa.from('journal').select('entries').eq('id', 'cal_archived').single(),
      _supa.from('journal').select('entries').eq('id', 'cal_custom').single(),
      _supa.from('journal').select('entries').eq('id', 'cal_overrides').single(),
      _supa.from('journal').select('entries').eq('id', 'cal_deleted').single(),
    ]);

    let changed = false;

    const remoteBooks = booksRes.data?.entries || {};
    const localBooks  = getAllBooks();
    if (Object.keys(remoteBooks).length === 0 && Object.keys(localBooks).length > 0) {
      _supa.from('journal').upsert({ id: 'cal_books', entries: localBooks, updated_at: new Date().toISOString() }).catch(() => {});
    } else if (JSON.stringify(remoteBooks) !== JSON.stringify(localBooks) && !_calFresh('books')) {
      saveAllBooks(remoteBooks); changed = true;
    }

    const remoteArchived = archivedRes.data?.entries || [];
    const localArchived  = [...getArchived()].sort();
    if (remoteArchived.length === 0 && localArchived.length > 0) {
      _supa.from('journal').upsert({ id: 'cal_archived', entries: localArchived, updated_at: new Date().toISOString() }).catch(() => {});
    } else if (JSON.stringify([...remoteArchived].sort()) !== JSON.stringify(localArchived) && !_calFresh('archived')) {
      saveArchived(new Set(remoteArchived)); changed = true;
    }

    const remoteCustom = customRes.data?.entries || [];
    const localCustom  = getCustomPosts();
    if (remoteCustom.length === 0 && localCustom.length > 0) {
      _supa.from('journal').upsert({ id: 'cal_custom', entries: localCustom, updated_at: new Date().toISOString() }).catch(() => {});
    } else if (JSON.stringify(remoteCustom) !== JSON.stringify(localCustom) && !_calFresh('custom')) {
      saveCustomPosts(remoteCustom); changed = true;
    }

    const remoteOverrides = overridesRes.data?.entries || {};
    const localOverrides  = getPostOverrides();
    if (Object.keys(remoteOverrides).length === 0 && Object.keys(localOverrides).length > 0) {
      _supa.from('journal').upsert({ id: 'cal_overrides', entries: localOverrides, updated_at: new Date().toISOString() }).catch(() => {});
    } else if (JSON.stringify(remoteOverrides) !== JSON.stringify(localOverrides) && !_calFresh('overrides')) {
      savePostOverrides(remoteOverrides); changed = true;
    }

    const remoteDeleted = deletedRes.data?.entries || [];
    const localDeleted  = [...getDeletedPosts()].sort();
    if (remoteDeleted.length === 0 && localDeleted.length > 0) {
      _supa.from('journal').upsert({ id: 'cal_deleted', entries: localDeleted, updated_at: new Date().toISOString() }).catch(() => {});
    } else if (JSON.stringify([...remoteDeleted].sort()) !== JSON.stringify(localDeleted) && !_calFresh('deleted')) {
      saveDeletedPosts(new Set(remoteDeleted)); changed = true;
    }

    if (changed && currentView === 'calendar') renderCalendar();
  } catch (e) { console.warn('[sync] calendar fetch failed, using local cache', e); }
}
