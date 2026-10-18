# Project Emerald

> Working name. Rename the repo and this heading once the real name is agreed.

One place for the brothers to see who is building what, what they shipped, and what they learned. Friendly, not GitHub. One responsive website: on phones it's the same site in the browser. See the [brief](docs/product-brief.md) and the [design previews](design/README.md).

**Stack (provisional, decision #12):** Vite + React 19 + TypeScript, plain CSS with design tokens, Vitest + Playwright. **No backend yet:** data lives in the browser (localStorage) behind one store module (`src/data/store.ts`), seeded with demo data. Swapping that module for a real backend is the next big decision.

**New here? Start with [CONTRIBUTING.md](CONTRIBUTING.md).**

| Doc | For |
|---|---|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setting up, running, testing, deploying, access |
| [docs/product-brief.md](docs/product-brief.md) | The refined brief (superseded where decisions differ) |
| [design/](design/README.md) | Storyboards, wireframes, UI preview |
| [docs/decisions.md](docs/decisions.md) | What was agreed and why |
| [docs/architecture.md](docs/architecture.md) | How it works, folder map |
| [docs/status.md](docs/status.md) | What's done, what's next |
| [CHANGELOG.md](CHANGELOG.md) | What changed in each version |

## How we work

- **Never commit straight to `main`.** Branch (`feature/…`, `fix/…`), open a PR, merge when it's reviewed.
- **[Semantic Versioning](https://semver.org/)** (`MAJOR.MINOR.PATCH`), starting at `0.x` until the first real release:
  - **PATCH** (0.1.0 → 0.1.1): bug fixes, nothing new for users.
  - **MINOR** (0.1.0 → 0.2.0): a new feature or screen, backwards compatible.
  - **MAJOR** (0.x → 1.0.0, 1.x → 2.0.0): a breaking change (data, URLs, how people use it). 1.0.0 is the first launch to members.
- Every PR adds a line under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md). Releases are tagged `vX.Y.Z`. Full steps: [CONTRIBUTING.md](CONTRIBUTING.md#5-versioning-and-releases).
- Plain commit messages, no `Co-Authored-By` trailers.

## Develop

```sh
pnpm install
pnpm dev             # the app at http://localhost:4400 (also on your phone via the Network URL)
pnpm test            # points engine + store tests
pnpm typecheck && pnpm build
pnpm preview --port 4455 & pnpm e2e   # browser run-through of every flow (first time: pnpm exec playwright install chromium-headless-shell)
pnpm design:serve    # the static design prototype (design/src) at :4400
pnpm design:render   # rebuild the design PNGs (see design/README.md)
```

**You're the admin.** Click your avatar (top right) for Settings: edit your profile, hide your online status, pick Project of the Month, **view the site as another member** (to try sharer-only insights or marking answers helpful), export/import JSON, **reset to the demo data**, or **delete all data** (type DELETE).

### What works

Everything in the brief, end to end: builders and profiles, projects (manual or **imported from GitHub** by username), launch/status, What I learned, updates, AMA with answers, Helpful and save-as-snippet, Learn grid (learnings, opinions, articles, videos with YouTube embeds, sources), comments and replies, sharer insights, likes, snippets with one-tap copy, the weekly/monthly/all-time leaderboard computed from a contribution log with caps, 8 badges, notifications, search, presence (online · last 2 hours · inactive), the paste check and pledge, and **voice dictation** in longer text fields (browser speech recognition: Chrome, Edge, Safari).

### Folder map

| Path | What |
|---|---|
| `src/data/types.ts` | The data model |
| `src/data/points.ts` | Points table, caps, standings, streaks, badges (pure, tested) |
| `src/data/store.ts` | State, every action, persistence: the seam for a real backend |
| `src/data/seed.ts` | Demo data, relative to "now" |
| `src/pages/` · `src/components/` | Screens and shared UI |
| `tests/` | Vitest unit/integration tests |
| `scripts/e2e.mjs` | Playwright run-through used by CI |
| `design/` | Storyboards, wireframes, static prototype |
