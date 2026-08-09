// Shared link reader for the contact gates. Lives in lib/ because two spec
// files assert the same painted+hittable standard and a second copy would
// drift (the DEF-10 / DEF-44 / touch.css lesson).

// Reads every link inside a container and reports, per link, whether it is
// actually PAINTED and actually HITTABLE — not merely present in the DOM.
// `document.elementFromPoint` at the link's own centre is what catches an
// overlay, `pointer-events: none`, and a zero-sized box; `[inert]` is checked
// because an inert subtree still reports a normal box and a normal hit.
export function readLinks(scope) {
  return scope.locator('a[href]').evaluateAll((els) =>
    els.map((el) => {
      // Hit-testing only works inside the viewport; bring each candidate in
      // before asking who is on top of it. Instant, so no settle wait needed.
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        href: el.getAttribute('href') || '',
        label: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        painted:
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          Number.parseFloat(style.opacity) > 0,
        hittable:
          style.pointerEvents !== 'none' &&
          el.closest('[inert]') === null &&
          hit !== null &&
          (hit === el || el.contains(hit)),
      };
    }),
  );
}
