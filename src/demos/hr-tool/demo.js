/* People Desk – HR tool demo.
   All people, companies, e-mails and documents are fictional sample data.
   Nothing is sent anywhere: AI steps, e-mails, tickets and notifications are simulated. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-hr', function (root, ctx) {
    var esc = SDA.esc, I = SDA.icon, fmtDate = SDA.fmtDate, money = SDA.money;
    var q1 = function (s, r) { return (r || root).querySelector(s); };
    var STEP = SDA.reduce ? 40 : 230;
    var PERSON = { emp: 'James Taylor', hr: 'Laura White', mgr: 'Michael Brown' };
    var role = 'hr', view = 'rec';

    /* ---------- icons ---------- */
    var ic = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var ICO = {
      rec: ic('<circle cx="9" cy="8" r="3"/><path d="M3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4"/><path d="M16 5h5M16 9h5M17.5 13h3.5"/>'),
      tix: ic('<path d="M4 4h16v12H9l-5 4z"/><path d="M8 9h8M8 12h5"/>'),
      docs: ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
      leave: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
      ask: ic('<path d="M12 3a8 8 0 0 0-6.9 12L4 20l5-1.1A8 8 0 1 0 12 3z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.5M12 16.5h.01"/>'),
      apv: ic('<path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="4"/>'),
      int: ic('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>'),
      mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
      clip: ic('<path d="M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3l8-8"/>'),
      left: ic('<path d="m15 6-6 6 6 6"/>'),
      right: ic('<path d="m9 6 6 6-6 6"/>'),
      x: ic('<path d="M18 6 6 18M6 6l12 12"/>')
    };

    /* ---------- dates ---------- */
    var now = new Date(); now.setHours(12, 0, 0, 0);
    var addD = function (d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; };
    var base = (function () { var k = (8 - now.getDay()) % 7; return addD(now, k === 0 ? 7 : k); })(); // next Monday
    var wd = function (w, i) { return addD(base, w * 7 + i); };
    var pad = function (n) { return ('0' + n).slice(-2); };
    var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var parseIso = function (s) { var p = String(s || '').split('-'); if (p.length !== 3) return null; var d = new Date(+p[0], p[1] - 1, +p[2], 12); return isNaN(d) ? null : d; };
    var short = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    var dayName = function (d) { return d.toLocaleDateString('en-US', { weekday: 'short' }); };
    var wday = function (d) { return dayName(d) + ' ' + short(d); };
    var isWork = function (d) { var k = d.getDay(); return k > 0 && k < 6; };
    var workDays = function (a, b) { var n = 0, d = new Date(a); while (d <= b) { if (isWork(d)) n++; d = addD(d, 1); } return n; };
    var nextWork = function (d, n) { var x = new Date(d); while (n > 0) { x = addD(x, 1); if (isWork(x)) n--; } return x; };
    var stamp = function () { return short(new Date()) + ', ' + SDA.fmtTime(new Date()); };
    var initials = function (n) { return n.split(' ').map(function (p) { return p.charAt(0); }).join('').slice(0, 2).toUpperCase(); };
    var plural = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };

    /* ---------- jobs + candidates ---------- */
    var JOBS = {
      se: { code: 'SE-15', title: 'Solutions Engineer', short: 'Solutions Eng.', req: ['JavaScript', 'SQL', 'REST APIs', 'Integrations', 'Product demos'] },
      csm: { code: 'CS-12', title: 'Customer Success Manager', short: 'Customer Success', req: ['Customer onboarding', 'CRM', 'Renewals', 'SaaS', 'Communication'] }
    };
    var STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
    var LVL = ['none', 'basic', 'working', 'good', 'strong', 'expert'];
    var QS = {
      'JavaScript': 'Walk us through a script you wrote to automate a customer integration.',
      'SQL': 'How would you find customers whose usage dropped by 30% last month?',
      'REST APIs': 'How do you debug a failing webhook between two systems?',
      'Integrations': 'Describe an integration you delivered end to end. What broke first?',
      'Product demos': 'Give a five-minute demo of a product you know for a non-technical buyer.',
      'Customer onboarding': 'How do you structure the first 30 days of a new enterprise customer?',
      'CRM': 'Which CRM fields do you rely on to spot churn risk early?',
      'Renewals': 'Tell us about a renewal you saved. Which signals did you act on?',
      'SaaS': 'Which SaaS metrics would you report to leadership every month, and why?',
      'Communication': 'How do you deliver bad news to a key customer?'
    };
    var C = [
      { id: 'c1', name: 'Olivia Harris', job: 'se', stage: 0, yrs: 5, email: 'olivia.harris@example.com', phone: '+1 (555) 013-4471', loc: 'Portland, OR', source: 'Careers page', applied: -4,
        skills: { 'JavaScript': 5, 'REST APIs': 4, 'SQL': 3, 'Product demos': 3, 'Integrations': 3 },
        summary: 'Solutions engineer with five years in B2B software. Builds API integrations and runs technical demos for mid-market buyers.',
        exp: [['2022 – today', 'Solutions Engineer', 'Brightline Software'], ['2020 – 2022', 'Implementation Consultant', 'Northgate Retail Tech']],
        hl: ['Built 40+ customer integrations with REST APIs and webhooks', 'Cut average onboarding time from six to four weeks'], edu: 'B.Sc. Computer Science, Lakeside University (2019)' },
      { id: 'c2', name: 'Daniel Clark', job: 'se', stage: 0, yrs: 2, email: 'daniel.clark@example.com', phone: '+1 (555) 017-2208', loc: 'Denver, CO', source: 'Job board', applied: -2,
        skills: { 'JavaScript': 3, 'SQL': 2, 'REST APIs': 2, 'Product demos': 1 },
        summary: 'Junior developer moving into customer-facing technical work. Quick learner with a support background.',
        exp: [['2024 – today', 'Technical Support Engineer', 'Harbor & Pine Insurance'], ['2023 – 2024', 'Web Developer (intern)', 'Summit Analytics']],
        hl: ['Resolved 1,200+ tier-2 tickets with 96% satisfaction', 'Wrote internal API test scripts in JavaScript'], edu: 'B.Sc. Information Systems, Westbrook College (2023)' },
      { id: 'c3', name: 'Julia Young', job: 'se', stage: 1, yrs: 7, email: 'julia.young@example.org', phone: '+1 (555) 012-9034', loc: 'Chicago, IL', source: 'Referral (Emma Davis)', applied: -9,
        skills: { 'JavaScript': 4, 'SQL': 5, 'REST APIs': 5, 'Integrations': 4, 'Product demos': 2 },
        summary: 'Integration specialist with seven years of experience connecting CRM, billing and data platforms for SaaS customers.',
        exp: [['2021 – today', 'Senior Integration Engineer', 'Clearwater Health Systems'], ['2019 – 2021', 'Data Engineer', 'Bluefield Logistics']],
        hl: ['Owns 25 production integrations with 99.9% uptime', 'Designed the SQL reporting layer used by 300 customers'], edu: 'M.Sc. Data Engineering, Riverside Institute of Technology (2019)', lang: 'English (native) · German (basic)' },
      { id: 'c4', name: 'Grace Lee', job: 'se', stage: 2, yrs: 6, email: 'grace.lee@example.com', phone: '+1 (555) 019-5512', loc: 'Remote (Seattle, WA)', source: 'Careers page', applied: -15,
        skills: { 'JavaScript': 4, 'SQL': 4, 'REST APIs': 4, 'Product demos': 5, 'Integrations': 3 },
        summary: 'Customer-facing engineer who enjoys the first technical conversation. Runs discovery and demos, then hands over clean specifications.',
        exp: [['2021 – today', 'Sales Engineer', 'Summit Analytics'], ['2018 – 2021', 'Software Developer', 'Brightline Software']],
        hl: ['Supported $3.1M in new annual contract value in 2025', 'Built the demo environment used by the whole sales team'], edu: 'B.Sc. Software Engineering, Lakeside University (2018)', lang: 'English (native) · Korean (fluent)',
        iv: { d: 3, t: '10:00' } },
      { id: 'c5', name: 'Ryan Scott', job: 'csm', stage: 1, yrs: 4, email: 'ryan.scott@example.com', phone: '+1 (555) 016-7720', loc: 'Atlanta, GA', source: 'Job board', applied: -7,
        skills: { 'Customer onboarding': 4, 'CRM': 4, 'SaaS': 3, 'Communication': 4, 'Renewals': 2 },
        summary: 'Customer success manager for SMB accounts. Calm communicator who turns onboarding into repeatable playbooks.',
        exp: [['2022 – today', 'Customer Success Manager', 'Bluefield Logistics Software'], ['2020 – 2022', 'Account Coordinator', 'Northgate Retail Tech']],
        hl: ['Manages 90 SMB accounts with 94% gross retention', 'Wrote the onboarding playbook used by 8 colleagues'], edu: 'B.A. Communication, Westbrook College (2020)' },
      { id: 'c6', name: 'Ava Martinez', job: 'csm', stage: 0, yrs: 3, email: 'ava.martinez@example.net', phone: '+1 (555) 018-3346', loc: 'Phoenix, AZ', source: 'Careers page', applied: -1,
        skills: { 'Customer onboarding': 3, 'Communication': 5, 'CRM': 3, 'SaaS': 2 },
        summary: 'Former hospitality manager, now three years in SaaS customer support and onboarding. Bilingual English and Spanish.',
        exp: [['2023 – today', 'Onboarding Specialist', 'Clearwater Health Systems'], ['2018 – 2023', 'Guest Services Manager', 'Harborview Hotels']],
        hl: ['Onboarded 150 clinics in two years', 'Highest customer satisfaction score on the team in 2025'], edu: 'B.A. Business Administration, State College of Arizona (2017)', lang: 'English (native) · Spanish (native)' },
      { id: 'c7', name: 'Sophie Turner', job: 'csm', stage: 3, yrs: 8, email: 'sophie.turner@example.com', phone: '+1 (555) 011-6082', loc: 'Boston, MA', source: 'Referral (Michael Brown)', applied: -24,
        skills: { 'Customer onboarding': 5, 'CRM': 4, 'Renewals': 5, 'SaaS': 5, 'Communication': 4 },
        summary: 'Senior customer success manager for enterprise SaaS accounts with a strong record in renewals and expansion.',
        exp: [['2020 – today', 'Senior Customer Success Manager', 'Summit Analytics'], ['2017 – 2020', 'Customer Success Manager', 'Brightline Software']],
        hl: ['Owns a $4.2M renewal book with 112% net retention', 'Mentors four junior customer success managers'], edu: 'MBA, Riverside Business School (2017)',
        iv: { d: -8, t: '14:00' }, fb: { score: 4, rec: 'Hire', text: 'Excellent renewal stories and very structured. Wants to grow into a team lead role within two years.' } },
      { id: 'c8', name: 'Ethan Moore', job: 'csm', stage: 4, yrs: 5, email: 'ethan.moore@example.com', phone: '+1 (555) 015-4419', loc: 'Columbus, OH', source: 'Job board', applied: -40,
        skills: { 'Customer onboarding': 4, 'CRM': 5, 'Renewals': 4, 'SaaS': 4, 'Communication': 4 },
        summary: 'Customer success manager with five years in B2B SaaS. Data-driven, strong CRM hygiene and forecasting.',
        exp: [['2021 – today', 'Customer Success Manager', 'Northgate Retail Tech'], ['2019 – 2021', 'Sales Operations Analyst', 'Harbor & Pine Insurance']],
        hl: ['Built the churn-risk dashboard used by leadership', 'Raised renewal forecast accuracy to 95%'], edu: 'B.Sc. Economics, Lakeside University (2019)',
        iv: { d: -20, t: '11:00' }, fb: { score: 5, rec: 'Strong hire', text: 'Clear thinker, great with data. Start as soon as possible.' } }
    ];
    var job = function (c) { return JOBS[c.job]; };
    var match = function (c) { var r = job(c).req, s = 0; r.forEach(function (k) { s += Math.min(c.skills[k] || 0, 5) / 5; }); return Math.round(s / r.length * 100); };
    var scoreCls = function (n) { return n >= 75 ? 's-hi' : n >= 55 ? 's-mid' : 's-lo'; };
    var cand = function (id) { return C.filter(function (c) { return c.id === id; })[0]; };
    function act(c, text, by) { c.act.unshift({ at: stamp(), text: text, by: by || '' }); }
    function planIv(c, when, time) {
      var req = job(c).req.slice().sort(function (a, b) { return (c.skills[a] || 0) - (c.skills[b] || 0); });
      var qs = [QS[req[0]], QS[req[1]], QS[req[req.length - 1]]];
      return { when: when, time: time, fmt: 'Video call · 45 min', panel: ['Michael Brown (hiring manager)', 'Laura White (HR)'], qs: qs, gaps: [req[0], req[1]] };
    }
    function prep(c) {
      c.appliedAt = addD(now, c.applied);
      c.notes = c.notes || []; c.act = [];
      c.act.push({ at: short(c.appliedAt), text: 'Applied via ' + c.source + ' for ' + job(c).title });
      c.cvId = 'cv-' + c.id; c.docs = c.docs || [];
      if (c.iv) { var d = c.iv.d >= 0 ? nextWork(now, c.iv.d) : addD(now, c.iv.d); c.iv = planIv(c, d, c.iv.t); c.act.unshift({ at: short(addD(c.appliedAt, 3)), text: 'Interview planned with Michael Brown' }); }
      if (c.fb) { c.fb.by = 'Michael Brown'; c.fb.at = short(addD(c.iv.when, 0)); c.act.unshift({ at: c.fb.at, text: 'Interview feedback ' + c.fb.score + '/5 · ' + c.fb.rec, by: 'Michael Brown' }); }
      if (c.stage >= 3) c.act.unshift({ at: short(addD(now, c.stage === 4 ? -12 : -2)), text: 'Moved to ' + STAGES[c.stage], by: 'Laura White' });
    }
    C.forEach(prep);
    C[2].notes.push({ by: 'Laura White', at: short(addD(now, -6)), text: 'Phone screen booked. Strong on SQL and APIs; check comfort with live demos.' });
    C[6].docs = ['of-st']; C[7].docs = ['ec-em'];
    C[6].notes.push({ by: 'Laura White', at: short(addD(now, -2)), text: 'Offer sent for review: $92,000 base. Candidate asked about hybrid days.' });

    /* ---------- documents ---------- */
    var CO = 'Crestview Systems Inc.', ecN = 11;
    function cvSections(c) {
      return [
        { h: 'Profile', p: c.summary },
        { h: 'Experience', rows: [['Period', 'Role', 'Company']].concat(c.exp) },
        { h: 'Selected achievements', lines: c.hl },
        { h: 'Education', lines: [c.edu] },
        { h: 'Skills', p: Object.keys(c.skills).map(function (k) { return k + ' (' + LVL[c.skills[k]] + ')'; }).join(' · ') },
        { h: 'Languages', p: c.lang || 'English (native) · Spanish (conversational)' }
      ];
    }
    function cvDoc(c) {
      return { id: c.cvId, name: 'CV_' + c.name.replace(/ /g, '_') + (c.cvSuffix || '') + '.pdf', type: 'pdf', folder: 'CVs', kind: 'cv', person: c.name,
        linked: 'Candidate: ' + c.name + ' · ' + job(c).code, owner: c.fromInbox ? 'AI inbox (simulated)' : 'Laura White', date: fmtDate(c.appliedAt), status: 'Valid',
        tags: [job(c).title, c.fromInbox ? 'from e-mail' : c.source], title: c.name, company: 'Curriculum vitae',
        meta: [['E-mail', c.email], ['Phone', c.phone], ['Location', c.loc]], sections: cvSections(c), note: c.fromInbox ? 'Filed by AI inbox (simulated) from the application e-mail' : 'Uploaded' };
    }
    function contract(id, who, pos, start, salary, status, extra) {
      return Object.assign({ id: id, name: 'Employment contract – ' + who + '.pdf', type: 'pdf', folder: 'Employment contracts', kind: 'contract', person: who, linked: 'Employee: ' + who,
        owner: 'Laura White', status: status, tags: ['contract'], title: 'Employment contract', company: CO,
        meta: [['Employee', who], ['Position', pos], ['Start date', start], ['Contract ID', 'EC-' + (2300 + (ecN++))]],
        sections: [
          { h: '1. Position and duties', p: who + ' is employed as ' + pos + ' in the Customer Success team, reporting to Michael Brown. Duties follow the attached role profile.' },
          { h: '2. Compensation', rows: [['Component', 'Amount'], ['Annual base salary', money(salary)], ['Bonus target', 'up to 10% of base salary'], ['401(k) match', 'up to 4% of base salary'], ['Health, dental and vision', 'company plan, 80% employer share']] },
          { h: '3. Working time and leave', p: '40 hours per week, hybrid work under the Hybrid work policy. 30 days of paid annual leave per calendar year, see the Leave & absence policy.' },
          { h: '4. Notice', p: 'Either party may end the employment with four weeks’ written notice. Sample document for this demo.' }
        ] }, extra || {});
    }
    function payslip(id, who, month, payDate, annual) {
      var gross = Math.round(annual / 12 * 100) / 100;
      var ded = [['Federal income tax', gross * 0.118], ['State income tax', gross * 0.045], ['Social Security (6.2%)', gross * 0.062], ['Medicare (1.45%)', gross * 0.0145], ['401(k) contribution (5%)', gross * 0.05], ['Health insurance', 145]];
      var sum = 0; ded.forEach(function (d) { d[1] = Math.round(d[1] * 100) / 100; sum += d[1]; });
      return { id: id, name: 'Payslip ' + month + ' – ' + who + '.pdf', type: 'pdf', folder: 'Payslips', kind: 'payslip', person: who, linked: 'Employee: ' + who, owner: 'Payroll', status: 'Valid', tags: ['payroll', month],
        title: 'Payslip · ' + month, company: CO, meta: [['Employee', who], ['Pay date', payDate], ['Pay period', month], ['Pay type', 'Salaried, monthly']],
        sections: [{ h: 'Earnings', rows: [['Item', 'Amount'], ['Base salary', money(gross, true)]] },
          { h: 'Deductions', rows: [['Item', 'Amount']].concat(ded.map(function (d) { return [d[0], '−' + money(d[1], true)]; })) },
          { h: 'Net pay', rows: [['Gross', 'Deductions', 'Net pay'], [money(gross, true), money(sum, true), money(gross - sum, true)]] }] };
    }
    var HB = [
      ['§2.1 Onboarding', 'New hires receive their laptop and accounts on day one. An onboarding buddy and a 30-60-90 day plan are assigned in People Desk.'],
      ['§4.1 Annual leave', 'Full-time employees receive 30 days of paid annual leave per calendar year. Up to 5 unused days carry over until March 31 of the following year. Requests go to your team lead in People Desk.'],
      ['§4.3 Sick leave', 'Report sickness to your team lead before your shift starts. From the third day of absence a doctor’s note is required.'],
      ['§4.6 Parental leave', 'Up to 16 weeks of paid parental leave. Tell HR at least 8 weeks before the planned start so cover can be arranged.'],
      ['§5.2 Hybrid work', 'You can work from home up to 3 days per week after agreeing with your team lead. Working from abroad needs HR approval for each stay.'],
      ['§6.1 Pay and payslips', 'Salaries are paid on the last business day of each month. Payslips are available in People Desk under My documents.'],
      ['§7.1 Travel & expenses', 'Submit expenses within 30 days with receipts attached. Private car use is reimbursed at the published mileage rate.']
    ];
    var DOCS = C.map(cvDoc).concat([
      { id: 'cv-jt', name: 'CV_James_Taylor.pdf', type: 'pdf', folder: 'CVs', kind: 'empcv', person: 'James Taylor', linked: 'Employee: James Taylor (hired 2023)', owner: 'Laura White', status: 'Archived', tags: ['personnel file'], date: 'Jan 18, 2023',
        title: 'James Taylor', company: 'Curriculum vitae', meta: [['E-mail', 'james.taylor@example.com'], ['Phone', '+1 (555) 010-3381'], ['Location', 'Columbus, OH']],
        sections: [{ h: 'Profile', p: 'Customer success professional with four years in SaaS onboarding and account management.' }, { h: 'Experience', rows: [['Period', 'Role', 'Company'], ['2020 – 2023', 'Account Manager', 'Bluefield Logistics Software'], ['2018 – 2020', 'Support Specialist', 'Brightline Software']] }, { h: 'Education', lines: ['B.A. Business Administration, Lakeside University (2018)'] }, { h: 'Skills', p: 'Customer onboarding · CRM · Renewals · Communication' }] },
      contract('ec-jt', 'James Taylor', 'Customer Success Manager', 'Mar 1, 2023', 70000, 'Signed', { date: 'Feb 2, 2023' }),
      contract('ec-ed', 'Emma Davis', 'Senior Customer Success Manager', 'Jun 1, 2021', 86000, 'Signed', { date: 'May 4, 2021' }),
      contract('ec-em', 'Ethan Moore', 'Customer Success Manager', fmtDate(nextWork(now, 15)), 78000, 'Pending signature', { linked: 'Candidate: Ethan Moore · CS-12', kind: 'contract' }),
      Object.assign(contract('of-st', 'Sophie Turner', 'Senior Customer Success Manager', fmtDate(nextWork(now, 25)), 92000, 'Draft', { linked: 'Candidate: Sophie Turner · CS-12' }), { name: 'Offer letter – Sophie Turner.pdf', title: 'Offer letter', kind: 'offer' }),
      payslip('ps-jt-10', 'James Taylor', 'October 2026', 'Oct 30, 2026', 70000),
      payslip('ps-jt-09', 'James Taylor', 'September 2026', 'Sep 30, 2026', 70000),
      payslip('ps-ed-10', 'Emma Davis', 'October 2026', 'Oct 30, 2026', 86000),
      { id: 'pol-leave', name: 'Leave & absence policy 2026.pdf', type: 'pdf', folder: 'Policies', kind: 'policy', owner: 'Laura White', status: 'Valid', tags: ['policy', 'leave'], title: 'Leave & absence policy', company: CO, meta: [['Version', '2026.1'], ['Owner', 'HR'], ['Applies to', 'All employees']],
        sections: [{ h: 'Annual leave', p: HB[1][1] }, { h: 'Coverage rule', p: 'Each team keeps a minimum staffing level. Customer Success needs at least 4 of 6 people present on working days. Team leads check coverage before approving.' }, { h: 'Sick leave', p: HB[2][1] }] },
      { id: 'pol-hybrid', name: 'Hybrid work policy.pdf', type: 'pdf', folder: 'Policies', kind: 'policy', owner: 'Laura White', status: 'Valid', tags: ['policy'], title: 'Hybrid work policy', company: CO, meta: [['Version', '2025.2'], ['Owner', 'HR']], sections: [{ h: 'Working from home', p: HB[4][1] }, { h: 'Equipment', p: 'A monitor, headset and chair allowance are provided for home workplaces.' }] },
      { id: 'pol-travel', name: 'Travel & expense policy.pdf', type: 'pdf', folder: 'Policies', kind: 'policy', owner: 'Finance', status: 'In review', tags: ['policy', 'finance'], title: 'Travel & expense policy', company: CO, meta: [['Version', '2027 draft'], ['Owner', 'Finance']], sections: [{ h: 'Expenses', p: HB[6][1] }, { h: 'Hotels', p: 'Book through the travel portal. Standard rooms up to the city rate list.' }] },
      { id: 'pol-coc', name: 'Code of conduct.pdf', type: 'pdf', folder: 'Policies', kind: 'policy', owner: 'Legal', status: 'Valid', tags: ['policy'], title: 'Code of conduct', company: CO, meta: [['Version', '2024'], ['Owner', 'Legal']], sections: [{ h: 'Our principles', lines: ['Treat colleagues and customers with respect', 'Report conflicts of interest', 'Protect customer and employee data'] }] },
      { id: 'hb', name: 'Employee handbook 2026.pdf', type: 'pdf', folder: 'Handbook', kind: 'handbook', owner: 'Laura White', status: 'Valid', tags: ['handbook'], title: 'Employee handbook 2026', company: CO, meta: [['Version', '2026.1'], ['Pages', '42'], ['Owner', 'HR']],
        sections: HB.map(function (h) { return { h: h[0], p: h[1] }; }) }
    ]);

    /* ---------- AI inbox e-mails ---------- */
    var MAILS = [
      { id: 'm1', from: 'Noah Bennett', addr: 'noah.bennett@example.com', subj: 'Application: Customer Success Manager (CS-12)', at: SDA.fmtTime(new Date(Date.now() - 42 * 6e4)), file: 'CV_Noah_Bennett.pdf',
        body: ['Hi Laura,', 'I would like to apply for the Customer Success Manager position (CS-12). I have six years of experience in B2B SaaS customer success, most recently at Summit Analytics where I manage a $2.4M renewal book.', 'My CV is attached. I am available for a call any weekday after 2 pm.', 'Best regards,\nNoah Bennett\n+1 (555) 014-2290'],
        x: { name: 'Noah Bennett', email: 'noah.bennett@example.com', phone: '+1 (555) 014-2290', job: 'csm', yrs: 6, loc: 'Columbus, OH',
          skills: { 'Customer onboarding': 4, 'CRM': 4, 'Renewals': 5, 'SaaS': 5, 'Communication': 3, 'Churn analysis': 4 },
          summary: 'Customer success manager with six years in B2B SaaS. Strong in renewals and churn prevention for mid-market accounts.',
          exp: [['2022 – today', 'Customer Success Manager', 'Summit Analytics'], ['2020 – 2022', 'Account Manager', 'Brightline Software']],
          hl: ['Manages a $2.4M renewal book with 108% net retention', 'Introduced quarterly business reviews for the top 30 accounts'], edu: 'B.A. Economics, Westbrook College (2019)' } },
      { id: 'm2', from: 'Mia Collins', addr: 'mia.collins@example.net', subj: 'Solutions Engineer – application Mia Collins', at: SDA.fmtTime(new Date(Date.now() - 95 * 6e4)), file: 'Mia_Collins_CV.pdf',
        body: ['Hello People team,', 'please find my application for the Solutions Engineer role (SE-15) attached. I have four years of experience building API integrations and internal tools, mostly in JavaScript and Python.', 'I am based in Austin and open to remote or hybrid work.', 'Kind regards,\nMia Collins\n+1 (555) 017-6604'],
        x: { name: 'Mia Collins', email: 'mia.collins@example.net', phone: '+1 (555) 017-6604', job: 'se', yrs: 4, loc: 'Austin, TX',
          skills: { 'JavaScript': 4, 'REST APIs': 4, 'SQL': 3, 'Integrations': 3, 'Python': 4 },
          summary: 'Integration developer with four years of experience building APIs, webhooks and internal tools for operations teams.',
          exp: [['2023 – today', 'Integration Developer', 'Bluefield Logistics'], ['2021 – 2023', 'Junior Developer', 'Clearwater Health Systems']],
          hl: ['Built the carrier API hub connecting 14 logistics partners', 'Automated invoice matching, saving 30 hours per month'], edu: 'B.Sc. Computer Science, Riverside Institute of Technology (2021)' } },
      { id: 'm3', from: 'Julia Young', addr: 'julia.young@example.org', subj: 'Updated CV – Julia Young', at: SDA.fmtTime(new Date(Date.now() - 180 * 6e4)), file: 'Julia_Young_CV_2026.pdf',
        body: ['Hi Laura,', 'thanks for the screening call last week. Attached is my updated CV with my latest project, an accessibility and API audit for 40 customer portals. Please also note my new phone number below.', 'Best,\nJulia Young\n+1 (555) 012-7718'],
        x: { name: 'Julia Young', email: 'julia.young@example.org', phone: '+1 (555) 012-7718', job: 'se', yrs: 7, loc: 'Chicago, IL',
          skills: { 'JavaScript': 4, 'SQL': 5, 'REST APIs': 5, 'Integrations': 5, 'Product demos': 3 },
          hl: ['Led an API and accessibility audit across 40 customer portals (2026)', 'Owns 25 production integrations with 99.9% uptime', 'Designed the SQL reporting layer used by 300 customers'] } }
    ];
    var ibSel = 'm1', ibRunning = false, ibModal = null;

    /* ---------- HR tickets ---------- */
    var TIX = [
      { id: 'HR-1041', from: 'David Wilson', subj: 'Update my home address for payroll', q: 'I moved last week. Can you update my address for payroll? The new address is 18 Maple Court, Springfield.', at: short(addD(now, -5)), status: 'Closed', origin: 'HR assistant (no handbook match)', replies: [{ by: 'Laura White', at: short(addD(now, -4)), text: 'Done. Your payroll address is updated from the next pay run.' }] },
      { id: 'HR-1040', from: 'Emma Davis', subj: 'Bike-to-work scheme in 2027?', q: 'Will the bike-to-work scheme continue next year? I would like to order a bike in January.', at: short(addD(now, -2)), status: 'Open', origin: 'HR assistant (no handbook match)', replies: [] }
    ];
    var tixN = 1042, tixSel = 'HR-1040', tixF = 'Open';

    /* ---------- leave ---------- */
    var TEAM = ['James Taylor', 'Emma Davis', 'Sarah Johnson', 'David Wilson', 'Lisa Miller', 'Chris Evans'];
    var MINP = 4, ANNUAL = 30, PRIOR = 4;
    var BAL = { 'Emma Davis': 12, 'Sarah Johnson': 9, 'David Wilson': 17, 'Lisa Miller': 21, 'Chris Evans': 15 };
    var lvN = 7;
    var LV = [
      { id: 'L1', who: 'Sarah Johnson', type: 'Annual leave', from: wd(0, 0), to: wd(0, 2), status: 'Approved', by: 'Michael Brown', note: 'Moving house' },
      { id: 'L2', who: 'David Wilson', type: 'Training', from: wd(0, 2), to: wd(0, 3), status: 'Approved', by: 'Michael Brown', note: 'Customer Success Summit' },
      { id: 'L3', who: 'Emma Davis', type: 'Annual leave', from: wd(0, 1), to: wd(0, 4), status: 'Pending', note: 'Family visit', at: short(addD(now, -1)) },
      { id: 'L4', who: 'Lisa Miller', type: 'Annual leave', from: wd(1, 0), to: wd(1, 1), status: 'Pending', note: 'Long weekend', at: short(now) },
      { id: 'L5', who: 'Chris Evans', type: 'Annual leave', from: wd(1, 3), to: wd(1, 4), status: 'Approved', by: 'Michael Brown' },
      { id: 'L6', who: 'James Taylor', type: 'Annual leave', from: addD(base, -14 * 7), to: addD(base, -14 * 7 + 11), status: 'Approved', by: 'Michael Brown', note: 'Summer vacation' }
    ];
    LV.forEach(function (l) { l.days = workDays(l.from, l.to); });
    var calStart = new Date(base), lvDecline = null, lvFocus = null;
    var annualUsed = function (who, st) { return LV.filter(function (l) { return l.who === who && l.type === 'Annual leave' && l.status === st; }).reduce(function (s, l) { return s + l.days; }, 0); };
    var jamesBal = function () { return ANNUAL - PRIOR - annualUsed('James Taylor', 'Approved') - annualUsed('James Taylor', 'Pending'); };
    var balOf = function (who) { return who === 'James Taylor' ? jamesBal() : BAL[who]; };
    var awayOn = function (d, except) { return LV.filter(function (l) { return l.id !== except && l.status === 'Approved' && l.from <= d && d <= l.to; }); };
    function coverage(l) {
      var out = [], d = new Date(l.from);
      while (d <= l.to) {
        if (isWork(d)) {
          var aw = awayOn(d, l.id).filter(function (o) { return o.who !== l.who; });
          var present = TEAM.length - aw.length - 1;
          if (present < MINP) out.push({ d: new Date(d), present: present, others: aw.map(function (o) { return o.who; }) });
        }
        d = addD(d, 1);
      }
      return out;
    }

    /* ---------- chat ---------- */
    var KB = [
      { re: /(sick|ill\b|doctor|medical)/i, a: 'Report sickness to your team lead before your shift starts. From the <b>third day</b> of absence a doctor’s note is required.', sec: 2 },
      { re: /(vacation|holiday|annual|days off|pto|leave balance|days do i|days left)/i, a: function () { return 'Full-time employees get <b>30 days</b> of paid annual leave per calendar year, and up to 5 unused days carry over until March 31. Your remaining balance is <b>' + plural(jamesBal(), 'day') + '</b> (pending requests included).'; }, sec: 1 },
      { re: /(remote|home office|from home|wfh|hybrid|abroad)/i, a: 'You can work from home up to <b>3 days per week</b> after agreeing with your team lead. Working from abroad needs HR approval for each stay.', sec: 4 },
      { re: /(expense|travel|reimburs|mileage|receipt)/i, a: 'Submit expenses within <b>30 days</b> with receipts attached. Private car use is reimbursed at the published mileage rate.', sec: 6 },
      { re: /(parental|maternity|paternity|baby)/i, a: 'Up to <b>16 weeks</b> of paid parental leave. Tell HR at least 8 weeks before the planned start so cover can be arranged.', sec: 3 },
      { re: /(payslip|payday|pay day|paid|salary|paycheck)/i, a: 'Salaries are paid on the <b>last business day</b> of each month. Your payslips are in <b>My documents › Payslips</b>.', sec: 5 },
      { re: /(onboard|first day|laptop|new hire|buddy)/i, a: 'New hires receive their laptop and accounts on <b>day one</b>, plus an onboarding buddy and a 30-60-90 day plan.', sec: 0 }
    ];
    var CHIPS = ['How many vacation days do I have left?', 'Can I work from home?', 'When do I need a sick note?', 'When is payday?', 'Can I bring my dog to the office?'];
    var chat = [{ who: 'bot', html: 'Hi James, I am the HR assistant. I answer from the <b>Employee handbook 2026</b> and always show the source. If the handbook has no answer, I create a ticket for HR instead of guessing.' }];

    /* ---------- shell: roles, guide, DMS ---------- */
    var nav = q1('.hr-nav'), main = q1('.hr-main'), drawer = q1('.hr-drawer'), scrim = q1('.hr-scrim'), live = q1('[data-live]');
    var say = function (t) { live.textContent = ''; ctx.later(30, function () { live.textContent = t; }); };
    var toast = function (t, k) { SDA.toast(root, t, k); };

    var guide = SDA.guide(q1('.hr-guide'), {
      title: 'From application e-mail to interview, then approve leave',
      demoId: 'demo-hr',
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=hr-tool', text: 'Talk to us about your version' },
      steps: [
        { id: 'inbox', text: 'As Laura White (HR), open the <b>AI inbox</b>' },
        { id: 'create', text: 'Create candidates from the e-mails' },
        { id: 'cv', text: 'Open a new candidate’s CV' },
        { id: 'interview', text: 'Move that candidate to <b>Interview</b>' },
        { id: 'approve', text: 'Switch to Michael Brown and approve a leave request' }
      ]
    });

    var dmsOpts = {
      title: 'HR documents', role: role, root: root,
      folders: ['CVs', 'Employment contracts', 'Payslips', 'Policies', 'Handbook'],
      docs: DOCS,
      canUpload: function (r) { return r !== 'mgr'; },
      canApprove: function (r) { return r === 'hr'; },
      filter: function (d, r) {
        if (r === 'hr') return true;
        if (d.folder === 'Policies' || d.folder === 'Handbook') return true;
        if (r === 'emp') return d.person === 'James Taylor' || d.owner === 'James Taylor';
        return d.kind === 'cv';
      },
      userName: function (r) { return PERSON[r]; },
      uploadFolder: 'CVs', uploadStatus: 'In review',
      onChange: function () { paintNav(); }
    };
    var dmsEl = document.createElement('div');
    var dms = SDA.dms(dmsEl, dmsOpts);
    var docById = function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; };
    function openDoc(id) {
      var c = C.filter(function (x) { return x.cvId === id; })[0];
      if (c && c.fromInbox) guide.done('cv');
      dms.open(id);
    }

    var ROLES = [
      { id: 'emp', label: 'Employee', person: 'James Taylor', icon: 'JT', sub: 'Request leave, ask the HR assistant and see only your own documents plus policies.' },
      { id: 'hr', label: 'Recruiter / HR', person: 'Laura White', icon: 'LW', sub: 'Run the pipeline and the AI inbox, answer HR tickets. HR sees every document.' },
      { id: 'mgr', label: 'Team lead', person: 'Michael Brown', icon: 'MB', sub: 'Approve leave with a coverage check and score your interviews.' }
    ];
    var NAV = {
      emp: [['leave', 'My leave'], ['ask', 'HR assistant'], ['docs', 'My documents']],
      hr: [['rec', 'Recruiting'], ['tix', 'HR inbox'], ['docs', 'Documents']],
      mgr: [['apv', 'Leave approvals'], ['int', 'Interviews'], ['docs', 'Documents']]
    };
    SDA.roles(q1('.hr-roles'), { title: 'View as', roles: ROLES, value: role, onChange: function (r) {
      role = r; view = NAV[r][0][0]; closeDrawer(true);
      dms.setRole(r); dmsOpts.uploadFolder = r === 'emp' ? 'Employee uploads' : 'CVs'; dmsOpts.defaultLink = r === 'emp' ? 'Employee: James Taylor' : '';
      render();
    } });

    function counts() {
      return {
        rec: MAILS.filter(function (m) { return !m.done; }).length,
        tix: TIX.filter(function (t) { return t.status === 'Open'; }).length,
        apv: LV.filter(function (l) { return l.status === 'Pending'; }).length,
        int: C.filter(function (c) { return c.stage === 2 && !c.rej && !c.fb; }).length,
        leave: LV.filter(function (l) { return l.who === 'James Taylor' && l.status === 'Pending'; }).length,
        ask: TIX.filter(function (t) { return t.from === 'James Taylor' && t.status !== 'Open' && !t.seen; }).length
      };
    }
    function paintNav() {
      var n = counts();
      nav.innerHTML = NAV[role].map(function (v) {
        var c = n[v[0]];
        return '<button type="button" data-h="nav" data-id="' + v[0] + '"' + (view === v[0] ? ' aria-current="page"' : '') + '>' + ICO[v[0]] + '<span>' + v[1] + '</span>' + (c ? '<i class="hr-cnt" aria-label="' + c + ' open">' + c + '</i>' : '') + '</button>';
      }).join('');
    }

    /* ---------- render ---------- */
    function render() {
      var had = main.contains(document.activeElement);
      paintNav();
      main.innerHTML = '';
      if (view === 'docs') { main.appendChild(docsHead()); main.appendChild(dmsEl); dms.render(); }
      else paintView();
      if (had && !main.contains(document.activeElement)) main.focus({ preventScroll: true });
    }
    function paintView() {
      main.innerHTML = ({ rec: vRec, tix: vTix, leave: vLeave, ask: vAsk, apv: vApv, int: vInt })[view]();
      if (view === 'rec') paintBoard();
      if (view === 'leave') paintPreview();
      if (view === 'ask') { var ch = q1('.hr-chat'); ch.scrollTop = ch.scrollHeight; TIX.forEach(function (t) { if (t.from === 'James Taylor' && t.status !== 'Open') t.seen = true; }); }
    }
    function docsHead() {
      var d = document.createElement('div'); d.className = 'hr-dochead';
      var txt = { hr: 'HR sees every file. CVs are linked to candidates, contracts and payslips to employees.', emp: 'You see your own contract, payslips and CV plus company policies and the handbook. Other people’s files are hidden.', mgr: 'You see candidate CVs for your open positions plus policies and the handbook. Contracts and payslips are HR only.' }[role];
      d.innerHTML = '<span class="hr-lock">' + I.lock + '</span><p><b>Access for ' + esc(PERSON[role]) + ':</b> ' + txt + '</p>';
      return d;
    }
    var head = function (h, p, tools) { return '<div class="hr-head"><div><h3>' + h + '</h3>' + (p ? '<p>' + p + '</p>' : '') + '</div>' + (tools ? '<div class="hr-tools">' + tools + '</div>' : '') + '</div>'; };
    var pill = function (s) { var c = /Approved|Hired|Closed|Answered|Signed|Valid|created|updated/.test(s) ? 'p-ok' : /Declined|Rejected|Cancelled/.test(s) ? 'p-bad' : /Open/.test(s) ? 'p-info' : 'p-warn'; return '<span class="pill ' + c + '">' + esc(s) + '</span>'; };
    var av = function (n, cls) { return '<span class="hr-av' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + initials(n) + '</span>'; };

    /* ===== Recruiting (HR) ===== */
    var rf = { q: '', job: 'all', rej: false };
    function vRec() {
      var nMail = counts().rec, nRej = C.filter(function (c) { return c.rej; }).length;
      return head('Candidate pipeline', '2 open positions · match scores compare each CV with the job profile', '') +
        '<div class="hr-toolbar">' +
        '<label class="hr-search"><span class="hr-vh">Search candidates</span>' + I.search + '<input type="search" data-in="q" placeholder="Search name, skill, e-mail" value="' + esc(rf.q) + '"></label>' +
        '<label class="hr-select"><span class="hr-vh">Position</span><select data-in="job"><option value="all">All positions</option>' + Object.keys(JOBS).map(function (k) { return '<option value="' + k + '"' + (rf.job === k ? ' selected' : '') + '>' + JOBS[k].title + ' · ' + JOBS[k].code + '</option>'; }).join('') + '</select></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-h="rej-toggle" aria-pressed="' + rf.rej + '">Rejected (' + nRej + ')</button>' +
        '<button type="button" class="btn btn-ink btn-sm hr-ibtn" data-h="inbox">' + I.spark + 'AI inbox' + (nMail ? '<i class="hr-cnt">' + nMail + '</i>' : '') + '</button></div>' +
        '<div class="hr-board" role="list" aria-label="Pipeline stages"></div><div class="hr-rejlist"></div>';
    }
    function visible(c) {
      if (rf.job !== 'all' && c.job !== rf.job) return false;
      var q = rf.q.trim().toLowerCase();
      return !q || (c.name + ' ' + c.email + ' ' + Object.keys(c.skills).join(' ') + ' ' + job(c).title).toLowerCase().indexOf(q) > -1;
    }
    function cardHtml(c) {
      var m = match(c), tags = [];
      if (c.isNew) tags.push('<span class="hr-tag new">New</span>');
      if (c.fromInbox || c.updated) tags.push('<span class="hr-tag">' + ICO.mail + (c.updated && !c.fromInbox ? 'Updated' : 'E-mail') + '</span>');
      if (c.stage === 2 && c.iv) tags.push('<span class="hr-tag">' + short(c.iv.when) + '</span>');
      if (c.fb) tags.push('<span class="hr-tag fb">' + c.fb.score + '/5</span>');
      return '<div class="hr-card' + (drawerId === c.id ? ' sel' : '') + (c.flash ? ' flash' : '') + '" draggable="' + (role === 'hr') + '" data-cid="' + c.id + '" role="listitem">' +
        '<button type="button" class="hr-card-b" data-h="cand" data-id="' + c.id + '">' + av(c.name) +
        '<b>' + esc(c.name) + '</b><small>' + job(c).short + ' · ' + plural(c.yrs, 'yr') + '</small>' +
        '<span class="hr-tags"><span class="hr-score ' + scoreCls(m) + '"><span class="hr-vh">Match </span>' + m + '%</span>' + tags.join('') + '</span></button></div>';
    }
    function paintBoard() {
      var b = q1('.hr-board'); if (!b) return;
      b.innerHTML = STAGES.map(function (s, i) {
        var L = C.filter(function (c) { return c.stage === i && !c.rej && visible(c); }).sort(function (a, z) { return (z.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || match(z) - match(a); });
        return '<section class="hr-col" data-stage="' + i + '" role="listitem" aria-label="' + s + ', ' + plural(L.length, 'candidate') + '"><h4><span>' + s + '</span><i>' + L.length + '</i></h4><div class="hr-col-l" role="list">' +
          (L.length ? L.map(cardHtml).join('') : '<p class="hr-col-e">No candidates</p>') + '</div></section>';
      }).join('');
      C.forEach(function (c) { c.flash = false; });
      var rl = q1('.hr-rejlist'), R = C.filter(function (c) { return c.rej && visible(c); });
      rl.innerHTML = rf.rej ? '<div class="hr-panel"><h4 class="hr-h4">Rejected candidates</h4>' + (R.length ? R.map(function (c) {
        return '<div class="hr-row">' + av(c.name) + '<div><b>' + esc(c.name) + '</b><small>' + job(c).title + ' · ' + esc(c.rej.reason) + ' · ' + esc(c.rej.at) + '</small></div><button type="button" class="btn btn-ghost btn-sm" data-h="cand" data-id="' + c.id + '">Open</button><button type="button" class="btn btn-ghost btn-sm" data-h="restore" data-id="' + c.id + '">Restore</button></div>';
      }).join('') : '<p class="hr-muted">No rejected candidates.</p>') + '</div>' : '';
    }
    function moveStage(c, s, how) {
      if (c.rej || c.stage === s) return;
      var from = STAGES[c.stage]; c.stage = s; c.flash = true;
      act(c, 'Moved from ' + from + ' to ' + STAGES[s] + (how ? ' (' + how + ')' : ''), PERSON[role]);
      var extra = '';
      if (s === 2 && !c.iv) {
        c.iv = planIv(c, nextWork(now, 2), '10:30');
        act(c, 'Interview planned for ' + wday(c.iv.when) + ', 10:30 with Michael Brown · calendar invites (simulated, not sent)');
        extra = ' Interview planned with Michael Brown.';
      }
      if (s === 3 && !docById('of-' + c.id)) {
        dms.add(Object.assign(contract('of-' + c.id, c.name, job(c).title, fmtDate(nextWork(now, 20)), c.job === 'se' ? 88000 : 82000, 'Draft', { linked: 'Candidate: ' + c.name + ' · ' + job(c).code }), { name: 'Offer letter – ' + c.name + '.pdf', title: 'Offer letter', kind: 'offer', note: 'Draft generated from the job profile (simulated)' }));
        c.docs.push('of-' + c.id); act(c, 'Offer letter drafted and filed in DMS › Employment contracts'); extra = ' Offer letter draft filed in Documents.';
      }
      if (s === 4 && !docById('ec-' + c.id)) {
        dms.add(contract('ec-' + c.id, c.name, job(c).title, fmtDate(nextWork(now, 20)), c.job === 'se' ? 88000 : 82000, 'Pending signature', { linked: 'Candidate: ' + c.name + ' · ' + job(c).code, note: 'Generated from the offer (simulated)' }));
        c.docs.push('ec-' + c.id); act(c, 'Employment contract generated, waiting for signature'); extra = ' Contract filed for signature.';
      }
      if (s === 2 && c.fromInbox) guide.done('interview');
      toast(esc(c.name) + ' moved to ' + STAGES[s] + '.' + extra);
      say(c.name + ' moved to ' + STAGES[s]);
      paintNav(); paintBoard(); if (drawerId === c.id) paintDrawer();
    }

    /* ----- candidate drawer ----- */
    var drawerId = null, rejOpen = false, lastFocus = null;
    function openDrawer(id) {
      var c = cand(id); if (!c) return;
      if (!drawerId) lastFocus = document.activeElement;
      drawerId = id; rejOpen = false;
      if (c.isNew && role === 'hr') { c.isNew = false; }
      drawer.hidden = false; scrim.hidden = false; root.classList.add('hr-dr-open');
      paintDrawer(); paintBoard();
      ctx.later(20, function () { var x = q1('.hr-x', drawer); x && x.focus(); });
    }
    function closeDrawer(silent) {
      if (!drawerId) return;
      drawerId = null; drawer.hidden = true; scrim.hidden = true; drawer.innerHTML = ''; root.classList.remove('hr-dr-open');
      if (!silent) { paintBoard(); if (lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus(); }
    }
    function paintDrawer() {
      var c = cand(drawerId); if (!c) return;
      var had = drawer.contains(document.activeElement);
      drawerHtml(c);
      if (had && !drawer.contains(document.activeElement)) drawer.focus({ preventScroll: true });
    }
    function drawerHtml(c) {
      var J = job(c), m = match(c), isHr = role === 'hr', cv = docById(c.cvId);
      var stepper = '<div class="hr-stepper" role="group" aria-label="' + (isHr ? 'Move candidate to stage' : 'Pipeline stage') + '">' + STAGES.map(function (s, i) {
        var cls = i < c.stage ? 'done' : i === c.stage ? 'cur' : '';
        return isHr && !c.rej ? '<button type="button" class="' + cls + '" data-h="stage" data-s="' + i + '" aria-pressed="' + (i === c.stage) + '">' + s + '</button>' : '<span class="' + cls + '">' + s + '</span>';
      }).join('') + '</div>';
      var rows = J.req.map(function (k) {
        var v = c.skills[k] || 0;
        return '<div class="hr-skill"><span>' + esc(k) + '</span><i><b style="width:' + (v * 20) + '%" class="' + (v >= 4 ? 'hi' : v >= 3 ? 'mid' : 'lo') + '"></b></i><small>' + (v ? LVL[v] : 'missing') + '</small></div>';
      }).join('');
      var extraSk = Object.keys(c.skills).filter(function (k) { return J.req.indexOf(k) < 0; });
      var strong = J.req.filter(function (k) { return (c.skills[k] || 0) >= 4; }), gaps = J.req.filter(function (k) { return (c.skills[k] || 0) < 3; });
      var linked = c.docs.map(docById).filter(Boolean);
      var iv = c.iv ? '<dl class="hr-dl"><dt>When</dt><dd>' + wday(c.iv.when) + ', ' + c.iv.time + '</dd><dt>Format</dt><dd>' + c.iv.fmt + '</dd><dt>Panel</dt><dd>' + c.iv.panel.join(', ') + '</dd></dl>' +
        '<p class="hr-ai-l">' + I.spark + 'Questions suggested by AI (simulated) from the skill gaps</p><ol class="hr-qs">' + c.iv.qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
        (c.fb ? '<div class="hr-fb"><b>Feedback from ' + esc(c.fb.by) + ': ' + c.fb.score + '/5 · ' + esc(c.fb.rec) + '</b><p>' + esc(c.fb.text || 'No comment.') + '</p></div>' : '<p class="hr-muted">Waiting for feedback from Michael Brown.</p>')
        : '<p class="hr-muted">No interview yet. Moving the candidate to Interview plans one automatically.</p>';
      drawer.innerHTML =
        '<div class="hr-dr-h">' + av(c.name, 'lg') + '<div><b>' + esc(c.name) + '</b><small>' + J.title + ' · ' + J.code + ' · applied ' + short(c.appliedAt) + '</small></div><button type="button" class="hr-x" data-h="close-dr" aria-label="Close candidate details">' + I.close + '</button></div>' +
        '<div class="hr-dr-b">' +
        (c.rej ? '<div class="hr-alert">Rejected · ' + esc(c.rej.reason) + (c.rej.note ? ' · ' + esc(c.rej.note) : '') + (isHr ? ' <button type="button" class="btn btn-ghost btn-sm" data-h="restore" data-id="' + c.id + '">Restore</button>' : '') + '</div>' : '') +
        stepper +
        '<div class="hr-dr-acts">' + (cv ? '<button type="button" class="btn btn-ghost btn-sm" data-h="doc" data-id="' + c.cvId + '">' + I.doc + 'Open CV</button>' : '') +
        (isHr && !c.rej ? '<button type="button" class="btn btn-ghost btn-sm hr-danger" data-h="rej-open" aria-expanded="' + rejOpen + '">Reject…</button>' : '') + '</div>' +
        (rejOpen ? '<form class="hr-form hr-rejf" data-f="rej"><label>Reason<select name="reason"><option>Skills do not match the job profile</option><option>Not enough experience</option><option>Salary expectations too high</option><option>Position filled</option><option>Candidate withdrew</option></select></label>' +
          '<label>Internal note <span class="hr-opt">(optional)</span><input name="note" maxlength="140" placeholder="Visible to HR only"></label>' +
          '<label class="hr-check"><input type="checkbox" name="mail" checked> Send a polite rejection e-mail (simulated, not sent)</label>' +
          '<div class="hr-btns"><button type="submit" class="btn btn-ink btn-sm">Confirm rejection</button><button type="button" class="btn btn-ghost btn-sm" data-h="rej-open">Cancel</button></div></form>' : '') +
        '<section class="hr-sec"><h5>Skills match vs. job profile</h5><div class="hr-match"><span class="hr-score big ' + scoreCls(m) + '">' + m + '%</span><p><span class="hr-ai-l">' + I.spark + 'AI summary (simulated)</span>' +
          (strong.length ? 'Strong in ' + esc(strong.join(', ')) + '. ' : '') + (gaps.length ? 'Gaps: ' + esc(gaps.join(', ')) + '.' : 'No gaps against the profile.') + '</p></div>' + rows +
          (extraSk.length ? '<p class="hr-muted">Also brings: ' + esc(extraSk.join(', ')) + '</p>' : '') + '</section>' +
        '<section class="hr-sec"><h5>Profile & contact</h5><dl class="hr-dl"><dt>E-mail</dt><dd>' + esc(c.email) + '</dd><dt>Phone</dt><dd>' + esc(c.phone) + '</dd><dt>Location</dt><dd>' + esc(c.loc) + '</dd><dt>Source</dt><dd>' + esc(c.fromInbox ? 'E-mail (AI inbox)' : c.source) + '</dd></dl></section>' +
        '<section class="hr-sec"><h5>Experience · ' + plural(c.yrs, 'year') + '</h5><ul class="hr-exp">' + c.exp.map(function (e) { return '<li><b>' + esc(e[1]) + '</b><span>' + esc(e[2]) + ' · ' + esc(e[0]) + '</span></li>'; }).join('') + '</ul></section>' +
        '<section class="hr-sec"><h5>Attachments</h5><div class="hr-atts">' + (cv ? '<button type="button" class="hr-att" data-h="doc" data-id="' + cv.id + '">' + I.doc + '<span><b>' + esc(cv.name) + '</b><small>CV · v' + cv.version + ' · DMS › CVs</small></span></button>' : '') +
          linked.map(function (d) { return '<button type="button" class="hr-att" data-h="doc" data-id="' + d.id + '">' + I.doc + '<span><b>' + esc(d.name) + '</b><small>' + esc(d.status) + ' · DMS › ' + esc(d.folder) + '</small></span></button>'; }).join('') + '</div></section>' +
        '<section class="hr-sec"><h5>Interview plan</h5>' + iv + '</section>' +
        '<section class="hr-sec"><h5>Notes</h5>' + (c.notes.length ? '<ul class="hr-notes">' + c.notes.map(function (n) { return '<li><p>' + esc(n.text) + '</p><small>' + esc(n.by) + ' · ' + esc(n.at) + '</small></li>'; }).join('') + '</ul>' : '<p class="hr-muted">No notes yet.</p>') +
          '<form class="hr-form hr-inline" data-f="note"><label><span class="hr-vh">Add a note</span><input name="t" maxlength="200" placeholder="Add a note for the hiring team" autocomplete="off"></label><button type="submit" class="btn btn-ink btn-sm">Add note</button></form></section>' +
        '<section class="hr-sec"><h5>Activity</h5><ol class="hr-act">' + c.act.map(function (a) { return '<li><span>' + esc(a.text) + '</span><small>' + esc(a.at) + (a.by ? ' · ' + esc(a.by) : '') + '</small></li>'; }).join('') + '</ol></section>' +
        '</div>';
    }

    /* ----- AI inbox ----- */
    var FIELDS = [['name', 'Name'], ['email', 'E-mail'], ['phone', 'Phone'], ['job', 'Role applied for'], ['yrs', 'Years of experience'], ['skills', 'Skills'], ['source', 'Source']];
    var fval = function (mail, k) { var x = mail.x; return k === 'job' ? JOBS[x.job].title + ' · ' + JOBS[x.job].code : k === 'yrs' ? x.yrs + ' years' : k === 'skills' ? Object.keys(x.skills).join(', ') : k === 'source' ? 'E-mail (' + mail.addr + ')' : x[k]; };
    function mailState(m) { return m.done === 'created' ? pill('Candidate created') : m.done === 'updated' ? pill('Existing candidate updated') : m.busy ? '<span class="pill p-info">AI reading…</span>' : '<span class="pill p-info">New</span>'; }
    function inboxHtml() {
      var left = MAILS.filter(function (m) { return !m.done; }).length;
      return '<div class="hr-ib"><div class="hr-ib-top"><p>Applications sent to <b>jobs@crestview.example</b>. Sample e-mails: nothing is received or sent, and the AI steps are simulated.</p>' +
        '<button type="button" class="btn btn-ink btn-sm" data-h="ib-run" aria-disabled="' + !(left && !ibRunning) + '">' + I.spark + (ibRunning ? 'AI is working…' : left ? 'Create candidates with AI (simulated)' : 'All e-mails processed') + '</button></div>' +
        '<div class="hr-ib-grid"><div class="hr-ib-list" role="list">' + MAILS.map(function (m) {
          return '<button type="button" role="listitem" class="hr-mail' + (ibSel === m.id ? ' sel' : '') + '" data-h="ib-sel" data-id="' + m.id + '" aria-current="' + (ibSel === m.id) + '"><span class="hr-mail-h"><b>' + esc(m.from) + '</b><small>' + esc(m.at) + '</small></span><span class="hr-mail-s">' + esc(m.subj) + '</span>' +
            '<span class="hr-mail-f"><span class="hr-file">' + ICO.clip + esc(m.file) + '</span>' + mailState(m) + '</span></button>';
        }).join('') + '</div><div class="hr-ib-pane">' + mailPane() + '</div></div></div>';
    }
    function mailPane() {
      var m = MAILS.filter(function (x) { return x.id === ibSel; })[0];
      if (m.trace) return m.trace;
      return '<div class="hr-mailv"><dl class="hr-dl"><dt>From</dt><dd>' + esc(m.from) + ' &lt;' + esc(m.addr) + '&gt;</dd><dt>To</dt><dd>jobs@crestview.example</dd><dt>Subject</dt><dd><b>' + esc(m.subj) + '</b></dd><dt>Received</dt><dd>Today, ' + esc(m.at) + '</dd></dl>' +
        '<div class="hr-mail-body">' + m.body.map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('') + '</div>' +
        '<p class="hr-file big">' + ICO.clip + '<span><b>' + esc(m.file) + '</b><small>PDF · 2 pages · CV</small></span></p></div>';
    }
    function paintInbox() {
      if (!ibModal || !ibModal.el.isConnected) return;
      var b = ibModal.body, ae = document.activeElement, key = ae && b.contains(ae) && ae.dataset && ae.dataset.h ? [ae.dataset.h, ae.dataset.id || ''] : null;
      var tmp = document.createElement('div'); tmp.innerHTML = inboxHtml();
      q1('.hr-ib-list', b).innerHTML = q1('.hr-ib-list', tmp).innerHTML;
      q1('.hr-ib-pane', b).innerHTML = q1('.hr-ib-pane', tmp).innerHTML;
      var rb = q1('[data-h="ib-run"]', b), nb = q1('[data-h="ib-run"]', tmp);
      rb.setAttribute('aria-disabled', nb.getAttribute('aria-disabled')); rb.innerHTML = nb.innerHTML;
      if (key && !b.contains(ae)) { var el = b.querySelector('[data-h="' + key[0] + '"]' + (key[1] ? '[data-id="' + key[1] + '"]' : '')); el && el.focus(); }
    }
    function openInbox() {
      ibModal = SDA.modal(root, { title: 'AI inbox · job applications', wide: true, html: inboxHtml(), onClose: function () { ibModal = null; if (view === 'rec') { main.innerHTML = vRec(); paintBoard(); paintNav(); } } });
      guide.done('inbox');
    }
    function traceHtml(m, n, dup, result) {
      return '<div class="hr-trace"><p class="hr-ai-l">' + I.spark + 'AI (simulated) · reading the e-mail and ' + esc(m.file) + '</p><dl class="hr-x-grid">' + FIELDS.map(function (f, i) {
        return '<dt>' + f[1] + '</dt><dd class="' + (i < n ? 'got' : '') + '">' + (i < n ? I.check + '<span>' + esc(fval(m, f[0])) + '</span>' : '<span class="hr-skel" aria-hidden="true"></span><span class="hr-vh">waiting</span>') + '</dd>';
      }).join('') + '</dl>' + (dup ? '<p class="hr-step ' + dup.cls + '">' + dup.html + '</p>' : '') + (result ? '<p class="hr-step ok">' + I.check + '<span>' + result + '</span></p>' : '') + '</div>';
    }
    function findDup(x) { return C.filter(function (c) { return c.email.toLowerCase() === x.email.toLowerCase() || c.name.toLowerCase() === x.name.toLowerCase(); })[0]; }
    function commit(m) {
      var x = m.x, ex = findDup(x);
      if (ex) {
        var oldPhone = ex.phone; ex.phone = x.phone; ex.updated = true; ex.flash = true;
        Object.keys(x.skills).forEach(function (k) { ex.skills[k] = Math.max(ex.skills[k] || 0, x.skills[k]); });
        if (x.hl) ex.hl = x.hl;
        var d = docById(ex.cvId);
        if (d) { d.version += 1; d.name = x.name.replace(/ /g, '_') + '_CV_2026.pdf'; d.meta = [['E-mail', ex.email], ['Phone', ex.phone], ['Location', ex.loc]]; d.sections = cvSections(ex); d.date = fmtDate(new Date()); d.tags = [job(ex).title, 'from e-mail']; d.versions.push({ v: d.version, date: fmtDate(new Date()), by: 'AI inbox (simulated)', note: 'Updated CV from e-mail "' + m.subj + '"' }); }
        act(ex, 'Updated from e-mail by AI (simulated): new CV saved as v' + (d ? d.version : 2) + ', phone ' + oldPhone + ' → ' + ex.phone + '. No duplicate created.');
        m.done = 'updated'; m.cid = ex.id;
        return { ex: ex, d: d };
      }
      var c = { id: 'c' + (C.length + 1) + m.id, name: x.name, job: x.job, stage: 0, yrs: x.yrs, email: x.email, phone: x.phone, loc: x.loc, source: 'E-mail', applied: 0, skills: x.skills, summary: x.summary, exp: x.exp, hl: x.hl, edu: x.edu, fromInbox: true, isNew: true, flash: true };
      prep(c); c.act = [{ at: stamp(), text: 'Created from e-mail "' + m.subj + '" by AI (simulated)' }];
      act(c, 'CV ' + m.file + ' attached and filed in DMS › CVs');
      C.push(c);
      var doc = cvDoc(c); doc.name = m.file; dms.add(doc);
      m.done = 'created'; m.cid = c.id;
      return { c: c };
    }
    function runInbox() {
      if (ibRunning) return;
      var todo = MAILS.filter(function (m) { return !m.done; }); if (!todo.length) return;
      ibRunning = true; var q = [], made = 0, upd = 0;
      todo.forEach(function (m) {
        q.push(function () { ibSel = m.id; m.busy = true; m.trace = traceHtml(m, 0); paintInbox(); say('AI is reading the e-mail from ' + m.from); });
        FIELDS.forEach(function (f, i) { q.push(function () { m.trace = traceHtml(m, i + 1); paintInbox(); }); });
        q.push(function () {
          var ex = findDup(m.x);
          m.dup = ex ? { cls: 'warn', html: '<b>Duplicate check:</b> matches existing candidate ' + esc(ex.name) + ' (same e-mail, in ' + STAGES[ex.stage] + '). The record will be updated instead of creating a duplicate.' } : { cls: '', html: '<b>Duplicate check:</b> no existing candidate with this e-mail or name.' };
          m.trace = traceHtml(m, FIELDS.length, m.dup); paintInbox();
        });
        q.push(function () {
          var r = commit(m); m.busy = false;
          var res = r.ex ? esc(r.ex.name) + ' updated: CV saved as version ' + (r.d ? r.d.version : 2) + ' and phone number changed. Still in ' + STAGES[r.ex.stage] + '.' : 'Candidate card created in <b>Applied</b>. CV attached to the candidate and filed in DMS › CVs, linked to ' + esc(r.c.name) + '.';
          if (r.ex) upd++; else made++;
          m.trace = traceHtml(m, FIELDS.length, m.dup, res) + '<div class="hr-btns"><button type="button" class="btn btn-ghost btn-sm" data-h="ib-open" data-id="' + m.cid + '">Open candidate</button><button type="button" class="btn btn-ghost btn-sm" data-h="doc" data-id="' + cand(m.cid).cvId + '">' + I.doc + 'Open CV</button></div>';
          paintInbox(); paintNav(); if (view === 'rec' && !ibModal) paintBoard();
        });
      });
      q.push(function () {
        ibRunning = false; ibSel = todo[0].id;
        var sum = '<div class="hr-done">' + I.check + '<div><b>Done: ' + plural(made, 'candidate') + ' created, ' + upd + ' existing candidate updated.</b><p>' + plural(made + upd, 'CV') + ' filed in Documents › CVs and linked to the candidate records. No e-mail was sent.</p></div><button type="button" class="btn btn-ink btn-sm" data-h="ib-close">Show in pipeline</button></div>';
        todo.forEach(function (m) { m.trace = sum + m.trace; });
        paintInbox(); guide.done('create'); toast(plural(made, 'candidate') + ' created and ' + upd + ' updated by AI (simulated).'); say('Inbox processed');
      });
      var i = 0;
      (function next() { if (i >= q.length) return; q[i++](); ctx.later(i === 1 ? STEP : STEP + (SDA.reduce ? 0 : 60), next); })();
    }

    /* ===== HR inbox (tickets) ===== */
    function vTix() {
      var L = TIX.filter(function (t) { return tixF === 'All' || t.status === tixF; });
      var t = TIX.filter(function (x) { return x.id === tixSel; })[0];
      return head('HR inbox', 'Questions the HR assistant could not answer from the handbook. Tickets are simulated: nobody is notified and nothing is sent.', '') +
        '<div class="hr-two"><div class="hr-listcol"><div class="hr-chips" role="group" aria-label="Filter tickets">' + ['Open', 'Answered', 'Closed', 'All'].map(function (f) { var n = f === 'All' ? TIX.length : TIX.filter(function (x) { return x.status === f; }).length; return '<button type="button" data-h="tix-f" data-id="' + f + '" aria-pressed="' + (tixF === f) + '">' + f + ' <i>' + n + '</i></button>'; }).join('') + '</div>' +
        (L.length ? L.map(function (x) { return '<button type="button" class="hr-item' + (x.id === tixSel ? ' sel' : '') + '" data-h="tix" data-id="' + x.id + '" aria-current="' + (x.id === tixSel) + '"><span class="hr-item-h"><span class="hr-id">' + x.id + '</span>' + pill(x.status) + '</span><b>' + esc(x.subj) + '</b><small>' + esc(x.from) + ' · ' + esc(x.at) + '</small></button>'; }).join('') : '<p class="hr-muted hr-empty">No tickets in this list.</p>') + '</div>' +
        '<div class="hr-panel">' + (t ? tixDetail(t) : '<p class="hr-muted">Select a ticket.</p>') + '</div></div>';
    }
    function tixDetail(t) {
      return '<div class="hr-item-h"><span class="hr-id">' + t.id + ' · simulated, nobody is notified</span>' + pill(t.status) + '</div><h4 class="hr-h4 big">' + esc(t.subj) + '</h4>' +
        '<dl class="hr-dl"><dt>From</dt><dd>' + esc(t.from) + '</dd><dt>Created</dt><dd>' + esc(t.at) + '</dd><dt>Channel</dt><dd>' + esc(t.origin) + '</dd></dl>' +
        '<div class="hr-thread"><div class="hr-bubble"><small>' + esc(t.from) + '</small><p>' + esc(t.q) + '</p></div>' + t.replies.map(function (r) { return '<div class="hr-bubble me"><small>' + esc(r.by) + ' · ' + esc(r.at) + '</small><p>' + esc(r.text) + '</p></div>'; }).join('') + '</div>' +
        (t.status !== 'Closed' ? '<form class="hr-form" data-f="reply" data-id="' + t.id + '"><label>Reply to ' + esc(t.from.split(' ')[0]) + '<textarea name="t" rows="3" placeholder="Write an answer. It appears in the employee’s HR assistant."></textarea></label><p class="hr-err" aria-live="polite"></p>' +
          '<div class="hr-btns"><button type="submit" class="btn btn-ink btn-sm">Send reply (simulated, not sent)</button><button type="button" class="btn btn-ghost btn-sm" data-h="tix-close" data-id="' + t.id + '">Close ticket</button></div></form>'
          : '<div class="hr-btns"><button type="button" class="btn btn-ghost btn-sm" data-h="tix-reopen" data-id="' + t.id + '">Reopen ticket</button></div>');
    }

    /* ===== Employee: leave ===== */
    var lf = { type: 'Annual leave', from: iso(wd(1, 2)), to: iso(wd(1, 4)), note: '' };
    function vLeave() {
      var mine = LV.filter(function (l) { return l.who === 'James Taylor'; }).sort(function (a, b) { return b.from - a.from; });
      var used = PRIOR + annualUsed('James Taylor', 'Approved'), pend = annualUsed('James Taylor', 'Pending');
      return head('My leave', 'James Taylor · Customer Success · team lead Michael Brown', '<button type="button" class="btn btn-ghost btn-sm" data-h="doc" data-id="pol-leave">' + I.doc + 'Leave policy</button>') +
        '<div class="hr-kpis"><div class="hr-kpi"><span>Annual leave left</span><b>' + jamesBal() + '</b><small>of ' + ANNUAL + ' days in 2026</small></div><div class="hr-kpi"><span>Taken</span><b>' + used + '</b><small>days this year</small></div><div class="hr-kpi"><span>Pending</span><b>' + pend + '</b><small>days waiting for approval</small></div><div class="hr-kpi"><span>Sick days</span><b>2</b><small>this year</small></div></div>' +
        '<div class="hr-two wide"><div class="hr-panel"><h4 class="hr-h4">Request leave</h4><form class="hr-form" data-f="leave" novalidate>' +
        '<label>Leave type<select name="type">' + ['Annual leave', 'Unpaid leave', 'Training', 'Parental leave'].map(function (t) { return '<option' + (lf.type === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' +
        '<div class="hr-2"><label>From<input type="date" name="from" value="' + lf.from + '" required></label><label>To<input type="date" name="to" value="' + lf.to + '" required></label></div>' +
        '<label>Note for Michael <span class="hr-opt">(optional)</span><input name="note" maxlength="120" value="' + esc(lf.note) + '" placeholder="e.g. Family trip"></label>' +
        '<div class="hr-ai-box" data-preview aria-live="polite"></div><button type="submit" class="btn btn-ink btn-sm">Send request</button></form></div>' +
        '<div class="hr-panel"><h4 class="hr-h4">My requests</h4>' + (mine.length ? mine.map(function (l) {
          return '<div class="hr-req"><div><b>' + esc(l.type) + ' · ' + plural(l.days, 'day') + '</b><small>' + wday(l.from) + ' – ' + wday(l.to) + (l.note ? ' · “' + esc(l.note) + '”' : '') + '</small>' +
            (l.status === 'Approved' || l.status === 'Declined' ? '<small>' + l.status + ' by ' + esc(l.by) + (l.comment ? ': “' + esc(l.comment) + '”' : '') + '</small>' : l.status === 'Pending' ? '<small>Waiting for Michael Brown</small>' : '') + '</div>' +
            '<div class="hr-req-r">' + pill(l.status) + (l.status === 'Pending' ? '<button type="button" class="btn btn-ghost btn-sm" data-h="lv-cancel" data-id="' + l.id + '">Cancel</button>' : '') + '</div></div>';
        }).join('') : '<p class="hr-muted">No requests yet.</p>') + '</div></div>';
    }
    function readLeave(f) { lf.type = f.type.value; lf.from = f.from.value; lf.to = f.to.value; lf.note = f.note.value; }
    function checkLeave() {
      var a = parseIso(lf.from), b = parseIso(lf.to);
      if (!a || !b) return { err: 'Choose a start and an end date.' };
      if (b < a) return { err: 'The end date is before the start date.' };
      var days = workDays(a, b); if (!days) return { err: 'These dates contain no working days.' };
      var overlap = LV.filter(function (l) { return l.who === 'James Taylor' && /Pending|Approved/.test(l.status) && l.from <= b && a <= l.to; })[0];
      if (overlap) return { err: 'You already have a ' + overlap.status.toLowerCase() + ' request from ' + short(overlap.from) + ' to ' + short(overlap.to) + '.' };
      var after = lf.type === 'Annual leave' ? jamesBal() - days : jamesBal();
      if (after < 0) return { err: 'Not enough annual leave: ' + plural(days, 'day') + ' requested, ' + jamesBal() + ' left.' };
      var tmp = { id: 'tmp', who: 'James Taylor', from: a, to: b }, cov = coverage(tmp);
      return { a: a, b: b, days: days, after: after, cov: cov };
    }
    function paintPreview() {
      var box = q1('[data-preview]'); if (!box) return; var r = checkLeave();
      box.className = 'hr-ai-box' + (r.err ? ' bad' : r.cov.length ? ' warn' : '');
      box.innerHTML = '<span class="hr-ai-l">' + I.spark + 'AI check (simulated)</span>' + (r.err ? esc(r.err) :
        '<b>' + plural(r.days, 'working day') + '</b>' + (lf.type === 'Annual leave' ? ' · balance after approval: <b>' + plural(r.after, 'day') + '</b>' : ' · does not use annual leave') +
        '<br>' + (r.cov.length ? 'Team coverage is tight on ' + r.cov.map(function (x) { return wday(x.d); }).join(', ') + '. Michael may ask you to move a day.' : 'Team coverage looks fine on all days.'));
    }

    /* ===== Employee: assistant ===== */
    function vAsk() {
      var mine = TIX.filter(function (t) { return t.from === 'James Taylor'; });
      return head('HR assistant', 'Answers come from the Employee handbook 2026 with the source section.', '') +
        '<div class="hr-two wide"><div class="hr-panel"><div class="hr-chat" role="log" aria-live="polite">' + chat.map(msgHtml).join('') + '</div>' +
        '<div class="hr-qchips">' + CHIPS.map(function (q) { return '<button type="button" data-h="ask" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
        '<form class="hr-form hr-inline" data-f="ask"><label><span class="hr-vh">Ask an HR question</span><input name="q" placeholder="Ask an HR question" autocomplete="off" maxlength="200"></label><button type="submit" class="btn btn-ink btn-sm">Ask</button></form></div>' +
        '<div class="hr-panel"><h4 class="hr-h4">My HR questions</h4><p class="hr-muted">Questions the handbook could not answer become tickets for HR. Simulated: nobody is notified.</p>' +
        (mine.length ? mine.map(function (t) { return '<div class="hr-tk"><div class="hr-item-h"><span class="hr-id">' + t.id + '</span>' + pill(t.status) + '</div><b>' + esc(t.subj) + '</b>' + (t.replies.length ? t.replies.map(function (r) { return '<p class="hr-tk-r"><small>' + esc(r.by) + ' · ' + esc(r.at) + '</small>' + esc(r.text) + '</p>'; }).join('') : '<small class="hr-muted">No answer yet. Laura White sees it in the HR inbox.</small>') + '</div>'; }).join('') : '<p class="hr-muted hr-empty">No tickets yet. Try “Can I bring my dog to the office?”</p>') + '</div></div>';
    }
    function msgHtml(m) { return '<div class="hr-msg ' + m.who + '">' + m.html + '</div>'; }
    function ask(text) {
      text = String(text || '').trim(); if (!text) return;
      chat.push({ who: 'me', html: esc(text) });
      var hit = KB.filter(function (k) { return k.re.test(text); })[0], html;
      if (hit) {
        var a = typeof hit.a === 'function' ? hit.a() : hit.a;
        html = a + '<span class="hr-src">Source: Employee handbook 2026 · ' + HB[hit.sec][0] + ' <button type="button" class="hr-link" data-h="doc" data-id="hb">Open document</button></span>';
      } else {
        var id = 'HR-' + (tixN++);
        TIX.unshift({ id: id, from: 'James Taylor', subj: text.length > 60 ? text.slice(0, 57) + '…' : text, q: text, at: stamp(), status: 'Open', origin: 'HR assistant (no handbook match)', replies: [] });
        tixSel = id; tixF = 'Open';
        html = 'I could not find this in the employee handbook, so I will not guess. I created a ticket for the HR team instead.<span class="hr-ticket"><b>' + id + ' · Open</b> · simulated, nobody is notified</span><span class="hr-src">You can follow it under My HR questions. HR sees it in the HR inbox.</span>';
      }
      chat.push({ who: 'bot', html: html, anim: true });
      render();
      var log = q1('.hr-chat'), last = log && log.lastElementChild;
      if (last && !SDA.reduce) { last.innerHTML = ''; ctx.later(250, function () { if (last.isConnected) SDA.typeInto(last, html, function () { log.scrollTop = log.scrollHeight; }); }); }
      var inp = q1('[data-f="ask"] input'); inp && inp.focus();
    }

    /* ===== Manager: approvals ===== */
    function vApv() {
      var P = LV.filter(function (l) { return l.status === 'Pending'; }).sort(function (a, b) { return a.from - b.from; });
      var D = LV.filter(function (l) { return l.decidedNow; });
      return head('Leave approvals', 'Customer Success team · 6 people · minimum staffing ' + MINP + ' present per working day', '<button type="button" class="btn btn-ghost btn-sm" data-h="doc" data-id="pol-leave">' + I.doc + 'Leave policy</button>') +
        '<div class="hr-two wide"><div class="hr-panel"><h4 class="hr-h4">Pending requests (' + P.length + ')</h4>' + (P.length ? P.map(lvCard).join('') : '<p class="hr-muted hr-empty">All caught up. New requests from your team appear here.</p>') +
        (D.length ? '<h4 class="hr-h4">Decided today</h4>' + D.map(function (l) { return '<div class="hr-req"><div><b>' + esc(l.who) + '</b><small>' + esc(l.type) + ' · ' + short(l.from) + ' – ' + short(l.to) + (l.comment ? ' · “' + esc(l.comment) + '”' : '') + '</small></div><div class="hr-req-r">' + pill(l.status) + '</div></div>'; }).join('') : '') + '</div>' +
        '<div class="hr-panel">' + calHtml() + '</div></div>';
    }
    function lvCard(l) {
      var cov = coverage(l), bal = balOf(l.who), after = l.type === 'Annual leave' ? bal - (l.who === 'James Taylor' ? 0 : l.days) : bal;
      return '<article class="hr-lv' + (lvFocus === l.id ? ' foc' : '') + '"><div class="hr-lv-h">' + av(l.who) + '<div><b>' + esc(l.who) + '</b><small>' + esc(l.type) + ' · ' + wday(l.from) + ' – ' + wday(l.to) + ' · ' + plural(l.days, 'day') + '</small></div>' + pill('Pending') + '</div>' +
        (l.note ? '<p class="hr-lv-note">“' + esc(l.note) + '”</p>' : '') +
        '<div class="hr-ai-box ' + (cov.length ? 'warn' : 'ok') + '"><span class="hr-ai-l">' + I.spark + 'Coverage check (simulated)</span>' +
        (cov.length ? cov.map(function (x) { return '<b>' + wday(x.d) + ':</b> only ' + x.present + ' of ' + TEAM.length + ' present (' + esc(x.others.join(', ')) + ' also away)'; }).join('<br>') + '. Minimum is ' + MINP + '.' : 'Coverage OK: at least ' + MINP + ' of ' + TEAM.length + ' present on every day.') +
        (l.type === 'Annual leave' ? '<br>Annual leave balance after approval: <b>' + plural(after, 'day') + '</b>.' : '') + '</div>' +
        (lvDecline === l.id ? '<form class="hr-form" data-f="decline" data-id="' + l.id + '"><label>Comment for ' + esc(l.who.split(' ')[0]) + ' <span class="hr-opt">(optional)</span><input name="c" maxlength="140" placeholder="e.g. Could you move Wednesday?"></label><div class="hr-btns"><button type="submit" class="btn btn-ink btn-sm">Confirm decline</button><button type="button" class="btn btn-ghost btn-sm" data-h="lv-no" data-id="">Cancel</button></div></form>' :
          '<div class="hr-btns"><button type="button" class="btn btn-ink btn-sm" data-h="lv-ok" data-id="' + l.id + '">' + I.check + (cov.length ? 'Approve anyway' : 'Approve') + '</button><button type="button" class="btn btn-ghost btn-sm" data-h="lv-no" data-id="' + l.id + '">Decline…</button><button type="button" class="btn btn-ghost btn-sm" data-h="lv-focus" data-id="' + l.id + '" aria-pressed="' + (lvFocus === l.id) + '">Show in calendar</button></div>') + '</article>';
    }
    function calHtml() {
      var days = []; for (var i = 0; i < 14; i++) { var d = addD(calStart, i); if (isWork(d)) days.push(d); }
      var cell = function (p, d) {
        var l = LV.filter(function (x) { return x.who === p && /Approved|Pending/.test(x.status) && x.from <= d && d <= x.to; })[0];
        if (!l) return '<span class="hr-c"></span>';
        return '<span class="hr-c ' + (l.status === 'Approved' ? 'on' : 'pend') + (lvFocus === l.id ? ' foc' : '') + '" title="' + esc(p + ' · ' + l.type + ' · ' + l.status) + '"><span class="hr-vh">' + esc(p) + ', ' + wday(d) + ': ' + l.status.toLowerCase() + ' ' + l.type.toLowerCase() + '</span></span>';
      };
      return '<div class="hr-cal-h"><h4 class="hr-h4">Team calendar</h4><div class="hr-cal-nav"><button type="button" class="hr-icb" data-h="cal" data-id="-7" aria-label="Previous week">' + ICO.left + '</button><span>' + short(days[0]) + ' – ' + short(days[days.length - 1]) + '</span><button type="button" class="hr-icb" data-h="cal" data-id="7" aria-label="Next week">' + ICO.right + '</button></div></div>' +
        '<div class="hr-cal-w"><div class="hr-cal" style="--n:' + days.length + '">' +
        '<div class="hr-cal-r hd"><span></span>' + days.map(function (d) { return '<span><small>' + dayName(d) + '</small>' + d.getDate() + '</span>'; }).join('') + '</div>' +
        TEAM.map(function (p) { return '<div class="hr-cal-r"><span class="hr-cal-n">' + esc(p) + '</span>' + days.map(function (d) { return cell(p, d); }).join('') + '</div>'; }).join('') +
        '<div class="hr-cal-r pr"><span class="hr-cal-n">Present</span>' + days.map(function (d) { var n = TEAM.length - awayOn(d).length; return '<span class="' + (n < MINP ? 'low' : '') + '">' + n + '</span>'; }).join('') + '</div></div></div>' +
        '<div class="hr-legend"><span><i class="on"></i>Approved</span><span><i class="pend"></i>Pending</span><span><i class="low"></i>Below minimum (approved leave only)</span></div>';
    }
    function decide(id, status, comment) {
      var l = LV.filter(function (x) { return x.id === id; })[0]; if (!l || l.status !== 'Pending') return;
      l.status = status; l.by = 'Michael Brown'; l.comment = comment || ''; l.decidedNow = true; lvDecline = null; if (lvFocus === id) lvFocus = null;
      if (status === 'Approved') guide.done('approve');
      render();
      toast(status + ': ' + esc(l.who) + ', ' + short(l.from) + ' – ' + short(l.to) + '. ' + esc(l.who.split(' ')[0]) + ' sees it in My leave (no e-mail sent).');
      say('Leave request ' + status.toLowerCase());
    }

    /* ===== Manager: interviews ===== */
    function vInt() {
      var W = C.filter(function (c) { return c.stage === 2 && !c.rej && !c.fb; }), G = C.filter(function (c) { return c.fb && !c.rej; });
      return head('Interviews', 'Your interviews for the open positions. Feedback lands in the candidate record for HR.', '') +
        '<h4 class="hr-h4">Waiting for your feedback (' + W.length + ')</h4>' + (W.length ? '<div class="hr-ivs">' + W.map(ivCard).join('') + '</div>' : '<p class="hr-muted hr-empty">No open interviews. When HR moves a candidate to Interview, it shows up here.</p>') +
        '<h4 class="hr-h4">Feedback given (' + G.length + ')</h4><div class="hr-ivs">' + G.map(ivCard).join('') + '</div>';
    }
    function ivCard(c) {
      var m = match(c), iv = c.iv;
      return '<article class="hr-panel hr-iv"><div class="hr-lv-h">' + av(c.name) + '<div><b>' + esc(c.name) + '</b><small>' + job(c).title + ' · ' + STAGES[c.stage] + '</small></div><span class="hr-score ' + scoreCls(m) + '">' + m + '%</span></div>' +
        (iv ? '<p class="hr-when">' + ICO.leave + wday(iv.when) + ', ' + iv.time + ' · ' + iv.fmt + '</p>' : '') +
        '<div class="hr-btns"><button type="button" class="btn btn-ghost btn-sm" data-h="doc" data-id="' + c.cvId + '">' + I.doc + 'Open CV</button><button type="button" class="btn btn-ghost btn-sm" data-h="cand" data-id="' + c.id + '">Candidate profile</button></div>' +
        (iv && !c.fb ? '<p class="hr-ai-l">' + I.spark + 'Suggested questions (AI, simulated)</p><ol class="hr-qs">' + iv.qs.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' : '') +
        (c.fb ? '<div class="hr-fb"><b>Your score: ' + c.fb.score + '/5 · ' + esc(c.fb.rec) + '</b><p>' + esc(c.fb.text || 'No comment.') + '</p><small>' + esc(c.fb.at) + '</small></div>' :
          '<form class="hr-form" data-f="fb" data-id="' + c.id + '"><fieldset class="hr-rate"><legend>Score</legend>' + [1, 2, 3, 4, 5].map(function (n) { return '<label><input type="radio" name="score" value="' + n + '"><span>' + n + '</span></label>'; }).join('') + '<small>1 = weak · 5 = excellent</small></fieldset>' +
          '<label>Recommendation<select name="rec"><option>Strong hire</option><option selected>Hire</option><option>Not sure</option><option>No hire</option></select></label>' +
          '<label>Comments<textarea name="text" rows="3" placeholder="Strengths, concerns, next steps"></textarea></label><p class="hr-err" aria-live="polite"></p><button type="submit" class="btn btn-ink btn-sm">Submit feedback</button></form>') + '</article>';
    }

    /* ---------- events ---------- */
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-h]');
      var docBtn = e.target.closest('.sda-doc');
      if (docBtn && dmsEl.contains(docBtn)) { var cc = C.filter(function (x) { return x.cvId === docBtn.dataset.doc; })[0]; if (cc && cc.fromInbox) guide.done('cv'); }
      if (!t || !root.contains(t)) return;
      var h = t.dataset.h, id = t.dataset.id;
      if (h === 'nav') { view = id; closeDrawer(true); render(); var b = nav.querySelector('[data-id="' + id + '"]'); b && b.focus(); return; }
      if (h === 'cand') { openDrawer(id); return; }
      if (h === 'close-dr') { closeDrawer(); return; }
      if (h === 'doc') { openDoc(id); return; }
      if (h === 'stage') { moveStage(cand(drawerId), +t.dataset.s); return; }
      if (h === 'rej-open') { rejOpen = !rejOpen; paintDrawer(); var rf1 = q1(rejOpen ? '[data-f="rej"] select' : '[data-h="rej-open"]', drawer); rf1 && rf1.focus(); return; }
      if (h === 'restore') { var c = cand(id); c.rej = null; act(c, 'Restored to ' + STAGES[c.stage], PERSON[role]); main.innerHTML = vRec(); paintBoard(); if (drawerId === id) paintDrawer(); toast(esc(c.name) + ' restored.'); return; }
      if (h === 'rej-toggle') { rf.rej = !rf.rej; t.setAttribute('aria-pressed', rf.rej); paintBoard(); return; }
      if (h === 'inbox') { openInbox(); return; }
      if (h === 'ib-sel') { ibSel = id; paintInbox(); var s = ibModal && ibModal.body.querySelector('[data-h="ib-sel"][data-id="' + id + '"]'); s && s.focus(); return; }
      if (h === 'ib-run') { if (t.getAttribute('aria-disabled') !== 'true') runInbox(); return; }
      if (h === 'ib-close') { ibModal && ibModal.close(); return; }
      if (h === 'ib-open') { ibModal && ibModal.close(); if (view !== 'rec') { view = 'rec'; render(); } openDrawer(id); return; }
      if (h === 'tix-f') { tixF = id; render(); return; }
      if (h === 'tix') { tixSel = id; render(); var tb = main.querySelector('[data-h="tix"][data-id="' + id + '"]'); tb && tb.focus(); return; }
      if (h === 'tix-close' || h === 'tix-reopen') { var tk = TIX.filter(function (x) { return x.id === id; })[0]; tk.status = h === 'tix-close' ? 'Closed' : 'Open'; if (tixF !== 'All') tixF = tk.status; render(); toast(tk.id + ' ' + (h === 'tix-close' ? 'closed' : 'reopened') + '.'); return; }
      if (h === 'ask') { ask(t.dataset.q); return; }
      if (h === 'lv-cancel') { var lc = LV.filter(function (x) { return x.id === id; })[0]; lc.status = 'Cancelled'; render(); toast('Request cancelled.'); return; }
      if (h === 'lv-ok') { decide(id, 'Approved'); return; }
      if (h === 'lv-no') { lvDecline = id || null; render(); var di = q1('[data-f="decline"] input'); di && di.focus(); return; }
      if (h === 'lv-focus') { lvFocus = lvFocus === id ? null : id; var lf2 = LV.filter(function (x) { return x.id === id; })[0]; if (lvFocus && lf2) { var wk = new Date(lf2.from); while (wk.getDay() !== 1) wk = addD(wk, -1); calStart = wk; } render(); return; }
      if (h === 'cal') { calStart = addD(calStart, +id); render(); var cb = q1('[data-h="cal"][data-id="' + id + '"]'); cb && cb.focus(); return; }
    });
    root.addEventListener('submit', function (e) {
      var f = e.target.closest('form[data-f]'); if (!f) return; e.preventDefault();
      var k = f.dataset.f;
      if (k === 'note') { var v = f.t.value.trim(); if (!v) { f.t.focus(); return; } var c = cand(drawerId); c.notes.push({ by: PERSON[role], at: stamp(), text: v }); act(c, 'Note added', PERSON[role]); paintDrawer(); toast('Note saved to ' + esc(c.name) + '.'); var ni = q1('[data-f="note"] input', drawer); ni && ni.focus(); return; }
      if (k === 'rej') { var cr = cand(drawerId); cr.rej = { reason: f.reason.value, note: f.note.value.trim(), at: short(now) }; act(cr, 'Rejected: ' + cr.rej.reason + (f.mail.checked ? ' · rejection e-mail drafted (simulated, not sent)' : ''), PERSON[role]); rejOpen = false; main.innerHTML = vRec(); paintBoard(); paintDrawer(); toast(esc(cr.name) + ' rejected.' + (f.mail.checked ? ' E-mail simulated, not sent.' : '')); return; }
      if (k === 'leave') {
        readLeave(f); var r = checkLeave(); if (r.err) { paintPreview(); f.from.focus(); return; }
        LV.push({ id: 'L' + (lvN++), who: 'James Taylor', type: lf.type, from: r.a, to: r.b, days: r.days, status: 'Pending', note: lf.note.trim(), at: short(now) });
        lf.note = ''; render(); toast('Request sent. It now waits in Michael Brown’s approval queue (no e-mail sent).'); say('Leave request submitted'); return;
      }
      if (k === 'ask') { var qv = f.q.value; f.q.value = ''; ask(qv); return; }
      if (k === 'reply') {
        var tx = f.t.value.trim(), tk = TIX.filter(function (x) { return x.id === f.dataset.id; })[0];
        if (!tx) { q1('.hr-err', f).textContent = 'Write an answer first.'; f.t.focus(); return; }
        tk.replies.push({ by: 'Laura White', at: stamp(), text: tx }); tk.status = 'Answered'; tk.seen = false; if (tixF === 'Open') tixF = 'Answered'; render();
        toast('Reply saved to ' + tk.id + '. ' + esc(tk.from.split(' ')[0]) + ' sees it in the HR assistant (simulated, no e-mail sent).'); return;
      }
      if (k === 'decline') { decide(f.dataset.id, 'Declined', f.c.value.trim()); return; }
      if (k === 'fb') {
        var sc = f.querySelector('input[name="score"]:checked');
        if (!sc) { q1('.hr-err', f).textContent = 'Choose a score from 1 to 5.'; f.querySelector('input[name="score"]').focus(); return; }
        var ci = cand(f.dataset.id); ci.fb = { score: +sc.value, rec: f.rec.value, text: f.text.value.trim(), by: 'Michael Brown', at: stamp() };
        act(ci, 'Interview feedback ' + ci.fb.score + '/5 · ' + ci.fb.rec, 'Michael Brown'); render(); toast('Feedback saved. Laura White sees it in ' + esc(ci.name) + '’s record.'); return;
      }
    });
    root.addEventListener('input', function (e) {
      var t = e.target;
      if (t.dataset.in === 'q') { rf.q = t.value; paintBoard(); return; }
      var f = t.form; if (f && f.dataset.f === 'leave') { readLeave(f); paintPreview(); }
    });
    root.addEventListener('change', function (e) {
      var t = e.target;
      if (t.dataset.in === 'job') { rf.job = t.value; paintBoard(); return; }
      var f = t.form; if (f && f.dataset.f === 'leave') { readLeave(f); paintPreview(); }
      if (f && f.dataset.f === 'fb') { var er = q1('.hr-err', f); if (er) er.textContent = ''; }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawerId && !e.target.closest('.sda-modal') && !root.querySelector('.sda-modal')) closeDrawer();
    });
    /* drag & drop between pipeline columns (mouse); keyboard and touch use the stage buttons in the drawer */
    var dragId = null;
    root.addEventListener('dragstart', function (e) { var c = e.target.closest && e.target.closest('.hr-card'); if (!c || role !== 'hr') return; dragId = c.dataset.cid; c.classList.add('drag'); try { e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move'; } catch (x) {} });
    root.addEventListener('dragend', function () { dragId = null; Array.prototype.forEach.call(root.querySelectorAll('.hr-col.over, .hr-card.drag'), function (x) { x.classList.remove('over', 'drag'); }); });
    root.addEventListener('dragover', function (e) { var col = e.target.closest && e.target.closest('.hr-col'); if (!col || !dragId) return; e.preventDefault(); Array.prototype.forEach.call(root.querySelectorAll('.hr-col.over'), function (x) { if (x !== col) x.classList.remove('over'); }); col.classList.add('over'); });
    root.addEventListener('drop', function (e) { var col = e.target.closest && e.target.closest('.hr-col'); if (!col || !dragId) return; e.preventDefault(); var c = cand(dragId); dragId = null; col.classList.remove('over'); if (c) moveStage(c, +col.dataset.stage, 'drag and drop'); });

    render();
    return function () { if (ibModal) { try { ibModal.el.remove(); } catch (x) {} } var m = document.querySelectorAll('.sda-modal'); Array.prototype.forEach.call(m, function (x) { if (root.contains(x)) x.remove(); }); };
  });
})();
