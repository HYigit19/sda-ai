/* Facility Management demo (SDA.demo pattern).
   All data is fictional sample data. AI triage, e-mails and notifications are simulated; nothing is sent. */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-facility', function (root, ctx) {
    var esc = SDA.esc, money = SDA.money, fmtDate = SDA.fmtDate, fmtTime = SDA.fmtTime, today = SDA.today, ICON = SDA.icon;
    var main = root.querySelector('.fac-main'), sr = root.querySelector('.fac-sr');

    /* ---------------- helpers ---------------- */
    var at = function (daysAgo, h, m) { var d = today(-daysAgo); d.setHours(h, m || 0, 0, 0); return d; };
    var when = function (d) { return (d.toDateString() === new Date().toDateString() ? 'Today' : fmtDate(d)) + ', ' + fmtTime(d); };
    var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    var first = function (arr, fn) { for (var i = 0; i < arr.length; i++) if (fn(arr[i])) return arr[i]; return null; };
    var ico = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var IC = {
      pin: ico('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
      warn: ico('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
      shield: ico('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
      book: ico('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>'),
      cam: ico('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
      back: ico('<path d="M15 6l-6 6 6 6"/>'),
      chat: ico('<path d="M4 5h16v11H8l-4 4z"/>'),
      wrench: ico('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'),
      user: ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>')
    };
    function announce(msg) { sr.textContent = ''; ctx.later(40, function () { sr.textContent = msg; }); }
    function toast(msg, kind) { SDA.toast(root, msg, kind); }

    /* ---------------- sample data ---------------- */
    var ME = { emp: 'Emma Davis', tech: 'Chris Walker', mgr: 'Sarah Johnson' };
    var ROOMS = ['lobby', 'meetA', 'meetB', 'kitchen', 'east', 'west', 'server', 'wc', 'stairs', 'wh', 'dock'];
    var R = {
      lobby: { n: 'Lobby', s: 'Lobby', t: 21.4, h: 41, c: 610 }, meetA: { n: 'Meeting A', s: 'Mtg A', t: 22.1, h: 44, c: 780 },
      meetB: { n: 'Meeting B', s: 'Mtg B', t: 24.9, h: 47, c: 1060 }, kitchen: { n: 'Kitchen', s: 'Kitchen', t: 22.4, h: 53, c: 690 },
      east: { n: 'Office East', s: 'Office E', t: 21.8, h: 43, c: 720 }, west: { n: 'Office West', s: 'Office W', t: 22.2, h: 42, c: 700 },
      server: { n: 'Server room', s: 'Server', t: 27.4, h: 35, c: 450 }, wc: { n: 'Restrooms', s: 'WC', t: 21.0, h: 58, c: 520 },
      stairs: { n: 'Elevator', s: 'Lift', t: 20.6, h: 40, c: 480 }, wh: { n: 'Warehouse', s: 'Warehouse', t: 17.8, h: 49, c: 540 },
      dock: { n: 'Loading dock', s: 'Dock', t: 15.6, h: 61, c: 500 }
    };
    ROOMS.forEach(function (k) { R[k].t0 = R[k].t; R[k].h0 = R[k].h; R[k].c0 = R[k].c; });
    var TEAMS = {
      'Plumbing': ['Chris Walker', 'Ryan Clark'], 'HVAC': ['James Taylor', 'Ryan Clark'], 'Electrical': ['David Wilson'],
      'Doors & access': ['Chris Walker'], 'General repairs': ['Chris Walker', 'Ryan Clark'], 'Cleaning': ['Olivia Moore'],
      'Fire safety': ['Redline Fire Protection (vendor)'], 'Elevator': ['Summit Lift Co. (vendor)']
    };
    var CATS = Object.keys(TEAMS).concat(['General']);
    var A = [
      { id: 'WH-03', n: 'Kitchen sink & water heater WH-03', room: 'kitchen', team: 'Plumbing', health: 82, note: 'Normal operation. Last descaling 4 months ago.', act: 'Descale and check valves', manual: 'd-man-wh' },
      { id: 'CH-02', n: 'Chiller unit CH-02 (roof)', room: 'meetB', team: 'HVAC', health: 58, note: 'Compressor vibration up 12% in 14 days. Forecast: service needed in about 9 days.', act: 'Inspect compressor mounts and bearings', manual: 'd-man-ch', contract: 'SC-01' },
      { id: 'CRAC-01', n: 'Server room cooling CRAC-01', room: 'server', team: 'HVAC', health: 34, note: 'Running at 96% load, filter pressure drop high. Forecast: overheating risk this week.', act: 'Replace filter and check refrigerant pressure', manual: 'd-man-crac', contract: 'SC-01' },
      { id: 'EL-01', n: 'Elevator EL-01', room: 'stairs', team: 'Elevator', health: 91, note: 'Door motor cycles normal. Inspection certificate due soon.', act: 'Annual inspection', manual: 'd-man-el', contract: 'SC-02' },
      { id: 'DK-01', n: 'Loading dock door DK-01', room: 'dock', team: 'Doors & access', health: 63, note: 'Closing time up 40% in 30 days. Forecast: drive chain wear.', act: 'Lubricate and tension drive chain', manual: 'd-man-dk' },
      { id: 'FA-01', n: 'Fire alarm panel FA-01', room: 'lobby', team: 'Fire safety', health: 97, note: 'Weekly self-test passed.', act: 'Quarterly function test', contract: 'SC-04' },
      { id: 'BL-E', n: 'Motorized blinds, Office East', room: 'east', team: 'General repairs', health: 70, note: 'Motors are 6 years old.', act: 'Check motors and limit switches' }
    ];
    var asset = function (id) { return first(A, function (a) { return a.id === id; }); };
    function assetFor(cat, room) {
      var a = first(A, function (x) { return x.room === room && x.team === cat; });
      if (!a && cat === 'HVAC') a = asset(room === 'server' ? 'CRAC-01' : 'CH-02');
      if (!a && cat === 'Elevator') a = asset('EL-01');
      if (!a && cat === 'Fire safety') a = asset('FA-01');
      return a ? a.id : null;
    }
    var SAFETY = {
      'Plumbing': ['Close the shut-off valve under the counter before opening any pipe.', 'Put up a wet-floor sign and keep the area dry.', 'Unplug appliances near the water (dishwasher, kettle).'],
      'HVAC': ['Isolate the unit at its service switch and lock it out.', 'Refrigerant work only by certified staff.', 'Ceiling units: ladder work with a second person.'],
      'Electrical': ['Lock out and tag the circuit at distribution board DB-1.', 'Test for dead before touching conductors.', 'Never work alone on live circuits.'],
      'Doors & access': ['Secure the door mechanically before work.', 'Disconnect the drive at the isolator switch.', 'Keep the loading zone clear and wear safety shoes.'],
      'General repairs': ['Wear gloves and eye protection.', 'Keep walkways clear while you work.'],
      'Cleaning': ['Use the right agent for the surface; check the safety data sheet.', 'Wet-floor sign until dry.'],
      'General': ['Wear standard PPE.', 'Report any hazard to the facility manager.']
    };

    var T = [
      { id: 'FM-1045', txt: 'There is a strange smell on the ground floor since this morning', room: null, cat: 'Cleaning', pri: 'Medium', team: '', tech: '', st: 'New', by: 'Laura White', created: at(0, 8, 42), photos: [],
        log: [{ at: at(0, 8, 42), by: 'Laura White', k: 'status', text: 'Reported via Facility Desk' }, { at: at(0, 8, 42), by: 'AI (simulated)', k: 'ai', text: 'Location not found in the message. Marked “Location to be confirmed” and asked the reporter to pick a room.' }] },
      { id: 'FM-1044', txt: 'Loading dock door closes slowly and makes a grinding noise', room: 'dock', cat: 'Doors & access', pri: 'High', team: 'Doors & access', tech: 'Chris Walker', st: 'Accepted', by: 'Kevin Lee', created: at(1, 15, 10), photos: [],
        log: [{ at: at(1, 15, 10), by: 'Kevin Lee', k: 'status', text: 'Reported via Facility Desk' }, { at: at(1, 15, 30), by: 'Sarah Johnson', k: 'status', text: 'Assigned to Doors & access · Chris Walker' }, { at: at(1, 16, 2), by: 'Chris Walker', k: 'status', text: 'Accepted' }] },
      { id: 'FM-1043', txt: 'Window blind in Office East is stuck halfway and will not open', room: 'east', cat: 'General repairs', pri: 'Low', team: 'General repairs', tech: 'Chris Walker', st: 'Assigned', by: 'Emma Davis', created: at(2, 10, 5), photos: [{ doc: 'd-ph-1043', by: 'Emma Davis' }],
        log: [{ at: at(2, 10, 5), by: 'Emma Davis', k: 'status', text: 'Reported via Facility Desk' }, { at: at(2, 11, 20), by: 'Sarah Johnson', k: 'status', text: 'Assigned to General repairs · Chris Walker' }, { at: at(1, 9, 12), by: 'Sarah Johnson', k: 'comment', text: 'Parts are ordered, Chris will come by when they arrive.' }] },
      { id: 'FM-1042', txt: 'Server room temperature above 27 °C (sensor alarm SR-T1)', room: 'server', cat: 'HVAC', pri: 'Critical', team: 'HVAC', tech: 'James Taylor', st: 'In progress', by: 'Sensor SR-T1 (automatic)', created: at(0, 7, 55), photos: [],
        log: [{ at: at(0, 7, 55), by: 'Sensor SR-T1', k: 'status', text: 'Created automatically from sensor threshold' }, { at: at(0, 8, 1), by: 'Sarah Johnson', k: 'status', text: 'Assigned to HVAC · James Taylor' }, { at: at(0, 8, 30), by: 'James Taylor', k: 'status', text: 'Work started' }] },
      { id: 'FM-1041', txt: 'Meeting B is too warm in the afternoons', room: 'meetB', cat: 'HVAC', pri: 'Medium', team: 'HVAC', tech: 'James Taylor', st: 'Assigned', by: 'Michael Brown', created: at(3, 14, 20), photos: [],
        log: [{ at: at(3, 14, 20), by: 'Michael Brown', k: 'status', text: 'Reported via Facility Desk' }, { at: at(3, 15, 0), by: 'Sarah Johnson', k: 'status', text: 'Assigned to HVAC · James Taylor' }] },
      { id: 'FM-1039', txt: 'Paper towel dispenser in the restrooms is empty', room: 'wc', cat: 'Cleaning', pri: 'Low', team: 'Cleaning', tech: 'Olivia Moore', st: 'Closed', by: 'Emma Davis', created: at(6, 9, 15), photos: [],
        log: [{ at: at(6, 9, 15), by: 'Emma Davis', k: 'status', text: 'Reported via Facility Desk' }, { at: at(6, 9, 40), by: 'Sarah Johnson', k: 'status', text: 'Assigned to Cleaning · Olivia Moore' }, { at: at(6, 11, 5), by: 'Olivia Moore', k: 'note', text: 'Refilled all dispensers on Floor 1.' }, { at: at(6, 11, 5), by: 'Olivia Moore', k: 'status', text: 'Resolved' }, { at: at(5, 8, 50), by: 'Emma Davis', k: 'status', text: 'Confirmed fixed, ticket closed' }] }
    ];
    T.forEach(function (t) { t.asset = assetFor(t.cat, t.room); });
    var nextId = 1046;
    var tk = function (id) { return first(T, function (t) { return t.id === id; }); };
    var openT = function (t) { return t.st !== 'Resolved' && t.st !== 'Closed'; };
    var openIn = function (k) { return T.filter(function (t) { return t.room === k && openT(t); }); };

    var CONTRACTS = [
      { id: 'SC-01', vendor: 'Polar Air Services', scope: 'HVAC, chiller and server room cooling, quarterly service', annual: 48000, end: today(144), doc: 'd-c-hvac', assets: 'CH-02, CRAC-01' },
      { id: 'SC-02', vendor: 'Summit Lift Co.', scope: 'Elevator maintenance and rescue service', annual: 14400, end: today(85), doc: 'd-c-lift', assets: 'EL-01' },
      { id: 'SC-03', vendor: 'BrightSpace Cleaning', scope: 'Daily cleaning of offices, kitchen and restrooms', annual: 62400, end: today(54), doc: 'd-c-clean', renewal: 'd-c-clean27', assets: 'All rooms' },
      { id: 'SC-04', vendor: 'Redline Fire Protection', scope: 'Fire alarm, sprinklers and extinguishers', annual: 9600, end: today(235), doc: 'd-c-fire', assets: 'FA-01' }
    ];
    var SPEND = [['Cleaning', 52000], ['HVAC', 40000], ['Elevator', 12000], ['Fire safety', 8000]];
    var BUDGET = 165000, RATE = 85;
    var COSTS = [
      { at: at(5, 11, 5), ticket: 'FM-1039', desc: 'Refill dispensers (in cleaning contract)', labor: 0, parts: 0 },
      { at: at(12, 16, 0), ticket: 'FM-1031', desc: 'Replace faucet cartridge, Restrooms', labor: 127.5, parts: 64.9 },
      { at: at(19, 13, 30), ticket: 'FM-1024', desc: 'Repair door closer, Meeting A', labor: 170, parts: 118 },
      { at: at(33, 10, 0), ticket: 'FM-1012', desc: 'Emergency electrician, breaker trip Office West', labor: 340, parts: 22.4 }
    ];
    var ADHOC_BASE = 19480.6;

    /* ---------------- documents (DMS) ---------------- */
    var d0 = function (n) { return fmtDate(today(-n)); };
    var DOCS = [
      { id: 'd-c-hvac', name: 'Service contract SC-01 – Polar Air Services.pdf', type: 'pdf', folder: 'Contracts', linked: 'SC-01 · CH-02, CRAC-01', owner: 'Sarah Johnson', date: d0(221), status: 'Active', tags: ['HVAC', 'contract'],
        title: 'HVAC maintenance agreement', company: 'Polar Air Services', meta: [['Contract', 'SC-01'], ['Customer', 'Harborview Properties · HQ Building'], ['Ends', fmtDate(today(144))], ['Annual value', '$48,000']],
        sections: [{ h: 'Scope', lines: ['Quarterly service of chiller CH-02 and air handling units', 'Server room cooling CRAC-01: monthly filter check', 'Call-outs for faults, billed under the price schedule'] }, { h: 'Price schedule', rows: [['Item', 'Frequency', 'Price'], ['Quarterly service visit', '4 per year', '$9,600'], ['Monthly CRAC-01 check', '12 per year', '$9,600'], ['Call-out, per hour', 'on demand', '$110']] }] },
      { id: 'd-c-lift', name: 'Service contract SC-02 – Summit Lift Co.pdf', type: 'pdf', folder: 'Contracts', linked: 'SC-02 · EL-01', owner: 'Sarah Johnson', date: d0(280), status: 'Active', tags: ['elevator', 'contract'],
        title: 'Elevator maintenance contract', company: 'Summit Lift Co.', meta: [['Contract', 'SC-02'], ['Ends', fmtDate(today(85))], ['Annual value', '$14,400']],
        sections: [{ h: 'Scope', lines: ['Monthly maintenance visit for EL-01', 'Rescue service for trapped passengers', 'Support during the annual statutory inspection'] }] },
      { id: 'd-c-clean', name: 'Service contract SC-03 – BrightSpace Cleaning.pdf', type: 'pdf', folder: 'Contracts', linked: 'SC-03 · all rooms', owner: 'Sarah Johnson', date: d0(310), status: 'Active', tags: ['cleaning', 'contract'],
        title: 'Cleaning services agreement', company: 'BrightSpace Cleaning', meta: [['Contract', 'SC-03'], ['Ends', fmtDate(today(54))], ['Annual value', '$62,400']],
        sections: [{ h: 'Service levels', rows: [['Area', 'Frequency'], ['Offices and meeting rooms', 'Daily'], ['Kitchen', 'Twice daily'], ['Restrooms', 'Twice daily plus restocking'], ['Warehouse', 'Weekly']] }] },
      { id: 'd-c-clean27', name: 'Renewal SC-03 2027 – BrightSpace Cleaning (draft).docx', type: 'docx', folder: 'Contracts', linked: 'SC-03', owner: 'Sarah Johnson', date: d0(3), status: 'Pending review', tags: ['renewal'],
        title: 'Renewal offer 2027: cleaning services', company: 'BrightSpace Cleaning', meta: [['Contract', 'SC-03'], ['New term', '12 months'], ['Annual value', '$64,200 (+2.9%)']],
        sections: [{ h: 'Changes', lines: ['Price adjustment of 2.9% for wage increases', 'Kitchen cleaning after 2 pm added', 'Same notice period of 3 months'] }] },
      { id: 'd-c-fire', name: 'Service contract SC-04 – Redline Fire Protection.pdf', type: 'pdf', folder: 'Contracts', linked: 'SC-04 · FA-01', owner: 'Sarah Johnson', date: d0(130), status: 'Active', tags: ['fire safety', 'contract'],
        title: 'Fire protection service agreement', company: 'Redline Fire Protection', meta: [['Contract', 'SC-04'], ['Ends', fmtDate(today(235))], ['Annual value', '$9,600']],
        sections: [{ h: 'Scope', lines: ['Quarterly test of fire alarm panel FA-01 and detectors', 'Annual sprinkler inspection', 'Extinguisher service and replacement'] }] },
      { id: 'd-cert-el', name: 'Elevator EL-01 – inspection certificate.pdf', type: 'pdf', folder: 'Certificates', linked: 'EL-01', owner: 'Summit Lift Co.', date: d0(353), status: 'Due in 12 days', tags: ['inspection', 'elevator'],
        title: 'Elevator inspection certificate', company: 'Coastline Inspection Authority', meta: [['Asset', 'EL-01, passenger elevator 630 kg'], ['Inspected', d0(353)], ['Valid until', fmtDate(today(12))]],
        sections: [{ h: 'Result', p: 'No defects found. Safety gear, door locks, emergency call and brakes tested.' }, { h: 'Next inspection', p: 'Annual inspection required before the certificate expires. Book with the maintenance contractor.' }] },
      { id: 'd-cert-fire', name: 'Fire safety inspection certificate 2026.pdf', type: 'pdf', folder: 'Certificates', linked: 'FA-01 · whole floor', owner: 'Redline Fire Protection', date: d0(130), status: 'Valid', tags: ['inspection', 'fire safety'],
        title: 'Fire safety inspection certificate', company: 'Redline Fire Protection', meta: [['Scope', 'Alarm panel FA-01, 46 detectors, 12 extinguishers, sprinklers'], ['Valid until', fmtDate(today(235))]],
        sections: [{ h: 'Result', rows: [['System', 'Result'], ['Fire alarm panel FA-01', 'Passed'], ['Smoke detectors (46)', 'Passed'], ['Extinguishers (12)', 'Passed, 2 refilled'], ['Escape route signs', 'Passed']] }] },
      { id: 'd-man-wh', name: 'Manual – kitchen sink & water heater WH-03.pdf', type: 'pdf', folder: 'Manuals', linked: 'WH-03 · Kitchen', owner: 'Sarah Johnson', date: d0(400), status: 'Valid', tags: ['manual', 'plumbing'],
        title: 'Under-sink water heater WH-03: service manual', company: 'Aquafine Appliances', meta: [['Model', 'UW-15 compact, 15 l'], ['Location', 'Kitchen, under the sink']],
        sections: [{ h: 'Shut-off', p: 'Close valve V-K2 (blue handle) under the counter. Switch off the heater at the fused spur before work.' }, { h: 'Common faults', rows: [['Symptom', 'Likely cause', 'Fix'], ['Water under the sink', 'Loose compression fitting or worn washer', 'Tighten the fitting a quarter turn, replace washer 12 mm'], ['Dripping relief valve', 'Pressure too high', 'Check the pressure reducer, max 3 bar'], ['No hot water', 'Thermal cut-out tripped', 'Reset button on the front cover']] }] },
      { id: 'd-man-ch', name: 'Manual – chiller unit CH-02.pdf', type: 'pdf', folder: 'Manuals', linked: 'CH-02 · roof', owner: 'Polar Air Services', date: d0(700), status: 'Valid', tags: ['manual', 'HVAC'],
        title: 'Air-cooled chiller CH-02: operation and maintenance', company: 'Northbreeze Climate Systems', meta: [['Capacity', '120 kW'], ['Refrigerant', 'R-32']],
        sections: [{ h: 'Vibration limits', rows: [['Level', 'mm/s', 'Action'], ['Normal', '< 2.8', 'None'], ['Alert', '2.8 – 4.5', 'Inspect mounts and bearings'], ['Danger', '> 4.5', 'Stop the compressor']] }] },
      { id: 'd-man-crac', name: 'Manual – server room cooling CRAC-01.pdf', type: 'pdf', folder: 'Manuals', linked: 'CRAC-01 · Server room', owner: 'Polar Air Services', date: d0(650), status: 'Valid', tags: ['manual', 'HVAC'],
        title: 'Precision cooling unit CRAC-01', company: 'Northbreeze Climate Systems', meta: [['Capacity', '18 kW'], ['Filter', 'G4, 592 × 490 mm']],
        sections: [{ h: 'Filter change', lines: ['Switch the unit to standby on the panel', 'Open the front panel, slide the filter out', 'Insert a new G4 filter, airflow arrow up', 'Reset the filter timer'] }] },
      { id: 'd-man-el', name: 'Manual – elevator EL-01.pdf', type: 'pdf', folder: 'Manuals', linked: 'EL-01', owner: 'Summit Lift Co.', date: d0(900), status: 'Valid', tags: ['manual', 'elevator'],
        title: 'Passenger elevator EL-01: owner manual', company: 'Summit Lift Co.', meta: [['Load', '630 kg / 8 persons'], ['Floors', '3']],
        sections: [{ h: 'Owner duties', lines: ['Keep the machine room locked', 'Test the emergency call monthly', 'Only the contractor may open the shaft'] }] },
      { id: 'd-man-dk', name: 'Manual – loading dock door DK-01.pdf', type: 'pdf', folder: 'Manuals', linked: 'DK-01 · Loading dock', owner: 'Sarah Johnson', date: d0(820), status: 'Valid', tags: ['manual', 'doors'],
        title: 'Sectional door DK-01: maintenance manual', company: 'Ironline Doors', meta: [['Size', '3.0 × 3.5 m'], ['Drive', 'Chain, 0.75 kW']],
        sections: [{ h: 'Maintenance', rows: [['Task', 'Interval'], ['Lubricate chain and rollers', '3 months'], ['Check spring tension', '6 months'], ['Test safety edge', 'Monthly']] }] },
      { id: 'd-plan-1', name: 'HQ Building – Floor 1 plan.pdf', type: 'pdf', folder: 'Floor plans', linked: 'Floor 1', owner: 'Sarah Johnson', date: d0(500), status: 'Valid', tags: ['floor plan'],
        title: 'HQ Building, Floor 1: room plan', company: 'Harborview Properties', meta: [['Gross area', '1,240 m²'], ['Rooms', '11']],
        sections: [{ h: 'Rooms', rows: [['Room', 'Use', 'Area']].concat([['Lobby', 'Reception', '96 m²'], ['Meeting A / B', 'Meetings, 8 seats each', '28 m² each'], ['Kitchen', 'Break area', '42 m²'], ['Office East', 'Open-plan, 24 desks', '210 m²'], ['Office West', 'Open-plan, 18 desks', '160 m²'], ['Server room', 'IT, restricted', '18 m²'], ['Restrooms', '-', '30 m²'], ['Warehouse', 'Storage', '380 m²'], ['Loading dock', 'Deliveries', '120 m²']]) }] },
      { id: 'd-plan-ev', name: 'Evacuation plan – Floor 1.pdf', type: 'pdf', folder: 'Floor plans', linked: 'Floor 1', owner: 'Redline Fire Protection', date: d0(130), status: 'Valid', tags: ['fire safety', 'floor plan'],
        title: 'Evacuation plan, Floor 1', company: 'Harborview Properties', meta: [['Assembly point', 'Parking lot north']],
        sections: [{ h: 'In case of fire', lines: ['Raise the alarm at the nearest call point', 'Leave by the marked escape route, do not use the elevator', 'Go to the assembly point and report to the fire warden'] }] },
      { id: 'd-ph-1043', name: 'FM-1043 – reporter photo.jpg', type: 'jpg', folder: 'Ticket photos', linked: 'FM-1043 · BL-E', owner: 'Emma Davis', who: 'Emma Davis', date: d0(2), status: 'Valid', tags: ['ticket photo'], img: SDA.art('damage', 'FM-1043 · blind stuck') }
    ];
    var dmsOpts = {
      root: root, title: 'Documents', docs: DOCS, role: 'emp',
      folders: ['Contracts', 'Certificates', 'Manuals', 'Floor plans', 'Ticket photos'],
      canUpload: function (r) { return r !== 'emp'; },
      canApprove: function (r) { return r === 'mgr'; },
      filter: function (d, r) {
        if (r === 'emp') return d.folder === 'Floor plans' || (d.folder === 'Ticket photos' && d.who === ME.emp);
        if (r === 'tech') return d.folder !== 'Contracts';
        return true;
      },
      userName: function (r) { return ME[r]; },
      uploadFolder: 'Ticket photos', uploadStatus: 'Valid',
      onChange: function (docs, d, action) {
        if (d && d.id === 'd-cert-el' && action === 'version') {
          d.status = 'Valid'; d.meta = [['Asset', 'EL-01, passenger elevator 630 kg'], ['Inspected', fmtDate(today())], ['Valid until', fmtDate(today(365))]];
          dms.render(); toast('Certificate renewed: EL-01 is valid for another year.');
        }
        if (d && d.id === 'd-c-clean27' && action === 'approve') toast('Renewal SC-03 approved. BrightSpace Cleaning informed (simulated, not sent).');
        if (state.role === 'mgr' && mgr.tab !== 'docs') render();
      }
    };
    var dmsEl = document.createElement('div');
    var dms = SDA.dms(dmsEl, dmsOpts);
    var docOf = function (id) { return first(dms.docs(), function (d) { return d.id === id; }); };

    /* ---------------- state ---------------- */
    var state = { role: 'emp' };
    var emp = { text: '', photo: null, drafts: null, busy: false, issues: null, mode: 'split', open: 'FM-1043', sent: null };
    var tech = { sel: null, list: 'open' };
    var mgr = { tab: 'overview', room: 'kitchen', q: '', fst: 'open', fpri: 'all', fteam: 'all', ftbc: false };

    /* ---------------- guide ---------------- */
    var guide = SDA.guide(root.querySelector('.fac-guide'), {
      title: 'Fix a kitchen leak from report to closed ticket',
      demoId: 'demo-facility',
      steps: [
        { id: 'report', text: 'Emma Davis (employee): report “Water leaking in the kitchen”' },
        { id: 'assign', text: 'Sarah Johnson (manager): assign it to Plumbing' },
        { id: 'resolve', text: 'Chris Walker (technician): accept, start and resolve it with a photo' },
        { id: 'close', text: 'Emma Davis: confirm the fix so the ticket closes' }
      ],
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=facility-management', text: 'Talk to us about your version' }
    });
    var isGuide = function (t) { return t.cat === 'Plumbing' && t.room === 'kitchen' && t.by === ME.emp; };

    /* ---------------- roles ---------------- */
    SDA.roles(root.querySelector('.fac-roles'), {
      title: 'View as',
      value: 'emp',
      roles: [
        { id: 'emp', label: 'Employee', person: ME.emp, icon: 'ED', sub: 'Report issues and follow your own tickets.' },
        { id: 'tech', label: 'Technician', person: ME.tech, icon: 'CW', sub: 'Mobile work list: accept, fix and document jobs on site.' },
        { id: 'mgr', label: 'Facility manager', person: ME.mgr, icon: 'SJ', sub: 'Live floor plan, all tickets, assignments, maintenance, contracts and costs.' }
      ],
      onChange: function (r) {
        state.role = r; dms.setRole(r);
        dmsOpts.title = r === 'emp' ? 'Building documents' : r === 'tech' ? 'Technical documents' : 'Document management';
        dms.render(); render();
      }
    });
    dmsOpts.title = 'Building documents'; dms.render();

    /* ---------------- shared UI bits ---------------- */
    var PRI_CLS = { Critical: 'p-bad', High: 'p-warn', Medium: 'p-info', Low: 'fac-p-low' };
    var ST_CLS = { 'New': 'p-warn', 'Assigned': 'p-info', 'Accepted': 'p-info', 'In progress': 'p-warn', 'Resolved': 'p-ok', 'Closed': 'p-ok' };
    var pri = function (p) { return '<span class="pill ' + PRI_CLS[p] + '">' + esc(p) + '</span>'; };
    var stp = function (t) { return '<span class="pill ' + ST_CLS[t.st] + '">' + esc(t.st === 'New' && state.role === 'mgr' ? 'New · unassigned' : t.st) + '</span>'; };
    var where = function (t) { return t.room ? esc(R[t.room].n) : '<span class="fac-tbc">Location to be confirmed</span>'; };
    function thumbs(t, small) {
      if (!t.photos.length) return '';
      return '<div class="fac-thumbs' + (small ? ' sm' : '') + '">' + t.photos.map(function (p) {
        var d = docOf(p.doc); if (!d) return '';
        return '<button type="button" class="fac-thumb" data-act="doc" data-doc="' + d.id + '" aria-label="Open photo ' + esc(d.name) + '"><img src="' + d.img + '" alt=""><small>' + esc(p.by.split(' ')[0]) + '</small></button>';
      }).join('') + '</div>';
    }
    function activity(t, newestFirst) {
      var L = t.log.slice(); if (newestFirst) L.reverse();
      return '<ol class="fac-log">' + L.map(function (e) {
        return '<li class="k-' + e.k + '"><span class="fac-log-d" aria-hidden="true"></span><div><b>' + esc(e.by) + '</b> <small>' + when(e.at) + '</small><p>' + (e.k === 'comment' || e.k === 'note' ? '“' + esc(e.text) + '”' : esc(e.text)) + '</p></div></li>';
      }).join('') + '</ol>';
    }
    function log(t, by, k, text) { t.log.push({ at: new Date(), by: by, k: k, text: text }); }
    function roomOptions(sel, tbcLabel) {
      return '<option value=""' + (!sel ? ' selected' : '') + '>' + esc(tbcLabel || 'Location to be confirmed') + '</option>' + ROOMS.map(function (k) { return '<option value="' + k + '"' + (sel === k ? ' selected' : '') + '>' + esc(R[k].n) + '</option>'; }).join('');
    }
    function miniPlan(attrs, sel, cands) {
      return '<div class="fplan fac-pick" role="group" aria-label="Pick the room on the floor plan">' + ROOMS.map(function (k) {
        var hint = cands && cands.indexOf(k) > -1;
        return '<button type="button" class="room r-' + k + (sel === k ? ' sel' : '') + (hint ? ' fac-hint' : '') + '" ' + attrs + ' data-room="' + k + '" aria-pressed="' + (sel === k) + '" aria-label="' + esc(R[k].n) + '">' + rname(k) + '</button>';
      }).join('') + '</div>';
    }
    function rname(k) { return '<span class="fac-long">' + esc(R[k].n) + '</span><span class="fac-short" aria-hidden="true">' + esc(R[k].s) + '</span>'; }
    function fv(k, f) { var r = R[k]; return f === 'h' ? Math.round(r.h) + '%' : f === 'c' ? Math.round(r.c) + ' ppm' : r.t.toFixed(1) + ' °C'; }
    function roomState(k) {
      var o = openIn(k), r = R[k];
      if (o.some(function (t) { return t.pri === 'Critical' || t.pri === 'High'; }) || r.t > 28.5) return 'bad';
      if (o.length || r.t > 24.5 || r.t < 16 || r.c > 1000) return 'warn';
      return '';
    }
    function roomLabel(k) { var n = openIn(k).length; return R[k].n + ', ' + fv(k, 't') + ', ' + (n ? n + ' open ticket' + (n > 1 ? 's' : '') : 'no open tickets'); }

    /* ---------------- AI triage (simulated, rule-based) ---------------- */
    var CAT_RULES = [
      ['Fire safety', /\b(fire|smoke|smoking|burn\w*|sparks?|extinguishers?)\b/i],
      ['Elevator', /\b(elevator|lift)\b/i],
      ['Plumbing', /\b(leak\w*|water|drip\w*|taps?|faucets?|sinks?|toilets?|clog\w*|flood\w*|pipes?|drains?)\b/i],
      ['HVAC', /\b(hot|warm|cold|freezing|chilly|air ?con\w*|a\/c|heating|heater|ventilation|stuffy|temperature|draft)\b/i],
      ['Electrical', /\b(lights?|lamps?|flicker\w*|power|sockets?|outlets?|electric\w*|breaker)\b/i],
      ['Doors & access', /\b(doors?|locks?|badge|key ?card|gate|shutter)\b/i],
      ['Cleaning', /\b(spill\w*|dirty|clean\w*|trash|bins?|garbage|paper towels?|soap|smell\w*|stain\w*|mess)\b/i],
      ['General repairs', /\b(broken|blinds?|chairs?|desks?|windows?|crack\w*|damaged?|ceiling|tiles?|furniture|stuck)\b/i]
    ];
    var ROOM_RULES = [
      ['lobby', /\b(lobby|reception|entrance|front desk)\b/i],
      ['meetA', /\b[Mm]eeting (?:[Rr]oom )?A\b|\b[Cc]onference (?:[Rr]oom )?A\b/],
      ['meetB', /\b[Mm]eeting (?:[Rr]oom )?B\b|\b[Cc]onference (?:[Rr]oom )?B\b/],
      ['kitchen', /\b(kitchen|pantry|break ?room|coffee machine)\b/i],
      ['east', /\b(office east|east office|east wing)\b/i],
      ['west', /\b(office west|west office|west wing)\b/i],
      ['server', /\bserver\b/i],
      ['wc', /\b(restrooms?|toilets?|bathrooms?|washrooms?|wc)\b/i],
      ['stairs', /\b(stairs?|staircase|elevator|lift)\b/i],
      ['wh', /\b(warehouse|storage)\b/i],
      ['dock', /\b(loading dock|dock|loading)\b/i]
    ];
    var AMBIG = [[['meetA', 'meetB'], /\b(meeting|conference) ?rooms?\b/i, 'meeting room'], [['east', 'west'], /\boffices?\b/i, 'office']];
    function catOf(s) { var r = first(CAT_RULES, function (x) { return x[1].test(s); }); return r ? r[0] : null; }
    function roomsOf(s) {
      var found = ROOM_RULES.filter(function (x) { return x[1].test(s); }).map(function (x) { return x[0]; }), cands = [];
      AMBIG.forEach(function (a) { if (a[1].test(s) && !a[0].some(function (k) { return found.indexOf(k) > -1; })) cands = cands.concat(a[0]); });
      return { found: found, cands: cands };
    }
    function priOf(s, cat) {
      if (/\b(fire|smoke|sparks?|flood\w*|no power|burn\w*)\b/i.test(s) || (cat === 'HVAC' && /server/i.test(s))) return 'Critical';
      if (/\b(leak\w*|broken|stuck|not working|no water|doesn'?t work|won'?t)\b/i.test(s)) return 'High';
      if (/\b(spill\w*|smell\w*|dirty|empty|paper towels?|soap|stain\w*)\b/i.test(s)) return 'Low';
      return 'Medium';
    }
    var tidy = function (s) { s = s.replace(/^\s*(and|also|plus)\s+/i, '').trim(); return s.charAt(0).toUpperCase() + s.slice(1); };
    function analyse(text) {
      var segs = text.split(/[.;!?\n]+|,?\s+(?:and also|also|plus|and)\s+(?=(?:the|a|an|there|it|our|my|in|on)\b)/i).map(function (s) { return (s || '').trim(); }).filter(function (s) { return s.length > 2; });
      var issues = [];
      segs.forEach(function (s) {
        var cat = catOf(s), ro = roomsOf(s);
        var same = cat && first(issues, function (i) { return i.cat === cat && (!ro.found.length || !i.found.length || ro.found.join() === i.found.join()); });
        if (!cat || same) {
          var tgt = same || issues[issues.length - 1];
          if (tgt) { tgt.txt += '. ' + tidy(s); ro.found.forEach(function (k) { if (tgt.found.indexOf(k) < 0) tgt.found.push(k); }); if (!tgt.found.length) tgt.cands = tgt.cands.concat(ro.cands); return; }
        }
        issues.push({ txt: tidy(s), cat: cat, found: ro.found, cands: ro.cands });
      });
      // issues without a category merge into a neighbour
      for (var i = issues.length - 1; i >= 0 && issues.length > 1; i--) {
        if (!issues[i].cat) {
          var nb = issues[i + 1] || issues[i - 1];
          nb.txt = i < issues.indexOf(nb) ? issues[i].txt + '. ' + nb.txt : nb.txt + '. ' + issues[i].txt;
          issues[i].found.forEach(function (k) { if (nb.found.indexOf(k) < 0) nb.found.push(k); });
          issues.splice(i, 1);
        }
      }
      if (!issues.length) issues.push({ txt: tidy(text), cat: null, found: [], cands: [] });
      return issues;
    }
    function makeDraft(is, text, allFound) {
      var cat = is.cat || 'General';
      var d = { txt: is.txt, cat: cat, room: null, src: null, cands: is.cands.slice(), pri: priOf(is.txt, cat), conf: [], notes: [], picking: false, dropped: false, detail: '' };
      if (is.found.length === 1) { d.room = is.found[0]; d.src = 'text'; }
      else if (is.found.length > 1) d.cands = is.found.slice();
      else if (!d.cands.length && allFound.length === 1) { d.room = allFound[0]; d.src = 'inherited'; }
      if (cat === 'HVAC' && /\b(hot|warm|boiling|heat)\b/i.test(is.txt) && /\b(cold|freezing|chilly)\b/i.test(is.txt))
        d.conf.push({ type: 'temp', q: 'Your message says both too hot and too cold. Which is it?', opts: [['hot', 'Too hot'], ['cold', 'Too cold'], ['varies', 'It changes during the day']], ans: null });
      var urgent = /\b(urgent|asap|emergency|immediately|right now)\b/i.test(text.replace(/\bnot (so |that )?urgent\b|\bno emergency\b/gi, ''));
      var calm = /\b(not (so |that )?urgent|no rush|no hurry|whenever|low priority)\b/i.test(text);
      if (urgent && calm) { d.pri = d.pri === 'Critical' ? 'Critical' : 'Medium'; d.conf.push({ type: 'urg', q: 'You wrote both “urgent” and “not urgent”. Priority is set to Medium until you choose.', opts: [['urgent', 'It is urgent'], ['calm', 'No rush']], ans: null }); }
      else if (urgent && d.pri !== 'Critical') d.pri = 'High';
      else if (calm && d.pri !== 'Critical') d.pri = 'Low';
      if (/\b(works? (fine|again|now)|working (fine|again|now)|fixed itself|never ?mind|resolved now)\b/i.test(text))
        d.conf.push({ type: 'gone', q: 'You also wrote that it works again. Do you still want to report it?', opts: [['keep', 'Yes, report it'], ['drop', 'No, discard']], ans: null });
      if (cat === 'Fire safety') d.notes.push('If there is fire or smoke, use the nearest fire alarm call point and call emergency services first. This form does not raise an alarm.');
      if (cat === 'Plumbing' && /\b(leak\w*|flood\w*)\b/i.test(is.txt)) d.notes.push('If it is safe, close the shut-off valve under the sink and keep away from sockets.');
      return d;
    }
    function buildDrafts() {
      var allFound = []; emp.issues.forEach(function (i) { i.found.forEach(function (k) { if (allFound.indexOf(k) < 0) allFound.push(k); }); });
      if (emp.mode === 'one' && emp.issues.length > 1) {
        var merged = { txt: emp.issues.map(function (i) { return i.txt; }).join('. '), cat: emp.issues[0].cat, found: allFound.length === 1 ? allFound : [], cands: allFound.length > 1 ? allFound : [] };
        var d = makeDraft(merged, emp.text, allFound); d.notes.unshift('Contains ' + emp.issues.length + ' problems; the facility manager may split it later.');
        emp.drafts = [d];
      } else emp.drafts = emp.issues.map(function (i) { return makeDraft(i, emp.text, allFound); });
    }
    function triage() {
      var text = emp.text.trim();
      if (text.length < 4) { emp.drafts = null; emp.err = 'Please describe the problem first, for example “Water leaking in the kitchen”.'; render(); return; }
      emp.err = ''; emp.sent = null; emp.busy = true; render();
      ctx.later(650, function () {
        emp.busy = false; emp.issues = analyse(text); emp.mode = 'split'; buildDrafts(); render();
        var n = emp.drafts.length, tbc = emp.drafts.filter(function (d) { return !d.room; }).length;
        announce('AI (simulated) prepared ' + n + ' ticket draft' + (n > 1 ? 's' : '') + (tbc ? '. Location to be confirmed for ' + tbc + '.' : '.'));
      });
    }
    function sendDrafts() {
      var list = emp.drafts.filter(function (d) { return !d.dropped; });
      if (!list.length) { toast('Nothing to send: all drafts were discarded.', 'warn'); return; }
      var ids = [];
      list.forEach(function (d, i) {
        var t = { id: 'FM-' + (nextId++), txt: d.txt + (d.detail ? ' (' + d.detail + ')' : ''), room: d.room, cat: d.cat, pri: d.pri, team: '', tech: '', st: 'New', by: ME.emp, created: new Date(), photos: [], log: [] };
        t.asset = assetFor(t.cat, t.room);
        log(t, ME.emp, 'status', 'Reported via Facility Desk');
        log(t, 'AI (simulated)', 'ai', 'Triage: ' + t.cat + ' · ' + t.pri + ' · ' + (t.room ? R[t.room].n + (d.src === 'inherited' ? ' (taken from the message)' : d.src === 'picked' ? ' (picked by reporter)' : '') : 'location to be confirmed') + (d.conf.length ? ' · ' + d.conf.length + ' unclear detail' + (d.conf.length > 1 ? 's' : '') + ' clarified with reporter' : '') + '. Suggested team: ' + (TEAMS[t.cat] ? t.cat : 'facility manager to decide') + '.');
        if (i === 0 && emp.photo) {
          var doc = dms.add({ id: 'd-ph-' + t.id, name: t.id + ' – reporter photo.' + (emp.photo.up ? 'jpg' : 'jpg'), type: 'jpg', folder: 'Ticket photos', linked: t.id + (t.asset ? ' · ' + t.asset : ''), owner: ME.emp, who: ME.emp, status: 'Valid', tags: ['ticket photo'], img: emp.photo.src, note: 'Attached when reporting' });
          t.photos.push({ doc: doc.id, by: ME.emp });
        }
        T.unshift(t); ids.push(t.id);
        if (isGuide(t)) guide.done('report');
      });
      emp.sent = ids; emp.open = ids[0]; emp.drafts = null; emp.issues = null; emp.text = ''; emp.photo = null;
      render();
      toast('Sent ' + ids.join(', ') + '. Confirmation e-mail to Emma Davis (simulated, not sent).');
    }

    /* ---------------- EMPLOYEE VIEW ---------------- */
    var EXAMPLES = ['Water leaking in the kitchen', 'It\'s too hot in the meeting room', 'Lights flickering in Office East and the restroom tap is dripping', 'Something smells strange', 'Too cold in Meeting A, actually way too hot. Not urgent, but fix it ASAP'];
    function renderDraft(d, i, n) {
      if (d.dropped) return '<div class="fac-draft dropped"><span>Draft ' + (i + 1) + ' discarded.</span><button type="button" class="fac-link" data-act="dundo" data-d="' + i + '">Undo</button></div>';
      var loc, picker = '';
      if (d.room && !d.picking) {
        loc = '<b>' + esc(R[d.room].n) + '</b>' + (d.src === 'inherited' ? ' <small>(taken from your message)</small>' : d.src === 'picked' ? ' <small>(you picked)</small>' : '') + ' <button type="button" class="fac-link" data-act="dchange" data-d="' + i + '">Change</button>';
      } else {
        loc = '<span class="fac-tbc">' + IC.pin + 'Location to be confirmed</span>';
        picker = '<div class="fac-picker"><p class="fac-ask">' + (d.cands.length ? 'Which one do you mean?' : 'I could not tell where this is. Please pick the room on the plan or from the list.') + '</p>' +
          (d.cands.length ? '<div class="fac-chips">' + d.cands.map(function (k) { return '<button type="button" data-act="dpick" data-d="' + i + '" data-room="' + k + '">' + esc(R[k].n) + '</button>'; }).join('') + '</div>' : '') +
          miniPlan('data-act="dpick" data-d="' + i + '"', d.room, d.cands) +
          '<label class="fac-sel">Or choose from the list<select data-chg="droom" data-d="' + i + '">' + roomOptions(d.room, 'Select a room…') + '</select></label></div>';
      }
      var conf = d.conf.map(function (c, j) {
        return '<div class="fac-conf">' + IC.warn + '<div><p>' + esc(c.q) + '</p><div class="fac-chips">' + c.opts.map(function (o) {
          return '<button type="button" data-act="dconf" data-d="' + i + '" data-c="' + j + '" data-o="' + o[0] + '" aria-pressed="' + (c.ans === o[0]) + '">' + esc(o[1]) + '</button>';
        }).join('') + '</div></div></div>';
      }).join('');
      return '<div class="fac-draft"><div class="fac-draft-h"><b>' + (n > 1 ? 'Ticket ' + (i + 1) + ' of ' + n : 'Ticket draft') + '</b>' + pri(d.pri) + '</div>' +
        '<p class="fac-draft-t">' + esc(d.txt) + (d.detail ? ' <em>(' + esc(d.detail) + ')</em>' : '') + '</p>' +
        '<dl class="fac-dl"><dt>Category</dt><dd>' + esc(d.cat) + '</dd><dt>Team</dt><dd>' + (TEAMS[d.cat] ? esc(d.cat) : 'Facility manager decides') + '</dd><dt>Location</dt><dd>' + loc + '</dd>' + (i === 0 && emp.photo ? '<dt>Photo</dt><dd>Attached</dd>' : '') + '</dl>' + picker +
        conf + d.notes.map(function (x) { return '<p class="fac-note">' + IC.shield + '<span>' + esc(x) + '</span></p>'; }).join('') + '</div>';
    }
    function renderEmp() {
      var ai = '';
      if (emp.busy) ai = '<div class="ai-box fac-ai"><div class="ai-h">AI triage <span class="fac-simtag">AI (simulated)</span></div><p class="typing">Reading your message</p></div>';
      else if (emp.drafts) {
        var n = emp.drafts.length, live = emp.drafts.filter(function (d) { return !d.dropped; }).length;
        ai = '<div class="ai-box fac-ai"><div class="ai-h">AI triage <span class="fac-simtag">AI (simulated)</span></div>' +
          (emp.issues.length > 1 ? '<div class="fac-multi"><p>' + (emp.mode === 'split' ? 'I found <b>' + emp.issues.length + ' separate problems</b> in your message, so I prepared one ticket each. That way the right teams can work in parallel.' : 'Kept as <b>one ticket</b> with ' + emp.issues.length + ' problems.') + '</p>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-act="dmode">' + (emp.mode === 'split' ? 'Keep as one ticket' : 'Split into ' + emp.issues.length + ' tickets') + '</button></div>' : '') +
          emp.drafts.map(function (d, i) { return renderDraft(d, i, n); }).join('') +
          '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-act="send"' + (live ? '' : ' disabled') + '>' + (live > 1 ? 'Send ' + live + ' tickets' : 'Send ticket') + '</button><button type="button" class="btn btn-ghost btn-sm" data-act="discard">Edit message</button></div></div>';
      } else if (emp.sent) ai = '<div class="ai-box fac-ai"><div class="ai-h">Sent</div><p>Thanks, Emma. <b>' + emp.sent.join(', ') + '</b> ' + (emp.sent.length > 1 ? 'are' : 'is') + ' with the facility team. You can follow the status below. Confirmation e-mail (simulated, not sent).</p></div>';
      else if (emp.err) ai = '<p class="fac-err" role="alert">' + esc(emp.err) + '</p>';

      var photo = emp.photo ? '<div class="fac-attached"><img src="' + emp.photo.src + '" alt="Attached photo"><span>' + esc(emp.photo.label) + '</span><button type="button" class="fac-link" data-act="pclear">Remove</button></div>' :
        '<div class="fac-chips">' + [['leak', 'Leak'], ['damage', 'Damage'], ['room', 'Room']].map(function (k) { return '<button type="button" data-act="pphoto" data-kind="' + k[0] + '">' + IC.cam + 'Example: ' + k[1] + '</button>'; }).join('') +
        '<label class="fac-upl">' + ICON.upload + 'Upload photo<input type="file" accept="image/*" data-file="emp"></label></div>';

      var mine = T.filter(function (t) { return t.by === ME.emp; });
      var steps = ['Reported', 'Assigned', 'In progress', 'Resolved', 'Closed'], idx = { 'New': 0, 'Assigned': 1, 'Accepted': 1, 'In progress': 2, 'Resolved': 3, 'Closed': 4 };
      var list = mine.map(function (t) {
        var open = emp.open === t.id, k = idx[t.st];
        return '<li class="fac-mt' + (open ? ' open' : '') + '"><button type="button" class="fac-mt-h" data-act="eopen" data-id="' + t.id + '" aria-expanded="' + open + '"><span class="fac-id">' + t.id + '</span><span class="fac-mt-t"><b>' + esc(t.txt) + '</b><small>' + (t.room ? esc(R[t.room].n) : 'Location to be confirmed') + ' · ' + when(t.created) + '</small></span>' + stp(t) + '</button>' +
          (open ? '<div class="fac-mt-b">' +
            '<ol class="fac-track" aria-label="Progress">' + steps.map(function (s, j) { return '<li class="' + (j < k ? 'done' : j === k ? 'cur' : '') + '">' + s + '</li>'; }).join('') + '</ol>' +
            '<dl class="fac-dl"><dt>Location</dt><dd>' + where(t) + '</dd><dt>Handled by</dt><dd>' + (t.tech ? esc(t.tech) + ' · ' + esc(t.team) : 'Waiting for assignment') + '</dd></dl>' +
            (!t.room ? '<label class="fac-sel">Help us find it: which room?<select data-chg="eroom" data-id="' + t.id + '">' + roomOptions(null, 'Select a room…') + '</select></label>' : '') +
            thumbs(t, true) +
            (t.st === 'Resolved' ? '<div class="fac-resolved">' + IC.shield + '<div><b>The technician marked this as fixed.</b><p>Is the problem gone?</p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-act="econfirm" data-id="' + t.id + '">Yes, close the ticket</button><button type="button" class="btn btn-ghost btn-sm" data-act="ereopen" data-id="' + t.id + '">Still a problem</button></div></div></div>' : '') +
            '<h5>Updates</h5>' + activity(t, true) +
            (t.st !== 'Closed' ? '<div class="fac-cmt"><label for="fac-ec-' + t.id + '">Add a comment</label><textarea id="fac-ec-' + t.id + '" data-fk="ec-' + t.id + '" rows="2" placeholder="e.g. It is getting worse, water is on the floor now"></textarea><button type="button" class="btn btn-ghost btn-sm" data-act="ecomment" data-id="' + t.id + '">' + IC.chat + 'Add comment</button></div>' : '') +
            '</div>' : '') + '</li>';
      }).join('');

      return '<div class="fac-emp">' +
        '<section class="fac-card fac-report"><h3>Report an issue</h3><p class="fac-sub">Describe it in your own words. AI (simulated) works out the category, priority and room, and asks if something is unclear.</p>' +
        '<label class="fac-lbl" for="fac-emp-txt">What is the problem?</label><textarea id="fac-emp-txt" data-fk="txt" rows="3" placeholder="e.g. Water leaking under the sink in the kitchen">' + esc(emp.text) + '</textarea>' +
        '<p class="fac-lbl2">Examples</p><div class="fac-chips">' + EXAMPLES.map(function (x, i) { return '<button type="button" data-act="ex" data-i="' + i + '">' + esc(x) + '</button>'; }).join('') + '</div>' +
        '<p class="fac-lbl2">Photo (optional)</p>' + photo +
        '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-act="triage">' + ICON.spark + 'Check with AI</button></div>' +
        '<div aria-live="polite">' + ai + '</div></section>' +
        '<div class="fac-col"><section class="fac-card"><h3>My tickets</h3><p class="fac-sub">Only your own reports are shown.</p><ul class="fac-mts">' + (list || '<li class="fac-empty">No tickets yet.</li>') + '</ul></section>' +
        '<section class="fac-card" data-slot="dms"></section></div></div>';
    }

    /* ---------------- TECHNICIAN VIEW ---------------- */
    function techJobs() { return T.filter(function (t) { return t.tech === ME.tech; }); }
    function renderTech() {
      var jobs = techJobs(), t = tech.sel ? tk(tech.sel) : null, screen;
      var openJobs = jobs.filter(openT), doneJobs = jobs.filter(function (j) { return !openT(j); });
      if (!t) {
        var L = tech.list === 'open' ? openJobs : doneJobs;
        screen = '<div class="fac-ph-head"><h3 tabindex="-1" data-fallback>My jobs</h3><small>' + fmtDate(new Date()) + ' · HQ Building</small></div>' +
          '<div class="fac-seg" role="group" aria-label="Job filter"><button type="button" data-act="tlist" data-i="open" aria-pressed="' + (tech.list === 'open') + '">Open (' + openJobs.length + ')</button><button type="button" data-act="tlist" data-i="done" aria-pressed="' + (tech.list === 'done') + '">Done (' + doneJobs.length + ')</button></div>' +
          (L.length ? '<ul class="fac-jobs">' + L.map(function (j) {
            return '<li><button type="button" class="fac-job pr-' + j.pri.toLowerCase() + '" data-act="tjob" data-id="' + j.id + '"><span class="fac-job-top"><span class="fac-id">' + j.id + '</span>' + pri(j.pri) + '</span><b>' + esc(j.txt) + '</b><span class="fac-job-m">' + IC.pin + (j.room ? esc(R[j.room].n) : 'Location to be confirmed') + ' · ' + esc(j.st) + '</span></button></li>';
          }).join('') + '</ul>' : '<p class="fac-empty">' + (tech.list === 'open' ? 'No open jobs. New assignments appear here.' : 'Nothing finished yet today.') + '</p>');
      } else {
        var a = t.asset ? asset(t.asset) : null, man = a && a.manual ? docOf(a.manual) : null;
        var myPhotos = t.photos.filter(function (p) { return p.by === ME.tech; }).length;
        var acts = '';
        if (t.st === 'Assigned') acts = '<div class="fac-ph-acts"><button type="button" class="btn btn-ink btn-sm" data-act="taccept" data-id="' + t.id + '">Accept job</button><button type="button" class="btn btn-ghost btn-sm" data-act="thand" data-id="' + t.id + '">Hand back</button></div>';
        else if (t.st === 'Accepted') acts = '<div class="fac-ph-acts"><button type="button" class="btn btn-ink btn-sm" data-act="tstart" data-id="' + t.id + '">' + IC.wrench + 'Start work</button></div>';
        else if (t.st === 'In progress') acts =
          '<div class="fac-ph-box"><h5>' + IC.cam + 'Photos</h5>' + thumbs(t, true) + '<div class="fac-chips">' + [['leak', 'Before'], ['install', 'After repair'], ['damage', 'Damage']].map(function (k) { return '<button type="button" data-act="tphoto" data-id="' + t.id + '" data-kind="' + k[0] + '">' + IC.cam + esc(k[1]) + '</button>'; }).join('') +
          '<label class="fac-upl">' + ICON.upload + 'Upload<input type="file" accept="image/*" data-file="tech" data-id="' + t.id + '"></label></div></div>' +
          '<div class="fac-ph-box"><label class="fac-lbl" for="fac-tn">Note</label><textarea id="fac-tn" data-fk="tnote" rows="2" placeholder="e.g. Fitting was loose, ordered a new washer"></textarea><button type="button" class="btn btn-ghost btn-sm" data-act="tnote" data-id="' + t.id + '">Save note</button></div>' +
          '<div class="fac-ph-box fac-resolve"><h5>' + IC.shield + 'Resolve</h5><label class="fac-lbl" for="fac-tr">What did you do?</label><textarea id="fac-tr" data-fk="tres" rows="2" placeholder="e.g. Tightened compression fitting, replaced 12 mm washer, no more leak"></textarea>' +
          '<div class="fac-two"><label class="fac-lbl">Time (h)<input type="number" min="0.25" step="0.25" value="1" data-fk="thrs"></label><label class="fac-lbl">Parts ($)<input type="number" min="0" step="0.01" value="0" data-fk="tparts"></label></div>' +
          '<p class="fac-err" data-terr role="alert" hidden></p>' +
          '<p class="fac-hintline">' + (myPhotos ? myPhotos + ' photo' + (myPhotos > 1 ? 's' : '') + ' added.' : 'A photo of the finished work is required.') + '</p>' +
          '<button type="button" class="btn btn-ink btn-sm fac-wide" data-act="tresolve" data-id="' + t.id + '">Resolve job</button></div>';
        else acts = '<p class="fac-done-m">' + IC.shield + 'This job is ' + esc(t.st.toLowerCase()) + '.</p>';
        screen = '<div class="fac-ph-head"><button type="button" class="fac-back" data-act="tback">' + IC.back + 'Jobs</button></div>' +
          '<div class="fac-ph-sc"><div class="fac-job-top"><span class="fac-id">' + t.id + '</span>' + pri(t.pri) + stp(t) + '</div><h3 tabindex="-1" data-fallback>' + esc(t.txt) + '</h3>' +
          '<dl class="fac-dl"><dt>Where</dt><dd>' + where(t) + '</dd><dt>Asset</dt><dd>' + (a ? esc(a.n) : '–') + '</dd><dt>Reported</dt><dd>' + esc(t.by) + ', ' + when(t.created) + '</dd></dl>' +
          (t.photos.length && t.st !== 'In progress' ? thumbs(t, true) : '') +
          '<div class="fac-safety"><h5>' + IC.warn + 'Safety notes</h5><ul>' + (SAFETY[t.cat] || SAFETY.General).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>' +
          (man ? '<button type="button" class="fac-manual" data-act="doc" data-doc="' + man.id + '">' + IC.book + '<span><b>Open manual</b><small>' + esc(man.name) + '</small></span></button>' : '<p class="fac-hintline">No manual on file for this job.</p>') +
          acts + '<h5 class="fac-h5">Activity</h5>' + activity(t, true) + '</div>';
      }
      return '<div class="fac-tech"><div class="fac-phone"><div class="fac-ph-bar" aria-hidden="true"><span>9:41</span><span class="fac-ph-notch"></span><span>Chris W.</span></div><div class="fac-ph-in">' + screen + '</div></div>' +
        '<div class="fac-col"><section class="fac-card fac-tside"><h3>Field app</h3><p class="fac-sub">This is how the technician sees the work list on a phone. Jobs come from the facility manager’s assignments; safety notes and manuals come from the asset record and the document management system.</p>' +
        '<dl class="fac-dl"><dt>Open jobs</dt><dd>' + openJobs.length + '</dd><dt>Trades</dt><dd>Plumbing, doors & access, general repairs</dd></dl></section>' +
        '<section class="fac-card" data-slot="dms"></section></div></div>';
    }

    /* ---------------- MANAGER VIEW ---------------- */
    function planRoom(k) {
      var n = openIn(k).length, st = roomState(k);
      return '<button type="button" class="room r-' + k + (st ? ' ' + st : '') + (mgr.room === k ? ' sel' : '') + '" data-act="mroom" data-room="' + k + '" aria-pressed="' + (mgr.room === k) + '" aria-label="' + esc(roomLabel(k)) + '"><span class="fac-rn">' + rname(k) + '</span><small data-sv="' + k + '" data-f="t">' + fv(k, 't') + '</small>' + (n ? '<i class="fac-rb" aria-hidden="true">' + n + '</i>' : '') + '</button>';
    }
    function avgT() { var s = 0; ROOMS.forEach(function (k) { if (k !== 'wh' && k !== 'dock' && k !== 'server') s += R[k].t; }); return (s / 8).toFixed(1) + ' °C'; }
    function mgrTabs() {
      var nNew = T.filter(function (t) { return t.st === 'New'; }).length;
      var tabs = [['overview', 'Overview', 0], ['tickets', 'Tickets', nNew], ['maint', 'Maintenance', 0], ['costs', 'Contracts & costs', 0], ['docs', 'Documents', 0]];
      return '<div class="fac-tabs" role="group" aria-label="Manager sections">' + tabs.map(function (x) { return '<button type="button" data-act="mtab" data-tab="' + x[0] + '" aria-pressed="' + (mgr.tab === x[0]) + '">' + x[1] + (x[2] ? '<i class="fac-cnt" aria-label="' + x[2] + ' new">' + x[2] + '</i>' : '') + '</button>'; }).join('') + '</div>';
    }
    function attention() {
      var items = [];
      T.filter(function (t) { return t.st === 'New'; }).forEach(function (t) {
        items.push('<li><span class="fac-dot bad"></span><div><b>' + t.id + ' · ' + esc(t.txt) + '</b><small>' + (t.room ? esc(R[t.room].n) : '<span class="fac-tbc">Location to be confirmed</span>') + ' · reported by ' + esc(t.by) + '</small></div>' + quickAssign(t) + '</li>');
      });
      var cert = docOf('d-cert-el');
      if (cert && /due/i.test(cert.status)) items.push('<li><span class="fac-dot warn"></span><div><b>Elevator EL-01 inspection certificate</b><small>' + esc(cert.status) + (state.inspBooked ? ' · inspection requested' : '') + '</small></div><button type="button" class="btn btn-ghost btn-sm" data-act="doc" data-doc="d-cert-el">Open</button></li>');
      A.filter(function (a) { return a.health < 60 && !a.wo; }).forEach(function (a) { items.push('<li><span class="fac-dot warn"></span><div><b>' + esc(a.n) + ' · health ' + a.health + '%</b><small>AI forecast (simulated): ' + esc(a.note) + '</small></div><button type="button" class="btn btn-ghost btn-sm" data-act="mwo" data-id="' + a.id + '">Create work order</button></li>'); });
      var ren = docOf('d-c-clean27');
      if (ren && /review/i.test(ren.status)) items.push('<li><span class="fac-dot warn"></span><div><b>Cleaning contract renewal 2027</b><small>Draft waiting for your approval</small></div><button type="button" class="btn btn-ghost btn-sm" data-act="doc" data-doc="d-c-clean27">Review</button></li>');
      return items.length ? '<ul class="fac-att">' + items.join('') + '</ul>' : '<p class="fac-empty">All clear.</p>';
    }
    function quickAssign(t) {
      if (t.st !== 'New') return '';
      if (!t.room) return '<button type="button" class="btn btn-ghost btn-sm" data-act="mopen" data-id="' + t.id + '">Set location</button>';
      if (!TEAMS[t.cat]) return '<button type="button" class="btn btn-ghost btn-sm" data-act="mopen" data-id="' + t.id + '">Choose team</button>';
      return '<button type="button" class="btn btn-ink btn-sm fac-qa" data-act="qassign" data-id="' + t.id + '" title="Suggested by AI (simulated)">' + ICON.spark + 'Assign ' + esc(t.cat) + ' · ' + esc(TEAMS[t.cat][0].split(' (')[0]) + '</button>';
    }
    function renderOverview() {
      var open = T.filter(openT), k = mgr.room, r = R[k], inRoom = openIn(k), assets = A.filter(function (a) { return a.room === k; });
      return '<div class="kpi-row fac-kpis"><div class="kpi"><span>Open tickets</span><b>' + open.length + '</b><small>Floor 1</small></div>' +
        '<div class="kpi"><span>Need assignment</span><b>' + T.filter(function (t) { return t.st === 'New'; }).length + '</b><small>new reports</small></div>' +
        '<div class="kpi"><span>Critical</span><b>' + open.filter(function (t) { return t.pri === 'Critical'; }).length + '</b><small>open now</small></div>' +
        '<div class="kpi"><span>Avg. office temp.</span><b data-live="avg">' + avgT() + '</b><small>42/42 sensors online</small></div></div>' +
        '<div class="fac-ov"><section class="fac-card"><div class="fac-card-h"><h3>Floor 1 · live sensors</h3><span class="fac-livetag">Live, every 3 s</span></div>' +
        '<div class="fplan fac-plan">' + ROOMS.map(planRoom).join('') + '</div>' +
        '<div class="legend"><span><i style="background:var(--teal-soft);border-color:var(--line-2)"></i>Normal</span><span><i style="background:var(--warn-soft);border-color:var(--line-2)"></i>Attention</span><span><i style="background:var(--bad-soft);border-color:var(--line-2)"></i>Urgent ticket</span></div>' +
        '<div class="fac-roominfo"><h4>' + esc(r.n) + '</h4><div class="fac-sensors"><span>Temperature<b data-sv="' + k + '" data-f="t">' + fv(k, 't') + '</b></span><span>Humidity<b data-sv="' + k + '" data-f="h">' + fv(k, 'h') + '</b></span><span>CO₂<b data-sv="' + k + '" data-f="c">' + fv(k, 'c') + '</b></span></div>' +
        (inRoom.length ? '<ul class="fac-mini-l">' + inRoom.map(function (t) { return '<li><button type="button" class="fac-rowbtn" data-act="mopen" data-id="' + t.id + '"><span class="fac-id">' + t.id + '</span><span>' + esc(t.txt) + '</span>' + pri(t.pri) + '</button></li>'; }).join('') + '</ul>' : '<p class="fac-hintline">No open tickets in this room.</p>') +
        (assets.length ? '<p class="fac-hintline">Assets: ' + assets.map(function (a) { return esc(a.n) + ' (health ' + a.health + '%)'; }).join(', ') + '</p>' : '') + '</div></section>' +
        '<section class="fac-card"><h3>Needs your attention</h3>' + attention() + '</section></div>';
    }
    function filteredTickets() {
      var q = mgr.q.toLowerCase();
      return T.filter(function (t) {
        if (mgr.fst === 'open' && !openT(t)) return false;
        if (mgr.fst !== 'open' && mgr.fst !== 'all' && t.st !== mgr.fst) return false;
        if (mgr.fpri !== 'all' && t.pri !== mgr.fpri) return false;
        if (mgr.fteam !== 'all' && (t.team || 'Unassigned') !== mgr.fteam) return false;
        if (mgr.ftbc && t.room) return false;
        return !q || (t.id + ' ' + t.txt + ' ' + t.by + ' ' + (t.room ? R[t.room].n : 'location to be confirmed') + ' ' + t.cat + ' ' + t.tech).toLowerCase().indexOf(q) > -1;
      });
    }
    function ticketRows() {
      var L = filteredTickets();
      return '<p class="fac-count">' + L.length + ' ticket' + (L.length === 1 ? '' : 's') + '</p>' + (L.length ? '<ul class="fac-tl">' + L.map(function (t) {
        return '<li class="fac-tr"><button type="button" class="fac-tr-main" data-act="mopen" data-id="' + t.id + '"><span class="fac-id">' + t.id + '</span><span class="fac-tr-t"><b>' + esc(t.txt) + '</b><small>' + (t.room ? esc(R[t.room].n) : 'Location to be confirmed') + ' · ' + esc(t.cat) + ' · ' + esc(t.by) + ' · ' + when(t.created) + '</small></span></button>' +
          '<span class="fac-tr-who">' + (t.tech ? esc(t.tech) + '<small>' + esc(t.team) + '</small>' : '<small>Unassigned</small>') + '</span><span class="fac-tr-p">' + pri(t.pri) + stp(t) + '</span>' + (t.st === 'New' ? '<span class="fac-tr-a">' + quickAssign(t) + '</span>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="fac-empty">No tickets match these filters.</p>');
    }
    function renderTickets() {
      var sel = function (name, cur, opts) { return '<select data-chg="' + name + '" aria-label="' + name.slice(1) + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (cur === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; };
      var teams = [['all', 'All teams'], ['Unassigned', 'Unassigned']].concat(Object.keys(TEAMS).map(function (x) { return [x, x]; }));
      return '<section class="fac-card"><div class="fac-card-h"><h3>All tickets</h3></div>' +
        '<div class="fac-filters"><label class="sda-search">' + ICON.search + '<input type="search" data-fk="mq" data-chg="mq" placeholder="Search tickets, rooms, people" aria-label="Search tickets" value="' + esc(mgr.q) + '"></label>' +
        '<label class="fac-f">Status' + sel('fst', mgr.fst, [['open', 'Open'], ['all', 'All'], ['New', 'New'], ['Assigned', 'Assigned'], ['Accepted', 'Accepted'], ['In progress', 'In progress'], ['Resolved', 'Resolved'], ['Closed', 'Closed']]) + '</label>' +
        '<label class="fac-f">Priority' + sel('fpri', mgr.fpri, [['all', 'All'], ['Critical', 'Critical'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']]) + '</label>' +
        '<label class="fac-f">Team' + sel('fteam', mgr.fteam, teams) + '</label>' +
        '<label class="fac-chk"><input type="checkbox" data-chg="ftbc"' + (mgr.ftbc ? ' checked' : '') + '>Location to be confirmed</label></div>' +
        '<div class="fac-tlist" aria-live="polite">' + ticketRows() + '</div></section>';
    }
    function renderMaint() {
      var cert = docOf('d-cert-el'), fire = docOf('d-cert-fire');
      return '<div class="fac-ov"><section class="fac-card"><div class="fac-card-h"><h3>Predictive maintenance</h3><span class="fac-simtag">AI forecast (simulated)</span></div><ul class="fac-assets">' +
        A.slice().sort(function (x, y) { return x.health - y.health; }).map(function (a) {
          var col = a.health < 50 ? 'var(--bad)' : a.health < 75 ? 'var(--warn)' : 'var(--ok)';
          return '<li><div class="fac-as-h"><b>' + esc(a.n) + '</b><span class="meter"><i><b style="width:' + a.health + '%;background:' + col + '"></b></i>' + a.health + '%</span></div><p>' + esc(a.note) + '</p><small>' + esc(R[a.room].n) + ' · ' + esc(a.team) + (a.contract ? ' · contract ' + a.contract : '') + '</small>' +
            '<div class="btn-row">' + (a.wo ? '<span class="pill p-ok">Work order ' + a.wo + '</span>' : '<button type="button" class="btn btn-ink btn-sm" data-act="mwo" data-id="' + a.id + '">Create work order</button>') +
            (a.manual ? '<button type="button" class="btn btn-ghost btn-sm" data-act="doc" data-doc="' + a.manual + '">' + IC.book + 'Manual</button>' : '') + '</div></li>';
        }).join('') + '</ul></section>' +
        '<section class="fac-card"><h3>Inspection certificates</h3><ul class="fac-certs">' +
        '<li><div><b>Elevator EL-01</b><small>' + esc(cert.status) + ' · statutory annual inspection</small></div><span class="pill ' + (/due/i.test(cert.status) ? 'p-warn' : 'p-ok') + '">' + esc(cert.status) + '</span><div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-act="doc" data-doc="d-cert-el">Open certificate</button>' +
        (/due/i.test(cert.status) ? (state.inspBooked ? '<span class="pill p-info">Inspection requested · ' + state.inspBooked + '</span>' : '<button type="button" class="btn btn-ink btn-sm" data-act="minsp">Request inspection</button>') : '') + '</div>' +
        (/due/i.test(cert.status) ? '<p class="fac-hintline">After the inspection, upload the new certificate as a new version in Documents.</p>' : '') + '</li>' +
        '<li><div><b>Fire safety (alarm, sprinklers, extinguishers)</b><small>Valid until ' + fmtDate(today(235)) + '</small></div><span class="pill p-ok">' + esc(fire.status) + '</span><div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-act="doc" data-doc="d-cert-fire">Open certificate</button></div></li></ul></section></div>';
    }
    function renderCosts() {
      var adhoc = ADHOC_BASE + COSTS.reduce(function (s, c) { return s + c.labor + c.parts; }, 0);
      var contracts = SPEND.reduce(function (s, x) { return s + x[1]; }, 0), ytd = contracts + adhoc, annual = CONTRACTS.reduce(function (s, c) { return s + c.annual; }, 0);
      var bars = SPEND.concat([['Repairs (ad hoc)', adhoc]]), max = Math.max.apply(null, bars.map(function (b) { return b[1]; }));
      var ren = docOf('d-c-clean27');
      var daysTo = function (d) { return Math.round((d - new Date()) / 864e5); };
      return '<div class="kpi-row fac-kpis"><div class="kpi"><span>Spent this year</span><b>' + SDA.usd(ytd) + '</b><small>' + money(ytd) + ' of ' + money(BUDGET) + '</small></div>' +
        '<div class="kpi"><span>Budget used</span><b>' + Math.round(ytd / BUDGET * 100) + '%</b><small>10 of 12 months passed</small></div>' +
        '<div class="kpi"><span>Contract value / year</span><b>' + SDA.usd(annual) + '</b><small>' + CONTRACTS.length + ' service contracts</small></div>' +
        '<div class="kpi"><span>Ad-hoc repairs</span><b>' + SDA.usd(adhoc) + '</b><small>labor at ' + money(RATE) + '/h + parts</small></div></div>' +
        '<div class="fac-ov"><section class="fac-card"><h3>Service contracts</h3><ul class="fac-contracts">' + CONTRACTS.map(function (c) {
          var dleft = daysTo(c.end), renSt = c.renewal && ren ? ren.status : null;
          return '<li><div class="fac-c-h"><b>' + esc(c.vendor) + '</b><span class="fac-id">' + c.id + '</span></div><p>' + esc(c.scope) + '</p>' +
            '<dl class="fac-dl"><dt>Annual value</dt><dd>' + money(c.annual) + '</dd><dt>Ends</dt><dd>' + fmtDate(c.end) + (dleft < 90 ? ' <span class="pill p-warn">in ' + dleft + ' days</span>' : '') + '</dd><dt>Assets</dt><dd>' + esc(c.assets) + '</dd>' + (renSt ? '<dt>Renewal</dt><dd><span class="pill ' + (/review/i.test(renSt) ? 'p-warn' : 'p-ok') + '">' + esc(renSt) + '</span></dd>' : '') + '</dl>' +
            '<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-act="doc" data-doc="' + c.doc + '">' + ICON.doc + 'Contract</button>' + (c.renewal ? '<button type="button" class="btn btn-' + (/review/i.test(renSt) ? 'ink' : 'ghost') + ' btn-sm" data-act="doc" data-doc="' + c.renewal + '">' + (/review/i.test(renSt) ? 'Review renewal' : 'Renewal') + '</button>' : '') + '</div></li>';
        }).join('') + '</ul></section>' +
        '<section class="fac-card"><h3>Costs this year</h3><ul class="fac-bars">' + bars.map(function (b) { return '<li><span>' + esc(b[0]) + '</span><i><b style="width:' + Math.round(b[1] / max * 100) + '%"></b></i><em>' + money(b[1]) + '</em></li>'; }).join('') + '</ul>' +
        '<h4>Recent repair costs</h4><ul class="fac-costs">' + COSTS.map(function (c) { return '<li><span class="fac-id">' + esc(c.ticket) + '</span><span>' + esc(c.desc) + '<small>' + fmtDate(c.at) + ' · labor ' + money(c.labor, true) + ' · parts ' + money(c.parts, true) + '</small></span><b>' + money(c.labor + c.parts, true) + '</b></li>'; }).join('') + '</ul></section></div>';
    }
    function renderMgr() {
      var body = mgr.tab === 'overview' ? renderOverview() : mgr.tab === 'tickets' ? renderTickets() : mgr.tab === 'maint' ? renderMaint() : mgr.tab === 'costs' ? renderCosts() : '<section class="fac-card" data-slot="dms"></section>';
      return '<div class="fac-mgr">' + mgrTabs() + body + '</div>';
    }

    /* manager ticket drawer */
    function techOptions(team, cur) {
      var people = TEAMS[team] || [];
      return '<option value="">' + (people.length ? 'Select technician…' : 'Choose a team first') + '</option>' + people.map(function (p) { return '<option' + (cur === p ? ' selected' : '') + '>' + esc(p) + '</option>'; }).join('');
    }
    function openDrawer(id) {
      var t = tk(id); if (!t) return;
      var a = t.asset ? asset(t.asset) : null;
      var team = t.team || (TEAMS[t.cat] ? t.cat : ''), techSel = t.tech || (team && TEAMS[team] ? TEAMS[team][0] : '');
      var m = SDA.modal(root, { title: t.id + ' · ' + t.cat, html:
        '<div class="fac-dr"><div class="fac-job-top">' + pri(t.pri) + stp(t) + '</div><p class="fac-dr-t">' + esc(t.txt) + '</p>' +
        '<dl class="fac-dl"><dt>Reported by</dt><dd>' + esc(t.by) + ', ' + when(t.created) + '</dd><dt>Location</dt><dd>' + where(t) + '</dd><dt>Asset</dt><dd>' + (a ? esc(a.n) + (a.manual ? ' <button type="button" class="fac-link" data-m="doc" data-doc="' + a.manual + '">Manual</button>' : '') : '–') + '</dd></dl>' +
        thumbs(t) +
        (t.st === 'New' && TEAMS[t.cat] ? '<p class="fac-aisug">' + ICON.spark + '<span><b>AI (simulated) suggests:</b> ' + esc(t.cat) + ' · ' + esc(TEAMS[t.cat][0]) + (t.room ? '' : '. Confirm the location first.') + '</span></p>' : '') +
        '<div class="fac-form"><label>Location<select name="room">' + roomOptions(t.room) + '</select></label>' +
        '<label>Category<select name="cat">' + CATS.map(function (c) { return '<option' + (c === t.cat ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select></label>' +
        '<label>Priority<select name="pri">' + ['Critical', 'High', 'Medium', 'Low'].map(function (p) { return '<option' + (p === t.pri ? ' selected' : '') + '>' + p + '</option>'; }).join('') + '</select></label>' +
        '<label>Team<select name="team"><option value="">Unassigned</option>' + Object.keys(TEAMS).map(function (x) { return '<option' + (x === team ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('') + '</select></label>' +
        '<label>Technician<select name="tech">' + techOptions(team, techSel) + '</select></label></div>' +
        '<p class="fac-err" role="alert" hidden></p>' +
        '<div class="btn-row">' + (openT(t) ? '<button type="button" class="btn btn-ink btn-sm" data-m="save">' + (t.tech ? 'Save & notify' : 'Assign & notify') + '</button>' : '') +
        (t.st === 'Resolved' ? '<button type="button" class="btn btn-ghost btn-sm" data-m="close">Close ticket</button>' : '') +
        (!openT(t) ? '<button type="button" class="btn btn-ghost btn-sm" data-m="reopen">Reopen</button>' : '') + '</div>' +
        '<h5 class="fac-h5">Activity</h5>' + activity(t, true) +
        '<div class="fac-cmt"><label for="fac-mc">Comment to reporter and technician</label><textarea id="fac-mc" rows="2"></textarea><button type="button" class="btn btn-ghost btn-sm" data-m="comment">' + IC.chat + 'Add comment</button></div></div>' });
      var f = function (n) { return m.body.querySelector('[name="' + n + '"]'); };
      m.body.addEventListener('change', function (e) { if (e.target.name === 'team') f('tech').innerHTML = techOptions(e.target.value, (TEAMS[e.target.value] || [])[0]); });
      m.body.addEventListener('click', function (e) {
        var b = e.target.closest('[data-m]'); if (!b) return;
        var act = b.getAttribute('data-m');
        if (act === 'doc') { m.close(); dms.open(b.getAttribute('data-doc')); return; }
        if (act === 'comment') { var v = m.body.querySelector('#fac-mc').value.trim(); if (!v) { m.body.querySelector('#fac-mc').focus(); return; } log(t, ME.mgr, 'comment', v); m.close(); render(); toast('Comment added. ' + esc(t.by) + ' notified (simulated, not sent).'); return; }
        if (act === 'close') { t.st = 'Closed'; log(t, ME.mgr, 'status', 'Closed by facility manager'); m.close(); render(); toast(t.id + ' closed.'); return; }
        if (act === 'reopen') { t.st = t.tech ? 'Assigned' : 'New'; log(t, ME.mgr, 'status', 'Reopened'); m.close(); render(); toast(t.id + ' reopened.'); return; }
        if (act === 'save') {
          var room = f('room').value || null, team2 = f('team').value, tech2 = f('tech').value, err = m.body.querySelector('.fac-err');
          if (team2 && !tech2) { err.hidden = false; err.textContent = 'Choose a technician for the ' + team2 + ' team.'; f('tech').focus(); return; }
          if (tech2 && !room) { err.hidden = false; err.textContent = 'Confirm the location before you dispatch a technician.'; f('room').focus(); return; }
          var changes = [];
          if (room !== t.room) { changes.push('location ' + (room ? R[room].n : 'to be confirmed')); t.room = room; }
          if (f('cat').value !== t.cat) { t.cat = f('cat').value; changes.push('category ' + t.cat); }
          if (f('pri').value !== t.pri) { t.pri = f('pri').value; changes.push('priority ' + t.pri); }
          t.asset = assetFor(t.cat, t.room);
          var reassigned = tech2 !== t.tech;
          if (reassigned) {
            var was = t.tech; t.team = team2; t.tech = tech2;
            if (tech2) { t.st = 'Assigned'; log(t, ME.mgr, 'status', (was ? 'Reassigned from ' + was + ' to ' : 'Assigned to ') + team2 + ' · ' + tech2); }
            else { t.st = 'New'; log(t, ME.mgr, 'status', 'Unassigned'); }
          }
          if (changes.length) log(t, ME.mgr, 'status', 'Changed ' + changes.join(', '));
          m.close(); afterAssign(t); render();
          toast(reassigned && tech2 ? t.id + ' assigned to ' + esc(tech2) + '. Push notification (simulated, not sent).' : 'Changes saved for ' + t.id + '.');
        }
      });
    }
    function afterAssign(t) { if (isGuide(t) && t.team === 'Plumbing' && t.tech && t.st === 'Assigned') guide.done('assign'); }
    function quickAssignDo(t) {
      t.team = t.cat; t.tech = TEAMS[t.cat][0]; t.st = 'Assigned'; t.asset = assetFor(t.cat, t.room);
      log(t, ME.mgr, 'status', 'Assigned to ' + t.team + ' · ' + t.tech + ' (AI suggestion accepted)');
      afterAssign(t); render();
      toast(t.id + ' assigned to ' + esc(t.tech) + '. Push notification (simulated, not sent).');
    }

    /* ---------------- render ---------------- */
    function focusKey(el) {
      if (!el || !main.contains(el) || el === main) return null;
      if (el.getAttribute('data-fk')) return '[data-fk="' + el.getAttribute('data-fk') + '"]';
      var a = el.getAttribute('data-act') || (el.getAttribute('data-chg') && 'chg'); if (!a) return null;
      var s = el.getAttribute('data-act') ? '[data-act="' + a + '"]' : '[data-chg="' + el.getAttribute('data-chg') + '"]';
      ['data-id', 'data-d', 'data-room', 'data-c', 'data-o', 'data-kind', 'data-tab', 'data-i'].forEach(function (n) { var v = el.getAttribute(n); if (v != null) s += '[' + n + '="' + v + '"]'; });
      return s;
    }
    function render() {
      var had = main.contains(document.activeElement) && document.activeElement !== main, key = focusKey(document.activeElement);
      var html = state.role === 'emp' ? renderEmp() : state.role === 'tech' ? renderTech() : renderMgr();
      if (dmsEl.parentNode) dmsEl.parentNode.removeChild(dmsEl);
      main.innerHTML = html;
      var slot = main.querySelector('[data-slot="dms"]'); if (slot) slot.appendChild(dmsEl);
      if (had) {
        var el = key && main.querySelector(key);
        if (!el) el = main.querySelector('[data-fallback]');
        if (el) el.focus({ preventScroll: true });
      }
    }

    /* ---------------- events ---------------- */
    function focusChange(i) { var x = main.querySelector('[data-act="dchange"][data-d="' + i + '"]'); if (x) x.focus({ preventScroll: true }); }
    function addPhoto(src, label, up) { emp.photo = { src: src, label: label, up: up }; render(); toast('Photo attached. It stays in your browser.'); }
    function techPhoto(t, src, name) {
      var doc = dms.add({ id: 'd-ph-' + t.id + '-' + (t.photos.length + 1), name: name, type: 'jpg', folder: 'Ticket photos', linked: t.id + (t.asset ? ' · ' + t.asset : ''), owner: ME.tech, who: t.by, status: 'Valid', tags: ['ticket photo', 'technician'], img: src, note: 'Taken on site' });
      t.photos.push({ doc: doc.id, by: ME.tech }); log(t, ME.tech, 'status', 'Photo added: ' + name);
      render(); toast('Photo saved to the ticket and to Documents › Ticket photos.');
    }
    main.addEventListener('input', function (e) {
      var el = e.target;
      if (el.getAttribute('data-fk') === 'txt') emp.text = el.value;
      if (el.getAttribute('data-chg') === 'mq') { mgr.q = el.value; main.querySelector('.fac-tlist').innerHTML = ticketRows(); }
    });
    main.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && e.target.getAttribute('data-fk') === 'txt') { e.preventDefault(); emp.text = e.target.value; triage(); }
    });
    main.addEventListener('change', function (e) {
      var el = e.target, c = el.getAttribute('data-chg'), t;
      if (el.getAttribute('data-file')) {
        var file = el.files && el.files[0]; if (!file) return;
        if (!/^image\//.test(file.type)) { toast('Please choose an image file.', 'warn'); return; }
        var src = URL.createObjectURL(file);
        if (el.getAttribute('data-file') === 'emp') addPhoto(src, file.name, true);
        else if ((t = tk(el.getAttribute('data-id')))) techPhoto(t, src, t.id + ' – ' + file.name);
        return;
      }
      if (!c) return;
      if (c === 'droom') { var d = emp.drafts[+el.getAttribute('data-d')]; d.room = el.value || null; d.src = d.room ? 'picked' : null; d.picking = !d.room; render(); if (d.room) { focusChange(el.getAttribute('data-d')); announce('Location set to ' + R[d.room].n); } }
      else if (c === 'eroom' && (t = tk(el.getAttribute('data-id'))) && el.value) { t.room = el.value; t.asset = assetFor(t.cat, t.room); log(t, ME.emp, 'status', 'Location confirmed by reporter: ' + R[t.room].n); render(); toast('Thanks. Location set to ' + R[t.room].n + '.'); }
      else if (c === 'fst' || c === 'fpri' || c === 'fteam') { mgr[c] = el.value; main.querySelector('.fac-tlist').innerHTML = ticketRows(); }
      else if (c === 'ftbc') { mgr.ftbc = el.checked; main.querySelector('.fac-tlist').innerHTML = ticketRows(); }
    });
    main.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b || !main.contains(b)) return;
      var act = b.getAttribute('data-act'), id = b.getAttribute('data-id'), t = id ? tk(id) : null, d;
      var di = b.getAttribute('data-d'); if (di != null && emp.drafts) d = emp.drafts[+di];
      switch (act) {
        case 'doc': dms.open(b.getAttribute('data-doc')); return;
        /* employee */
        case 'ex': emp.text = EXAMPLES[+b.getAttribute('data-i')]; triage(); return;
        case 'triage': emp.text = (main.querySelector('[data-fk="txt"]') || {}).value || emp.text; triage(); return;
        case 'pphoto': var k = b.getAttribute('data-kind'); addPhoto(SDA.art(k, 'Photo from Emma Davis'), 'Example photo: ' + k, false); return;
        case 'pclear': emp.photo = null; render(); return;
        case 'dmode': emp.mode = emp.mode === 'split' ? 'one' : 'split'; buildDrafts(); render(); return;
        case 'dchange': d.picking = true; render(); return;
        case 'dpick': d.room = b.getAttribute('data-room'); d.src = 'picked'; d.picking = false; render(); focusChange(di); announce('Location set to ' + R[d.room].n); return;
        case 'dconf':
          var c = d.conf[+b.getAttribute('data-c')], o = b.getAttribute('data-o'); c.ans = o;
          if (c.type === 'temp') d.detail = { hot: 'too hot', cold: 'too cold', varies: 'temperature changes during the day' }[o];
          if (c.type === 'urg') d.pri = o === 'urgent' ? (d.pri === 'Critical' ? 'Critical' : 'High') : (d.pri === 'Critical' ? 'Critical' : 'Low');
          if (c.type === 'gone' && o === 'drop') d.dropped = true;
          render(); return;
        case 'dundo': d.dropped = false; d.conf.forEach(function (x) { if (x.type === 'gone') x.ans = 'keep'; }); render(); return;
        case 'send': sendDrafts(); return;
        case 'discard': emp.drafts = null; emp.issues = null; render(); var ta = main.querySelector('[data-fk="txt"]'); if (ta) ta.focus(); return;
        case 'eopen': emp.open = emp.open === id ? null : id; render(); return;
        case 'ecomment':
          var ta2 = main.querySelector('[data-fk="ec-' + id + '"]'), v = ta2 && ta2.value.trim();
          if (!v) { ta2 && ta2.focus(); return; }
          log(t, ME.emp, 'comment', v); render(); toast('Comment added. ' + (t.tech ? esc(t.tech) + ' and the' : 'The') + ' facility team are notified (simulated, not sent).'); return;
        case 'econfirm': t.st = 'Closed'; log(t, ME.emp, 'status', 'Confirmed fixed, ticket closed'); render(); toast(t.id + ' closed. Thank you!'); if (isGuide(t)) guide.done('close'); return;
        case 'ereopen': t.st = 'Assigned'; log(t, ME.emp, 'status', 'Reopened by reporter: problem not fixed'); render(); toast(t.id + ' reopened. ' + esc(t.tech || 'The facility team') + ' notified (simulated, not sent).'); return;
        /* technician */
        case 'tlist': tech.list = b.getAttribute('data-i'); render(); return;
        case 'tjob': tech.sel = id; dmsOpts.defaultLink = id; render(); var h = main.querySelector('.fac-ph-sc h3'); if (h) h.focus({ preventScroll: true }); main.querySelector('.fac-ph-in').scrollTop = 0; return;
        case 'tback': tech.sel = null; dmsOpts.defaultLink = ''; render(); var h2 = main.querySelector('.fac-ph-head h3'); if (h2) h2.focus({ preventScroll: true }); return;
        case 'taccept': t.st = 'Accepted'; log(t, ME.tech, 'status', 'Accepted'); render(); toast('Accepted. ' + esc(t.by) + ' sees “Assigned” (notification simulated, not sent).'); return;
        case 'thand': t.st = 'New'; t.tech = ''; t.team = ''; log(t, ME.tech, 'status', 'Handed back to the facility manager'); tech.sel = null; render(); toast(t.id + ' handed back to Sarah Johnson.'); return;
        case 'tstart': t.st = 'In progress'; log(t, ME.tech, 'status', 'Work started on site'); render(); toast('Work started. Reporter sees “In progress”.'); return;
        case 'tphoto': var kd = b.getAttribute('data-kind'), lbl = { leak: 'before', install: 'after repair', damage: 'damage' }[kd]; techPhoto(t, SDA.art(kd, t.id + ' · ' + lbl), t.id + ' – ' + lbl + '.jpg'); return;
        case 'tnote':
          var nt = main.querySelector('[data-fk="tnote"]'), nv = nt && nt.value.trim();
          if (!nv) { nt && nt.focus(); return; }
          log(t, ME.tech, 'note', nv); render(); toast('Note saved to ' + t.id + '.'); return;
        case 'tresolve':
          var res = main.querySelector('[data-fk="tres"]'), rv = res.value.trim();
          var hrs = Math.max(0, parseFloat(main.querySelector('[data-fk="thrs"]').value) || 0), parts = Math.max(0, parseFloat(main.querySelector('[data-fk="tparts"]').value) || 0);
          var terr = main.querySelector('[data-terr]');
          if (!t.photos.some(function (p) { return p.by === ME.tech; })) { terr.hidden = false; terr.textContent = 'Add at least one photo of the finished work before resolving.'; var pb = main.querySelector('[data-act="tphoto"]'); if (pb) pb.focus(); return; }
          if (!rv) { terr.hidden = false; terr.textContent = 'Describe briefly what you did.'; res.focus(); return; }
          t.st = 'Resolved'; log(t, ME.tech, 'note', rv); log(t, ME.tech, 'status', 'Resolved · ' + hrs + ' h · parts ' + money(parts, true));
          COSTS.unshift({ at: new Date(), ticket: t.id, desc: rv.length > 60 ? rv.slice(0, 57) + '…' : rv, labor: Math.round(hrs * RATE * 100) / 100, parts: parts });
          tech.sel = null; render(); toast(t.id + ' resolved. ' + esc(t.by) + ' is asked to confirm (simulated, not sent).');
          if (isGuide(t)) guide.done('resolve');
          return;
        /* manager */
        case 'mtab': mgr.tab = b.getAttribute('data-tab'); render(); return;
        case 'mroom': mgr.room = b.getAttribute('data-room'); render(); return;
        case 'mopen': openDrawer(id); return;
        case 'qassign': quickAssignDo(t); return;
        case 'mwo':
          var a = asset(id); if (!a || a.wo) return;
          var w = { id: 'FM-' + (nextId++), txt: 'Preventive maintenance: ' + a.act + ' (' + a.id + ')', room: a.room, cat: a.team, pri: a.health < 50 ? 'High' : 'Medium', team: a.team, tech: TEAMS[a.team][0], st: 'Assigned', by: 'AI forecast (simulated)', created: new Date(), photos: [], log: [], asset: a.id };
          log(w, 'AI forecast (simulated)', 'ai', a.note); log(w, ME.mgr, 'status', 'Work order created and assigned to ' + w.team + ' · ' + w.tech);
          T.unshift(w); a.wo = w.id; render(); toast('Work order ' + w.id + ' assigned to ' + esc(w.tech) + ' (notification simulated, not sent).'); return;
        case 'minsp':
          var wi = { id: 'FM-' + (nextId++), txt: 'Annual elevator inspection EL-01 before the certificate expires', room: 'stairs', cat: 'Elevator', pri: 'High', team: 'Elevator', tech: TEAMS.Elevator[0], st: 'Assigned', by: ME.mgr, created: new Date(), photos: [], log: [], asset: 'EL-01' };
          log(wi, ME.mgr, 'status', 'Inspection requested from Summit Lift Co.'); T.unshift(wi); state.inspBooked = wi.id; render();
          toast('Inspection request sent to Summit Lift Co. (simulated, not sent).'); return;
      }
    });

    /* ---------------- live sensors: update values in place ---------------- */
    function tick() {
      ROOMS.forEach(function (k) {
        var r = R[k];
        r.t = clamp(r.t + (Math.random() - 0.5) * 0.3, r.t0 - 0.9, r.t0 + 0.9);
        r.h = clamp(r.h + (Math.random() - 0.5) * 1.4, r.h0 - 4, r.h0 + 4);
        r.c = clamp(r.c + (Math.random() - 0.5) * 50, r.c0 - 120, r.c0 + 160);
      });
      var vals = main.querySelectorAll('[data-sv]');
      for (var i = 0; i < vals.length; i++) vals[i].textContent = fv(vals[i].getAttribute('data-sv'), vals[i].getAttribute('data-f'));
      var rooms = main.querySelectorAll('.fac-plan .room');
      for (var j = 0; j < rooms.length; j++) {
        var k = rooms[j].getAttribute('data-room'), st = roomState(k);
        rooms[j].classList.toggle('warn', st === 'warn'); rooms[j].classList.toggle('bad', st === 'bad');
        rooms[j].setAttribute('aria-label', roomLabel(k));
      }
      var avg = main.querySelector('[data-live="avg"]'); if (avg) avg.textContent = avgT();
    }
    ctx.every(3000, tick);

    render();
  });
})();
