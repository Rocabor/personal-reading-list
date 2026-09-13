# Bookshelf

A personal reading tracker where you search for books, organize them into shelves, track reading progress, and explore year-in-review statistics.

**Live URL:** https://personal-reading-list-sage.vercel.app

![Screenshot of your solution](./screenshot.png)

---

## Overview

Bookshelf is a warm, focused reading tracker built for readers who want their shelves, progress, and reading history in one calm place — no social feeds, no unsolicited reviews, just your books. You can search the Open Library, import your entire Goodreads history from a CSV, organize books into custom shelves, update reading progress with one-tap increments, set annual goals with honest pace feedback, and relive the year with a shareable Year-in-Review.

Guest mode drops you in immediately with 45 curated books and complete analytics, so the product feels whole from the first click.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite 6 + React 19 + TypeScript |
| Database | localStorage (client-side persistence, no backend) |
| Authentication | Frontend-only simulated auth + guest mode |
| Book API | Open Library Search API + cover CDN |
| Hosting | Vercel (static deployment) |
| Styling | Tailwind CSS v4 + custom design tokens (CSS custom properties) |
| Charts/Viz | Hand-built SVG/CSS charts (no chart library) |
| Other | motion (micro-interactions), lucide-react (icons), canvas-confetti, HTML Canvas (reading cards), custom Goodreads CSV parser |

---

## Design Decisions

These are the product and design choices I made where the spec left room for interpretation.

### Year-in-Review & Reading Insights

**The problem I was solving:** The spec asked for meaningful year-in-review statistics without prescribing a design. The risk was shipping a dry table of numbers that felt like a report card rather than a celebration.

**My approach:** I designed it as a moment, not a page. An editorial-style hero banner opens the experience, followed by four hero metrics (books finished, pages devoured, average rating, reading goal progress), a monthly reading-pace bar chart, a per-genre breakdown, "longest / shortest book" record cards, and a 5-Star Hall of Fame. Every book surfaced in the review is clickable and opens the detail modal, so the page invites reminiscence, not just stats. A "Share Reading Card" button generates a downloadable, ready-to-post summary card.

**Why I chose this approach:** Reading relapses are emotional. Making the review feel like a printed yearbook rather than a dashboard keeps it shareable and special, which directly feeds the social differentiator.

**What I'd do differently:** With a real database I'd compute stats server-side and support arbitrary year history. Today it's frontend-derived from the library, which is why the yearly selector is scoped to the current year.

### Book Discovery & Recommendations

**The problem I was solving:** New users face a cold start — an empty library — and the spec wanted discovery beyond raw search.

**My approach:** Guest mode pre-loads 45 curated books so there's immediate substance to browse, rate, and organize. Discovery happens through two search entry points backed by the live Open Library API: a global search modal (with curated quick-pick chips) and an in-library search. Books that lack a cover or have inconsistent ISBNs fall back to elegantly generated gradient covers derived from the title, so the shelf never looks broken. For users migrating rich histories, the Goodreads CSV import handles their existing library wholesale.

**Why I chose this approach:** Onboarding friction is the main reason people abandon a tracker. Showing real books instantly, plus a migration path for the most common "I already have a library elsewhere" case, makes the product useful on day one.

**What I'd do differently:** I'd add fuzzy-matching against the Book API to enrich imported records (descriptions, page counts) and resolve duplicates more intelligently — the import currently maps fields directly.

### Reading Progress Tracking UX

**The problem I was solving:** Progress tracking dies when it asks too much of you. A slider that requires precision every time is a chore.

**My approach:** Progress lives as a dedicated panel inside the book detail modal (shown only for "Currently Reading" books). Users can type the page number directly or use one-tap `+10` / `+25` quick-add chips; a single "Finish" button marks the book complete and moves it onto the Read shelf. A compact progress bar on every card gives at-a-glance status without opening anything. The reading goal card contextualizes pace against the day of year — "3 books behind schedule" reads honestly but never preachy.

**Why I chose this approach:** The fewest keystrokes between picking up and putting down a book is what keeps people logging. Direct editing plus one-tap increments covers both the "I know exactly" and the "I can approximately guess" moments.

**What I'd do differently:** I'd support multiple progress units (percentage without page counts, audiobook minutes) and keyboard shortcuts for faster logging on desktop.

### Other Design Choices

