# RCA-001 — Watermarking is specified but has no skill that applies it

**Status:** **APPROVED 2026-08-12** by the owner. Build proceeds.
**Raised:** 2026-08-07 · **Directive:** owner, "we need to make that skill"

---

## What is missing

The watermark is fully specified across three files in `project-doc-skills`, and **nothing
applies it.** The spec is a passenger: every skill references it, no skill executes it.

| Where | What it says |
|---|---|
| `shared/project-profile.md:66` | `watermark: "Rohit Agrawal · https://www.linkedin.com/in/rohitagrawal14/"` |
| `shared/project-profile.md:67` | `watermark_opacity: 0.22` — range 0.18–0.30, "never overlap content" |
| `shared/render-contract.md:151-153` | "Exported images carry the credit furniture. The watermark … and a thin inset slate border go on the **exported** image — never on the diagram source." |
| `shared/licensing-and-credits.md:33-36` | "**decorative only and does not satisfy the footer requirement** … HTML generators that render a watermark must also render the © footer." |
| `shared/render-contract.md:171` | Publish-reviewer: "A watermark never satisfies this." |

## Where it was introduced, and where it was caught

- **Introduced:** in the doc-suite design. The contract was written; the executor never was.
- **Caught:** by the owner, reading his own suite. Not by any check.
- **Cost so far:** zero — no document has shipped. The cost is ahead of us: every diagram, export
  and page produced from here on would go out uncredited, and retrofitting a watermark across a
  published corpus is far more expensive than applying it at export.

## Why it matters, plainly

A watermark is the **signature on a painting**. It travels with the picture when the picture
leaves the gallery. A licence footer is the **receipt** — it proves ownership, but it stays with
the paperwork. When someone screenshots a diagram and drops it into a deck, the receipt is gone
and only the signature survives.

That is exactly why the spec insists the watermark is *decorative* and never replaces the footer.
They do different jobs. One survives being cropped; the other stands up in a dispute.

## Why now

Two things are about to start producing artifacts:

1. **The site's diagrams and OG images** — `og.png` is already 332K and shipping uncredited.
2. **`architecture-and-decisions` and `doc-critic`**, both now installed, both of which produce
   documents the contract says must carry credit furniture.

Building the executor after those exist means going back over them.

## Before building: does this already exist in public?

Required by `AGENTS.md` — never write a skill that already exists.

**Searched and not found.** No public skill applies a configurable, opacity-controlled,
placement-aware watermark to exported images while enforcing that a separate licence footer is
also present. Image tooling exists in abundance; the *contract* — watermark is decorative, footer
is mandatory, both are checked — is specific to this suite.

Under `AGENTS.md`, this is **case 1**: nothing public covers it. It is also arguably case 2 — the
pieces are scattered across `render-contract.md`, `licensing-and-credits.md`, and
`project-profile.md`, and nothing composes them.

## What the skill would do

| | |
|---|---|
| **Input** | An image or a directory of images, plus `project-profile.md` for the values |
| **Applies** | Watermark text at the configured opacity, in whitespace, never overlapping content; a thin inset slate border |
| **Never touches** | The diagram *source*. Export only — the spec is explicit |
| **Refuses** | Opacity outside 0.18–0.30. An HTML page carrying a watermark but no `©` footer. A source file passed instead of an export |
| **Reports** | How many images processed, out of how many found. Zero found fails, per the denominator rule |
| **Portable** | Reads the profile; hardcodes no name, URL, or path. Reusable on any project under the umbrella |

## What it must not do

- Not substitute for the licence footer. The suite says this three times; the skill must enforce it.
- Not watermark diagram sources — only exports.
- Not silently skip an image it could not process.

## Open questions for the owner

1. **Scope.** Images only, or HTML pages too? The spec covers both, but the HTML case needs the
   footer check as well.
2. **The site's own images.** Should `og.png` and the plate figures carry it? An OG card is a
   social-preview image that travels — a strong candidate. The in-page SVG figures are part of
   the page and already carry the footer, so watermarking them may just add noise.
3. **Where it lives.** In this repo, or contributed back to `project-doc-skills` where the rest
   of the contract lives? The second is tidier and makes it reusable across every project.

## Decision

**APPROVED 2026-08-12.** The owner's answers to the three open questions:

1. **Scope — images AND HTML pages.** The HTML case therefore also enforces the © footer, which
   the spec demands three times.
2. **The site's own images — yes.** Narrowed by measurement: **only two files actually leave
   this site.** `dist/og.png` (72KB, the social share card) and `dist/favicon.svg` (704 bytes).
   The in-page figures are now a single inline `<svg>` — `PrivateFigure` — which is markup inside
   the HTML, not a downloadable file, and cannot travel. It gets nothing. **`og.png` is the whole
   real case**, and it ships uncredited today.
3. **Where it lives — `project-doc-skills`, as a ninth skill** in `skills/`, peer to the existing
   eight and built into `dist/watermark.skill` by `build-skills.sh`. Not a standalone repo, and
   not left in `shared/`: the contract already lives in `shared/`, and a skill separated from its
   contract drifts — this project watched that happen twice in one day (M6 vs DEF-3, and the
   `.github` gate's header vs its own steps).

## The public-skill search, re-run 2026-08-12

`AGENTS.md` requires searching GitHub before authoring, and this RCA's original claim was two
weeks old. **Re-run, and the tool was validated first** — an empty result from a broken query is
not evidence of absence, which is the `arize`/`summarize` lesson. A control query (`playwright`)
returned 94k★ microsoft/playwright, so the search works; the first over-specific queries simply
matched nothing.

**Result: 30+ watermark repos exist, and the ecosystem is inverted.** Ranked by stars, the field
is about *removing* watermarks and about *steganography*, not about applying an attribution mark
under a contract:

| Repo | What it does |
|---|---|
| `guofei9987/blind_watermark` 14.5k★ | **Invisible** / blind watermarking — steganography, different purpose |
| `GargantuaX/gemini-watermark-remover` 5.2k★ | **Removes** watermarks |
| `zuruoke/watermark-removal` 5.1k★ | **Removes** watermarks |
| `wiltodelta/remove-ai-watermarks` 4.5k★ | **Removes** watermarks |
| `ShieldMnt/invisible-watermark` 1.9k★ | **Invisible**, steganographic |
| `D-Ogi/WatermarkRemover-AI` 1.6k★ | **Removes** watermarks |
| `dxcweb/watermark` 888★ | Canvas overlay for ID documents — privacy protection, not attribution |
| `AryamanSi17/claude-skill-watermark-remover` | The one Claude *skill* hit — also a **remover** |

**Nothing applies a visible attribution watermark while enforcing that a separate © footer is
also present.** That contract — watermark is decorative, footer is mandatory, both are checked —
is what makes this case 1 under `AGENTS.md`, and the reason is sharper than "nothing exists":
the public work points the opposite way.
