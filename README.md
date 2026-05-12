# Portfolio Website — Xing Yu Chen

A single-page portfolio plus a universal project-detail page. Vanilla HTML/CSS/JS,
zero hardcoded content — everything is driven from JSON files in `data/`.

```
portfolio_website/
├── index.html               ← homepage
├── project.html             ← universal detail page (?id=…)
├── styles.css
├── main.js
├── assets/
│   └── profile.jpg          ← portrait
└── data/
    ├── profile.json         ← name, bio, contact, taglines, stats
    ├── projects.json        ← all projects (drives cards + detail pages)
    ├── experience.json      ← work / team experience timeline
    ├── skills.json          ← skill groups
    ├── education.json       ← education
    ├── xing_chen_resume.pdf ← downloadable + embedded resume
    └── *.pdf                ← source reports referenced by projects
```

## Running locally

The site loads JSON via `fetch()`, which browsers block when the page is opened via
`file://`. Run a local server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any equivalent works (`npx serve`, VS Code Live Server, etc.).

## Swapping in your content

Everything you'd want to change is in `data/`:

- **`data/profile.json`** — your name, title, bio, taglines (the hero cycles
  through them), contact links, and stats. The hero, footer, About section,
  and Contact section all rebuild from this file.
- **`data/projects.json`** — array of projects. Each entry drives one card on
  the homepage and one rendered detail page at `project.html?id=<your-slug>`.
  The filter tabs are built automatically from whatever categories appear in
  the file.
- **`data/experience.json`** — timeline entries for the Experience section.
- **`data/skills.json`** — keys become section headings, values become pills.
- **`data/education.json`** — currently a record-only file (the resume embed
  shows education detail from the PDF).

### Project schema

```jsonc
{
  "id": "kebab-case-slug",        // used in project.html?id=…
  "title": "Project Title",
  "summary": "One sentence for the card and the detail-page lede.",
  "description": "Markdown-lite. Use `## Heading` and blank lines for paragraphs.",
  "category": "Design",            // becomes a filter tab automatically
  "subcategory": "Capstone",       // optional, shows in detail meta
  "year": "2026",
  "dateRange": "January 2026 – June 2026",
  "role": "What you did",
  "team": "Optional team line",
  "client": "Optional client",
  "course": "Optional course",
  "advisors": "Optional advisors",
  "tags": ["Pill", "Pill"],        // shown in detail hero
  "tools": ["Tool", "Tool"],       // shown in card + 'Tools & Methods'
  "highlights": [                  // 3-5 outcome bullets — shown in callout grid
    "Quantified result with real numbers.",
    "Another concrete outcome."
  ],
  "images": [                      // optional; missing → labelled placeholder tiles
    "data/your-project/cover.jpg",
    "data/your-project/01.jpg"
  ],
  "cover": "optional-explicit-cover-image.jpg",
  "links": {                       // any key/value pair; key becomes label
    "report": "data/your-report.pdf",
    "github": "https://github.com/…"
  }
}
```

## Design tokens

All colors, spacing, fonts live as CSS custom properties at the top of
`styles.css`:

- `--c-accent` — burnt orange. Try `#1B3A5C` (navy) or `#3A5A40` (forest)
  to retheme the whole site.
- `--c-bg`, `--c-ink` — page background and ink color.
- `--f-display` / `--f-body` / `--f-mono` — Space Grotesk + Fraunces +
  JetBrains Mono, pulled from Google Fonts.

## Features wired up

- Staggered hero reveal, cycling tagline
- Sticky nav with blur on scroll + active-section highlighting
- Filter tabs with a sliding pill
- Project cards with hover lift + "click to explore" overlay
- View Transitions API for card → detail navigation (graceful fallback)
- Universal detail page driven by `?id=…` with 404 state
- Image lightbox with keyboard nav (← → Esc)
- Custom cursor (desktop only, opt-in by media query)
- Resume PDF embedded + download button with pulse animation
- Contact form opens `mailto:` (swap for Formspree/etc. in `main.js`)
- Mobile responsive — single column, hamburger nav