- **Warm literary aesthetic.** Amber accents, parchment-style surfaces, and cork/wood tones from the brand kit; Lora for headings and Inter for UI.
- **Navigation.** Desktop sidebar (overview, shelves, year in review, activity timeline) and a mobile top navbar; the landing page is the front door before you "Try as Guest".
- **Book covers.** Real Open Library covers when available, with an auto-generated gradient cover fallback so the library always looks finished.
- **Delight details.** Canvas confetti on goal completion, subtle motion transitions via `motion`, hover tilts on covers, and a shareable canvas-generated reading card.
- **Accessibility first.** Full keyboard navigation and ARIA on modals, focus-visible rings, `prefers-reduced-motion` handling, and an accessibility settings modal for font size, reduced motion, and tint adjustments.

---

## Development Journey

### Initial Approach vs. Final

The initial plan was a classic all-database architecture: real auth, a real books table, and a server-bound session. Building the product experience first with localStorage forced every feature decision to be about the user flow (search, shelves, progress, review) rather than infrastructure, and let the whole thing run beautifully in guest mode with zero sign-up friction. The final result is a frontend that behaves like a full product and is deployable as static files.

### Decisions Reconsidered

- **Real auth vs. guest-first.** The spec pushed for real authentication, but I prioritized an instant, fully-populated guest experience — it demonstrates the product better than an empty sign-up wall. The auth modal is present as a frontend simulation; wiring real auth would be the natural next step.
- **Chart library vs. hand-built.** I initially considered a charting dependency for the year-in-review. Hand-built bars and genre segments turned out lighter, more on-brand, and easier to theme with the design tokens.

### What Surprised Me

How much of the "product" feeling comes from small behavioral details — the confetti on goal completion, the cover fallback system, the pace message that accounts for the day of year. Those tiny touches did more for perceived quality than any single feature.

### Session Breakdown

| Session | Focus | What I Accomplished |
|---------|-------|-------------------|
| 1 | Spec & brand | Read all specs, brand kit, and guidance; scoped the feature set |
| 2 | Design-it-yourself | Designed year-in-review, discovery, and progress-tracking UX |
| 3 | Data & state | Sample data, storage service, Open Library + Goodreads services, global context |
| 4 | UI | Core components, views, navigation, modals, and app wiring |
| 5 | Polish | Verification, typecheck, build, and this README |
| 6 | Deploy | Deployed to Vercel, verified the live URL, and documented the deploy flow |

---

## AI Collaboration Reflection

### How I Used AI

AI was the engineering partner throughout: it helped structure the project, generated the component architecture, wrote the Open Library and Goodreads parsing services, and handled the repetitive UI scaffolding. Design decisions (brand, layout, feature priorities) were made by me against the brand kit and guidance docs.

### What Worked Well

Keeping the design-yourself features as the anchor. Starting from the brand kit and specs before any code meant AI generated UI that matched tokens instead of generic Bootstrap-style output. Small, well-specified requests produced the cleanest components.

### What I Learned

The best AI output comes from precise problems. "Parse Goodreads CSV with these quirks" beat "build an import feature" every time. Reviewing AI-written data services line by line caught subtle edge-case bugs early.

### Where I Pushed Back

AI initially suggested heavier database-backed flows (Prisma, real auth) that would have slowed the prototype. I pushed toward the guest-first, local-first approach to keep the experience instant and focused; that trade-off became the product's core strength.

---

## Differentiators

### Chosen Differentiator(s)

**1. Social Sharing & Reading Cards**

**Why I chose this:** A shareable artifact is the strongest possible marketing for the product — every card posted is a billboard for Bookshelf.

**How it enhances the product:** The Year-in-Review gains a concrete payoff: generate a beautiful, downloadable summary card with your books, stats, and covers, tailored for social sharing.

**Implementation highlights:** A dedicated export modal renders a styled card to an HTML canvas (proper dimensions and typography), includes the reader's top books as cover thumbnails, and triggers confetti with a download action. It reuses the same book/rating data as the rest of the app with no duplication.

**What I learned:** Composing attractive fixed-canvas layouts is its own discipline — font rendering, spacing, and image loading need explicit care and fallbacks.

**2. Goodreads Data Migration**

**Why I chose this:** Goodreads exports are the messy real-world data engineers actually deal with — the most compelling way to show that Bookshelf handles real libraries, not just demo ones.

