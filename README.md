# Project Emerald

> Working name. Rename the repo and this heading once the real name is agreed.

One place for the brothers to see who is building what, what they shipped, and what they learned. Friendly, not GitHub. One responsive website: on phones it's the same site in the browser. See the [brief](docs/product-brief.md) and the [design previews](design/README.md).

**Stack:** not chosen yet. Record the choice in [docs/decisions.md](docs/decisions.md), then fill this line in.

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
pnpm design:render   # rebuild the design PNGs (see design/README.md)
# App commands go here once the stack is set up.
```
