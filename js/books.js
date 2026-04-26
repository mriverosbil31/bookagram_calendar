// ─── Books view ───────────────────────────────────────────────────
function filterBooks(author) {
  document.querySelectorAll('.book-card').forEach(card => {
    const match = author === 'all' || (card.dataset.author || '') === author;
    card.style.display = match ? '' : 'none';
  });
  document.querySelectorAll('.author-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.author === author);
  });
}

function renderBooksView() {
  const allBooks = getAllBooks();
  const bookMap  = {};

  months.forEach((m, mi) => {
    m.weeks.forEach((w, wi) => {
      const collect = (items, prefix) => {
        items.forEach((item, ii) => {
          const id = `m${mi}-w${wi}-${prefix}${ii}`;
          (allBooks[id] || []).map(normBook).forEach(b => {
            const key = `${b.title}||${b.author}`;
            if (!bookMap[key]) bookMap[key] = { title: b.title, author: b.author, mentions: [] };
            bookMap[key].mentions.push({ monthName: m.fullName, postTitle: item.title });
          });
        });
      };
      collect(w.posts, 'p');
      collect(w.stories || [], 's');
    });
  });

  const entries = Object.values(bookMap)
    .sort((a, b) => b.mentions.length - a.mentions.length || a.title.localeCompare(b.title));

  const authors = [...new Set(entries.map(e => e.author).filter(Boolean))].sort();

  let html = `<div class="books-view">
    <div class="view-header">
      <div class="view-header-title">Books Mentioned</div>
      <div class="view-header-sub">Every book you've tagged across all posts. Filter by author or browse the full list.</div>
    </div>`;

  if (!entries.length) {
    html += `<div class="empty-state">
      <div class="empty-dash">—</div>
      <div class="empty-title">No books added yet</div>
      <div class="empty-desc">Go to any post in the Calendar and add a book title — you can also tag the author for filtering here.</div>
    </div>`;
  } else {
    html += `<div class="books-filter-bar">
      <button class="author-pill active" data-author="all" onclick="filterBooks(this.dataset.author)">All <span class="pill-count">${entries.length}</span></button>`;
    authors.forEach(a => {
      const count = entries.filter(e => e.author === a).length;
      html += `<button class="author-pill" data-author="${esc(a)}" onclick="filterBooks(this.dataset.author)">${esc(a)} <span class="pill-count">${count}</span></button>`;
    });
    html += `</div><div class="books-grid">`;

    entries.forEach(e => {
      const initial   = e.title.charAt(0).toUpperCase();
      const monthsSet = [...new Set(e.mentions.map(m => m.monthName))].join(' · ');
      html += `<div class="book-card" data-author="${esc(e.author)}">
        <div class="book-card-initial">${esc(initial)}</div>
        <div class="book-card-body">
          <div class="book-card-title">${esc(e.title)}</div>
          ${e.author ? `<div class="book-card-author">${esc(e.author)}</div>` : ''}
          <div class="book-card-months">${esc(monthsSet)}</div>
          <div class="book-card-count">${e.mentions.length} post${e.mentions.length !== 1 ? 's' : ''}</div>
        </div>
      </div>`;
    });

    html += `</div>`;
  }

  html += `</div>`;
  document.getElementById('main-content').innerHTML = html;
}
