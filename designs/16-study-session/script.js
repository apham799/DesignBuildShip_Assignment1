(() => {
  const P = window.PORTFOLIO;
  const ROOT = '../../';
  const $ = id => document.getElementById(id);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => v != null && n.setAttribute(k, v));
    kids.flat(Infinity).forEach(k => { if (k != null && k !== false) n.append(k); });
    return n;
  }
  const link = (href, label) => el('a', { href, target: '_blank', rel: 'noopener' }, label);
  const project = id => P.projects.find(p => p.id === id);
  const bs = P.degrees.find(d => d.id === 'bs'), ba = P.degrees.find(d => d.id === 'ba');
  const bu = project('buoyance'), pp = project('penpal'), dv = project('diver');
  const say = t => { $('status').textContent = t; };

  /* =====================================================================
     The seven tasks, one per stop, in the order things happened. Each prompt only asks for something
     that is already on the page, so finding it is the whole task.
     ===================================================================== */
  const TASKS = [
    { id: 'ug',       short: 'Undergrad', era: 'Undergrad',       prompt: 'Find out what Alan studied as an undergraduate.' },
    { id: 'diver',    short: dv.shortTitle, era: dv.era,          prompt: 'Find the course project that was about virtual reality.' },
    { id: 'penpal',   short: pp.title,     era: pp.era,           prompt: 'Find the class project that came after it and before Alan joined a lab.' },
    { id: 'axlab',    short: 'AxLab',      era: P.labEra,         prompt: 'Find out where Alan’s research happens.' },
    { id: 'mpcs',     short: 'MPCS',       era: 'Master’s begins', prompt: 'Find the program Alan is in now.' },
    { id: 'buoyance', short: bu.title,     era: bu.era,           prompt: 'Find the work that was published, and see what it looks like.' },
    { id: 'now',      short: 'Now',        era: 'Second year',    prompt: 'Find out who advises Alan and what year he is in.' }
  ];
  const N = TASKS.length;

  function words(id) {
    if (id === 'ug') return { title: 'Two degrees, in parallel', body: [el('p', { class: 'lead' }, `${bs.title} (${bs.note}) and ${ba.title}.`), el('p', null, 'I double majored in Computer Science and Economics.')] };
    if (id === 'mpcs') return { title: 'Pre-Doctoral MPCS', body: [el('p', { class: 'lead' }, P.program + '.'), el('p', null, P.about[0])] };
    if (id === 'axlab') return { title: P.lab, body: [el('p', { class: 'lead' }, P.labStory), el('p', null, P.about[1])] };
    if (id === 'now') return { title: P.standing, body: [el('p', { class: 'lead' }, `Advised by ${P.advisor} at the ${P.lab}.`), el('p', null, P.about[2])] };
    const p = project(id);
    return { title: p.title, body: [
      el('p', { class: 'lead' }, p.summary), p.story && el('p', null, p.story),
      p.publication && el('p', { class: 'cite' }, `${p.publication.authors}. `, el('i', null, p.publication.title), `. ${p.publication.venue}.`),
      p.links && el('ul', { class: 'links', 'aria-label': p.title + ' links' }, p.links.map(l => el('li', null, link(l.url, l.label)))),
      p.tags && p.tags.length > 0 && el('ul', { class: 'chips', 'aria-label': 'Topics' }, p.tags.map(t => el('li', null, t)))
    ] };
  }
  function photos() {
    // the first photo is wide; the rest fill two columns, each going into whichever is shorter
    const [lead, ...rest] = bu.images, cols = [[], []], heights = [0, 0];
    const fig = img => el('figure', { class: 'photo' }, el('img', { src: ROOT + img.src, alt: img.alt, loading: 'lazy', width: img.w, height: img.h }), el('figcaption', null, img.caption));
    rest.forEach(img => { const c = heights[0] <= heights[1] ? 0 : 1; cols[c].push(fig(img)); heights[c] += (img.w && img.h ? img.h / img.w : 0.75) + 0.2; });
    return el('div', { class: 'photos' }, fig(lead), el('div', { class: 'photo-cols' }, cols.map(col => el('div', { class: 'photo-col' }, col))));
  }

  /* ---------- everything you enter lives in this object and nowhere else ---------- */
  const fresh = () => ({
    stage: 'consent', task: 0, notes: '',
    tasks: TASKS.map(() => ({ shown: false, t0: null, secs: null, ease: null })),
    likert: [null, null, null, null]
  });
  let S = fresh();

  /* ---------- the info card ---------- */
  $('title').textContent = P.name;
  $('tagline').textContent = P.tagline;
  $('researcher').append(el('img', { src: ROOT + P.headshot.src, alt: P.headshot.alt, width: 800, height: 1000 }), el('figcaption', null, 'The researcher'));
  $('facts').append(
    el('dt', null, 'Advisor'), el('dd', null, P.advisor),
    el('dt', null, 'Lab'), el('dd', null, P.lab),
    el('dt', null, 'Length'), el('dd', null, 'About five minutes'),
    el('dt', null, 'Your data'), el('dd', null, 'Nothing you enter is stored or sent. Reloading clears it.'));

  /* ---------- the steps ---------- */
  const STEPS = [
    { id: 'consent',   label: 'Consent' },
    { id: 'tasks',     label: 'Tasks' },
    { id: 'interview', label: 'Interview' },
    { id: 'survey',    label: 'Questionnaire' },
    { id: 'debrief',   label: 'Debrief' }
  ];
  const stepBtns = STEPS.map((s, i) => {
    const b = el('button', { type: 'button', class: 'step' }, el('span', { class: 'dot', 'aria-hidden': 'true' }, String(i + 1)), el('span', { class: 'lbl' }, s.label));
    b.addEventListener('click', () => go(s.id));
    $('stepper').append(el('li', null, b));
    return b;
  });

  const stages = {};
  const stagesEl = $('stages');
  function stage(id, title, ...kids) {
    const sec = el('section', { class: 'stage', id: 'st-' + id, 'aria-labelledby': 'h-' + id, hidden: '' }, el('h2', { id: 'h-' + id, tabindex: '-1' }, title), kids);
    stages[id] = sec; stagesEl.append(sec);
    return sec;
  }
  const btn = (label, cls, fn) => { const b = el('button', { type: 'button', class: 'btn ' + cls }, label); b.addEventListener('click', fn); return b; };

  function go(id, opts = {}) {
    const consented = consent.every(c => c.checked);
    if (['tasks', 'interview', 'survey'].includes(id) && !consented) { say('Please confirm the three statements first.'); return; }
    S.stage = id;
    Object.entries(stages).forEach(([k, sec]) => { sec.hidden = k !== id; });
    const idx = STEPS.findIndex(s => s.id === id);
    stepBtns.forEach((b, i) => {
      b.disabled = i > 0 && i < 4 && !consented;
      b.classList.toggle('current', i === idx);
      b.classList.toggle('done', i < idx);
      b.setAttribute('aria-current', i === idx ? 'step' : 'false');
    });
    if (id === 'tasks') renderTask();
    if (id === 'debrief') renderDebrief();
    if (opts.focus !== false) {
      $('h-' + id).focus({ preventScroll: true });
      $('flow').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    if (!opts.quiet) say(`Step ${idx + 1} of ${STEPS.length}: ${STEPS[idx].label}.`);
  }

  /* ===== 1. information and consent ===== */
  const CONSENT = [
    'I understand that this is a portfolio presented as a short study session.',
    'I understand that nothing I enter is stored or sent anywhere.',
    'I understand that I can skip to the debrief at any time.'
  ];
  const consent = CONSENT.map((t, i) => el('input', { type: 'checkbox', id: 'c' + i }));
  const begin = btn('Begin the session →', 'primary', () => go('tasks'));
  begin.disabled = true; begin.setAttribute('aria-describedby', 'beginHint');
  consent.forEach(c => c.addEventListener('change', () => {
    const ok = consent.every(x => x.checked);
    begin.disabled = !ok;
    $('beginHint').textContent = ok ? 'Thank you. You can begin.' : 'Tick all three boxes to begin.';
    go(S.stage, { focus: false, quiet: true });                  // refreshes which steps are unlocked
  }));
  stage('consent', 'Information and consent',
    el('p', { class: 'lead' }, 'You are invited to take part in a short study. You will complete seven small tasks, answer one interview question and fill in a short questionnaire.'),
    el('p', null, 'The “findings” are the stops on my research path, in the order they happened, so finishing the tasks means reading my portfolio.'),
    el('fieldset', { class: 'consent' }, el('legend', null, 'Please confirm each statement'),
      CONSENT.map((t, i) => el('div', { class: 'check' }, consent[i], el('label', { for: 'c' + i }, t)))),
    el('div', { class: 'actions' }, begin, el('button', { type: 'button', class: 'btn link', id: 'skip' }, 'Skip to the debrief')),
    el('p', { class: 'hint', id: 'beginHint' }, 'Tick all three boxes to begin.'));
  $('skip').addEventListener('click', () => go('debrief'));

  /* ===== 2. tasks ===== */
  const taskNav = el('ol', { class: 'tasknav', 'aria-label': 'Tasks' });
  const taskBtns = TASKS.map((t, i) => {
    const b = el('button', { type: 'button', 'aria-label': `Task ${i + 1}: ${t.short}` }, String(i + 1));
    b.addEventListener('click', () => { S.task = i; renderTask(); });
    taskNav.append(el('li', null, b));
    return b;
  });
  const taskBody = el('div', { class: 'task' });
  stage('tasks', 'Tasks', el('p', { class: 'hint' }, 'Seven tasks, one for each stop. Do them in any order.'), taskNav, taskBody);

  function renderTask() {
    const i = S.task, t = TASKS[i], r = S.tasks[i];
    if (r.t0 == null) r.t0 = performance.now();
    taskBtns.forEach((b, k) => { b.classList.toggle('current', k === i); b.classList.toggle('done', S.tasks[k].shown); b.setAttribute('aria-current', k === i ? 'step' : 'false'); });
    const kids = [
      el('p', { class: 'kicker' }, `Task ${i + 1} of ${N}`),
      el('p', { class: 'prompt' }, t.prompt)
    ];
    if (!r.shown) {
      kids.push(el('div', { class: 'actions' }, btn('Show me', 'primary', () => {
        r.shown = true; r.secs = Math.max(1, Math.round((performance.now() - r.t0) / 1000));
        renderTask(); $('ans-h').focus({ preventScroll: true }); say('The answer is shown.');
      })));
    } else {
      const w = words(t.id);
      kids.push(el('div', { class: 'answer' },
        el('p', { class: 'kicker' }, `Found · ${t.era}`),
        el('h3', { id: 'ans-h', tabindex: '-1' }, w.title), w.body, t.id === 'buoyance' && photos()));
      const seq = el('fieldset', { class: 'seq' }, el('legend', null, 'Overall, how easy or difficult was this task?'),
        el('div', { class: 'scale' }, [1, 2, 3, 4, 5, 6, 7].map(v => {
          const inp = el('input', { type: 'radio', name: 'seq' + i, id: `seq${i}-${v}`, value: String(v), 'aria-label': `${v}${v === 1 ? ', very difficult' : v === 7 ? ', very easy' : ''}` });
          if (r.ease === v) inp.checked = true;
          inp.addEventListener('change', () => { r.ease = v; say(`Rated ${v} out of 7.`); });
          return el('div', { class: 'opt' }, inp, el('label', { for: `seq${i}-${v}`, 'aria-hidden': 'true' }, String(v)));
        })),
        el('div', { class: 'ends', 'aria-hidden': 'true' }, el('span', null, 'Very difficult'), el('span', null, 'Very easy')));
      kids.push(seq);
    }
    kids.push(el('div', { class: 'actions between' },
      i > 0 ? btn('← Previous task', 'ghost', () => { S.task = i - 1; renderTask(); }) : el('span'),
      i < N - 1 ? btn('Next task →', r.shown ? 'primary' : 'ghost', () => { S.task = i + 1; renderTask(); })
                : btn('Finish the tasks →', 'primary', () => go('interview'))));
    taskBody.replaceChildren(...kids.flat(Infinity).filter(Boolean));
  }

  /* ===== 3. interview ===== */
  const notes = el('textarea', { id: 'notes', rows: '5' });
  notes.addEventListener('input', () => { S.notes = notes.value; });
  stage('interview', 'Interview',
    el('p', { class: 'lead' }, 'One question, and you can leave it blank.'),
    el('label', { for: 'notes', class: 'q' }, 'What stood out to you?'), notes,
    el('p', { class: 'hint' }, 'Your answer stays in this page. It appears in the debrief and nowhere else.'),
    el('div', { class: 'actions between' }, btn('← Back to the tasks', 'ghost', () => go('tasks')), btn('Continue →', 'primary', () => go('survey'))));

  /* ===== 4. questionnaire ===== */
  const STATEMENTS = [
    'It was easy to find what I was looking for.',
    'I understand what Alan researches.',
    'I would like to read more about Buoyancé.',
    'Seeing this as a study made it easier to remember.'
  ];
  const LIKERT = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
  const surveyKids = STATEMENTS.map((s, i) => el('fieldset', { class: 'likert' }, el('legend', null, s),
    el('div', { class: 'scale five' }, LIKERT.map((lab, k) => {
      const inp = el('input', { type: 'radio', name: 'lk' + i, id: `lk${i}-${k}`, value: String(k + 1), 'aria-label': `${k + 1}, ${lab.toLowerCase()}` });
      inp.addEventListener('change', () => { S.likert[i] = k + 1; });
      return el('div', { class: 'opt' }, inp, el('label', { for: `lk${i}-${k}` }, el('b', null, String(k + 1)), el('span', null, lab)));
    }))));
  stage('survey', 'Questionnaire', el('p', { class: 'lead' }, 'Four statements. Choose the answer closest to how you feel.'), el('p', { class: 'hint' }, '1 means strongly disagree and 5 means strongly agree.'), surveyKids,
    el('div', { class: 'actions between' }, btn('← Back', 'ghost', () => go('interview')), btn('Finish and see the debrief →', 'primary', () => go('debrief'))));

  /* ===== 5. debrief ===== */
  const debriefBody = el('div', { class: 'debrief' });
  stage('debrief', 'Debrief', debriefBody);
  function renderDebrief() {
    const done = S.tasks.filter(r => r.shown).length;
    const eases = S.tasks.map(r => r.ease).filter(Boolean);
    const mean = eases.length ? (eases.reduce((a, b) => a + b, 0) / eases.length).toFixed(1) : null;
    const table = el('table', { class: 'results' },
      el('caption', null, 'Your results'),
      el('thead', null, el('tr', null, ['Task', 'Stop', 'Time to find', 'Ease (1–7)'].map(h => el('th', { scope: 'col' }, h)))),
      el('tbody', null, TASKS.map((t, i) => {
        const r = S.tasks[i];
        const go1 = el('button', { type: 'button', class: 'btn link' }, `${t.short}`);
        go1.addEventListener('click', () => { S.task = i; go('tasks'); });
        return el('tr', null, el('td', null, String(i + 1)), el('td', null, go1, t.era !== t.short && el('span', { class: 'sub' }, ` ${t.era}`)),
          el('td', null, r.secs != null ? `${r.secs} s` : '—'), el('td', null, r.ease != null ? String(r.ease) : '—'));
      })));
    const bars = el('div', { class: 'bars' }, STATEMENTS.map((s, i) => {
      const v = S.likert[i];
      return el('div', { class: 'bar-row' }, el('p', null, s), el('div', { class: 'track', 'aria-hidden': 'true' }, el('i', { style: `width:${v ? v * 20 : 0}%` })),
        el('span', { class: 'val' }, v ? `${v} of 5, ${LIKERT[v - 1].toLowerCase()}` : 'not answered'));
    }));
    debriefBody.replaceChildren(
      el('p', { class: 'lead' }, done || S.notes || S.likert.some(Boolean) ? 'Thank you for taking part.' : 'You skipped straight to the end, which is allowed. Here is the rest.'),
      el('div', { class: 'summary' },
        el('div', null, el('b', null, `${done} of ${N}`), el('span', null, 'tasks completed')),
        el('div', null, el('b', null, mean ?? '—'), el('span', null, 'mean ease, out of 7'))),
      table,
      el('h3', null, 'Questionnaire'), bars,
      S.notes.trim() && el('div', { class: 'quote' }, el('h3', null, 'What stood out to you'), el('blockquote', null, S.notes.trim())),
      el('h3', null, 'About the researcher'), el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('h3', null, 'Get in touch'),
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio'))),
      el('div', { class: 'actions' }, btn('Start the session again', 'ghost', restart)));
  }
  function restart() {
    S = fresh();
    consent.forEach(c => { c.checked = false; });
    begin.disabled = true; $('beginHint').textContent = 'Tick all three boxes to begin.';
    notes.value = '';
    surveyKids.forEach(f => f.querySelectorAll('input').forEach(i => { i.checked = false; }));
    go('consent');
  }

  /* ---------- About and Contact ---------- */
  const dlg = $('dlg'), dlgBody = $('dlgBody');
  function openDialog(title, kicker, body) {
    dlgBody.replaceChildren(el('p', { class: 'kicker' }, kicker), el('h2', { id: 'dlg-title' }, title), ...body);
    dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.open === 'about') openDialog('About', 'The researcher', [
      el('p', null, P.about[0]), el('p', null, P.about[1]), el('p', null, P.about[2]),
      el('dl', { class: 'facts2' }, el('dt', null, 'Program'), el('dd', null, P.program), el('dt', null, 'Undergrad'), el('dd', null, P.undergrad), el('dt', null, 'Lab'), el('dd', null, `${P.lab}, advised by ${P.advisor}`))]);
    else openDialog('Say hello', 'Contact', [
      el('a', { class: 'big', href: 'mailto:' + P.contact.email }, P.contact.email),
      el('ul', { class: 'links' }, el('li', null, link(P.contact.linkedin, 'LinkedIn')), el('li', null, link(P.contact.previousSite, 'Previous portfolio')))]);
  }));

  go('consent', { focus: false });
})();
