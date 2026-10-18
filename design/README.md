# Design: Project Emerald

First-pass visuals for the [product brief](../docs/product-brief.md). Open the PNGs directly, or open `src/prototype.html` in a browser to click through.

## Storyboards: four journeys from the brief

| | |
|---|---|
| [01-discover](storyboards/01-discover.png) | A newer member finds who's building what, opens an app, asks the builder |
| [02-ship-and-share](storyboards/02-ship-and-share.png) | A builder connects GitHub once, launches, writes a learning (with the own-words check) |
| [03-non-tech](storyboards/03-non-tech.png) | A non-tech member shares an article with his take and lands on the leaderboard |
| [04-help-a-bro](storyboards/04-help-a-bro.png) | Answer → Helpful → badge → saved as a snippet others copy |

## Wire diagrams + wireframes

| | |
|---|---|
| [01-sitemap](wireframes/01-sitemap.png) | Information architecture: 6 sections + global ＋ Add |
| [02-flows](wireframes/02-flows.png) | Add project, write learning, AMA, and the points engine |
| [03-home](wireframes/03-home.png) · [04-project](wireframes/04-project.png) · [05-builders-profile](wireframes/05-builders-profile.png) · [06-learn-snippets](wireframes/06-learn-snippets.png) | Annotated desktop screens |
| [07-mobile](wireframes/07-mobile.png) | Phone layout with bottom tab bar |

## UI preview (hi-fi, mock data)

Desktop: [home](preview/01-home.png) · [builders](preview/02-builders.png) · [profile](preview/03-profile.png) · [project](preview/04-project.png) · [AMA](preview/05-project-ama.png) · [learn](preview/06-learn.png) · [snippets](preview/07-snippets.png) · [leaderboard](preview/08-leaderboard.png) · [＋ Add / share article](preview/09-share.png) · [write a learning](preview/10-write-learning.png)

Mobile: [home](preview/11-mobile-home.png) · [project](preview/12-mobile-project.png) · [AMA](preview/13-mobile-ama.png) · [learn](preview/14-mobile-learn.png) · [leaderboard](preview/15-mobile-leaderboard.png) · [＋ Add sheet](preview/16-mobile-share.png)

**Direction:** warm ivory + emerald + gold, Bricolage Grotesque (display) + Manrope (body), the same family as the Hackthathon. No photos: initials avatars and generated covers. Plain language everywhere ("Open app", "What I learned"), not GitHub vocabulary.

## Regenerate

```sh
pnpm install
pnpm exec playwright install chromium-headless-shell   # first time only
pnpm design:render              # all, or: storyboards | wireframes | preview
```

Sources are in `src/` (plain HTML, shared tokens in `src/tokens.css`). Names, projects and numbers are mock data.
