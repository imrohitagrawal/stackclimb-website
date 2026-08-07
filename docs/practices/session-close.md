# Session close — the last thing done, every time

A session that ends without this leaves orphaned processes, a stale branch, a divergent remote,
and a next session that has to rediscover where things stood.

Run all five steps. Do not skip step 4 because "nothing was created" — check, then say so.

---

## 1. Say what happened, in plain English

Four answers, no jargon:

| Question | What a good answer looks like |
|---|---|
| **What was the task?** | "Fix the plate that was invisible without JavaScript." Not "addressed accessibility concerns." |
| **What is the expected output?** | What someone can now see or run that they could not before. |
| **How many issues were resolved?** | A number, and what each was. |
| **How many are pending?** | A number, and what blocks each. Zero is an answer — but only if it is true. |

A summary that cannot give numbers is a summary that has not checked.

## 2. Get the branch into main and the remote in sync

```bash
git status --short                 # must be clean
git log --oneline origin/main..HEAD  # what is unpushed
git push origin <branch>
# open the PR, let the gates run, merge
git checkout main && git pull --ff-only
git log --oneline main..origin/main  # must be empty
```

**Verify the merge landed** — do not trust the tracker or a green rollup. A branch merged is
not the same as a deploy run. If a deploy is involved, check the deploy *job* ran and was not
skipped or cancelled.

## 3. Delete the branch, both sides

```bash
git branch -d <branch>
git push origin --delete <branch>
git worktree remove <path>   # if a dedicated worktree was used
git worktree prune
```

A stale branch is how the next session works on the wrong base.

## 4. Clean up what the session created

Check each. Report what was found, including "none".

```bash
# Orphaned processes — dev servers and preview servers are the usual culprits
ps aux | grep -E 'astro|vite|http.server|playwright|node .*serve' | grep -v grep

# Docker, if the session used it
docker ps -a --filter "status=exited"
docker images -f "dangling=true"

# Temp files — the session scratchpad and anything dropped in the repo
ls /tmp /private/tmp 2>/dev/null | grep -i <project>
git status --porcelain --ignored | grep '^!!'

# Dependencies added only to try something
git diff origin/main -- package.json
```

**Kill what the session started. Leave what predates it.** If in doubt, list it in the handoff
rather than deleting it.

## 5. Write the handoff

The last thing produced. It is a prompt for the next session, and it must stand alone — the
next session has none of this one's context.

It must carry:

- **The task**, stated so it can be picked up cold.
- **Where things stand** — a pointer to `docs/STATUS.md`, not a copy of it. A copied summary
  drifts from the source the first time the source changes.
- **The commands that prove the current state**, not a claim about it. "10 pass, 2 fail" is a
  claim. `npx playwright test` is evidence.
- **The next action**, single and specific.
- **What must not be done** — the constraints that are easy to violate without the context that
  produced them.

### Why a pointer and not a summary

The next session reads the handoff first and the repo second. If the handoff restates the
status, the two drift and the newer one loses. Point at the file that is maintained; state only
what the file cannot know — what was in flight when the session ended.

---

## The rule underneath all five

**Cleanup is part of the work, not after it.** A session judged complete while it has left a
process running, a branch dangling, or a remote ahead is not complete. It has moved the mess
somewhere the next session pays for it.
