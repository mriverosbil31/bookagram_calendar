let current = 0;

function plBadge(pl) {
  if (pl === 'ig')    return '<span class="pbadge ig">Instagram</span>';
  if (pl === 'tt')    return '<span class="pbadge tt">TikTok</span>';
  if (pl === 'story') return '<span class="pbadge story">Story</span>';
  return '<span class="pbadge both">Both</span>';
}

function renderNav() {
  const nav = document.getElementById('month-nav');
  nav.innerHTML = months.map((m, i) =>
    `<button class="mnav${i === current ? ' active' : ''}" onclick="setMonth(${i})">${m.name}</button>`
  ).join('');
}

function renderContent() {
  const m = months[current];

  let html = `
    <div class="month-title-block">
      <div>
        <div class="month-title">${m.fullName}: ${m.label}</div>
        <div class="month-label">${m.theme}</div>
      </div>
      <div class="focus-badges">
        ${m.focus.map(f => `<span class="fbadge">${f}</span>`).join('')}
      </div>
    </div>`;

  m.weeks.forEach(w => {
    html += `<div class="week-section">
      <div class="week-label">${w.label}</div>
      <div class="posts-grid">`;

    w.posts.forEach(p => {
      html += `<div class="post-card">
        <div class="pday">${p.day}</div>
        ${plBadge(p.pl)}
        <div class="ptitle">${p.title}</div>
        <div class="pdesc">${p.desc}</div>
      </div>`;
    });

    html += `</div>`;

    if (w.stories && w.stories.length > 0) {
      html += `<div class="stories-label"><span>Instagram Stories</span></div>
      <div class="posts-grid">`;

      w.stories.forEach(s => {
        html += `<div class="post-card story-card">
          <div class="pday">Story</div>
          ${plBadge('story')}
          <div class="ptitle">${s.title}</div>
          <div class="pdesc">${s.desc}</div>
          <div class="story-tip">Run throughout the week for max engagement</div>
        </div>`;
      });

      html += `</div>`;
    }

    html += `</div>`;
  });

  html += `
    <div class="cta-bar">
      <div class="cta-label">Ready to create content for ${m.fullName}?</div>
      <a class="cta-btn primary" href="https://claude.ai" target="_blank" rel="noopener">Write captions →</a>
      <a class="cta-btn" href="https://claude.ai" target="_blank" rel="noopener">Get TikTok scripts →</a>
    </div>`;

  document.getElementById('main-content').innerHTML = html;
}

function setMonth(i) {
  current = i;
  renderNav();
  renderContent();
  const mainTop = document.querySelector('.main').offsetTop - 70;
  window.scrollTo({ top: mainTop, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  renderContent();
});
