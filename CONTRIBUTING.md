# Contributing: start here

**Read next:** [docs/architecture.md](docs/architecture.md) (how it works) · [docs/decisions.md](docs/decisions.md) (what was agreed and why) · [docs/status.md](docs/status.md) (what's done and what's next) · [docs/product-brief.md](docs/product-brief.md) (original brief).

## 1. Prerequisites

- Node 22+ and pnpm 10 (`corepack enable` or `npm i -g pnpm`)

## 2. Run it locally

```sh
git clone git@github.com:redomar/project-emerald.git
cd project-emerald
pnpm install
pnpm dev        # http://localhost:4400
```

## 3. Checks

```sh
pnpm typecheck && pnpm test && pnpm build
pnpm preview --port 4455 & pnpm e2e     # every flow in a real browser
```

CI runs all of these on every push and PR.

Data lives in your browser only (localStorage). Use Settings → Reset demo to get the demo data back, or Delete all to start empty.

## 4. Workflow

- **Never push to `main` directly.** Branch from `main` (`feature/…`, `fix/…`), open a PR, get a review, keep PRs small.
- Each PR adds its user-facing change under `## [Unreleased]` in the changelog.
- Secrets live in `.env.local` (git-ignored). Never commit them.

## 5. Versioning and releases

[Semantic Versioning](https://semver.org/), `MAJOR.MINOR.PATCH`. We released `1.0.0` on 18 Oct 2026; from here every change is a patch, minor or major bump.

| Bump | When | Example |
|---|---|---|
| **PATCH** | bug fix, copy fix, nothing new | 1.0.0 → 1.0.1 |
| **MINOR** | new feature or screen, nothing breaks | 1.0.1 → 1.1.0 |
| **MAJOR** | breaking change: data migration, removed URLs, changed flows | 1.4.2 → 2.0.0 |

The version lives in `package.json`.

1. Note user-facing changes under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) as you go (Added / Changed / Fixed).
2. To release: rename that section to `## [x.y.z] - YYYY-MM-DD`, bump the version, commit `Release x.y.z`, and merge to `main`.
3. Tag and publish: `git tag vx.y.z && git push origin vx.y.z`, then `gh release create vx.y.z --title vx.y.z --notes "<that changelog section>"`.

Plain commit messages only: no `Co-Authored-By` trailers.

## Access checklist (Mohamed grants these)

| What | Why | How |
|---|---|---|
| GitHub collaborator on `redomar/project-emerald` | push branches, merge PRs | `gh api -X PUT repos/redomar/project-emerald/collaborators/<username> -f permission=push` |
