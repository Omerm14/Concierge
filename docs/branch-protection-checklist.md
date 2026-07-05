# Branch protection checklist

This can't be committed as code — it's a GitHub repo setting (UI or
`gh api repos/{owner}/{repo}/branches/main/protection`). Do this manually once
CI (`.github/workflows/ci.yml`) has run at least once (the status checks only
appear in the selector after a first run).

- [ ] Repo settings → Branches → add a protection rule for `main`:
  - [ ] Require a pull request before merging (no direct pushes)
  - [ ] Require status checks to pass before merging — select `lint`,
        `typecheck`, `test`, `build`
  - [ ] Require branches to be up to date before merging
  - [ ] Do not allow force pushes to `main`
  - [ ] Do not allow deletion of `main`
- [ ] Decide whether `claude/**` branches also need protection — likely not,
      they're throwaway feature branches merged via PR into `main`
- [ ] Optional: require 1 review approval — once the QA/CR agent (see
      `/FLYWHEEL.md`) is wired, decide whether its recommendation or a human
      approval satisfies this
