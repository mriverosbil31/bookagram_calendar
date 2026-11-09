// ─── Christmas Book Countdown ─────────────────────────────────────
const ADVENT_KEY  = 'thc_advent';
const ADVENT_YEAR = 2026;

function getAdvent() {
  try { return JSON.parse(localStorage.getItem(ADVENT_KEY)) || {}; }
  catch { return {}; }
}
function saveAdvent(obj) {
  localStorage.setItem(ADVENT_KEY, JSON.stringify(obj));
}

function _adventDayName(d) {
  return new Date(ADVENT_YEAR, 11, d)
    .toLocaleDateString('en-US', { weekday: 'short' });
}

const _adventTimers = {};
function adventInput(day, field, value) {
  clearTimeout(_adventTimers[`${day}_${field}`]);
  _adventTimers[`${day}_${field}`] = setTimeout(() => {
    const data = getAdvent();
    if (!data[day]) data[day] = {};
    data[day][field] = value;
    saveAndSyncAdvent(data);
  }, 350);
}

function adventBackupInput(day, field, value) {
  clearTimeout(_adventTimers[`${day}_bk_${field}`]);
  _adventTimers[`${day}_bk_${field}`] = setTimeout(() => {
    const data = getAdvent();
    if (!data[day]) data[day] = {};
    if (!data[day].backup) data[day].backup = {};
    data[day].backup[field] = value;
    saveAndSyncAdvent(data);
  }, 350);
}

function toggleAdventFilmed(day) {
  const data = getAdvent();
  if (!data[day]) data[day] = {};
  // migrate old 'ready' key
  const cur = !!(data[day].filmed ?? data[day].ready);
  data[day].filmed = !cur;
  delete data[day].ready;
  saveAndSyncAdvent(data);
  const box = document.getElementById(`advent-box-${day}`);
  if (!box) return;
  const lbl = box.querySelector('.advent-filmed-label');
  if (lbl) lbl.textContent = data[day].filmed ? '✓ Filmed' : 'Filmed';
}

function toggleAdventPosted(day) {
  const data = getAdvent();
  if (!data[day]) data[day] = {};
  data[day].posted = !data[day].posted;
  saveAndSyncAdvent(data);
  const box = document.getElementById(`advent-box-${day}`);
  if (!box) return;
  const posted = data[day].posted;
  box.classList.toggle('advent-box--posted', posted);
  box.querySelectorAll('.advent-input, .advent-textarea')
     .forEach(el => el.disabled = posted);
  const lbl = box.querySelector('.advent-posted-label');
  if (lbl) lbl.textContent = posted ? '✓ Posted' : 'Posted';
  _adventUpdateProgress();
}

function toggleAdventMessaged(day) {
  const data = getAdvent();
  if (!data[day]) data[day] = {};
  data[day].messaged = !data[day].messaged;
  saveAndSyncAdvent(data);
  const box = document.getElementById(`advent-box-${day}`);
  if (!box) return;
  const messaged = data[day].messaged;
  box.classList.toggle('advent-box--messaged', messaged);
  const lbl = box.querySelector('.advent-msg-label');
  if (lbl) lbl.textContent = messaged ? '✓ Messaged' : 'Messaged?';
}

function toggleAdventBackup(day) {
  const section = document.getElementById(`advent-backup-${day}`);
  const btn     = document.getElementById(`advent-backup-btn-${day}`);
  if (!section || !btn) return;
  const open = section.style.display !== 'none';
  section.style.display = open ? 'none' : 'flex';
  btn.textContent = open ? '＋ Add backup' : '— Hide backup';
  btn.classList.toggle('advent-backup-btn--open', !open);
}

function deleteAdventBackup(day) {
  const data = getAdvent();
  if (data[day]) { data[day].backup = {}; saveAndSyncAdvent(data); }
  const section = document.getElementById(`advent-backup-${day}`);
  const btn     = document.getElementById(`advent-backup-btn-${day}`);
  if (section) section.style.display = 'none';
  if (btn) { btn.textContent = '＋ Add backup'; btn.classList.remove('advent-backup-btn--open'); }
  // clear the input fields visually
  if (section) section.querySelectorAll('.advent-input, .advent-textarea').forEach(el => el.value = '');
}

