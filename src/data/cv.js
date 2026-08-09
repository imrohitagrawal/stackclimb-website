/* CV content, transcribed from assets/inbox/resume/Rohit_V3 — the authoritative
 * file under D36. The other resume fills gaps only, and where the two disagree
 * both values are recorded in docs/STATUS.md rather than silently resolved.
 *
 * TWO RULES GOVERN THIS FILE.
 *
 * 1. NO PERSONAL CONTACT DETAILS BEYOND EMAIL AND LINKEDIN. D38. The source
 *    PDFs carry a phone number on the contact line; it does not come here, and
 *    tests/no-pii.mjs blocks the commit if it does. Note that the gate does not
 *    scan .pdf or .docx (DEF-37), so the source files are invisible to it — the
 *    protection is that nothing is copied across, not that something would catch it.
 *
 * 2. EVERY NUMBER IS SELF-REPORTED UNLESS IT WAS COUNTED. The site's voice rule
 *    is "state what is proven, label what is not". The percentages below are the
 *    owner's own figures from his CV and cannot be checked from outside, so they
 *    ship labelled. Where a repo could be counted, the counted value wins over
 *    the CV — see `projects` below, where the CV is stale.
 */

export const identity = {
  name: 'Rohit Agrawal',
  // The site's positioning line, not the CV's five-title stack. docs/positioning-phase0.md
  // tested both: the CV leads quality-first, the site leads AI-first, and the
  // synthesis is that they are the same skill.
  title: 'Principal engineer — AI platform, evaluation and release governance',
  base: 'Bengaluru, India · IST (UTC+5:30)',
  relocation: 'Open to relocation worldwide, and to international travel',
  /* D42. Stated as AUTHORISATION, not as intent, and always after relocation.
     "H-1B approved" alone reads as "targeting the US"; a list of places where
     the paperwork question is already settled does not. The owner is open
     worldwide and the copy must not narrow that.
     Checked against tech-resume-optimizer's contact-section guidance: state
     only what can be discussed, keep it factual, no photo, city is enough. */
  authorisation: 'India · United States — H-1B approved',
  email: 'rohit.ra.agrawal@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rohitagrawal14',
  github: 'https://github.com/imrohitagrawal',
};

export const summary = [
  `Fourteen years deciding whether software was safe to release — and since April 2026,
   building AI systems that make that decision about themselves.`,
  `Quality engineering, test architecture and release governance across Oracle, Amazon,
   LimeRoad, Mobileum, Snapdeal and Subex, and most recently seven years at Oracle as a
   Principal Member of Technical Staff on Oracle Analytics.`,
  `The independent work applies the same discipline to AI: citation-grounded retrieval,
   disclosed uncertainty, explicit refusal, and evaluation gates that can block a release.
   Four of the six systems are gates.`,
];

/* Reverse chronological. `scope` is one line; `points` are the owner's own
 * achievement statements, condensed but not reworded into claims he did not make.
 * Every percentage here is self-reported and the page labels it once, at the top
 * of the section, rather than repeating the caveat on each line.
 */
export const experience = [
  {
    org: 'Oracle',
    role: 'Principal Member of Technical Staff',
    from: 'April 2019',
    to: 'April 2026',
    scope: `Oracle Analytics, on Oracle Cloud Infrastructure and Oracle Analytics Cloud —
            building enterprise quality engineering practice across the platform.`,
    points: [
      'Architected AI-driven quality engineering frameworks across enterprise cloud services — LLM-assisted test generation, intelligent test selection, self-healing automation and predictive quality analytics — reducing manual test design effort by 40%.',
      'Increased API automation coverage from 65% to 95%, reducing regression execution effort by 25% and production defects by 20%.',
      'Championed shift-right quality engineering with production monitoring, canary testing, synthetic monitoring and observability dashboards, reducing production incidents by 20% and accelerating root-cause analysis by 35%.',
      'Led the migration from Selenium to Playwright with Docker-based parallel execution, cutting regression execution time by 25% and flaky tests by 20%.',
      'Automated Terraform-based validation across 23+ Oracle Cloud regions.',
      'Defined enterprise-wide quality engineering standards and governance metrics while mentoring 11+ quality engineers and SDETs globally.',
    ],
  },
  {
    org: 'Amazon',
    role: 'QA Engineer II',
    from: 'May 2017',
    to: 'September 2018',
    scope: 'End-to-end quality engineering for distributed enterprise platforms.',
    points: [
      'Increased UI and API automation coverage by 25% and reduced regression execution time by 20%.',
      'Implemented shift-left testing across Agile and SAFe programmes, reducing defect leakage by 10%.',
      'Selected among the top five finalists for the Amazon D2AS innovation award.',
    ],
  },
  {
    org: 'LimeRoad',
    role: 'Senior SDET',
    from: 'October 2015',
    to: 'May 2017',
    scope: 'Automation frameworks and payment integrity for a consumer marketplace.',
    points: [
      'Built Selenium and Rest Assured automation frameworks, increasing coverage by 30% and cutting regression time by 25%.',
      'Validated payment gateway integrations across web, Android, iOS and mobile, reducing payment-related production defects by 25%.',
    ],
  },
  {
    org: 'Mobileum',
    role: 'Senior Software Test Engineer',
    from: 'April 2015',
    to: 'September 2015',
    scope: 'Build sanity and big-data validation.',
    points: [
      'Automated build sanity and Hadoop data validation, improving pipeline accuracy by 10% and reducing manual release-validation effort by roughly 35%.',
    ],
  },
  {
    org: 'Snapdeal',
    role: 'QA Engineer II',
    from: 'June 2014',
    to: 'April 2015',
    scope: 'E-commerce platform quality.',
    points: [],
  },
  {
    org: 'Subex',
    role: 'Product Specialist',
    from: 'July 2011',
    to: 'June 2014',
    scope: 'Telecom revenue-assurance products, working directly with customers.',
    points: [
      'Multiple customer excellence awards for resolving critical customer issues, maintaining 99% SLA adherence.',
      'Chief People Officer recognition, and new business acquisition with StarHub.',
    ],
  },
];

