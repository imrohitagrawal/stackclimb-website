// The client entry point. Six small scripts, one import in Layout.astro.
//
// Extracted from that layout in D152 (P-22): the layout stood at 251 lines
// against D8's 250 ceiling, and a list of imports is exactly the "index, do not
// inline" shape the budget exists to force. Nothing here is new — the same six
// modules, in the same order, which matters because plates.js must run before
// reveal.js.
//
// Every one of them self-guards: each looks for its own hook and does nothing
// when the page has none, which is why the CV's copy control can live in the
// same bundle as the home page's plate machinery.
import './plates.js';
import './nav.js';
import './motion-toggle.js';
import './reveal.js';
import './practice-replay.js';
import './copy-email.js';
import './copy-cv.js';