function _initAdventSortable() {
  const grid = document.querySelector('.advent-grid');
  if (!grid || typeof Sortable === 'undefined') return;
  Sortable.create(grid, {
    handle: '.advent-drag-handle',
    animation: 150,
    ghostClass: 'advent-ghost',
    chosenClass: 'advent-chosen',
    onEnd() {
      const data = getAdvent();
      const boxes = [...grid.querySelectorAll('.advent-box[data-day]')];
      const originalDays = boxes.map(el => el.dataset.day);
      // snapshot all entries by their current day key
      const snapshot = {};
      originalDays.forEach(d => { snapshot[d] = JSON.parse(JSON.stringify(data[d] || {})); });
      // remap: position 0 → day 1, position 1 → day 2, …
      originalDays.forEach((originalDay, idx) => {
        data[idx + 1] = snapshot[originalDay];
      });
      saveAndSyncAdvent(data);
      renderAdventView();
    }
  });
}

function _adventUpdateProgress() {
  const data  = getAdvent();
  const done  = Object.values(data).filter(v => v.posted).length;
  const bar   = document.querySelector('.advent-prog-fill');
  const label = document.querySelector('.advent-prog-label');
  if (bar)   bar.style.width = `${(done / 25) * 100}%`;
  if (label) label.textContent = `${done} / 25 posted`;
}

