/* SiteDesk – construction & fit-out project control (UAE). All people, projects and companies are fictional sample data.
   Nothing is sent anywhere: notifications, authority submissions and purchase orders are simulated; AI steps are simulated. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-build', function (root, ctx) {
    var esc = SDA.esc, money = SDA.money, usd = SDA.usd;
    var q = function (s, el) { return (el || root).querySelector(s); };
    var qa = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
    var ico = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (off) { var d = SDA.today(off); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var toDate = function (s) { return new Date(s + 'T12:00:00'); };
    var dateTxt = function (s) { return SDA.fmtDate(toDate(s)); };
    var shortD = function (s) { return toDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    var daysTo = function (s) { return Math.round((toDate(s) - toDate(iso(0))) / 864e5); };
    var dayTxt = function (s) { var n = daysTo(s); return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n === -1 ? 'Yesterday' : shortD(s); };
    var hhmm = function () { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
    var stamp = function () { return 'Today ' + hhmm(); };
    var find = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };
    var sum = function (arr, f) { return arr.reduce(function (s, x) { return s + f(x); }, 0); };
    var num = function (n) { return Number(n).toLocaleString('en-US'); };
    var initials = function (n) { return String(n || '?').split(' ').map(function (x) { return x.charAt(0); }).join('').slice(0, 2); };
    var monthLabel = function (d) { return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); };
    var toast = function (m, k) { SDA.toast(root, m, k); };

    var IC = {
      dash: ico('<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>'),
      diary: ico('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>'),
      snag: ico('<path d="M12 21s-6-5.4-6-10.5a6 6 0 0 1 12 0C18 15.6 12 21 12 21z"/><path d="M12 7.5V11M12 13.6v.01"/>'),
      permit: ico('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><circle cx="12" cy="13.5" r="2.5"/><path d="M10.6 15.8 10 20l2-1 2 1-.6-4.2"/>'),
      truck: ico('<path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
      claim: ico('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
      folder: ico('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
      helmet: ico('<path d="M3 18h18"/><path d="M5 18v-2a7 7 0 0 1 14 0v2"/><path d="M10 9.5V6.5a2 2 0 0 1 4 0v3"/>'),
      chart: ico('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
      wrench: ico('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>'),
      cam: ico('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
      mic: ico('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
      plus: ico('<path d="M12 5v14M5 12h14"/>'),
      back: ico('<path d="M15 18l-6-6 6-6"/>'),
      sun: ico('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
      users: ico('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3.2-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.7 2.8 2.3 3 4.7"/>'),
      alert: ico('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.01"/>'),
      clock: ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
      bell: ico('<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
      phone: ico('<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'),
      sync: ico('<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 3v5h5M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 21v-5h-5"/>'),
      pin: ico('<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
      x: SDA.icon.close, doc: SDA.icon.doc, check: SDA.icon.check, spark: SDA.icon.spark, upload: SDA.icon.upload, lock: SDA.icon.lock, img: SDA.icon.img
    };

    /* ================= people, companies, projects ================= */
    var CO = 'Dunecrest Interiors & Contracting LLC';
    var ME = { eng: 'Rajesh Kumar', pm: 'Aisha Rahman', sub: 'Daniel Harris' };
    var MYP = 'BB14', MYSUB = 'bw', RET = 0.10, VAT = 0.05;
    var role = 'eng';
    var SUBS = {
      bw: { name: 'Bluewave MEP Contracting LLC', s: 'Bluewave MEP', who: 'Daniel Harris' },
      an: { name: 'Al Noor Gypsum & Partitions LLC', s: 'Al Noor Gypsum', who: 'Imran Sheikh' },
      cj: { name: 'Crestline Joinery LLC', s: 'Crestline Joinery', who: 'Arjun Mehta' },
      sf: { name: 'Sandstone Flooring LLC', s: 'Sandstone Flooring', who: 'Fatima Al Ali' },
      bc: { name: 'Brightcoat Painting Services', s: 'Brightcoat Painting', who: 'Ravi Menon' },
      gl: { name: 'Glassline Aluminium & Glazing LLC', s: 'Glassline Glazing', who: 'James Taylor' }
    };
    var TRADES = [['Electrical', 'bw'], ['HVAC', 'bw'], ['Plumbing', 'bw'], ['Fire fighting', 'bw'], ['Drywall & ceilings', 'an'], ['Joinery', 'cj'], ['Flooring', 'sf'], ['Painting', 'bc'], ['Glazing', 'gl']];
    var tradeSub = function (t) { for (var i = 0; i < TRADES.length; i++) if (TRADES[i][0] === t) return TRADES[i][1]; return 'bw'; };
    var subS = function (k) { return k === 'own' ? 'Dunecrest (own)' : SUBS[k] ? SUBS[k].s : k; };
    var vendor = function (v) { return SUBS[v] ? SUBS[v].s : v; };

    var PROJ = [
      { id: 'BB14', short: 'Business Bay office', name: 'Office fit-out, Level 14', area: 'Business Bay', site: 'Bayview Tower, Level 14, Business Bay, Dubai', client: 'Meridian Capital Advisory', eng: 'Rajesh Kumar', progress: 62, contract: 1850000, budget: 1560000, base: 1284000, plan: 'office',
        ms: [['Approvals & permits', -96, -72, 100], ['Strip-out & services diversion', -74, -56, 100], ['Partitions & ceilings', -58, -2, 88], ['MEP first & second fix', -52, 22, 64], ['Joinery & finishes', -12, 38, 22], ['Testing, snagging & handover', 30, 54, 0]] },
      { id: 'DH', short: 'Dubai Hills villa', name: 'Villa, Plot 7 (G+1)', area: 'Dubai Hills', site: 'Plot 7, Dubai Hills, Dubai', client: 'Private client', eng: 'Omar Haddad', progress: 38, contract: 2400000, budget: 2050000, base: 1240000, plan: 'villa',
        ms: [['Piling & foundations', -160, -118, 100], ['Structure G+1 & roof', -120, -36, 100], ['Blockwork & plaster', -42, 14, 68], ['MEP rough-in', -14, 62, 18], ['Facade & finishes', 40, 150, 0], ['Landscape & handover', 140, 180, 0]] },
      { id: 'RW', short: 'Al Reem retail unit', name: 'Retail unit G-24', area: 'Al Reem Island', site: 'Reem Waterfront Mall, Unit G-24, Al Reem Island, Abu Dhabi', client: 'Saffron & Sage Café', eng: 'Priya Nair', progress: 81, contract: 420000, budget: 355000, base: 329000, plan: 'retail',
        ms: [['Landlord NOC & permits', -62, -48, 100], ['Shopfitting & joinery', -46, -6, 100], ['MEP & fire systems', -36, 4, 86], ['Signage & finishes', -6, 10, 55], ['Mall inspection & handover', 8, 14, 0]] },
      { id: 'DM', short: 'Dubai Marina restaurant', name: 'Restaurant fit-out, Unit R-03', area: 'Dubai Marina', site: 'Marina Promenade, Unit R-03, Dubai Marina, Dubai', client: 'Harbour Grill Group', eng: 'Khalid Al Suwaidi', progress: 12, contract: 980000, budget: 830000, base: 196000, plan: 'rest',
        ms: [['Design & authority approvals', -24, 12, 64], ['Strip-out', 6, 22, 0], ['Kitchen MEP & exhaust', 18, 70, 0], ['Interiors & joinery', 40, 96, 0], ['Inspections & handover', 92, 112, 0]] }
    ];
    var proj = function (id) { return find(PROJ, id); };
    var pS = function (id) { return proj(id).short; };
    PROJ.forEach(function (p) { p.start = p.ms[0][1]; p.end = p.ms[p.ms.length - 1][2]; });
    function msState(m) {
      var exp = Math.max(0, Math.min(1, (0 - m[1]) / (m[2] - m[1]))) * 100;
      return { exp: exp, behind: m[3] < 100 && m[3] < exp - 8, days: Math.round((exp - m[3]) / 100 * (m[2] - m[1])) };
    }
    function progState(p) {
      var late = p.ms.filter(function (m) { return msState(m).behind; });
      if (!late.length) return { ok: true, txt: 'On programme' };
      return { ok: false, txt: '~' + Math.max.apply(null, late.map(function (m) { return msState(m).days; })) + ' days behind', what: late[0][0] };
    }

    /* floor plans (viewBox 600 x 380): [name, label, x, y, w, h] */
    var PLANS = {
      office: { label: 'Level 14 · GA plan rev D', rooms: [['Reception', 'Reception', 20, 20, 130, 110], ['Board room', 'Board room', 150, 20, 150, 110], ['Meeting room 1', 'Mtg 1', 300, 20, 95, 110], ['Meeting room 2', 'Mtg 2', 395, 20, 95, 110], ['CEO office', 'CEO', 490, 20, 90, 110], ['Open office', 'Open office', 20, 150, 370, 210], ['Pantry', 'Pantry', 390, 150, 100, 100], ['Server room', 'Server', 490, 150, 90, 100], ['Washrooms', 'Washrooms', 390, 250, 190, 110]] },
      villa: { label: 'Ground floor · A-101 rev 3', rooms: [['Majlis', 'Majlis', 20, 20, 170, 150], ['Living room', 'Living', 190, 20, 220, 150], ['Dining room', 'Dining', 410, 20, 170, 150], ['Entrance hall', 'Entrance', 20, 190, 120, 170], ['Stairs', 'Stairs', 140, 190, 90, 170], ['Kitchen', 'Kitchen', 230, 190, 180, 170], ['Maid’s room', 'Maid', 410, 190, 90, 170], ['Store', 'Store', 500, 190, 80, 170]] },
      retail: { label: 'Unit G-24 · layout rev F', rooms: [['Shopfront', 'Shopfront', 20, 20, 560, 40], ['Sales floor', 'Sales floor', 20, 60, 340, 300], ['Coffee bar', 'Coffee bar', 360, 60, 220, 140], ['Back of house', 'BOH', 360, 200, 140, 160], ['Staff WC', 'WC', 500, 200, 80, 80], ['Store', 'Store', 500, 280, 80, 80]] },
      rest: { label: 'Unit R-03 · layout rev 1', rooms: [['Terrace', 'Terrace', 20, 20, 560, 70], ['Dining hall', 'Dining hall', 20, 90, 330, 270], ['Bar', 'Bar', 350, 90, 230, 90], ['Kitchen', 'Kitchen', 350, 180, 160, 180], ['Cold store', 'Cold', 510, 180, 70, 90], ['Washrooms', 'WC', 510, 270, 70, 90]] }
    };
    function roomAt(key, x, y) {
      var px = x * 6, py = y * 3.8, r = PLANS[key].rooms;
      for (var i = 0; i < r.length; i++) if (px >= r[i][2] && px <= r[i][2] + r[i][4] && py >= r[i][3] && py <= r[i][3] + r[i][5]) return r[i][0];
      return 'Corridor';
    }

    /* ================= snags ================= */
    var KIND = { Electrical: 'install', HVAC: 'leak', Plumbing: 'leak', 'Fire fighting': 'install', 'Drywall & ceilings': 'damage', Joinery: 'room', Flooring: 'damage', Painting: 'damage', Glazing: 'damage' };
    var SN = [], snSeq = { BB14: 0, DH: 0, RW: 0, DM: 0 }, PBASE = { BB14: 1, DH: 2, RW: 3, DM: 4 };
    function newSnagId(p) { snSeq[p]++; return { n: snSeq[p], id: 'SN-' + PBASE[p] + pad(snSeq[p]) }; }
    [
      ['BB14', 73, 18, 'Ceiling tile stained next to AC diffuser', 'HVAC', 'High', -1, 'Open', -4, 'Rajesh Kumar'],
      ['BB14', 37, 22, 'Hairline crack in gypsum joint above door', 'Drywall & ceilings', 'Medium', 2, 'Open', -3, 'Rajesh Kumar'],
      ['BB14', 30, 70, 'Floor box cover missing at desk cluster C', 'Electrical', 'Medium', 3, 'Ready to verify', -3, 'Rajesh Kumar'],
      ['BB14', 73, 50, 'Cabinet door hinge misaligned', 'Joinery', 'Low', 5, 'Open', -2, 'Rajesh Kumar'],
      ['BB14', 12, 24, 'Paint touch-up on reception feature wall', 'Painting', 'Low', -2, 'Closed', -8, 'Rajesh Kumar'],
      ['BB14', 86, 82, 'Basin 2 drains slowly', 'Plumbing', 'High', 1, 'Reopened', -6, 'Rajesh Kumar'],
      ['DH', 15, 25, 'Gypsum bulkhead edge damaged', 'Drywall & ceilings', 'Low', 6, 'Open', -2, 'Omar Haddad'],
      ['DH', 55, 70, 'Conduit not clipped above kitchen ceiling', 'Electrical', 'Medium', 2, 'Open', -1, 'Omar Haddad'],
      ['DH', 75, 72, 'Sealant gap at window frame', 'Glazing', 'Low', 4, 'Open', -1, 'Omar Haddad'],
      ['RW', 40, 10, 'Scratch on shopfront glass panel 3', 'Glazing', 'High', 1, 'Open', -3, 'Priya Nair'],
      ['RW', 72, 70, 'Exit sign above BOH door not illuminated', 'Fire fighting', 'High', 0, 'Open', -2, 'Priya Nair'],
      ['RW', 30, 60, 'Gap at skirting next to column', 'Flooring', 'Medium', 2, 'Ready to verify', -4, 'Priya Nair']
    ].forEach(function (a) {
      var k = newSnagId(a[0]), p = proj(a[0]);
      var s = { id: k.id, n: k.n, p: a[0], x: a[1], y: a[2], room: roomAt(p.plan, a[1], a[2]), title: a[3], trade: a[4], sub: tradeSub(a[4]), pri: a[5], due: iso(a[6]), st: a[7], created: iso(a[8]), by: a[9], photos: [], after: [], log: [] };
      s.photos.push({ src: SDA.art(KIND[s.trade], s.id + ' · ' + s.room), by: s.by });
      s.log.push({ when: dateTxt(s.created), who: s.by, text: 'Snag logged on the plan with photo. ' + SUBS[s.sub].s + ' notified (simulated, not sent).' });
      if (s.st === 'Ready to verify' || s.st === 'Closed') { s.after.push({ src: SDA.art('room', 'After fix · ' + s.id), by: SUBS[s.sub].who }); s.log.push({ when: s.st === 'Closed' ? dateTxt(iso(-3)) : 'Today 08:10', who: SUBS[s.sub].who + ' · ' + SUBS[s.sub].s, text: 'Marked fixed and uploaded an after-photo.' }); }
      if (s.st === 'Closed') s.log.push({ when: dateTxt(iso(-2)), who: s.by, text: 'Verified on site and closed.' });
      if (s.st === 'Reopened') { s.after.push({ src: SDA.art('leak', 'After fix · ' + s.id), by: SUBS[s.sub].who }); s.reason = 'Still draining slowly after 30 seconds of running water.'; s.log.push({ when: dateTxt(iso(-2)), who: SUBS[s.sub].who + ' · ' + SUBS[s.sub].s, text: 'Marked fixed: trap cleaned.' }); s.log.push({ when: dateTxt(iso(-1)), who: s.by, text: 'Rejected: ' + s.reason + ' Reopened.' }); }
      SN.push(s);
    });
    var open = function (s) { return s.st === 'Open' || s.st === 'Reopened'; };
    var overdue = function (s) { return s.st !== 'Closed' && daysTo(s.due) < 0; };
    var stKey = function (s) { return s.st === 'Ready to verify' ? 'verify' : s.st === 'Closed' ? 'closed' : s.st === 'Reopened' ? 'reopen' : 'open'; };
    var snPill = function (s) { var c = s.st === 'Closed' ? 'p-ok' : s.st === 'Reopened' ? 'p-bad' : s.st === 'Ready to verify' ? 'p-info' : 'p-warn'; return '<span class="pill ' + c + '">' + esc(s.st) + '</span>'; };
    var priPill = function (p) { return '<span class="sd-pri pr-' + p.toLowerCase() + '">' + p + '</span>'; };
    function suggestTrade(t) {
      var R = [[/sprinkler|fire|smoke|exit sign|alarm/i, 'Fire fighting'], [/\bac\b|a\/c|duct|diffuser|grille|fcu|thermostat|cooling|hvac/i, 'HVAC'], [/socket|switch|light|cable|power|floor box|breaker|\bled\b|db\b/i, 'Electrical'], [/leak|drain|tap|basin|\bwc\b|toilet|pipe|water/i, 'Plumbing'], [/glass|glazing|window|mirror|facade/i, 'Glazing'], [/door|hinge|cabinet|joinery|wardrobe|counter|veneer|handle/i, 'Joinery'], [/carpet|skirting|tile|grout|vinyl|floor/i, 'Flooring'], [/paint|touch-up|scuff|stain on wall/i, 'Painting'], [/ceiling|gypsum|partition|bulkhead|crack/i, 'Drywall & ceilings']];
      for (var i = 0; i < R.length; i++) if (R[i][0].test(t)) return R[i][1];
      return null;
    }

    /* ================= permits ================= */
    var PERMITS = [
      { id: 'PM-11', p: 'BB14', name: 'Fit-out NOC from landlord', auth: 'Landlord / building management', ref: 'BVT-NOC-2291', st: 'Approved', exp: iso(118), missing: [] },
      { id: 'PM-12', p: 'BB14', name: 'Building permit (fit-out)', auth: 'Municipality', ref: 'BP-FO-48812', st: 'Approved', exp: iso(210), missing: [] },
      { id: 'PM-13', p: 'BB14', name: 'Civil defence fire inspection', auth: 'Civil defence', ref: 'CD-INS-77310', st: 'Inspection booked', insp: iso(1), inspT: '10:00', missing: [] },
      { id: 'PM-14', p: 'BB14', name: 'Utility connection (power load increase)', auth: 'Electricity & water utility', ref: 'UT-LD-10457', st: 'Missing documents', missing: ['Load schedule signed by consultant', 'Single line diagram rev C'] },
      { id: 'PM-21', p: 'DH', name: 'Building permit', auth: 'Municipality', ref: 'BP-NB-30177', st: 'Approved', exp: iso(300), missing: [] },
      { id: 'PM-22', p: 'DH', name: 'Utility connection (water & power)', auth: 'Electricity & water utility', ref: 'UT-NC-88120', st: 'In review', sub: iso(-12), missing: [] },
      { id: 'PM-23', p: 'DH', name: 'Site access & hoarding permit', auth: 'Master developer', ref: 'MD-SA-5521', st: 'Approved', exp: iso(9), missing: [] },
      { id: 'PM-31', p: 'RW', name: 'Fit-out NOC from landlord', auth: 'Mall management', ref: 'RWM-FO-0624', st: 'Approved', exp: iso(5), missing: [] },
      { id: 'PM-32', p: 'RW', name: 'Civil defence fire inspection', auth: 'Civil defence', ref: 'CD-INS-80442', st: 'Missing documents', missing: ['Fire alarm test certificate'] },
      { id: 'PM-33', p: 'RW', name: 'Building permit (fit-out)', auth: 'Municipality', ref: 'BP-FO-51009', st: 'Approved', exp: iso(90), missing: [] },
      { id: 'PM-41', p: 'DM', name: 'Fit-out NOC from landlord', auth: 'Landlord / building management', ref: 'MP-NOC-1180', st: 'In review', sub: iso(-6), missing: [] },
      { id: 'PM-42', p: 'DM', name: 'Building permit (fit-out)', auth: 'Municipality', ref: '—', st: 'Not started', missing: ['NOC from landlord', 'Approved drawing set'] }
    ];
    PERMITS.forEach(function (p) { p.remind = true; p.done = []; p.log = [{ when: dateTxt(iso(p.st === 'Not started' ? -3 : -40)), who: 'Aisha Rahman', text: p.st === 'Not started' ? 'Permit added to the tracker.' : 'Application submitted to ' + p.auth + ' (simulated).' }]; if (p.st === 'Approved') p.log.push({ when: dateTxt(iso(-30)), who: p.auth, text: 'Approved. Valid until ' + dateTxt(p.exp) + '.' }); });
    var expSoon = function (p) { return p.exp && p.st === 'Approved' && daysTo(p.exp) <= 21; };
    var atRisk = function (p) { return expSoon(p) || p.st === 'Missing documents' || p.st === 'Re-inspection needed'; };
    var pmPill = function (p) {
      if (expSoon(p)) return '<span class="pill p-bad">Expires in ' + daysTo(p.exp) + ' day' + (daysTo(p.exp) === 1 ? '' : 's') + '</span>';
      var c = p.st === 'Approved' ? 'p-ok' : /Missing|Re-insp/.test(p.st) ? 'p-bad' : p.st === 'Not started' ? 'p-dim' : /Inspection|review|submitted|Ready/i.test(p.st) ? 'p-info' : 'p-warn';
      return '<span class="pill ' + c + '">' + esc(p.st) + '</span>';
    };

    /* ================= material requests ================= */
    var MRS = [
      { id: 'MR-201', p: 'BB14', item: 'Moisture-resistant gypsum board 12.5 mm', qty: 180, unit: 'sheets', trade: 'Drywall & ceilings', need: iso(4), by: 'Rajesh Kumar', raised: iso(-1), st: 'Quotes in', quotes: [{ v: 'Desert Gypsum Supplies', amt: 2340, days: 2 }, { v: 'Gulf Build Materials', amt: 2190, days: 6 }, { v: 'Coastline Trading', amt: 2460, days: 1 }] },
      { id: 'MR-202', p: 'BB14', item: 'LED panel light 600×600, 4000 K', qty: 64, unit: 'nos', trade: 'Electrical', need: iso(8), by: 'Rajesh Kumar', raised: iso(-1), st: 'Awaiting quotes', quotes: [{ v: 'Brightline Electrical Supplies', amt: 5248, days: 5 }, { v: 'bw', pending: true }] },
      { id: 'MR-203', p: 'BB14', item: 'Porcelain floor tiles 600×600 (washrooms)', qty: 85, unit: 'm²', trade: 'Flooring', need: iso(0), by: 'Rajesh Kumar', raised: iso(-9), st: 'Dispatched', quotes: [{ v: 'Al Waha Ceramics Trading', amt: 3315, days: 7 }], pick: 0, po: 'PO-3104', dn: 'DN-55821' },
      { id: 'MR-204', p: 'DH', item: 'Copper pipe 22 mm, type L', qty: 120, unit: 'm', trade: 'Plumbing', need: iso(-3), by: 'Omar Haddad', raised: iso(-12), st: 'Delivered', quotes: [{ v: 'Gulf Build Materials', amt: 1980, days: 4 }], pick: 0, po: 'PO-3097', dn: 'DN-55410' },
      { id: 'MR-205', p: 'RW', item: 'Fire-rated access panel 600×600', qty: 6, unit: 'nos', trade: 'Fire fighting', need: iso(3), by: 'Priya Nair', raised: iso(-4), st: 'Approved', quotes: [{ v: 'bw', amt: 1470, days: 3 }, { v: 'Coastline Trading', amt: 1620, days: 5 }], pick: 0, po: 'PO-3109' },
      { id: 'MR-206', p: 'DM', item: 'Galvanised kitchen exhaust duct', qty: 40, unit: 'm', trade: 'HVAC', need: iso(18), by: 'Khalid Al Suwaidi', raised: iso(-2), st: 'Awaiting quotes', quotes: [{ v: 'Coastline Trading', amt: 6800, days: 10 }, { v: 'bw', pending: true }] }
    ];
    var seq = { MR: 206, PO: 3109, DR: 0 };
    var picked = function (m) { return m.pick != null ? m.quotes[m.pick] : null; };
    var mrDoneIdx = { 'Awaiting quotes': 0, 'Quotes in': 1, Approved: 2, Dispatched: 3, Delivered: 4, Rejected: 0 };
    var mrPill = function (m) { var c = m.st === 'Delivered' ? 'p-ok' : m.st === 'Rejected' ? 'p-bad' : m.st === 'Quotes in' ? 'p-warn' : m.st === 'Dispatched' ? 'p-info' : m.st === 'Approved' ? 'p-ok' : 'p-dim'; return '<span class="pill ' + c + '">' + (m.st === 'Approved' ? 'PO issued' : esc(m.st)) + '</span>'; };
    var committed = function (p) { return p.base + sum(MRS.filter(function (m) { return m.p === p.id && /Approved|Dispatched|Delivered/.test(m.st); }), function (m) { return picked(m).amt; }); };

    /* ================= subcontracts & progress claims ================= */
    var SC = [
      { id: 'SC-11', sub: 'bw', p: 'BB14', lines: [['Electrical first & second fix', 148000], ['HVAC ductwork & diffusers', 126000], ['Plumbing & drainage', 42000], ['Fire alarm & sprinkler modifications', 52000], ['Testing & commissioning', 18000]], cum: [70, 55, 50, 40, 0] },
      { id: 'SC-12', sub: 'an', p: 'BB14', lines: [['Gypsum partitions', 96000], ['Suspended ceilings', 118000], ['Bulkheads & access panels', 22000]], cum: [90, 80, 60] },
      { id: 'SC-13', sub: 'cj', p: 'BB14', lines: [['Reception desk & feature wall', 64000], ['Pantry joinery', 38000], ['Doors & ironmongery', 57000]], cum: [30, 20, 25] },
      { id: 'SC-21', sub: 'bw', p: 'DH', lines: [['Electrical rough-in', 88000], ['Plumbing rough-in', 54000], ['HVAC split & ducted units', 70000]], cum: [20, 15, 0] },
      { id: 'SC-31', sub: 'bw', p: 'RW', lines: [['Fire alarm & emergency lighting', 36000], ['Sprinkler modifications', 24000], ['Power & lighting', 41000]], cum: [80, 75, 90] },
      { id: 'SC-32', sub: 'sf', p: 'RW', lines: [['Porcelain tiling', 42000], ['Skirting & thresholds', 6000]], cum: [100, 80] }
    ];
    SC.forEach(function (s) { s.value = sum(s.lines, function (l) { return l[1]; }); });
    var CLAIMS = [], clSeq = 0;
    var periodOf = function (s) { var d = toDate(s); d.setDate(1); d.setMonth(d.getMonth() - 1); return monthLabel(d); };
    function mkClaim(scId, no, st, prev, pct, off, check) {
      var sc = find(SC, scId);
      var c = { id: 'CL-' + (++clSeq), sc: scId, sub: sc.sub, p: sc.p, no: no, code: 'PC-' + pad(no), st: st, sent: iso(off), period: periodOf(iso(off)), by: SUBS[sc.sub].who,
        lines: sc.lines.map(function (l, i) { return { d: l[0], v: l[1], prev: prev[i], pct: pct[i] }; }), check: check || null, log: [] };
      c.log.push({ when: dateTxt(c.sent), who: c.by + ' · ' + SUBS[c.sub].s, text: 'Progress claim submitted.' });
      if (st !== 'Submitted') { c.cert = pct.slice(); c.log.push({ when: dateTxt(iso(off + 3)), who: 'Aisha Rahman', text: 'Certified. Payment certificate issued.' }); }
      if (st === 'Paid') c.log.push({ when: dateTxt(iso(off + 10)), who: 'Accounts', text: 'Paid (simulated).' });
      CLAIMS.push(c); return c;
    }
    mkClaim('SC-11', 4, 'Paid', [55, 40, 35, 25, 0], [70, 55, 50, 40, 0], -36);
    mkClaim('SC-11', 5, 'Submitted', [70, 55, 50, 40, 0], [82, 68, 65, 55, 0], -2, { i: 1, site: 64, why: 'Yesterday’s daily report and open snag SN-101 show the diffusers in meeting rooms 1 and 2 are not installed yet.' });
    mkClaim('SC-12', 6, 'Certified', [75, 62, 40], [90, 80, 60], -9);
    mkClaim('SC-13', 3, 'Submitted', [30, 20, 25], [45, 40, 35], -1);
    mkClaim('SC-21', 1, 'Paid', [0, 0, 0], [20, 15, 0], -30);
    mkClaim('SC-31', 3, 'Certified', [60, 50, 70], [80, 75, 90], -12);
    mkClaim('SC-32', 2, 'Paid', [60, 40], [100, 80], -20);
    function calc(c, pcts) {
      var g = 0, pg = 0;
      c.lines.forEach(function (l, i) { g += l.v * (pcts ? pcts[i] : l.pct) / 100; pg += l.v * l.prev / 100; });
      g = Math.round(g); pg = Math.round(pg);
      var ret = Math.round(g * RET), prevNet = Math.round(pg * (1 - RET)), due = g - ret - prevNet, vat = Math.round(due * VAT);
      return { g: g, ret: ret, prevNet: prevNet, due: due, vat: vat, tot: due + vat };
    }
    var clPill = function (c) { var k = c.st === 'Paid' || c.st === 'Certified' ? 'p-ok' : c.st === 'Returned' ? 'p-bad' : 'p-warn'; return '<span class="pill ' + k + '">' + esc(c.st) + '</span>'; };
    var clLink = function (c) { return c.code + ' · ' + SUBS[c.sub].s + ' · ' + pS(c.p); };
    var scCert = function (sc) { return Math.round(sc.lines.reduce(function (s, l, i) { return s + l[1] * sc.cum[i] / 100; }, 0)); };
    var certified = function (p) { return sum(SC.filter(function (s) { return s.p === p.id; }), scCert); };
    var openClaim = function (sc) { return CLAIMS.filter(function (c) { return c.sc === sc.id && /Submitted|Returned/.test(c.st); })[0]; };

    /* ================= daily reports ================= */
    var month = new Date().getMonth() + 1, md = month * 100 + new Date().getDate();
    var SUMMER = md >= 615 && md <= 915;
    var WX = SUMMER ? { t: 44, hi: 46, h: 38, txt: 'Very hot, clear sky' } : month >= 11 || month <= 3 ? { t: 29, hi: 31, h: 58, txt: 'Sunny, light breeze' } : { t: 37, hi: 39, h: 45, txt: 'Hot and sunny' };
    var HEAT = SUMMER ? { on: true, t: 'Midday work break in force (12:30–15:00)', s: 'No outdoor work in direct sun. Shade, cold water and rest areas must be ready.' }
      : { on: false, t: 'Reminder: summer midday work break (12:30–15:00, mid-June to mid-September)', s: 'Not in force today. The heat-stress plan still applies: water, shade and breaks.' };
    var REPORTS = [];
    function addReport(r) { r.id = 'DR-' + (++seq.DR); r.total = sum(r.mp, function (m) { return m.n; }); REPORTS.push(r); return r; }
    addReport({ p: 'DH', date: iso(0), time: '09:40', by: 'Omar Haddad', wx: WX, mp: [{ trade: 'Blockwork & plaster', co: 'own', n: 14 }, { trade: 'MEP', co: 'bw', n: 6 }, { trade: 'General labour', co: 'own', n: 4 }, { trade: 'HSE', co: 'own', n: 1 }],
      work: ['Blockwork to first floor bedrooms 3 and 4 completed', 'Conduit rough-in started in kitchen and majlis'], delays: [], next: ['Utility inspector visit for the water connection next week'], heat: ['Water and shade stations checked at 07:00'], notes: [], photos: [{ src: SDA.art('room', 'Dubai Hills villa · first floor') }] });
    addReport({ p: 'RW', date: iso(0), time: '08:55', by: 'Priya Nair', wx: WX, mp: [{ trade: 'Flooring', co: 'sf', n: 3 }, { trade: 'MEP', co: 'bw', n: 4 }, { trade: 'Signage', co: 'own', n: 2 }, { trade: 'General labour', co: 'own', n: 2 }],
      work: ['Coffee bar counter top installed', 'Emergency lighting test in sales floor done'], delays: ['Signage drawing still waiting for mall approval'], next: ['Mall pre-handover walk-through on ' + shortD(iso(8))], heat: [], notes: ['Noisy works only before 10:00 (mall rule)'], photos: [{ src: SDA.art('room', 'Al Reem retail unit · sales floor') }] });
    addReport({ p: 'BB14', date: iso(-1), time: '17:42', by: 'Rajesh Kumar', wx: WX, mp: [{ trade: 'Drywall & ceilings', co: 'an', n: 12 }, { trade: 'MEP', co: 'bw', n: 8 }, { trade: 'Joinery', co: 'cj', n: 4 }, { trade: 'Painting', co: 'bc', n: 3 }, { trade: 'General labour', co: 'own', n: 4 }],
      work: ['Ceiling grid completed in board room', 'Flexible ducts connected in open office zone B'], delays: ['Gypsum board stock low, MR-201 raised'], next: ['Civil defence fire inspection ' + dayTxt(iso(1)).toLowerCase() + ' 10:00'], heat: ['Extra water break at 14:00'], notes: [], photos: [{ src: SDA.art('room', 'Business Bay office · board room') }] });
    addReport({ p: 'DM', date: iso(-1), time: '16:05', by: 'Khalid Al Suwaidi', wx: WX, mp: [{ trade: 'Survey & setting out', co: 'own', n: 3 }],
      work: ['Measured survey of unit R-03 completed'], delays: ['Landlord NOC still in review'], next: [], heat: [], notes: [], photos: [] });
    var NOTE = '34 on site today. 12 gypsum guys from Al Noor, 8 Bluewave MEP, 6 Crestline joinery, 4 painters, 4 own labour. Ceiling boarding done in meeting rooms 1 and 2. Electrical first fix in open office about 80 percent. Reception joinery delivery came 2 hours late, waiting for the fixing kit. Consultant inspection of AC ducts tomorrow 10am. Hot afternoon, extra water breaks.';
    var MP_KEYS = [[/gypsum|ceiling|partition|al noor/i, 'Drywall & ceilings', 'an'], [/mep|electric|hvac|duct|plumb|bluewave/i, 'MEP', 'bw'], [/joiner|carpent|crestline/i, 'Joinery', 'cj'], [/paint|brightcoat/i, 'Painting', 'bc'], [/floor|tiler|sandstone/i, 'Flooring', 'sf'], [/glaz|glass/i, 'Glazing', 'gl'], [/safety|hse|first aid/i, 'HSE', 'own'], [/own|labou?r|helper|cleaner/i, 'General labour', 'own']];
    function parseNote(t) {
      var o = { mp: [], work: [], delays: [], next: [], heat: [], notes: [], stated: null };
      String(t || '').split(/[.,;\n]+/).forEach(function (raw) {
        var c = raw.trim(); if (!c) return;
        var S = c.charAt(0).toUpperCase() + c.slice(1), n = c.match(/\d+/);
        if (/late|delay|waiting|stopp|on hold|short of|missing|not arrived|breakdown/i.test(c)) return o.delays.push(S);
        if (/done|finish|complet|installed|percent|%|boarded|fixed|started|progress/i.test(c)) return o.work.push(S);
        if (/inspection|tomorrow|visit|meeting|test/i.test(c)) return o.next.push(S);
        if (/hot|heat|water break|midday|shade|humid/i.test(c)) return o.heat.push(S);
        if (n) {
          for (var i = 0; i < MP_KEYS.length; i++) if (MP_KEYS[i][0].test(c)) {
            var ex = o.mp.filter(function (m) { return m.trade === MP_KEYS[i][1]; })[0];
            if (ex) ex.n += +n[0]; else o.mp.push({ trade: MP_KEYS[i][1], co: MP_KEYS[i][2], n: +n[0] });
            return;
          }
          if (/on site|total|people|workers|men|guys|today/i.test(c)) { o.stated = +n[0]; return; }
        }
        o.notes.push(S);
      });
      o.total = sum(o.mp, function (m) { return m.n; });
      return o;
    }
    function delayImpact(d) {
      var p = proj(MYP), map = [[/joiner|reception|pantry|door/i, 'Joinery & finishes'], [/gypsum|ceiling|board|partition/i, 'Partitions & ceilings'], [/electric|duct|mep|ac\b|cable|light/i, 'MEP first & second fix']];
      for (var i = 0; i < map.length; i++) if (map[i][0].test(d)) { var m = p.ms.filter(function (x) { return x[0] === map[i][1]; })[0]; return 'May affect “' + m[0] + '” (planned finish ' + shortD(iso(m[2])) + ').'; }
      return 'No programme impact detected.';
    }

    /* ================= office sync feed (engineer) ================= */
    var FEED = [
      { when: 'Today 08:10', who: 'Daniel Harris · Bluewave MEP', text: 'After-photo uploaded for SN-103. Ready to verify.' },
      { when: 'Today 07:55', who: 'Aisha Rahman', text: 'Civil defence fire inspection confirmed for tomorrow 10:00.' },
      { when: 'Yesterday 17:42', who: 'Rajesh Kumar', text: 'Daily report submitted (31 on site).' }
    ];
    function feed(text, who, p) { if (p && p !== MYP) return; FEED.unshift({ when: stamp(), who: who || ME[role], text: text }); }

    /* ================= documents ================= */
    var sample = 'Sample document for demonstration only.';
    var BB_SUBS = ['bw', 'an', 'cj', 'bc', 'sf'];
    function drw(p, code, title, rev, subs) {
      var pr = proj(p);
      return { name: code + ' ' + title + ' rev ' + rev + '.pdf', type: 'pdf', folder: 'Drawings', project: p, subs: subs, linked: pr.short, owner: 'Design team', status: 'For construction', tags: ['rev ' + rev, pr.area],
        title: code + ' · ' + title, company: CO, meta: [['Project', pr.name + ', ' + pr.area], ['Revision', rev], ['Scale', '1:100 @ A1'], ['Status', 'Issued for construction']],
        sections: [{ h: 'Revision history', rows: [['Rev', 'Date', 'Description'], [rev, dateTxt(iso(-14)), 'Issued for construction'], [isNaN(rev) ? String.fromCharCode(rev.charCodeAt(0) - 1) : String(rev - 1), dateTxt(iso(-41)), 'Revised after consultant comments']] }, { h: 'Notes', lines: ['All dimensions in mm. Do not scale from the drawing.', 'Coordinate with MEP and reflected ceiling plans before setting out.', 'Sample drawing sheet for demonstration only.'] }] };
    }
    function permitDoc(pm) {
      var pr = proj(pm.p);
      return { name: pm.name + ' – ' + pr.short + '.pdf', type: 'pdf', folder: 'Permits', project: pm.p, linked: pm.id + ' · ' + pm.name, owner: 'Aisha Rahman', status: expSoon(pm) ? 'Expiring' : 'Valid', tags: [pm.auth], permit: pm.id,
        title: pm.name, company: pm.auth + ' (generic authority)', meta: [['Reference', pm.ref], ['Project', pr.site], ['Issued to', CO], ['Valid until', pm.exp ? dateTxt(pm.exp) : '—']],
        sections: [{ h: 'Scope', p: pm.name + ' for ' + pr.name + ', client ' + pr.client + '.' }, { h: 'Conditions', lines: ['Keep a copy of this approval on site at all times.', 'Works outside approved hours need written consent.', 'Any change to the approved layout needs a revised submission.'] }, { p: sample }] };
    }
    function msDoc(code, title, sub, p, status, extra) {
      return { name: code + ' ' + title + ' – ' + SUBS[sub].s + '.pdf', type: 'pdf', folder: 'Method statements', project: p, subs: [sub], linked: pS(p), owner: SUBS[sub].who, status: status, tags: [SUBS[sub].s], ms: code,
        title: 'Method statement ' + code + ': ' + title, company: SUBS[sub].name, meta: [['Project', proj(p).site], ['Prepared by', SUBS[sub].who], ['Main contractor', CO]],
        sections: [{ h: 'Sequence of work', lines: extra }, { h: 'Hazards and controls', rows: [['Hazard', 'Control'], ['Work at height', 'Mobile scaffold with guardrails, harness above 2 m'], ['Heat stress', 'Water, shade, rest breaks; midday break 12:30–15:00 in summer'], ['Dust and noise', 'Extraction, masks, noisy works before 10:00 in occupied buildings']] }, { h: 'PPE', p: 'Helmet, safety shoes, high-visibility vest, gloves and eye protection.' }, { p: sample }] };
    }
    function irDoc(code, title, p, subs, rows, status) {
      return { name: code + ' ' + title + '.pdf', type: 'pdf', folder: 'Inspection reports', project: p, subs: subs, linked: pS(p), owner: proj(p).eng, status: status || 'Passed',
        title: code + ' · ' + title, company: CO, meta: [['Project', proj(p).site], ['Inspected by', proj(p).eng + ' with consultant'], ['Date', dateTxt(iso(-6))]],
        sections: [{ h: 'Checklist', rows: [['Item', 'Result']].concat(rows) }, { p: sample }] };
    }
    function claimDoc(c, kind) {
      var k = calc(c, kind === 'cert' ? c.cert : null), pcts = kind === 'cert' ? c.cert : c.lines.map(function (l) { return l.pct; });
      return { name: c.code + ' ' + (kind === 'cert' ? 'Payment certificate' : 'Progress claim') + ' – ' + SUBS[c.sub].s + ' – ' + pS(c.p) + '.pdf', type: 'pdf', folder: 'Claims', project: c.p, subs: [c.sub], linked: clLink(c), owner: kind === 'cert' ? 'Aisha Rahman' : c.by, status: kind === 'cert' ? 'Certified' : (c.st === 'Submitted' ? 'Pending' : c.st), tags: [c.period], claim: c.id, kind: kind,
        title: (kind === 'cert' ? 'Payment certificate ' : 'Progress claim ') + c.code, company: kind === 'cert' ? CO : SUBS[c.sub].name,
        meta: [['Subcontractor', SUBS[c.sub].name], ['Project', proj(c.p).name + ', ' + proj(c.p).area], ['Period', c.period], ['Subcontract', c.sc]],
        sections: [{ h: 'Valuation (cumulative)', rows: [['Item', 'Value', 'Prev. %', (kind === 'cert' ? 'Certified' : 'Claimed') + ' %']].concat(c.lines.map(function (l, i) { return [l.d, money(l.v), l.prev + '%', pcts[i] + '%']; })) },
          { h: 'Summary', rows: [['', 'USD'], ['Gross value of work done to date', money(k.g)], ['Less retention 10%', '−' + money(k.ret)], ['Less previously certified (net)', '−' + money(k.prevNet)], ['Net amount due', money(k.due)], ['VAT 5%', money(k.vat)], ['Total payable', money(k.tot)]], head: false },
          { p: kind === 'cert' ? 'Certified by Aisha Rahman, Project Manager. Retention released 50% at handover, 50% after the defects liability period. ' + sample : sample }] };
    }
    function reportDoc(r) {
      return { name: 'Daily site report – ' + pS(r.p) + ' – ' + dateTxt(r.date) + '.pdf', type: 'pdf', folder: 'Site reports', project: r.p, linked: r.id + ' · ' + pS(r.p), owner: r.by, status: 'Submitted', report: r.id,
        title: 'Daily site report · ' + dateTxt(r.date), company: CO, meta: [['Project', proj(r.p).site], ['Engineer', r.by], ['Weather', r.wx.t + '°C, humidity ' + r.wx.h + '%'], ['Manpower', r.total + ' on site']],
        sections: [{ h: 'Manpower by trade', rows: [['Trade', 'Company', 'Headcount']].concat(r.mp.map(function (m) { return [m.trade, subS(m.co), String(m.n)]; })) }, { h: 'Work done', lines: r.work.length ? r.work : ['—'] }, { h: 'Delays', lines: r.delays.length ? r.delays : ['None reported'] }, { h: 'Coming up', lines: r.next.length ? r.next : ['—'] }, { h: 'Heat and safety', lines: [HEAT.t].concat(r.heat) }, { p: (r.photos.length ? r.photos.length + ' site photo(s) attached. ' : '') + sample }] };
    }
    function poDoc(m) {
      var qt = picked(m);
      return { name: m.po + ' – ' + m.item + '.pdf', type: 'pdf', folder: 'Procurement', project: m.p, subs: SUBS[qt.v] ? [qt.v] : [], linked: m.id + ' · ' + pS(m.p), owner: 'Aisha Rahman', status: 'Issued', mr: m.id,
        title: 'Purchase order ' + m.po, company: CO, meta: [['Supplier', SUBS[qt.v] ? SUBS[qt.v].name : qt.v], ['Deliver to', proj(m.p).site], ['Need by', dateTxt(m.need)]],
        sections: [{ h: 'Order', rows: [['Item', 'Qty', 'Amount'], [m.item, m.qty + ' ' + m.unit, money(qt.amt)], ['VAT 5%', '', money(Math.round(qt.amt * VAT))], ['Total', '', money(Math.round(qt.amt * (1 + VAT)))]] }, { h: 'Terms', lines: ['Delivery to site between 07:00 and 12:00, call the site engineer 30 minutes before arrival.', 'Delivery note must quote ' + m.po + ' and ' + m.id + '.', 'Payment 60 days after delivery.'] }, { p: sample }] };
    }
    function photoDoc(s, ph, kind) {
      return { name: s.id + ' ' + kind + ' photo.jpg', type: 'jpg', folder: 'Snag photos', project: s.p, subs: [s.sub], linked: s.id + ' · ' + s.title, owner: ph.by, status: kind === 'after' ? 'After fix' : 'Before', img: ph.src, snag: s.id };
    }

    var DOCS = [
      drw('BB14', 'BB14-A-101', 'General arrangement plan', 'D', BB_SUBS), drw('BB14', 'BB14-A-110', 'Reflected ceiling plan', 'C', ['an', 'bw']), drw('BB14', 'BB14-M-201', 'HVAC layout', 'C', ['bw']), drw('BB14', 'BB14-E-301', 'Lighting & power layout', 'B', ['bw']),
      drw('DH', 'DH-A-101', 'Ground floor plan', '3', ['bw', 'an', 'gl']), drw('DH', 'DH-M-100', 'MEP rough-in layout', '2', ['bw']), drw('RW', 'RW-A-001', 'Shopfront elevation', 'F', ['gl']), drw('RW', 'RW-F-010', 'Fire alarm layout', 'B', ['bw']), drw('DM', 'DM-A-001', 'Concept layout', '1', []),
      msDoc('MS-014', 'HVAC duct installation', 'bw', 'BB14', 'In review', ['Set out duct routes from BB14-M-201 rev C', 'Install hangers and supports at max. 2.4 m centres', 'Fit ducts, seal joints, insulate', 'Pressure test before ceiling close-up', 'Install diffusers after ceiling boarding']),
      msDoc('MS-009', 'Gypsum partitions & ceilings', 'an', 'BB14', 'Approved', ['Set out partitions from BB14-A-101 rev D', 'Fix tracks and studs, install insulation', 'Board, tape and joint', 'Ceiling grid and boarding after MEP close-up inspection']),
      msDoc('MS-018', 'Fire alarm modifications', 'bw', 'RW', 'Approved', ['Isolate the mall fire alarm zone with mall management (permit to work)', 'Relocate detectors as per RW-F-010 rev B', 'Test with mall fire contractor and civil defence']),
      irDoc('IR-029', 'MEP first-fix inspection – Business Bay office', 'BB14', ['bw'], [['Cable containment fixed and labelled', 'Pass'], ['Duct pressure test zone A', 'Pass'], ['Fire stopping at slab penetrations', 'Pass with comments']]),
      irDoc('IR-033', 'Ceiling close-up inspection – board room', 'BB14', ['an', 'bw'], [['Services above ceiling complete', 'Pass'], ['Access panels positioned', 'Pass'], ['Ceiling grid level', 'Pass']]),
      irDoc('IR-041', 'Blockwork inspection – first floor', 'DH', [], [['Lintels over openings', 'Pass'], ['Movement joints', 'Pass']])
    ];
    PERMITS.forEach(function (p) { if (p.st === 'Approved' || p.st === 'Inspection booked') DOCS.push(permitDoc(p)); });
    DOCS.push({ name: 'Contractor all-risk insurance certificate.pdf', type: 'pdf', folder: 'Permits', all: true, linked: 'All projects', owner: 'Aisha Rahman', status: 'Valid', title: 'Contractor all-risk insurance', company: 'Sample insurer (fictional)', meta: [['Insured', CO], ['Valid until', dateTxt(iso(240))]], sections: [{ h: 'Cover', lines: ['Contract works up to $5,000,000 per project', 'Third-party liability $2,000,000', 'Workers’ compensation as required by law'] }, { p: sample }] });
    DOCS.push({ name: 'HSE plan incl. heat-stress & midday break.pdf', type: 'pdf', folder: 'Method statements', all: true, subs: ['bw', 'an', 'cj', 'sf', 'bc', 'gl'], linked: 'All projects', owner: 'HSE team', status: 'Approved', title: 'HSE plan · heat stress', company: CO, meta: [['Applies to', 'All sites and subcontractors']], sections: [{ h: 'Heat stress', lines: ['Midday work break 12:30–15:00 from mid-June to mid-September for outdoor work in direct sun', 'Cold water, shade and rest areas on every site', 'Buddy system and first-aider on every shift'] }, { p: sample }] });
    CLAIMS.forEach(function (c) { var d = claimDoc(c, 'claim'); DOCS.push(d); if (c.cert) DOCS.push(claimDoc(c, 'cert')); });
    REPORTS.forEach(function (r) { DOCS.push(reportDoc(r)); });
    MRS.forEach(function (m) { if (m.po) DOCS.push(poDoc(m)); });
    SN.forEach(function (s) { DOCS.push(photoDoc(s, s.photos[0], 'before')); if (s.after[0]) DOCS.push(photoDoc(s, s.after[0], 'after')); });

    var ready = false;
    var visible = function (d, r) { r = r || role; return r === 'pm' || (r === 'eng' && (d.project === MYP || d.all)) || (r === 'sub' && !!d.subs && d.subs.indexOf(MYSUB) > -1); };
    var dmsEl = document.createElement('div'); dmsEl.className = 'sd-dms';
    var dms = SDA.dms(dmsEl, {
      root: root, title: 'Project documents', docs: DOCS, role: role,
      folders: ['Drawings', 'Permits', 'Method statements', 'Inspection reports', 'Claims', 'Snag photos', 'Site reports', 'Procurement'],
      canUpload: function () { return true; },
      canApprove: function (r) { return r === 'pm'; },
      filter: function (d, r) { return visible(d, r); },
      userName: function (r) { return ME[r]; },
      uploadFolder: 'Site reports', uploadStatus: 'In review',
      onChange: function (docs, d, act) {
        if (!ready || act === 'add') return;
        if (!d) docs.forEach(function (x) { if (x.tags.indexOf('uploaded') > -1 && !x.mine) { x.mine = 1; if (role === 'eng') x.project = MYP; if (role === 'sub') { x.subs = [MYSUB]; x.owner = ME.sub + ' · Bluewave MEP'; } } });
        if (act === 'approve' && d && d.ms) toast(d.ms + ' approved. ' + (d.subs ? SUBS[d.subs[0]].s : '') + ' can start the works (notification simulated, not sent).');
        render();
      }
    });
    var docsFor = function (key) { return dms.docs().filter(function (d) { return (d.linked || '').indexOf(key) > -1 && visible(d); }); };
    var docById = function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; };

    /* ================= shell: roles, guide ================= */
    var body = q('.sd-body'), nav = q('.sd-nav'), main = q('.sd-main');
    var ui = { pm: 'dash', eng: 'today', sub: 'snags', side: 'sync', sheet: null, placing: false, draft: null, rejecting: null,
      sf: 'open', ps: { p: 'All', trade: 'All', st: 'open', q: '' }, gantt: 'BB14', diary: 'All', permit: 'All', risk: false, mr: 'action', subSf: 'open',
      rep: { text: NOTE, parsed: null, photos: [], busy: false } };
    var guide = SDA.guide(q('.sd-guide'), {
      title: 'From snag to payment certificate', demoId: 'demo-build',
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=construction', text: 'Talk to us about your version' },
      steps: [
        { id: 'snag', text: 'As <b>Rajesh</b> (site engineer), open <b>Snags</b>, tap <b>New snag</b>, pin it on the plan, add a photo and save' },
        { id: 'fix', text: 'Switch to <b>Daniel</b> (Bluewave MEP), fix the snag and upload the after-photo' },
        { id: 'verify', text: 'Back as <b>Rajesh</b>, compare before and after and close the snag' },
        { id: 'claim', text: 'As <b>Aisha</b> (project manager), approve Bluewave’s progress claim PC-05' },
        { id: 'permit', text: 'Renew the landlord NOC that is about to expire' }
      ]
    });
    SDA.roles(q('.sd-roles'), {
      title: 'View as', value: role,
      roles: [
        { id: 'eng', label: 'Site engineer', person: 'Rajesh Kumar', icon: IC.helmet, sub: 'Phone app for the Business Bay office site: daily report, snags on the plan, material requests and deliveries.' },
        { id: 'pm', label: 'Project manager', person: 'Aisha Rahman', icon: IC.chart, sub: 'All four projects: dashboard, programme, permits, quote approvals and payment certificates.' },
        { id: 'sub', label: 'Subcontractor', person: 'Daniel Harris', icon: IC.wrench, sub: 'Bluewave MEP portal: only your own snags, quotes, deliveries, claims and documents.' }
      ],
      onChange: function (r) { role = r; ui.sheet = null; ui.placing = false; ui.rejecting = null; dms.setRole(r); dms.setFolder('All'); render(true); }
    });

    /* ================= small UI helpers ================= */
    var btn = function (a, label, cls, data) { return '<button type="button" class="btn btn-sm ' + (cls || 'btn-ghost') + '" data-a="' + a + '"' + (data || '') + '>' + label + '</button>'; };
    var head = function (t, sub, acts) { return '<div class="v-head sd-head"><div><h3>' + t + '</h3>' + (sub ? '<p class="sd-sub">' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="sd-acts">' + acts + '</div>' : '') + '</div>'; };
    var kpis = function (arr) { return '<div class="kpi-row sd-kpis">' + arr.map(function (k) { return '<div class="kpi' + (k[3] ? ' ' + k[3] : '') + '"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>'; }).join('') + '</div>'; };
    var sel = function (f, opts, val, label) { return '<label class="sd-sel"><span class="sd-sr">' + label + '</span><select data-f="' + f + '">' + opts.map(function (o) { var v = typeof o === 'string' ? o : o[0], t = typeof o === 'string' ? o : o[1]; return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></label>'; };
    var seg = function (a, opts, val, label) { return '<div class="sd-seg" role="group" aria-label="' + label + '">' + opts.map(function (o) { return '<button type="button" data-a="' + a + '" data-v="' + o[0] + '" aria-pressed="' + (o[0] === val) + '">' + o[1] + '</button>'; }).join('') + '</div>'; };
    var empty = function (t) { return '<div class="sda-empty">' + t + '</div>'; };
    var timeline = function (arr) { return '<ol class="sd-tl">' + arr.slice().reverse().map(function (e) { return '<li><b>' + esc(e.text) + '</b><small>' + esc(e.when) + ' · ' + esc(e.who) + '</small></li>'; }).join('') + '</ol>'; };
    var docBtns = function (ds) { return ds.length ? '<div class="sd-docs">' + ds.map(function (d) { return '<button type="button" class="sd-docb" data-a="doc" data-id="' + d.id + '"><span class="sd-docb-ic' + (d.type === 'jpg' ? ' im' : '') + '">' + (d.type === 'jpg' ? IC.img : IC.doc) + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + ' · v' + d.version + '</small></span></button>'; }).join('') + '</div>' : '<p class="sd-sub">No linked documents.</p>'; };
    var bar = function (pct, cls) { return '<span class="sd-bar' + (cls ? ' ' + cls : '') + '"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></span>'; };
    var mpTotal = function (r) { return r.total; };

    /* ---------------- plan component ---------------- */
    function planHtml(pid, list, o) {
      o = o || {};
      var pl = PLANS[proj(pid).plan];
      var svg = '<svg class="sd-plan-svg" viewBox="0 0 600 380" aria-hidden="true" focusable="false"><rect class="sd-pw" x="10" y="10" width="580" height="360" rx="3"/>' +
        pl.rooms.map(function (r) { return '<rect class="sd-pr" x="' + r[2] + '" y="' + r[3] + '" width="' + r[4] + '" height="' + r[5] + '"/><text class="sd-pt" x="' + (r[2] + r[4] / 2) + '" y="' + (r[3] + r[5] / 2 + 6) + '" text-anchor="middle">' + esc(r[1]) + '</text>'; }).join('') + '</svg>';
      var pins = list.map(function (s) { return '<button type="button" class="sd-pin st-' + stKey(s) + (o.sel === s.id ? ' sel' : '') + '" style="left:' + s.x + '%;top:' + s.y + '%" data-a="' + (o.act || 'snag') + '" data-id="' + s.id + '" aria-label="' + esc(s.id + ': ' + s.title + ', ' + s.room + ', ' + s.st) + '"><span>' + s.n + '</span></button>'; }).join('');
      var np = o.newPin ? '<span class="sd-pin st-new" style="left:' + o.newPin.x + '%;top:' + o.newPin.y + '%" aria-hidden="true"><span>+</span></span>' : '';
      return '<div class="sd-planbox' + (o.placing ? ' placing' : '') + '"' + (o.placing ? ' data-a="place" role="button" tabindex="0" aria-label="Floor plan. Click where the defect is. Enter places the pin in the middle."' : '') + '>' + svg + pins + np + '<span class="sd-plan-l">' + esc(pl.label) + '</span></div>';
    }
    var legend = '<p class="sd-legend"><i class="st-open"></i>Open <i class="st-reopen"></i>Reopened <i class="st-verify"></i>To verify <i class="st-closed"></i>Closed</p>';

    /* ================= ENGINEER (phone) ================= */
    var ENG_TABS = [['today', 'Today', IC.sun], ['snags', 'Snags', IC.snag], ['mat', 'Materials', IC.truck], ['files', 'Files', IC.folder]];
    var mySnags = function () { return SN.filter(function (s) { return s.p === MYP; }); };
    var todayRep = function (p) { return REPORTS.filter(function (r) { return r.p === p && r.date === iso(0); })[0]; };
    function vEng() {
      var p = proj(MYP), ver = mySnags().filter(function (s) { return s.st === 'Ready to verify'; }).length, rec = MRS.filter(function (m) { return m.p === MYP && m.st === 'Dispatched'; }).length;
      var cnt = { snags: ver, mat: rec };
      var title = { today: 'Today on site', snags: 'Snag list', mat: 'Materials', files: 'Files' }[ui.eng];
      var phone = '<div class="sd-phone"><div class="sd-screen">' +
        '<div class="sd-status"><span>' + hhmm() + '</span><span class="sd-island" aria-hidden="true"></span><span class="sd-sys" aria-hidden="true"><i></i><i></i><i></i><b></b></span></div>' +
        '<div class="sd-ph-top"><div><small>' + esc(p.short) + ' · L14</small><b>' + title + '</b></div><span class="sd-ph-av" aria-hidden="true">RK</span></div>' +
        '<div class="sd-ph-b" data-k="' + ui.eng + '">' + (ui.eng === 'today' ? engToday() : ui.eng === 'snags' ? engSnags() : ui.eng === 'mat' ? engMat() : engFiles()) + '</div>' +
        '<nav class="sd-tabbar" aria-label="Site app sections">' + ENG_TABS.map(function (t) { return '<button type="button" data-a="etab" data-v="' + t[0] + '"' + (ui.eng === t[0] ? ' aria-current="page"' : '') + '>' + t[2] + '<span>' + t[1] + '</span>' + (cnt[t[0]] ? '<i class="sd-badge">' + cnt[t[0]] + '</i>' : '') + '</button>'; }).join('') + '</nav>' +
        (ui.sheet ? engSheet() : '') + '</div></div>';
      var st = progState(p), nextMs = p.ms.filter(function (m) { return m[3] < 100; })[0];
      var side = '<section class="panel sd-proj"><span class="v-id">' + p.id + ' · ' + esc(p.client) + '</span><h3>' + esc(p.name) + '</h3><p class="sd-sub">' + esc(p.site) + '</p>' +
        '<div class="sd-proj-p"><b>' + p.progress + '%</b>' + bar(p.progress) + '</div>' +
        '<div class="sd-chips"><span>' + IC.clock + 'Handover ' + shortD(iso(p.end)) + '</span><span class="' + (st.ok ? '' : 'warn') + '">' + IC.chart + st.txt + '</span><span>' + IC.snag + mySnags().filter(function (s) { return s.st !== 'Closed'; }).length + ' open snags</span></div>' +
        (nextMs ? '<p class="sd-sub">Current: ' + esc(nextMs[0]) + ' · ' + nextMs[3] + '% · finish ' + shortD(iso(nextMs[2])) + '</p>' : '') + '</section>' + lookAhead() +
        '<div class="sd-seg sd-side-seg" role="tablist" aria-label="Side panel">' + [['sync', IC.sync + 'Synced to the office'], ['docs', IC.folder + 'Project documents']].map(function (t) { return '<button type="button" role="tab" data-a="side" data-v="' + t[0] + '" aria-selected="' + (ui.side === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>' +
        (ui.side === 'sync' ? '<section class="panel sd-feed" aria-live="polite"><p class="sd-sub">Everything you do on the phone appears here and on the project manager’s dashboard (simulated sync, works offline and catches up).</p><div class="sd-feed-s"><ol class="sd-tl">' + FEED.map(function (f) { return '<li><b>' + esc(f.text) + '</b><small>' + esc(f.when) + ' · ' + esc(f.who) + '</small></li>'; }).join('') + '</ol></div></section>'
          : '<section class="panel sd-dms-slot"></section>');
      return '<div class="sd-eng"><div class="sd-phone-col">' + phone + '<p class="sd-cap">' + IC.phone + 'Site engineer’s phone app (works offline on site)</p></div><div class="sd-side">' + side + '</div></div>';
    }
    function lookAhead() {
      var L = [];
      PERMITS.filter(function (x) { return x.p === MYP && x.st === 'Inspection booked'; }).forEach(function (x) { L.push([x.insp, x.inspT, IC.permit, x.name, x.auth]); });
      MRS.filter(function (m) { return m.p === MYP && /Dispatched|Approved/.test(m.st); }).forEach(function (m) { L.push([m.st === 'Dispatched' ? iso(0) : m.need, m.st === 'Dispatched' ? 'On the way' : 'Expected', IC.truck, m.item, m.id + ' · ' + vendor(picked(m).v)]); });
      mySnags().filter(function (s) { return s.st !== 'Closed' && daysTo(s.due) <= 2; }).forEach(function (s) { L.push([s.due, overdue(s) ? 'Overdue' : 'Due', IC.snag, s.id + ' ' + s.title, SUBS[s.sub].s]); });
      L.sort(function (a, b) { return a[0] > b[0] ? 1 : -1; });
      return '<section class="panel sd-week"><h4 class="sd-h4 first">This week on site</h4><div class="sd-stack">' + (L.length ? L.slice(0, 5).map(function (x) { return '<div class="sd-wk"><span class="sd-wk-d"><b>' + dayTxt(x[0]) + '</b><small>' + esc(x[1]) + '</small></span><span class="sd-wk-ic">' + x[2] + '</span><span class="sd-li-b"><b>' + esc(x[3]) + '</b><small>' + esc(x[4]) + '</small></span></div>'; }).join('') : empty('Nothing due this week.')) + '</div></section>';
    }
    function engToday() {
      var r = todayRep(MYP), R = ui.rep, h = '';
      h += '<section class="sd-wx"><span class="sd-wx-ic">' + IC.sun + '</span><div><b>' + WX.t + '°C · ' + WX.txt + '</b><small>Humidity ' + WX.h + '% · high ' + WX.hi + '°C · Business Bay (simulated)</small></div></section>';
      h += '<div class="sd-heat' + (HEAT.on ? ' on' : '') + '" role="note">' + IC.alert + '<span><b>' + HEAT.t + '</b><small>' + HEAT.s + '</small></span></div>';
      h += '<h4 class="sd-ph-h4">Daily site report</h4>';
      if (r) {
        h += '<div class="sd-card sd-done"><span class="sd-ok-ic">' + IC.check + '</span><div><b>Submitted at ' + r.time + '</b><small>' + r.total + ' on site · ' + r.work.length + ' work items · ' + r.delays.length + ' delay' + (r.delays.length === 1 ? '' : 's') + '</small></div>' + btn('rep-open', 'View', '', ' data-id="' + r.id + '"') + '</div>';
      } else if (!R.parsed) {
        h += '<div class="sd-card"><label class="sd-vn-l">Voice note<textarea class="sd-vn" rows="6" aria-describedby="sd-vn-h">' + esc(R.text) + '</textarea></label><small class="sd-hint" id="sd-vn-h">Talk like on the radio. AI turns it into the report.</small>' +
          '<div class="sd-row"><button type="button" class="btn btn-ghost btn-sm' + (R.busy === 'mic' ? ' rec' : '') + '" data-a="dictate">' + IC.mic + (R.busy === 'mic' ? 'Listening…' : 'Dictate (simulated)') + '</button>' +
          '<button type="button" class="btn btn-ink btn-sm" data-a="structure"' + (R.busy ? ' disabled' : '') + '>' + IC.spark + 'Structure with AI</button></div>' +
          (R.busy === 'ai' ? '<p class="sd-think" aria-live="polite"><i></i><i></i><i></i> AI (simulated) is reading your note…</p>' : '') + '</div>';
      } else {
        var o = R.parsed;
        h += '<div class="sd-card sd-ai"><div class="sd-ai-h">' + IC.spark + 'AI (simulated) structured your note</div>' +
          '<h5>Manpower · ' + o.total + ' on site</h5><table class="sd-mp"><tbody>' + o.mp.map(function (m) { return '<tr><td>' + esc(m.trade) + '<small>' + esc(subS(m.co)) + '</small></td><td>' + m.n + '</td></tr>'; }).join('') + '</tbody></table>' +
          (o.stated != null ? (o.stated === o.total ? '<p class="sd-okline">' + IC.check + 'Matches your count of ' + o.stated + '.</p>' : '<p class="sd-warnline">' + IC.alert + 'You said ' + o.stated + ', trades add up to ' + o.total + '.</p>') : '') +
          (o.work.length ? '<h5>Work done</h5><ul>' + o.work.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
          (o.delays.length ? '<h5>Delays</h5><ul class="sd-dly">' + o.delays.map(function (w) { return '<li>' + esc(w) + '<small>' + esc(delayImpact(w)) + '</small></li>'; }).join('') + '</ul>' : '') +
          (o.next.length ? '<h5>Coming up</h5><ul>' + o.next.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
          '<h5>Heat & safety</h5><ul>' + [HEAT.on ? 'Midday break observed 12:30–15:00' : 'Midday break not in force today'].concat(o.heat).map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' +
          (o.notes.length ? '<h5>Other notes</h5><ul>' + o.notes.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
          '<div class="sd-card"><b class="sd-cardt">Photos</b><div class="sd-thumbs">' + R.photos.map(function (ph, i) { return '<img src="' + ph.src + '" alt="Site photo ' + (i + 1) + '">'; }).join('') +
          '<button type="button" class="sd-addph" data-a="rep-cam">' + IC.cam + '<span>Take photo</span></button><label class="sd-addph">' + IC.upload + '<span>Upload</span><input type="file" accept="image/*" class="sd-file" data-f="rep-file"></label></div></div>' +
          '<div class="sd-row"><button type="button" class="btn btn-ghost btn-sm" data-a="rep-edit">Edit note</button><button type="button" class="btn btn-ink btn-sm sd-grow" data-a="rep-submit">' + IC.check + 'Submit report</button></div>';
      }
      var pms = PERMITS.filter(function (x) { return x.p === MYP; });
      h += '<h4 class="sd-ph-h4">Permits & inspections</h4><div class="sd-plist">' + pms.map(function (x) { return '<div class="sd-pl"><span><b>' + esc(x.name) + '</b><small>' + (x.st === 'Inspection booked' ? 'Inspection ' + dayTxt(x.insp).toLowerCase() + ' ' + x.inspT : x.exp ? 'Valid until ' + shortD(x.exp) : esc(x.auth)) + '</small></span>' + pmPill(x) + '</div>'; }).join('') + '</div><p class="sd-ro">' + IC.lock + 'Read only. Permits are managed by the project manager.</p>';
      return h;
    }
    function engSnags() {
      var all = mySnags();
      var c = { open: all.filter(open).length, verify: all.filter(function (s) { return s.st === 'Ready to verify'; }).length, closed: all.filter(function (s) { return s.st === 'Closed'; }).length };
      var L = all.filter(function (s) { return ui.sf === 'all' || (ui.sf === 'open' ? open(s) : ui.sf === 'verify' ? s.st === 'Ready to verify' : s.st === 'Closed'); });
      var h = (ui.placing ? '<div class="sd-placehint" role="status">' + IC.pin + '<span>Tap the plan where the defect is.</span><button type="button" class="sd-link" data-a="place-x">Cancel</button></div>'
        : '<button type="button" class="btn btn-ink btn-sm sd-wide" data-a="new-snag">' + IC.plus + 'New snag</button>') +
        planHtml(MYP, ui.placing ? all.filter(function (s) { return s.st !== 'Closed'; }) : L, { placing: ui.placing, newPin: ui.sheet && ui.sheet.k === 'new' ? ui.draft : null }) + legend +
        '<div class="sd-chipseg" role="group" aria-label="Filter snags">' + [['open', 'Open', c.open], ['verify', 'To verify', c.verify], ['closed', 'Closed', c.closed], ['all', 'All', all.length]].map(function (f) { return '<button type="button" data-a="sf" data-v="' + f[0] + '" aria-pressed="' + (ui.sf === f[0]) + '">' + f[1] + ' <small>' + f[2] + '</small></button>'; }).join('') + '</div>' +
        (L.length ? '<div class="sd-snl">' + L.map(snRow).join('') + '</div>' : empty(ui.sf === 'verify' ? 'Nothing to verify right now.' : 'No snags in this filter.'));
      return h;
    }
    function snRow(s) {
      return '<button type="button" class="sd-sn" data-a="snag" data-id="' + s.id + '"><span class="sd-num st-' + stKey(s) + '">' + s.n + '</span><span class="sd-sn-b"><b>' + esc(s.title) + '</b><small>' + esc(s.room) + ' · ' + esc(s.trade) + ' · ' + (overdue(s) ? '<em>overdue</em>' : 'due ' + dayTxt(s.due).toLowerCase()) + '</small></span>' + (s.st === 'Ready to verify' ? '<span class="pill p-info">Verify</span>' : s.st === 'Reopened' ? '<span class="pill p-bad">Reopened</span>' : s.st === 'Closed' ? '<span class="pill p-ok">Closed</span>' : priPill(s.pri)) + '</button>';
    }
    function mrSteps(m, compact) {
      var d = mrDoneIdx[m.st];
      return '<div class="v-steps sd-steps' + (compact ? ' c' : '') + '"' + (compact ? ' aria-hidden="true"' : '') + '>' + ['Requested', 'Quotes', 'PO', 'Dispatched', 'Delivered'].map(function (t, i) { return '<span class="' + (m.st === 'Rejected' ? '' : i <= d ? 'done' : i === d + 1 ? 'cur' : '') + '">' + (compact ? '' : t) + '</span>'; }).join('') + '</div>';
    }
    function engMat() {
      var L = MRS.filter(function (m) { return m.p === MYP; }).slice().reverse();
      return '<button type="button" class="btn btn-ink btn-sm sd-wide" data-a="mr-new">' + IC.plus + 'Request material</button>' +
        '<div class="sd-snl">' + L.map(function (m) {
          var qt = picked(m);
          return '<article class="sd-card sd-mrc"><div class="sd-mrc-h"><b>' + esc(m.item) + '</b>' + mrPill(m) + '</div><small>' + m.id + ' · ' + num(m.qty) + ' ' + esc(m.unit) + ' · needed ' + dayTxt(m.need).toLowerCase() + '</small>' + mrSteps(m, true) +
            (m.st === 'Dispatched' ? '<p class="sd-sub">' + esc(vendor(qt.v)) + ' · ' + esc(m.dn) + ' on the way</p><button type="button" class="btn btn-ink btn-sm sd-wide" data-a="deliv" data-id="' + m.id + '">' + IC.check + 'Confirm delivery</button>' :
              m.st === 'Awaiting quotes' ? '<p class="sd-sub">Waiting for supplier quotes</p>' : m.st === 'Quotes in' ? '<p class="sd-sub">' + m.quotes.length + ' quotes with the project manager</p>' : m.st === 'Approved' ? '<p class="sd-sub">' + esc(m.po) + ' issued to ' + esc(vendor(qt.v)) + '</p>' : m.st === 'Delivered' ? '<p class="sd-sub">Delivered · ' + esc(m.dn) + '</p>' : '') + '</article>';
        }).join('') + '</div>';
    }
    function engFiles() {
      var ds = dms.docs().filter(function (d) { return visible(d) && /Drawings|Permits|Method|Inspection/.test(d.folder); }).slice(0, 8);
      return '<p class="sd-sub">Latest drawings and approvals for this site. Always the current revision.</p>' + docBtns(ds) +
        '<button type="button" class="btn btn-ghost btn-sm sd-wide" data-a="side" data-v="docs">' + IC.folder + 'Open the full document library</button>';
    }

    /* phone sheets */
    function engSheet() {
      var k = ui.sheet.k, t = '', b = '';
      if (k === 'new') {
        var d = ui.draft, sug = suggestTrade(d.title);
        t = 'New snag';
        b = '<div class="sd-loc">' + IC.pin + '<span><b>' + esc(d.room) + '</b><small>Pinned on ' + esc(PLANS.office.label) + '</small></span><button type="button" class="sd-link" data-a="repin">Move pin</button></div>' +
          '<label>What is wrong?<input type="text" class="sd-f-title" value="' + esc(d.title) + '" maxlength="90"></label>' +
          '<p class="sd-ai-s" aria-live="polite">' + IC.spark + '<span>' + (sug ? 'AI (simulated) suggests <b>' + sug + '</b> → ' + esc(SUBS[tradeSub(sug)].s) : 'AI (simulated) suggests a trade as you type') + '</span></p>' +
          '<div class="sd-2"><label>Trade<select class="sd-f-trade">' + TRADES.map(function (x) { return '<option' + (x[0] === d.trade ? ' selected' : '') + '>' + x[0] + '</option>'; }).join('') + '</select></label><label>Due<input type="date" class="sd-f-due" value="' + d.due + '" min="' + iso(0) + '"></label></div>' +
          '<p class="sd-f-sub">Assigned to <b>' + esc(SUBS[tradeSub(d.trade)].name) + '</b></p>' +
          '<fieldset class="sd-fs"><legend>Priority</legend><div class="sd-seg">' + ['Low', 'Medium', 'High'].map(function (p) { return '<label class="sd-radio"><input type="radio" name="sd-pri" value="' + p + '"' + (d.pri === p ? ' checked' : '') + '><span>' + p + '</span></label>'; }).join('') + '</div></fieldset>' +
          '<b class="sd-cardt">Photos</b><div class="sd-thumbs">' + d.photos.map(function (ph, i) { return '<img src="' + ph.src + '" alt="Snag photo ' + (i + 1) + '">'; }).join('') +
          '<button type="button" class="sd-addph" data-a="snag-cam">' + IC.cam + '<span>Take photo</span></button><label class="sd-addph">' + IC.upload + '<span>Upload</span><input type="file" accept="image/*" class="sd-file" data-f="snag-file"></label></div>' +
          '<p class="sd-err" role="alert"' + (d.err ? '' : ' hidden') + '>' + esc(d.err || '') + '</p>' +
          '<button type="button" class="btn btn-ink btn-sm sd-wide" data-a="save-snag">' + IC.check + 'Save and notify subcontractor</button>';
      } else if (k === 'snag') {
        var s = find(SN, ui.sheet.id);
        t = s.id;
        b = snagBody(s, true);
        if (s.st === 'Ready to verify') {
          b += ui.rejecting === s.id ? '<div class="sd-card sd-rejf"><b class="sd-cardt">Why is it not OK?</b><div class="sd-chipseg">' + ['Not fixed', 'Finish quality', 'Wrong location', 'Damaged other work'].map(function (r) { return '<button type="button" data-a="rej-chip" aria-pressed="false">' + r + '</button>'; }).join('') + '</div><label class="sd-sr" for="sd-rej-t">Comment</label><textarea id="sd-rej-t" class="sd-rej-t" rows="2" placeholder="Add a short comment for the subcontractor"></textarea><div class="sd-row"><button type="button" class="btn btn-ghost btn-sm" data-a="rej-x">Cancel</button><button type="button" class="btn btn-ink btn-sm sd-grow" data-a="reject" data-id="' + s.id + '">Reject and reopen</button></div></div>'
            : '<div class="sd-row sd-stick"><button type="button" class="btn btn-ghost btn-sm" data-a="rej-open" data-id="' + s.id + '">Reject</button><button type="button" class="btn btn-ink btn-sm sd-grow" data-a="close-snag" data-id="' + s.id + '">' + IC.check + 'Verify and close</button></div>';
        } else if (open(s)) b += '<div class="sd-row sd-stick"><button type="button" class="btn btn-ghost btn-sm sd-grow" data-a="remind" data-id="' + s.id + '">' + IC.bell + 'Remind ' + esc(SUBS[s.sub].s) + '</button></div>';
      } else if (k === 'mr') {
        t = 'Request material';
        b = '<label>Material<input type="text" class="m-item" value="Gypsum access panel 600×600" maxlength="80"></label>' +
          '<div class="sd-2"><label>Quantity<input type="number" class="m-qty" value="12" min="1"></label><label>Unit<select class="m-unit"><option>nos</option><option>m²</option><option>m</option><option>sheets</option><option>bags</option><option>sets</option></select></label></div>' +
          '<div class="sd-2"><label>Trade<select class="m-trade">' + TRADES.map(function (x) { return '<option' + (x[0] === 'Drywall & ceilings' ? ' selected' : '') + '>' + x[0] + '</option>'; }).join('') + '</select></label><label>Needed by<input type="date" class="m-need" value="' + iso(5) + '" min="' + iso(1) + '"></label></div>' +
          '<label>Note<textarea class="m-note" rows="2">For ceiling access above FCUs in meeting rooms.</textarea></label>' +
          '<p class="sd-err" role="alert" hidden></p><button type="button" class="btn btn-ink btn-sm sd-wide" data-a="mr-save">' + IC.check + 'Send request</button><p class="sd-hint">Quotes are requested from approved suppliers automatically (simulated, not sent).</p>';
      } else if (k === 'deliv') {
        var m = find(MRS, ui.sheet.id), qt = picked(m);
        t = 'Confirm delivery';
        b = '<div class="sd-card"><b>' + esc(m.item) + '</b><small class="sd-block">' + m.id + ' · ' + esc(m.po) + ' · ' + esc(vendor(qt.v)) + ' · ' + esc(m.dn) + '</small></div>' +
          '<div class="sd-2"><label>Ordered<input type="text" value="' + num(m.qty) + ' ' + esc(m.unit) + '" readonly></label><label>Received<input type="number" class="m-rec" value="' + m.qty + '" min="0"></label></div>' +
          '<label class="chk"><input type="checkbox" class="m-dmg"> Damaged items on delivery</label>' +
          '<b class="sd-cardt">Delivery note photo</b><div class="sd-thumbs">' + (ui.sheet.ph ? '<img src="' + ui.sheet.ph + '" alt="Delivery note photo">' : '') + '<button type="button" class="sd-addph" data-a="dn-cam">' + IC.cam + '<span>Take photo</span></button></div>' +
          '<button type="button" class="btn btn-ink btn-sm sd-wide" data-a="deliv-save" data-id="' + m.id + '">' + IC.check + 'Confirm received on site</button>';
      }
      return '<div class="sd-sheet" role="dialog" aria-label="' + esc(t) + '"><div class="sd-sheet-h"><button type="button" class="sd-back" data-a="sheet-x">' + IC.back + 'Back</button><b>' + esc(t) + '</b></div><div class="sd-sheet-b">' + b + '</div></div>';
    }
    function snagBody(s, compact) {
      var ba = '<div class="sd-ba"><figure><img src="' + s.photos[0].src + '" alt="Before photo of ' + esc(s.id) + '"><figcaption>Before · ' + esc(s.photos[0].by) + '</figcaption></figure>' +
        (s.after.length ? '<figure><img src="' + s.after[s.after.length - 1].src + '" alt="After photo of ' + esc(s.id) + '"><figcaption>After · ' + esc(s.after[s.after.length - 1].by) + '</figcaption></figure>' : '<figure class="sd-noaft"><span>' + IC.cam + 'No after-photo yet</span><figcaption>After</figcaption></figure>') + '</div>';
      return ba + '<div class="sd-snh"><b>' + esc(s.title) + '</b>' + snPill(s) + '</div>' +
        (s.reason && s.st === 'Reopened' ? '<p class="sd-rej">' + IC.alert + '<span>Rejected: ' + esc(s.reason) + '</span></p>' : '') +
        '<dl class="sd-dl"><dt>Location</dt><dd>' + esc(s.room) + ', ' + esc(pS(s.p)) + '</dd><dt>Trade</dt><dd>' + esc(s.trade) + '</dd><dt>Assigned to</dt><dd>' + esc(SUBS[s.sub].s) + '</dd><dt>Priority</dt><dd>' + priPill(s.pri) + '</dd><dt>Due</dt><dd>' + dateTxt(s.due) + (overdue(s) ? ' <span class="pill p-bad">Overdue</span>' : '') + '</dd><dt>Logged by</dt><dd>' + esc(s.by) + ', ' + dateTxt(s.created) + '</dd></dl>' +
        (compact ? '' : '<h4 class="sd-h4">Location on plan</h4>' + planHtml(s.p, [s], { sel: s.id, act: 'noop' })) +
        '<h4 class="sd-h4">History</h4>' + timeline(s.log) + '<h4 class="sd-h4">Linked documents</h4>' + docBtns(docsFor(s.id));
    }

    /* ================= PROJECT MANAGER ================= */
    var PM_NAV = [['dash', 'Dashboard', IC.dash], ['diary', 'Site diary', IC.diary], ['snags', 'Snags', IC.snag], ['permits', 'Permits', IC.permit], ['mat', 'Materials', IC.truck], ['claims', 'Claims', IC.claim], ['docs', 'Documents', IC.folder]];
    function pmCounts() {
      return { snags: SN.filter(overdue).length, permits: PERMITS.filter(atRisk).length, mat: MRS.filter(function (m) { return m.st === 'Quotes in'; }).length, claims: CLAIMS.filter(function (c) { return c.st === 'Submitted'; }).length };
    }
    function paintNav() {
      var c = pmCounts();
      nav.innerHTML = PM_NAV.map(function (n) { var k = c[n[0]]; return '<button type="button" data-a="nav" data-v="' + n[0] + '"' + (ui.pm === n[0] ? ' aria-current="page"' : '') + '>' + n[2] + '<span>' + n[1] + '</span>' + (k ? '<i class="cnt" aria-label="' + k + ' need attention">' + k + '</i>' : '') + '</button>'; }).join('');
    }
    function vPm() {
      return ui.pm === 'dash' ? pmDash() : ui.pm === 'diary' ? pmDiary() : ui.pm === 'snags' ? pmSnags() : ui.pm === 'permits' ? pmPermits() : ui.pm === 'mat' ? pmMat() : ui.pm === 'claims' ? pmClaims() : head('Documents', 'Drawings, permits, method statements, inspection reports and claims for all projects') + '<div class="sd-dms-slot"></div>';
    }
    function gantt(p) {
      var s0 = p.start - 4, e0 = p.end + 4, span = e0 - s0, pos = function (d) { return ((d - s0) / span * 100).toFixed(2); };
      var ticks = '', d = SDA.today(s0); d.setDate(1); d.setMonth(d.getMonth() + 1);
      var now = SDA.today(0);
      for (var i = 0; i < 14 && d <= SDA.today(e0); i++) { var off = Math.round((d - now) / 864e5); if (Math.abs(pos(off) - pos(0)) > 8) ticks += '<span style="left:' + pos(off) + '%">' + d.toLocaleDateString('en-US', { month: 'short' }) + '</span>'; d.setMonth(d.getMonth() + 1); }
      return '<div class="sd-g"><div class="sd-g-row sd-g-hd"><div class="sd-g-l"></div><div class="sd-g-t sd-g-ticks">' + ticks + '<span class="sd-g-nowl" style="left:' + pos(0) + '%">Today</span></div></div>' +
        p.ms.map(function (m) {
          var s = msState(m);
          return '<div class="sd-g-row"><div class="sd-g-l"><b>' + esc(m[0]) + '</b><small>' + m[3] + '% · ' + shortD(iso(m[1])) + ' – ' + shortD(iso(m[2])) + (s.behind ? ' · <em>~' + s.days + ' d behind</em>' : '') + '</small></div><div class="sd-g-t"><span class="sd-g-now" style="left:' + pos(0) + '%"></span><span class="sd-g-bar' + (s.behind ? ' late' : m[3] === 100 ? ' done' : '') + '" style="left:' + pos(m[1]) + '%;width:' + (pos(m[2]) - pos(m[1])).toFixed(2) + '%" title="' + esc(m[0]) + ' ' + m[3] + '%"><i style="width:' + m[3] + '%"></i></span></div></div>';
        }).join('') + '</div>';
    }
    function pmDash() {
      var c = pmCounts(), today = REPORTS.filter(function (r) { return r.date === iso(0); });
      var openS = SN.filter(function (s) { return s.st !== 'Closed'; });
      var apv = CLAIMS.filter(function (x) { return x.st === 'Submitted'; }).length + c.mat + dms.docs().filter(function (d) { return d.ms && /review/i.test(d.status); }).length;
      var h = head('Portfolio dashboard', esc(CO) + ' · ' + PROJ.length + ' active projects · ' + SDA.fmtDate(new Date()), c.permits ? btn('nav', IC.alert + c.permits + ' permits at risk', 'btn-ink', ' data-v="permits"') : '') +
        kpis([['Manpower on site', sum(today, mpTotal), 'from ' + today.length + ' of ' + PROJ.length + ' daily reports'], ['Open snags', openS.length, SN.filter(overdue).length + ' overdue', SN.filter(overdue).length ? 'k-bad' : ''], ['Permits at risk', c.permits, 'expiring or missing documents', c.permits ? 'k-bad' : ''], ['Waiting for you', apv, 'claims, quotes, method statements', apv ? 'k-warn' : '']]);
      h += '<section class="panel sd-projs"><h4 class="sd-h4 first">Projects · progress and budget vs committed</h4><div class="sd-pgrid">' + PROJ.map(function (p) {
        var st = progState(p), cm = committed(p), ce = certified(p), pct = Math.round(cm / p.budget * 100);
        return '<button type="button" class="sd-pc' + (ui.gantt === p.id ? ' sel' : '') + '" data-a="gantt" data-v="' + p.id + '" aria-pressed="' + (ui.gantt === p.id) + '"><span class="sd-pc-h"><b>' + esc(p.short) + '</b><span class="pill ' + (st.ok ? 'p-ok' : 'p-warn') + '">' + st.txt + '</span></span><small>' + esc(p.name) + ' · ' + esc(p.client) + '</small>' +
          '<span class="sd-pc-p"><b>' + p.progress + '%</b>' + bar(p.progress) + '</span>' +
          '<span class="sd-bud"><span class="sd-bud-t"><i class="cm' + (pct > 92 ? ' hi' : '') + '" style="width:' + Math.min(100, pct) + '%"></i><i class="ce" style="width:' + Math.min(100, Math.round(ce / p.budget * 100)) + '%"></i></span><small>Committed ' + usd(cm) + ' of ' + usd(p.budget) + ' budget (' + pct + '%) · certified ' + usd(ce) + '</small></span></button>';
      }).join('') + '</div><p class="sd-legend b"><i class="ce"></i>Certified to subcontractors <i class="cm"></i>Committed (subcontracts and POs)</p></section>';
      var gp = proj(ui.gantt);
      var trades = TRADES.map(function (t) { var L = openS.filter(function (s) { return s.trade === t[0]; }); return [t[0], L.length, L.filter(overdue).length]; }).filter(function (x) { return x[1]; }).sort(function (a, b) { return b[1] - a[1]; });
      var maxT = Math.max.apply(null, trades.map(function (x) { return x[1]; }).concat([1]));
      h += '<div class="sd-grid2"><section class="panel"><div class="sd-ph"><h4 class="sd-h4 first">Programme · ' + esc(gp.short) + '</h4>' + sel('gantt', PROJ.map(function (p) { return [p.id, p.short]; }), ui.gantt, 'Project for programme') + '</div>' + gantt(gp) + '</section>' +
        '<div class="sd-col"><section class="panel"><h4 class="sd-h4 first">Open snags by trade</h4><div class="sd-tbars">' + (trades.length ? trades.map(function (t) { return '<button type="button" class="sd-tb" data-a="snag-trade" data-v="' + esc(t[0]) + '"><span>' + esc(t[0]) + '</span><span class="sd-tb-t"><i style="width:' + Math.round(t[1] / maxT * 100) + '%"></i>' + (t[2] ? '<i class="od" style="width:' + Math.round(t[2] / maxT * 100) + '%"></i>' : '') + '</span><b>' + t[1] + '</b></button>'; }).join('') : empty('No open snags.')) + '</div><p class="sd-legend b"><i class="op"></i>Open <i class="od"></i>Overdue</p></section>' +
        '<section class="panel"><h4 class="sd-h4 first">Permits at risk</h4><div class="sd-stack">' + (PERMITS.filter(atRisk).map(function (p) { return '<button type="button" class="sd-li" data-a="permit" data-id="' + p.id + '"><span class="sd-li-ic bad">' + IC.permit + '</span><span class="sd-li-b"><b>' + esc(p.name) + '</b><small>' + esc(pS(p.p)) + ' · ' + esc(p.auth) + '</small></span>' + pmPill(p) + '</button>'; }).join('') || empty('No permits at risk.')) + '</div></section></div></div>';
      var apvL = CLAIMS.filter(function (x) { return x.st === 'Submitted'; }).map(function (x) { return '<button type="button" class="sd-li" data-a="claim" data-id="' + x.id + '"><span class="sd-li-ic">' + IC.claim + '</span><span class="sd-li-b"><b>' + x.code + ' · ' + esc(SUBS[x.sub].s) + '</b><small>' + esc(pS(x.p)) + ' · ' + esc(x.period) + ' · net due ' + money(calc(x).due) + '</small></span><span class="pill p-warn">Claim</span></button>'; })
        .concat(MRS.filter(function (m) { return m.st === 'Quotes in'; }).map(function (m) { return '<button type="button" class="sd-li" data-a="mr-q" data-id="' + m.id + '"><span class="sd-li-ic">' + IC.truck + '</span><span class="sd-li-b"><b>' + m.id + ' · ' + esc(m.item) + '</b><small>' + esc(pS(m.p)) + ' · ' + m.quotes.length + ' quotes · needed ' + dayTxt(m.need).toLowerCase() + '</small></span><span class="pill p-warn">Quotes</span></button>'; }))
        .concat(dms.docs().filter(function (d) { return d.ms && /review/i.test(d.status); }).map(function (d) { return '<button type="button" class="sd-li" data-a="doc" data-id="' + d.id + '"><span class="sd-li-ic">' + IC.doc + '</span><span class="sd-li-b"><b>' + esc(d.ms) + ' · method statement</b><small>' + esc(d.name) + '</small></span><span class="pill p-warn">Review</span></button>'; }));
      h += '<div class="sd-grid2 b"><section class="panel"><h4 class="sd-h4 first">Waiting for your approval</h4><div class="sd-stack">' + (apvL.join('') || empty('Nothing waiting. Well done.')) + '</div></section>' +
        '<section class="panel"><h4 class="sd-h4 first">Latest site reports</h4><div class="sd-stack">' + REPORTS.slice().sort(function (a, b) { return (b.date + b.time) > (a.date + a.time) ? 1 : -1; }).slice(0, 4).map(repRow).join('') + '</div></section></div>';
      return h;
    }
    function repRow(r) { return '<button type="button" class="sd-li" data-a="rep-open" data-id="' + r.id + '"><span class="sd-li-ic">' + IC.diary + '</span><span class="sd-li-b"><b>' + esc(pS(r.p)) + ' · ' + dayTxt(r.date) + ' ' + r.time + '</b><small>' + esc(r.by) + ' · ' + r.total + ' on site' + (r.delays.length ? ' · ' + r.delays.length + ' delay' + (r.delays.length > 1 ? 's' : '') : '') + '</small></span>' + (r.delays.length ? '<span class="pill p-warn">Delay</span>' : '<span class="pill p-ok">OK</span>') + '</button>'; }
    function pmDiary() {
      var L = REPORTS.filter(function (r) { return ui.diary === 'All' || r.p === ui.diary; }).sort(function (a, b) { return (b.date + b.time) > (a.date + a.time) ? 1 : -1; });
      var missing = PROJ.filter(function (p) { return !todayRep(p.id); });
      return head('Site diary', 'Daily reports from every site, written on the phone and structured by AI (simulated)', sel('diary', [['All', 'All projects']].concat(PROJ.map(function (p) { return [p.id, p.short]; })), ui.diary, 'Project')) +
        (missing.length ? '<div class="sd-hint-b">' + IC.clock + '<span>No report yet today from <b>' + missing.map(function (p) { return esc(p.short); }).join('</b> and <b>') + '</b>. A reminder goes out at 17:00 (simulated).</span>' + btn('nudge', 'Remind now', '', '') + '</div>' : '') +
        '<div class="sd-reps">' + (L.length ? L.map(function (r) {
          return '<article class="panel sd-rep"><div class="sd-rep-h"><div><span class="v-id">' + esc(pS(r.p)) + ' · ' + dateTxt(r.date) + ' ' + r.time + '</span><h3>' + esc(r.by) + '</h3></div><span class="sd-rep-n">' + IC.users + '<b>' + r.total + '</b> on site</span></div>' +
            '<div class="sd-mpchips">' + r.mp.map(function (m) { return '<span>' + esc(m.trade) + ' <b>' + m.n + '</b></span>'; }).join('') + '</div>' +
            '<ul class="sd-rl">' + r.work.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + r.delays.map(function (w) { return '<li class="d">' + IC.alert + esc(w) + '</li>'; }).join('') + '</ul>' +
            '<div class="sd-rep-f">' + (r.photos.length ? '<span class="sd-rep-ph">' + r.photos.map(function (p) { return '<img src="' + p.src + '" alt="">'; }).join('') + '</span>' : '') + '<small>' + r.wx.t + '°C · ' + esc(HEAT.on ? 'midday break observed' : 'midday break not in force') + '</small>' + btn('rep-open', 'Open report', '', ' data-id="' + r.id + '"') + '</div></article>';
        }).join('') : empty('No reports for this project yet.')) + '</div>';
    }
    function pmSnags() {
      var F = ui.ps, pid = F.p === 'All' ? 'BB14' : F.p;
      var L = SN.filter(function (s) { return (F.p === 'All' || s.p === F.p) && (F.trade === 'All' || s.trade === F.trade) && (F.st === 'all' || (F.st === 'open' ? open(s) : F.st === 'verify' ? s.st === 'Ready to verify' : F.st === 'overdue' ? overdue(s) : s.st === 'Closed')) && (s.id + ' ' + s.title + ' ' + s.room + ' ' + SUBS[s.sub].s).toLowerCase().indexOf(F.q.toLowerCase()) > -1; });
      var onPlan = L.filter(function (s) { return s.p === pid; });
      return head('Snags', SN.filter(function (s) { return s.st !== 'Closed'; }).length + ' open across all projects · ' + SN.filter(overdue).length + ' overdue') +
        '<div class="toolbar sd-tool"><label class="sd-search"><span class="sd-sr">Search snags</span><input type="search" data-f="ps-q" placeholder="Search snag, room, subcontractor" value="' + esc(F.q) + '"></label>' +
        sel('ps-p', [['All', 'All projects']].concat(PROJ.map(function (p) { return [p.id, p.short]; })), F.p, 'Project') + sel('ps-trade', ['All'].concat(TRADES.map(function (t) { return t[0]; })), F.trade, 'Trade') + '</div>' +
        seg('ps-st', [['open', 'Open'], ['verify', 'To verify'], ['overdue', 'Overdue'], ['closed', 'Closed'], ['all', 'All']], F.st, 'Status') +
        '<div class="sd-snagwrap"><section class="panel sd-planp"><div class="sd-ph"><h4 class="sd-h4 first">' + esc(pS(pid)) + ' · plan</h4>' + (F.p === 'All' ? '<small class="sd-sub">Pick a project to see its plan</small>' : '') + '</div>' + planHtml(pid, onPlan, {}) + legend + '</section>' +
        '<div class="sd-stack">' + (L.length ? L.map(function (s) {
          return '<button type="button" class="sd-li" data-a="snag" data-id="' + s.id + '"><span class="sd-num st-' + stKey(s) + '">' + s.n + '</span><span class="sd-li-b"><b>' + esc(s.title) + '</b><small>' + s.id + ' · ' + esc(pS(s.p)) + ', ' + esc(s.room) + ' · ' + esc(SUBS[s.sub].s) + ' · ' + (overdue(s) ? '<em>overdue ' + Math.abs(daysTo(s.due)) + ' d</em>' : 'due ' + dayTxt(s.due).toLowerCase()) + '</small></span>' + snPill(s) + '</button>';
        }).join('') : empty('No snags match these filters.')) + '</div></div>';
    }
    function permitCard(p) {
      var meta = [];
      if (p.exp) meta.push('<span class="' + (expSoon(p) ? 'bad' : '') + '">' + IC.clock + 'Valid until ' + dateTxt(p.exp) + (p.st === 'Renewal submitted' ? ' · renewal submitted' : '') + '</span>');
      if (p.st === 'Inspection booked') meta.push('<span>' + IC.clock + 'Inspection ' + dayTxt(p.insp).toLowerCase() + ' ' + p.inspT + '</span>');
      if (p.sub && p.st === 'In review') meta.push('<span>' + IC.clock + 'Submitted ' + dateTxt(p.sub) + '</span>');
      if (p.missing.length) meta.push('<span class="bad">' + IC.alert + p.missing.length + ' document' + (p.missing.length > 1 ? 's' : '') + ' missing</span>');
      meta.push('<span>' + IC.bell + (p.remind ? 'Reminders on' : 'Reminders off') + '</span>');
      var a = '';
      if (expSoon(p)) a += btn('renew', IC.sync + 'Renew', 'btn-ink', ' data-id="' + p.id + '"');
      if (p.missing.length) a += btn('permit', IC.upload + 'Add missing documents', 'btn-ink', ' data-id="' + p.id + '"');
      if (p.st === 'Ready to submit') a += btn('p-submit', 'Submit to authority', 'btn-ink', ' data-id="' + p.id + '"');
      if (p.st === 'Inspection booked') a += btn('p-result', 'Record result', 'btn-ink', ' data-id="' + p.id + '"');
      a += btn('permit', 'Details', '', ' data-id="' + p.id + '"');
      return '<article class="sd-pmc' + (atRisk(p) ? ' risk' : '') + '"><div class="sd-pmc-h"><span class="sd-li-ic' + (atRisk(p) ? ' bad' : '') + '">' + IC.permit + '</span><div class="sd-li-b"><b>' + esc(p.name) + '</b><small>' + esc(p.auth) + ' · ' + esc(p.ref) + '</small></div>' + pmPill(p) + '</div><div class="sd-pmc-m">' + meta.join('') + '</div><div class="sd-row">' + a + '</div></article>';
    }
    function pmPermits() {
      var L = PERMITS.filter(function (p) { return (ui.permit === 'All' || p.p === ui.permit) && (!ui.risk || atRisk(p)); });
      return head('Permits & approvals', 'Authority permits, landlord NOCs and inspections with expiry reminders', sel('permit', [['All', 'All projects']].concat(PROJ.map(function (p) { return [p.id, p.short]; })), ui.permit, 'Project') + '<label class="chk sd-chk"><input type="checkbox" data-f="risk"' + (ui.risk ? ' checked' : '') + '> At risk only</label>') +
        (L.length ? PROJ.filter(function (p) { return L.some(function (x) { return x.p === p.id; }); }).map(function (p) { return '<h4 class="sd-h4">' + esc(p.short) + ' · ' + esc(p.name) + '</h4><div class="sd-pmgrid">' + L.filter(function (x) { return x.p === p.id; }).map(permitCard).join('') + '</div>'; }).join('') : empty('No permits match.'));
    }
    function mrCard(m, who) {
      var qt = picked(m), a = '', pend = m.quotes.filter(function (x) { return x.pending; }).length;
      if (who === 'pm') {
        if ((m.st === 'Quotes in' || m.st === 'Awaiting quotes') && m.quotes.some(function (x) { return !x.pending; })) a += btn('mr-q', 'Compare quotes', m.st === 'Quotes in' ? 'btn-ink' : '', ' data-id="' + m.id + '"');
        if (m.st === 'Awaiting quotes') a += btn('mr-chase', IC.bell + 'Chase quotes', '', ' data-id="' + m.id + '"');
      }
      var docs = docsFor(m.id);
      if (docs.length) a += '<button type="button" class="btn btn-sm btn-ghost" data-a="doc" data-id="' + docs[0].id + '">' + IC.doc + esc(docs[0].folder === 'Procurement' ? m.po : 'Delivery note') + '</button>';
      return '<article class="panel sd-mr"><div class="sd-mr-h"><div><span class="v-id">' + m.id + ' · ' + esc(pS(m.p)) + ' · ' + esc(m.trade) + '</span><h3>' + esc(m.item) + '</h3></div>' + mrPill(m) + '</div>' +
        '<p class="sd-sub">' + num(m.qty) + ' ' + esc(m.unit) + ' · needed by ' + dateTxt(m.need) + (daysTo(m.need) <= 2 && mrDoneIdx[m.st] < 4 ? ' <span class="pill p-bad">Tight</span>' : '') + ' · requested by ' + esc(m.by) + '</p>' + mrSteps(m) +
        '<p class="sd-sub">' + (qt ? esc(m.po) + ' · ' + esc(vendor(qt.v)) + ' · ' + money(qt.amt) + (m.dn ? ' · ' + esc(m.dn) : '') : m.quotes.filter(function (x) { return !x.pending; }).length + ' quote' + (m.quotes.filter(function (x) { return !x.pending; }).length === 1 ? '' : 's') + ' received' + (pend ? ', ' + pend + ' pending (' + m.quotes.filter(function (x) { return x.pending; }).map(function (x) { return esc(vendor(x.v)); }).join(', ') + ')' : '')) + '</p>' +
        (a ? '<div class="sd-row">' + a + '</div>' : '') + '</article>';
    }
    function pmMat() {
      var L = MRS.filter(function (m) { return ui.mr === 'all' || (ui.mr === 'action' ? /Quotes in|Awaiting/.test(m.st) : /Approved|Dispatched/.test(m.st)); }).slice().reverse();
      return head('Material requests', 'From site request to quote approval, PO and delivery') + seg('mr', [['action', 'Needs action'], ['transit', 'Ordered / on the way'], ['all', 'All']], ui.mr, 'Filter requests') +
        '<div class="sd-mrgrid">' + (L.length ? L.map(function (m) { return mrCard(m, 'pm'); }).join('') : empty('Nothing here.')) + '</div>';
    }
    function pmClaims() {
      var sub = CLAIMS.filter(function (c) { return c.st === 'Submitted'; });
      var ret = sum(SC, function (s) { return Math.round(scCert(s) * RET); });
      return head('Progress claims & payment certificates', 'Subcontractor claims are valued, certified with 10% retention and filed in the DMS') +
        kpis([['To certify', sub.length, usd(sum(sub, function (c) { return calc(c).due; })) + ' net claimed', sub.length ? 'k-warn' : ''], ['Certified to date', usd(sum(SC, scCert)), 'gross, all subcontracts'], ['Retention held', usd(ret), '10% of certified value'], ['Subcontract value', usd(sum(SC, function (s) { return s.value; })), SC.length + ' subcontracts']]) +
        '<div class="sd-stack">' + CLAIMS.slice().sort(function (a, b) { return (a.st === 'Submitted' ? 0 : 1) - (b.st === 'Submitted' ? 0 : 1) || (b.sent > a.sent ? 1 : -1); }).map(function (c) {
          var k = calc(c, c.cert);
          return '<button type="button" class="sd-li sd-cl" data-a="claim" data-id="' + c.id + '"><span class="sd-li-ic">' + IC.claim + '</span><span class="sd-li-b"><b>' + c.code + ' · ' + esc(SUBS[c.sub].s) + '</b><small>' + esc(pS(c.p)) + ' · ' + esc(c.period) + ' · submitted ' + dateTxt(c.sent) + '</small></span><span class="sd-cl-a"><b>' + money(k.due) + '</b><small>net due</small></span>' + clPill(c) + '</button>';
        }).join('') + '</div>';
    }

    /* ================= SUBCONTRACTOR portal ================= */
    var SUB_TABS = [['snags', 'My snags', IC.snag], ['quotes', 'Quotes & deliveries', IC.truck], ['claims', 'Progress claims', IC.claim], ['docs', 'Documents', IC.folder]];
    var subSnags = function () { return SN.filter(function (s) { return s.sub === MYSUB; }); };
    var subMrs = function () { return MRS.filter(function (m) { return m.quotes.some(function (x) { return x.v === MYSUB; }); }); };
    function vSub() {
      var S = subSnags(), my = SC.filter(function (s) { return s.sub === MYSUB; });
      var c = { snags: S.filter(open).length, quotes: subMrs().filter(function (m) { return m.quotes.some(function (x) { return x.v === MYSUB && x.pending; }) || (m.st === 'Approved' && picked(m).v === MYSUB); }).length, claims: CLAIMS.filter(function (x) { return x.sub === MYSUB && x.st === 'Returned'; }).length };
      var h = '<div class="sd-portal"><header class="sd-pt-h"><span class="sd-logo" aria-hidden="true">BW</span><div class="sd-pt-n"><b>' + esc(SUBS.bw.name) + '</b><small>Subcontractor portal · ' + esc(CO) + '</small></div>' +
        '<div class="sd-pt-k"><span><b>' + S.filter(open).length + '</b>open snags</span><span><b>' + usd(sum(my, function (s) { return s.value; })) + '</b>subcontracts</span><span><b>' + usd(sum(my, function (s) { return Math.round(scCert(s) * RET); })) + '</b>retention held</span></div></header>' +
        '<div class="sd-tabs" role="tablist" aria-label="Portal sections">' + SUB_TABS.map(function (t) { return '<button type="button" role="tab" data-a="stab" data-v="' + t[0] + '" aria-selected="' + (ui.sub === t[0]) + '">' + t[2] + '<span>' + t[1] + '</span>' + (c[t[0]] ? '<i class="sd-badge">' + c[t[0]] + '</i>' : '') + '</button>'; }).join('') + '</div><div class="sd-pt-b">';
      if (ui.sub === 'snags') {
        var L = S.filter(function (s) { return ui.subSf === 'all' || (ui.subSf === 'open' ? open(s) : ui.subSf === 'wait' ? s.st === 'Ready to verify' : s.st === 'Closed'); }).sort(function (a, b) { return (a.st === 'Reopened' ? 0 : 1) - (b.st === 'Reopened' ? 0 : 1) || (a.due > b.due ? 1 : -1); });
        h += '<div class="sd-ph">' + seg('subsf', [['open', 'To fix · ' + S.filter(open).length], ['wait', 'Waiting for verification · ' + S.filter(function (s) { return s.st === 'Ready to verify'; }).length], ['closed', 'Closed'], ['all', 'All']], ui.subSf, 'Filter snags') + '<span class="sd-ro">' + IC.lock + 'Only snags assigned to Bluewave MEP</span></div>' +
          (L.length ? '<div class="sd-scgrid">' + L.map(function (s) {
            var a = open(s) ? btn('fix', IC.cam + 'Fix & upload after-photo', 'btn-ink', ' data-id="' + s.id + '"') + btn('scope', 'Not our scope', '', ' data-id="' + s.id + '"') : s.st === 'Ready to verify' ? '<span class="sd-wait">' + IC.clock + 'Waiting for ' + esc(proj(s.p).eng) + ' to verify</span>' : '';
            return '<article class="sd-scard' + (s.st === 'Reopened' ? ' re' : '') + '"><div class="sd-scard-ph"><img src="' + (s.after.length && s.st !== 'Reopened' ? s.after[s.after.length - 1].src : s.photos[0].src) + '" alt="Photo of ' + esc(s.id) + '">' + snPill(s) + '</div><div class="sd-scard-b"><span class="v-id">' + s.id + ' · ' + esc(pS(s.p)) + '</span><b>' + esc(s.title) + '</b><small>' + esc(s.room) + ' · ' + esc(s.trade) + ' · ' + priPill(s.pri) + ' · ' + (overdue(s) ? '<em>overdue</em>' : 'due ' + dayTxt(s.due).toLowerCase()) + '</small>' +
              (s.st === 'Reopened' && s.reason ? '<p class="sd-rej">' + IC.alert + '<span>Rejected by site engineer: ' + esc(s.reason) + '</span></p>' : '') +
              '<div class="sd-row">' + a + btn('sub-snag', IC.pin + 'Plan & details', '', ' data-id="' + s.id + '"') + '</div></div></article>';
          }).join('') + '</div>' : empty('Nothing here. Good job.'));
      } else if (ui.sub === 'quotes') {
        var M = subMrs().slice().reverse();
        h += '<p class="sd-sub sd-mb">Requests where ' + esc(CO) + ' asked Bluewave MEP for a supply quote.</p><div class="sd-mrgrid">' + (M.length ? M.map(function (m) {
          var mine = m.quotes.filter(function (x) { return x.v === MYSUB; })[0], qt = picked(m), won = qt && qt.v === MYSUB, a = '';
          if (mine.pending) a = btn('quote', IC.claim + 'Submit quote', 'btn-ink', ' data-id="' + m.id + '"');
          else if (won && m.st === 'Approved') a = btn('dispatch', IC.truck + 'Mark dispatched', 'btn-ink', ' data-id="' + m.id + '"');
          var stTxt = mine.pending ? '<span class="pill p-warn">Quote requested</span>' : qt ? (won ? mrPill(m) : '<span class="pill p-dim">Not selected</span>') : '<span class="pill p-info">Quote sent</span>';
          return '<article class="panel sd-mr"><div class="sd-mr-h"><div><span class="v-id">' + m.id + ' · ' + esc(pS(m.p)) + '</span><h3>' + esc(m.item) + '</h3></div>' + stTxt + '</div><p class="sd-sub">' + num(m.qty) + ' ' + esc(m.unit) + ' · deliver by ' + dateTxt(m.need) + ' to ' + esc(proj(m.p).site) + '</p>' +
            (!mine.pending ? '<p class="sd-sub">Your quote: <b>' + money(mine.amt) + '</b> · ' + mine.days + ' days lead time' + (won && m.po ? ' · ' + esc(m.po) : '') + (m.dn && won ? ' · ' + esc(m.dn) : '') + '</p>' : '') + (won ? mrSteps(m) : '') +
            '<p class="sd-ro">' + IC.lock + 'Other suppliers’ prices are not visible to you.</p>' + (a ? '<div class="sd-row">' + a + '</div>' : '') + '</article>';
        }).join('') : empty('No quote requests.')) + '</div>';
      } else if (ui.sub === 'claims') {
        h += '<div class="sd-scs">' + my.map(function (sc) {
          var oc = openClaim(sc), cv = scCert(sc);
          return '<article class="panel sd-scc"><span class="v-id">' + sc.id + ' · ' + esc(pS(sc.p)) + '</span><h3>' + esc(proj(sc.p).name) + '</h3><div class="sd-scc-k"><span>Subcontract<b>' + money(sc.value) + '</b></span><span>Certified to date<b>' + money(cv) + '</b></span><span>Retention held<b>' + money(Math.round(cv * RET)) + '</b></span></div>' + bar(Math.round(cv / sc.value * 100)) +
            '<div class="sd-row">' + (oc ? (oc.st === 'Returned' ? btn('new-claim', 'Revise ' + oc.code, 'btn-ink', ' data-id="' + sc.id + '"') : '<span class="sd-wait">' + IC.clock + oc.code + ' with ' + esc(ME.pm) + '</span>') : btn('new-claim', IC.plus + 'New progress claim', 'btn-ink', ' data-id="' + sc.id + '"')) + '</div></article>';
        }).join('') + '</div><h4 class="sd-h4">Claim history</h4><div class="sd-stack">' + CLAIMS.filter(function (c) { return c.sub === MYSUB; }).slice().sort(function (a, b) { return b.sent > a.sent ? 1 : -1; }).map(function (c) {
          var k = calc(c, c.cert);
          return '<button type="button" class="sd-li sd-cl" data-a="claim" data-id="' + c.id + '"><span class="sd-li-ic">' + IC.claim + '</span><span class="sd-li-b"><b>' + c.code + ' · ' + esc(pS(c.p)) + '</b><small>' + esc(c.period) + ' · submitted ' + dateTxt(c.sent) + '</small></span><span class="sd-cl-a"><b>' + money(k.due) + '</b><small>' + (c.cert ? 'certified' : 'claimed') + '</small></span>' + clPill(c) + '</button>';
        }).join('') + '</div>';
      } else h += '<div class="sd-dms-slot"></div>';
      return h + '</div></div>';
    }

    /* ================= render ================= */
    var lastKey = '';
    function render(top) {
      var key = role + ':' + (role === 'eng' ? ui.eng + ':' + (ui.sheet ? ui.sheet.k + (ui.sheet.id || '') : '') : role === 'pm' ? ui.pm : ui.sub);
      var ph = q('.sd-ph-b'), sh = q('.sd-sheet-b'), phT = ph ? ph.scrollTop : 0, shT = sh ? sh.scrollTop : 0, hadSheet = !!sh;
      body.className = 'app-body sd-body r-' + role;
      nav.hidden = role !== 'pm';
      if (role === 'pm') paintNav(); else nav.innerHTML = '';
      main.innerHTML = role === 'eng' ? vEng() : role === 'sub' ? vSub() : vPm();
      var slot = q('.sd-dms-slot'); if (slot) { slot.appendChild(dmsEl); dms.render(); }
      if (key === lastKey && !top) { var p2 = q('.sd-ph-b'), s2 = q('.sd-sheet-b'); if (p2) p2.scrollTop = phT; if (s2) s2.scrollTop = shT; }
      if (top) main.scrollTop = 0;
      if (q('.sd-sheet') && !hadSheet) { var f = q('.sd-sheet .sd-back'); if (f) f.focus(); }
      lastKey = key;
    }

    /* ================= modals ================= */
    function err(m, t) { var e = q('.sd-err', m.body || m); if (e) { e.textContent = t; e.hidden = !t; } }
    function reportModal(r) {
      var d = docsFor(r.id);
      SDA.modal(root, { title: 'Daily report · ' + pS(r.p) + ' · ' + dayTxt(r.date), wide: true, html:
        '<div class="sd-repm"><div><div class="sd-rep-h"><div><span class="v-id">' + r.id + ' · ' + dateTxt(r.date) + ' ' + r.time + ' · ' + esc(r.by) + '</span><h3>' + esc(proj(r.p).name) + '</h3></div><span class="sd-rep-n">' + IC.users + '<b>' + r.total + '</b> on site</span></div>' +
        '<table class="sd-mp wide"><thead><tr><th>Trade</th><th>Company</th><th>Headcount</th></tr></thead><tbody>' + r.mp.map(function (m) { return '<tr><td>' + esc(m.trade) + '</td><td>' + esc(subS(m.co)) + '</td><td>' + m.n + '</td></tr>'; }).join('') + '</tbody></table>' +
        '<h4 class="sd-h4">Work done</h4><ul class="sd-rl">' + (r.work.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') || '<li>—</li>') + '</ul>' +
        (r.delays.length ? '<h4 class="sd-h4">Delays</h4><ul class="sd-rl">' + r.delays.map(function (w) { return '<li class="d">' + IC.alert + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
        (r.next.length ? '<h4 class="sd-h4">Coming up</h4><ul class="sd-rl">' + r.next.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul>' : '') +
        '<h4 class="sd-h4">Weather, heat and safety</h4><p class="sd-sub">' + r.wx.t + '°C, humidity ' + r.wx.h + '%. ' + esc(HEAT.t) + '. ' + esc(r.heat.join('. ')) + '</p></div>' +
        '<aside><h4 class="sd-h4 first">Photos</h4>' + (r.photos.length ? '<div class="sd-repm-ph">' + r.photos.map(function (p, i) { return '<img src="' + p.src + '" alt="Site photo ' + (i + 1) + '">'; }).join('') + '</div>' : '<p class="sd-sub">No photos.</p>') + '<h4 class="sd-h4">Document</h4>' + docBtns(d) + '</aside></div>' });
    }
    function pmSnagModal(s) {
      var m = SDA.modal(root, { title: s.id + ' · ' + s.title, wide: true, html: '<div class="sd-snm"><div>' + snagBody(s, false) + '</div><aside class="sd-snm-a"><h4 class="sd-h4 first">Manage</h4><div class="sd-form">' +
        '<label>Trade / subcontractor<select class="m-trade">' + TRADES.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === s.trade ? ' selected' : '') + '>' + t[0] + ' · ' + SUBS[t[1]].s + '</option>'; }).join('') + '</select></label>' +
        '<div class="sd-2"><label>Priority<select class="m-pri">' + ['Low', 'Medium', 'High'].map(function (p) { return '<option' + (p === s.pri ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label><label>Due<input type="date" class="m-due" value="' + s.due + '"></label></div>' +
        '<button type="button" class="btn btn-ink btn-sm m-save"' + (s.st === 'Closed' ? ' disabled' : '') + '>' + IC.check + 'Save changes</button>' +
        (s.st !== 'Closed' ? '<button type="button" class="btn btn-ghost btn-sm m-rem">' + IC.bell + 'Remind ' + esc(SUBS[s.sub].s) + '</button>' : '') +
        '<p class="sd-ro">' + IC.lock + 'Verification on site is done by ' + esc(proj(s.p).eng) + '.</p></div></aside></div>' });
      var sv = q('.m-save', m.body);
      sv && sv.addEventListener('click', function () {
        var t = q('.m-trade', m.body).value, ch = [];
        if (t !== s.trade) { s.trade = t; var ns = tradeSub(t); if (ns !== s.sub) { ch.push('reassigned to ' + SUBS[ns].s); s.sub = ns; docsFor(s.id).forEach(function (d) { d.subs = [ns]; }); if (open(s)) s.st = 'Open'; } }
        var pr = q('.m-pri', m.body).value; if (pr !== s.pri) { ch.push('priority ' + pr); s.pri = pr; }
        var du = q('.m-due', m.body).value; if (du && du !== s.due) { ch.push('due ' + shortD(du)); s.due = du; }
        if (!ch.length) { m.close(); return; }
        s.log.push({ when: stamp(), who: ME.pm, text: 'Changed: ' + ch.join(', ') + '. Notification sent (simulated, not sent).' });
        feed(s.id + ' changed by project manager: ' + ch.join(', ') + '.', ME.pm, s.p);
        m.close(); toast(s.id + ' updated: ' + ch.join(', ') + '.'); render();
      });
      var rm = q('.m-rem', m.body); rm && rm.addEventListener('click', function () { s.log.push({ when: stamp(), who: ME.pm, text: 'Reminder sent to ' + SUBS[s.sub].s + ' (simulated, not sent).' }); m.close(); toast('Reminder sent to ' + SUBS[s.sub].s + ' (simulated, not sent).'); });
    }
    function subSnagModal(s) {
      SDA.modal(root, { title: s.id + ' · ' + s.title, wide: true, html: '<div class="sd-snm"><div>' + snagBody(s, true) + '</div><aside><h4 class="sd-h4 first">Where is it?</h4>' + planHtml(s.p, [s], { sel: s.id, act: 'noop' }) + '<p class="sd-sub">' + esc(s.room) + ', ' + esc(proj(s.p).site) + '. Site contact: ' + esc(proj(s.p).eng) + '.</p></aside></div>' });
    }
    function photoPicker(m, kind, label, onSet) {
      var slot = q('.sd-aft-slot', m.body);
      q('.m-cam', m.body).addEventListener('click', function () { var src = SDA.art(kind, label + ' · ' + hhmm()); slot.innerHTML = '<img src="' + src + '" alt="New photo">'; onSet(src); });
      q('.m-file', m.body).addEventListener('change', function (e) { if (e.target.files[0]) { var src = URL.createObjectURL(e.target.files[0]); slot.innerHTML = '<img src="' + src + '" alt="Uploaded photo">'; onSet(src); } });
    }
    function fixModal(s) {
      var src = null;
      var m = SDA.modal(root, { title: 'Fix ' + s.id + ' · upload after-photo', html: '<div class="sd-form">' +
        '<div class="sd-ba"><figure><img src="' + s.photos[0].src + '" alt="Before photo"><figcaption>Before · ' + esc(s.photos[0].by) + '</figcaption></figure><figure><div class="sd-aft-slot"><span>' + IC.cam + 'After-photo</span></div><figcaption>After</figcaption></figure></div>' +
        '<p class="sd-sub"><b>' + esc(s.title) + '</b> · ' + esc(s.room) + ', ' + esc(pS(s.p)) + (s.reason && s.st === 'Reopened' ? '<br>Engineer’s comment: ' + esc(s.reason) : '') + '</p>' +
        '<div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-cam">' + IC.cam + 'Take after-photo (simulated)</button><label class="btn btn-ghost btn-sm sd-uplb">' + IC.upload + 'Upload photo<input type="file" accept="image/*" class="sd-file m-file"></label></div>' +
        '<label>Comment for the site engineer<textarea class="m-note" rows="2">' + (s.trade === 'Electrical' ? 'Replaced and tested. Please verify.' : 'Fixed. Please verify.') + '</textarea></label>' +
        '<p class="sd-err" role="alert" hidden></p><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + 'Mark as fixed</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      photoPicker(m, 'room', 'After fix · ' + s.id, function (x) { src = x; err(m, ''); });
      q('.m-save', m.body).addEventListener('click', function () {
        if (!src) return err(m, 'Add an after-photo so the site engineer can verify the fix.');
        var ph = { src: src, by: ME.sub }, note = q('.m-note', m.body).value.trim();
        s.after.push(ph); s.st = 'Ready to verify';
        s.log.push({ when: stamp(), who: ME.sub + ' · Bluewave MEP', text: 'Marked fixed and uploaded an after-photo.' + (note ? ' “' + note + '”' : '') });
        dms.add(photoDoc(s, ph, 'after'));
        feed('Bluewave MEP marked ' + s.id + ' fixed with an after-photo. Ready to verify.', ME.sub + ' · Bluewave MEP', s.p);
        guide.done('fix'); m.close(); toast(s.id + ' sent for verification. ' + proj(s.p).eng + ' notified (simulated, not sent).'); render();
      });
    }
    function scopeModal(s) {
      var m = SDA.modal(root, { title: s.id + ' · not our scope', html: '<div class="sd-form"><p class="sd-sub">Tell the site engineer why this snag belongs to another trade. It stays assigned until the engineer or project manager reassigns it.</p><label>Reason<textarea class="m-r" rows="3">Stain is from a roof leak, not from our drain line.</textarea></label><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">Send to site engineer</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () { var r = q('.m-r', m.body).value.trim() || 'No reason given'; s.log.push({ when: stamp(), who: ME.sub + ' · Bluewave MEP', text: 'Disputed scope: ' + r }); feed(s.id + ': Bluewave MEP says not their scope. “' + r + '”', ME.sub + ' · Bluewave MEP', s.p); m.close(); toast('Sent to ' + proj(s.p).eng + ' for review (simulated, not sent).'); render(); });
    }
    function quoteCompare(mr) {
      var got = mr.quotes.map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return !o.x.pending; });
      var left = daysTo(mr.need);
      var ok = got.filter(function (o) { return o.x.days <= left || left < 0; });
      var best = (ok.length ? ok : got).slice().sort(function (a, b) { return a.x.amt - b.x.amt; })[0];
      var m = SDA.modal(root, { title: mr.id + ' · compare quotes', wide: true, html: '<div class="sd-form"><p class="sd-sub"><b>' + esc(mr.item) + '</b> · ' + num(mr.qty) + ' ' + esc(mr.unit) + ' · ' + esc(pS(mr.p)) + ' · needed by ' + dateTxt(mr.need) + ' (' + left + ' days)</p>' +
        '<div class="sd-qt" role="radiogroup" aria-label="Choose supplier">' + mr.quotes.map(function (x, i) {
          if (x.pending) return '<div class="sd-q pend"><span class="sd-q-n"><b>' + esc(vendor(x.v)) + '</b><small>Quote requested · waiting</small></span><span class="pill p-dim">Pending</span></div>';
          var late = left >= 0 && x.days > left;
          return '<label class="sd-q' + (late ? ' late' : '') + '"><input type="radio" name="sd-q" value="' + i + '"' + (best && best.i === i ? ' checked' : '') + '><span class="sd-q-n"><b>' + esc(vendor(x.v)) + '</b><small>' + x.days + ' days lead time · arrives ' + shortD(iso(x.days)) + (late ? ' · too late' : '') + '</small></span><b class="sd-q-a">' + money(x.amt) + '</b></label>';
        }).join('') + '</div>' +
        (best ? '<div class="ai-box"><div class="ai-h">AI (simulated) recommendation</div><b>' + esc(vendor(best.x.v)) + '</b> at ' + money(best.x.amt) + ': ' + (ok.length && ok.length < got.length ? 'cheapest supplier that still delivers before ' + shortD(mr.need) + '. The cheaper offer arrives too late for the programme.' : 'lowest price that meets the need-by date.') + ' Committed on ' + esc(pS(mr.p)) + ' goes to ' + usd(committed(proj(mr.p)) + best.x.amt) + ' of ' + usd(proj(mr.p).budget) + '.</div>' : '') +
        '<div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-ok">' + IC.check + 'Approve and issue PO</button><button type="button" class="btn btn-ghost btn-sm m-no">Reject request</button></div><p class="sd-hint">The PO is generated and filed in the DMS. Sending to the supplier is simulated.</p></div>' });
      q('.m-ok', m.body).addEventListener('click', function () {
        var r = q('input[name="sd-q"]:checked', m.body); if (!r) return;
        var chosen = mr.quotes[+r.value]; mr.quotes = mr.quotes.filter(function (x) { return !x.pending; }); mr.pick = mr.quotes.indexOf(chosen);
        mr.st = 'Approved'; mr.po = 'PO-' + (++seq.PO);
        var qt = picked(mr); dms.add(poDoc(mr));
        feed(mr.id + ' approved: ' + mr.po + ' to ' + vendor(qt.v) + ' (' + money(qt.amt) + ').', ME.pm, mr.p);
        m.close(); toast(mr.po + ' issued to ' + vendor(qt.v) + ' (simulated, not sent). Committed cost updated.'); render();
      });
      q('.m-no', m.body).addEventListener('click', function () { mr.st = 'Rejected'; feed(mr.id + ' rejected by project manager.', ME.pm, mr.p); m.close(); toast(mr.id + ' rejected. ' + mr.by + ' notified (simulated, not sent).'); render(); });
    }
    function claimModal(c) {
      var sc = find(SC, c.sc), review = role === 'pm' && c.st === 'Submitted';
      var cert = (c.cert || c.lines.map(function (l) { return l.pct; })).slice();
      var m = SDA.modal(root, { title: c.code + ' · ' + SUBS[c.sub].s + ' · ' + pS(c.p), wide: true, html: '<div class="sd-claim"></div>' });
      var box = q('.sd-claim', m.body);
      box.innerHTML = '<div class="sd-cl-hd"><div><span class="v-id">' + c.sc + ' · ' + esc(c.period) + ' · submitted ' + dateTxt(c.sent) + ' by ' + esc(c.by) + '</span><h3>' + esc(SUBS[c.sub].name) + '</h3><p class="sd-sub">' + esc(proj(c.p).name) + ', ' + esc(proj(c.p).area) + ' · subcontract ' + money(sc.value) + '</p></div>' + clPill(c) + '</div>' +
        '<div class="sd-tw"><table class="sd-ct"><thead><tr><th>Item</th><th>Value</th><th>Prev.</th><th>Claimed</th><th>' + (review ? 'Certify' : c.cert ? 'Certified' : '') + '</th><th>This period</th></tr></thead><tbody>' + c.lines.map(function (l, i) {
          return '<tr><td>' + esc(l.d) + '</td><td>' + money(l.v) + '</td><td>' + l.prev + '%</td><td>' + l.pct + '%</td><td>' + (review ? '<label class="sd-pctin"><span class="sd-sr">Certified percent for ' + esc(l.d) + '</span><input type="number" min="' + l.prev + '" max="100" value="' + cert[i] + '" data-i="' + i + '">%</label>' : c.cert ? cert[i] + '%' : '') + '</td><td class="sd-la" data-i="' + i + '"></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="sd-cl-g"><div>' + (review && c.check ? '<div class="ai-box"><div class="ai-h">AI (simulated) cross-check against site reports</div><b>' + esc(c.lines[c.check.i].d) + '</b>: claimed ' + c.lines[c.check.i].pct + '%, site progress about ' + c.check.site + '%. ' + esc(c.check.why) + '<div class="sd-row"><button type="button" class="btn btn-ghost btn-sm m-apply">Apply ' + c.check.site + '%</button></div></div>' : review ? '<div class="ai-box"><div class="ai-h">AI (simulated) cross-check against site reports</div>No variance found between claimed progress and daily reports.</div>' : '') +
        (c.st === 'Returned' && c.ret ? '<p class="sd-rej">' + IC.alert + '<span>Returned: ' + esc(c.ret) + '</span></p>' : '') +
        '<h4 class="sd-h4">History</h4>' + timeline(c.log) + '<h4 class="sd-h4">Documents</h4>' + docBtns(docsFor(clLink(c))) + '</div><div class="sd-sum" aria-live="polite"></div></div>' +
        (review ? '<div class="sd-retf" hidden><label>Comment for ' + esc(SUBS[c.sub].s) + '<textarea class="m-ret" rows="2">Please attach the measurement sheet for the HVAC works.</textarea></label></div><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-ok">' + IC.check + 'Approve and issue payment certificate</button><button type="button" class="btn btn-ghost btn-sm m-back">Return to subcontractor</button></div>' :
          role === 'pm' && c.st === 'Certified' ? '<div class="sd-row"><button type="button" class="btn btn-ghost btn-sm m-paid">Mark as paid (simulated)</button></div>' :
          role === 'sub' && c.st === 'Returned' ? '<div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-rev">Revise and resubmit</button></div>' : '');
      function upd() {
        var k = calc(c, cert);
        qa('.sd-la', box).forEach(function (td) { var i = +td.dataset.i, l = c.lines[i]; td.textContent = money(Math.round(l.v * (cert[i] - l.prev) / 100)); });
        q('.sd-sum', box).innerHTML = '<h4 class="sd-h4 first">' + (review ? 'Certificate preview' : c.cert ? 'Payment certificate' : 'Claim summary') + '</h4><dl><dt>Gross value of work done to date</dt><dd>' + money(k.g) + '</dd><dt>Less retention 10%</dt><dd>−' + money(k.ret) + '</dd><dt>Less previously certified (net)</dt><dd>−' + money(k.prevNet) + '</dd><dt class="t">Net amount due</dt><dd class="t">' + money(k.due) + '</dd><dt>VAT 5%</dt><dd>' + money(k.vat) + '</dd><dt class="t">Total payable</dt><dd class="t">' + money(k.tot) + '</dd></dl>' +
          (review && k.due !== calc(c).due ? '<p class="sd-warnline">' + IC.alert + 'Certifying ' + money(calc(c).due - k.due) + ' less than claimed.</p>' : '') + '<p class="sd-hint">Retention is released 50% at handover and 50% after the defects liability period.</p>';
      }
      upd();
      box.addEventListener('input', function (e) { var i = e.target.dataset && e.target.dataset.i; if (i == null) return; var v = Math.max(c.lines[i].prev, Math.min(100, +e.target.value || 0)); cert[i] = v; upd(); });
      box.addEventListener('change', function (e) { var i = e.target.dataset && e.target.dataset.i; if (i != null) e.target.value = cert[i]; });
      box.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.classList.contains('m-apply')) { cert[c.check.i] = c.check.site; q('input[data-i="' + c.check.i + '"]', box).value = c.check.site; upd(); toast('Applied ' + c.check.site + '% for ' + c.lines[c.check.i].d + '.'); }
        if (t.classList.contains('m-ok')) {
          c.cert = cert.slice(); c.st = 'Certified'; sc.cum = cert.slice();
          var k = calc(c, c.cert);
          c.log.push({ when: stamp(), who: ME.pm, text: 'Certified ' + money(k.due) + ' net (' + money(k.tot) + ' incl. VAT). Payment certificate issued.' });
          docsFor(clLink(c)).forEach(function (d) { if (d.kind === 'claim') d.status = 'Certified'; });
          dms.add(claimDoc(c, 'cert'));
          feed(c.code + ' ' + SUBS[c.sub].s + ' certified by project manager.', ME.pm, c.p);
          if (c.sub === MYSUB) guide.done('claim');
          m.close(); toast(c.code + ' certified: ' + money(k.tot) + ' payable incl. VAT. ' + SUBS[c.sub].s + ' notified (simulated, not sent).'); render();
        }
        if (t.classList.contains('m-back')) {
          var f = q('.sd-retf', box); if (f.hidden) { f.hidden = false; t.textContent = 'Send back with comment'; q('.m-ret', box).focus(); return; }
          c.st = 'Returned'; c.ret = q('.m-ret', box).value.trim() || 'Please revise.'; c.log.push({ when: stamp(), who: ME.pm, text: 'Returned: ' + c.ret });
          docsFor(clLink(c)).forEach(function (d) { if (d.kind === 'claim') d.status = 'Returned'; });
          m.close(); toast(c.code + ' returned to ' + SUBS[c.sub].s + ' (simulated, not sent).'); render();
        }
        if (t.classList.contains('m-paid')) { c.st = 'Paid'; c.log.push({ when: stamp(), who: ME.pm, text: 'Marked as paid (simulated bank transfer).' }); m.close(); toast(c.code + ' marked as paid (simulated).'); render(); }
        if (t.classList.contains('m-rev')) { m.close(); claimForm(sc, c); }
      });
    }
    function claimForm(sc, prevC) {
      var last = CLAIMS.filter(function (c) { return c.sc === sc.id; }).reduce(function (a, c) { return Math.max(a, c.no); }, 0);
      var pct = prevC ? prevC.lines.map(function (l) { return l.pct; }) : sc.cum.map(function (v) { return Math.min(100, v + (v < 100 ? 10 : 0)); });
      var draft = { lines: sc.lines.map(function (l, i) { return { d: l[0], v: l[1], prev: sc.cum[i], pct: pct[i] }; }) }, att = null;
      var m = SDA.modal(root, { title: (prevC ? 'Revise ' + prevC.code : 'New progress claim PC-' + pad(last + 1)) + ' · ' + pS(sc.p), wide: true, html: '<div class="sd-form">' +
        '<p class="sd-sub">' + esc(SUBS[sc.sub].name) + ' · ' + sc.id + ' · period ' + periodOf(iso(0)) + '. Enter the cumulative % complete for each item.</p>' +
        '<div class="sd-tw"><table class="sd-ct"><thead><tr><th>Item</th><th>Value</th><th>Certified so far</th><th>Claim (cumulative)</th><th>This period</th></tr></thead><tbody>' + draft.lines.map(function (l, i) { return '<tr><td>' + esc(l.d) + '</td><td>' + money(l.v) + '</td><td>' + l.prev + '%</td><td><label class="sd-pctin"><span class="sd-sr">Claimed percent for ' + esc(l.d) + '</span><input type="number" min="' + l.prev + '" max="100" value="' + l.pct + '" data-i="' + i + '">%</label></td><td class="sd-la" data-i="' + i + '"></td></tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="sd-cl-g"><div><b class="sd-cardt">Measurement sheet</b><div class="sd-row"><button type="button" class="btn btn-ghost btn-sm m-att">' + IC.doc + 'Attach sample sheet</button><label class="btn btn-ghost btn-sm sd-uplb">' + IC.upload + 'Upload file<input type="file" class="sd-file m-file"></label></div><p class="sd-sub m-attn">' + (prevC ? 'Previous attachments are kept.' : 'No file attached yet.') + '</p>' + (prevC && prevC.ret ? '<p class="sd-rej">' + IC.alert + '<span>PM comment: ' + esc(prevC.ret) + '</span></p>' : '') + '</div><div class="sd-sum"></div></div>' +
        '<p class="sd-err" role="alert" hidden></p><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + 'Submit claim to ' + esc(ME.pm) + '</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      var fake = { lines: draft.lines };
      function upd() {
        var k = calc(fake);
        qa('.sd-la', m.body).forEach(function (td) { var i = +td.dataset.i, l = draft.lines[i]; td.textContent = money(Math.round(l.v * (l.pct - l.prev) / 100)); });
        q('.sd-sum', m.body).innerHTML = '<h4 class="sd-h4 first">Claim summary</h4><dl><dt>Gross value to date</dt><dd>' + money(k.g) + '</dd><dt>Less retention 10%</dt><dd>−' + money(k.ret) + '</dd><dt>Less previously certified</dt><dd>−' + money(k.prevNet) + '</dd><dt class="t">Net amount due</dt><dd class="t">' + money(k.due) + '</dd><dt>VAT 5%</dt><dd>' + money(k.vat) + '</dd><dt class="t">Total</dt><dd class="t">' + money(k.tot) + '</dd></dl>';
      }
      upd();
      m.body.addEventListener('input', function (e) { var i = e.target.dataset && e.target.dataset.i; if (i == null) return; draft.lines[i].pct = Math.max(draft.lines[i].prev, Math.min(100, +e.target.value || 0)); upd(); });
      m.body.addEventListener('change', function (e) { var i = e.target.dataset && e.target.dataset.i; if (i != null) e.target.value = draft.lines[i].pct; if (e.target.classList.contains('m-file') && e.target.files[0]) { att = e.target.files[0].name; q('.m-attn', m.body).textContent = 'Attached: ' + att + ' (stays in your browser)'; } });
      q('.m-att', m.body).addEventListener('click', function () { att = 'Measurement sheet ' + sc.id + '.xlsx'; q('.m-attn', m.body).textContent = 'Attached: ' + att; });
      q('.m-save', m.body).addEventListener('click', function () {
        if (calc(fake).due <= 0) return err(m, 'The claim must be higher than what is already certified.');
        var c;
        if (prevC) { c = prevC; c.lines = draft.lines; c.st = 'Submitted'; c.sent = iso(0); c.ret = null; c.log.push({ when: stamp(), who: ME.sub + ' · Bluewave MEP', text: 'Revised and resubmitted.' }); docsFor(clLink(c)).forEach(function (d) { if (d.kind === 'claim') { Object.assign(d, claimDoc(c, 'claim'), { id: d.id, version: d.version + 1, versions: d.versions.concat([{ v: d.version + 1, date: SDA.fmtDate(new Date()), by: ME.sub, note: 'Revised claim' }]) }); } }); }
        else {
          c = { id: 'CL-' + (++clSeq), sc: sc.id, sub: sc.sub, p: sc.p, no: last + 1, code: 'PC-' + pad(last + 1), st: 'Submitted', sent: iso(0), period: periodOf(iso(0)), by: ME.sub, lines: draft.lines, check: null, log: [{ when: stamp(), who: ME.sub + ' · Bluewave MEP', text: 'Progress claim submitted' + (att ? ' with ' + att : '') + '.' }] };
          CLAIMS.push(c); dms.add(claimDoc(c, 'claim'));
          if (att) dms.add({ name: att, type: /xls/.test(att) ? 'xlsx' : 'pdf', folder: 'Claims', project: c.p, subs: [MYSUB], linked: clLink(c), owner: ME.sub, status: 'Pending', mine: 1 });
        }
        feed(c.code + ' claim submitted by Bluewave MEP.', ME.sub + ' · Bluewave MEP', c.p);
        m.close(); toast(c.code + ' submitted to ' + ME.pm + ' for certification (simulated notification).'); render();
      });
    }
    function quoteModal(mr) {
      var mine = mr.quotes.filter(function (x) { return x.v === MYSUB; })[0];
      var m = SDA.modal(root, { title: 'Quote for ' + mr.id, html: '<div class="sd-form"><p class="sd-sub"><b>' + esc(mr.item) + '</b> · ' + num(mr.qty) + ' ' + esc(mr.unit) + ' · deliver by ' + dateTxt(mr.need) + ' to ' + esc(proj(mr.p).site) + '</p>' +
        '<div class="sd-2"><label>Unit price (USD)<input type="number" class="m-up" min="1" step="0.5" value="' + (mr.trade === 'Electrical' ? 79.5 : 165) + '"></label><label>Lead time (days)<input type="number" class="m-days" min="1" value="4"></label></div>' +
        '<p class="sd-sub m-tot"></p><label>Note<textarea class="m-n" rows="2">Price valid 30 days. Delivery included.</textarea></label><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + 'Send quote</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      function tot() { return Math.round((+q('.m-up', m.body).value || 0) * mr.qty); }
      function upd() { q('.m-tot', m.body).innerHTML = 'Total: <b>' + money(tot()) + '</b> excl. VAT'; }
      upd(); m.body.addEventListener('input', upd);
      q('.m-save', m.body).addEventListener('click', function () {
        if (!tot()) return;
        mine.pending = false; mine.amt = tot(); mine.days = Math.max(1, +q('.m-days', m.body).value || 1);
        if (!mr.quotes.some(function (x) { return x.pending; })) mr.st = 'Quotes in';
        feed('Bluewave MEP quoted ' + money(mine.amt) + ' for ' + mr.id + '.', ME.sub + ' · Bluewave MEP', mr.p);
        m.close(); toast('Quote sent for ' + mr.id + ' (' + money(mine.amt) + '). ' + ME.pm + ' can now compare (simulated notification).'); render();
      });
    }
    function dispatchModal(mr) {
      var m = SDA.modal(root, { title: 'Dispatch ' + mr.id, html: '<div class="sd-form"><p class="sd-sub"><b>' + esc(mr.item) + '</b> · ' + num(mr.qty) + ' ' + esc(mr.unit) + ' · ' + esc(mr.po) + '</p><div class="sd-2"><label>Delivery note no.<input type="text" class="m-dn" value="DN-BW-' + (4100 + Math.floor(Math.random() * 800)) + '"></label><label>Arrives on site<input type="date" class="m-d" value="' + iso(1) + '"></label></div><label class="chk"><input type="checkbox" checked> Driver will call the site engineer 30 minutes before arrival</label><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.truck + 'Mark dispatched</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () { mr.st = 'Dispatched'; mr.dn = q('.m-dn', m.body).value.trim() || 'DN-BW'; feed(mr.id + ' dispatched by Bluewave MEP (' + mr.dn + ').', ME.sub + ' · Bluewave MEP', mr.p); m.close(); toast(mr.id + ' dispatched. ' + proj(mr.p).eng + ' sees it on the phone (simulated notification).'); render(); });
    }
    function permitModal(p) {
      var pr = proj(p.p);
      var m = SDA.modal(root, { title: p.name + ' · ' + pr.short, wide: true, html: '<div class="sd-snm"><div><div class="sd-snh"><b>' + esc(p.name) + '</b>' + pmPill(p) + '</div>' +
        '<dl class="sd-dl"><dt>Authority</dt><dd>' + esc(p.auth) + '</dd><dt>Reference</dt><dd>' + esc(p.ref) + '</dd><dt>Project</dt><dd>' + esc(pr.site) + '</dd><dt>Valid until</dt><dd>' + (p.exp ? dateTxt(p.exp) + ' (' + daysTo(p.exp) + ' days)' : '—') + '</dd>' + (p.insp ? '<dt>Inspection</dt><dd>' + dateTxt(p.insp) + ' ' + p.inspT + '</dd>' : '') + '</dl>' +
        (p.missing.length || p.done.length ? '<h4 class="sd-h4">Required documents</h4><ul class="sd-req">' + p.done.map(function (d) { return '<li class="ok">' + IC.check + '<span>' + esc(d) + '</span><small>Provided</small></li>'; }).join('') + p.missing.map(function (d, i) { return '<li><span class="sd-req-x">' + IC.alert + '</span><span>' + esc(d) + '</span><button type="button" class="btn btn-ghost btn-sm m-prov" data-i="' + i + '">' + IC.doc + 'Use sample</button><label class="btn btn-ghost btn-sm sd-uplb">' + IC.upload + 'Upload<input type="file" class="sd-file m-upf" data-i="' + i + '"></label></li>'; }).join('') + '</ul>' : '') +
        '<h4 class="sd-h4">History</h4>' + timeline(p.log) + '</div><aside><h4 class="sd-h4 first">Reminders</h4><label class="chk"><input type="checkbox" class="m-rem"' + (p.remind ? ' checked' : '') + '> Remind 30, 14 and 7 days before expiry (simulated)</label>' +
        '<div class="sd-row"><button type="button" class="btn btn-ghost btn-sm m-now">' + IC.bell + 'Send reminder now</button>' + (expSoon(p) ? '<button type="button" class="btn btn-ink btn-sm m-renew">' + IC.sync + 'Renew</button>' : '') + (p.st === 'Ready to submit' ? '<button type="button" class="btn btn-ink btn-sm m-sub">Submit to authority</button>' : '') + (p.st === 'Inspection booked' ? '<button type="button" class="btn btn-ink btn-sm m-res">Record result</button>' : '') + (p.st === 'Not started' && !p.missing.length ? '<button type="button" class="btn btn-ink btn-sm m-sub">Submit application</button>' : '') + '</div>' +
        '<h4 class="sd-h4">Linked documents</h4>' + docBtns(docsFor(p.id)) + '</aside></div>' });
      function provide(i, file) {
        var d = p.missing.splice(i, 1)[0]; p.done.push(d);
        dms.add({ name: file || d + ' – ' + pr.short + '.pdf', type: 'pdf', folder: 'Permits', project: p.p, linked: p.id + ' · ' + p.name, owner: ME.pm, status: 'Valid', title: d, company: CO, meta: [['For', p.name], ['Project', pr.site]], sections: file ? null : [{ p: d + ' prepared for ' + p.auth + '. ' + sample }] });
        p.log.push({ when: stamp(), who: ME.pm, text: 'Document provided: ' + d + '.' });
        if (!p.missing.length && /Missing|Not started/.test(p.st)) p.st = 'Ready to submit';
        m.close(); toast(d + ' added and linked to ' + p.id + '.' + (p.st === 'Ready to submit' ? ' Ready to submit.' : '')); render(); permitModal(p);
      }
      m.body.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.classList.contains('m-prov')) provide(+t.dataset.i);
        if (t.classList.contains('m-now')) { p.log.push({ when: stamp(), who: ME.pm, text: 'Reminder sent to ' + pr.eng + ' and document controller (simulated, not sent).' }); toast('Reminder sent to ' + pr.eng + ' (simulated, not sent).'); }
        if (t.classList.contains('m-renew')) { m.close(); renewModal(p); }
        if (t.classList.contains('m-sub')) { m.close(); submitPermit(p); }
        if (t.classList.contains('m-res')) { m.close(); resultModal(p); }
      });
      m.body.addEventListener('change', function (e) {
        if (e.target.classList.contains('m-rem')) { p.remind = e.target.checked; toast('Expiry reminders ' + (p.remind ? 'on' : 'off') + ' for ' + p.name + ' (simulated).'); render(); }
        if (e.target.classList.contains('m-upf') && e.target.files[0]) provide(+e.target.dataset.i, e.target.files[0].name);
      });
    }
    function submitPermit(p) { p.st = 'In review'; p.sub = iso(0); p.log.push({ when: stamp(), who: ME.pm, text: 'Submitted to ' + p.auth + ' (simulated, not sent).' }); feed(p.name + ' submitted to ' + p.auth + '.', ME.pm, p.p); toast(p.name + ' submitted to ' + p.auth + ' (simulated, not sent).'); render(); }
    function renewModal(p) {
      var pr = proj(p.p);
      var m = SDA.modal(root, { title: 'Renew · ' + p.name, html: '<div class="sd-form"><p class="sd-sub">' + esc(pr.site) + ' · expires ' + dateTxt(p.exp) + ' (' + daysTo(p.exp) + ' days). Works must stop on site if it lapses.</p>' +
        '<b class="sd-cardt">Renewal pack</b><ul class="sd-req"><li class="ok">' + IC.check + '<span>Current ' + esc(p.name) + '</span><small>On file</small></li><li class="ok">' + IC.check + '<span>Contractor all-risk insurance certificate</span><small>On file, valid</small></li><li class="ok">' + IC.check + '<span>Updated programme to handover (' + shortD(iso(pr.end)) + ')</span><small>Generated from SiteDesk</small></li></ul>' +
        '<label>New validity requested<select class="m-v"><option value="30">30 days (to handover)</option><option value="60" selected>60 days (handover plus snagging)</option><option value="90">90 days</option></select></label>' +
        '<label>Cover note to ' + esc(p.auth) + '<textarea class="m-n" rows="3">Dear team, please renew ' + esc(p.ref) + ' for unit ' + esc(pr.name.replace(/^.*?(G-24|R-03|Level 14).*$/, '$1')) + '. Handover is planned for ' + dateTxt(iso(pr.end)) + '. Updated programme and insurance attached. Regards, ' + esc(ME.pm) + ', ' + esc(CO) + '</textarea></label>' +
        '<div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.sync + 'Submit renewal (simulated, not sent)</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () {
        var days = +q('.m-v', m.body).value;
        p.st = 'Renewal submitted'; p.log.push({ when: stamp(), who: ME.pm, text: 'Renewal for ' + days + ' days submitted with programme and insurance (simulated, not sent).' });
        dms.add({ name: 'Renewal request – ' + p.name + ' – ' + pr.short + '.pdf', type: 'pdf', folder: 'Permits', project: p.p, linked: p.id + ' · ' + p.name, owner: ME.pm, status: 'Pending', title: 'Renewal request · ' + p.ref, company: CO, meta: [['To', p.auth], ['Current expiry', dateTxt(p.exp)], ['Requested', days + ' days']], sections: [{ h: 'Attachments', lines: ['Current ' + p.name, 'Contractor all-risk insurance certificate', 'Updated programme to handover'] }, { p: sample }] });
        dms.add({ name: 'Programme to handover – ' + pr.short + '.pdf', type: 'pdf', folder: 'Permits', project: p.p, linked: p.id + ' · ' + p.name, owner: 'SiteDesk', status: 'Valid', title: 'Programme · ' + pr.name, company: CO, meta: [['Generated', SDA.fmtDate(new Date())], ['Progress', pr.progress + '%']], sections: [{ h: 'Activities', rows: [['Activity', 'Start', 'Finish', 'Done']].concat(pr.ms.map(function (x) { return [x[0], shortD(iso(x[1])), shortD(iso(x[2])), x[3] + '%']; })) }, { p: sample }] });
        feed(p.name + ' renewal submitted.', ME.pm, p.p);
        guide.done('permit'); m.close(); toast('Renewal submitted to ' + p.auth + ' (simulated, not sent). Reminders keep running until approved.'); render();
        ctx.later(9000, function () {
          if (p.st !== 'Renewal submitted') return;
          p.st = 'Approved'; p.exp = iso(daysTo(p.exp) + days); p.log.push({ when: stamp(), who: p.auth, text: 'Renewal approved. Valid until ' + dateTxt(p.exp) + ' (simulated).' });
          docsFor(p.id).forEach(function (d) { if (d.permit === p.id) { d.status = 'Valid'; d.version += 1; d.meta = [['Reference', p.ref], ['Project', pr.site], ['Issued to', CO], ['Valid until', dateTxt(p.exp)]]; d.versions.push({ v: d.version, date: SDA.fmtDate(new Date()), by: p.auth, note: 'Renewed until ' + dateTxt(p.exp) + ' (simulated)' }); } });
          toast(p.auth + ' approved the renewal: valid until ' + dateTxt(p.exp) + ' (simulated).');
          if (!q('.sda-modal')) render();
        });
      });
    }
    function resultModal(p) {
      var m = SDA.modal(root, { title: 'Inspection result · ' + p.name, html: '<div class="sd-form"><p class="sd-sub">' + esc(proj(p.p).site) + ' · ' + dateTxt(p.insp) + ' ' + p.inspT + '</p><fieldset class="sd-fs"><legend>Result</legend><div class="sd-seg"><label class="sd-radio"><input type="radio" name="sd-res" value="pass" checked><span>Passed</span></label><label class="sd-radio"><input type="radio" name="sd-res" value="fail"><span>Failed</span></label></div></fieldset><label>Inspector comments<textarea class="m-c" rows="2">All fire alarm devices tested. Exit signage compliant.</textarea></label><div class="sd-row"><button type="button" class="btn btn-ink btn-sm m-save">' + IC.check + 'Save result</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      q('.m-save', m.body).addEventListener('click', function () {
        var pass = q('input[name="sd-res"]:checked', m.body).value === 'pass', c = q('.m-c', m.body).value.trim();
        p.st = pass ? 'Approved' : 'Re-inspection needed'; if (pass) p.exp = iso(365);
        p.log.push({ when: stamp(), who: ME.pm, text: (pass ? 'Inspection passed. ' : 'Inspection failed. ') + c });
        dms.add(Object.assign(irDoc('IR-' + (50 + Math.floor(Math.random() * 40)), p.name + ' – ' + pS(p.p), p.p, ['bw'], [['Result', pass ? 'Pass' : 'Fail'], ['Comments', c || '—']], pass ? 'Passed' : 'Failed'), { linked: p.id + ' · ' + p.name }));
        feed(p.name + ': inspection ' + (pass ? 'passed' : 'failed') + '.', ME.pm, p.p);
        m.close(); toast('Result saved and inspection report filed in the DMS.'); render();
      });
    }

    /* ================= engineer actions ================= */
    function startPlace(e, box) {
      var r = box.getBoundingClientRect(), x, y;
      if (e && e.clientX) { x = (e.clientX - r.left) / r.width * 100; y = (e.clientY - r.top) / r.height * 100; } else { x = 50; y = 60; }
      x = Math.round(Math.max(3, Math.min(97, x)) * 10) / 10; y = Math.round(Math.max(4, Math.min(96, y)) * 10) / 10;
      var room = roomAt(proj(MYP).plan, x, y), keep = ui.draft && ui.draft.repin ? ui.draft : null;
      var title = keep ? keep.title : room === 'Washrooms' ? 'Mirror not fixed securely above basin 3' : 'Double socket loose, faceplate cracked';
      ui.draft = keep ? Object.assign(keep, { x: x, y: y, room: room, repin: false }) : { x: x, y: y, room: room, title: title, trade: suggestTrade(title) || 'Electrical', touched: false, pri: 'Medium', due: iso(3), photos: [] };
      ui.placing = false; ui.sheet = { k: 'new' }; render();
    }
    function saveSnag() {
      var d = ui.draft;
      d.title = (q('.sd-f-title') || {}).value || d.title;
      if (!d.title.trim()) { d.err = 'Describe the defect in a few words.'; render(); var t = q('.sd-f-title'); if (t) t.focus(); return; }
      if (!d.photos.length) { d.err = 'Add at least one photo so the subcontractor can find it.'; render(); var c = q('[data-a="snag-cam"]'); if (c) c.focus(); return; }
      var k = newSnagId(MYP);
      var s = { id: k.id, n: k.n, p: MYP, x: d.x, y: d.y, room: d.room, title: d.title.trim(), trade: d.trade, sub: tradeSub(d.trade), pri: d.pri, due: d.due || iso(3), st: 'Open', created: iso(0), by: ME.eng, photos: d.photos.map(function (p) { return { src: p.src, by: ME.eng }; }), after: [], log: [] };
      s.log.push({ when: stamp(), who: ME.eng, text: 'Snag logged on the plan with ' + s.photos.length + ' photo' + (s.photos.length > 1 ? 's' : '') + '. ' + SUBS[s.sub].s + ' notified (simulated, not sent).' });
      SN.push(s); s.photos.forEach(function (ph) { dms.add(photoDoc(s, ph, 'before')); });
      feed(s.id + ' logged in ' + s.room + ': ' + s.title + ' → ' + SUBS[s.sub].s + '.', ME.eng);
      ui.sheet = null; ui.draft = null; ui.sf = 'open';
      guide.done('snag'); toast(s.id + ' saved. ' + SUBS[s.sub].s + ' notified (simulated, not sent).'); render();
    }

    /* ================= events ================= */
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]'); if (!b || b.closest('.sda-modal') || !root.contains(b)) return;
      var a = b.dataset.a, id = b.dataset.id, v = b.dataset.v;
      if (a === 'noop') return;
      if (a === 'nav') { ui.pm = v; return render(true); }
      if (a === 'etab') { ui.eng = v; ui.sheet = null; ui.placing = false; return render(true); }
      if (a === 'stab') { ui.sub = v; return render(true); }
      if (a === 'side') { ui.side = v; render(); if (v === 'docs' && window.innerWidth < 980) { var sl = q('.sd-dms-slot'); if (sl) sl.scrollIntoView({ block: 'start', behavior: SDA.reduce ? 'auto' : 'smooth' }); } return; }
      if (a === 'doc') { if (id) dms.open(id); return; }
      if (a === 'snag') {
        var s = find(SN, id);
        if (role === 'eng') { ui.sheet = { k: 'snag', id: id }; ui.rejecting = null; return render(); }
        if (role === 'sub') return subSnagModal(s);
        return pmSnagModal(s);
      }
      if (a === 'sheet-x') { ui.sheet = null; ui.draft = null; ui.rejecting = null; return render(); }
      if (a === 'sf') { ui.sf = v; return render(); }
      if (a === 'new-snag') { ui.placing = true; ui.sf = 'open'; render(); var pb = q('.sd-planbox.placing'); if (pb) { pb.focus({ preventScroll: true }); } return; }
      if (a === 'place-x') { ui.placing = false; if (ui.draft && ui.draft.repin) { ui.draft.repin = false; ui.sheet = { k: 'new' }; } return render(); }
      if (a === 'place') return startPlace(e, b);
      if (a === 'repin') { ui.draft.title = q('.sd-f-title').value; ui.draft.repin = true; ui.sheet = null; ui.placing = true; return render(); }
      if (a === 'snag-cam') { ui.draft.title = q('.sd-f-title').value; ui.draft.photos.push({ src: SDA.art(KIND[ui.draft.trade] || 'damage', 'New snag · ' + ui.draft.room + ' · ' + hhmm()) }); ui.draft.err = ''; return render(); }
      if (a === 'save-snag') return saveSnag();
      if (a === 'close-snag') {
        var sc = find(SN, id); sc.st = 'Closed'; sc.log.push({ when: stamp(), who: ME.eng, text: 'Verified on site and closed.' });
        docsFor(sc.id).forEach(function (d) { if (d.snag) d.tags = d.tags.concat(['closed']); });
        feed(sc.id + ' verified and closed.', ME.eng); guide.done('verify'); ui.sheet = null;
        toast(sc.id + ' closed. ' + SUBS[sc.sub].s + ' notified (simulated, not sent).'); return render();
      }
      if (a === 'rej-open') { ui.rejecting = id; render(); var rc = q('.sd-rejf button'); if (rc) rc.focus(); return; }
      if (a === 'rej-x') { ui.rejecting = null; return render(); }
      if (a === 'rej-chip') { qa('.sd-rejf [data-a="rej-chip"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); return; }
      if (a === 'reject') {
        var sr = find(SN, id), chip = q('.sd-rejf [aria-pressed="true"]'), txt = q('.sd-rej-t').value.trim();
        if (!chip && !txt) { toast('Pick a reason or write a short comment.', 'warn'); return; }
        sr.reason = (chip ? chip.textContent + (txt ? ': ' : '.') : '') + txt; sr.st = 'Reopened';
        sr.log.push({ when: stamp(), who: ME.eng, text: 'Rejected: ' + sr.reason + ' Reopened.' }); feed(sr.id + ' rejected and reopened: ' + sr.reason, ME.eng);
        ui.rejecting = null; ui.sheet = null; toast(sr.id + ' reopened. ' + SUBS[sr.sub].s + ' notified (simulated, not sent).'); return render();
      }
      if (a === 'remind') { var sm = find(SN, id); sm.log.push({ when: stamp(), who: ME.eng, text: 'Reminder sent to ' + SUBS[sm.sub].s + ' (simulated, not sent).' }); toast('Reminder sent to ' + SUBS[sm.sub].s + ' (simulated, not sent).'); return render(); }
      if (a === 'dictate') {
        var ta = q('.sd-vn'); if (!ta || ui.rep.busy) return;
        ui.rep.busy = 'mic'; render(); ta = q('.sd-vn'); ta.value = '';
        var words = NOTE.split(' '), i = 0;
        if (SDA.reduce) { ui.rep.text = NOTE; ui.rep.busy = false; return render(); }
        var t = setInterval(function () { i += 2; var el = q('.sd-vn'); if (el) el.value = words.slice(0, i).join(' '); if (i >= words.length) { clearInterval(t); ui.rep.text = NOTE; ui.rep.busy = false; render(); toast('Voice note transcribed (simulated).'); } }, 45);
        ctx.onCleanup(function () { clearInterval(t); });
        return;
      }
      if (a === 'structure') {
        var tv = q('.sd-vn'); ui.rep.text = tv ? tv.value : ui.rep.text;
        if (!ui.rep.text.trim()) { toast('Dictate or type a short note first.', 'warn'); return; }
        ui.rep.busy = 'ai'; render();
        ctx.later(SDA.reduce ? 50 : 1300, function () { ui.rep.parsed = parseNote(ui.rep.text); ui.rep.busy = false; if (!ui.rep.photos.length) ui.rep.photos.push({ src: SDA.art('room', 'Meeting room 1 · ceiling boarded') }); render(); var ai = q('.sd-ph-b .sd-ai'), pb = q('.sd-ph-b'); if (ai && pb) pb.scrollTop = ai.offsetTop - pb.offsetTop - 8; });
        return;
      }
      if (a === 'rep-edit') { ui.rep.parsed = null; return render(); }
      if (a === 'rep-cam') { ui.rep.photos.push({ src: SDA.art(ui.rep.photos.length % 2 ? 'pallet' : 'room', 'Business Bay office · ' + hhmm()) }); return render(); }
      if (a === 'rep-submit') {
        var o = ui.rep.parsed;
        if (!o.mp.length) { toast('No manpower found in the note. Add for example “8 Bluewave MEP”.', 'warn'); return; }
        var r = addReport({ p: MYP, date: iso(0), time: hhmm(), by: ME.eng, wx: WX, mp: o.mp, work: o.work, delays: o.delays, next: o.next, heat: o.heat, notes: o.notes, photos: ui.rep.photos.slice() });
        dms.add(reportDoc(r));
        feed('Daily report submitted (' + r.total + ' on site, ' + r.delays.length + ' delay' + (r.delays.length === 1 ? '' : 's') + ').', ME.eng);
        toast('Daily report submitted. Project manager sees it on the dashboard (notification simulated, not sent).'); return render();
      }
      if (a === 'rep-open') return reportModal(find(REPORTS, id));
      if (a === 'mr-new') { ui.sheet = { k: 'mr' }; return render(); }
      if (a === 'mr-save') {
        var item = q('.sd-sheet .m-item').value.trim(), qty = +q('.sd-sheet .m-qty').value;
        if (!item || !qty) { err(q('.sd-sheet'), 'Enter material and quantity.'); return; }
        var trade = q('.sd-sheet .m-trade').value, mr = { id: 'MR-' + (++seq.MR), p: MYP, item: item, qty: qty, unit: q('.sd-sheet .m-unit').value, trade: trade, need: q('.sd-sheet .m-need').value || iso(5), by: ME.eng, raised: iso(0), st: 'Awaiting quotes', note: q('.sd-sheet .m-note').value,
          quotes: [{ v: 'Desert Gypsum Supplies', pending: true }, { v: 'Coastline Trading', pending: true }].concat(tradeSub(trade) === 'bw' ? [{ v: 'bw', pending: true }] : [{ v: 'Gulf Build Materials', pending: true }]) };
        MRS.push(mr); ui.sheet = null;
        feed(mr.id + ' requested: ' + num(qty) + ' ' + mr.unit + ' ' + item + '. Quotes requested from suppliers (simulated, not sent).', ME.eng);
        toast(mr.id + ' sent. Quotes requested from ' + mr.quotes.length + ' suppliers (simulated, not sent).'); render();
        ctx.later(SDA.reduce ? 200 : 3500, function () {
          var base = Math.round(qty * (42 + item.length % 9 * 6));
          mr.quotes.forEach(function (x, i) { if (x.v !== 'bw' && x.pending) { x.pending = false; x.amt = Math.round(base * [1, 0.93, 1.07][i] / 10) * 10; x.days = [3, 7, 2][i]; } });
          if (!mr.quotes.some(function (x) { return x.pending; })) mr.st = 'Quotes in';
          feed(mr.id + ': supplier quotes received (simulated).', 'SiteDesk');
          toast(mr.id + ': supplier quotes received (simulated). The project manager can compare them.');
          if (!q('.sda-modal')) render();
        });
        return;
      }
      if (a === 'deliv') { ui.sheet = { k: 'deliv', id: id }; return render(); }
      if (a === 'dn-cam') { ui.sheet.ph = SDA.art('parcel', 'Delivery note · ' + hhmm()); return render(); }
      if (a === 'deliv-save') {
        var md = find(MRS, id), rec = +q('.sd-sheet .m-rec').value, dmg = q('.sd-sheet .m-dmg').checked;
        md.st = 'Delivered'; md.recv = rec;
        dms.add({ name: 'Delivery note ' + md.dn + ' – ' + md.item + '.jpg', type: 'jpg', folder: 'Procurement', project: md.p, subs: SUBS[picked(md).v] ? [picked(md).v] : [], linked: md.id + ' · ' + pS(md.p), owner: ME.eng, status: dmg || rec < md.qty ? 'Shortage' : 'Received', img: ui.sheet.ph || SDA.art('parcel', 'Delivery note ' + md.dn) });
        feed(md.id + ' received on site: ' + num(rec) + ' of ' + num(md.qty) + ' ' + md.unit + (dmg ? ', damage reported' : '') + '.', ME.eng);
        ui.sheet = null; toast(md.id + ' received' + (rec < md.qty || dmg ? '. Shortage/damage flagged to the supplier (simulated, not sent).' : '. Delivery note filed in the DMS.')); return render();
      }
      /* project manager */
      if (a === 'gantt') { ui.gantt = v; return render(); }
      if (a === 'snag-trade') { ui.pm = 'snags'; ui.ps.trade = v; ui.ps.st = 'open'; ui.ps.p = 'All'; return render(true); }
      if (a === 'ps-st') { ui.ps.st = v; return render(); }
      if (a === 'permit') return permitModal(find(PERMITS, id));
      if (a === 'renew') return renewModal(find(PERMITS, id));
      if (a === 'p-submit') return submitPermit(find(PERMITS, id));
      if (a === 'p-result') return resultModal(find(PERMITS, id));
      if (a === 'mr') { ui.mr = v; return render(); }
      if (a === 'mr-q') return quoteCompare(find(MRS, id));
      if (a === 'mr-chase') { toast('Reminder sent to suppliers with open quotes (simulated, not sent).'); return; }
      if (a === 'claim') return claimModal(find(CLAIMS, id));
      if (a === 'nudge') { toast('Reminder sent to site engineers without a report today (simulated, not sent).'); return; }
      /* subcontractor */
      if (a === 'subsf') { ui.subSf = v; return render(); }
      if (a === 'fix') return fixModal(find(SN, id));
      if (a === 'scope') return scopeModal(find(SN, id));
      if (a === 'sub-snag') return subSnagModal(find(SN, id));
      if (a === 'quote') return quoteModal(find(MRS, id));
      if (a === 'dispatch') return dispatchModal(find(MRS, id));
      if (a === 'new-claim') { var scx = find(SC, id); return claimForm(scx, openClaim(scx)); }
    });
    root.addEventListener('keydown', function (e) {
      var t = e.target;
      if ((e.key === 'Enter' || e.key === ' ') && t.classList && t.classList.contains('placing')) { e.preventDefault(); startPlace(null, t); }
    });
    root.addEventListener('input', function (e) {
      var t = e.target;
      if (t.classList.contains('sd-vn')) { ui.rep.text = t.value; return; }
      if (t.classList.contains('sd-f-title') && ui.draft) {
        ui.draft.title = t.value;
        var sug = suggestTrade(t.value), line = q('.sd-ai-s span');
        if (line) line.innerHTML = sug ? 'AI (simulated) suggests <b>' + sug + '</b> → ' + esc(SUBS[tradeSub(sug)].s) : 'AI (simulated) suggests a trade as you type';
        if (sug && !ui.draft.touched && sug !== ui.draft.trade) { ui.draft.trade = sug; var s2 = q('.sd-f-trade'); if (s2) s2.value = sug; var fs = q('.sd-f-sub b'); if (fs) fs.textContent = SUBS[tradeSub(sug)].name; }
        return;
      }
      if (t.dataset && t.dataset.f === 'ps-q') { ui.ps.q = t.value; var pos = t.selectionStart; render(); var n = q('[data-f="ps-q"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } }
    });
    root.addEventListener('change', function (e) {
      var t = e.target, f = t.dataset && t.dataset.f;
      if (t.classList.contains('sd-f-trade') && ui.draft) { ui.draft.trade = t.value; ui.draft.touched = true; var fs = q('.sd-f-sub b'); if (fs) fs.textContent = SUBS[tradeSub(t.value)].name; return; }
      if (t.classList.contains('sd-f-due') && ui.draft) { ui.draft.due = t.value; return; }
      if (t.name === 'sd-pri' && ui.draft) { ui.draft.pri = t.value; return; }
      if (f === 'snag-file' && t.files[0] && ui.draft) { ui.draft.title = q('.sd-f-title').value; ui.draft.photos.push({ src: URL.createObjectURL(t.files[0]) }); ui.draft.err = ''; toast('Photo added. It stays in your browser.'); return render(); }
      if (f === 'rep-file' && t.files[0]) { ui.rep.photos.push({ src: URL.createObjectURL(t.files[0]) }); toast('Photo added. It stays in your browser.'); return render(); }
      if (!f || !t.closest('.sd-main')) return;
      if (f === 'gantt') { ui.gantt = t.value; return render(); }
      if (f === 'diary') { ui.diary = t.value; return render(); }
      if (f === 'permit') { ui.permit = t.value; return render(); }
      if (f === 'risk') { ui.risk = t.checked; return render(); }
      if (f === 'ps-p') { ui.ps.p = t.value; return render(); }
      if (f === 'ps-trade') { ui.ps.trade = t.value; return render(); }
    });

    /* a simulated reminder: the landlord NOC is about to expire */
    ctx.later(40000, function () {
      var p = find(PERMITS, 'PM-31');
      if (p.st === 'Approved' && expSoon(p) && role === 'pm') toast('Reminder: ' + p.name + ' for ' + pS(p.p) + ' expires in ' + daysTo(p.exp) + ' days (simulated notification).', 'warn');
    });
    /* keep the phone clock current */
    ctx.every(30000, function () { var c = q('.sd-status span'); if (c) c.textContent = hhmm(); });

    ready = true;
    render();
  });
})();
