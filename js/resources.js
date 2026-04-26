// ─── Reading Lists ────────────────────────────────────────────────
let addResourceOpen = false;

function toggleAddResourceForm() {
  addResourceOpen = !addResourceOpen;
  const form = document.getElementById('add-resource-form');
  const btn  = document.getElementById('add-resource-toggle');
  if (form) form.classList.toggle('open', addResourceOpen);
  if (btn)  btn.textContent = addResourceOpen ? '− Cancel' : '+ Add a link';
}

function addCustomLink() {
  const title = document.getElementById('rl-title').value.trim();
  const url   = document.getElementById('rl-url').value.trim();
  const desc  = document.getElementById('rl-desc').value.trim();
  const cat   = document.getElementById('rl-cat').value.trim() || 'Custom';
  if (!title || !url) {
    document.getElementById('rl-error').textContent = 'Title and URL are required.';
    return;
  }
  const links = getCustomLinks();
  links.push({ title, url, desc, category: cat });
  saveCustomLinks(links);
  addResourceOpen = false;
  renderResourcesView();
}

function removeCustomLink(idx) {
  const links = getCustomLinks();
  links.splice(idx, 1);
  saveCustomLinks(links);
  renderResourcesView();
}

// ─── Curated list data ────────────────────────────────────────────
const resources = [
  {
    title: "Wife & Husband in the Title",
    desc: "Books with 'wife' or 'husband' in the title — the core of The Husband's Corner identity and your richest source for Husband's Bait content.",
    category: "Account Niche",
    url: "https://www.goodreads.com/list/show/133358.Books_with_Wife_or_Husband_in_the_title"
  },
  {
    title: "Thrillers Worth Reading",
    desc: "A Goodreads-vetted collection of thrillers that genuinely deliver. Great pool for Two for Tuesday comparison ideas.",
    category: "Thrillers",
    url: "https://www.goodreads.com/list/show/186779.Thrillers_Worth_Reading"
  },
  {
    title: "Most Unexpected Plot Twists",
    desc: "Books celebrated for jaw-dropping reveals — perfect for reaction content, plot twist posts, and spoiler-free bait that gets followers desperate to guess.",
    category: "Plot Twists",
    url: "https://www.goodreads.com/list/show/72434.Books_with_Most_Unexpected_Plot_Twist_"
  },
  {
    title: "Twisted",
    desc: "Dark, disturbing, psychologically complex reads. Where thriller meets horror and nothing is what it seems. Your horror content source.",
    category: "Dark Reads",
    url: "https://www.goodreads.com/list/show/93138.Twisted"
  },
  {
    title: "Best Books to Ever Exist",
    desc: "A crowd-sourced all-time greats list — spot which titles cross into broader mainstream appeal beyond the thriller community.",
    category: "All-Time Greats",
    url: "https://www.goodreads.com/list/show/180274.Best_books_to_ever_exist"
  },
  {
    title: "Dead All Along",
    desc: "Mysteries and thrillers where the big reveal recontextualises everything. Books where the truth was hidden from page one — perfect for twist content.",
    category: "Mysteries",
    url: "https://www.goodreads.com/list/show/171658.Dead_All_Along"
  }
];

// ─── View ─────────────────────────────────────────────────────────
function renderResourcesView() {
  const custom = getCustomLinks();

  let html = `<div class="resources-view">
    <div class="view-header">
      <div class="view-header-title">Reading Lists</div>
      <div class="view-header-sub">Curated lists to help you plan content and discover what to feature next.</div>
    </div>
    <div class="resources-grid">`;

  resources.forEach(r => {
    html += `<div class="resource-card">
      <div class="resource-category">${r.category}</div>
      <div class="resource-title">${r.title}</div>
      <div class="resource-desc">${r.desc}</div>
      <a class="resource-btn" href="${r.url}" target="_blank" rel="noopener">Open List →</a>
    </div>`;
  });

  custom.forEach((r, i) => {
    html += `<div class="resource-card resource-card--custom">
      <button class="resource-delete" onclick="removeCustomLink(${i})" title="Remove">×</button>
      <div class="resource-category">${esc(r.category)}</div>
      <div class="resource-title">${esc(r.title)}</div>
      ${r.desc ? `<div class="resource-desc">${esc(r.desc)}</div>` : ''}
      <a class="resource-btn" href="${esc(r.url)}" target="_blank" rel="noopener">Open List →</a>
    </div>`;
  });

  html += `</div>

    <div class="add-resource-panel">
      <button class="add-resource-toggle" id="add-resource-toggle" onclick="toggleAddResourceForm()">+ Add a link</button>
      <div class="add-resource-form" id="add-resource-form">
        <div class="rl-row">
          <input id="rl-title" type="text" class="rl-input" placeholder="List title *">
          <input id="rl-cat"   type="text" class="rl-input" placeholder="Category (e.g. Horror)">
        </div>
        <input id="rl-url"  type="url"  class="rl-input rl-full" placeholder="https://... *">
        <textarea id="rl-desc" class="rl-input rl-full rl-textarea" placeholder="Short description (optional)" rows="2"></textarea>
        <div class="rl-actions">
          <span id="rl-error" class="rl-error"></span>
          <button class="rl-save" onclick="addCustomLink()">Save link</button>
        </div>
      </div>
    </div>
  </div>`;

  document.getElementById('main-content').innerHTML = html;
}
