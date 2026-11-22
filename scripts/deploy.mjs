import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flags = {
  build: !args.includes("--skip-build"),
  verify: !args.includes("--no-verify"),
  dryRun: args.includes("--dry-run")
};
const remote = process.env.DEPLOY_REMOTE || "origin";
const branch = process.env.DEPLOY_BRANCH || "gh-pages";
const prefix = process.env.DEPLOY_PREFIX || "dist";
const siteUrl = process.env.SITE_URL || "https://dorej.github.io/score-card/";
const usage = [
  "Usage: npm run deploy -- [flags]",
  "",
  "Flags:",
  "  --skip-build   Skip npm run build",
  "  --no-verify    Skip live-site verification",
  "  --dry-run      Build and compute the deploy commit without pushing",
  "  --help         Show this message"
].join("\n");

const rootResult = spawnSync(process.env.GIT || "git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" });
if (rootResult.error || rootResult.status !== 0) {
  throw new Error("Run this script from inside a git repository.");
}
const root = rootResult.stdout.trim();

function run(cmd, cmdArgs, options = {}) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd: options.cwd || root,
    env: { ...process.env, ...(options.env || {}) },
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit"
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = result.stderr ? `: ${result.stderr.trim()}` : "";
    throw new Error(`${cmd} ${cmdArgs.join(" ")} failed${detail}`);
  }
  return (result.stdout || "").trim();
}

function findGit() {
  const candidates = [process.env.GIT, "git", "/home/linuxbrew/.linuxbrew/bin/git", "/opt/homebrew/bin/git", "/usr/local/bin/git"];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const result = spawnSync(candidate, ["subtree", "-h"], { stdio: "ignore" });
    if (result.status === 0) return candidate;
  }
  throw new Error("A git executable with subtree support is required. Set GIT=/path/to/git.");
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyDeployment(refs) {
  const deadline = Date.now() + 120000;
  let last = "no response";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(siteUrl, { cache: "no-store" });
      const html = await response.text();
      if (!response.ok) {
        last = `site returned ${response.status}`;
      } else if (!refs.every(ref => html.includes(ref))) {
        last = "site has not picked up the new asset hashes";
      } else {
        let allOk = true;
        for (const ref of refs) {
          const asset = await fetch(new URL(ref, siteUrl), { method: "HEAD", cache: "no-store" });
          if (!asset.ok) {
            allOk = false;
            last = `${ref} returned ${asset.status}`;
            break;
          }
        }
        if (allOk) return siteUrl;
      }
    } catch (error) {
      last = error.message;
    }
    await delay(5000);
  }
  throw new Error(`verification timed out: ${last}`);
}

async function main() {
  if (args.includes("--help")) {
    console.log(usage);
    return;
  }

  const indexPath = path.join(root, prefix, "index.html");
  if (!flags.build && !fs.existsSync(indexPath)) {
    throw new Error(`${prefix}/index.html is missing. Run the build first.`);
  }

  if (flags.build) {
    console.log("Building dist/...");
    run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]);
  }

  const git = findGit();
  const gitEnv = {
    GIT_SSH_COMMAND: process.env.GIT_SSH_COMMAND || "ssh -o BatchMode=yes",
    GIT_TERMINAL_PROMPT: "0"
  };

  try {
    run(git, ["fetch", remote, branch], { env: gitEnv });
  } catch {
    console.log(`${remote}/${branch} is not available locally; creating it if needed.`);
  }

  let remoteHead = "";
  try {
    remoteHead = run(git, ["rev-parse", `refs/remotes/${remote}/${branch}`], { quiet: true });
  } catch {}

  const gitDir = run(git, ["rev-parse", "--absolute-git-dir"], { quiet: true });
  fs.rmSync(path.join(gitDir, "subtree-cache"), { recursive: true, force: true });

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "score-card-deploy-"));
  try {
    const indexEnv = { ...gitEnv, GIT_INDEX_FILE: path.join(tmp, "index") };
    run(git, ["read-tree", "HEAD"], { env: indexEnv, quiet: true });
    run(git, ["add", "-f", prefix], { env: indexEnv, quiet: true });
    const stagedTree = run(git, ["write-tree"], { env: indexEnv, quiet: true });
    const tempCommit = run(git, ["commit-tree", stagedTree, "-p", "HEAD", "-m", "temp deploy tree"], { quiet: true });
    const split = run(git, ["subtree", "split", `--prefix=${prefix}`, tempCommit], { quiet: true });
    const deployTree = run(git, ["rev-parse", `${split}^{tree}`], { quiet: true });
    const remoteTree = remoteHead ? run(git, ["rev-parse", `${remoteHead}^{tree}`], { quiet: true }) : "";

    if (remoteTree && remoteTree === deployTree) {
      console.log(`${remote}/${branch} already matches ${prefix}/.`);
      return;
    }

    const parents = remoteHead ? ["-p", remoteHead] : [];
    const deployCommit = run(git, ["commit-tree", deployTree, ...parents, "-p", split, "-m", `Deploy ${prefix} to ${branch}`], { quiet: true });

    if (flags.dryRun) {
      console.log(`Dry run: would push ${deployCommit} to ${remote}/${branch}`);
      return;
    }

    run(git, ["push", remote, `${deployCommit}:refs/heads/${branch}`], { env: gitEnv });
    console.log(`Pushed ${deployCommit.slice(0, 7)} to ${remote}/${branch}`);

    if (flags.verify) {
      const localHtml = fs.readFileSync(indexPath, "utf8");
      const refs = [...localHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]).filter(ref => ref.includes("/assets/"));
      const verifiedUrl = await verifyDeployment(refs);
      console.log(`Verified ${verifiedUrl}`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
