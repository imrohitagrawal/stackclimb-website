# Inbox — staging for owner-supplied source material

**Everything in this directory is untracked.** Only this README is in git.

That is deliberate. On 2026-08-09 a scan of the uploaded CV found a **10-digit phone number** in
`FINAL-Rohit_Master_Resume.md`. The files were still untracked so nothing reached a commit — but
under the previous rule `photo/` and `resume/` *were* tracked, and the next `git add -A` would
have put a personal number into a repo being prepared to go public.

That is the **third** time source material has carried personal contact details into this repo:
visiting cards on 08-07, and now a CV. So the rule is now the simplest one that cannot fail:
**nothing here is tracked.** Files graduate into `public/` or into page content deliberately,
one at a time, after a human has read what is in them.

---

## `photo/` — supplied 2026-08-09

`github_profile_photo.jpeg` — professional headshot, suit, plain grey background, portrait
orientation. Verified by eye: no visiting card, no phone number, no QR code.

**Destination:** an avatar beside his name in the hero lede (D27). Portrait orientation, so it
needs a **square centre crop** around the face. A larger crop may also sit beside the lifecycle
diagram on the Approach page (Phase 3.5).

Optimise before it ships: it is 75 KB as supplied, and `paint-grain.png` at 166 KB is already
63% of page weight.

## `resume/` — supplied 2026-08-09, five files

| File | Use |
|---|---|
| `Rohit_V3.pdf` · `Rohit_V3.docx` | **Authoritative. First preference.** |
| `FINAL-Rohit_Master_Resume.md` | Easiest to parse — but see the precedence rule |
| `FINAL-Rohit_Master_Resume.pdf` · `.docx` | Same content as the `.md` |

### Precedence — owner's instruction, 2026-08-09

> *"First preference should be given to the data present in `Rohit_V3`. If there is any
> conflicting information in `FINAL-Rohit_Master_Resume` when compared to `Rohit_V3`, then
> `Rohit_V3` should have been considered correct."*

**`Rohit_V3` wins every conflict.** The `.md` is the convenient one to read, and convenience is
not authority — read `Rohit_V3` and use the markdown only to fill gaps `Rohit_V3` does not cover.

**Where a conflict is found, record it in `docs/STATUS.md`** with both values, so the next
session does not rediscover it.

### What must NOT reach the site

The markdown contains a **phone number**. It does not go on the `/cv` page, in the HTML, in a
commit, or in a build artefact. Contact stays as it is today: email, LinkedIn, GitHub.

Re-scan whatever you generate before committing:

```bash
grep -oiE "\+?[0-9]{10,}" dist/**/*.html
```

## `brand/` — supplied 2026-08-09

`wordmark-light.png`, `wordmark-dark.png`, `logo-light.png`, `logo-dark.png`.

**Protocol satisfied:** Claude's own recommendation was written first, in `docs/brand/README.md`
— *do not design a logo; the name is the brand; a wordmark and an `RA` plate monogram already
exist*. That was recorded on 09 Aug **before** these files were opened, so the comparison is a
second opinion rather than a reaction.

**Next step is a comparison, not an installation.** Put his marks beside the existing wordmark
and monogram, at real sizes — 16px favicon, nav height, and an OG card — and judge them on what
survives at each. PNG is a raster format; whatever wins needs an SVG before it ships.

---

**Any session that uses a file from here records it in `docs/STATUS.md` in the same change,
naming the file.**
