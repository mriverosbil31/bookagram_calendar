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
    saveAdvent(data);
  }, 350);
}

function toggleAdventReady(day) {
  const data  = getAdvent();
  if (!data[day]) data[day] = {};
  data[day].ready = !data[day].ready;
  saveAdvent(data);
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
  saveAdvent(data);
  const box = document.getElementById(`advent-box-${day}`);
  if (!box) return;
  const messaged = data[day].messaged;
  box.classList.toggle('advent-box--messaged', messaged);
  const lbl = box.querySelector('.advent-msg-label');
  if (lbl) lbl.textContent = messaged ? '✓ Messaged' : 'Messaged?';
}

function _adventUpdateProgress() {
  const data  = getAdvent();
  const done  = Object.values(data).filter(v => v.ready).length;
  const bar   = document.querySelector('.advent-prog-fill');
  const label = document.querySelector('.advent-prog-label');
  if (bar)   bar.style.width = `${(done / 25) * 100}%`;
  if (label) label.textContent = `${done} / 25 ready`;
}

function renderAdventView() {
  const container = document.getElementById('main-content');
  if (!container) return;
  const data     = getAdvent();
  const done     = Object.values(data).filter(v => v.ready).length;
  const messaged = Object.values(data).filter(v => v.messaged).length;

  let boxes = '';
  for (let d = 1; d <= 25; d++) {
    const entry    = data[d] || {};
    const ready    = !!entry.ready;
    const msg      = !!entry.messaged;
    const dayName  = _adventDayName(d);

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
    </div>`;
  }

  container.innerHTML = `
  <div class="advent-view">
    <div class="advent-hd">
      <div class="advent-hd-left">
        <h2 class="advent-title">🎄 Christmas Book Countdown</h2>
        <p class="advent-sub">25 days · 25 books · 25 creators</p>
      </div>
      <div class="advent-progress">
        <div class="advent-prog-bar"><div class="advent-prog-fill" style="width:${(done/25)*100}%"></div></div>
        <span class="advent-prog-label">${done} / 25 ready</span>
      </div>
    </div>
    <div class="advent-grid">${boxes}</div>
  </div>`;
}
