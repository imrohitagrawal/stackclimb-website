# P-10 — comments on the 4 project pages, via Giscus

Implements P-10 (`docs/OWNER-DIRECTIVES.md`, low priority, "Giscus recommended, not
built"). Lighter plan than P-9's — a standard, well-understood third-party integration on
4 isolated pages, not a novel design problem; scaled accordingly (T1 blast radius, no
review fan).

Owner decisions, this session: build now, on the 4 `/projects/<slug>` pages (not a new
page, no blog exists to attach comments to); Discussions category is named "Comments" in
conversation — GitHub auto-creates a default category set on enabling Discussions and
category creation/renaming has no public API (web-UI only, confirmed: no
`createDiscussionCategory` GraphQL mutation exists), so the **existing `Announcements`
category is reused** — its format is identical to what was asked for (locked: only the
repo owner can start a thread, visitors can only reply), and the category name is not
shown anywhere in the rendered giscus widget a visitor sees, so the internal/display-name
mismatch has no visitor-facing effect. Recorded here rather than silently substituted.

## Ground truth, verified by command

| Fact | Command | Result |
|---|---|---|
| No blog/article surface exists | `ls src/pages/` | `cv.astro`, `experience.astro`, `how-i-build.astro`, `index.astro`, `projects/` — nothing else. Comments attach to the 4 project pages, the closest thing to "content someone might react to" |
| This is the site's first third-party script | `grep -rn "client:" src/ --include=*.astro` (P-9 session) | Zero islands; the only JS is 4 hand-written progressive-enhancement files, all first-party, all optional. Giscus is different in kind: it is REQUIRED for the widget to render at all (no native-HTML fallback is possible for a live, GitHub-authenticated comment thread) — recorded as a genuine, one-time exception to DEF-1's "works with JS off" bar, not silently treated as consistent with it |
| Discussions enabled | `gh api -X PATCH repos/imrohitagrawal/stackclimb-website -f has_discussions=true` | `"has_discussions":true` |
| Category available | GraphQL `discussionCategories` | `Announcements` (id `DIC_kwDOTzbbEs4DDj8g`, `isAnswerable:false`) — GitHub's own locked-format category, matching the "only I start a thread" requirement without needing a custom category |
| Repo node id | GraphQL `repository.id` | `R_kgDOTzbbEg` |
| The giscus GitHub App is NOT yet installed | manual, cannot be done via API — GitHub App installation is an interactive OAuth-consent action, no `gh api` equivalent | **Owner action required, outside this session**: visit `https://github.com/apps/giscus`, click Install, select `stackclimb-website`. Until this is done the widget will render an error state, not silently do nothing — giscus's own client script shows a visible "giscus is not installed on this repository" message, so the failure mode is loud, not silent |
| File budget | `wc -l` | `[slug].astro` 135/250 — room for one more `<Plate>` section |

## What ships

**`src/pages/projects/[slug].astro`**: a third `<Plate id={`${slug}-comments`}>` after the
record plate — DESIGN.md:228's own rule ("content that cannot fit becomes another plate,
not a taller one") argues against appending to the already-height-tuned record plate
(D76's 1,082px-over-budget history). The plate's only content is the giscus mount point
and its loader script:

```astro
<Plate id={`${slug}-comments`}>
  <div class="plate-grid one-col">
    <div class="plate-copy wide">
      <h2 class="plate-title tight">Discussion</h2>
      <p class="cv-note">
        Comments post to this repository's GitHub Discussions and need a GitHub account —
        the same account system the site's own code already lives in, not a new one.
      </p>
      <div class="giscus" data-repo="imrohitagrawal/stackclimb-website"
        data-repo-id="R_kgDOTzbbEg" data-category="Announcements"
        data-category-id="DIC_kwDOTzbbEs4DDj8g" data-mapping="specific"
        data-term={slug} data-strict="1" data-reactions-enabled="1"
        data-theme="noborder_dark" data-lang="en"></div>
    </div>
  </div>
</Plate>
<script src="https://giscus.app/client.js" data-loading="lazy" crossorigin="anonymous" async></script>
```

`data-mapping="specific"` + `data-term={slug}` (not `pathname`): binds each project's
thread to its own stable slug rather than the URL, so a future route rename does not
orphan existing comments — the same "derive, don't restate, and don't let presentation
churn break a durable reference" instinct DEF-10/DEF-44 already established elsewhere on
this site. `data-strict="1"`: giscus only matches the exact term, no partial/fuzzy binding
across projects (closes the same "wrong project, still passes" class P-9's own R-7 review
just found and fixed in the evidence-link mechanism — the lesson carries over immediately).
`data-theme="noborder_dark"`: giscus ships no first-party theme matching this site's
palette; the borderless dark variant is the closest visual fit without a custom CSS theme
(a possible follow-up, not required to ship).

**`tests/comments.spec.js`** (new): asserts the giscus mount `div` is present on all 4
project pages with the correct `data-term` (matching the page's own slug — the exact
mutation class named above, locked by test this time rather than found by review after
the fact), and that the loader script tag is present with `async` (never blocks the page's
own content from rendering — DEF-1's spirit even where the letter can't be met: the widget
itself needs JS, but nothing else on the page may wait on it).

## Not in this package

A custom giscus CSS theme matching the site's exact palette (the built-in `noborder_dark`
is close enough to ship; a pixel-matched theme is a possible follow-up, not blocking) ·
comments on `/cv`, `/experience`, `/how-i-build`, or the home page (no natural "reactable"
content there) · moderation tooling beyond GitHub's own Discussions moderation (out of
scope, low priority) · installing the giscus GitHub App (owner action, outside this
session — the widget ships correctly regardless of install timing and will self-report the
uninstalled state rather than fail silently).
