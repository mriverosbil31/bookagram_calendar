// ─── Launch Checklist ─────────────────────────────────────────────
const TODO_KEY    = 'thc_todos';
const LAUNCH_DATE = '2026-05-15';

const CATEGORY_COLORS = {
  'Physical Setup':    '#8b1a1a',
  'Accounts & Profiles': '#1a5c4a',
  'Content Library':   '#7a5500',
  'Production':        '#2a2620',
  'Community':         '#6B3FA0',
  'Content Creation':  '#1a4060',
  'Finishing Touches': '#6b6458',
  'Launch Day':        '#c0392b',
};

const DEFAULT_TODOS = [
  { id: 1,  text: "Set up your book corner — find a spot with good natural light",          done: false, date: '2026-04-27', category: 'Physical Setup' },
  { id: 2,  text: "Set up your ring light or softbox lighting and test it",                 done: false, date: '2026-04-28', category: 'Physical Setup' },
  { id: 3,  text: "Test your microphone — record a 30-second voice clip and review it",     done: false, date: '2026-04-29', category: 'Physical Setup' },
  { id: 4,  text: "Style your bookshelf aesthetically — props, plants, candles, colours",   done: false, date: '2026-04-30', category: 'Physical Setup' },
  { id: 5,  text: "Create your Instagram account — write the bio and upload your photo",    done: false, date: '2026-05-01', category: 'Accounts & Profiles' },
  { id: 6,  text: "Create your TikTok account — bio, profile pic, link to Instagram",       done: false, date: '2026-05-02', category: 'Accounts & Profiles' },
  { id: 7,  text: "Log all books you've read into the Reading Journal on this site",        done: false, date: '2026-05-03', category: 'Content Library' },
  { id: 8,  text: "Add all owned books to My Library with Physical / eBook tags",           done: false, date: '2026-05-04', category: 'Content Library' },
  { id: 9,  text: "Pick your first 5 books to feature — one highlight per week",            done: false, date: '2026-05-05', category: 'Content Library' },
  { id: 10, text: "Practice shelf shots — try 3 different angles and lighting setups",      done: false, date: '2026-05-06', category: 'Production' },
  { id: 11, text: "Write your first Instagram caption using Ask Claude on a journal entry", done: false, date: '2026-05-07', category: 'Production' },
  { id: 12, text: "Film your intro TikTok — \"Who is The Husband's Corner?\"",              done: false, date: '2026-05-08', category: 'Production' },
  { id: 13, text: "Follow 30 accounts in the thriller & bookstagram niche",                 done: false, date: '2026-05-09', category: 'Community' },
  { id: 14, text: "Photograph your first 3 Instagram carousel posts",                       done: false, date: '2026-05-10', category: 'Content Creation' },
  { id: 15, text: "Script and film 2 TikTok book reviews using your journal notes",         done: false, date: '2026-05-11', category: 'Content Creation' },
  { id: 16, text: "Write captions for launch week — use the calendar and Ask Claude",       done: false, date: '2026-05-12', category: 'Content Creation' },
  { id: 17, text: "Design Instagram Story highlight covers (Canva works great)",            done: false, date: '2026-05-13', category: 'Finishing Touches' },
  { id: 18, text: "Final check — bio, links, profile photos, first posts look right",       done: false, date: '2026-05-14', category: 'Finishing Touches' },
  { id: 19, text: "GO LIVE — post your first content on Instagram and TikTok!",             done: false, date: '2026-05-15', category: 'Launch Day' },
];

// ─── Data ─────────────────────────────────────────────────────────
function getTodos() {
  try { return JSON.parse(localStorage.getItem(TODO_KEY)) || []; }
  catch { return []; }
}
function saveTodos(arr) { localStorage.setItem(TODO_KEY, JSON.stringify(arr)); }

function initTodos() {
  if (!getTodos().length) saveTodos(DEFAULT_TODOS);
}

// ─── CRUD ─────────────────────────────────────────────────────────
function toggleTodo(id) {
  const todos = getTodos();
  const t = todos.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  saveAndSyncTodos(todos);
  renderTodosView();
}

function deleteTodo(id) {
  saveAndSyncTodos(getTodos().filter(t => t.id !== id));
  renderTodosView();
}

function addTodo() {
  const text = document.getElementById('td-text')?.value.trim();
  const date = document.getElementById('td-date')?.value;
  const cat  = document.getElementById('td-cat')?.value.trim() || 'Custom';
  if (!text) { document.getElementById('td-text')?.focus(); return; }
  const todos = getTodos();
  todos.push({ id: Date.now(), text, done: false, date: date || '', category: cat });
  saveAndSyncTodos(todos);
  document.getElementById('td-text').value = '';
  document.getElementById('td-date').value = '';
  renderTodosView();
}

