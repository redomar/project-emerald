> **Product brief**, refined from the first ideas list (18 Oct 2026). Where it differs from what gets built, **[decisions.md](decisions.md) wins**. Visuals: [design/](../design/README.md).

# Project Emerald: brief

One place for the brothers to see **who is building what, what they shipped, and what they learned**. It must feel friendly and simple (closer to a community app than to GitHub), and people who don't code must be able to take part too.

**One responsive website.** On a phone it's the same site in the mobile browser, laid out for a small screen with a bottom tab bar. There is no separate native app for now. (It can be made installable to the home screen later without changing this.)

```yaml
project:
  name: Project Emerald # working name
  objective: Show what members are building and have built, and capture what they learned, so others can learn from it.
  users:
    - builders: members shipping apps (most content)
    - non-tech members: read, share articles, ask questions, vote
    - organiser (Mohamed): runs Project of the Month, moderates
  principles:
    - Friendly, not GitHub: plain language, big cards, no repo jargon on the surface
    - Low effort: connect GitHub once; the rest syncs itself
    - Human words: learnings are written by the member, not generated
    - Reward helping and consistency, not raw volume
  non_goals:
    - Mohamed's calendar / availability / on-call booking (separate app; Emerald only links to it)
    - Replacing GitHub for code review or issues
    - Public sign-up (members are invited)
```

## Core: what we are building / built, and the learning

| # | Feature | Refined |
|---|---|---|
| 1 | **Builders directory** | Everyone in one grid: initials avatar, what they're building now, top stack chips, badges. Filter by stack or "has a launched app". |
| 2 | **Profiles** | Active projects, completed projects, learnings written, badges, weekly streak. |
| 3 | **Project page** | Status (*Building · Launched · Completed*), **Open app** button when public, GitHub link, tech stack chips, **What I learned** (techniques used, what went wrong, what they'd do differently), recent updates synced from GitHub, and an **AMA** tab. |
| 4 | **Knowledge base ("Learn")** | A **card grid** (fixed-height cards, 4 across on desktop, 2 on a phone) so many items fit on one screen without scrolling past the 7th. Four kinds: **learnings** and **opinions** written by members, and shared **articles** and **videos**. Learnings can attach **sources** (links and videos) they drew on. Tabs by kind, chips by topic. |
| 5 | **Snippet library** | Quick-copy boilerplate, hooks, utils. One-tap copy, language + tag filter, "copied 23×" counter. |
| 6 | **Project AMAs** | Q&A thread on launched/completed projects. The builder (or anyone) answers; the asker marks an answer **Helpful**. |

## Engagement

| # | Feature | Refined |
|---|---|---|
| 7 | **Weekly leaderboard** | Resets Monday. Points come from the table below; shows the breakdown so it's clear why someone is top. |
| 8 | **Milestone badges** | Permanent: *First App Launched*, *Helped 5 Bros*, *4-Week Streak* (consecutive weekly contributor), *First Learning*, *Snippet Smith*, *Newshound*, *Project of the Month*. |
| 9 | **Project of the Month** | Big spotlight card on Home. Members nominate, organiser picks (or a quick vote). Winner keeps a permanent badge. |
| 10 | **Non-tech contributions** | Share an article or video with a one-or-two line take in your own words. Each share has its own page with **comments** (anyone) and **insights** (only the sharer, added later: "tried it, here's what happened"). Sharing, commenting and getting comments all count toward the weekly score. |
| 11 | **Who's around (Home)** | A presence card: **Online now** (active in the last 5 min), **Last 2 hours** (with "25 min ago"), **Inactive**. The same dot shows on avatars across the site, always with a text label somewhere (not colour alone). Members can hide their status. |
| 12 | **Voice dictation (later)** | Not in v1, but every longer text field (learning prompts, your take, comments, AMA questions and answers) is designed with a mic button in the corner and a "Listening" state, so it drops in later. Dictated text counts as the member's own words and never triggers the paste check. |

### Points (draft, tune after a month)

| Action | Points | Guard |
|---|---|---|
| Launch a project (public app link works) | 50 | once per project |
| Write a learning | 15 | min ~80 words |
| Answer marked **Helpful** | 10 | counts toward *Helped 5 Bros* |
| Answer an AMA question | 5 | |
| Add a snippet | 5 | +1 each time someone else copies it, max 10/week |
| Share an article or video (with your take) | 5 | max 3/week |
| Add an insight to your own share | 3 | max 2 per share |
| Comment on a post | 2 | max 10/week; very short comments ("nice") don't count |
| Someone else comments on your share | 1 | max 10/week; your own replies don't count |
| Active coding day on a linked repo | 3 | max 15/week: rewards consistency, not commit spam |

## "Low-effort" GitHub sync

Sign in with GitHub, tick the repos to show. Emerald then pulls name, description, languages (→ stack chips), README first paragraph, homepage URL (→ **Open app**), and recent commit days (→ updates + activity points). Nothing is pushed back to GitHub. Private repos can be listed without exposing code.

## "Written by the member, not AI"

No AI detector can prove this reliably, and false positives would accuse people unfairly. Instead:

1. Learnings are written in Emerald's own editor; each post shows **Written here**.
2. A large paste triggers a gentle check: *"Is this in your own words?"* with **Yes, it's mine** / **Let me rewrite**.
3. Authors tick a one-line pledge when they publish.
4. Members can flag a post; the organiser reviews.

## Open questions

- Who can join? Invite-only by Mohamed, or any existing member can invite?
- Project of the Month: organiser pick, member vote, or both?
- Should the leaderboard be visible to everyone, or only your own rank plus the top 5?
- Presence: is "last seen" OK for everyone by default (with an opt-out), or opt-in?
- Dictation: browser speech recognition (free, quality varies) or a paid transcription API?
- Hosting and stack (see [decisions.md](decisions.md)).
