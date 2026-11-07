/* Management Dashboard demo (Insight Board). All data is fictional sample data for "Northfield Industries".
   Nothing is sent anywhere: e-mails are simulated, AI summaries are simulated and built from the numbers on screen. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-dash', function (root, ctx) {
    var $ = function (s, r) { return (r || root).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
    var esc = SDA.esc, IC = SDA.icon;
    var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var ICO = {
      pdf: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3"/>'),
      plus: svg('<path d="M12 5v14M5 12h14"/>'),
      pause: svg('<path d="M9 5v14M15 5v14"/>'),
      play: svg('<path d="M7 5v14l11-7z"/>'),
      trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
      send: svg('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>'),
      alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
      up: svg('<path d="M7 17 17 7M9 7h8v8"/>'),
      lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
      arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
      mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
      clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
      user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
      filter: svg('<path d="M3 5h18l-7 8v6l-4 2v-8z"/>')
    };

    /* ---------------- seeded sample data ---------------- */
    var seed = 20261031;
    var rnd = function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    var MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var NM = 22; // Jan 2025 .. Oct 2026
    var mYear = function (m) { return 2025 + Math.floor(m / 12); };
    var mLab = function (m) { return MN[m % 12] + ' ' + mYear(m); };
    var SEASON = [0.92, 0.95, 1.02, 1.0, 1.03, 1.05, 0.97, 0.96, 1.04, 1.06, 1.02, 0.98];
    var REG = ['Northeast', 'Midwest', 'South', 'West'];
    var REGW = { Northeast: 0.28, Midwest: 0.26, South: 0.24, West: 0.22 };
    var PRODS = [
      { id: 'pumps', name: 'Industrial pumps', base: 1.8e6, aov: 14000, gm: 0.325 },
      { id: 'valves', name: 'Valves & fittings', base: 1.4e6, aov: 6000, gm: 0.39 },
      { id: 'parts', name: 'Spare parts & service', base: 1.0e6, aov: 2500, gm: 0.47 }
    ];
    var PN = {}; PRODS.forEach(function (p) { PN[p.id] = p.name; });
    var CUSTS = [
      { n: 'Harborview Utilities', r: 'Northeast', w: 0.30, mix: [1, 0.7, 0.5] },
      { n: 'Granite Ridge Brewing', r: 'Northeast', w: 0.22, mix: [0.4, 1, 0.6] },
      { n: 'Atlantic Paper Mill', r: 'Northeast', w: 0.20, mix: [1, 0.5, 0.7] },
      { n: 'Bayside Pharma Labs', r: 'Northeast', w: 0.16, mix: [0.5, 1, 0.4] },
      { n: 'Pinecrest Foods', r: 'Northeast', w: 0.12, mix: [0.6, 0.6, 1] },
      { n: 'Prairie Grain Co-op', r: 'Midwest', w: 0.26, mix: [0.8, 0.6, 1] },
      { n: 'Lakeshore Chemicals', r: 'Midwest', w: 0.24, mix: [0.7, 1, 0.5] },
      { n: 'Riverbend Steelworks', r: 'Midwest', w: 0.22, mix: [1, 0.4, 0.6], story: 'deferred two pump orders to Q4 during a plant shutdown' },
      { n: 'Heartland Dairy', r: 'Midwest', w: 0.16, mix: [0.5, 1, 0.7] },
      { n: 'Cedar Valley Water Authority', r: 'Midwest', w: 0.12, mix: [1, 0.6, 0.5] },
      { n: 'Gulfview Marine', r: 'South', w: 0.24, mix: [0.5, 0.6, 1], story: 'started a fleet retrofit program in July (spare parts and service)' },
      { n: 'Magnolia Textiles', r: 'South', w: 0.22, mix: [0.8, 1, 0.5] },
      { n: 'Lone Oak Refining', r: 'South', w: 0.22, mix: [1, 0.7, 0.6] },
      { n: 'Bayou Water District', r: 'South', w: 0.18, mix: [1, 0.5, 0.4] },
      { n: 'Peach Valley Packaging', r: 'South', w: 0.14, mix: [0.4, 1, 0.6] },
      { n: 'Redwood Bottling Co.', r: 'West', w: 0.28, mix: [0.5, 1, 0.5], story: 'is waiting for valve bodies held up at our casting supplier' },
      { n: 'Sierra Mining Supply', r: 'West', w: 0.22, mix: [1, 0.6, 0.7] },
      { n: 'Pacific Crest Foods', r: 'West', w: 0.20, mix: [0.6, 0.8, 1] },
      { n: 'Desert Sun Solar', r: 'West', w: 0.16, mix: [1, 0.7, 0.4] },
      { n: 'Cascade Paper Products', r: 'West', w: 0.14, mix: [0.8, 0.6, 0.8] }
    ];
    var CUST = {}; CUSTS.forEach(function (c) { CUST[c.n] = c; });
    var PLAN = {}; // PLAN[r|p|m] = {rev, n}
    var pk = function (r, p, m) { return r + '|' + p + '|' + m; };
    var ORDERS = [], BYM = [];
    (function gen() {
      var seq = 48100;
      REG.forEach(function (r) {
        var cs = CUSTS.filter(function (c) { return c.r === r; });
        PRODS.forEach(function (p, pi) {
          var denom = cs.reduce(function (s, c) { return s + c.w * c.mix[pi]; }, 0);
          for (var m = 0; m < NM; m++) {
            var key = pk(r, p.id, m); PLAN[key] = PLAN[key] || { rev: 0, n: 0 };
            cs.forEach(function (c) {
              var E = p.base * REGW[r] * SEASON[m % 12] * (c.w * c.mix[pi] / denom);
              var planRev = E * (1 + 0.06 * m / 12) * 1.01;
              PLAN[key].rev += planRev; PLAN[key].n += planRev / p.aov;
              var f = (1 + 0.07 * m / 12) * (0.95 + rnd() * 0.1), ot = 0.966, gmAdj = 0;
              if (c.n === 'Redwood Bottling Co.') {
                if (p.id === 'valves' && m === 21) { f *= 0.62; ot = 0.36; }
                if (p.id === 'valves' && m === 20) { ot = 0.72; }
                if (p.id === 'pumps' && m === 21) { ot = 0.84; }
              } else if (r === 'West' && p.id === 'valves' && m === 21) ot = 0.86;
              if (c.n === 'Gulfview Marine' && m >= 18) { if (p.id === 'parts') f *= 1.9; if (p.id === 'valves') f *= 1.3; }
              if (c.n === 'Riverbend Steelworks' && p.id === 'pumps' && m >= 18 && m <= 20) f *= 0.5;
              if (p.id === 'pumps' && m >= 19) gmAdj -= 0.045;
              if (r === 'West' && p.id === 'valves' && m === 21) gmAdj -= 0.02;
              var act = E * f, n = Math.max(1, Math.round(act / p.aov));
              for (var k = 0; k < n; k++) {
                var val = Math.round(act / n * (0.8 + rnd() * 0.4) / 10) * 10;
                var late = rnd() > ot, gm = p.gm + gmAdj + (rnd() - 0.5) * 0.024;
                var cmp = rnd() < (late ? (c.n === 'Redwood Bottling Co.' ? 0.6 : 0.25) : 0.008);
                var day = 1 + Math.floor(rnd() * 26), lead = 8 + Math.floor(rnd() * 11);
                var od = new Date(mYear(m), m % 12, day), prom = new Date(od.getTime() + lead * 864e5);
                var ship = new Date(prom.getTime() + (late ? (2 + Math.floor(rnd() * 8)) : -Math.floor(rnd() * 4)) * 864e5);
                var o = { id: 'SO-' + (seq++), c: c.n, r: r, p: p.id, m: m, v: val, cost: val * (1 - gm), late: late, cmp: cmp, prom: prom, ship: ship };
                if (cmp) { o.cAt = ship.getTime() + (1 + Math.floor(rnd() * 8)) * 864e5; o.cTo = o.cAt + (late ? 12 + rnd() * 30 : 3 + rnd() * 22) * 864e5; }
                ORDERS.push(o); (BYM[m] = BYM[m] || []).push(o);
              }
            });
          }
        });
      });
    })();

    /* ---------------- periods, filters, aggregation ---------------- */
    var range = function (a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; };
    var PER = {
      month: { name: 'Month', ms: [21], prev: [20], label: 'Oct 2026', prevLabel: 'Sep 2026', win: range(16, 21) },
      quarter: { name: 'Quarter', ms: [18, 19, 20], prev: [15, 16, 17], label: 'Q3 2026', prevLabel: 'Q2 2026', win: range(12, 20) },
      year: { name: 'Year', ms: range(12, 21), prev: range(0, 9), label: 'YTD 2026', prevLabel: 'YTD 2025', win: range(12, 21) }
    };
    var TGT = { gm: 0.37, otd: 0.95 };
    var mEnd = function (m) { return new Date(mYear(m), m % 12 + 1, 1).getTime() - 1; };
    var match = function (o, f) { return !((f.r && f.r !== 'All' && o.r !== f.r) || (f.p && f.p !== 'All' && o.p !== f.p) || (f.c && o.c !== f.c)); };
    // open complaints are a stock: complaints raised before the end of the period and not yet resolved at that moment
    var isOpen = function (o, T) { return o.cmp && o.cAt <= T && o.cTo > T; };
    function openAt(f, last) {
      var T = mEnd(last), n = 0, late = 0;
      for (var m = Math.max(0, last - 3); m <= Math.min(NM - 1, last + 1); m++) (BYM[m] || []).forEach(function (o) { if (isOpen(o, T) && match(o, f)) { n++; if (o.late) late++; } });
      return { n: n, late: late };
    }
    function agg(f) {
      var a = { rev: 0, cost: 0, n: 0, late: 0, open: 0, openLate: 0, plan: 0, planN: 0, lastPlanN: 0 }, last = Math.max.apply(null, f.ms);
      f.ms.forEach(function (m) {
        var L = BYM[m] || [];
        for (var i = 0; i < L.length; i++) { var o = L[i]; if (!match(o, f)) continue; a.rev += o.v; a.cost += o.cost; a.n++; if (o.late) a.late++; }
      });
      var op = openAt(f, last); a.open = op.n; a.openLate = op.late;
      if (!f.c) f.ms.forEach(function (m) {
        REG.forEach(function (r) { if (f.r && f.r !== 'All' && r !== f.r) return;
          PRODS.forEach(function (p) { if (f.p && f.p !== 'All' && p.id !== f.p) return; var x = PLAN[pk(r, p.id, m)]; a.plan += x.rev; a.planN += x.n; if (m === last) a.lastPlanN += x.n; });
        });
      });
      else a.lastPlanN = a.n / f.ms.length;
      return a;
    }
    var KPI = {
      rev: { label: 'Revenue', kind: 'usd', v: function (a) { return a.rev; }, t: function (a) { return a.plan; }, tl: 'Plan' },
      gm: { label: 'Gross margin', kind: 'pct', v: function (a) { return a.rev ? (a.rev - a.cost) / a.rev : 0; }, t: function () { return TGT.gm; }, tl: 'Target' },
      otd: { label: 'On-time delivery', kind: 'pct', v: function (a) { return a.n ? 1 - a.late / a.n : 0; }, t: function () { return TGT.otd; }, tl: 'Target' },
      cmp: { label: 'Open complaints', kind: 'int', low: true, v: function (a) { return a.open; }, t: function (a) { return Math.max(2, Math.round(a.lastPlanN * 0.013)); }, tl: 'Max' },
      gp: { label: 'Gross profit', kind: 'usd', v: function (a) { return a.rev - a.cost; }, t: function (a) { return a.plan * TGT.gm; }, tl: 'Target' },
      ord: { label: 'Orders shipped', kind: 'int', v: function (a) { return a.n; }, t: function (a) { return Math.round(a.planN); }, tl: 'Plan' }
    };
    var pct = function (v, d) { return (v * 100).toFixed(d == null ? 1 : d) + '%'; };
    var sgn = function (v) { return v < 0 ? '−' : '+'; };
    var fmtK = function (k, v) { var K = KPI[k]; return K.kind === 'usd' ? SDA.usd(v) : K.kind === 'pct' ? pct(v) : Math.round(v).toLocaleString('en-US'); };
    function status(k, v, t) {
      var K = KPI[k];
      if (K.low) return v <= t ? 'ok' : v <= t * 1.25 ? 'warn' : 'bad';
      if (K.kind === 'pct') return v >= t ? 'ok' : v >= t - (k === 'otd' ? 0.025 : 0.012) ? 'warn' : 'bad';
      return v >= t ? 'ok' : v >= t * 0.97 ? 'warn' : 'bad';
    }
    function delta(k, v, pv) {
      var K = KPI[k], d, txt;
      if (K.kind === 'pct') { d = v - pv; txt = sgn(d) + Math.abs(d * 100).toFixed(1) + ' pp'; }
      else if (K.low) { d = v - pv; txt = sgn(d) + Math.abs(d); }
      else { d = pv ? (v - pv) / pv : 0; txt = sgn(d) + Math.abs(d * 100).toFixed(1) + '%'; }
      var zero = K.kind === 'pct' ? Math.abs(d) < 5e-4 : K.low ? d === 0 : Math.abs(d) < 5e-4;
      if (zero) txt = K.kind === 'pct' ? '0.0 pp' : K.low ? '0' : '0.0%';
      var good = zero ? null : (K.low ? d < 0 : d > 0);
      return { d: d, txt: txt, good: good };
    }

    /* ---------------- roles ---------------- */
    var ROLES = [
      { id: 'md', label: 'Managing director', person: 'Sarah Johnson', icon: 'SJ', sub: 'Sees all regions and every KPI, manages all report schedules.' },
      { id: 'sales', label: 'Sales manager', person: 'Lisa Miller', icon: 'LM', sub: 'Sees the West region only (customers, orders, deliveries) and can schedule reports for it.' },
      { id: 'ctrl', label: 'Controller', person: 'Michael Brown', icon: 'MB', sub: 'Finance view with margin focus, owns the KPI definitions and approves them.' }
    ];
    var role = 'md';
    var me = function () { return ROLES.filter(function (r) { return r.id === role; })[0].person; };
    var myRegion = function () { return role === 'sales' ? 'West' : null; };
    var VIEW_CFG = {
      md: { title: 'Company overview', sub: 'All regions and product lines, against plan and targets.', tiles: ['rev', 'gm', 'otd', 'cmp'],
        c1: { k: 'rev', t: 'Revenue by month', d: 'Actual vs plan' }, c2: { k: 'otd', dim: 'region', t: 'On-time delivery by region', d: 'Target 95%' } },
      sales: { title: 'West region · sales', sub: 'Your region only: customers, orders, deliveries and complaints.', tiles: ['rev', 'ord', 'otd', 'cmp'],
        c1: { k: 'rev', t: 'Revenue by month · West', d: 'Actual vs plan' }, c2: { k: 'otd', dim: 'product', t: 'On-time delivery by product line', d: 'Target 95%' } },
      ctrl: { title: 'Finance · margin view', sub: 'Gross margin and gross profit by month, product line and region.', tiles: ['gm', 'gp', 'rev', 'otd'],
        c1: { k: 'gm', t: 'Gross margin by month', d: 'Target 37%' }, c2: { k: 'gm', dim: 'product', t: 'Gross margin by product line', d: 'Target 37%' } }
    };

    /* ---------------- state ---------------- */
    var view = 'dash';
    var F = { per: 'month', r: 'All', p: 'All' };
    var ai = { html: '', key: '', busy: false };
    var kpiApproved = false, newDocs = 0, exportsN = 0;
    var fkey = function () { return [role, F.per, F.r, F.p].join('|'); };
    var scopeR = function () { return myRegion() || F.r; };
    var per = function () { return PER[F.per]; };
    function say(msg, kind) { SDA.toast(root, msg, kind); var l = $('.dash-live'); if (l) l.textContent = String(msg).replace(/<[^>]+>/g, ''); }
    var scopeText = function () { return (scopeR() === 'All' ? 'All regions' : scopeR() + ' region') + ' · ' + (F.p === 'All' ? 'All product lines' : PN[F.p]); };

    /* ---------------- guide ---------------- */
    var cta = { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=dashboard', text: 'Talk to us about your version' };
    var guide = SDA.guide($('.dash-guide'), { title: 'Find out why a number moved, then report it', demoId: 'demo-dash', cta: cta, steps: [
      { id: 'filter', text: '<span>Change a filter: <b>period</b>, <b>region</b> or <b>product line</b></span>' },
      { id: 'drill', text: '<span>Click a <b>bar</b> (try the red one) to see the customers and orders behind it</span>' },
      { id: 'ai', text: '<span>Press <b>Ask AI</b> for a summary of what changed</span>' },
      { id: 'export', text: '<span><b>Export PDF</b> and find it under Documents</span>' }] });

    /* ---------------- documents (DMS) ---------------- */
    var CO = 'Northfield Industries';
    var DOCS = [
      { id: 'dash-d-sep', name: 'Management report – Sep 2026.pdf', type: 'pdf', folder: 'Report archive', linked: 'Board meeting Oct 14', owner: 'Sarah Johnson', status: 'Final', tags: ['monthly'],
        title: 'Management report – September 2026', company: CO, meta: [['Period', 'Sep 2026'], ['Scope', 'All regions · All product lines'], ['Prepared by', 'Sarah Johnson']],
        sections: [{ h: 'KPIs', rows: [['KPI', 'Actual', 'Target', 'Status'], ['Revenue', '$4.60M', '$4.55M', 'On target'], ['Gross margin', '36.3%', '37.0%', 'Watch'], ['On-time delivery', '95.1%', '95.0%', 'On target'], ['Open complaints', '3', '≤ 4', 'On target']] },
          { h: 'Comment', p: 'Pump margin fell after the steel surcharge from August. Pricing review requested from Finance.' }] },
      { id: 'dash-d-aug', name: 'Management report – Aug 2026.pdf', type: 'pdf', folder: 'Report archive', owner: 'Sarah Johnson', status: 'Final', tags: ['monthly'],
        title: 'Management report – August 2026', company: CO, meta: [['Period', 'Aug 2026'], ['Scope', 'All regions · All product lines']],
        sections: [{ h: 'KPIs', rows: [['KPI', 'Actual', 'Target'], ['Revenue', '$4.19M', '$4.21M'], ['Gross margin', '36.5%', '37.0%'], ['On-time delivery', '96.4%', '95.0%']] }] },
      { id: 'dash-d-q2', name: 'Q2 2026 board pack.pdf', type: 'pdf', folder: 'Report archive', linked: 'Board meeting Jul 21', owner: 'Sarah Johnson', status: 'Final', tags: ['board', 'quarterly'],
        title: 'Board pack – Q2 2026', company: CO, meta: [['Period', 'Q2 2026'], ['Audience', 'Board of directors']], sections: [{ h: 'Highlights', lines: ['Revenue 3.1% above plan, led by South and Northeast', 'Gross margin 37.6% (target 37%)', 'On-time delivery 96.6%'] }] },
      { id: 'dash-d-w44', name: 'West region weekly – week 44.pdf', type: 'pdf', folder: 'Report archive', region: 'West', owner: 'Lisa Miller', status: 'Final', tags: ['weekly', 'West'],
        title: 'West region weekly – week 44', company: CO, meta: [['Region', 'West'], ['Prepared by', 'Lisa Miller']], sections: [{ h: 'Notes', lines: ['Redwood Bottling Co.: 6 valve orders delayed, customer informed', 'Sierra Mining Supply: new pump frame contract under negotiation'] }] },
      { id: 'dash-d-erp', name: 'ERP sales orders export – Oct 2026.xlsx', type: 'xlsx', folder: 'Excel source files', linked: 'Revenue, orders', owner: 'System (nightly)', status: 'Valid', tags: ['source', 'ERP'],
        title: 'ERP sales orders export – October 2026', company: CO, meta: [['Rows', ORDERS.filter(function (o) { return o.m === 21; }).length + ' orders'], ['Refreshed', 'Nov 1, 2026 06:00']],
        sections: [{ rows: [['Order', 'Customer', 'Region', 'Value']].concat(ORDERS.filter(function (o) { return o.m === 21; }).slice(0, 6).map(function (o) { return [o.id, o.c, o.r, SDA.money(o.v)]; })) }] },
      { id: 'dash-d-dlw', name: 'Delivery log – West – Oct 2026.xlsx', type: 'xlsx', folder: 'Excel source files', region: 'West', linked: 'On-time delivery · West', owner: 'Lisa Miller', status: 'Valid', tags: ['source', 'delivery', 'West'],
        title: 'Delivery log – West – October 2026', company: CO, meta: [['Region', 'West'], ['Source', 'Warehouse system export']],
        sections: [{ rows: [['Order', 'Customer', 'Promised', 'Shipped', 'Late']].concat(ORDERS.filter(function (o) { return o.m === 21 && o.r === 'West' && o.late; }).slice(0, 7).map(function (o) { return [o.id, o.c, SDA.fmtDate(o.prom), SDA.fmtDate(o.ship), 'Yes']; })) }, { p: 'Reason code for most late valve orders: VB-03 “Casting supplier delay (valve bodies)”.' }] },
      { id: 'dash-d-dls', name: 'Delivery log – South – Oct 2026.xlsx', type: 'xlsx', folder: 'Excel source files', region: 'South', linked: 'On-time delivery · South', owner: 'David Wilson', status: 'Valid', tags: ['source', 'delivery', 'South'],
        title: 'Delivery log – South – October 2026', company: CO, sections: [{ p: 'All shipments within the agreed window except 3 parts orders (carrier delay).' }] },
      { id: 'dash-d-cmp', name: 'Complaints register – Oct 2026.xlsx', type: 'xlsx', folder: 'Excel source files', linked: 'Open complaints', owner: 'Emma Davis', status: 'Valid', tags: ['source', 'quality'],
        title: 'Complaints register – October 2026', company: CO, sections: [{ rows: [['Order', 'Customer', 'Reason', 'Status']].concat(ORDERS.filter(function (o) { return o.m >= 20 && isOpen(o, mEnd(21)); }).slice(0, 6).map(function (o) { return [o.id, o.c, o.late ? 'Late delivery' : 'Damaged on arrival', 'Open']; })) }] },
      { id: 'dash-d-cost', name: 'Standard cost & surcharges 2026.xlsx', type: 'xlsx', folder: 'Excel source files', fin: true, linked: 'Gross margin', owner: 'Michael Brown', status: 'Valid', tags: ['finance', 'confidential'],
        title: 'Standard cost and surcharges 2026', company: CO, sections: [{ rows: [['Item', 'Since', 'Change'], ['Steel surcharge (pump housings)', 'Aug 1, 2026', '+11% material cost'], ['Expedite freight West', 'Oct 2026', '$18,400'], ['Copper (motors)', 'Jan 2026', '+2%']] }] },
      { id: 'dash-d-kpi', name: 'KPI definitions v3.pdf', type: 'pdf', folder: 'KPI definitions', linked: 'All dashboard KPIs', owner: 'Michael Brown', status: 'In review', kpi: true, tags: ['definitions'],
        title: 'KPI definitions – version 3', company: CO, meta: [['Owner', 'Michael Brown (Controller)'], ['Change', 'Open complaints now counted per order']],
        sections: [{ rows: [['KPI', 'Definition', 'Target'], ['Revenue', 'Invoiced net sales of shipped orders, by order month', 'Plan 2026'], ['Gross margin', '(Revenue − standard cost incl. surcharges) ÷ revenue', '≥ 37%'], ['On-time delivery', 'Orders shipped on or before the promised date ÷ all shipped orders', '≥ 95%'], ['Open complaints', 'Complaints raised in the period that are still open', '≤ 1.2% of planned orders']] }] },
      { id: 'dash-d-gm', name: 'Gross margin method.docx', type: 'docx', folder: 'KPI definitions', owner: 'Michael Brown', status: 'Approved', tags: ['finance'],
        title: 'Gross margin calculation method', company: CO, sections: [{ p: 'Standard cost per order line from the cost roll-up, plus surcharges booked against the material group. Freight to customer is included; expedite freight is shown separately in the margin bridge.' }] },
      { id: 'dash-d-plan', name: 'Revenue plan 2026.xlsx', type: 'xlsx', folder: 'KPI definitions', owner: 'Michael Brown', status: 'Approved', tags: ['plan'],
        title: 'Revenue plan 2026 by region and product line', company: CO, sections: [{ rows: [['Region', 'Plan 2026']].concat(REG.map(function (r) { return [r, SDA.usd(agg({ ms: range(12, 21), r: r }).plan * 1.2)]; })) }] }
    ];
    var dms = SDA.dms($('.dash-dms'), {
      root: root, title: 'Documents', docs: DOCS, role: role,
      folders: ['Report archive', 'Excel source files', 'KPI definitions'],
      canUpload: function () { return true; },
      canApprove: function (r) { return r === 'ctrl'; },
      filter: function (d, r) { return r !== 'sales' || (!d.fin && (!d.region || d.region === 'West')); },
      userName: function () { return me(); },
      uploadFolder: 'Excel source files', uploadStatus: 'In review',
      onChange: function (docs, d, act) {
        if (act === 'approve' && d && d.kpi) { kpiApproved = true; d.status = 'Approved'; say('KPI definitions v3 approved. The dashboard now uses them.'); }
        if (!act) { newDocs++; }
        paintNav(); if (act === 'approve' && view === 'dash') renderBody();
      }
    });
    var openDoc = function (id) { if (dms.docs().some(function (d) { return d.id === id; })) dms.open(id); };

    /* ---------------- chart (hand-made SVG) ---------------- */
    function nice(max) { var e = Math.pow(10, Math.floor(Math.log(max) / Math.LN10)), f = max / e, S = [1, 1.2, 1.6, 2, 2.4, 3, 4, 6, 8, 10]; for (var i = 0; i < S.length; i++) if (f <= S[i]) return S[i] * e; return 10 * e; }
    // items: [{label, v, t, hi, flag, aria, pick}]; opts: {kind, constT, tl}
    function chart(el, items, opts) {
      var W = Math.max(260, el.clientWidth || 600), narrow = W < 480, H = narrow ? 210 : 240;
      var L = narrow ? 40 : 52, R = 8, T = 22, B = 28, pw = W - L - R, ph = H - T - B;
      var top = 0; items.forEach(function (x) { top = Math.max(top, x.v, x.t || 0); });
      if (opts.constT) top = Math.max(top, opts.constT);
      var max = opts.kind === 'pct' ? Math.min(1, Math.ceil(top * 1.1 * 5) / 5) : nice(top * 1.12 || 1), y = function (v) { return T + ph - v / max * ph; };
      var axis = function (v) { return opts.kind === 'usd' ? (v >= 1e6 ? '$' + +(v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? '$' + Math.round(v / 1e3) + 'k' : '$' + v) : opts.kind === 'pct' ? Math.round(v * 100) + '%' : v; };
      var band = pw / items.length, bw = Math.min(band * (narrow ? 0.66 : 0.58), 56);
      var s = '<svg class="dash-svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="' + esc(opts.aria) + '">';
      for (var g = 0; g <= 4; g++) { var gv = max * g / 4, gy = y(gv); s += '<line class="dash-gl" x1="' + L + '" x2="' + (W - R) + '" y1="' + gy + '" y2="' + gy + '"/><text class="dash-ax" x="' + (L - 6) + '" y="' + (gy + 4) + '" text-anchor="end">' + axis(gv) + '</text>'; }
      items.forEach(function (x, i) {
        var cx = L + band * i + band / 2, bh = Math.max(2, x.v / max * ph), by = T + ph - bh;
        s += '<g class="dash-bar' + (x.hi ? ' hi' : ' mute') + (x.flag ? ' f-' + x.flag : '') + '" role="button" tabindex="0" data-i="' + i + '" aria-label="' + esc(x.aria) + '">' +
          '<rect class="dash-hit" x="' + (L + band * i + 1) + '" y="' + T + '" width="' + (band - 2) + '" height="' + (ph + B) + '" rx="8"/>' +
          '<path class="dash-col" d="M' + (cx - bw / 2) + ' ' + (T + ph) + 'V' + (by + 5) + 'q0-5 5-5h' + (bw - 10) + 'q5 0 5 5V' + (T + ph) + 'z"/>' +
          (x.flag === 'bad' ? '<g class="dash-mark" transform="translate(' + cx + ' ' + (by - 11) + ')"><circle r="8"/><text y="4" text-anchor="middle">!</text></g>' : '') +
          (!narrow || items.length <= 4 ? '<text class="dash-vl" x="' + cx + '" y="' + (x.flag === 'bad' ? by - 23 : by - 6) + '" text-anchor="middle">' + esc(x.short || '') + '</text>' : '') +
          '<text class="dash-xl" x="' + cx + '" y="' + (H - 9) + '" text-anchor="middle">' + esc(x.label) + '</text></g>';
      });
      if (opts.constT) { var ty = y(opts.constT); s += '<line class="dash-tline" x1="' + L + '" x2="' + (W - R) + '" y1="' + ty + '" y2="' + ty + '"/>'; }
      else if (items[0] && items[0].t != null) {
        var pts = items.map(function (x, i) { return (L + band * i + band / 2) + ',' + y(x.t); }).join(' ');
        s += '<polyline class="dash-tline" points="' + pts + '"/>' + items.map(function (x, i) { return '<circle class="dash-tdot" cx="' + (L + band * i + band / 2) + '" cy="' + y(x.t) + '" r="3"/>'; }).join('');
      }
      s += '</svg><div class="dash-tip" hidden></div>';
      el.innerHTML = s;
      var tip = $('.dash-tip', el);
      var show = function (gEl) {
        var x = items[+gEl.getAttribute('data-i')]; if (!x) return;
        tip.innerHTML = x.tip; tip.hidden = false;
        var bb = gEl.querySelector('.dash-col').getBBox(), cx = bb.x + bb.width / 2;
        tip.style.left = Math.max(70, Math.min(W - 70, cx)) + 'px'; tip.style.top = Math.max(0, bb.y - 8) + 'px';
      };
      var hide = function () { tip.hidden = true; };
      $$('.dash-bar', el).forEach(function (gEl) {
        var x = items[+gEl.getAttribute('data-i')];
        gEl.addEventListener('mouseenter', function () { show(gEl); });
        gEl.addEventListener('mouseleave', hide);
        gEl.addEventListener('focus', function () { show(gEl); });
        gEl.addEventListener('blur', hide);
        gEl.addEventListener('click', function () { hide(); x.pick(); });
        gEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hide(); x.pick(); } });
      });
      el._w = W;
    }
    function spark(vals, tv) {
      var mx = Math.max.apply(null, vals.concat(tv || [])), mn = Math.min.apply(null, vals.concat(tv || []));
      if (mx === mn) { mx += 1; mn -= 1; }
      var pad = (mx - mn) * 0.15; mx += pad; mn -= pad;
      var P = function (v, i) { return (i / (vals.length - 1) * 100).toFixed(1) + ',' + (30 - (v - mn) / (mx - mn) * 30).toFixed(1); };
      var line = vals.map(P).join(' ');
      return '<svg class="dash-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polygon class="a" points="0,30 ' + line + ' 100,30"/><polyline points="' + line + '"/></svg>';
    }

    /* ---------------- anomalies ---------------- */
    function anomalies() {
      var P = per(), out = [], rs = scopeR() === 'All' ? REG : [scopeR()], ps = F.p === 'All' ? PRODS.map(function (p) { return p.id; }) : [F.p];
      rs.forEach(function (r) {
        ps.forEach(function (p) {
          var a = agg({ ms: P.ms, r: r, p: p }), otd = KPI.otd.v(a), gap = a.plan ? a.rev / a.plan - 1 : 0;
          if (a.n >= 4 && otd < 0.9) out.push({ lvl: 'bad', k: 'otd', w: 3 + (0.9 - otd) * 10, t: 'On-time delivery ' + pct(otd, 0) + ' in ' + r + ' · ' + PN[p], s: a.late + ' of ' + a.n + ' orders late · target 95%', d: { r: r, p: p } });
          if (gap < -0.1) out.push({ lvl: 'warn', k: 'rev', w: 2 - gap, t: 'Revenue ' + Math.round(-gap * 100) + '% below plan in ' + r + ' · ' + PN[p], s: SDA.usd(a.plan - a.rev) + ' gap vs plan', d: { r: r, p: p } });
          if (gap > 0.15) out.push({ lvl: 'up', k: 'rev', w: 1 + gap, t: 'Revenue ' + Math.round(gap * 100) + '% above plan in ' + r + ' · ' + PN[p], s: SDA.usd(a.rev - a.plan) + ' ahead of plan', d: { r: r, p: p } });
        });
      });
      ps.forEach(function (p) {
        var a = agg({ ms: P.ms, r: scopeR(), p: p }), b = agg({ ms: P.prev, r: scopeR(), p: p }), d = KPI.gm.v(a) - KPI.gm.v(b);
        if (d <= -0.025) out.push({ lvl: 'warn', k: 'gm', w: 2.5 - d * 10, t: 'Gross margin ' + Math.abs(d * 100).toFixed(1) + ' pp down in ' + PN[p], s: pct(KPI.gm.v(a)) + ' vs ' + pct(KPI.gm.v(b)) + ' in ' + P.prevLabel, d: { p: p } });
      });
      var all = agg({ ms: P.ms, r: scopeR(), p: F.p }), ct = KPI.cmp.t(all);
      if (all.open > ct * 1.25) out.push({ lvl: 'bad', k: 'cmp', w: 2.8, t: all.open + ' open complaints (max ' + ct + ')', s: all.openLate + ' of them linked to late deliveries', d: {} });
      var rank = { bad: 0, warn: 1, up: 2 };
      out.sort(function (a, b) { return rank[a.lvl] - rank[b.lvl] || b.w - a.w; });
      return out.slice(0, 5);
    }

    /* ---------------- dashboard view ---------------- */
    function renderDash() {
      var V = VIEW_CFG[role], sec = $('[data-view="dash"]');
      var regOpts = myRegion() ? '<option>West</option>' : ['All'].concat(REG).map(function (r) { return '<option value="' + r + '"' + (F.r === r ? ' selected' : '') + '>' + (r === 'All' ? 'All regions' : r) + '</option>'; }).join('');
      var prodOpts = ['All'].concat(PRODS.map(function (p) { return p.id; })).map(function (p) { return '<option value="' + p + '"' + (F.p === p ? ' selected' : '') + '>' + (p === 'All' ? 'All product lines' : PN[p]) + '</option>'; }).join('');
      sec.innerHTML =
        '<div class="dash-head"><div><h3>' + esc(V.title) + '</h3><p class="note">' + esc(V.sub) + ' Data as of Oct 31, 2026.</p></div>' +
        '<div class="dash-acts"><button type="button" class="btn btn-ghost btn-sm dash-ai-btn" data-act="ai">' + IC.spark + 'Ask AI</button><button type="button" class="btn btn-ink btn-sm" data-act="export">' + ICO.pdf + 'Export PDF</button></div></div>' +
        '<div class="dash-filters" role="group" aria-label="Filters">' +
        '<div class="dash-f"><span class="dash-fl" id="dash-per-l">Period</span><div class="dash-seg" role="group" aria-labelledby="dash-per-l">' + ['month', 'quarter', 'year'].map(function (k) { return '<button type="button" data-per="' + k + '" aria-pressed="' + (F.per === k) + '">' + PER[k].name + '</button>'; }).join('') + '</div></div>' +
        '<label class="dash-f"><span class="dash-fl">Region' + (myRegion() ? ' ' + ICO.lock : '') + '</span><select data-f="r"' + (myRegion() ? ' disabled aria-describedby="dash-lockr"' : '') + '>' + regOpts + '</select></label>' +
        '<label class="dash-f"><span class="dash-fl">Product line</span><select data-f="p">' + prodOpts + '</select></label>' +
        '<button type="button" class="dash-clear" data-act="clear">Clear filters</button>' +
        '</div>' +
        (myRegion() ? '<p class="dash-lock" id="dash-lockr">' + ICO.lock + 'Region is fixed to <b>West</b> for your role. Other regions are hidden.</p>' : '') +
        '<div class="dash-body"></div>';
      renderBody();
    }
    function renderBody() {
      var body = $('.dash-body'); if (!body) return;
      var V = VIEW_CFG[role], P = per(), R = scopeR();
      var cur = agg({ ms: P.ms, r: R, p: F.p }), prv = agg({ ms: P.prev, r: R, p: F.p });
      var AN = anomalies(), flagged = {}; AN.forEach(function (a) { if (a.lvl !== 'up') flagged[a.k] = flagged[a.k] || a.lvl; });
      var clr = $('.dash-clear'); if (clr) clr.hidden = F.per === 'month' && F.r === 'All' && F.p === 'All';
      var tiles = V.tiles.map(function (k) {
        var K = KPI[k], v = K.v(cur), t = K.t(cur), st = status(k, v, t), dl = delta(k, v, K.v(prv));
        var sp = P.win.map(function (m) { return K.v(agg({ ms: [m], r: R, p: F.p })); });
        var prog = K.low ? Math.min(1, t / Math.max(v, 1)) : Math.min(1, v / (t || 1));
        var stTxt = { ok: 'On target', warn: 'Watch', bad: 'Off target' }[st];
        return '<article class="dash-kpi s-' + st + (role === 'ctrl' && k === 'gm' ? ' big' : '') + '">' +
          '<div class="dash-kpi-h"><span>' + K.label + '</span>' + (flagged[k] && st !== 'ok' ? '<span class="dash-flag" title="Flagged automatically">' + ICO.alert + 'Flag</span>' : '') + '</div>' +
          '<b class="dash-kpi-v">' + fmtK(k, v) + '</b>' +
          '<div class="dash-kpi-d"><span class="dash-delta ' + (dl.good == null ? '' : dl.good ? 'good' : 'bad') + '">' + (dl.good == null ? '→' : dl.d >= 0 ? '▲' : '▼') + ' ' + dl.txt + '</span> <small>vs ' + P.prevLabel + '</small></div>' +
          '<div class="dash-kpi-g"><i><b style="width:' + Math.round(prog * 100) + '%"></b></i><div><small>' + K.tl + ' ' + (K.low ? '≤ ' : '') + fmtK(k, t) + (k === 'cmp' ? ' · at period end' : '') + '</small><span class="pill p-' + st + '">' + stTxt + '</span></div></div>' +
          spark(sp) + '</article>';
      }).join('');
      var aiStale = ai.html && ai.key !== fkey();
      var anHtml = AN.length ? '<ul class="dash-an">' + AN.map(function (a, i) {
        return '<li class="l-' + a.lvl + '"><span class="dash-an-ic" aria-hidden="true">' + (a.lvl === 'up' ? ICO.up : ICO.alert) + '</span><span class="dash-an-t"><b>' + esc(a.t) + '</b><small>' + esc(a.s) + '</small></span><button type="button" class="btn btn-ghost btn-sm" data-an="' + i + '">Drill in</button></li>';
      }).join('') + '</ul>' : '<p class="dash-empty">' + IC.check + 'No anomalies in this selection. Everything is within target.</p>';
      var extra = '';
      if (role === 'sales') {
        var cs = CUSTS.filter(function (c) { return c.r === 'West'; }).map(function (c) { var a = agg({ ms: P.ms, c: c.n, p: F.p }); return { c: c, a: a }; }).sort(function (x, y) { return y.a.rev - x.a.rev; });
        extra = '<section class="dash-card"><div class="dash-card-h"><div><h4>Your customers · West</h4><p class="note">' + P.label + ' · click a customer for orders</p></div></div><ul class="dash-cust">' + cs.map(function (x) {
          var otd = KPI.otd.v(x.a);
          return '<li><button type="button" data-cust="' + esc(x.c.n) + '"><span class="dash-av" aria-hidden="true">' + esc(x.c.n.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2)) + '</span><span class="dash-cust-n"><b>' + esc(x.c.n) + '</b><small>' + x.a.n + ' orders</small></span><span class="dash-cust-v">' + SDA.usd(x.a.rev) + '</span><span class="pill ' + (otd < 0.9 ? 'p-bad' : otd < 0.95 ? 'p-warn' : 'p-ok') + '">' + pct(otd, 0) + ' on time</span></button></li>';
        }).join('') + '</ul></section>';
      }
      if (role === 'ctrl') {
        var ps = PRODS.filter(function (p) { return F.p === 'All' || p.id === F.p; });
        extra = '<section class="dash-card"><div class="dash-card-h"><div><h4>Margin matrix</h4><p class="note">Gross margin by region and product line · ' + P.label + ' · target 37%</p></div></div><div class="dash-tbl"><table class="dash-mx"><thead><tr><th scope="col">Region</th>' + ps.map(function (p) { return '<th scope="col">' + esc(p.name) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          REG.filter(function (r) { return F.r === 'All' || r === F.r; }).map(function (r) {
            return '<tr><th scope="row">' + r + '</th>' + ps.map(function (p) { var a = agg({ ms: P.ms, r: r, p: p.id }), g = KPI.gm.v(a), st = status('gm', g, p.gm); var d = g - p.gm;
              return '<td><button type="button" class="mx-' + (d >= -0.005 ? 'ok' : d >= -0.025 ? 'warn' : 'bad') + '" data-mx="' + r + '|' + p.id + '" aria-label="' + r + ', ' + esc(p.name) + ': gross margin ' + pct(g) + ', standard ' + pct(p.gm) + '. Open drilldown"><b>' + pct(g) + '</b><small>' + (Math.abs(d) < 5e-4 ? '±' : sgn(d)) + Math.abs(d * 100).toFixed(1) + ' pp vs std</small></button></td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table></div><p class="note dash-mx-n">Compared with the standard margin of each product line (pumps 32.5%, valves 39%, parts 47%).</p></section>' +
          '<section class="dash-card dash-kdef"><div><h4>KPI definitions v3</h4><p class="note">' + (kpiApproved ? 'Approved by you. The dashboard uses version 3.' : 'Waiting for your approval. Change: open complaints are now counted per order.') + '</p></div>' +
          '<span class="pill ' + (kpiApproved ? 'p-ok' : 'p-warn') + '">' + (kpiApproved ? 'Approved' : 'In review') + '</span><button type="button" class="btn btn-ghost btn-sm" data-act="kpidoc">' + (kpiApproved ? 'Open' : 'Review and approve') + '</button></section>';
      }
      body.innerHTML =
        '<p class="dash-scope">' + ICO.filter + '<span>Showing <b>' + P.label + '</b> · ' + esc(scopeText()) + ' · compared with ' + P.prevLabel + '</span></p>' +
        '<div class="dash-kpis">' + tiles + '</div>' +
        '<div class="dash-grid">' +
        '<section class="dash-card"><div class="dash-card-h"><div><h4>' + esc(V.c1.t) + '</h4><p class="note">' + (R === 'All' ? '' : R + ' · ') + (F.p === 'All' ? '' : PN[F.p] + ' · ') + 'Click a month to drill in</p></div><span class="dash-leg"><i class="b"></i>Actual<i class="t"></i>' + (V.c1.k === 'rev' ? 'Plan' : 'Target ' + pct(TGT.gm, 0)) + '</span></div><div class="dash-chart" data-chart="1"></div></section>' +
        '<section class="dash-card"><div class="dash-card-h"><div><h4>' + esc(V.c2.t) + '</h4><p class="note">' + P.label + ' · click a bar for customers and orders</p></div><span class="dash-leg"><i class="b"></i>Actual<i class="x"></i>Flagged<i class="t"></i>Target ' + pct(KPI[V.c2.k].t(), 0) + '</span></div><div class="dash-chart" data-chart="2"></div></section>' +
        '</div><div class="dash-grid b">' +
        '<section class="dash-card"><div class="dash-card-h"><div><h4>Flagged automatically</h4><p class="note">Anomalies in this selection, checked against targets and the previous period</p></div><span class="dash-cnt">' + AN.length + '</span></div>' + anHtml + '</section>' +
        '<section class="dash-card dash-ai"><div class="dash-card-h"><div><h4>' + IC.spark + 'AI summary</h4><p class="note">AI (simulated) · explains what changed in this selection</p></div>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="ai"' + (ai.busy ? ' disabled' : '') + '>' + (ai.html ? 'Ask again' : 'Ask AI') + '</button></div>' +
        '<div class="dash-ai-out" aria-live="polite">' + (ai.html ? (aiStale ? '<p class="dash-stale">Filters changed since this summary. Ask again for the new selection.</p>' : '') + '<div class="dash-ai-txt">' + ai.html + '</div>' : '<p class="dash-ai-ph">Ask AI to explain the biggest changes vs ' + P.prevLabel + ' and vs plan, which customers are behind them, and what to do next.</p>') + '</div>' +
        '<p class="dash-ai-foot">Simulated: built from the numbers on screen. No data leaves your browser.</p></section>' +
        '</div>' + extra;
      body._an = AN;
      drawCharts();
    }
    function drawCharts() {
      var V = VIEW_CFG[role], P = per(), R = scopeR();
      var c1 = $('[data-chart="1"]'), c2 = $('[data-chart="2"]'); if (!c1 || !c2) return;
      var k1 = V.c1.k, K1 = KPI[k1];
      chart(c1, P.win.map(function (m) {
        var a = agg({ ms: [m], r: R, p: F.p }), v = K1.v(a), t = K1.t(a), st = status(k1, v, t);
        return { label: MN[m % 12], v: v, t: t, hi: P.ms.indexOf(m) > -1, flag: k1 === 'rev' ? (v < t * 0.97 ? 'warn' : null) : st === 'bad' ? 'bad' : null, short: P.ms.indexOf(m) > -1 && P.win.length <= 6 ? fmtK(k1, v) : '',
          tip: '<b>' + mLab(m) + '</b>' + K1.label + ': ' + fmtK(k1, v) + '<br>' + K1.tl + ': ' + fmtK(k1, t) + '<small>Click to drill in</small>',
          aria: mLab(m) + ': ' + K1.label + ' ' + fmtK(k1, v) + ', ' + K1.tl.toLowerCase() + ' ' + fmtK(k1, t) + (st === 'bad' ? ', below target' : '') + '. Open drilldown',
          pick: function () { drill({ ms: [m], r: R, p: F.p, label: mLab(m) }); } };
      }), { kind: K1.kind, constT: K1.kind === 'pct' ? K1.t() : 0, tl: 'Target ' + pct(K1.kind === 'pct' ? K1.t() : 0, 0), aria: V.c1.t + ', ' + P.win.length + ' months' });
      var k2 = V.c2.k, K2 = KPI[k2], dim = V.c2.dim, keys = dim === 'region' ? REG : PRODS.map(function (p) { return p.id; });
      chart(c2, keys.map(function (key) {
        var f = { ms: P.ms, r: dim === 'region' ? key : R, p: dim === 'product' ? key : F.p }, a = agg(f), v = K2.v(a), t = K2.t(a);
        var nm = dim === 'region' ? key : PN[key], sel = dim === 'region' ? F.r : F.p, low = a.n > 0 && (k2 === 'otd' ? v < t - 0.02 : v < t - 0.02);
        var lab = dim === 'region' ? key : ({ pumps: 'Pumps', valves: 'Valves', parts: 'Parts & service' })[key];
        return { label: lab, v: v, hi: sel === 'All' || sel === key, flag: low ? 'bad' : null, short: fmtK(k2, v),
          tip: '<b>' + esc(nm) + '</b>' + K2.label + ': ' + fmtK(k2, v) + '<br>' + a.n + ' orders' + (k2 === 'otd' ? ', ' + a.late + ' late' : '') + '<small>Click for customers and orders</small>',
          aria: nm + ': ' + K2.label + ' ' + fmtK(k2, v) + (low ? ', flagged below target' : '') + '. Open drilldown',
          pick: function () { drill({ ms: P.ms, r: f.r, p: f.p, label: nm + ' · ' + P.label, flag: low }); } };
      }), { kind: 'pct', constT: K2.t(), tl: 'Target ' + pct(K2.t(), 0), aria: V.c2.t });
    }

    /* ---------------- drilldown (modal) ---------------- */
    function drill(f) {
      guide.done('drill');
      var a = agg(f), fin = role !== 'sales';
      var os = ORDERS.filter(function (o) { return f.ms.indexOf(o.m) > -1 && (f.r === 'All' || o.r === f.r) && (f.p === 'All' || o.p === f.p) && (!f.c || o.c === f.c); });
      var byC = {}; os.forEach(function (o) { var x = byC[o.c] = byC[o.c] || { n: o.c, rev: 0, cost: 0, cnt: 0, late: 0, open: 0 }; x.rev += o.v; x.cost += o.cost; x.cnt++; if (o.late) x.late++; if (isOpen(o, mEnd(Math.max.apply(null, f.ms)))) x.open++; });
      var cs = Object.keys(byC).map(function (k) { return byC[k]; }).sort(function (x, y) { return y.late - x.late || y.rev - x.rev; });
      var st = { c: f.c || '', late: false };
      var scope = (f.r === 'All' ? 'All regions' : f.r) + ' · ' + (f.p === 'All' ? 'All product lines' : PN[f.p]);
      var srcDocs = ['dash-d-erp', f.r === 'West' ? 'dash-d-dlw' : f.r === 'South' ? 'dash-d-dls' : null, 'dash-d-cmp', fin ? 'dash-d-cost' : null].filter(Boolean)
        .map(function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; }).filter(Boolean);
      var otd = KPI.otd.v(a), gap = a.plan ? a.rev / a.plan - 1 : 0;
      var why = [];
      if (otd < 0.9) why.push('On-time delivery is ' + pct(otd, 0) + ' (target 95%).');
      cs.filter(function (c) { return CUST[c.n].story && c.late >= 3; }).slice(0, 1).forEach(function (c) { why.push(c.n + ' ' + CUST[c.n].story + ': ' + c.late + ' late orders.'); });
      var stat = function (l, v, cls) { return '<div class="dd-stat' + (cls ? ' ' + cls : '') + '"><small>' + l + '</small><b>' + v + '</b></div>'; };
      var m = SDA.modal(root, { title: 'Drilldown · ' + f.label, wide: true, html:
        '<div class="dash-dd"><p class="note">' + esc(scope) + ' · ' + a.n + ' orders from ' + cs.length + ' customers</p>' +
        '<div class="dd-stats">' + stat('Revenue', SDA.usd(a.rev)) + (a.plan ? stat('vs plan', sgn(gap) + Math.abs(gap * 100).toFixed(1) + '%', gap < -0.05 ? 'bad' : gap >= 0 ? 'ok' : '') : '') +
        stat('On-time', pct(otd), otd < 0.9 ? 'bad' : otd >= 0.95 ? 'ok' : '') + (fin ? stat('Gross margin', pct(KPI.gm.v(a)), KPI.gm.v(a) < TGT.gm - 0.012 ? 'bad' : '') : stat('Orders', a.n)) + stat('Open complaints', a.open, a.open > 2 ? 'bad' : '') + '</div>' +
        (why.length ? '<div class="dd-why">' + ICO.alert + '<span><b>Why this is flagged:</b> ' + esc(why.join(' ')) + '</span></div>' : '') +
        '<h5>Customers</h5><div class="dash-tbl"><table class="dd-t"><thead><tr><th scope="col">Customer</th><th scope="col" class="n">Revenue</th><th scope="col" class="n">Orders</th><th scope="col" class="n">On-time</th>' + (fin ? '<th scope="col" class="n hide-s">Margin</th>' : '') + '<th scope="col" class="n hide-s">Complaints</th></tr></thead><tbody>' +
        cs.map(function (c) { var o = 1 - c.late / c.cnt; return '<tr><td><button type="button" class="dd-c" data-c="' + esc(c.n) + '" aria-pressed="false">' + esc(c.n) + '</button></td><td class="n">' + SDA.usd(c.rev) + '</td><td class="n">' + c.cnt + '</td><td class="n"><span class="pill ' + (o < 0.9 ? 'p-bad' : o < 0.95 ? 'p-warn' : 'p-ok') + '">' + pct(o, 0) + '</span></td>' + (fin ? '<td class="n hide-s">' + pct((c.rev - c.cost) / c.rev) + '</td>' : '') + '<td class="n hide-s">' + c.open + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        '<div class="dd-oh"><h5>Orders</h5><div class="dd-of"><span class="dd-cf"></span><button type="button" class="dash-chip" data-late aria-pressed="false">Late only</button></div></div>' +
        '<div class="dash-tbl"><table class="dd-t dd-o"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="hide-s">Product line</th><th scope="col" class="n">Value</th><th scope="col" class="hide-s">Promised</th><th scope="col">Shipped</th></tr></thead><tbody></tbody></table></div><p class="note dd-more"></p>' +
        '<h5>Source files</h5><div class="dd-docs">' + srcDocs.map(function (d) { return '<button type="button" class="dd-doc" data-doc="' + d.id + '">' + (d.type === 'xlsx' ? IC.sheet : IC.doc) + '<span>' + esc(d.name) + '</span></button>'; }).join('') + '</div></div>' });
      function orders() {
        var L = os.filter(function (o) { return (!st.c || o.c === st.c) && (!st.late || o.late); }).sort(function (x, y) { return (y.late - x.late) || y.v - x.v; });
        $('.dd-o tbody', m.body).innerHTML = L.slice(0, 12).map(function (o) {
          return '<tr class="' + (o.late ? 'late' : '') + '"><td class="mono">' + o.id + '</td><td>' + esc(o.c) + '</td><td class="hide-s">' + esc(PN[o.p]) + '</td><td class="n">' + SDA.money(o.v) + '</td><td class="hide-s">' + SDA.fmtDate(o.prom) + '</td><td>' + (o.late ? '<span class="pill p-bad">' + Math.round((o.ship - o.prom) / 864e5) + ' days late</span>' : '<span class="pill p-ok">On time</span>') + '</td></tr>';
        }).join('') || '<tr><td colspan="6" class="dd-none">No orders match.</td></tr>';
        $('.dd-more', m.body).textContent = L.length > 12 ? 'Showing 12 of ' + L.length + ' orders, late and largest first.' : L.length + ' order' + (L.length === 1 ? '' : 's') + '.';
        $('.dd-cf', m.body).innerHTML = st.c ? '<button type="button" class="dash-chip on" data-cclear>' + esc(st.c) + ' ' + IC.close + '<span class="sr">Clear customer filter</span></button>' : '';
        $$('.dd-c', m.body).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-c') === st.c); });
        $('[data-late]', m.body).setAttribute('aria-pressed', st.late);
      }
      m.body.addEventListener('click', function (e) {
        var t;
        if ((t = e.target.closest('.dd-c'))) { st.c = st.c === t.getAttribute('data-c') ? '' : t.getAttribute('data-c'); orders(); say(st.c ? 'Orders filtered to ' + st.c : 'Customer filter cleared'); }
        else if (e.target.closest('[data-cclear]')) { st.c = ''; orders(); $('[data-late]', m.body).focus(); }
        else if (e.target.closest('[data-late]')) { st.late = !st.late; orders(); }
        else if ((t = e.target.closest('[data-doc]'))) openDoc(t.getAttribute('data-doc'));
      });
      orders();
    }

    /* ---------------- AI summary (simulated) ---------------- */
    function aiSummary() {
      var P = per(), R = scopeR(), cur = agg({ ms: P.ms, r: R, p: F.p }), prv = agg({ ms: P.prev, r: R, p: F.p });
      var rs = R === 'All' ? REG : [R], ps = F.p === 'All' ? PRODS.map(function (p) { return p.id; }) : [F.p], cells = [];
      rs.forEach(function (r) { ps.forEach(function (p) { var a = agg({ ms: P.ms, r: r, p: p }); cells.push({ r: r, p: p, a: a, gap: a.rev - a.plan }); }); });
      cells.sort(function (x, y) { return x.gap - y.gap; });
      var worst = cells[0], best = cells[cells.length - 1];
      var custIn = function (c) { var byC = {}; ORDERS.forEach(function (o) { if (P.ms.indexOf(o.m) < 0 || o.r !== c.r || o.p !== c.p) return; var x = byC[o.c] = byC[o.c] || { n: o.c, late: 0, rev: 0 }; x.rev += o.v; if (o.late) x.late++; }); return Object.keys(byC).map(function (k) { return byC[k]; }); };
      var dRev = (cur.rev - prv.rev) / prv.rev, gPlan = cur.rev / cur.plan - 1;
      var h = '<p><b>Revenue ' + SDA.usd(cur.rev) + '</b> in ' + P.label + ': ' + sgn(dRev) + Math.abs(dRev * 100).toFixed(1) + '% vs ' + P.prevLabel + ' and ' + sgn(gPlan) + Math.abs(gPlan * 100).toFixed(1) + '% vs plan.</p><ul>';
      if (worst && worst.gap < -worst.a.plan * 0.03) {
        var wc = custIn(worst).sort(function (x, y) { return y.late - x.late; })[0], wotd = KPI.otd.v(worst.a);
        h += '<li><b>Biggest gap:</b> ' + worst.r + ' · ' + PN[worst.p] + ', ' + SDA.usd(-worst.gap) + ' below plan.' + (wotd < 0.92 ? ' On-time delivery there is ' + pct(wotd, 0) + '.' : '') +
          (wc && wc.late >= 3 ? ' ' + wc.n + (CUST[wc.n].story ? ' ' + CUST[wc.n].story : ' has late orders') + ' (' + wc.late + ' late orders).' : '') + '</li>';
      }
      if (best && best.gap > best.a.plan * 0.03) {
        var bc = custIn(best).sort(function (x, y) { return y.rev - x.rev; })[0];
        h += '<li><b>Biggest lift:</b> ' + best.r + ' · ' + PN[best.p] + ', ' + SDA.usd(best.gap) + ' above plan' + (bc && CUST[bc.n].story ? ': ' + bc.n + ' ' + CUST[bc.n].story : '') + '.</li>';
      }
      var gm = KPI.gm.v(cur), gmp = KPI.gm.v(prv), drops = ps.map(function (p) { var a = agg({ ms: P.ms, r: R, p: p }), b = agg({ ms: P.prev, r: R, p: p }); return { p: p, d: KPI.gm.v(a) - KPI.gm.v(b), g: KPI.gm.v(a) }; }).sort(function (x, y) { return x.d - y.d; });
      h += '<li><b>Gross margin ' + pct(gm) + '</b> (' + sgn(gm - gmp) + Math.abs((gm - gmp) * 100).toFixed(1) + ' pp vs ' + P.prevLabel + ', target 37%).' +
        (drops[0].d < -0.015 ? ' Mainly ' + PN[drops[0].p] + ' at ' + pct(drops[0].g) + (drops[0].p === 'pumps' ? ', after the steel surcharge on pump housings from August.' : '.') : ' No product line moved by more than 1.5 pp.') + '</li>';
      var otd = KPI.otd.v(cur), ct = KPI.cmp.t(cur);
      h += '<li><b>On-time delivery ' + pct(otd) + '</b>, ' + cur.late + ' late orders. <b>Open complaints ' + cur.open + '</b> (max ' + ct + ')' + (cur.open > ct ? ', most of them on late orders.' : '.') + '</li></ul>';
      var next = role === 'ctrl' ? 'Review pump pricing: passing on half of the steel surcharge would add about ' + SDA.usd(agg({ ms: P.ms, r: R, p: 'pumps' }).rev * 0.022) + ' gross profit in this period.'
        : role === 'sales' ? (worst && worst.r === 'West' && worst.p === 'valves' ? 'Call Redwood Bottling Co. with new ship dates and offer partial deliveries from stock.' : 'Follow up on the largest open orders with the customers below plan.')
        : (worst && worst.gap < 0 ? 'Ask ' + (worst.r === 'West' ? 'Lisa Miller' : 'the ' + worst.r + ' sales manager') + ' for a recovery plan for ' + worst.r + ' · ' + PN[worst.p] + ' and ask Finance to review pump pricing.' : 'No action needed: the selection is on plan.');
      h += '<p class="dash-ai-next"><b>Suggested next step:</b> ' + esc(next) + '</p>';
      return h;
    }
    function runAI() {
      if (ai.busy) return;
      if (view !== 'dash') setView('dash');
      ai.busy = true; ai.key = fkey(); ai.html = '';
      renderBody();
      var out = $('.dash-ai-out'), card = $('.dash-ai');
      if (card && card.scrollIntoView) { var r = card.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight) card.scrollIntoView({ block: 'nearest', behavior: SDA.reduce ? 'auto' : 'smooth' }); }
      out.innerHTML = '<p class="dash-thinking"><i></i><i></i><i></i>AI (simulated) is reading ' + esc(per().label) + ' · ' + esc(scopeText()) + '…</p>';
      var html = aiSummary();
      ctx.later(SDA.reduce ? 50 : 900, function () {
        var o = $('.dash-ai-out'); if (!o) { ai.busy = false; return; }
        o.innerHTML = '<div class="dash-ai-txt"></div>';
        SDA.typeInto($('.dash-ai-txt', o), html, function () {
          ai.html = html; ai.busy = false;
          var b = $('.dash-ai [data-act="ai"]'); if (b) { b.disabled = false; b.textContent = 'Ask again'; }
          guide.done('ai'); say('AI summary ready (simulated)');
        });
      });
    }

    /* ---------------- report export (PDF to DMS) ---------------- */
    function reportDoc(opts) {
      opts = opts || {};
      var P = per(), R = scopeR(), cur = agg({ ms: P.ms, r: R, p: F.p }), V = VIEW_CFG[role];
      var keys = ['rev', 'gm', 'otd', 'cmp'].concat(role === 'sales' ? ['ord'] : ['gp']);
      if (role === 'sales') keys = keys.filter(function (k) { return k !== 'gm'; });
      var rows = [['KPI', 'Actual', 'Target', 'Status']].concat(keys.map(function (k) { var K = KPI[k], v = K.v(cur), t = K.t(cur); return [K.label, fmtK(k, v), (K.low ? '≤ ' : '') + fmtK(k, t), { ok: 'On target', warn: 'Watch', bad: 'Off target' }[status(k, v, t)]]; }));
      var AN = anomalies();
      var top = CUSTS.filter(function (c) { return R === 'All' || c.r === R; }).map(function (c) { return { c: c, a: agg({ ms: P.ms, c: c.n, p: F.p }) }; }).sort(function (x, y) { return y.a.rev - x.a.rev; }).slice(0, 5);
      var aiTxt = ai.html && ai.key === fkey() ? ai.html.replace(/<li>/g, ' • ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
      var scopeShort = (R === 'All' ? 'All regions' : R) + (F.p === 'All' ? '' : ' – ' + PN[F.p]);
      exportsN++;
      return {
        name: (opts.prefix || 'Management report') + ' – ' + P.label + ' – ' + scopeShort + (exportsN > 1 ? ' (' + exportsN + ')' : '') + '.pdf', type: 'pdf', folder: 'Report archive',
        linked: 'Dashboard · ' + P.label, owner: me(), status: 'Final', region: R === 'All' ? undefined : R, tags: ['export', F.per], note: opts.note || 'Exported from the dashboard',
        title: (opts.prefix || 'Management report') + ' – ' + P.label, company: CO,
        meta: [['Period', P.label + ' (vs ' + P.prevLabel + ')'], ['Scope', scopeText()], ['View', V.title], ['Prepared by', me()], ['Created', SDA.fmtDate(SDA.today()) + ', ' + SDA.fmtTime(new Date())]],
        sections: [{ h: 'KPIs against target', rows: rows },
          { h: 'Flagged anomalies', lines: AN.length ? AN.map(function (a) { return a.t + ' (' + a.s + ')'; }) : ['None in this selection'] },
          { h: 'AI summary (simulated)', p: aiTxt || 'Not generated for this selection. Press “Ask AI” on the dashboard before exporting to include it.' },
          { h: 'Top customers', rows: [['Customer', 'Revenue', 'Orders', 'On-time']].concat(top.map(function (x) { return [x.c.n, SDA.money(x.a.rev), String(x.a.n), pct(KPI.otd.v(x.a))]; })) },
          { p: 'Generated by Insight Board from sample data. KPI definitions v3' + (kpiApproved ? ' (approved).' : ' (in review).') }]
      };
    }
    function exportPdf(btn) {
      if (btn) { btn.disabled = true; btn.innerHTML = ICO.pdf + 'Creating PDF…'; }
      ctx.later(SDA.reduce ? 30 : 650, function () {
        var d = dms.add(reportDoc());
        newDocs++; paintNav();
        if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = ICO.pdf + 'Export PDF'; }
        guide.done('export');
        say('PDF saved to Documents › Report archive');
        dms.open(d.id);
      });
    }

    /* ---------------- scheduled reports ---------------- */
    var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    var MDAYS = ['1st business day', '15th of the month', 'Last business day'];
    var nS = 0;
    var SCH = [
      { name: 'Weekly management summary', freq: 'weekly', day: 'Monday', rcp: ['sarah.johnson@northfield.example', 'leadership@northfield.example'], r: 'All', p: 'All', per: 'month', owner: 'Sarah Johnson', on: true, ai: true, last: -4 },
      { name: 'West region weekly', freq: 'weekly', day: 'Monday', rcp: ['lisa.miller@northfield.example', 'west-sales@northfield.example'], r: 'West', p: 'All', per: 'month', owner: 'Lisa Miller', on: true, ai: true, last: -4 },
      { name: 'Monthly KPI pack for the board', freq: 'monthly', day: '1st business day', rcp: ['board@northfield.example', 'sarah.johnson@northfield.example'], r: 'All', p: 'All', per: 'month', owner: 'Sarah Johnson', on: true, ai: false, last: -6 },
      { name: 'Monthly margin report', freq: 'monthly', day: 'Last business day', rcp: ['michael.brown@northfield.example', 'finance@northfield.example'], r: 'All', p: 'pumps', per: 'quarter', owner: 'Sarah Johnson', on: false, ai: true, last: -38 }
    ].map(function (s) { s.id = 'dash-s' + (++nS); return s; });
    function nextRun(s) {
      var d = SDA.today(1); d.setHours(7, 0, 0, 0);
      if (s.freq === 'weekly') { var w = DAYS.indexOf(s.day) + 1; while (d.getDay() !== w) d.setDate(d.getDate() + 1); return d; }
      var bd = function (x) { while (x.getDay() === 0 || x.getDay() === 6) x.setDate(x.getDate() + (s.day === 'Last business day' ? -1 : 1)); return x; };
      for (var i = 0; i < 3; i++) {
        var y = d.getFullYear(), mo = d.getMonth() + i;
        var c = s.day === '15th of the month' ? new Date(y, mo, 15, 7) : s.day === 'Last business day' ? new Date(y, mo + 1, 0, 7) : new Date(y, mo, 1, 7);
        c = bd(c); if (c >= d) return c;
      }
      return d;
    }
    var canCreate = function () { return role !== 'ctrl'; };
    var canManage = function (s) { return role === 'md' || (role === 'sales' && s.owner === me()); };
    var visSch = function (s) { return role !== 'sales' || s.r === 'West' || s.owner === me(); };
    function renderSch() {
      var sec = $('[data-view="sch"]'), L = SCH.filter(visSch);
      var sub = role === 'md' ? 'All schedules in the company. You can create, pause and delete any of them.' : role === 'sales' ? 'Schedules for the West region. You can create new ones and manage your own.' : 'Read only for your role. Schedules are set up by management and sales.';
      sec.innerHTML = '<div class="dash-head"><div><h3>Scheduled reports</h3><p class="note">' + sub + ' E-mails are simulated, not sent.</p></div>' +
        (canCreate() ? '<button type="button" class="btn btn-ink btn-sm" data-act="new">' + ICO.plus + 'New schedule</button>' : '<span class="dash-ro">' + ICO.lock + 'Read only</span>') + '</div>' +
        (L.length ? '<ul class="dash-sch">' + L.map(function (s) {
          var man = canManage(s), nx = nextRun(s);
          return '<li class="' + (s.on ? '' : 'off') + '" data-s="' + s.id + '"><div class="dash-sch-m"><div class="dash-sch-t"><b>' + esc(s.name) + '</b><span class="pill ' + (s.on ? 'p-ok' : 'p-warn') + '">' + (s.on ? 'Active' : 'Paused') + '</span></div>' +
            '<div class="dash-sch-meta"><span>' + ICO.clock + (s.freq === 'weekly' ? 'Weekly · every ' + s.day : 'Monthly · ' + s.day) + ', 7:00 AM</span>' +
            '<span>' + ICO.filter + (s.r === 'All' ? 'All regions' : s.r) + ' · ' + (s.p === 'All' ? 'All product lines' : PN[s.p]) + ' · ' + PER[s.per].name.toLowerCase() + ' view' + (s.ai ? ' · with AI summary' : '') + '</span>' +
            '<span>' + ICO.mail + esc(s.rcp.join(', ')) + '</span>' +
            '<span>' + ICO.user + 'Owner ' + esc(s.owner) + ' · ' + (s.on ? 'next run ' + SDA.fmtDate(nx) : 'paused, no runs') + (s.last != null ? ' · last sent ' + SDA.fmtDate(SDA.today(s.last)) : '') + '</span></div></div>' +
            '<div class="dash-sch-a">' + (man || role === 'md' ? '<button type="button" class="btn btn-ghost btn-sm" data-sa="run"' + (s.on ? '' : ' disabled') + '>' + ICO.send + 'Send now</button>' : '') +
            (man ? '<button type="button" class="btn btn-ghost btn-sm" data-sa="toggle">' + (s.on ? ICO.pause + 'Pause' : ICO.play + 'Resume') + '</button><button type="button" class="btn btn-ghost btn-sm dash-del" data-sa="del" aria-label="Delete ' + esc(s.name) + '">' + ICO.trash + '<span>Delete</span></button>' : '<span class="dash-ro">' + ICO.lock + (role === 'ctrl' ? 'View only' : 'Owned by ' + esc(s.owner)) + '</span>') + '</div></li>';
        }).join('') + '</ul>' : '<p class="dash-empty">No scheduled reports yet.</p>');
    }
    function schForm() {
      var R = scopeR();
      var m = SDA.modal(root, { title: 'New scheduled report', html:
        '<form class="dash-form" novalidate>' +
        '<label>Report name<input name="rname" required value="' + esc((R === 'All' ? 'Company' : R) + ' ' + (F.p === 'All' ? 'KPI' : PN[F.p].toLowerCase()) + ' report') + '"></label>' +
        '<div class="dash-form-2"><label>Frequency<select name="freq"><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>' +
        '<label>Send on<select name="day">' + DAYS.map(function (d) { return '<option>' + d + '</option>'; }).join('') + '</select></label></div>' +
        '<label>Recipients <small>comma-separated e-mail addresses</small><input name="rcp" type="text" inputmode="email" autocomplete="off" value="' + esc(me().toLowerCase().replace(' ', '.') + '@northfield.example') + '" aria-describedby="dash-rcp-err"></label>' +
        '<p class="note err" id="dash-rcp-err" hidden></p>' +
        '<label class="tog"><input type="checkbox" name="ai" checked> Include AI summary (simulated)</label>' +
        '<div class="dash-form-scope">' + ICO.filter + '<span>Uses the current dashboard filters: <b>' + esc(scopeText()) + '</b>, ' + PER[F.per].name.toLowerCase() + ' view. The period rolls forward with every run.' + (role === 'sales' ? ' Region is fixed to West for your role.' : '') + '</span></div>' +
        '<div class="btn-row"><button type="submit" class="btn btn-ink btn-sm">' + ICO.plus + 'Create schedule</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></form>' });
      var fm = $('form', m.body);
      fm.freq.addEventListener('change', function () { fm.day.innerHTML = (fm.freq.value === 'weekly' ? DAYS : MDAYS).map(function (d) { return '<option>' + d + '</option>'; }).join(''); });
      fm.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = $('#dash-rcp-err', m.body), name = fm.rname.value.trim();
        var rcp = fm.rcp.value.split(/[,;\s]+/).map(function (x) { return x.trim(); }).filter(Boolean);
        var bad = rcp.filter(function (x) { return !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(x); });
        fm.rname.setAttribute('aria-invalid', !name); fm.rcp.setAttribute('aria-invalid', !rcp.length || bad.length > 0);
        if (!name) { fm.rname.focus(); return; }
        if (!rcp.length || bad.length) { err.hidden = false; err.textContent = !rcp.length ? 'Add at least one recipient.' : 'Check this address: ' + bad[0]; fm.rcp.focus(); return; }
        var s = { id: 'dash-s' + (++nS), name: name, freq: fm.freq.value, day: fm.day.value, rcp: rcp, r: scopeR(), p: F.p, per: F.per, owner: me(), on: true, ai: fm.ai.checked, last: null, fresh: true };
        SCH.unshift(s); m.close(); renderSch(); paintNav();
        say('Schedule created. First run ' + SDA.fmtDate(nextRun(s)) + ' (e-mails simulated, not sent)');
        var li = $('[data-s="' + s.id + '"]'); if (li) { li.classList.add('new'); var b = $('button', li); if (b) b.focus(); }
      });
    }
    function schAction(s, act, btn) {
      if (act === 'toggle') { s.on = !s.on; renderSch(); paintNav(); say(s.on ? 'Resumed: ' + s.name : 'Paused: ' + s.name + '. No e-mails until you resume it.'); var b = $('[data-s="' + s.id + '"] [data-sa="toggle"]'); if (b) b.focus(); }
      if (act === 'run') {
        var d = dms.add(reportDoc({ prefix: s.name, note: 'Sent to ' + s.rcp.length + ' recipients (simulated)' }));
        s.last = 0; renderSch(); newDocs++; paintNav();
        say('Sent to ' + s.rcp.length + ' recipient' + (s.rcp.length > 1 ? 's' : '') + ' (simulated, not sent). A copy is in the report archive.');
      }
      if (act === 'del') {
        var m = SDA.modal(root, { title: 'Delete schedule?', html: '<p>“' + esc(s.name) + '” will stop sending. Reports already in the archive are kept.</p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm dash-danger" data-yes>' + ICO.trash + 'Delete schedule</button><button type="button" class="btn btn-ghost btn-sm" data-close>Keep it</button></div>' });
        $('[data-yes]', m.body).addEventListener('click', function () { SCH = SCH.filter(function (x) { return x !== s; }); m.close(); renderSch(); paintNav(); say('Deleted: ' + s.name); var f = $('[data-view="sch"] button'); if (f) f.focus(); });
      }
    }

    /* ---------------- nav + views ---------------- */
    function paintNav() {
      $$('.app-nav [data-v]').forEach(function (b) {
        var on = b.getAttribute('data-v') === view, c = $('.cnt', b), n = 0;
        b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
        if (b.getAttribute('data-v') === 'sch') n = SCH.filter(function (s) { return s.on && visSch(s); }).length;
        if (b.getAttribute('data-v') === 'docs') n = role === 'ctrl' ? dms.docs().filter(function (d) { return /review/i.test(d.status); }).length : newDocs;
        if (c) { c.hidden = !n; c.textContent = n; }
      });
      $$('.dash-view').forEach(function (s) { s.hidden = s.getAttribute('data-view') !== view; });
    }
    function setView(v) { view = v; paintNav(); if (v === 'dash') renderDash(); if (v === 'sch') renderSch(); if (v === 'docs') dms.render(); }
    function render() { paintNav(); if (view === 'dash') renderDash(); else if (view === 'sch') renderSch(); else dms.render(); }

    /* ---------------- events ---------------- */
    root.addEventListener('click', function (e) {
      if (e.target.closest('.sda-modal')) return;
      var t;
      if ((t = e.target.closest('.app-nav [data-v]'))) { setView(t.getAttribute('data-v')); return; }
      if ((t = e.target.closest('[data-per]'))) { F.per = t.getAttribute('data-per'); $$('[data-per]').forEach(function (b) { b.setAttribute('aria-pressed', b === t); }); guide.done('filter'); renderBody(); say('Period: ' + per().label); return; }
      if ((t = e.target.closest('[data-act]'))) {
        var a = t.getAttribute('data-act');
        if (a === 'ai') runAI();
        if (a === 'export') exportPdf(t);
        if (a === 'clear') { F.per = 'month'; F.r = 'All'; F.p = 'All'; renderDash(); say('Filters cleared'); var s0 = $('[data-per="month"]'); if (s0) s0.focus(); }
        if (a === 'kpidoc') openDoc('dash-d-kpi');
        if (a === 'new') schForm();
        return;
      }
      if ((t = e.target.closest('[data-an]'))) { var an = ($('.dash-body')._an || [])[+t.getAttribute('data-an')]; if (an) { var P = per(); drill({ ms: P.ms, r: an.d.r || scopeR(), p: an.d.p || F.p, label: (an.d.r ? an.d.r + ' · ' : '') + (an.d.p ? PN[an.d.p] + ' · ' : '') + P.label }); } return; }
      if ((t = e.target.closest('[data-cust]'))) { var P2 = per(), cn = t.getAttribute('data-cust'); drill({ ms: P2.ms, r: 'West', p: F.p, c: cn, label: cn + ' · ' + P2.label }); return; }
      if ((t = e.target.closest('[data-mx]'))) { var mx = t.getAttribute('data-mx').split('|'), P3 = per(); drill({ ms: P3.ms, r: mx[0], p: mx[1], label: mx[0] + ' · ' + PN[mx[1]] + ' · ' + P3.label }); return; }
      if ((t = e.target.closest('[data-sa]'))) { var li = t.closest('[data-s]'), s = SCH.filter(function (x) { return x.id === li.getAttribute('data-s'); })[0]; if (s) schAction(s, t.getAttribute('data-sa'), t); return; }
    });
    root.addEventListener('change', function (e) {
      var t = e.target.closest('[data-f]'); if (!t || t.closest('.sda-modal')) return;
      F[t.getAttribute('data-f')] = t.value; guide.done('filter'); renderBody();
      say('Filter: ' + scopeText());
    });
    $('.app-nav').addEventListener('keydown', function (e) {
      if (!/^Arrow(Up|Down|Left|Right)$/.test(e.key)) return;
      var bs = $$('.app-nav [data-v]'), i = bs.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault(); i = (i + (/Down|Right/.test(e.key) ? 1 : -1) + bs.length) % bs.length;
      setView(bs[i].getAttribute('data-v')); bs[i].focus();
    });
    /* redraw charts when the width changes (mobile rotation, resize) */
    if ('ResizeObserver' in window) {
      var lastW = 0, ro = new ResizeObserver(function () {
        var c = $('[data-chart="1"]'); if (!c || view !== 'dash') return;
        var w = c.clientWidth; if (Math.abs(w - (c._w || 0)) > 4 && Math.abs(w - lastW) > 4) { lastW = w; drawCharts(); }
      });
      ro.observe($('.app-main')); ctx.onCleanup(function () { ro.disconnect(); });
    }

    /* ---------------- roles ---------------- */
    SDA.roles($('.dash-roles'), { title: 'View as', roles: ROLES, value: role, onChange: function (r) {
      var was = role; role = r; dms.setRole(r); ai = { html: '', key: '', busy: false };
      if (r === 'sales') F.r = 'West'; else if (was === 'sales') F.r = 'All';
      render();
      say('Now viewing as ' + me());
    } });

    render();
  });
})();