/* The independent systems. Numbers here are COUNTED at a named commit, not taken
 * from the CV — DEF-31 found the CV's CiteVyn figures ("361+ tests, 50/50 golden")
 * are stale against the repository, which holds 1,036 test functions and a 52-case
 * golden run. D36 makes Rohit_V3 authoritative over the OTHER resume, not over a
 * count run against the code. The site is right and the CV is out of date.
 */
export const projects = [
  {
    name: 'CiteVyn',
    what: 'Citation-grounded Q&A over official AI documentation. Answers quote their sources verbatim; where no source supports an answer it refuses rather than guessing.',
    gate: 'A 52-case golden run blocks index promotion. A single red case stops the release.',
    state: 'Live',
    href: 'https://citevyn.stackclimb.com',
  },
  {
    name: 'Quorum-AI',
    what: 'One question against four models in parallel, two rounds of mutual critique, then a synthesis returning consensus, disagreement, source support, uncertainty and a recommendation.',
    gate: 'Cost is approved before anything runs; any fallback or simulation is disclosed, never hidden.',
    state: 'Live',
    href: 'https://quorum.stackclimb.com',
  },
  {
    name: 'SaafSaans',
    what: 'A Delhi-NCR air-quality companion scoring personal rather than city risk across 21 stations, with cited health guidance.',
    gate: 'Every reading is labelled live, deterministic fallback, or sample. The Hindi translation ships behind a banner stating no Hindi speaker has reviewed it.',
    state: 'Deployed — sleeps when idle',
    href: 'https://github.com/imrohitagrawal/saaf-saans',
  },
  {
    name: 'NarraTwin AI',
    what: 'Grounded walkthrough generation with citations, claim evaluation and consent checks.',
    gate: 'Its own release-readiness review reads No-Go, so it is not deployed. It is shown anyway, because the gate holding is the point.',
    state: 'Phase 1 — No-Go',
    href: 'https://github.com/imrohitagrawal/narratwin-ai',
  },
  {
    name: 'EvalAxis',
    what: 'Evaluates LLM, RAG and agent changes against committed baselines — faithfulness, answer relevancy, hallucination, context precision and recall.',
    gate: 'Fails the CI build when quality regresses. This is the whole product.',
    state: 'In progress — closed',
    href: null,
  },
  {
    name: 'Aegis Contracts',
    what: 'Early-stage work on contract-shaped guarantees between AI systems.',
    gate: 'Too early to state one.',
    state: 'In progress — closed',
    href: null,
  },
];

export const education = {
  degree: 'Bachelor of Engineering, Information Science & Engineering',
  school: 'Visvesvaraya Technological University, India',
  year: '2011',
};

export const certifications = [
  { name: 'Google Cloud Gen AI Academy APAC — Cohort 2', issuer: 'Google Cloud', year: '2026' },
  { name: 'Generative AI Bootcamp — NSDC Skill India verified', issuer: 'GrowthSchool', year: '2026' },
  { name: 'Oracle Cloud Infrastructure Associate', issuer: 'Oracle', year: '2021' },
];

export const awards = [
  'Oracle Rockstar Award (2024) — for API automation coverage and the drop in production issues',
  'Amazon D2AS Innovation Finalist — top five',
  'Customer Excellence Awards, Subex — multiple',
  'BugATAhon 2016 — regional 2nd runner-up',
];

export const skills = [
  { group: 'AI quality engineering', items: 'LLM and RAG evaluation · LLM-as-judge · hallucination detection · drift detection · AI observability · prompt and context engineering · multi-LLM orchestration · LangGraph · CrewAI' },
  { group: 'Test engineering', items: 'Test architecture · API, microservices and contract testing · performance · UI · database · defect prevention' },
  { group: 'Automation', items: 'Playwright · Selenium WebDriver · Rest Assured · Pytest · TestNG · JUnit · Postman' },
  { group: 'Platform and DevOps', items: 'Kubernetes · Terraform · Docker · Jenkins · CI/CD quality gates · AWS · Oracle Cloud Infrastructure' },
  { group: 'Languages', items: 'Java · Python · JavaScript · TypeScript · SQL · shell' },
  { group: 'Data and backend', items: 'PostgreSQL · pgvector · Redis · ClickHouse · MongoDB · DynamoDB · Oracle Database · FastAPI' },
  { group: 'Observability', items: 'OpenTelemetry · Prometheus · Grafana · Langfuse · Loki' },
];