function saveTodoText(id, newText) {
  if (!newText.trim()) return;
  const todos = getTodos();
  const t = todos.find(t => t.id === id);
  if (!t || t.text === newText.trim()) return;
  t.text = newText.trim();
  saveAndSyncTodos(todos);
}

// ─── Helpers ──────────────────────────────────────────────────────
function todoFormatDate(d) {
  if (!d) return '';
  return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function todoIsOverdue(d) {
  if (!d) return false;
  return new Date(d + 'T23:59:59') < new Date();
}

function launchCountdown() {
  const diff = Math.ceil((new Date(LAUNCH_DATE + 'T00:00:00') - new Date()) / 86400000);
  if (diff > 1)  return `${diff} days to launch`;
  if (diff === 1) return 'Tomorrow is launch day!';
  if (diff === 0) return 'Launch day is today!';
  return `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} since launch`;
}

// ─── View ─────────────────────────────────────────────────────────
function renderTodosView() {
  const todos  = getTodos();
  const done   = todos.filter(t => t.done).length;
  const total  = todos.length;
  const pct    = total ? Math.round((done / total) * 100) : 0;

  // group by category, preserving insertion order
  const groups = {};
  todos.forEach(t => {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  });

  // existing categories for the add-form datalist
  const cats = Object.keys(groups);

  let html = `<div class="todos-view">
    <div class="view-header">
      <div class="view-header-title">Launch Checklist</div>
      <div class="view-header-sub">One task a day — going live on 15 May 2026.</div>
    </div>

    <div class="todo-progress-panel">
      <div class="todo-progress-top">
        <span class="todo-progress-label">${done} of ${total} tasks done</span>
        <span class="todo-countdown">${launchCountdown()}</span>
      </div>
      <div class="todo-progress-track">
        <div class="todo-progress-fill" style="width:${pct}%"></div>
      </div>
    </div>

    <div class="jnl-add-panel" style="margin-bottom:20px">
      <div class="jnl-panel-title">+ Add a task</div>
      <datalist id="td-cats-list">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist>
      <div class="td-add-form">
        <input id="td-text" type="text" class="jnl-input" placeholder="Task description *"
          onkeydown="if(event.key==='Enter')addTodo()">
        <input id="td-date" type="date" class="jnl-input jnl-date-fld">
        <input id="td-cat"  type="text" class="jnl-input td-cat-in" placeholder="Category"
          list="td-cats-list">
        <button class="jnl-save-btn" onclick="addTodo()">Add</button>
      </div>
    </div>

    <div class="todo-groups">`;

  Object.entries(groups).forEach(([cat, items]) => {
    const color    = CATEGORY_COLORS[cat] || '#6b6458';
    const catDone  = items.filter(t => t.done).length;
    const isLaunch = cat === 'Launch Day';

    html += `<div class="todo-group${isLaunch ? ' todo-group--launch' : ''}">
      <div class="todo-group-hd">
        <span class="todo-group-dot" style="background:${color}"></span>
        <span class="todo-group-name">${esc(cat)}</span>
        <span class="todo-group-count">${catDone}/${items.length}</span>
      </div>
      <div class="todo-items">`;

    items.forEach(t => {
      const overdue  = !t.done && todoIsOverdue(t.date);
      const dateStr  = todoFormatDate(t.date);
      html += `<div class="todo-item${t.done ? ' todo-done' : ''}${overdue ? ' todo-overdue' : ''}" style="border-left-color:${color}">
        <button class="todo-check${t.done ? ' checked' : ''}" onclick="toggleTodo(${t.id})" title="${t.done ? 'Mark undone' : 'Mark done'}">
          ${t.done ? '✓' : ''}
        </button>
        <span class="todo-text" onclick="startEditTodo(${t.id},this)" title="Click to edit">${esc(t.text)}</span>
        ${dateStr ? `<span class="todo-date${overdue ? ' overdue' : ''}">${dateStr}</span>` : ''}
        <button class="todo-del" onclick="deleteTodo(${t.id})" title="Delete">×</button>
      </div>`;
    });

    html += `</div></div>`;
  });

  if (!total) {
    html += `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">No tasks yet</div>
      <div class="empty-desc">Add your first task above.</div>
    </div>`;
  }

  html += `</div></div>`;
  document.getElementById('main-content').innerHTML = html;
  syncTodosFromCloud();
}

function startEditTodo(id, el) {
  const inp = document.createElement('input');
  inp.className = 'todo-edit-in';
  inp.value = el.textContent;
  inp.onblur = () => { saveTodoText(id, inp.value); renderTodosView(); };
  inp.onkeydown = e => {
    if (e.key === 'Enter')  { inp.blur(); }
    if (e.key === 'Escape') { inp.value = el.textContent; inp.blur(); }
  };
  el.replaceWith(inp);
  inp.focus();
  inp.select();
}
