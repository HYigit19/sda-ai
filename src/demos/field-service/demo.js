/* Field Service & Proof of Delivery demo ("FieldProof"). All people, companies, addresses and jobs are fictional.
   Nothing leaves the browser: GPS fixes, the camera, push messages and e-mails are simulated unless a step says otherwise.
   Proof checks (location, photos, checklist, signature) are computed from the actual data of each job. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-field', function (root, ctx) {
    var esc = SDA.esc, reduce = SDA.reduce;
    var q = function (s, r) { return (r || root).querySelector(s); };
    var qa = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };

    /* ================= constants + helpers ================= */
    var LIMIT_M = 50, ACC_M = 30, CO = 'Northline Field Services';
    var BASE = { lat: 39.7684, lng: -86.1581 }, UNIT = 60; // one map unit = 60 m
    var clock = 9 * 60 + 41; // simulated time of day in minutes
    var nDoc = 0, nJob = 4818;
    var did = function () { return 'fsd-' + (++nDoc); };
    var hm = function (m) { if (m == null) return '—'; var h = Math.floor(m / 60) % 24, mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + ' ' + (h < 12 ? 'AM' : 'PM'); };
    var hmShort = function (m) { var h = Math.floor(m / 60) % 24, mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm; };
    var win = function (j) { return hm(j.win[0]) + ' – ' + hm(j.win[1]); };
    var rad = function (d) { return d * Math.PI / 180; };
    function mapGeo(x, y) { var lat = BASE.lat - (y * UNIT) / 111320; return { lat: lat, lng: BASE.lng + (x * UNIT) / (111320 * Math.cos(rad(lat))) }; }
    function offsetGeo(g, dx, dn) { return { lat: g.lat + dn / 111320, lng: g.lng + dx / (111320 * Math.cos(rad(g.lat))) }; }
    function distM(a, b) { // haversine
      var R = 6371000, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
      var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    }
    var fmtDist = function (m) { return m >= 1000 ? (m / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' km' : Math.round(m) + ' m'; };
    var fmtGeo = function (g) { return g.lat.toFixed(5) + ', ' + g.lng.toFixed(5); };
    var I = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var IC = {
      today: I('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
      docs: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h4"/>'),
      inbox: I('<path d="M4 13l2-8h12l2 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>'),
      back: I('<path d="m15 5-7 7 7 7"/>'), chev: I('<path d="m9 6 6 6-6 6"/>'),
      left: I('<path d="m15 5-7 7 7 7"/>'), right: I('<path d="m9 5 7 7-7 7"/>'),
      pin: I('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
      cam: I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
      list: I('<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>'),
      note: I('<path d="M5 4h14v16H5z"/><path d="M9 9h6M9 13h6M9 17h3"/>'),
      sign: I('<path d="M3 16c3-6 5-9 6-7s-2 8 1 7 4-9 6-8-1 7 2 6 3-3 3-3"/><path d="M3 21h18"/>'),
      route: I('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>'),
      call: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'),
      gps: I('<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>'),
      check: I('<path d="m5 12 5 5 9-10"/>'), x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
      warn: I('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
      clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
      trash: I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
      plus: I('<path d="M12 5v14M5 12h14"/>'), send: I('<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>'),
      img: I('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-7 7"/>'),
      doc: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/>'),
      phone: I('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
      board: I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>'),
      chart: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
      undo: I('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
      shield: I('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>')
    };

    /* ================= sample data ================= */
    var W = [
      { id: 'w1', name: 'Daniel Clark', ini: 'DC', van: 'Van 12', x: 16, y: 30 },
      { id: 'w2', name: 'Lisa Miller', ini: 'LM', van: 'Van 07', x: 30, y: 40 },
      { id: 'w3', name: 'James Taylor', ini: 'JT', van: 'Van 03', x: 88, y: 48 },
      { id: 'w4', name: 'Sarah Johnson', ini: 'SJ', van: 'Van 15', x: 22, y: 34 }
    ];
    var wk = function (id) { return W.filter(function (w) { return w.id === id; })[0]; };
    var wname = function (id) { var w = wk(id); return w ? w.name : 'Unassigned'; };
    var TYPES = {
      Delivery: { word: 'delivery', photos: 2, art: ['pallet', 'parcel'], items: ['Goods unloaded and counted', 'Packaging undamaged', 'Placed at the agreed spot', 'Delivery note handed over'] },
      Service: { word: 'service', photos: 2, art: ['meter', 'install'], items: ['Unit cleaned and inspected', 'Pressure and readings checked', 'Meter reading recorded', 'Customer briefed'] },
      Installation: { word: 'service', photos: 2, art: ['install', 'meter'], items: ['Old unit removed', 'New unit installed and tested', 'Work area cleaned', 'Customer briefed'] },
      Inspection: { word: 'service', photos: 1, art: ['install'], items: ['Brakes tested', 'Door sensors OK', 'Emergency call tested', 'Logbook signed'] },
      Repair: { word: 'service', photos: 2, art: ['damage', 'install'], items: ['Damage assessed', 'Part replaced', 'Function tested', 'Customer briefed'] }
    };
    var ART = [['pallet', 'Pallet'], ['parcel', 'Parcel'], ['meter', 'Meter'], ['damage', 'Damage'], ['install', 'Install']];
    var artName = function (k) { var a = ART.filter(function (x) { return x[0] === k; })[0]; return a ? a[1] : 'Photo'; };
    function mk(o) {
      var t = TYPES[o.type];
      var j = Object.assign({ status: o.worker ? 'Assigned' : 'Unassigned', items: t.items.slice(), minPhotos: t.photos, note: '', log: [], proof: null, sim: {}, isNew: false, arrived: false }, o);
      j.geo = mapGeo(j.x, j.y);
      var cn = j.contact.toLowerCase().split(' ');
      j.email = cn[0] + '.' + cn[1] + '@' + j.cust.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '') + '.example';
      j.tel = '(555) 01' + String(10 + (parseInt(j.id.slice(2), 10) % 89));
      j.work = { pos: null, checkinAt: null, photos: [], checks: {}, notes: '', followUp: false, signer: '', sig: null, noSig: false, completedAt: null };
      return j;
    }
    var jobs = [
      mk({ id: 'J-4806', type: 'Service', title: 'Quarterly HVAC check', cust: 'Maple Grove Pharmacy', contact: 'Karen White', addr: '88 Maple Grove Avenue', x: 28, y: 46, win: [450, 540], worker: 'w3' }),
      mk({ id: 'J-4807', type: 'Delivery', title: 'Deliver 40 boxes of printer paper', cust: 'Riverside Community Center', contact: 'Robert Moore', addr: '215 Riverside Drive', x: 20, y: 22, win: [480, 540], worker: 'w1' }),
      mk({ id: 'J-4808', type: 'Inspection', title: 'Elevator safety inspection', cust: 'Parkside Offices', contact: 'Nancy Hall', addr: '1400 Park Road', x: 70, y: 12, win: [510, 600], worker: 'w2' }),
      mk({ id: 'J-4809', type: 'Service', title: 'Boiler maintenance, 2 units', cust: 'Cedar Point Apartments', contact: 'Paul Young', addr: '52 Cedar Point Lane', x: 88, y: 48, win: [540, 660], worker: 'w3' }),
      mk({ id: 'J-4810', type: 'Delivery', title: 'Deliver 2 pallets of floor tiles', cust: 'Harbor Building Supplies', contact: 'Mark Lewis', addr: '1180 Harbor Street', x: 38, y: 30, win: [600, 690], worker: 'w1', note: 'Use the side gate on 12th Street. A forklift is available on site.' }),
      mk({ id: 'J-4811', type: 'Delivery', title: 'Deliver 12 office chairs', cust: 'Summit Office Interiors', contact: 'Laura King', addr: '730 Summit Boulevard', x: 52, y: 54, win: [570, 660], worker: 'w2', sim: { noSig: true } }),
      mk({ id: 'J-4812', type: 'Service', title: 'Annual boiler maintenance', cust: 'Alder Street Apartments', contact: 'Kevin Wright', addr: '42 Alder Street', x: 62, y: 44, win: [750, 840], worker: 'w1', note: 'Boiler room key is at the front desk.' }),
      mk({ id: 'J-4813', type: 'Repair', title: 'Replace loading dock door seal', cust: 'Oakridge Warehouse', contact: 'Steven Green', addr: '9 Oakridge Way', x: 14, y: 10, win: [660, 750], worker: 'w3', sim: { followUp: true } }),
      mk({ id: 'J-4814', type: 'Delivery', title: 'Deliver medical supplies', cust: 'Lakeside Dental Clinic', contact: 'Amy Baker', addr: '310 Lakeside Avenue', x: 46, y: 18, win: [630, 720], worker: 'w4', sim: { damage: true } }),
      mk({ id: 'J-4815', type: 'Installation', title: 'Install smart water meter', cust: 'Brookfield Bakery', contact: 'Helen Adams', addr: '67 Brookfield Road', x: 84, y: 20, win: [870, 960], worker: 'w1' }),
      mk({ id: 'J-4816', type: 'Inspection', title: 'Fire door inspection', cust: 'Westgate Library', contact: 'Carol Nelson', addr: '500 Westgate Street', x: 76, y: 30, win: [780, 900], worker: null }),
      mk({ id: 'J-4817', type: 'Delivery', title: 'Deliver 6 replacement monitors', cust: 'Pinecrest School', contact: 'Brian Hill', addr: '18 Pinecrest Court', x: 30, y: 58, win: [900, 1020], worker: null })
    ];
    var job = function (id) { return jobs.filter(function (j) { return j.id === id; })[0]; };
    var SPOTS = [
      { addr: '25 Elm Street', x: 58, y: 8 }, { addr: '940 Lakeview Drive', x: 8, y: 40 }, { addr: '312 Market Street', x: 66, y: 58 },
      { addr: '77 Hillcrest Road', x: 94, y: 8 }, { addr: '150 Station Square', x: 42, y: 42 }
    ];

    /* activity + inbox */
    var events = [], inbox = [], unread = 0, pushQ = [];
    function log(j, text, who, kind) {
      var e = { t: clock, text: text, who: who || 'System', job: j ? j.id : '', kind: kind || 'info', wid: j ? j.worker : null };
      events.unshift(e); if (events.length > 60) events.pop();
      if (j) j.log.push({ t: clock, text: text, who: e.who });
    }
    function tell(j, text, title) { inbox.unshift({ t: clock, text: text, job: j ? j.id : '', title: title || 'Dispatch' }); unread++; pushQ.push({ title: title || 'Dispatch · Emma Davis', text: text }); }

    /* ================= proof checks (computed from data) ================= */
    function evaluate(j, final) {
      var w = j.work, out = [];
      var loc = { key: 'loc', label: 'Location' };
      if (!w.pos) { loc.state = final ? 'fail' : 'wait'; loc.reason = final ? 'No check-in position was recorded' : 'Waiting for check-in'; }
      else {
        var d = distM(j.geo, w.pos), okD = d <= LIMIT_M, okA = w.pos.acc <= ACC_M;
        loc.dist = Math.round(d); loc.src = w.pos.src;
        loc.state = okD && okA ? 'pass' : 'fail';
        loc.reason = fmtDist(d) + ' from the job address ' + (okD ? '(limit ' + LIMIT_M + ' m)' : '— more than the ' + LIMIT_M + ' m limit') +
          ' · GPS accuracy ±' + w.pos.acc + ' m' + (okA ? '' : ' — worse than the ±' + ACC_M + ' m limit');
      }
      out.push(loc);
      var n = w.photos.length, min = j.minPhotos;
      out.push({ key: 'pho', label: 'Photos', state: n >= min ? 'pass' : (final ? 'fail' : 'wait'),
        reason: n >= min ? n + ' photo' + (n > 1 ? 's' : '') + ' taken (minimum ' + min + ')' : (n ? 'Only ' + n + ' of ' + min + ' required photos' : 'No photos yet — ' + min + ' required') });
      var miss = j.items.filter(function (it, i) { return !w.checks[i]; });
      out.push({ key: 'chk', label: 'Checklist', state: miss.length ? (final ? 'fail' : 'wait') : 'pass',
        reason: miss.length ? miss.length + ' of ' + j.items.length + ' items not ticked: ' + miss.join('; ') : 'All ' + j.items.length + ' items ticked' });
      var sg = { key: 'sig', label: 'Signature' };
      if (w.noSig) { sg.state = 'fail'; sg.reason = 'Customer not available — no signature captured'; }
      else if (!w.sig) { sg.state = final ? 'fail' : 'wait'; sg.reason = 'No customer signature yet'; }
      else if (!w.signer) { sg.state = 'fail'; sg.reason = 'Signer name missing'; }
      else { sg.state = 'pass'; sg.reason = 'Signed by ' + w.signer; }
      out.push(sg);
      var fails = out.filter(function (c) { return c.state === 'fail'; }), waits = out.filter(function (c) { return c.state === 'wait'; });
      return { checks: out, overall: fails.length ? 'Needs review' : waits.length ? 'In progress' : 'Verified',
        reasons: fails.map(function (c) { return c.label + ': ' + c.reason; }) };
    }
    var stIcon = function (s) { return s === 'pass' ? IC.check : s === 'fail' ? IC.x : IC.clock; };
    var stWord = function (s) { return s === 'pass' ? 'Pass' : s === 'fail' ? 'Fail' : 'Pending'; };
    function checksHTML(ev, opts) {
      opts = opts || {};
      return '<ul class="fs-checks' + (opts.compact ? ' compact' : '') + '">' + ev.checks.map(function (c) {
        return '<li class="c-' + c.state + '"><span class="fs-ck-i" aria-hidden="true">' + stIcon(c.state) + '</span><span class="fs-ck-t"><b>' + c.label + ' <em>' + stWord(c.state) + '</em></b><small>' + esc(c.reason) + '</small>' +
          (c.src ? '<span class="fs-src">' + IC.gps + esc(c.src) + '</span>' : '') + '</span></li>';
      }).join('') + '</ul>';
    }
    function overallPill(o) { return '<span class="pill ' + (o === 'Verified' ? 'p-ok' : o === 'Needs review' ? 'p-bad' : 'p-info') + '">' + o + '</span>'; }

    /* ================= status helpers ================= */
    function stKey(j) {
      if (j.status === 'Completed') return j.proof && j.proof.review === 'Approved' ? 'ok' : j.proof && j.proof.overall === 'Needs review' ? 'nr' : 'vf';
      return { 'Unassigned': 'un', 'Assigned': 'as', 'En route': 'er', 'On site': 'os' }[j.status];
    }
    var ST_LABEL = { un: 'Unassigned', as: 'Assigned', er: 'En route', os: 'On site', vf: 'Verified · to approve', nr: 'Needs review', ok: 'Approved' };
    function stPill(j) {
      var k = stKey(j), lbl = ST_LABEL[k];
      if (j.status === 'On site' && j.proof && j.proof.review === 'Sent back') lbl = 'Rework';
      if (k === 'ok' && j.proof.sent != null) lbl = 'Approved · sent';
      var cls = { un: 'p-warn', as: 'p-info', er: 'p-warn', os: 'fs-p-os', vf: 'p-info', nr: 'p-bad', ok: 'p-ok' }[k];
      return '<span class="pill ' + cls + '">' + lbl + '</span>';
    }
    function keepFocus(container, fn) {
      var a = document.activeElement, k = a && container && container.contains(a) && a.getAttribute('data-k');
      fn();
      if (k) { var el = container.querySelector('[data-k="' + k + '"]'); if (el) try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    }
    var btn = function (a, v, html, cls, extra) { return '<button type="button" class="' + (cls || '') + '" data-a="' + a + '"' + (v != null ? ' data-v="' + esc(v) + '"' : '') + ' data-k="' + a + ':' + esc(v == null ? '' : v) + '"' + (extra || '') + '>' + html + '</button>'; };

    /* ================= documents (DMS) ================= */
    var PERSONA = { tech: 'Daniel Clark', office: 'Emma Davis', manager: 'Michael Brown' };
    function linkOf(j) { return j.id + ' · ' + j.cust; }
    function workOrder(j) {
      return { id: did(), name: 'Work order ' + j.id + '.pdf', type: 'pdf', folder: 'Work orders', job: j.id, linked: linkOf(j), owner: 'Emma Davis', status: 'Valid', tags: [j.type.toLowerCase(), 'work order'],
        title: 'Work order ' + j.id, company: CO, meta: [['Type', j.type], ['Window', win(j)], ['Technician', wname(j.worker)], ['Priority', 'Normal']],
        sections: [{ h: 'Customer', lines: [j.cust, j.addr, 'Contact: ' + j.contact + ' · ' + j.tel] }, { h: 'Task', p: j.title + '. ' + (j.note || 'No special instructions.') },
          { h: 'Checklist', lines: j.items }, { h: 'Proof required', lines: ['Check-in within ' + LIMIT_M + ' m of the address, GPS accuracy ±' + ACC_M + ' m or better', 'At least ' + j.minPhotos + ' photo' + (j.minPhotos > 1 ? 's' : ''), 'All checklist items ticked', 'Customer signature with name'] }] };
    }
    function deliveryNote(j, rows) {
      return { id: did(), name: 'Delivery note DN-' + j.id.slice(2) + '.pdf', type: 'pdf', folder: 'Delivery notes', job: j.id, linked: linkOf(j), owner: 'Emma Davis', status: 'Valid', tags: ['delivery note'],
        title: 'Delivery note DN-' + j.id.slice(2), company: CO, meta: [['Ship to', j.cust], ['Address', j.addr], ['Order', 'SO-' + (20000 + parseInt(j.id.slice(2), 10))]],
        sections: [{ h: 'Items', rows: [['Item', 'Qty', 'Unit']].concat(rows) }, { h: 'Receipt', p: 'Received in good condition. Signature is captured in the FieldProof app and attached to the proof of delivery.' }] };
    }
    function safety(j, title, lines) {
      return { id: did(), name: 'Safety instructions · ' + title + '.pdf', type: 'pdf', folder: 'Safety instructions', job: j.id, linked: linkOf(j), owner: 'Michael Brown', status: 'Valid', tags: ['safety'],
        title: 'Safety instructions: ' + title, company: CO, meta: [['Applies to', j.id], ['Revision', '3'], ['Read before', 'starting work']], sections: [{ h: 'Rules', lines: lines }, { h: 'Emergency', p: 'Stop work, secure the area and call dispatch. In an emergency call 911 first.' }] };
    }
    var seedDocs = [];
    jobs.forEach(function (j) { seedDocs.push(workOrder(j)); });
    var DN = { 'J-4807': [['Printer paper A4, 5-ream box', '40', 'box']], 'J-4810': [['Porcelain floor tiles 24x24 in', '2', 'pallet'], ['Tile adhesive 50 lb', '12', 'bag']], 'J-4811': [['Office chair, mesh back', '12', 'pc']],
      'J-4814': [['Nitrile gloves, box of 100', '30', 'box'], ['Sterile gauze pads', '20', 'pack']], 'J-4817': [['27-inch monitor', '6', 'pc']] };
    Object.keys(DN).forEach(function (id) { seedDocs.push(deliveryNote(job(id), DN[id])); });
    seedDocs.push(safety(job('J-4810'), 'Pallets and manual handling', ['Wear safety shoes and gloves', 'Use the pallet jack or the customer forklift only with an instructed operator', 'Never stand under a raised load', 'Lift with your legs, max. 50 lb per person']));
    seedDocs.push(safety(job('J-4812'), 'Gas appliances', ['Check for gas smell before entering the boiler room', 'Isolate gas and power before opening the burner', 'Measure exhaust values after the service', 'Leave the appliance only when it runs safely']));
    seedDocs.push(safety(job('J-4808'), 'Lift machine rooms', ['Lock out and tag out the main switch', 'Two-person rule in the pit', 'Test the emergency call before leaving']));
    seedDocs.push(safety(job('J-4813'), 'Loading docks', ['Chock the trailer wheels', 'Wear high-visibility vest', 'Keep clear of the dock leveler edge']));
    seedDocs.push(safety(job('J-4815'), 'Water meters', ['Close the main valve and drain the line', 'Check for leaks for 5 minutes after installation', 'Record old and new meter readings']));

    var role = 'tech';
    function ownDoc(d) { if (d.job) { var j = job(d.job); return !!j && j.worker === 'w1'; } return d.owner === 'Daniel Clark'; }
    var dms = SDA.dms(q('.fs-dms'), {
      root: root, title: 'Job documents', role: role, docs: seedDocs,
      folders: ['Work orders', 'Delivery notes', 'Proof of delivery', 'Job photos', 'Safety instructions'], uploadFolder: 'Job photos', uploadStatus: 'Pending review',
      canUpload: function (r) { return r !== 'manager'; }, canApprove: function (r) { return r === 'office'; },
      filter: function (d, r) { return r !== 'tech' || ownDoc(d); },
      userName: function (r) { return PERSONA[r]; },
      onChange: function (docs, d, act) {
        if (act === 'approve' && d && d.pod) { var j = job(d.job); if (j && j.proof && j.proof.review !== 'Approved') { approveProof(j, 'Approved in the document area', true); } }
      }
    });
    var docById = function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; };
    var docsOf = function (j) { return dms.docs().filter(function (d) { return d.job === j.id; }); };

    /* proof PDFs get the signature and photo thumbnails injected (docPage itself renders text only) */
    var podIndex = {};
    var mo = new MutationObserver(function () {
      qa('.sda-modal .sda-page').forEach(function (pg) {
        if (pg._fs) return; pg._fs = true;
        var pid = null;
        qa('.sda-page-meta span', pg).forEach(function (s) { var i = s.querySelector('i'); if (i && i.textContent === 'Proof ID') pid = s.textContent.slice(8); });
        var j = pid && podIndex[pid]; if (!j) return;
        var snap = j.proof && j.proof.snap; if (!snap) return;
        qa('h5', pg).forEach(function (h) {
          if (h.textContent === 'Photos' && snap.photos.length) {
            var tbl = h.nextElementSibling, fig = document.createElement('div'); fig.className = 'fs-pod-ph';
            fig.innerHTML = snap.photos.map(function (p, i) { return '<img src="' + p.url + '" alt="Photo ' + (i + 1) + ': ' + esc(p.name) + '">'; }).join('');
            (tbl || h).insertAdjacentElement('afterend', fig);
          }
          if (h.textContent === 'Customer signature' && snap.sig) {
            var p = h.nextElementSibling, im = document.createElement('img'); im.className = 'fs-pod-sig'; im.src = snap.sig; im.alt = 'Customer signature of ' + snap.signer;
            (p || h).insertAdjacentElement('afterend', im);
          }
        });
      });
    });
    mo.observe(root, { childList: true });
    ctx.onCleanup(function () { mo.disconnect(); });

    function podFields(j) {
      var p = j.proof, w = j.work, word = TYPES[j.type].word;
      return { name: 'Proof of ' + word + ' ' + j.id + '.pdf', type: 'pdf', folder: 'Proof of delivery', job: j.id, linked: linkOf(j), owner: wname(j.worker), pod: true,
        status: p.overall === 'Verified' ? 'Pending approval' : 'Needs review', tags: [j.type.toLowerCase(), p.overall.toLowerCase()],
        title: 'Proof of ' + word + ' · ' + j.id, company: CO,
        meta: [['Proof ID', p.id], ['Date', SDA.fmtDate(SDA.today())], ['Completed', hm(w.completedAt)], ['Result', p.overall]],
        sections: [
          { h: 'Job', head: false, rows: [['Customer', j.cust], ['Address', j.addr], ['Contact', j.contact], ['Technician', wname(j.worker)], ['Planned window', win(j)], ['Checked in', hm(w.checkinAt)], ['Time on site', w.checkinAt != null ? (w.completedAt - w.checkinAt) + ' min' : '—']] },
          { h: 'Automatic checks', rows: [['Check', 'Result', 'Details']].concat(p.checks.map(function (c) { return [c.label, stWord(c.state), c.reason]; })) },
          { h: 'Overall result', p: p.overall === 'Verified' ? 'Verified: all four checks passed.' : 'Needs review. ' + p.reasons.join(' | ') },
          { h: 'Check-in position', p: w.pos ? fmtGeo(w.pos) + ' (±' + w.pos.acc + ' m) · ' + w.pos.src : 'Not recorded' },
          { h: 'Checklist', rows: [['Item', 'Done']].concat(j.items.map(function (it, i) { return [it, w.checks[i] ? 'Yes' : 'No']; })) },
          { h: 'Photos', rows: [['#', 'Photo', 'Taken', 'Source']].concat(w.photos.map(function (ph, i) { return [String(i + 1), ph.name, hm(ph.t), ph.origin]; })) },
          { h: 'Notes', p: (w.notes || 'No notes.') + (w.followUp ? ' Follow-up visit needed.' : '') },
          { h: 'Customer signature', p: w.sig ? 'Signed by ' + w.signer + ' at ' + hm(w.completedAt) + '.' : w.noSig ? 'Customer not available. No signature captured.' : 'No signature.' }
        ] };
    }

    /* ================= job lifecycle ================= */
    function photo(kind, j, t) { var name = artName(kind); return { id: SDA.uid('ph'), kind: kind, name: name, t: t, origin: 'Simulated camera', url: SDA.art(kind, j.id + ' · ' + name + ' · ' + hm(t)) }; }
    function completeJob(j) {
      var w = j.work, prev = j.proof;
      w.completedAt = clock; j.status = 'Completed'; j.arrived = false;
      var ev = evaluate(j, true), ver = prev ? prev.ver + 1 : 1;
      j.proof = { id: 'POD-' + j.id.slice(2) + '-' + ver, ver: ver, at: clock, checks: ev.checks, overall: ev.overall, reasons: ev.reasons, review: 'Pending', sent: null, docId: prev ? prev.docId : null,
        snap: { photos: w.photos.slice(), sig: w.sig, signer: w.signer } };
      podIndex[j.proof.id] = j;
      w.photos.forEach(function (ph, i) {
        if (ph.doc) return; ph.doc = true;
        dms.add({ id: did(), name: j.id + ' photo ' + (i + 1) + ' · ' + ph.name + '.jpg', type: 'jpg', folder: 'Job photos', job: j.id, linked: linkOf(j), owner: wname(j.worker), status: 'Valid', img: ph.url, tags: [ph.kind === 'damage' ? 'damage' : 'photo'], note: 'Taken ' + hm(ph.t) + ' · ' + ph.origin });
      });
      var f = podFields(j), d = j.proof.docId && docById(j.proof.docId);
      if (d) { Object.assign(d, f); d.version += 1; d.versions.push({ v: d.version, date: SDA.fmtDate(SDA.today()), by: wname(j.worker), note: 'Regenerated after rework · ' + j.proof.overall }); dms.render(); }
      else { f.id = did(); f.note = 'Generated after completion · ' + j.proof.overall; d = dms.add(f); j.proof.docId = d.id; }
      log(j, j.id + ' completed · proof ' + (j.proof.overall === 'Verified' ? 'verified' : 'needs review'), wname(j.worker), j.proof.overall === 'Verified' ? 'ok' : 'bad');
    }
    function approveProof(j, note, viaDms) {
      var p = j.proof; p.review = 'Approved'; p.approvedBy = 'Emma Davis'; p.approveNote = note || '';
      var d = docById(p.docId);
      if (d && !viaDms) { d.status = 'Approved'; d.versions.push({ v: d.version, date: SDA.fmtDate(SDA.today()), by: 'Emma Davis', note: 'Approved' + (note ? ': ' + note : '') }); dms.render(); }
      log(j, 'Proof for ' + j.id + ' approved' + (note ? ' (' + note + ')' : ''), 'Emma Davis', 'ok');
      if (j.worker === 'w1') { tell(j, 'Proof for ' + j.id + ' was approved.'); guide.done('review'); }
      refresh();
    }
    function sendBack(j, note) {
      var p = j.proof; p.review = 'Sent back'; p.backNote = note;
      var d = docById(p.docId);
      if (d) { d.status = 'Rejected · rework'; d.versions.push({ v: d.version, date: SDA.fmtDate(SDA.today()), by: 'Emma Davis', note: 'Sent back: ' + note }); dms.render(); }
      j.status = 'On site'; j.work.completedAt = null;
      log(j, j.id + ' sent back for rework: ' + note, 'Emma Davis', 'bad');
      if (j.worker === 'w1') { tell(j, 'Rework on ' + j.id + ': ' + note); guide.done('review'); }
      refresh();
    }
    function startRoute(j) {
      var w = wk(j.worker);
      w.route = { pts: [{ x: w.x, y: w.y }, { x: w.x, y: j.y }, { x: j.x, y: j.y }], t: 0, job: j.id, dur: w.id === 'w1' ? 7000 : 9000 };
      j.status = 'En route'; j.arrived = false;
      log(j, w.name + ' started the route to ' + j.id, w.name, 'info');
    }
    function routeLen(r) { var L = 0; for (var i = 1; i < r.pts.length; i++) L += Math.hypot(r.pts[i].x - r.pts[i - 1].x, r.pts[i].y - r.pts[i - 1].y); return L; }
    function routeAt(r, t) {
      var L = routeLen(r) * t;
      for (var i = 1; i < r.pts.length; i++) {
        var a = r.pts[i - 1], b = r.pts[i], s = Math.hypot(b.x - a.x, b.y - a.y);
        if (L <= s || i === r.pts.length - 1) { var k = s ? Math.min(1, L / s) : 1; return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; }
        L -= s;
      }
      return r.pts[r.pts.length - 1];
    }
    function arrive(w) {
      var j = job(w.route.job); w.route = null; w.x = j.x; w.y = j.y + 1.2;
      if (j.worker !== w.id) return;
      if (w.id === 'w1') { j.arrived = true; log(j, 'Daniel Clark arrived near ' + j.addr, 'Daniel Clark', 'info'); if (role === 'tech' && ph.job === j.id && ph.screen === 'route') paintPhone('none'); SDA.toast(root, 'Arrived at ' + esc(j.addr) + '. Check in next.'); }
      else {
        var dx = 4 + Math.round(Math.random() * 10), dn = -3 - Math.round(Math.random() * 8);
        j.work.pos = Object.assign(offsetGeo(j.geo, dx, dn), { acc: 5 + Math.round(Math.random() * 5), src: 'Simulated GPS position', dx: dx, dn: dn });
        j.work.checkinAt = clock; j.status = 'On site'; j.simTicks = 0;
        log(j, w.name + ' checked in at ' + j.id + ' (' + fmtDist(distM(j.geo, j.work.pos)) + ' from address)', w.name, 'info');
      }
      refresh(true);
    }

    /* seed: jobs that already happened this morning */
    function seedDone(id, o) {
      var j = job(id), w = j.work, t0 = o.checkin;
      w.pos = Object.assign(offsetGeo(j.geo, o.dx, o.dn), { acc: o.acc, src: 'Simulated GPS position', dx: o.dx, dn: o.dn });
      w.checkinAt = t0;
      o.photos.forEach(function (k, i) { var p = photo(k, j, t0 + 4 + i * 6); w.photos.push(p); });
      j.items.forEach(function (it, i) { w.checks[i] = (o.unticked || []).indexOf(i) < 0; });
      w.signer = o.signer || ''; w.sig = o.signer ? SDA.art('signature') : null; w.noSig = !!o.noSig; w.followUp = !!o.followUp; w.notes = o.notes || '';
      j.log.push({ t: j.win[0] - 20, text: 'Assigned to ' + wname(j.worker), who: 'Emma Davis' });
      j.log.push({ t: t0, text: 'Checked in', who: wname(j.worker) });
      if (o.done) { var save = clock; clock = o.done; completeJob(j); clock = save; }
      else { j.status = 'On site'; j.simTicks = 0; }
    }
    seedDone('J-4806', { dx: 6, dn: -4, acc: 5, checkin: 482, done: 524, photos: ['meter', 'install'], signer: 'Karen White', followUp: true, notes: 'Compressor is noisy. Replacement part ordered, second visit needed.' });
    seedDone('J-4807', { dx: -8, dn: 5, acc: 6, checkin: 511, done: 532, photos: ['pallet', 'parcel'], signer: 'Robert Moore', notes: 'Left at the reception desk.' });
    seedDone('J-4808', { dx: 160, dn: -162, acc: 9, checkin: 531, done: 562, photos: ['install'], unticked: [2], signer: 'Nancy Hall', notes: 'Emergency call line was busy, will retest.' });
    seedDone('J-4809', { dx: 4, dn: 7, acc: 6, checkin: 565, photos: ['meter'] });
    (function () { var j = job('J-4809'); j.work.checks = { 0: true, 1: true }; })();
    (function () { var j = job('J-4807'); j.proof.review = 'Approved'; j.proof.sent = 541; var d = docById(j.proof.docId); d.status = 'Approved'; })();
    // Lisa is already driving to J-4811
    (function () { var j = job('J-4811'); startRoute(j); wk('w2').route.t = 0.35; })();
    events.length = 0;
    [['J-4806', 'J-4806 completed · proof verified · follow-up visit needed', 'James Taylor', 'ok', 524], ['J-4807', 'J-4807 completed · proof verified, approved and sent', 'Daniel Clark', 'ok', 541],
     ['J-4808', 'J-4808 completed · proof needs review', 'Lisa Miller', 'bad', 562], ['J-4809', 'James Taylor checked in at J-4809', 'James Taylor', 'info', 565], ['J-4811', 'Lisa Miller started the route to J-4811', 'Lisa Miller', 'info', 575]]
      .forEach(function (e) { events.unshift({ t: e[4], text: e[1], who: e[2], kind: e[3], job: e[0], wid: job(e[0]).worker }); });
    jobs.forEach(function (j) { if (!j.log.length) j.log.push({ t: 470, text: j.worker ? 'Assigned to ' + wname(j.worker) : 'Created, waiting for assignment', who: 'Emma Davis' }); });

    /* ================= role switcher + guided task ================= */
    var guide = SDA.guide(q('.fs-guide'), {
      title: 'Deliver J-4810 with a checked proof', demoId: 'demo-field',
      steps: [
        { id: 'start', text: 'As <b>Daniel</b>, open <b>J-4810</b> and start the route' },
        { id: 'photos', text: 'Check in, take <b>2 photos</b> and open one full screen' },
        { id: 'sign', text: 'Tick the checklist and save the customer <b>signature</b>' },
        { id: 'complete', text: '<b>Complete</b> the job and look at the check results' },
        { id: 'review', text: 'Switch to <b>Office</b> and approve or send back the proof' }
      ],
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=field-service', text: 'Talk to us about your version' }
    });
    var roles = SDA.roles(q('.fs-roles'), {
      title: 'View as', value: 'tech',
      roles: [
        { id: 'tech', label: 'Field worker', person: 'Daniel Clark', icon: IC.phone, sub: 'Phone app with your own jobs and their documents only.' },
        { id: 'office', label: 'Office · dispatch', person: 'Emma Davis', icon: IC.board, sub: 'Live board for all teams: assign jobs, review proofs, approve documents, send proofs.' },
        { id: 'manager', label: 'Manager', person: 'Michael Brown', icon: IC.chart, sub: 'KPIs and exceptions across all teams. Read only.' }
      ],
      onChange: function (r) { role = r; dms.setRole(r); renderView(); }
    });

    /* ================= map drawing ================= */
    function mapBase() {
      return '<rect class="fs-m-bg" x="-20" y="-20" width="140" height="104"/>' +
        '<path class="fs-m-water" d="M-20 61 C0 57 14 64 30 61 S62 53 82 58 S104 55 120 57 V84 H-20Z"/>' +
        '<rect class="fs-m-park" x="3" y="36" width="12" height="9" rx="1.5"/><rect class="fs-m-park" x="55" y="23" width="11" height="9" rx="1.5"/><rect class="fs-m-park" x="77" y="1.5" width="15" height="7" rx="1.5"/>' +
        '<g class="fs-m-blocks">' + [[3, 13, 8, 9], [23, 13, 9, 9], [41, 4, 13, 7], [60, 13, 16, 9], [83, 13, 9, 9], [16, 27, 15, 7], [38, 34, 16, 13], [68, 36, 9, 11], [84, 26, 12, 8], [19, 42, 13, 6], [60, 49, 18, 5]].map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="1"/>'; }).join('') + '</g>' +
        '<g class="fs-m-minor"><path d="M0 18H100M0 40H100M24 0V64M70 0V64M48 0V60"/></g>' +
        '<g class="fs-m-road"><path d="M-20 10H120M-20 30H120M-20 50H120M14 -20V84M38 -20V84M62 -20V84M86 -20V84"/><path d="M-20 64 C20 40 60 30 120 -6"/></g>';
    }
    function pinSVG(j, sel) {
      return '<g class="fs-pin s-' + stKey(j) + (sel ? ' sel' : '') + '" transform="translate(' + j.x + ' ' + j.y + ')" data-a="osel" data-v="' + j.id + '" role="button" tabindex="0" aria-label="' + esc(j.id + ', ' + j.title + ', ' + ST_LABEL[stKey(j)]) + '">' +
        '<circle class="fs-pin-hit" r="4.4" cy="-3"/>' + (sel ? '<circle class="fs-pin-ring" r="3.4" cy="-3.6"/>' : '') +
        '<path class="fs-pin-b" d="M0 0C-2 -2.4 -2.9 -3.8 -2.9 -5.1a2.9 2.9 0 0 1 5.8 0C2.9 -3.8 2 -2.4 0 0Z"/><circle class="fs-pin-c" cy="-5.1" r="1.1"/></g>';
    }
    function workerSVG(w) {
      return '<g class="fs-wk' + (w.id === 'w1' ? ' me' : '') + '" data-w="' + w.id + '" transform="translate(' + w.x.toFixed(2) + ' ' + w.y.toFixed(2) + ')"><circle class="fs-wk-p" r="3.4"/><circle class="fs-wk-c" r="2.3"/><text y=".75" text-anchor="middle">' + w.ini + '</text></g>';
    }
    function routeSVG(w) { if (!w.route) return ''; return '<path class="fs-rt" d="M' + w.route.pts.map(function (p) { return p.x + ' ' + p.y; }).join('L') + '"/>'; }

    /* ================= PHONE (field worker) ================= */
    var ph = { screen: 'today', job: null, kind: 'pallet', draft: null, gotViewer: false, sigPts: 0, typed: false, geoBusy: false };
    var cur = function () { return ph.job ? job(ph.job) : null; };
    var mine = function () { return jobs.filter(function (j) { return j.worker === 'w1'; }).sort(function (a, b) { return a.win[0] - b.win[0]; }); };
    var activeMine = function () { return mine().filter(function (j) { return j.status === 'En route' || j.status === 'On site'; })[0]; };
    var SYS = '<svg class="fs-sig" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
      '<svg class="fs-wifi" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 11.5 10.2 9a3.2 3.2 0 0 0-4.4 0z"/><path d="M3.6 6.9a6.3 6.3 0 0 1 8.8 0l-1.3 1.3a4.5 4.5 0 0 0-6.2 0z"/><path d="M1.3 4.6a9.6 9.6 0 0 1 13.4 0l-1.3 1.3a7.8 7.8 0 0 0-10.8 0z"/></svg>' +
      '<svg class="fs-bat" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="16.5" height="9" rx="2"/><path d="M25 4.5v4a2 2 0 0 0 0-4z" opacity=".45"/></svg>';
    function phoneShell() {
      return '<div class="fs-phone" role="group" aria-label="Field worker phone app (simulated)"><span class="fs-btn-l" aria-hidden="true"></span><span class="fs-btn-r" aria-hidden="true"></span><div class="fs-screen">' +
        '<div class="fs-status" aria-hidden="true"><span class="fs-time">' + hmShort(clock) + '</span><span class="fs-island"></span><span class="fs-sys">' + SYS + '</span></div>' +
        '<div class="fs-push" role="status" aria-live="polite"></div><div class="fs-stage"></div><nav class="fs-tabs" aria-label="App sections"></nav><div class="fs-home" aria-hidden="true"></div></div></div>';
    }
    function paintTabs() {
      var t = q('.fs-tabs'); if (!t) return;
      var tab = ph.screen === 'docs' ? 'docs' : ph.screen === 'inbox' ? 'inbox' : 'today';
      t.innerHTML = [['today', 'Today', IC.today], ['docs', 'Documents', IC.docs], ['inbox', 'Inbox', IC.inbox]].map(function (x) {
        return '<button type="button" data-a="tab" data-v="' + x[0] + '" data-k="tab:' + x[0] + '"' + (tab === x[0] ? ' aria-current="page" class="on"' : '') + '>' + x[2] + '<span>' + x[1] + '</span>' + (x[0] === 'inbox' && unread ? '<i class="fs-badge">' + unread + '</i>' : '') + '</button>';
      }).join('');
    }
    function pageHTML(s) {
      var head = s.large ? '<header class="fs-lt"><small>' + esc(s.kicker || '') + '</small><h3>' + esc(s.title) + '</h3></header>'
        : '<header class="fs-nb' + (s.dark ? ' dark' : '') + '">' + (s.back ? '<button type="button" class="fs-bk" data-a="nav" data-v="' + s.back + '" data-k="nav:bk" aria-label="Back to ' + esc(s.backLabel) + '">' + IC.back + '<span>' + esc(s.backLabel) + '</span></button>' : '<span></span>') + '<b>' + esc(s.title) + '</b><span class="fs-nb-r">' + (s.right || '') + '</span></header>';
      return head + '<div class="fs-pg-b">' + s.body + '</div>' + (s.foot ? '<div class="fs-pg-f">' + s.foot + '</div>' : '');
    }
    function paintPhone(dir) {
      var stage = q('.fs-stage'); if (!stage) return;
      var j = cur();
      if (ph.screen !== 'today' && ph.screen !== 'docs' && ph.screen !== 'inbox' && (!j || j.worker !== 'w1')) ph.screen = 'today';
      var s = SCREENS[ph.screen](cur());
      var old = stage.querySelector('.fs-pg:not(.out)');
      var cls = 'fs-pg s-' + ph.screen + (s.dark ? ' dark' : '');
      if (old && dir === 'none') {
        var b = old.querySelector('.fs-pg-b'), st = b ? b.scrollTop : 0;
        keepFocus(old, function () { old.innerHTML = pageHTML(s); old.className = cls; });
        var nb = old.querySelector('.fs-pg-b'); if (nb) nb.scrollTop = st;
      } else {
        var had = old && old.contains(document.activeElement);
        var pg = document.createElement('div'); pg.className = cls; pg.tabIndex = -1; pg.innerHTML = pageHTML(s);
        if (old && !reduce && dir) {
          pg.classList.add(dir === 'back' ? 'in-l' : 'in-r'); old.classList.add('out', dir === 'back' ? 'out-r' : 'out-l');
          stage.appendChild(pg); ctx.later(360, function () { old.remove(); pg.classList.remove('in-l', 'in-r'); });
        } else { stage.innerHTML = ''; stage.appendChild(pg); }
        if (had) try { pg.focus({ preventScroll: true }); } catch (e) {}
      }
      paintTabs();
      if (ph.screen === 'sign') initSig();
      showPush();
    }
    function go(scr, id, dir) { if (id) ph.job = id; ph.screen = scr; paintPhone(dir || 'fwd'); }
    function showPush() {
      var el = q('.fs-push'); if (!el || !pushQ.length || role !== 'tech') return;
      var m = pushQ.shift();
      el.innerHTML = '<div class="fs-push-c"><span class="fs-push-ic">' + IC.inbox + '</span><span><b>' + esc(m.title) + '</b><small>' + esc(m.text) + '</small></span><em>now</em></div>';
      el.classList.add('on'); clearTimeout(el._t);
      el._t = setTimeout(function () { el.classList.remove('on'); if (pushQ.length) setTimeout(showPush, 400); }, 3600);
      paintTabs();
    }

    function jobCard(j) {
      var k = stKey(j);
      return '<button type="button" class="fs-jc k-' + k + '" data-a="open" data-v="' + j.id + '" data-k="open:' + j.id + '"><span class="fs-jc-t"><b>' + hm(j.win[0]).replace(' ', '&nbsp;') + '</b><small>' + hm(j.win[1]) + '</small></span>' +
        '<span class="fs-jc-m"><span class="fs-chip t-' + j.type.toLowerCase() + '">' + j.type + '</span>' + (j.isNew ? '<span class="fs-new">New</span>' : '') + '<b>' + esc(j.title) + '</b><small>' + esc(j.cust) + ' · ' + esc(j.addr) + '</small>' + stPill(j) + '</span><span class="fs-jc-c">' + IC.chev + '</span></button>';
    }
    var SCREENS = {
      today: function () {
        var L = mine(), done = L.filter(function (j) { return j.status === 'Completed'; }).length, next = L.filter(function (j) { return j.status !== 'Completed'; })[0];
        var pct = L.length ? Math.round(done / L.length * 100) : 0;
        return { large: true, kicker: SDA.fmtDate(SDA.today()) + ' · ' + 'Van 12', title: 'Today',
          body: '<div class="fs-sum"><span class="fs-ring" style="--p:' + pct + '"><b>' + done + '/' + L.length + '</b></span><span><b>' + done + ' of ' + L.length + ' jobs done</b><small>' + (next ? 'Next: ' + esc(next.id) + ' at ' + hm(next.win[0]) : 'All jobs done for today') + '</small></span></div>' +
            (L.length ? L.map(jobCard).join('') : '<p class="fs-empty">No jobs assigned to you right now.</p>') };
      },
      docs: function () {
        var L = mine(), body = L.map(function (j) {
          var ds = docsOf(j); if (!ds.length) return '';
          return '<div class="fs-grp"><h4>' + esc(j.id) + ' · ' + esc(j.cust) + '</h4>' + ds.map(function (d) { return btn('doc', d.id, '<span class="fs-di t-' + d.type + '">' + (d.type === 'jpg' ? IC.img : IC.doc) + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + ' · v' + d.version + '</small></span>' + IC.chev, 'fs-row'); }).join('') + '</div>';
        }).join('');
        return { large: true, kicker: 'Only documents of your own jobs', title: 'Documents', body: body || '<p class="fs-empty">No documents.</p>' };
      },
      inbox: function () {
        unread = 0;
        return { large: true, kicker: 'Messages from dispatch', title: 'Inbox',
          body: inbox.length ? inbox.map(function (m) { return '<div class="fs-msg"><span class="fs-msg-av">ED</span><span><b>' + esc(m.title) + ' <small>' + hm(m.t) + '</small></b><p>' + esc(m.text) + '</p>' + (m.job && job(m.job) && job(m.job).worker === 'w1' ? btn('open', m.job, 'Open ' + esc(m.job), 'fs-link') : '') + '</span></div>'; }).join('')
            : '<p class="fs-empty">No messages yet. When dispatch assigns a job or reviews a proof, it shows up here (push notifications are simulated).</p>' };
      },
      job: function (j) {
        var w = j.work, ev = evaluate(j, false), busy = activeMine(), foot = '';
        var body = '<div class="fs-hero"><span class="fs-chip t-' + j.type.toLowerCase() + '">' + j.type + '</span>' + stPill(j) + '<h4>' + esc(j.title) + '</h4><p>' + esc(j.cust) + '<br>' + esc(j.addr) + '</p>' +
          '<div class="fs-hero-r"><span>' + IC.clock + win(j) + '</span><span>' + IC.user2 + esc(j.contact) + '</span></div>' +
          '<div class="fs-act">' + btn('call', j.id, IC.call + 'Call', 'fs-pill-b') + btn('nav', 'route', IC.route + 'Route', 'fs-pill-b', j.status === 'Completed' ? ' disabled' : '') + btn('tab', 'docs', IC.docs + 'Docs', 'fs-pill-b') + '</div></div>';
        if (j.proof && j.proof.review === 'Sent back' && j.status === 'On site') body += '<div class="fs-alert bad">' + IC.undo + '<span><b>Rework requested by dispatch</b>' + esc(j.proof.backNote || '') + '</span></div>';
        if (j.note) body += '<div class="fs-alert">' + IC.note + '<span><b>Note from dispatch</b>' + esc(j.note) + '</span></div>';
        if (j.status === 'On site') {
          var rows = [
            ['checkin', IC.pin, 'Check-in', w.pos ? hm(w.checkinAt) + ' · ' + fmtDist(distM(j.geo, w.pos)) + ' from address' : 'Not checked in', ev.checks[0].state],
            [w.photos.length ? 'gallery' : 'camera', IC.cam, 'Photos', w.photos.length + ' of ' + j.minPhotos + ' required', ev.checks[1].state],
            ['checklist', IC.list, 'Checklist', j.items.filter(function (x, i) { return w.checks[i]; }).length + ' of ' + j.items.length + ' ticked', ev.checks[2].state],
            ['notes', IC.note, 'Notes', w.notes ? w.notes.slice(0, 34) + (w.notes.length > 34 ? '…' : '') : (w.followUp ? 'Follow-up needed' : 'Optional'), w.notes || w.followUp ? 'pass' : 'opt'],
            ['sign', IC.sign, 'Signature', w.sig ? 'Signed by ' + w.signer : w.noSig ? 'Customer not available' : 'Not signed yet', ev.checks[3].state]
          ];
          body += '<h5 class="fs-h5">On-site tasks</h5><div class="fs-tasks">' + rows.map(function (r) { return btn('nav', r[0], '<span class="fs-ti">' + r[1] + '</span><span><b>' + r[2] + '</b><small>' + esc(r[3]) + '</small></span><span class="fs-ts c-' + r[4] + '" aria-label="' + (r[4] === 'opt' ? 'optional' : stWord(r[4])) + '">' + (r[4] === 'opt' ? '' : stIcon(r[4])) + '</span>', 'fs-task'); }).join('') + '</div>';
          foot = btn('nav', 'complete', 'Review &amp; complete', 'btn btn-ink fs-wide');
        } else if (j.status === 'Completed') {
          body += '<h5 class="fs-h5">Proof · ' + esc(j.proof.id) + '</h5><div class="fs-card">' + overallPill(j.proof.overall) + ' <span class="fs-muted">Review: ' + esc(j.proof.review) + '</span>' + checksHTML({ checks: j.proof.checks }, { compact: true }) + '</div>';
          foot = btn('doc', j.proof.docId, IC.doc + 'Open proof PDF', 'btn btn-ghost fs-wide');
        } else if (j.status === 'En route') {
          foot = btn('nav', 'route', IC.route + 'Continue route', 'btn btn-ink fs-wide');
        } else {
          body += '<h5 class="fs-h5">Checklist on site</h5><ul class="fs-ul">' + j.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
            '<p class="fs-muted">Proof needs: check-in within ' + LIMIT_M + ' m, ' + j.minPhotos + ' photo' + (j.minPhotos > 1 ? 's' : '') + ', all items ticked, signature.</p>';
          foot = busy && busy.id !== j.id ? '<p class="fs-muted fs-c">Finish ' + busy.id + ' first.</p>' + btn('start', j.id, 'Start route', 'btn btn-ink fs-wide', ' disabled') : btn('start', j.id, IC.route + 'Start route', 'btn btn-ink fs-wide');
        }
        var ds = docsOf(j);
        body += '<h5 class="fs-h5">Documents</h5><div class="fs-list">' + ds.map(function (d) { return btn('doc', d.id, '<span class="fs-di t-' + d.type + '">' + (d.type === 'jpg' ? IC.img : IC.doc) + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + '</small></span>' + IC.chev, 'fs-row'); }).join('') + '</div>';
        return { title: j.id, back: 'today', backLabel: 'Today', body: body, foot: foot };
      },
      route: function (j) {
        var w = wk('w1'), r = w.route, pts = r ? r.pts : [{ x: w.x, y: w.y }, { x: j.x, y: j.y }];
        var xs = pts.map(function (p) { return p.x; }).concat(j.x), ys = pts.map(function (p) { return p.y; }).concat(j.y);
        var x0 = Math.min.apply(0, xs) - 7, x1 = Math.max.apply(0, xs) + 7, y0 = Math.min.apply(0, ys) - 9, y1 = Math.max.apply(0, ys) + 6;
        var wd = Math.max(x1 - x0, (y1 - y0) * 1.1), ht = Math.max(y1 - y0, wd / 1.1);
        var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        var vb = (cx - wd / 2).toFixed(1) + ' ' + (cy - ht / 2).toFixed(1) + ' ' + wd.toFixed(1) + ' ' + ht.toFixed(1);
        var left = r ? routeLen(r) * (1 - r.t) * UNIT : 0;
        var body = '<svg class="fs-rmap" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Route map from your position to ' + esc(j.addr) + '">' + mapBase() + routeSVG(w) + pinSVG(j, true) + workerSVG(w) + '</svg>' +
          '<div class="fs-eta" role="status">' + (j.status === 'Assigned' ? '<b>Route preview</b><small>' + fmtDist(routeLen({ pts: pts }) * UNIT) + ' · start the route to share your ETA</small>' : j.arrived ? '<b>You have arrived</b><small>' + esc(j.addr) + ' · check in to start the job</small>'
            : '<b class="fs-eta-m">' + Math.max(1, Math.round(left / 450)) + ' min</b><small class="fs-eta-d">' + fmtDist(left) + ' · ' + esc(j.addr) + '</small>') + '</div>' +
          '<p class="fs-muted">Live position is simulated. The customer gets an arrival message with your ETA (simulated, not sent).</p>';
        var foot = j.arrived ? btn('nav', 'checkin', IC.pin + 'Check in', 'btn btn-ink fs-wide') : j.status === 'Assigned' ? btn('start', j.id, IC.route + 'Start route', 'btn btn-ink fs-wide', activeMine() ? ' disabled' : '') : btn('skip', j.id, 'Skip the drive', 'btn btn-ghost fs-wide');
        return { title: 'Route', back: 'job', backLabel: j.id, body: body, foot: foot };
      },
      checkin: function (j) {
        var p = ph.draft, R = 150, inner = '';
        if (p && p.dx != null) R = Math.min(700, Math.max(150, Math.hypot(p.dx, p.dn) + Math.max(p.acc, 30) + 30));
        var d = p ? distM(j.geo, p) : null, okD = d != null && d <= LIMIT_M, okA = p && p.acc <= ACC_M;
        var g = '<rect x="' + (-R) + '" y="' + (-R) + '" width="' + 2 * R + '" height="' + 2 * R + '" class="fs-m-bg"/>' +
          '<g class="fs-l-blocks">' + [[-130, -120, 90, 70], [-20, -120, 70, 70], [80, -120, 100, 70], [-130, 30, 90, 80], [-20, 30, 120, 80], [130, 30, 80, 80], [-260, -60, 100, 60], [200, -60, 120, 60], [-260, 140, 200, 90], [60, 140, 220, 90], [-60, -300, 160, 140], [-300, -300, 200, 140], [140, -300, 200, 140]].map(function (b) { return '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="6"/>'; }).join('') + '</g>' +
          '<g class="fs-l-road"><path d="M-800 12H800M-800 -150H800M-800 125H800M-30 -800V800M-150 -800V800M115 -800V800"/></g>' +
          '<circle class="fs-thr" r="' + LIMIT_M + '"/><g class="fs-home-pin"><path d="M0 0C-9 -11 -13 -17 -13 -23a13 13 0 0 1 26 0C13 -17 9 -11 0 0Z"/><path class="fs-hp-i" d="M-6 -21l6-5 6 5v7h-12z"/></g>';
        if (p && p.dx != null) inner = '<circle class="fs-acc" cx="' + p.dx + '" cy="' + (-p.dn) + '" r="' + p.acc + '"/><circle class="fs-me" cx="' + p.dx + '" cy="' + (-p.dn) + '" r="' + (R / 30) + '"/>';
        var read = !p ? '<b>No position yet</b><small>Get a simulated GPS fix, tap the map, or use your device location.</small>'
          : '<b class="' + (okD && okA ? 'ok' : 'bad') + '">' + (okD && okA ? IC.check : IC.warn) + fmtDist(d) + ' from the job address</b><small>Limit ' + LIMIT_M + ' m · GPS accuracy ±' + p.acc + ' m (limit ±' + ACC_M + ' m)' + '</small>' +
            '<small class="fs-src">' + IC.gps + esc(p.src) + ' · ' + fmtGeo(p) + '</small>' +
            (!okD ? '<small class="bad">Outside the ' + LIMIT_M + ' m radius. You can still check in, but the proof will go to the office as Needs review.</small>' : !okA ? '<small class="bad">GPS accuracy is too low. Move to open sky or check in anyway (Needs review).</small>' : '') +
            (p.dx == null ? '<small>Your real location is compared with the fictional sample address, so it is far away.</small>' : '');
        var body = '<svg class="fs-cmap" viewBox="' + (-R) + ' ' + (-R) + ' ' + 2 * R + ' ' + 2 * R + '" role="img" aria-label="Map around the job address. Tap to place the simulated GPS position.">' + g + inner + '</svg>' +
          '<p class="fs-maplbl"><span><i class="k-job"></i>Job address</span><span><i class="k-thr"></i>' + LIMIT_M + ' m radius</span><span><i class="k-me"></i>Simulated GPS position</span></p>' +
          '<div class="fs-read" role="status" aria-live="polite">' + read + '</div>' +
          '<div class="fs-sims">' + btn('gps', 'near', IC.gps + 'Get GPS fix (simulated)', 'fs-pill-b') + btn('gps', 'far', 'Wrong street (~230 m)', 'fs-pill-b') + btn('gps', 'weak', 'Weak signal (±65 m)', 'fs-pill-b') + btn('gps', 'device', ph.geoBusy ? 'Locating…' : 'Use device location', 'fs-pill-b') + '</div>';
        return { title: 'Check in', back: 'job', backLabel: j.id, body: body, foot: btn('docheckin', j.id, 'Check in here', 'btn btn-ink fs-wide', p ? '' : ' disabled') };
      },
      camera: function (j) {
        var w = j.work, last = w.photos[w.photos.length - 1];
        var body = '<div class="fs-vf"><img src="' + SDA.art(ph.kind, '') + '" alt="Simulated camera preview: ' + artName(ph.kind) + '"><span class="fs-vf-g" aria-hidden="true"></span><span class="fs-vf-tag">Simulated camera · ' + artName(ph.kind) + '</span><span class="fs-flash" aria-hidden="true"></span></div>' +
          '<div class="fs-kinds" role="radiogroup" aria-label="What to photograph">' + ART.map(function (a) { return '<button type="button" role="radio" aria-checked="' + (ph.kind === a[0]) + '" data-a="kind" data-v="' + a[0] + '" data-k="kind:' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>' +
          '<div class="fs-shoot">' + (last ? btn('nav', 'gallery', '<img src="' + last.url + '" alt="">' + '<i>' + w.photos.length + '</i>', 'fs-last', ' aria-label="Open gallery, ' + w.photos.length + ' photos"') : '<span class="fs-last empty"></span>') +
          btn('shoot', j.id, '<span></span>', 'fs-shutter', ' aria-label="Take photo"') +
          '<label class="fs-devcam" title="Use a real photo from this device">' + IC.img + '<span>Device</span><input type="file" accept="image/*" capture="environment" data-a="devphoto"></label></div>' +
          '<p class="fs-muted fs-c">' + w.photos.length + ' of ' + j.minPhotos + ' required. Device photos stay in your browser.</p>';
        return { title: 'Camera', dark: true, back: 'job', backLabel: j.id, body: body, foot: btn('nav', 'gallery', 'Done · view ' + w.photos.length + ' photo' + (w.photos.length === 1 ? '' : 's'), 'btn btn-ink fs-wide', w.photos.length ? '' : ' disabled') };
      },
      gallery: function (j) {
        var w = j.work;
        var body = w.photos.length ? '<div class="fs-grid">' + w.photos.map(function (p, i) { return btn('view', i, '<img src="' + p.url + '" alt="">' + (p.kind === 'damage' ? '<i class="fs-dmg">Damage</i>' : ''), 'fs-th', ' aria-label="Open photo ' + (i + 1) + ': ' + esc(p.name) + ' full screen"'); }).join('') + '</div><p class="fs-muted">Tap a photo to open it full screen. Swipe or use the arrows to browse.</p>'
          : '<p class="fs-empty">No photos yet.</p>';
        return { title: 'Photos (' + w.photos.length + ')', back: 'job', backLabel: j.id, right: btn('nav', 'camera', IC.plus, 'fs-ib', ' aria-label="Take more photos"'), body: body, foot: btn('nav', 'camera', IC.cam + 'Take more photos', 'btn btn-ghost fs-wide') };
      },
      checklist: function (j) {
        var w = j.work, n = j.items.filter(function (x, i) { return w.checks[i]; }).length;
        var body = '<p class="fs-muted fs-cl-n" role="status">' + n + ' of ' + j.items.length + ' ticked. Every item is required for a verified proof.</p><fieldset class="fs-cl"><legend class="fs-sr">Checklist for ' + esc(j.id) + '</legend>' + j.items.map(function (it, i) {
          return '<label class="fs-cli"><input type="checkbox" data-a="tick" data-v="' + i + '"' + (w.checks[i] ? ' checked' : '') + '><span class="fs-box" aria-hidden="true">' + IC.check + '</span><span>' + esc(it) + '</span></label>';
        }).join('') + '</fieldset>';
        return { title: 'Checklist', back: 'job', backLabel: j.id, body: body, foot: btn('nav', 'job', 'Done', 'btn btn-ink fs-wide') };
      },
      notes: function (j) {
        var w = j.work;
        var body = '<label class="fs-lbl" for="fs-note">Notes for the office</label><textarea id="fs-note" data-a="note" rows="5" placeholder="Anything dispatch or the customer should know">' + esc(w.notes) + '</textarea>' +
          '<div class="fs-chips">' + ['Left at reception', 'Customer was briefed', 'Access was difficult', 'Parts missing'].map(function (c) { return btn('qnote', c, esc(c), 'fs-pill-b'); }).join('') + '</div>' +
          '<label class="fs-tog"><input type="checkbox" data-a="follow"' + (w.followUp ? ' checked' : '') + '><span><b>Follow-up visit needed</b><small>Counts against the first-time-fix rate</small></span></label>';
        return { title: 'Notes', back: 'job', backLabel: j.id, body: body, foot: btn('nav', 'job', 'Save notes', 'btn btn-ink fs-wide') };
      },
      sign: function (j) {
        var w = j.work;
        var body = (w.sig ? '<div class="fs-sigsaved"><img src="' + w.sig + '" alt="Saved signature of ' + esc(w.signer) + '"><small>Signed by <b>' + esc(w.signer) + '</b></small></div>' + btn('resign', j.id, 'Sign again', 'fs-pill-b')
          : '<label class="fs-lbl" for="fs-signer">Name of the person signing</label><input id="fs-signer" autocomplete="off" placeholder="e.g. ' + esc(j.contact) + '" value="' + esc(w.signer || '') + '"' + (w.noSig ? ' disabled' : '') + '>' +
            '<div class="fs-sigpad' + (w.noSig ? ' off' : '') + '"><canvas aria-label="Signature pad. Draw with mouse, finger or pen, or use the typed signature button."></canvas><span class="fs-sigline" aria-hidden="true">Sign here</span></div>' +
            '<div class="fs-sigacts">' + btn('sigclear', j.id, 'Clear', 'fs-pill-b') + btn('sigtype', j.id, 'Use typed signature', 'fs-pill-b') + '</div>' +
            '<p class="fs-msg-l" role="status" aria-live="polite"></p>') +
          '<label class="fs-tog"><input type="checkbox" data-a="nosig"' + (w.noSig ? ' checked' : '') + '><span><b>Customer not available</b><small>No signature. The proof will need review.</small></span></label>';
        return { title: 'Signature', back: 'job', backLabel: j.id, body: body, foot: w.sig || w.noSig ? btn('nav', 'job', 'Done', 'btn btn-ink fs-wide') : btn('sigsave', j.id, 'Save signature', 'btn btn-ink fs-wide') };
      },
      complete: function (j) {
        var ev = evaluate(j, true);
        var body = '<div class="fs-card"><div class="fs-ov">' + overallPill(ev.overall) + '<small>' + (ev.overall === 'Verified' ? 'All four checks pass.' : ev.reasons.length + ' check' + (ev.reasons.length > 1 ? 's' : '') + ' failed. The office will see the reasons below.') + '</small></div>' + checksHTML(ev) + '</div>' +
          '<p class="fs-muted">Checks are computed from this job: distance between the check-in position and the job address, GPS accuracy, number of photos, ticked items and the signature.</p>';
        return { title: 'Review & complete', back: 'job', backLabel: j.id, body: body, foot: btn('finish', j.id, ev.overall === 'Verified' ? 'Complete job' : 'Complete anyway · needs review', 'btn btn-ink fs-wide') };
      },
      done: function (j) {
        var p = j.proof, ok = p.overall === 'Verified';
        var body = '<div class="fs-done"><span class="fs-done-i ' + (ok ? 'ok' : 'bad') + '">' + (ok ? IC.check : IC.warn) + '</span><h4>' + esc(j.id) + ' completed</h4><p>' + (ok ? 'Proof verified and sent to the office for approval.' : 'Proof sent to the office as <b>Needs review</b>.') + '</p></div>' +
          (ok ? '' : '<ul class="fs-reasons">' + p.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul>') +
          btn('doc', p.docId, '<span class="fs-di t-pdf">' + IC.doc + '</span><span><b>Proof of ' + TYPES[j.type].word + ' ' + esc(j.id) + '.pdf</b><small>Generated just now · ' + esc(p.id) + '</small></span>' + IC.chev, 'fs-row');
        return { title: 'Completed', body: body, foot: btn('tab', 'today', 'Back to today', 'btn btn-ink fs-wide') };
      }
    };
    IC.user2 = I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>');

    /* photo viewer (phone overlay + office modal) */
    function viewer(el, list, i, opts) {
      var sx = null, dx = 0;
      function paint() {
        var p = list[i]; if (!p) return;
        var a = document.activeElement, k = a && el.contains(a) && a.getAttribute('data-vw');
        el.innerHTML = '<div class="fs-vw-top">' + '<button type="button" data-vw="close">Done</button><span aria-live="polite">' + (i + 1) + ' / ' + list.length + '</span>' + (opts.del ? '<button type="button" data-vw="del" aria-label="Delete this photo">' + IC.trash + '</button>' : '<span></span>') + '</div>' +
          '<div class="fs-vw-img"><img src="' + p.url + '" alt="Photo ' + (i + 1) + ' of ' + list.length + ': ' + esc(p.name) + '" draggable="false"></div>' +
          '<button type="button" class="fs-vw-nav prev" data-vw="prev" aria-label="Previous photo"' + (i === 0 ? ' disabled' : '') + '>' + IC.left + '</button><button type="button" class="fs-vw-nav next" data-vw="next" aria-label="Next photo"' + (i === list.length - 1 ? ' disabled' : '') + '>' + IC.right + '</button>' +
          '<div class="fs-vw-cap"><b>' + esc(p.name) + '</b><small>' + hm(p.t) + ' · ' + esc(p.origin) + (opts.job ? ' · ' + esc(opts.job) : '') + '</small><span class="fs-dots">' + list.map(function (x, n) { return '<i' + (n === i ? ' class="on"' : '') + '></i>'; }).join('') + '</span></div>';
        var t = k && el.querySelector('[data-vw="' + k + '"]:not([disabled])'); if (t) t.focus(); else if (k) { var c = el.querySelector('[data-vw="close"]'); c && c.focus(); }
      }
      function step(n) { var ni = i + n; if (ni < 0 || ni >= list.length) return; i = ni; paint(); }
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-vw]'); if (!b) return; e.stopPropagation();
        var a = b.getAttribute('data-vw');
        if (a === 'close') opts.close();
        if (a === 'prev') step(-1);
        if (a === 'next') step(1);
        if (a === 'del') { list.splice(i, 1); opts.onDelete && opts.onDelete(); if (!list.length) { opts.close(); return; } i = Math.min(i, list.length - 1); paint(); }
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
        if (e.key === 'Escape' && opts.esc !== false) { opts.close(); e.stopPropagation(); }
      });
      el.addEventListener('pointerdown', function (e) { if (!e.target.closest('.fs-vw-img')) return; sx = e.clientX; dx = 0; });
      el.addEventListener('pointermove', function (e) { if (sx == null) return; dx = e.clientX - sx; var im = el.querySelector('.fs-vw-img img'); if (im) im.style.transform = 'translateX(' + dx + 'px)'; });
      var end = function () { if (sx == null) return; sx = null; var im = el.querySelector('.fs-vw-img img'); if (im) im.style.transform = ''; if (dx < -45) step(1); else if (dx > 45) step(-1); dx = 0; };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('pointerleave', end);
      paint();
      var c = el.querySelector('[data-vw="close"]'); c && c.focus();
    }
    function openPhoneViewer(i) {
      var j = cur(), host = q('.fs-screen'); if (!j || !host) return;
      var v = document.createElement('div'); v.className = 'fs-viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true'); v.setAttribute('aria-label', 'Photo viewer');
      host.appendChild(v);
      var opener = document.activeElement;
      viewer(v, j.work.photos, i, { del: true, job: j.id, onDelete: function () { refresh(); }, close: function () {
        v.classList.add('closing'); ctx.later(200, function () { v.remove(); }); paintPhone('none');
        var f = (opener && document.contains(opener) && opener) || q('.fs-stage .fs-th') || q('.fs-stage .fs-pg'); if (f) try { f.focus({ preventScroll: true }); } catch (e) {} } });
      ph.gotViewer = true; checkPhotoStep();
    }
    function checkPhotoStep() { var j = cur(); if (ph.gotViewer && j && j.work.photos.length >= 2) guide.done('photos'); }

    /* signature pad */
    function initSig() {
      var c = q('.fs-sigpad canvas'); if (!c) return;
      var b = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      c.width = Math.max(10, Math.round(b.width * dpr)); c.height = Math.max(10, Math.round(b.height * dpr));
      var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.lineWidth = 2.6; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#14212A'; g.fillStyle = '#14212A';
      ph.sigPts = 0; ph.typed = false; var down = false, last = null;
      var pt = function (e) { var r = c.getBoundingClientRect(), s = e.touches ? e.touches[0] : e; return { x: s.clientX - r.left, y: s.clientY - r.top }; };
      var start = function (e) { if (c.closest('.off')) return; e.preventDefault(); down = true; last = pt(e); g.beginPath(); g.arc(last.x, last.y, 1.3, 0, 7); g.fill(); ph.sigPts++; c.parentNode.classList.add('inked'); };
      var move = function (e) { if (!down) return; e.preventDefault(); var p = pt(e); g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p; ph.sigPts++; };
      var end = function () { down = false; };
      if (window.PointerEvent) {
        c.addEventListener('pointerdown', function (e) { try { c.setPointerCapture(e.pointerId); } catch (x) {} start(e); });
        c.addEventListener('pointermove', move); c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      } else {
        c.addEventListener('mousedown', start); c.addEventListener('mousemove', move); c.addEventListener('mouseup', end); c.addEventListener('mouseleave', end);
        c.addEventListener('touchstart', start, { passive: false }); c.addEventListener('touchmove', move, { passive: false }); c.addEventListener('touchend', end);
      }
    }
    function typedSig(name) {
      var c = q('.fs-sigpad canvas'); if (!c) return;
      var g = c.getContext('2d'), w = c.width / (window.devicePixelRatio || 1), h = c.height / (window.devicePixelRatio || 1);
      g.clearRect(0, 0, w, h); g.font = 'italic 600 30px "Brush Script MT", "Segoe Script", "Snell Roundhand", cursive'; g.textBaseline = 'middle';
      g.fillText(name, 18, h / 2); ph.sigPts = 99; ph.typed = true; c.parentNode.classList.add('inked');
    }

    /* downscale a real photo from the device so it stays light in memory */
    function readPhoto(file, cb) {
      var fr = new FileReader();
      fr.onload = function () {
        var im = new Image();
        im.onload = function () {
          var s = Math.min(1, 1280 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
          cv.width = Math.round(im.width * s); cv.height = Math.round(im.height * s); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
          try { cb(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(fr.result); }
        };
        im.onerror = function () { cb(null); };
        im.src = fr.result;
      };
      fr.onerror = function () { cb(null); };
      fr.readAsDataURL(file);
    }

    /* live panel next to the phone */
    function paintSync() {
      var el = q('.fs-sync'); if (!el) return;
      var j = (cur() && cur().worker === 'w1' && cur()) || activeMine() || job('J-4810');
      if (!j || j.worker !== 'w1') j = mine().filter(function (x) { return x.status !== 'Completed'; })[0] || mine()[0];
      var ev = j ? (j.status === 'Completed' ? { checks: j.proof.checks, overall: j.proof.overall } : evaluate(j, false)) : null;
      var feed = events.filter(function (e) { return e.wid === 'w1' || e.who === 'Daniel Clark'; }).slice(0, 6);
      el.innerHTML = '<div class="fs-sync-h"><span class="fs-live" aria-hidden="true"></span><span><b>Live in the office</b><small>What dispatch (Emma Davis) sees right now. Switch to Office to act on it.</small></span></div>' +
        (j ? '<div class="fs-sync-job"><span class="fs-chip t-' + j.type.toLowerCase() + '">' + j.type + '</span><b>' + esc(j.id) + ' · ' + esc(j.title) + '</b><small>' + esc(j.cust) + ' · ' + win(j) + '</small>' + stPill(j) + '</div>' +
          '<h4 class="fs-h4">Proof checks <small>computed live</small></h4>' + checksHTML(ev) +
          '<p class="fs-verdict">' + (ev.overall === 'Verified' ? overallPill('Verified') + ' all four checks pass' : ev.overall === 'Needs review' ? overallPill('Needs review') + ' the office will see why' : overallPill('In progress') + ' Verified only if all four pass') + '</p>' : '') +
        '<h4 class="fs-h4">Sync log</h4><ol class="fs-feed">' + (feed.length ? feed.map(feedItem).join('') : '<li class="fs-muted">Nothing yet.</li>') + '</ol>' +
        '<p class="fs-muted fs-small">Rules: check-in within ' + LIMIT_M + ' m of the address with GPS accuracy ±' + ACC_M + ' m or better, required photos, all checklist items and a signed name.</p>';
    }
    function feedItem(e) { var w = W.filter(function (x) { return x.name === e.who; })[0]; return '<li class="k-' + e.kind + '"><span class="fs-fav">' + (w ? w.ini : e.who === 'Emma Davis' ? 'ED' : '·') + '</span><span><b>' + esc(e.text) + '</b><small>' + hm(e.t) + ' · ' + esc(e.who) + '</small></span></li>'; }

    function renderTech() {
      view.innerHTML = '<div class="fs-tech"><div class="fs-phone-col">' + phoneShell() + '<p class="fs-cap">' + IC.phone + 'Daniel\'s phone · tap through it like the real app</p></div><aside class="fs-sync" aria-live="polite"></aside></div>';
      paintPhone(null); paintSync();
    }

    /* ================= OFFICE (dispatch) ================= */
    var off = { sel: 'J-4808', f: 'all', q: '', w: 'all', notes: {} };
    var FILTERS = [['all', 'All'], ['un', 'Unassigned'], ['active', 'In progress'], ['nr', 'Needs review'], ['done', 'Done']];
    function inFilter(j) {
      var k = stKey(j);
      if (off.f === 'un' && k !== 'un') return false;
      if (off.f === 'active' && !/as|er|os/.test(k)) return false;
      if (off.f === 'nr' && !(k === 'nr' || k === 'vf')) return false;
      if (off.f === 'done' && j.status !== 'Completed') return false;
      if (off.w !== 'all' && (j.worker || 'none') !== off.w) return false;
      var s = off.q.toLowerCase(); return !s || (j.id + ' ' + j.title + ' ' + j.cust + ' ' + j.addr + ' ' + wname(j.worker)).toLowerCase().indexOf(s) > -1;
    }
    function renderOffice() {
      view.innerHTML = '<div class="fs-off"><div class="fs-kpis"></div><div class="fs-off-g"><div class="fs-colL">' +
        '<section class="fs-panel fs-mapp" aria-label="Live map"><div class="fs-ph"><b>Live map</b><small>Status and van positions update in real time (simulated GPS)</small></div><svg class="fs-omap" viewBox="0 0 100 64" role="group" aria-label="Map of today\'s jobs and vans"></svg>' +
        '<p class="fs-legend">' + ['un', 'as', 'er', 'os', 'vf', 'nr', 'ok'].map(function (k) { return '<span><i class="s-' + k + '"></i>' + ST_LABEL[k] + '</span>'; }).join('') + '<span><i class="wk"></i>Van</span></p></section>' +
        '<section class="fs-panel fs-detail" aria-label="Job details" aria-live="polite"></section></div><div class="fs-colR">' +
        '<section class="fs-panel fs-listp" aria-label="Dispatch board"><div class="fs-ph"><b>Dispatch board</b>' + btn('newjob', null, IC.plus + 'New job', 'btn btn-ink btn-sm') + '</div>' +
        '<div class="fs-tools"><label class="fs-srch">' + SDA.icon.search + '<input type="search" data-a="oq" placeholder="Search jobs, customers" aria-label="Search jobs" value="' + esc(off.q) + '"></label>' +
        '<label class="fs-sel"><span class="fs-sr">Technician</span><select data-a="ow" aria-label="Filter by technician"><option value="all">All technicians</option>' + W.map(function (w) { return '<option value="' + w.id + '"' + (off.w === w.id ? ' selected' : '') + '>' + w.name + '</option>'; }).join('') + '<option value="none"' + (off.w === 'none' ? ' selected' : '') + '>Unassigned</option></select></label></div>' +
        '<div class="fs-fchips" role="group" aria-label="Status filter"></div><div class="fs-olist"></div></section>' +
        '<section class="fs-panel fs-feedp" aria-label="Live activity"><div class="fs-ph"><b>Live activity</b><span class="fs-live" aria-hidden="true"></span></div><ol class="fs-feed"></ol></section>' +
        '</div></div></div>';
      paintOffice(true);
    }
    function paintOffice(all) {
      var k = q('.fs-kpis'); if (!k) return;
      var c = function (f) { return jobs.filter(f).length; };
      k.innerHTML = [['Unassigned', c(function (j) { return j.status === 'Unassigned'; }), 'warn'], ['En route', c(function (j) { return j.status === 'En route'; }), ''], ['On site', c(function (j) { return j.status === 'On site'; }), ''],
        ['Proofs to review', c(function (j) { return j.proof && j.status === 'Completed' && j.proof.review === 'Pending'; }), 'bad'], ['Completed', c(function (j) { return j.status === 'Completed'; }) + ' / ' + jobs.length, 'ok']]
        .map(function (x) { return '<div class="fs-k k-' + x[2] + '"><small>' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('');
      var svg = q('.fs-omap');
      svg.innerHTML = mapBase() + '<g class="fs-depot" transform="translate(6 56)"><rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="1"/><text y="5.8" text-anchor="middle">Depot</text></g>' + W.map(routeSVG).join('') +
        jobs.map(function (j) { return pinSVG(j, j.id === off.sel); }).join('') + W.map(workerSVG).join('');
      keepFocus(q('.fs-fchips'), function () {
        q('.fs-fchips').innerHTML = FILTERS.map(function (f) { var n = jobs.filter(function (j) { var s = off.f; off.f = f[0]; var r = inFilter(j); off.f = s; return r; }).length; return '<button type="button" data-a="of" data-v="' + f[0] + '" data-k="of:' + f[0] + '" aria-pressed="' + (off.f === f[0]) + '">' + f[1] + ' <i>' + n + '</i></button>'; }).join('');
      });
      paintList();
      q('.fs-feedp .fs-feed').innerHTML = events.slice(0, 9).map(feedItem).join('');
      paintDetail(all);
    }
    function paintList() {
      var L = jobs.filter(inFilter).sort(function (a, b) { return a.win[0] - b.win[0]; });
      keepFocus(q('.fs-olist'), function () {
        q('.fs-olist').innerHTML = L.length ? L.map(function (j) {
          var w = wk(j.worker);
          return '<button type="button" class="fs-orow k-' + stKey(j) + (j.id === off.sel ? ' sel' : '') + '" data-a="osel" data-v="' + j.id + '" data-k="osel:' + j.id + '" aria-pressed="' + (j.id === off.sel) + '"><span class="fs-bar" aria-hidden="true"></span>' +
            '<span class="fs-or-m"><b>' + esc(j.id) + ' · ' + esc(j.title) + '</b><small>' + esc(j.cust) + ' · ' + win(j) + '</small></span>' +
            '<span class="fs-or-w" title="' + esc(wname(j.worker)) + '">' + (w ? '<i>' + w.ini + '</i>' : '<i class="none">—</i>') + '</span>' + stPill(j) + '</button>';
        }).join('') : '<p class="fs-empty">No jobs match this filter.</p>';
      });
    }
    function paintDetail(force) {
      var el = q('.fs-detail'); if (!el) return;
      var j = job(off.sel);
      var sig = j ? [j.id, j.status, j.worker, j.log.length, j.proof ? j.proof.review + j.proof.sent + j.proof.ver : '', j.work.photos.length, JSON.stringify(j.work.checks), !!j.work.sig].join('|') : '';
      var busy = el.contains(document.activeElement) && /TEXTAREA|SELECT|INPUT/.test(document.activeElement.tagName);
      if (!force && (el._sig === sig || busy)) return;
      el._sig = sig;
      if (!j) { el.innerHTML = '<p class="fs-empty">Select a job on the map or the board.</p>'; return; }
      var w = j.work, canAssign = /Unassigned|Assigned|En route/.test(j.status), p = j.proof;
      var h = '<div class="fs-dh"><span class="fs-chip t-' + j.type.toLowerCase() + '">' + j.type + '</span><h3>' + esc(j.id) + ' · ' + esc(j.title) + '</h3>' + stPill(j) + '</div>' +
        '<dl class="fs-dl"><div><dt>Customer</dt><dd>' + esc(j.cust) + '</dd></div><div><dt>Address</dt><dd>' + esc(j.addr) + '</dd></div><div><dt>Contact</dt><dd>' + esc(j.contact) + ' · ' + j.tel + '</dd></div><div><dt>Window</dt><dd>' + win(j) + '</dd></div>' +
        '<div><dt>Technician</dt><dd>' + esc(wname(j.worker)) + '</dd></div><div><dt>Check-in</dt><dd>' + (w.checkinAt != null ? hm(w.checkinAt) + (w.pos ? ' · ' + fmtDist(distM(j.geo, w.pos)) + ' from address' : '') : '—') + '</dd></div></dl>' +
        '<div class="fs-assign"><label for="fs-asg">' + (j.worker ? 'Reassign to' : 'Assign to') + '</label><div class="fs-asg-r"><select id="fs-asg" data-k="asg"' + (canAssign ? '' : ' disabled') + '>' + (j.worker ? '' : '<option value="">Choose a technician</option>') + W.map(function (x) { var busy = jobs.filter(function (y) { return y.worker === x.id && y.status !== 'Completed'; }).length; return '<option value="' + x.id + '"' + (j.worker === x.id ? ' selected' : '') + '>' + x.name + ' · ' + busy + ' open</option>'; }).join('') + '</select>' +
        btn('assign', j.id, j.worker ? 'Reassign' : 'Assign', 'btn btn-ink btn-sm', canAssign ? '' : ' disabled') + '</div>' + (canAssign ? '' : '<small class="fs-muted">' + (j.status === 'Completed' ? 'Completed jobs cannot be reassigned.' : 'The technician is on site. Reassigning is locked until the job is completed.') + '</small>') + '</div>';
      if (p && j.status === 'Completed') {
        h += '<div class="fs-proof"><div class="fs-proof-h"><b>Proof of ' + TYPES[j.type].word + ' · ' + esc(p.id) + '</b>' + overallPill(p.overall) + '<span class="pill ' + (p.review === 'Approved' ? 'p-ok' : 'p-warn') + '">' + (p.review === 'Pending' ? 'Awaiting approval' : p.review) + '</span></div>' +
          (p.overall === 'Needs review' ? '<div class="fs-why"><b>' + IC.warn + 'Why it needs review</b><ul>' + p.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' : '') +
          checksHTML({ checks: p.checks }) +
          '<div class="fs-pgrid">' + p.snap.photos.map(function (x, i) { return btn('ophoto', j.id + '|' + i, '<img src="' + x.url + '" alt="">' + (x.kind === 'damage' ? '<i class="fs-dmg">Damage</i>' : ''), 'fs-th', ' aria-label="Open photo ' + (i + 1) + ' full screen"'); }).join('') + '</div>' +
          '<div class="fs-sigrow">' + (p.snap.sig ? '<img src="' + p.snap.sig + '" alt="Customer signature"><small>Signed by <b>' + esc(p.snap.signer) + '</b> · ' + hm(w.completedAt) + '</small>' : '<small class="bad">No signature</small>') + '</div>' +
          (w.notes || w.followUp ? '<p class="fs-note"><b>Notes:</b> ' + esc(w.notes || '—') + (w.followUp ? ' <span class="pill p-warn">Follow-up needed</span>' : '') + '</p>' : '') +
          '<p class="fs-src">' + IC.gps + (w.pos ? fmtGeo(w.pos) + ' ±' + w.pos.acc + ' m · ' + esc(w.pos.src) : 'No position') + '</p>';
        if (p.review === 'Pending') {
          h += '<label class="fs-lbl" for="fs-rnote">' + (p.overall === 'Needs review' ? 'Comment (required to approve a proof with failed checks, or to send it back)' : 'Comment (optional, required to send back)') + '</label><textarea id="fs-rnote" rows="2" data-k="rnote" placeholder="e.g. Called the customer, delivery confirmed by phone">' + esc(off.notes[j.id] || '') + '</textarea><p class="fs-err" role="status"></p>' +
            '<div class="fs-btns">' + btn('approve', j.id, IC.check + (p.overall === 'Needs review' ? 'Approve with comment' : 'Approve proof'), 'btn btn-ink btn-sm') + btn('sendback', j.id, IC.undo + 'Send back for rework', 'btn btn-ghost btn-sm') + btn('doc', p.docId, IC.doc + 'Open PDF', 'btn btn-ghost btn-sm') + '</div>';
        } else {
          h += '<div class="fs-btns">' + (p.sent != null ? '<span class="pill p-ok">Sent to customer at ' + hm(p.sent) + ' (simulated)</span>' : btn('sendcust', j.id, IC.send + 'Send proof to customer', 'btn btn-ink btn-sm')) + btn('doc', p.docId, IC.doc + 'Open PDF', 'btn btn-ghost btn-sm') + '</div>' + (p.approveNote ? '<p class="fs-muted">Approval comment: ' + esc(p.approveNote) + '</p>' : '');
        }
        h += '</div>';
      } else if (j.status === 'On site') {
        var ev = evaluate(j, false);
        h += '<div class="fs-proof"><div class="fs-proof-h"><b>Live proof checks</b>' + overallPill(ev.overall) + '</div>' + checksHTML(ev, { compact: true }) + '</div>';
      }
      h += '<div class="fs-cols"><div><h4 class="fs-h4">Timeline</h4><ol class="fs-tl">' + j.log.slice().reverse().slice(0, 7).map(function (e) { return '<li><b>' + hm(e.t) + '</b> ' + esc(e.text) + '<small>' + esc(e.who) + '</small></li>'; }).join('') + '</ol></div>' +
        '<div><h4 class="fs-h4">Documents</h4><div class="fs-list">' + docsOf(j).map(function (d) { return btn('doc', d.id, '<span class="fs-di t-' + d.type + '">' + (d.type === 'jpg' ? IC.img : IC.doc) + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.status) + '</small></span>', 'fs-row sm'); }).join('') + '</div></div></div>';
      keepFocus(el, function () { el.innerHTML = h; });
    }
    function selectJob(id, scroll) {
      off.sel = id; paintOffice(true);
      if (scroll) { var d = q('.fs-detail'); if (d && window.innerWidth < 1100 && d.scrollIntoView) d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    }
    function assign(j, wid) {
      if (!wid || wid === j.worker) { SDA.toast(root, wid ? 'Already assigned to ' + esc(wname(wid)) : 'Choose a technician first', 'warn'); return; }
      var old = j.worker, ow = wk(old);
      if (ow && ow.route && ow.route.job === j.id) ow.route = null;
      j.worker = wid; j.status = 'Assigned'; j.arrived = false; j.isNew = wid === 'w1';
      log(j, (old ? 'Reassigned from ' + wname(old) + ' to ' : 'Assigned to ') + wname(wid), 'Emma Davis', 'info');
      if (wid === 'w1') tell(j, 'New job ' + j.id + ': ' + j.title + ', ' + win(j) + '.');
      if (old === 'w1') tell(null, j.id + ' was reassigned to ' + wname(wid) + '. It is no longer on your list.');
      wk(wid).idle = 0;
      dms.render();
      SDA.toast(root, esc(j.id) + ' ' + (old ? 'reassigned' : 'assigned') + ' to ' + esc(wname(wid)) + '. Push message sent to the phone (simulated).');
      refresh();
    }
    function openSendModal(j) {
      var p = j.proof;
      var m = SDA.modal(root, { title: 'Send proof to customer', html:
        '<div class="fs-mail"><p class="fs-sim-note">' + IC.shield + 'Simulation: nothing is sent. In production this goes out by e-mail or SMS with a secure link.</p>' +
        '<dl><dt>To</dt><dd>' + esc(j.contact) + ' &lt;' + esc(j.email) + '&gt;</dd><dt>Subject</dt><dd>Proof of ' + TYPES[j.type].word + ' for ' + esc(j.id) + ' · ' + esc(j.cust) + '</dd></dl>' +
        '<div class="fs-mail-b">Hello ' + esc(j.contact.split(' ')[0]) + ',<br><br>your ' + TYPES[j.type].word + ' "' + esc(j.title) + '" at ' + esc(j.addr) + ' was completed today at ' + hm(j.work.completedAt) + ' by ' + esc(wname(j.worker)) + '.<br>Attached you find the proof of ' + TYPES[j.type].word + ' with photos and signature.<br><br>Kind regards,<br>Emma Davis · ' + CO + '</div>' +
        '<p class="fs-att">' + IC.doc + 'Proof of ' + TYPES[j.type].word + ' ' + esc(j.id) + '.pdf · ' + p.snap.photos.length + ' photo' + (p.snap.photos.length === 1 ? '' : 's') + '</p>' +
        '<div class="fs-btns">' + btn('dosend', j.id, IC.send + 'Send (simulated, not sent)', 'btn btn-ink btn-sm') + '<button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>' });
      m.el.classList.add('fs-modal');
    }
    function newJobModal() {
      var m = SDA.modal(root, { title: 'New job', html:
        '<form class="fs-form" novalidate><div class="fs-f2"><label>Type<select name="type">' + Object.keys(TYPES).map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select></label>' +
        '<label>Time window<select name="win">' + [[660, 720], [720, 780], [780, 840], [840, 900], [900, 960], [960, 1020]].map(function (x) { return '<option value="' + x[0] + '">' + hm(x[0]) + ' – ' + hm(x[1]) + '</option>'; }).join('') + '</select></label></div>' +
        '<label>Customer<input name="cust" placeholder="e.g. Greenfield Hardware" autocomplete="off"></label>' +
        '<div class="fs-f2"><label>Contact person<input name="contact" placeholder="e.g. Lisa Brown" autocomplete="off"></label><label>Address<select name="spot">' + SPOTS.map(function (s, i) { return '<option value="' + i + '">' + s.addr + '</option>'; }).join('') + '</select></label></div>' +
        '<label>Task<input name="title" placeholder="e.g. Deliver 3 pallets of cement" autocomplete="off"></label>' +
        '<label>Assign to<select name="worker"><option value="">Leave unassigned</option>' + W.map(function (w) { return '<option value="' + w.id + '">' + w.name + '</option>'; }).join('') + '</select></label>' +
        '<label>Note for the technician<input name="note" placeholder="Optional" autocomplete="off"></label><p class="fs-err" role="status"></p>' +
        '<div class="fs-btns"><button type="submit" class="btn btn-ink btn-sm">' + IC.plus + 'Create job + work order</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></form>' });
      m.el.classList.add('fs-modal');
      q('form', m.el).addEventListener('submit', function (e) {
        e.preventDefault(); var f = e.target, v = function (n) { return f.elements[n].value.trim(); };
        if (!v('cust')) { q('.fs-err', m.el).textContent = 'Enter the customer.'; f.elements.cust.setAttribute('aria-invalid', 'true'); f.elements.cust.focus(); return; }
        var t = v('type'), s = SPOTS[+v('spot')], w0 = +v('win');
        var j = mk({ id: 'J-' + (nJob++), type: t, title: v('title') || (t === 'Delivery' ? 'Delivery' : t) + ' for ' + v('cust'), cust: v('cust'), contact: v('contact') || 'Chris Walker', addr: s.addr, x: s.x, y: s.y, win: [w0, w0 + 60], worker: null, note: v('note') });
        jobs.push(j); log(j, 'Job ' + j.id + ' created', 'Emma Davis', 'info');
        dms.add(workOrder(j));
        m.close(); off.sel = j.id; off.f = 'all';
        if (v('worker')) assign(j, v('worker')); else { SDA.toast(root, 'Job ' + esc(j.id) + ' created with work order'); refresh(); }
      });
    }

    /* ================= MANAGER ================= */
    var acked = {}, mf = 'open';
    function exceptions() {
      var out = [];
      jobs.forEach(function (j) {
        var p = j.proof;
        if (p && j.status === 'Completed' && p.overall === 'Needs review' && p.review !== 'Approved') p.checks.forEach(function (c) { if (c.state === 'fail') out.push({ id: j.id + c.key, j: j, sev: 'bad', title: c.label + ' check failed', reason: c.reason }); });
        if (p && p.snap.photos.some(function (x) { return x.kind === 'damage'; })) out.push({ id: j.id + 'dmg', j: j, sev: 'warn', title: 'Damage photographed', reason: 'A photo is tagged as damage. Check with the customer.' });
        if (j.status === 'Completed' && j.work.followUp) out.push({ id: j.id + 'fu', j: j, sev: 'warn', title: 'Follow-up visit needed', reason: 'Not fixed on the first visit. ' + (j.work.notes || '') });
        if (p && p.review === 'Sent back' && j.status !== 'Completed') out.push({ id: j.id + 'sb' + p.ver, j: j, sev: 'warn', title: 'Sent back for rework', reason: p.backNote || '' });
        if (j.status === 'Unassigned') out.push({ id: j.id + 'un', j: j, sev: 'warn', title: 'Not assigned yet', reason: 'Window ' + win(j) + '. Dispatch needs to assign a technician.' });
        if (j.status !== 'Completed' && clock > j.win[1]) out.push({ id: j.id + 'late', j: j, sev: 'bad', title: 'Running late', reason: 'Window ended at ' + hm(j.win[1]) + ', status: ' + j.status + '.' });
      });
      return out;
    }
    function renderManager() {
      var done = jobs.filter(function (j) { return j.status === 'Completed'; });
      var svc = done.filter(function (j) { return j.type !== 'Delivery'; }), fixed = svc.filter(function (j) { return !j.work.followUp; });
      var ons = done.filter(function (j) { return j.work.checkinAt != null; }), avg = ons.length ? Math.round(ons.reduce(function (s, j) { return s + (j.work.completedAt - j.work.checkinAt); }, 0) / ons.length) : 0;
      var nr = jobs.filter(function (j) { return j.proof && j.status === 'Completed' && j.proof.overall === 'Needs review' && j.proof.review === 'Pending'; }).length;
      var ver = done.filter(function (j) { return j.proof.overall === 'Verified'; }).length;
      var ex = exceptions(), shown = ex.filter(function (e) { return mf === 'all' || (mf === 'open' ? !acked[e.id] : acked[e.id]); });
      var kpi = function (l, v, s) { return '<div class="kpi"><span>' + l + '</span><b>' + v + '</b><small>' + s + '</small></div>'; };
      var html = '<div class="fs-mgr"><div class="kpi-row">' +
        kpi('Jobs done today', done.length + ' / ' + jobs.length, Math.round(done.length / jobs.length * 100) + '% of planned jobs') +
        kpi('First-time-fix rate', svc.length ? Math.round(fixed.length / svc.length * 100) + '%' : '—', fixed.length + ' of ' + svc.length + ' service jobs, no follow-up') +
        kpi('Avg. time on site', ons.length ? avg + ' min' : '—', 'check-in to completion, ' + ons.length + ' jobs') +
        kpi('Proofs needing review', nr, ver + ' verified · ' + (done.length - ver) + ' flagged today') + '</div>' +
        '<div class="fs-mg"><section class="fs-panel"><div class="fs-ph"><b>Exceptions</b><span class="fs-fchips" role="group" aria-label="Exception filter">' + [['open', 'Open'], ['ack', 'Acknowledged'], ['all', 'All']].map(function (f) { return '<button type="button" data-a="mf" data-v="' + f[0] + '" data-k="mf:' + f[0] + '" aria-pressed="' + (mf === f[0]) + '">' + f[1] + ' <i>' + ex.filter(function (e) { return f[0] === 'all' || (f[0] === 'open' ? !acked[e.id] : acked[e.id]); }).length + '</i></button>'; }).join('') + '</span></div>' +
        '<ul class="fs-ex">' + (shown.length ? shown.map(function (e) {
          return '<li class="sev-' + e.sev + (acked[e.id] ? ' ack' : '') + '"><span class="fs-ex-i">' + (e.sev === 'bad' ? IC.warn : IC.clock) + '</span><span class="fs-ex-m"><b>' + esc(e.title) + '</b><small>' + esc(e.j.id) + ' · ' + esc(e.j.cust) + ' · ' + esc(wname(e.j.worker)) + '</small><p>' + esc(e.reason) + '</p></span>' +
            '<span class="fs-ex-a">' + btn('mjob', e.j.id, 'Details', 'btn btn-ghost btn-sm') + (acked[e.id] ? '<span class="pill p-ok">Acknowledged</span>' : btn('ack', e.id, 'Acknowledge', 'btn btn-ghost btn-sm')) + '</span></li>';
        }).join('') : '<li class="fs-empty">No exceptions in this view.</li>') + '</ul></section>' +
        '<section class="fs-panel"><div class="fs-ph"><b>By technician</b><small>today</small></div><div class="fs-bars">' + W.map(function (w) {
          var mineJ = jobs.filter(function (j) { return j.worker === w.id; }), d = mineJ.filter(function (j) { return j.status === 'Completed'; }).length, a = mineJ.filter(function (j) { return /En route|On site/.test(j.status); }).length, o = mineJ.length - d - a;
          var flagged = mineJ.filter(function (j) { return j.proof && j.proof.overall === 'Needs review' && j.status === 'Completed'; }).length;
          var tot = Math.max(4, mineJ.length);
          return '<div class="fs-bar-r"><span class="fs-bar-n"><i>' + w.ini + '</i><b>' + w.name + '</b><small>' + d + ' done · ' + a + ' active · ' + o + ' open' + (flagged ? ' · ' + flagged + ' flagged' : '') + '</small></span><span class="fs-bar-t" role="img" aria-label="' + d + ' done, ' + a + ' active, ' + o + ' open">' +
            '<i class="d" style="width:' + (d / tot * 100) + '%"></i><i class="a" style="width:' + (a / tot * 100) + '%"></i><i class="o" style="width:' + (o / tot * 100) + '%"></i></span></div>';
        }).join('') + '</div><p class="fs-legend"><span><i class="s-ok"></i>Done</span><span><i class="s-os"></i>Active</span><span><i class="s-un"></i>Open</span></p>' +
        '<div class="fs-ph" style="margin-top:14px"><b>Proof results</b></div><div class="fs-split"><span class="ok" style="flex:' + Math.max(ver, .001) + '">' + ver + ' verified</span><span class="bad" style="flex:' + Math.max(done.length - ver, .001) + '">' + (done.length - ver) + ' needs review</span></div>' +
        '<p class="fs-muted fs-small">Read only. Simulated clock: ' + hm(clock) + '.</p></section></div></div>';
      keepFocus(view, function () { view.innerHTML = html; });
    }
    function managerJob(j) {
      var p = j.proof;
      var m = SDA.modal(root, { title: j.id + ' · ' + j.title, wide: true, html: '<div class="fs-mj"><div><p>' + stPill(j) + ' <span class="fs-muted">' + esc(j.cust) + ' · ' + esc(j.addr) + ' · ' + esc(wname(j.worker)) + ' · ' + win(j) + '</span></p>' +
        (p && j.status === 'Completed' ? checksHTML({ checks: p.checks }) : j.status === 'On site' ? checksHTML(evaluate(j, false)) : '<p class="fs-muted">No proof yet.</p>') + '</div>' +
        '<div><h4 class="fs-h4">Documents</h4><div class="fs-list">' + docsOf(j).map(function (d) { return btn('doc', d.id, '<span class="fs-di t-' + d.type + '">' + (d.type === 'jpg' ? IC.img : IC.doc) + '</span><span><b>' + esc(d.name) + '</b><small>' + esc(d.status) + '</small></span>', 'fs-row sm'); }).join('') + '</div>' +
        '<h4 class="fs-h4">Timeline</h4><ol class="fs-tl">' + j.log.slice().reverse().map(function (e) { return '<li><b>' + hm(e.t) + '</b> ' + esc(e.text) + '<small>' + esc(e.who) + '</small></li>'; }).join('') + '</ol></div></div>' });
      m.el.classList.add('fs-modal');
    }

    /* ================= view switching + refresh ================= */
    var view = q('.fs-view');
    function renderView() {
      view.classList.remove('fs-in'); void view.offsetWidth; view.classList.add('fs-in');
      view.setAttribute('data-role', role);
      if (role === 'tech') renderTech(); else if (role === 'office') renderOffice(); else renderManager();
    }
    // keep every open view in sync after any change (phone, office, simulation)
    function refresh(fromTimer) {
      if (role === 'tech') { paintSync(); if (ph.screen === 'today' || ph.screen === 'inbox' || ph.screen === 'docs') paintPhone('none'); else paintTabs(); showPush(); }
      else if (role === 'office') paintOffice(!fromTimer);
      else renderManager();
    }

    /* ================= events ================= */
    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-a]'); if (!t || !root.contains(t) || t.disabled) return;
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return;
      var a = t.getAttribute('data-a'), v = t.getAttribute('data-v'), j = cur();
      switch (a) {
        case 'tab': go(v, null, 'none'); break;
        case 'open': { var oj = job(v); if (!oj || oj.worker !== 'w1') { SDA.toast(root, 'This job is no longer assigned to you', 'warn'); break; } oj.isNew = false; ph.draft = null; go('job', v, 'fwd'); paintSync(); break; }
        case 'nav': { var order = ['today', 'job', 'route', 'checkin', 'camera', 'gallery', 'checklist', 'notes', 'sign', 'complete', 'done'];
          if (v === 'checkin') ph.draft = j && j.work.pos ? Object.assign({}, j.work.pos) : null;
          go(v, null, order.indexOf(v) < order.indexOf(ph.screen) || (ph.screen !== 'job' && v === 'job') ? 'back' : 'fwd'); break; }
        case 'call': SDA.toast(root, 'Calling ' + esc(j.contact) + ' ' + j.tel + ' (simulated)'); break;
        case 'start': {
          var b = activeMine(); if (b && b.id !== j.id) break;
          startRoute(j); guide.done('start'); go('route', null, 'fwd'); refresh();
          SDA.toast(root, 'Route started. Office board updated, customer ETA message (simulated, not sent).'); break; }
        case 'skip': { var w1 = wk('w1'); if (w1.route) { w1.route.t = 1; moveTick(); } break; }
        case 'gps': {
          if (v === 'device') { deviceGps(j); break; }
          var dx, dn, acc;
          if (v === 'near') { var ang = Math.random() * 6.28, r = 6 + Math.random() * 16; dx = Math.round(Math.cos(ang) * r); dn = Math.round(Math.sin(ang) * r); acc = 5 + Math.round(Math.random() * 5); }
          if (v === 'far') { dx = 160; dn = -162; acc = 8; }
          if (v === 'weak') { dx = 18; dn = 12; acc = 65; }
          ph.draft = Object.assign(offsetGeo(j.geo, dx, dn), { dx: dx, dn: dn, acc: acc, src: 'Simulated GPS position' });
          paintPhone('none'); break; }
        case 'docheckin': {
          if (!ph.draft) break;
          j.work.pos = ph.draft; j.work.checkinAt = clock; j.status = 'On site'; j.arrived = false;
          var dd = distM(j.geo, j.work.pos);
          log(j, 'Daniel Clark checked in at ' + j.id + ' · ' + fmtDist(dd) + ' from address · ±' + j.work.pos.acc + ' m', 'Daniel Clark', dd <= LIMIT_M && j.work.pos.acc <= ACC_M ? 'info' : 'bad');
          go('camera', null, 'fwd'); refresh();
          SDA.toast(root, 'Checked in at ' + hm(clock) + '. Status "On site" is live in the office.'); break; }
        case 'kind': ph.kind = v; paintPhone('none'); break;
        case 'shoot': {
          var p = photo(ph.kind, j, clock); j.work.photos.push(p);
          var fl = q('.fs-flash'); if (fl && !reduce) { fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
          log(j, 'Photo ' + j.work.photos.length + ' (' + p.name + ') uploaded for ' + j.id, 'Daniel Clark', 'info');
          ctx.later(reduce ? 0 : 300, function () { if (ph.screen === 'camera') paintPhone('none'); });
          refresh(); checkPhotoStep(); break; }
        case 'view': openPhoneViewer(+v); break;
        case 'qnote': { var ta = q('#fs-note'); if (ta) { ta.value = (ta.value ? ta.value.replace(/\s*$/, '') + '. ' : '') + v; j.work.notes = ta.value; } paintSync(); break; }
        case 'sigclear': { var c = q('.fs-sigpad canvas'); if (c) { c.getContext('2d').clearRect(0, 0, c.width, c.height); c.parentNode.classList.remove('inked'); } ph.sigPts = 0; ph.typed = false; break; }
        case 'sigtype': { var nm = q('#fs-signer').value.trim(), ms = q('.fs-msg-l'); if (!nm) { ms.className = 'fs-msg-l bad'; ms.textContent = 'Enter the name first, then use the typed signature.'; q('#fs-signer').focus(); break; } typedSig(nm); ms.className = 'fs-msg-l'; ms.textContent = 'Typed signature added. Save it to continue.'; break; }
        case 'sigsave': {
          var nmi = q('#fs-signer'), msg = q('.fs-msg-l'), name = nmi.value.trim();
          if (!name) { msg.className = 'fs-msg-l bad'; msg.textContent = 'Enter the name of the person signing.'; nmi.setAttribute('aria-invalid', 'true'); nmi.focus(); break; }
          if (ph.sigPts < 8) { msg.className = 'fs-msg-l bad'; msg.textContent = 'Ask the customer to sign in the box (mouse, finger or pen).'; break; }
          j.work.sig = q('.fs-sigpad canvas').toDataURL('image/png'); j.work.signer = name; j.work.noSig = false;
          log(j, 'Signature by ' + name + ' captured for ' + j.id, 'Daniel Clark', 'info');
          if (j.items.every(function (x, i) { return j.work.checks[i]; })) guide.done('sign');
          paintPhone('none'); refresh(); SDA.toast(root, 'Signature saved'); break; }
        case 'resign': j.work.sig = null; j.work.signer = j.work.signer || ''; paintPhone('none'); refresh(); break;
        case 'finish': {
          completeJob(j); guide.done('complete');
          if (j.work.sig && j.items.every(function (x, i) { return j.work.checks[i]; })) guide.done('sign');
          off.sel = j.id; go('done', null, 'fwd'); refresh();
          SDA.toast(root, j.proof.overall === 'Verified' ? 'Job completed. Proof verified, PDF generated.' : 'Job completed. Proof flagged: Needs review.', j.proof.overall === 'Verified' ? '' : 'warn'); break; }
        case 'doc': if (v && docById(v)) dms.open(v); break;
        /* office */
        case 'osel': selectJob(v, true); break;
        case 'of': off.f = v; paintOffice(false); break;
        case 'newjob': newJobModal(); break;
        case 'assign': assign(job(v), q('#fs-asg').value); break;
        case 'approve': case 'sendback': {
          var oj2 = job(v), note = (q('#fs-rnote') && q('#fs-rnote').value.trim()) || '', er = q('.fs-detail .fs-err');
          if (a === 'approve' && oj2.proof.overall === 'Needs review' && !note) { er.textContent = 'Add a comment: why is this proof OK despite the failed checks?'; q('#fs-rnote').focus(); break; }
          if (a === 'sendback' && !note) { er.textContent = 'Add a comment so the technician knows what to fix.'; q('#fs-rnote').focus(); break; }
          if (a === 'approve') { approveProof(oj2, note); SDA.toast(root, 'Proof ' + esc(oj2.proof.id) + ' approved'); }
          else { sendBack(oj2, note); SDA.toast(root, esc(oj2.id) + ' sent back. Push message to ' + esc(wname(oj2.worker)) + ' (simulated)'); }
          break; }
        case 'sendcust': openSendModal(job(v)); break;
        case 'dosend': { var sj = job(v); sj.proof.sent = clock; log(sj, 'Proof for ' + sj.id + ' sent to ' + sj.contact + ' (simulated, not sent)', 'Emma Davis', 'ok'); var md = t.closest('.sda-modal'); if (md) md.querySelector('[data-close]').click(); SDA.toast(root, 'Proof sent to ' + esc(sj.email) + ' (simulated, not sent)'); refresh(); break; }
        case 'ophoto': { var pv = v.split('|'), pj = job(pv[0]), m = SDA.modal(root, { title: pj.id + ' · proof photos', wide: true, html: '<div class="fs-mv"></div>' }); m.el.classList.add('fs-modal'); viewer(q('.fs-mv', m.el), pj.proof.snap.photos, +pv[1], { del: false, job: pj.id, esc: false, close: m.close }); break; }
        /* manager */
        case 'mf': mf = v; renderManager(); break;
        case 'ack': acked[v] = true; renderManager(); SDA.toast(root, 'Exception acknowledged'); break;
        case 'mjob': managerJob(job(v)); break;
      }
    });
    root.addEventListener('keydown', function (e) {
      var t = e.target; if ((e.key === 'Enter' || e.key === ' ') && t.getAttribute && t.getAttribute('role') === 'button' && t.closest('svg')) { e.preventDefault(); selectJob(t.getAttribute('data-v'), true); }
    });
    root.addEventListener('click', function (e) { // map tap on the check-in screen
      var svg = e.target.closest('.fs-cmap'); if (!svg || ph.screen !== 'checkin') return;
      var j = cur(), r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      var x = vb.x + (e.clientX - r.left) / r.width * vb.width, y = vb.y + (e.clientY - r.top) / r.height * vb.height;
      var dx = Math.round(x), dn = Math.round(-y), acc = ph.draft && ph.draft.dx != null ? ph.draft.acc : 7;
      ph.draft = Object.assign(offsetGeo(j.geo, dx, dn), { dx: dx, dn: dn, acc: acc, src: 'Simulated GPS position' });
      paintPhone('none');
    });
    root.addEventListener('change', function (e) {
      var t = e.target, a = t.getAttribute('data-a'), j = cur();
      if (a === 'tick') {
        j.work.checks[+t.getAttribute('data-v')] = t.checked;
        var n = j.items.filter(function (x, i) { return j.work.checks[i]; }).length, el = q('.fs-cl-n'); if (el) el.textContent = n + ' of ' + j.items.length + ' ticked. Every item is required for a verified proof.';
        log(j, 'Checklist ' + n + '/' + j.items.length + ' on ' + j.id, 'Daniel Clark', 'info');
        if (n === j.items.length && j.work.sig) guide.done('sign');
        refresh();
      }
      if (a === 'follow') { j.work.followUp = t.checked; refresh(); }
      if (a === 'nosig') { j.work.noSig = t.checked; if (t.checked) { j.work.sig = null; } log(j, t.checked ? 'Customer not available for signature on ' + j.id : 'Signature required again on ' + j.id, 'Daniel Clark', t.checked ? 'bad' : 'info'); paintPhone('none'); refresh(); }
      if (a === 'devphoto' && t.files && t.files[0]) {
        var file = t.files[0];
        readPhoto(file, function (url) {
          if (!url) { SDA.toast(root, 'That file could not be read as an image', 'warn'); return; }
          j.work.photos.push({ id: SDA.uid('ph'), kind: 'device', name: 'Device photo', t: clock, origin: 'Device photo (stays in your browser)', url: url });
          log(j, 'Device photo uploaded for ' + j.id, 'Daniel Clark', 'info');
          if (ph.screen === 'camera') paintPhone('none'); refresh(); checkPhotoStep();
        });
      }
      if (a === 'ow') { off.w = t.value; paintOffice(false); }
    });
    root.addEventListener('input', function (e) {
      var t = e.target, a = t.getAttribute('data-a');
      if (a === 'note') { cur().work.notes = t.value; }
      if (a === 'oq') { off.q = t.value; paintList(); }
      if (t.id === 'fs-rnote') off.notes[off.sel] = t.value;
      if (t.id === 'fs-signer') t.removeAttribute('aria-invalid');
    });
    root.addEventListener('focusout', function (e) { if (e.target.getAttribute && e.target.getAttribute('data-a') === 'note') paintSync(); });

    function deviceGps(j) {
      var setMsg = function (txt) { var r = q('.fs-read'); if (r) r.innerHTML = '<b>Device location</b><small>' + txt + '</small>'; };
      if (!navigator.geolocation) { setMsg('Location is not available in this browser. Use the simulated GPS fix instead.'); return; }
      ph.geoBusy = true; setMsg('Asking your browser for the location…');
      navigator.geolocation.getCurrentPosition(function (p) {
        ph.geoBusy = false; if (ph.screen !== 'checkin') return;
        ph.draft = { lat: p.coords.latitude, lng: p.coords.longitude, acc: Math.round(p.coords.accuracy), src: 'Device location (real, not stored)' };
        paintPhone('none');
      }, function () { ph.geoBusy = false; setMsg('Location access was blocked or timed out. Use the simulated GPS fix or tap the map.'); }, { timeout: 8000, maximumAge: 60000 });
    }

    /* ================= timers: clock, van movement, other technicians ================= */
    function moveTick() {
      W.forEach(function (w) {
        if (!w.route) return;
        w.route.t = Math.min(1, w.route.t + 100 / w.route.dur);
        var p = routeAt(w.route, w.route.t); w.x = p.x; w.y = p.y;
        qa('[data-w="' + w.id + '"]').forEach(function (g) { g.setAttribute('transform', 'translate(' + w.x.toFixed(2) + ' ' + w.y.toFixed(2) + ')'); });
        if (w.id === 'w1') {
          var left = routeLen(w.route) * (1 - w.route.t) * UNIT, m = q('.fs-eta-m'), d = q('.fs-eta-d');
          if (m) m.textContent = Math.max(1, Math.round(left / 450)) + ' min';
          if (d) d.textContent = fmtDist(left) + ' · ' + job(w.route.job).addr;
        }
        if (w.route.t >= 1) arrive(w);
      });
    }
    ctx.every(100, moveTick);
    ctx.every(6000, function () {
      clock++;
      var tm = q('.fs-time'); if (tm) tm.textContent = hmShort(clock);
      if (role === 'manager' && clock % 5 === 0) renderManager();
    });
    // other technicians work through their jobs on their own (simulation)
    ctx.every(6000, function () {
      var changed = false;
      W.forEach(function (w) {
        if (w.id === 'w1' || w.route) return;
        var onsite = jobs.filter(function (j) { return j.worker === w.id && j.status === 'On site' && !(j.proof && j.proof.review === 'Sent back'); })[0];
        if (onsite) {
          onsite.simTicks = (onsite.simTicks || 0) + 1;
          if (onsite.simTicks >= 3) {
            var s = onsite.sim || {}, wkx = onsite.work, kinds = TYPES[onsite.type].art.slice(0, onsite.minPhotos);
            if (s.damage) kinds = kinds.concat('damage');
            kinds.forEach(function (k) { if (wkx.photos.length < kinds.length) wkx.photos.push(photo(k, onsite, clock - 2)); });
            onsite.items.forEach(function (it, i) { wkx.checks[i] = true; });
            if (s.noSig) { wkx.noSig = true; wkx.notes = 'Nobody at the reception, left the goods with the security guard.'; }
            else { wkx.signer = onsite.contact; wkx.sig = SDA.art('signature'); }
            if (s.followUp) { wkx.followUp = true; wkx.notes = 'Seal replaced, but the door frame is bent. Second visit with a welder needed.'; }
            if (s.damage) wkx.notes = 'One carton dented on arrival, contents look fine. Photo attached.';
            completeJob(onsite); changed = true;
          }
          return;
        }
        w.idle = (w.idle || 0) + 1;
        if (w.idle < 2) return;
        var next = jobs.filter(function (j) { return j.worker === w.id && j.status === 'Assigned'; }).sort(function (a, b) { return a.win[0] - b.win[0]; })[0];
        if (next) { startRoute(next); w.idle = 0; changed = true; }
      });
      if (changed) refresh(true);
    });

    /* ================= start ================= */
    renderView();
  });
})();
