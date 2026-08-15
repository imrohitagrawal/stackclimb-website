/* /experience's six eras — derived from cv.js, never retyped. The era LINE
 * (what changed) is new copy (P-18, presentation); org/role/dates import
 * from cv.js so the two surfaces cannot drift. RENDERED OLDEST → NEWEST —
 * the becoming-arc direction; /cv's reverse-chronological convention would
 * defeat this page's purpose (package-5 plan, recruiter-lens finding).
 *
 * ZERO DIGITS in any line — gated in experience.spec.js. A figure belongs
 * on /cv, under its own bullet, capture-bound; an era line states what
 * changed, not by how much.
 */
import { experience } from './cv.js';

const byOrg = Object.fromEntries(experience.map((j) => [j.org, j]));

export const eras = [
  { org: 'Subex', line: 'What a failure costs when the customer is watching.' },
  { org: 'Snapdeal', line: 'Quality on a platform moving faster than manual review.' },
  { org: 'Mobileum', line: 'Automating checks a release used to wait on a person for.' },
  { org: 'LimeRoad', line: 'Building frameworks, not just running them.' },
  { org: 'Amazon', line: 'Shifting quality left, into the same sprint as the code.' },
  { org: 'Oracle', line: 'A platform practice — then AI-assisted.' },
].map((e) => ({ ...e, job: byOrg[e.org] }));

// Denominator + chronology partners live in experience.spec.js, not here —
// this file states the copy; the gate proves it against cv.js.

export const closing =
  'The thread through all six: deciding whether software was safe to release — ' +
  'now applied to AI systems deciding that about themselves.';
