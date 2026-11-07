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

// Auto-save as user types (debounced per field)
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

// Backup fields: stored under data[day].backup.{creator,book,oneliner}
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

function toggleAdventReady(day) {
  const data  = getAdvent();
  if (!data[day]) data[day] = {};
  data[day].ready = !data[day].ready;
  saveAndSyncAdvent(data);
  const box = document.getElementById(`advent-box-${day}`);
  if (!box) return;
  const ready = data[day].ready;
  box.classList.toggle('advent-box--ready', ready);
  box.querySelectorAll('.advent-input, .advent-textarea')
     .forEach(el => el.disabled = ready);
  const lbl = box.querySelector('.advent-check-label');
  if (lbl) lbl.textContent = ready ? '✓ Ready' : 'Mark ready';
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

function _adventUpdateProgress() {
  const data  = getAdvent();
  const done  = Object.values(data).filter(v => v.ready).length;
  const bar   = document.querySelector('.advent-prog-fill');
  const label = document.querySelector('.advent-prog-label');
  if (bar)   bar.style.width = `${(done / 24) * 100}%`;
  if (label) label.textContent = `${done} / 24 ready`;
}

function renderAdventView() {
  const container = document.getElementById('main-content');
  if (!container) return;
  syncAdventFromCloud();
  const data = getAdvent();
  const done = Object.values(data).filter(v => v.ready).length;

  let boxes = '';
  for (let d = 1; d <= 24; d++) {
    const entry   = data[d] || {};
    const ready   = !!entry.ready;
    const msg     = !!entry.messaged;
    const bk      = entry.backup || {};
    const hasBk   = !!(bk.creator || bk.book || bk.oneliner);
    const dayName = _adventDayName(d);

    boxes += `
    <div class="advent-box${ready ? ' advent-box--ready' : ''}${msg ? ' advent-box--messaged' : ''}" id="advent-box-${d}">
      <div class="advent-box-hd">
        <div class="advent-date-block">
          <span class="advent-num">${d}</span>
          <span class="advent-dname">${dayName} · Dec ${d}</span>
        </div>
        <div class="advent-checks">
          <label class="advent-ready-wrap">
            <input type="checkbox" class="advent-chk" ${ready ? 'checked' : ''}
              onchange="toggleAdventReady(${d})">
            <span class="advent-check-label">${ready ? '✓ Ready' : 'Mark ready'}</span>
          </label>
          <label class="advent-ready-wrap advent-msg-wrap">
            <input type="checkbox" class="advent-chk advent-chk--msg" ${msg ? 'checked' : ''}
              onchange="toggleAdventMessaged(${d})">
            <span class="advent-msg-label">${msg ? '✓ Messaged' : 'Messaged?'}</span>
          </label>
        </div>
      </div>

      <div class="advent-fields">
        <div class="advent-field">
          <span class="advent-field-lbl">Creator</span>
          <input class="advent-input" type="text" placeholder="@handle or name"
            value="${esc(entry.creator || '')}"
            ${ready ? 'disabled' : ''}
            oninput="adventInput(${d},'creator',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Book</span>
          <input class="advent-input" type="text" placeholder="Title — Author"
            value="${esc(entry.book || '')}"
            ${ready ? 'disabled' : ''}
            oninput="adventInput(${d},'book',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Why this book?</span>
          <textarea class="advent-textarea" placeholder="One sentence…"
            ${ready ? 'disabled' : ''}
            oninput="adventInput(${d},'oneliner',this.value)">${esc(entry.oneliner || '')}</textarea>
        </div>
      </div>

      <button class="advent-backup-btn${hasBk ? ' advent-backup-btn--open' : ''}" id="advent-backup-btn-${d}"
        onclick="toggleAdventBackup(${d})">
        ${hasBk ? '— Hide backup' : '＋ Add backup'}
      </button>

      <div class="advent-backup-section" id="advent-backup-${d}"
        style="display:${hasBk ? 'flex' : 'none'}">
        <div class="advent-backup-label">Backup option</div>
        <div class="advent-field">
          <span class="advent-field-lbl">Creator</span>
          <input class="advent-input" type="text" placeholder="@handle or name"
            value="${esc(bk.creator || '')}"
            oninput="adventBackupInput(${d},'creator',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Book</span>
          <input class="advent-input" type="text" placeholder="Title — Author"
            value="${esc(bk.book || '')}"
            oninput="adventBackupInput(${d},'book',this.value)">
        </div>
        <div class="advent-field">
          <span class="advent-field-lbl">Why this book?</span>
          <textarea class="advent-textarea" placeholder="One sentence…"
            oninput="adventBackupInput(${d},'oneliner',this.value)">${esc(bk.oneliner || '')}</textarea>
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
      <div class="advent-progress">
        <div class="advent-prog-bar"><div class="advent-prog-fill" style="width:${(done/24)*100}%"></div></div>
        <span class="advent-prog-label">${done} / 24 ready</span>
      </div>
    </div>
    <div class="advent-grid">${boxes}</div>
  </div>`;
}
