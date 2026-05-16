// ─── Reading Journal ──────────────────────────────────────────────
const JOURNAL_KEY        = 'thc_journal';
const JNL_SAGA_BOOKS_KEY = 'thc_jnl_saga_books';
let jnlState = { sort: 'date', author: 'all', tag: 'all', page: 1, search: '' };
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
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label jnl-sfl-songs">Songs</label>
        <textarea id="edit-songs" class="jnl-input jnl-ta" rows="3" placeholder="Song / audio suggestions…"></textarea>
      </div>
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label jnl-sfl-goodreads">Goodreads Review</label>
        <textarea id="edit-goodreads" class="jnl-input jnl-ta" rows="4" placeholder="Your Goodreads review…"></textarea>
      </div>
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label">Raw Thoughts</label>
        <textarea id="edit-thoughts" class="jnl-input jnl-ta" rows="4" placeholder="Your raw thoughts…"></textarea>
      </div>
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label jnl-sfl-script">Script</label>
        <textarea id="edit-script" class="jnl-input jnl-ta" rows="4" placeholder="TikTok / Reel voiceover script…"></textarea>
      </div>
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label jnl-sfl-ig">Instagram Caption</label>
        <textarea id="edit-caption-ig" class="jnl-input jnl-ta" rows="3" placeholder="Instagram carousel caption…"></textarea>
      </div>
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label jnl-sfl-tt">TikTok Caption</label>
        <textarea id="edit-caption-tt" class="jnl-input jnl-ta" rows="2" placeholder="TikTok caption (2 lines max)…"></textarea>
      </div>
      <div class="jnl-section-field">
        <label class="jnl-section-ta-label jnl-sfl-hashtags">Hashtags</label>
        <textarea id="edit-hashtags" class="jnl-input jnl-ta" rows="2" placeholder="#booktok #bookstagram…"></textarea>
      </div>
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
  document.getElementById('edit-thoughts').value  = entry.thoughts  || '';
  document.getElementById('edit-script').value      = entry.script    || '';
  document.getElementById('edit-caption-ig').value = entry.captionIG || '';
  document.getElementById('edit-caption-tt').value = entry.captionTT || '';
  document.getElementById('edit-hashtags').value   = entry.hashtags  || '';
  document.getElementById('edit-songs').value      = entry.songs     || '';
  document.getElementById('edit-goodreads').value = entry.goodreads || '';
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
  const script    = document.getElementById('edit-script')?.value.trim()     || '';
  const captionIG = document.getElementById('edit-caption-ig')?.value.trim() || '';
  const captionTT = document.getElementById('edit-caption-tt')?.value.trim() || '';
  const hashtags  = document.getElementById('edit-hashtags')?.value.trim()   || '';
  const songs      = document.getElementById('edit-songs')?.value.trim()      || '';
  const goodreads  = document.getElementById('edit-goodreads')?.value.trim()  || '';
  const isSaga   = document.getElementById('edit-is-saga').checked;
  const sagaName = isSaga ? (document.getElementById('edit-saga-name').value.trim() || null) : null;
  if (!title) { document.getElementById('edit-title').focus(); return; }
  const j = getJournal();
  if (!j[_jnlEditIdx]) return;
  Object.assign(j[_jnlEditIdx], { title, author, rating, dateRead, thoughts, script, captionIG, captionTT, hashtags, songs, goodreads, sagaName });
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
  const prompt = buildSagaClaudePrompt(sagaName, entries);
  showClaudePanel(`${sagaName} — Full Series`, prompt, { skipLog: true });
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

Please give me exactly five sections using these exact labels:

SCRIPT:
A TikTok / Reel voiceover. Break it into timed segments. Each segment MUST be on its own line in this exact format:
[mm:ss-mm:ss] SECTION NAME: the text for that segment
Use these sections in order: Hook (0:00-0:04), Setup (0:04-0:14), Opinion 1 with a descriptive label (0:14-0:30), Opinion 2 with a descriptive label (0:30-0:47), Rating (0:47-0:58), CTA (0:58-1:15).
No intro, no markdown, just the lines. Conversational and gripping.

CAPTIONS_IG:
Instagram carousel caption: strong hook line, 3–4 body sentences, CTA. No hashtags here.

CAPTIONS_TT:
TikTok caption only: 2 punchy lines, under 150 characters total. No hashtags here.

HASHTAGS:
10–12 hashtags for both platforms. Include #booktok #bookstagram and thriller-specific tags. Format: each hashtag on its own line.

