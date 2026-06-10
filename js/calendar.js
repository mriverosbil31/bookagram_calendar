// ─── Custom (spontaneous) posts ───────────────────────────────────
const CUSTOM_POSTS_KEY = 'thc_custom_posts';

function getCustomPosts() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_POSTS_KEY)) || []; }
  catch { return []; }
}
function saveCustomPosts(arr) { localStorage.setItem(CUSTOM_POSTS_KEY, JSON.stringify(arr)); }

function showAddPostModal() {
  const monthIdx = currentMonth;
  const m = months[monthIdx];
  const weekOptions = m.weeks.map((w, i) =>
    `<option value="${i}">${esc(w.label)}</option>`
  ).join('');
  const dayOptions = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    .map(d => `<option value="${d}">${d}</option>`).join('');

  document.getElementById('cal-add-post-ov')?.remove();
  const ov = document.createElement('div');
  ov.id = 'cal-add-post-ov';
  ov.className = 'jnl-modal-overlay';
  ov.innerHTML = `
    <div class="jnl-modal jnl-edit-modal">
      <div class="jnl-modal-hd">+ Add Spontaneous Post</div>
      <div class="jnl-form" style="gap:10px">
        <div>
          <div class="jnl-label" style="margin-bottom:6px">Platform</div>
          <div class="cal-platform-picker" id="cal-pl-picker">
            <button type="button" class="cal-pl-btn active" data-pl="ig"    onclick="calPickPl('ig')">Instagram</button>
            <button type="button" class="cal-pl-btn"        data-pl="tt"    onclick="calPickPl('tt')">TikTok</button>
            <button type="button" class="cal-pl-btn"        data-pl="both"  onclick="calPickPl('both')">Both</button>
            <button type="button" class="cal-pl-btn"        data-pl="story" onclick="calPickPl('story')">Story</button>
          </div>
          <input type="hidden" id="cal-pl-val" value="ig">
        </div>
        <div id="cal-type-wrap">
          <div class="jnl-label" style="margin-bottom:6px">Content type</div>
          <div class="cal-platform-picker" id="cal-type-picker">
            <button type="button" class="cal-pl-btn active" data-type="post" onclick="calPickType('post')">Post</button>
            <button type="button" class="cal-pl-btn"        data-type="reel" onclick="calPickType('reel')">Reel</button>
          </div>
          <input type="hidden" id="cal-type-val" value="post">
        </div>
        <div class="jnl-row">
          <input id="cal-book-title"  type="text" class="jnl-input" placeholder="Book title (optional)" list="library-titles-list">
          <input id="cal-book-author" type="text" class="jnl-input" placeholder="Author" list="global-authors-list">
          <select id="cal-post-day" class="jnl-input" style="color-scheme:dark">${dayOptions}</select>
        </div>
        <select id="cal-post-week" class="jnl-input" style="color-scheme:dark">${weekOptions}</select>
        <input id="cal-post-title" type="text" class="jnl-input" placeholder="Post title (e.g. Book of the week carousel) *">
        <textarea id="cal-post-desc" class="jnl-input jnl-ta" rows="3"
          placeholder="Caption idea or content description (optional)…"></textarea>
        <div class="cal-add-journal-section">
          <div class="cal-add-journal-hd">Also log to Reading Journal?</div>
          <div class="jnl-rating-row" style="margin:6px 0 4px">
            <span class="jnl-label">Rating:</span>
            ${starPickerHtml('cal-post-picker','cal-post-rating-val')}
            <span class="jnl-rating-hint" id="cal-post-picker-hint"></span>
          </div>
          <textarea id="cal-post-thoughts" class="jnl-input jnl-ta" rows="2"
            placeholder="Quick thoughts — fill this in to also log the book in your journal…"></textarea>
        </div>
      </div>
      <div class="jnl-modal-ft">
        <button class="jnl-modal-close" onclick="document.getElementById('cal-add-post-ov').remove()">Cancel</button>
        <button class="jnl-modal-save" onclick="saveCustomPost(${monthIdx})">Add post</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

function calPickPl(pl) {
  document.getElementById('cal-pl-val').value = pl;
  document.querySelectorAll('#cal-pl-picker .cal-pl-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.pl === pl)
  );
  const typeWrap = document.getElementById('cal-type-wrap');
  if (typeWrap) typeWrap.style.display = pl === 'story' ? 'none' : '';
}

function calPickType(type) {
  document.getElementById('cal-type-val').value = type;
  document.querySelectorAll('#cal-type-picker .cal-pl-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.type === type)
  );
}

function saveCustomPost(monthIdx) {
  const title   = document.getElementById('cal-post-title')?.value.trim();
  const desc    = document.getElementById('cal-post-desc')?.value.trim() || '';
  const pl      = document.getElementById('cal-pl-val')?.value || 'ig';
  const day     = document.getElementById('cal-post-day')?.value || 'Mon';
  const weekIdx = parseInt(document.getElementById('cal-post-week')?.value ?? 0);
  const bookTitle  = document.getElementById('cal-book-title')?.value.trim() || '';
  const bookAuthor = document.getElementById('cal-book-author')?.value.trim() || '';

  const finalTitle = title || (bookTitle
    ? `${bookTitle} — ${pl === 'ig' ? 'IG Carousel' : pl === 'tt' ? 'TikTok' : pl === 'story' ? 'Story' : 'Post'}`
    : null);
  if (!finalTitle) { document.getElementById('cal-post-title')?.focus(); showJnlToast('Post title is required'); return; }

  const type = document.getElementById('cal-type-val')?.value || 'post';
  const id = `custom-m${monthIdx}-${Date.now()}`;
  const post = { id, monthIdx, weekIdx, day, pl, type: pl === 'story' ? 'story' : type, title: finalTitle, desc, addedAt: Date.now() };
  const customs = getCustomPosts();
  customs.push(post);
  saveAndSyncCustomPosts(customs);

  if (bookTitle) {
    const all = getAllBooks();
    if (!all[id]) all[id] = [];
    all[id].push({ title: bookTitle, author: bookAuthor });
    saveAndSyncCalBooks(all);
  }

  const thoughts = document.getElementById('cal-post-thoughts')?.value.trim() || '';
  if (bookTitle && thoughts) {
    const rating = parseFloat(document.getElementById('cal-post-rating-val')?.value) || 0;
    const j = getJournal();
    if (!j.some(e => e.title.toLowerCase() === bookTitle.toLowerCase())) {
      j.unshift({ title: bookTitle, author: bookAuthor, rating,
        dateRead: new Date().toISOString().split('T')[0], thoughts, addedAt: Date.now() });
      saveAndSync(j);
      showJnlToast('Post added + book logged to journal!');
    } else {
      showJnlToast('Post added! (Book was already in journal)');
    }
  } else {
    showJnlToast('Post added to calendar!');
  }

  document.getElementById('cal-add-post-ov')?.remove();
  renderCalendar();
}

function deleteCustomPost(id) {
  saveAndSyncCustomPosts(getCustomPosts().filter(p => p.id !== id));
  const archived = getArchived();
  archived.delete(id);
  saveAndSyncArchived(archived);
  const all = getAllBooks();
  delete all[id];
  saveAndSyncCalBooks(all);
  renderCalendar();
}

function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  if (id.startsWith('custom-')) {
    deleteCustomPost(id);
  } else {
    const deleted = getDeletedPosts();
    deleted.add(id);
    saveAndSyncDeletedPosts(deleted);
    const overrides = getPostOverrides();
    delete overrides[id];
    saveAndSyncPostOverrides(overrides);
    renderCalendar();
  }
}

function showEditPost(id) {
  const isCustom = id.startsWith('custom-');
  const plLabels = { ig: 'Instagram', tt: 'TikTok', both: 'Both', story: 'Story' };
  let currentPl, currentType, currentTitle, currentDesc, weekDayHtml = '';
  let isStoryEdit = false;

  if (isCustom) {
    const post = getCustomPosts().find(p => p.id === id);
    if (!post) { showJnlToast('Post not found'); return; }
    currentPl    = post.pl;
    currentType  = post.type || 'post';
    currentTitle = post.title;
    currentDesc  = post.desc || '';
    isStoryEdit  = post.pl === 'story';
    const m = months[post.monthIdx] || months[currentMonth];
    const weekOptions = m.weeks.map((w, wi) =>
      `<option value="${wi}"${wi === post.weekIdx ? ' selected' : ''}>${esc(w.label)}</option>`
    ).join('');
    const dayOptions = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      .map(d => `<option value="${d}"${d === post.day ? ' selected' : ''}>${d}</option>`).join('');
    weekDayHtml = `<div class="jnl-row">
        <select id="cal-edit-day"  class="jnl-input" style="color-scheme:dark">${dayOptions}</select>
        <select id="cal-edit-week" class="jnl-input" style="color-scheme:dark">${weekOptions}</select>
      </div>`;
  } else {
    const pm = id.match(/^m(\d+)-w(\d+)-([ps])(\d+)$/);
    if (!pm) return;
    const w    = months[+pm[1]]?.weeks[+pm[2]];
    const item = pm[3] === 's' ? w?.stories?.[+pm[4]] : w?.posts?.[+pm[4]];
    if (!item) return;
    const ov     = getPostOverrides()[id] || {};
    currentPl    = ov.pl    || item.pl    || 'both';
    currentType  = ov.type  || item.type  || 'post';
    currentTitle = ov.title || item.title || '';
    currentDesc  = ov.desc  !== undefined ? ov.desc : (item.desc || '');
    isStoryEdit  = pm[3] === 's';
    if (pm[3] !== 's') {
      const currentDay     = ov.day || item.day || 'Mon';
      const currentWeekIdx = ov.weekIdx !== undefined ? ov.weekIdx : +pm[2];
      const mn = months[+pm[1]];
      const dayOptions  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        .map(d => `<option value="${d}"${d === currentDay ? ' selected' : ''}>${d}</option>`).join('');
      const weekOptions = mn.weeks.map((wk, wi) =>
        `<option value="${wi}"${wi === currentWeekIdx ? ' selected' : ''}>${esc(wk.label)}</option>`
      ).join('');
      weekDayHtml = `<div class="jnl-row">
          <select id="cal-edit-day"  class="jnl-input" style="color-scheme:dark">${dayOptions}</select>
          <select id="cal-edit-week" class="jnl-input" style="color-scheme:dark">${weekOptions}</select>
        </div>`;
    }
  }

  const typePickerHtml = isStoryEdit ? '' : `
    <div id="cal-edit-type-wrap"${currentPl === 'story' ? ' style="display:none"' : ''}>
      <div class="jnl-label" style="margin-bottom:6px">Content type</div>
      <div class="cal-platform-picker" id="cal-edit-type-picker">
        <button type="button" class="cal-pl-btn${currentType === 'post' ? ' active' : ''}" data-type="post" onclick="calEditPickType('post')">Post</button>
        <button type="button" class="cal-pl-btn${currentType === 'reel' ? ' active' : ''}" data-type="reel" onclick="calEditPickType('reel')">Reel</button>
      </div>
      <input type="hidden" id="cal-edit-type-val" value="${currentType}">
    </div>`;

  document.getElementById('cal-edit-post-ov')?.remove();
  const ov = document.createElement('div');
  ov.id = 'cal-edit-post-ov';
  ov.className = 'jnl-modal-overlay';
  ov.innerHTML = `
    <div class="jnl-modal jnl-edit-modal">
      <div class="jnl-modal-hd">Edit Post</div>
      <div class="jnl-form" style="gap:10px">
        <div>
          <div class="jnl-label" style="margin-bottom:6px">Platform</div>
          <div class="cal-platform-picker" id="cal-edit-pl-picker">
            ${['ig','tt','both','story'].map(pl => `
              <button type="button" class="cal-pl-btn${currentPl === pl ? ' active' : ''}"
                data-pl="${pl}" onclick="calEditPickPl('${pl}')">${plLabels[pl]}</button>`).join('')}
          </div>
          <input type="hidden" id="cal-edit-pl-val" value="${currentPl}">
        </div>
        ${typePickerHtml}
        ${weekDayHtml}
        <input id="cal-edit-title" type="text" class="jnl-input" placeholder="Post title *" value="${esc(currentTitle)}">
        <textarea id="cal-edit-desc" class="jnl-input jnl-ta" rows="3"
          placeholder="Caption idea or content description…">${esc(currentDesc)}</textarea>
      </div>
      <div class="jnl-modal-ft">
        <button class="jnl-modal-close" onclick="document.getElementById('cal-edit-post-ov').remove()">Cancel</button>
        <button class="jnl-modal-save" onclick="saveEditPost('${id}')">Save changes</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

function calEditPickPl(pl) {
  document.getElementById('cal-edit-pl-val').value = pl;
  document.querySelectorAll('#cal-edit-pl-picker .cal-pl-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.pl === pl)
  );
  const typeWrap = document.getElementById('cal-edit-type-wrap');
  if (typeWrap) typeWrap.style.display = pl === 'story' ? 'none' : '';
}

function calEditPickType(type) {
  document.getElementById('cal-edit-type-val').value = type;
  document.querySelectorAll('#cal-edit-type-picker .cal-pl-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.type === type)
  );
}

function saveEditPost(id) {
  const title = document.getElementById('cal-edit-title')?.value.trim();
  const desc  = document.getElementById('cal-edit-desc')?.value.trim() || '';
  const pl    = document.getElementById('cal-edit-pl-val')?.value || 'ig';
  const type  = pl === 'story' ? 'story' : (document.getElementById('cal-edit-type-val')?.value || 'post');
  if (!title) { document.getElementById('cal-edit-title')?.focus(); showJnlToast('Title is required'); return; }

  if (id.startsWith('custom-')) {
    const day     = document.getElementById('cal-edit-day')?.value  || 'Mon';
    const weekIdx = parseInt(document.getElementById('cal-edit-week')?.value ?? 0);
    const customs = getCustomPosts();
    const idx     = customs.findIndex(p => p.id === id);
    if (idx === -1) { showJnlToast('Post not found — try refreshing'); return; }
    Object.assign(customs[idx], { day, pl, type, title, desc, weekIdx });
    saveAndSyncCustomPosts(customs);
  } else {
    const overrides = getPostOverrides();
    const dayEl  = document.getElementById('cal-edit-day');
    const weekEl = document.getElementById('cal-edit-week');
    overrides[id] = { title, desc, pl, type };
    if (dayEl)  overrides[id].day     = dayEl.value;
    if (weekEl) overrides[id].weekIdx = parseInt(weekEl.value, 10);
    saveAndSyncPostOverrides(overrides);
  }

  document.getElementById('cal-edit-post-ov')?.remove();
  renderCalendar();
  showJnlToast('Post updated!');
}

// ─── Calendar Ask Claude ──────────────────────────────────────────
function openCalWithClaude(postId) {
  const books = getBooksForPost(postId);
  if (!books.length) { showJnlToast('Add a book above to use Ask Claude'); return; }

  let post = getCustomPosts().find(p => p.id === postId);
  if (!post) {
    const match = postId.match(/^m(\d+)-w(\d+)-p(\d+)$/);
    if (match) {
      const w = months[+match[1]]?.weeks[+match[2]];
      post = w?.posts[+match[3]];
    }
    if (!post) {
      const sm = postId.match(/^m(\d+)-w(\d+)-s(\d+)$/);
      if (sm) {
        const w = months[+sm[1]]?.weeks[+sm[2]];
        post = w?.stories?.[+sm[3]];
      }
    }
  }

  const pl = post?.pl || 'ig';
  const prompt = buildCalClaudePrompt(post?.title || '', post?.desc || '', books, pl);
  const first  = books[0];
  showClaudePanel(post?.title || 'Post content', prompt, {
    bookTitle:  first.title,
    bookAuthor: first.author || ''
  });
}

function buildCalClaudePrompt(postTitle, postDesc, books, platform) {
  const bookList = books.map(b =>
    `"${b.title}"${b.author ? ` by ${b.author}` : ''}`
  ).join('\n');
  const plLabel = platform === 'ig'    ? 'Instagram carousel'
               : platform === 'tt'    ? 'TikTok video'
               : platform === 'story' ? 'Instagram Story'
               :                        'Instagram & TikTok post';
  return `You are helping The Husband's Corner — a Bookstagram & BookTok account focused on thriller, mystery and suspense.

Post type: ${plLabel}
${postTitle ? `Post concept: ${postTitle}` : ''}
${postDesc  ? `Content idea: ${postDesc}` : ''}
Books to feature:
${bookList}

Please give me:
1. A punchy ${plLabel} caption with a strong hook, body, CTA, and 5 thriller-niche hashtags
2. ${platform !== 'tt'
    ? 'An Instagram carousel breakdown (5–7 slides with slide-by-slide text)'
    : 'A TikTok script with hook, body text, and on-screen text suggestions'}
3. Three alternative headline / hook options for the opening slide or first 3 seconds

Voice: passionate, slightly obsessed — a husband who reads every thriller his wife is too scared to pick up alone.`;
}

// ─── Book-in-post CRUD ────────────────────────────────────────────
function _renderBookChips(postId) {
  const books = getBooksForPost(postId);
  const chipsEl = document.getElementById('bchips-' + postId);
  if (!chipsEl) return false;
  chipsEl.innerHTML = books.map((b, i) =>
    `<span class="book-chip">${esc(b.title)}${b.author ? `<span class="chip-author"> — ${esc(b.author)}</span>` : ''}<button class="chip-x" onclick="removeBook('${postId}',${i})" title="Remove">×</button></span>`
  ).join('');
  const card = chipsEl.closest('.post-card');
  if (card) {
    const existing = card.querySelector('.cal-claude-row');
    if (books.length && !existing) {
      const row = document.createElement('div');
      row.className = 'cal-claude-row';
      row.innerHTML = `<button class="claude-btn claude-btn--cal" onclick="openCalWithClaude('${postId}')"><span class="claude-icon">✦</span> Ask Claude</button>`;
      card.appendChild(row);
    } else if (!books.length && existing) {
      existing.remove();
    }
  }
  return true;
}

function addBook(postId) {
  const titleInput  = document.getElementById('binput-'  + postId);
  const authorInput = document.getElementById('bauthor-' + postId);
  if (!titleInput) return;
  const title  = titleInput.value.trim();
  if (!title) { titleInput.focus(); return; }
  const author = authorInput ? authorInput.value.trim() : '';
  const all = getAllBooks();
  if (!all[postId]) all[postId] = [];
  const exists = all[postId].some(b => normBook(b).title.toLowerCase() === title.toLowerCase());
  if (!exists) all[postId].push({ title, author });
  saveAndSyncCalBooks(all);
  if (_renderBookChips(postId)) {
    titleInput.value = '';
    if (authorInput) authorInput.value = '';
    titleInput.focus();
  } else {
    renderCalendar();
  }
  showJnlToast(exists ? 'Already added' : `"${title}" saved!`);
}

function removeBook(postId, idx) {
  const all = getAllBooks();
  if (all[postId]) {
    all[postId].splice(idx, 1);
    if (!all[postId].length) delete all[postId];
    saveAndSyncCalBooks(all);
  }
  if (!_renderBookChips(postId)) renderCalendar();
}

function refreshChips(postId) {
  const el = document.getElementById('bchips-' + postId);
  if (!el) return;
  const books = getBooksForPost(postId);
  el.innerHTML = books.map((b, i) =>
    `<span class="book-chip">${esc(b.title)}${b.author ? `<span class="chip-author"> — ${esc(b.author)}</span>` : ''}<button class="chip-x" onclick="removeBook('${postId}',${i})" title="Remove">×</button></span>`
  ).join('');
}

// ─── Library autocomplete for calendar ───────────────────────────
function refreshCalLibraryList() {
  const dl = document.getElementById('lib-cal-titles');
  if (!dl) return;
  dl.innerHTML = getLibrary().map(b => `<option value="${esc(b.title)}">`).join('');
}

function calBookAutoFill(postId, title) {
  const match = getLibrary().find(b => b.title.toLowerCase() === title.toLowerCase());
  if (match) {
    const a = document.getElementById('bauthor-' + postId);
    if (a && !a.value) a.value = match.author || '';
  }
}

// ─── Archive ──────────────────────────────────────────────────────
function toggleArchived(id) {
  const archived = getArchived();
  if (archived.has(id)) { archived.delete(id); } else { archived.add(id); }
  saveAndSyncArchived(archived);
  renderCalendar();
}

function toggleArchivedPanel(btn) {
  archivedOpen = !archivedOpen;
  btn.nextElementSibling.classList.toggle('open', archivedOpen);
  btn.querySelector('.archived-chevron').classList.toggle('open', archivedOpen);
}

// ─── Platform badge ───────────────────────────────────────────────
function plBadge(pl) {
  if (pl === 'ig')    return '<span class="pbadge ig">Instagram</span>';
  if (pl === 'tt')    return '<span class="pbadge tt">TikTok</span>';
  if (pl === 'story') return '<span class="pbadge story">Story</span>';
  return '<span class="pbadge both">Both</span>';
}

function typeBadge(type) {
  if (!type || type === 'story') return '';
  if (type === 'reel') return '<span class="pbadge type-reel">Reel</span>';
  return '<span class="pbadge type-post">Post</span>';
}

// ─── Card builder ─────────────────────────────────────────────────
function buildCard(item, id, isStory, isArchived, isCustom = false) {
  const override = getPostOverrides()[id] || {};
  const title = override.title || item.title;
  const desc  = override.desc  !== undefined ? override.desc : (item.desc || '');
  const day   = isStory ? 'Story' : (override.day || item.day);
  const pl    = isStory ? 'story' : (override.pl || item.pl);
  const type  = isStory ? 'story' : (override.type || item.type || 'post');
  const books = getBooksForPost(id);
  const chips = books.map((b, i) =>
    `<span class="book-chip">${esc(b.title)}${b.author ? `<span class="chip-author"> — ${esc(b.author)}</span>` : ''}<button class="chip-x" onclick="removeBook('${id}',${i})" title="Remove">×</button></span>`
  ).join('');

  const editActions = `
    <div class="card-custom-actions">
      <button class="card-edit-btn" onclick="showEditPost('${id}');event.stopPropagation()" title="Edit">✎</button>
      <button class="card-del-btn" onclick="deletePost('${id}');event.stopPropagation()" title="Delete">×</button>
    </div>`;

  const claudeRow = books.length ? `
    <div class="cal-claude-row">
      <button class="claude-btn claude-btn--cal" onclick="openCalWithClaude('${id}')">
        <span class="claude-icon">✦</span> Ask Claude
      </button>
    </div>` : '';

  return `<div class="post-card${isStory ? ' story-card' : ''}${isArchived ? ' is-archived' : ''}${isCustom ? ' custom-card' : ''}" data-id="${id}">
    <div class="card-top-row">
      <div class="pday">${day}</div>
      ${plBadge(pl)}
      ${typeBadge(type)}
      ${editActions}
      <button class="check-btn${isArchived ? ' checked' : ''}" onclick="toggleArchived('${id}')" title="${isArchived ? 'Unmark as posted' : 'Mark as posted'}">
        <span class="check-icon">${isArchived ? '✓' : ''}</span>
      </button>
    </div>
    <div class="ptitle">${esc(title)}</div>
    <div class="pdesc">${esc(desc)}</div>
    ${isStory ? '<div class="story-tip">Run throughout the week for max engagement</div>' : ''}
    ${isArchived ? '<div class="posted-label">Posted</div>' : ''}
    <div class="book-section">
      <div id="bchips-${id}" class="book-chips">${chips}</div>
      <div class="book-inputs">
        <input id="binput-${id}" type="text" class="book-input" placeholder="Book title…"
          list="lib-cal-titles"
          oninput="calBookAutoFill('${id}',this.value)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();document.getElementById('bauthor-${id}').focus();}">
        <div class="book-author-row">
          <input id="bauthor-${id}" type="text" class="book-input book-author-input" placeholder="Author…"
            list="global-authors-list"
            onkeydown="if(event.key==='Enter'){event.preventDefault();addBook('${id}');}">
          <button class="book-add-btn" onclick="addBook('${id}')">+</button>
        </div>
      </div>
    </div>
    ${claudeRow}
  </div>`;
}

// ─── Calendar view ────────────────────────────────────────────────
function renderCalendar() {
  const m         = months[currentMonth];
  const archived  = getArchived();
  const deleted   = getDeletedPosts();
  const archCards = [];

  let html = `
    <datalist id="global-authors-list"></datalist>
    <datalist id="lib-cal-titles"></datalist>
    <div class="month-title-block">
      <div>
        <div class="month-title">${m.fullName}: ${m.label}</div>
        <div class="month-label">${m.theme}</div>
      </div>
      <div class="focus-badges">${m.focus.map(f => `<span class="fbadge">${f}</span>`).join('')}</div>
    </div>
    <div class="cal-actions-bar">
      <button class="cal-add-post-btn" onclick="showAddPostModal()">
        <span>+</span> Add Spontaneous Post
      </button>
    </div>`;

  const DAY_ORDER = {Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:7};
  const overrides = getPostOverrides();

  // Pass 1: bucket built-in posts by effective week (respects weekIdx override)
  const dataPostsByWeek = {};
  m.weeks.forEach((w, wi) => {
    w.posts.forEach((p, pi) => {
      const id = `m${currentMonth}-w${wi}-p${pi}`;
      if (deleted.has(id)) return;
      const ov = overrides[id] || {};
      const targetWi = ov.weekIdx !== undefined ? ov.weekIdx : wi;
      if (!dataPostsByWeek[targetWi]) dataPostsByWeek[targetWi] = [];
      dataPostsByWeek[targetWi].push({ p, id, ov });
    });
  });

  // Pass 2: render each week using remapped data
  m.weeks.forEach((w, wi) => {
    const postQueue = [], storyQueue = [];

    (dataPostsByWeek[wi] || []).forEach(({ p, id, ov }) => {
      const isArch = archived.has(id);
      if (isArch) { archCards.push(buildCard(p, id, false, true)); return; }
      postQueue.push({ p, id, isCustom: false, day: ov.day || p.day || 'Mon' });
    });

    (w.stories || []).forEach((s, si) => {
      const id = `m${currentMonth}-w${wi}-s${si}`;
      if (deleted.has(id)) return;
      const isArch = archived.has(id);
      if (isArch) { archCards.push(buildCard(s, id, true, true)); return; }
      storyQueue.push({ p: s, id });
    });

    getCustomPosts()
      .filter(p => p.monthIdx === currentMonth && p.weekIdx === wi)
      .forEach(cp => {
        const isArch = archived.has(cp.id);
        if (isArch) { archCards.push(buildCard(cp, cp.id, cp.pl === 'story', true, true)); return; }
        postQueue.push({ p: cp, id: cp.id, isCustom: true, isStory: cp.pl === 'story', day: cp.day || 'Mon' });
      });

    postQueue.sort((a, b) => (DAY_ORDER[a.day] || 8) - (DAY_ORDER[b.day] || 8));

    const activePosts   = postQueue.map(({ p, id, isCustom, isStory }) => buildCard(p, id, !!isStory, false, isCustom));
    const activeStories = storyQueue.map(({ p, id })                   => buildCard(p, id, true, false, false));

    if (!activePosts.length && !activeStories.length) return;

    html += `<div class="week-section">
      <div class="week-label">${w.label}</div>`;
    if (activePosts.length)   html += `<div class="posts-grid">${activePosts.join('')}</div>`;
    if (activeStories.length) html += `
      <div class="stories-label"><span>Instagram Stories</span></div>
      <div class="posts-grid">${activeStories.join('')}</div>`;
    html += `</div>`;
  });

  if (archCards.length) {
    html += `
    <div class="archived-section">
      <button class="archived-header" onclick="toggleArchivedPanel(this)">
        <span class="archived-title">Archived <span class="archived-count">${archCards.length}</span></span>
        <span class="archived-chevron${archivedOpen ? ' open' : ''}">▼</span>
      </button>
      <div class="archived-body${archivedOpen ? ' open' : ''}">
        <div class="posts-grid">${archCards.join('')}</div>
      </div>
    </div>`;
  }

  html += `
    <div class="cta-bar">
      <div class="cta-label">Ready to create content for ${m.fullName}?</div>
      <a class="cta-btn primary" href="https://claude.ai" target="_blank" rel="noopener">Write captions →</a>
      <a class="cta-btn" href="https://claude.ai" target="_blank" rel="noopener">Get TikTok scripts →</a>
    </div>`;

  document.getElementById('main-content').innerHTML = html;
  refreshAuthorsList();
  refreshCalLibraryList();
}

// ─── Archived Months view ─────────────────────────────────────────
function renderArchivedMonths() {
  const archived = getArchived();
  const deleted  = getDeletedPosts();

  const completedMonths = months.map((m, mi) => {
    let total = 0, done = 0;
    m.weeks.forEach((w, wi) => {
      w.posts.forEach((_, pi) => {
        const id = `m${mi}-w${wi}-p${pi}`;
        if (deleted.has(id)) return;
        total++;
        if (archived.has(id)) done++;
      });
      (w.stories || []).forEach((_, si) => {
        const id = `m${mi}-w${wi}-s${si}`;
        if (deleted.has(id)) return;
        total++;
        if (archived.has(id)) done++;
      });
    });
    getCustomPosts().filter(cp => cp.monthIdx === mi).forEach(cp => {
      if (deleted.has(cp.id)) return;
      total++;
      if (archived.has(cp.id)) done++;
    });
    return { m, mi, total, done, complete: total > 0 && done === total };
  }).filter(x => x.complete);

  let html = `<div class="archived-months-view">
    <div class="view-header">
      <div class="view-header-title">Archived Months</div>
      <div class="view-header-sub">Months where every post has been marked as posted.</div>
    </div>`;

  if (!completedMonths.length) {
    html += `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">Nothing archived yet</div>
      <div class="empty-desc">Mark all posts in a month as posted and it will appear here.</div>
    </div>`;
  } else {
    html += `<div class="arch-months-grid">`;
    completedMonths.forEach(({ m, mi, done }) => {
      html += `<div class="arch-month-card" onclick="setMonth(${mi})">
        <div class="arch-month-check">✓</div>
        <div class="arch-month-name">${esc(m.fullName)}</div>
        <div class="arch-month-label">${esc(m.label)}</div>
        <div class="arch-month-theme">${esc(m.theme)}</div>
        <div class="arch-month-count">${done} post${done !== 1 ? 's' : ''} posted</div>
        <div class="arch-month-link">View month →</div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  document.getElementById('main-content').innerHTML = html;
}
