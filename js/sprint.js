// ─── Sprint Playbook ──────────────────────────────────────────────
let sprintTab = 'overview';
let sprintWeek = 1;

// ── Day data ──────────────────────────────────────────────────────
const SPRINT_DAYS = [
  // WEEK 1
  { d:1,  wd:'Mon', wk:1, pin:true,
    title:'Account Setup + Manifesto Reel',
    hook:'"I\'m a married man who reads thrillers. Here\'s why my wife is finally happy."',
    struct:'Face to camera. State who you are, what genres, what husbands and wives can both expect. End: "Follow if you want to know what\'s actually worth reading."',
    note:'Soft cinematic underbed (-18dB). Voice leads. Pin on both platforms.',
    length:'30–45 sec' },
  { d:2,  wd:'Tue', wk:1,
    title:'Wife Made Me Read It (Pilot)',
    hook:'"My wife told me to read The Housemaid. I\'ve been wrong about a lot of things."',
    struct:'"I assumed it was beach-read fluff" → "Then chapter 12 happened" → describe physical reaction (no spoilers) → "Rating _/10. What should she make me read next?"',
    note:'Search "oh my god" or "wait what" trending sounds under 200k uses. Or slowed audio with a tension build.',
    length:'25–35 sec' },
  { d:3,  wd:'Wed', wk:1,
    title:'Three Thrillers If You Liked Verity',
    hook:'"Your wife finished Verity and is now insufferable. Here are three books that\'ll buy you another week of peace."',
    struct:'Faceless. Show 3 books with text overlay. 5–7 sec per book. One sentence each — similar to Verity, what\'s different. Final card: "Save this. She\'ll ask."',
    note:'Also post as IG carousel — cover + 1 slide per book + "save" slide. Carousels save at 3× the rate of reels.',
    length:'20–30 sec' },
  { d:4,  wd:'Thu', wk:1,
    title:'First Stitch / Reply Video',
    hook:'"I respectfully disagree — and here\'s why she\'s missing something."',
    struct:'Find a thriller creator with a take you genuinely disagree with. Stitch them. State the disagreement in 1 sentence. Make your case in 15 seconds. End: "Tell me I\'m wrong."',
    note:'Stitches put your face in front of someone else\'s audience. Highest-leverage growth move in week 1.',
    length:'30–40 sec' },
  { d:5,  wd:'Fri', wk:1,
    title:'Currently Reading Aesthetic',
    hook:'"It\'s 11pm and I\'m 60% through. I cannot put this down."',
    struct:'Faceless. Lamp. Book open. Slow zoom or pan. Text overlay: "60% in. The twist is somewhere on the next 50 pages." End with title shown subtly.',
    note:'Lo-fi or piano. Search "tense piano", "thriller score" under 200k uses.',
    length:'15–20 sec' },
  { d:6,  wd:'Sat', wk:1, viral:true,
    title:'Viral Lever: Hot Take #1',
    hook:'"Stop telling people The Housemaid is a thriller. It\'s a romp. There\'s a difference, and it matters."',
    struct:'Face. 30-second talking head. Define the difference between a thriller and a romp. Use Housemaid as the example. End: "Disagree? The comments are open." Genuinely engage with replies.',
    note:'No music or very faint piano underbed. Voice carries it.',
    length:'30–40 sec' },
  { d:7,  wd:'Sun', wk:1,
    title:'Rest Day (optional shelf tour)',
    hook:'Optional — Stories only.',
    struct:'Stories-only shelf tour with a poll asking which book to read next. No reel today.',
    note:'Prepare for week 2 batch filming on Sunday afternoon.',
    length:'—' },
  // WEEK 2
  { d:8,  wd:'Mon', wk:2,
    title:'Carousel: Genre Starter Pack',
    hook:'"Thriller starter pack: where to begin in 6 sub-genres."',
    struct:'8-slide carousel. One sub-genre per slide (psych thriller, domestic suspense, gothic, procedural, spy, horror). One starter book per genre. Final slide: "Save this. Follow for a new rec every Wednesday."',
    note:'IG-first. Saves are weighted heavily for IG ranking — this is your top save-driver of the month.',
    length:'8 slides' },
  { d:9,  wd:'Tue', wk:2,
    title:'Wife Made Me Read It #2',
    hook:'"My wife is on her fourth Lisa Jewell. I finally cracked one open. We need to talk."',
    struct:'Same template as Day 2 but different book. Pick None of This Is True or The Family Upstairs.',
    note:'Same trending audio pool as Day 2.',
    length:'25–35 sec' },
  { d:10, wd:'Wed', wk:2,
    title:'POV: 1AM Twist Reaction',
    hook:'"POV: it\'s 1am, my wife is asleep, and the thriller she made me read just hit the twist."',
    struct:'Faceless. Lamp on. Book in hand. Slowly close it. Stare at ceiling. Text: "I cannot sleep now." Cut to: "Book in comments." Drop title in pinned comment.',
    note:'Heartbeat sound or tense piano. Search "heartbeat ambient" or "tense thriller". Loop-friendly.',
    length:'12–18 sec' },
  { d:11, wd:'Thu', wk:2,
    title:'Stitch / Reply #2',
    hook:'Different creator, different take.',
    struct:'Try agreeing-and-extending. "She\'s right about X, but here\'s what no one is saying about Y." Builds dialogue, not just conflict.',
    note:'Voice leads. Minimal music.',
    length:'30–40 sec' },
  { d:12, wd:'Fri', wk:2,
    title:'Books My Wife Made Me Read, Ranked',
    hook:'"Books my wife made me read, ranked from \'fine\' to \'I owe her an apology.\'"',
    struct:'5 books on desk. Pick up each one, give 1-line verdict. Place in tier. Save #1 for the longest moment with a real reaction.',
    note:'Trending list-format sound. Wives tag husbands. Husbands tag wives. Comment goldmine.',
    length:'45–60 sec' },
  { d:13, wd:'Sat', wk:2, viral:true,
    title:'Viral Lever: Hot Take #2',
    hook:'"Freida McFadden writes the same book five times. Only one of them is actually scary. I\'m going to name names."',
    struct:'Face. 30 sec. Be specific — name the books, name what works, name what doesn\'t. Don\'t be contrarian for sport — be RIGHT. End: "Fight me in the comments."',
    note:'None or very faint piano. Your voice carries it.',
    length:'30–40 sec' },
  { d:14, wd:'Sun', wk:2,
    title:'Wife Cameo (bonus 6th post)',
    hook:'"I made my wife rate the thrillers I picked for her. She did not hold back."',
    struct:'Bring your wife in. She rates 3 books. You react. End on her #1.',
    note:'Lo-fi or cozy. Keep it warm, not chaotic. Couple-doing-books-together is a category of one.',
    length:'45–60 sec' },
  // WEEK 3
  { d:15, wd:'Mon', wk:3,
    title:'Carousel: "Books Better Than Their Hype"',
    hook:'"5 thrillers BookTok ignored — and shouldn\'t have."',
    struct:'7-slide carousel. One under-the-radar book per slide. Author, premise in 1 line, why it deserves more attention. Final slide: "Which one are you reading first? Comment a number."',
    note:'IG-first. Saves-focused format.',
    length:'7 slides' },
  { d:16, wd:'Tue', wk:3,
    title:'Wife Made Me Read It #3 (series brand)',
    hook:'"Episode 3: my wife handed me [book] and said \'don\'t Google it.\' She was right."',
    struct:'Brand the format now. People should recognise "Wife Made Me Read It" as a series.',
    note:'Consistent with episodes 1 and 2.',
    length:'25–35 sec' },
  { d:17, wd:'Wed', wk:3,
    title:'Faceless Voiceover: "If You Liked X" #2',
    hook:'"If you finished Verity and need that exact feeling again, here are three books that scratch it."',
    struct:'Same template as Day 3 — three books, faceless, fast.',
    note:'Trending list sound.',
    length:'20–30 sec' },
  { d:18, wd:'Thu', wk:3,
    title:'Stitch #3 — Cross-niche',
    hook:'Pull romance readers toward thrillers.',
    struct:'Stitch a NON-thriller creator (e.g., romance) and pull them toward thrillers. "You\'d actually love this if you liked Twisted Love." Cross-niche stitches reach new audiences.',
    note:'Voice leads. Minimal music.',
    length:'30–40 sec' },
  { d:19, wd:'Fri', wk:3,
    title:'Reading Vlog Style',
    hook:'"Saturday morning, coffee, two kids asleep, and 80 pages left of [book]. This is the dream."',
    struct:'Faceless. Quick cuts of coffee, book, page being turned. Text overlay only.',
    note:'Lo-fi or "cozy morning" style. Evergreen audio.',
    length:'12–15 sec' },
  { d:20, wd:'Sat', wk:3, viral:true,
    title:'Viral Lever: Cover Tier List',
    hook:'"Ranking 2026 thriller covers — the ones that pulled me in, and the ones lying about the book."',
    struct:'Face. Show covers. Place in S/A/B/C/F tiers. Be specific about what makes a cover work. Make the F tier funny.',
    note:'Voice-led. Designers and authors share these — cross-niche reach.',
    length:'60–90 sec' },
  { d:21, wd:'Sun', wk:3,
    title:'Bonus: Stories-driven Recap',
    hook:'Stories only — no reel.',
    struct:'Recap top 3 books read this month. Use "Add Yours" template — "Drop your top thriller of the year so far." This becomes a chain.',
    note:'Stories only. Engagement booster without filming.',
    length:'—' },
  // WEEK 4
  { d:22, wd:'Mon', wk:4,
    title:'Carousel: "Husband-Approved" Branded',
    hook:'"Husband-approved thrillers (this is going to be a series)."',
    struct:'7-slide carousel. 5 books with your verdict each. Final slide: "Save this. Follow for the next 5 next month."',
    note:'IG-first. Sets up a recurring branded carousel series.',
    length:'7 slides' },
  { d:23, wd:'Tue', wk:4,
    title:'Wife Made Me Read It #4',
    hook:'Pick a polarising book.',
    struct:'Behind Closed Doors, The Wife Between Us, The Silent Patient. Polarising books generate the most comments.',
    note:'Consistent with the series format.',
    length:'25–35 sec' },
  { d:24, wd:'Wed', wk:4,
    title:'"Thrillers For Husbands Who Don\'t Read"',
    hook:'"Three thrillers to give your husband if he says he \'doesn\'t read.\' I\'ve tested all of them."',
    struct:'Faceless. 3 books, fast. Aim at the wives — they\'ll tag husbands.',
    note:'Reverse-engineered viral lever. Appeals to existing audience while reinforcing your unique angle.',
    length:'20–30 sec' },
  { d:25, wd:'Thu', wk:4,
    title:'Stitch / Collab DM',
    hook:'DM 3 thriller creators (5k–20k followers) and propose a collab.',
    struct:'"Want to do a \'his pick vs her pick\' duet?" Leverage the network you\'ve built. Fallback: regular stitch if no response by Friday.',
    note:'Collaboration posts borrow each other\'s audiences. Highest ceiling for single-day follower spikes.',
    length:'30–60 sec' },
  { d:26, wd:'Fri', wk:4,
    title:'Personal Story Reel',
    hook:'"My wife started this account because I wouldn\'t shut up about books. Three weeks in, here\'s what surprised me."',
    struct:'Face. Honest. 30 seconds. What you\'ve learned, what you\'ve loved, what you didn\'t expect. End: "If you\'re still here at week 3, thank you. We\'re just getting started."',
    note:'Personal vulnerability converts viewers to followers at 3–5× the rate of pure content posts.',
    length:'30 sec' },
  { d:27, wd:'Sat', wk:4, viral:true,
    title:'Viral Lever: The Boldest Take',
    hook:'"The most overrated thriller of the last 5 years isn\'t Verity. It isn\'t Behind Closed Doors. It\'s [your pick]."',
    struct:'Face. Pick a fight you can defend with substance. Make the case. Invite disagreement explicitly.',
    note:'Save your boldest take for week 4 — when your account has proof points that make the controversy work in your favour.',
    length:'30–45 sec' },
  { d:28, wd:'Sun', wk:4,
    title:'Live or Q&A',
    hook:'"I\'ll recommend a thriller based on the last book you loved. Drop yours in the comments."',
    struct:'Run a 30-min IG or TikTok Live. Free reach + relationship-building.',
    note:'Lives prioritise your content to existing followers — keeps retention high heading into the final push.',
    length:'30 min live' },
  { d:29, wd:'Mon', wk:4,
    title:'Final Carousel: 30-Day Recap',
    hook:'"My 30 days reading thrillers as a husband."',
    struct:'Show the books, the verdicts, the wins, the disasters. Final slide: "Follow for month 2."',
    note:'IG carousel.',
    length:'8 slides' },
  { d:30, wd:'Tue', wk:4,
    title:'The Closer',
    hook:'"30 days ago I had zero followers. Today I\'m close to 1,000. Here\'s the thriller that got me there — and the one I\'m starting next."',
    struct:'Face. Authentic. Thank the audience. Tease the next month.',
    note:'Milestone posts trigger algorithmic boosts and viewer-to-follower conversion. People love watching someone in motion.',
    length:'30 sec' },
];

