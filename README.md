# Chilling Pages — Content Calendar

A 10-month Bookstagram & BookTok content calendar for horror and thriller book accounts.

**Live site:** https://mriverosbil31.github.io/bookagram_calendar

---

## Features

- 10-month content strategy from launch to year-end wrap-up
- 4 posts per week across Instagram and TikTok
- Instagram Stories concepts woven into every week
- Fully responsive — works on mobile, tablet, and desktop
- Dark editorial aesthetic matching the horror/thriller niches

## Project structure

```
bookagram_calendar/
├── index.html        # Main HTML shell
├── css/
│   └── styles.css    # All styles and responsive rules
├── js/
│   ├── data.js       # All 10 months of calendar content
│   └── app.js        # Rendering logic and navigation
├── assets/           # Images and icons (add your own)
└── README.md
```

## Local development

No build step needed. Just open `index.html` in your browser:

```bash
# Clone the repo
git clone https://github.com/mriverosbil31/bookagram_calendar.git
cd bookagram_calendar

# Open directly
open index.html

# Or serve locally (optional)
npx serve .
```

## Deploy to GitHub Pages

### Option A — GitHub UI (easiest)

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under *Source*, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be live at `https://mriverosbil31.github.io/bookagram_calendar` in ~1 minute

### Option B — Push from terminal

```bash
git clone https://github.com/mriverosbil31/bookagram_calendar.git
cd bookagram_calendar

# Copy these project files in, then:
git add .
git commit -m "Initial calendar site"
git push origin main
```

Then enable GitHub Pages via Settings → Pages as above.

---

## Customisation

- **Content:** Edit `js/data.js` to change post ideas, titles, or add months
- **Colours:** Edit the CSS variables at the top of `css/styles.css`
- **Branding:** Change the logo text in `index.html` and the footer quote

## Built with

- Vanilla HTML, CSS, JavaScript — no frameworks or dependencies
- [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) via Google Fonts
