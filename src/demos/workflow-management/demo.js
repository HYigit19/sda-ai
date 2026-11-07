/* Workflow Management demo (TaskFlow). All data is fictional sample data.
   Nothing is sent anywhere: notifications and e-mails are simulated, AI steps are simulated. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-workflow', function (root, ctx) {
    var $ = function (s, r) { return (r || root).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
    var esc = SDA.esc, IC = SDA.icon;
    var DAY = 864e5, NOW = new Date(), T0 = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (off) { var d = new Date(T0.getTime() + off * DAY); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var parse = function (s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
    var daysTo = function (s) { return Math.round((parse(s) - T0) / DAY); };
    var fmtDue = function (s) { return parse(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    var ago = function (h) { return new Date(NOW.getTime() - h * 36e5); };
    var stamp = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + SDA.fmtTime(d); };
    var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var ICO = {
      tasks: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5 2.5-2.5"/>'),
      approvals: svg('<path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="4"/>'),
      flows: svg('<rect x="3" y="4" width="6" height="6" rx="1.5"/><rect x="15" y="4" width="6" height="6" rx="1.5"/><rect x="9" y="15" width="6" height="6" rx="1.5"/><path d="M9 7h6M6 10v3a2 2 0 0 0 2 2h1M18 10v3a2 2 0 0 1-2 2h-1"/>'),
      notes: svg('<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
      docs: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
      load: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
      lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
      clip: svg('<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4L15.5 7.3"/>'),
      chat: svg('<path d="M4 5h16v11H8l-4 4z"/>'),
      team: svg('<circle cx="9" cy="8" r="3"/><path d="M3 20c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2"/><circle cx="17" cy="9" r="2.3"/><path d="M16.5 14c2.2.3 3.8 1.8 4.3 4.4"/>'),
      list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
      board: svg('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>'),
      plus: svg('<path d="M12 5v14M5 12h14"/>'),
      play: svg('<path d="M7 5v14l11-7z"/>'),
      arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
      dl: svg('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>')
    };

    /* ---------------- people, teams, roles ---------------- */
    var GROUPS = {
      'Finance team': { lead: 'David Wilson', members: ['Sarah Johnson', 'Michael Brown'] },
      'Quality': { lead: 'David Wilson', members: ['Anna White', 'Daniel Lee'] },
      'IT support': { lead: 'Lisa Miller', members: ['Lisa Miller', 'Robert Clark'] },
      'Facilities': { lead: 'James Taylor', members: ['James Taylor', 'Kevin Hall'] },
      'HR': { lead: 'Olivia Martin', members: ['Olivia Martin', 'Jessica Moore'] }
    };
    var GN = Object.keys(GROUPS);
    var PEOPLE = ['Sarah Johnson', 'Michael Brown', 'David Wilson', 'Anna White', 'Daniel Lee', 'Lisa Miller', 'Robert Clark', 'James Taylor', 'Kevin Hall', 'Olivia Martin', 'Jessica Moore', 'Emma Davis'];
    var ROLES = [
      { id: 'lead', label: 'Team lead', person: 'David Wilson', icon: 'DW', sub: 'Leads Finance and Quality: assigns work to people or teams, reprioritises, approves finished tasks and starts workflow templates.' },
      { id: 'emp', label: 'Employee', person: 'Sarah Johnson', icon: 'SJ', sub: 'Finance team member: works on her own tasks, claims Finance team tasks, accepts, rejects or finishes them.' },
      { id: 'admin', label: 'Office admin', person: 'Emma Davis', icon: 'ED', sub: 'Sees every task, workload per person and team, the overdue report, and manages workflow templates.' }
    ];
    var role = 'lead';
    var me = function () { return ROLES.filter(function (r) { return r.id === role; })[0].person; };
    var groupsOf = function (p) { return GN.filter(function (g) { return GROUPS[g].members.indexOf(p) > -1; }); };
    var leadGroups = function (p) { return GN.filter(function (g) { return GROUPS[g].lead === p; }); };
    var initials = function (n) { return n.split(' ').map(function (x) { return x.charAt(0); }).join('').slice(0, 2).toUpperCase(); };
    var PRIO = ['Urgent', 'High', 'Normal', 'Low'];
    var SLA = { Urgent: 1, High: 3, Normal: 5, Low: 10 };

    /* ---------------- tasks ---------------- */
    var TASKS = [], RUNS = [], NOTES = [], nT = 1042, nR = 202, nN = 0, seq = 0;
    var task = function (id) { return TASKS.filter(function (t) { return t.id === id; })[0]; };
    var aLabel = function (a) { return a.to; };
    var who = function (t) { return t.a.type === 'person' ? t.a.to : t.owner; };
    var approverFor = function (t) {
      var g = t.a.type === 'group' ? t.a.to : groupsOf(t.a.to)[0];
      var ap = g ? GROUPS[g].lead : 'David Wilson';
      return ap === who(t) ? 'Emma Davis' : ap;
    };
    function mk(o) {
      var t = Object.assign({ prio: 'Normal', status: 'Open', owner: null, by: 'David Wilson', approval: false, approver: null, deps: [], comments: [], log: [], run: null, reason: '', desc: '', created: ago(30), mentions: [] }, o);
      t.id = 'TSK-' + o.n; delete t.n;
      if (!t.approver) t.approver = approverFor(t);
      t.log.unshift({ at: t.created, by: t.by, text: 'Created the task and assigned it to ' + aLabel(t.a) });
      TASKS.push(t); return t;
    }
    var G = function (g) { return { type: 'group', to: g }; }, P = function (p) { return { type: 'person', to: p }; };

    mk({ n: 1041, title: 'Check and post vendor invoice INV-2291 from Harbor Office Supply', desc: 'Invoice for office furniture, $3,840.00. Match against PO-7713 and the goods receipt, then post it for payment.', a: G('Finance team'), prio: 'High', due: iso(1), created: ago(5) });
    mk({ n: 1039, title: 'Reconcile Q3 travel expenses', desc: 'Reconcile all Q3 travel expense reports against the corporate card statement. Flag anything outside the travel policy.', a: P('Sarah Johnson'), prio: 'Normal', status: 'In progress', due: iso(-2), created: ago(160),
      log: [{ at: ago(150), by: 'Sarah Johnson', text: 'Accepted the task' }, { at: ago(140), by: 'Sarah Johnson', text: 'Started work' }],
      comments: [{ at: ago(30), by: 'Michael Brown', text: '@Sarah Johnson the card statement for September is in the library now.' }], mentions: ['Sarah Johnson'] });
    mk({ n: 1038, title: 'Update cost center mapping for the new Quality lab', desc: 'Create mapping for cost centers 4410 to 4415 in the reporting tool.', a: P('Sarah Johnson'), status: 'On hold', reason: 'Waiting for the cost center numbers from Controlling', due: iso(5), created: ago(70),
      log: [{ at: ago(66), by: 'Sarah Johnson', text: 'Accepted the task' }, { at: ago(60), by: 'Sarah Johnson', text: 'Started work' }, { at: ago(20), by: 'Sarah Johnson', text: 'Put on hold: Waiting for the cost center numbers from Controlling' }] });
    mk({ n: 1036, title: 'Monthly payroll variance check (October)', desc: 'Compare October payroll with September and explain every variance above 2%.', a: P('Michael Brown'), prio: 'High', status: 'Awaiting approval', approval: true, due: iso(0), created: ago(90),
      log: [{ at: ago(80), by: 'Michael Brown', text: 'Accepted the task' }, { at: ago(78), by: 'Michael Brown', text: 'Started work' }, { at: ago(3), by: 'Michael Brown', text: 'Finished · sent to David Wilson for approval' }] });
    mk({ n: 1035, title: 'Calibrate torque wrenches on assembly line 2', desc: 'Annual calibration of 14 torque wrenches. Record results in the calibration log.', a: G('Quality'), owner: 'Daniel Lee', status: 'In progress', due: iso(3), created: ago(50),
      log: [{ at: ago(45), by: 'Daniel Lee', text: 'Claimed the task for Quality' }, { at: ago(44), by: 'Daniel Lee', text: 'Started work' }] });
    mk({ n: 1034, title: 'Supplier audit report: Northgate Plastics', desc: 'Write up the on-site audit findings and the agreed corrective actions.', a: P('Anna White'), prio: 'High', status: 'Awaiting approval', approval: true, due: iso(-1), created: ago(120),
      log: [{ at: ago(110), by: 'Anna White', text: 'Accepted the task' }, { at: ago(100), by: 'Anna White', text: 'Started work' }, { at: ago(26), by: 'Anna White', text: 'Finished · sent to David Wilson for approval' }] });
    mk({ n: 1033, title: 'Replace broken badge reader at entrance B', desc: 'Badge reader at entrance B is down since this morning. Staff use entrance A. Safety relevant: urgent.', a: G('Facilities'), prio: 'Urgent', due: iso(-1), by: 'Emma Davis', created: ago(28) });
    mk({ n: 1032, title: 'VPN access for new contractor', desc: 'Contractor starts Monday, needs VPN and read access to the project share.', a: G('IT support'), owner: 'Robert Clark', status: 'Done', due: iso(-3), by: 'Emma Davis', created: ago(110),
      log: [{ at: ago(100), by: 'Robert Clark', text: 'Claimed the task for IT support' }, { at: ago(98), by: 'Robert Clark', text: 'Started work' }, { at: ago(90), by: 'Robert Clark', text: 'Finished the task' }] });
    mk({ n: 1031, title: 'Renew design software licenses', desc: 'Renew 6 seats before the end of the month. No rush, quote is already approved.', a: G('IT support'), prio: 'Low', due: iso(12), by: 'Emma Davis', created: ago(40) });
    mk({ n: 1030, title: 'Prepare budget forecast 2027 for Finance', desc: 'Draft the 2027 budget forecast for the Finance department based on the template. Deadline for the management meeting.', a: P('Sarah Johnson'), prio: 'High', approval: true, due: iso(6), created: ago(2) });
    mk({ n: 1024, title: 'Archive 2025 invoices in the document library', desc: 'Move all 2025 invoices into the Invoices folder and tag them by vendor.', a: G('Finance team'), owner: 'Michael Brown', status: 'Done', due: iso(-6), created: ago(240),
      log: [{ at: ago(230), by: 'Michael Brown', text: 'Claimed the task for Finance team' }, { at: ago(200), by: 'Michael Brown', text: 'Finished the task' }] });
    // a running onboarding workflow
    var r1 = { id: 'WF-201', tpl: 'onboard', title: 'Onboard new employee: Ryan Scott', by: 'David Wilson', started: ago(72), tasks: ['TSK-1025', 'TSK-1026', 'TSK-1027', 'TSK-1028', 'TSK-1029'] };
    RUNS.push(r1);
    mk({ n: 1025, run: 'WF-201', title: 'Prepare contract and welcome pack for Ryan Scott', a: G('HR'), owner: 'Olivia Martin', status: 'Done', due: iso(-2), created: ago(72), log: [{ at: ago(60), by: 'Olivia Martin', text: 'Claimed the task for HR' }, { at: ago(30), by: 'Olivia Martin', text: 'Finished the task' }] });
    mk({ n: 1026, run: 'WF-201', title: 'Create accounts and prepare laptop for Ryan Scott', a: G('IT support'), owner: 'Lisa Miller', status: 'In progress', deps: ['TSK-1025'], due: iso(2), created: ago(72), log: [{ at: ago(28), by: 'Lisa Miller', text: 'Claimed the task for IT support' }, { at: ago(27), by: 'Lisa Miller', text: 'Started work' }] });
    mk({ n: 1027, run: 'WF-201', title: 'Desk, badge and parking space for Ryan Scott', a: G('Facilities'), deps: ['TSK-1025'], due: iso(2), created: ago(72) });
    mk({ n: 1028, run: 'WF-201', title: 'Set up payroll and expense card for Ryan Scott', a: G('Finance team'), deps: ['TSK-1025'], due: iso(3), created: ago(72), approval: true });
    mk({ n: 1029, run: 'WF-201', title: 'Day-one welcome and policy sign-off with Ryan Scott', a: G('HR'), deps: ['TSK-1026', 'TSK-1027', 'TSK-1028'], due: iso(5), created: ago(72) });

    /* ---------------- templates ---------------- */
    var TPL = [
      { id: 'onboard', name: 'Onboard new employee', active: true, v: 3, desc: 'Contract, accounts, desk, payroll and day-one welcome across four teams.',
        fields: [{ k: 'name', label: 'New employee name', ph: 'e.g. Grace Turner' }, { k: 'start', label: 'Start date', type: 'date' }],
        steps: [
          { title: 'Prepare contract and welcome pack for {name}', a: 'g:HR', days: 2, deps: [], approval: false },
          { title: 'Create accounts and prepare laptop for {name}', a: 'g:IT support', days: 4, deps: [0], approval: false },
          { title: 'Desk, badge and parking space for {name}', a: 'g:Facilities', days: 4, deps: [0], approval: false },
          { title: 'Set up payroll and expense card for {name}', a: 'g:Finance team', days: 5, deps: [0], approval: true },
          { title: 'Day-one welcome and policy sign-off with {name}', a: 'g:HR', days: 7, deps: [1, 2, 3], approval: false }] },
      { id: 'purchase', name: 'Purchase request > $5,000', active: true, v: 2, desc: 'Budget check, supplier check, lead approval, purchase order and goods receipt.',
        fields: [{ k: 'item', label: 'What is being bought?', ph: 'e.g. 3D printer for the lab' }, { k: 'amount', label: 'Amount (USD)', type: 'number', ph: 'e.g. 7200' }, { k: 'supplier', label: 'Supplier', ph: 'e.g. Brightline Equipment Co.' }],
        steps: [
          { title: 'Budget check: {item} ({amount})', a: 'g:Finance team', days: 2, deps: [], approval: false },
          { title: 'Supplier qualification: {supplier}', a: 'g:Quality', days: 3, deps: [], approval: false },
          { title: 'Approve purchase of {item} ({amount})', a: 'p:David Wilson', days: 4, deps: [0, 1], approval: false },
          { title: 'Create purchase order for {supplier}', a: 'g:Finance team', days: 5, deps: [2], approval: false },
          { title: 'Goods receipt and incoming check: {item}', a: 'g:Facilities', days: 12, deps: [3], approval: false }] },
      { id: 'close', name: 'Month-end close', active: true, v: 1, desc: 'Reconciliations and accruals by Finance, reviewed by the team lead.',
        fields: [{ k: 'month', label: 'Month', ph: 'e.g. November' }],
        steps: [
          { title: 'Bank and card reconciliation ({month})', a: 'g:Finance team', days: 2, deps: [], approval: false },
          { title: 'Post accruals and deferrals ({month})', a: 'g:Finance team', days: 3, deps: [], approval: false },
          { title: 'Review month-end close ({month})', a: 'p:David Wilson', days: 4, deps: [0, 1], approval: false }] }
    ];

    /* ---------------- notifications (simulated) ---------------- */
    function note(to, text, tid, at, read) {
      if (!to || (!at && to === me())) return;
      NOTES.unshift({ id: ++nN, to: to, text: text, task: tid || null, at: at || new Date(), read: !!read });
    }
    note('Sarah Johnson', 'Michael Brown mentioned you in TSK-1039: “the card statement for September is in the library now.”', 'TSK-1039', ago(30), true);
    note('Finance team', 'New task for Finance team: TSK-1041 Check and post vendor invoice INV-2291', 'TSK-1041', ago(5));
    note('Sarah Johnson', 'David Wilson assigned TSK-1030 to you: Prepare budget forecast 2027 for Finance', 'TSK-1030', ago(2));
    note('David Wilson', 'Anna White finished TSK-1034 and asks for your approval', 'TSK-1034', ago(26));
    note('David Wilson', 'Michael Brown finished TSK-1036 and asks for your approval', 'TSK-1036', ago(3));
    note('Emma Davis', 'WF-201 Onboard new employee: Ryan Scott · step 1 of 5 done', null, ago(30), true);
    note('Emma Davis', 'SLA breach: TSK-1033 (Urgent, Facilities) is overdue and still unclaimed', 'TSK-1033', ago(4));
    var notesFor = function (p) { return NOTES.filter(function (n) { return n.to === p || (GROUPS[n.to] && GROUPS[n.to].members.indexOf(p) > -1); }); };

    /* ---------------- DMS ---------------- */
    var DOCS = [
      { name: 'Employee onboarding process.pdf', type: 'pdf', folder: 'Process documents', linked: 'WF-201', owner: 'Olivia Martin', status: 'Approved', version: 3, tags: ['process', 'HR'],
        title: 'Employee onboarding process', company: 'Northwind Components Inc.', meta: [['Process owner', 'HR'], ['Version', '3.0'], ['Valid from', 'Jan 1, 2026']],
        sections: [{ h: 'Purpose', p: 'Every new employee has a contract, equipment, a workplace and payroll set up before day one.' },
          { h: 'Steps', rows: [['Step', 'Team', 'Due'], ['Contract and welcome pack', 'HR', 'Start − 10 days'], ['Accounts and laptop', 'IT support', 'Start − 3 days'], ['Desk, badge, parking', 'Facilities', 'Start − 3 days'], ['Payroll and expense card', 'Finance team', 'Start − 2 days'], ['Day-one welcome', 'HR', 'Start date']] }] },
      { name: 'Purchase approval policy.pdf', type: 'pdf', folder: 'Process documents', owner: 'Emma Davis', status: 'Approved', version: 2, tags: ['policy', 'purchasing'],
        title: 'Purchase approval policy', company: 'Northwind Components Inc.', meta: [['Owner', 'Finance'], ['Version', '2.1']],
        sections: [{ h: 'Thresholds', rows: [['Amount', 'Approval'], ['Up to $1,000', 'Requester’s manager'], ['$1,000 to $5,000', 'Team lead'], ['Above $5,000', 'Budget check, supplier check and team lead approval workflow']] }, { h: 'Rule', p: 'Orders above $5,000 must use the “Purchase request > $5,000” workflow in TaskFlow.' }] },
      { name: 'Month-end close checklist.docx', type: 'docx', folder: 'Process documents', owner: 'David Wilson', status: 'Valid', tags: ['finance'],
        title: 'Month-end close checklist', company: 'Northwind Components Inc.', sections: [{ lines: ['Bank and card reconciliation', 'Accruals and deferrals', 'Intercompany balances', 'Review by team lead'] }] },
      { name: 'Purchase request form.pdf', type: 'pdf', folder: 'Forms', owner: 'Emma Davis', status: 'Valid', tags: ['form'],
        title: 'Purchase request form', company: 'Northwind Components Inc.', meta: [['Form', 'PR-01']], sections: [{ rows: [['Field', 'Value'], ['Item', ''], ['Amount (USD)', ''], ['Supplier', ''], ['Cost center', ''], ['Requested by', '']] }] },
      { name: 'IT access request form.docx', type: 'docx', folder: 'Forms', linked: 'TSK-1026', owner: 'Lisa Miller', status: 'Valid', tags: ['form', 'IT'],
        title: 'IT access request', company: 'Northwind Components Inc.', meta: [['Employee', 'Ryan Scott'], ['Start', 'Next Monday']], sections: [{ rows: [['System', 'Access'], ['E-mail and calendar', 'Standard'], ['ERP', 'Read, purchasing'], ['Project share', 'Read and write']] }] },
      { name: 'New hire data sheet – Ryan Scott.pdf', type: 'pdf', folder: 'Forms', linked: 'TSK-1025, TSK-1028', owner: 'Olivia Martin', status: 'Approved', tags: ['HR', 'onboarding'],
        title: 'New hire data sheet', company: 'Northwind Components Inc.', meta: [['Name', 'Ryan Scott'], ['Department', 'Quality'], ['Position', 'Quality engineer']], sections: [{ h: 'Payroll', p: 'Monthly salary, paid on the last working day. Expense card limit $2,000.' }] },
      { name: 'Invoice INV-2291 – Harbor Office Supply.pdf', type: 'pdf', folder: 'Invoices', linked: 'TSK-1041', owner: 'Michael Brown', status: 'In review', tags: ['invoice'],
        title: 'Invoice INV-2291', company: 'Harbor Office Supply', meta: [['Invoice date', SDA.fmtDate(ago(120))], ['PO', 'PO-7713'], ['Terms', '30 days']],
        sections: [{ rows: [['Item', 'Qty', 'Amount'], ['Height-adjustable desk', '4', '$2,760.00'], ['Office chair', '4', '$1,080.00'], ['Total', '', '$3,840.00']] }] },
      { name: 'Invoice INV-2287 – Brightline Cleaning.pdf', type: 'pdf', folder: 'Invoices', owner: 'Michael Brown', status: 'Approved', tags: ['invoice'],
        title: 'Invoice INV-2287', company: 'Brightline Cleaning Services', meta: [['Period', 'October'], ['Terms', '14 days']], sections: [{ rows: [['Service', 'Amount'], ['Office cleaning, October', '$1,950.00']] }] },
      { name: 'Travel and expense policy 2026.pdf', type: 'pdf', folder: 'Policies', linked: 'TSK-1039', owner: 'Emma Davis', status: 'Approved', tags: ['policy'],
        title: 'Travel and expense policy 2026', company: 'Northwind Components Inc.', sections: [{ h: 'Limits', rows: [['Expense', 'Limit'], ['Hotel per night', '$220'], ['Meals per day', '$75'], ['Economy flights', 'Under 6 hours']] }, { h: 'Receipts', p: 'Submit receipts within 30 days. Corporate card statements are reconciled quarterly.' }] },
      { name: 'Data protection policy.pdf', type: 'pdf', folder: 'Policies', owner: 'Emma Davis', status: 'Approved', tags: ['policy'],
        title: 'Data protection policy', company: 'Northwind Components Inc.', sections: [{ p: 'Personal data in tasks and attachments is visible only to the people working on the task, their team lead and the office admin.' }] },
      { name: 'Salary bands 2027.xlsx', type: 'xlsx', folder: 'Policies', owner: 'Olivia Martin', status: 'Draft', restricted: 'admin', tags: ['HR', 'confidential'],
        title: 'Salary bands 2027 (confidential)', company: 'Northwind Components Inc.', sections: [{ rows: [['Band', 'Min', 'Max'], ['B1', '$48,000', '$60,000'], ['B2', '$58,000', '$74,000'], ['B3', '$72,000', '$95,000']] }] },
      { name: 'Payroll variance report – October.xlsx', type: 'xlsx', folder: 'Task attachments', linked: 'TSK-1036', owner: 'Michael Brown', status: 'In review', restricted: 'lead', tags: ['payroll'],
        title: 'Payroll variance report – October', company: 'Northwind Components Inc.', sections: [{ rows: [['Cost center', 'Sep', 'Oct', 'Δ'], ['4100 Finance', '$84,200', '$84,900', '+0.8%'], ['4400 Quality', '$96,100', '$99,300', '+3.3% (new hire)'], ['4600 Facilities', '$51,700', '$51,700', '0.0%']] }] },
      { name: 'Supplier audit – Northgate Plastics.pdf', type: 'pdf', folder: 'Task attachments', linked: 'TSK-1034', owner: 'Anna White', status: 'In review', tags: ['audit', 'quality'],
        title: 'Supplier audit report', company: 'Northwind Components Inc.', meta: [['Supplier', 'Northgate Plastics'], ['Auditor', 'Anna White']], sections: [{ h: 'Findings', lines: ['Two minor findings in incoming inspection records', 'Calibration labels missing on 3 gauges'] }, { h: 'Result', p: 'Approved with corrective actions due in 30 days.' }] },
      { name: 'Badge reader entrance B.jpg', type: 'jpg', folder: 'Task attachments', linked: 'TSK-1033', owner: 'Emma Davis', status: 'Valid', img: SDA.art('install', 'Badge reader, entrance B'), tags: ['photo'] }
    ];
    var dmsEl = document.createElement('div');
    var dms = SDA.dms(dmsEl, {
      root: root, title: 'Document library', docs: DOCS, role: role,
      folders: ['Process documents', 'Forms', 'Invoices', 'Policies', 'Task attachments'],
      canUpload: function () { return true; },
      canApprove: function (r) { return r !== 'emp'; },
      filter: function (d, r) { return docAllowed(d, r); },
      userName: function () { return me(); },
      uploadFolder: 'Task attachments', uploadStatus: 'In review'
    });
    function docAllowed(d, r) { r = r || role; return !d.restricted || r === 'admin' || (d.restricted === 'lead' && r === 'lead'); }
    var docsOf = function (t) { return dms.docs().filter(function (d) { return (d.linked || '').split(/,\s*/).indexOf(t.id) > -1; }); };

    /* ---------------- helpers ---------------- */
    var COL = { 'Open': 'open', 'Accepted': 'open', 'Returned': 'open', 'In progress': 'prog', 'On hold': 'wait', 'Awaiting approval': 'wait', 'Done': 'done', 'Cancelled': 'done' };
    var closed = function (t) { return t.status === 'Done' || t.status === 'Cancelled'; };
    var blockers = function (t) { return t.deps.filter(function (d) { var x = task(d); return x && x.status !== 'Done'; }); };
    var overdue = function (t) { return !closed(t) && daysTo(t.due) < 0; };
    var stCls = function (s) { return { 'Open': 's-open', 'Accepted': 's-open', 'Returned': 's-bad', 'In progress': 's-prog', 'On hold': 's-wait', 'Awaiting approval': 's-appr', 'Done': 's-done', 'Cancelled': 's-off' }[s]; };
    var prioCls = function (p) { return 'pr-' + p.toLowerCase(); };
    function dueInfo(t) {
      if (closed(t)) return { cls: '', txt: 'Due ' + fmtDue(t.due) };
      var d = daysTo(t.due);
      if (d < 0) return { cls: 'bad', txt: (-d) + (d === -1 ? ' day' : ' days') + ' overdue' };
      if (d === 0) return { cls: 'warn', txt: 'Due today' };
      if (d === 1) return { cls: 'warn', txt: 'Due tomorrow' };
      return { cls: '', txt: 'Due ' + fmtDue(t.due) };
    }
    var av = function (name, kind) { return '<span class="wf-av' + (kind === 'group' ? ' g' : '') + '" aria-hidden="true">' + (kind === 'group' ? ICO.team : esc(initials(name))) + '</span>'; };
    function assigneeHtml(t, short) {
      if (t.a.type === 'person') return av(t.a.to) + '<span class="wf-who-n">' + esc(t.a.to) + '</span>';
      return av(t.a.to, 'group') + '<span class="wf-who-n">' + esc(t.a.to) + (t.owner ? '<small>' + (short ? '' : 'claimed by ') + esc(t.owner) + '</small>' : '<small>unclaimed</small>') + '</span>';
    }
    function log(t, text, by) { t.log.push({ at: new Date(), by: by || me(), text: text }); }
    function say(msg, kind) { SDA.toast(root, msg, kind); var l = $('.wf-live'); if (l) l.textContent = msg.replace(/<[^>]+>/g, ''); }
    function load(p) { return TASKS.filter(function (t) { return who(t) === p && !closed(t); }).length; }

    /* visibility per role */
    function visible(t) {
      var m = me();
      if (role === 'admin') return true;
      if (t.by === m || who(t) === m || (t.approver === m && t.status === 'Awaiting approval')) return true;
      if (t.a.type === 'group' && groupsOf(m).indexOf(t.a.to) > -1) return true;
      if (t.mentions.indexOf(m) > -1) return true;
      if (role === 'lead') {
        var lg = leadGroups(m);
        if (t.a.type === 'group' && lg.indexOf(t.a.to) > -1) return true;
        if (t.a.type === 'person' && groupsOf(t.a.to).some(function (g) { return lg.indexOf(g) > -1; })) return true;
      }
      return false;
    }
    /* permissions */
    function can(a, t) {
      var m = me(), mine = who(t) === m, member = t.a.type === 'group' && groupsOf(m).indexOf(t.a.to) > -1;
      switch (a) {
        case 'claim': return t.status === 'Open' && t.a.type === 'group' && !t.owner && member;
        case 'accept': return t.status === 'Open' && t.a.type === 'person' && mine;
        case 'reject': return t.status === 'Open' && ((t.a.type === 'person' && mine) || (t.a.type === 'group' && !t.owner && member));
        case 'start': return t.status === 'Accepted' && mine;
        case 'hold': return (t.status === 'Accepted' || t.status === 'In progress') && mine;
        case 'resume': return t.status === 'On hold' && mine;
        case 'finish': return t.status === 'In progress' && mine;
        case 'approve': case 'sendback': return t.status === 'Awaiting approval' && (t.approver === m || role === 'admin');
        case 'cancel': return t.status === 'Returned' && (t.by === m || role !== 'emp');
        case 'edit': return !closed(t) && (role !== 'emp' || t.by === m);
        case 'attach': case 'comment': return !closed(t) || role !== 'emp';
      }
      return false;
    }

    /* ---------------- guided task ---------------- */
    var cta = { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=workflow-management', text: 'Talk to us about your version' };
    var guide = SDA.guide($('.wf-guide'), { title: 'Hand a task to a team and approve the result', demoId: 'demo-workflow', cta: cta, steps: [
      { id: 'create', text: 'As <b>David Wilson</b>, create a task for the <b>Finance team</b> (keep “Needs approval” ticked)' },
      { id: 'accept', text: 'Switch to <b>Sarah Johnson</b> and claim it' },
      { id: 'attach', text: 'Attach a document to the task' },
      { id: 'finish', text: 'Start and finish the task' },
      { id: 'approve', text: 'Switch back to <b>David</b> and approve it' }] });
    var gstep = function (t, id) { if (t && t.fresh) guide.done(id); };

    /* ---------------- shell: roles, nav, views ---------------- */
    var nav = $('.wf-nav'), main = $('.wf-main'), drawer = $('.wf-drawer'), scrim = $('.wf-scrim');
    var view = 'tasks', openId = null, dTab = 'comments', lastFocus = null;
    var F = { scope: 'all', od: false, prio: 'All', q: '', layout: root.offsetWidth < 760 ? 'list' : 'board' };
    var NAV = {
      lead: [['tasks', 'Team tasks'], ['approvals', 'Approvals'], ['flows', 'Workflows'], ['notes', 'Notifications'], ['docs', 'Documents']],
      emp: [['tasks', 'My tasks'], ['notes', 'Notifications'], ['docs', 'Documents']],
      admin: [['tasks', 'All tasks'], ['load', 'Workload & reports'], ['flows', 'Templates'], ['notes', 'Notifications'], ['docs', 'Documents']]
    };
    var SCOPES = {
      emp: [['all', 'Mine & my groups'], ['me', 'Assigned to me'], ['groups', 'My groups'], ['created', 'Created by me']],
      lead: [['all', 'My teams'], ['unclaimed', 'Unclaimed'], ['approval', 'Needs my approval'], ['created', 'Created by me']],
      admin: [['all', 'All tasks'], ['unclaimed', 'Unclaimed'], ['approval', 'Awaiting approval'], ['blocked', 'Blocked']]
    };
    function scopeOk(t) {
      var m = me();
      switch (F.scope) {
        case 'me': return who(t) === m;
        case 'groups': return t.a.type === 'group' && groupsOf(m).indexOf(t.a.to) > -1;
        case 'created': return t.by === m;
        case 'unclaimed': return t.a.type === 'group' && !t.owner && t.status === 'Open';
        case 'approval': return t.status === 'Awaiting approval' && (role === 'admin' || t.approver === m);
        case 'blocked': return !closed(t) && blockers(t).length > 0;
      }
      return true;
    }
    function filtered() {
      var q = F.q.toLowerCase();
      return TASKS.filter(function (t) {
        if (!visible(t) || !scopeOk(t)) return false;
        if (F.od && !overdue(t)) return false;
        if (F.prio !== 'All' && t.prio !== F.prio) return false;
        if (q && (t.id + ' ' + t.title + ' ' + t.desc + ' ' + t.a.to + ' ' + (t.owner || '') + ' ' + (t.run || '')).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).sort(function (a, b) {
        return (closed(a) - closed(b)) || (overdue(b) - overdue(a)) || (PRIO.indexOf(a.prio) - PRIO.indexOf(b.prio)) || (parse(a.due) - parse(b.due));
      });
    }
    function counts() {
      var m = me();
      var c = {
        tasks: TASKS.filter(function (t) {
          if (!visible(t)) return false;
          if (role === 'admin') return overdue(t);
          if (role === 'lead') return (t.a.type === 'group' && !t.owner && t.status === 'Open' && leadGroups(m).indexOf(t.a.to) > -1) || (t.status === 'Returned' && t.by === m);
          return can('claim', t) || can('accept', t) || (t.status === 'Returned' && t.by === m);
        }).length,
        approvals: TASKS.filter(function (t) { return t.status === 'Awaiting approval' && t.approver === m; }).length,
        notes: notesFor(m).filter(function (n) { return !n.read; }).length,
        load: TASKS.filter(overdue).length
      };
      return c;
    }
    function renderNav() {
      var c = counts();
      if (!NAV[role].some(function (x) { return x[0] === view; })) view = 'tasks';
      nav.innerHTML = NAV[role].map(function (x) {
        var n = c[x[0]];
        return '<button type="button" data-v="' + x[0] + '"' + (x[0] === view ? ' aria-current="page"' : '') + '>' + ICO[x[0]] + '<span>' + x[1] + '</span>' + (n ? '<i class="cnt" aria-label="' + n + ' new">' + n + '</i>' : '') + '</button>';
      }).join('');
    }
    function render() {
      renderNav();
      if (view === 'docs') {
        main.innerHTML = '<div class="wf-head"><div><h3>Documents</h3><p class="note">Process documents, forms, invoices, policies and task attachments. Linked documents open from each task.</p></div></div>';
        main.appendChild(dmsEl); dms.render();
      } else {
        main.innerHTML = view === 'tasks' ? vTasks() : view === 'approvals' ? vApprovals() : view === 'flows' ? vFlows() : view === 'notes' ? vNotes() : vLoad();
        if (view === 'tasks') renderResults();
      }
      renderDrawer();
    }
    function refresh() {
      renderNav();
      if (view === 'tasks' && $('.wf-results', main)) renderResults();
      else if (view !== 'docs') render();
      else dms.render();
      renderDrawer();
    }
    function go(v) { view = v; render(); main.scrollTop = 0; }

    /* ---------------- tasks view ---------------- */
    function vTasks() {
      var title = role === 'emp' ? 'My tasks' : role === 'admin' ? 'All tasks' : 'Team tasks';
      var sub = role === 'emp' ? 'Your own tasks and tasks for the Finance team. Claim a team task to make it yours.' : role === 'admin' ? 'Every task across all teams, with SLA and overdue highlighting.' : 'Tasks for Finance and Quality, and everything you assigned.';
      return '<div class="wf-head"><div><h3>' + title + '</h3><p class="note">' + sub + '</p></div><div class="wf-acts">' +
        '<div class="wf-seg" role="group" aria-label="Layout"><button type="button" data-layout="board" aria-pressed="' + (F.layout === 'board') + '">' + ICO.board + 'Board</button><button type="button" data-layout="list" aria-pressed="' + (F.layout === 'list') + '">' + ICO.list + 'List</button></div>' +
        (role === 'lead' ? '<button type="button" class="btn btn-ghost btn-sm" data-act="flow">' + ICO.play + 'Start workflow</button>' : '') +
        '<button type="button" class="btn btn-ink btn-sm" data-act="new">' + ICO.plus + 'New task</button></div></div>' +
        '<div class="wf-filters"><div class="wf-chips" role="group" aria-label="Show tasks">' + SCOPES[role].map(function (s) {
          return '<button type="button" class="wf-chip" data-scope="' + s[0] + '" aria-pressed="' + (F.scope === s[0]) + '">' + s[1] + '</button>';
        }).join('') + '<button type="button" class="wf-chip od" data-od aria-pressed="' + F.od + '">Overdue only</button></div>' +
        '<div class="wf-fr"><label class="wf-search">' + IC.search + '<input type="search" data-q placeholder="Search tasks, IDs, teams" aria-label="Search tasks" value="' + esc(F.q) + '"></label>' +
        '<select data-prio aria-label="Priority"><option value="All">All priorities</option>' + PRIO.map(function (p) { return '<option' + (F.prio === p ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></div></div>' +
        '<p class="note wf-sum" aria-live="polite"></p><div class="wf-results"></div>';
    }
    function tags(t) {
      var b = blockers(t), d = docsOf(t).length, c = t.comments.length, out = '';
      if (t.run) out += '<span class="wf-tag">' + ICO.flows + t.run + '</span>';
      if (b.length && !closed(t)) out += '<span class="wf-tag bad">' + ICO.lock + 'Blocked</span>';
      if (t.approval && !closed(t)) out += '<span class="wf-tag">Needs approval</span>';
      if (d) out += '<span class="wf-tag" aria-label="' + d + ' attachments">' + ICO.clip + d + '</span>';
      if (c) out += '<span class="wf-tag" aria-label="' + c + ' comments">' + ICO.chat + c + '</span>';
      return out;
    }
    function slaCls(t) { var i = dueInfo(t); return i.cls ? ' sla-' + i.cls : ''; }
    function row(t) {
      var di = dueInfo(t);
      return '<button type="button" class="wf-row' + slaCls(t) + (t.id === openId ? ' sel' : '') + (closed(t) ? ' is-done' : '') + '" data-open="' + t.id + '">' +
        '<span class="wf-pbar ' + prioCls(t.prio) + '" aria-hidden="true"></span>' +
        '<span class="wf-r-main"><span class="wf-id">' + t.id + '</span><b>' + esc(t.title) + '</b><span class="wf-tags">' + tags(t) + '</span></span>' +
        '<span class="wf-who">' + assigneeHtml(t, true) + '</span>' +
        '<span class="wf-due ' + di.cls + '">' + di.txt + '</span>' +
        '<span class="wf-r-st"><span class="wf-prio ' + prioCls(t.prio) + '">' + t.prio + '</span><span class="wf-st ' + stCls(t.status) + '">' + t.status + '</span></span></button>';
    }
    function card(t) {
      var di = dueInfo(t);
      return '<button type="button" class="wf-card' + slaCls(t) + (t.id === openId ? ' sel' : '') + (closed(t) ? ' is-done' : '') + '" data-open="' + t.id + '">' +
        '<span class="wf-card-t"><span class="wf-id">' + t.id + '</span><span class="wf-prio ' + prioCls(t.prio) + '">' + t.prio + '</span></span>' +
        '<b>' + esc(t.title) + '</b>' +
        (t.status !== 'Open' && t.status !== 'In progress' && t.status !== 'Done' ? '<span class="wf-st ' + stCls(t.status) + '">' + t.status + '</span>' : '') +
        '<span class="wf-tags">' + tags(t) + '</span>' +
        '<span class="wf-card-f"><span class="wf-who">' + assigneeHtml(t, true) + '</span><span class="wf-due ' + di.cls + '">' + di.txt + '</span></span></button>';
    }
    function renderResults() {
      var box = $('.wf-results', main); if (!box) return;
      var L = filtered(), od = L.filter(overdue).length;
      $('.wf-sum', main).textContent = L.length + ' task' + (L.length === 1 ? '' : 's') + (od ? ' · ' + od + ' overdue' : '') + (F.q ? ' · matching “' + F.q + '”' : '');
      if (!L.length) { box.innerHTML = '<div class="sda-empty">No tasks match these filters. Try “' + SCOPES[role][0][1] + '” or clear the search.</div>'; return; }
      if (F.layout === 'list') { box.innerHTML = '<div class="wf-list">' + L.map(row).join('') + '</div>'; return; }
      var cols = [['open', 'Open'], ['prog', 'In progress'], ['wait', 'Waiting'], ['done', 'Done']];
      box.innerHTML = '<div class="wf-board">' + cols.map(function (c) {
        var items = L.filter(function (t) { return COL[t.status] === c[0]; });
        return '<section class="wf-col c-' + c[0] + '" aria-label="' + c[1] + '"><h4><span>' + c[1] + '</span><i>' + items.length + '</i></h4>' +
          (items.length ? items.map(card).join('') : '<p class="wf-col-empty">Nothing here</p>') + '</section>';
      }).join('') + '</div>';
    }

    /* ---------------- task drawer ---------------- */
    function flowSteps(t) {
      var s = ['Open', 'Accepted', 'In progress'].concat(t.approval ? ['Approval'] : []).concat(['Done']);
      var at = { 'Open': 0, 'Returned': 0, 'Accepted': 1, 'In progress': 2, 'On hold': 2, 'Awaiting approval': 3, 'Done': s.length - 1, 'Cancelled': -1 }[t.status];
      return '<ol class="wf-flow" aria-label="Progress">' + s.map(function (x, i) { return '<li class="' + (i < at || t.status === 'Done' ? 'done' : i === at ? 'cur' : '') + '">' + x + '</li>'; }).join('') + '</ol>';
    }
    function banner(t) {
      var b = blockers(t), h = '';
      if (b.length && !closed(t)) h += '<div class="wf-ban bad">' + ICO.lock + '<span>Blocked until ' + b.map(function (id) { return '<button type="button" class="wf-link" data-open="' + id + '">' + id + '</button>'; }).join(', ') + ' ' + (b.length > 1 ? 'are' : 'is') + ' done. You can claim it now and start when it unblocks.</span></div>';
      if (t.status === 'Returned') h += '<div class="wf-ban bad"><span><b>Returned to ' + esc(t.by) + '</b> by ' + esc(t.returnedBy || '') + ': “' + esc(t.reason) + '”. Reassign it below or cancel it.</span></div>';
      if (t.status === 'On hold') h += '<div class="wf-ban warn"><span><b>On hold:</b> ' + esc(t.reason) + '</span></div>';
      if (t.status === 'Awaiting approval') h += '<div class="wf-ban appr"><span><b>Waiting for approval</b> by ' + esc(t.approver) + (t.approver === me() ? ' (you)' : '') + '.</span></div>';
      if (t.sentBack && t.status === 'In progress') h += '<div class="wf-ban warn"><span><b>Sent back by ' + esc(t.approver) + ':</b> ' + esc(t.sentBack) + '</span></div>';
      return h;
    }
    function actionsHtml(t) {
      var A = [
        ['claim', 'Claim for me', 1], ['accept', 'Accept', 1], ['start', 'Start work', 1], ['resume', 'Resume', 1], ['finish', t.approval ? 'Finish and send for approval' : 'Finish', 1],
        ['approve', 'Approve', 1], ['sendback', 'Send back', 0], ['hold', 'Put on hold', 0], ['reject', 'Reject', 0], ['cancel', 'Cancel task', 0]
      ].filter(function (a) { return can(a[0], t); });
      var blocked = blockers(t).length > 0;
      if (who(t) === me() && !closed(t) && t.status !== 'Awaiting approval') A.push(['attach', 'Attach document', 0]);
      if (!A.length) {
        var why = closed(t) ? 'This task is ' + t.status.toLowerCase() + '.' : t.status === 'Awaiting approval' ? 'Waiting for ' + t.approver + ' to approve.' :
          who(t) && who(t) !== me() ? 'Assigned to ' + who(t) + '. Only they can change the status.' : t.a.type === 'group' && !t.owner ? 'Any member of ' + t.a.to + ' can claim this task.' : 'No actions for you on this task.';
        return t.status === 'Awaiting approval' ? '' : '<p class="note wf-why">' + esc(why) + '</p>';
      }
      return '<div class="wf-actions">' + A.map(function (a) {
        var dis = (a[0] === 'start' || a[0] === 'resume') && blocked;
        return '<button type="button" class="btn btn-sm ' + (a[2] ? 'btn-ink' : 'btn-ghost') + '" data-ta="' + a[0] + '"' + (dis ? ' disabled aria-disabled="true" title="Blocked by an earlier step"' : '') + '>' + a[1] + '</button>';
      }).join('') + '</div>';
    }
    function assignOpts(sel) {
      return '<optgroup label="Teams (anyone in the team can claim)">' + GN.map(function (g) { var v = 'g:' + g; return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</optgroup>' +
        '<optgroup label="People">' + PEOPLE.map(function (p) { var v = 'p:' + p; return '<option value="' + esc(v) + '"' + (v === sel ? ' selected' : '') + '>' + esc(p) + (groupsOf(p)[0] ? ' · ' + groupsOf(p)[0] : '') + '</option>'; }).join('') + '</optgroup>';
    }
    function mentionHtml(s) {
      var h = esc(s);
      PEOPLE.concat(GN).forEach(function (p) { h = h.split('@' + esc(p)).join('<span class="wf-men">@' + esc(p) + '</span>'); });
      return h;
    }
    function renderDrawer() {
      var t = openId && task(openId);
      if (!t || !visible(t)) { drawer.hidden = true; scrim.hidden = true; openId = null; return; }
      var di = dueInfo(t), docs = docsOf(t), sla = SLA[t.prio];
      var run = t.run && RUNS.filter(function (r) { return r.id === t.run; })[0];
      var tabs = [['comments', 'Comments', t.comments.length], ['files', 'Attachments', docs.length], ['log', 'Activity', t.log.length]];
      var body = '';
      if (dTab === 'comments') {
        body = (t.comments.length ? '<ul class="wf-comments">' + t.comments.map(function (c) {
          return '<li>' + av(c.by) + '<div><p><b>' + esc(c.by) + '</b><time>' + stamp(c.at) + '</time></p><p>' + mentionHtml(c.text) + '</p></div></li>';
        }).join('') + '</ul>' : '<p class="note">No comments yet. Use @ to mention a colleague.</p>') +
          (can('comment', t) ? '<div class="wf-cbox"><label for="wf-c-' + t.id + '">Add a comment</label><textarea id="wf-c-' + t.id + '" data-ctext rows="3" placeholder="Write a comment. Type @ to mention someone."></textarea><div class="wf-mention" data-msug hidden></div>' +
            '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ta="comment">Post comment</button><span class="note">Mentions notify people in TaskFlow (e-mail simulated, not sent).</span></div></div>' : '');
      } else if (dTab === 'files') {
        body = (docs.length ? '<ul class="wf-files">' + docs.map(function (d) {
          return '<li><span class="sda-doc-ic t-' + esc(d.type) + '">' + (/jpg|png/.test(d.type) ? IC.img : /xls/.test(d.type) ? IC.sheet : IC.doc) + '</span><span class="wf-f-n"><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + ' · v' + d.version + ' · ' + esc(d.status) + '</small></span><button type="button" class="btn btn-ghost btn-sm" data-preview="' + d.id + '">Preview</button></li>';
        }).join('') + '</ul>' : '<p class="note">No documents linked yet.</p>') +
          (can('attach', t) ? '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ta="attach">' + ICO.clip + 'Attach document</button></div>' : '');
      } else {
        body = '<ol class="wf-log">' + t.log.slice().reverse().map(function (l) { return '<li><time>' + stamp(l.at) + '</time><span><b>' + esc(l.by) + '</b> ' + esc(l.text) + '</span></li>'; }).join('') + '</ol><p class="note">Audit trail: every change is recorded with user and time and cannot be edited.</p>';
      }
      var ed = can('edit', t);
      drawer.innerHTML = '<div class="wf-d-h"><span class="wf-id">' + t.id + (run ? ' · ' + run.id : '') + '</span><button type="button" class="sda-x wf-d-x" data-close-d aria-label="Close task details">' + IC.close + '</button></div>' +
        '<div class="wf-d-b"><h3>' + esc(t.title) + '</h3><div class="wf-d-pills"><span class="wf-st ' + stCls(t.status) + '">' + t.status + '</span><span class="wf-prio ' + prioCls(t.prio) + '">' + t.prio + '</span>' + (overdue(t) ? '<span class="pill p-bad">SLA breached</span>' : '') + '</div>' +
        flowSteps(t) + banner(t) + actionsHtml(t) +
        '<dl class="wf-meta"><div><dt>Assigned to</dt><dd class="wf-who">' + assigneeHtml(t) + '</dd></div><div><dt>Created by</dt><dd>' + esc(t.by) + '<small>' + stamp(t.created) + '</small></dd></div>' +
        '<div><dt>Due</dt><dd class="wf-due ' + di.cls + '">' + fmtDue(t.due) + '<small>' + (closed(t) ? t.status : di.txt) + ' · SLA ' + sla + (sla === 1 ? ' day' : ' days') + '</small></dd></div>' +
        '<div><dt>Approval</dt><dd>' + (t.approval ? 'Required · ' + esc(t.approver) : 'Not required') + '</dd></div>' +
        (run ? '<div class="wide"><dt>Workflow</dt><dd>' + esc(run.title) + '<small>Step ' + (run.tasks.indexOf(t.id) + 1) + ' of ' + run.tasks.length + (t.deps.length ? ' · after ' + t.deps.join(', ') : '') + '</small></dd></div>' : '') + '</dl>' +
        (t.desc ? '<p class="wf-desc">' + esc(t.desc) + '</p>' : '') +
        (ed ? '<details class="wf-edit"' + (t.status === 'Returned' ? ' open' : '') + '><summary>' + (role === 'emp' ? 'Edit your request' : 'Assign, reprioritise, change due date') + '</summary><div class="wf-edit-b">' +
          '<label>Assign to<select data-e="a">' + assignOpts(t.a.type.charAt(0) + ':' + t.a.to) + '</select></label>' +
          '<div class="wf-2"><label>Priority<select data-e="prio">' + PRIO.map(function (p) { return '<option' + (p === t.prio ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label><label>Due date<input type="date" data-e="due" value="' + t.due + '"></label></div>' +
          '<label class="chk"><input type="checkbox" data-e="appr"' + (t.approval ? ' checked' : '') + '> Needs approval by the team lead when finished</label>' +
          '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ta="save">Save changes</button></div></div></details>' : '') +
        '<div class="wf-tabs" role="tablist" aria-label="Task sections">' + tabs.map(function (x) { return '<button type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (dTab === x[0]) + '">' + x[1] + ' <i>' + x[2] + '</i></button>'; }).join('') + '</div>' +
        '<div class="wf-tabp" role="tabpanel">' + body + '</div></div>';
      drawer.hidden = false; scrim.hidden = false;
    }
    function openTask(id, tab) {
      var t = task(id); if (!t) return;
      if (!visible(t)) { say('You do not have access to ' + id + ' in this role.', 'warn'); return; }
      if (!openId) lastFocus = document.activeElement;
      openId = id; dTab = tab || 'comments';
      if (view === 'tasks') renderResults();
      renderDrawer();
      var x = $('.wf-d-x', drawer); if (x) x.focus({ preventScroll: true });
      drawer.scrollTop = 0;
    }
    function closeDrawer() {
      openId = null; drawer.hidden = true; scrim.hidden = true;
      if (view === 'tasks') renderResults();
      if (lastFocus && root.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }

    /* ---------------- actions ---------------- */
    function askReason(title, label, btn, quick, cb) {
      var id = 'wf-rs-' + (++seq);
      var m = SDA.modal(root, { title: title, html: '<div class="wf-form"><label for="' + id + '">' + esc(label) + '<textarea id="' + id + '" rows="3"></textarea></label>' +
        '<div class="wf-quick" role="group" aria-label="Quick reasons">' + quick.map(function (q) { return '<button type="button" class="wf-chip" data-quick>' + esc(q) + '</button>'; }).join('') + '</div>' +
        '<p class="note err" role="status"></p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ok>' + esc(btn) + '</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      m.el.classList.add('wf-modal');
      var ta = $('textarea', m.body), err = $('.err', m.body);
      m.body.addEventListener('click', function (e) {
        var q = e.target.closest('[data-quick]'); if (q) { ta.value = q.textContent; ta.focus(); return; }
        if (e.target.closest('[data-ok]')) {
          var v = ta.value.trim();
          if (!v) { err.textContent = 'Please add a short reason.'; ta.setAttribute('aria-invalid', 'true'); ta.focus(); return; }
          m.close(); cb(v); refocusDrawer();
        }
      });
    }
    function refocusDrawer() {
      ctx.later(0, function () { if (drawer.hidden) return; var f = $('[data-ta]', drawer) || $('.wf-d-x', drawer); if (f) f.focus({ preventScroll: true }); });
    }
    function unblockAfter(t) {
      TASKS.forEach(function (x) {
        if (x.deps.indexOf(t.id) > -1 && !closed(x) && !blockers(x).length) {
          log(x, 'Unblocked: ' + t.id + ' is done. Ready to start.', 'TaskFlow');
          note(who(x) || x.a.to, x.id + ' is ready to start: ' + t.id + ' is done', x.id);
        }
      });
      if (t.run) {
        var r = RUNS.filter(function (z) { return z.id === t.run; })[0];
        if (r && r.tasks.every(function (id) { return task(id).status === 'Done'; })) { r.done = new Date(); note(r.by, r.id + ' completed: ' + r.title, null); say(r.id + ' workflow completed'); }
      }
    }
    function complete(t, text) { t.status = 'Done'; t.reason = ''; t.doneAt = new Date(); log(t, text); unblockAfter(t); }
    function doAction(a, t) {
      var m = me(), who0 = who(t);
      if (a === 'claim') { t.owner = m; t.status = 'Accepted'; log(t, 'Claimed the task for ' + t.a.to); note(t.by, m + ' claimed ' + t.id + ': ' + t.title, t.id); say(t.id + ' is now yours'); gstep(t, 'accept'); }
      else if (a === 'accept') { t.status = 'Accepted'; log(t, 'Accepted the task'); note(t.by, m + ' accepted ' + t.id, t.id); say('Accepted ' + t.id); gstep(t, 'accept'); }
      else if (a === 'start') { t.status = 'In progress'; log(t, 'Started work'); say('Started ' + t.id); }
      else if (a === 'resume') { t.status = 'In progress'; t.reason = ''; log(t, 'Resumed work'); say('Resumed ' + t.id); }
      else if (a === 'finish') {
        if (t.approval) { t.status = 'Awaiting approval'; t.approver = approverFor(t); t.sentBack = ''; log(t, 'Finished · sent to ' + t.approver + ' for approval'); note(t.approver, m + ' finished ' + t.id + ' and asks for your approval', t.id); say('Sent to ' + t.approver + ' for approval (notification simulated)'); }
        else { complete(t, 'Finished the task'); note(t.by, m + ' finished ' + t.id + ': ' + t.title, t.id); say(t.id + ' done'); }
        gstep(t, 'finish');
      }
      else if (a === 'approve') { complete(t, 'Approved the result'); note(who0, m + ' approved ' + t.id + ': ' + t.title, t.id); say('Approved ' + t.id); gstep(t, 'approve'); }
      else if (a === 'cancel') { t.status = 'Cancelled'; log(t, 'Cancelled the task'); say(t.id + ' cancelled'); }
      else if (a === 'reject') {
        askReason('Reject ' + t.id, 'Why are you rejecting it? It goes back to ' + t.by + '.', 'Reject and return', ['Not our team’s area', 'Missing information to start', 'Duplicate of another task'], function (r) {
          t.status = 'Returned'; t.reason = r; t.returnedBy = m; if (t.a.type === 'group') t.owner = null;
          log(t, 'Rejected and returned to ' + t.by + ': ' + r); note(t.by, m + ' rejected ' + t.id + ' and returned it to you: “' + r + '”', t.id);
          say(t.id + ' returned to ' + t.by); refresh();
        }); return;
      }
      else if (a === 'hold') {
        askReason('Put ' + t.id + ' on hold', 'What are you waiting for?', 'Put on hold', ['Waiting for information from the requester', 'Waiting for a supplier', 'Waiting for another team'], function (r) {
          t.status = 'On hold'; t.reason = r; log(t, 'Put on hold: ' + r); note(t.by, t.id + ' is on hold: ' + r, t.id); say(t.id + ' moved to Waiting'); refresh();
        }); return;
      }
      else if (a === 'sendback') {
        askReason('Send ' + t.id + ' back', 'What needs to change before you approve?', 'Send back', ['Please attach the signed document', 'Numbers do not match the report', 'Add a short summary of the result'], function (r) {
          t.status = 'In progress'; t.sentBack = r; log(t, 'Sent back for rework: ' + r); note(who0, m + ' sent ' + t.id + ' back: “' + r + '”', t.id); say(t.id + ' sent back to ' + who0); refresh();
        }); return;
      }
      else if (a === 'save') { saveEdit(t); }
      else if (a === 'comment') { postComment(t); return; }
      else if (a === 'attach') { attachModal(t); return; }
      refresh();
    }
    function parseA(v) { var i = v.indexOf(':'); return { type: v.slice(0, i) === 'g' ? 'group' : 'person', to: v.slice(i + 1) }; }
    function saveEdit(t) {
      var a = parseA($('[data-e="a"]', drawer).value), pr = $('[data-e="prio"]', drawer).value, due = $('[data-e="due"]', drawer).value, ap = $('[data-e="appr"]', drawer).checked, ch = 0;
      if (a.to !== t.a.to || a.type !== t.a.type || t.status === 'Returned') {
        log(t, 'Reassigned from ' + t.a.to + (t.owner ? ' (' + t.owner + ')' : '') + ' to ' + a.to);
        t.a = a; t.owner = null; t.status = 'Open'; t.reason = ''; t.approver = approverFor(t);
        note(a.to, me() + ' assigned ' + t.id + ' to ' + (a.type === 'group' ? a.to : 'you') + ': ' + t.title, t.id); ch++;
      }
      if (pr !== t.prio) { log(t, 'Changed priority from ' + t.prio + ' to ' + pr); note(who(t) || t.a.to, me() + ' changed the priority of ' + t.id + ' to ' + pr, t.id); t.prio = pr; ch++; }
      if (due && due !== t.due) { log(t, 'Changed due date from ' + fmtDue(t.due) + ' to ' + fmtDue(due)); t.due = due; ch++; }
      if (ap !== t.approval) { t.approval = ap; t.approver = approverFor(t); log(t, ap ? 'Approval step added (' + t.approver + ')' : 'Approval step removed'); ch++; }
      say(ch ? 'Saved ' + t.id + ' · people involved were notified (simulated)' : 'Nothing changed');
    }
    function postComment(t) {
      var ta = $('[data-ctext]', drawer), v = ta.value.trim();
      if (!v) { ta.setAttribute('aria-invalid', 'true'); ta.focus(); return; }
      var m = me();
      t.comments.push({ at: new Date(), by: m, text: v }); log(t, 'Commented');
      var men = PEOPLE.concat(GN).filter(function (p) { return v.indexOf('@' + p) > -1 && p !== m; });
      men.forEach(function (p) { if (t.mentions.indexOf(p) < 0) t.mentions.push(p); note(p, m + ' mentioned you in ' + t.id + ': “' + v.slice(0, 80) + '”', t.id); });
      [t.by, who(t)].forEach(function (p) { if (p && p !== m && men.indexOf(p) < 0) note(p, m + ' commented on ' + t.id, t.id); });
      say(men.length ? 'Comment posted · ' + men.join(', ') + ' notified (simulated)' : 'Comment posted');
      var person = men.filter(function (p) { return PEOPLE.indexOf(p) > -1 && !ROLES.some(function (r) { return r.person === p; }); })[0];
      if (person) ctx.later(3500, function () {
        t.comments.push({ at: new Date(), by: person, text: '@' + m + ' thanks, I will take a look today.' }); log(t, 'Commented', person);
        note(m, person + ' replied in ' + t.id, t.id); say(person + ' replied in ' + t.id + ' (simulated)'); refresh();
      });
      refresh();
    }
    function linkDoc(t, d) {
      var L = (d.linked || '').split(/,\s*/).filter(Boolean);
      if (L.indexOf(t.id) < 0) L.push(t.id);
      d.linked = L.join(', ');
      d.versions.push({ v: d.version, date: SDA.fmtDate(new Date()), by: me(), note: 'Linked to ' + t.id });
      log(t, 'Attached ' + d.name); dms.render(); gstep(t, 'attach');
      say('Attached ' + esc(d.name) + ' to ' + t.id);
    }
    function attachModal(t) {
      var q = '';
      var m = SDA.modal(root, { title: 'Attach a document to ' + t.id, wide: true, html: '<div class="wf-att"><div><h4>From the document library</h4><label class="sda-search wf-att-s">' + IC.search + '<input type="search" data-aq placeholder="Search library" aria-label="Search library"></label><div class="wf-att-l"></div></div>' +
        '<div><h4>Or add a new file</h4><label class="drop-zone wf-drop"><input type="file" data-af><b>Upload from this device</b><span>Filed in “Task attachments” and linked to ' + t.id + '. The file stays in your browser.</span></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-sample>Use a sample file instead</button><p class="note">Every attachment is versioned in the DMS and opens from the task.</p></div></div>' });
      m.el.classList.add('wf-modal');
      function list() {
        var L = dms.docs().filter(function (d) { return docAllowed(d) && (d.linked || '').split(/,\s*/).indexOf(t.id) < 0 && (d.name + ' ' + d.folder).toLowerCase().indexOf(q.toLowerCase()) > -1; });
        $('.wf-att-l', m.body).innerHTML = L.length ? L.map(function (d) {
          return '<button type="button" class="sda-doc" data-pick="' + d.id + '"><span class="sda-doc-ic t-' + esc(d.type) + '">' + (/jpg|png/.test(d.type) ? IC.img : /xls/.test(d.type) ? IC.sheet : IC.doc) + '</span><span class="sda-doc-n"><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + '</small></span><span class="wf-att-add">Attach</span></button>';
        }).join('') : '<div class="sda-empty">No documents match.</div>';
      }
      list();
      m.body.addEventListener('input', function (e) { if (e.target.matches('[data-aq]')) { q = e.target.value; list(); } });
      m.body.addEventListener('click', function (e) {
        var p = e.target.closest('[data-pick]');
        if (p) { var d = dms.docs().filter(function (x) { return x.id === p.dataset.pick; })[0]; m.close(); linkDoc(t, d); dTab = 'files'; refresh(); refocusDrawer(); return; }
        if (e.target.closest('[data-sample]')) {
          var sd = dms.add({ name: 'Working file – ' + t.id + '.xlsx', type: 'xlsx', folder: 'Task attachments', owner: me(), status: 'In review', tags: ['sample'], note: 'Uploaded (sample file)',
            title: 'Working file for ' + t.id, company: 'Northwind Components Inc.', meta: [['Task', t.id], ['Prepared by', me()]],
            sections: [{ h: t.title, rows: [['Item', 'Value', 'Comment'], ['Checked documents', '12', 'All matched'], ['Open questions', '0', ''], ['Result', 'Complete', 'Ready for review']] }] });
          m.close(); linkDoc(t, sd); dTab = 'files'; refresh(); refocusDrawer();
        }
      });
      m.body.addEventListener('change', function (e) {
        if (!e.target.matches('[data-af]') || !e.target.files.length) return;
        var f = e.target.files[0], isImg = /^image\//.test(f.type), ext = (f.name.split('.').pop() || 'pdf').toLowerCase();
        var d = dms.add({ name: f.name, type: isImg ? 'jpg' : ext, folder: 'Task attachments', owner: me(), status: 'In review', tags: ['uploaded'], note: 'Uploaded from this device (stays in your browser)', img: isImg ? URL.createObjectURL(f) : undefined });
        m.close(); linkDoc(t, d); dTab = 'files'; refresh(); refocusDrawer();
      });
    }

    /* ---------------- AI (simulated) suggestion ---------------- */
    function aiSuggest(text) {
      var s = text.toLowerCase(), g = null, kw = '';
      [['Finance team', /invoice|payment|expense|budget|payroll|cost cent|forecast|reimburs|accrual|purchase order|vat|tax|reconcil/],
        ['IT support', /laptop|password|access|account|vpn|printer|software|licen|e-?mail|wi-?fi|computer|monitor|login/],
        ['Quality', /defect|audit|inspection|complaint|calibrat|non-?conform|8d|deviation|capa|measurement/],
        ['Facilities', /desk|room|leak|light|heating|air ?con|badge|parking|cleaning|door|furniture|repair|broken/],
        ['HR', /hire|onboard|contract|vacation|leave|training|candidate|offboard|sick|recruit/]].forEach(function (r) {
        if (!g) { var mm = s.match(r[1]); if (mm) { g = r[0]; kw = mm[0]; } }
      });
      var pr = 'Normal', pk = '';
      var u = s.match(/urgent|asap|immediately|today|outage|is down|blocked|critical|safety|not working/), h = s.match(/important|deadline|customer|this week|overdue|audit|tomorrow|management/), l = s.match(/no rush|low priority|nice to have|when you have time|someday/);
      if (u) { pr = 'Urgent'; pk = u[0]; } else if (h) { pr = 'High'; pk = h[0]; } else if (l) { pr = 'Low'; pk = l[0]; }
      var amt = s.match(/\$\s?([\d,]+(?:\.\d+)?)/), amount = amt ? parseFloat(amt[1].replace(/,/g, '')) : 0;
      var person = g ? GROUPS[g].members.slice().sort(function (a, b) { return load(a) - load(b); })[0] : null;
      return { g: g, kw: kw, prio: pr, pk: pk, amount: amount, approval: amount > 5000, person: person };
    }

    /* ---------------- create task ---------------- */
    function newTask() {
      var defA = role === 'emp' ? 'g:IT support' : 'g:Finance team', pr = 'Normal', dueTouched = false;
      var m = SDA.modal(root, { title: 'New task', wide: true, html: '<div class="wf-form">' +
        '<label for="wf-n-t">Title<input id="wf-n-t" data-n="title" placeholder="e.g. Check supplier invoice INV-2310 before Friday"></label>' +
        '<label for="wf-n-d">Description<textarea id="wf-n-d" data-n="desc" rows="3" placeholder="What needs to be done? Include amounts, deadlines and links."></textarea></label>' +
        '<div class="btn-row" style="margin-top:0"><button type="button" class="btn btn-ghost btn-sm wf-ai-btn" data-ai>' + IC.spark + 'AI (simulated): suggest assignee and priority</button></div><div class="wf-ai-out" aria-live="polite"></div>' +
        '<div class="wf-2"><label for="wf-n-a">Assign to<select id="wf-n-a" data-n="a">' + assignOpts(defA) + '</select></label>' +
        '<label for="wf-n-p">Priority<select id="wf-n-p" data-n="prio">' + PRIO.map(function (p) { return '<option' + (p === pr ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="wf-2"><label for="wf-n-due">Due date<input id="wf-n-due" type="date" data-n="due" value="' + iso(SLA[pr]) + '"></label>' +
        '<label class="chk wf-appr"><input type="checkbox" data-n="appr"' + (role !== 'emp' ? ' checked' : '') + '> <span>Needs approval<small>The team lead approves or sends it back when finished</small></span></label></div>' +
        '<p class="note err" role="status"></p>' +
        '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-create>Create task</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      m.el.classList.add('wf-modal');
      var B = m.body, f = function (k) { return $('[data-n="' + k + '"]', B); };
      if (role === 'lead') f('title').value = 'Review Q4 supplier invoices before payment run';
      if (role === 'lead') f('desc').value = 'Check all open supplier invoices above $1,000 against purchase orders and goods receipts before Friday’s payment run. Deadline is important for the management meeting.';
      setTimeout(function () { f('title').focus(); }, 40);
      f('due').addEventListener('change', function () { dueTouched = true; });
      f('prio').addEventListener('change', function () { if (!dueTouched) f('due').value = iso(SLA[f('prio').value]); });
      B.addEventListener('click', function (e) {
        if (e.target.closest('[data-ai]')) {
          var txt = f('title').value + ' ' + f('desc').value, out = $('.wf-ai-out', B);
          if (!txt.trim()) { out.innerHTML = '<p class="note err">Add a title or description first, then ask the AI.</p>'; return; }
          var s = aiSuggest(txt);
          out.innerHTML = '<div class="ai-box"><div class="ai-h">AI (simulated) suggestion</div><div class="wf-ai-t"></div></div>';
          var html = '<ul><li>' + (s.g ? 'Assign to <b>' + esc(s.g) + '</b>: the text mentions “' + esc(s.kw) + '”. Lightest workload there: <b>' + esc(s.person) + '</b> (' + load(s.person) + ' open).' : 'No clear team found. Send it to <b>Emma Davis</b> (office admin) for triage.') + '</li>' +
            '<li>Priority <b>' + s.prio + '</b>' + (s.pk ? ': mentions “' + esc(s.pk) + '”' : ': no deadline or urgency words found') + '. Due <b>' + fmtDue(iso(SLA[s.prio])) + '</b> (SLA ' + SLA[s.prio] + ' days).</li>' +
            (s.amount ? '<li>Amount mentioned: ' + SDA.money(s.amount) + (s.approval ? '. That is above $5,000, so <b>approval is required</b>. For purchases use the “Purchase request > $5,000” workflow.' : ' (below $5,000, no extra approval needed).') + '</li>' : '') + '</ul>' +
            '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-apply>Apply suggestion</button></div>';
          SDA.typeInto($('.wf-ai-t', out), html);
          out._s = s; return;
        }
        if (e.target.closest('[data-apply]')) {
          var s2 = $('.wf-ai-out', B)._s; if (!s2) return;
          f('a').value = s2.g ? 'g:' + s2.g : 'p:Emma Davis'; f('prio').value = s2.prio; if (!dueTouched) f('due').value = iso(SLA[s2.prio]);
          if (s2.approval) f('appr').checked = true;
          say('AI suggestion applied. You can still change everything.'); return;
        }
        if (e.target.closest('[data-create]')) {
          var title = f('title').value.trim(), err = $('.err', B);
          if (!title) { err.textContent = 'Please enter a title.'; f('title').setAttribute('aria-invalid', 'true'); f('title').focus(); return; }
          var a = parseA(f('a').value);
          var t = mk({ n: nT++, title: title, desc: f('desc').value.trim(), a: a, prio: f('prio').value, due: f('due').value || iso(SLA[f('prio').value]), approval: f('appr').checked, by: me(), created: new Date() });
          if (role === 'lead' && a.type === 'group' && a.to === 'Finance team') { t.fresh = true; guide.done('create'); }
          note(a.to, me() + ' assigned ' + t.id + ' to ' + (a.type === 'group' ? a.to : 'you') + ': ' + t.title, t.id);
          m.close();
          say('Created ' + t.id + ' for ' + a.to + ' · ' + (a.type === 'group' ? 'all members' : a.to) + ' notified (e-mail simulated, not sent)');
          if (view !== 'tasks') view = 'tasks';
          F.scope = 'all'; F.od = false; F.prio = 'All'; F.q = '';
          render(); openTask(t.id);
        }
      });
    }

    /* ---------------- workflows ---------------- */
    function fill(s, v) { return s.replace(/\{(\w+)\}/g, function (_, k) { return v[k] || '…'; }); }
    function phHtml(title, tpl) {
      return esc(title).replace(/\{(\w+)\}/g, function (_, k) { var fd = tpl.fields.filter(function (f) { return f.k === k; })[0]; return '<span class="wf-ph">' + esc(fd ? fd.label.replace(/^What is being bought\?$/, 'Item') : k) + '</span>'; });
    }
    function stepWho(s) { var a = parseA(s.a); return a.to; }
    function startFlow(tplId) {
      var act = TPL.filter(function (x) { return x.active; });
      var tpl = TPL.filter(function (x) { return x.id === tplId; })[0] || act[0];
      var m = SDA.modal(root, { title: 'Start a workflow', wide: true, html: '<div class="wf-form"><label>Template<select data-tpl>' + act.map(function (x) { return '<option value="' + x.id + '"' + (x.id === tpl.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></label><div class="wf-sf"></div></div>' });
      m.el.classList.add('wf-modal');
      var B = m.body;
      function paint() {
        var vals = {};
        $$('[data-fk]', B).forEach(function (i) { vals[i.dataset.fk] = i.value; });
        var fields = tpl.fields.map(function (fd) {
          var id = 'wf-sf-' + fd.k, v = vals[fd.k] != null ? vals[fd.k] : (fd.type === 'date' ? iso(10) : '');
          return '<label for="' + id + '">' + esc(fd.label) + '<input id="' + id + '" data-fk="' + fd.k + '" type="' + (fd.type || 'text') + '" placeholder="' + esc(fd.ph || '') + '" value="' + esc(v) + '"' + (fd.type === 'number' ? ' min="0" step="100"' : '') + '></label>';
        }).join('');
        $('.wf-sf', B).innerHTML = '<p class="note">' + esc(tpl.desc) + '</p><div class="wf-2">' + fields + '</div><h4 class="wf-sub">Tasks that will be created</h4><ol class="wf-tsteps"></ol><p class="note err" role="status"></p>' +
          '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-go>' + ICO.play + 'Start workflow</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div>';
        preview();
      }
      function vals() { var v = {}; $$('[data-fk]', B).forEach(function (i) { v[i.dataset.fk] = i.value.trim(); }); if (v.amount) v.amountN = parseFloat(v.amount); if (v.amount) v.amount = SDA.money(parseFloat(v.amount) || 0); if (v.start) v.startD = v.start; return v; }
      function preview() {
        var v = vals();
        $('.wf-tsteps', B).innerHTML = tpl.steps.map(function (s, i) {
          var a = parseA(s.a);
          return '<li><span class="wf-tn">' + (i + 1) + '</span><span><b>' + esc(s.title).replace(/\{(\w+)\}/g, function (_, k) { return v[k] ? '<span class="wf-ph">' + esc(v[k]) + '</span>' : phHtml('{' + k + '}', tpl); }) + '</b><small>' + av(a.to, a.type) + esc(a.to) + ' · due ' + fmtDue(iso(s.days)) + (s.deps.length ? ' · after step ' + s.deps.map(function (d) { return d + 1; }).join(', ') : ' · starts right away') + (s.approval ? ' · needs approval' : '') + '</small></span></li>';
        }).join('');
      }
      paint();
      B.addEventListener('change', function (e) { if (e.target.matches('[data-tpl]')) { tpl = TPL.filter(function (x) { return x.id === e.target.value; })[0]; paint(); } });
      B.addEventListener('input', function (e) { if (e.target.matches('[data-fk]')) preview(); });
      B.addEventListener('click', function (e) {
        if (!e.target.closest('[data-go]')) return;
        var v = vals(), err = $('.err', B), miss = tpl.fields.filter(function (fd) { return !v[fd.k]; })[0];
        if (miss) { err.textContent = 'Please fill in “' + miss.label + '”.'; var mi = $('[data-fk="' + miss.k + '"]', B); mi.setAttribute('aria-invalid', 'true'); mi.focus(); return; }
        if (tpl.id === 'purchase' && !(v.amountN > 5000)) { err.textContent = 'This workflow is for purchases above $5,000. For smaller amounts create a normal task for the Finance team.'; $('[data-fk="amount"]', B).focus(); return; }
        var rid = 'WF-' + (nR++), ids = tpl.steps.map(function () { return 'TSK-' + (nT++); });
        var title = tpl.name + ': ' + (v.name || v.item || v.month || '');
        var run = { id: rid, tpl: tpl.id, title: title.replace(/\s*>\s*\$5,000/, ''), by: me(), started: new Date(), tasks: ids };
        RUNS.unshift(run);
        tpl.steps.forEach(function (s, i) {
          var a = parseA(s.a);
          mk({ n: +ids[i].slice(4), run: rid, title: fill(s.title, v), desc: 'Step ' + (i + 1) + ' of “' + tpl.name + '” (' + rid + ').', a: a, prio: tpl.id === 'purchase' ? 'High' : 'Normal', due: iso(s.days), deps: s.deps.map(function (d) { return ids[d]; }), approval: s.approval, by: me(), created: new Date() });
          if (!s.deps.length) note(a.to, 'New ' + rid + ' task for ' + a.to + ': ' + fill(s.title, v), ids[i]);
        });
        m.close();
        say(rid + ' started: ' + ids.length + ' linked tasks across ' + tpl.steps.map(stepWho).filter(function (x, i, A) { return A.indexOf(x) === i; }).length + ' teams and people');
        view = 'flows'; render();
      });
    }
    function runCard(r) {
      var T = r.tasks.map(task), done = T.filter(function (t) { return t.status === 'Done'; }).length, pct = Math.round(done / T.length * 100);
      return '<article class="panel wf-run"><div class="wf-run-h"><div><span class="wf-id">' + r.id + ' · started by ' + esc(r.by) + ' · ' + stamp(r.started) + '</span><h4>' + esc(r.title) + '</h4></div><span class="pill ' + (done === T.length ? 'p-ok' : 'p-info') + '">' + done + ' of ' + T.length + ' done</span></div>' +
        '<div class="wf-prog" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Workflow progress"><i style="width:' + pct + '%"></i></div>' +
        '<ol class="wf-rsteps">' + T.map(function (t) {
          var b = blockers(t).length && !closed(t);
          return '<li><button type="button" data-open="' + t.id + '"' + (visible(t) ? '' : ' disabled aria-disabled="true"') + '><span class="wf-st ' + (b ? 's-off' : stCls(t.status)) + '">' + (b ? 'Blocked' : t.status) + '</span><b>' + esc(t.title) + '</b><small>' + t.id + ' · ' + esc(t.a.to) + (t.owner ? ' (' + esc(t.owner) + ')' : '') + '</small></button></li>';
        }).join('') + '</ol></article>';
    }
    function vFlows() {
      var admin = role === 'admin';
      var tpls = TPL.map(function (x, ti) {
        var steps = x.steps.map(function (s, i) {
          var a = parseA(s.a);
          if (!admin) return '<li><span class="wf-tn">' + (i + 1) + '</span><span><b>' + phHtml(s.title, x) + '</b><small>' + esc(a.to) + (s.deps.length ? ' · after ' + s.deps.map(function (d) { return d + 1; }).join(', ') : '') + (s.approval ? ' · approval' : '') + '</small></span></li>';
          return '<li class="wf-ed-step"><span class="wf-tn">' + (i + 1) + '</span><div class="wf-ed-f"><label class="wf-ed-title">Step title<input data-tp="' + ti + '" data-si="' + i + '" data-k="title" value="' + esc(s.title) + '"></label>' +
            '<label>Assign to<select data-tp="' + ti + '" data-si="' + i + '" data-k="a">' + assignOpts(s.a) + '</select></label><label>Due after (days)<input type="number" min="0" max="60" data-tp="' + ti + '" data-si="' + i + '" data-k="days" value="' + s.days + '"></label>' +
            '<div class="wf-ed-row"><span class="note">' + (s.deps.length ? 'Starts after step ' + s.deps.map(function (d) { return d + 1; }).join(', ') : 'Starts right away') + '</span><label class="chk"><input type="checkbox" data-tp="' + ti + '" data-si="' + i + '" data-k="approval"' + (s.approval ? ' checked' : '') + '> Needs approval</label>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-delstep="' + ti + ':' + i + '"' + (x.steps.length < 2 ? ' disabled' : '') + ' aria-label="Remove step ' + (i + 1) + '">Remove</button></div></div></li>';
        }).join('');
        return '<article class="panel wf-tpl' + (x.active ? '' : ' off') + '"><div class="wf-run-h"><div><span class="wf-id">Template · v' + x.v + ' · ' + x.steps.length + ' steps</span><h4>' + esc(x.name) + '</h4><p class="note">' + esc(x.desc) + '</p></div>' +
          (admin ? '<label class="chk"><input type="checkbox" data-active="' + ti + '"' + (x.active ? ' checked' : '') + '> Active</label>' : '<button type="button" class="btn btn-ink btn-sm" data-startflow="' + x.id + '"' + (x.active ? '' : ' disabled') + '>' + ICO.play + 'Start</button>') + '</div>' +
          (admin ? '<p class="note wf-ph-note">Placeholders in curly braces, e.g. {' + x.fields[0].k + '}, are filled in when a team lead starts the workflow.</p>' : '') +
          '<ol class="wf-tsteps' + (admin ? ' ed' : '') + '">' + steps + '</ol>' +
          (admin ? '<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-addstep="' + ti + '">' + ICO.plus + 'Add step</button><button type="button" class="btn btn-ink btn-sm" data-savetpl="' + ti + '">Save template</button></div>' : '') + '</article>';
      }).join('');
      return '<div class="wf-head"><div><h3>' + (admin ? 'Workflow templates' : 'Workflows') + '</h3><p class="note">' + (admin ? 'Edit the steps, teams, due dates and approval rules. Team leads start workflows from these templates.' : 'Start a template to create linked tasks across teams. Later steps unblock when earlier ones are done.') + '</p></div>' +
        (admin ? '<button type="button" class="btn btn-ink btn-sm" data-newtpl>' + ICO.plus + 'New template</button>' : '') + '</div>' +
        '<div class="wf-tpls' + (admin ? ' ed' : '') + '">' + tpls + '</div><h3 class="wf-h2">Running workflows</h3><div class="wf-runs">' + (RUNS.map(runCard).join('') || '<div class="sda-empty">No workflows running.</div>') + '</div>';
    }

    /* ---------------- approvals (team lead) ---------------- */
    function vApprovals() {
      var m = me();
      var P = TASKS.filter(function (t) { return t.status === 'Awaiting approval' && t.approver === m; });
      var D = TASKS.filter(function (t) { return t.approver === m && t.status === 'Done' && t.log.some(function (l) { return l.by === m && /Approved/.test(l.text); }); });
      return '<div class="wf-head"><div><h3>Approvals</h3><p class="note">Finished tasks that need your sign-off. Approve, or send them back with a note.</p></div></div>' +
        (P.length ? '<div class="wf-apv">' + P.map(function (t) {
          var d = docsOf(t), fin = t.log.filter(function (l) { return /Finished/.test(l.text); }).pop();
          return '<article class="panel wf-apv-c' + slaCls(t) + '"><div class="wf-run-h"><div><span class="wf-id">' + t.id + ' · finished by ' + esc(who(t)) + (fin ? ' · ' + stamp(fin.at) : '') + '</span><h4>' + esc(t.title) + '</h4></div><span class="wf-prio ' + prioCls(t.prio) + '">' + t.prio + '</span></div>' +
            '<p class="note">' + esc(t.desc) + '</p><div class="wf-tags">' + tags(t) + '<span class="wf-due ' + dueInfo(t).cls + '">' + dueInfo(t).txt + '</span></div>' +
            (d.length ? '<div class="wf-apv-docs">' + d.map(function (x) { return '<button type="button" class="wf-doc-chip" data-preview="' + x.id + '">' + IC.doc + esc(x.name) + '</button>'; }).join('') + '</div>' : '') +
            '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-qa="approve" data-id="' + t.id + '">Approve</button><button type="button" class="btn btn-ghost btn-sm" data-qa="sendback" data-id="' + t.id + '">Send back</button><button type="button" class="btn btn-ghost btn-sm" data-open="' + t.id + '">Open task</button></div></article>';
        }).join('') + '</div>' : '<div class="sda-empty">Nothing waiting for your approval.</div>') +
        (D.length ? '<h3 class="wf-h2">Recently approved</h3><div class="wf-list">' + D.map(row).join('') + '</div>' : '');
    }

    /* ---------------- notifications ---------------- */
    function vNotes() {
      var L = notesFor(me());
      return '<div class="wf-head"><div><h3>Notifications</h3><p class="note">In-app notifications for ' + esc(me()) + '. E-mail copies are simulated, not sent.</p></div>' +
        (L.some(function (n) { return !n.read; }) ? '<button type="button" class="btn btn-ghost btn-sm" data-readall>Mark all as read</button>' : '') + '</div>' +
        (L.length ? '<ul class="wf-notes">' + L.map(function (n) {
          return '<li class="' + (n.read ? '' : 'unread') + '"><span class="wf-dot" aria-hidden="true"></span><div><p>' + esc(n.text) + '</p><small>' + stamp(n.at) + (GROUPS[n.to] ? ' · to ' + esc(n.to) : '') + ' · e-mail copy (simulated, not sent)</small></div>' +
            (n.task ? '<button type="button" class="btn btn-ghost btn-sm" data-note="' + n.id + '">Open ' + n.task + '</button>' : '') + '</li>';
        }).join('') + '</ul>' : '<div class="sda-empty">No notifications yet.</div>');
    }

    /* ---------------- workload & reports (admin) ---------------- */
    function vLoad() {
      var open = TASKS.filter(function (t) { return !closed(t); }), OD = TASKS.filter(overdue);
      var apr = TASKS.filter(function (t) { return t.status === 'Awaiting approval'; }).length, unc = open.filter(function (t) { return t.a.type === 'group' && !t.owner; }).length;
      var doneWk = TASKS.filter(function (t) { return t.status === 'Done'; }).length;
      var ppl = PEOPLE.filter(function (p) { return p !== 'Emma Davis'; }).map(function (p) {
        var mine = open.filter(function (t) { return who(t) === p; });
        var c = { o: mine.filter(function (t) { return COL[t.status] === 'open'; }).length, p: mine.filter(function (t) { return t.status === 'In progress'; }).length, w: mine.filter(function (t) { return COL[t.status] === 'wait'; }).length, od: mine.filter(overdue).length };
        c.n = c.o + c.p + c.w; return { p: p, c: c };
      }).sort(function (a, b) { return b.c.n - a.c.n; });
      var max = Math.max.apply(null, ppl.map(function (x) { return x.c.n; }).concat([4]));
      var bar = function (c) { return '<span class="wf-bar" aria-hidden="true"><i class="b-o" style="width:' + (c.o / max * 100) + '%"></i><i class="b-p" style="width:' + (c.p / max * 100) + '%"></i><i class="b-w" style="width:' + (c.w / max * 100) + '%"></i></span>'; };
      var groups = GN.map(function (g) {
        var gt = open.filter(function (t) { return (t.a.type === 'group' && t.a.to === g) || (t.a.type === 'person' && groupsOf(t.a.to).indexOf(g) > -1); });
        return '<tr><td><b>' + esc(g) + '</b><span class="sub">Lead: ' + esc(GROUPS[g].lead) + '</span></td><td>' + gt.length + '</td><td>' + gt.filter(function (t) { return t.a.type === 'group' && !t.owner; }).length + '</td><td>' + gt.filter(function (t) { return t.status === 'In progress'; }).length + '</td><td>' + gt.filter(function (t) { return COL[t.status] === 'wait'; }).length + '</td><td>' + (gt.filter(overdue).length ? '<span class="pill p-bad">' + gt.filter(overdue).length + '</span>' : '0') + '</td></tr>';
      }).join('');
      return '<div class="wf-head"><div><h3>Workload & reports</h3><p class="note">Live from all tasks. Click a person’s tasks or an overdue task to open it.</p></div><button type="button" class="btn btn-ghost btn-sm" data-csv>' + ICO.dl + 'Export overdue report (CSV)</button></div>' +
        '<div class="kpi-row wf-kpis"><div class="kpi"><span>Open tasks</span><b>' + open.length + '</b><small>' + unc + ' unclaimed team tasks</small></div><div class="kpi"><span>Overdue</span><b class="' + (OD.length ? 'bad' : '') + '">' + OD.length + '</b><small>SLA breached</small></div><div class="kpi"><span>Awaiting approval</span><b>' + apr + '</b><small>with team leads</small></div><div class="kpi"><span>Done</span><b>' + doneWk + '</b><small>' + RUNS.length + ' workflows running</small></div></div>' +
        '<div class="wf-grid2"><section class="panel"><h4 class="wf-sub">Workload per person</h4><div class="wf-legend"><span><i class="b-o"></i>Open</span><span><i class="b-p"></i>In progress</span><span><i class="b-w"></i>Waiting</span></div><ul class="wf-load">' + ppl.map(function (x) {
          return '<li>' + av(x.p) + '<span class="wf-load-n"><b>' + esc(x.p) + '</b><small>' + esc(groupsOf(x.p).join(', ') || 'Team lead') + '</small></span>' + bar(x.c) + '<span class="wf-load-c">' + x.c.n + (x.c.od ? ' <em>' + x.c.od + ' overdue</em>' : '') + '</span></li>';
        }).join('') + '</ul></section>' +
        '<section class="panel"><h4 class="wf-sub">Workload per team</h4><div class="tbl-wrap wf-tbl"><table><thead><tr><th>Team</th><th>Open</th><th>Unclaimed</th><th>In progress</th><th>Waiting</th><th>Overdue</th></tr></thead><tbody>' + groups + '</tbody></table></div></section></div>' +
        '<section class="panel wf-od"><h4 class="wf-sub">Overdue report</h4>' + (OD.length ? '<ul class="wf-odl">' + OD.sort(function (a, b) { return daysTo(a.due) - daysTo(b.due); }).map(function (t) {
          return '<li><span class="wf-pbar ' + prioCls(t.prio) + '" aria-hidden="true"></span><span class="wf-od-m"><span class="wf-id">' + t.id + ' · ' + t.prio + '</span><b>' + esc(t.title) + '</b><small>' + esc(who(t) || t.a.to + ' (unclaimed)') + '</small></span><span class="wf-due bad">' + dueInfo(t).txt + '</span>' +
            '<span class="wf-od-a"><button type="button" class="btn btn-ghost btn-sm" data-remind="' + t.id + '">Send reminder</button><button type="button" class="btn btn-ghost btn-sm" data-open="' + t.id + '">Open</button></span></li>';
        }).join('') + '</ul>' : '<div class="sda-empty">Nothing overdue. Nice.</div>') + '</section>';
    }
    function exportCsv() {
      var rows = [['Task', 'Title', 'Assigned to', 'Priority', 'Due', 'Days overdue', 'Status']].concat(TASKS.filter(overdue).map(function (t) { return [t.id, t.title, who(t) || t.a.to, t.prio, t.due, -daysTo(t.due), t.status]; }));
      var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'overdue-report.csv'; a.hidden = true;
      root.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      say('Overdue report exported (' + (rows.length - 1) + ' tasks)');
    }

    /* ---------------- events ---------------- */
    nav.addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) { go(b.dataset.v); var nb = $('[data-v="' + b.dataset.v + '"]', nav); nb && nb.focus(); } });
    scrim.addEventListener('click', closeDrawer);
    var onKey = function (e) {
      if (e.key !== 'Escape' || !openId || drawer.hidden) return;
      if (e.target.closest && e.target.closest('.sda-modal')) return;
      if (root.contains(e.target) || e.target === document.body) closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    ctx.onCleanup(function () { document.removeEventListener('keydown', onKey); });
    main.addEventListener('input', function (e) {
      if (e.target.matches('[data-q]')) { F.q = e.target.value; renderResults(); }
    });
    main.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('[data-prio]')) { F.prio = t.value; renderResults(); }
      if (t.matches('[data-active]')) { var x = TPL[+t.dataset.active]; x.active = t.checked; say(x.name + (x.active ? ' activated' : ' deactivated: team leads can no longer start it')); render(); }
      if (t.matches('[data-tp]')) {
        var s = TPL[+t.dataset.tp].steps[+t.dataset.si], k = t.dataset.k;
        s[k] = k === 'approval' ? t.checked : k === 'days' ? Math.max(0, parseInt(t.value, 10) || 0) : t.value;
      }
    });
    main.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var d = b.dataset;
      if (d.open) { openTask(d.open); return; }
      if (d.scope) { F.scope = d.scope; render(); $('[data-scope="' + d.scope + '"]', main).focus(); return; }
      if (b.hasAttribute('data-od')) { F.od = !F.od; render(); $('[data-od]', main).focus(); return; }
      if (d.layout) { F.layout = d.layout; render(); $('[data-layout="' + d.layout + '"]', main).focus(); return; }
      if (d.act === 'new') { newTask(); return; }
      if (d.act === 'flow') { startFlow(); return; }
      if (d.startflow) { startFlow(d.startflow); return; }
      if (d.qa) { doAction(d.qa, task(d.id)); return; }
      if (d.preview) { dms.open(d.preview); return; }
      if (d.note) { var n = NOTES.filter(function (x) { return x.id === +d.note; })[0]; n.read = true; renderNav(); render(); openTask(n.task); return; }
      if (b.hasAttribute('data-readall')) { notesFor(me()).forEach(function (n) { n.read = true; }); render(); say('All notifications marked as read'); return; }
      if (d.remind) { var t = task(d.remind); note(who(t) || t.a.to, 'Reminder from ' + me() + ': ' + t.id + ' is overdue', t.id); log(t, 'Sent an overdue reminder to ' + (who(t) || t.a.to)); say('Reminder sent to ' + (who(t) || t.a.to) + ' in TaskFlow (e-mail simulated, not sent)'); b.disabled = true; b.textContent = 'Reminder sent'; return; }
      if (b.hasAttribute('data-csv')) { exportCsv(); return; }
      if (d.addstep) { var tp = TPL[+d.addstep]; tp.steps.push({ title: 'New step', a: 'g:Finance team', days: 5, deps: [tp.steps.length - 1], approval: false }); render(); var ins = $$('[data-tp="' + d.addstep + '"][data-k="title"]', main); ins[ins.length - 1].focus(); ins[ins.length - 1].select(); return; }
      if (d.delstep) {
        var p = d.delstep.split(':'), tp2 = TPL[+p[0]], idx = +p[1];
        tp2.steps.splice(idx, 1);
        tp2.steps.forEach(function (s) { s.deps = s.deps.filter(function (x) { return x !== idx; }).map(function (x) { return x > idx ? x - 1 : x; }); });
        render(); say('Step removed. Save the template to publish it.'); return;
      }
      if (d.savetpl) { var tp3 = TPL[+d.savetpl]; tp3.v++; say(tp3.name + ' saved as v' + tp3.v + '. New workflows use this version.'); render(); return; }
      if (b.hasAttribute('data-newtpl')) {
        TPL.push({ id: 'tpl' + (++seq), name: 'IT equipment request', active: true, v: 1, desc: 'Request, approve and hand over IT equipment.', fields: [{ k: 'item', label: 'Equipment', ph: 'e.g. Docking station' }],
          steps: [{ title: 'Check stock for {item}', a: 'g:IT support', days: 2, deps: [], approval: false }, { title: 'Hand over {item}', a: 'g:IT support', days: 4, deps: [0], approval: false }] });
        render(); say('Template “IT equipment request” added. Edit the steps below.'); var ts = $$('.wf-tpl', main); ts[ts.length - 1].scrollIntoView({ block: 'nearest' }); return;
      }
    });
    drawer.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var t = task(openId), d = b.dataset;
      if (b.hasAttribute('data-close-d')) { closeDrawer(); return; }
      if (d.open) { openTask(d.open); return; }
      if (d.tab) { dTab = d.tab; renderDrawer(); $('[data-tab="' + d.tab + '"]', drawer).focus(); return; }
      if (d.preview) { dms.open(d.preview); return; }
      if (d.men) {
        var ta = $('[data-ctext]', drawer); ta.value = ta.value.replace(/@([\w ]*)$/, '@' + d.men + ' '); $('[data-msug]', drawer).hidden = true; ta.focus(); return;
      }
      if (d.ta && t) {
        if (b.disabled) return;
        doAction(d.ta, t);
        var nb = $('[data-ta]', drawer) || $('.wf-d-x', drawer); if (nb && d.ta !== 'attach' && d.ta !== 'comment') nb.focus({ preventScroll: true });
      }
    });
    drawer.addEventListener('keydown', function (e) {
      var tb = e.target.closest('[role="tab"]'); if (!tb || !/Arrow(Left|Right)/.test(e.key)) return;
      var order = ['comments', 'files', 'log'], i = order.indexOf(dTab); dTab = order[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; renderDrawer(); $('[data-tab="' + dTab + '"]', drawer).focus();
    });
    drawer.addEventListener('input', function (e) {
      if (!e.target.matches('[data-ctext]')) return;
      e.target.removeAttribute('aria-invalid');
      var mm = e.target.value.match(/@([\w]*(?: [\w]*)?)$/), box = $('[data-msug]', drawer);
      if (!mm) { box.hidden = true; return; }
      var q = mm[1].toLowerCase(), L = PEOPLE.concat(GN).filter(function (p) { return p !== me() && p.toLowerCase().indexOf(q) === 0; }).slice(0, 5);
      box.innerHTML = L.map(function (p) { return '<button type="button" data-men="' + esc(p) + '">' + av(p, GROUPS[p] ? 'group' : '') + esc(p) + '</button>'; }).join('');
      box.hidden = !L.length;
    });

    /* role switcher */
    SDA.roles($('.wf-roles'), { title: 'View as', roles: ROLES, value: role, onChange: function (r) {
      role = r; openId = null; F.scope = 'all'; F.od = false; F.prio = 'All'; F.q = '';
      dms.setRole(r);
      if (!NAV[r].some(function (x) { return x[0] === view; })) view = 'tasks';
      render();
    } });

    render();
  });
})();
