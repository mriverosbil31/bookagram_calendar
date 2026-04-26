// ─── Book-in-post CRUD ────────────────────────────────────────────
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
  saveAllBooks(all);
  titleInput.value = '';
  if (authorInput) authorInput.value = '';
  titleInput.focus();
  refreshChips(postId);
  refreshAuthorsList();
}

function removeBook(postId, idx) {
  const all = getAllBooks();
  if (all[postId]) {
    all[postId].splice(idx, 1);
    if (!all[postId].length) delete all[postId];
    saveAllBooks(all);
  }
  refreshChips(postId);
  refreshAuthorsList();
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
  saveArchived(archived);
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

// ─── Card builder ─────────────────────────────────────────────────
function buildCard(item, id, isStory, isArchived) {
  const title = item.title;
  const desc  = item.desc;
  const day   = isStory ? 'Story' : item.day;
  const pl    = isStory ? 'story' : item.pl;
  const books = getBooksForPost(id);
  const chips = books.map((b, i) =>
    `<span class="book-chip">${esc(b.title)}${b.author ? `<span class="chip-author"> — ${esc(b.author)}</span>` : ''}<button class="chip-x" onclick="removeBook('${id}',${i})" title="Remove">×</button></span>`
  ).join('');

  return `<div class="post-card${isStory ? ' story-card' : ''}${isArchived ? ' is-archived' : ''}" data-id="${id}">
    <div class="card-top-row">
      <div class="pday">${day}</div>
      ${plBadge(pl)}
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
  </div>`;
}

// ─── Calendar view ────────────────────────────────────────────────
function renderCalendar() {
  const m         = months[currentMonth];
  const archived  = getArchived();
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
    </div>`;

  m.weeks.forEach((w, wi) => {
    const activePosts = [], activeStories = [];

    w.posts.forEach((p, pi) => {
      const id = `m${currentMonth}-w${wi}-p${pi}`;
      (archived.has(id) ? archCards : activePosts).push(buildCard(p, id, false, archived.has(id)));
    });

    (w.stories || []).forEach((s, si) => {
      const id = `m${currentMonth}-w${wi}-s${si}`;
      (archived.has(id) ? archCards : activeStories).push(buildCard(s, id, true, archived.has(id)));
    });

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
