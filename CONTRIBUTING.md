# Contributing: start here

**Read next:** [docs/architecture.md](docs/architecture.md) (how it works) · [docs/decisions.md](docs/decisions.md) (what was agreed and why) · [docs/status.md](docs/status.md) (what's done and what's next) · [docs/product-brief.md](docs/product-brief.md) (original brief).

## 1. Prerequisites

- Node 24+ and pnpm 10 (`corepack enable` or `npm i -g pnpm`) *(assumed; confirm when the stack is chosen)*

## 2. Run it locally

```sh
git clone git@github.com:redomar/project-emerald.git
cd project-emerald
# Install and run steps go here.
```

## 3. Checks

```sh
# pnpm typecheck && pnpm test && pnpm build
```

## 4. Workflow

- Branch from `main` (`feature/…`, `fix/…`), open a PR, let CI go green, keep PRs small.
- Secrets live in `.env.local` (git-ignored). Never commit them.

## 5. Versioning and releases

[Semantic Versioning](https://semver.org/): **patch** for fixes, **minor** for new features, **major** for breaking changes.

1. Note user-facing changes under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) as you go (Added / Changed / Fixed).
2. To release: rename that section to `## [x.y.z] - YYYY-MM-DD`, bump the version, commit `Release x.y.z`, and merge to `main`.
3. Tag and publish: `git tag vx.y.z && git push origin vx.y.z`, then `gh release create vx.y.z --title vx.y.z --notes "<that changelog section>"`.

Plain commit messages only: no `Co-Authored-By` trailers.

## Access checklist (Mohamed grants these)

| What | Why | How |
|---|---|---|
| GitHub collaborator on `redomar/project-emerald` | push branches, merge PRs | `gh api -X PUT repos/redomar/project-emerald/collaborators/<username> -f permission=push` |
