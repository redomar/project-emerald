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
