// ─── Storage keys ─────────────────────────────────────────────────
const ARCHIVED_KEY        = 'thc_archived';
const BOOKS_KEY           = 'thc_books';
const CUSTOM_LINKS_KEY    = 'thc_custom_links';
const POST_OVERRIDES_KEY  = 'thc_post_overrides';
const DELETED_POSTS_KEY   = 'thc_deleted_posts';

// ─── Shared constants ─────────────────────────────────────────────
const ITEMS_PER_PAGE = 15;

// ─── State ────────────────────────────────────────────────────────
let currentView  = 'calendar';
let currentMonth = 0;
let archivedOpen = false;

// ─── Drawer ───────────────────────────────────────────────────────
function toggleDrawer() {
  document.getElementById('side-drawer').classList.toggle('open');
  document.getElementById('drawer-overlay').classList.toggle('open');
}
function closeDrawer() {
  document.getElementById('side-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

// ─── Storage helpers ──────────────────────────────────────────────
function getArchived() {
  try { return new Set(JSON.parse(localStorage.getItem(ARCHIVED_KEY)) || []); }
  catch { return new Set(); }
}
function saveArchived(set) {
  localStorage.setItem(ARCHIVED_KEY, JSON.stringify([...set]));
}
function getAllBooks() {
  try {
    const d = JSON.parse(localStorage.getItem(BOOKS_KEY));
    if (!d || typeof d !== 'object' || Array.isArray(d)) return {};
    // Drop any key whose value isn't an array (guards against corrupted data)
    const clean = {};
    for (const [k, v] of Object.entries(d)) { if (Array.isArray(v)) clean[k] = v; }
    return clean;
  } catch { return {}; }
}
function saveAllBooks(obj) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(obj));
}
function getBooksForPost(id) {
  return (getAllBooks()[id] || []).map(normBook);
}
function getPostOverrides() {
  try { return JSON.parse(localStorage.getItem(POST_OVERRIDES_KEY)) || {}; }
  catch { return {}; }
}
function savePostOverrides(obj) {
  localStorage.setItem(POST_OVERRIDES_KEY, JSON.stringify(obj));
}
function getDeletedPosts() {
  try { return new Set(JSON.parse(localStorage.getItem(DELETED_POSTS_KEY)) || []); }
  catch { return new Set(); }
}
function saveDeletedPosts(set) {
  localStorage.setItem(DELETED_POSTS_KEY, JSON.stringify([...set]));
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

// getAllAuthors pulls from both calendar books and journal entries
function getAllAuthors() {
  const authors = new Set();
  Object.values(getAllBooks()).forEach(arr =>
    arr.forEach(b => { const a = normBook(b).author; if (a) authors.add(a); })
  );
  getJournal().forEach(e => { if (e.author) authors.add(e.author); });
  return [...authors].sort();
}

// ─── Shared utils ─────────────────────────────────────────────────
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function refreshAuthorsList() {
  const el = document.getElementById('global-authors-list');
  if (!el) return;
  el.innerHTML = getAllAuthors().map(a => `<option value="${esc(a)}">`).join('');
}

// ─── Navigation ───────────────────────────────────────────────────
function renderMonthNav() {
  document.getElementById('month-nav').innerHTML = months.map((m, i) =>
    `<button class="mnav${i === currentMonth ? ' active' : ''}" onclick="setMonth(${i})">${m.name}</button>`
  ).join('');
}

function setView(view) {
  currentView = view;
  window.location.hash = view;
  document.querySelectorAll('.vnav').forEach(b => b.classList.remove('active'));
  document.getElementById('vnav-' + view)?.classList.add('active');
  document.getElementById('month-nav-wrap').style.display = view === 'calendar' ? '' : 'none';
  closeDrawer();
  if (view === 'calendar')       { renderMonthNav(); renderCalendar(); syncCalendarFromCloud(); }
  else if (view === 'books')     renderBooksView();
  else if (view === 'resources') renderResourcesView();
  else if (view === 'journal')   { jnlState = { sort: 'date', author: 'all', page: 1 }; renderJournalView(); }
  else if (view === 'library')   { libState = { page: 1, format: 'all', read: 'all', search: '', author: 'all', tag: 'all' }; renderLibraryView(); }
  else if (view === 'todos')     renderTodosView();
  else if (view === 'sprint')    renderSprintView();
}

function setMonth(i) {
  currentMonth = i;
  archivedOpen = false;
  renderMonthNav();
  renderCalendar();
  const mainTop = document.querySelector('.main').offsetTop - 70;
  window.scrollTo({ top: mainTop, behavior: 'smooth' });
}

// ─── Init ─────────────────────────────────────────────────────────
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

  initTodos();
  const hash  = window.location.hash.slice(1);
  const valid = ['calendar', 'books', 'journal', 'resources', 'library', 'todos', 'sprint'];
  setView(valid.includes(hash) ? hash : 'calendar');

  // Re-sync when the user switches back to this tab, so changes from another
  // device show up without needing a full page refresh.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentView === 'calendar') syncCalendarFromCloud();
  });
  window.addEventListener('focus', () => {
    if (currentView === 'calendar') syncCalendarFromCloud();
  });
});
