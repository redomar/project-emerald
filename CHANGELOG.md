# Changelog

All notable changes to Project Emerald. Versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **The app (v0.2.0, provisional stack):** a working, interactive build of every feature in the brief, with demo data: builders, profiles, projects (manual or imported from GitHub), launch and status, What I learned, updates, AMA with Helpful and save-as-snippet, the Learn grid (learnings, opinions, articles, videos with YouTube embeds, sources), comments and replies, sharer insights, likes, snippets with one-tap copy, the weekly/monthly/all-time leaderboard, 8 badges, notifications, search, presence, the paste check and pledge, and voice dictation where the browser supports it.
- **Settings (click your avatar):** profile, hide online status, non-tech toggle; admin: Project of the Month, view as another member, export/import JSON, reset to demo data, delete all data.
- Tests for the points engine and store (`pnpm test`), a Playwright run-through of every flow (`pnpm e2e`), and CI.
- Refined product brief: scope, points table, GitHub sync, the "own words" approach, open questions.
- Design pass: 4 storyboards, sitemap + flow diagrams, 5 annotated wireframes, and a clickable hi-fi prototype with 16 rendered screens (desktop + mobile) under `design/`.
- `pnpm design:render` to regenerate the design images.
- `pnpm design:serve` serves the static design prototype; `pnpm dev` now runs the app.
- Semantic Versioning and branch/PR rules in the README and CONTRIBUTING.
- Design: comments and sharer insights on shared articles/videos, with engagement points; "Who's around" presence on Home; Learn as a card grid with videos and sources; voice dictation slots on longer text fields (marked as later).
- Design: new article detail screen (desktop + mobile web).

### Changed

- Mobile designs are labelled "mobile web": the same website in a phone browser, not a separate app.
- "Share an article" is now "Share a link" (article or video).
