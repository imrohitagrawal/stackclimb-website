// Mobile menu enhancement (DEF-42, RCA-004). The <details> opens, navigates
// and closes-by-reload with no script at all; everything here is polish:
//
// 1. Close when a link inside is activated — a same-page fragment link does
//    not reload, so the panel would otherwise sit open over the destination.
// 2. Close on Escape, returning focus to the summary a keyboard user left.
// 3. Close on a click outside the panel.
//
// If this file throws on line one, the menu still works. That is the bar
// every control on this site has to clear (DEF-1).

const menu = document.querySelector('.site-nav .menu');

if (menu) {
  const summary = menu.querySelector(':scope > summary');

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) menu.open = false;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) {
      menu.open = false;
      summary.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
}
