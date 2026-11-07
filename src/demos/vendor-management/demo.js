/* Vendor Hub – vendor management demo. All data is fictional sample data.
   Nothing is sent anywhere: supplier e-mails, notifications and AI steps are simulated. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-vendor', function (root, ctx) {
    var esc = SDA.esc, money = SDA.money;
    var q1 = function (s) { return root.querySelector(s); };
    var NOW = SDA.today(0);
    var dt = function (n) { return SDA.today(n); };
    var fd = function (d) { return SDA.fmtDate(d); };
    var iso = function (d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
    var daysLeft = function (d) { return Math.round((d - NOW) / 864e5); };
    var r1 = function (n) { return Math.round(n * 10) / 10; };
    var f1 = function (n) { return r1(n).toFixed(1); };
    var m$ = function (n) { return money(n, Math.round(n * 100) % 100 !== 0); };
    var unitP = function (n) { return money(n, true); };
    var td = function (l, html, cls) { return '<td data-l="' + esc(l) + '"' + (cls ? ' class="' + cls + '"' : '') + '><span class="vm-v">' + html + '</span></td>'; };
    var pill = function (txt, cls) { return '<span class="pill ' + cls + '">' + esc(txt) + '</span>'; };
    var stCls = function (s) {
      return /Awarded|Closed|Approved|Valid|Active|Received/.test(s) ? 'p-ok' : /Rejected|Expired|Open$/.test(s) ? 'p-bad' : /New|Invited/.test(s) ? 'p-info' : 'p-warn';
    };
    var I = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var ICO = {
      sup: I('<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6"/>'),
      rfq: I('<path d="M4 4h16v12H5.2L4 17.2z"/><path d="M8 9h8M8 12h5"/>'),
      req: I('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>'),
      dms: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'),
      cmp: I('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
      rat: I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
      cert: I('<circle cx="12" cy="9" r="5"/><path d="m9 13-2 8 5-3 5 3-2-8"/>'),
      apv: I('<path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="4"/>'),
      spend: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>')
    };

    /* ------------------------------------------------------------------ data */
    var CATS = ['Raw materials', 'Electronics', 'Logistics', 'Packaging'];
    var SUP = [
      { n: 'Nordwerk Metals', c: 'Raw materials', co: 'Germany', contact: 'Michael Brown', otd: 97, q: 96, ppm: 120, spend: 2410000, vol: 2 },
      { n: 'Baltic Polymers', c: 'Raw materials', co: 'Poland', contact: 'Emma Davis', otd: 88, q: 91, ppm: 640, spend: 1180000, vol: 9 },
      { n: 'Carden Alloys', c: 'Raw materials', co: 'United States', contact: 'James Taylor', otd: 92, q: 90, ppm: 410, spend: 730000, vol: 5 },
      { n: 'Kestrel Electronics', c: 'Electronics', co: 'Taiwan', contact: 'Daniel Moore', otd: 79, q: 87, ppm: 1850, spend: 3050000, vol: 6 },
      { n: 'Volta Components', c: 'Electronics', co: 'Czechia', contact: 'Laura White', otd: 93, q: 89, ppm: 520, spend: 860000, vol: 3 },
      { n: 'Alpina Logistics', c: 'Logistics', co: 'Austria', contact: 'Chris Martin', otd: 95, q: 92, ppm: 0, spend: 640000, vol: 4 },
      { n: 'Rheinfracht', c: 'Logistics', co: 'Germany', contact: 'Paul Clark', otd: 84, q: 86, ppm: 0, spend: 520000, vol: 11 },
      { n: 'Corvex Packaging', c: 'Packaging', co: 'Netherlands', contact: 'Anna Lewis', otd: 98, q: 97, ppm: 60, spend: 410000, vol: 1 },
      { n: 'Medina Cartons', c: 'Packaging', co: 'Spain', contact: 'Mark Hall', otd: 81, q: 83, ppm: 2300, spend: 295000, vol: 7 }
    ];
    SUP.forEach(function (s) { s.status = 'Active'; s.ratings = []; });
    var lvlTxt = { ok: 'Low', warn: 'Medium', bad: 'High' }, lvlCls = { ok: 'p-ok', warn: 'p-warn', bad: 'p-bad' };
    function recalc() {
      var cs = {};
      SUP.forEach(function (s) { cs[s.c] = (cs[s.c] || 0) + s.spend; });
      SUP.forEach(function (s) {
        s.share = cs[s.c] ? s.spend / cs[s.c] * 100 : 0;
        s.parts = { late: (100 - s.otd) * 1.6, qual: (100 - s.q) * 1.4, vol: s.vol * 1.5, conc: Math.max(0, s.share - 40) * 0.6 };
        s.risk = Math.min(100, Math.round(s.parts.late + s.parts.qual + s.parts.vol + s.parts.conc));
        s.lvl = s.risk >= 40 ? 'bad' : s.risk >= 25 ? 'warn' : 'ok';
        var avg = (s.q + s.otd) / 2; s.cls = avg >= 92 ? 'A' : avg >= 85 ? 'B' : 'C';
      });
    }
    recalc();
    var sup = function (n) { return SUP.filter(function (x) { return x.n === n; })[0]; };

    var WEIGHTS = {
      bal: { name: 'Balanced', price: 40, quality: 25, delivery: 20, risk: 15 },
      price: { name: 'Price first', price: 60, quality: 15, delivery: 15, risk: 10 },
      quality: { name: 'Quality first', price: 25, quality: 40, delivery: 15, risk: 20 }
    };
    var CRIT = [['price', 'Price'], ['quality', 'Quality'], ['delivery', 'Delivery'], ['risk', 'Risk']];

    var RFQ = [
      { id: 'RFQ-1031', item: 'Aluminum profiles 6063-T6', units: 12000, unit: 'm', due: dt(4), created: dt(-9), w: 'bal', status: 'Quotes in',
        sup: ['Nordwerk Metals', 'Baltic Polymers', 'Carden Alloys'],
        quotes: [{ s: 'Nordwerk Metals', price: 4.12, lead: 14, terms: '30 days net', doc: 'vd-q-nor' }, { s: 'Baltic Polymers', price: 3.95, lead: 21, terms: '45 days net', doc: 'vd-q-bal' }, { s: 'Carden Alloys', price: 4.38, lead: 12, terms: '60 days net', doc: 'vd-q-car' }] },
      { id: 'RFQ-1030', item: 'PCB assemblies rev. C', units: 2500, unit: 'pcs', due: dt(-12), created: dt(-30), w: 'bal', status: 'Awarded', award: 'Volta Components', contract: 'vd-con-1030', apv: 'APV-75',
        sup: ['Kestrel Electronics', 'Volta Components'],
        quotes: [{ s: 'Kestrel Electronics', price: 38.40, lead: 35, terms: '60 days net' }, { s: 'Volta Components', price: 39.10, lead: 18, terms: '30 days net' }] }
    ];
    var rfq = function (id) { return RFQ.filter(function (x) { return x.id === id; })[0]; };
    var total = function (r, q) { return Math.round(q.price * 100) * r.units / 100; };
    function scoreRfq(r, wKey) {
      var w = WEIGHTS[wKey || r.w], tots = r.quotes.map(function (q) { return total(r, q); });
      var minT = Math.min.apply(null, tots), minL = Math.min.apply(null, r.quotes.map(function (q) { return q.lead; }));
      var rows = r.quotes.map(function (q, i) {
        var s = sup(q.s), sub = { price: r1(minT / tots[i] * 100), quality: s.q, delivery: r1(minL / q.lead * 100), risk: 100 - s.risk }, pts = {}, sc = 0;
        CRIT.forEach(function (c) { pts[c[0]] = r1(sub[c[0]] * w[c[0]] / 100); sc += pts[c[0]]; });
        return { q: q, s: s, total: tots[i], diff: tots[i] - minT, sub: sub, pts: pts, score: r1(sc), leadDiff: q.lead - minL };
      });
      var best = rows.slice().sort(function (a, b) { return b.score - a.score; })[0];
      var low = rows.filter(function (x) { return x.total === minT; })[0];
      return { rows: rows, w: w, best: best, low: low, minT: minT, minL: minL };
    }

    var D8 = ['D1 Team', 'D2 Problem description', 'D3 Containment', 'D4 Root cause', 'D5 Corrective actions', 'D6 Implementation and verification', 'D7 Prevent recurrence', 'D8 Closure'];
    var D8T = {
      'Workmanship': ['Supplier sorts all stock at both sites; next deliveries are 100% checked and labelled "8D checked".', 'Process parameter drifted after maintenance and was not re-checked before production restarted.', 'Restore the validated parameters and add a release check after every maintenance.', 'Three following lots delivered without defects, confirmed by our incoming inspection.', 'Maintenance checklist and work instructions updated; lesson shared with sister plants.'],
      'Material defect': ['Affected batch quarantined at both sites; replacement batch shipped with a test certificate.', 'Raw material from a new sub-supplier was released without a full incoming test.', 'Full incoming test for the new sub-supplier and a material release by the supplier\'s quality lead.', 'Two replacement batches tested within specification; parts produced without defects.', 'Sub-supplier approval procedure updated; material test added to the control plan.'],
      'Transport damage': ['Damaged goods replaced; the next shipments get corner protection and are checked at loading.', 'Pallets stacked above the allowed height; edge protection missing.', 'Corner protectors, a stacking limit and a new packing specification.', 'Four shipments received without damage.', 'Packing instruction updated and trained with the warehouse team.'],
      'Dimensional': ['Stock sorted with a go/no-go gauge; only measured parts are shipped.', 'Worn fixture caused the dimension to drift out of tolerance.', 'Replace the fixture and add fixture wear to the preventive maintenance plan.', 'First-article inspection and three lots measured within tolerance.', 'Gauge check added to every shift start; control plan revised.'],
      'Documentation': ['Missing documents supplied for all open deliveries.', 'Shipping checklist did not include the customer-specific documents.', 'Shipping checklist extended; document check before release.', 'Five deliveries received with complete documents.', 'Customer requirements matrix introduced in the supplier\'s shipping department.'],
      'Wrong or missing delivery': ['Missing quantity shipped by express at the supplier\'s cost.', 'Picking error: two part numbers with similar labels were stored side by side.', 'Separate storage locations and barcode scan at picking.', 'Ten deliveries received without picking errors.', 'Barcode scan made mandatory for all customer orders.']
    };
    var CMP = [
      { id: 'CMP-209', s: 'Baltic Polymers', part: 'PA6 granulate, batch 7781', issue: 'Moisture content 0.32% (spec max. 0.20%); molded parts show splay marks.', qty: '2,000 kg', cat: 'Material defect', sev: 'Medium', status: 'Open', created: dt(-1), at: 0, d: [] },
      { id: 'CMP-208', s: 'Kestrel Electronics', part: 'PCB assembly rev. C, lot 22-117', issue: 'Solder bridges on 4% of boards found at incoming inspection.', qty: '100 pcs', cat: 'Workmanship', sev: 'High', status: '8D requested', created: dt(-5), at: 2,
        d: ['David Wilson (customer quality), Kestrel quality lead, Kestrel process engineer.', 'Solder bridges on 4% of boards found at incoming inspection; 100 of 2,500 boards in lot 22-117 affected.'],
        texts: ['Kestrel sorts all stock at both sites (2,400 boards checked, 96 more rejected). Next deliveries 100% optically inspected and labelled "8D checked".', 'Reflow oven profile on line 3 drifted after maintenance; peak temperature 12 °C too high. Worn stencil added to the bridging.', 'Restore the validated oven profile, replace the stencil and add a profile check after every maintenance.', 'Profile restored; three lots (7,500 boards) delivered with zero bridges, verified by our incoming inspection.', 'Maintenance checklist updated, profile monitoring alarm added, risk analysis for the soldering process revised.'] },
      { id: 'CMP-207', s: 'Medina Cartons', part: 'Shipping cartons 60x40', issue: 'Cartons crushed in transit, product scratched.', qty: '340 pcs', cat: 'Transport damage', sev: 'Medium', status: 'Closed', created: dt(-21), at: 8,
        d: ['David Wilson, Medina quality lead, Medina warehouse lead.', 'Cartons crushed in transit; 340 products scratched.', 'Damaged goods replaced; next shipments with corner protection.', 'Pallet stacking height exceeded; edge protection missing.', 'Corner protectors, stacking limit and new packing specification.', 'Four shipments received without damage.', 'Packing instruction updated and trained.', 'Closed by David Wilson.'] }
    ];
    var cmp = function (id) { return CMP.filter(function (x) { return x.id === id; })[0]; };

    var APV = [
      { id: 'APV-77', type: 'New supplier', title: 'Onboard Lakeside Resins as second source for PA6 granulate', by: 'Lisa Miller', created: dt(-2), amount: 0, status: 'Pending', doc: 'vd-sa-lak',
        reason: 'Second source for PA6 granulate after the moisture issue at Baltic Polymers (CMP-209). Self-assessment received, ISO 9001 certified.',
        newSup: { n: 'Lakeside Resins', c: 'Raw materials', co: 'United States', contact: 'Rachel Adams', otd: 90, q: 88, ppm: 0, spend: 0, vol: 4 } },
      { id: 'APV-76', type: 'Contract renewal', title: 'Renew framework contract with Corvex Packaging for 2 years', by: 'Lisa Miller', created: dt(-3), amount: 820000, status: 'Pending', doc: 'vd-fc-cor-ren', sup: 'Corvex Packaging',
        reason: '2-year renewal 2027–2028. Prices +1.8% (cap 3% per year), payment 45 days net, same service levels. Corvex is our best-rated packaging supplier (class A).' },
      { id: 'APV-75', type: 'Award', title: 'Award RFQ-1030 PCB assemblies rev. C to Volta Components', by: 'Lisa Miller', created: dt(-14), amount: 97750, status: 'Approved', rfq: 'RFQ-1030', sup: 'Volta Components', doc: 'vd-con-1030', w: 'bal',
        reason: 'Highest score: 17 days faster delivery and lower supplier risk than Kestrel (+$1,750, +1.8%). Reduces our electronics concentration on Kestrel.',
        comment: 'Agreed. Faster delivery is worth the extra $1,750.', decidedBy: 'Sarah Johnson', decided: dt(-13) }
    ];
    var apvById = function (id) { return APV.filter(function (x) { return x.id === id; })[0]; };
    var committed = [];
    var nRfq = 1032, nCmp = 210, nApv = 78;

    /* ------------------------------------------------------------------ documents */
    var C_BODY = 'Northbridge Certification (fictional)';
    function certDoc(id, s, std, scope, issued, exp) {
      return { id: id, name: std + ' certificate – ' + s + '.pdf', type: 'pdf', folder: 'Certificates', sup: s, linked: s, owner: 'David Wilson', date: fd(issued), exp: exp, cert: std, tags: ['certificate', std],
        title: std + ' certificate', company: C_BODY, meta: [['Holder', s], ['Standard', std], ['Valid until', fd(exp)]],
        sections: [{ h: 'Scope', p: scope }, { h: 'Certification body', p: C_BODY + ', accreditation no. 4471 (sample).' },
          { h: 'Validity', rows: [['Issued', 'Valid until', 'Audit cycle'], [fd(issued), fd(exp), 'Annual surveillance audit']] }] };
    }
    function quoteDoc(id, r, q, no) {
      var t = total(r, q);
      return { id: id, name: 'Quote ' + no + ' – ' + q.s + ' – ' + r.id + '.pdf', type: 'pdf', folder: 'Quotes', sup: q.s, rfq: r.id, linked: q.s + ' · ' + r.id, owner: 'Lisa Miller', date: fd(dt(-3)), status: 'Received', tags: ['quote', r.id],
        title: 'Quotation ' + no, company: q.s, meta: [['Your RFQ', r.id], ['Valid for', '60 days'], ['Contact', sup(q.s) ? sup(q.s).contact : '']],
        sections: [{ h: 'Offer', rows: [['Item', 'Quantity', 'Unit price', 'Total'], [r.item, r.units.toLocaleString('en-US') + ' ' + r.unit, unitP(q.price), m$(t)]] },
          { h: 'Terms', lines: ['Delivery time: ' + q.lead + ' days after order', 'Payment terms: ' + q.terms, 'Incoterm: DAP your main plant'] }] };
    }
    var r31 = rfq('RFQ-1031'), r30 = rfq('RFQ-1030');
    var DOCS = [
      certDoc('vd-c-kes-iatf', 'Kestrel Electronics', 'IATF 16949', 'Manufacture of printed circuit board assemblies for automotive customers.', dt(-1071), dt(24)),
      certDoc('vd-c-med-iso', 'Medina Cartons', 'ISO 9001', 'Design and production of corrugated packaging.', dt(-1102), dt(-7)),
      certDoc('vd-c-nor-iso', 'Nordwerk Metals', 'ISO 9001', 'Extrusion and machining of aluminum profiles.', dt(-585), dt(510)),
      certDoc('vd-c-kes-iso', 'Kestrel Electronics', 'ISO 9001', 'Electronics manufacturing services.', dt(-695), dt(400)),
      certDoc('vd-c-vol-iatf', 'Volta Components', 'IATF 16949', 'Electronic components and assemblies for automotive use.', dt(-405), dt(690)),
      certDoc('vd-c-bal-iso', 'Baltic Polymers', 'ISO 9001', 'Compounding and distribution of engineering plastics.', dt(-795), dt(300)),
      certDoc('vd-c-car-iso', 'Carden Alloys', 'ISO 9001', 'Aluminum extrusion and surface treatment.', dt(-945), dt(150)),
      certDoc('vd-c-cor-iso', 'Corvex Packaging', 'ISO 14001', 'Environmental management for packaging production.', dt(-275), dt(820)),
      { id: 'vd-fc-kes', name: 'Framework contract 2025–2027 – Kestrel Electronics.pdf', type: 'pdf', folder: 'Framework contracts', sup: 'Kestrel Electronics', linked: 'Kestrel Electronics', owner: 'Lisa Miller', date: fd(dt(-410)), status: 'Approved', tags: ['contract'],
        title: 'Framework contract 2025–2027', company: 'Vendor Hub · Purchasing', meta: [['Supplier', 'Kestrel Electronics'], ['Term', 'Jan 2025 – Dec 2027'], ['Volume', '$3,000,000 / year']],
        sections: [{ h: 'Commercial terms', lines: ['Payment 60 days net', 'Annual price review, capped at 3%', '12-month warranty'] }, { h: 'Quality', p: 'IATF 16949 certification required for the whole term. Complaints are handled with the 8D (eight-step problem solving) method.' }] },
      { id: 'vd-fc-alp', name: 'Framework contract 2026 – Alpina Logistics.pdf', type: 'pdf', folder: 'Framework contracts', sup: 'Alpina Logistics', linked: 'Alpina Logistics', owner: 'Lisa Miller', date: fd(dt(-300)), status: 'Approved', tags: ['contract'],
        title: 'Framework contract 2026', company: 'Vendor Hub · Purchasing', meta: [['Supplier', 'Alpina Logistics'], ['Term', 'Calendar year 2026']],
        sections: [{ h: 'Rates', rows: [['Lane', 'Rate per pallet'], ['Main plant → Hub North', '$84.00'], ['Main plant → Hub South', '$97.50']] }, { h: 'Service levels', lines: ['Pick-up within 24 hours', 'On-time delivery target 95%'] }] },
      { id: 'vd-fc-cor-ren', name: 'Framework contract renewal 2027–2028 – Corvex Packaging.docx', type: 'docx', folder: 'Framework contracts', sup: 'Corvex Packaging', linked: 'Corvex Packaging · APV-76', owner: 'Lisa Miller', date: fd(dt(-3)), status: 'In review', apv: 'APV-76', tags: ['contract', 'renewal'],
        title: 'Framework contract renewal 2027–2028 (draft)', company: 'Vendor Hub · Purchasing', meta: [['Supplier', 'Corvex Packaging'], ['Value', '$820,000 over 2 years'], ['Approval', 'APV-76']],
        sections: [{ h: 'Commercial terms', lines: ['Prices +1.8% from Jan 2027, annual review capped at 3%', 'Payment 45 days net', 'Consignment stock of 2 weeks'] }, { h: 'Approval', p: 'Awaiting approval by Sarah Johnson (Purchasing manager).' }] },
      { id: 'vd-con-1030', name: 'Framework contract – Volta Components – RFQ-1030.pdf', type: 'pdf', folder: 'Framework contracts', sup: 'Volta Components', rfq: 'RFQ-1030', apv: 'APV-75', linked: 'Volta Components · RFQ-1030', owner: 'Lisa Miller', date: fd(dt(-13)), status: 'Approved', tags: ['contract', 'award'],
        title: 'Framework contract – PCB assemblies rev. C', company: 'Vendor Hub · Purchasing', meta: [['Supplier', 'Volta Components'], ['RFQ', 'RFQ-1030'], ['Value', '$97,750']],
        sections: [{ h: 'Commercial terms', rows: [['Item', 'Quantity', 'Unit price', 'Total'], ['PCB assemblies rev. C', '2,500 pcs', '$39.10', '$97,750']] }, { h: 'Delivery and payment', lines: ['Delivery time: 18 days after order', 'Payment terms: 30 days net'] }, { h: 'Approval', p: 'Approved by Sarah Johnson. Comment: "Agreed. Faster delivery is worth the extra $1,750."' }] },
      quoteDoc('vd-q-nor', r31, r31.quotes[0], 'Q-5512'), quoteDoc('vd-q-bal', r31, r31.quotes[1], 'BP-2026-311'), quoteDoc('vd-q-car', r31, r31.quotes[2], 'CA-88104'),
      { id: 'vd-8d-207', name: '8D report CMP-207 – Medina Cartons.pdf', type: 'pdf', folder: '8D reports', sup: 'Medina Cartons', cmp: 'CMP-207', linked: 'Medina Cartons · CMP-207', owner: 'David Wilson', date: fd(dt(-8)), status: 'Approved', tags: ['8D'],
        title: '8D report CMP-207', company: 'Vendor Hub · Supplier quality', meta: [['Supplier', 'Medina Cartons'], ['Part', 'Shipping cartons 60x40'], ['Closed', fd(dt(-8))]],
        sections: [{ h: '8D steps (eight-step problem solving)', rows: [['Step', 'Result']].concat(D8.map(function (h, i) { return [h, CMP[2].d[i]]; })) }] },
      { id: 'vd-ph-208', name: 'Defect photo CMP-208 – solder bridges.jpg', type: 'jpg', folder: '8D reports', sup: 'Kestrel Electronics', cmp: 'CMP-208', linked: 'Kestrel Electronics · CMP-208', owner: 'David Wilson', date: fd(dt(-5)), status: 'Valid', tags: ['photo', 'evidence'], img: SDA.art('install', 'CMP-208 · lot 22-117 · solder bridges') },
      { id: 'vd-sa-vol', name: 'Supplier self-assessment 2026 – Volta Components.xlsx', type: 'xlsx', folder: 'Self-assessments', sup: 'Volta Components', linked: 'Volta Components', owner: 'David Wilson', date: fd(dt(-120)), status: 'Valid', tags: ['self-assessment'],
        title: 'Supplier self-assessment 2026', company: 'Volta Components', meta: [['Score', '86 / 100'], ['Reviewed by', 'David Wilson']],
        sections: [{ h: 'Results', rows: [['Area', 'Score'], ['Quality management', '90'], ['Delivery and logistics', '84'], ['Sustainability', '81'], ['Information security', '88']] }] },
      { id: 'vd-sa-kes', name: 'Supplier self-assessment 2026 – Kestrel Electronics.xlsx', type: 'xlsx', folder: 'Self-assessments', sup: 'Kestrel Electronics', linked: 'Kestrel Electronics', owner: 'David Wilson', date: fd(dt(-140)), status: 'Valid', tags: ['self-assessment'],
        title: 'Supplier self-assessment 2026', company: 'Kestrel Electronics', meta: [['Score', '74 / 100'], ['Reviewed by', 'David Wilson']],
        sections: [{ h: 'Results', rows: [['Area', 'Score'], ['Quality management', '78'], ['Delivery and logistics', '65'], ['Sustainability', '76'], ['Information security', '80']] }, { h: 'Follow-up', p: 'Delivery performance below target. Improvement plan agreed for Q1.' }] },
      { id: 'vd-sa-lak', name: 'Supplier self-assessment – Lakeside Resins.xlsx', type: 'xlsx', folder: 'Self-assessments', sup: 'Lakeside Resins', apv: 'APV-77', linked: 'Lakeside Resins · APV-77', owner: 'Lisa Miller', date: fd(dt(-2)), status: 'In review', tags: ['self-assessment', 'onboarding'],
        title: 'Supplier self-assessment (onboarding)', company: 'Lakeside Resins', meta: [['Score', '82 / 100'], ['Approval', 'APV-77']],
        sections: [{ h: 'Results', rows: [['Area', 'Score'], ['Quality management (ISO 9001)', '88'], ['Delivery and logistics', '80'], ['Sustainability', '77'], ['Information security', '83']] }] }
    ];
    function certStatus(d) {
      if (d.renew) return 'Renewal pending';
      var n = daysLeft(d.exp); return n < 0 ? 'Expired' : n <= 60 ? 'Expiring soon' : 'Valid';
    }
    DOCS.forEach(function (d) { if (d.cert) d.status = certStatus(d); });

    /* ------------------------------------------------------------------ roles + state */
    var ROLES = [
      { id: 'buyer', label: 'Buyer', person: 'Lisa Miller', icon: 'LM', sub: 'Find suppliers, run RFQs (requests for quotation), compare quotes and propose awards.' },
      { id: 'quality', label: 'Quality engineer', person: 'David Wilson', icon: 'DW', sub: 'Handle supplier complaints with 8D (eight-step problem solving), rate suppliers and track certificates.' },
      { id: 'manager', label: 'Purchasing manager', person: 'Sarah Johnson', icon: 'SJ', sub: 'Approve or reject awards and new suppliers, and watch spend by category and supplier.' }
    ];
    var person = function (r) { return ROLES.filter(function (x) { return x.id === r; })[0].person; };
    var NAV = {
      buyer: [['sup', 'Suppliers'], ['rfq', 'RFQs'], ['req', 'My requests'], ['dms', 'Documents']],
      quality: [['cmp', 'Complaints'], ['rat', 'Ratings'], ['cert', 'Certificates'], ['dms', 'Documents']],
      manager: [['apv', 'Approvals'], ['spend', 'Spend'], ['sup', 'Suppliers'], ['dms', 'Documents']]
    };
    var role = 'buyer', view = { buyer: 'sup', quality: 'cmp', manager: 'apv' };
    var supQ = '', supCat = 'All', supRisk = 'All', selSup = 'Kestrel Electronics';
    var selRfq = 'RFQ-1031', rfqDraft = null, selCmp = 'CMP-208', cmpDraft = null, cmpMail = {};
    var ratCls = 'All', spendMode = 'cat', spendCat = null;
    var nav = q1('.vm-nav'), main = q1('.vm-main');
    var say = function (msg, kind) { SDA.toast(root, msg, kind); };

    var dmsEl = document.createElement('div');
    dmsEl.className = 'vm-dms';
    var dmsOpts = {
      root: root, title: 'Supplier documents', docs: DOCS, role: role,
      folders: ['Certificates', 'Framework contracts', 'Quotes', '8D reports', 'Self-assessments'],
      canUpload: function (r) { return r !== 'manager'; },
      canApprove: function (r) { return r === 'manager'; },
      filter: function (d, r) { return !(r === 'quality' && d.folder === 'Quotes'); },
      userName: person, uploadFolder: 'Quotes', uploadStatus: 'In review',
      onChange: function (docs, d, act) {
        if (act === 'approve' && d && d.apv) { var a = apvById(d.apv); if (a && a.status === 'Pending') decide(a.id, true, 'Approved in Documents.', true); }
        renderNav();
      }
    };
    var dms = SDA.dms(dmsEl, dmsOpts);
    var docById = function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; };
    var docsFor = function (fn) { return dms.docs().filter(function (d) { return dmsOpts.filter(d, role) && fn(d); }); };

    var guide = SDA.guide(q1('.vm-guide'), {
      title: 'Award a quote and get it approved', demoId: 'demo-vendor',
      steps: [
        { id: 'compare', text: 'As <b>Lisa (Buyer)</b>, open RFQ-1031 and expand “How the score is calculated”' },
        { id: 'award', text: 'Award a quote – a contract draft is filed in Documents' },
        { id: 'approve', text: 'Switch to <b>Sarah (Manager)</b> and approve the award' },
        { id: 'open', text: 'Open the approved contract in Documents' }
      ],
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=vendor-management', text: 'Talk to us about your version' }
    });

    var roles = SDA.roles(q1('.vm-roles'), {
      title: 'View as', roles: ROLES, value: role,
      onChange: function (id) {
        role = id; dms.setRole(id);
        dmsOpts.uploadFolder = id === 'quality' ? 'Certificates' : 'Quotes';
        renderNav(); render(); main.scrollTop = 0;
      }
    });

    /* ------------------------------------------------------------------ nav */
    function counts() {
      return {
        rfq: RFQ.filter(function (r) { return r.status === 'Quotes in'; }).length,
        req: APV.filter(function (a) { return a.by === 'Lisa Miller' && a.status === 'Pending'; }).length,
        cmp: CMP.filter(function (c) { return c.status !== 'Closed'; }).length,
        cert: dms.docs().filter(function (d) { return d.cert && /Expir/.test(d.status); }).length,
        rat: SUP.filter(function (s) { return s.cls === 'C'; }).length,
        apv: APV.filter(function (a) { return a.status === 'Pending'; }).length,
        dms: role === 'manager' ? dms.docs().filter(function (d) { return /draft|review|pending approval/i.test(d.status); }).length : 0
      };
    }
    function renderNav() {
      var c = counts();
      nav.innerHTML = NAV[role].map(function (it) {
        var k = it[0], n = c[k] || 0;
        return '<button type="button" role="tab" data-v="' + k + '" aria-controls="vm-main" aria-selected="' + (view[role] === k) + '">' + ICO[k] + '<span>' + it[1] + '</span>' +
          (n ? '<i class="cnt"><span class="vm-sr">, </span>' + n + '<span class="vm-sr"> to review</span></i>' : '') + '</button>';
      }).join('');
    }
    function go(v) { view[role] = v; renderNav(); render(); main.scrollTop = 0; }
    function render() {
      var v = view[role];
      if (v === 'dms') { main.innerHTML = ''; main.appendChild(dmsEl); dms.render(); return; }
      main.innerHTML = v === 'sup' ? vSup() : v === 'rfq' ? vRfq() : v === 'req' ? vReq() : v === 'cmp' ? vCmp() : v === 'rat' ? vRat() : v === 'cert' ? vCert() : v === 'apv' ? vApv() : vSpend();
    }
    function openDoc(id, inDms) {
      var d = docById(id); if (!d) return;
      if (inDms) { go('dms'); dms.setFolder(d.folder); }
      dms.open(id); docOpened(id);
    }
    function docOpened(id) {
      var d = docById(id);
      if (d && d.award && d.status === 'Approved') guide.done('open');
    }
    dmsEl.addEventListener('click', function (e) { var t = e.target.closest('[data-doc]'); if (t) docOpened(t.dataset.doc); });
    var docBtns = function (list, empty) {
      if (!list.length) return '<p class="vm-muted">' + (empty || 'No documents linked yet.') + '</p>';
      return '<ul class="vm-docs">' + list.map(function (d) {
        return '<li><button type="button" class="vm-doc" data-open-doc="' + d.id + '">' + SDA.icon.doc + '<span><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + (d.exp ? ' · valid until ' + fd(d.exp) : '') + '</small></span>' + pill(d.status, d.cert && /Expir/.test(d.status) ? 'p-bad' : stCls(d.status)) + '</button></li>';
      }).join('') + '</ul>';
    };

    /* ------------------------------------------------------------------ suppliers (buyer + manager) */
    function supFiltered() {
      var q = supQ.trim().toLowerCase();
      return SUP.filter(function (s) {
        return (supCat === 'All' || s.c === supCat) && (supRisk === 'All' || lvlTxt[s.lvl] === supRisk) &&
          (!q || (s.n + ' ' + s.co + ' ' + s.c + ' ' + s.contact).toLowerCase().indexOf(q) > -1);
      });
    }
    function riskPoints(s) {
      var pts = [];
      if (s.otd < 90) pts.push('On-time delivery is <b>' + s.otd + '%</b>, below the 90% target.');
      if (s.q < 90) pts.push('Quality score <b>' + s.q + '</b> points to recurring defects.');
      if (s.vol >= 6) pts.push('Price volatility of <b>' + s.vol + '%</b> is above the category average.');
      if (s.share >= 50) pts.push('<b>' + Math.round(s.share) + '%</b> of ' + esc(s.c.toLowerCase()) + ' spend sits with this supplier.');
      var openC = CMP.filter(function (c) { return c.s === s.n && c.status !== 'Closed'; }).length;
      if (openC) pts.push('<b>' + openC + '</b> open complaint' + (openC > 1 ? 's' : '') + '.');
      dms.docs().filter(function (d) { return d.sup === s.n && d.cert && /Expir/.test(d.status); }).forEach(function (d) { pts.push(esc(d.cert) + ' certificate: <b>' + esc(d.status.toLowerCase()) + '</b> (' + fd(d.exp) + ').'); });
      if (s.status === 'New') pts.push('New supplier: scores are provisional, based on the self-assessment.');
      if (!pts.length) pts.push('Stable across delivery, quality and price. No action needed.');
      return pts;
    }
    function supDetail(s) {
      var act = s.lvl === 'bad' ? 'Qualify a second source and agree a corrective-action plan.' : s.lvl === 'warn' ? 'Schedule a quarterly review with improvement targets.' : 'Consider a longer framework contract for better prices.';
      var docs = docsFor(function (d) { return d.sup === s.n; });
      var openR = RFQ.filter(function (r) { return r.sup.indexOf(s.n) > -1 && !/Awarded/.test(r.status); }).length;
      var p = s.parts;
      return '<div class="panel vm-detail" aria-label="Supplier details">' +
        '<div class="vm-dh"><div><h3>' + esc(s.n) + '</h3><p class="vm-muted">' + esc(s.c) + ' · ' + esc(s.co) + ' · contact ' + esc(s.contact) + '</p></div><div class="vm-pills">' + (s.status === 'New' ? pill('New', 'p-info') : '') + pill(lvlTxt[s.lvl] + ' risk · ' + s.risk, lvlCls[s.lvl]) + '</div></div>' +
        '<div class="vm-kv"><div><span>On-time</span><b>' + s.otd + '%</b></div><div><span>Quality</span><b>' + s.q + '</b></div><div><span>Spend / yr</span><b>' + money(s.spend) + '</b></div><div><span>Category share</span><b>' + Math.round(s.share) + '%</b></div></div>' +
        '<div class="ai-box"><div class="ai-h">AI risk analysis (simulated)</div><ul><li>' + riskPoints(s).join('</li><li>') + '</li></ul><p class="vm-rec"><b>Recommended:</b> ' + act + '</p>' +
        '<details class="vm-how-s"><summary>How the risk index is calculated</summary><table class="vm-mini"><tbody>' +
        '<tr><td>Late deliveries</td><td>(100 − ' + s.otd + ') × 1.6</td><td>' + f1(p.late) + '</td></tr>' +
        '<tr><td>Quality gap</td><td>(100 − ' + s.q + ') × 1.4</td><td>' + f1(p.qual) + '</td></tr>' +
        '<tr><td>Price volatility</td><td>' + s.vol + '% × 1.5</td><td>' + f1(p.vol) + '</td></tr>' +
        '<tr><td>Concentration</td><td>(share ' + Math.round(s.share) + '% − 40) × 0.6, min. 0</td><td>' + f1(p.conc) + '</td></tr>' +
        '<tr class="vm-sum"><td>Risk index</td><td>0–24 low · 25–39 medium · 40+ high</td><td>' + s.risk + '</td></tr></tbody></table></details></div>' +
        '<h4>Documents (' + docs.length + ')</h4>' + docBtns(docs) +
        '<p class="vm-muted vm-small">' + openR + ' open RFQ' + (openR === 1 ? '' : 's') + ' · ' + CMP.filter(function (c) { return c.s === s.n; }).length + ' complaint(s) on file</p>' +
        (role === 'buyer' ? '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="new-rfq">Create RFQ</button><button class="btn btn-ghost btn-sm" type="button" data-act="sup-docs">Open in Documents</button></div>' :
          '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="sup-spend">View spend for ' + esc(s.c.toLowerCase()) + '</button></div>') + '</div>';
    }
    function vSup() {
      var L = supFiltered(), sel = sup(selSup), visible = L.some(function (x) { return x.n === selSup; });
      var filtered = supQ.trim() || supCat !== 'All' || supRisk !== 'All';
      var opt = function (arr, val) { return arr.map(function (c) { return '<option' + (c === val ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join(''); };
      var head = '<div class="v-head"><div><h3>Suppliers</h3><p class="vm-muted vm-small" aria-live="polite">' + L.length + ' of ' + SUP.length + ' suppliers shown</p></div>' +
        (role === 'buyer' ? '<button class="btn btn-ghost btn-sm" type="button" data-act="new-sup">+ Request new supplier</button>' : '<span class="vm-ro">' + SDA.icon.lock + 'Read only – changes go through approvals</span>') + '</div>' +
        '<div class="toolbar vm-tools"><label class="vm-field vm-grow"><span class="vm-sr">Search suppliers</span><input type="search" id="vm-sq" placeholder="Search supplier, country or contact" value="' + esc(supQ) + '"></label>' +
        '<label class="vm-field"><span class="vm-sr">Category</span><select id="vm-sc">' + opt(['All'].concat(CATS), supCat).replace('>All<', '>All categories<') + '</select></label>' +
        '<label class="vm-field"><span class="vm-sr">Risk</span><select id="vm-sr">' + opt(['All', 'High', 'Medium', 'Low'], supRisk).replace('>All<', '>All risk levels<') + '</select></label>' +
        (filtered ? '<button class="btn btn-ghost btn-sm" type="button" data-act="clear-f">Clear filters</button>' : '') + '</div>';
      var list;
      if (!L.length) {
        list = '<div class="vm-empty" role="status"><b>No suppliers match' + (supQ.trim() ? ' “' + esc(supQ.trim()) + '”' : ' these filters') + '.</b><span>Check the spelling or clear the filters to see all ' + SUP.length + ' suppliers.</span><button class="btn btn-ghost btn-sm" type="button" data-act="clear-f">Clear filters</button></div>';
      } else {
        list = '<div class="tbl-wrap"><table class="vm-rt"><thead><tr><th>Supplier</th><th>Category</th><th>On-time</th><th>Quality</th><th>Spend / yr</th><th>Risk</th></tr></thead><tbody>' +
          L.map(function (x) {
            var bar = function (v) { return '<div class="meter">' + v + '<i><b style="width:' + v + '%;background:' + (v >= 93 ? 'var(--ok)' : v >= 85 ? 'var(--warn)' : 'var(--bad)') + '"></b></i></div>'; };
            return '<tr data-sup="' + esc(x.n) + '" class="' + (x.n === selSup ? 'sel' : '') + '">' +
              td('Supplier', '<button type="button" class="vm-link" data-sup="' + esc(x.n) + '" aria-pressed="' + (x.n === selSup) + '">' + esc(x.n) + '</button><span class="sub">' + esc(x.co) + (x.status === 'New' ? ' · new' : '') + '</span>') +
              td('Category', esc(x.c)) + td('On-time', bar(x.otd)) + td('Quality', bar(x.q)) + td('Spend / yr', money(x.spend)) + td('Risk', pill(lvlTxt[x.lvl] + ' · ' + x.risk, lvlCls[x.lvl])) + '</tr>';
          }).join('') + '</tbody></table></div>';
      }
      var detail;
      if (!L.length) detail = '<div class="panel vm-placeholder"><b>No supplier selected</b><span>The detail and risk analysis appear when a supplier is in the list.</span></div>';
      else if (!sel || !visible) detail = '<div class="panel vm-placeholder" role="status"><b>Selection hidden by filter</b><span>' + (sel ? esc(sel.n) + ' does not match the current filters, so its details and risk analysis are hidden.' : 'Pick a supplier from the list.') + '</span><div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="clear-f">Clear filters</button><button class="btn btn-ink btn-sm" type="button" data-sup="' + esc(L[0].n) + '">Show ' + esc(L[0].n) + '</button></div></div>';
      else detail = supDetail(sel);
      return head + '<div class="split vm-split">' + list + detail + '</div>';
    }

    // on narrow screens the detail panel sits below the list: bring it into view after a selection
    function showDetail() {
      var d = main.querySelector('.vm-detail');
      if (d && window.innerWidth < 1180 && d.scrollIntoView) d.scrollIntoView({ block: 'start', behavior: SDA.reduce ? 'auto' : 'smooth' });
    }

    /* ------------------------------------------------------------------ RFQs (buyer) */
    function rfqList() {
      return '<div class="v-list"><button type="button" class="v-item new" data-rfq="new">+ New RFQ</button>' + RFQ.map(function (r) {
        return '<button type="button" class="v-item' + (r.id === selRfq ? ' sel' : '') + '" data-rfq="' + r.id + '" aria-pressed="' + (r.id === selRfq) + '"><span class="v-id">' + r.id + ' · ' + r.quotes.length + '/' + r.sup.length + ' quotes</span><b>' + esc(r.item) + '</b>' + pill(r.status, stCls(r.status)) + '</button>';
      }).join('') + '</div>';
    }
    function rfqForm() {
      var d = rfqDraft || {};
      var boxes = SUP.map(function (s) {
        var on = d.sup ? d.sup.indexOf(s.n) > -1 : false;
        return '<label class="chk"><input type="checkbox" value="' + esc(s.n) + '"' + (on ? ' checked' : '') + '> ' + esc(s.n) + ' <small>' + esc(s.c) + '</small></label>';
      }).join('');
      return '<div class="panel"><h3>New RFQ (request for quotation)</h3>' +
        '<div class="row2 vm-gap"><label for="vm-r-item">Item<input id="vm-r-item" value="' + esc(d.item || '') + '" placeholder="e.g. Stainless steel sheets 2 mm"></label>' +
        '<div class="vm-qty"><label for="vm-r-qty">Quantity<input id="vm-r-qty" type="number" min="1" inputmode="numeric" value="' + esc(d.qty || '') + '" placeholder="e.g. 5000"></label><label for="vm-r-unit">Unit<select id="vm-r-unit">' + ['pcs', 'm', 'kg'].map(function (u) { return '<option' + (u === d.unit ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select></label></div></div>' +
        '<label for="vm-r-due" class="vm-gap">Quotes due<input id="vm-r-due" type="date" value="' + (d.due || iso(dt(14))) + '"></label>' +
        '<fieldset class="vm-fs"><legend>Invite suppliers</legend><div class="chks">' + boxes + '</div></fieldset>' +
        '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-ai">' + SDA.icon.spark + 'Draft invitation – AI (simulated)</button></div>' +
        '<label for="vm-r-msg" class="vm-gap">Message to suppliers<textarea id="vm-r-msg" placeholder="Use the AI draft or write your own.">' + esc(d.msg || '') + '</textarea></label>' +
        '<p class="note" id="vm-r-note" role="status"></p>' +
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="rfq-send">Create RFQ and invite (simulated)</button><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-cancel">Cancel</button></div>' +
        '<p class="vm-muted vm-small">Supplier e-mails are simulated, not sent. Sample quotes arrive after a few seconds.</p></div>';
    }
    function compareBlock(r, interactive) {
      var S = scoreRfq(r), w = S.w;
      var rows = S.rows.map(function (x) {
        var tags = (x === S.low ? '<span class="vm-tag">Lowest price</span>' : '') + (x === S.best ? '<span class="vm-tag t-best">Highest score</span>' : '') + (r.award === x.q.s ? '<span class="vm-tag t-ok">Awarded</span>' : '') + (r.pending === x.q.s ? '<span class="vm-tag t-warn">Awaiting approval</span>' : '');
        return '<tr class="' + (x === S.best ? 'vm-best' : '') + '">' +
          td('Supplier', '<b>' + esc(x.q.s) + '</b><span class="sub">' + lvlTxt[x.s.lvl] + ' risk · quality ' + x.s.q + '</span><span class="vm-tags">' + tags + '</span>') +
          td('Total', '<b>' + m$(x.total) + '</b><span class="sub">' + unitP(x.q.price) + ' / ' + esc(r.unit) + '</span>') +
          td('vs. lowest', x.diff === 0 ? '<span class="vm-muted">lowest</span>' : '+' + m$(x.diff) + ' <span class="sub">+' + f1(x.diff / S.minT * 100) + '%</span>') +
          td('Delivery time', x.q.lead + ' days' + (x.leadDiff ? '<span class="sub">+' + x.leadDiff + ' days vs. fastest</span>' : '<span class="sub">fastest</span>')) +
          td('Payment terms', esc(x.q.terms)) +
          td('Score', '<span class="vm-sc"><b class="vm-score">' + f1(x.score) + '</b>' + (interactive && r.status === 'Quotes in' ? '<button class="btn btn-ink btn-sm" type="button" data-award="' + esc(x.q.s) + '" aria-label="Award to ' + esc(x.q.s) + '">Award…</button>' : '') + '</span>') + '</tr>';
      }).join('');
      var other = S.best === S.low ? '' : ' It costs <b>+' + m$(S.best.diff) + '</b> more than the lowest quote from ' + esc(S.low.q.s) + ' (' + m$(S.low.total) + ').';
      var breakdown = '<div class="tbl-wrap"><table class="vm-rt vm-break"><thead><tr><th>Supplier</th>' + CRIT.map(function (c) { return '<th>' + c[1] + ' (' + w[c[0]] + '%)</th>'; }).join('') + '<th>Score</th></tr></thead><tbody>' +
        S.rows.map(function (x) {
          return '<tr>' + td('Supplier', '<b>' + esc(x.q.s) + '</b>') + CRIT.map(function (c) { return td(c[1] + ' (' + w[c[0]] + '%)', '<span class="vm-calc">' + f1(x.sub[c[0]]) + ' × ' + w[c[0]] + '%<b>= ' + f1(x.pts[c[0]]) + '</b></span>'); }).join('') + td('Score', '<b>' + f1(x.score) + '</b>') + '</tr>';
        }).join('') + '</tbody></table></div>';
      return '<div class="vm-cmp">' +
        '<p class="vm-sumline">Lowest total: <b>' + esc(S.low.q.s) + ' ' + m$(S.low.total) + '</b>. Highest score: <b>' + esc(S.best.q.s) + ' ' + f1(S.best.score) + '</b> (' + m$(S.best.total) + ').' + other + '</p>' +
        '<div class="tbl-wrap"><table class="vm-rt vm-qt"><thead><tr><th>Supplier</th><th>Total</th><th>vs. lowest</th><th>Delivery time</th><th>Payment terms</th><th>Score</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="vm-weights"><span class="vm-wl">Score weights</span>' + CRIT.map(function (c) { return '<span class="vm-w"><i style="width:' + w[c[0]] + '%"></i>' + c[1] + ' <b>' + w[c[0]] + '%</b></span>'; }).join('') +
        (interactive && r.status === 'Quotes in' ? '<label class="vm-field vm-wsel"><span>Weighting</span><select id="vm-w">' + Object.keys(WEIGHTS).map(function (k) { return '<option value="' + k + '"' + (k === r.w ? ' selected' : '') + '>' + WEIGHTS[k].name + '</option>'; }).join('') + '</select></label>' : '<span class="vm-muted vm-small">' + w.name + '</span>') + '</div>' +
        '<details class="vm-how"' + (r.howOpen ? ' open' : '') + ' data-rfq-how="' + r.id + '"><summary>How the score is calculated</summary><div class="vm-how-b">' +
        '<ul><li><b>Price</b>: lowest total ÷ this total × 100.</li><li><b>Quality</b>: the supplier\'s quality score from incoming inspections and complaints (0–100).</li><li><b>Delivery</b>: fastest delivery time ÷ this delivery time × 100.</li><li><b>Risk</b>: 100 − supplier risk index (late deliveries, quality gap, price volatility, concentration).</li></ul>' +
        '<p>Each value is multiplied by its weight and the points are added up. Payment terms are compared in their own column and are not part of the score. The score supports the decision; the buyer decides and the manager approves.</p>' + breakdown + '</div></details></div>';
    }
    function rfqDetail(r) {
      var flow = ['Invited', 'Quotes in', 'Awaiting approval', 'Awarded'], at = flow.indexOf(r.status);
      var waiting = r.sup.filter(function (s) { return !r.quotes.some(function (x) { return x.s === s; }); });
      var a = r.apv && apvById(r.apv);
      var state = '';
      if (r.status === 'Awaiting approval') state = '<div class="vm-callout warn" role="status"><b>Waiting for approval</b><span>Award to ' + esc(r.pending) + ' (' + m$(total(r, r.quotes.filter(function (x) { return x.s === r.pending; })[0])) + ') is in Sarah Johnson\'s approval queue. A contract draft is in Documents.</span><div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="as-manager">Switch to Sarah (Manager)</button><button class="btn btn-ghost btn-sm" type="button" data-open-doc="' + r.contract + '">Open contract draft</button></div></div>';
      if (r.status === 'Awarded') state = '<div class="vm-callout ok" role="status"><b>Awarded to ' + esc(r.award) + '</b><span>Approved by ' + esc(a ? a.decidedBy : 'Sarah Johnson') + (a && a.comment ? ': “' + esc(a.comment) + '”' : '') + ' Purchase order prepared; supplier notification simulated, not sent.</span>' + (r.contract ? '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-open-doc="' + r.contract + '" data-in-dms="1">Open contract in Documents</button></div>' : '') + '</div>';
      if (r.status === 'Quotes in' && r.rejected) state = '<div class="vm-callout bad" role="status"><b>Award to ' + esc(r.rejected.sup) + ' was rejected</b><span>Sarah Johnson: “' + esc(r.rejected.comment) + '” Choose again or adjust the RFQ.</span></div>';
      return '<div class="panel"><div class="vm-dh"><div><span class="v-id">' + r.id + ' · created ' + fd(r.created) + '</span><h3>' + esc(r.item) + '</h3><p class="vm-muted">' + r.units.toLocaleString('en-US') + ' ' + r.unit + ' · quotes due ' + fd(r.due) + ' · ' + r.sup.length + ' suppliers invited</p></div>' + pill(r.status, stCls(r.status)) + '</div>' +
        '<div class="v-steps">' + flow.map(function (st, i) { return '<span class="' + (i < at || r.status === 'Awarded' ? 'done' : i === at ? 'cur' : '') + '">' + st + '</span>'; }).join('') + '</div>' + state +
        (waiting.length ? '<p class="note vm-wait" role="status">Waiting for quotes from ' + waiting.map(esc).join(', ') + ' (simulated)…</p>' : '') +
        (r.quotes.length ? '<h4>Quote comparison</h4>' + compareBlock(r, true) : '') +
        (r.quotes.length ? '<h4>Quote documents</h4>' + docBtns(docsFor(function (d) { return d.rfq === r.id && d.folder === 'Quotes'; }), 'Quotes from this RFQ are recorded above.') : '') + '</div>';
    }
    function vRfq() {
      var r = rfq(selRfq);
      return '<div class="v-head"><h3>RFQs (requests for quotation)</h3></div><div class="v-two vm-two">' + rfqList() + '<div>' + (selRfq === 'new' || !r ? rfqForm() : rfqDetail(r)) + '</div></div>';
    }
    function readRfq() {
      return { item: q1('#vm-r-item').value.trim(), qty: q1('#vm-r-qty').value.trim(), unit: q1('#vm-r-unit').value, due: q1('#vm-r-due').value, msg: q1('#vm-r-msg').value,
        sup: Array.prototype.map.call(root.querySelectorAll('.vm-fs input:checked'), function (x) { return x.value; }) };
    }
    function quoteArrival(r) {
      var h = 0; for (var i = 0; i < r.item.length; i++) h = (h * 31 + r.item.charCodeAt(i)) % 997;
      var base = 2 + (h % 40) + (h % 7) / 10;
      r.sup.forEach(function (name, i) {
        ctx.later(1600 + i * 1300, function () {
          var s = sup(name), k = name.length;
          var q = { s: name, price: Math.round(base * (1 + (s.vol - 4) / 100 + (k % 5) / 50) * 100) / 100, lead: 9 + (k * 3) % 20, terms: ['30 days net', '45 days net', '60 days net'][(k + i) % 3] };
          r.quotes.push(q);
          var d = dms.add(quoteDoc('vd-q-' + r.id + '-' + i, r, q, 'Q-' + (7000 + h + i)));
          q.doc = d.id;
          if (r.quotes.length === r.sup.length) r.status = 'Quotes in';
          renderNav();
          if (role === 'buyer' && view.buyer === 'rfq' && selRfq === r.id) render();
          say('Quote from ' + esc(name) + ' received (simulated) and filed in Documents');
        });
      });
    }
    function awardModal(r, supName) {
      var S = scoreRfq(r), x = S.rows.filter(function (y) { return y.q.s === supName; })[0];
      var head = x === S.best ? 'Highest overall score (' + f1(x.score) + ', ' + S.w.name.toLowerCase() + ' weighting)' : 'Chosen despite a lower score (' + f1(x.score) + ' vs. ' + f1(S.best.score) + ' for ' + S.best.q.s + ')';
      var adv = [], tail;
      if (x !== S.low) {
        if (x.s.q > S.low.s.q) adv.push('better quality (' + x.s.q + ' vs. ' + S.low.s.q + ')');
        if (x.q.lead < S.low.q.lead) adv.push((S.low.q.lead - x.q.lead) + ' days faster delivery');
        if (x.s.risk < S.low.s.risk) adv.push('lower supplier risk (' + x.s.risk + ' vs. ' + S.low.s.risk + ')');
        var extra = '+' + m$(x.diff) + ', +' + f1(x.diff / S.minT * 100) + '%';
        tail = adv.length ? (adv.length > 1 ? adv.slice(0, -1).join(', ') + ' and ' + adv[adv.length - 1] : adv[0]) + ' than the lowest quote (' + extra + ')' : 'costs ' + extra + ' more than the lowest quote';
      } else tail = 'lowest total price';
      var sugg = head + ': ' + tail + '.';
      var m = SDA.modal(root, { title: 'Award ' + r.id + ' to ' + supName, html:
        '<div class="vm-modal">' +
        '<dl class="vm-dl"><dt>Item</dt><dd>' + esc(r.item) + ' · ' + r.units.toLocaleString('en-US') + ' ' + r.unit + '</dd><dt>Total</dt><dd><b>' + m$(x.total) + '</b>' + (x.diff ? ' (+' + m$(x.diff) + ' vs. lowest ' + m$(S.minT) + ')' : ' (lowest)') + '</dd>' +
        '<dt>Delivery time</dt><dd>' + x.q.lead + ' days</dd><dt>Payment terms</dt><dd>' + esc(x.q.terms) + '</dd><dt>Score</dt><dd>' + f1(x.score) + ' of 100</dd></dl>' +
        '<label for="vm-just">Justification for the manager<textarea id="vm-just">' + esc(sugg) + '</textarea></label>' +
        '<p class="note" id="vm-just-n" role="status">Suggested from the comparison. Edit it if needed.</p>' +
        '<p class="vm-muted vm-small">Submitting puts the award into Sarah Johnson\'s approval queue and files a contract draft in Documents.</p>' +
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-go>Submit for approval</button><button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button></div></div>' });
      m.body.addEventListener('click', function (e) {
        if (!e.target.closest('[data-go]')) return;
        var just = m.body.querySelector('#vm-just').value.trim();
        if (just.length < 10) { var n = m.body.querySelector('#vm-just-n'); n.className = 'note err'; n.textContent = 'Add a short justification (at least 10 characters).'; m.body.querySelector('#vm-just').focus(); return; }
        submitAward(r, x, just); m.close();
      });
    }
    function submitAward(r, x, just) {
      var id = 'APV-' + (nApv++), docId = 'vd-con-' + r.id + '-' + nApv;
      r.status = 'Awaiting approval'; r.pending = x.q.s; r.apv = id; r.contract = docId; delete r.rejected;
      APV.unshift({ id: id, type: 'Award', title: 'Award ' + r.id + ' ' + r.item + ' to ' + x.q.s, by: 'Lisa Miller', created: dt(0), amount: x.total, status: 'Pending', rfq: r.id, sup: x.q.s, doc: docId, w: r.w, reason: just });
      dms.add({ id: docId, award: true, name: 'Framework contract draft – ' + x.q.s + ' – ' + r.id + '.docx', type: 'docx', folder: 'Framework contracts', sup: x.q.s, rfq: r.id, apv: id, linked: x.q.s + ' · ' + r.id + ' · ' + id,
        owner: 'Lisa Miller', status: 'Pending approval', tags: ['contract', 'draft', r.id], note: 'Draft created from award',
        title: 'Framework contract (draft)', company: 'Vendor Hub · Purchasing', meta: [['Supplier', x.q.s], ['RFQ', r.id], ['Value', m$(x.total)], ['Approval', id]],
        sections: [{ h: 'Commercial terms', rows: [['Item', 'Quantity', 'Unit price', 'Total'], [r.item, r.units.toLocaleString('en-US') + ' ' + r.unit, unitP(x.q.price), m$(x.total)]] },
          { h: 'Delivery and payment', lines: ['Delivery time: ' + x.q.lead + ' days after order', 'Payment terms: ' + x.q.terms, 'Incoterm: DAP main plant', 'Warranty: 12 months'] },
          { h: 'Award justification', p: just },
          { h: 'Approval', p: 'Awaiting approval by Sarah Johnson (Purchasing manager).' }] });
      guide.done('award'); renderNav(); render();
      say('Award submitted for approval. Contract draft filed in Documents.');
    }

    /* ------------------------------------------------------------------ approvals (manager) + requests (buyer) */
    function apvCard(a, canAct) {
      var ctxHtml = '';
      if (a.type === 'Award') {
        var r = rfq(a.rfq);
        ctxHtml = '<h4>Quote comparison</h4>' + compareBlock({ id: r.id, item: r.item, units: r.units, unit: r.unit, quotes: r.quotes, w: a.w || r.w, status: 'view', award: r.award, pending: r.pending, howOpen: r.howOpenA }, false);
      } else if (a.type === 'New supplier') {
        var n = a.newSup;
        ctxHtml = '<dl class="vm-dl"><dt>Supplier</dt><dd>' + esc(n.n) + '</dd><dt>Category</dt><dd>' + esc(n.c) + '</dd><dt>Country</dt><dd>' + esc(n.co) + '</dd><dt>Contact</dt><dd>' + esc(n.contact) + '</dd></dl>';
      }
      var docs = a.doc && docById(a.doc) ? [docById(a.doc)] : [];
      var foot;
      if (a.status === 'Pending' && canAct) {
        foot = '<div class="vm-decide"><label for="vm-c-' + a.id + '">Comment <span class="vm-muted">(optional to approve, required to reject)</span><textarea id="vm-c-' + a.id + '" rows="2" placeholder="e.g. Agreed – please negotiate 45 days payment terms."></textarea></label>' +
          '<p class="note" id="vm-cn-' + a.id + '" role="status"></p>' +
          '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-apv="' + a.id + '" data-d="ok">' + SDA.icon.check + 'Approve</button><button class="btn btn-ghost btn-sm vm-reject" type="button" data-apv="' + a.id + '" data-d="no">Reject</button></div></div>';
      } else if (a.status === 'Pending') {
        foot = '<p class="vm-callout warn"><b>Waiting for Sarah Johnson</b><span>Only the purchasing manager can approve or reject.</span></p>';
      } else {
        foot = '<div class="vm-callout ' + (a.status === 'Approved' ? 'ok' : 'bad') + '"><b>' + a.status + ' by ' + esc(a.decidedBy) + ' · ' + fd(a.decided) + '</b><span>' + (a.comment ? '“' + esc(a.comment) + '”' : 'No comment.') + '</span>' +
          (a.status === 'Approved' && a.type === 'Award' && a.doc ? '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-open-doc="' + a.doc + '" data-in-dms="1">Open contract in Documents</button></div>' : '') + '</div>';
      }
      return '<article class="panel vm-apv" aria-label="' + esc(a.id + ' ' + a.type) + '"><div class="vm-dh"><div><span class="v-id">' + a.id + ' · ' + esc(a.type) + ' · ' + fd(a.created) + '</span><h3>' + esc(a.title) + '</h3><p class="vm-muted">Requested by ' + esc(a.by) + (a.amount ? ' · <b class="vm-ink">' + m$(a.amount) + '</b>' : '') + '</p></div>' + pill(a.status, stCls(a.status)) + '</div>' +
        '<p class="vm-reason"><span>Justification</span>' + esc(a.reason) + '</p>' + ctxHtml +
        (docs.length ? '<h4>Linked document</h4>' + docBtns(docs) : '') + foot + '</article>';
    }
    function vApv() {
      var P = APV.filter(function (a) { return a.status === 'Pending'; }), H = APV.filter(function (a) { return a.status !== 'Pending'; });
      return '<div class="v-head"><div><h3>Approval queue</h3><p class="vm-muted vm-small">' + P.length + ' pending · awards, new suppliers and contracts</p></div></div>' +
        (P.length ? '<div class="apv-list">' + P.map(function (a) { return apvCard(a, true); }).join('') + '</div>' : '<div class="vm-empty"><b>All caught up.</b><span>No approvals waiting.</span></div>') +
        (H.length ? '<h4 class="vm-sub">Decided</h4><div class="apv-list">' + H.map(function (a) { return apvCard(a, false); }).join('') + '</div>' : '');
    }
    function vReq() {
      var L = APV.filter(function (a) { return a.by === 'Lisa Miller'; });
      return '<div class="v-head"><div><h3>My requests</h3><p class="vm-muted vm-small">Awards, new suppliers and contracts you submitted. Sarah Johnson decides.</p></div><button class="btn btn-ghost btn-sm" type="button" data-act="new-sup">+ Request new supplier</button></div>' +
        '<div class="apv-list">' + L.map(function (a) { return apvCard(a, false); }).join('') + '</div>';
    }
    function decide(id, ok, comment, fromDms) {
      var a = apvById(id); if (!a || a.status !== 'Pending') return;
      a.status = ok ? 'Approved' : 'Rejected'; a.comment = comment; a.decidedBy = 'Sarah Johnson'; a.decided = dt(0);
      var doc = a.doc && docById(a.doc), msg;
      if (a.type === 'Award') {
        var r = rfq(a.rfq);
        if (ok) { r.status = 'Awarded'; r.award = a.sup; delete r.pending; committed.push({ sup: a.sup, amount: a.amount, rfq: r.id }); guide.done('approve'); msg = 'Award approved. Purchase order prepared; notification to ' + esc(a.sup) + ' simulated, not sent.'; }
        else { r.status = 'Quotes in'; r.rejected = { sup: a.sup, comment: comment }; delete r.pending; msg = 'Award rejected. Lisa Miller sees your comment (notification simulated, not sent).'; }
      } else if (a.type === 'New supplier') {
        if (ok) { var n = a.newSup; if (!sup(n.n)) { n.status = 'New'; n.ratings = []; SUP.push(n); recalc(); } msg = esc(n.n) + ' approved and added to suppliers as “New”. Welcome e-mail simulated, not sent.'; }
        else msg = 'New supplier rejected. Lisa Miller sees your comment.';
      } else msg = a.type + ' ' + (ok ? 'approved' : 'rejected') + '.';
      if (doc) {
        if (ok) {
          if (!fromDms) { doc.versions.push({ v: doc.version, date: fd(dt(0)), by: 'Sarah Johnson', note: 'Approved' + (comment ? ': ' + comment : '') }); }
          if (/draft/i.test(doc.name)) { doc.version += 1; doc.name = doc.name.replace(' draft – ', ' – '); doc.tags = doc.tags.filter(function (t) { return t !== 'draft'; }); doc.versions.push({ v: doc.version, date: fd(dt(0)), by: 'System', note: 'Final version after approval' }); }
          doc.status = 'Approved'; doc.title = (doc.title || '').replace(/ \(draft\)/, '');
          var sec = doc.sections && doc.sections.filter(function (s) { return s.h === 'Approval'; })[0];
          if (sec) sec.p = 'Approved by Sarah Johnson on ' + fd(dt(0)) + '.' + (comment ? ' Comment: "' + comment + '"' : '');
        } else {
          doc.status = 'Rejected'; doc.versions.push({ v: doc.version, date: fd(dt(0)), by: 'Sarah Johnson', note: 'Rejected: ' + comment });
        }
      }
      dms.render(); renderNav(); render();
      say(msg, ok ? '' : 'warn');
    }

    /* ------------------------------------------------------------------ spend (manager) */
    function vSpend() {
      var tot = 0, hi = 0, cats = {};
      SUP.forEach(function (s) { tot += s.spend; if (s.lvl === 'bad') hi += s.spend; cats[s.c] = cats[s.c] || { spend: 0, hi: 0, n: 0 }; cats[s.c].spend += s.spend; cats[s.c].n++; if (s.lvl === 'bad') cats[s.c].hi += s.spend; });
      var com = committed.reduce(function (t, c) { return t + c.amount; }, 0);
      var pend = APV.filter(function (a) { return a.status === 'Pending'; }).reduce(function (t, a) { return t + a.amount; }, 0);
      var max = 0, rows;
      if (spendMode === 'cat') {
        CATS.forEach(function (c) { if (cats[c] && cats[c].spend > max) max = cats[c].spend; });
        rows = CATS.filter(function (c) { return cats[c]; }).map(function (c) {
          var v = cats[c];
          return '<li><button type="button" class="vm-barrow' + (spendCat === c ? ' on' : '') + '" data-cat="' + esc(c) + '" aria-pressed="' + (spendCat === c) + '"><span class="vm-bl"><b>' + esc(c) + '</b><small>' + v.n + ' suppliers</small></span>' +
            '<span class="vm-bar" aria-hidden="true"><i style="width:' + (v.spend / max * 100) + '%"><em style="width:' + (v.hi / v.spend * 100) + '%"></em></i></span>' +
            '<span class="vm-bv"><b>' + money(v.spend) + '</b><small>' + f1(v.spend / tot * 100) + '% · high risk ' + money(v.hi) + '</small></span></button></li>';
        }).join('');
      } else {
        var L = SUP.slice().sort(function (a, b) { return b.spend - a.spend; }); max = L[0].spend;
        rows = L.map(function (s) {
          return '<li><div class="vm-barrow"><span class="vm-bl"><b>' + esc(s.n) + '</b><small>' + esc(s.c) + '</small></span>' +
            '<span class="vm-bar" aria-hidden="true"><i style="width:' + (max ? s.spend / max * 100 : 0) + '%"><em style="width:' + (s.lvl === 'bad' ? 100 : 0) + '%"></em></i></span>' +
            '<span class="vm-bv"><b>' + money(s.spend) + '</b><small>' + f1(s.spend / tot * 100) + '% · ' + pill(lvlTxt[s.lvl] + ' risk', lvlCls[s.lvl]) + '</small></span></div></li>';
        }).join('');
      }
      var drill = '';
      if (spendMode === 'cat' && spendCat && cats[spendCat]) {
        var D = SUP.filter(function (s) { return s.c === spendCat; }).sort(function (a, b) { return b.spend - a.spend; });
        drill = '<div class="panel vm-drill"><div class="vm-dh"><h3>' + esc(spendCat) + ' · ' + money(cats[spendCat].spend) + '</h3><button class="btn btn-ghost btn-sm" type="button" data-act="cat-sup">Open in Suppliers</button></div>' +
          '<div class="tbl-wrap"><table class="vm-rt"><thead><tr><th>Supplier</th><th>Spend / yr</th><th>Share of category</th><th>Risk</th></tr></thead><tbody>' +
          D.map(function (s) { return '<tr>' + td('Supplier', '<b>' + esc(s.n) + '</b>') + td('Spend / yr', money(s.spend)) + td('Share of category', f1(s.share) + '%') + td('Risk', pill(lvlTxt[s.lvl] + ' · ' + s.risk, lvlCls[s.lvl])) + '</tr>'; }).join('') + '</tbody></table></div></div>';
      }
      return '<div class="v-head"><div><h3>Spend overview</h3><p class="vm-muted vm-small">Annual spend, last 12 months (sample data)</p></div>' +
        '<div class="vm-seg" role="group" aria-label="Group spend by"><button type="button" data-mode="cat" aria-pressed="' + (spendMode === 'cat') + '">By category</button><button type="button" data-mode="sup" aria-pressed="' + (spendMode === 'sup') + '">By supplier</button></div></div>' +
        '<div class="kpi-row vm-kpis"><div class="kpi"><span>Total spend</span><b>' + money(tot) + '</b><small>' + SUP.length + ' suppliers</small></div>' +
        '<div class="kpi"><span>With high-risk suppliers</span><b>' + money(hi) + '</b><small>' + f1(hi / tot * 100) + '% of spend</small></div>' +
        '<div class="kpi"><span>Approved awards</span><b>' + money(com) + '</b><small>' + committed.length + ' this session</small></div>' +
        '<div class="kpi"><span>Waiting for your approval</span><b>' + money(pend) + '</b><small>' + APV.filter(function (a) { return a.status === 'Pending'; }).length + ' requests</small></div></div>' +
        '<div class="panel"><div class="vm-legend"><span><i class="l1"></i>Spend</span><span><i class="l2"></i>Share with high-risk suppliers</span>' + (spendMode === 'cat' ? '<span class="vm-muted">Select a category for details</span>' : '') + '</div><ul class="vm-bars">' + rows + '</ul></div>' + drill;
    }

    /* ------------------------------------------------------------------ complaints + 8D (quality) */
    function cmpAnalyze(text) {
      var cat = /crack|scratch|dent|crush|transit|damag/i.test(text) ? 'Transport damage' : /solder|weld|assembly|bridge|workmanship/i.test(text) ? 'Workmanship' : /dimension|size|toleran|mm\b/i.test(text) ? 'Dimensional' : /label|document|certificate|paper/i.test(text) ? 'Documentation' : /wrong|missing|quantity|short/i.test(text) ? 'Wrong or missing delivery' : 'Material defect';
      var sev = /safety|all parts|100%|recall|line down|critical/i.test(text) ? 'Critical' : /\d+\s?%|several|batch|lot|crack|bridge/i.test(text) ? 'High' : 'Medium';
      return { cat: cat, sev: sev };
    }
    function cmpForm() {
      var d = cmpDraft || {};
      return '<div class="panel"><h3>Log a supplier complaint</h3>' +
        '<div class="row2 vm-gap"><label for="vm-c-sup">Supplier<select id="vm-c-sup">' + SUP.map(function (s) { return '<option' + (s.n === d.s ? ' selected' : '') + '>' + esc(s.n) + '</option>'; }).join('') + '</select></label><label for="vm-c-part">Part or lot<input id="vm-c-part" value="' + esc(d.part || '') + '" placeholder="e.g. Housing A-200, lot 4471"></label></div>' +
        '<label for="vm-c-issue" class="vm-gap">What is wrong?<textarea id="vm-c-issue" placeholder="e.g. 12% of housings have cracks at the mounting point">' + esc(d.issue || '') + '</textarea></label>' +
        '<label for="vm-c-qty" class="vm-gap">Affected quantity<input id="vm-c-qty" value="' + esc(d.qty || '') + '" placeholder="e.g. 240 pcs"></label>' +
        '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="cmp-ai">' + SDA.icon.spark + 'Classify – AI (simulated)</button></div><div class="vm-ai-out"></div><p class="note" id="vm-c-note" role="status"></p>' +
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="cmp-create">Create complaint</button><button class="btn btn-ghost btn-sm" type="button" data-act="cmp-cancel">Cancel</button></div></div>';
    }
    function cmpDetail(c) {
      var steps = D8.map(function (h, i) {
        var st = i < c.at ? 'done' : c.pend && i >= c.at && i < c.pendTo ? 'review' : i === c.at && c.status !== 'Closed' ? 'cur' : '';
        var txt = c.d[i] ? esc(c.d[i]) : st === 'cur' ? (i < 2 ? 'Filled when the 8D is requested.' : i === 7 ? 'Your closure: review and close.' : 'Waiting for the supplier (simulated).') : 'Not started';
        return '<li class="' + st + '"><span class="vm-dn">' + h.slice(0, 2) + '</span><div><b>' + esc(h.slice(3)) + (st === 'review' ? ' <span class="pill p-warn">To review</span>' : '') + '</b><p>' + txt + '</p></div></li>';
      }).join('');
      var act = '';
      if (c.status === 'Open') act = '<button class="btn btn-ink btn-sm" type="button" data-act="8d-req">Request 8D from supplier (simulated, not sent)</button>';
      else if (c.pend) act = '<button class="btn btn-ink btn-sm" type="button" data-act="8d-accept">Accept ' + D8.slice(c.at, c.pendTo).map(function (x) { return x.slice(0, 2); }).join(' + ') + '</button><button class="btn btn-ghost btn-sm" type="button" data-act="8d-return">Return to supplier (simulated)</button>';
      else if (c.at === 2) act = '<button class="btn btn-ghost btn-sm" type="button" data-act="8d-reply">Simulate supplier reply: D3 containment</button>';
      else if (c.at === 3) act = '<button class="btn btn-ghost btn-sm" type="button" data-act="8d-reply">Simulate supplier reply: D4 root cause + D5 actions</button>';
      else if (c.at === 5) act = '<button class="btn btn-ghost btn-sm" type="button" data-act="8d-reply">Simulate supplier reply: D6 verification + D7 prevention</button>';
      else if (c.at === 7) act = '<button class="btn btn-ink btn-sm" type="button" data-act="8d-close">Close 8D (D8) and file the report</button>';
      var docs = docsFor(function (d) { return d.cmp === c.id; });
      return '<div class="panel"><div class="vm-dh"><div><span class="v-id">' + c.id + ' · created ' + fd(c.created) + '</span><h3>' + esc(c.part) + '</h3><p class="vm-muted">' + esc(c.s) + ' · ' + esc(c.qty) + ' affected</p></div>' + pill(c.status, stCls(c.status)) + '</div>' +
        '<p class="vm-issue">' + esc(c.issue) + '</p>' +
        '<div class="ai-box"><div class="ai-h">AI classification (simulated)</div>Category <b>' + esc(c.cat) + '</b> · severity <b>' + esc(c.sev) + '</b>. Suggested containment: block remaining stock of this part and check 100% of the next delivery.</div>' +
        '<h4>8D (eight-step problem solving) · ' + Math.min(c.at, 8) + ' of 8 steps done</h4><ol class="vm-8d">' + steps + '</ol>' +
        (cmpMail[c.id] ? '<div class="vm-mail"><span class="vm-mail-h">E-mail preview · simulated, not sent</span><div class="draft">' + esc(cmpMail[c.id]) + '</div></div>' : '') +
        (act ? '<div class="btn-row">' + act + '</div>' : '') +
        '<h4>Documents</h4>' + docBtns(docs, 'The 8D report is filed here when the complaint is closed.') + '</div>';
    }
    function vCmp() {
      var c = cmp(selCmp);
      var list = '<div class="v-list"><button type="button" class="v-item new" data-cmp="new">+ New complaint</button>' + CMP.map(function (x) {
        return '<button type="button" class="v-item' + (x.id === selCmp ? ' sel' : '') + '" data-cmp="' + x.id + '" aria-pressed="' + (x.id === selCmp) + '"><span class="v-id">' + x.id + ' · ' + esc(x.s) + '</span><b>' + esc(x.part) + '</b>' + pill(x.status + (x.status !== 'Closed' && x.status !== 'Open' ? ' · D' + Math.min(x.at + 1, 8) : ''), stCls(x.status)) + '</button>';
      }).join('') + '</div>';
      return '<div class="v-head"><div><h3>Supplier complaints</h3><p class="vm-muted vm-small">Handled with 8D (eight-step problem solving)</p></div></div><div class="v-two vm-two">' + list + '<div>' + (selCmp === 'new' || !c ? cmpForm() : cmpDetail(c)) + '</div></div>';
    }
    function cmpAction(a) {
      var c = cmp(selCmp); if (!c) return;
      var T = c.texts || D8T[c.cat] || D8T['Material defect'];
      if (a === '8d-req') {
        c.d[0] = 'David Wilson (customer quality), ' + c.s + ' quality lead, ' + c.s + ' production lead.';
        c.d[1] = c.issue + ' Affected: ' + c.qty + ' (' + c.part + ').';
        c.at = 2; c.status = '8D requested';
        cmpMail[c.id] = 'To: ' + sup(c.s).contact + ', ' + c.s + '\nSubject: 8D request – ' + c.id + ' – ' + c.part + '\n\nHello ' + sup(c.s).contact.split(' ')[0] + ',\n\nwe found the following issue: ' + c.issue + ' (' + c.qty + ' affected).\n\nPlease send containment actions (D3) within 24 hours and the root cause analysis (D4) with corrective actions (D5) within 10 days.\n\nThank you,\nDavid Wilson, Supplier quality';
        say('8D request prepared for ' + esc(c.s) + ' (simulated, not sent)');
      } else if (a === '8d-reply') {
        if (c.at === 2) { c.d[2] = T[0]; c.pendTo = 3; }
        else if (c.at === 3) { c.d[3] = T[1]; c.d[4] = T[2]; c.pendTo = 5; }
        else if (c.at === 5) { c.d[5] = T[3]; c.d[6] = T[4]; c.pendTo = 7; }
        c.pend = true; say('Supplier reply received (simulated). Please review.');
      } else if (a === '8d-accept') {
        c.at = c.pendTo; c.pend = false; c.status = '8D in progress'; say('Accepted. Next: ' + D8[c.at]);
      } else if (a === '8d-return') {
        for (var i = c.at; i < c.pendTo; i++) c.d[i] = null;
        c.pend = false; say('Returned to ' + esc(c.s) + ' with your remark (simulated, not sent)', 'warn');
      } else if (a === '8d-close') {
        c.d[7] = 'Closed by David Wilson on ' + fd(dt(0)) + '. Effectiveness confirmed; lesson shared with the supplier team.';
        c.at = 8; c.status = 'Closed';
        var s = sup(c.s); s.q = Math.min(100, s.q + 1); recalc();
        dms.add({ id: 'vd-8d-' + c.id, name: '8D report ' + c.id + ' – ' + c.s + '.pdf', type: 'pdf', folder: '8D reports', sup: c.s, cmp: c.id, linked: c.s + ' · ' + c.id, owner: 'David Wilson', status: 'Approved', tags: ['8D'], note: 'Generated when the 8D was closed',
          title: '8D report ' + c.id, company: 'Vendor Hub · Supplier quality', meta: [['Supplier', c.s], ['Part', c.part], ['Closed', fd(dt(0))]],
          sections: [{ h: '8D steps (eight-step problem solving)', rows: [['Step', 'Result']].concat(D8.map(function (h, i) { return [h, c.d[i] || '']; })) }] });
        say(c.id + ' closed. 8D report filed in Documents; quality score of ' + esc(c.s) + ' updated.');
      }
      renderNav(); render();
    }

    /* ------------------------------------------------------------------ ratings + certificates (quality) */
    function vRat() {
      var L = SUP.filter(function (s) { return ratCls === 'All' || s.cls === ratCls; });
      return '<div class="v-head"><div><h3>Supplier ratings</h3><p class="vm-muted vm-small">Class A: average of quality and on-time ≥ 92 · B: ≥ 85 · C: below 85</p></div>' +
        '<div class="vm-seg" role="group" aria-label="Filter by class">' + ['All', 'A', 'B', 'C'].map(function (k) { return '<button type="button" data-cls="' + k + '" aria-pressed="' + (ratCls === k) + '">' + (k === 'All' ? 'All' : 'Class ' + k) + '</button>'; }).join('') + '</div></div>' +
        (L.length ? '<div class="tbl-wrap"><table class="vm-rt"><thead><tr><th>Supplier</th><th>Quality</th><th>On-time</th><th>Defects (ppm)</th><th>Open complaints</th><th>Certificates</th><th>Class</th><th><span class="vm-sr">Action</span></th></tr></thead><tbody>' +
          L.map(function (s) {
            var oc = CMP.filter(function (c) { return c.s === s.n && c.status !== 'Closed'; }).length;
            var certs = dms.docs().filter(function (d) { return d.sup === s.n && d.cert; });
            var bad = certs.filter(function (d) { return /Expir/.test(d.status); });
            var last = s.ratings.length ? s.ratings[s.ratings.length - 1] : null;
            return '<tr>' + td('Supplier', '<b>' + esc(s.n) + '</b><span class="sub">' + esc(s.c) + (last ? ' · rated ' + fd(last.date) : '') + '</span>') + td('Quality', s.q) + td('On-time', s.otd + '%') + td('Defects (ppm)', s.ppm.toLocaleString('en-US')) +
              td('Open complaints', oc ? '<b class="vm-badtxt">' + oc + '</b>' : '0') +
              td('Certificates', !certs.length ? '<span class="vm-muted">none on file</span>' : bad.length ? pill(bad[0].cert + ' ' + bad[0].status.toLowerCase(), 'p-bad') : pill(certs.length + ' valid', 'p-ok')) +
              td('Class', '<span class="vm-cls c-' + s.cls + '">' + s.cls + '</span>') + td('Action', '<button class="btn btn-ghost btn-sm" type="button" data-rate="' + esc(s.n) + '">Rate</button>') + '</tr>';
          }).join('') + '</tbody></table></div>' : '<div class="vm-empty"><b>No suppliers in class ' + ratCls + '.</b><button class="btn btn-ghost btn-sm" type="button" data-cls="All">Show all</button></div>');
    }
    function rateModal(name) {
      var s = sup(name);
      var m = SDA.modal(root, { title: 'Rate ' + name, html: '<div class="vm-modal"><p class="vm-muted">Quarterly rating. Changes update the class and the risk index used in quote comparisons.</p>' +
        '<div class="row2"><label for="vm-rq">Quality score (0–100)<input id="vm-rq" type="number" min="0" max="100" value="' + s.q + '"></label><label for="vm-ro">On-time delivery (%)<input id="vm-ro" type="number" min="0" max="100" value="' + s.otd + '"></label></div>' +
        '<label for="vm-rc" class="vm-gap">Comment<textarea id="vm-rc" rows="3" placeholder="e.g. Improved after the 8D on lot 22-117."></textarea></label><p class="note" id="vm-rn" role="status"></p>' +
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-go>Save rating</button><button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button></div></div>' });
      m.body.addEventListener('click', function (e) {
        if (!e.target.closest('[data-go]')) return;
        var qv = +m.body.querySelector('#vm-rq').value, ov = +m.body.querySelector('#vm-ro').value;
        if (!(qv >= 0 && qv <= 100 && ov >= 0 && ov <= 100) || m.body.querySelector('#vm-rq').value === '' || m.body.querySelector('#vm-ro').value === '') { var n = m.body.querySelector('#vm-rn'); n.className = 'note err'; n.textContent = 'Enter values between 0 and 100.'; return; }
        var oldCls = s.cls; s.q = Math.round(qv); s.otd = Math.round(ov); s.ratings.push({ date: dt(0), by: 'David Wilson', comment: m.body.querySelector('#vm-rc').value.trim() }); recalc();
        m.close(); renderNav(); render();
        say('Rating saved for ' + esc(name) + ': class ' + s.cls + (oldCls !== s.cls ? ' (was ' + oldCls + ')' : '') + ', risk index ' + s.risk + '.');
      });
    }
    function vCert() {
      var L = dms.docs().filter(function (d) { return d.cert; }).sort(function (a, b) { return a.exp - b.exp; });
      return '<div class="v-head"><div><h3>Certificates</h3><p class="vm-muted vm-small">' + L.length + ' certificates · expiring within 60 days are highlighted</p></div></div>' +
        '<div class="tbl-wrap"><table class="vm-rt"><thead><tr><th>Certificate</th><th>Supplier</th><th>Valid until</th><th>Days left</th><th>Status</th><th><span class="vm-sr">Actions</span></th></tr></thead><tbody>' +
        L.map(function (d) {
          var n = daysLeft(d.exp), hot = /Expir/.test(d.status);
          var acts = '<button class="btn btn-ghost btn-sm" type="button" data-open-doc="' + d.id + '">Open</button>' +
            (hot ? ' <button class="btn btn-ink btn-sm" type="button" data-renew="' + d.id + '">Request renewal (simulated)</button>' : '') +
            (d.renew ? ' <button class="btn btn-ink btn-sm" type="button" data-renewed="' + d.id + '">Record renewed certificate</button>' : '');
          return '<tr class="' + (hot ? 'vm-hot' : '') + '">' + td('Certificate', '<b>' + esc(d.cert) + '</b><span class="sub">v' + d.version + '</span>') + td('Supplier', esc(d.sup)) + td('Valid until', fd(d.exp)) +
            td('Days left', n < 0 ? '<b class="vm-badtxt">' + (-n) + ' days overdue</b>' : n <= 60 ? '<b class="vm-warntxt">' + n + ' days</b>' : n + ' days') +
            td('Status', pill(d.status, /Expir/.test(d.status) ? 'p-bad' : stCls(d.status))) + td('Actions', '<span class="vm-acts">' + acts + '</span>') + '</tr>';
        }).join('') + '</tbody></table></div>';
    }

    /* ------------------------------------------------------------------ modals: new supplier request */
    function newSupModal() {
      var m = SDA.modal(root, { title: 'Request a new supplier', html: '<div class="vm-modal"><p class="vm-muted">The request goes to Sarah Johnson for approval. A self-assessment request to the supplier is simulated, not sent.</p>' +
        '<div class="row2"><label for="vm-ns-n">Company name<input id="vm-ns-n" placeholder="e.g. Pinecrest Plastics"></label><label for="vm-ns-c">Category<select id="vm-ns-c">' + CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="row2 vm-gap"><label for="vm-ns-co">Country<input id="vm-ns-co" placeholder="e.g. United States"></label><label for="vm-ns-p">Contact person<input id="vm-ns-p" placeholder="e.g. Olivia Scott"></label></div>' +
        '<label for="vm-ns-r" class="vm-gap">Why do we need this supplier?<textarea id="vm-ns-r" rows="3" placeholder="e.g. Second source to reduce dependency on one supplier."></textarea></label><p class="note" id="vm-ns-note" role="status"></p>' +
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-go>Submit for approval</button><button class="btn btn-ghost btn-sm" type="button" data-close>Cancel</button></div></div>' });
      m.body.addEventListener('click', function (e) {
        if (!e.target.closest('[data-go]')) return;
        var v = function (id) { return m.body.querySelector(id).value.trim(); }, note = m.body.querySelector('#vm-ns-note');
        if (!v('#vm-ns-n')) { note.className = 'note err'; note.textContent = 'Enter the company name.'; m.body.querySelector('#vm-ns-n').focus(); return; }
        if (sup(v('#vm-ns-n')) || APV.some(function (a) { return a.newSup && a.newSup.n.toLowerCase() === v('#vm-ns-n').toLowerCase(); })) { note.className = 'note err'; note.textContent = 'This supplier already exists or is already requested.'; return; }
        if (!v('#vm-ns-r')) { note.className = 'note err'; note.textContent = 'Add a short reason for the manager.'; m.body.querySelector('#vm-ns-r').focus(); return; }
        var id = 'APV-' + (nApv++), name = v('#vm-ns-n'), docId = 'vd-sa-' + id;
        APV.unshift({ id: id, type: 'New supplier', title: 'Onboard ' + name + ' (' + v('#vm-ns-c').toLowerCase() + ')', by: 'Lisa Miller', created: dt(0), amount: 0, status: 'Pending', doc: docId, reason: v('#vm-ns-r'),
          newSup: { n: name, c: v('#vm-ns-c'), co: v('#vm-ns-co') || 'United States', contact: v('#vm-ns-p') || 'Olivia Scott', otd: 90, q: 88, ppm: 0, spend: 0, vol: 4 } });
        dms.add({ id: docId, name: 'Supplier self-assessment – ' + name + '.xlsx', type: 'xlsx', folder: 'Self-assessments', sup: name, apv: id, linked: name + ' · ' + id, owner: 'Lisa Miller', status: 'Pending from supplier', tags: ['self-assessment', 'onboarding'], note: 'Requested from supplier (simulated, not sent)',
          title: 'Supplier self-assessment (requested)', company: name, meta: [['Requested', fd(dt(0))], ['Approval', id]], sections: [{ h: 'Status', p: 'Self-assessment requested from the supplier. In the demo, nothing is sent.' }] });
        m.close(); renderNav(); render();
        say('Request ' + id + ' submitted to Sarah Johnson. Self-assessment request simulated, not sent.');
      });
    }

    /* ------------------------------------------------------------------ events */
    nav.addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) go(b.dataset.v); });
    nav.addEventListener('keydown', function (e) {
      if (!/Arrow(Up|Down|Left|Right)/.test(e.key)) return;
      var bs = Array.prototype.slice.call(nav.querySelectorAll('[data-v]')), i = bs.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); i = (i + (/Down|Right/.test(e.key) ? 1 : -1) + bs.length) % bs.length;
      go(bs[i].dataset.v); var nb = nav.querySelector('[data-v="' + bs[i].dataset.v + '"]'); if (nb) nb.focus();
    });
    main.addEventListener('input', function (e) {
      if (e.target.id === 'vm-sq') { supQ = e.target.value; var p = e.target.selectionStart; render(); var n = q1('#vm-sq'); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (x) {} } }
    });
    main.addEventListener('change', function (e) {
      var t = e.target;
      if (t.id === 'vm-sc') { supCat = t.value === 'All categories' ? 'All' : t.value; render(); var a = q1('#vm-sc'); if (a) a.focus(); }
      if (t.id === 'vm-sr') { supRisk = t.value === 'All risk levels' ? 'All' : t.value; render(); var b = q1('#vm-sr'); if (b) b.focus(); }
      if (t.id === 'vm-w') { var r = rfq(selRfq); r.w = t.value; render(); var c = q1('#vm-w'); if (c) c.focus(); say('Weighting “' + WEIGHTS[r.w].name + '” applied. Scores recalculated.'); }
    });
    root.addEventListener('toggle', function (e) {
      var t = e.target; if (!t.classList || !t.classList.contains('vm-how')) return;
      var r = rfq(t.dataset.rfqHow); if (!r) return;
      if (t.closest('.vm-apv')) r.howOpenA = t.open; else r.howOpen = t.open;
      if (t.open && role === 'buyer') guide.done('compare');
    }, true);
    main.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t || !main.contains(t)) return;
      var ds = t.dataset, r;
      if (ds.openDoc) { openDoc(ds.openDoc, !!ds.inDms); return; }
      if (ds.sup !== undefined && ds.sup) { selSup = ds.sup; render(); var fb = main.querySelector('.vm-link[data-sup="' + CSS.escape(selSup) + '"]'); if (fb) fb.focus({ preventScroll: true }); showDetail(); return; }
      if (ds.rfq) { selRfq = ds.rfq; if (selRfq === 'new') rfqDraft = null; render(); return; }
      if (ds.cmp) { selCmp = ds.cmp; if (selCmp === 'new') cmpDraft = null; render(); return; }
      if (ds.award) { awardModal(rfq(selRfq), ds.award); return; }
      if (ds.apv) {
        var ta = q1('#vm-c-' + ds.apv), cm = ta ? ta.value.trim() : '';
        if (ds.d === 'no' && !cm) { var n = q1('#vm-cn-' + ds.apv); n.className = 'note err'; n.textContent = 'Add a comment so the requester knows why.'; ta.focus(); return; }
        decide(ds.apv, ds.d === 'ok', cm); return;
      }
      if (ds.mode) { spendMode = ds.mode; render(); return; }
      if (ds.cat) { spendCat = spendCat === ds.cat ? null : ds.cat; render(); var cb = main.querySelector('[data-cat="' + CSS.escape(ds.cat) + '"]'); if (cb) cb.focus(); return; }
      if (ds.cls) { ratCls = ds.cls; render(); return; }
      if (ds.rate) { rateModal(ds.rate); return; }
      if (ds.renew) {
        var d = docById(ds.renew); d.renew = true; d.status = certStatus(d); d.versions.push({ v: d.version, date: fd(dt(0)), by: 'David Wilson', note: 'Renewal requested from supplier (simulated, not sent)' });
        dms.render(); renderNav(); render(); say('Renewal request for ' + esc(d.cert) + ' to ' + esc(d.sup) + ' prepared (simulated, not sent).'); return;
      }
      if (ds.renewed) {
        var d2 = docById(ds.renewed); d2.renew = false; d2.exp = dt(Math.max(daysLeft(d2.exp), 0) + 1095); d2.version += 1; d2.status = certStatus(d2);
        d2.meta = [['Holder', d2.sup], ['Standard', d2.cert], ['Valid until', fd(d2.exp)]];
        d2.sections[2] = { h: 'Validity', rows: [['Issued', 'Valid until', 'Audit cycle'], [fd(dt(0)), fd(d2.exp), 'Annual surveillance audit']] };
        d2.versions.push({ v: d2.version, date: fd(dt(0)), by: 'David Wilson', note: 'Renewed certificate recorded (sample file)' });
        dms.render(); renderNav(); render(); say(esc(d2.cert) + ' for ' + esc(d2.sup) + ' renewed until ' + fd(d2.exp) + '.'); return;
      }
      switch (ds.act) {
        case 'clear-f': supQ = ''; supCat = 'All'; supRisk = 'All'; render(); var sq = q1('#vm-sq'); if (sq) sq.focus(); break;
        case 'new-sup': newSupModal(); break;
        case 'new-rfq':
          var s0 = sup(selSup);
          rfqDraft = { sup: SUP.filter(function (x) { return x.c === s0.c; }).map(function (x) { return x.n; }) };
          selRfq = 'new'; go('rfq'); break;
        case 'sup-docs': go('dms'); dms.setFolder('All'); break;
        case 'sup-spend': spendCat = sup(selSup).c; spendMode = 'cat'; go('spend'); break;
        case 'cat-sup': supCat = spendCat; supQ = ''; supRisk = 'All'; if (sup(selSup).c !== spendCat) selSup = SUP.filter(function (x) { return x.c === spendCat; })[0].n; go('sup'); break;
        case 'as-manager': roles.set('manager'); view.manager = 'apv'; renderNav(); render(); break;
        case 'rfq-cancel': selRfq = RFQ[0].id; rfqDraft = null; render(); break;
        case 'rfq-ai':
          var d3 = readRfq(), note = q1('#vm-r-note');
          if (!d3.item) { note.className = 'note err'; note.textContent = 'Add the item first, so the AI knows what to ask for.'; q1('#vm-r-item').focus(); break; }
          rfqDraft = d3; note.className = 'note'; note.textContent = 'AI draft (simulated) – review before inviting.';
          var msg = 'Dear supplier,\n\nwe invite you to quote for ' + d3.item + (d3.qty ? ' (' + Number(d3.qty).toLocaleString('en-US') + ' ' + d3.unit + ')' : '') + '.\n\nPlease include unit price, delivery time, payment terms and any minimum order quantity. Delivery DAP to our main plant.\n\nQuotes are due by ' + (d3.due ? fd(new Date(d3.due + 'T12:00:00')) : 'the date above') + '.\n\nKind regards,\nLisa Miller, Purchasing';
          q1('#vm-r-msg').value = msg; rfqDraft.msg = msg; q1('#vm-r-msg').focus();
          break;
        case 'rfq-send':
          var d4 = readRfq(), nt = q1('#vm-r-note');
          if (!d4.item) { nt.className = 'note err'; nt.textContent = 'Add the item you need quotes for.'; q1('#vm-r-item').focus(); break; }
          if (!(+d4.qty > 0)) { nt.className = 'note err'; nt.textContent = 'Enter a quantity greater than 0.'; q1('#vm-r-qty').focus(); break; }
          if (!d4.sup.length) { nt.className = 'note err'; nt.textContent = 'Select at least one supplier to invite.'; break; }
          r = { id: 'RFQ-' + (nRfq++), item: d4.item, units: Math.round(+d4.qty), unit: d4.unit, due: d4.due ? new Date(d4.due + 'T12:00:00') : dt(14), created: dt(0), w: 'bal', sup: d4.sup, status: 'Invited', quotes: [] };
          RFQ.unshift(r); selRfq = r.id; rfqDraft = null; renderNav(); render(); quoteArrival(r);
          say(r.id + ' created. Invitations to ' + r.sup.length + ' supplier' + (r.sup.length > 1 ? 's' : '') + ' simulated, not sent.');
          break;
        case 'cmp-cancel': selCmp = CMP[0].id; cmpDraft = null; render(); break;
        case 'cmp-ai':
          var txt = q1('#vm-c-issue').value, cn = q1('#vm-c-note');
          if (!txt.trim()) { cn.className = 'note err'; cn.textContent = 'Describe the problem first.'; q1('#vm-c-issue').focus(); break; }
          var an = cmpAnalyze(txt); cn.textContent = '';
          SDA.typeInto(q1('.vm-ai-out'), '<div class="ai-box"><div class="ai-h">AI classification (simulated)</div>Category <b>' + an.cat + '</b> · severity <b>' + an.sev + '</b>. Suggested containment: block remaining stock and check 100% of the next delivery.</div>');
          break;
        case 'cmp-create':
          var sN = q1('#vm-c-sup').value, part = q1('#vm-c-part').value.trim(), iss = q1('#vm-c-issue').value.trim(), qty = q1('#vm-c-qty').value.trim(), cn2 = q1('#vm-c-note');
          if (!part) { cn2.className = 'note err'; cn2.textContent = 'Add the part or lot number.'; q1('#vm-c-part').focus(); break; }
          if (!iss) { cn2.className = 'note err'; cn2.textContent = 'Describe what is wrong.'; q1('#vm-c-issue').focus(); break; }
          var an2 = cmpAnalyze(iss), nc = { id: 'CMP-' + (nCmp++), s: sN, part: part, issue: iss, qty: qty || '1 lot', cat: an2.cat, sev: an2.sev, status: 'Open', created: dt(0), at: 0, d: [] };
          CMP.unshift(nc); selCmp = nc.id; cmpDraft = null; var sp = sup(sN); sp.q = Math.max(50, sp.q - 2); recalc(); renderNav(); render();
          say(nc.id + ' created. Quality score of ' + esc(sN) + ' lowered to ' + sp.q + '.');
          break;
        default:
          if (/^8d-/.test(ds.act || '')) cmpAction(ds.act);
      }
    });
    main.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      var tr = e.target.closest('tr[data-sup]'); if (tr) { selSup = tr.dataset.sup; render(); showDetail(); }
    });

    renderNav(); render();
  });
})();
