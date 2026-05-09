// ─── Claude API Integration ───────────────────────────────────────
const CLAUDE_API_KEY_KEY = 'thc_claude_api_key';
const CLAUDE_PROJECT_URL = 'https://claude.ai/project/019e0cc6-4c63-770b-b8f1-21e4a6050985';
const CLAUDE_MODEL       = 'claude-sonnet-4-6';

let _cprompt   = '';
let _cresponse = '';

function getClaudeApiKey() {
  return localStorage.getItem(CLAUDE_API_KEY_KEY) || '';
}
function saveClaudeApiKey(k) {
  if (k) localStorage.setItem(CLAUDE_API_KEY_KEY, k);
  else   localStorage.removeItem(CLAUDE_API_KEY_KEY);
}

// ── API key settings modal ────────────────────────────────────────
function showClaudeSettings() {
  let ov = document.getElementById('claude-settings-ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'claude-settings-ov';
    ov.className = 'jnl-modal-overlay';
    ov.innerHTML = `
      <div class="jnl-modal" style="max-width:460px">
        <div class="jnl-modal-hd">⚙ Claude API Key</div>
        <div class="crp-settings-desc">
          Enter your Anthropic API key to get Claude's response directly on this page — no tab switching needed.
          The key is stored only in your browser's local storage and sent only to the Anthropic API.
          <br><br>
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" class="crp-link">Get a key at console.anthropic.com →</a>
        </div>
        <input id="claude-api-key-input" type="password" class="jnl-input"
          placeholder="sk-ant-api03-…" autocomplete="off"
          style="font-family:monospace;font-size:12px;letter-spacing:0.04em">
        <div class="jnl-modal-ft">
          <button class="jnl-modal-close" onclick="document.getElementById('claude-settings-ov').style.display='none'">Cancel</button>
          <button class="jnl-modal-save"  onclick="saveClaudeSettingsKey()">Save key</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) ov.style.display = 'none'; });
  }
  document.getElementById('claude-api-key-input').value = getClaudeApiKey();
  ov.style.display = 'flex';
}

function saveClaudeSettingsKey() {
  const k = document.getElementById('claude-api-key-input')?.value.trim() || '';
  saveClaudeApiKey(k);
  document.getElementById('claude-settings-ov').style.display = 'none';
  showJnlToast(k ? '✓ API key saved — Claude will now respond inline' : 'API key cleared');
}

// ── Copy helpers ──────────────────────────────────────────────────
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

function copyCrpPrompt()   { _crpCopy(_cprompt,   'Prompt copied!'); }
function copyCrpResponse() { if (_cresponse) _crpCopy(_cresponse, 'Response copied!'); }

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
  _cprompt   = prompt;
  _cresponse = '';
  const hasKey = !!getClaudeApiKey();
  const { bookTitle = '', bookAuthor = '', skipLog = false } = opts;
  const showLog = !skipLog && !!bookTitle;

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

  ov.innerHTML = `
    <div class="jnl-modal crp-modal">
      <div class="crp-panel-hd">
        <div class="jnl-modal-hd"><span class="claude-icon">✦</span> ${esc(title)}</div>
        <button class="crp-settings-btn" onclick="showClaudeSettings()"
          title="${hasKey ? 'API key configured — click to change' : 'Set your Anthropic API key for inline responses'}">
          ⚙${hasKey ? '' : '&nbsp;Set API key'}
        </button>
      </div>
      ${logHtml}
      <details class="crp-prompt-details">
        <summary class="crp-prompt-summary">View prompt</summary>
        <pre class="crp-prompt-pre">${esc(prompt)}</pre>
      </details>
      <div class="crp-response-area" id="crp-response-area">
        ${hasKey
          ? `<div class="crp-loading" id="crp-loading"><span class="crp-dots">✦</span> Asking Claude…</div>`
          : `<div class="crp-no-key">
               <p>Set your Anthropic API key (⚙ above) to get Claude's response here.</p>
               <p style="margin-top:8px">Or open your Claude project and paste the prompt:</p>
               <a class="claude-btn crp-project-btn" href="${CLAUDE_PROJECT_URL}" target="_blank" rel="noopener">
                 <span class="claude-icon">✦</span> Open Claude project →
               </a>
             </div>`
        }
      </div>
      <div class="jnl-modal-ft crp-footer">
        <button class="jnl-modal-close" onclick="document.getElementById('claude-panel-ov').remove()">Close</button>
        <button class="jnl-modal-close" onclick="copyCrpPrompt()">Copy prompt</button>
        <button class="jnl-modal-save crp-copy-resp-btn" id="crp-copy-resp-btn"
          onclick="copyCrpResponse()" style="display:none">Copy response</button>
      </div>
    </div>`;

  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });

  if (hasKey) streamClaudeResponse(prompt);
}

// ── Streaming API call ────────────────────────────────────────────
async function streamClaudeResponse(prompt) {
  const area = document.getElementById('crp-response-area');
  if (!area) return;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getClaudeApiKey(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1500,
        stream: true,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!resp.ok) {
      let msg = `HTTP ${resp.status}`;
      try { const e = await resp.json(); msg = e.error?.message || msg; } catch {}
      area.innerHTML = `<div class="crp-error">⚠ ${esc(msg)}<br><small>Check your API key in ⚙ settings.</small></div>`;
      return;
    }

    area.innerHTML = '<div class="crp-stream" id="crp-stream"></div>';
    const streamEl = document.getElementById('crp-stream');

    const reader  = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer   = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const p = JSON.parse(data);
          if (p.type === 'content_block_delta' && p.delta?.type === 'text_delta') {
            fullText += p.delta.text;
            if (streamEl) streamEl.innerHTML = crpMdToHtml(fullText);
          }
        } catch {}
      }
    }

    _cresponse = fullText;
    const btn = document.getElementById('crp-copy-resp-btn');
    if (btn) btn.style.display = '';

  } catch (e) {
    const a = document.getElementById('crp-response-area');
    if (a) a.innerHTML = `<div class="crp-error">⚠ ${esc(e.message || 'Connection error')}</div>`;
  }
}

// ── Minimal markdown → HTML ───────────────────────────────────────
function crpMdToHtml(raw) {
  const s = raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g,     '<em>$1</em>')
    .replace(/^#### ([^\n]+)/gm,   '<h5 class="crp-h4">$1</h5>')
    .replace(/^### ([^\n]+)/gm,    '<h4 class="crp-h4">$1</h4>')
    .replace(/^## ([^\n]+)/gm,     '<h3 class="crp-h3">$1</h3>')
    .replace(/^# ([^\n]+)/gm,      '<h2 class="crp-h2">$1</h2>')
    .replace(/^\d+\. ([^\n]+)/gm,  '<li class="crp-li">$1</li>')
    .replace(/^[-•] ([^\n]+)/gm,   '<li class="crp-li">$1</li>')
    .replace(/\n\n/g,              '</p><p class="crp-p">')
    .replace(/\n/g,                '<br>');
  return `<p class="crp-p">${s}</p>`;
}
