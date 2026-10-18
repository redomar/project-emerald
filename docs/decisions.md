# Decisions log

Where this differs from [product-brief.md](product-brief.md), this file wins.

| # | Decision | Why |
|---|---|---|
| 1 | **Working name "Project Emerald"** (18 Oct 2026). Repo `redomar/project-emerald`, private. | Placeholder until the real name is agreed. |
| 2 | **Semantic Versioning, `0.x` until launch** (18 Oct 2026). 1.0.0 = first launch to members. Every PR updates `## [Unreleased]`; releases are tagged `vX.Y.Z` with a GitHub release. | Several people now push; versions and the changelog say what changed and whether it breaks anything. |
| 3 | **Feature branches + PRs only**, no direct pushes to `main` (18 Oct 2026). | Keeps `main` releasable and gives everyone a place to review. |
| 4 | **Collaborators:** AR-public and HannanIhsan-arch with write access (18 Oct 2026). | Core team. |
| 5 | **Scope refined** in [product-brief.md](product-brief.md) (18 Oct 2026): Mohamed's calendar / on-call is a separate app (link only); "not AI-written" is handled by an in-app editor, a paste check, a pledge and flagging, not an AI detector. | Detectors are unreliable and would wrongly accuse members; a separate calendar keeps Emerald focused. |
| 6 | **Visual direction (proposed):** ivory + emerald + gold, Bricolage Grotesque + Manrope, no photos, plain language. See [design/](../design/README.md). | Matches the Dev Bros family and the "user-friendly, not like GitHub" brief. Open for team feedback. |
| 7 | **Mobile = the same website** in the phone's browser, responsive, with a bottom tab bar (18 Oct 2026). No native app for now. | One codebase, nothing to install, links from the group chat just open. Can be made installable later. |
| 8 | **Shared articles and videos get comments + sharer insights**, and engagement counts toward the weekly score (18 Oct 2026): comment +2 (max 10/wk), comments received +1 (max 10/wk), insight on your own share +3 (max 2 per share). | Gives non-tech members a real way to contribute and rewards conversation, with caps so it can't be farmed. |
| 9 | **Presence on Home**: online (last 5 min), last 2 hours, inactive; dots on avatars; members can hide it (18 Oct 2026). | Shows the community is alive and who's free to help right now. |
| 10 | **Learn is a fixed-height card grid** with learnings, opinions, articles and videos; learnings can attach sources and videos (18 Oct 2026). | Many items visible at once instead of a long list; sources make learnings easier to follow up. |
| 11 | **Voice dictation is designed in but shipped later** (18 Oct 2026): mic slot on every longer text field; dictated text counts as own words. | Lowers the effort of writing in your own words; reserving the slot now avoids a redesign later. |
