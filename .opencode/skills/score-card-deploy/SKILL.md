---
name: score-card-deploy
description: Deploy the score-card Vite dist/ build to GitHub Pages gh-pages; use when the user asks to deploy, ship, publish, push dist, or run npm run deploy in the score-card project.
---

# Score-card Deployment

Use this workflow when the user asks to deploy the score-card app.

## Primary command

- Run `npm run deploy` from `/var/home/dorej/projects/score-card`.
- Preview locally with `npm run preview`; open `http://localhost:4173/score-card/`.
- Defaults are `origin`, `gh-pages`, `dist`, and `https://dorej.github.io/score-card/`.
- The script type-checks and builds with Vite base `/score-card/` derived from `package.json`, force-adds ignored hashed assets through a temporary git index, splits the `dist/` subtree, creates a fast-forward deployment commit on top of the current remote branch, pushes without force, and polls the live site until the new asset hashes appear.

## Safety rules

- Never force-push.
- Do not commit deployment files to the working branch just to deploy; the script leaves the working tree and staging area untouched.
- Use the script instead of ad-hoc `git subtree push`: the committed `dist/` often lacks ignored hashed assets, and plain `git subtree push` can be non-fast-forward when gh-pages was published from a separate deploy commit.
- If the push fails, stop and inspect `git status`, the remote branch, and the live site. Do not retry with force.
- The script passes `--base` to Vite instead of editing `vite.config.ts`.

## Configuration

- `DEPLOY_REMOTE` defaults to `origin`, `DEPLOY_BRANCH` to `gh-pages`, `DEPLOY_PREFIX` to `dist`, `DEPLOY_SUBPATH` to the `package.json` name, `DEPLOY_BASE` to `/<subpath>/`, `SITE_URL` to `https://dorej.github.io/<subpath>/`, and `GIT` to a git executable with `subtree` support.
- Flags: `--skip-build`, `--no-verify`, `--dry-run`, `--help`.
- `/usr/bin/git` on this machine lacks `subtree`; the script finds Homebrew git automatically, or set `GIT=/home/linuxbrew/.linuxbrew/bin/git`.

## Verification

- Confirm the script reports the new commit hash.
- Confirm the live HTML references the new hashed `index-*.js` and that all `dist/assets/*` URLs return 200.
- Report the deployed commit, remote, and URL to the user.
