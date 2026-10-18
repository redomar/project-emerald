# Design: Project Emerald

First-pass visuals for the [product brief](../docs/product-brief.md). Open the PNGs directly, or open `src/prototype.html` in a browser to click through.

## Storyboards: four journeys from the brief

| | |
|---|---|
| [01-discover](storyboards/01-discover.png) | A newer member finds who's building what, opens an app, asks the builder |
| [02-ship-and-share](storyboards/02-ship-and-share.png) | A builder connects GitHub once, launches, writes a learning (with the own-words check) |
| [03-non-tech](storyboards/03-non-tech.png) | A non-tech member shares an article, gets comments, adds an insight, and earns engagement points |
| [04-help-a-bro](storyboards/04-help-a-bro.png) | Answer → Helpful → badge → saved as a snippet others copy |

## Wire diagrams + wireframes

| | |
|---|---|
| [01-sitemap](wireframes/01-sitemap.png) | Information architecture: 6 sections + global ＋ Add |
| [02-flows](wireframes/02-flows.png) | Add project, write learning, AMA, and the points engine |
| [03-home](wireframes/03-home.png) · [04-project](wireframes/04-project.png) · [05-builders-profile](wireframes/05-builders-profile.png) · [06-learn-snippets](wireframes/06-learn-snippets.png) | Annotated desktop screens |
| [07-mobile](wireframes/07-mobile.png) | Mobile web: the same site in a phone browser, bottom tab bar |

## UI preview (hi-fi, mock data)

Desktop: [home](preview/01-home.png) · [builders](preview/02-builders.png) · [profile](preview/03-profile.png) · [project](preview/04-project.png) · [AMA](preview/05-project-ama.png) · [learn grid](preview/06-learn.png) · [article + comments](preview/07-article.png) · [snippets](preview/08-snippets.png) · [leaderboard](preview/09-leaderboard.png) · [＋ Add / share a link](preview/10-share.png) · [write a learning](preview/11-write-learning.png)

Mobile web (the same site in a phone browser, not a separate app): [home](preview/12-mobile-home.png) · [project](preview/13-mobile-project.png) · [learn](preview/14-mobile-learn.png) · [article](preview/15-mobile-article.png) · [leaderboard](preview/16-mobile-leaderboard.png) · [＋ Add sheet](preview/17-mobile-share.png)

What to look for:
- **Home:** "Who's around" (online · last 2 hours · inactive) and presence dots on avatars.
- **Learn:** fixed-height card grid with learnings, opinions, articles and videos; 8 cards above the fold on a laptop.
- **Article:** the sharer's take, their later **insights**, **comments**, and what the post earned in engagement points.
- **Dictation (later):** the mic in text fields, and the red "Listening" state on *write a learning* and the article comment box.

**Direction:** warm ivory + emerald + gold, Bricolage Grotesque (display) + Manrope (body), the same family as the Hackthathon. No photos: initials avatars and generated covers. Plain language everywhere ("Open app", "What I learned"), not GitHub vocabulary.

## Regenerate

```sh
pnpm install
pnpm exec playwright install chromium-headless-shell   # first time only
pnpm design:render              # all, or: storyboards | wireframes | preview
```

Sources are in `src/` (plain HTML, shared tokens in `src/tokens.css`). Names, projects and numbers are mock data.
