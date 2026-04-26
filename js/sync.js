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