const WEEK_META = {
  1: { range:'0 → 100', sub:'Foundation & voice — teach the algorithm who you are. Don\'t optimise for virality yet. Optimise for filming a lot, fast.' },
  2: { range:'100 → 300', sub:'Format testing — by end of this week you should know your best-performing pillar.' },
  3: { range:'300 → 600', sub:'Scale what works — double down on your top 2 formats. Cut what isn\'t working.' },
  4: { range:'600 → 1,000+', sub:'Maximum effort — one post per day if possible. This is when the compounding kicks in.' },
};

// ── Entry point ───────────────────────────────────────────────────
function renderSprintView() {
  sprintTab = 'overview';
  sprintWeek = 1;
  document.getElementById('main-content').innerHTML = `
<div class="sprint-view">
  <div class="sprint-hero">
    <div class="sprint-eyebrow">30-Day Sprint · Vol. 01</div>
    <h2 class="sprint-hero-title">From zero, to <em>one thousand</em> followers.</h2>
    <div class="sprint-hero-stats">
      <span>30 days</span><span class="sp-sep">·</span>
      <span>5–6 posts / week</span><span class="sp-sep">·</span>
      <span>22–26 posts total</span><span class="sp-sep">·</span>
      <span>60 min / day engagement</span>
    </div>
  </div>
  <div class="sprint-tab-bar">
    <button class="sp-tab active" data-tab="overview" onclick="setSprintTab('overview')">Overview</button>
    <button class="sp-tab" data-tab="angle"    onclick="setSprintTab('angle')">Your Angle</button>
    <button class="sp-tab" data-tab="rhythm"   onclick="setSprintTab('rhythm')">Weekly Rhythm</button>
    <button class="sp-tab" data-tab="calendar" onclick="setSprintTab('calendar')">30-Day Plan</button>
    <button class="sp-tab" data-tab="ops"      onclick="setSprintTab('ops')">Daily Ops</button>
    <button class="sp-tab" data-tab="kit"      onclick="setSprintTab('kit')">Content Kit</button>
  </div>
  <div class="sprint-content" id="sprint-content"></div>
</div>`;
  renderSprintContent();
}

