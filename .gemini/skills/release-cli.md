# Skill: Release CLI

## Trigger
Use this skill when the user asks to "release the CLI", "push and tag", "deploy CLI", or "create a new CLI release" for the Lit project.

## Context
- **Repository**: `/Users/philipgibsoncudjoe/Projects/Final_Year/lit`
- **Branch**: `main`
- **Tag pattern**: `v{MAJOR}.{MINOR}.{PATCH}` (semver)
- **CI/CD**: GitHub Actions workflow at `.github/workflows/release.yml` triggers on tags matching `v*`, building Go binaries for macOS, Linux, and Windows.

## Steps

### 1. Stage all changes
Stage all untracked and modified files in the repository:
```bash
cd /Users/philipgibsoncudjoe/Projects/Final_Year/lit
git add -A
```

### 2. Commit
Generate a meaningful commit message summarizing the changes. Use conventional commits format:
```bash
git commit -m "feat: <summary of changes>"
```
If no changes are staged (working tree clean), skip to Step 4.

### 3. Push to main
Push the commit(s) to the `main` branch on origin:
```bash
git push origin main
```

### 4. Determine next tag version
List existing tags and auto-increment the **patch** version from the latest tag:
```bash
git tag -l 'v*' | sort -V | tail -1
```
- If latest is `v0.2.0`, next tag is `v0.2.1`
- If latest is `v1.0.9`, next tag is `v1.0.10`
- If no tags exist, start with `v0.1.0`

For **minor** version bumps (new features), increment the middle number and reset patch to 0.
For **major** version bumps (breaking changes), increment the first number and reset minor and patch.

Ask the user which bump type to use if the changes include new features or breaking changes. Default to **patch** for bug fixes and small improvements.

### 5. Create and push the tag
```bash
git tag -a v{X.Y.Z} -m "<summary of what this release includes>"
git push origin v{X.Y.Z}
```

### 6. Confirm
After pushing the tag, confirm to the user:
- The tag name that was pushed
- That the GitHub Actions workflow should now be running
- Link: `https://github.com/MandemGibson/lit/actions`

## Important Notes
- Always run `git status` first to see what's changed before staging.
- Never force-push to main.
- The commit message should reflect the actual changes, not be generic.
- If there are no changes to commit, still allow creating a new tag on the current HEAD if the user wants a release.