function renderAdventView() {
  const container = document.getElementById('main-content');
  if (!container) return;
  syncAdventFromCloud();
  const data = getAdvent();
  const done = Object.values(data).filter(v => v.posted).length;

  // ── Intro box ──────────────────────────────────────────────────
  const intro       = data['intro'] || {};
  const introFilmed = !!(intro.filmed ?? intro.ready);
  const introPosted = !!intro.posted;

  const introBox = `
  <div class="advent-intro-box${introPosted ? ' advent-box--posted' : ''}" id="advent-box-intro">
    <div class="advent-intro-left">
      <span class="advent-intro-icon">🎬</span>
      <div>
        <div class="advent-intro-title">Introduction Video</div>
        <div class="advent-dname">The series opener</div>
      </div>
    </div>
    <div class="advent-intro-notes">
      <span class="advent-field-lbl">Notes</span>
      <textarea class="advent-textarea" placeholder="Script ideas, filming reminders…"
        ${introPosted ? 'disabled' : ''}
        oninput="adventInput('intro','notes',this.value)">${esc(intro.notes || '')}</textarea>
    </div>
    <div class="advent-checks">
      <label class="advent-ready-wrap">
        <input type="checkbox" class="advent-chk advent-chk--filmed" ${introFilmed ? 'checked' : ''}
          onchange="toggleAdventFilmed('intro')">
        <span class="advent-filmed-label">${introFilmed ? '✓ Filmed' : 'Filmed'}</span>
      </label>
      <label class="advent-ready-wrap">
        <input type="checkbox" class="advent-chk advent-chk--posted" ${introPosted ? 'checked' : ''}
          onchange="toggleAdventPosted('intro')">
        <span class="advent-posted-label">${introPosted ? '✓ Posted' : 'Posted'}</span>
      </label>
    </div>
  </div>`;

  // ── Day boxes ──────────────────────────────────────────────────
  let boxes = '';
  for (let d = 1; d <= 24; d++) {
    const entry   = data[d] || {};
    const filmed  = !!(entry.filmed ?? entry.ready);
    const posted  = !!entry.posted;
    const msg     = !!entry.messaged;
    const bk      = entry.backup || {};
    const hasBk   = !!(bk.creator || bk.book || bk.oneliner);
    const dayName = _adventDayName(d);

    boxes += `
    <div class="advent-box${posted ? ' advent-box--posted' : ''}${msg ? ' advent-box--messaged' : ''}" id="advent-box-${d}" data-day="${d}">
      <div class="advent-box-hd">
        <div class="advent-box-hd-left">
          <span class="advent-drag-handle" title="Drag to reorder">⠿</span>
          <div class="advent-date-block">
            <span class="advent-num">${d}</span>
            <span class="advent-dname">${dayName} · Dec ${d}</span>
          </div>
        </div>
        <div class="advent-checks">
          <label class="advent-ready-wrap">
            <input type="checkbox" class="advent-chk advent-chk--msg" ${msg ? 'checked' : ''}
              onchange="toggleAdventMessaged('${d}')">
            <span class="advent-msg-label">${msg ? '✓ Messaged' : 'Messaged?'}</span>
          </label>
          <label class="advent-ready-wrap">
            <input type="checkbox" class="advent-chk advent-chk--filmed" ${filmed ? 'checked' : ''}
              onchange="toggleAdventFilmed('${d}')">
            <span class="advent-filmed-label">${filmed ? '✓ Filmed' : 'Filmed'}</span>
          </label>
          <label class="advent-ready-wrap">
            <input type="checkbox" class="advent-chk advent-chk--posted" ${posted ? 'checked' : ''}
              onchange="toggleAdventPosted('${d}')">
            <span class="advent-posted-label">${posted ? '✓ Posted' : 'Posted'}</span>
          </label>
        </div>
      </div>

      <div class="advent-fields">
        <div class="advent-field">
          <span class="advent-field-lbl">Creator</span>
          <input class="advent-input" type="text" placeholder="@handle or name"
            value="${esc(entry.creator || '')}"
            ${posted ? 'disabled' : ''}
            oninput="adventInput('${d}','creator',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Book</span>
          <input class="advent-input" type="text" placeholder="Title — Author"
            value="${esc(entry.book || '')}"
            ${posted ? 'disabled' : ''}
            oninput="adventInput('${d}','book',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Why this book?</span>
          <textarea class="advent-textarea" placeholder="One sentence…"
            ${posted ? 'disabled' : ''}
            oninput="adventInput('${d}','oneliner',this.value)">${esc(entry.oneliner || '')}</textarea>
        </div>
      </div>

      <button class="advent-backup-btn${hasBk ? ' advent-backup-btn--open' : ''}" id="advent-backup-btn-${d}"
        onclick="toggleAdventBackup('${d}')">
        ${hasBk ? '— Hide backup' : '＋ Add backup'}
      </button>

      <div class="advent-backup-section" id="advent-backup-${d}"
        style="display:${hasBk ? 'flex' : 'none'}">
        <div class="advent-backup-hd">
          <span class="advent-backup-label">Backup option</span>
          <button class="advent-backup-del" onclick="deleteAdventBackup('${d}')" title="Delete backup">✕ Delete</button>
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Creator</span>
          <input class="advent-input" type="text" placeholder="@handle or name"
            value="${esc(bk.creator || '')}"
            oninput="adventBackupInput('${d}','creator',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Book</span>
          <input class="advent-input" type="text" placeholder="Title — Author"
            value="${esc(bk.book || '')}"
            oninput="adventBackupInput('${d}','book',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Why this book?</span>
          <textarea class="advent-textarea" placeholder="One sentence…"
            oninput="adventBackupInput('${d}','oneliner',this.value)">${esc(bk.oneliner || '')}</textarea>
        </div>
      </div>
    </div>`;
  }

  container.innerHTML = `
  <div class="advent-view">
    <div class="advent-hd">
      <div class="advent-hd-left">
        <h2 class="advent-title">🎄 Christmas Book Countdown</h2>
        <p class="advent-sub">24 days · 24 books · 24 creators</p>
      </div>
      <div class="advent-hd-right">
        <div class="advent-progress">
          <div class="advent-prog-bar"><div class="advent-prog-fill" style="width:${(done/25)*100}%"></div></div>
          <span class="advent-prog-label">${done} / 25 posted</span>
        </div>
        <div class="advent-sync-row">
          <span class="advent-sync-status" id="advent-sync-status"></span>
          <button class="advent-sync-btn" id="advent-sync-btn" onclick="adventForcePush()">↑ Sync</button>
        </div>
      </div>
    </div>
    ${introBox}
    <div class="advent-grid">${boxes}</div>
  </div>`;
  _initAdventSortable();
}
