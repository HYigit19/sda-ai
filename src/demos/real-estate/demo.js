/* PropertyDesk – real estate agency demo. All people, properties and companies are fictional sample data.
   Nothing is sent anywhere: e-mails, e-signatures and notifications are simulated; AI steps are simulated. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-realestate', function (root, ctx) {
    var esc = SDA.esc, money = SDA.money, usd = SDA.usd;
    var q = function (s, el) { return (el || root).querySelector(s); };
    var qa = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
    var ico = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (off) { var d = SDA.today(off); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var num = function (n) { return Number(n).toLocaleString('en-US'); };
    var dateTxt = function (s) { return SDA.fmtDate(new Date(s + 'T12:00:00')); };
    var dayTxt = function (s) { return s === iso(0) ? 'Today' : s === iso(1) ? 'Tomorrow' : s === iso(-1) ? 'Yesterday' : dateTxt(s); };
    var stamp = function () { return 'Today, ' + SDA.fmtTime(new Date()); };
    var find = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };
    var initials = function (n) { return String(n || '?').split(' ').map(function (x) { return x.charAt(0); }).join('').slice(0, 2); };
    var toast = function (m, k) { SDA.toast(root, m, k); };
    var AGENCY = 'Northgate Realty';

    var IC = {
      home: ico('<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/>'),
      chart: ico('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
      house: ico('<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>'),
      lead: ico('<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M17 11l2 2 4-4"/>'),
      kanban: ico('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>'),
      cal: ico('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
      pen: ico('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 17c1.5-2 2.5-2 3 0s1.5 1 3-1"/>'),
      task: ico('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
      folder: ico('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
      apv: ico('<path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="4"/>'),
      plus: ico('<path d="M12 5v14M5 12h14"/>'),
      back: ico('<path d="M15 18l-6-6 6-6"/>'),
      pin: ico('<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
      bed: ico('<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>'),
      size: ico('<path d="M4 9V4h5M20 15v5h-5M4 4l7 7M20 20l-7-7"/>'),
      phone: ico('<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
      mail: ico('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
      drag: ico('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
      doc: SDA.icon.doc, check: SDA.icon.check, spark: SDA.icon.spark, upload: SDA.icon.upload, lock: SDA.icon.lock
    };

    /* ---------------- people & roles ---------------- */
    var ME = { agent: 'Chris Walker', office: 'Emma Davis', manager: 'Michael Brown' };
    var AGENTS = ['Chris Walker', 'Lisa Miller', 'James Taylor'];
    var AREA_AGENT = { Brookfield: 'Chris Walker', Westfield: 'Chris Walker', Bayside: 'Lisa Miller', Riverside: 'Lisa Miller', Oakdale: 'James Taylor' };
    var CITIES = ['Brookfield', 'Westfield', 'Bayside', 'Riverside', 'Oakdale'];
    var KINDS = ['House', 'Townhouse', 'Condo', 'Loft'];
    var role = 'agent', view = 'home';
    var ui = { prop: null, tab: 'details', lead: 'L-201', pq: '', ptype: 'All', pstat: 'All', lq: '', lstat: 'Open', vf: 'today', tf: 'mine', dagent: 'All', drag: null };
    var seq = { P: 110, L: 208, D: 307, V: 506, C: 403, T: 640, A: 3 };
    var nid = function (k) { seq[k]++; return k + '-' + seq[k]; };

    /* ---------------- sample data ---------------- */
    var P = [
      { id: 'P-101', addr: '4 Maple Court', city: 'Brookfield', type: 'sale', kind: 'House', price: 685000, sqft: 2140, beds: 4, baths: 3, year: 1998, energy: 'C', status: 'Active', owner: 'David Wilson', agent: 'Chris Walker', listed: -34, hue: 0,
        desc: 'Bright family home on a quiet cul-de-sac with a landscaped backyard, open-plan kitchen and a den that works as a home office. Walking distance to Brookfield Elementary and the park.' },
      { id: 'P-102', addr: 'Apt 12B, 220 Harbor View', city: 'Bayside', type: 'sale', kind: 'Condo', price: 429000, sqft: 1050, beds: 2, baths: 2, year: 2012, energy: 'B', status: 'Active', owner: 'Karen Moore', agent: 'Chris Walker', listed: -19, hue: 180,
        desc: 'Corner unit on the 12th floor with a wraparound balcony and water views. Building with gym, concierge and one garage parking space.' },
      { id: 'P-103', addr: '18 Elm Street', city: 'Westfield', type: 'rent', kind: 'Townhouse', price: 2850, sqft: 1380, beds: 3, baths: 2, year: 2005, energy: 'C', status: 'Active', owner: 'Robert Clark', agent: 'Lisa Miller', listed: -21, hue: 35,
        desc: 'End-of-terrace townhouse with a small patio garden, attached garage and updated kitchen. Pets considered.' },
      { id: 'P-104', addr: '77 Ridge Road', city: 'Oakdale', type: 'sale', kind: 'House', price: 912000, sqft: 3020, beds: 5, baths: 4, year: 2016, energy: 'A', status: 'Reserved', owner: 'Patricia Allen', agent: 'James Taylor', listed: -52, hue: 300,
        desc: 'Modern five-bedroom home on a half-acre lot with valley views, chef’s kitchen, solar panels and a three-car garage.' },
      { id: 'P-105', addr: 'Loft 5, 9 Mill Lane', city: 'Riverside', type: 'rent', kind: 'Loft', price: 2150, sqft: 920, beds: 1, baths: 1, year: 1925, energy: 'D', status: 'Active', owner: 'George Young', agent: 'Chris Walker', listed: -9, hue: 210,
        desc: 'Converted mill loft with 14 ft ceilings, exposed brick and large factory windows. Five minutes to Riverside station.' },
      { id: 'P-106', addr: '31 Cedar Avenue', city: 'Brookfield', type: 'sale', kind: 'House', price: 549000, sqft: 1720, beds: 3, baths: 2, year: 1987, energy: 'C', status: 'Sold', owner: 'Linda Scott', agent: 'Lisa Miller', listed: -80, hue: 60,
        desc: 'Renovated ranch home with new roof, hardwood floors and a fenced backyard.' },
      { id: 'P-107', addr: '250 Lakeshore Drive #4', city: 'Bayside', type: 'sale', kind: 'Condo', price: 375000, sqft: 880, beds: 2, baths: 1, year: 2001, energy: 'C', status: 'Draft', owner: 'Steven Hill', agent: 'Lisa Miller', listed: -1, hue: 150,
        desc: 'Second-floor condo steps from the lake trail, with in-unit laundry and a private storage room.' },
      { id: 'P-108', addr: '6 Willow Way', city: 'Westfield', type: 'rent', kind: 'House', price: 3400, sqft: 1900, beds: 4, baths: 2, year: 1994, energy: 'C', status: 'Active', owner: 'Nancy Adams', agent: 'Lisa Miller', listed: -14, hue: 90,
        desc: 'Detached family house with a large fenced yard, finished basement and double garage. Close to Westfield schools.' },
      { id: 'P-109', addr: '12 Birch Lane', city: 'Westfield', type: 'sale', kind: 'House', price: 719000, sqft: 2380, beds: 4, baths: 3, year: 2008, energy: 'B', status: 'Active', owner: 'Paul Turner', agent: 'James Taylor', listed: -27, hue: 250,
        desc: 'Colonial-style home with a sunroom, home office over the garage and a deep backyard bordering a nature reserve.' }
    ];
    P.forEach(function (p) {
      p.photo = SDA.art('room', p.kind + ' · ' + p.city);
      p.act = [{ when: dateTxt(iso(p.listed)), who: 'Emma Davis', text: 'Listing created' + (p.status === 'Draft' ? ' as draft.' : ' and published to website and portals (simulated).') }];
    });
    find(P, 'P-104').act.push({ when: dateTxt(iso(-20)), who: 'James Taylor', text: 'Offer from Megan Clark accepted by seller. Status set to Reserved.' });
    find(P, 'P-106').act.push({ when: dateTxt(iso(-9)), who: 'Lisa Miller', text: 'Sold to Anna White for $541,000. Commission $16,230.' });

    var LEADS = [
      { id: 'L-201', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '(555) 014-2290', source: 'Website', intent: 'sale', budget: 700000, beds: 3, kind: 'House', areas: ['Brookfield', 'Westfield'], agent: 'Chris Walker', status: 'New', created: iso(0), score: null,
        needs: 'Family of four relocating for work, needs to move within 3 months. Mortgage pre-approved. Wants a garden and a home office.',
        tl: [{ when: 'Today, 08:12 AM', who: 'Website form', text: 'Inquiry received via the contact form on the agency website.' }, { when: 'Today, 08:12 AM', who: 'PropertyDesk', text: 'Routed to Chris Walker (Brookfield / Westfield area). Notification sent (simulated, not sent).' }] },
      { id: 'L-202', name: 'Daniel Harris', email: 'd.harris@example.com', phone: '(555) 018-7731', source: 'Property portal', intent: 'rent', budget: 2400, beds: 1, kind: 'Loft', areas: ['Riverside', 'Bayside'], agent: 'Chris Walker', status: 'Viewing', created: iso(-4), score: 74,
        needs: 'Young professional, wants a modern loft or condo close to the train. Move-in next month.',
        tl: [{ when: dateTxt(iso(-4)), who: 'Property portal', text: 'Inquiry for Loft 5, 9 Mill Lane.' }, { when: dateTxt(iso(-3)), who: 'Chris Walker', text: 'Called back, viewing booked.' }] },
      { id: 'L-203', name: 'Olivia Martin', email: 'olivia.m@example.com', phone: '(555) 012-4410', source: 'Phone', intent: 'sale', budget: 450000, beds: 2, kind: 'Condo', areas: ['Bayside'], agent: 'Chris Walker', status: 'Offer', created: iso(-11), score: 86,
        needs: 'First-time buyer, mortgage pre-approved, wants a water view and parking.',
        tl: [{ when: dateTxt(iso(-11)), who: 'Phone', text: 'Called the office about Harbor View condos.' }, { when: dateTxt(iso(-2)), who: 'Chris Walker', text: 'Viewing done, high interest.' }, { when: dateTxt(iso(-1)), who: 'Chris Walker', text: 'Offer of $415,000 submitted to seller (simulated, not sent).' }] },
      { id: 'L-204', name: 'Kevin Lee', email: 'kevin.lee@example.com', phone: '(555) 016-9022', source: 'Property portal', intent: 'rent', budget: 3500, beds: 4, kind: 'House', areas: ['Westfield'], agent: 'Lisa Miller', status: 'Viewing', created: iso(-6), score: 81,
        needs: 'Family with two kids and a dog, needs a yard. Wants to move before the start of the school term.',
        tl: [{ when: dateTxt(iso(-6)), who: 'Property portal', text: 'Inquiry for 6 Willow Way.' }] },
      { id: 'L-205', name: 'Megan Clark', email: 'megan.clark@example.com', phone: '(555) 019-3384', source: 'Referral', intent: 'sale', budget: 950000, beds: 5, kind: 'House', areas: ['Oakdale'], agent: 'James Taylor', status: 'Offer accepted', created: iso(-30), score: 92,
        needs: 'Referred by a past client. Cash from previous home sale plus mortgage pre-approved. Needs space for a home studio.',
        tl: [{ when: dateTxt(iso(-30)), who: 'Referral', text: 'Introduced by Anna White.' }, { when: dateTxt(iso(-20)), who: 'James Taylor', text: 'Offer of $905,000 accepted by seller.' }] },
      { id: 'L-206', name: 'Ryan Scott', email: 'ryan.scott@example.com', phone: '(555) 011-5567', source: 'Phone', intent: 'sale', budget: 400000, beds: 2, kind: 'Condo', areas: ['Bayside', 'Riverside'], agent: '', status: 'New', created: iso(0), score: null,
        needs: 'Investor looking for a rental unit, cash buyer, can close quickly.',
        tl: [{ when: 'Today, 09:05 AM', who: 'Phone', text: 'Call taken by reception. No agent assigned yet.' }] },
      { id: 'L-207', name: 'Laura Adams', email: 'laura.adams@example.com', phone: '(555) 017-2208', source: 'Property portal', intent: 'rent', budget: 3000, beds: 3, kind: 'Townhouse', areas: ['Westfield'], agent: '', status: 'New', created: iso(0), score: null,
        needs: 'Relocating nurse, 12-month lease from next month, one cat.',
        tl: [{ when: 'Today, 07:48 AM', who: 'Property portal', text: 'Inquiry for 18 Elm Street.' }] },
      { id: 'L-208', name: 'Nicole Baker', email: 'nicole.baker@example.com', phone: '(555) 013-6650', source: 'Website', intent: 'rent', budget: 2900, beds: 3, kind: 'Townhouse', areas: ['Westfield'], agent: 'Lisa Miller', status: 'Viewing', created: iso(-3), score: 69,
        needs: 'Couple working from home, wants a garage and a quiet street.',
        tl: [{ when: dateTxt(iso(-3)), who: 'Website form', text: 'Inquiry for 18 Elm Street.' }] }
    ];

    var DEALS = [
      { id: 'D-301', lead: 'L-204', prop: 'P-108', stage: 'viewing', value: 3400, agent: 'Lisa Miller' },
      { id: 'D-302', lead: 'L-205', prop: 'P-104', stage: 'contract', value: 905000, agent: 'James Taylor', offer: { amount: 905000, deposit: 5, financing: 'Mortgage pre-approved', closing: iso(38), conds: ['Home inspection', 'Financing'], status: 'Accepted' } },
      { id: 'D-303', lead: 'L-203', prop: 'P-102', stage: 'offer', value: 415000, agent: 'Chris Walker', offer: { amount: 415000, deposit: 3, financing: 'Mortgage pre-approved', closing: iso(45), conds: ['Home inspection'], status: 'Submitted' } },
      { id: 'D-304', lead: 'L-202', prop: 'P-105', stage: 'viewing', value: 2150, agent: 'Chris Walker' },
      { id: 'D-305', client: 'Anna White', prop: 'P-106', stage: 'won', value: 541000, agent: 'Lisa Miller' },
      { id: 'D-306', client: 'Thomas Young', prop: 'P-109', stage: 'lost', value: 719000, agent: 'James Taylor', lostReason: 'Financing fell through' },
      { id: 'D-307', lead: 'L-208', prop: 'P-103', stage: 'viewing', value: 2850, agent: 'Lisa Miller' }
    ];

    var VIEWS = [
      { id: 'V-501', prop: 'P-108', deal: 'D-301', date: iso(0), time: '10:30', agent: 'Lisa Miller', status: 'Scheduled' },
      { id: 'V-502', prop: 'P-105', deal: 'D-304', date: iso(0), time: '14:00', agent: 'Chris Walker', status: 'Scheduled' },
      { id: 'V-503', prop: 'P-102', deal: 'D-303', date: iso(-2), time: '11:00', agent: 'Chris Walker', status: 'Done', fb: { interest: 'High', rating: 5, notes: 'Loved the balcony view. Asked about HOA fees and parking.', next: 'Create offer', by: 'Chris Walker' } },
      { id: 'V-504', prop: 'P-104', deal: 'D-302', date: iso(-24), time: '17:00', agent: 'James Taylor', status: 'Done', fb: { interest: 'High', rating: 5, notes: 'Wants to bring an inspector. Studio space in the basement is ideal.', next: 'Create offer', by: 'James Taylor' } },
      { id: 'V-505', prop: 'P-101', client: 'Brian Hall', date: iso(2), time: '11:00', agent: 'Chris Walker', status: 'Scheduled' },
      { id: 'V-506', prop: 'P-103', deal: 'D-307', date: iso(1), time: '09:30', agent: 'Lisa Miller', status: 'Scheduled' }
    ];

    var CONTRACTS = [
      { id: 'C-401', kind: 'Brokerage agreement', prop: 'P-101', party: 'David Wilson', status: 'Signed', created: iso(-40), by: 'Emma Davis' },
      { id: 'C-402', kind: 'Purchase agreement', prop: 'P-104', deal: 'D-302', party: 'Megan Clark', status: 'Sent for signature', created: iso(-3), by: 'Emma Davis' },
      { id: 'C-403', kind: 'Brokerage agreement', prop: 'P-107', party: 'Steven Hill', status: 'Draft', created: iso(-1), by: 'Emma Davis' }
    ];

    var APV = [
      { id: 'A-3', prop: 'P-103', from: 2850, to: 2700, by: 'Emma Davis', when: dateTxt(iso(-1)), status: 'Pending', reason: 'Only 2 inquiries in 21 days. Comparable townhouses in Westfield rent for $2,650–$2,750.' }
    ];

    var TASKS = [];
    function checklist(d) {
      var p = find(P, d.prop), ag = d.agent;
      return p.type === 'sale' ? [
        ['Request buyer ID copy', 'Emma Davis', 1, 'id'],
        ['Order or renew energy certificate', 'Emma Davis', 3, 'energy'],
        ['Prepare purchase agreement', 'Emma Davis', 2, 'contract'],
        ['Confirm mortgage pre-approval letter', ag, 4],
        ['Book notary / closing appointment', 'Emma Davis', 7],
        ['Final walk-through with buyer', ag, 30],
        ['Hand over keys', ag, 38]
      ] : [
        ['Request tenant ID copy', 'Emma Davis', 1, 'id'],
        ['Run credit check (simulated)', 'Emma Davis', 2],
        ['Prepare rental agreement', 'Emma Davis', 2, 'contract'],
        ['Collect security deposit', ag, 7],
        ['Move-in inspection with photos', ag, 10],
        ['Hand over keys', ag, 10]
      ];
    }
    function makeTasks(d, base) {
      checklist(d).forEach(function (c) { TASKS.push({ id: nid('T'), deal: d.id, text: c[0], who: c[1], due: iso((base || 0) + c[2]), kind: c[3] || '', done: false }); });
    }
    makeTasks(find(DEALS, 'D-302'), -20);
    TASKS.filter(function (t) { return t.deal === 'D-302'; }).slice(0, 4).forEach(function (t) { t.done = true; t.doneBy = t.who; });

    /* ---------------- lookups & money ---------------- */
    var prop = function (id) { return find(P, id); };
    var lead = function (id) { return find(LEADS, id); };
    var deal = function (id) { return find(DEALS, id); };
    var client = function (d) { return d.lead ? lead(d.lead).name : d.client; };
    var priceTxt = function (p, v) { return money(v == null ? p.price : v) + (p.type === 'rent' ? '/mo' : ''); };
    var dealWorth = function (d) { return prop(d.prop).type === 'rent' ? d.value * 12 : d.value; };
    var commission = function (d) { return prop(d.prop).type === 'rent' ? d.value : Math.round(d.value * 0.03); };
    var PROB = { 'new': 0.1, viewing: 0.25, offer: 0.5, contract: 0.85, won: 1, lost: 0 };
    var STAGES = [['new', 'New lead'], ['viewing', 'Viewing'], ['offer', 'Offer'], ['contract', 'Contract'], ['won', 'Won'], ['lost', 'Lost']];
    var stageName = function (s) { for (var i = 0; i < STAGES.length; i++) if (STAGES[i][0] === s) return STAGES[i][1]; return s; };
    var isOpen = function (d) { return d.stage !== 'won' && d.stage !== 'lost'; };
    var contractOf = function (d) { var c = CONTRACTS.filter(function (x) { return x.deal === d.id && x.status !== 'Cancelled'; }); return c[c.length - 1] || null; };
    var pendingPrice = function (p) { return APV.filter(function (a) { return a.prop === p.id && a.status === 'Pending'; })[0]; };
    var budgetTxt = function (l) { return money(l.budget) + (l.intent === 'rent' ? '/mo' : ''); };
    var propPill = function (s) { var c = s === 'Active' ? 'p-ok' : s === 'Reserved' ? 'p-warn' : s === 'Draft' ? 'p-info' : 'p-dim'; return '<span class="pill ' + c + '">' + esc(s) + '</span>'; };
    var leadPill = function (s) { var c = /Qualified|accepted|Won/.test(s) ? 'p-ok' : /Lost/.test(s) ? 'p-bad' : /Offer|Contacted/.test(s) ? 'p-warn' : 'p-info'; return '<span class="pill ' + c + '">' + esc(s) + '</span>'; };
    var conPill = function (s) { var c = s === 'Signed' ? 'p-ok' : s === 'Approved' ? 'p-ok' : /Changes/.test(s) ? 'p-bad' : s === 'Draft' ? 'p-info' : 'p-warn'; return '<span class="pill ' + c + '">' + esc(s) + '</span>'; };
    var photo = function (p, cls) { return '<img class="' + (cls || '') + '" src="' + (p.upload || p.photo) + '" alt="Photo of ' + esc(p.addr) + '" style="' + (p.upload ? '' : 'filter:hue-rotate(' + p.hue + 'deg) saturate(1.1)') + '">'; };
    function logProp(p, text, who) { p.act.push({ when: stamp(), who: who || ME[role], text: text }); }
    function logLead(l, text, who) { if (l) l.tl.push({ when: stamp(), who: who || ME[role], text: text }); }

    /* ---------------- AI (simulated): matching & scoring ---------------- */
    function matchesFor(l) {
      return P.filter(function (p) { return p.type === l.intent && p.status === 'Active'; }).map(function (p) {
        var pct = 100, why = [];
        if (p.price > l.budget) { var over = (p.price - l.budget) / l.budget; pct -= Math.round(over * 250); why.push(Math.round(over * 100) + '% over budget'); } else why.push('Within budget');
        if (p.beds < l.beds) { pct -= 18 * (l.beds - p.beds); why.push(p.beds + ' bd (wants ' + l.beds + '+)'); } else why.push(p.beds + ' bedrooms');
        if (l.areas.indexOf(p.city) < 0) { pct -= 20; why.push('outside preferred areas'); } else why.push('in ' + p.city);
        if (l.kind && l.kind !== p.kind) { pct -= 10; why.push(p.kind.toLowerCase() + ', not ' + l.kind.toLowerCase()); }
        return { p: p, pct: Math.max(8, Math.min(99, pct)), why: why };
      }).sort(function (a, b) { return b.pct - a.pct; }).slice(0, 3);
    }
    function scoreOf(l) {
      var m = matchesFor(l), best = m.length ? m[0].pct : 0, s = 28, why = [];
      if (l.budget) { s += 12; why.push('Budget stated: ' + budgetTxt(l)); }
      if (/pre-approved|cash/i.test(l.needs)) { s += 18; why.push('Financing in place (' + (/cash/i.test(l.needs) ? 'cash buyer' : 'mortgage pre-approved') + ')'); }
      if (/month|weeks|asap|term|relocat|quickly|next/i.test(l.needs)) { s += 12; why.push('Clear timeline to move'); }
      if (l.source === 'Referral' || l.source === 'Website') { s += 6; why.push('Direct inquiry via ' + l.source.toLowerCase()); }
      s += Math.round(best / 6); why.push(best ? 'Best listing match ' + best + '%' : 'No active listing matches yet');
      return { score: Math.min(96, s), why: why };
    }
    var heat = function (s) { return s >= 75 ? ['Hot', 'p-ok'] : s >= 55 ? ['Warm', 'p-warn'] : ['Cold', 'p-info']; };

    /* ---------------- documents ---------------- */
    var plink = function (p) { return p.id + ' · ' + p.addr; };
    function exposeDoc(p) {
      return { name: 'Exposé – ' + p.addr + '.pdf', type: 'pdf', folder: 'Exposés', linked: plink(p), owner: 'Emma Davis', status: p.status === 'Draft' ? 'Draft' : 'Published', tags: [p.city, p.type === 'sale' ? 'For sale' : 'For rent'],
        title: 'Exposé: ' + p.addr + ', ' + p.city, company: AGENCY,
        meta: [['Price', priceTxt(p)], ['Size', num(p.sqft) + ' sq ft'], ['Bedrooms', p.beds], ['Agent', p.agent]],
        sections: [{ h: 'About this home', p: p.desc }, { h: 'Key facts', rows: [['Feature', 'Detail'], ['Type', p.kind + ' · ' + (p.type === 'sale' ? 'for sale' : 'for rent')], ['Bathrooms', String(p.baths)], ['Year built', String(p.year)], ['Energy rating', p.energy]] }, { h: 'Viewings', p: 'By appointment with ' + p.agent + ', ' + AGENCY + '. Sample exposé for demonstration.' }] };
    }
    function floorDoc(p) {
      var rows = [['Room', 'Size']], left = p.sqft, r = [['Living room', 0.22], ['Kitchen & dining', 0.16]];
      for (var i = 1; i <= p.beds; i++) r.push(['Bedroom ' + i, i === 1 ? 0.13 : 0.09]);
      for (var j = 1; j <= p.baths; j++) r.push(['Bathroom ' + j, 0.04]);
      r.forEach(function (x) { var v = Math.round(p.sqft * x[1] / 5) * 5; left -= v; rows.push([x[0], num(v) + ' sq ft']); });
      rows.push(['Hallways & storage', num(Math.max(0, left)) + ' sq ft']);
      return { name: 'Floor plan – ' + p.addr + '.pdf', type: 'pdf', folder: 'Floor plans', linked: plink(p), owner: 'Emma Davis', status: 'Valid', title: 'Floor plan: ' + p.addr, company: AGENCY, meta: [['Total', num(p.sqft) + ' sq ft'], ['Levels', p.kind === 'House' ? '2' : '1']], sections: [{ h: 'Room schedule', rows: rows }, { p: 'Measurements are approximate. Sample floor plan for demonstration.' }] };
    }
    function energyDoc(p, valid) {
      return { name: 'Energy certificate – ' + p.addr + '.pdf', type: 'pdf', folder: 'Energy certificates', linked: plink(p), owner: 'Emma Davis', status: valid ? 'Valid' : 'Expired', tags: ['rating ' + p.energy],
        title: 'Energy performance certificate', company: 'Greenline Energy Assessors (fictional)', meta: [['Property', p.addr + ', ' + p.city], ['Rating', p.energy], ['Valid until', valid ? dateTxt(iso(3650)) : dateTxt(iso(-12))]],
        sections: [{ h: 'Result', rows: [['Indicator', 'Value'], ['Energy use', (p.energy === 'A' ? 28 : p.energy === 'B' ? 41 : p.energy === 'C' ? 55 : 72) + ' kBtu / sq ft / yr'], ['Rating', p.energy], ['Heated area', num(p.sqft) + ' sq ft']] }, { p: 'Sample certificate for demonstration only.' }] };
    }
    function idDoc(name, link) {
      return { name: 'ID copy – ' + name + ' (SAMPLE).jpg', type: 'jpg', folder: 'ID copies', linked: link, owner: 'Emma Davis', status: 'Verified', tags: ['sample', 'restricted'], img: SDA.art('portrait', 'SAMPLE ID – ' + name + ' – not a real document') };
    }
    function offerDoc(d) {
      var p = prop(d.prop), o = d.offer, rent = p.type === 'rent';
      return { name: (rent ? 'Rental application' : 'Offer') + ' – ' + p.addr + ' (' + client(d) + ').pdf', type: 'pdf', folder: 'Offers', linked: d.id + ' · ' + p.addr, owner: d.agent, status: o.status, tags: [client(d)],
        title: (rent ? 'Rental application' : 'Offer to purchase') + ': ' + p.addr, company: AGENCY,
        meta: [['Client', client(d)], ['Seller / landlord', p.owner], ['Date', SDA.fmtDate(new Date())]],
        sections: [{ h: 'Terms', rows: [['Item', 'Value'], [rent ? 'Monthly rent' : 'Offer price', priceTxt(p, o.amount)], [rent ? 'Security deposit' : 'Earnest money', rent ? money(o.amount * 1.5) : money(Math.round(o.amount * o.deposit / 100)) + ' (' + o.deposit + '%)'], ['Financing', o.financing], [rent ? 'Move-in date' : 'Closing date', dateTxt(o.closing)]] }, { h: 'Conditions', lines: o.conds.length ? o.conds : ['None'] }] };
    }
    function contractDoc(c) {
      var p = prop(c.prop), d = c.deal ? deal(c.deal) : null, o = d && d.offer, signed = c.status === 'Signed';
      var sig = signed ? 'Signed electronically (simulated) ' + SDA.fmtDate(new Date()) : '—';
      var meta = [['Contract no.', c.id], ['Template', c.kind + ' v3'], ['Status', c.status]];
      var secs;
      if (c.kind === 'Brokerage agreement') {
        secs = [{ h: 'Parties', rows: [['Role', 'Name'], [p.type === 'rent' ? 'Landlord' : 'Seller', p.owner], ['Broker', AGENCY + ' (agent: ' + p.agent + ')']] },
          { h: 'Property', p: p.addr + ', ' + p.city + ' · ' + p.kind + ', ' + num(p.sqft) + ' sq ft, ' + p.beds + ' bedrooms, ' + p.baths + ' bathrooms.' },
          { h: 'Terms', lines: ['Listing price: ' + priceTxt(p), 'Exclusive right to ' + (p.type === 'rent' ? 'let' : 'sell') + ' for 6 months from signing', 'Commission: ' + (p.type === 'rent' ? 'one month’s rent' : '3% of the final sale price') + ', due on ' + (p.type === 'rent' ? 'lease signing' : 'closing'), 'Marketing: photos, exposé, website and property portals'] }];
      } else {
        var rent = c.kind === 'Rental agreement';
        secs = [{ h: 'Parties', rows: [['Role', 'Name'], [rent ? 'Landlord' : 'Seller', p.owner], [rent ? 'Tenant' : 'Buyer', c.party], ['Broker', AGENCY + ' (agent: ' + d.agent + ')']] },
          { h: 'Property', p: p.addr + ', ' + p.city + ' · ' + p.kind + ', ' + num(p.sqft) + ' sq ft, ' + p.beds + ' bedrooms, ' + p.baths + ' bathrooms.' },
          { h: rent ? 'Rent and deposit' : 'Purchase price and payment', lines: rent ? ['Monthly rent: ' + money(o.amount), 'Security deposit: ' + money(o.amount * 1.5), 'Term: 12 months from ' + dateTxt(o.closing)] : ['Purchase price: ' + money(o.amount), 'Earnest money: ' + money(Math.round(o.amount * o.deposit / 100)) + ' (' + o.deposit + '%) within 3 business days', 'Financing: ' + o.financing, 'Closing date: ' + dateTxt(o.closing)] },
          { h: 'Conditions', lines: o.conds.length ? o.conds.map(function (x) { return x + ' contingency'; }) : ['No contingencies'] },
          { h: 'Commission', p: rent ? 'Broker fee of one month’s rent (' + money(o.amount) + ') payable by the landlord.' : 'Broker commission of 3% (' + money(Math.round(o.amount * 0.03)) + ') payable by the seller at closing.' }];
      }
      secs.push({ h: 'Signatures', rows: [['Party', 'Signature'], [c.kind === 'Brokerage agreement' ? (p.type === 'rent' ? 'Landlord' : 'Seller') : (c.kind === 'Rental agreement' ? 'Landlord' : 'Seller'), sig], [c.kind === 'Brokerage agreement' ? 'Broker' : (c.kind === 'Rental agreement' ? 'Tenant' : 'Buyer'), sig]] });
      secs.push({ p: 'Generated from template with property and client data. Sample template for demonstration, not legal advice.' });
      return { title: c.kind, company: AGENCY, meta: meta, sections: secs };
    }
    function contractFileDoc(c) {
      var p = prop(c.prop);
      return Object.assign({ name: c.kind + ' – ' + p.addr + ' (' + c.party + ').docx', type: 'docx', folder: 'Contracts', linked: (c.deal ? c.deal + ' · ' : '') + plink(p), owner: c.by || 'Emma Davis', status: c.status, tags: [c.party], contract: c.id }, contractDoc(c));
    }

    var DOCS = [];
    P.forEach(function (p) { if (p.status !== 'Draft') DOCS.push(exposeDoc(p)); });
    ['P-101', 'P-102', 'P-104', 'P-108', 'P-109'].forEach(function (id) { DOCS.push(floorDoc(prop(id))); });
    DOCS.push(energyDoc(prop('P-101'), false));
    ['P-102', 'P-103', 'P-104', 'P-105', 'P-108', 'P-109'].forEach(function (id) { DOCS.push(energyDoc(prop(id), true)); });
    ['P-101', 'P-104', 'P-108'].forEach(function (id) { var p = prop(id); DOCS.push({ name: p.addr + ' – living room.jpg', type: 'jpg', folder: 'Photos', linked: plink(p), owner: p.agent, status: 'Published', img: p.photo }); });
    DOCS.push(idDoc('Megan Clark', 'D-302 · Megan Clark'));
    DOCS.push(offerDoc(deal('D-303')));
    DOCS.push(offerDoc(deal('D-302')));
    DOCS[DOCS.length - 1].status = 'Accepted';

    var ready = false;
    var dmsEl = document.createElement('div');
    dmsEl.className = 're-dms';
    var dms = SDA.dms(dmsEl, {
      root: root, title: 'Documents', docs: DOCS, role: role,
      folders: ['Exposés', 'Floor plans', 'Photos', 'Energy certificates', 'Offers', 'Contracts', 'ID copies'],
      canUpload: function (r) { return r !== 'manager'; },
      canApprove: function (r) { return r === 'manager'; },
      filter: function (d, r) { return r !== 'agent' || d.folder !== 'ID copies'; },
      userName: function (r) { return ME[r]; },
      uploadFolder: 'Photos', uploadStatus: 'Draft',
      onChange: function (docs, d, act) {
        if (!ready) return;
        if (act === 'approve' && d && d.contract) { var c = find(CONTRACTS, d.contract); if (c && c.status === 'Draft') { c.status = 'Approved'; d.status = 'Approved'; toast('Contract ' + c.id + ' approved. Back office can send it for signature.'); } }
        if (view !== 'dms') render(); else paintNav();
      }
    });
    CONTRACTS.forEach(function (c) { var d = dms.add(contractFileDoc(c)); c.doc = d.id; });
    var docById = function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; };
    var docsFor = function (key) { return dms.docs().filter(function (d) { return (d.linked || '').indexOf(key) > -1 && (role !== 'agent' || d.folder !== 'ID copies'); }); };

    /* ---------------- shell: roles, guide, nav ---------------- */
    var nav = q('.re-nav'), main = q('.re-main');
    var guide = SDA.guide(q('.re-guide'), {
      title: 'From inquiry to signed contract', demoId: 'demo-realestate',
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=real-estate', text: 'Talk to us about your version' },
      steps: [
        { id: 'qualify', text: 'As <b>Chris</b>, open lead Sarah Johnson, run the AI score and mark her qualified' },
        { id: 'match', text: 'Add her best-matching property to the pipeline' },
        { id: 'viewing', text: 'Schedule a viewing, then log the viewing feedback' },
        { id: 'contract', text: 'Create the offer, record the seller’s acceptance, then as <b>Emma</b> generate the purchase agreement' },
        { id: 'signed', text: 'As <b>Michael</b>, approve the contract, then send it and record the signatures' }
      ]
    });
    var roles = SDA.roles(q('.re-roles'), {
      title: 'View as', value: role,
      roles: [
        { id: 'agent', label: 'Agent', person: 'Chris Walker', icon: IC.pin, sub: 'Field view: your leads, today’s viewings, feedback and offers. Works on a phone.' },
        { id: 'office', label: 'Back office', person: 'Emma Davis', icon: IC.folder, sub: 'Listings data, lead assignment, contracts, tasks and documents.' },
        { id: 'manager', label: 'Owner / Manager', person: 'Michael Brown', icon: IC.chart, sub: 'Pipeline value, commission forecast, team performance and approvals.' }
      ],
      onChange: function (r) { role = r; view = 'home'; ui.prop = null; ui.tf = r === 'manager' ? 'all' : 'mine'; ui.dagent = 'All'; if (r === 'agent' && lead(ui.lead) && lead(ui.lead).agent !== ME.agent) ui.lead = 'L-201'; dms.setRole(r); render(true); }
    });

    var NAV = {
      agent: [['home', 'Today', IC.home], ['leads', 'My leads', IC.lead], ['deals', 'Pipeline', IC.kanban], ['views', 'Viewings', IC.cal], ['props', 'Listings', IC.house], ['tasks', 'Tasks', IC.task], ['dms', 'Documents', IC.folder]],
      office: [['home', 'Inbox', IC.home], ['props', 'Listings', IC.house], ['leads', 'Leads', IC.lead], ['views', 'Viewings', IC.cal], ['contracts', 'Contracts', IC.pen], ['tasks', 'Tasks', IC.task], ['deals', 'Pipeline', IC.kanban], ['dms', 'Documents', IC.folder]],
      manager: [['home', 'Overview', IC.chart], ['apv', 'Approvals', IC.apv], ['deals', 'Pipeline', IC.kanban], ['contracts', 'Contracts', IC.pen], ['leads', 'Leads', IC.lead], ['props', 'Listings', IC.house], ['tasks', 'Tasks', IC.task], ['dms', 'Documents', IC.folder]]
    };
    function counts() {
      var me = ME[role];
      return {
        leads: role === 'agent' ? LEADS.filter(function (l) { return l.agent === me && l.status === 'New'; }).length : role === 'office' ? LEADS.filter(function (l) { return !l.agent && l.status !== 'Lost'; }).length : 0,
        views: role === 'agent' ? VIEWS.filter(function (v) { return v.agent === me && v.date === iso(0) && v.status === 'Scheduled'; }).length : 0,
        apv: APV.filter(function (a) { return a.status === 'Pending'; }).length + CONTRACTS.filter(function (c) { return c.status === 'Draft'; }).length,
        contracts: role === 'manager' ? CONTRACTS.filter(function (c) { return c.status === 'Draft'; }).length : role === 'office' ? CONTRACTS.filter(function (c) { return c.status === 'Approved' || /Changes/.test(c.status); }).length + DEALS.filter(function (d) { return d.stage === 'contract' && !contractOf(d); }).length : 0,
        tasks: TASKS.filter(function (t) { return !t.done && t.who === me; }).length
      };
    }
    function paintNav() {
      var c = counts();
      nav.innerHTML = NAV[role].map(function (n) {
        var k = c[n[0]];
        return '<button type="button" data-a="nav" data-v="' + n[0] + '"' + (view === n[0] ? ' aria-current="page"' : '') + '>' + n[2] + '<span>' + n[1] + '</span>' + (k ? '<i class="cnt" aria-label="' + k + ' open">' + k + '</i>' : '') + '</button>';
      }).join('');
    }
    function go(v) { view = v; if (v === 'props') ui.prop = null; render(true); }

    /* ---------------- small UI helpers ---------------- */
    var head = function (t, sub, acts) { return '<div class="v-head re-head"><div><h3>' + t + '</h3>' + (sub ? '<p class="re-sub">' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="re-acts">' + acts + '</div>' : '') + '</div>'; };
    var btn = function (a, label, cls, data) { return '<button type="button" class="btn btn-sm ' + (cls || 'btn-ghost') + '" data-a="' + a + '"' + (data || '') + '>' + label + '</button>'; };
    var kpis = function (arr) { return '<div class="kpi-row re-kpis">' + arr.map(function (k) { return '<div class="kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>'; }).join('') + '</div>'; };
    var sel = function (f, opts, val, label, extra) { return '<label class="re-sel"><span class="re-sr">' + label + '</span><select data-f="' + f + '"' + (extra || '') + '>' + opts.map(function (o) { var v = typeof o === 'string' ? o : o[0], t = typeof o === 'string' ? o : o[1]; return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>'; };
    var timeline = function (arr) { return '<ol class="re-tl">' + arr.slice().reverse().map(function (e) { return '<li><b>' + esc(e.text) + '</b><small>' + esc(e.when) + ' · ' + esc(e.who) + '</small></li>'; }).join('') + '</ol>'; };
    var empty = function (t) { return '<div class="sda-empty">' + t + '</div>'; };
    var hint = function (t) { return '<div class="re-hint" role="note">' + IC.spark + '<span>' + t + '</span></div>'; };
    var myDeals = function () { return DEALS.filter(function (d) { return role !== 'agent' || d.agent === ME.agent; }); };
    var canMove = function (d) { return role === 'manager' || (role === 'agent' && d.agent === ME.agent); };
    var slots = (function () { var s = []; for (var h = 9; h <= 18; h++) { s.push(pad(h) + ':00'); if (h < 18) s.push(pad(h) + ':30'); } return s; })();

    /* ================= VIEWS ================= */
    function viewCard(v, big) {
      var p = prop(v.prop), d = v.deal ? deal(v.deal) : null, who = d ? client(d) : v.client;
      var mine = v.agent === ME.agent && role === 'agent';
      var acts = '';
      if (v.status === 'Scheduled' && (mine || role === 'office')) acts += btn('feedback', 'Log feedback', 'btn-ink', ' data-id="' + v.id + '"');
      if (v.status === 'Scheduled' && mine) acts += btn('route', IC.pin + 'Directions', '', ' data-id="' + v.id + '"');
      if (v.status === 'Scheduled' && (mine || role === 'office')) acts += btn('cancel-view', 'Cancel', '', ' data-id="' + v.id + '"');
      if (d && v.status === 'Done' && d.stage === 'viewing' && canMove(d)) acts += btn('offer', 'Create offer', 'btn-ink', ' data-deal="' + d.id + '"');
      acts += btn('open-prop', 'Listing', '', ' data-id="' + p.id + '"');
      return '<article class="re-view' + (big ? ' big' : '') + '"><div class="re-view-t"><b>' + v.time + '</b><small>' + dayTxt(v.date) + '</small></div>' +
        '<div class="re-view-b"><div class="re-view-h"><b>' + esc(p.addr) + '</b>' + (v.status === 'Done' ? '<span class="pill p-ok">Feedback logged</span>' : v.status === 'Cancelled' ? '<span class="pill p-bad">Cancelled</span>' : '<span class="pill p-info">Scheduled</span>') + '</div>' +
        '<small>' + esc(p.city) + ' · with ' + esc(who) + ' · ' + esc(v.agent) + '</small>' +
        (v.fb ? '<p class="re-fb"><span class="pill ' + (v.fb.interest === 'High' ? 'p-ok' : v.fb.interest === 'Medium' ? 'p-warn' : 'p-bad') + '">' + v.fb.interest + ' interest</span> ' + esc(v.fb.notes) + ' <i>Next: ' + esc(v.fb.next) + '</i></p>' : '') +
        '<div class="re-row">' + acts + '</div></div></article>';
    }

    function vHome() {
      var me = ME[role];
      if (role === 'agent') {
        var today = VIEWS.filter(function (v) { return v.agent === me && v.date === iso(0) && v.status !== 'Cancelled'; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
        var myLeads = LEADS.filter(function (l) { return l.agent === me && /New|Contacted|Qualified/.test(l.status); });
        var open = DEALS.filter(function (d) { return d.agent === me && isOpen(d); });
        var fc = open.reduce(function (s, d) { return s + commission(d) * PROB[d.stage]; }, 0);
        var stuck = open.filter(function (d) { return d.stage === 'contract'; });
        return head('Good morning, Chris', SDA.fmtDate(new Date()) + ' · ' + today.filter(function (v) { return v.status === 'Scheduled'; }).length + ' viewings left today', btn('sched', IC.plus + 'Schedule viewing', 'btn-ink')) +
          kpis([['New leads', myLeads.filter(function (l) { return l.status === 'New'; }).length, 'assigned to you'], ['Viewings today', today.length, 'on your calendar'], ['Open offers', open.filter(function (d) { return d.stage === 'offer'; }).length, 'waiting for sellers'], ['Commission forecast', usd(fc), 'weighted by stage']]) +
          '<div class="re-grid2"><section class="panel"><h4 class="re-h4">Today’s viewings</h4><div class="re-stack">' + (today.length ? today.map(function (v) { return viewCard(v, true); }).join('') : empty('No viewings today.')) + '</div></section>' +
          '<section class="panel"><h4 class="re-h4">Leads needing action</h4><div class="re-stack">' + (myLeads.length ? myLeads.map(function (l) {
            return '<button type="button" class="re-li" data-a="open-lead" data-id="' + l.id + '"><span class="re-av">' + initials(l.name) + '</span><span class="re-li-b"><b>' + esc(l.name) + '</b><small>' + esc(l.source) + ' · ' + (l.intent === 'rent' ? 'rent' : 'buy') + ' up to ' + budgetTxt(l) + '</small></span>' + leadPill(l.status) + '</button>';
          }).join('') : empty('All leads are handled.')) + '</div>' +
          (stuck.length ? '<h4 class="re-h4">Deals in contract</h4><div class="re-stack">' + stuck.map(function (d) { var c = contractOf(d); return '<button type="button" class="re-li" data-a="open-deal" data-id="' + d.id + '"><span class="re-av">' + initials(client(d)) + '</span><span class="re-li-b"><b>' + esc(client(d)) + '</b><small>' + esc(prop(d.prop).addr) + '</small></span>' + (c ? conPill(c.status) : '<span class="pill p-warn">Contract with back office</span>') + '</button>'; }).join('') + '</div>' : '') + '</section></div>';
      }
      if (role === 'office') {
        var un = LEADS.filter(function (l) { return !l.agent && l.status !== 'Lost'; });
        var toGen = DEALS.filter(function (d) { return d.stage === 'contract' && !contractOf(d); });
        var cons = CONTRACTS.filter(function (c) { return c.status !== 'Signed'; });
        var myT = TASKS.filter(function (t) { return t.who === me && !t.done; });
        var drafts = P.filter(function (p) { return p.status === 'Draft'; });
        return head('Inbox', 'Everything that needs back-office work today', btn('new-lead', IC.plus + 'New inquiry') + btn('new-prop', IC.plus + 'New listing', 'btn-ink')) +
          kpis([['Unassigned leads', un.length, 'from portals, website, phone'], ['Contracts to prepare', toGen.length, 'offers accepted'], ['Contracts in progress', cons.length, 'draft to signature'], ['My open tasks', myT.length, 'across all deals']]) +
          '<div class="re-grid2"><section class="panel"><h4 class="re-h4">Unassigned inquiries</h4><div class="re-stack">' + (un.length ? un.map(function (l) {
            var sug = AREA_AGENT[l.areas[0]] || AGENTS[0];
            return '<div class="re-assign"><div class="re-li-b"><b>' + esc(l.name) + '</b><small>' + esc(l.source) + ' · ' + (l.intent === 'rent' ? 'Rent' : 'Buy') + ' · ' + esc(l.areas.join(', ')) + ' · ' + budgetTxt(l) + '</small><small class="re-ai-t">' + IC.spark + 'AI (simulated) suggests ' + esc(sug) + ' (covers ' + esc(l.areas[0]) + ')</small></div>' +
              '<div class="re-row">' + sel('assign', [['', 'Assign to…']].concat(AGENTS), '', 'Assign ' + l.name + ' to agent', ' data-id="' + l.id + '"') + btn('assign-sug', 'Assign ' + sug.split(' ')[0], 'btn-ink', ' data-id="' + l.id + '" data-who="' + esc(sug) + '"') + '</div></div>';
          }).join('') : empty('All inquiries are assigned.')) + '</div></section>' +
          '<section class="panel"><h4 class="re-h4">Contracts</h4><div class="re-stack">' +
          toGen.map(function (d) { return '<div class="re-li static"><span class="re-av">' + initials(client(d)) + '</span><span class="re-li-b"><b>' + esc(client(d)) + ' · ' + esc(prop(d.prop).addr) + '</b><small>Offer accepted · ' + priceTxt(prop(d.prop), d.offer.amount) + '</small></span>' + btn('gen', 'Generate contract', 'btn-ink', ' data-deal="' + d.id + '"') + '</div>'; }).join('') +
          cons.map(function (c) { return '<button type="button" class="re-li" data-a="go-contracts"><span class="re-av">' + IC.pen + '</span><span class="re-li-b"><b>' + esc(c.kind) + '</b><small>' + esc(c.party) + ' · ' + esc(prop(c.prop).addr) + '</small></span>' + conPill(c.status) + '</button>'; }).join('') +
          (drafts.length ? '<h4 class="re-h4">Draft listings</h4>' + drafts.map(function (p) { return '<button type="button" class="re-li" data-a="open-prop" data-id="' + p.id + '"><span class="re-av">' + IC.house + '</span><span class="re-li-b"><b>' + esc(p.addr) + '</b><small>' + priceTxt(p) + ' · owner ' + esc(p.owner) + '</small></span>' + propPill(p.status) + '</button>'; }).join('') : '') +
          '</div></section></div>';
      }
      // manager
      var open2 = DEALS.filter(isOpen);
      var pv = open2.reduce(function (s, d) { return s + dealWorth(d); }, 0);
      var wf = open2.reduce(function (s, d) { return s + commission(d) * PROB[d.stage]; }, 0);
      var won = DEALS.filter(function (d) { return d.stage === 'won'; });
      var wc = won.reduce(function (s, d) { return s + commission(d); }, 0);
      var pend = counts().apv;
      var byStage = STAGES.slice(0, 4).map(function (s) { var ds = open2.filter(function (d) { return d.stage === s[0]; }); return [s[1], ds.length, ds.reduce(function (a, d) { return a + dealWorth(d); }, 0), ds.reduce(function (a, d) { return a + commission(d) * PROB[d.stage]; }, 0)]; });
      var maxV = Math.max.apply(null, byStage.map(function (x) { return x[2]; }).concat([1]));
      var team = AGENTS.map(function (a) {
        var ds = DEALS.filter(function (d) { return d.agent === a; });
        var o = ds.filter(isOpen), w = ds.filter(function (d) { return d.stage === 'won'; }), l = ds.filter(function (d) { return d.stage === 'lost'; });
        return { a: a, open: o.length, fc: o.reduce(function (s, d) { return s + commission(d) * PROB[d.stage]; }, 0), won: w.length, wc: w.reduce(function (s, d) { return s + commission(d); }, 0), conv: w.length + l.length ? Math.round(w.length / (w.length + l.length) * 100) : null, views: VIEWS.filter(function (v) { return v.agent === a && v.status !== 'Cancelled'; }).length, leads: LEADS.filter(function (x) { return x.agent === a; }).length };
      });
      var maxF = Math.max.apply(null, team.map(function (t) { return t.fc + t.wc; }).concat([1]));
      return head('Overview', 'Northgate Realty · this month', pend ? btn('nav', 'Review ' + pend + ' approval' + (pend > 1 ? 's' : ''), 'btn-ink', ' data-v="apv"') : '') +
        kpis([['Pipeline value', usd(pv), open2.length + ' open deals (rent annualized)'], ['Commission forecast', usd(wf), 'weighted by stage'], ['Commission closed', usd(wc), won.length + ' deal' + (won.length === 1 ? '' : 's') + ' won'], ['Pending approvals', pend, 'price changes and contracts']]) +
        '<div class="re-grid2"><section class="panel"><h4 class="re-h4">Pipeline by stage</h4><div class="re-bars">' + byStage.map(function (s) {
          return '<div class="re-bar"><span class="re-bar-l">' + s[0] + ' <small>' + s[1] + '</small></span><span class="re-bar-t"><i style="width:' + Math.max(2, Math.round(s[2] / maxV * 100)) + '%"></i></span><span class="re-bar-v">' + usd(s[2]) + '<small>' + usd(s[3]) + ' fc.</small></span></div>';
        }).join('') + '</div><p class="re-sub">Forecast = commission × stage probability (New 10%, Viewing 25%, Offer 50%, Contract 85%).</p></section>' +
        '<section class="panel"><h4 class="re-h4">Team performance</h4><div class="re-team">' + team.map(function (t) {
          return '<div class="re-tm"><span class="re-av">' + initials(t.a) + '</span><div class="re-tm-b"><div class="re-tm-h"><b>' + esc(t.a) + '</b><span>' + usd(t.wc) + ' closed · ' + usd(t.fc) + ' forecast</span></div>' +
            '<span class="re-bar-t"><i style="width:' + Math.round(t.wc / maxF * 100) + '%"></i><i class="fc" style="width:' + Math.round(t.fc / maxF * 100) + '%"></i></span>' +
            '<small>' + t.leads + ' leads · ' + t.views + ' viewings · ' + t.open + ' open deals · ' + (t.conv == null ? 'no closed deals yet' : t.conv + '% win rate') + '</small></div></div>';
        }).join('') + '<p class="re-legend"><i></i>Closed <i class="fc"></i>Forecast</p></div></section></div>';
    }

    /* ---- approvals (manager) ---- */
    function vApv() {
      var pr = APV.filter(function (a) { return a.status === 'Pending'; }), cons = CONTRACTS.filter(function (c) { return c.status === 'Draft'; });
      var done = APV.filter(function (a) { return a.status !== 'Pending'; });
      return head('Approvals', 'Price changes and contracts need your sign-off before they go out.') +
        '<div class="re-stack">' + (pr.length + cons.length ? '' : empty('Nothing waiting for approval.')) +
        pr.map(function (a) {
          var p = prop(a.prop), diff = (a.to - a.from) / a.from * 100;
          return '<article class="panel re-apv"><div class="re-apv-h"><div><span class="v-id">' + a.id + ' · Price change · requested by ' + esc(a.by) + ' · ' + esc(a.when) + '</span><h3>' + esc(p.addr) + ', ' + esc(p.city) + '</h3></div><span class="pill p-warn">Pending</span></div>' +
            '<div class="re-price-ch"><s>' + priceTxt(p, a.from) + '</s><span aria-hidden="true">→</span><b>' + priceTxt(p, a.to) + '</b><span class="pill ' + (diff < 0 ? 'p-bad' : 'p-ok') + '">' + (diff > 0 ? '+' : '') + diff.toFixed(1) + '%</span></div>' +
            '<p class="re-sub">Reason: ' + esc(a.reason) + '</p>' +
            '<div class="ai-box"><div class="ai-h">AI (simulated) market check</div>' + (diff < 0 ? 'New price is in line with comparable ' + p.kind.toLowerCase() + 's in ' + p.city + '. Expected effect: more inquiries within 1–2 weeks. Commission impact: ' + money(Math.round(p.type === 'rent' ? a.to - a.from : (a.to - a.from) * 0.03)) + '.' : 'New price is above comparable listings. Expect fewer inquiries.') + '</div>' +
            '<div class="re-row">' + btn('apv-price', IC.check + 'Approve', 'btn-ink', ' data-id="' + a.id + '" data-ok="1"') + btn('apv-price', 'Reject', '', ' data-id="' + a.id + '"') + btn('open-prop', 'Open listing', '', ' data-id="' + p.id + '"') + '</div></article>';
        }).join('') +
        cons.map(function (c) { return contractCard(c); }).join('') +
        (done.length ? '<h4 class="re-h4">Decided</h4>' + done.map(function (a) { var p = prop(a.prop); return '<div class="re-li static"><span class="re-av">' + IC.apv + '</span><span class="re-li-b"><b>' + esc(p.addr) + ': ' + priceTxt(p, a.from) + ' → ' + priceTxt(p, a.to) + '</b><small>' + esc(a.status) + ' by Michael Brown</small></span><span class="pill ' + (a.status === 'Approved' ? 'p-ok' : 'p-bad') + '">' + a.status + '</span></div>'; }).join('') : '') +
        '</div>';
    }

    /* ---- listings ---- */
    function vProps() {
      var L = P.filter(function (p) {
        return (ui.ptype === 'All' || (ui.ptype === 'For sale') === (p.type === 'sale')) && (ui.pstat === 'All' || p.status === ui.pstat || (ui.pstat === 'Sold' && p.status === 'Rented')) &&
          (p.addr + ' ' + p.city + ' ' + p.id + ' ' + p.owner + ' ' + p.kind).toLowerCase().indexOf(ui.pq.toLowerCase()) > -1;
      });
      return head('Listings', P.filter(function (p) { return p.status === 'Active'; }).length + ' active · ' + P.length + ' total', role === 'office' ? btn('new-prop', IC.plus + 'New listing', 'btn-ink') : '') +
        '<div class="toolbar re-tb"><label class="re-search"><span class="re-sr">Search listings</span><input type="search" data-f="pq" placeholder="Search address, city, owner" value="' + esc(ui.pq) + '"></label>' +
        sel('ptype', ['All', 'For sale', 'For rent'], ui.ptype, 'Type') + sel('pstat', ['All', 'Draft', 'Active', 'Reserved', 'Sold'], ui.pstat, 'Status') + '</div>' +
        (L.length ? '<div class="re-cards">' + L.map(function (p) {
          var pp = pendingPrice(p);
          return '<button type="button" class="re-card" data-a="open-prop" data-id="' + p.id + '"><span class="re-ph">' + photo(p) + propPill(p.status) + '</span><span class="re-card-b"><b class="re-price">' + priceTxt(p) + (pp ? ' <span class="pill p-warn">Price change pending</span>' : '') + '</b><span class="re-addr">' + esc(p.addr) + ', ' + esc(p.city) + '</span><span class="re-facts">' + p.beds + ' bd · ' + p.baths + ' ba · ' + num(p.sqft) + ' sq ft</span><span class="re-tag">' + (p.type === 'sale' ? 'For sale' : 'For rent') + ' · ' + p.kind + ' · ' + esc(p.agent) + '</span></span></button>';
        }).join('') + '</div>' : empty('No listings match. Clear the search or set filters to All.'));
    }
    function vProp() {
      var p = prop(ui.prop), pp = pendingPrice(p);
      var acts = '';
      if (role === 'office' || role === 'manager') acts += btn('edit-prop', 'Edit listing', 'btn-ink', ' data-id="' + p.id + '"');
      if (role === 'office' && p.status === 'Draft') acts += btn('publish', 'Publish listing', '', ' data-id="' + p.id + '"');
      if (role === 'office') acts += btn('expose', IC.spark + 'Generate exposé', '', ' data-id="' + p.id + '"');
      if (role !== 'manager' && p.status === 'Active') acts += btn('sched', IC.cal + 'Schedule viewing', role === 'agent' ? 'btn-ink' : '', ' data-prop="' + p.id + '"');
      if (role === 'agent') acts += btn('send-expose', IC.mail + 'Send exposé', '', ' data-id="' + p.id + '"');
      var tabs = [['details', 'Details'], ['documents', 'Documents'], ['viewings', 'Viewings'], ['activity', 'Activity']];
      var body = '';
      if (ui.tab === 'details') {
        var matchN = LEADS.filter(function (l) { return l.status !== 'Lost' && l.intent === p.type && matchesFor(l).some(function (m) { return m.p.id === p.id && m.pct >= 70; }); });
        body = '<p>' + esc(p.desc) + '</p><dl class="re-dl"><dt>Listing ID</dt><dd>' + p.id + '</dd><dt>Type</dt><dd>' + p.kind + ', ' + (p.type === 'sale' ? 'for sale' : 'for rent') + '</dd><dt>Size</dt><dd>' + num(p.sqft) + ' sq ft</dd><dt>Bedrooms / baths</dt><dd>' + p.beds + ' / ' + p.baths + '</dd><dt>Year built</dt><dd>' + p.year + '</dd><dt>Energy rating</dt><dd>' + p.energy + '</dd><dt>' + (p.type === 'sale' ? 'Seller' : 'Owner') + '</dt><dd>' + esc(p.owner) + '</dd><dt>Agent</dt><dd>' + esc(p.agent) + '</dd><dt>Listed</dt><dd>' + dateTxt(iso(p.listed)) + '</dd>' + (p.type === 'sale' ? '<dt>Price per sq ft</dt><dd>' + money(Math.round(p.price / p.sqft)) + '</dd>' : '') + '</dl>' +
          '<div class="ai-box"><div class="ai-h">AI (simulated) lead match</div>' + (matchN.length ? '<b>' + matchN.length + '</b> open lead' + (matchN.length > 1 ? 's match' : ' matches') + ' this listing at 70% or more: ' + matchN.map(function (l) { return esc(l.name); }).join(', ') + '.' : 'No open lead matches this listing yet. It will be suggested as soon as a matching inquiry arrives.') + '</div>';
      } else if (ui.tab === 'documents') {
        var ds = docsFor(p.id);
        body = (ds.length ? '<div class="re-stack">' + ds.map(docBtn).join('') + '</div>' : empty('No documents yet.')) +
          (role !== 'manager' ? '<label class="re-upl-doc btn btn-ghost btn-sm">' + IC.upload + 'Upload document to this listing<input type="file" data-f="propdoc" class="re-file"></label><p class="re-sub">Files stay in your browser.</p>' : '');
      } else if (ui.tab === 'viewings') {
        var vs = VIEWS.filter(function (v) { return v.prop === p.id && (role !== 'agent' || v.agent === ME.agent); });
        body = vs.length ? '<div class="re-stack">' + vs.map(function (v) { return viewCard(v); }).join('') + '</div>' : empty('No viewings for this listing' + (role === 'agent' ? ' on your calendar' : '') + '.');
      } else body = timeline(p.act);
      return '<button type="button" class="re-back" data-a="back">' + IC.back + 'All listings</button>' +
        '<div class="re-pd"><div class="re-pd-ph">' + photo(p) + (role === 'office' ? '<label class="re-upl">' + IC.upload + 'Change photo<input type="file" accept="image/*" data-f="photo" class="re-file"></label>' : '') + '</div>' +
        '<div class="panel re-pd-s"><div class="re-apv-h"><span class="v-id">' + p.id + ' · ' + (p.type === 'sale' ? 'For sale' : 'For rent') + '</span>' + propPill(p.status) + '</div>' +
        '<b class="re-price big">' + priceTxt(p) + '</b><h3>' + esc(p.addr) + '</h3><p class="re-sub">' + esc(p.city) + '</p>' +
        '<div class="re-chips"><span>' + IC.bed + p.beds + ' bd · ' + p.baths + ' ba</span><span>' + IC.size + num(p.sqft) + ' sq ft</span><span>' + IC.house + p.kind + '</span></div>' +
        (pp ? '<div class="re-hint warn">' + IC.lock + '<span>Price change to <b>' + priceTxt(p, pp.to) + '</b> requested by ' + esc(pp.by) + ', waiting for manager approval.</span></div>' + (role === 'manager' ? '<div class="re-row">' + btn('apv-price', IC.check + 'Approve price', 'btn-ink', ' data-id="' + pp.id + '" data-ok="1"') + btn('apv-price', 'Reject', '', ' data-id="' + pp.id + '"') + '</div>' : '') : '') +
        '<div class="re-row">' + acts + '</div></div></div>' +
        '<div class="re-tabs" role="tablist" aria-label="Listing sections">' + tabs.map(function (t) { return '<button type="button" role="tab" data-a="tab" data-tab="' + t[0] + '" aria-selected="' + (ui.tab === t[0]) + '">' + t[1] + (t[0] === 'documents' ? ' <small>' + docsFor(p.id).length + '</small>' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="panel re-tabp" role="tabpanel">' + body + '</div>';
    }
    function docBtn(d) { return '<button type="button" class="re-li" data-a="doc" data-id="' + d.id + '"><span class="re-av doc">' + (d.type === 'jpg' ? SDA.icon.img : IC.doc) + '</span><span class="re-li-b"><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + ' · v' + d.version + '</small></span><span class="pill ' + (/draft|pending|submitted|sent/i.test(d.status) ? 'p-warn' : /expired|changes/i.test(d.status) ? 'p-bad' : 'p-ok') + '">' + esc(d.status) + '</span></button>'; }

    /* ---- leads ---- */
    function visibleLeads() { return LEADS.filter(function (l) { return role !== 'agent' || l.agent === ME.agent; }); }
    function vLeads() {
      var all = visibleLeads();
      var L = all.filter(function (l) {
        var st = ui.lstat === 'All' || (ui.lstat === 'Open' ? !/Won|Lost/.test(l.status) : ui.lstat === 'Unassigned' ? !l.agent : l.status === ui.lstat);
        return st && (l.name + ' ' + l.source + ' ' + l.areas.join(' ') + ' ' + l.id).toLowerCase().indexOf(ui.lq.toLowerCase()) > -1;
      });
      if (!lead(ui.lead) || all.indexOf(lead(ui.lead)) < 0) ui.lead = all[0] ? all[0].id : null;
      var l = lead(ui.lead);
      var list = L.length ? L.map(function (x) {
        return '<button type="button" class="v-item re-lead' + (x.id === ui.lead ? ' sel' : '') + '" data-a="open-lead" data-id="' + x.id + '"' + (x.id === ui.lead ? ' aria-current="true"' : '') + '><span class="re-lead-h"><b>' + esc(x.name) + '</b>' + (x.score != null ? '<span class="re-score s' + heat(x.score)[1] + '">' + x.score + '</span>' : '') + '</span><span class="v-id">' + esc(x.source) + ' · ' + (x.intent === 'rent' ? 'Rent' : 'Buy') + ' · ' + budgetTxt(x) + '</span><span class="re-row tight">' + leadPill(x.status) + (x.agent ? '<small>' + esc(x.agent) + '</small>' : '<span class="pill p-bad">Unassigned</span>') + '</span></button>';
      }).join('') : empty('No leads match.');
      var statOpts = ['Open', 'All', 'New', 'Qualified', 'Viewing', 'Offer', 'Won', 'Lost'].concat(role === 'agent' ? [] : ['Unassigned']);
      return head(role === 'agent' ? 'My leads' : 'Leads', all.length + ' leads · portals, website, phone and referrals', role !== 'agent' ? btn('new-lead', IC.plus + 'New inquiry', 'btn-ink') : '') +
        '<div class="toolbar re-tb"><label class="re-search"><span class="re-sr">Search leads</span><input type="search" data-f="lq" placeholder="Search name, area, source" value="' + esc(ui.lq) + '"></label>' + sel('lstat', statOpts, ui.lstat, 'Status') + '</div>' +
        '<div class="re-split"><div class="re-llist">' + list + '</div><div>' + (l ? leadDetail(l) : empty('Select a lead.')) + '</div></div>';
    }
    function leadDetail(l) {
      var mine = role === 'agent' ? l.agent === ME.agent : role === 'office';
      var deals = DEALS.filter(function (d) { return d.lead === l.id; });
      var ai = '';
      if (l.score == null) {
        ai = '<div class="ai-box re-ai" aria-live="polite"><div class="ai-h">AI (simulated) lead score & matching</div><p>Scores the inquiry on budget, financing, timeline and source, and finds the best-matching active listings.</p>' + (mine || role === 'manager' ? '<div class="re-row">' + btn('score', IC.spark + 'Score and match', 'btn-ink', ' data-id="' + l.id + '"') + '</div>' : '') + '</div>';
      } else {
        var sc = scoreOf(l), h = heat(l.score), ms = matchesFor(l);
        ai = '<div class="ai-box re-ai"><div class="ai-h">AI (simulated) lead score</div><div class="re-scorebox"><span class="re-ring" style="--v:' + l.score + '"><b>' + l.score + '</b></span><div><span class="pill ' + h[1] + '">' + h[0] + ' lead</span><ul>' + sc.why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></div></div>' +
          '<h4 class="re-h4">Best-matching properties</h4><div class="re-stack">' + (ms.length ? ms.map(function (m) {
            var inPipe = deals.filter(function (d) { return d.prop === m.p.id; })[0];
            return '<div class="re-match"><span class="re-match-ph">' + photo(m.p) + '</span><div class="re-li-b"><b>' + esc(m.p.addr) + ', ' + esc(m.p.city) + '</b><small>' + priceTxt(m.p) + ' · ' + m.p.beds + ' bd · ' + num(m.p.sqft) + ' sq ft</small><small>' + esc(m.why.join(' · ')) + '</small></div><span class="re-pct" aria-label="Match ' + m.pct + ' percent">' + m.pct + '%</span>' +
              '<div class="re-row tight">' + (inPipe ? '<button type="button" class="btn btn-sm btn-ghost" data-a="open-deal" data-id="' + inPipe.id + '">In pipeline · ' + stageName(inPipe.stage) + '</button>' : (mine && !/Won|Lost/.test(l.status) ? btn('to-pipe', IC.plus + 'Add to pipeline', 'btn-ink', ' data-id="' + l.id + '" data-prop="' + m.p.id + '"') : '')) + btn('open-prop', 'View', '', ' data-id="' + m.p.id + '"') + '</div></div>';
          }).join('') : empty('No active listing of this type yet.')) + '</div></div>';
      }
      var acts = '';
      if (mine && /New|Contacted/.test(l.status)) acts += btn('qualify', IC.check + 'Mark as qualified', l.score != null ? 'btn-ink' : '', ' data-id="' + l.id + '"' + (l.score == null ? ' disabled title="Run the AI score first"' : ''));
      if (mine && l.status === 'New') acts += btn('contacted', IC.phone + 'Log call', '', ' data-id="' + l.id + '"');
      if (mine && !/Won|Lost/.test(l.status)) acts += btn('lead-lost', 'Mark lost', '', ' data-id="' + l.id + '"');
      return '<div class="panel re-ld"><div class="re-apv-h"><div><span class="v-id">' + l.id + ' · received ' + dayTxt(l.created) + '</span><h3>' + esc(l.name) + '</h3></div>' + leadPill(l.status) + '</div>' +
        '<div class="re-contact"><span>' + IC.mail + esc(l.email) + '</span><span>' + IC.phone + esc(l.phone) + '</span></div>' +
        '<dl class="re-dl"><dt>Source</dt><dd>' + esc(l.source) + '</dd><dt>Looking to</dt><dd>' + (l.intent === 'rent' ? 'Rent' : 'Buy') + (l.kind ? ' · ' + l.kind : '') + '</dd><dt>Budget</dt><dd>' + budgetTxt(l) + '</dd><dt>Bedrooms</dt><dd>' + l.beds + '+</dd><dt>Areas</dt><dd>' + esc(l.areas.join(', ')) + '</dd><dt>Agent</dt><dd>' +
        (role !== 'agent' ? sel('assign', [['', 'Unassigned']].concat(AGENTS), l.agent, 'Assigned agent', ' data-id="' + l.id + '"') : esc(l.agent)) + '</dd></dl>' +
        '<p class="re-needs">“' + esc(l.needs) + '”</p>' + ai +
        (acts ? '<div class="re-row">' + acts + '</div>' : '') +
        (deals.length ? '<h4 class="re-h4">Deals</h4><div class="re-stack">' + deals.map(function (d) { return '<button type="button" class="re-li" data-a="open-deal" data-id="' + d.id + '"><span class="re-av">' + IC.kanban + '</span><span class="re-li-b"><b>' + esc(prop(d.prop).addr) + '</b><small>' + d.id + ' · ' + priceTxt(prop(d.prop), d.value) + '</small></span><span class="pill p-info">' + stageName(d.stage) + '</span></button>'; }).join('') + '</div>' : '') +
        '<h4 class="re-h4">Timeline</h4>' + (role !== 'manager' ? '<div class="re-note"><label><span class="re-sr">Add a note</span><input type="text" class="re-note-in" placeholder="Add a note, e.g. prefers evening calls" maxlength="160"></label>' + btn('note', 'Add note', '', ' data-id="' + l.id + '"') + '</div>' : '') + timeline(l.tl) + '</div>';
    }

    /* ---- pipeline ---- */
    function dealCard(d) {
      var p = prop(d.prop), mv = canMove(d), c = contractOf(d), a = '';
      if (isOpen(d)) {
        if (d.stage === 'new' && (mv || role === 'office')) a += btn('sched', 'Schedule viewing', 'btn-ink', ' data-deal="' + d.id + '"');
        if (d.stage === 'viewing' && mv) a += btn('offer', 'Create offer', 'btn-ink', ' data-deal="' + d.id + '"');
        if (d.stage === 'offer' && mv && d.offer && d.offer.status === 'Submitted') a += btn('accept', 'Seller accepted', 'btn-ink', ' data-deal="' + d.id + '"') + btn('decline', 'Declined', '', ' data-deal="' + d.id + '"');
        if (d.stage === 'contract') a += c ? '<button type="button" class="btn btn-sm btn-ghost" data-a="doc" data-id="' + c.doc + '">' + IC.pen + c.status + '</button>' : role === 'office' ? btn('gen', 'Generate contract', 'btn-ink', ' data-deal="' + d.id + '"') : '<small class="re-wait">Back office prepares contract</small>';
        if (d.stage === 'contract' && c && c.status === 'Signed' && mv) a += btn('won', 'Close as won', 'btn-ink', ' data-deal="' + d.id + '"');
      }
      var done = TASKS.filter(function (t) { return t.deal === d.id; }), dn = done.filter(function (t) { return t.done; }).length;
      return '<article class="re-deal' + (mv && isOpen(d) ? ' mv' : '') + '" data-deal="' + d.id + '"' + (mv && isOpen(d) ? ' draggable="true"' : '') + '>' +
        '<div class="re-deal-h">' + (mv && isOpen(d) ? '<span class="re-grip" aria-hidden="true">' + IC.drag + '</span>' : '') + '<button type="button" class="re-deal-n" data-a="open-deal" data-id="' + d.id + '"><b>' + esc(client(d)) + '</b><small>' + esc(p.addr) + '</small></button><span class="re-av sm" title="' + esc(d.agent) + '">' + initials(d.agent) + '</span></div>' +
        '<div class="re-deal-m"><b>' + priceTxt(p, d.value) + '</b><small>comm. ' + money(commission(d)) + '</small></div>' +
        (d.offer && d.stage === 'offer' ? '<small class="re-wait">Offer ' + d.offer.status.toLowerCase() + '</small>' : '') +
        (done.length ? '<span class="re-prog" title="Tasks"><i style="width:' + Math.round(dn / done.length * 100) + '%"></i></span><small class="re-wait">' + dn + '/' + done.length + ' tasks</small>' : '') +
        (d.stage === 'lost' ? '<small class="re-wait">' + esc(d.lostReason || '') + '</small>' : '') +
        (a ? '<div class="re-row tight">' + a + '</div>' : '') + '</article>';
    }
    function vDeals() {
      var L = myDeals().filter(function (d) { return ui.dagent === 'All' || d.agent === ui.dagent; });
      var open = L.filter(isOpen);
      var col = function (st, label, cls) {
        var ds = L.filter(function (d) { return d.stage === st; });
        return '<section class="re-col ' + (cls || '') + '" aria-label="' + label + '"><h4>' + label + ' <span>' + ds.length + (ds.length ? ' · ' + usd(ds.reduce(function (s, d) { return s + dealWorth(d); }, 0)) : '') + '</span></h4><div class="re-drop" data-stage="' + st + '">' + (ds.map(dealCard).join('') || '<p class="re-drop-e">Drop a deal here</p>') + '</div></section>';
      };
      return head('Pipeline', usd(open.reduce(function (s, d) { return s + dealWorth(d); }, 0)) + ' open · commission forecast ' + usd(open.reduce(function (s, d) { return s + commission(d) * PROB[d.stage]; }, 0)) + (role === 'office' ? ' · read only for back office' : ' · drag cards or use the buttons'),
        role !== 'agent' ? sel('dagent', ['All'].concat(AGENTS), ui.dagent, 'Filter by agent') : '') +
        '<div class="re-kan">' + col('new', 'New lead') + col('viewing', 'Viewing') + col('offer', 'Offer') + col('contract', 'Contract') +
        '<div class="re-col-pair">' + col('won', 'Closed · won', 'won') + col('lost', 'Closed · lost', 'lost') + '</div></div>';
    }

    /* ---- viewings ---- */
    function vViews() {
      var all = VIEWS.filter(function (v) { return role !== 'agent' || v.agent === ME.agent; });
      var f = ui.vf, t = iso(0);
      var L = all.filter(function (v) { return f === 'all' || (f === 'today' ? v.date === t : f === 'upcoming' ? v.date > t : v.date < t); }).sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? (f === 'past' ? 1 : -1) : (f === 'past' ? -1 : 1); });
      var groups = {}, order = [];
      L.forEach(function (v) { if (!groups[v.date]) { groups[v.date] = []; order.push(v.date); } groups[v.date].push(v); });
      return head(role === 'agent' ? 'My viewings' : 'Viewings', all.filter(function (v) { return v.status === 'Scheduled'; }).length + ' scheduled', role !== 'manager' ? btn('sched', IC.plus + 'Schedule viewing', 'btn-ink') : '') +
        '<div class="re-seg" role="group" aria-label="Show viewings">' + [['today', 'Today'], ['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All']].map(function (x) { return '<button type="button" data-a="vf" data-v="' + x[0] + '" aria-pressed="' + (f === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        (order.length ? order.map(function (d) { return '<h4 class="re-h4">' + dayTxt(d) + (d === t ? ' · ' + dateTxt(d) : '') + '</h4><div class="re-stack">' + groups[d].map(function (v) { return viewCard(v, role === 'agent'); }).join('') + '</div>'; }).join('') : empty('No viewings in this view.'));
    }

    /* ---- contracts ---- */
    var CFLOW = ['Draft', 'Approved', 'Sent for signature', 'Signed'];
    function contractCard(c) {
      var p = prop(c.prop), at = CFLOW.indexOf(c.status), a = '';
      if (role === 'manager' && c.status === 'Draft') a += btn('c-approve', IC.check + 'Approve', 'btn-ink', ' data-id="' + c.id + '"') + btn('c-changes', 'Request changes', '', ' data-id="' + c.id + '"');
      if (role === 'office' && /Changes/.test(c.status)) a += btn('c-resubmit', 'Revise and resubmit', 'btn-ink', ' data-id="' + c.id + '"');
      if (role !== 'agent' && c.status === 'Approved') a += btn('c-send', IC.mail + 'Send for signature', 'btn-ink', ' data-id="' + c.id + '"');
      if (role !== 'agent' && c.status === 'Sent for signature') a += btn('c-sign', IC.pen + 'Record signatures', 'btn-ink', ' data-id="' + c.id + '"');
      a += btn('doc', IC.doc + 'Open document', '', ' data-id="' + c.doc + '"');
      return '<article class="panel re-con"><div class="re-apv-h"><div><span class="v-id">' + c.id + ' · created ' + dayTxt(c.created) + ' by ' + esc(c.by || 'Emma Davis') + '</span><h3>' + esc(c.kind) + '</h3><p class="re-sub">' + esc(c.party) + ' · ' + esc(p.addr) + ', ' + esc(p.city) + (c.deal ? ' · ' + priceTxt(p, deal(c.deal).offer.amount) : ' · listing ' + priceTxt(p)) + '</p></div>' + conPill(c.status) + '</div>' +
        '<div class="v-steps">' + CFLOW.map(function (s, i) { return '<span class="' + (i <= at ? 'done' : i === at + 1 && at > -1 ? 'cur' : '') + '">' + s + '</span>'; }).join('') + '</div>' +
        (c.note ? '<p class="re-sub">Note from Michael Brown: ' + esc(c.note) + '</p>' : '') +
        (c.status === 'Draft' && role === 'office' ? '<p class="re-sub">Waiting for approval by Michael Brown.</p>' : '') +
        (c.status === 'Sent for signature' ? '<p class="re-sub">E-signature request prepared for all parties (simulated, not sent).</p>' : '') +
        '<div class="re-row">' + a + '</div></article>';
    }
    function vContracts() {
      var toGen = DEALS.filter(function (d) { return d.stage === 'contract' && !contractOf(d); });
      return head('Contracts', 'Generated from templates with property and client data, stored in the DMS', role === 'office' ? btn('gen', IC.plus + 'Generate contract', 'btn-ink') : '') +
        (toGen.length && role === 'office' ? hint(toGen.length + ' accepted offer' + (toGen.length > 1 ? 's need' : ' needs') + ' a contract: ' + toGen.map(function (d) { return esc(client(d)) + ' (' + esc(prop(d.prop).addr) + ')'; }).join(', ') + '.') : '') +
        '<div class="re-stack">' + CONTRACTS.slice().reverse().map(contractCard).join('') + '</div>';
    }

    /* ---- tasks ---- */
    function vTasks() {
      var me = ME[role];
      var dealsT = myDeals().filter(function (d) { return TASKS.some(function (t) { return t.deal === d.id; }); });
      var groups = dealsT.map(function (d) {
        var ts = TASKS.filter(function (t) { return t.deal === d.id && (ui.tf === 'all' || t.who === me); });
        var all = TASKS.filter(function (t) { return t.deal === d.id; }), dn = all.filter(function (t) { return t.done; }).length;
        if (!ts.length) return '';
        return '<section class="panel re-tg"><div class="re-apv-h"><div><span class="v-id">' + d.id + ' · ' + stageName(d.stage) + '</span><h3>' + esc(client(d)) + ' · ' + esc(prop(d.prop).addr) + '</h3></div><span class="re-pc">' + dn + '/' + all.length + '</span></div><span class="re-prog"><i style="width:' + Math.round(dn / all.length * 100) + '%"></i></span>' +
          '<ul class="re-tasks">' + ts.map(function (t) {
            var can = t.who === me || role !== 'agent', late = !t.done && t.due < iso(0);
            return '<li class="' + (t.done ? 'ok' : '') + '"><button type="button" class="re-chk" data-a="task" data-id="' + t.id + '" aria-pressed="' + t.done + '"' + (can ? '' : ' disabled') + ' aria-label="' + (t.done ? 'Reopen: ' : 'Complete: ') + esc(t.text) + '">' + IC.check + '</button>' +
              '<span class="re-t-b"><b>' + esc(t.text) + '</b><small class="' + (late ? 're-late' : '') + '">' + (t.done ? 'Done' + (t.doneBy ? ' by ' + esc(t.doneBy) : '') : 'Due ' + dayTxt(t.due) + (late ? ' · overdue' : '')) + '</small></span>' +
              (role !== 'agent' ? sel('tassign', AGENTS.concat(['Emma Davis']), t.who, 'Assignee for ' + t.text, ' data-id="' + t.id + '"') : '<span class="re-who">' + esc(t.who) + '</span>') + '</li>';
          }).join('') + '</ul></section>';
      }).join('');
      var addForm = role !== 'agent' && dealsT.filter(isOpen).length ? '<details class="panel re-add"><summary>' + IC.plus + 'Add a task</summary><div class="re-add-f">' +
        '<label>Deal<select class="re-add-d">' + dealsT.filter(isOpen).map(function (d) { return '<option value="' + d.id + '">' + esc(client(d)) + ' · ' + esc(prop(d.prop).addr) + '</option>'; }).join('') + '</select></label>' +
        '<label>Task<input type="text" class="re-add-t" placeholder="e.g. Order title report" maxlength="80"></label>' +
        '<label>Assignee<select class="re-add-w">' + AGENTS.concat(['Emma Davis']).map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label>' + btn('add-task', 'Add task', 'btn-ink') + '</div></details>' : '';
      return head('Tasks', 'Checklists are created automatically when an offer is accepted.', '') +
        '<div class="re-seg" role="group" aria-label="Show tasks">' + [['mine', 'Assigned to me'], ['all', 'All tasks']].map(function (x) { return '<button type="button" data-a="tf" data-v="' + x[0] + '" aria-pressed="' + (ui.tf === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        addForm + (groups || empty(ui.tf === 'mine' ? 'No tasks assigned to you. Show all tasks to see the team.' : 'No task checklists yet. Accept an offer to create one.'));
    }

    /* ================= RENDER ================= */
    function render(top) {
      paintNav();
      if (view === 'dms') { main.innerHTML = ''; main.appendChild(dmsEl); dms.render(); }
      else main.innerHTML = view === 'home' ? vHome() : view === 'apv' ? vApv() : view === 'props' ? (ui.prop ? vProp() : vProps()) : view === 'leads' ? vLeads() : view === 'deals' ? vDeals() : view === 'views' ? vViews() : view === 'contracts' ? vContracts() : vTasks();
      if (top) main.scrollTop = 0;
    }

    /* ================= MODALS & ACTIONS ================= */
    function formErr(m, text) { var e = q('.re-err', m.body); e.textContent = text; e.hidden = !text; }

    function schedModal(o) {
      o = o || {};
      var d = o.deal ? deal(o.deal) : null;
      var leadsAv = LEADS.filter(function (l) { return !/Won|Lost/.test(l.status) && (role !== 'agent' || l.agent === ME.agent); });
      var props = P.filter(function (p) { return p.status === 'Active' || (d && p.id === d.prop); });
      var lid = d ? d.lead : o.lead || (leadsAv[0] && leadsAv[0].id), pid = d ? d.prop : o.prop || props[0].id;
      var agent = role === 'agent' ? ME.agent : d ? d.agent : prop(pid).agent;
      var m = SDA.modal(root, { title: 'Schedule a viewing', html:
        '<div class="re-form">' + (d ? '<p class="re-sub">Deal ' + d.id + ': <b>' + esc(client(d)) + '</b> · ' + esc(prop(d.prop).addr) + '</p>' :
          '<label>Client (lead)<select class="m-lead">' + leadsAv.map(function (l) { return '<option value="' + l.id + '"' + (l.id === lid ? ' selected' : '') + '>' + esc(l.name) + ' · ' + (l.intent === 'rent' ? 'rent' : 'buy') + ' ' + budgetTxt(l) + '</option>'; }).join('') + '</select></label>' +
          '<label>Property<select class="m-prop">' + props.map(function (p) { return '<option value="' + p.id + '"' + (p.id === pid ? ' selected' : '') + '>' + esc(p.addr) + ', ' + esc(p.city) + ' · ' + priceTxt(p) + '</option>'; }).join('') + '</select></label>') +
        '<div class="row2"><label>Date<input type="date" class="m-date" value="' + iso(0) + '" min="' + iso(0) + '"></label><label>Time<select class="m-time">' + slots.map(function (s) { return '<option' + (s === '16:00' ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label></div>' +
        '<label>Agent' + (role === 'agent' ? '<input type="text" value="Chris Walker (you)" readonly>' : '<select class="m-agent">' + AGENTS.map(function (a) { return '<option' + (a === agent ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select>') + '</label>' +
        '<label class="chk"><input type="checkbox" class="m-conf" checked> Send confirmation to client (simulated, not sent)</label>' +
        '<p class="re-err note err" role="alert" hidden></p><div class="re-row">' + '<button type="button" class="btn btn-ink btn-sm m-save">' + IC.cal + 'Book viewing</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () {
        var L2 = d ? d.lead : q('.m-lead', m.body) && q('.m-lead', m.body).value, P2 = d ? d.prop : q('.m-prop', m.body).value;
        var date = q('.m-date', m.body).value, time = q('.m-time', m.body).value, ag = role === 'agent' ? ME.agent : q('.m-agent', m.body).value;
        if (!L2 && !d) return formErr(m, 'Pick a client.');
        if (!date || date < iso(0)) return formErr(m, 'Pick today or a later date.');
        var clash = VIEWS.filter(function (v) { return v.agent === ag && v.date === date && v.time === time && v.status === 'Scheduled'; })[0];
        if (clash) return formErr(m, ag + ' already has a viewing at ' + time + ' on ' + dayTxt(date) + ' (' + prop(clash.prop).addr + '). Pick another time.');
        var dl = d || DEALS.filter(function (x) { return x.lead === L2 && x.prop === P2 && isOpen(x); })[0];
        if (!dl) { dl = { id: nid('D'), lead: L2, prop: P2, stage: 'new', value: prop(P2).price, agent: ag }; DEALS.push(dl); }
        if (dl.stage === 'new') dl.stage = 'viewing';
        var v = { id: nid('V'), prop: P2, deal: dl.id, date: date, time: time, agent: ag, status: 'Scheduled' };
        VIEWS.push(v);
        var l = lead(dl.lead); if (l && /New|Contacted|Qualified/.test(l.status)) l.status = 'Viewing';
        logLead(l, 'Viewing booked: ' + prop(P2).addr + ', ' + dayTxt(date) + ' ' + time + ' with ' + ag + '.' + (q('.m-conf', m.body).checked ? ' Confirmation e-mail (simulated, not sent).' : ''));
        logProp(prop(P2), 'Viewing booked with ' + client(dl) + ' for ' + dayTxt(date) + ' ' + time + '.');
        m.close(); toast('Viewing booked for ' + dayTxt(date) + ' at ' + time + (q('.m-conf', m.body).checked ? '. Confirmation (simulated, not sent).' : '.'));
        render();
      });
    }

    function feedbackModal(v) {
      var p = prop(v.prop), d = v.deal ? deal(v.deal) : null;
      var m = SDA.modal(root, { title: 'Viewing feedback', html:
        '<div class="re-form"><p class="re-sub"><b>' + esc(p.addr) + '</b> · ' + dayTxt(v.date) + ' ' + v.time + ' · ' + esc(d ? client(d) : v.client) + '</p>' +
        '<fieldset class="re-fs"><legend>Client interest</legend><div class="re-seg">' + ['High', 'Medium', 'Low'].map(function (x, i) { return '<label class="re-radio"><input type="radio" name="re-int-' + v.id + '" value="' + x + '"' + (i === 0 ? ' checked' : '') + '><span>' + x + '</span></label>'; }).join('') + '</div></fieldset>' +
        '<label>Rating of the property (client)<select class="m-rate">' + [5, 4, 3, 2, 1].map(function (r) { return '<option value="' + r + '">' + r + ' / 5</option>'; }).join('') + '</select></label>' +
        '<label>Notes<textarea class="m-notes" rows="3" placeholder="What did the client like or dislike?">Liked the backyard and the den as a home office. Asked about school catchment and closing timeline.</textarea></label>' +
        '<label>Next step<select class="m-next"><option>Create offer</option><option>Second viewing</option><option>Send more listings</option><option>Not interested</option></select></label>' +
        '<div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + 'Save feedback</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () {
        var it = q('input[type=radio]:checked', m.body).value, next = q('.m-next', m.body).value;
        v.status = 'Done'; v.fb = { interest: it, rating: +q('.m-rate', m.body).value, notes: q('.m-notes', m.body).value.trim() || 'No notes.', next: next, by: ME[role] };
        logProp(p, 'Viewing feedback (' + (d ? client(d) : v.client) + '): ' + it + ' interest, ' + v.fb.rating + '/5. Next: ' + next + '.');
        if (d) logLead(lead(d.lead), 'Viewing feedback: ' + it + ' interest. ' + v.fb.notes);
        m.close(); guide.done('viewing');
        if (d && next === 'Not interested') { d.stage = 'lost'; d.lostReason = 'Not interested after viewing'; toast('Feedback saved. Deal closed as lost.'); render(); return; }
        render();
        if (d && next === 'Create offer' && canMove(d) && d.stage === 'viewing') { toast('Feedback saved. Opening the offer form.'); offerModal(d); }
        else toast('Feedback saved and shared with the seller report (simulated, not sent).');
      });
    }

    function offerModal(d) {
      var p = prop(d.prop), rent = p.type === 'rent';
      var m = SDA.modal(root, { title: rent ? 'Rental application' : 'Create offer', html:
        '<div class="re-form"><p class="re-sub"><b>' + esc(client(d)) + '</b> for ' + esc(p.addr) + ' · listed at ' + priceTxt(p) + ' · ' + (rent ? 'landlord ' : 'seller ') + esc(p.owner) + '</p>' +
        '<div class="row2"><label>' + (rent ? 'Monthly rent ($)' : 'Offer price ($)') + '<input type="number" class="m-amt" min="1" step="' + (rent ? 50 : 1000) + '" value="' + (rent ? p.price : Math.round(p.price * 0.985 / 1000) * 1000) + '"></label>' +
        (rent ? '<label>Move-in date<input type="date" class="m-close" value="' + iso(21) + '"></label>' : '<label>Earnest money<select class="m-dep"><option value="3">3%</option><option value="5" selected>5%</option><option value="10">10%</option></select></label>') + '</div>' +
        (rent ? '' : '<div class="row2"><label>Financing<select class="m-fin"><option>Mortgage pre-approved</option><option>Cash</option><option>Mortgage pending</option></select></label><label>Closing date<input type="date" class="m-close" value="' + iso(45) + '"></label></div>') +
        '<fieldset class="re-fs"><legend>Conditions</legend><div class="chks">' + (rent ? ['Credit check', 'Pets allowed (one cat)'] : ['Home inspection', 'Financing', 'Appraisal']).map(function (c, i) { return '<label class="chk"><input type="checkbox" value="' + c + '"' + (i < 2 ? ' checked' : '') + '> ' + c + '</label>'; }).join('') + '</div></fieldset>' +
        '<div class="ai-box re-offer-sum" aria-live="polite"></div>' +
        '<p class="re-err note err" role="alert" hidden></p><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.mail + 'Submit to ' + (rent ? 'landlord' : 'seller') + '</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div><p class="re-sub">Submission is simulated and not sent.</p></div>' });
      var sum = function () {
        var a = +q('.m-amt', m.body).value || 0, diff = (a - p.price) / p.price * 100;
        q('.re-offer-sum', m.body).innerHTML = '<div class="ai-h">Summary</div>' + (rent ? 'Rent ' + money(a) + '/mo · deposit ' + money(a * 1.5) + ' · broker fee ' + money(a) : 'Offer ' + money(a) + ' (' + (diff >= 0 ? '+' : '') + diff.toFixed(1) + '% vs. list) · commission at 3%: <b>' + money(Math.round(a * 0.03)) + '</b>');
      };
      q('.m-amt', m.body).addEventListener('input', sum); sum();
      q('.m-save', m.body).addEventListener('click', function () {
        var a = +q('.m-amt', m.body).value;
        if (!a || a < p.price * 0.5) return formErr(m, 'Enter a realistic amount (at least 50% of the listing price).');
        d.offer = { amount: a, deposit: rent ? 0 : +q('.m-dep', m.body).value, financing: rent ? 'Tenant income verified' : q('.m-fin', m.body).value, closing: q('.m-close', m.body).value || iso(45), conds: qa('.chks input:checked', m.body).map(function (x) { return x.value; }), status: 'Submitted' };
        d.value = a; d.stage = 'offer';
        var l = lead(d.lead); if (l) l.status = 'Offer';
        logLead(l, (rent ? 'Rental application' : 'Offer') + ' of ' + priceTxt(p, a) + ' submitted to ' + p.owner + ' (simulated, not sent).');
        logProp(p, (rent ? 'Rental application' : 'Offer') + ' from ' + client(d) + ': ' + priceTxt(p, a) + '.');
        d.offerDoc = dms.add(offerDoc(d)).id;
        m.close(); toast((rent ? 'Application' : 'Offer') + ' saved to DMS and submitted to ' + p.owner + ' (simulated, not sent).');
        render();
      });
    }

    function acceptOffer(d) {
      var p = prop(d.prop);
      d.offer.status = 'Accepted'; d.stage = 'contract'; p.status = 'Reserved';
      var l = lead(d.lead); if (l) l.status = 'Offer accepted';
      var od = d.offerDoc ? docById(d.offerDoc) : null; if (od) { od.status = 'Accepted'; dms.render(); }
      makeTasks(d, 0);
      logProp(p, (p.type === 'rent' ? 'Application' : 'Offer') + ' from ' + client(d) + ' accepted. Status set to Reserved.');
      logLead(l, 'Offer accepted by ' + p.owner + '. Task checklist created for the team.');
      toast('Offer accepted. ' + checklist(d).length + ' tasks created for the team.');
      render();
    }

    function genModal(dealId) {
      var types = ['Purchase agreement', 'Rental agreement', 'Brokerage agreement'];
      var d0 = dealId ? deal(dealId) : null;
      var st = { kind: d0 ? (prop(d0.prop).type === 'rent' ? 'Rental agreement' : 'Purchase agreement') : 'Purchase agreement', rec: dealId || '' };
      var recs = function () {
        if (st.kind === 'Brokerage agreement') return P.filter(function (p) { return p.status !== 'Sold' && p.status !== 'Rented'; }).map(function (p) { return [p.id, p.addr + ' · ' + p.owner]; });
        return DEALS.filter(function (d) { return d.stage === 'contract' && d.offer && d.offer.status === 'Accepted' && (prop(d.prop).type === 'rent') === (st.kind === 'Rental agreement'); }).map(function (d) { return [d.id, client(d) + ' · ' + prop(d.prop).addr + (contractOf(d) ? ' (has contract)' : '')]; });
      };
      var m = SDA.modal(root, { title: 'Generate contract from template', wide: true, html:
        '<div class="re-gen"><div class="re-form"><label>Template<select class="m-kind">' + types.map(function (t) { return '<option' + (t === st.kind ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select></label>' +
        '<label><span class="m-rl">Deal</span><select class="m-rec"></select></label>' +
        '<div class="ai-box"><div class="ai-h">Filled automatically</div>Parties, property data, price, deposit, conditions, dates and commission come from the listing and the deal. Nothing is typed twice.</div>' +
        '<p class="re-err note err" role="alert" hidden></p><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.folder + 'Save to DMS as draft</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' +
        '<div class="re-gen-prev" aria-live="polite"></div></div>' });
      var paint = function () {
        var r = recs(); if (!r.some(function (x) { return x[0] === st.rec; })) st.rec = r[0] ? r[0][0] : '';
        q('.m-rl', m.body).textContent = st.kind === 'Brokerage agreement' ? 'Listing' : 'Deal (offer accepted)';
        q('.m-rec', m.body).innerHTML = r.length ? r.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === st.rec ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join('') : '<option value="">No matching record</option>';
        var c = draft(); q('.re-gen-prev', m.body).innerHTML = c ? SDA.docPage(Object.assign({ type: 'docx' }, contractDoc(c))) : '<div class="sda-empty">' + (st.kind === 'Brokerage agreement' ? 'No listing available.' : 'No deal with an accepted ' + (st.kind === 'Rental agreement' ? 'rental application' : 'offer') + ' yet. Accept an offer in the pipeline first.') + '</div>';
      };
      var draft = function () {
        if (!st.rec) return null;
        if (st.kind === 'Brokerage agreement') { var p = prop(st.rec); return { id: 'C-' + (seq.C + 1), kind: st.kind, prop: p.id, party: p.owner, status: 'Draft' }; }
        var d = deal(st.rec); return { id: 'C-' + (seq.C + 1), kind: st.kind, prop: d.prop, deal: d.id, party: client(d), status: 'Draft' };
      };
      q('.m-kind', m.body).addEventListener('change', function (e) { st.kind = e.target.value; paint(); });
      q('.m-rec', m.body).addEventListener('change', function (e) { st.rec = e.target.value; paint(); });
      paint();
      q('.m-save', m.body).addEventListener('click', function () {
        var c = draft(); if (!c) return formErr(m, 'Nothing to generate yet. Pick a template with a matching record.');
        if (c.deal && contractOf(deal(c.deal))) return formErr(m, 'This deal already has a contract. Open it from the contracts list.');
        c.id = nid('C'); c.created = iso(0); c.by = ME[role]; c.fresh = true;
        CONTRACTS.push(c);
        c.doc = dms.add(contractFileDoc(c)).id;
        if (c.deal) {
          TASKS.forEach(function (t) { if (t.deal === c.deal && t.kind === 'contract' && !t.done) { t.done = true; t.doneBy = ME[role]; } });
          logLead(lead(deal(c.deal).lead), c.kind + ' ' + c.id + ' generated and saved to DMS as draft.');
          if (c.kind !== 'Brokerage agreement') guide.done('contract');
        }
        logProp(prop(c.prop), c.kind + ' ' + c.id + ' generated (draft).');
        m.close(); toast(c.kind + ' saved to DMS as draft. Waiting for approval by Michael Brown.');
        view = 'contracts'; render(true);
      });
    }

    function setContract(c, st, note) {
      c.status = st; var d = docById(c.doc);
      if (d) {
        if (st === 'Signed' || st === 'Draft') d.version += 1;
        Object.assign(d, contractDoc(c)); d.status = st;
        d.versions.push({ v: d.version, date: SDA.fmtDate(new Date()), by: ME[role], note: note });
        dms.render();
      }
    }
    function contractAct(a, c) {
      var p = prop(c.prop), dl = c.deal ? deal(c.deal) : null;
      if (a === 'c-approve') { setContract(c, 'Approved', 'Approved by Michael Brown'); logProp(p, c.kind + ' ' + c.id + ' approved.'); toast(c.id + ' approved. It can now be sent for signature.'); }
      if (a === 'c-resubmit') { c.note = ''; setContract(c, 'Draft', 'Revised and resubmitted'); toast(c.id + ' resubmitted for approval.'); }
      if (a === 'c-send') { setContract(c, 'Sent for signature', 'E-signature request to ' + c.party + ' and ' + p.owner + ' (simulated, not sent)'); logProp(p, c.kind + ' ' + c.id + ' sent for signature (simulated, not sent).'); toast('Sent for signature to all parties (simulated, not sent).'); }
      if (a === 'c-sign') {
        setContract(c, 'Signed', 'All parties signed (simulated e-signature)');
        logProp(p, c.kind + ' ' + c.id + ' signed by all parties (simulated).');
        if (dl && c.kind !== 'Brokerage agreement') {
          dl.stage = 'won'; p.status = p.type === 'rent' ? 'Rented' : 'Sold';
          var l = lead(dl.lead); if (l) { l.status = 'Won'; logLead(l, c.kind + ' signed. Deal won.'); }
          toast('Signed. Deal won · commission ' + money(commission(dl)) + '.');
          if (c.fresh) guide.done('signed');
        } else toast(c.kind + ' signed (simulated e-signature).');
      }
      render();
    }
    function changesModal(c) {
      var m = SDA.modal(root, { title: 'Request changes · ' + c.id, html: '<div class="re-form"><label>What should be changed?<textarea class="m-n" rows="3">Please add the inclusion of kitchen appliances to the purchase price.</textarea></label><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">Send back to Emma Davis</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () { c.note = q('.m-n', m.body).value.trim(); setContract(c, 'Changes requested', 'Changes requested: ' + c.note); m.close(); toast('Sent back to Emma Davis with your note.'); render(); });
    }

    function lostModal(d, l) {
      var m = SDA.modal(root, { title: 'Close as lost', html: '<div class="re-form"><p class="re-sub">' + esc(d ? client(d) + ' · ' + prop(d.prop).addr : l.name) + '</p><label>Reason<select class="m-r"><option>Bought or rented elsewhere</option><option>Financing fell through</option><option>Price too high</option><option>Not responsive</option><option>Not interested after viewing</option></select></label><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">Close as lost</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () {
        var r = q('.m-r', m.body).value;
        if (d) { d.stage = 'lost'; d.lostReason = r; if (prop(d.prop).status === 'Reserved') prop(d.prop).status = 'Active'; logLead(lead(d.lead), 'Deal ' + d.id + ' lost: ' + r + '.'); }
        if (l) { l.status = 'Lost'; logLead(l, 'Lead closed as lost: ' + r + '.'); DEALS.forEach(function (x) { if (x.lead === l.id && isOpen(x)) { x.stage = 'lost'; x.lostReason = r; } }); }
        m.close(); toast('Closed as lost: ' + r + '.'); render();
      });
    }

    function dealModal(d) {
      var p = prop(d.prop), c = contractOf(d), ts = TASKS.filter(function (t) { return t.deal === d.id; });
      var vs = VIEWS.filter(function (v) { return v.deal === d.id; });
      var ds = docsFor(d.id).concat(docsFor(p.id).filter(function (x) { return x.folder === 'Exposés' || x.folder === 'Floor plans'; }));
      var m = SDA.modal(root, { title: d.id + ' · ' + client(d), wide: true, html:
        '<div class="re-dm"><div><div class="re-match big"><span class="re-match-ph">' + photo(p) + '</span><div class="re-li-b"><b>' + esc(p.addr) + ', ' + esc(p.city) + '</b><small>' + priceTxt(p) + ' listed · ' + p.beds + ' bd · ' + num(p.sqft) + ' sq ft</small></div></div>' +
        '<div class="v-steps">' + STAGES.slice(0, 5).map(function (s, i) { var at = d.stage === 'lost' ? -1 : ['new', 'viewing', 'offer', 'contract', 'won'].indexOf(d.stage); return '<span class="' + (i <= at ? 'done' : '') + '">' + s[1] + '</span>'; }).join('') + '</div>' +
        '<dl class="re-dl"><dt>Stage</dt><dd>' + stageName(d.stage) + (d.lostReason ? ' · ' + esc(d.lostReason) : '') + '</dd><dt>Deal value</dt><dd>' + priceTxt(p, d.value) + '</dd><dt>Commission</dt><dd>' + money(commission(d)) + (p.type === 'rent' ? ' (one month)' : ' (3%)') + '</dd><dt>Agent</dt><dd>' + esc(d.agent) + '</dd>' +
        (d.offer ? '<dt>Offer</dt><dd>' + priceTxt(p, d.offer.amount) + ' · ' + esc(d.offer.status) + '</dd><dt>Conditions</dt><dd>' + esc(d.offer.conds.join(', ') || 'none') + '</dd>' : '') + (c ? '<dt>Contract</dt><dd>' + esc(c.kind) + ' · ' + esc(c.status) + '</dd>' : '') + '</dl>' +
        (vs.length ? '<h4 class="re-h4">Viewings</h4><div class="re-stack">' + vs.map(function (v) { return '<div class="re-li static"><span class="re-av">' + IC.cal + '</span><span class="re-li-b"><b>' + dayTxt(v.date) + ' ' + v.time + ' · ' + esc(v.agent) + '</b><small>' + (v.fb ? esc(v.fb.interest + ' interest: ' + v.fb.notes) : v.status) + '</small></span></div>'; }).join('') + '</div>' : '') + '</div>' +
        '<div>' + (ts.length ? '<h4 class="re-h4">Checklist ' + ts.filter(function (t) { return t.done; }).length + '/' + ts.length + '</h4><ul class="re-mini-t">' + ts.map(function (t) { return '<li class="' + (t.done ? 'ok' : '') + '">' + (t.done ? IC.check : '<i></i>') + '<span>' + esc(t.text) + ' <small>' + esc(t.who) + '</small></span></li>'; }).join('') + '</ul>' : '') +
        '<h4 class="re-h4">Documents</h4>' + (ds.length ? '<div class="re-stack">' + ds.map(docBtn).join('') + '</div>' : empty('No documents yet.')) + '</div></div>' });
      m.body.addEventListener('click', function (e) { var b = e.target.closest('[data-a="doc"]'); if (b) { m.close(); dms.open(b.dataset.id); } });
    }

    function propForm(p) {
      var isNew = !p; p = p || { addr: '', city: 'Brookfield', type: 'sale', kind: 'House', price: '', sqft: '', beds: 3, baths: 2, status: 'Draft', owner: '', agent: 'Chris Walker', desc: '', year: 2000, energy: 'C' };
      var o = function (arr, v) { return arr.map(function (x) { var val = typeof x === 'string' ? x : x[0]; return '<option value="' + val + '"' + (val === v ? ' selected' : '') + '>' + (typeof x === 'string' ? x : x[1]) + '</option>'; }).join(''); };
      var m = SDA.modal(root, { title: isNew ? 'New listing' : 'Edit listing · ' + p.id, html:
        '<div class="re-form"><div class="row2"><label>Street address<input class="m-addr" value="' + esc(p.addr) + '" placeholder="e.g. 9 Oak Hill Road"></label><label>City<select class="m-city">' + o(CITIES, p.city) + '</select></label></div>' +
        '<div class="row2"><label>Listing type<select class="m-type">' + o([['sale', 'For sale'], ['rent', 'For rent']], p.type) + '</select></label><label>Property type<select class="m-kind">' + o(KINDS, p.kind) + '</select></label></div>' +
        '<div class="row2"><label><span class="m-pl">' + (p.type === 'rent' ? 'Monthly rent ($)' : 'Price ($)') + '</span><input type="number" min="1" class="m-price" value="' + p.price + '"></label><label>Size (sq ft)<input type="number" min="100" class="m-sqft" value="' + p.sqft + '"></label></div>' +
        '<div class="row2"><label>Bedrooms<input type="number" min="0" max="12" class="m-beds" value="' + p.beds + '"></label><label>Bathrooms<input type="number" min="1" max="10" class="m-baths" value="' + p.baths + '"></label></div>' +
        '<div class="row2"><label>' + (p.type === 'rent' ? 'Owner' : 'Owner / seller') + '<input class="m-owner" value="' + esc(p.owner) + '" placeholder="e.g. Mark Evans"></label><label>Agent<select class="m-agent">' + o(AGENTS, p.agent) + '</select></label></div>' +
        (isNew ? '' : '<label>Status<select class="m-status">' + o(['Draft', 'Active', 'Reserved', p.type === 'rent' ? 'Rented' : 'Sold'], p.status) + '</select></label>') +
        '<label>Description<textarea class="m-desc" rows="3" placeholder="Describe the home or let AI draft it">' + esc(p.desc) + '</textarea></label>' +
        '<div class="re-row tight"><button type="button" class="btn btn-ghost btn-sm m-ai">' + IC.spark + 'Write description · AI (simulated)</button></div>' +
        (isNew ? '<label>Photo (optional)<input type="file" accept="image/*" class="m-photo"></label>' : '') +
        (!isNew && role === 'office' && p.status !== 'Draft' ? hint('Price changes on published listings go to Michael Brown for approval.') : '') +
        '<p class="re-err note err" role="alert" hidden></p><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + (isNew ? 'Create as draft' : 'Save changes') + '</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-type', m.body).addEventListener('change', function (e) { q('.m-pl', m.body).textContent = e.target.value === 'rent' ? 'Monthly rent ($)' : 'Price ($)'; });
      q('.m-ai', m.body).addEventListener('click', function () {
        var k = q('.m-kind', m.body).value, b = q('.m-beds', m.body).value, s = q('.m-sqft', m.body).value || '1,500', c = q('.m-city', m.body).value;
        var t = q('.m-desc', m.body); t.value = '';
        var txt = 'Welcoming ' + b + '-bedroom ' + k.toLowerCase() + ' in ' + c + ' with ' + num(s) + ' sq ft of living space, a light-filled living area and a practical kitchen. Close to schools, shops and transport. Ideal for ' + (+b >= 3 ? 'families who need room to grow.' : 'professionals and couples.');
        var i = 0; var tm = setInterval(function () { i += 5; t.value = txt.slice(0, i); if (i >= txt.length) clearInterval(tm); }, 16); ctx.onCleanup(function () { clearInterval(tm); });
      });
      q('.m-save', m.body).addEventListener('click', function () {
        var v = function (c) { return q(c, m.body).value.trim(); };
        var data = { addr: v('.m-addr'), city: v('.m-city'), type: v('.m-type'), kind: v('.m-kind'), price: +v('.m-price'), sqft: +v('.m-sqft'), beds: +v('.m-beds'), baths: +v('.m-baths'), owner: v('.m-owner'), agent: v('.m-agent'), desc: v('.m-desc') };
        var bad = !data.addr ? 'Enter the street address.' : !data.price || data.price < 100 ? 'Enter a price.' : !data.sqft ? 'Enter the size in sq ft.' : !data.owner ? 'Enter the owner.' : '';
        qa('input', m.body).forEach(function (x) { x.removeAttribute('aria-invalid'); });
        if (bad) { var map = { 'Enter the street address.': '.m-addr', 'Enter a price.': '.m-price', 'Enter the size in sq ft.': '.m-sqft', 'Enter the owner.': '.m-owner' }; q(map[bad], m.body).setAttribute('aria-invalid', 'true'); q(map[bad], m.body).focus(); return formErr(m, bad); }
        if (!data.desc) data.desc = 'Details to follow.';
        if (isNew) {
          var np = Object.assign({ id: nid('P'), status: 'Draft', year: 2000, energy: 'C', listed: 0, hue: Math.round(Math.random() * 360) }, data);
          np.photo = SDA.art('room', np.kind + ' · ' + np.city); np.act = [{ when: stamp(), who: ME[role], text: 'Listing created as draft.' }];
          var f = q('.m-photo', m.body); if (f && f.files[0]) { np.upload = URL.createObjectURL(f.files[0]); dms.add({ name: f.files[0].name, type: 'jpg', folder: 'Photos', linked: plink(np), owner: ME[role], status: 'Draft', img: np.upload, note: 'Uploaded from this device (stays in your browser)' }); }
          P.unshift(np); m.close(); ui.prop = np.id; ui.tab = 'details'; view = 'props'; toast('Draft listing ' + np.id + ' created. Publish it when ready.'); render(true); return;
        }
        var newPrice = data.price; delete data.price;
        var st = q('.m-status', m.body).value;
        Object.assign(p, data); if (st !== p.status) { logProp(p, 'Status changed from ' + p.status + ' to ' + st + '.'); p.status = st; }
        var msg = 'Listing saved.';
        if (newPrice !== p.price) {
          if (role === 'manager' || p.status === 'Draft') { logProp(p, 'Price changed from ' + priceTxt(p) + ' to ' + priceTxt(p, newPrice) + (role === 'manager' ? ' (approved by Michael Brown).' : '.')); p.price = newPrice; msg = 'Listing saved with new price.'; }
          else if (!pendingPrice(p)) { APV.push({ id: nid('A'), prop: p.id, from: p.price, to: newPrice, by: ME[role], when: 'Today', status: 'Pending', reason: 'Requested by ' + ME[role] + ' while editing the listing.' }); logProp(p, 'Price change to ' + priceTxt(p, newPrice) + ' requested. Waiting for manager approval.'); msg = 'Saved. Price change sent to Michael Brown for approval (notification simulated, not sent).'; }
          else msg = 'Saved. A price change is already waiting for approval.';
        }
        logProp(p, 'Listing details updated.');
        m.close(); toast(msg); render();
      });
    }

    function leadForm() {
      var m = SDA.modal(root, { title: 'New inquiry', html:
        '<div class="re-form"><div class="row2"><label>Name<input class="m-name" placeholder="e.g. Jason Reed"></label><label>Source<select class="m-src"><option>Phone</option><option>Website</option><option>Property portal</option><option>Referral</option><option>Walk-in</option></select></label></div>' +
        '<div class="row2"><label>E-mail<input type="email" class="m-mail" placeholder="name@example.com"></label><label>Phone<input class="m-ph" placeholder="(555) 010-0000"></label></div>' +
        '<div class="row2"><label>Looking to<select class="m-int"><option value="sale">Buy</option><option value="rent">Rent</option></select></label><label>Budget ($, monthly for rent)<input type="number" class="m-bud" value="600000"></label></div>' +
        '<div class="row2"><label>Min. bedrooms<input type="number" class="m-beds" min="0" value="3"></label><label>Preferred area<select class="m-area">' + CITIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label></div>' +
        '<label>Needs<textarea class="m-needs" rows="2">Mortgage pre-approved, wants to move within 2 months.</textarea></label>' +
        '<p class="re-err note err" role="alert" hidden></p><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + 'Create lead</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-int', m.body).addEventListener('change', function (e) { q('.m-bud', m.body).value = e.target.value === 'rent' ? 2500 : 600000; });
      q('.m-save', m.body).addEventListener('click', function () {
        var name = q('.m-name', m.body).value.trim(); if (!name) { q('.m-name', m.body).setAttribute('aria-invalid', 'true'); return formErr(m, 'Enter the client name.'); }
        var l = { id: nid('L'), name: name, email: q('.m-mail', m.body).value.trim() || '—', phone: q('.m-ph', m.body).value.trim() || '—', source: q('.m-src', m.body).value, intent: q('.m-int', m.body).value, budget: +q('.m-bud', m.body).value || 0, beds: +q('.m-beds', m.body).value || 0, kind: '', areas: [q('.m-area', m.body).value], needs: q('.m-needs', m.body).value.trim() || '—', agent: '', status: 'New', created: iso(0), score: null, tl: [{ when: stamp(), who: ME[role], text: 'Inquiry entered manually.' }] };
        LEADS.unshift(l); ui.lead = l.id; ui.lstat = 'Open'; view = 'leads'; m.close(); toast('Lead ' + l.id + ' created. Assign an agent next.'); render(true);
      });
    }

    function assign(l, who) {
      var prev = l.agent; l.agent = who;
      if (who) { logLead(l, 'Assigned to ' + who + (prev ? ' (was ' + prev + ')' : '') + '. Notification sent (simulated, not sent).'); toast(l.name + ' assigned to ' + who + '. Notification (simulated, not sent).'); }
      else { logLead(l, 'Unassigned.'); toast(l.name + ' is unassigned.'); }
      render();
    }

    function sendExpose(p) {
      var ls = LEADS.filter(function (l) { return l.agent === ME.agent && !/Won|Lost/.test(l.status); });
      var m = SDA.modal(root, { title: 'Send exposé · ' + p.addr, html: '<div class="re-form"><label>To lead<select class="m-l">' + ls.map(function (l) { return '<option value="' + l.id + '">' + esc(l.name) + ' · ' + esc(l.email) + '</option>'; }).join('') + '</select></label><label>Message<textarea class="m-t" rows="4">Hi, as discussed here is the exposé for ' + esc(p.addr) + ' (' + priceTxt(p) + '). Happy to arrange a viewing this week.\n\nChris Walker, ' + AGENCY + '</textarea></label><div class="re-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.mail + 'Send (simulated)</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () { var l = lead(q('.m-l', m.body).value); logLead(l, 'Exposé for ' + p.addr + ' e-mailed (simulated, not sent).'); logProp(p, 'Exposé sent to ' + l.name + ' (simulated, not sent).'); m.close(); toast('Exposé sent to ' + l.name + ' (simulated, not sent).'); render(); });
    }

    /* ---------------- event delegation ---------------- */
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b || b.closest('.sda-modal')) return;
      var a = b.dataset.a, id = b.dataset.id;
      if (a === 'nav') return go(b.dataset.v);
      if (a === 'go-contracts') return go('contracts');
      if (a === 'open-prop') { view = 'props'; ui.prop = id; ui.tab = 'details'; return render(true); }
      if (a === 'back') { ui.prop = null; return render(true); }
      if (a === 'tab') { ui.tab = b.dataset.tab; render(); var t = q('[data-tab="' + ui.tab + '"]'); if (t) t.focus(); return; }
      if (a === 'open-lead') { var lx = lead(id); view = 'leads'; ui.lead = id; ui.lq = ''; ui.lstat = /Won|Lost/.test(lx.status) ? 'All' : (ui.lstat === 'All' ? 'All' : 'Open'); render(); var det = q('.re-ld'); if (det && window.innerWidth < 980) det.scrollIntoView({ block: 'start', behavior: SDA.reduce ? 'auto' : 'smooth' }); return; }
      if (a === 'open-deal') return dealModal(deal(id));
      if (a === 'doc') { if (id) dms.open(id); return; }
      if (a === 'vf') { ui.vf = b.dataset.v; return render(); }
      if (a === 'tf') { ui.tf = b.dataset.v; return render(); }
      if (a === 'sched') return schedModal({ deal: b.dataset.deal, prop: b.dataset.prop });
      if (a === 'feedback') return feedbackModal(find(VIEWS, id));
      if (a === 'route') return toast('Route to ' + prop(find(VIEWS, id).prop).addr + ' opened in maps (simulated).');
      if (a === 'cancel-view') { var v = find(VIEWS, id); v.status = 'Cancelled'; logProp(prop(v.prop), 'Viewing on ' + dayTxt(v.date) + ' ' + v.time + ' cancelled. Client notified (simulated, not sent).'); toast('Viewing cancelled. Client notified (simulated, not sent).'); return render(); }
      if (a === 'offer') return offerModal(deal(b.dataset.deal));
      if (a === 'accept') return acceptOffer(deal(b.dataset.deal));
      if (a === 'decline') { var d = deal(b.dataset.deal); d.offer.status = 'Declined'; d.stage = 'viewing'; logLead(lead(d.lead), 'Offer declined by ' + prop(d.prop).owner + '. Back to viewing stage.'); toast('Offer declined. Deal moved back to Viewing; create a new offer when ready.'); return render(); }
      if (a === 'won') { var dw = deal(b.dataset.deal); dw.stage = 'won'; toast('Deal closed as won.'); return render(); }
      if (a === 'gen') return genModal(b.dataset.deal);
      if (/^c-/.test(a)) { var c = find(CONTRACTS, id); if (a === 'c-changes') return changesModal(c); return contractAct(a, c); }
      if (a === 'apv-price') {
        var ap = find(APV, id), pp = prop(ap.prop);
        if (b.dataset.ok) { logProp(pp, 'Price change ' + priceTxt(pp) + ' → ' + priceTxt(pp, ap.to) + ' approved by Michael Brown. Portals updated (simulated).'); pp.price = ap.to; ap.status = 'Approved'; toast('Price updated to ' + priceTxt(pp) + '. Website and portals updated (simulated).'); }
        else { ap.status = 'Rejected'; logProp(pp, 'Price change to ' + priceTxt(pp, ap.to) + ' rejected by Michael Brown.'); toast('Price change rejected. ' + ap.by + ' has been notified (simulated, not sent).'); }
        return render();
      }
      if (a === 'edit-prop') return propForm(prop(id));
      if (a === 'new-prop') return propForm(null);
      if (a === 'publish') { var pb = prop(id); pb.status = 'Active'; logProp(pb, 'Published to website and portals (simulated).'); if (!docsFor(pb.id).some(function (x) { return x.folder === 'Exposés'; })) dms.add(exposeDoc(pb)); toast(pb.addr + ' is live on the website and portals (simulated).'); return render(); }
      if (a === 'expose') { var pe = prop(id), ex = docsFor(pe.id).filter(function (x) { return x.folder === 'Exposés'; })[0]; if (ex) { Object.assign(ex, exposeDoc(pe)); ex.version += 1; ex.versions.push({ v: ex.version, date: SDA.fmtDate(new Date()), by: ME[role], note: 'Regenerated from listing data (AI text simulated)' }); dms.render(); } else ex = dms.add(exposeDoc(pe)); logProp(pe, 'Exposé generated (v' + ex.version + ').'); toast('Exposé v' + ex.version + ' generated and filed in the DMS.'); ui.tab = 'documents'; return render(); }
      if (a === 'send-expose') return sendExpose(prop(id));
      if (a === 'new-lead') return leadForm();
      if (a === 'assign-sug') return assign(lead(id), b.dataset.who);
      if (a === 'score') {
        var ls = lead(id), box = q('.re-ai');
        if (box) box.innerHTML = '<div class="ai-h">AI (simulated) lead score & matching</div><p class="re-think"><i></i><i></i><i></i> Reading the inquiry, checking budget and financing, comparing ' + P.filter(function (p) { return p.status === 'Active'; }).length + ' active listings…</p>';
        ctx.later(SDA.reduce ? 50 : 1100, function () { ls.score = scoreOf(ls).score; logLead(ls, 'AI (simulated) lead score: ' + ls.score + '. Top match: ' + (matchesFor(ls)[0] ? matchesFor(ls)[0].p.addr : 'none') + '.', 'PropertyDesk AI'); render(); });
        return;
      }
      if (a === 'qualify') { var lq = lead(id); lq.status = 'Qualified'; logLead(lq, 'Marked as qualified.'); toast(lq.name + ' is qualified. Add a matching property to the pipeline.'); guide.done('qualify'); return render(); }
      if (a === 'contacted') { var lc = lead(id); lc.status = 'Contacted'; logLead(lc, 'Call logged: discussed needs and budget.'); toast('Call logged.'); return render(); }
      if (a === 'lead-lost') return lostModal(null, lead(id));
      if (a === 'to-pipe') {
        var lt = lead(id), pt = prop(b.dataset.prop);
        var nd = { id: nid('D'), lead: lt.id, prop: pt.id, stage: 'new', value: pt.price, agent: lt.agent || ME.agent };
        DEALS.push(nd); if (lt.status === 'New' || lt.status === 'Contacted') { lt.status = 'Qualified'; guide.done('qualify'); }
        logLead(lt, 'Added to pipeline with ' + pt.addr + ' (' + nd.id + ').'); logProp(pt, client(nd) + ' added to pipeline (' + nd.id + ').');
        guide.done('match'); toast(pt.addr + ' added to the pipeline. Next: schedule a viewing.'); render();
        return schedModal({ deal: nd.id });
      }
      if (a === 'note') { var ln = lead(id), inp = q('.re-note-in'); if (!inp.value.trim()) { inp.focus(); return; } logLead(ln, inp.value.trim()); toast('Note added.'); return render(); }
      if (a === 'task') {
        var t2 = find(TASKS, id); t2.done = !t2.done; t2.doneBy = t2.done ? ME[role] : null;
        var td = deal(t2.deal), tp = prop(td.prop);
        if (t2.done && t2.kind === 'id' && !docsFor(td.id).some(function (x) { return x.folder === 'ID copies'; })) { dms.add(idDoc(client(td), td.id + ' · ' + client(td))); toast('Done. ID copy (SAMPLE) filed in the DMS under ID copies.'); }
        else if (t2.done && t2.kind === 'energy') { var old = docsFor(tp.id).filter(function (x) { return x.folder === 'Energy certificates'; }); old.forEach(function (x) { if (x.status === 'Expired') x.status = 'Superseded'; }); dms.add(energyDoc(tp, true)); toast('Done. New energy certificate filed for ' + tp.addr + '.'); }
        else toast(t2.done ? 'Task completed.' : 'Task reopened.');
        var all = TASKS.filter(function (x) { return x.deal === td.id; }); if (t2.done && all.every(function (x) { return x.done; })) toast('All tasks for ' + client(td) + ' are done.');
        render(); var f = q('[data-a="task"][data-id="' + id + '"]'); if (f) f.focus(); return;
      }
      if (a === 'add-task') {
        var txt = q('.re-add-t').value.trim(); if (!txt) { q('.re-add-t').focus(); return; }
        TASKS.push({ id: nid('T'), deal: q('.re-add-d').value, text: txt, who: q('.re-add-w').value, due: iso(3), kind: '', done: false });
        toast('Task added and assigned to ' + q('.re-add-w').value + '.'); return render();
      }
    });
    root.addEventListener('change', function (e) {
      var t = e.target, f = t.dataset && t.dataset.f; if (!f || !t.closest('.re-main')) return;
      if (f === 'ptype' || f === 'pstat' || f === 'lstat' || f === 'dagent') { ui[f] = t.value; return render(); }
      if (f === 'assign') return assign(lead(t.dataset.id), t.value);
      if (f === 'tassign') { var tk = find(TASKS, t.dataset.id); tk.who = t.value; toast('Task reassigned to ' + t.value + '. Notification (simulated, not sent).'); return render(); }
      if (f === 'photo' && t.files[0]) { var p = prop(ui.prop); p.upload = URL.createObjectURL(t.files[0]); dms.add({ name: t.files[0].name, type: 'jpg', folder: 'Photos', linked: plink(p), owner: ME[role], status: 'Draft', img: p.upload, note: 'Uploaded from this device (stays in your browser)' }); logProp(p, 'New main photo uploaded.'); toast('Photo updated and filed in the DMS. It stays in your browser.'); return render(); }
      if (f === 'propdoc' && t.files[0]) { var pd = prop(ui.prop), fl = t.files[0], img = /^image\//.test(fl.type); dms.add({ name: fl.name, type: img ? 'jpg' : (fl.name.split('.').pop() || 'pdf').toLowerCase(), folder: img ? 'Photos' : 'Exposés', linked: plink(pd), owner: ME[role], status: 'Draft', img: img ? URL.createObjectURL(fl) : undefined, tags: ['uploaded'], note: 'Uploaded from this device (stays in your browser)' }); logProp(pd, 'Document uploaded: ' + fl.name + '.'); toast(fl.name + ' linked to ' + pd.addr + '. It stays in your browser.'); return render(); }
    });
    root.addEventListener('input', function (e) {
      var t = e.target, f = t.dataset && t.dataset.f; if (f !== 'pq' && f !== 'lq') return;
      ui[f] = t.value; var pos = t.selectionStart; render();
      var n = q('[data-f="' + f + '"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }
    });
    root.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('re-note-in')) { var b = q('[data-a="note"]'); if (b) b.click(); } });

    /* drag & drop in the pipeline (buttons do the same for keyboard and touch) */
    root.addEventListener('dragstart', function (e) { var c = e.target.closest && e.target.closest('.re-deal.mv'); if (!c) return; ui.drag = c.dataset.deal; c.classList.add('dragging'); try { e.dataTransfer.setData('text/plain', ui.drag); e.dataTransfer.effectAllowed = 'move'; } catch (x) {} });
    root.addEventListener('dragend', function () { ui.drag = null; qa('.dragging, .re-drop.over').forEach(function (x) { x.classList.remove('dragging', 'over'); }); });
    root.addEventListener('dragover', function (e) { var z = e.target.closest && e.target.closest('.re-drop'); if (z && ui.drag) { e.preventDefault(); qa('.re-drop.over').forEach(function (x) { if (x !== z) x.classList.remove('over'); }); z.classList.add('over'); } });
    root.addEventListener('drop', function (e) { var z = e.target.closest && e.target.closest('.re-drop'); if (!z || !ui.drag) return; e.preventDefault(); var id = ui.drag; ui.drag = null; z.classList.remove('over'); moveTo(deal(id), z.dataset.stage); });
    function moveTo(d, st) {
      if (!d || st === d.stage) return;
      if (!canMove(d)) return toast('Read only: only the deal’s agent or the manager can move it.', 'warn');
      if (st === 'lost') return lostModal(d);
      if (st === 'new') { d.stage = 'new'; toast('Moved back to New lead.'); return render(); }
      if (st === 'viewing') { if (!VIEWS.some(function (v) { return v.deal === d.id && v.status !== 'Cancelled'; })) return schedModal({ deal: d.id }); d.stage = 'viewing'; toast('Moved to Viewing.'); return render(); }
      if (st === 'offer') { if (!d.offer || d.offer.status === 'Declined') return offerModal(d); d.stage = 'offer'; return render(); }
      if (st === 'contract') { if (!d.offer || d.offer.status === 'Declined') return offerModal(d); if (d.offer.status !== 'Accepted') return acceptOffer(d); d.stage = 'contract'; return render(); }
      if (st === 'won') { var c = contractOf(d); if (!c || c.status !== 'Signed') return toast('Close as won once the contract is signed.', 'warn'); d.stage = 'won'; toast('Deal closed as won.'); return render(); }
    }

    /* a portal inquiry arrives a little later (simulated) */
    ctx.later(45000, function () {
      LEADS.push({ id: nid('L'), name: 'Jason Reed', email: 'jason.reed@example.com', phone: '(555) 015-4471', source: 'Property portal', intent: 'sale', budget: 520000, beds: 3, kind: 'House', areas: ['Brookfield'], agent: '', status: 'New', created: iso(0), score: null, needs: 'Saw 4 Maple Court online. Wants something similar under $550k, mortgage pending.', tl: [{ when: stamp(), who: 'Property portal', text: 'New inquiry received (simulated portal feed).' }] });
      paintNav(); toast('New portal inquiry from Jason Reed (simulated).');
      if (view === 'home' && role === 'office' && !q('.sda-modal')) render();
    });

    ready = true;
    render();
  });
})();
