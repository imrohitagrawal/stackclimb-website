// P-22, the copy half. /cv puts the CV on the clipboard as clean plain text.
//
// WHY IT EXISTS. The owner reported the control missing and it had never been
// there: the site's only copy control is the contact plate's copy-EMAIL button,
// wired through `getElementById('contact')`, a container /cv does not have
// (D143). What a recruiter needs on the CV page is not the address — it is the
// CV, in the form an applicant-tracking system will accept. Her actual next
// move is a paste into a form field, and until now the page offered her the
// browser's own select-all, which drags in the nav and the buttons.
//
// WHY PLAIN TEXT AND NOT THE PDF. Both, eventually — the download half is its
// own package. They are different jobs: a PDF is what she forwards to a hiring
// manager, plain text is what she pastes into a field that will not take a
// file. DEF-74 is the evidence that the two are not interchangeable: the PDF
// read back as "E X P E R I E N C E" until the print reset landed, and an ATS
// parsing that got nothing.
//
// WHY IT CLONES AND STRIPS RATHER THAN READING innerText DIRECTLY. The plate
// carries three things a paste must not contain: the two footer buttons, the
// print note, and the skip link. Removing them from a CLONE leaves the live
// page untouched — the alternative, hiding them around a read, mutates what the
// visitor is looking at.
//
// WHY LINK HREFS ARE APPENDED. `innerText` gives "LinkedIn", not the URL, so a
// pasted CV would lose both profiles. Print already solves this its own way —
// global.css reveals the href after external links on paper — and this is the
// same intent for the clipboard.
//
// RED WHEN: delete the `.cv-foot .btn` removal below and the paste starts
// carrying "Email me / The systems"; tests/cv-copy.spec.js checks for exactly
// that.

const plate = document.querySelector('.cv.plate[id]');
const button = document.querySelector('[data-copy-cv]');

// Every condition is a reason the control could not do its job, and a control
// that cannot work is never revealed — DEF-1 and DEF-2 are both on this site's
// record because a dead surface shipped once already.
if (plate && button && navigator.clipboard) {
  const label = button.querySelector('[data-copy-label]');
  const resting = label.textContent;
  let restore;

  button.hidden = false;

  const asPlainText = () => {
    const copy = plate.cloneNode(true);
    copy.querySelectorAll('.cv-foot .btn, .cv-print-note, .skip, [data-copy-cv]').forEach((n) => n.remove());

    // A profile link reads as its label alone once the markup is gone, so the
    // destination goes back in beside it. mailto is skipped: the address is
    // already the link's own text on this page.
    copy.querySelectorAll('a[href^="http"]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href && !a.textContent.includes(href)) a.textContent = `${a.textContent.trim()} (${href})`;
    });

    // innerText, not textContent: it respects rendered line breaks, which is
    // the difference between a CV and one unbroken paragraph. It needs the node
    // in the document to compute them, so the clone is attached, read, removed.
    copy.style.position = 'absolute';
    copy.style.left = '-9999px';
    document.body.appendChild(copy);
    const text = copy.innerText;
    copy.remove();

    return text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  };

  button.addEventListener('click', async () => {
    clearTimeout(restore);
    try {
      await navigator.clipboard.writeText(asPlainText());
      label.textContent = 'Copied';
    } catch {
      // Named, not swallowed. She still has the page and the print path; what
      // she must not get is a button reporting a success it did not have.
      label.textContent = 'Copy failed';
    }
    restore = setTimeout(() => {
      label.textContent = resting;
    }, 2000);
  });
}
