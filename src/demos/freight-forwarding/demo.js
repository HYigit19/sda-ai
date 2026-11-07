/* ShipDesk – freight forwarding & customs clearance demo for a UAE forwarder.
   All people, companies, shipments and documents are fictional sample data. Nothing is sent anywhere:
   customs submissions, WhatsApp / e-mail messages and driver notifications are simulated; AI steps are simulated.
   Duty figures are illustrative only (5% of CIF value as an example). */
(function () {
  if (!window.SDA) return;
  SDA.demo('demo-freight', function (root, ctx) {
    var esc = SDA.esc, money = SDA.money, usd = SDA.usd;
    var q = function (s, el) { return (el || root).querySelector(s); };
    var qa = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
    var ico = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var num = function (n) { return Number(n).toLocaleString('en-US'); };
    var r2 = function (n) { return Math.round(n * 100) / 100; };
    var m2 = function (n) { return money(n, Math.round(n * 100) % 100 !== 0); };
    var dLong = function (off) { return SDA.fmtDate(SDA.today(off)); };
    var dShort = function (off) { return SDA.today(off).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    var iso = function (t) { return '\u2066' + String(t).replace(/-/g, '-\u2060') + '\u2069'; };
    var dAr = function (off) { var d = SDA.today(off); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); };
    var rel = function (off) { return off === 0 ? 'Today' : off === 1 ? 'Tomorrow' : off === -1 ? 'Yesterday' : dShort(off); };
    var nowT = function () { return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); };
    var relL = function (off) { var r = rel(off); return /^(Today|Tomorrow|Yesterday)$/.test(r) ? r.toLowerCase() : r; };
    var find = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };
    var initials = function (n) { return String(n || '?').split(' ').filter(Boolean).map(function (x) { return x.charAt(0); }).join('').slice(0, 2).toUpperCase(); };
    var city = function (s) { return String(s).split(',')[0]; };
    var toast = function (m, k) { SDA.toast(root, esc(m), k); };
    var seq = 0;
    var uidf = function () { return 'fx-' + (++seq); };

    var IC = {
      home: ico('<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>'),
      board: ico('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>'),
      list: ico('<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
      scan: ico('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 9h8M8 12h8M8 15h5"/>'),
      shield: ico('<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
      truck: ico('<path d="M2 6h12v10H2z"/><path d="M14 9h4.5L22 12.5V16h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>'),
      ship: ico('<path d="M2.5 14.5h19l-2.2 4.4a1.5 1.5 0 0 1-1.3.8H6a1.5 1.5 0 0 1-1.3-.8z"/><path d="M4.5 14.5v-4h5v4M9.5 14.5v-4h5v4M7 10.5v-4h5v4"/><path d="M16.5 14.5V8h3v6.5"/>'),
      plane: ico('<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'),
      box: ico('<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><path d="M6.5 9v6M10.5 9v6M14.5 9v6M18 9v6"/>'),
      msg: ico('<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/>'),
      mail: ico('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
      phone: ico('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
      invoice: ico('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
      alert: ico('<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
      clock: ico('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
      pin: ico('<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>'),
      download: ico('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>'),
      plus: ico('<path d="M12 5v14M5 12h14"/>'),
      arrow: ico('<path d="M5 12h14M13 6l6 6-6 6"/>'),
      user: ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>'),
      building: ico('<path d="M4 21V5l8-3v19M12 9h8v12M2 21h20M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1"/>'),
      globe: ico('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
      pen: ico('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
      eye: ico('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
      close: SDA.icon.close, doc: SDA.icon.doc, check: SDA.icon.check, spark: SDA.icon.spark, upload: SDA.icon.upload,
      lock: SDA.icon.lock, folder: SDA.icon.folder, img: SDA.icon.img, sheet: SDA.icon.sheet, search: SDA.icon.search
    };
    var modeIc = function (m) { return m === 'air' ? IC.plane : m === 'road' ? IC.truck : IC.ship; };
    var modeTag = function (s, sm) { return '<span class="fx-mode m-' + s.mode + (sm ? ' sm' : '') + '" title="' + (s.mode === 'sea' ? 'Sea freight' : s.mode === 'air' ? 'Air freight' : 'Road freight') + '">' + modeIc(s.mode) + '</span>'; };

    /* ---------------- master data ---------------- */
    var FWD = 'Harbourline Forwarding LLC';
    var ME = { coord: 'Omar Haddad', broker: 'Rajesh Kumar', customer: 'Fatima Al Mansoori' };
    var MYC = 'dp';
    var HOME = { coord: 'home', broker: 'queue', customer: 'portal' };
    var CUST = {
      dp: { id: 'dp', name: 'Desert Palm Furnishings LLC', short: 'Desert Palm', contact: 'Fatima Al Mansoori', first: 'Fatima', firstAr: 'فاطمة', zone: 'Dubai mainland', wh: 'Al Quoz Industrial Area 3, Dubai', whS: 'Al Quoz', whAr: 'منطقة القوز الصناعية 3، دبي', code: 'AE-IMP-104822', phone: '+971 50 *** 4417', mail: 'fatima@desertpalm.example' },
      ge: { id: 'ge', name: 'Gulfline Electronics FZE', short: 'Gulfline', contact: 'Khalid Al Suwaidi', first: 'Khalid', firstAr: 'خالد', zone: 'Jebel Ali Free Zone', fz: true, wh: 'JAFZA South, Jebel Ali Free Zone', whS: 'JAFZA South', whAr: 'جافزا الجنوبية، المنطقة الحرة لجبل علي', code: 'AE-FZ-208311', phone: '+971 55 *** 0932', mail: 'khalid@gulfline.example' },
      of: { id: 'of', name: 'Oasis Fresh Foods LLC', short: 'Oasis Fresh', contact: 'Sarah Johnson', first: 'Sarah', firstAr: 'سارة', zone: 'Sharjah mainland', wh: 'Industrial Area 6, Sharjah', whS: 'Sharjah', whAr: 'المنطقة الصناعية 6، الشارقة', code: 'AE-IMP-117405', phone: '+971 52 *** 7781', mail: 'sarah@oasisfresh.example' },
      mm: { id: 'mm', name: 'Marina Medical Supplies LLC', short: 'Marina Medical', contact: 'Michael Brown', first: 'Michael', firstAr: 'مايكل', zone: 'Abu Dhabi mainland', wh: 'Mussafah M-14, Abu Dhabi', whS: 'Mussafah', whAr: 'مصفح \u2066M-\u206014\u2069، أبوظبي', code: 'AE-IMP-122960', phone: '+971 50 *** 2208', mail: 'michael@marinamedical.example' },
      fa: { id: 'fa', name: 'Falcon Auto Parts FZCO', short: 'Falcon Auto', contact: 'Aisha Rahman', first: 'Aisha', firstAr: 'عائشة', zone: 'Dubai South free zone', fz: true, wh: 'Logistics District, Dubai South', whS: 'Dubai South', whAr: 'المنطقة اللوجستية، دبي الجنوب', code: 'AE-FZ-231078', phone: '+971 56 *** 6150', mail: 'aisha@falconauto.example' }
    };
    var CIDS = ['dp', 'ge', 'of', 'mm', 'fa'];
    var PORT = {
      jea: { n: 'Jebel Ali Port', s: 'Jebel Ali', ar: 'ميناء جبل علي', base: 'Jebel Ali' },
      khp: { n: 'Khalifa Port, Abu Dhabi', s: 'Khalifa Port', ar: 'ميناء خليفة', base: 'Khalifa Port' },
      dwc: { n: 'Dubai South air cargo (DWC)', s: 'Dubai South', ar: 'مطار آل مكتوم الدولي في دبي الجنوب', base: 'Dubai South' },
      ghw: { n: 'Al Ghuwaifat border crossing', s: 'Al Ghuwaifat', ar: 'منفذ الغويفات الحدودي', base: 'Sharjah' }
    };
    var STAGES = ['Booked', 'In transit', 'Arrived at port', 'Customs clearance', 'Released', 'Delivered'];
    var TYPES = {
      local: { n: 'Import for local consumption', rate: 0.05, rl: '5% (example rate)' },
      fz: { n: 'Free zone entry (duty suspended)', rate: 0, rl: '0%, suspended while goods stay in the free zone' },
      gcc: { n: 'GCC national product (duty exempt)', rate: 0, rl: '0%, GCC origin with certificate of origin' }
    };
    var TRUCKS = [
      { id: 'T1', plate: 'Dubai T 48213', kind: '40 ft trailer', driver: 'Imran Sheikh', base: 'Jebel Ali' },
      { id: 'T2', plate: 'Dubai T 51770', kind: '40 ft trailer', driver: 'Joseph Mathew', base: 'Jebel Ali' },
      { id: 'T3', plate: 'Sharjah 3 22918', kind: '20/40 ft trailer', driver: 'Ahmed Saleh', base: 'Sharjah' },
      { id: 'T4', plate: 'Abu Dhabi 7 60412', kind: '40 ft trailer', driver: 'Ravi Menon', base: 'Khalifa Port' },
      { id: 'T5', plate: 'Dubai T 39054', kind: '3-ton box truck', driver: 'Bilal Qureshi', base: 'Dubai South' }
    ];
    var SLOTS = [[0, '15:00', '17:00'], [1, '08:00', '10:00'], [1, '10:00', '12:00'], [1, '14:00', '16:00'], [2, '08:00', '10:00']];
    var slotEn = function (i) { var s = SLOTS[i]; return rel(s[0]) + ', ' + s[1] + '–' + s[2]; };
    var slotLong = function (i) { var s = SLOTS[i]; return dLong(s[0]) + ', ' + s[1] + '–' + s[2]; };
    var slotL = function (i) { var s = SLOTS[i]; return relL(s[0]) + ', ' + s[1] + '–' + s[2]; };
    var slotAr = function (i) { var s = SLOTS[i]; return 'يوم ' + dAr(s[0]) + ' من ' + s[1] + ' إلى ' + s[2]; };

    /* ---------------- shipments ---------------- */
    var L = function (hs, d, qty, u, p) { return { hs: hs, d: d, qty: qty, u: u, p: p }; };
    function defType(s) { return s.mode === 'road' && /Saudi/.test(s.from) ? 'gcc' : CUST[s.c].fz ? 'fz' : 'local'; }
    function mk(o) {
      var s = Object.assign({ stage: 0, conts: [], lines: [], frt: 0, ins: 0, tl: [], updates: [], dg: false }, o);
      s.customs = Object.assign({ st: 'none' }, o.cu || {});
      if (!s.customs.type) s.customs.type = defType(s);
      s.del = Object.assign({ st: 'none' }, o.dl || {});
      delete s.cu; delete s.dl;
      return s;
    }
    var fob = function (s) { return r2(s.lines.reduce(function (a, l) { return a + l.qty * l.p; }, 0)); };
    var cif = function (s) { return r2(fob(s) + Number(s.frt || 0) + Number(s.ins || 0)); };
    var dutyOf = function (s, type) { return r2(cif(s) * TYPES[type || s.customs.type].rate); };

    var SH = [
      mk({ id: 'SD-24102', c: 'ge', mode: 'sea', from: 'Shanghai, China', fromAr: 'شنغهاي، الصين', pod: 'jea', stage: 5, etd: -26, eta: -6, po: 'GL-55120', invNo: 'EBD-2610-118', shipper: 'Eastbay Display Tech Co., Ltd.', carrier: 'Blue Meridian Line', voy: 'MV Pearl Meridian · V.218W', tdoc: 'BMLU2610873', inc: 'FOB',
        conts: [['SDAU 410552-3', '40HC', '0975118']], lines: [L('8528.72', 'LED TV sets, 55 inch', 420, 'pcs', 280), L('8528.52', 'Computer monitors, 27 inch', 600, 'pcs', 115)], gw: 9120, pkgs: '1,020 cartons', frt: 3900, ins: 420,
        cu: { st: 'cleared', no: 'DEC-26-117940', rel: 'REL-26-55812', relOff: -5 }, dl: { st: 'done', truck: 'T2', off: -3, podBy: 'Khalid Al Suwaidi' } }),
      mk({ id: 'SD-24105', c: 'dp', mode: 'sea', from: 'Ningbo, China', fromAr: 'نينغبو، الصين', pod: 'jea', stage: 4, etd: -24, eta: -3, po: 'DP-7702', invNo: 'CLP-26-4410', shipper: 'Coastline Leisure Products Co., Ltd.', carrier: 'Arabian Sea Shipping', voy: 'MV Gulf Venture · V.142W', tdoc: 'ASSU2610455', inc: 'FOB',
        conts: [['SDAU 433018-2', '40HC', '1120456'], ['SDAU 433291-6', '40HC', '1120457']], lines: [L('9401.79', 'Outdoor lounge sets, aluminium frame', 85, 'sets', 390), L('9403.20', 'Patio tables, metal', 120, 'pcs', 145)], gw: 11480, pkgs: '410 cartons', frt: 5600, ins: 190,
        cu: { st: 'cleared', no: 'DEC-26-118215', rel: 'REL-26-56104', relOff: -1 } }),
      mk({ id: 'SD-24109', c: 'dp', mode: 'sea', from: 'Nansha, China', fromAr: 'نانشا، الصين', pod: 'jea', stage: 3, etd: -19, eta: -1, po: 'DP-7745', invNo: 'LHF-26-0744', shipper: 'Lumen Home Furniture Co., Ltd.', carrier: 'Blue Meridian Line', voy: 'MV Coral Dawn · V.608W', tdoc: 'BMLU2610998', inc: 'FOB',
        conts: [['SDAU 471120-5', '40HC', '0979904']], lines: [L('9401.61', 'Upholstered sofas, wooden frame', 64, 'pcs', 520), L('9401.61', 'Upholstered armchairs, wooden frame', 96, 'pcs', 210)], gw: 6240, pkgs: '160 packages', frt: 2950, ins: 160,
        cu: { st: 'query', no: 'DEC-26-118377', query: { short: 'product catalogue needed to confirm HS 9401.61', text: 'Please provide a product catalogue showing the frame material and upholstery of the sofas and armchairs, to confirm classification under HS 9401.61.', need: 'Product catalogue', fromCust: true, got: null } } }),
      mk({ id: 'SD-24111', c: 'of', mode: 'sea', from: 'Nhava Sheva, India', fromAr: 'نهافا شيفا، الهند', pod: 'jea', stage: 2, etd: -14, eta: 0, po: 'OF-3318', invNo: 'KAE/26/2291', shipper: 'Kaveri Agro Exports Pvt. Ltd.', carrier: 'Arabian Sea Shipping', voy: 'MV Indus Star · V.077W', tdoc: 'ASSU2611020', inc: 'FOB',
        conts: [['GFLU 205514-9', '20GP', '2214410'], ['GFLU 205762-1', '20GP', '2214411']], lines: [L('1006.30', 'Basmati rice, 25 kg bags', 2000, 'bags', 24.5), L('0909.31', 'Cumin seeds, 10 kg bags', 400, 'bags', 38)], gw: 54400, pkgs: '2,400 bags', frt: 1850, ins: 140 }),
      mk({ id: 'SD-24114', c: 'mm', mode: 'sea', from: 'Hamburg, Germany', fromAr: 'هامبورغ، ألمانيا', pod: 'khp', stage: 1, etd: -17, eta: 5, po: 'MM-0912', invNo: 'NMS-26-03318', shipper: 'Nordhafen Medical Supplies GmbH', carrier: 'Blue Meridian Line', voy: 'MV Northern Pearl · V.031E', tdoc: 'BMLU2610911', inc: 'FOB',
        conts: [['SDAU 225870-4', '20GP', '0981102']], lines: [L('9018.31', 'Disposable syringes', 120000, 'pcs', 0.09), L('3005.90', 'Sterile wound dressings', 30000, 'pcs', 0.62), L('9402.90', 'Examination couches', 12, 'pcs', 1450)], gw: 7850, pkgs: '412 cartons', frt: 3100, ins: 210 }),
      mk({ id: 'SD-24116', c: 'fa', mode: 'air', from: 'Frankfurt, Germany', fromAr: 'فرانكفورت، ألمانيا', pod: 'dwc', stage: 3, etd: -3, eta: -1, po: 'FA-2207', invNo: 'RBT-88104', shipper: 'Rhein Bremsen Technik GmbH', carrier: 'Skyport Cargo', voy: 'Flight SK 517', tdoc: 'AWB SKC-20447183', inc: 'FCA',
        conts: [['PMC 40418 SK', 'ULD pallet', '—'], ['PMC 40422 SK', 'ULD pallet', '—']], lines: [L('8708.30', 'Brake pads and discs', 2400, 'sets', 21), L('9031.80', 'Engine sensors', 800, 'pcs', 38)], gw: 3140, pkgs: '86 cartons', frt: 6200, ins: 240,
        cu: { st: 'submitted', no: 'DEC-26-118402' } }),
      mk({ id: 'SD-24118', c: 'ge', mode: 'air', from: 'Shenzhen, China', fromAr: 'شنتشن، الصين', pod: 'dwc', stage: 2, etd: -2, eta: 0, po: 'GL-55188', invNo: 'PRA-26-7730', shipper: 'Pearl River Audio Co., Ltd.', carrier: 'Skyport Cargo', voy: 'Flight SK 288', tdoc: 'AWB SKC-20448215', inc: 'FCA',
        conts: [['PMC 51207 SK', 'ULD pallet', '—']], lines: [L('8518.30', 'Wireless earbuds', 3000, 'pcs', 14), L('8504.40', 'USB-C phone chargers', 5000, 'pcs', 4.2)], gw: 1860, pkgs: '124 cartons', frt: 4400, ins: 160,
        cu: { st: 'draft', by: 'Omar Haddad', at: '09:10' } }),
      mk({ id: 'SD-24120', c: 'of', mode: 'road', from: 'Riyadh, Saudi Arabia', fromAr: 'الرياض، السعودية', pod: 'ghw', stage: 1, etd: -1, eta: 1, po: 'OF-3325', invNo: 'NVF-1147', shipper: 'Najd Valley Foods Co.', carrier: 'Peninsula Road Freight', voy: 'Truck KSA 7421 · reefer trailer', tdoc: 'CMR 26-04417', inc: 'DAP',
        conts: [['KSA 7421', 'Reefer trailer', 'S-55120']], lines: [L('0804.10', 'Dates, packed 5 kg', 1200, 'cartons', 18), L('2009.89', 'Fruit juices', 2400, 'cartons', 7.5)], gw: 18600, pkgs: '3,600 cartons', frt: 2200, ins: 80 }),
      mk({ id: 'SD-24122', c: 'mm', mode: 'air', from: 'Chennai, India', fromAr: 'تشيناي، الهند', pod: 'dwc', stage: 0, etd: 1, eta: 4, po: 'MM-0930', invNo: 'CHP/26/0418', shipper: 'Coromandel Healthcare Products Ltd.', carrier: 'Skyport Cargo', voy: 'Flight SK 644', tdoc: 'AWB SKC-20449002', inc: 'FCA',
        conts: [['PMC 33018 SK', 'ULD pallet', '—']], lines: [L('4015.19', 'Nitrile examination gloves, box of 100', 8000, 'boxes', 4.1)], gw: 4200, pkgs: '800 cartons', frt: 2600, ins: 90 }),
      mk({ id: 'SD-24124', c: 'dp', mode: 'sea', from: 'Istanbul, Türkiye', fromAr: 'إسطنبول، تركيا', pod: 'jea', stage: 1, etd: -12, eta: 9, po: 'DP-7760', invNo: 'BTH-2026-311', shipper: 'Bosphorus Textile Home A.S.', carrier: 'Arabian Sea Shipping', voy: 'MV Anatolia Bay · V.052S', tdoc: 'ASSU2610780', inc: 'FOB',
        conts: [['GFLU 418805-0', '40HC', '2213007']], lines: [L('5702.42', 'Machine-woven rugs', 380, 'pcs', 96), L('6304.93', 'Cushion covers', 2000, 'pcs', 4.8)], gw: 7300, pkgs: '210 bales', frt: 2700, ins: 150 }),
      mk({ id: 'SD-24126', c: 'fa', mode: 'road', from: 'Dammam, Saudi Arabia', fromAr: 'الدمام، السعودية', pod: 'ghw', stage: 0, etd: 1, eta: 3, po: 'FA-2215', invNo: 'EPB-26-0907', shipper: 'Eastern Province Battery Industries', carrier: 'Peninsula Road Freight', voy: 'Truck KSA 6610 · flatbed', tdoc: 'CMR 26-04452', inc: 'DAP', dg: true,
        conts: [['KSA 6610', 'Flatbed trailer', 'S-55187']], lines: [L('8507.10', 'Lead-acid starter batteries', 640, 'pcs', 62)], gw: 14100, pkgs: '40 pallets', frt: 1650, ins: 110 }),
      mk({ id: 'SD-24128', c: 'ge', mode: 'sea', from: 'Busan, South Korea', fromAr: 'بوسان، كوريا الجنوبية', pod: 'jea', stage: 4, etd: -21, eta: -2, po: 'GL-55161', invNo: 'HBC-26-1180', shipper: 'Hanbit Computing Co., Ltd.', carrier: 'Blue Meridian Line', voy: 'MV Pearl Meridian · V.219W', tdoc: 'BMLU2610940', inc: 'FOB',
        conts: [['SDAU 452019-8', '40HC', '0977815']], lines: [L('8471.30', 'Laptop computers', 600, 'pcs', 395)], gw: 5400, pkgs: '600 cartons', frt: 2800, ins: 520,
        cu: { st: 'cleared', no: 'DEC-26-118290', rel: 'REL-26-56077', relOff: -1 }, dl: { st: 'out', truck: 'T1', slot: 0 } })
    ];
    var ship = function (id) { return find(SH, id); };

    /* the shipment hidden in the sample e-mail (created by AI intake) */
    var NEWID = 'SD-24131';
    var NEWT = { id: NEWID, c: 'dp', mode: 'sea', from: 'Nansha, China', fromAr: 'نانشا، الصين', pod: 'jea', stage: 2, etd: -18, eta: 0, po: 'DP-7781', invNo: 'LHF-26-0781', shipper: 'Lumen Home Furniture Co., Ltd.', carrier: 'Blue Meridian Line', voy: 'MV Coral Horizon · V.611W', tdoc: 'BMLU2611042', inc: 'FOB',
      conts: [['SDAU 482193-7', '40HC', '0981432'], ['SDAU 482417-0', '40HC', '0981433']], lines: [L('9403.60', 'Solid wood dining tables', 60, 'pcs', 420), L('9401.61', 'Upholstered dining chairs', 240, 'pcs', 68), L('9403.60', 'Sideboards, wooden', 30, 'pcs', 310)],
      gw: 8640, ciGw: 8460, pkgs: '268 cartons', frt: 4200, ins: 180 };

    /* timeline seed */
    function seed(s) {
      var t = [], p = PORT[s.pod], cu = s.customs, tr = s.del.truck && find(TRUCKS, s.del.truck);
      t.push({ off: s.etd - 6, time: '10:20', who: 'Omar Haddad', text: 'Booking confirmed with ' + s.carrier });
      if (s.stage >= 1) t.push({ off: s.etd, time: '18:40', who: 'Carrier feed (simulated)', text: (s.mode === 'road' ? 'Truck departed ' : 'Departed ') + s.from });
      if (s.stage >= 2) t.push({ off: s.eta, time: '06:15', who: 'Port feed (simulated)', text: 'Arrived at ' + p.n });
      if (cu.st === 'draft') t.push({ off: 0, time: cu.at, who: 'Omar Haddad', text: 'Customs declaration prepared and sent to the broker', int: true });
      if (/submitted|query|answered|cleared/.test(cu.st)) t.push({ off: Math.min(0, s.eta), time: '11:30', who: 'Rajesh Kumar', text: 'Declaration ' + cu.no + ' submitted to customs' });
      if (cu.st === 'query') t.push({ off: 0, time: '08:45', who: 'Customs (simulated)', text: 'Customs query: ' + cu.query.short });
      if (cu.st === 'cleared') t.push({ off: cu.relOff, time: '13:05', who: 'Customs (simulated)', text: 'Released by customs · ' + cu.rel });
      if (tr) t.push({ off: s.del.st === 'done' ? s.del.off - 1 : -1, time: '16:20', who: 'Omar Haddad', text: 'Truck ' + tr.plate + ' assigned, driver ' + tr.driver });
      if (s.del.st === 'out' || s.del.st === 'done') t.push({ off: s.del.st === 'done' ? s.del.off : 0, time: s.del.st === 'done' ? '09:05' : '14:40', who: tr.driver, text: 'Out for delivery to ' + CUST[s.c].wh });
      if (s.del.st === 'done') t.push({ off: s.del.off, time: '11:20', who: tr.driver, text: 'Delivered · proof of delivery signed by ' + s.del.podBy });
      s.tl = t;
    }
    SH.forEach(seed);

    /* ---------------- customer messages (English + Arabic) ---------------- */
    function msgFor(s) {
      var c = CUST[s.c], p = PORT[s.pod], cu = s.customs, id = s.id, po = s.po, kind;
      var en = 'Hello ' + c.first + ', ', ar = 'مرحباً ' + c.firstAr + '، ';
      if (s.stage === 0) {
        kind = 'Booking confirmed';
        en += 'your shipment ' + id + ' (PO ' + po + ') is booked with ' + s.carrier + '. Planned departure from ' + s.from + ': ' + dLong(s.etd) + '. Expected arrival at ' + p.n + ': ' + dLong(s.eta) + '.';
        ar += 'تم حجز شحنتكم ' + iso(id) + ' (أمر الشراء ' + iso(po) + '). المغادرة المخططة من ' + s.fromAr + ': ' + dAr(s.etd) + '. الوصول المتوقع إلى ' + p.ar + ': ' + dAr(s.eta) + '.';
      } else if (s.stage === 1) {
        kind = 'In transit';
        en += 'your shipment ' + id + ' (PO ' + po + ') is on its way from ' + s.from + '. Expected arrival at ' + p.n + ': ' + dLong(s.eta) + '. We will update you on arrival.';
        ar += 'شحنتكم ' + iso(id) + ' (أمر الشراء ' + iso(po) + ') في الطريق من ' + s.fromAr + '. الوصول المتوقع إلى ' + p.ar + ': ' + dAr(s.eta) + '. سنبلغكم عند الوصول.';
      } else if (s.stage === 2) {
        kind = 'Arrived';
        en += 'your shipment ' + id + ' (PO ' + po + ') arrived at ' + p.n + ' on ' + dLong(s.eta) + '. We are now preparing customs clearance and will keep you updated.';
        ar += 'وصلت شحنتكم ' + iso(id) + ' (أمر الشراء ' + iso(po) + ') إلى ' + p.ar + ' بتاريخ ' + dAr(s.eta) + '. نعمل الآن على إجراءات التخليص الجمركي وسنوافيكم بالمستجدات.';
      } else if (s.stage === 3 && cu.st === 'query') {
        var need = cu.query.fromCust && !cu.query.got;
        kind = 'Customs query';
        en += 'customs has asked for more information on shipment ' + id + '. We are handling it' + (need ? ' and need the ' + cu.query.need.toLowerCase() + ' from you. Please upload it in the customer portal' : '') + '. We will confirm as soon as it is released.';
        ar += 'طلبت الجمارك معلومات إضافية بخصوص شحنتكم ' + iso(id) + '. نحن نتابع الطلب' + (need ? '، ونرجو رفع المستند المطلوب عبر بوابة العملاء' : '') + '. سنؤكد لكم فور الإفراج عنها.';
      } else if (s.stage === 3) {
        kind = 'In customs';
        en += 'shipment ' + id + ' (PO ' + po + ') is in customs clearance at ' + p.n + '. We will let you know as soon as it is released.';
        ar += 'شحنتكم ' + iso(id) + ' (أمر الشراء ' + iso(po) + ') قيد التخليص الجمركي في ' + p.ar + '. سنبلغكم فور الإفراج عنها.';
      } else if (s.stage === 4) {
        kind = 'Released';
        en += 'good news: shipment ' + id + ' (PO ' + po + ') has cleared customs and is released at ' + p.n + '. ';
        ar += 'تم التخليص الجمركي لشحنتكم ' + iso(id) + ' (أمر الشراء ' + iso(po) + ') والإفراج عنها في ' + p.ar + '. ';
        if (s.del.st === 'out') { kind = 'Out for delivery'; en += 'It is on its way to ' + c.wh + ' now.'; ar += 'الشحنة في الطريق الآن إلى ' + c.whAr + '.'; }
        else if (s.del.st === 'scheduled') { kind = 'Delivery scheduled'; en += 'Delivery to ' + c.wh + ' is planned for ' + slotLong(s.del.slot) + '.'; ar += 'التوصيل إلى ' + c.whAr + ' مقرر ' + slotAr(s.del.slot) + '.'; }
        else { en += 'We will confirm the delivery slot to ' + c.wh + ' shortly.'; ar += 'سنؤكد لكم موعد التوصيل إلى ' + c.whAr + ' قريباً.'; }
      } else {
        kind = 'Delivered';
        en += 'shipment ' + id + ' (PO ' + po + ') was delivered to ' + c.wh + ' on ' + dLong(s.del.off) + '. The signed proof of delivery is in your customer portal. Thank you for shipping with Harbourline.';
        ar += 'تم تسليم شحنتكم ' + iso(id) + ' (أمر الشراء ' + iso(po) + ') إلى ' + c.whAr + ' بتاريخ ' + dAr(s.del.off) + '. إثبات التسليم الموقّع متاح في بوابة العملاء. شكراً لتعاملكم مع هاربورلاين.';
      }
      return { kind: kind, en: en + '\n— Omar, Harbourline Forwarding', ar: ar + '\n— عمر، هاربورلاين للشحن' };
    }
    [['SD-24105', -1, '15:10', 'wa'], ['SD-24109', 0, '09:20', 'mail'], ['SD-24124', -11, '10:05', 'wa'], ['SD-24102', -3, '11:40', 'mail'], ['SD-24128', 0, '14:45', 'wa']].forEach(function (x) {
      var s = ship(x[0]), m = msgFor(s);
      s.updates.push({ off: x[1], time: x[2], ch: x[3], kind: m.kind, en: m.en, ar: m.ar, by: 'Omar Haddad' });
    });

    /* ---------------- invoices (to importers) ---------------- */
    var INV = [
      { id: 'HF-INV-2610-0341', ship: 'SD-24071', c: 'dp', off: -34, due: -4, status: 'Paid', items: [['Ocean freight Qingdao – Jebel Ali, 1×40HC', 2850], ['Customs clearance and documentation', 350], ['Customs duty paid on your behalf', 2310], ['Delivery Jebel Ali – Al Quoz', 480]] },
      { id: 'HF-INV-2611-0388', ship: 'SD-24105', c: 'dp', off: -1, due: 29, status: 'Due', items: [['Ocean freight Ningbo – Jebel Ali, 2×40HC', 5600], ['Customs clearance and documentation', 350], ['Customs duty paid on your behalf (5% of CIF, illustrative)', dutyOf(ship('SD-24105'))], ['Port handling and delivery order fees', 620]] }
    ];
    var invTotal = function (v) { return r2(v.items.reduce(function (a, i) { return a + i[1]; }, 0)); };

    /* ---------------- documents ---------------- */
    var link = function (s) { return s.id + ' · ' + CUST[s.c].short; };
    function base(s, o) { return Object.assign({ type: 'pdf', linked: link(s), cust: s.c, ship: s.id, owner: 'Omar Haddad', status: 'Valid', date: dLong(Math.min(0, s.etd - 2)) }, o); }
    function ciDoc(s) {
      var c = CUST[s.c];
      return base(s, { name: 'Commercial invoice ' + s.invNo + '.pdf', folder: 'Commercial docs', owner: s.shipper, tags: ['invoice', 'PO ' + s.po], title: 'Commercial invoice', company: s.shipper,
        meta: [['Invoice no', s.invNo], ['PO', s.po], ['Incoterm', s.inc + ' ' + city(s.from)], ['Currency', 'USD']],
        sections: [{ h: 'Seller', p: s.shipper + ', ' + s.from }, { h: 'Buyer', p: c.name + ', ' + c.wh + ', UAE' },
          { h: 'Goods', rows: [['HS code', 'Description', 'Qty', 'Unit price', 'Amount']].concat(s.lines.map(function (l) { return [l.hs, l.d, num(l.qty) + ' ' + l.u, m2(l.p), m2(l.qty * l.p)]; })) },
          { h: 'Totals', head: false, rows: [['Total ' + s.inc, m2(fob(s))], ['Gross weight', num(s.ciGw || s.gw) + ' kg'], ['Packages', s.pkgs]] }] });
    }
    function tdocKind(s) { return s.mode === 'sea' ? 'Bill of lading' : s.mode === 'air' ? 'Air waybill' : 'CMR road consignment note'; }
    function tdocDoc(s) {
      var k = tdocKind(s);
      return base(s, { name: k + ' ' + s.tdoc.replace('AWB ', '').replace('CMR ', '') + '.pdf', folder: 'Commercial docs', owner: s.carrier, tags: ['transport', s.tdoc], title: k, company: s.carrier,
        meta: [[s.mode === 'sea' ? 'B/L no' : s.mode === 'air' ? 'AWB no' : 'CMR no', s.tdoc], [s.mode === 'sea' ? 'Vessel' : s.mode === 'air' ? 'Flight' : 'Truck', s.voy], ['From', s.from], ['To', PORT[s.pod].n]],
        sections: [{ h: 'Shipper', p: s.shipper }, { h: 'Consignee', p: CUST[s.c].name + ', UAE' }, { h: 'Notify party', p: FWD + ', Dubai' },
          { h: s.mode === 'air' ? 'Units' : s.mode === 'road' ? 'Vehicle' : 'Containers', rows: [['Number', 'Type', 'Seal']].concat(s.conts) },
          { h: 'Cargo', head: false, rows: [['Packages', s.pkgs], ['Gross weight', num(s.gw) + ' kg'], ['Description', s.lines.map(function (l) { return l.d; }).join('; ')]] }] });
    }
    function plDoc(s) {
      var tot = fob(s), left = s.gw;
      var rows = s.lines.map(function (l, i) { var w = i === s.lines.length - 1 ? left : Math.round(s.gw * l.qty * l.p / tot / 10) * 10; left -= w; return [l.d, num(l.qty) + ' ' + l.u, num(w) + ' kg']; });
      return base(s, { name: 'Packing list ' + s.invNo + '.pdf', folder: 'Commercial docs', owner: s.shipper, tags: ['packing'], title: 'Packing list', company: s.shipper,
        meta: [['Invoice ref', s.invNo], ['PO', s.po], ['Packages', s.pkgs]], sections: [{ h: 'Packing', rows: [['Description', 'Qty', 'Gross weight']].concat(rows).concat([['Total', '', num(s.gw) + ' kg']]) }] });
    }
    function coDoc(s) {
      return base(s, { name: 'Certificate of origin ' + s.invNo + '.pdf', folder: 'Customs', owner: s.shipper, tags: ['origin'], title: 'Certificate of origin', company: 'Chamber of Commerce (sample)',
        meta: [['Country of origin', s.from.split(', ')[1]], ['Invoice ref', s.invNo], ['Certificate no', 'CO-' + s.invNo.replace(/\W/g, '').slice(-6)]],
        sections: [{ h: 'Exporter', p: s.shipper + ', ' + s.from }, { h: 'Consignee', p: CUST[s.c].name + ', United Arab Emirates' },
          { h: 'Goods', rows: [['HS code', 'Description', 'Quantity']].concat(s.lines.map(function (l) { return [l.hs, l.d, num(l.qty) + ' ' + l.u]; })) },
          { h: 'Declaration', p: 'It is hereby certified that the goods described above originate in ' + s.from.split(', ')[1] + '. Sample document for demonstration only.' }] });
    }
    function declDoc(s) {
      var cu = s.customs, c = CUST[s.c], t = TYPES[cu.type], du = dutyOf(s);
      return base(s, { name: 'Customs declaration ' + s.id + '.pdf', folder: 'Customs', decl: s.id, tags: ['declaration'], owner: cu.by || 'Omar Haddad', status: 'For broker review', date: dLong(0),
        title: cu.no ? 'Import declaration ' + cu.no : 'Import declaration (draft)', company: FWD,
        meta: [['Type', t.n], ['Port of entry', PORT[s.pod].n], ['Importer', c.name], ['Importer code', c.code]],
        sections: [{ h: 'Goods', rows: [['HS code', 'Description', 'Qty', 'Value (USD)']].concat(s.lines.map(function (l) { return [l.hs, l.d, num(l.qty) + ' ' + l.u, m2(l.qty * l.p)]; })) },
          { h: 'Valuation', head: false, rows: [['FOB value', m2(fob(s))], ['Freight', m2(s.frt)], ['Insurance', m2(s.ins)], ['CIF value', m2(cif(s))], ['Duty rate', t.rl], ['Duty estimate (illustrative)', m2(du)]] },
          { h: 'Note', p: 'Illustrative sample. The duty shown is an example (5% of CIF value for local consumption). Actual duty depends on HS code, origin, exemptions and the customs valuation.' }] });
    }
    function relDoc(s) {
      var cu = s.customs;
      return base(s, { name: 'Customs release ' + cu.rel + '.pdf', folder: 'Customs', tags: ['release'], owner: 'Customs (simulated)', status: 'Released', date: dLong(Math.min(0, cu.relOff || 0)), title: 'Release note ' + cu.rel, company: 'Customs (simulated)',
        meta: [['Declaration', cu.no], ['Port', PORT[s.pod].n], ['Importer', CUST[s.c].name]],
        sections: [{ h: 'Release', p: 'Goods under declaration ' + cu.no + ' are released for ' + (cu.type === 'fz' ? 'entry into the free zone' : 'delivery') + '. Simulated document, not issued by any authority.' },
          { h: 'Units', rows: [['Number', 'Type', 'Seal']].concat(s.conts) }] });
    }
    function podDoc(s, by, cond) {
      return base(s, { name: 'Proof of delivery ' + s.id + '.jpg', type: 'jpg', folder: 'Delivery', tags: ['POD'], owner: find(TRUCKS, s.del.truck).driver, status: 'Signed', date: dLong(Math.min(0, s.del.off || 0)),
        img: SDA.art('signature', 'Received by ' + by + (cond ? ' · ' + cond : '')) });
    }
    function agreeDoc(c) {
      return { name: 'Service agreement 2026 – ' + c.short + '.pdf', type: 'pdf', folder: 'Contracts', cust: c.id, linked: c.name, owner: 'Michael Brown', status: 'Signed', date: dLong(-120), title: 'Forwarding and customs services agreement', company: FWD,
        meta: [['Customer', c.name], ['Term', 'Jan 1 – Dec 31, 2026'], ['Payment', '30 days net']],
        sections: [{ h: 'Scope', lines: ['Sea, air and road freight to the UAE', 'Customs clearance as licensed broker (sample)', 'Last-mile delivery to ' + c.wh, 'Duties paid on the customer’s behalf are re-invoiced at cost'] },
          { h: 'Service levels', p: 'Shipment status updates in English and Arabic at every milestone. Customer portal access for documents and invoices.' }] };
    }
    var DOCS = [];
    SH.forEach(function (s) {
      DOCS.push(ciDoc(s)); DOCS.push(tdocDoc(s));
      if (s.mode === 'sea') DOCS.push(plDoc(s));
      if (s.customs.type === 'gcc') DOCS.push(coDoc(s));
      if (s.customs.st !== 'none') { var d = declDoc(s); d.status = { draft: 'For broker review', submitted: 'Submitted', query: 'Pending – customs query', cleared: 'Cleared' }[s.customs.st] || 'Submitted'; DOCS.push(d); }
      if (s.customs.st === 'cleared') DOCS.push(relDoc(s));
      if (s.del.st === 'done') DOCS.push(podDoc(s, s.del.podBy, 'good condition'));
    });
    CIDS.forEach(function (k) { DOCS.push(agreeDoc(CUST[k])); });
    DOCS.push({ name: 'Carrier rate agreement 2026 – Blue Meridian Line.xlsx', type: 'xlsx', folder: 'Contracts', internal: true, linked: 'Carrier contracts', owner: 'Michael Brown', status: 'Signed', title: 'Carrier rate agreement 2026', company: 'Blue Meridian Line',
      meta: [['Valid', 'Jan 1 – Dec 31, 2026'], ['Visibility', 'Internal only']], sections: [{ h: 'Ocean rates to Jebel Ali (USD)', rows: [['Lane', '20GP', '40HC'], ['Shanghai / Ningbo', '1,350', '2,450'], ['Nansha', '1,280', '2,100'], ['Hamburg', '1,650', '2,900']] }] });
    DOCS.push({ name: 'Carrier rate agreement 2026 – Skyport Cargo.xlsx', type: 'xlsx', folder: 'Contracts', internal: true, linked: 'Carrier contracts', owner: 'Michael Brown', status: 'Signed', title: 'Air freight rate agreement 2026', company: 'Skyport Cargo',
      meta: [['Valid', 'Jan 1 – Dec 31, 2026'], ['Visibility', 'Internal only']], sections: [{ h: 'Rates to DWC (USD per kg)', rows: [['Origin', '+100 kg', '+500 kg', '+1000 kg'], ['Frankfurt', '2.10', '1.85', '1.70'], ['Shenzhen', '2.40', '2.15', '1.95'], ['Chennai', '1.25', '1.10', '0.98']] }] });

    var ready = false;
    var dmsFilter = function (d, r) { return r === 'coord' ? true : r === 'broker' ? !d.internal : (d.cust === MYC && !d.internal); };
    var dmsEl = document.createElement('div');
    dmsEl.className = 'fx-dms';
    var dms = SDA.dms(dmsEl, {
      root: root, title: 'Shipment documents', docs: DOCS, role: 'coord',
      folders: ['Commercial docs', 'Customs', 'Delivery', 'Contracts'],
      canUpload: function () { return true; },
      canApprove: function (r) { return r === 'broker'; },
      filter: dmsFilter,
      userName: function (r) { return ME[r]; },
      uploadFolder: 'Commercial docs', uploadStatus: 'In review',
      onChange: function (docs, d, act) {
        if (!ready) return;
        if (!act) { docs.forEach(function (x) { if (x.cust === undefined && x.tags && x.tags.indexOf('uploaded') > -1) { x.cust = role === 'customer' ? MYC : null; } }); dms.render(); }
        if (act === 'add') return;
        if (act === 'approve' && d && d.decl) { var s = ship(d.decl); if (s && s.customs.st === 'draft') { submitDecl(s); return; } }
        if (view !== 'dms') render(); else paintNav();
      }
    });
    function syncDeclIds() { dms.docs().forEach(function (d) { if (d.decl && ship(d.decl)) ship(d.decl).customs.doc = d.id; }); }
    syncDeclIds();
    var docById = function (id) { return dms.docs().filter(function (d) { return d.id === id; })[0]; };
    var docsFor = function (s) { return dms.docs().filter(function (d) { return d.ship === s.id && dmsFilter(d, role); }); };

    /* ---------------- intake (sample e-mail with four documents) ---------------- */
    function intakeDocs() {
      var t = mk(Object.assign({}, NEWT, { lines: NEWT.lines.map(function (l) { return Object.assign({}, l); }) }));
      var ci = ciDoc(t); ci.name = 'CI_LHF-26-0781.pdf'; ci.k = 'ci'; ci.kind = 'Commercial invoice'; ci.conf = 99;
      var pl = base(t, { name: 'PL_LHF-26-0781.pdf', folder: 'Commercial docs', owner: t.shipper, tags: ['packing'], title: 'Packing list', company: t.shipper,
        meta: [['Invoice ref', 'LHF-26-0781'], ['PO', 'DP-7781'], ['Containers', '2 × 40HC']],
        sections: [{ h: 'Packing', rows: [['Description', 'Qty', 'Cartons', 'Gross kg'], ['Solid wood dining tables', '60 pcs', '120', '3,720'], ['Upholstered dining chairs', '236 pcs', '118', '2,360'], ['Sideboards, wooden', '30 pcs', '30', '2,560'], ['Total', '', '268', '8,640']] },
          { h: 'Notes', p: 'Volume 128 CBM. Chairs packed 2 per carton. Shipping marks: DP-7781 / JEBEL ALI / 1-268.' }] });
      pl.k = 'pl'; pl.kind = 'Packing list'; pl.conf = 98;
      var bl = tdocDoc(t); bl.name = 'BL_BMLU2611042.pdf'; bl.k = 'bl'; bl.kind = 'Bill of lading'; bl.conf = 99;
      var co = coDoc(t); co.name = 'CO_LHF-26-0781.pdf'; co.k = 'co'; co.kind = 'Certificate of origin'; co.conf = 97;
      return [ci, pl, bl, co];
    }
    var DOCK = intakeDocs();
    var INTAKE = { loaded: false, phase: 'idle', step: 0, res: { wt: null, qty: null }, sel: { wt: null, qty: null }, own: [], created: false };
    var MM = {
      wt: { title: 'Gross weight differs between documents', vals: [['Commercial invoice', '8,460 kg', 1], ['Packing list', '8,640 kg'], ['Bill of lading', '8,640 kg']],
        ai: 'Packing list and B/L agree. The invoice figure looks like swapped digits (8,460 instead of 8,640).',
        opts: { pl: { label: 'Use 8,640 kg (packing list and B/L)', short: '8,640 kg from packing list and B/L' }, ci: { label: 'Use 8,460 kg (commercial invoice)', short: '8,460 kg from the commercial invoice' } } },
      qty: { title: 'Quantity differs: upholstered dining chairs', vals: [['Commercial invoice', '240 pcs', 1], ['Packing list', '236 pcs · 118 cartons'], ['Bill of lading', '268 cartons in total']],
        ai: 'The B/L carton count matches the packing list, so 4 chairs were probably not shipped. Declaring 240 would overstate the value by $272.',
        opts: { pl: { label: 'Declare 236 pcs and ask the shipper for a corrected invoice', short: '236 pcs declared, corrected invoice requested from the shipper (e-mail simulated, not sent)' }, ci: { label: 'Declare 240 pcs as invoiced', short: '240 pcs declared as invoiced' } } }
    };
    var INSTEPS = ['Classifying 4 documents', 'Reading text and tables', 'Extracting shipment fields and HS codes', 'Cross-checking invoice, packing list and B/L'];

    /* ---------------- shell: roles, guide, nav ---------------- */
    var nav = q('.fx-nav'), main = q('.fx-main'), drawer = q('.fx-drawer'), scrim = q('.fx-scrim');
    var role = 'coord', view = 'home', openId = null, dTab = 'ov', lastFocus = null;
    var ui = { layout: 'board', q: '', mode: 'all', cust: 'all', stage: 'all', eta: 'all', qtab: 'review', upd: 'SD-24105', ch: 'wa', gen: null, genBusy: false, lang: 'en', pf: 'active' };

    var guide = SDA.guide(q('.fx-guide'), {
      title: 'From shipping documents to an informed importer', demoId: 'demo-freight',
      cta: { href: (location.pathname.indexOf('/use-cases/') > -1 ? '../' : '') + 'contact.html?topic=freight-forwarding', text: 'Talk to us about your version' },
      steps: [
        { id: 'intake', text: 'As <b>Omar</b>, open <b>AI intake</b>, import the shipper’s documents, confirm the flagged differences and create the shipment' },
        { id: 'decl', text: 'Create the customs declaration for ' + NEWID + ' and send it to the broker' },
        { id: 'customs', text: 'As <b>Rajesh</b> (customs broker), approve and submit it, then answer the customs query' },
        { id: 'update', text: 'As <b>Omar</b>, send Fatima the update for ' + NEWID + ' in English and Arabic' },
        { id: 'customer', text: 'As <b>Fatima</b> (customer), open ' + NEWID + ' and view its documents' }
      ]
    });
    SDA.roles(q('.fx-roles'), {
      title: 'View as', value: role,
      roles: [
        { id: 'coord', label: 'Operations', person: 'Omar Haddad', icon: IC.board, sub: 'Operations coordinator: all shipments, AI document intake, customs drafts, delivery and customer updates.' },
        { id: 'broker', label: 'Customs broker', person: 'Rajesh Kumar', icon: IC.shield, sub: 'Clearance queue: review and submit declarations, answer customs queries. Cannot change shipment stages.' },
        { id: 'customer', label: 'Customer', person: 'Fatima Al Mansoori', icon: IC.building, sub: 'Importer portal of Desert Palm Furnishings LLC: only your own shipments, documents, updates and invoices.' }
      ],
      onChange: function (r) {
        role = r; view = HOME[r]; openId = null; ui.q = ''; ui.mode = 'all'; ui.cust = 'all'; ui.stage = 'all'; ui.eta = 'all';
        dms.setRole(r); render(true);
      }
    });

    var NAV = {
      coord: [['home', 'Today', IC.home], ['board', 'Shipments', IC.board], ['intake', 'AI intake', IC.scan], ['customs', 'Customs', IC.shield], ['delivery', 'Delivery', IC.truck], ['updates', 'Updates', IC.msg], ['dms', 'Documents', IC.folder]],
      broker: [['queue', 'Clearance', IC.shield], ['holds', 'Queries', IC.alert], ['board', 'All shipments', IC.list], ['dms', 'Documents', IC.folder]],
      customer: [['portal', 'Shipments', IC.box], ['cupdates', 'Updates', IC.msg], ['invoices', 'Invoices', IC.invoice], ['dms', 'Documents', IC.folder]]
    };
    var needsDecl = function (s) { return s.stage >= 1 && s.stage <= 3 && (s.customs.st === 'none' || s.customs.st === 'returned'); };
    var custNeed = function (s) { var qy = s.customs.query; return s.customs.st === 'query' && qy && qy.fromCust && !qy.got; };
    function counts() {
      return {
        intake: INTAKE.created ? 0 : 1,
        customs: SH.filter(function (s) { return s.stage >= 2 && needsDecl(s); }).length,
        delivery: SH.filter(function (s) { return s.stage === 4 && s.del.st === 'none'; }).length,
        queue: SH.filter(function (s) { return s.customs.st === 'draft'; }).length,
        holds: SH.filter(function (s) { return s.customs.st === 'query'; }).length,
        portal: SH.filter(function (s) { return s.c === MYC && custNeed(s); }).length,
        invoices: INV.filter(function (v) { return v.c === MYC && v.status === 'Due'; }).length
      };
    }
    function paintNav() {
      var c = counts();
      nav.innerHTML = NAV[role].map(function (n) {
        var k = c[n[0]];
        return '<button type="button" data-v="' + n[0] + '"' + (view === n[0] ? ' aria-current="page"' : '') + '>' + n[2] + '<span>' + n[1] + '</span>' + (k ? '<i class="cnt" aria-label="' + k + ' open">' + k + '</i>' : '') + '</button>';
      }).join('');
      var a = q('[aria-current="page"]', nav);
      if (a && nav.scrollWidth > nav.clientWidth + 2) { if (a.offsetLeft < nav.scrollLeft || a.offsetLeft + a.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = Math.max(0, a.offsetLeft - 12); }
      else nav.scrollLeft = 0;
    }
    function go(v) { view = v; render(true); }

    /* ---------------- small UI helpers ---------------- */
    var head = function (t, sub, acts) { return '<div class="v-head fx-head"><div><h3>' + t + '</h3>' + (sub ? '<p class="fx-sub">' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="fx-acts">' + acts + '</div>' : '') + '</div>'; };
    var btn = function (a, label, cls, data) { return '<button type="button" class="btn btn-sm ' + (cls || 'btn-ghost') + '" data-a="' + a + '"' + (data || '') + '>' + label + '</button>'; };
    var kpis = function (arr) { return '<div class="kpi-row fx-kpis">' + arr.map(function (k) { return '<div class="kpi' + (k[3] ? ' ' + k[3] : '') + '"><span>' + k[0] + '</span><b>' + k[1] + '</b><small>' + k[2] + '</small></div>'; }).join('') + '</div>'; };
    var sel = function (f, opts, val, label) { return '<label class="fx-sel"><span class="fx-sr">' + label + '</span><select data-f="' + f + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>'; };
    var empty = function (t) { return '<div class="sda-empty">' + t + '</div>'; };
    var aiNote = function (t) { return '<p class="fx-ai-note">' + IC.spark + '<span>' + t + '</span></p>'; };
    var contSum = function (s) {
      if (s.mode === 'air') return s.conts.length + ' ULD' + (s.conts.length > 1 ? 's' : '');
      if (s.mode === 'road') return 'FTL · ' + s.conts[0][1].toLowerCase();
      var by = {}; s.conts.forEach(function (c) { by[c[1]] = (by[c[1]] || 0) + 1; });
      return Object.keys(by).map(function (k) { return by[k] + '×' + k; }).join(', ');
    };
    var route = function (s) { return esc(city(s.from)) + ' → ' + esc(PORT[s.pod].s); };
    var etaTxt = function (s) { return s.stage === 5 ? 'Delivered ' + relL(s.del.off) : s.stage >= 2 ? 'Arrived ' + relL(s.eta) : 'ETA ' + relL(s.eta); };
    function stagePill(s) {
      var cls = ['p-dim', 'p-info', 'p-info', 'p-warn', 'p-ok', 'p-ok'][s.stage];
      return '<span class="pill ' + cls + '">' + STAGES[s.stage] + '</span>';
    }
    function custPill(s) {
      var m = { none: ['No declaration', 'p-dim'], draft: [role === 'broker' ? 'To review' : role === 'customer' ? 'Being prepared' : 'With broker', 'p-warn'], returned: ['Returned', 'p-bad'], submitted: ['Submitted', 'p-info'], query: ['Customs query', 'p-bad'], answered: ['Query answered', 'p-info'], cleared: ['Cleared', 'p-ok'] }[s.customs.st];
      return '<span class="pill ' + m[1] + '">' + m[0] + '</span>';
    }
    function flags(s) {
      var f = [];
      if (role === 'customer') { if (custNeed(s)) f.push(['Document requested', 'p-bad']); if (s.del.st === 'out') f.push(['On the road', 'p-info']); return f; }
      if (s.customs.st === 'query') f.push(['Customs query', 'p-bad']);
      if (s.customs.st === 'returned') f.push(['Declaration returned', 'p-bad']);
      if (s.stage >= 2 && needsDecl(s) && s.customs.st === 'none') f.push(['No declaration', 'p-warn']);
      if (s.customs.st === 'draft') f.push(['Broker review', 'p-warn']);
      if (s.stage === 4 && s.del.st === 'none') f.push(['Truck needed', 'p-warn']);
      if (s.del.st === 'out') f.push(['On the road', 'p-info']);
      if (s.dg) f.push(['DG class 8', 'p-warn']);
      return f;
    }
    var flagsHtml = function (s) { var f = flags(s); return f.length ? '<span class="fx-flags">' + f.map(function (x) { return '<span class="pill ' + x[1] + '">' + x[0] + '</span>'; }).join('') + '</span>' : ''; };
    function nextStep(s) {
      var cu = s.customs.st;
      if (s.stage === 5) return 'Done · POD on file';
      if (cu === 'query') return custNeed(s) ? 'Waiting for importer document' : 'Broker answers query';
      if (cu === 'draft') return 'Broker review';
      if (cu === 'returned') return 'Fix declaration';
      if (cu === 'submitted' || cu === 'answered') return 'Waiting for customs';
      if (s.stage === 0) return 'Departs ' + relL(s.etd);
      if (s.stage === 1) return cu === 'cleared' ? 'Pre-cleared, arrives ' + relL(s.eta) : 'Arrives ' + relL(s.eta);
      if (s.stage === 2 && cu === 'none') return 'Create declaration';
      if (s.stage === 4) return s.del.st === 'none' ? 'Assign truck' : s.del.st === 'scheduled' ? 'Delivery ' + slotL(s.del.slot) : 'Out for delivery';
      return '';
    }
    var visible = function (s) { return role !== 'customer' || s.c === MYC; };
    var visShips = function () { return SH.filter(visible); };
    function tlAdd(s, text, who, internal) { s.tl.push({ off: 0, time: nowT(), who: who || ME[role], text: text, int: !!internal }); }
    function trk(s, cls) {
      return '<ol class="fx-trk' + (cls ? ' ' + cls : '') + '" aria-label="Progress: ' + STAGES[s.stage] + '">' + STAGES.map(function (st, i) {
        var c = i < s.stage || s.stage === 5 ? 'done' : i === s.stage ? 'cur' : '';
        return '<li class="' + c + '"' + (i === s.stage ? ' aria-current="step"' : '') + '><i></i><span>' + st + '</span></li>';
      }).join('') + '</ol>';
    }
    function dutyBox(s, type) {
      var t = TYPES[type], c = cif(s), du = r2(c * t.rate);
      return '<div class="fx-duty"><h5>Duty estimate</h5><dl><dt>FOB value</dt><dd>' + m2(fob(s)) + '</dd><dt>+ Freight</dt><dd>' + m2(Number(s.frt)) + '</dd><dt>+ Insurance</dt><dd>' + m2(Number(s.ins)) + '</dd><dt class="t">CIF value</dt><dd class="t">' + m2(c) + '</dd><dt>Duty rate</dt><dd>' + esc(t.rl) + '</dd></dl>' +
        '<div class="fx-duty-big"><small>Estimated duty</small><b>' + m2(du) + '</b></div><p class="fx-illu">' + IC.alert + '<span>Illustrative only: 5% of CIF value as an example. Actual duty depends on HS code, origin, exemptions and the customs valuation.</span></p></div>';
    }

    /* ---------------- views: operations coordinator ---------------- */
    function attention() {
      var A = [];
      if (!INTAKE.created) A.push({ ic: IC.mail, t: 'New documents from Lumen Home Furniture', s: '4 attachments for PO DP-7781 · vessel due at Jebel Ali today', b: btn('go', IC.scan + 'Open AI intake', 'btn-ink', ' data-v="intake"') });
      SH.forEach(function (s) {
        if (s.stage >= 2 && needsDecl(s)) A.push({ ic: IC.shield, t: s.id + (s.customs.st === 'returned' ? ' · declaration returned by the broker' : ' · arrived, no customs declaration yet'), s: CUST[s.c].short + ' · ' + route(s) + ' · ' + contSum(s), b: btn('decl', 'Create declaration', 'btn-ghost', ' data-id="' + s.id + '"') });
        if (s.customs.st === 'query') A.push({ ic: IC.alert, t: s.id + ' · customs query', s: custNeed(s) ? 'Waiting for ' + s.customs.query.need.toLowerCase() + ' from ' + CUST[s.c].short : 'With the customs broker', b: '<button type="button" class="btn btn-ghost btn-sm" data-open="' + s.id + '" data-tab="customs">Open</button>', bad: true });
        if (s.stage === 4 && s.del.st === 'none') A.push({ ic: IC.truck, t: s.id + ' · released, no truck assigned', s: CUST[s.c].short + ' · ' + PORT[s.pod].s + ' → ' + esc(CUST[s.c].whS), b: btn('assign', 'Assign truck', 'btn-ghost', ' data-id="' + s.id + '"') });
      });
      return A.length ? A.map(function (a) { return '<div class="fx-att-i' + (a.bad ? ' bad' : '') + '"><span class="fx-att-ic">' + a.ic + '</span><span class="fx-li-b"><b>' + a.t + '</b><small>' + a.s + '</small></span>' + a.b + '</div>'; }).join('') : empty('All clear. Nothing needs your attention.');
    }
    function arrRow(s) {
      return '<button type="button" class="fx-li" data-open="' + s.id + '">' + modeTag(s) + '<span class="fx-li-b"><b>' + s.id + ' · ' + esc(CUST[s.c].short) + '</b><small>' + route(s) + ' · ' + contSum(s) + '</small></span><span class="fx-eta"><b>' + rel(s.eta) + '</b><small>' + (s.stage >= 2 ? 'arrived' : 'ETA') + '</small></span></button>';
    }
    function vHome() {
      var act = SH.filter(function (s) { return s.stage < 5; });
      var soon = SH.filter(function (s) { return s.stage <= 1 && s.eta <= 3; });
      var inCu = SH.filter(function (s) { return /draft|submitted|query|answered|returned/.test(s.customs.st); });
      var ready2 = SH.filter(function (s) { return s.stage === 4 && s.del.st === 'none'; });
      var arr = SH.filter(function (s) { return s.stage <= 2 && s.eta <= 7; }).sort(function (a, b) { return a.eta - b.eta; });
      return head('Good morning, Omar', dLong(0) + ' · Dubai operations desk', btn('go', IC.scan + 'AI document intake', 'btn-ink', ' data-v="intake"') + btn('go', IC.board + 'Shipment board', 'btn-ghost', ' data-v="board"')) +
        kpis([['Active shipments', act.length, 'booked to released'], ['Arriving ≤ 3 days', soon.length, 'sea, air and road'], ['In customs', inCu.length, SH.filter(function (s) { return s.customs.st === 'query'; }).length + ' with an open query'], ['Ready for delivery', ready2.length, 'released, no truck yet']]) +
        '<div class="fx-grid2"><section class="panel"><h4 class="fx-h4">Needs attention</h4><div class="fx-stack">' + attention() + '</div></section>' +
        '<section class="panel"><h4 class="fx-h4">Arrivals · next 7 days</h4><div class="fx-stack">' + (arr.length ? arr.map(arrRow).join('') : empty('No arrivals.')) + '</div></section></div>';
    }

    function filtered() {
      var Q = ui.q.trim().toLowerCase();
      return visShips().filter(function (s) {
        if (ui.mode !== 'all' && s.mode !== ui.mode) return false;
        if (ui.cust !== 'all' && s.c !== ui.cust) return false;
        if (ui.stage === 'hold') { if (s.customs.st !== 'query') return false; }
        else if (ui.stage !== 'all' && s.stage !== +ui.stage) return false;
        if (ui.eta === '3' && !(s.stage <= 1 && s.eta <= 3)) return false;
        if (ui.eta === '7' && !(s.stage <= 1 && s.eta <= 7)) return false;
        if (ui.eta === 'arr' && s.stage < 2) return false;
        if (!Q) return true;
        var hay = [s.id, s.po, 'PO ' + s.po, s.tdoc, s.shipper, s.from, CUST[s.c].name, PORT[s.pod].n, s.voy, s.customs.no || ''].concat(s.conts.map(function (c) { return c[0]; })).concat(s.lines.map(function (l) { return l.hs + ' ' + l.d; })).join(' ').toLowerCase();
        return hay.indexOf(Q) > -1;
      });
    }
    function vBoard() {
      var ro = role === 'broker';
      var acts = ro ? '' : '<div class="fx-seg" role="group" aria-label="Layout"><button type="button" data-a="layout" data-l="board" aria-pressed="' + (ui.layout === 'board') + '">' + IC.board + 'Board</button><button type="button" data-a="layout" data-l="list" aria-pressed="' + (ui.layout === 'list') + '">' + IC.list + 'List</button></div>' + btn('go', IC.scan + 'New from documents', 'btn-ink', ' data-v="intake"');
      return head(ro ? 'All shipments' : 'Shipment board', ro ? 'Read-only for customs. Stage changes are made by operations.' : 'Every shipment from booking to delivery. Click a shipment for timeline, containers, documents and duties.', acts) +
        '<div class="fx-tb"><label class="fx-search">' + IC.search + '<span class="fx-sr">Search shipments</span><input type="search" data-f="q" placeholder="ID, PO, container, B/L, HS code…" value="' + esc(ui.q) + '"></label>' +
        '<div class="fx-chips" role="group" aria-label="Transport mode">' + [['all', 'All'], ['sea', 'Sea'], ['air', 'Air'], ['road', 'Road']].map(function (m) { return '<button type="button" class="fx-chip" data-a="mode" data-m="' + m[0] + '" aria-pressed="' + (ui.mode === m[0]) + '">' + (m[0] === 'all' ? '' : modeIc(m[0])) + m[1] + '</button>'; }).join('') + '</div>' +
        '<div class="fx-fr">' + sel('cust', [['all', 'All customers']].concat(CIDS.map(function (k) { return [k, CUST[k].short]; })), ui.cust, 'Customer') +
        sel('stage', [['all', 'All stages']].concat(STAGES.map(function (s, i) { return [String(i), s]; })).concat([['hold', 'Customs query']]), ui.stage, 'Status') +
        sel('eta', [['all', 'Any ETA'], ['3', 'Arriving ≤ 3 days'], ['7', 'Arriving ≤ 7 days'], ['arr', 'Already arrived']], ui.eta, 'ETA') + '</div></div>' +
        '<p class="fx-sum" aria-live="polite"></p><div class="fx-results"></div>';
    }
    function card(s) {
      return '<button type="button" class="fx-card' + (s.id === NEWID ? ' new' : '') + (openId === s.id ? ' sel' : '') + '" data-open="' + s.id + '"><span class="fx-card-h">' + modeTag(s, true) + '<b>' + s.id + '</b></span>' +
        '<span class="fx-card-c">' + esc(CUST[s.c].short) + '</span><small>' + route(s) + '</small><span class="fx-card-f"><span>' + etaTxt(s) + '</span><span>' + contSum(s) + '</span></span>' + flagsHtml(s) + '</button>';
    }
    function rowHtml(s) {
      return '<button type="button" class="fx-row' + (openId === s.id ? ' sel' : '') + '" data-open="' + s.id + '">' + modeTag(s) +
        '<span class="fx-r-id"><b>' + s.id + '</b><small>PO ' + s.po + '</small></span><span class="fx-r-c"><b>' + esc(CUST[s.c].short) + '</b><small>' + route(s) + ' · ' + contSum(s) + '</small></span>' +
        '<span class="fx-r-eta"><b>' + (s.stage === 5 ? rel(s.del.off) : rel(s.eta)) + '</b><small>' + (s.stage === 5 ? 'delivered' : s.stage >= 2 ? 'arrived' : 'ETA') + '</small></span>' +
        '<span class="fx-r-st">' + stagePill(s) + (s.customs.st !== 'none' && s.customs.st !== 'cleared' ? custPill(s) : '') + '</span><span class="fx-r-next">' + esc(nextStep(s)) + '</span></button>';
    }
    function renderResults() {
      var box = q('.fx-results', main); if (!box) return;
      var Lx = filtered(), all = visShips().length, on = ui.q || ui.mode !== 'all' || ui.cust !== 'all' || ui.stage !== 'all' || ui.eta !== 'all';
      q('.fx-sum', main).innerHTML = Lx.length + ' of ' + all + ' shipments' + (on ? ' · <button type="button" class="fx-link" data-a="clearf">Clear filters</button>' : '');
      if (!Lx.length) { box.innerHTML = empty('No shipments match these filters.'); return; }
      if (role !== 'broker' && ui.layout === 'board') {
        var col = function (i) {
          var cs = Lx.filter(function (s) { return s.stage === i; });
          return '<section class="fx-col c' + i + (cs.length ? '' : ' empty') + '" aria-label="' + STAGES[i] + '"><h4>' + STAGES[i] + '<span>' + cs.length + '</span></h4><div class="fx-col-b">' + (cs.length ? cs.map(card).join('') : '<p class="fx-col-e">No shipments</p>') + '</div></section>';
        };
        box.innerHTML = '<div class="fx-kan">' + [0, 1, 2, 3].map(col).join('') + '<div class="fx-col-pair">' + col(4) + col(5) + '</div></div>';
      } else box.innerHTML = '<div class="fx-rows">' + Lx.map(rowHtml).join('') + '</div>';
    }

    /* AI intake */
    function thumb(d, i) {
      var I = INTAKE, read = I.phase === 'done' || (I.phase === 'reading' && I.step >= 1);
      return '<button type="button" class="fx-thumb" data-a="peek" data-i="' + i + '" aria-label="Preview ' + esc(d.name) + '"><span class="fx-thumb-pg" aria-hidden="true">' + SDA.docPage(d) + '</span>' +
        '<span class="fx-thumb-n"><b>' + esc(d.name) + '</b>' + (read ? '<span class="fx-cls">' + IC.spark + esc(d.kind) + ' · ' + d.conf + '%</span>' : '<small>Not read yet</small>') + '</span></button>';
    }
    function mmCard(k) {
      var M = MM[k], I = INTAKE, done = I.res[k];
      if (done) return '<div class="fx-mm ok"><span class="fx-mm-ic">' + IC.check + '</span><div class="fx-mm-b"><b>' + M.title + '</b><p>Confirmed by Omar Haddad: ' + esc(M.opts[done].short) + '</p></div>' + (I.created ? '' : btn('mm-undo', 'Change', 'btn-ghost', ' data-k="' + k + '"')) + '</div>';
      return '<fieldset class="fx-mm"><legend><span class="fx-mm-ic">' + IC.alert + '</span>' + M.title + '</legend>' +
        '<div class="fx-cmp">' + M.vals.map(function (v) { return '<span class="' + (v[2] ? 'odd' : '') + '"><small>' + v[0] + '</small><b>' + v[1] + '</b></span>'; }).join('') + '</div>' +
        aiNote('<b>AI (simulated):</b> ' + M.ai) +
        '<div class="fx-opts">' + ['pl', 'ci'].map(function (o) { return '<label class="fx-opt"><input type="radio" name="fx-mm-' + k + '" value="' + o + '" data-mm="' + k + '"' + (I.sel[k] === o ? ' checked' : '') + '><span><b>' + M.opts[o].label + '</b>' + (o === 'pl' ? '<small class="sug">Suggested</small>' : '') + '</span></label>'; }).join('') + '</div>' +
        '<div class="btn-row">' + btn('mm-ok', IC.check + 'Confirm', 'btn-ink', ' data-k="' + k + '"' + (I.sel[k] ? '' : ' disabled')) + '</div></fieldset>';
    }
    function newQty() { return INTAKE.res.qty === 'ci' ? 240 : 236; }
    function vIntake() {
      var I = INTAKE;
      var mail = '<section class="panel fx-inbox"><h4 class="fx-h4">Operations inbox</h4><div class="fx-mail"><span class="fx-av">DC</span><div class="fx-mail-b"><div class="fx-mail-h"><b>Daniel Chen</b><small>Lumen Home Furniture Co. · 08:12</small></div>' +
        '<p class="fx-mail-s">Shipping documents – PO DP-7781 – 2×40HC Nansha to Jebel Ali</p><p class="fx-mail-p">Dear Omar, please find the documents for PO DP-7781 attached. The vessel is due at Jebel Ali today. Best regards, Daniel</p>' +
        '<div class="fx-attl">' + DOCK.map(function (d) { return '<span>' + IC.doc + esc(d.name) + '</span>'; }).join('') + '</div>' +
        (I.created ? '<p class="fx-ok">' + IC.check + 'Imported as ' + NEWID + '</p>' : I.loaded ? '<p class="fx-ok">' + IC.check + 'Attachments imported</p>' : '<div class="btn-row">' + btn('load', IC.download + 'Import 4 attachments', 'btn-ink') + '</div>') + '</div></div>' +
        '<label class="drop-zone fx-drop"><input type="file" multiple data-files accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx">' + IC.upload + '<b>Drop shipping documents here</b><span>or choose files · PDF, scans, photos</span></label>' +
        (I.own.length ? '<ul class="fx-own">' + I.own.map(function (f) { return '<li>' + IC.doc + '<span><b>' + esc(f) + '</b><small>Stays in your browser · not read in this demo</small></span></li>'; }).join('') + '</ul>' + (I.loaded ? '' : '<p class="note">In this demo the AI reads the sample set from the inbox. Import it to see the extraction.</p>') : '') + '</section>';
      var right;
      if (!I.loaded) right = '<section class="panel fx-tray"><div class="fx-tray-e">' + IC.scan + '<b>No documents yet</b><span>Import the e-mail attachments or drop files. AI (simulated) classifies each document, extracts the shipment and cross-checks the numbers.</span></div></section>';
      else {
        right = '<section class="panel fx-tray"><h4 class="fx-h4">Documents · ' + DOCK.length + '</h4><div class="fx-thumbs">' + DOCK.map(thumb).join('') + '</div>';
        if (I.phase === 'idle') right += '<div class="btn-row">' + btn('extract', IC.spark + 'Extract shipment with AI (simulated)', 'btn-ink') + '</div>';
        if (I.phase === 'reading') right += '<ol class="fx-steps" aria-live="polite">' + INSTEPS.map(function (t, i) { return '<li class="' + (i < I.step ? 'ok' : i === I.step ? 'cur' : '') + '"><span class="fx-step-d">' + (i < I.step ? IC.check : '<i></i>') + '</span>' + t + '</li>'; }).join('') + '</ol>';
        right += '</section>';
      }
      var res = '';
      if (I.phase === 'done') {
        var n = (I.res.wt ? 0 : 1) + (I.res.qty ? 0 : 1);
        var F = [['Shipper', 'Lumen Home Furniture Co., Ltd., Foshan, China', 'Invoice, B/L', 99], ['Consignee', 'Desert Palm Furnishings LLC · matched to customer AE-IMP-104822', 'B/L', 99], ['Route', 'Nansha, China → Jebel Ali Port · sea', 'B/L', 98],
          ['Vessel', 'MV Coral Horizon · V.611W', 'B/L', 97], ['B/L number', 'BMLU2611042', 'B/L', 99], ['Containers', 'SDAU 482193-7, SDAU 482417-0 · 2×40HC', 'B/L', 98],
          ['Incoterm', 'FOB Nansha', 'Invoice', 96], ['Invoice value', I.res.qty ? m2(25200 + newQty() * 68 + 9300) + (newQty() === 236 ? ' · adjusted for 236 chairs' : ' · as invoiced') : '$50,820 as invoiced', I.res.qty ? 'Invoice, your decision' : 'Invoice', 99], ['Packages', '268 cartons', 'Packing list, B/L', 97], ['Country of origin', 'China', 'Certificate of origin', 98],
          ['Gross weight', I.res.wt ? (I.res.wt === 'pl' ? '8,640 kg' : '8,460 kg') : 'Needs confirmation', 'Confirmed by you', I.res.wt ? 100 : 0]];
        var lines = NEWT.lines.map(function (l, i) { var qn = i === 1 ? (I.res.qty ? newQty() : null) : l.qty; return '<tr' + (i === 1 && !I.res.qty ? ' class="odd"' : '') + '><td class="mono">' + l.hs + '</td><td>' + esc(l.d) + '</td><td>' + (qn == null ? '240 / 236' : num(qn)) + ' ' + l.u + '</td><td>' + (qn == null ? '—' : m2(qn * l.p)) + '</td></tr>'; }).join('');
        res = '<section class="panel fx-x"><div class="fx-x-h"><div><h4 class="fx-h4">Extracted shipment</h4><p class="fx-sub">AI (simulated) read 4 documents. ' + (n ? n + ' difference' + (n > 1 ? 's need' : ' needs') + ' a human decision.' : 'All differences confirmed.') + '</p></div><span class="pill ' + (n ? 'p-warn' : 'p-ok') + '">' + (n ? n + ' to confirm' : 'Ready') + '</span></div>' +
          '<div class="fx-x-g"><dl class="fx-fields">' + F.map(function (f) { return '<div class="' + (f[3] === 0 ? 'odd' : '') + '"><dt>' + f[0] + '</dt><dd>' + esc(f[1]) + '<small>' + (f[3] === 100 ? esc(f[2]) : f[3] ? esc(f[2]) + ' · ' + f[3] + '%' : 'Documents disagree') + '</small></dd></div>'; }).join('') + '</dl>' +
          '<div><h5 class="fx-h5">Goods lines</h5><div class="fx-tbl"><table><thead><tr><th>HS code</th><th>Description</th><th>Qty</th><th>Value</th></tr></thead><tbody>' + lines + '</tbody></table></div>' +
          '<h5 class="fx-h5">Needs your confirmation</h5><div class="fx-stack">' + mmCard('wt') + mmCard('qty') + '</div></div></div>' +
          (I.created ? '<div class="fx-created">' + IC.check + '<span><b>Shipment ' + NEWID + ' created.</b> 4 documents filed under Commercial docs and Customs. Next: the customs declaration.</span><div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-open="' + NEWID + '">Open shipment</button>' + (ship(NEWID).customs.st === 'none' ? btn('decl', IC.shield + 'Create declaration', 'btn-ink', ' data-id="' + NEWID + '"') : '') + '</div></div>'
            : '<div class="fx-create">' + btn('create', IC.plus + 'Create shipment ' + NEWID, 'btn-ink', n ? ' disabled' : '') + '<span class="note">' + (n ? 'Confirm ' + n + ' flagged difference' + (n > 1 ? 's' : '') + ' first. A person always decides.' : 'Ready. A booking reference and a document folder are created.') + '</span></div>') + '</section>';
      }
      return head('AI document intake', 'Drop shipping documents. AI (simulated) builds the shipment and flags differences between invoice, packing list and B/L for you to confirm.') +
        '<div class="fx-intake">' + mail + right + '</div>' + res;
    }

    /* customs (operations) */
    function custRow(s, acts) {
      var c = CUST[s.c];
      return '<div class="fx-cr"><button type="button" class="fx-cr-m" data-open="' + s.id + '" data-tab="customs">' + modeTag(s) + '<span class="fx-li-b"><b>' + s.id + ' · ' + esc(c.short) + '</b><small>' + esc(PORT[s.pod].s) + ' · ' + esc(TYPES[s.customs.type].n) + ' · CIF ' + m2(cif(s)) + ' · duty est. ' + m2(dutyOf(s)) + '</small></span></button>' + custPill(s) + '<span class="fx-cr-a">' + (acts || '') + '</span></div>';
    }
    function vCustoms() {
      var need = SH.filter(needsDecl).sort(function (a, b) { return b.stage - a.stage; });
      var withB = SH.filter(function (s) { return /draft|submitted|query|answered/.test(s.customs.st); });
      var done = SH.filter(function (s) { return s.customs.st === 'cleared'; });
      return head('Customs clearance', 'Build declarations from the extracted shipment data. The customs broker reviews, submits and answers queries.') +
        kpis([['Needs a declaration', need.length, 'arrived or in transit'], ['With the broker', withB.length, 'review, submitted or query'], ['Cleared', done.length, 'last 7 days'], ['Duties estimated', usd(withB.concat(done).reduce(function (a, s) { return a + dutyOf(s); }, 0)), 'illustrative, 5% of CIF']]) +
        '<section class="panel"><h4 class="fx-h4">Needs a declaration</h4><div class="fx-stack">' + (need.length ? need.map(function (s) { return custRow(s, btn('decl', IC.pen + (s.customs.st === 'returned' ? 'Fix and resend' : 'Create declaration'), 'btn-ink', ' data-id="' + s.id + '"')); }).join('') : empty('Every arrived shipment has a declaration.')) + '</div>' +
        '<h4 class="fx-h4">With the customs broker</h4><div class="fx-stack">' + (withB.length ? withB.map(function (s) { return custRow(s, '<span class="fx-wait">' + esc(nextStep(s)) + '</span>'); }).join('') : empty('Nothing with the broker.')) + '</div>' +
        '<h4 class="fx-h4">Cleared</h4><div class="fx-stack">' + done.map(function (s) { return custRow(s, '<span class="fx-wait">' + esc(s.customs.rel) + '</span>'); }).join('') + '</div></section>';
    }

    /* delivery */
    var busyOn = function (t) { return SH.filter(function (s) { return s.del.truck === t.id && (s.del.st === 'scheduled' || s.del.st === 'out'); })[0]; };
    function vDelivery() {
      var ready2 = SH.filter(function (s) { return s.stage === 4 && s.del.st === 'none'; });
      var run = SH.filter(function (s) { return s.del.st === 'scheduled' || s.del.st === 'out'; });
      var done = SH.filter(function (s) { return s.del.st === 'done'; });
      var row = function (s, acts) {
        var t = s.del.truck && find(TRUCKS, s.del.truck);
        return '<div class="fx-cr"><button type="button" class="fx-cr-m" data-open="' + s.id + '" data-tab="del">' + modeTag(s) + '<span class="fx-li-b"><b>' + s.id + ' · ' + esc(CUST[s.c].short) + '</b><small>' + esc(PORT[s.pod].s) + ' → ' + esc(CUST[s.c].whS) + ' · ' + contSum(s) + (t ? ' · ' + esc(t.plate) + ', ' + esc(t.driver) : '') + '</small></span></button>' +
          (s.del.st === 'scheduled' ? '<span class="pill p-info">' + esc(slotEn(s.del.slot)) + '</span>' : s.del.st === 'out' ? '<span class="pill p-warn">On the road</span>' : s.del.st === 'done' ? '<span class="pill p-ok">Delivered ' + relL(s.del.off) + '</span>' : '<span class="pill p-warn">Truck needed</span>') + '<span class="fx-cr-a">' + (acts || '') + '</span></div>';
      };
      return head('Last-mile delivery', 'From port to warehouse: assign a truck and driver, follow the run and capture proof of delivery.') +
        '<div class="fx-grid2 wide"><section class="panel"><h4 class="fx-h4">Ready to schedule</h4><div class="fx-stack">' + (ready2.length ? ready2.map(function (s) { return row(s, btn('assign', IC.truck + 'Assign truck', 'btn-ink', ' data-id="' + s.id + '"')); }).join('') : empty('No released shipments waiting for a truck.')) + '</div>' +
        '<h4 class="fx-h4">Scheduled and on the road</h4><div class="fx-stack">' + (run.length ? run.map(function (s) { return row(s, s.del.st === 'scheduled' ? btn('out', 'Mark out for delivery', 'btn-ghost', ' data-id="' + s.id + '"') : btn('pod', IC.pen + 'Record proof of delivery', 'btn-ink', ' data-id="' + s.id + '"')); }).join('') : empty('No deliveries running.')) + '</div>' +
        '<h4 class="fx-h4">Delivered</h4><div class="fx-stack">' + done.map(function (s) { return row(s, ''); }).join('') + '</div></section>' +
        '<section class="panel"><h4 class="fx-h4">Fleet today</h4><ul class="fx-fleet">' + TRUCKS.map(function (t) { var b = busyOn(t); return '<li><span class="fx-av' + (b ? ' busy' : '') + '">' + IC.truck + '</span><span class="fx-li-b"><b>' + esc(t.plate) + '</b><small>' + esc(t.driver) + ' · ' + esc(t.kind) + ' · ' + esc(t.base) + '</small></span>' + (b ? '<span class="pill p-warn">' + b.id + '</span>' : '<span class="pill p-ok">Available</span>') + '</li>'; }).join('') + '</ul></section></div>';
    }

    /* customer updates (bilingual) */
    function bubble(u, s, lang) {
      var both = !lang || lang === 'both';
      return '<article class="fx-msgc"><div class="fx-msgc-h"><span class="fx-ch">' + (u.ch === 'wa' ? IC.phone + 'WhatsApp' : IC.mail + 'E-mail') + '</span><b>' + s.id + ' · ' + esc(u.kind) + '</b><small>' + rel(u.off) + ', ' + esc(u.time) + '</small></div>' +
        '<div class="fx-bi' + (both ? '' : ' one') + '">' + (both || lang === 'en' ? '<p lang="en" dir="ltr">' + esc(u.en).replace(/\n/g, '<br>') + '</p>' : '') + (both || lang === 'ar' ? '<p class="fx-ar" lang="ar" dir="rtl">' + esc(u.ar).replace(/\n/g, '<br>') + '</p>' : '') + '</div></article>';
    }
    function vUpdates() {
      var s = ship(ui.upd) || SH[0], c = CUST[s.c], g = ui.gen && ui.gen.id === s.id ? ui.gen : null;
      var list = SH.slice().sort(function (a, b) { return (a.stage === 5) - (b.stage === 5); });
      var hist = [];
      SH.forEach(function (x) { x.updates.forEach(function (u) { hist.push([u, x]); }); });
      hist.sort(function (a, b) { return b[0].off - a[0].off || (b[0].time > a[0].time ? 1 : -1); });
      var comp = '<div class="fx-to"><span class="fx-av">' + initials(c.contact) + '</span><span class="fx-li-b"><b>' + esc(c.contact) + '</b><small>' + esc(c.name) + ' · ' + esc(ui.ch === 'wa' ? c.phone : c.mail) + '</small></span>' +
        '<div class="fx-seg" role="group" aria-label="Channel"><button type="button" data-a="ch" data-c="wa" aria-pressed="' + (ui.ch === 'wa') + '">' + IC.phone + 'WhatsApp</button><button type="button" data-a="ch" data-c="mail" aria-pressed="' + (ui.ch === 'mail') + '">' + IC.mail + 'E-mail</button></div></div>' +
        '<div class="fx-ctx">' + modeTag(s) + '<span class="fx-li-b"><b>' + s.id + ' · ' + STAGES[s.stage] + '</b><small>' + route(s) + ' · ' + etaTxt(s) + (s.customs.st !== 'none' ? ' · customs: ' + s.customs.st : '') + '</small></span></div>';
      if (ui.genBusy) comp += '<div class="fx-think" role="status"><i></i><i></i><i></i>AI (simulated) is writing the update in English and Arabic…</div>';
      else if (!g) comp += '<div class="btn-row">' + btn('gen', IC.spark + 'Write update with AI (simulated)', 'btn-ink') + '</div><p class="note">Uses the live shipment data: stage, ETA, customs status and delivery slot.</p>';
      else {
        var idEn = uidf(), idAr = uidf();
        comp += '<div class="fx-bi edit"><label for="' + idEn + '"><span>English</span><textarea id="' + idEn + '" data-g="en" rows="6" lang="en" dir="ltr">' + esc(g.en) + '</textarea></label>' +
          '<label for="' + idAr + '" class="fx-ar-l"><span>العربية · Arabic</span><textarea id="' + idAr + '" data-g="ar" rows="6" lang="ar" dir="rtl" class="fx-ar">' + esc(g.ar) + '</textarea></label></div>' +
          aiNote('Drafted by AI (simulated) as “' + esc(g.kind) + '”. Edit if needed. In production a team member reviews the Arabic text before it goes out.') +
          '<div class="btn-row">' + btn('send', (ui.ch === 'wa' ? IC.phone + 'Send via WhatsApp' : IC.mail + 'Send by e-mail') + ' (simulated, not sent)', 'btn-ink') + btn('gen', 'Rewrite', 'btn-ghost') + '</div>';
      }
      return head('Customer updates', 'Pick a shipment. AI (simulated) writes the status message in English and Arabic from the live shipment data.') +
        '<div class="fx-upd"><section class="panel fx-upd-l"><h4 class="fx-h4">Shipments</h4><div class="fx-picks" role="radiogroup" aria-label="Shipment">' + list.map(function (x) {
          return '<button type="button" role="radio" aria-checked="' + (x.id === s.id) + '" data-a="pick" data-id="' + x.id + '">' + modeTag(x, true) + '<span class="fx-li-b"><b>' + x.id + ' · ' + esc(CUST[x.c].short) + '</b><small>' + STAGES[x.stage] + (x.updates.length ? ' · last update ' + relL(x.updates[x.updates.length - 1].off) : ' · no updates yet') + '</small></span></button>';
        }).join('') + '</div></section><section class="panel fx-upd-r"><h4 class="fx-h4">New update</h4>' + comp + '</section></div>' +
        '<section class="panel fx-hist"><h4 class="fx-h4">Sent recently</h4><div class="fx-stack">' + hist.slice(0, 5).map(function (h) { return bubble(h[0], h[1]); }).join('') + '</div></section>';
    }

    /* ---------------- views: customs broker ---------------- */
    function qCard(s) {
      var c = CUST[s.c], cu = s.customs, du = dutyOf(s), A = [];
      if (cu.st === 'draft') A.push(btn('review', IC.shield + 'Review and submit', 'btn-ink', ' data-id="' + s.id + '"'));
      if (cu.st === 'query') A.push(btn('answer', IC.msg + 'Answer query', 'btn-ink', ' data-id="' + s.id + '"'));
      if (cu.st === 'submitted' || cu.st === 'answered') A.push(btn('refresh', IC.clock + 'Check status with customs', 'btn-ghost', ' data-id="' + s.id + '"' + (cu.busy ? ' disabled' : '')));
      A.push('<button type="button" class="btn btn-ghost btn-sm" data-open="' + s.id + '" data-tab="customs">Open shipment</button>');
      return '<article class="fx-q' + (cu.st === 'query' ? ' bad' : '') + '"><div class="fx-q-h">' + modeTag(s) + '<span class="fx-li-b"><b>' + s.id + ' · ' + esc(c.name) + '</b><small>' + esc(TYPES[cu.type].n) + ' · ' + esc(PORT[s.pod].s) + ' · ' + s.lines.length + ' HS line' + (s.lines.length > 1 ? 's' : '') + (cu.by ? ' · prepared by ' + esc(cu.by) : '') + '</small></span>' + custPill(s) + '</div>' +
        (cu.st === 'query' ? '<p class="fx-qtext">' + IC.alert + '<span><b>Customs:</b> ' + esc(cu.query.text) + (cu.query.fromCust ? (cu.query.got ? ' <em>Importer uploaded the ' + esc(cu.query.need.toLowerCase()) + '.</em>' : ' <em>Waiting for the importer to upload it.</em>') : '') + '</span></p>' : '') +
        (cu.st === 'returned' ? '<p class="fx-qtext">' + IC.alert + '<span>Returned to operations: ' + esc(cu.note) + '</span></p>' : '') +
        (cu.busy ? '<p class="fx-think" role="status"><i></i><i></i><i></i>' + esc(cu.busy) + '</p>' : '') +
        '<dl class="fx-q-n"><div><dt>CIF value</dt><dd>' + m2(cif(s)) + '</dd></div><div><dt>Duty estimate</dt><dd>' + m2(du) + (TYPES[cu.type].rate ? '' : ' <small>' + (cu.type === 'fz' ? 'suspended' : 'exempt') + '</small>') + '</dd></div><div><dt>Declaration</dt><dd class="mono">' + (cu.no || 'Draft') + '</dd></div>' + (cu.rel ? '<div><dt>Release</dt><dd class="mono">' + cu.rel + '</dd></div>' : '') + '</dl>' +
        '<div class="fx-q-a">' + A.join('') + '</div></article>';
    }
    function vQueue() {
      var T = {
        review: SH.filter(function (s) { return s.customs.st === 'draft'; }),
        query: SH.filter(function (s) { return s.customs.st === 'query'; }),
        sub: SH.filter(function (s) { return s.customs.st === 'submitted' || s.customs.st === 'answered'; }),
        done: SH.filter(function (s) { return s.customs.st === 'cleared'; })
      };
      var tabs = [['review', 'To review'], ['query', 'Customs queries'], ['sub', 'With customs'], ['done', 'Cleared']];
      var L2 = T[ui.qtab], est = T.review.concat(T.sub).concat(T.query).reduce(function (a, s) { return a + dutyOf(s); }, 0);
      return head('Clearance queue', 'Rajesh Kumar · customs broker for ' + FWD + '. Declarations come prefilled from operations.') +
        kpis([['To review', T.review.length, 'prepared by operations'], ['With customs', T.sub.length, 'submitted, waiting'], ['Open queries', T.query.length, 'need an answer', T.query.length ? 'hot' : ''], ['Duty in progress', usd(est), 'illustrative estimate']]) +
        '<div class="fx-tabs" role="tablist" aria-label="Queue">' + tabs.map(function (t) { return '<button type="button" role="tab" data-a="qtab" data-t="' + t[0] + '" aria-selected="' + (ui.qtab === t[0]) + '">' + t[1] + ' <i>' + T[t[0]].length + '</i></button>'; }).join('') + '</div>' +
        '<div class="fx-stack" role="tabpanel">' + (L2.length ? L2.map(qCard).join('') : empty(ui.qtab === 'review' ? 'Nothing to review. Operations sends new declarations here.' : 'Nothing here right now.')) + '</div>';
    }
    function vHolds() {
      var open = SH.filter(function (s) { return s.customs.st === 'query'; });
      var ans = SH.filter(function (s) { return s.customs.st === 'answered'; });
      return head('Holds & queries', 'Customs asks, you answer with the right documents attached. Answers go to a simulated customs system.') +
        '<div class="fx-stack">' + (open.length ? open.map(qCard).join('') : empty('No open customs queries.')) + '</div>' +
        (ans.length ? '<h4 class="fx-h4">Answered, waiting for customs</h4><div class="fx-stack">' + ans.map(qCard).join('') + '</div>' : '');
    }

    /* ---------------- views: customer portal ---------------- */
    function portalHead(title) {
      var c = CUST[MYC];
      return '<div class="fx-ph"><div><span class="fx-ph-k">' + IC.building + 'Importer portal · ' + FWD + '</span><h3>' + title + '</h3><p>' + esc(c.name) + ' · importer code ' + c.code + ' · ' + esc(c.zone) + '</p></div>' +
        '<div class="fx-seg" role="group" aria-label="Message language"><button type="button" data-a="lang" data-l="en" aria-pressed="' + (ui.lang === 'en') + '">English</button><button type="button" data-a="lang" data-l="ar" aria-pressed="' + (ui.lang === 'ar') + '" lang="ar">العربية</button><button type="button" data-a="lang" data-l="both" aria-pressed="' + (ui.lang === 'both') + '">Both</button></div></div>';
    }
    function needBox(s) {
      if (!custNeed(s)) return '';
      return '<div class="fx-need">' + IC.alert + '<div><b>Action needed: customs asks for your ' + esc(s.customs.query.need.toLowerCase()) + '</b><p>' + esc(s.customs.query.text) + '</p><div class="btn-row"><label class="btn btn-ink btn-sm fx-up">' + IC.upload + 'Upload file<input type="file" class="fx-file" data-cup="' + s.id + '"></label>' + btn('cup-sample', 'Use sample catalogue', 'btn-ghost', ' data-id="' + s.id + '"') + '</div></div></div>';
    }
    function vPortal() {
      var mine = SH.filter(function (s) { return s.c === MYC; });
      var act = mine.filter(function (s) { return s.stage < 5; }), wk = mine.filter(function (s) { return s.stage <= 1 && s.eta <= 7; });
      var due = INV.filter(function (v) { return v.c === MYC && v.status === 'Due'; });
      var Lp = mine.filter(function (s) { return ui.pf === 'all' || (ui.pf === 'active' ? s.stage < 5 : s.stage === 5); }).sort(function (a, b) { return (b.id === NEWID) - (a.id === NEWID) || b.stage - a.stage; });
      return portalHead('Your shipments') +
        kpis([['Active shipments', act.length, 'on the way or in customs'], ['Arriving this week', wk.length, 'by sea, air or road'], ['Action needed', mine.filter(custNeed).length, 'documents requested', mine.filter(custNeed).length ? 'hot' : ''], ['Open invoices', usd(due.reduce(function (a, v) { return a + invTotal(v); }, 0)), due.length + ' due']]) +
        '<div class="fx-seg fx-pf" role="group" aria-label="Show">' + [['active', 'Active'], ['done', 'Delivered'], ['all', 'All']].map(function (x) { return '<button type="button" data-a="pf" data-p="' + x[0] + '" aria-pressed="' + (ui.pf === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div class="fx-stack">' + (Lp.length ? Lp.map(function (s) {
          var u = s.updates[s.updates.length - 1], inv = INV.filter(function (v) { return v.ship === s.id; })[0];
          return '<article class="fx-sc' + (s.id === NEWID ? ' new' : '') + '"><div class="fx-sc-h">' + modeTag(s) + '<span class="fx-li-b"><b>' + s.id + ' · PO ' + s.po + '</b><small>' + esc(s.shipper) + ' · ' + esc(s.from) + ' → ' + esc(PORT[s.pod].n) + '</small></span><span class="fx-eta"><b>' + (s.stage === 5 ? rel(s.del.off) : rel(s.eta)) + '</b><small>' + (s.stage === 5 ? 'delivered' : s.stage >= 2 ? 'arrived' : 'ETA') + '</small></span></div>' +
            trk(s) + needBox(s) +
            (u ? '<div class="fx-sc-u"><span class="fx-ch">' + (u.ch === 'wa' ? IC.phone : IC.mail) + 'Latest update · ' + rel(u.off) + ', ' + esc(u.time) + '</span>' + (ui.lang !== 'ar' ? '<p lang="en">' + esc(u.en).replace(/\n/g, '<br>') + '</p>' : '') + (ui.lang !== 'en' ? '<p class="fx-ar" lang="ar" dir="rtl">' + esc(u.ar).replace(/\n/g, '<br>') + '</p>' : '') + '</div>' : '') +
            '<div class="btn-row"><button type="button" class="btn btn-ghost btn-sm" data-open="' + s.id + '">' + IC.eye + 'Details</button><button type="button" class="btn btn-ghost btn-sm" data-open="' + s.id + '" data-tab="docs">' + IC.folder + 'Documents</button>' + (inv ? btn('inv-dl', IC.download + 'Invoice', 'btn-ghost', ' data-id="' + inv.id + '"') : '') + '</div></article>';
        }).join('') : empty('No shipments in this view.')) + '</div>';
    }
    function vCustUpdates() {
      var all = [];
      SH.filter(function (s) { return s.c === MYC; }).forEach(function (s) { s.updates.forEach(function (u) { all.push([u, s]); }); });
      all.sort(function (a, b) { return b[0].off - a[0].off || (b[0].time > a[0].time ? 1 : -1); });
      return portalHead('Updates from Harbourline') + '<p class="fx-sub fx-gap">Every milestone message we sent you by WhatsApp or e-mail, in English and Arabic.</p><div class="fx-stack">' + (all.length ? all.map(function (h) { return bubble(h[0], h[1], ui.lang); }).join('') : empty('No updates yet.')) + '</div>';
    }
    function invDoc(v) {
      var c = CUST[v.c];
      return { name: 'Invoice ' + v.id + '.pdf', type: 'pdf', title: 'Tax invoice ' + v.id, company: FWD, meta: [['Customer', c.name], ['Shipment', v.ship], ['Date', dLong(v.off)], ['Due', dLong(v.due)]],
        sections: [{ h: 'Charges (USD)', rows: [['Description', 'Amount']].concat(v.items.map(function (i) { return [i[0], m2(i[1])]; })).concat([['Total', m2(invTotal(v))]]) }, { h: 'Note', p: 'Sample invoice for demonstration. Duty amounts are illustrative.' }] };
    }
    function vInvoices() {
      var mine = INV.filter(function (v) { return v.c === MYC; });
      return portalHead('Invoices') + '<div class="fx-stack fx-gap">' + mine.map(function (v) {
        return '<div class="fx-inv"><span class="fx-av">' + IC.invoice + '</span><span class="fx-li-b"><b>' + v.id + '</b><small>Shipment ' + v.ship + ' · issued ' + dShort(v.off) + ' · due ' + dShort(v.due) + '</small></span><b class="fx-amt">' + m2(invTotal(v)) + '</b><span class="pill ' + (v.status === 'Paid' ? 'p-ok' : 'p-warn') + '">' + v.status + '</span>' +
          '<span class="fx-cr-a">' + btn('inv-view', IC.eye + 'View', 'btn-ghost', ' data-id="' + v.id + '"') + btn('inv-dl', IC.download + 'Download', 'btn-ghost', ' data-id="' + v.id + '"') + '</span></div>';
      }).join('') + '</div><p class="note fx-gap">Downloads a sample invoice file (HTML) generated in your browser.</p>';
    }

    var VIEWS = { home: vHome, board: vBoard, intake: vIntake, customs: vCustoms, delivery: vDelivery, updates: vUpdates, queue: vQueue, holds: vHolds, portal: vPortal, cupdates: vCustUpdates, invoices: vInvoices };
    function render(top) {
      var ae = document.activeElement, keep = ae && main.contains(ae) && ae.getAttribute('data-f');
      paintNav();
      root.classList.toggle('fx-is-cust', role === 'customer');
      root.classList.toggle('fx-is-broker', role === 'broker');
      if (view === 'dms') { main.innerHTML = ''; main.appendChild(dmsEl); dms.render(); }
      else main.innerHTML = (VIEWS[view] || VIEWS[HOME[role]])();
      if (view === 'board') renderResults();
      if (keep) { var el = q('[data-f="' + keep + '"]', main); if (el) el.focus({ preventScroll: true }); }
      if (top) main.scrollTop = 0;
      renderDrawer();
    }
    var refresh = function () { render(false); };

    /* ---------------- shipment drawer ---------------- */
    function dActions(s) {
      var A = [], cu = s.customs.st;
      if (role === 'coord') {
        if (s.stage === 0) A.push(['depart', 'Mark departed', 1]);
        if (s.stage === 1) A.push(['arrive', 'Confirm arrival', 1]);
        if (needsDecl(s)) A.push(['decl', cu === 'returned' ? 'Fix declaration' : 'Create customs declaration', 1]);
        if (s.stage === 4 && s.del.st === 'none') A.push(['assign', 'Assign truck', 1]);
        if (s.del.st === 'scheduled') A.push(['out', 'Mark out for delivery', 1]);
        if (s.del.st === 'out') A.push(['pod', 'Record proof of delivery', 1]);
        A.push(['update', 'Send customer update', 0]);
      } else if (role === 'broker') {
        if (cu === 'draft') A.push(['review', 'Review and submit', 1]);
        if (cu === 'query') A.push(['answer', 'Answer customs query', 1]);
        if ((cu === 'submitted' || cu === 'answered') && !s.customs.busy) A.push(['refresh', 'Check status with customs', 0]);
      } else {
        var inv = INV.filter(function (v) { return v.ship === s.id; })[0];
        if (inv) A.push(['inv-dl', 'Download invoice', 0, inv.id]);
      }
      if (!A.length) return '<p class="note fx-why">' + (role === 'broker' ? 'No customs action needed right now. Stage changes are made by operations.' : 'Nothing to do right now.') + '</p>';
      return '<div class="fx-d-acts">' + A.map(function (a) { return '<button type="button" class="btn btn-sm ' + (a[2] ? 'btn-ink' : 'btn-ghost') + '" data-a="' + a[0] + '" data-id="' + (a[3] || s.id) + '">' + a[1] + '</button>'; }).join('') + '</div>';
    }
    function docRow(d) {
      return '<li><span class="sda-doc-ic t-' + esc(d.type) + '">' + (/jpg|png/.test(d.type) ? IC.img : /xls/.test(d.type) ? IC.sheet : IC.doc) + '</span><span class="fx-li-b"><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + ' · v' + d.version + ' · ' + esc(d.status) + '</small></span><button type="button" class="btn btn-ghost btn-sm" data-prev="' + d.id + '">Preview</button></li>';
    }
    function renderDrawer() {
      var s = openId && ship(openId);
      if (!s || !visible(s)) { drawer.hidden = true; scrim.hidden = true; openId = null; return; }
      var c = CUST[s.c], p = PORT[s.pod], cu = s.customs, D = docsFor(s);
      var tabs = [['ov', 'Overview'], ['cargo', 'Cargo'], ['customs', 'Customs'], ['docs', 'Documents', D.length], ['del', 'Delivery'], ['msg', 'Updates', s.updates.length]];
      var body = '';
      if (dTab === 'ov') {
        var tl = s.tl.filter(function (e) { return role !== 'customer' || !e.int; });
        body = '<dl class="fx-dl"><div><dt>Customer</dt><dd>' + esc(c.name) + '<small>' + esc(c.zone) + '</small></dd></div><div><dt>Shipper</dt><dd>' + esc(s.shipper) + '<small>' + esc(s.from) + '</small></dd></div>' +
          '<div><dt>' + (s.mode === 'sea' ? 'Vessel' : s.mode === 'air' ? 'Flight' : 'Truck') + '</dt><dd>' + esc(s.voy) + '<small>' + esc(s.carrier) + '</small></dd></div><div><dt>' + (s.mode === 'sea' ? 'B/L' : s.mode === 'air' ? 'Air waybill' : 'CMR') + '</dt><dd><span class="mono">' + esc(s.tdoc) + '</span><small>Incoterm ' + s.inc + '</small></dd></div>' +
          '<div><dt>Departed</dt><dd>' + (s.stage >= 1 ? dLong(s.etd) : 'Planned ' + dLong(s.etd)) + '</dd></div><div><dt>' + (s.stage >= 2 ? 'Arrived' : 'ETA') + '</dt><dd>' + dLong(s.eta) + '<small>' + esc(p.n) + '</small></dd></div>' +
          '<div class="wide"><dt>Deliver to</dt><dd>' + esc(c.wh) + '</dd></div></dl>' +
          '<h5 class="fx-h5">Timeline</h5><ol class="fx-tl">' + tl.slice().reverse().map(function (e) { return '<li><b>' + esc(e.text) + '</b><small>' + rel(e.off) + ', ' + esc(e.time) + ' · ' + esc(e.who) + '</small></li>'; }).join('') + '</ol>';
      } else if (dTab === 'cargo') {
        body = '<h5 class="fx-h5">' + (s.mode === 'sea' ? 'Containers' : s.mode === 'air' ? 'ULD pallets' : 'Vehicle') + '</h5><ul class="fx-conts">' + s.conts.map(function (k) { return '<li><span class="fx-av">' + (s.mode === 'sea' ? IC.box : modeIc(s.mode)) + '</span><span class="fx-li-b"><b class="mono">' + esc(k[0]) + '</b><small>' + esc(k[1]) + (k[2] && k[2] !== '—' ? ' · seal ' + esc(k[2]) : '') + '</small></span></li>'; }).join('') + '</ul>' +
          '<h5 class="fx-h5">Goods</h5><div class="fx-tbl"><table><thead><tr><th>HS code</th><th>Description</th><th>Qty</th><th>Value</th></tr></thead><tbody>' + s.lines.map(function (l) { return '<tr><td class="mono">' + l.hs + '</td><td>' + esc(l.d) + '</td><td>' + num(l.qty) + ' ' + l.u + '</td><td>' + m2(l.qty * l.p) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
          '<dl class="fx-dl"><div><dt>Gross weight</dt><dd>' + num(s.gw) + ' kg</dd></div><div><dt>Packages</dt><dd>' + esc(s.pkgs) + '</dd></div><div><dt>FOB value</dt><dd>' + m2(fob(s)) + '</dd></div><div><dt>CIF value</dt><dd>' + m2(cif(s)) + '</dd></div>' + (s.dg ? '<div class="wide"><dt>Dangerous goods</dt><dd>UN 2794, class 8 · DG declaration required</dd></div>' : '') + '</dl>';
      } else if (dTab === 'customs') {
        var stTxt = { none: 'No declaration yet', draft: 'Prepared by operations, with the broker for review', returned: 'Returned by the broker: ' + (cu.note || ''), submitted: 'Submitted to customs, waiting for a response', query: 'Customs asked for more information', answered: 'Query answered, waiting for customs', cleared: 'Cleared and released' }[cu.st];
        body = '<div class="fx-cu-st">' + custPill(s) + '<span>' + esc(stTxt) + '</span></div>' +
          '<dl class="fx-dl"><div><dt>Declaration type</dt><dd>' + esc(TYPES[cu.type].n) + '</dd></div><div><dt>Declaration no</dt><dd class="mono">' + (cu.no || '—') + '</dd></div><div><dt>Importer code</dt><dd class="mono">' + c.code + '</dd></div><div><dt>Release</dt><dd class="mono">' + (cu.rel || '—') + '</dd></div></dl>' +
          (cu.st === 'query' ? '<p class="fx-qtext">' + IC.alert + '<span><b>Customs:</b> ' + esc(cu.query.text) + '</span></p>' + (role === 'customer' ? needBox(s) : '') : '') +
          (cu.busy ? '<p class="fx-think" role="status"><i></i><i></i><i></i>' + esc(cu.busy) + '</p>' : '') +
          dutyBox(s, cu.type);
      } else if (dTab === 'docs') {
        body = (D.length ? '<ul class="fx-files">' + D.map(docRow).join('') + '</ul>' : '<p class="note">No documents yet.</p>') +
          '<div class="btn-row"><label class="btn btn-ghost btn-sm fx-up">' + IC.upload + 'Upload to this shipment<input type="file" class="fx-file" data-dup="' + s.id + '" multiple></label></div><p class="note">' + (role === 'customer' ? 'You see your shipment documents. Internal carrier contracts are hidden.' : 'Files stay in your browser in this demo.') + '</p>';
      } else if (dTab === 'del') {
        var t = s.del.truck && find(TRUCKS, s.del.truck);
        if (s.del.st === 'none') body = '<p class="note fx-why">' + (s.stage < 4 ? 'Delivery is planned once customs releases the goods.' : 'Released. Waiting for a truck to be assigned.') + '</p><dl class="fx-dl"><div class="wide"><dt>Deliver to</dt><dd>' + esc(c.wh) + '</dd></div></dl>' + (role === 'coord' && s.stage === 4 ? '<div class="btn-row">' + btn('assign', IC.truck + 'Assign truck', 'btn-ink', ' data-id="' + s.id + '"') + '</div>' : '');
        else body = '<dl class="fx-dl"><div><dt>Truck</dt><dd>' + esc(t.plate) + '<small>' + esc(t.kind) + '</small></dd></div><div><dt>Driver</dt><dd>' + esc(t.driver) + '</dd></div><div><dt>Slot</dt><dd>' + (s.del.slot != null ? esc(slotEn(s.del.slot)) : rel(s.del.off)) + '</dd></div><div><dt>Status</dt><dd>' + (s.del.st === 'done' ? 'Delivered' : s.del.st === 'out' ? 'On the road' : 'Scheduled') + '</dd></div><div class="wide"><dt>Deliver to</dt><dd>' + esc(c.wh) + '</dd></div></dl>' +
          (s.del.st === 'done' ? '<h5 class="fx-h5">Proof of delivery</h5><figure class="fx-podimg"><img src="' + SDA.art('signature', 'Received by ' + s.del.podBy) + '" alt="Signature of ' + esc(s.del.podBy) + '"><figcaption>Signed by ' + esc(s.del.podBy) + ' · ' + rel(s.del.off) + '</figcaption></figure>' : '');
      } else {
        body = s.updates.length ? '<div class="fx-stack">' + s.updates.slice().reverse().map(function (u) { return bubble(u, s, role === 'customer' ? ui.lang : 'both'); }).join('') + '</div>' : '<p class="note">No updates sent yet.</p>';
        if (role === 'coord') body += '<div class="btn-row">' + btn('update', IC.msg + 'Write a new update', 'btn-ink', ' data-id="' + s.id + '"') + '</div>';
      }
      drawer.innerHTML = '<div class="fx-d-h"><span class="fx-d-id">' + modeTag(s, true) + s.id + ' · PO ' + s.po + '</span><button type="button" class="sda-x fx-d-x" data-close-d aria-label="Close shipment details">' + IC.close + '</button></div>' +
        '<div class="fx-d-b"><div><h3>' + esc(role === 'customer' ? s.shipper : c.name) + '</h3><p class="fx-sub">' + esc(s.from) + ' → ' + esc(p.n) + ' · ' + contSum(s) + '</p></div><div class="fx-d-pills">' + stagePill(s) + flagsHtml(s) + '</div>' +
        trk(s, 'sm') + dActions(s) +
        '<div class="fx-dtabs" role="tablist" aria-label="Shipment sections">' + tabs.map(function (x) { return '<button type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (dTab === x[0]) + '">' + x[1] + (x[2] != null ? ' <i>' + x[2] + '</i>' : '') + '</button>'; }).join('') + '</div>' +
        '<div class="fx-dtabp" role="tabpanel">' + body + '</div></div>';
      drawer.hidden = false; scrim.hidden = false;
    }
    function openShip(id, tab) {
      var s = ship(id); if (!s) return;
      if (!visible(s)) { toast('You do not have access to ' + id + ' in this role.', 'warn'); return; }
      if (!openId) lastFocus = document.activeElement;
      openId = id; dTab = tab || 'ov';
      if (view === 'board') renderResults();
      renderDrawer();
      if (role === 'customer' && id === NEWID && dTab === 'docs') guide.done('customer');
      var x = q('.fx-d-x', drawer); if (x) x.focus({ preventScroll: true });
      drawer.scrollTop = 0;
    }
    function closeDrawer() {
      openId = null; drawer.hidden = true; scrim.hidden = true;
      if (view === 'board') renderResults();
      if (lastFocus && root.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    }

    /* ---------------- actions ---------------- */
    function doLoad() { INTAKE.loaded = true; render(); toast('4 attachments imported from the e-mail'); }
    function doExtract() {
      var I = INTAKE; I.phase = 'reading'; I.step = 0; render();
      var tick = function () {
        I.step++;
        if (I.step >= INSTEPS.length) { I.phase = 'done'; render(); toast('Extraction done. 2 differences need your decision.'); var x = q('.fx-x', main); if (x && x.scrollIntoView) x.scrollIntoView({ block: 'nearest', behavior: SDA.reduce ? 'auto' : 'smooth' }); return; }
        render(); ctx.later(SDA.reduce ? 60 : 650, tick);
      };
      ctx.later(SDA.reduce ? 60 : 650, tick);
    }
    function createNew() {
      var I = INTAKE;
      var t = Object.assign({}, NEWT, { lines: NEWT.lines.map(function (l) { return Object.assign({}, l); }) });
      t.lines[1].qty = newQty(); t.gw = I.res.wt === 'pl' ? 8640 : 8460; delete t.ciGw;
      var s = mk(t);
      s.tl = [{ off: -24, time: '10:20', who: 'Omar Haddad', text: 'Booking confirmed with Blue Meridian Line' }, { off: -18, time: '21:05', who: 'Carrier feed (simulated)', text: 'Departed Nansha, China' },
        { off: 0, time: '06:40', who: 'Port feed (simulated)', text: 'Arrived at Jebel Ali Port' }, { off: 0, time: nowT(), who: 'AI intake (simulated)', text: 'Shipment created from 4 documents · 2 differences confirmed by Omar Haddad', int: true }];
      if (I.res.qty === 'pl') s.tl.push({ off: 0, time: nowT(), who: 'Omar Haddad', text: 'Corrected commercial invoice requested from Lumen Home Furniture (e-mail simulated, not sent)', int: true });
      SH.unshift(s);
      DOCK.forEach(function (d) { dms.add(Object.assign({}, d, { ship: NEWID, cust: 'dp', linked: link(s), owner: 'AI intake (simulated)', date: dLong(0), status: 'Valid', folder: d.k === 'co' ? 'Customs' : 'Commercial docs', note: 'Imported from e-mail by AI intake (simulated)' })); });
      I.created = true; ui.upd = NEWID; guide.done('intake');
      toast(NEWID + ' created with 4 documents');
      render(); openShip(NEWID);
    }
    function upsertDecl(s, status) {
      var d = s.customs.doc && docById(s.customs.doc), fresh = declDoc(s);
      if (!d) { d = dms.add(Object.assign(fresh, { status: status })); s.customs.doc = d.id; return; }
      ['title', 'meta', 'sections', 'owner'].forEach(function (k) { d[k] = fresh[k]; });
      if (d.status !== status) { d.version += 1; d.versions.push({ v: d.version, date: dLong(0), by: ME[role], note: status }); }
      d.status = status;
    }
    function setDeclStatus(s, status) { var d = s.customs.doc && docById(s.customs.doc); if (d) { d.status = status; d.versions.push({ v: d.version, date: dLong(0), by: role === 'broker' ? ME.broker : 'Customs (simulated)', note: status }); } }

    function openDecl(s) {
      var cu = s.customs, c = CUST[s.c], id = uidf(), type = cu.type;
      var work = { frt: s.frt, ins: s.ins, lines: s.lines };
      var html = '<div class="fx-decl"><div class="fx-decl-main">' +
        (cu.st === 'returned' ? '<p class="fx-qtext">' + IC.alert + '<span><b>Returned by Rajesh Kumar:</b> ' + esc(cu.note) + '</span></p>' : '') +
        aiNote('<b>AI (simulated)</b> prefilled this draft from the commercial invoice, packing list and ' + tdocKind(s).toLowerCase() + (s.id === NEWID ? ', including the differences you confirmed (' + newQty() + ' chairs, ' + num(s.gw) + ' kg)' : '') + '. Check it before sending.') +
        '<div class="fx-2"><label for="' + id + 't">Declaration type<select id="' + id + 't" data-d="type">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + (k === type ? ' selected' : '') + '>' + TYPES[k].n + '</option>'; }).join('') + '</select></label>' +
        '<label for="' + id + 'p">Port of entry<input id="' + id + 'p" value="' + esc(PORT[s.pod].n) + '" readonly></label></div>' +
        '<div class="fx-2"><label for="' + id + 'i">Importer<input id="' + id + 'i" value="' + esc(c.name + ' · ' + c.code) + '" readonly></label><label for="' + id + 'o">Origin and Incoterm<input id="' + id + 'o" value="' + esc(s.from + ' · ' + s.inc) + '" readonly></label></div>' +
        '<h5 class="fx-h5">Goods lines</h5><div class="fx-lines">' + s.lines.map(function (l, i) {
          return '<div class="fx-line"><label for="' + id + 'h' + i + '"><span>HS code</span><input id="' + id + 'h' + i + '" data-hs="' + i + '" value="' + l.hs + '" inputmode="decimal" autocomplete="off"></label><span class="fx-line-d"><b>' + esc(l.d) + '</b><small>' + num(l.qty) + ' ' + l.u + ' × ' + m2(l.p) + '</small></span><span class="fx-line-v">' + m2(l.qty * l.p) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="fx-3"><label for="' + id + 'f">FOB value (USD)<input id="' + id + 'f" value="' + fob(s) + '" readonly></label><label for="' + id + 'r">Freight (USD)<input id="' + id + 'r" type="number" min="0" step="1" data-d="frt" value="' + s.frt + '"></label><label for="' + id + 's">Insurance (USD)<input id="' + id + 's" type="number" min="0" step="1" data-d="ins" value="' + s.ins + '"></label></div>' +
        '</div><aside class="fx-decl-side"><div class="fx-duty-h" aria-live="polite"></div><p class="note err" role="status"></p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-send>' + IC.arrow + 'Send to broker for review</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></aside></div>';
      var m = SDA.modal(root, { title: 'Customs declaration · ' + s.id, wide: true, html: html });
      m.el.classList.add('fx-modal');
      var get = function (k) { return q('[data-d="' + k + '"]', m.body); };
      function calc() {
        type = get('type').value;
        var tmp = Object.assign({}, s, { frt: Math.max(0, Number(get('frt').value) || 0), ins: Math.max(0, Number(get('ins').value) || 0) });
        work.frt = tmp.frt; work.ins = tmp.ins;
        q('.fx-duty-h', m.body).innerHTML = dutyBox(tmp, type);
      }
      calc();
      m.body.addEventListener('input', calc);
      m.body.addEventListener('change', calc);
      m.body.addEventListener('click', function (e) {
        if (!e.target.closest('[data-send]')) return;
        var bad = null;
        qa('[data-hs]', m.body).forEach(function (inp) { var ok = /^\d{4}\.\d{2}$/.test(inp.value.trim()); inp.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = inp; });
        if (bad) { q('.err', m.body).textContent = 'HS codes need the format 0000.00.'; bad.focus(); return; }
        qa('[data-hs]', m.body).forEach(function (inp) { s.lines[+inp.dataset.hs].hs = inp.value.trim(); });
        s.frt = work.frt; s.ins = work.ins; cu.type = type;
        var again = cu.st === 'returned';
        cu.st = 'draft'; cu.by = ME.coord; cu.at = nowT(); cu.note = '';
        upsertDecl(s, 'For broker review');
        tlAdd(s, again ? 'Declaration corrected and sent back to the broker' : 'Customs declaration prepared (' + TYPES[type].n + ') and sent to the broker', ME.coord, true);
        if (s.id === NEWID) guide.done('decl');
        m.close(); refresh(); toast('Declaration for ' + s.id + ' sent to Rajesh Kumar for review');
      });
    }

    function declChecks(s) {
      var C = s.lines.map(function (l) { return 'HS ' + l.hs + ' fits “' + l.d + '”'; });
      C.push('Line values add up to the invoice total (' + m2(fob(s)) + ')');
      C.push('Importer code ' + CUST[s.c].code + ' is active (simulated check)');
      if (s.id === NEWID) C.push('Quantity difference resolved at intake: ' + newQty() + ' chairs, confirmed by Omar Haddad');
      if (s.customs.type === 'fz') C.push('Free zone entry: duty suspended while goods stay in the zone');
      if (s.customs.type === 'gcc') C.push('Certificate of origin on file: GCC origin, duty exempt');
      return C;
    }
    function reviewDecl(s) {
      var html = '<div class="fx-rev"><div class="fx-rev-doc">' + SDA.docPage(declDoc(s)) + '</div><div class="fx-rev-side">' +
        '<div class="ai-box"><div class="ai-h">AI pre-check (simulated)</div><ul>' + declChecks(s).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul></div>' +
        '<fieldset class="fx-fs"><legend>Your confirmation</legend>' + ['HS codes and descriptions checked', 'Values match the commercial invoice', 'Supporting documents on file'].map(function (t, i) { return '<label class="chk"><input type="checkbox" data-c="' + i + '"> ' + t + '</label>'; }).join('') + '</fieldset>' +
        '<p class="note err" role="status"></p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ok>' + IC.shield + 'Approve and submit</button><button type="button" class="btn btn-ghost btn-sm" data-ret>Return to operations</button></div>' +
        '<div class="fx-ret" hidden><label>Reason for returning it<textarea rows="3" data-reason></textarea></label><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-retok>Return with comment</button></div></div>' +
        '<p class="note">Submission goes to a simulated customs system. Nothing is sent.</p></div></div>';
      var m = SDA.modal(root, { title: 'Review declaration · ' + s.id, wide: true, html: html });
      m.el.classList.add('fx-modal');
      m.body.addEventListener('click', function (e) {
        var err = q('.err', m.body);
        if (e.target.closest('[data-ok]')) {
          if (qa('[data-c]', m.body).some(function (x) { return !x.checked; })) { err.textContent = 'Tick all three confirmations before submitting.'; q('[data-c]:not(:checked)', m.body).focus(); return; }
          m.close(); submitDecl(s); return;
        }
        if (e.target.closest('[data-ret]')) { q('.fx-ret', m.body).hidden = false; q('[data-reason]', m.body).focus(); return; }
        if (e.target.closest('[data-retok]')) {
          var r = q('[data-reason]', m.body).value.trim();
          if (!r) { err.textContent = 'Please add a short reason for operations.'; q('[data-reason]', m.body).setAttribute('aria-invalid', 'true'); q('[data-reason]', m.body).focus(); return; }
          s.customs.st = 'returned'; s.customs.note = r; setDeclStatus(s, 'Draft – returned'); tlAdd(s, 'Declaration returned to operations: ' + r, ME.broker, true);
          m.close(); refresh(); toast('Returned to Omar Haddad with your comment');
        }
      });
    }
    function submitDecl(s) {
      var cu = s.customs;
      cu.st = 'submitted'; cu.no = cu.no || 'DEC-26-' + (118450 + (++seq)); cu.busy = 'Waiting for the customs response (simulated)…';
      upsertDecl(s, 'Submitted');
      if (s.stage === 2) s.stage = 3;
      tlAdd(s, 'Declaration ' + cu.no + ' approved and submitted to customs', ME.broker);
      refresh(); toast('Submitted ' + cu.no + ' to customs (simulated)');
      ctx.later(SDA.reduce ? 300 : 2600, function () { respond(s); });
    }
    function respond(s) {
      var cu = s.customs; cu.busy = null;
      if (s.id === NEWID && !cu.hadQuery) {
        cu.hadQuery = true; cu.st = 'query';
        cu.query = { short: 'certificate of origin and quantity confirmation for HS 9401.61', text: 'Please provide the certificate of origin and confirm the quantity of upholstered dining chairs (HS 9401.61), as the commercial invoice and packing list differ.', need: 'Certificate of origin', fromCust: false };
        setDeclStatus(s, 'Pending – customs query');
        tlAdd(s, 'Customs query: ' + cu.query.short, 'Customs (simulated)');
        if (role === 'broker') ui.qtab = 'query';
        refresh(); toast('Customs query received for ' + s.id + ' (simulated)', 'warn');
        return;
      }
      clearS(s);
    }
    function clearS(s) {
      var cu = s.customs;
      cu.st = 'cleared'; cu.busy = null; cu.rel = 'REL-26-' + (56200 + (++seq)); cu.relOff = 0;
      setDeclStatus(s, 'Cleared');
      dms.add(relDoc(s));
      tlAdd(s, 'Released by customs · ' + cu.rel + (TYPES[cu.type].rate ? ' · duty ' + m2(dutyOf(s)) + ' (illustrative)' : ''), 'Customs (simulated)');
      if (s.stage >= 2) s.stage = 4;
      if (s.c === MYC && !INV.filter(function (v) { return v.ship === s.id; }).length) {
        INV.unshift({ id: 'HF-INV-2611-0' + (400 + seq), ship: s.id, c: s.c, off: 0, due: 30, status: 'Due', items: [['Ocean freight ' + city(s.from) + ' – ' + PORT[s.pod].s + ', ' + contSum(s), s.frt], ['Customs clearance and documentation', 350], ['Customs duty paid on your behalf (illustrative)', dutyOf(s)], ['Port handling and delivery order fees', 620]] });
      }
      refresh(); toast(s.id + ' cleared and released (simulated)');
    }
    function refreshStatus(s) {
      var cu = s.customs; cu.busy = 'Checking status with customs (simulated)…'; refresh();
      ctx.later(SDA.reduce ? 200 : 1400, function () { if (cu.st === 'submitted' || cu.st === 'answered') clearS(s); else { cu.busy = null; refresh(); } });
    }
    function answerQuery(s) {
      var cu = s.customs, qy = cu.query, D = docsFor(s), id = uidf();
      var sugg = function (d) { return s.id === NEWID ? /Certificate of origin|CO_|PL_|Packing/.test(d.name) : (qy.got && d.id === qy.got); };
      var reply = s.id === NEWID
        ? 'Dear officer,\nplease find attached the certificate of origin (China) and the packing list for declaration ' + cu.no + '. The declared quantity of upholstered dining chairs is ' + newQty() + ' pcs, ' + (newQty() === 236 ? 'matching the packing list and the bill of lading (268 cartons). The shipper has been asked for a corrected commercial invoice.' : 'as invoiced. The shipper has been asked to confirm the packing list.') + '\nRegards,\nRajesh Kumar, ' + FWD
        : 'Dear officer,\nplease find attached the product catalogue for the sofas and armchairs under declaration ' + cu.no + '. Both have solid wood frames with fabric upholstery, consistent with HS 9401.61.\nRegards,\nRajesh Kumar, ' + FWD;
      var html = '<div class="fx-form"><p class="fx-qtext">' + IC.alert + '<span><b>Customs query on ' + cu.no + ':</b> ' + esc(qy.text) + '</span></p>' +
        (qy.fromCust && !qy.got ? '<p class="fx-qtext warn">' + IC.clock + '<span>The importer has not uploaded the ' + esc(qy.need.toLowerCase()) + ' yet. You can remind them (simulated) or answer with other documents.</span></p>' : '') +
        '<fieldset class="fx-fs"><legend>Attach documents</legend><div class="fx-pick">' + D.map(function (d) { return '<label class="chk"><input type="checkbox" data-doc="' + d.id + '"' + (sugg(d) ? ' checked' : '') + '> <span>' + esc(d.name) + '</span>' + (sugg(d) ? '<small>AI suggests</small>' : '') + '</label>'; }).join('') + '</div></fieldset>' +
        '<label for="' + id + '">Reply to customs<textarea id="' + id + '" rows="8" data-reply></textarea></label>' +
        '<p class="note err" role="status"></p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ok>' + IC.arrow + 'Send reply to customs (simulated)</button>' + (qy.fromCust && !qy.got ? '<button type="button" class="btn btn-ghost btn-sm" data-remind>Remind importer</button>' : '') + '<button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>';
      var m = SDA.modal(root, { title: 'Answer customs query · ' + s.id, html: html });
      m.el.classList.add('fx-modal');
      var ta = q('[data-reply]', m.body);
      ta.value = ''; ta.placeholder = 'AI (simulated) is drafting a reply…'; ta.disabled = true;
      ctx.later(SDA.reduce ? 50 : 700, function () { ta.disabled = false; ta.placeholder = ''; ta.value = reply; });
      m.body.addEventListener('click', function (e) {
        var err = q('.err', m.body);
        if (e.target.closest('[data-remind]')) { tlAdd(s, 'Reminder sent to ' + CUST[s.c].contact + ' for the ' + qy.need.toLowerCase(), ME.broker); e.target.closest('[data-remind]').disabled = true; toast('Reminder sent to ' + CUST[s.c].contact + ' (simulated, not sent)'); return; }
        if (!e.target.closest('[data-ok]')) return;
        var docs = qa('[data-doc]:checked', m.body).map(function (x) { return x.dataset.doc; });
        if (!docs.length) { err.textContent = 'Attach at least one document.'; q('[data-doc]', m.body) && q('[data-doc]', m.body).focus(); return; }
        if (!ta.value.trim()) { err.textContent = 'Write a short reply.'; ta.focus(); return; }
        qy.answered = { docs: docs, reply: ta.value.trim() };
        cu.st = 'answered'; cu.busy = 'Waiting for customs to review your answer (simulated)…';
        setDeclStatus(s, 'Pending – answer sent');
        tlAdd(s, 'Query answered with ' + docs.length + ' document' + (docs.length > 1 ? 's' : '') + ': ' + docs.map(function (d) { return docById(d).name; }).join(', '), ME.broker);
        if (s.id === NEWID) guide.done('customs');
        m.close(); refresh(); toast('Answer sent to customs (simulated)');
        ctx.later(SDA.reduce ? 300 : 2400, function () { clearS(s); });
      });
    }

    function advance(s, how) {
      if (how === 'depart') { s.stage = 1; s.etd = 0; tlAdd(s, (s.mode === 'road' ? 'Truck departed ' : 'Departed ') + s.from, ME.coord); toast(s.id + ' marked as departed'); }
      if (how === 'arrive') {
        s.eta = 0; tlAdd(s, 'Arrived at ' + PORT[s.pod].n, ME.coord);
        if (s.customs.st === 'cleared') { s.stage = 4; tlAdd(s, 'Pre-cleared: released on arrival', 'Customs (simulated)'); }
        else s.stage = /submitted|query|answered/.test(s.customs.st) ? 3 : 2;
        toast(s.id + ' arrived at ' + PORT[s.pod].s);
      }
      refresh();
    }
    function suggestTruck(s) {
      var free = TRUCKS.filter(function (t) { return !busyOn(t); });
      return free.filter(function (t) { return t.base === PORT[s.pod].base && (s.mode !== 'sea' || /40/.test(t.kind)); })[0] || free.filter(function (t) { return s.mode !== 'sea' || /40/.test(t.kind); })[0] || free[0];
    }
    function assignTruck(s) {
      var c = CUST[s.c], sug = suggestTruck(s), id = uidf();
      var html = '<div class="fx-form">' + (sug ? aiNote('<b>AI (simulated) suggests ' + esc(sug.plate) + ' · ' + esc(sug.driver) + '</b>: free today, ' + esc(sug.kind) + ', based at ' + esc(sug.base) + '.') : '') +
        '<fieldset class="fx-fs"><legend>Truck and driver</legend><div class="fx-pick">' + TRUCKS.map(function (t) { var b = busyOn(t); return '<label class="fx-opt' + (b ? ' dis' : '') + '"><input type="radio" name="' + id + 't" value="' + t.id + '"' + (b ? ' disabled' : '') + (t === sug ? ' checked' : '') + '><span><b>' + esc(t.plate) + ' · ' + esc(t.driver) + '</b><small>' + esc(t.kind) + ' · ' + esc(t.base) + ' · ' + (b ? 'on run ' + b.id : 'available') + '</small></span></label>'; }).join('') + '</div></fieldset>' +
        '<div class="fx-2"><label for="' + id + 's">Delivery slot<select id="' + id + 's" data-slot>' + SLOTS.map(function (sl, i) { return '<option value="' + i + '"' + (i === 1 ? ' selected' : '') + '>' + esc(slotEn(i)) + '</option>'; }).join('') + '</select></label>' +
        '<label for="' + id + 'a">Deliver to<input id="' + id + 'a" value="' + esc(c.wh) + '" readonly></label></div>' +
        (s.conts.length > 1 && s.mode === 'sea' ? '<p class="note">' + s.conts.length + ' containers: the truck makes ' + s.conts.length + ' trips from ' + esc(PORT[s.pod].s) + '.</p>' : '') +
        '<p class="note err" role="status"></p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ok>' + IC.truck + 'Assign and notify driver</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div><p class="note">The driver gets the job by SMS (simulated, not sent).</p></div>';
      var m = SDA.modal(root, { title: 'Assign truck · ' + s.id, html: html });
      m.el.classList.add('fx-modal');
      m.body.addEventListener('click', function (e) {
        if (!e.target.closest('[data-ok]')) return;
        var r = q('input[type=radio]:checked', m.body);
        if (!r) { q('.err', m.body).textContent = 'Choose a truck.'; return; }
        var t = find(TRUCKS, r.value);
        s.del = { st: 'scheduled', truck: t.id, slot: +q('[data-slot]', m.body).value };
        tlAdd(s, 'Truck ' + t.plate + ' assigned, driver ' + t.driver + ' · ' + slotEn(s.del.slot), ME.coord);
        m.close(); refresh(); toast(t.driver + ' notified by SMS (simulated, not sent)');
      });
    }
    function recordPod(s) {
      var c = CUST[s.c], id = uidf(), seal = s.conts[0][2];
      var html = '<div class="fx-form"><div class="fx-pod"><figure><img src="' + SDA.art('signature') + '" alt="Signature captured in the driver app"><figcaption>Signature from the driver app</figcaption></figure><figure><img src="' + SDA.art('pallet', 'Unloaded at ' + city(c.wh)) + '" alt="Photo of the unloaded goods"><figcaption>Photo at unloading</figcaption></figure></div>' +
        '<div class="fx-2"><label for="' + id + 'b">Received by<input id="' + id + 'b" data-by value="' + esc(c.contact) + '"></label><label for="' + id + 'c">Condition<select id="' + id + 'c" data-cond><option>Good condition</option><option>Damage noted</option></select></label></div>' +
        (s.mode === 'sea' ? '<label class="chk"><input type="checkbox" data-seal checked> Container seal intact (' + esc(seal) + ')</label>' : '') +
        '<p class="note err" role="status"></p><div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-ok>' + IC.check + 'Confirm delivery</button><button type="button" class="btn btn-ghost btn-sm" data-close>Cancel</button></div></div>';
      var m = SDA.modal(root, { title: 'Proof of delivery · ' + s.id, html: html });
      m.el.classList.add('fx-modal');
      m.body.addEventListener('click', function (e) {
        if (!e.target.closest('[data-ok]')) return;
        var by = q('[data-by]', m.body).value.trim(), cond = q('[data-cond]', m.body).value.toLowerCase();
        if (!by) { q('.err', m.body).textContent = 'Enter who received the goods.'; q('[data-by]', m.body).focus(); return; }
        s.del.st = 'done'; s.del.off = 0; s.del.podBy = by; s.stage = 5;
        dms.add(podDoc(s, by, cond));
        tlAdd(s, 'Delivered · proof of delivery signed by ' + by + ' · ' + cond, find(TRUCKS, s.del.truck).driver);
        m.close(); refresh(); toast(s.id + ' delivered. POD filed under Delivery.');
      });
    }
    function custUpload(s, file) {
      var qy = s.customs.query, isImg = file && /^image\//.test(file.type), url = isImg ? URL.createObjectURL(file) : null;
      if (url) ctx.onCleanup(function () { URL.revokeObjectURL(url); });
      var d = dms.add(base(s, { name: file ? file.name : 'Product catalogue – sofas and armchairs.pdf', type: isImg ? 'jpg' : file ? (file.name.split('.').pop() || 'pdf').toLowerCase() : 'pdf', folder: 'Customs', owner: ME.customer, status: 'In review', date: dLong(0), tags: ['requested by customs'], note: 'Uploaded by the importer',
        img: url || undefined, title: file ? undefined : 'Product catalogue 2026 · Living room', company: file ? CUST[s.c].name : 'Lumen Home Furniture Co., Ltd.',
        meta: file ? undefined : [['For', s.id], ['HS', '9401.61']], sections: file ? undefined : [{ h: 'Sofas', p: 'Solid beech wood frame, pocket springs, polyester fabric upholstery.' }, { h: 'Armchairs', p: 'Solid oak frame, foam cushions, linen-blend upholstery.' }] }));
      if (qy && s.customs.st === 'query') qy.got = d.id;
      tlAdd(s, 'Importer uploaded ' + d.name, ME.customer);
      refresh(); toast('Uploaded. Harbourline and the customs broker can see it now.');
    }
    function invoiceFile(v) {
      var dc = invDoc(v);
      var rows = v.items.map(function (i) { return '<tr><td>' + esc(i[0]) + '</td><td style="text-align:right">' + m2(i[1]) + '</td></tr>'; }).join('');
      var html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>' + esc(dc.title) + '</title><body style="font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;color:#22313A"><h1 style="font-size:22px">' + esc(dc.title) + '</h1><p>' + esc(FWD) + ' · Dubai, UAE (sample)</p>' +
        '<p>Customer: ' + esc(CUST[v.c].name) + '<br>Shipment: ' + v.ship + '<br>Date: ' + dLong(v.off) + ' · Due: ' + dLong(v.due) + '</p><table style="width:100%;border-collapse:collapse" border="1" cellpadding="8">' + rows + '<tr><th style="text-align:left">Total (USD)</th><th style="text-align:right">' + m2(invTotal(v)) + '</th></tr></table>' +
        '<p style="color:#667;font-size:13px">Sample invoice generated by the ShipDesk demo. Fictional data; duty amounts are illustrative.</p></body></html>';
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = v.id + '.html'; a.hidden = true;
      root.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast('Invoice ' + v.id + ' downloaded (sample file)');
    }
    function generate() {
      var s = ship(ui.upd); ui.genBusy = true; ui.gen = null; render();
      ctx.later(SDA.reduce ? 50 : 900, function () { var m = msgFor(s); ui.genBusy = false; ui.gen = { id: s.id, kind: m.kind, en: m.en, ar: m.ar }; render(); var t = q('[data-g="en"]', main); if (t) t.focus({ preventScroll: true }); });
    }
    function sendUpdate() {
      var s = ship(ui.upd), g = ui.gen, en = q('[data-g="en"]', main).value.trim(), ar = q('[data-g="ar"]', main).value.trim();
      if (!en || !ar) { toast('Both the English and the Arabic text are needed.', 'warn'); return; }
      s.updates.push({ off: 0, time: nowT(), ch: ui.ch, kind: g.kind, en: en, ar: ar, by: ME.coord });
      tlAdd(s, 'Customer update sent in English and Arabic via ' + (ui.ch === 'wa' ? 'WhatsApp' : 'e-mail') + ' (simulated, not sent)', ME.coord);
      if (s.id === NEWID) guide.done('update');
      ui.gen = null; render();
      toast('Update for ' + s.id + ' sent to ' + CUST[s.c].contact + ' (simulated, not sent)');
    }

    /* ---------------- events ---------------- */
    function act(a, b) {
      var s = b.dataset.id && ship(b.dataset.id);
      switch (a) {
        case 'go': go(b.dataset.v); break;
        case 'layout': ui.layout = b.dataset.l; render(); q('[data-a="layout"][data-l="' + ui.layout + '"]', main).focus(); break;
        case 'mode': ui.mode = b.dataset.m; qa('[data-a="mode"]', main).forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.m === ui.mode); }); renderResults(); break;
        case 'clearf': ui.q = ''; ui.mode = 'all'; ui.cust = 'all'; ui.stage = 'all'; ui.eta = 'all'; render(); break;
        case 'load': doLoad(); break;
        case 'extract': doExtract(); break;
        case 'peek': var d = DOCK[+b.dataset.i]; SDA.modal(root, { title: d.name, wide: true, html: '<div class="fx-peek">' + SDA.docPage(d) + '</div>' }); break;
        case 'mm-ok': INTAKE.res[b.dataset.k] = INTAKE.sel[b.dataset.k]; render(); var nx = q('[data-mm]:not(:checked)', main) || q('[data-a="create"]', main); if (nx) nx.focus({ preventScroll: true }); break;
        case 'mm-undo': INTAKE.res[b.dataset.k] = null; render(); break;
        case 'create': if (!INTAKE.created) createNew(); break;
        case 'decl': openDecl(s); break;
        case 'review': reviewDecl(s); break;
        case 'answer': answerQuery(s); break;
        case 'refresh': refreshStatus(s); break;
        case 'depart': case 'arrive': advance(s, a); break;
        case 'assign': assignTruck(s); break;
        case 'out': s.del.st = 'out'; tlAdd(s, 'Out for delivery to ' + CUST[s.c].wh, find(TRUCKS, s.del.truck).driver); refresh(); toast(s.id + ' is on the road'); break;
        case 'pod': recordPod(s); break;
        case 'update': ui.upd = s.id; ui.gen = null; openId = null; go('updates'); break;
        case 'pick': ui.upd = b.dataset.id; ui.gen = null; render(); var pk = q('[data-a="pick"][data-id="' + ui.upd + '"]', main); if (pk) pk.focus({ preventScroll: true }); break;
        case 'ch': ui.ch = b.dataset.c; render(); break;
        case 'gen': generate(); break;
        case 'send': sendUpdate(); break;
        case 'qtab': ui.qtab = b.dataset.t; render(); q('[data-a="qtab"][data-t="' + ui.qtab + '"]', main).focus(); break;
        case 'lang': ui.lang = b.dataset.l; render(); var lb = q('[data-a="lang"][data-l="' + ui.lang + '"]', main); if (lb) lb.focus({ preventScroll: true }); break;
        case 'pf': ui.pf = b.dataset.p; render(); break;
        case 'cup-sample': custUpload(s, null); break;
        case 'inv-dl': invoiceFile(find(INV, b.dataset.id)); break;
        case 'inv-view': var v = find(INV, b.dataset.id); SDA.modal(root, { title: v.id, wide: true, html: '<div class="fx-peek">' + SDA.docPage(invDoc(v)) + '</div>' }); break;
      }
    }
    nav.addEventListener('click', function (e) { var b = e.target.closest('[data-v]'); if (b) { openId = null; go(b.dataset.v); var nb = q('[data-v="' + b.dataset.v + '"]', nav); if (nb) nb.focus(); } });
    main.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.open) { openShip(b.dataset.open, b.dataset.tab); return; }
      if (b.dataset.a) act(b.dataset.a, b);
    });
    main.addEventListener('input', function (e) { if (e.target.matches('[data-f="q"]')) { ui.q = e.target.value; renderResults(); } });
    main.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('select[data-f]')) { ui[t.dataset.f] = t.value; renderResults(); return; }
      if (t.matches('[data-mm]')) { INTAKE.sel[t.dataset.mm] = t.value; var cb = q('[data-a="mm-ok"][data-k="' + t.dataset.mm + '"]', main); if (cb) cb.disabled = false; return; }
      if (t.matches('[data-files]') && t.files.length) { Array.prototype.forEach.call(t.files, function (f) { INTAKE.own.push(f.name); }); render(); toast(t.files.length + ' file' + (t.files.length > 1 ? 's' : '') + ' added. Nothing leaves your browser.'); return; }
      if (t.matches('[data-cup]') && t.files.length) { custUpload(ship(t.dataset.cup), t.files[0]); }
    });
    main.addEventListener('dragover', function (e) { var z = e.target.closest && e.target.closest('.fx-drop'); if (z) { e.preventDefault(); z.classList.add('over'); } });
    main.addEventListener('dragleave', function (e) { var z = e.target.closest && e.target.closest('.fx-drop'); if (z) z.classList.remove('over'); });
    main.addEventListener('drop', function (e) {
      var z = e.target.closest && e.target.closest('.fx-drop'); if (!z) return;
      e.preventDefault(); z.classList.remove('over');
      var fs = e.dataTransfer && e.dataTransfer.files; if (!fs || !fs.length) return;
      Array.prototype.forEach.call(fs, function (f) { INTAKE.own.push(f.name); });
      render(); toast(fs.length + ' file' + (fs.length > 1 ? 's' : '') + ' added. Nothing leaves your browser.');
    });
    drawer.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-close-d')) { closeDrawer(); return; }
      if (b.dataset.tab) {
        dTab = b.dataset.tab; renderDrawer(); q('[data-tab="' + dTab + '"]', drawer).focus();
        if (role === 'customer' && openId === NEWID && dTab === 'docs') guide.done('customer');
        return;
      }
      if (b.dataset.prev) { var d = docById(b.dataset.prev); if (role === 'customer' && d && d.ship === NEWID) guide.done('customer'); dms.open(b.dataset.prev); return; }
      if (b.dataset.a) act(b.dataset.a, b);
    });
    drawer.addEventListener('keydown', function (e) {
      var tb = e.target.closest('[role="tab"]'); if (!tb || !/Arrow(Left|Right)/.test(e.key)) return;
      var order = ['ov', 'cargo', 'customs', 'docs', 'del', 'msg'], i = order.indexOf(dTab);
      dTab = order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length]; renderDrawer(); q('[data-tab="' + dTab + '"]', drawer).focus();
    });
    drawer.addEventListener('change', function (e) {
      var t = e.target;
      if (t.matches('[data-cup]') && t.files.length) { custUpload(ship(t.dataset.cup), t.files[0]); return; }
      if (t.matches('[data-dup]') && t.files.length) {
        var s = ship(t.dataset.dup);
        Array.prototype.forEach.call(t.files, function (f) {
          var isImg = /^image\//.test(f.type), url = isImg ? URL.createObjectURL(f) : null;
          if (url) ctx.onCleanup(function () { URL.revokeObjectURL(url); });
          dms.add(base(s, { name: f.name, type: isImg ? 'jpg' : (f.name.split('.').pop() || 'pdf').toLowerCase(), folder: role === 'broker' ? 'Customs' : 'Commercial docs', owner: ME[role], status: 'In review', date: dLong(0), tags: ['uploaded'], img: url || undefined, note: 'Uploaded from this device (stays in your browser)' }));
        });
        tlAdd(s, t.files.length + ' document' + (t.files.length > 1 ? 's' : '') + ' uploaded', ME[role]);
        refresh(); dTab = 'docs'; renderDrawer(); toast('Added to ' + s.id + '. Nothing leaves your browser.');
      }
    });
    scrim.addEventListener('click', closeDrawer);
    var onKey = function (e) {
      if (e.key !== 'Escape' || !openId || drawer.hidden) return;
      if (e.target.closest && e.target.closest('.sda-modal')) return;
      if (root.querySelector('.sda-modal')) return;
      if (root.contains(e.target) || e.target === document.body) closeDrawer();
    };
    document.addEventListener('keydown', onKey);
    ctx.onCleanup(function () { document.removeEventListener('keydown', onKey); });

    ready = true;
    render();
  });
})();