function setSprintTab(tab) {
  sprintTab = tab;
  document.querySelectorAll('.sp-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab));
  renderSprintContent();
  document.getElementById('sprint-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setSprintWeek(week) {
  sprintWeek = week;
  document.querySelectorAll('.sp-wtab').forEach(b =>
    b.classList.toggle('active', parseInt(b.dataset.week) === week));
  const el = document.getElementById('sp-week-content');
  if (el) el.innerHTML = renderWeekDays(week);
}

function renderSprintContent() {
  const el = document.getElementById('sprint-content');
  if (!el) return;
  const fns = {
    overview: sprintOverview,
    angle:    sprintAngle,
    rhythm:   sprintRhythm,
    calendar: sprintCalendar,
    ops:      sprintOps,
    kit:      sprintKit,
  };
  el.innerHTML = (fns[sprintTab] || sprintOverview)();
}

// ── Tab: Overview ─────────────────────────────────────────────────
function sprintOverview() {
  return `
<div class="sp-section">
  <div class="sp-h3">The <em>math</em> behind 1,000 in 30 days</div>
  <p class="sp-p">Hitting 1,000 followers in 30 days from zero is aggressive but achievable in this niche if you execute with discipline.</p>
  <ul class="sp-bullets">
    <li><strong>22 posts in 30 days</strong> (5–6 per week) gives the algorithm enough signal to identify your account as serious and start testing your content with non-followers.</li>
    <li><strong>Statistically, 1 in 10 thriller-niche posts on TikTok breaks 20k+ views</strong> if hooks are strong. Across 22 posts, you should get 2–3 of these. One alone can deliver 300–600 followers.</li>
    <li><strong>The remaining followers come from compounding:</strong> daily engagement, comment replies, IG carousel saves, and the "profile-check" conversion when people see you already have 8+ posts published.</li>
  </ul>

  <div class="sp-h3">What this plan <em>optimises</em> for</div>
  <ul class="sp-bullets">
    <li><strong>Volume over polish.</strong> A B+ post published today beats an A+ post you'll never finish editing. This sprint is about reps.</li>
    <li><strong>Hooks over production value.</strong> Phone-shot, well-lit, strong first 1.5 seconds. That's it. No transitions, no fancy edits.</li>
    <li><strong>One viral lever per week.</strong> Each week has at least one designated "spike" post engineered for shareability, not just consistency.</li>
  </ul>

  <div class="sp-h3">What you must <em>accept</em></div>
  <ul class="sp-bullets">
    <li>Some days you'll post and get 200 views. That's normal. Don't quit on day 4.</li>
    <li>The first 7–10 days will feel slow. Most growth happens in days 14–30 once the algorithm has classified you.</li>
    <li>If by day 21 you have under 300 followers, the issue is hooks. Re-watch your top-performing posts and copy that pattern relentlessly.</li>
  </ul>

  <div class="sp-h3">Realistic <em>milestones</em></div>
  <div class="sp-stat-grid">
    <div class="sp-stat-card">
      <div class="sp-stat-day">Day 07</div>
      <div class="sp-stat-num">75–125</div>
      <div class="sp-stat-unit">followers</div>
      <div class="sp-stat-note">If below: hooks need work. Re-watch top 3 posts, copy the pattern exactly.</div>
    </div>
    <div class="sp-stat-card">
      <div class="sp-stat-day">Day 14</div>
      <div class="sp-stat-num">200–350</div>
      <div class="sp-stat-unit">followers</div>
      <div class="sp-stat-note">If below: increase engagement protocol from 60 to 90 min/day.</div>
    </div>
    <div class="sp-stat-card">
      <div class="sp-stat-day">Day 21</div>
      <div class="sp-stat-num">450–650</div>
      <div class="sp-stat-unit">followers</div>
      <div class="sp-stat-note">If below: pivot Saturday format. Try a new hot-take angle.</div>
    </div>
    <div class="sp-stat-card sp-stat-card--goal">
      <div class="sp-stat-day">Day 30</div>
      <div class="sp-stat-num sp-gold">1,000+</div>
      <div class="sp-stat-unit">the goal</div>
      <div class="sp-stat-note">If at 700–900: extend the sprint by 2 weeks. You're close.</div>
    </div>
  </div>

  <div class="sp-h3">The <em>four</em> numbers that matter</div>
  <ul class="sp-bullets">
    <li><strong>Follow rate</strong> (new followers ÷ reach). Healthy = 1.5–3% on a discovery post.</li>
    <li><strong>Save rate</strong> (saves ÷ views). Healthy = 1–2%. Strongest signal of value on IG.</li>
    <li><strong>Share rate</strong> (shares ÷ views). Healthy = 0.5–1.5%. Hot takes spike here.</li>
    <li><strong>Comment rate</strong> (comments ÷ views). Healthy = 0.4–1%. Conversation pillar should hit top of range.</li>
  </ul>
  <p class="sp-p"><strong>Weekly question to answer in writing:</strong> "What was my top post and why did it work? What was my bottom post and why didn't it?" Plan the next week using the answer to question 1.</p>
</div>`;
}

// ── Tab: Angle ────────────────────────────────────────────────────
function sprintAngle() {
  return `
<div class="sp-section">
  <div class="sp-h3">Your <em>unique angle</em></div>
  <p class="sp-p">You are a married man who genuinely reads psychological thrillers, domestic suspense, gothic horror, procedurals, and spy / action. <strong>This is rare.</strong> BookTok and Bookstagram thriller spaces are dominated by women in their 20s–40s. A man who treats their favourite books with respect — not irony — is instantly memorable.</p>
  <div class="sp-pull">"The husband who reads the books your wife is obsessed with — and tells you whether they're worth it."</div>

  <div class="sp-h3">Three rules — <em>never break them</em></div>
  <ul class="sp-bullets">
    <li><strong>Be the husband, not the bro.</strong> No "guy reading a girl book LOL" irony. Treat the books seriously. Your audience can smell condescension instantly.</li>
    <li><strong>Earn the right to recommend.</strong> 70% of your content is reactions to books women in this niche already love. Once you've built credibility, you pull them toward books they don't know yet.</li>
    <li><strong>Open loops, never close them in the hook.</strong> Thriller content uniquely benefits from "the twist destroyed me / I cannot tell you what happens at 60%" formats. Lean in hard.</li>
  </ul>

  <div class="sp-h3">Pre-launch <em>checklist</em></div>
  <ul class="sp-bullets">
    <li>Bio includes: "Husband" identifier, genres (Thriller / Mystery / Suspense), one personality line, CTA</li>
    <li>Profile photo: high-contrast, recognisable at thumbnail size</li>
    <li>First 9 IG grid posts planned — dark/moody palette with one warm accent</li>
    <li>TikTok bio links to Instagram; IG bio links to TikTok</li>
    <li>Pinned post slot ready for Day 1 manifesto reel</li>
    <li>Pinned-comment template ready: "Drop your last 5-star thriller — I'll read the most-liked one"</li>
    <li>IG Highlight covers created: Reviews, Recs, Currently Reading, About</li>
    <li>Hashtag sets saved in phone notes (see Content Kit tab)</li>
    <li>CapCut or InShot installed. SnapTik bookmarked for watermark removal.</li>
    <li>Calendar blocked: Sunday afternoon 90-min batch-film session, daily 60-min engagement</li>
    <li>Read 5 thriller-niche accounts at your follower count and 5 at 50k+. Note their format patterns.</li>
    <li>Buy or borrow 4–5 of the books you'll review in week 1. You can't film without them.</li>
  </ul>
</div>`;
}

// ── Tab: Rhythm ───────────────────────────────────────────────────
function sprintRhythm() {
  return `
<div class="sp-section">
  <div class="sp-h3">Weekly <em>structure</em></div>
  <p class="sp-p">Every week for 30 days follows this rhythm. <strong>Tuesday is non-negotiable</strong> — best engagement day for book content. <strong>Saturday's hot take is your viral lever</strong> — the one engineered to break out.</p>
  <div class="sp-table-wrap">
    <table class="sp-table">
      <thead><tr><th>Day</th><th>Format</th><th>Pillar</th><th>TikTok</th><th>Instagram</th></tr></thead>
      <tbody>
        <tr><td><strong>Mon</strong></td><td>Carousel / static</td><td>Recommendation</td><td>—</td><td>Carousel post</td></tr>
        <tr><td><strong>Tue ★</strong></td><td>Talking-head reel (face)</td><td>Reaction</td><td>Live review</td><td>Repost reel +24h</td></tr>
        <tr><td><strong>Wed</strong></td><td>Faceless voiceover reel</td><td>Recommendation</td><td>"Three thrillers if you…"</td><td>Stories: poll</td></tr>
        <tr><td><strong>Thu</strong></td><td>Stitch / reply video</td><td>Reaction</td><td>Stitch a thriller creator</td><td>—</td></tr>
        <tr><td><strong>Fri</strong></td><td>Personality / lifestyle</td><td>Personality</td><td>Faceless "currently reading"</td><td>Repost + Stories</td></tr>
        <tr><td><strong>Sat 🔥</strong></td><td>Viral lever (face)</td><td>Hot take</td><td>Controversial opinion</td><td>Repost +24h, question caption</td></tr>
        <tr><td><strong>Sun</strong></td><td>Optional 6th post</td><td>Personality</td><td>Wife cameo / behind scenes</td><td>Stories recap</td></tr>
      </tbody>
    </table>
  </div>
  <div class="sp-pull">Batch-film on Sunday. Shoot Tue + Wed + Fri + Sat in one 90-minute session. Change shirts and settings between each so they don't look batched.</div>

  <div class="sp-h3">Audio <em>strategy</em></div>
  <p class="sp-p">Audio choice is 30% of your discoverability on TikTok. Every Sunday before batch-filming, do this 10-minute ritual.</p>
  <ul class="sp-bullets">
    <li>Scroll TikTok For You for 5 min — <strong>only</strong> on book/thriller/film/true-crime content. Tap any sound that feels right → Favorites.</li>
    <li>Check video count on every saved sound. <strong>Sweet spot: 5,000–500,000 uses.</strong> Under 5k = unproven. Over 1M = saturated.</li>
    <li>Open TikTok Creative Center (free, no login). Trends → Songs → filter your region. Note the top 3 climbing songs.</li>
    <li>On Instagram Reels: watch for the upward arrow ↑ next to song names — that's IG flagging trending. Save them.</li>
  </ul>
  <div class="sp-table-wrap">
    <table class="sp-table">
      <thead><tr><th>Category</th><th>When to use</th><th>How to find</th></tr></thead>
      <tbody>
        <tr><td><strong>Trending viral sound</strong></td><td>POV reels, list reels, "three thrillers if…"</td><td>TikTok For You scroll + Creative Center</td></tr>
        <tr><td><strong>Cinematic / tense piano</strong></td><td>Reviews, twist reactions, gothic content</td><td>Search: "tense piano", "dark cinematic", "thriller score"</td></tr>
        <tr><td><strong>Lo-fi / cozy</strong></td><td>Reading vlogs, "currently reading", shelf moments</td><td>Search: "lofi study", "cozy morning". Evergreen.</td></tr>
        <tr><td><strong>Voiceover-only</strong></td><td>Hot takes, 1-on-1 reactions, opinion content</td><td>Record clean. Add lo-fi underbed at -20dB. Voice always leads.</td></tr>
        <tr><td><strong>Heartbeat / ambient tension</strong></td><td>Reveal-style reels, twist moments, slow-build</td><td>Search: "heartbeat ambient", "ticking clock"</td></tr>
      </tbody>
    </table>
  </div>

  <div class="sp-h3">TikTok → Instagram <em>repost flow</em></div>
  <p class="sp-p">You shoot once. You publish twice. Most accounts skip this and lose half their growth potential.</p>
  <ul class="sp-bullets">
    <li>Film vertical 9:16. Edit in CapCut or InShot. Save the master file with no platform watermark.</li>
    <li>Post to TikTok first. Use a TikTok-native trending sound.</li>
    <li>Wait 24–48 hours.</li>
    <li>Download TikTok video <strong>without watermark</strong> — use SnapTik or screen-record from another device. Instagram down-ranks watermarked content.</li>
    <li>On IG, pick a similar sound from the IG audio library. The IG version of the song carries algorithmic weight on IG — TikTok audios don't transfer.</li>
    <li>Tweak the caption. IG captions can be longer and more reflective — 2–3 sentences with a question at the end.</li>
    <li>Post to IG Reels. Add 15–20 hashtags from your saved sets.</li>
  </ul>
</div>`;
}

// ── Tab: Calendar ─────────────────────────────────────────────────
function sprintCalendar() {
  return `
<div class="sp-section">
  <div class="sp-h3">The <em>30-day</em> calendar</div>
  <p class="sp-p">Every post you'll publish for the next 30 days — hooks, structure, audio. <strong>Don't deviate in week 1.</strong> Adapt in weeks 3–4 once you see what's working.</p>
  <div class="sp-week-tabs">
    <button class="sp-wtab active" data-week="1" onclick="setSprintWeek(1)">Week 1 · Foundation</button>
    <button class="sp-wtab" data-week="2" onclick="setSprintWeek(2)">Week 2 · Testing</button>
    <button class="sp-wtab" data-week="3" onclick="setSprintWeek(3)">Week 3 · Scale</button>
    <button class="sp-wtab" data-week="4" onclick="setSprintWeek(4)">Week 4 · Push</button>
  </div>
  <div id="sp-week-content">${renderWeekDays(1)}</div>
</div>`;
}

function renderWeekDays(week) {
  const meta = WEEK_META[week];
  const days = SPRINT_DAYS.filter(d => d.wk === week);
  return `
    <div class="sp-week-meta">
      <div class="sp-week-goal-label">Goal — Week ${week}</div>
      <div class="sp-week-goal-val">${meta.range} followers</div>
      <div class="sp-week-goal-sub">${meta.sub}</div>
    </div>
    ${days.map(d => `
    <div class="sp-day${d.viral ? ' sp-day--viral' : ''}">
      <div class="sp-day-head">
        <span class="sp-day-num">Day ${d.d} · ${d.wd}</span>
        <span class="sp-day-title">${d.title}</span>
        ${d.viral ? '<span class="sp-badge">🔥 Spike</span>' : ''}
        ${d.pin   ? '<span class="sp-badge sp-badge--pin">📌 Pin</span>' : ''}
      </div>
      <div class="sp-day-row"><span class="sp-day-label">Hook</span><span class="sp-day-val"><em class="sp-quote">${d.hook}</em></span></div>
      <div class="sp-day-row"><span class="sp-day-label">Structure</span><span class="sp-day-val">${d.struct}</span></div>
      <div class="sp-day-row"><span class="sp-day-label">Note</span><span class="sp-day-val">${d.note}</span></div>
      ${d.length !== '—' ? `<div class="sp-day-row"><span class="sp-day-label">Length</span><span class="sp-day-val">${d.length}</span></div>` : ''}
    </div>`).join('')}`;
}

// ── Tab: Daily Ops ────────────────────────────────────────────────
function sprintOps() {
  return `
<div class="sp-section">
  <div class="sp-h3">The daily <em>engagement</em> protocol</div>
  <p class="sp-p"><strong>This is the multiplier.</strong> Posting alone will not get you to 1k in 30 days. The community-engagement layer is what breaks past your follower base.</p>

  <div class="sp-ops-block">
    <div class="sp-ops-label">Morning · 20 min</div>
    <ul class="sp-bullets">
      <li>Comment on 15 posts in the thriller niche. Not "🔥" — actual sentences that prove you read the post.</li>
      <li>Pick a specific point. Agree, disagree, or extend the idea.</li>
      <li>Goal: get into the top 3 comments on at least 5 posts per day. Top comments get clicked through to your profile.</li>
      <li>Target: accounts with 1k–50k followers — small enough that your comment is visible, big enough to drive traffic.</li>
    </ul>
  </div>

  <div class="sp-ops-block">
    <div class="sp-ops-label">Midday · 10 min</div>
    <ul class="sp-bullets">
      <li>Reply to every single comment on your own posts. Even "😍".</li>
      <li>On replies that have substance, ask a follow-up question. Comment threads are weighted heavily by both algorithms.</li>
      <li>A post with 30 comments where you replied to all 30 outperforms a post with 100 comments where you replied to none.</li>
    </ul>
  </div>

  <div class="sp-ops-block">
    <div class="sp-ops-label">Evening · 15 min</div>
    <ul class="sp-bullets">
      <li>Search hashtags: #booktok, #thrillerbooks, #psychologicalthriller, #bookrecommendations.</li>
      <li>Engage with 10 of the most <strong>recent</strong> posts — not "top". New posts have low comment count so yours lands at the top.</li>
      <li>Save 3 reels you'd like to imitate. Build an inspiration folder.</li>
    </ul>
  </div>

  <div class="sp-ops-block">
    <div class="sp-ops-label">DMs · 15 min, 3× per week</div>
    <ul class="sp-bullets">
      <li>DM 3 followers per session with a specific question — "Saw your comment on the Verity post. What did you think of the ending?"</li>
      <li>Once per week, DM a creator your size or slightly larger and propose a collab idea.</li>
      <li>These conversations turn followers into advocates who share unprompted.</li>
    </ul>
  </div>

  <div class="sp-pull">A post with 30 comments where you replied to all 30 outperforms a post with 100 comments where you replied to none.</div>
</div>`;
}

// ── Tab: Content Kit ──────────────────────────────────────────────
function sprintKit() {
  const hooks = [
    { cat: 'Curiosity', items: [
      '"This is the thriller my wife wouldn\'t let me discuss at dinner."',
      '"I figured out the twist on page 12. Here\'s how the author still got me."',
      '"There\'s a chapter in this book I had to put down and walk away from."',
      '"My wife handed me this and said \'do not Google it.\' She was right."',
      '"This book has a 4.1 on Goodreads. It deserves a 4.8 and I\'ll explain why."',
    ]},
    { cat: 'Hot Takes', items: [
      '"Unpopular opinion: Freida McFadden writes the same book five times. Here\'s the one that actually works."',
      '"Bookstagram is wrong about this book. Let me explain."',
      '"Stop telling people The Housemaid is a good thriller. It\'s a good ROMP. There\'s a difference."',
      '"If you only read one thriller this year, do not let it be the one BookTok is screaming about."',
    ]},
    { cat: 'Recommendations', items: [
      '"You loved Verity? Here are three books that go even darker."',
      '"If your wife is out of Lisa Jewell, here\'s exactly what to hand her next."',
      '"Five thrillers that earn their twist. Save this for your next bookstore trip."',
      '"The thriller every husband should read so they understand what their wife is talking about."',
    ]},
    { cat: 'Husband Angle', items: [
      '"My wife\'s been telling me to read this for 8 months. I finally did. I owe her an apology."',
      '"Things my wife says about thriller books that I now understand."',
      '"POV: it\'s 1am, my wife is asleep, and I just hit the twist."',
      '"I\'m a man and I read domestic suspense. Here\'s why you should too."',
      '"Books my wife made me read, ranked."',
      '"My wife\'s TBR pile is now my TBR pile. We need to talk about that."',
    ]},
    { cat: 'Conversation', items: [
      '"Rank these thriller endings worst to best. I\'ll go first."',
      '"Pick one: read every Freida McFadden, or every Alice Feeney. You can never read the other."',
      '"Which thriller has the worst ending of all time? My pick is going to make you angry."',
      '"What\'s a thriller everyone loves that you secretly hated?"',
    ]},
  ];

  const hashtags = [
    { label: 'Set A — Broad reach',
      tags: '#bookstagram #booktok #booksbooksbooks #bookstagrammer #thrillerbooks #bookrecommendations #currentlyreading #bookworm #bibliophile #bookreview' },
    { label: 'Set B — Thriller niche',
      tags: '#thrillerbookstagram #psychologicalthriller #domesticsuspense #thrillerreader #mysterybooks #suspensebooks #darkthriller #booksthatkeepyouupallnight #plottwist #unputdownable' },
    { label: 'Set C — Author / book-specific (rotate)',
      tags: '#freidamcfadden #lisajewell #alicefeeney #thehousemaid #verity #thelastthinghetoldme #ruthware #karinslaughter #sharilapena #thewifebetweenthem' },
    { label: 'Set D — Husband / male reader (your territory)',
      tags: '#menreadtoo #husbandreads #booksformen #malebookstagrammer #booksformenwhoread #thrillerhusband #marriedreader #husbandscorner' },
  ];

  return `
<div class="sp-section">
  <div class="sp-h3">Hook <em>library</em></div>
  <p class="sp-p">First 1.5 seconds is 80% of performance. <strong>Tap any hook to copy it.</strong></p>
  ${hooks.map(({ cat, items }) => `
    <div class="sp-h4">${cat}</div>
    ${items.map(h => `<div class="sp-hook" onclick="copySpText(this)" title="Tap to copy">${h}</div>`).join('')}
  `).join('')}

  <div class="sp-h3" style="margin-top:36px">Hashtag <em>library</em></div>
  <p class="sp-p"><strong>Per-post recipe:</strong> 5–7 from Set A + 5–7 from Set B + 2–3 from Set C + 2–3 from Set D = ~17 hashtags. Never use the exact same set twice in a row. <strong>Tap any set to copy it.</strong></p>
  ${hashtags.map(({ label, tags }) => `
    <div class="sp-h4">${label}</div>
    <div class="sp-hashtag-set" onclick="copySpText(this)" title="Tap to copy">${tags}</div>
  `).join('')}
</div>`;
}

// ── Copy helper ───────────────────────────────────────────────────
function copySpText(el) {
  const text = el.textContent.trim();
  if (!navigator.clipboard?.writeText) return;
  navigator.clipboard.writeText(text).then(() => {
    const prev = el.innerHTML;
    el.textContent = '✓ Copied!';
    el.classList.add('sp-copied');
    setTimeout(() => { el.innerHTML = prev; el.classList.remove('sp-copied'); }, 1600);
  }).catch(() => {});
}