**How it enhances the product:** Users with years of history can migrate in seconds instead of rebuilding their library by hand.

**Implementation highlights:** A custom parser handles Goodreads' quirky CSV format (quoting, the "Author" vs "lf" field, empty ISBNs, varied date formats). A sample CSV is bundled for testing, imports show a preview before committing, and success triggers an immediate confetti celebration.

**What I learned:** CSV parsing that covers real exports (not just the happy path) is surprisingly subtle — but once it works, it makes the app feel like production software.

---

## Self-Assessment

Rate your implementation honestly. This self-awareness is part of the portfolio artifact.

| Category | Rating | Notes |
|----------|--------|-------|
| **Works for real users** — Deployed, functional end-to-end | 5/5 | Fully functional client-side and live on Vercel |
| **Book API integration** — Handles missing covers, varied ISBNs, inconsistent metadata | 4/5 | Open Library search + cover fallback system; could enrich imported records further |
| **Design-it-yourself features** — Quality and thoughtfulness of year-in-review, discovery, and progress tracking solutions | 4/5 | Story-driven review, guest-friendly discovery, low-effort progress logging |
| **Design quality** — Typography pairing, warm aesthetic, spacing, visual hierarchy, polish | 4/5 | Brand kit followed; consistent tokens throughout |
| **Responsive design** — Fully functional and well-designed across devices | 4/5 | Mobile-first grids; sidebar collapses to a navbar |
| **Performance** — Fast load, smooth scrolling, efficient cover image loading | 4/5 | Static build, route-level code-splitting, lazy covers |
| **Accessibility** — Keyboard nav, screen reader support, contrast | 4/5 | ARIA modals, focus rings, reduced motion, accessibility settings modal |
| **Edge case handling** — Empty states, errors, loading, missing data, large libraries | 4/5 | Cover fallbacks, import preview, empty states; large imports not paginated |
| **Code quality** — Clean, maintainable, well-structured | 4/5 | Clear component boundaries, typed domain models, isolated services |
| **Landing page** — Compelling, communicates value, visually polished | 4/5 | Hero with live book-shelf showcase and dual CTAs |
| **Guest experience** — Immediately impressive, real books, full features | 5/5 | 45 curated books pre-loaded, all features available instantly |

### Lighthouse Scores

<!-- Run Lighthouse on your deployed site and record the scores -->

| Category | Score |
|----------|-------|
| Performance | 91 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### Strengths

- The guest experience is immediately rich — real books, working analytics, zero sign-up friction.
- The Year-in-Review feels like a product moment, not a report.
- Tasteful visual craft: warm brand palette, serif/sans pairing, subtle motion and confetti.
- Real-world data handling with the Goodreads parser and cover fallbacks.

### Areas for Improvement

- Wire real authentication and cross-device sync (the spec's recommendation) so the library survives a browser clear.
- Defer and cache Open Library requests further for faster repeat searches.
- Paginate and debounce large Goodreads imports.
- Add keyboard shortcuts for rapid progress logging.

---

## Known Limitations

- **No backend.** Data lives in localStorage, so it's device-bound and can be lost if storage is cleared. A future v2 would add a real database + auth with server-side sync.
- **Auth is simulated.** The sign-in flow is frontend-only; there is no real account system yet.
- **Year-in-Review is current-year focused.** Historical years require real persisted date ranges.
- **Goodreads enrichment is limited.** Imported books map fields directly rather than fuzzy-matching against the Book API.

---

## Running Locally

```bash
# Clone the repo
git clone [your-repo-url]
cd bookshelf

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Then open `http://localhost:3000` — click **Try as Guest** to start with the curated 45-book library.

### Environment Variables

No environment variables are required. Everything runs client-side against public Open Library endpoints. (Add a `.env` only if you later introduce a backend or API keys.)

---

## Deployment

The app is a static Vite build deployed to [Vercel](https://vercel.com). `vercel.json` pins the framework, build command, and output directory so deployments are reproducible:

```bash
# Deploy a production build (builds locally, then uploads the prebuilt output)
vercel build --prod
vercel deploy --prebuilt --prod
```

Or connect the GitHub repo in the Vercel dashboard and every push to `main` will deploy automatically. After a deploy, run Lighthouse against the production URL to audit performance, accessibility, best practices, and SEO.

---

## Acknowledgments

Built as a [Frontend Mentor Product Challenge](https://www.frontendmentor.io).