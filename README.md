# Portfolio Website — Xing Yu Chen

A single-page portfolio with a universal project-detail page. Vanilla HTML/CSS/JS,
no build step, fully data-driven from `data/*.json`. Designed to deploy on Vercel
as a static site.

```
portfolio_website/
├── index.html                ← homepage
├── project.html              ← universal detail page (?id=…)
├── styles.css
├── main.js
├── vercel.json               ← caching headers + cleanUrls
├── .gitignore  .vercelignore
├── README.md
├── assets/
│   ├── profile.jpg           ← portrait (web-optimized)
│   └── previews/
│       └── <project>.jpg     ← first-page PDF thumbnails for cards
├── data/
│   ├── profile.json          ← name, bio, taglines, contact, stats
│   ├── projects.json         ← all projects (drives cards + detail pages)
│   ├── experience.json       ← work / team experience timeline
│   ├── skills.json           ← grouped skills (rendered as bullet list)
│   ├── education.json        ← education record
│   ├── resume.pdf            ← embedded + downloadable resume
│   └── reports/
│       └── <project>.pdf     ← full report per project (embedded in detail page)
└── src/
    └── originals/            ← source files kept in repo, NOT deployed
```

## Deploying to Vercel

Two paths — both are free and take ~30 seconds.

### Option A — Vercel CLI

```bash
npm i -g vercel             # one-time
cd portfolio_website
vercel                      # follow prompts; pick "static site, no framework"
vercel --prod               # deploy to production URL
```

### Option B — Vercel dashboard

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new>, import the repo.
3. Framework Preset: **Other** · Build Command: *(empty)* · Output Directory: `.`
4. Click Deploy. Vercel will serve every file in the repo as-is.

The included `vercel.json` does three things automatically:

- `cleanUrls: true` — `/project.html?id=foo` is served at `/project?id=foo`.
- Long cache for static assets (CSS/JS/JPG/SVG/WOFF).
- Short cache for JSON (so swapping content takes effect within 5 min).
- PDF responses are served `Content-Disposition: inline` so they render in-browser.

Source files in `src/` (the HEIC original of the portrait) are listed in
`.vercelignore` so they don't ship to production.

## Running locally

The site loads JSON via `fetch()`, which browsers block when the page is opened via
`file://`. Use any static server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

`npx serve`, VS Code Live Server, etc. all work the same.

## Swapping in content

Everything you'd want to change lives in `data/`:

- **`data/profile.json`** — name, title, bio, taglines (the hero cycles through
  them), contact links, stats, and availability blurb shown in the Contact section.
- **`data/projects.json`** — array of project objects. Each entry drives one card
  on the homepage and one full detail page at `project.html?id=<your-slug>`.
- **`data/experience.json`** — timeline entries for the Experience section.
- **`data/skills.json`** — keys become group headings, arrays become bullet rows.
- **`data/education.json`** — education record (currently informational).
- **`assets/previews/<slug>.jpg`** — card thumbnail. To regenerate from a PDF:

  ```bash
  pdftoppm -jpeg -jpegopt quality=82 -r 110 -f 1 -l 1 \
    data/reports/your-project.pdf assets/previews/your-project
  # rename appended -1 / -01 suffix if needed
  ```

### Project schema

```jsonc
{
  "id": "kebab-case-slug",
  "title": "Project Title",
  "summary": "One sentence for the card + detail-page lede.",
  "description": "Markdown-lite. `## Heading` and blank-line paragraphs.",
  "category": "Design",            // becomes a filter tab automatically
  "subcategory": "Capstone",       // shown in detail meta
  "year": "2026",
  "dateRange": "January 2026 – June 2026",
  "role": "What you did",
  "team": "Optional team line",
  "client": "Optional client",
  "course": "Optional course",
  "advisors": "Optional advisors",
  "tags": ["Pill", "Pill"],
  "tools": ["Tool", "Tool"],
  "highlights": ["Quantified result.", "Another concrete outcome."],
  "cover":   "assets/previews/your-slug.jpg",  // card thumbnail
  "pdf":     "data/reports/your-slug.pdf",     // embedded on detail page
  "images":  ["data/your-slug/01.jpg", ...],   // optional gallery
  "links":   { "report": "data/reports/your-slug.pdf", "github": "https://…" }
}
```

## Theme

The whole site is reskinnable via CSS custom properties at the top of `styles.css`.
Two palettes ship by default (light + dark), driven by `data-theme` on `<html>`.

- `--c-accent` — burnt orange. Replace with `#1B3A5C` (navy) or `#3A5A40` (forest)
  to retheme.
- `--f-display` / `--f-body` / `--f-mono` — Space Grotesk + Fraunces +
  JetBrains Mono (Google Fonts).

The toggle in the nav swaps themes and persists via `localStorage`. A short
attention animation runs on the toggle until the visitor clicks it for the
first time.
