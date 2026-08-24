// The contact plate's copy control. Real script, not enhancement over a
// working native control — the same call the motion toggle records in its own
// header, and for the same reason: there is no CSS-only way to reach the
// clipboard.
//
// WHY IT EXISTS. `mailto:` is the plate's only conversion path, and on a
// managed corporate desktop it is frequently bound to nothing: the visitor
// clicks EMAIL ME and the page silently does nothing. That visitor — an
// in-house recruiter — is the exact reader PRODUCT.md names first. Her next
// move is to paste the address into an applicant tracking system, which the
// page gave her no way to do.
//
// WHY IT DOES NOT BREACH P-13. The directive says contact details are labelled
// links, never bare text a visitor must copy by hand, and tests/contact.spec.js
// fails if any plate PRINTS the address. Both still hold: the address is read
// from the existing mailto link's href and handed to the clipboard. It is never
// written into the DOM, so the gate never sees it. One click replaces the hand
// copying P-13 was written to prevent — the directive's intent, not a carve-out
// from it.
//
// WHY THE ADDRESS IS NOT DUPLICATED IN A data- ATTRIBUTE. A second copy would
// drift from the first the next time one is edited. The href is the single
// source of truth, the same derive-don't-restate rule the practice panel
// follows when it reads its witnesses from projects.js at build time.

const plate = document.getElementById('contact');
const button = plate && plate.querySelector('[data-copy-email]');
const link = plate && plate.querySelector('a[href^="mailto:"]');

// Every condition below is a reason the control could not do its job. A button
// that cannot work is never revealed — DEF-1 and DEF-2 are both on this site's
// record because a dead surface was shipped once already.
if (button && link && navigator.clipboard) {
  const address = link.getAttribute('href').replace(/^mailto:/i, '').split('?')[0];

  if (address) {
    const label = button.querySelector('[data-copy-label]');
    const resting = label.textContent;
    let restore;

    button.hidden = false;

    button.addEventListener('click', async () => {
      clearTimeout(restore);
      try {
        await navigator.clipboard.writeText(address);
        label.textContent = 'Copied';
      } catch {
        // Named, not swallowed. The visitor still has the mailto link and the
        // two profile links beside it; what she must not get is a button that
        // reports success it did not have.
        label.textContent = 'Copy failed';
      }
      restore = setTimeout(() => {
        label.textContent = resting;
      }, 2000);
    });
  }
}
