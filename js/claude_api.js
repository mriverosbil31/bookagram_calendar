// ─── Claude Panel ─────────────────────────────────────────────────
const CLAUDE_PROJECT_URL = 'https://claude.ai/project/019e0cc6-4c63-770b-b8f1-21e4a6050985';

let _cprompt = '';

// ── Copy helper ───────────────────────────────────────────────────
function _crpCopy(text, msg) {
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
    showJnlToast(msg);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showJnlToast(msg)).catch(fallback);
  } else { fallback(); }
}

function copyCrpPrompt() { _crpCopy(_cprompt, 'Prompt copied!'); }

// ── Quick-log book to journal from panel ──────────────────────────
function crpLogToJournal() {
  const title    = document.getElementById('crp-log-title')?.value.trim();
  const author   = document.getElementById('crp-log-author')?.value.trim() || '';
  const rating   = parseFloat(document.getElementById('crp-log-rating-val')?.value) || 0;
  const thoughts = document.getElementById('crp-log-thoughts')?.value.trim() || '';
  if (!title) { document.getElementById('crp-log-title')?.focus(); showJnlToast('Book title is required'); return; }
  const j = getJournal();
  if (j.some(e => e.title.toLowerCase() === title.toLowerCase())) {
    showJnlToast(`"${title}" is already in your journal`);
    return;
  }
  j.unshift({ title, author, rating, dateRead: new Date().toISOString().split('T')[0], thoughts, addedAt: Date.now() });
  saveAndSync(j);
  const sec = document.getElementById('crp-log-section');
  if (sec) sec.innerHTML = `<div class="crp-logged">✓ Logged to Journal &mdash; <button class="crp-link-btn" onclick="document.getElementById('claude-panel-ov')?.remove();setView('journal')">View Journal →</button></div>`;
  showJnlToast(`"${title}" logged to journal!`);
}

// ── Main Claude panel ─────────────────────────────────────────────
function showClaudePanel(title, prompt, opts = {}) {
  _cprompt = prompt;
  const { bookTitle = '', bookAuthor = '', skipLog = false, entryIdx } = opts;
  const showLog      = !skipLog && !!bookTitle;
  const showAutoFill = entryIdx !== undefined;

  document.getElementById('claude-panel-ov')?.remove();
  const ov = document.createElement('div');
  ov.id = 'claude-panel-ov';
  ov.className = 'jnl-modal-overlay';

  const logHtml = showLog ? `
    <div class="crp-log-section" id="crp-log-section">
      <div class="crp-log-hd">+ Log to Reading Journal</div>
      <div class="crp-log-fields">
        <input id="crp-log-title"  type="text" class="jnl-input crp-log-input" placeholder="Book title *" value="${esc(bookTitle)}">
        <input id="crp-log-author" type="text" class="jnl-input crp-log-input" placeholder="Author" value="${esc(bookAuthor)}" list="global-authors-list">
      </div>
      <div class="jnl-rating-row" style="margin:8px 0 4px">
        <span class="jnl-label">Rating:</span>
        ${starPickerHtml('crp-log-picker', 'crp-log-rating-val')}
        <span class="jnl-rating-hint" id="crp-log-picker-hint"></span>
      </div>
      <textarea id="crp-log-thoughts" class="jnl-input jnl-ta" rows="2"
        placeholder="Quick thoughts (optional)…" style="margin-top:4px"></textarea>
      <button class="crp-log-btn" onclick="crpLogToJournal()">Log to Journal</button>
    </div>` : '';

  const autoFillHtml = showAutoFill ? `
    <div class="crp-autofill-section" id="crp-autofill-section">
      <div class="crp-log-hd crp-af-hd">↓ Paste Claude's response to auto-fill Script, Captions &amp; Songs</div>
      <textarea id="crp-paste-area" class="jnl-input jnl-ta crp-paste-ta" rows="7"
        placeholder="Paste Claude's full response here — it detects SCRIPT: / CAPTIONS: / SONGS: sections and fills them in automatically."></textarea>
      <button class="crp-log-btn crp-af-btn" onclick="crpAutoFill(${entryIdx})">Auto-fill entry fields</button>
    </div>` : '';

  ov.innerHTML = `
    <div class="jnl-modal crp-modal">
      <div class="jnl-modal-hd"><span class="claude-icon">✦</span> ${esc(title)}</div>
      ${logHtml}
      <details class="crp-prompt-details" open>
        <summary class="crp-prompt-summary">Prompt</summary>
        <pre class="crp-prompt-pre">${esc(prompt)}</pre>
      </details>
      <div class="crp-response-area">
        <p style="margin:0 0 12px;color:var(--muted,#999)">Copy the prompt and paste it into your Claude project:</p>
        <a class="claude-btn crp-project-btn" href="${CLAUDE_PROJECT_URL}" target="_blank" rel="noopener">
          <span class="claude-icon">✦</span> Open Claude project →
        </a>
      </div>
      ${autoFillHtml}
      <div class="jnl-modal-ft crp-footer">
        <button class="jnl-modal-close" onclick="document.getElementById('claude-panel-ov').remove()">Close</button>
        <button class="jnl-modal-save"  onclick="copyCrpPrompt()">Copy prompt</button>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

// ── Auto-fill journal entry from pasted Claude response ───────────
function crpAutoFill(entryIdx) {
  const raw = document.getElementById('crp-paste-area')?.value.trim();
  if (!raw) { showJnlToast('Paste Claude\'s response first'); return; }
  const sections = parseSections(raw);
  if (!sections.script && !sections.captions && !sections.songs) {
    showJnlToast('Could not find SCRIPT / CAPTIONS / SONGS — check the format');
    return;
  }
  const j = getJournal();
  if (!j[entryIdx]) { showJnlToast('Entry not found'); return; }
  if (sections.script)   j[entryIdx].script   = sections.script;
  if (sections.captions) j[entryIdx].captions = sections.captions;
  if (sections.songs)    j[entryIdx].songs    = sections.songs;
  saveAndSync(j);
  const sec = document.getElementById('crp-autofill-section');
  if (sec) sec.innerHTML = `<div class="crp-logged">✓ Script, Captions &amp; Songs saved — <button class="crp-link-btn" onclick="document.getElementById('claude-panel-ov')?.remove();setView('journal')">View entry →</button></div>`;
  showJnlToast('Entry fields updated!');
}

function parseSections(raw) {
  const clean = raw.replace(/\*\*/g, '').replace(/^#{1,4}\s*/gm, '');
  const labels = ['SCRIPT', 'CAPTIONS', 'SONGS'];
  const result = {};
  labels.forEach((label, i) => {
    const re    = new RegExp(`(?:^|\\n)${label}:\\s*`, 'i');
    const match = clean.match(re);
    if (!match) return;
    const start = match.index + match[0].length;
    let end = clean.length;
    for (let j = i + 1; j < labels.length; j++) {
      const nm = clean.match(new RegExp(`(?:^|\\n)${labels[j]}:\\s*`, 'i'));
      if (nm && nm.index > start) { end = nm.index; break; }
    }
    result[label.toLowerCase()] = clean.slice(start, end).trim();
  });
  return result;
}
