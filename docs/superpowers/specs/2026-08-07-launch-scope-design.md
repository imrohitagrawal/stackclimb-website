# Design — get stackclimb.com live, honest, today

Agreed with the owner across three approved sections, 2026-08-07.
Supersedes `docs/plan/build-plan.md`, which four role reviewers found materially wrong.

**Milestone:** the site is publicly reachable and nothing on it is false.

---

## 1. Scope

### Ship

The existing one-page site, at `stackclimb.com`, with two copy fixes.

**Fix A — SaafSaans.** The plate advertises a link that does not respond.

Diagnosed by execution, not assumption: DNS resolves to `66.241.125.120`, TCP 443 accepts,
TLS never completes (`tls=0.000000s` after a 0.05s connect), dead at 5.1s. The certificate is
valid until 2026-10-19, so this is not a TLS fault — Fly's edge has nothing to route to.

| | Now | After |
|---|---|---|
| `State` caption | `Deployed — sleeps idle` | `Deployed — not responding, under investigation` |
| Link label | `Deployment` | `Deployment (currently down)` |
| Description | Generic | The verified hackathon story below |

Verified source: the event is **Build With AI**, organised by **Elastic × GDG Cloud New Delhi**,
**18 July 2026**, ThoughtWorks Gurugram. The repo's first commit is `2026-07-18 14:17` — the same
day — and its last is `2026-07-21 23:49`, 161 commits. The event page and the commit log agree
without anyone having to be trusted.

Two corrections made during the interview: the organiser is **GDG** (Google Developer Groups),
not GDC; and the venue is Gurugram, while "New Delhi" is the community's name.

The three-hour figure is **owner-stated** and not recorded in the repo. It stays labelled as such
until it is. The repo's `did not place` lines describe the Streamlit entry, not the rebuilt
product, and are not carried onto the site.

**Fix B — contact details.** The contact plate shows the same three destinations twice: once as
working buttons, and again underneath as plain text that cannot be clicked.

- Delete the three duplicate ledger rows.
- Replace with two rows carrying facts the paragraph currently buries:
  `Based — Bengaluru, India · IST (UTC+5:30)` and
  `Open to — Global relocation · international travel`.
- Remove that sentence from the paragraph so it is not said twice.
- `index.astro:339` `Email Rohit` → `Email me`. Two other CTAs already say `Email me`; this one
  was the odd one out.

Label values are written in **sentence case**. `global.css:353` applies `text-transform:
uppercase`; putting capitals in the source would be a second source of truth for something CSS
already owns.

`IST (UTC+5:30)` is new. A reader in London or San Francisco learns the overlap immediately, and
it appears nowhere on the site today.

### Do not ship

| Deferred | Why |
|---|---|
| Contrast — 22 nodes, plus 2 outside `.plate` | Real, but a quality gap, not a false claim |
| The 12 unchecked numbers | Unconfirmed, not known wrong |
| CI, hooks, the 7 tests that cannot fail | Invisible to every reader |
| Repo history, watermark skill, photo, logo | Independent of launch |
| `work` / `writing` / `about` pages | No content exists. Four empty destinations are worse than the anchors already there |

---

## 2. How each change is proven

| # | File | Change | Proof |
|---|---|---|---|
| 1 | `index.astro:339` | `Email Rohit` → `Email me` | Grep: three CTA labels, all identical |
| 2 | `index.astro` contact ledger | Delete 3 rows, add 2 | New gate, below |
| 3 | `index.astro` contact paragraph | Drop the relocation sentence | Grep: the phrase appears once |
| 4–5 | `index.astro` SaafSaans plate | Caption, link label, description | Screenshot, read by eye |

### The one gate that ships with this

A test asserting **no bare email address or profile URL appears as a text node** in the built
HTML. Contact details must be labelled links.

It is written **first**, watched **fail** on today's build, and only then is change 2 made. That
order is the proof the check can detect anything at all. A check written after the fix passes
immediately and cannot be distinguished from a broken one.

Its denominator: the built HTML must be non-empty **and** at least one `mailto:` link must
exist — so it cannot pass by finding nothing.

This is directive **P-13** becoming mechanical. It was raised twice, agreed once, and dropped
both times. A gate does not forget.

### Testing posture, honestly

The existing suite is partly broken — seven tests cannot fail, and it does not build before
testing. **It is not relied on here.** For copy changes the verification is the new gate, a grep,
and looking at the rendered page at both viewports. For a copy change, the screenshot is the test.

---

## 3. Deploy

**Approach A — Cloudflare Pages connected to the private repo.** Chosen because it is the only
option that ships today. Manual `wrangler` upload risks deploying a stale `dist/`, which is
DEF-11 exactly. Deploying through CI puts a red, partly-broken suite on the critical path.

**A is a recorded debt, not a destination.** Approach C — deployment through CI — is the target.
The exit condition is a five-row table in the standing notice at the top of `AGENTS.md`, which
loads every session.

Configuration: build `npm run build`, output `dist`, production branch `main`, **branch previews
off** (Pages builds every branch by default and publishes each at a public, indexable URL).

### Verification

A build marker is added, because `curl -I` returning 200 proves only that *something* answered.

Mechanism, stated because "add a marker" is not implementable as written: Cloudflare Pages exposes
the commit as `CF_PAGES_COMMIT_SHA` during the build. `Layout.astro` reads
`import.meta.env.CF_PAGES_COMMIT_SHA` and falls back to `"local"` when absent, so a local build is
labelled honestly rather than claiming a SHA it does not have. It renders as
`<meta name="build" content="…">`. A stale deploy, a cached edge, or a misattached domain
all return a healthy page of the wrong thing.

Three checks: the marker matches the merged SHA on the apex; `www` redirects rather than
duplicating; and the Pages deploy **job** succeeded — not the run's rollup, which can be green
while the deploy step was skipped.

### Rollback

Pages retains every deployment; rollback is selecting a previous one, roughly 30 seconds.
Deploys are atomic — a failed build never partially replaces the live site.

---

## 4. Order after launch

Each is a separate branch and PR.

1. **Repair the 7 tests that cannot fail** — everything below is verified by them
2. **Contrast**, including the 2 nodes outside `.plate`
3. **Check the 12 numbers** against their repos
4. **CI workflow**, green at least once
5. **Branch protection → switch to approach C** — this closes the standing debt
6. Repo history fix, then public

Item 1 before item 2 is deliberate, and it is a mistake already made once: gates were written,
trusted, and shipped — seven of which could not fail.

---

## Open, and deliberately outside this design

- Photo — no placeholder exists; `DESIGN.md` says the world does not draw people. A design
  decision, to be tried against the live page.
- Logo and wordmark — the owner holds his files back so the independent options stay
  independent. Protocol in `docs/brand/README.md`.
- RCA-001 watermark skill, RCA-002 fail-open fix — both raised, neither approved.