SONGS:
Three song / audio suggestions. For each: song name, artist, and one sentence on why the vibe fits this book.

GOODREADS:
A Goodreads-style review: 2–3 short paragraphs. First: what the book is (no spoilers). Second: your honest reaction with one or two specific moments that stood out. Third: who you'd recommend it to and why. Close with the star rating. Around 150–200 words, personal and direct.

Voice: passionate, slightly obsessed — a husband who reads every thriller his wife is too scared to pick up alone.`;
}

function openWithClaude(idx) {
  const entry = getJournal()[idx];
  if (!entry) return;
  const prompt = buildClaudePrompt(entry);
  showClaudePanel(entry.title, prompt, { skipLog: true, entryIdx: idx });
}

// ── Content Hub modal ─────────────────────────────────────────────
let _jemEntry = null;
let _jemIdx   = -1;

function _jemTimeToSecs(t) {
  const p = t.split(':').map(Number);
  return p.length === 2 ? p[0] * 60 + p[1] : p[0];
}

function _jemSectionColor(section) {
  const s = section.toLowerCase();
  if (s.includes('hook'))   return { bg: '#fde8e8', color: '#8b1a1a' };
  if (s.includes('setup'))  return { bg: '#ede8fa', color: '#4a2a8a' };
  if (s.includes('cta'))    return { bg: '#d8f2f8', color: '#0a6080' };
  if (s.includes('rating')) return { bg: '#fdf3dc', color: '#7a5500' };
  return { bg: '#e8f5ec', color: '#1a5c30' };
}

function _jemParseScript(text) {
  if (!text || !text.trim()) return [];
  const segments = [];
  let current = null;
  for (const line of text.split('\n')) {
    // Handles: [0:00-0:04] HOOK: text  OR  0:00 – 0:04 – Hook: text  OR  0:00 – 0:04 – Hook (text on next line)
    const m = line.match(/^\[?(\d+:\d+)\s*[-–]\s*(\d+:\d+)\]?\s*(?:[-–:]\s*)?([^:\n]+?)(?::\s*(.*)|$)/);
    if (m && m[1] && m[2] && m[3] && m[3].trim().length > 0) {
      if (current) segments.push(current);
      current = { start: m[1].trim(), end: m[2].trim(), section: m[3].trim(), text: (m[4] || '').trim() };
    } else if (current) {
      current.text += (current.text ? '\n' : '') + line;
    }
  }
  if (current) segments.push(current);
  // Trim trailing empty lines from each segment text
  segments.forEach(s => { s.text = s.text.trim(); });
  return segments;
}

function _jemRenderScript(scriptText) {
  const segs = _jemParseScript(scriptText);
  if (!segs.length) {
    return `<div class="jem-field-text">${esc(scriptText).replace(/\n/g, '<br>')}</div>`;
  }
  const totalSecs = _jemTimeToSecs(segs[segs.length - 1].end);
  const cards = segs.map((seg, i) => {
    const c = _jemSectionColor(seg.section);
    return `<div class="jem-tl-card">
      <div class="jem-tl-top">
        <div class="jem-tl-left">
          <span class="jem-tl-time">${esc(seg.start)} – ${esc(seg.end)}</span>
          <span class="jem-tl-badge" style="background:${c.bg};color:${c.color}">${esc(seg.section)}</span>
        </div>
        <button class="jem-copy-btn" onclick="jemCopyScript(${i})">Copy</button>
      </div>
      <div class="jem-tl-text">${esc(seg.text).replace(/\n/g, '<br>')}</div>
    </div>`;
  }).join('');
  const barSegs = totalSecs > 0 ? segs.map(seg => {
    const dur = _jemTimeToSecs(seg.end) - _jemTimeToSecs(seg.start);
    const pct = (dur / totalSecs * 100).toFixed(1);
    const c = _jemSectionColor(seg.section);
    return `<div class="jem-tl-bar-seg" style="width:${pct}%;background:${c.color};opacity:0.55"></div>`;
  }).join('') : '';
  const barLabels = totalSecs > 0 ? segs.map(seg => {
    const dur = _jemTimeToSecs(seg.end) - _jemTimeToSecs(seg.start);
    const pct = (dur / totalSecs * 100).toFixed(1);
    return `<div class="jem-tl-bar-lbl" style="width:${pct}%">${esc(seg.section.split(' ')[0])}</div>`;
  }).join('') : '';
  return `<div class="jem-timeline">${cards}</div>
    ${totalSecs > 0 ? `<div class="jem-tl-bar-wrap">
      <div class="jem-tl-bar">${barSegs}</div>
      <div class="jem-tl-bar-labels">${barLabels}</div>
      <div style="font-size:11px;color:var(--ash);text-align:right;margin-top:2px">0:00 — ${esc(segs[segs.length-1].end)} total</div>
    </div>` : ''}`;
}

function jemCopyScript(segIdx) {
  const segs = _jemParseScript(_jemEntry?.script || '');
  if (segs[segIdx]) _crpCopy(segs[segIdx].text, 'Copied!');
}

function jemCopy(field) {
  const texts = {
    ig:        [_jemEntry?.captionIG  || '', 'Instagram caption copied!'],
    tt:        [_jemEntry?.captionTT  || '', 'TikTok caption copied!'],
    hashtags:  [_jemEntry?.hashtags   || '', 'Hashtags copied!'],
    songs:     [_jemEntry?.songs      || '', 'Songs copied!'],
    goodreads: [_jemEntry?.goodreads  || '', 'Goodreads review copied!'],
    captions:  [_jemEntry?.captions   || '', 'Captions copied!'],
    thoughts:  [_jemEntry?.thoughts   || '', 'Copied!'],
  };
  const [text, msg] = texts[field] || ['', 'Copied!'];
  _crpCopy(text, msg);
}

function switchJemTab(tab) {
  document.querySelectorAll('.jem-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.jem-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
}

function openEntryModal(idx) {
  const j = getJournal();
  const entry = j[idx];
  if (!entry) return;
  _jemEntry = entry;
  _jemIdx   = idx;

  document.getElementById('jem-ov')?.remove();

  const stars = renderJnlStars(entry.rating);
  const dt    = entry.dateRead ? jnlFormatDate(entry.dateRead) : '';
  const dot   = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:currentColor;margin-left:5px;vertical-align:middle;opacity:0.65"></span>`;

  const hasScript   = !!(entry.script);
  const hasCaptions = !!(entry.captionIG || entry.captionTT || entry.hashtags || entry.captions);
  const hasSongs     = !!(entry.songs);
  const hasGoodreads = !!(entry.goodreads);

  // Script panel
  const scriptPanel = hasScript
    ? _jemRenderScript(entry.script)
    : `<p class="jem-empty-note">No script yet — hit Ask Claude to generate one.</p>`;

  // Captions panel (new fields + legacy fallback)
  const igText      = entry.captionIG || '';
  const ttText      = entry.captionTT || '';
  const hashText    = entry.hashtags  || '';
  const legacyText  = (!igText && !ttText && entry.captions) ? entry.captions : '';
  const captionsPanel = (igText || ttText || hashText || legacyText) ? `
    ${igText ? `<div class="jem-field">
      <div class="jem-field-header">
        <span class="jem-field-label jem-fl-ig">Instagram</span>
        <button class="jem-copy-btn" onclick="jemCopy('ig')">Copy</button>
      </div>
      <div class="jem-field-text">${esc(igText).replace(/\n/g,'<br>')}</div>
    </div>` : ''}
    ${ttText ? `<div class="jem-field">
      <div class="jem-field-header">
        <span class="jem-field-label jem-fl-tt">TikTok</span>
        <button class="jem-copy-btn" onclick="jemCopy('tt')">Copy</button>
      </div>
      <div class="jem-field-text">${esc(ttText).replace(/\n/g,'<br>')}</div>
    </div>` : ''}
    ${hashText ? `<div class="jem-field">
      <div class="jem-field-header">
        <span class="jem-field-label jem-fl-hashtags">Hashtags</span>
        <button class="jem-copy-btn" onclick="jemCopy('hashtags')">Copy</button>
      </div>
      <div class="jem-field-text">${esc(hashText).replace(/\n/g,'<br>')}</div>
    </div>` : ''}
    ${legacyText ? `<div class="jem-field">
      <div class="jem-field-header">
        <span class="jem-field-label">Captions</span>
        <button class="jem-copy-btn" onclick="jemCopy('captions')">Copy</button>
      </div>
      <div class="jem-field-text">${esc(legacyText).replace(/\n/g,'<br>')}</div>
    </div>` : ''}
  ` : `<p class="jem-empty-note">No captions yet — hit Ask Claude to generate them.</p>`;

  // Songs panel
  const songsPanel = hasSongs
    ? `<div class="jem-field">
        <div class="jem-field-header">
          <span class="jem-field-label jem-fl-songs">Songs</span>
          <button class="jem-copy-btn" onclick="jemCopy('songs')">Copy</button>
        </div>
        <div class="jem-field-text">${esc(entry.songs).replace(/\n/g,'<br>')}</div>
      </div>`
    : `<p class="jem-empty-note">No song suggestions yet — hit Ask Claude to generate them.</p>`;

  // Goodreads panel
  const goodreadsPanel = hasGoodreads
    ? `<div class="jem-field">
        <div class="jem-field-header">
          <span class="jem-field-label jem-fl-goodreads">Goodreads Review</span>
          <button class="jem-copy-btn" onclick="jemCopy('goodreads')">Copy</button>
        </div>
        <div class="jem-field-text">${esc(entry.goodreads).replace(/\n/g,'<br>')}</div>
      </div>`
    : `<p class="jem-empty-note">No Goodreads review yet — hit Ask Claude to generate one.</p>`;

  const ov = document.createElement('div');
  ov.id = 'jem-ov';
  ov.className = 'jem-overlay';
  ov.innerHTML = `<div class="jem-modal">
    <div class="jem-header">
      <div>
        <div class="jem-book-title">${esc(entry.title)}</div>
        <div class="jem-book-meta">${entry.author ? esc(entry.author) + ' · ' : ''}${stars}${dt ? ' · ' + dt : ''}</div>
      </div>
      <button class="jem-close" onclick="document.getElementById('jem-ov').remove()">×</button>
    </div>
    <div class="jem-tabs">
      <button class="jem-tab active" data-tab="overview"   onclick="switchJemTab('overview')">Overview</button>
      <button class="jem-tab"        data-tab="script"     onclick="switchJemTab('script')">Script${hasScript ? dot : ''}</button>
      <button class="jem-tab"        data-tab="captions"   onclick="switchJemTab('captions')">Captions${hasCaptions ? dot : ''}</button>
      <button class="jem-tab"        data-tab="songs"      onclick="switchJemTab('songs')">Songs${hasSongs ? dot : ''}</button>
      <button class="jem-tab"        data-tab="goodreads"  onclick="switchJemTab('goodreads')">Goodreads${hasGoodreads ? dot : ''}</button>
    </div>
    <div class="jem-content">
      <div class="jem-panel active" data-panel="overview">
        ${entry.thoughts
          ? `<div class="jem-field">
              <div class="jem-field-header">
                <span class="jem-field-label">Raw Thoughts</span>
                <button class="jem-copy-btn" onclick="jemCopy('thoughts')">Copy</button>
              </div>
              <div class="jem-thoughts-text">${esc(entry.thoughts).replace(/\n/g,'<br>')}</div>
            </div>`
          : '<p class="jem-empty-note">No raw thoughts logged.</p>'}
      </div>
      <div class="jem-panel" data-panel="script">${scriptPanel}</div>
      <div class="jem-panel" data-panel="captions">${captionsPanel}</div>
      <div class="jem-panel" data-panel="songs">${songsPanel}</div>
      <div class="jem-panel" data-panel="goodreads">${goodreadsPanel}</div>
    </div>
    <div class="jem-footer">
      <button class="jem-edit-btn" onclick="document.getElementById('jem-ov').remove();openEditModal(${idx})">✎ Edit</button>
      <button class="claude-btn" onclick="document.getElementById('jem-ov').remove();openWithClaude(${idx})">
        <span class="claude-icon">✦</span> Ask Claude
      </button>
    </div>
  </div>`;

  document.body.appendChild(ov);
  ov.addEventListener('click', ev => { if (ev.target === ov) ov.remove(); });
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
function searchJournal(q) {
  jnlState.search = q.trim().toLowerCase();
  jnlState.page   = 1;
  applyJournalFilters();
}

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

  if (jnlState.search) {
    const q = jnlState.search;
    filtered = filtered.filter(e =>
      (e.title  || '').toLowerCase().includes(q) ||
      (e.author || '').toLowerCase().includes(q)
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
      <p class="jnl-section-body" style="padding:4px 0 12px">${esc(e.thoughts).replace(/\n/g, '<br>')}</p>
      <div class="jnl-entry-footer">
        <button class="jnl-content-btn" onclick="openEntryModal(${idx});event.stopPropagation()">Content ▶</button>
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
  jnlState.search = '';
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
    html += `<div class="jnl-search-bar">
      <input type="search" id="jnl-search" class="jnl-search-input"
        placeholder="Search by title or author…"
        value="${esc(jnlState.search)}"
        oninput="searchJournal(this.value)">
    </div>`;

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
