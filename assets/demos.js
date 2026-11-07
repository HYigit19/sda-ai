/* SDA demo toolkit – shared by every demo (window.SDA).
   All data in the demos is fictional. Nothing is sent anywhere: AI steps, e-mails and notifications are simulated.

   Main pieces
   - SDA.demo(id, init)        lazy start when the demo becomes visible, reset support, visibility-aware timers
   - SDA.roles(el, opts)       clear "View as" role switcher (+ banner) – each role gets its own view
   - SDA.dms(el, opts)         document management: folders, search, upload, preview, versions, approve, link to records
   - SDA.guide(el, opts)       "Try this" task with checkable steps, reset button and closing call to action
   - SDA.modal / SDA.toast     dialogs and short confirmations
   - SDA.docPage(doc)          renders a document (PDF/Word/Excel/CV) as a paper page for previews
   - SDA.art(kind, label)      simple generated photos (parcel, meter, damage, …) as data URIs
*/
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var usd = function (n) { return '$' + (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? Math.round(n / 1e3) + 'k' : Math.round(n).toLocaleString('en-US')); };
  var money = function (n, dec) { return (n < 0 ? '−$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 }); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = 0; var uid = function (p) { return (p || 'id') + '-' + (++n) + '-' + Math.random().toString(36).slice(2, 6); };
  var today = function (offsetDays) { var d = new Date(); d.setDate(d.getDate() + (offsetDays || 0)); return d; };
  var fmtDate = function (d) { d = d instanceof Date ? d : new Date(d); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  var fmtTime = function (d) { d = d instanceof Date ? d : new Date(d); return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); };

  function typeInto(el, html, done) {
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var full = tmp.innerHTML, words = full.split(/(\s+)/), i = 0;
    if (reduce) { el.innerHTML = full; done && done(); return; }
    el.classList.add('typing'); clearInterval(el._t);
    el._t = setInterval(function () {
      i += 3; el.innerHTML = words.slice(0, i).join('');
      if (i >= words.length) { clearInterval(el._t); el.innerHTML = full; el.classList.remove('typing'); done && done(); }
    }, 28);
  }

  /* ---------------- icons ---------------- */
  var I = function (p, vb) { return '<svg viewBox="' + (vb || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; };
  var ICON = {
    close: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    upload: I('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    doc: I('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'),
    img: I('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-7 7"/>'),
    sheet: I('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>'),
    folder: I('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    link: I('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
    check: I('<path d="m5 12 5 5 9-10"/>'),
    reset: I('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v5h5"/>'),
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.6 4.8 2.6 7.4 8 8-5.4.6-7.4 3.2-8 8-.6-4.8-2.6-7.4-8-8 5.4-.6 7.4-3.2 8-8z" fill="currentColor"/></svg>',
    lock: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    history: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>'),
    share: I('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>')
  };

  /* ---------------- generated photos ---------------- */
  var ART = {
    parcel: '<rect width="400" height="300" fill="#E8EEF0"/><rect x="0" y="210" width="400" height="90" fill="#C9D3D6"/><rect x="110" y="110" width="180" height="120" fill="#C79A63"/><path d="M110 110l30-30h180l-30 30z" fill="#D9B07A"/><path d="M290 110l30-30v120l-30 30z" fill="#A97E4C"/><rect x="185" y="110" width="30" height="120" fill="#E8D2A8"/><rect x="130" y="150" width="60" height="34" fill="#fff"/><path d="M136 160h44M136 170h30" stroke="#333" stroke-width="3"/>',
    pallet: '<rect width="400" height="300" fill="#E9EDF0"/><rect y="230" width="400" height="70" fill="#BFC8CC"/><rect x="80" y="215" width="240" height="18" fill="#9B7B53"/><g fill="#C79A63"><rect x="90" y="140" width="70" height="75"/><rect x="165" y="140" width="70" height="75"/><rect x="240" y="140" width="70" height="75"/><rect x="125" y="70" width="70" height="70"/><rect x="200" y="70" width="70" height="70"/></g><path d="M80 70h240v160H80z" fill="#fff" opacity=".18"/>',
    meter: '<rect width="400" height="300" fill="#DDE5E8"/><rect x="120" y="50" width="160" height="200" rx="18" fill="#F4F6F7" stroke="#9AA9AE" stroke-width="4"/><rect x="145" y="80" width="110" height="40" rx="6" fill="#20343C"/><text x="200" y="108" fill="#7CF0C8" font-family="monospace" font-size="24" text-anchor="middle">04827.3</text><circle cx="200" cy="180" r="34" fill="none" stroke="#9AA9AE" stroke-width="4"/><path d="M200 180l18-20" stroke="#E2563B" stroke-width="5" stroke-linecap="round"/>',
    damage: '<rect width="400" height="300" fill="#ECE7E1"/><rect x="60" y="60" width="280" height="190" fill="#D8CFC4"/><path d="M150 60l20 50-30 30 40 40-20 70" stroke="#5B4A3B" stroke-width="5" fill="none"/><path d="M170 110l50-10 20 40" stroke="#5B4A3B" stroke-width="3" fill="none"/><ellipse cx="240" cy="210" rx="60" ry="22" fill="#9FB4BF" opacity=".7"/>',
    install: '<rect width="400" height="300" fill="#E3EAED"/><rect x="70" y="40" width="260" height="220" rx="10" fill="#F7F9FA" stroke="#A6B4B9" stroke-width="4"/><rect x="100" y="70" width="200" height="60" rx="6" fill="#20343C"/><g fill="#5FD3BF"><circle cx="125" cy="100" r="7"/><circle cx="150" cy="100" r="7"/></g><path d="M100 160h200M100 190h140M100 220h170" stroke="#B9C5C9" stroke-width="10" stroke-linecap="round"/>',
    leak: '<rect width="400" height="300" fill="#E6ECEE"/><rect y="200" width="400" height="100" fill="#C7D1D4"/><rect x="60" y="40" width="40" height="160" fill="#A9B6BA"/><rect x="60" y="120" width="220" height="26" fill="#A9B6BA"/><circle cx="280" cy="133" r="16" fill="#8E9CA0"/><path d="M290 150c6 14 10 22 10 30a10 10 0 0 1-20 0c0-8 4-16 10-30z" fill="#4FA3D9"/><ellipse cx="290" cy="240" rx="80" ry="18" fill="#4FA3D9" opacity=".55"/>',
    room: '<rect width="400" height="300" fill="#EDEFEA"/><rect y="210" width="400" height="90" fill="#CDBFA9"/><rect x="40" y="60" width="120" height="90" fill="#BFE0E8" stroke="#fff" stroke-width="8"/><rect x="220" y="140" width="140" height="70" rx="8" fill="#5E7F78"/><rect x="230" y="120" width="120" height="30" rx="8" fill="#6E918A"/>',
    signature: '<rect width="400" height="300" fill="#fff"/><path d="M60 200c30-60 50-90 60-70s-20 80 10 70 40-90 60-80-10 70 20 60 30-40 50-30 30 10 60 0" stroke="#1B2B33" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M50 230h300" stroke="#C8D0D3" stroke-width="3"/>',
    portrait: '<rect width="400" height="300" fill="#DDEBEA"/><circle cx="200" cy="120" r="56" fill="#9DB7B3"/><path d="M90 300c10-70 60-100 110-100s100 30 110 100z" fill="#7FA09B"/>'
  };
  function art(kind, label) {
    var body = ART[kind] || ART.parcel;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' + body +
      (label ? '<rect x="0" y="262" width="400" height="38" fill="rgba(0,0,0,.45)"/><text x="14" y="287" fill="#fff" font-family="Arial" font-size="17">' + esc(label) + '</text>' : '') + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------------- demo registry: lazy start + reset ---------------- */
  var registry = {};
  function demo(id, init) {
    var root = document.getElementById(id);
    if (!root) return;
    var template = root.cloneNode(true);
    var state = { root: root, cleanup: [], started: false };
    registry[id] = state;
    function ctx(el) {
      return {
        id: id,
        // runs fn every ms while the demo is on screen and the tab is visible
        every: function (ms, fn) {
          var t = setInterval(function () { if (document.visibilityState === 'visible' && el._sdaVisible !== false) fn(); }, ms);
          state.cleanup.push(function () { clearInterval(t); });
          return t;
        },
        later: function (ms, fn) { var t = setTimeout(fn, ms); state.cleanup.push(function () { clearTimeout(t); }); return t; },
        reset: function () { reset(id); },
        onCleanup: function (fn) { state.cleanup.push(fn); }
      };
    }
    function start(el) {
      state.started = true;
      if ('IntersectionObserver' in window) {
        var vis = new IntersectionObserver(function (es) { es.forEach(function (x) { el._sdaVisible = x.isIntersecting; }); });
        vis.observe(el); state.cleanup.push(function () { vis.disconnect(); });
      }
      var out = init(el, ctx(el));
      if (typeof out === 'function') state.cleanup.push(out);
    }
    state.restart = function () {
      state.cleanup.forEach(function (f) { try { f(); } catch (e) {} }); state.cleanup = [];
      var fresh = template.cloneNode(true);
      state.root.replaceWith(fresh); state.root = fresh;
      start(fresh);
      var first = fresh.querySelector('.sda-guide, .demo-top'); if (first && first.scrollIntoView) { /* keep position */ }
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (x) { return x.isIntersecting; })) { io.disconnect(); start(root); }
      }, { rootMargin: '300px' });
      io.observe(root);
    } else start(root);
  }
  function reset(id) { var s = registry[id]; if (s) s.restart(); }

  /* ---------------- toast + modal ---------------- */
  function toast(root, msg, kind) {
    var host = root.querySelector(':scope > .sda-toast') || root.appendChild(Object.assign(document.createElement('div'), { className: 'sda-toast', role: 'status' }));
    host.innerHTML = (kind === 'warn' ? '' : ICON.check) + '<span>' + msg + '</span>';
    host.className = 'sda-toast on' + (kind ? ' ' + kind : '');
    clearTimeout(host._t); host._t = setTimeout(function () { host.classList.remove('on'); }, 2600);
  }
  function modal(root, opts) {
    var host = document.createElement('div');
    host.className = 'sda-modal' + (opts.wide ? ' wide' : '');
    host.innerHTML = '<div class="sda-scrim" data-close></div><div class="sda-dialog" role="dialog" aria-modal="true" aria-label="' + esc(opts.title || 'Details') + '">' +
      '<div class="sda-dialog-h"><b>' + esc(opts.title || '') + '</b><button type="button" class="sda-x" data-close aria-label="Close">' + ICON.close + '</button></div>' +
      '<div class="sda-dialog-b"></div></div>';
    $('.sda-dialog-b', host).innerHTML = opts.html || '';
    root.appendChild(host);
    var last = document.activeElement;
    var close = function () { host.remove(); if (last && last.focus) last.focus(); opts.onClose && opts.onClose(); };
    host.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    host.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    setTimeout(function () { var f = host.querySelector('.sda-dialog-b button, .sda-dialog-b input, .sda-dialog-b select, .sda-dialog-b textarea, .sda-x'); f && f.focus(); }, 30);
    return { el: host, body: $('.sda-dialog-b', host), close: close };
  }

  /* ---------------- role switcher ---------------- */
  // opts: { roles: [{id, label, sub, icon}], value, onChange(id), title }
  function roles(el, opts) {
    var cur = opts.value || opts.roles[0].id;
    el.classList.add('sda-roles');
    el.innerHTML = '<div class="sda-roles-row"><span class="sda-roles-l">' + esc(opts.title || 'Switch user') + '</span><div class="sda-roles-seg" role="radiogroup" aria-label="' + esc(opts.title || 'Switch user') + '">' +
      opts.roles.map(function (r) {
        return '<button type="button" role="radio" data-role="' + r.id + '"><span class="sda-av" aria-hidden="true">' + (r.icon || esc(r.label.slice(0, 1))) + '</span><span><b>' + esc(r.label) + '</b><small>' + esc(r.person || '') + '</small></span></button>';
      }).join('') + '</div></div><div class="sda-roles-banner" aria-live="polite"></div>';
    function paint() {
      var r = opts.roles.filter(function (x) { return x.id === cur; })[0];
      $$('[data-role]', el).forEach(function (b) { var on = b.dataset.role === cur; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; });
      var ban = $('.sda-roles-banner', el);
      ban.innerHTML = '<span class="sda-av sm" aria-hidden="true">' + (r.icon || '') + '</span><span>You are signed in as <b>' + esc(r.person ? r.person + ' · ' + r.label : r.label) + '</b>. ' + esc(r.sub || '') + '</span>';
      ban.classList.remove('flash'); void ban.offsetWidth; ban.classList.add('flash');
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-role]'); if (!b || b.dataset.role === cur) return;
      cur = b.dataset.role; paint(); opts.onChange && opts.onChange(cur);
    });
    el.addEventListener('keydown', function (e) {
      if (!/Arrow(Left|Right)/.test(e.key)) return;
      var ids = opts.roles.map(function (r) { return r.id; }), i = ids.indexOf(cur);
      i = (i + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length; cur = ids[i]; paint();
      $('[data-role="' + cur + '"]', el).focus(); opts.onChange && opts.onChange(cur);
    });
    paint();
    return { get: function () { return cur; }, set: function (id) { cur = id; paint(); opts.onChange && opts.onChange(cur); } };
  }

  /* ---------------- document page preview ---------------- */
  // doc: {name, type, title, company, meta:[[k,v]], sections:[{h, p|lines|rows}], img}
  function docPage(doc) {
    if (doc.img) return '<figure class="sda-photo"><img src="' + doc.img + '" alt="' + esc(doc.name) + '"><figcaption>' + esc(doc.name) + '</figcaption></figure>';
    var sec = (doc.sections || []).map(function (s) {
      var h = s.h ? '<h5>' + esc(s.h) + '</h5>' : '';
      if (s.rows) return h + '<table>' + s.rows.map(function (r, i) { return '<tr>' + r.map(function (c) { return i === 0 && s.head !== false ? '<th>' + esc(c) + '</th>' : '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
      if (s.lines) return h + '<ul>' + s.lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
      return h + '<p>' + esc(s.p || '') + '</p>';
    }).join('');
    var meta = (doc.meta || []).map(function (m) { return '<span><i>' + esc(m[0]) + '</i>' + esc(m[1]) + '</span>'; }).join('');
    var placeholder = !doc.sections ? '<div class="sda-page-lines"><i></i><i></i><i class="s"></i><i></i><i class="s"></i><i></i><i></i><i class="s"></i></div><p class="sda-page-note">Preview of an uploaded file. In the demo its content is not read.</p>' : '';
    return '<article class="sda-page"><header><span class="sda-page-co">' + esc(doc.company || 'SDA demo') + '</span><span class="sda-page-type">' + esc((doc.type || 'pdf').toUpperCase()) + '</span></header>' +
      '<h4>' + esc(doc.title || doc.name) + '</h4>' + (meta ? '<div class="sda-page-meta">' + meta + '</div>' : '') + sec + placeholder + '</article>';
  }

  /* ---------------- DMS ---------------- */
  // opts: { docs:[...], folders:[...], records:[...names for linking], title, canUpload(role), canApprove(role), role, onChange(docs), compact }
  // doc: {id, name, type:'pdf'|'docx'|'xlsx'|'jpg', folder, linked, owner, date, version, status, tags[], versions[{v,date,by,note}], + docPage fields}
  function dms(el, opts) {
    var docs = (opts.docs || []).map(function (d) { return Object.assign({ id: uid('doc'), version: 1, status: 'Valid', tags: [], versions: [] }, d); });
    docs.forEach(function (d) { if (!d.versions.length) d.versions = [{ v: d.version, date: d.date || fmtDate(today(-20)), by: d.owner || 'System', note: 'Uploaded' }]; });
    var st = { q: '', folder: 'All', role: opts.role };
    var root = opts.root || el.closest('.demo-shell') || document.body;
    var typeIcon = function (t) { return /jpg|png|img|photo/.test(t) ? ICON.img : /xls/.test(t) ? ICON.sheet : ICON.doc; };
    var pill = function (s) { var c = /expir|missing|overdue|reject/i.test(s) ? 'p-bad' : /draft|review|pending|due/i.test(s) ? 'p-warn' : 'p-ok'; return '<span class="pill ' + c + '">' + esc(s) + '</span>'; };
    var allowed = function (fn) { return !opts[fn] || opts[fn](st.role); };
    el.classList.add('sda-dms');
    function folders() { var f = ['All'].concat(opts.folders || []); docs.forEach(function (d) { if (f.indexOf(d.folder) < 0) f.push(d.folder); }); return f; }
    function list() {
      return docs.filter(function (d) {
        if (st.folder !== 'All' && d.folder !== st.folder) return false;
        if (opts.filter && !opts.filter(d, st.role)) return false;
        var q = st.q.toLowerCase(); return !q || (d.name + ' ' + (d.linked || '') + ' ' + d.tags.join(' ') + ' ' + d.folder).toLowerCase().indexOf(q) > -1;
      });
    }
    function render() {
      var L = list();
      el.innerHTML = '<div class="sda-dms-h"><div><b>' + esc(opts.title || 'Documents') + '</b><small>' + docs.length + ' files · versioned · linked to records</small></div>' +
        '<div class="sda-dms-tools"><label class="sda-search">' + ICON.search + '<input type="search" placeholder="Search documents" aria-label="Search documents" value="' + esc(st.q) + '"></label>' +
        (allowed('canUpload') ? '<button type="button" class="btn btn-ink btn-sm" data-dms="upload">' + ICON.upload + 'Upload</button><input type="file" class="sda-file" hidden multiple>' : '<span class="sda-ro">' + ICON.lock + 'Read only for this role</span>') + '</div></div>' +
        '<div class="sda-dms-folders" role="group" aria-label="Folders">' + folders().map(function (f) { return '<button type="button" data-folder="' + esc(f) + '" aria-pressed="' + (st.folder === f) + '">' + ICON.folder + esc(f) + '</button>'; }).join('') + '</div>' +
        (L.length ? '<div class="sda-dms-list">' + L.map(function (d) {
          return '<button type="button" class="sda-doc" data-doc="' + d.id + '"><span class="sda-doc-ic t-' + esc(d.type) + '">' + typeIcon(d.type) + '</span><span class="sda-doc-n"><b>' + esc(d.name) + '</b><small>' + esc(d.folder) + (d.linked ? ' · ' + esc(d.linked) : '') + '</small></span><span class="sda-doc-v">v' + d.version + '</span>' + pill(d.status) + '</button>';
        }).join('') + '</div>' : '<div class="sda-empty">No documents match. Try another folder or search term.</div>');
    }
    function open(id) {
      var d = docs.filter(function (x) { return x.id === id; })[0]; if (!d) return;
      var hist = d.versions.slice().reverse().map(function (v) { return '<li><b>v' + v.v + '</b> · ' + esc(v.date) + ' · ' + esc(v.by) + '<small>' + esc(v.note) + '</small></li>'; }).join('');
      var m = modal(root, { title: d.name, wide: true, html:
        '<div class="sda-prev"><div class="sda-prev-doc">' + docPage(d) + '</div><aside class="sda-prev-side">' +
        '<dl><dt>Status</dt><dd>' + pill(d.status) + '</dd><dt>Folder</dt><dd>' + esc(d.folder) + '</dd><dt>Linked to</dt><dd>' + esc(d.linked || '—') + '</dd><dt>Owner</dt><dd>' + esc(d.owner || '—') + '</dd><dt>Version</dt><dd>v' + d.version + '</dd>' + (d.tags.length ? '<dt>Tags</dt><dd>' + d.tags.map(function (t) { return '<span class="sda-tag">' + esc(t) + '</span>'; }).join(' ') + '</dd>' : '') + '</dl>' +
        '<div class="sda-prev-acts">' +
        (allowed('canApprove') && /draft|review|pending/i.test(d.status) ? '<button type="button" class="btn btn-ink btn-sm" data-act="approve">' + ICON.check + 'Approve</button>' : '') +
        (allowed('canUpload') ? '<button type="button" class="btn btn-ghost btn-sm" data-act="version">' + ICON.upload + 'Upload new version</button>' : '') +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="share">' + ICON.share + 'Copy share link</button></div>' +
        '<h6>' + ICON.history + 'Version history</h6><ol class="sda-hist">' + hist + '</ol></aside></div>' });
      m.body.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]'); if (!a) return;
        if (a.dataset.act === 'approve') { d.status = 'Approved'; d.versions.push({ v: d.version, date: fmtDate(today()), by: opts.userName ? opts.userName(st.role) : 'You', note: 'Approved' }); m.close(); render(); toast(root, 'Approved: ' + esc(d.name)); opts.onChange && opts.onChange(docs, d, 'approve'); }
        if (a.dataset.act === 'version') { d.version += 1; d.versions.push({ v: d.version, date: fmtDate(today()), by: opts.userName ? opts.userName(st.role) : 'You', note: 'New version uploaded (simulated)' }); m.close(); render(); toast(root, 'Version ' + d.version + ' saved for ' + esc(d.name)); opts.onChange && opts.onChange(docs, d, 'version'); }
        if (a.dataset.act === 'share') { toast(root, 'Share link copied (simulated, expires in 7 days)'); }
      });
    }
    function addFiles(files) {
      Array.prototype.forEach.call(files, function (f) {
        var isImg = /^image\//.test(f.type), ext = (f.name.split('.').pop() || 'pdf').toLowerCase();
        var d = { id: uid('doc'), name: f.name, type: isImg ? 'jpg' : ext, folder: st.folder === 'All' ? (opts.uploadFolder || (opts.folders || ['Uploads'])[0]) : st.folder, linked: opts.defaultLink || '', owner: opts.userName ? opts.userName(st.role) : 'You', date: fmtDate(today()), version: 1, status: opts.uploadStatus || 'Draft', tags: ['uploaded'], versions: [] };
        if (isImg) d.img = URL.createObjectURL(f);
        d.versions = [{ v: 1, date: d.date, by: d.owner, note: 'Uploaded from this device (stays in your browser)' }];
        docs.unshift(d);
      });
      render(); toast(root, files.length + ' file' + (files.length > 1 ? 's' : '') + ' added. Nothing leaves your browser.'); opts.onChange && opts.onChange(docs);
    }
    el.addEventListener('input', function (e) { if (e.target.type === 'search') { st.q = e.target.value; var pos = e.target.selectionStart; render(); var i = $('input[type=search]', el); i.focus(); try { i.setSelectionRange(pos, pos); } catch (x) {} } });
    el.addEventListener('change', function (e) { if (e.target.classList.contains('sda-file') && e.target.files.length) addFiles(e.target.files); });
    el.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('[data-folder]'))) { st.folder = t.dataset.folder; render(); return; }
      if ((t = e.target.closest('[data-doc]'))) { open(t.dataset.doc); return; }
      if (e.target.closest('[data-dms="upload"]')) { $('.sda-file', el).click(); }
    });
    render();
    return {
      add: function (d) { d = Object.assign({ id: uid('doc'), version: 1, status: 'Valid', tags: [], date: fmtDate(today()) }, d); if (!d.versions) d.versions = [{ v: 1, date: d.date, by: d.owner || 'System', note: d.note || 'Added' }]; docs.unshift(d); render(); opts.onChange && opts.onChange(docs, d, 'add'); return d; },
      docs: function () { return docs; },
      open: open,
      setRole: function (r) { st.role = r; render(); },
      setFolder: function (f) { st.folder = f; render(); },
      render: render
    };
  }

  /* ---------------- guided task + reset ---------------- */
  // opts: { title, steps:[{id, text}], cta:{href, text}, demoId }
  function guide(el, opts) {
    var done = {};
    el.classList.add('sda-guide');
    function render() {
      var n = opts.steps.filter(function (s) { return done[s.id]; }).length, all = n === opts.steps.length;
      el.innerHTML = '<div class="sda-guide-h"><span class="sda-guide-k">' + ICON.spark + 'Try it yourself</span><b>' + esc(opts.title) + '</b><span class="sda-guide-n">' + n + ' / ' + opts.steps.length + '</span>' +
        '<button type="button" class="sda-reset" data-reset>' + ICON.reset + 'Reset demo</button></div>' +
        '<ol class="sda-steps">' + opts.steps.map(function (s, i) { return '<li class="' + (done[s.id] ? 'ok' : '') + '"><span class="sda-step-d">' + (done[s.id] ? ICON.check : (i + 1)) + '</span>' + s.text + '</li>'; }).join('') + '</ol>' +
        (all ? '<div class="sda-guide-done">' + ICON.check + '<span><b>Done. That is the whole flow.</b> We build this around your processes and systems.</span>' + (opts.cta ? '<a class="btn btn-primary btn-sm" href="' + opts.cta.href + '">' + esc(opts.cta.text) + ' <span class="arr">→</span></a>' : '') + '</div>' : '');
    }
    el.addEventListener('click', function (e) { if (e.target.closest('[data-reset]') && opts.demoId) reset(opts.demoId); });
    render();
    return { done: function (id) { if (!done[id]) { done[id] = true; render(); } }, isDone: function (id) { return !!done[id]; } };
  }

  /* simulation note shown in each demo top bar */
  var SIM = 'Interactive simulation with sample data. Nothing is sent; AI steps are simulated.';

  window.SDA = { $: $, $$: $$, esc: esc, usd: usd, money: money, uid: uid, today: today, fmtDate: fmtDate, fmtTime: fmtTime, typeInto: typeInto,
    reduce: reduce, icon: ICON, art: art, demo: demo, reset: reset, toast: toast, modal: modal, roles: roles, dms: dms, docPage: docPage, guide: guide, SIM: SIM };
})();

/* Vendor Management demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
  (function(){
  /* =================== VENDOR MANAGEMENT =================== */
  var ven = $('#demo-vendor');
  if(ven){
    var TODAY = new Date('2026-11-07T12:00:00');
    var fmtD = function(d){ return d.toISOString().slice(0,10); };
    var addDays = function(n){ var d = new Date(TODAY); d.setDate(d.getDate()+n); return fmtD(d); };
    var daysTo = function(s){ return Math.round((new Date(s+'T12:00:00') - TODAY)/864e5); };
    var S = [
      {n:'Nordwerk Metals', c:'Raw materials', co:'Germany', otd:97, q:96, spend:2410000, price:2, dep:38},
      {n:'Baltic Polymers', c:'Raw materials', co:'Poland', otd:88, q:91, spend:1180000, price:9, dep:22},
      {n:'Kestrel Electronics', c:'Electronics', co:'Taiwan', otd:79, q:94, spend:3050000, price:6, dep:61},
      {n:'Volta Components', c:'Electronics', co:'Czechia', otd:93, q:89, spend:860000, price:3, dep:14},
      {n:'Alpina Logistics', c:'Logistics', co:'Austria', otd:95, q:92, spend:640000, price:4, dep:45},
      {n:'Rheinfracht', c:'Logistics', co:'Germany', otd:84, q:86, spend:520000, price:11, dep:31},
      {n:'Corvex Packaging', c:'Packaging', co:'Netherlands', otd:98, q:97, spend:410000, price:1, dep:18},
      {n:'Medina Cartons', c:'Packaging', co:'Spain', otd:81, q:83, spend:295000, price:7, dep:72}
    ];
    var risk = function(s){
      s.risk = Math.round((100-s.otd)*1.6 + (100-s.q)*1.4 + s.price*1.5 + Math.max(0,s.dep-40)*0.6);
      s.lvl = s.risk>=40 ? 'bad' : s.risk>=25 ? 'warn' : 'ok';
    };
    S.forEach(risk);
    var sup = function(n){ return S.filter(function(x){ return x.n===n; })[0]; };
    var RFQ = [
      {id:'RFQ-1031', item:'Aluminium profiles 6063', qty:'12,000 m', due:addDays(14), sup:['Nordwerk Metals','Baltic Polymers'], status:'Quotes in',
       quotes:[{s:'Nordwerk Metals', price:4.12, lead:14, terms:'30 days'},{s:'Baltic Polymers', price:3.95, lead:21, terms:'45 days'}], units:12000},
      {id:'RFQ-1030', item:'PCB assemblies rev. C', qty:'2,500 pcs', due:addDays(-6), sup:['Kestrel Electronics','Volta Components'], status:'Awarded', award:'Volta Components',
       quotes:[{s:'Kestrel Electronics', price:38.4, lead:35, terms:'60 days'},{s:'Volta Components', price:39.1, lead:18, terms:'30 days'}], units:2500}
    ];
    var CMP = [
      {id:'CMP-208', s:'Kestrel Electronics', part:'PCB lot 22-117', issue:'Solder bridges found on 4% of boards during incoming inspection.', qty:100, cat:'Workmanship', sev:'High', status:'8D requested', created:addDays(-5)},
      {id:'CMP-207', s:'Medina Cartons', part:'Shipping cartons 60x40', issue:'Cartons crushed in transit, product scratched.', qty:340, cat:'Transport damage', sev:'Medium', status:'Closed', created:addDays(-21), rc:'Pallet stacking height exceeded. New packing specification agreed and rolled out.'}
    ];
    var APV = [
      {id:'APV-77', type:'Supplier onboarding', title:'Onboard Volta Components as second source for electronics', by:'Michael Brown', amount:0, steps:['Requested','Procurement','Quality','Approved'], step:1, status:'Pending'},
      {id:'APV-76', type:'Contract renewal', title:'Renew framework agreement with Corvex Packaging for 2 years', by:'Emma Davis', amount:820000, steps:['Requested','Procurement','Finance','Approved'], step:2, status:'Pending'}
    ];
    var DOCS = [
      {n:'ISO 9001 certificate', s:'Nordwerk Metals', t:'Certificate', exp:'2027-03-31'},
      {n:'Framework agreement 2025–2027', s:'Kestrel Electronics', t:'Contract', exp:'2027-06-30'},
      {n:'IATF 16949 certificate', s:'Kestrel Electronics', t:'Certificate', exp:addDays(38)},
      {n:'Non-disclosure agreement', s:'Baltic Polymers', t:'NDA', exp:'2028-01-01'},
      {n:'Price list Q4 2026', s:'Alpina Logistics', t:'Price list', exp:addDays(54)},
      {n:'FSC certificate', s:'Medina Cartons', t:'Certificate', exp:addDays(-7)},
      {n:'Quality agreement', s:'Volta Components', t:'Contract', exp:addDays(23)},
      {n:'Insurance certificate', s:'Rheinfracht', t:'Certificate', exp:'2027-02-28'}
    ];
    var nRfq = 1032, nCmp = 209, nApv = 78;
    var view = 'sup', selSup = 'Kestrel Electronics', selRfq = 'RFQ-1031', selCmp = 'CMP-208', rfqDraft = null, cmpDraft = null, dmsF = {q:'', t:'All', st:'All', s:'All'};
    var lvlTxt = {ok:'Low', warn:'Medium', bad:'High'}, lvlCls = {ok:'p-ok', warn:'p-warn', bad:'p-bad'};
    var barCol = function(v){ return v>=93 ? 'var(--ok)' : v>=85 ? 'var(--warn)' : 'var(--bad)'; };
    var stCls = function(st){ return /Awarded|Closed|Approved|Valid|Renewal requested/.test(st) ? 'p-ok' : /Rejected|Expired|Open/.test(st) ? 'p-bad' : /Draft/.test(st) ? 'p-info' : 'p-warn'; };
    var docState = function(d){ if(d.renew) return 'Renewal requested'; var n = daysTo(d.exp); return n < 0 ? 'Expired' : n <= 60 ? 'Expiring' : 'Valid'; };
    var main = $('#v-main', ven), toastEl = $('#v-toast', ven), toastT;
    var toast = function(t){ toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 2600); };
    var typeVal = function(el, text){ var i = 0; clearInterval(el._t); if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ el.value = text; return; } el._t = setInterval(function(){ i += 4; el.value = text.slice(0, i); if(i >= text.length){ clearInterval(el._t); el.value = text; } }, 16); };
    var supOpts = function(sel){ return S.map(function(s){ return '<option'+(s.n===sel?' selected':'')+'>'+esc(s.n)+'</option>'; }).join(''); };

    function counts(){
      var c = {
        rfq: RFQ.filter(function(r){ return !/Awarded|Closed/.test(r.status); }).length,
        cmp: CMP.filter(function(r){ return r.status!=='Closed'; }).length,
        apv: APV.filter(function(r){ return r.status==='Pending'; }).length,
        dms: DOCS.filter(function(d){ return /Expired|Expiring/.test(docState(d)); }).length
      };
      ven.querySelectorAll('[data-v]').forEach(function(b){
        var k = b.dataset.v, el = $('.cnt', b);
        if(el){ el.textContent = c[k] || ''; el.hidden = !c[k]; }
        b.setAttribute('aria-selected', k===view);
      });
    }
    function go(v){ view = v; counts(); render(); main.scrollTop = 0; }

    /* ---- suppliers ---- */
    var supQ = '', supCat = 'All';
    function vSup(){
      var L = S.filter(function(s){ return (supCat==='All'||s.c===supCat) && (s.n+' '+s.co).toLowerCase().indexOf(supQ.toLowerCase())>-1; });
      var s = sup(selSup);
      var rows = L.map(function(x){
        return '<tr data-n="'+esc(x.n)+'" tabindex="0" class="'+(x.n===selSup?'sel':'')+'"><td><b>'+esc(x.n)+'</b><span class="sub">'+esc(x.co)+'</span></td><td>'+esc(x.c)+'</td>'+
          '<td><div class="meter">'+x.otd+'%<i><b style="width:'+x.otd+'%;background:'+barCol(x.otd)+'"></b></i></div></td>'+
          '<td><div class="meter">'+x.q+'<i><b style="width:'+x.q+'%;background:'+barCol(x.q)+'"></b></i></div></td>'+
          '<td>'+usd(x.spend)+'</td><td><span class="pill '+lvlCls[x.lvl]+'">'+lvlTxt[x.lvl]+' · '+x.risk+'</span></td></tr>';
      }).join('') || '<tr><td colspan="6" class="empty">No suppliers match. Clear the search or pick All.</td></tr>';
      var pts = [];
      if(s.otd<90) pts.push('On-time delivery is <b>'+s.otd+'%</b>, below the 90% target.');
      if(s.q<90) pts.push('Quality score <b>'+s.q+'</b> points to recurring defects.');
      if(s.price>=6) pts.push('Price volatility of <b>'+s.price+'%</b> exceeds the category average.');
      if(s.dep>=50) pts.push('<b>'+s.dep+'%</b> of category spend sits with this supplier.');
      var openC = CMP.filter(function(c){ return c.s===s.n && c.status!=='Closed'; }).length;
      if(openC) pts.push('<b>'+openC+'</b> open complaint'+(openC>1?'s':'')+'.');
      var ex = DOCS.filter(function(d){ return d.s===s.n && /Expired|Expiring/.test(docState(d)); });
      if(ex.length) pts.push(esc(ex[0].n)+' is <b>'+docState(ex[0]).toLowerCase()+'</b>.');
      if(!pts.length) pts.push('Stable across delivery, quality and price. No action needed.');
      var act = s.lvl==='bad' ? 'Qualify a second source and agree a corrective-action plan.' : s.lvl==='warn' ? 'Schedule a quarterly review with improvement targets.' : 'Consider a longer framework agreement for better prices.';
      return '<div class="v-head"><h3>Suppliers</h3><div class="toolbar" style="margin:0"><input type="search" id="v-sq" placeholder="Search supplier or country" aria-label="Search suppliers" value="'+esc(supQ)+'"><select id="v-sc" aria-label="Category">'+
        ['All','Raw materials','Electronics','Logistics','Packaging'].map(function(c){ return '<option'+(c===supCat?' selected':'')+'>'+c+'</option>'; }).join('')+'</select></div></div>'+
        '<div class="split"><div class="tbl-wrap"><table><thead><tr><th>Supplier</th><th>Category</th><th>On-time</th><th>Quality</th><th>Spend / yr</th><th>Risk</th></tr></thead><tbody id="v-rows">'+rows+'</tbody></table></div>'+
        '<aside class="panel"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h3>'+esc(s.n)+'</h3><div style="color:var(--dim);font-size:13.5px">'+esc(s.c)+' · '+esc(s.co)+'</div></div><span class="pill '+lvlCls[s.lvl]+'">'+lvlTxt[s.lvl]+' risk</span></div>'+
        '<div class="ai-box"><div class="ai-h">AI risk analysis</div><ul><li>'+pts.join('</li><li>')+'</li></ul><p style="margin-top:8px"><b>Recommended:</b> '+act+'</p></div>'+
        '<div class="btn-row"><button class="btn btn-ink btn-sm" data-act="new-rfq" type="button">Create RFQ</button><button class="btn btn-ghost btn-sm" data-act="new-cmp" type="button">Log complaint</button><button class="btn btn-ghost btn-sm" data-act="docs" type="button">Documents</button></div></aside></div>';
    }

    /* ---- RFQs ---- */
    function rfqList(){
      return '<div class="v-list">'+'<button type="button" class="v-item new" data-rfq="new">+ New RFQ</button>'+RFQ.map(function(r){
        return '<button type="button" class="v-item'+(r.id===selRfq?' sel':'')+'" data-rfq="'+r.id+'"><span class="v-id">'+r.id+'</span><b>'+esc(r.item)+'</b><span class="pill '+stCls(r.status)+'">'+r.status+'</span></button>';
      }).join('')+'</div>';
    }
    function rfqForm(){
      var d = rfqDraft || {};
      var cat = d.cat || 'Raw materials';
      var boxes = S.map(function(s){ var on = d.sup ? d.sup.indexOf(s.n)>-1 : s.c===cat; return '<label class="chk"><input type="checkbox" value="'+esc(s.n)+'"'+(on?' checked':'')+'> '+esc(s.n)+' <small>'+esc(s.c)+'</small></label>'; }).join('');
      return '<div class="panel"><h3>New request for quotation</h3>'+
        '<div class="row2" style="margin-top:14px"><label for="r-item">Item<input id="r-item" value="'+esc(d.item||'')+'" placeholder="e.g. Stainless steel sheets 2 mm"></label><label for="r-qty">Quantity<input id="r-qty" value="'+esc(d.qty||'')+'" placeholder="e.g. 5,000 kg"></label></div>'+
        '<label for="r-due" style="margin-top:12px">Quotes due<input id="r-due" type="date" value="'+(d.due||addDays(14))+'"></label>'+
        '<h4>Invite suppliers</h4><div class="chks">'+boxes+'</div>'+
        '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-ai">Draft text with AI</button></div>'+
        '<label for="r-msg" style="margin-top:12px">Message to suppliers<textarea id="r-msg" placeholder="Click “Draft text with AI” or write your own.">'+esc(d.msg||'')+'</textarea></label>'+
        '<p class="note" id="r-note" role="status"></p>'+
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="rfq-send">Send RFQ</button><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-cancel">Cancel</button></div></div>';
    }
    function rfqDetail(r){
      var q = r.quotes.length ? '<div class="tbl-wrap" style="margin-top:12px"><table style="min-width:480px"><thead><tr><th>Supplier</th><th>Unit price</th><th>Total</th><th>Lead time</th><th>Terms</th><th></th></tr></thead><tbody>'+
        r.quotes.map(function(x){
          var canAward = r.status==='Quotes in';
          return '<tr style="cursor:default"><td><b>'+esc(x.s)+'</b>'+(r.award===x.s?' <span class="pill p-ok">Awarded</span>':'')+'</td><td>$'+x.price.toFixed(2)+'</td><td>'+usd(x.price*r.units)+'</td><td>'+x.lead+' days</td><td>'+x.terms+'</td><td>'+(canAward?'<button class="btn btn-ink btn-sm" type="button" data-award="'+esc(x.s)+'">Award</button>':'')+'</td></tr>';
        }).join('')+'</tbody></table></div>' : '';
      var waiting = r.sup.filter(function(s){ return !r.quotes.some(function(x){ return x.s===s; }); });
      return '<div class="panel"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="v-id">'+r.id+'</span><h3>'+esc(r.item)+'</h3><div style="color:var(--dim);font-size:14px">'+esc(r.qty)+' · quotes due '+r.due+'</div></div><span class="pill '+stCls(r.status)+'">'+r.status+'</span></div>'+
        '<div class="v-steps">'+['Sent','Quotes in','Awaiting approval','Awarded'].map(function(st, i){ var order = ['Sent','Quotes in','Awaiting approval','Awarded'].indexOf(r.status); return '<span class="'+(i<=order?'done':'')+'">'+st+'</span>'; }).join('')+'</div>'+
        (waiting.length && r.status==='Sent' ? '<p class="note" style="margin-top:10px">Waiting for quotes from '+waiting.map(esc).join(', ')+'…</p>' : '')+ q +
        (r.quotes.length>1 && r.status==='Quotes in' ? '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-compare">Compare with AI</button></div><div id="r-ai"></div>' : '')+
        (r.status==='Awaiting approval' ? '<div class="ai-box"><div class="ai-h">Workflow</div>Award to <b>'+esc(r.pending)+'</b> is waiting for approval. <button class="btn btn-ink btn-sm" type="button" data-act="to-apv" style="margin-left:6px">Open approvals</button></div>' : '')+
        (r.status==='Awarded' ? '<div class="ai-box"><div class="ai-h">Done</div>Purchase order issued to <b>'+esc(r.award)+'</b>. The supplier has been notified.</div>' : '')+'</div>';
    }
    function vRfq(){
      var r = RFQ.filter(function(x){ return x.id===selRfq; })[0];
      return '<div class="v-head"><h3>Requests for quotation</h3></div><div class="v-two">'+rfqList()+'<div>'+(selRfq==='new'||!r ? rfqForm() : rfqDetail(r))+'</div></div>';
    }
    function quoteArrival(r){
      r.sup.forEach(function(name, i){
        setTimeout(function(){
          var s = sup(name), base = 3 + (name.length % 7) * 0.9;
          r.quotes.push({s:name, price:+(base * (1 + s.price/100)).toFixed(2), lead: 10 + (name.length*3) % 25, terms: ['30 days','45 days','60 days'][i%3]});
          if(r.quotes.length === r.sup.length) r.status = 'Quotes in';
          if(view==='rfq'){ render(); }
          counts(); toast('Quote received from '+name);
        }, 1400 + i*1100);
      });
    }

    /* ---- complaints ---- */
    function cmpAnalyze(text){
      var cat = /crack|scratch|dent|crush|transit|damag/i.test(text) ? 'Transport damage' : /solder|weld|assembly|bridge|workmanship/i.test(text) ? 'Workmanship' : /dimension|size|toleran|mm/i.test(text) ? 'Dimensional' : /label|document|certificate|paper/i.test(text) ? 'Documentation' : /wrong|missing|quantity|short/i.test(text) ? 'Wrong or missing delivery' : 'Material defect';
      var sev = /safety|all|100%|recall|stop|line down|critical/i.test(text) ? 'Critical' : /\d+%|several|batch|lot|crack|bridge/i.test(text) ? 'High' : 'Medium';
      return {cat:cat, sev:sev};
    }
    function vCmp(){
      var c = CMP.filter(function(x){ return x.id===selCmp; })[0];
      var list = '<div class="v-list"><button type="button" class="v-item new" data-cmp="new">+ New complaint</button>'+CMP.map(function(x){
        return '<button type="button" class="v-item'+(x.id===selCmp?' sel':'')+'" data-cmp="'+x.id+'"><span class="v-id">'+x.id+' · '+esc(x.s)+'</span><b>'+esc(x.part)+'</b><span class="pill '+stCls(x.status)+'">'+x.status+'</span></button>';
      }).join('')+'</div>';
      var right;
      if(selCmp==='new' || !c){
        var d = cmpDraft || {};
        right = '<div class="panel"><h3>Log a supplier complaint</h3>'+
          '<div class="row2" style="margin-top:14px"><label for="c-sup">Supplier<select id="c-sup">'+supOpts(d.s||selSup)+'</select></label><label for="c-part">Part or lot<input id="c-part" value="'+esc(d.part||'')+'" placeholder="e.g. Housing A-200, lot 4471"></label></div>'+
          '<label for="c-issue" style="margin-top:12px">What is wrong?<textarea id="c-issue" placeholder="e.g. 12% of housings have cracks at the mounting point">'+esc(d.issue||'')+'</textarea></label>'+
          '<label for="c-qty" style="margin-top:12px">Affected quantity<input id="c-qty" type="number" min="1" value="'+(d.qty||'')+'" placeholder="e.g. 240"></label>'+
          '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="cmp-ai">Analyze with AI</button></div><div id="c-ai"></div><p class="note" id="c-note" role="status"></p>'+
          '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="cmp-create">Create complaint</button></div></div>';
      } else {
        var flow = ['Open','8D requested','Root cause received','Closed'], at = flow.indexOf(c.status);
        var btn = c.status==='Open' ? '<button class="btn btn-ink btn-sm" type="button" data-act="cmp-8d">Send 8D request to supplier</button>' :
                  c.status==='8D requested' ? '<button class="btn btn-ink btn-sm" type="button" data-act="cmp-reply">Simulate supplier reply</button>' :
                  c.status==='Root cause received' ? '<button class="btn btn-ink btn-sm" type="button" data-act="cmp-close">Accept and close</button>' : '';
        right = '<div class="panel"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="v-id">'+c.id+' · created '+c.created+'</span><h3>'+esc(c.part)+'</h3><div style="color:var(--dim);font-size:14px">'+esc(c.s)+' · '+c.qty+' pcs affected</div></div><span class="pill '+stCls(c.status)+'">'+c.status+'</span></div>'+
          '<div class="v-steps">'+flow.map(function(st,i){ return '<span class="'+(i<=at?'done':'')+'">'+st+'</span>'; }).join('')+'</div>'+
          '<p style="margin-top:12px">'+esc(c.issue)+'</p>'+
          '<div class="ai-box"><div class="ai-h">AI classification</div>Category <b>'+c.cat+'</b> · severity <b>'+c.sev+'</b>. Suggested containment: block remaining stock of '+esc(c.part)+' and run a 100% check on the next delivery.</div>'+
          (c.rc ? '<div class="ai-box" style="margin-top:10px"><div class="ai-h">Supplier root cause</div>'+esc(c.rc)+'</div>' : '')+
          '<div id="c-draft"></div><div class="btn-row">'+btn+'</div></div>';
      }
      return '<div class="v-head"><h3>Complaints</h3></div><div class="v-two">'+list+'<div>'+right+'</div></div>';
    }

    /* ---- approvals ---- */
    function vApv(){
      var cards = APV.map(function(a){
        var steps = a.steps.map(function(st, i){ return '<span class="'+(i<a.step || a.status==='Approved' ? 'done' : i===a.step && a.status==='Pending' ? 'cur' : '')+'">'+st+'</span>'; }).join('');
        return '<div class="panel apv"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="v-id">'+a.id+' · '+a.type+'</span><h3 style="font-size:17px">'+esc(a.title)+'</h3><div style="color:var(--dim);font-size:13.5px">Requested by '+esc(a.by)+(a.amount?' · '+usd(a.amount):'')+'</div></div><span class="pill '+stCls(a.status)+'">'+a.status+'</span></div>'+
          '<div class="v-steps">'+steps+'</div>'+
          (a.status==='Pending' ? '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-apv="'+a.id+'" data-d="ok">Approve '+a.steps[a.step].toLowerCase()+' step</button><button class="btn btn-ghost btn-sm" type="button" data-apv="'+a.id+'" data-d="no">Reject</button></div>' : '')+'</div>';
      }).join('');
      return '<div class="v-head"><h3>Approval workflows</h3><span class="note">Each request moves through its steps. Approve to see it advance.</span></div><div class="apv-list">'+cards+'</div>';
    }
    function decide(id, ok){
      var a = APV.filter(function(x){ return x.id===id; })[0];
      if(!ok){ a.status = 'Rejected'; if(a.rfq){ var r = RFQ.filter(function(x){ return x.id===a.rfq; })[0]; r.status='Quotes in'; delete r.pending; } toast(a.id+' rejected'); }
      else {
        a.step++;
        if(a.step >= a.steps.length-1){ a.status = 'Approved'; a.step = a.steps.length-1;
          if(a.rfq){ var r2 = RFQ.filter(function(x){ return x.id===a.rfq; })[0]; r2.status='Awarded'; r2.award=r2.pending; toast('Approved. Purchase order sent to '+r2.award+'.'); }
          else toast(a.id+' fully approved');
        } else toast('Approved. Next step: '+a.steps[a.step]);
      }
      counts(); render();
    }

    /* ---- documents (DMS) ---- */
    var SUMMARY = {
      'Certificate':'Valid certification for the scope listed. Issued by an accredited body. Renewal audit required before expiry.',
      'Contract':'Framework terms: 30-day payment, annual price review capped at 3%, 12-month warranty, termination with 6 months notice.',
      'NDA':'Mutual confidentiality for 5 years, covers drawings and pricing, governed by local law.',
      'Price list':'Rates valid until the expiry date. Fuel surcharge applies above index level 120.',
      'Other':'Document filed. No key dates detected.'
    };
    function vDms(){
      var L = DOCS.filter(function(d){
        var st = docState(d);
        return (dmsF.t==='All'||d.t===dmsF.t) && (dmsF.s==='All'||d.s===dmsF.s) && (dmsF.st==='All'||st===dmsF.st) && (d.n+' '+d.s).toLowerCase().indexOf(dmsF.q.toLowerCase())>-1;
      });
      var rows = L.map(function(d){
        var st = docState(d), i = DOCS.indexOf(d);
        return '<tr style="cursor:default"><td><b>'+esc(d.n)+'</b>'+(d.isNew?' <span class="pill p-info">New</span>':'')+'<span class="sub">'+esc(d.file||'PDF')+'</span></td><td>'+esc(d.s)+'</td><td>'+d.t+'</td><td>'+d.exp+'</td><td><span class="pill '+stCls(st==='Expiring'?'Pending':st)+'">'+st+'</span></td>'+
          '<td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" type="button" data-sum="'+i+'">Summarize</button>'+(/Expired|Expiring/.test(st)?' <button class="btn btn-ink btn-sm" type="button" data-renew="'+i+'">Renew</button>':'')+'</td></tr>';
      }).join('') || '<tr><td colspan="6" class="empty">No documents match these filters.</td></tr>';
      var sel = function(id, arr, val, label){ return '<select id="'+id+'" aria-label="'+label+'">'+arr.map(function(x){ return '<option'+(x===val?' selected':'')+'>'+esc(x)+'</option>'; }).join('')+'</select>'; };
      return '<div class="v-head"><h3>Documents</h3><span class="note">Certificates, contracts and price lists with expiry tracking.</span></div>'+
        '<label class="drop-zone" for="d-file"><input type="file" id="d-file" multiple><b>Upload documents</b><span>Drop files here or click. AI files them by type, supplier and expiry date.</span></label>'+
        '<div class="toolbar" style="margin-top:14px"><input type="search" id="d-q" placeholder="Search documents" aria-label="Search documents" value="'+esc(dmsF.q)+'">'+
        sel('d-t',['All','Certificate','Contract','NDA','Price list','Other'],dmsF.t,'Type')+sel('d-s',['All'].concat(S.map(function(s){return s.n;})).concat(['Unassigned']),dmsF.s,'Supplier')+sel('d-st',['All','Valid','Expiring','Expired','Renewal requested'],dmsF.st,'Status')+'</div>'+
        '<div class="tbl-wrap"><table><thead><tr><th>Document</th><th>Supplier</th><th>Type</th><th>Expires</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div id="d-out"></div>';
    }
    function fileIn(files){
      [].forEach.call(files, function(f){
        var n = f.name.toLowerCase();
        var t = /cert|iso|iatf|fsc/.test(n) ? 'Certificate' : /contract|agreement|framework|vertrag/.test(n) ? 'Contract' : /nda|confiden/.test(n) ? 'NDA' : /price|preis|rate/.test(n) ? 'Price list' : 'Other';
        var s = S.filter(function(x){ return n.indexOf(x.n.split(' ')[0].toLowerCase())>-1; })[0];
        DOCS.unshift({n:f.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' '), s:s?s.n:'Unassigned', t:t, exp:addDays(365), file:f.name+' · '+Math.max(1,Math.round(f.size/1024))+' KB', isNew:true});
      });
      toast(files.length+' document'+(files.length>1?'s':'')+' filed by AI');
      counts(); render();
    }

    /* ---- render + events ---- */
    function render(){
      main.innerHTML = view==='sup' ? vSup() : view==='rfq' ? vRfq() : view==='cmp' ? vCmp() : view==='apv' ? vApv() : vDms();
    }
    ven.querySelectorAll('[data-v]').forEach(function(b){ b.addEventListener('click', function(){ go(b.dataset.v); }); });
    main.addEventListener('input', function(e){
      var t = e.target;
      if(t.id==='v-sq'){ supQ = t.value; var p = t.selectionStart; render(); var n = $('#v-sq', ven); n.focus(); n.setSelectionRange(p,p); }
      if(t.id==='d-q'){ dmsF.q = t.value; var p2 = t.selectionStart; render(); var n2 = $('#d-q', ven); n2.focus(); n2.setSelectionRange(p2,p2); }
    });
    main.addEventListener('change', function(e){
      var t = e.target;
      if(t.id==='v-sc'){ supCat = t.value; render(); }
      if(t.id==='d-t'){ dmsF.t = t.value; render(); } if(t.id==='d-s'){ dmsF.s = t.value; render(); } if(t.id==='d-st'){ dmsF.st = t.value; render(); }
      if(t.id==='d-file' && t.files.length){ fileIn(t.files); }
    });
    main.addEventListener('dragover', function(e){ var z = e.target.closest('.drop-zone'); if(z){ e.preventDefault(); z.classList.add('over'); } });
    main.addEventListener('dragleave', function(e){ var z = e.target.closest('.drop-zone'); if(z) z.classList.remove('over'); });
    main.addEventListener('drop', function(e){ var z = e.target.closest('.drop-zone'); if(z){ e.preventDefault(); z.classList.remove('over'); if(e.dataTransfer.files.length) fileIn(e.dataTransfer.files); } });
    var readRfq = function(){ return {item:$('#r-item',ven).value.trim(), qty:$('#r-qty',ven).value.trim(), due:$('#r-due',ven).value, msg:$('#r-msg',ven).value, sup:[].map.call(ven.querySelectorAll('.chks input:checked'), function(x){ return x.value; })}; };
    main.addEventListener('keydown', function(e){ var tr = e.target.closest('tr[data-n]'); if(tr && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); selSup = tr.dataset.n; render(); } });
    main.addEventListener('click', function(e){
      var t = e.target.closest('button, tr[data-n]'); if(!t) return;
      if(t.matches('tr[data-n]')){ selSup = t.dataset.n; render(); return; }
      var a = t.dataset.act;
      if(t.dataset.rfq){ selRfq = t.dataset.rfq; if(selRfq==='new') rfqDraft = null; render(); return; }
      if(t.dataset.cmp){ selCmp = t.dataset.cmp; if(selCmp==='new') cmpDraft = null; render(); return; }
      if(t.dataset.apv){ decide(t.dataset.apv, t.dataset.d==='ok'); return; }
      if(t.dataset.award){
        var r = RFQ.filter(function(x){ return x.id===selRfq; })[0], q = r.quotes.filter(function(x){ return x.s===t.dataset.award; })[0];
        r.status = 'Awaiting approval'; r.pending = q.s;
        APV.unshift({id:'APV-'+(nApv++), type:'Purchase order', title:'Award '+r.item+' to '+q.s, by:'You', amount:Math.round(q.price*r.units), steps:['Requested','Procurement','Finance','Approved'], step:1, status:'Pending', rfq:r.id});
        toast('Sent to the approval workflow'); counts(); render(); return;
      }
      if(t.dataset.sum!=null){ var d = DOCS[+t.dataset.sum], out = $('#d-out', ven); out.innerHTML = '<div class="ai-box"><div class="ai-h">AI summary · '+esc(d.n)+'</div><div id="d-sum"></div></div>'; typeInto($('#d-sum', ven), esc(SUMMARY[d.t])+' Expires <b>'+d.exp+'</b>.'); out.scrollIntoView({block:'nearest'}); return; }
      if(t.dataset.renew!=null){ var d2 = DOCS[+t.dataset.renew]; d2.renew = true; render(); var o = $('#d-out', ven); o.innerHTML = '<div class="draft" id="d-mail"></div>'; typeInto($('#d-mail', ven), esc('To: '+d2.s+'\nSubject: Renewal of '+d2.n+'\n\nHello,\n\nour records show that your '+d2.n+' expires on '+d2.exp+'. Please upload the renewed document to our supplier portal within 14 days.\n\nThank you,\nProcurement')); counts(); toast('Renewal request sent to '+d2.s); return; }
      switch(a){
        case 'new-rfq': rfqDraft = {cat: sup(selSup).c, sup: S.filter(function(x){ return x.c===sup(selSup).c && x.n!==selSup; }).map(function(x){ return x.n; })}; selRfq = 'new'; go('rfq'); break;
        case 'new-cmp': cmpDraft = {s: selSup}; selCmp = 'new'; go('cmp'); break;
        case 'docs': dmsF = {q:'', t:'All', st:'All', s:selSup}; go('dms'); break;
        case 'to-apv': go('apv'); break;
        case 'rfq-cancel': selRfq = RFQ[0].id; render(); break;
        case 'rfq-ai':
          var d3 = readRfq();
          if(!d3.item){ $('#r-note',ven).className='note err'; $('#r-note',ven).textContent='Add the item first, so the AI knows what to ask for.'; $('#r-item',ven).focus(); break; }
          rfqDraft = d3; typeVal($('#r-msg', ven), 'Dear supplier,\n\nwe invite you to quote for '+d3.item+(d3.qty?' ('+d3.qty+')':'')+'.\n\nPlease include unit price, lead time, payment terms and any minimum order quantity. Delivery DAP to our main plant.\n\nQuotes are due by '+d3.due+'.\n\nKind regards,\nProcurement');
          break;
        case 'rfq-send':
          var d4 = readRfq(), note = $('#r-note', ven);
          if(!d4.item){ note.className='note err'; note.textContent='Add the item you need quotes for.'; $('#r-item',ven).focus(); break; }
          if(!d4.sup.length){ note.className='note err'; note.textContent='Select at least one supplier to invite.'; break; }
          var nr = {id:'RFQ-'+(nRfq++), item:d4.item, qty:d4.qty||'1 lot', due:d4.due, sup:d4.sup, status:'Sent', quotes:[], units: parseInt((d4.qty||'1000').replace(/\D/g,''),10) || 1000};
          RFQ.unshift(nr); selRfq = nr.id; rfqDraft = null; counts(); render(); toast(nr.id+' sent to '+nr.sup.length+' supplier'+(nr.sup.length>1?'s':'')); quoteArrival(nr);
          break;
        case 'rfq-compare':
          var r3 = RFQ.filter(function(x){ return x.id===selRfq; })[0];
          var scored = r3.quotes.map(function(x){ var s = sup(x.s), minP = Math.min.apply(null, r3.quotes.map(function(y){return y.price;})), minL = Math.min.apply(null, r3.quotes.map(function(y){return y.lead;}));
            return {x:x, score: Math.round((minP/x.price)*50 + (minL/x.lead)*25 + (100-s.risk)/4)}; }).sort(function(a,b){ return b.score-a.score; });
          var best = scored[0];
          typeInto($('#r-ai', ven), '<div class="ai-box"><div class="ai-h">AI recommendation</div><ul>'+scored.map(function(s){ return '<li><b>'+esc(s.x.s)+'</b>: score '+s.score+' ($'+s.x.price.toFixed(2)+', '+s.x.lead+' days, '+lvlTxt[sup(s.x.s).lvl].toLowerCase()+' supplier risk)</li>'; }).join('')+'</ul><p style="margin-top:8px"><b>Recommended:</b> award to '+esc(best.x.s)+'. It balances price, lead time and supplier risk best.</p></div>');
          break;
        case 'cmp-ai':
          var txt = $('#c-issue', ven).value;
          if(!txt.trim()){ $('#c-note',ven).className='note err'; $('#c-note',ven).textContent='Describe the problem first.'; $('#c-issue',ven).focus(); break; }
          var an = cmpAnalyze(txt); typeInto($('#c-ai', ven), '<div class="ai-box"><div class="ai-h">AI analysis</div>Category <b>'+an.cat+'</b> · severity <b>'+an.sev+'</b>.<br>Suggested containment: block remaining stock and run a 100% check on the next delivery.</div>');
          break;
        case 'cmp-create':
          var sN = $('#c-sup',ven).value, part = $('#c-part',ven).value.trim(), iss = $('#c-issue',ven).value.trim(), qty = +$('#c-qty',ven).value, cn = $('#c-note', ven);
          if(!part){ cn.className='note err'; cn.textContent='Add the part or lot number.'; $('#c-part',ven).focus(); break; }
          if(!iss){ cn.className='note err'; cn.textContent='Describe what is wrong.'; $('#c-issue',ven).focus(); break; }
          var an2 = cmpAnalyze(iss), nc = {id:'CMP-'+(nCmp++), s:sN, part:part, issue:iss, qty:qty||1, cat:an2.cat, sev:an2.sev, status:'Open', created:fmtD(TODAY)};
          CMP.unshift(nc); selCmp = nc.id; var sp = sup(sN); sp.q = Math.max(60, sp.q-2); risk(sp); counts(); render(); toast(nc.id+' created. Quality score of '+sN+' updated.');
          break;
        case 'cmp-8d':
          var c1 = CMP.filter(function(x){ return x.id===selCmp; })[0]; c1.status = '8D requested'; counts(); render();
          typeInto($('#c-draft', ven), '<div class="draft">'+esc('To: '+c1.s+'\nSubject: 8D request – '+c1.id+' – '+c1.part+'\n\nHello,\n\nwe found the following issue: '+c1.issue+' ('+c1.qty+' pcs affected).\n\nPlease send containment actions (D3) within 24 hours and the root cause analysis (D4) within 10 days.\n\nThank you,\nQuality team')+'</div>');
          toast('8D request sent to '+c1.s); break;
        case 'cmp-reply':
          var c2 = CMP.filter(function(x){ return x.id===selCmp; })[0]; c2.status = 'Root cause received';
          c2.rc = c2.cat==='Workmanship' ? 'Reflow oven profile drifted after maintenance. Profile corrected, AOI check added after soldering.' : c2.cat==='Transport damage' ? 'Insufficient edge protection on pallets. Corner protectors and new stacking limit introduced.' : 'Raw material batch out of specification. Incoming inspection tightened and batch quarantined.';
          counts(); render(); toast('Root cause received from '+c2.s); break;
        case 'cmp-close':
          var c3 = CMP.filter(function(x){ return x.id===selCmp; })[0]; c3.status = 'Closed'; counts(); render(); toast(c3.id+' closed'); break;
      }
    });
    counts(); render();
  }
  })();
})();

/* Field Service & Proof Of Delivery demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
  (function(){
  /* =================== FIELD SERVICE & PROOF OF DELIVERY =================== */
  var fld = $('#demo-field');
  if(fld){
    var BASE = {lat:52.5200, lng:13.4050};
    var toGeo = function(x, y){ return {lat:(BASE.lat + (50-y)*0.0006).toFixed(5), lng:(BASE.lng + (x-50)*0.0009).toFixed(5)}; };
    var J = [
      {id:'J-5201', type:'Delivery', title:'Deliver 2 pallets of floor tiles', cust:'Reed Building Supplies', addr:'Harbour Street 12', x:66, y:30, status:'Assigned', eta:'10:30',
       check:['2 pallets unloaded','Packaging undamaged','Placed at agreed spot']},
      {id:'J-5202', type:'Service', title:'Annual boiler maintenance', cust:'Kate Hall', addr:'Linden Avenue 4', x:24, y:62, status:'Assigned', eta:'13:00',
       check:['Burner cleaned','Pressure checked (1.5 bar)','Exhaust values measured','Customer briefed']},
      {id:'J-5203', type:'Inspection', title:'Elevator safety inspection', cust:'Parkside Offices', addr:'Park Road 88', x:80, y:74, status:'Done', eta:'08:15',
       check:['Brakes tested','Door sensors OK','Emergency call tested'],
       proof:{time:'08:41', geo:toGeo(80,74), acc:6, photos:[], sig:null, name:'M. Brooks', notes:'All checks passed.', done:['Brakes tested','Door sensors OK','Emergency call tested']}}
    ];
    var van = {x:46, y:48};
    var cur = null, stepN = 'list', mark = null, photos = [], sigDirty = false, officeSel = 'J-5203';
    var phone = $('#f-phone', fld), office = $('#f-office', fld), toastF = function(t){ var el = $('#f-toast', fld); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('on'); }, 2400); };
    var job = function(id){ return J.filter(function(j){ return j.id===id; })[0]; };
    var stCls2 = function(s){ return s==='Done' ? 'p-ok' : s==='On the way' || s==='On site' ? 'p-warn' : 'p-info'; };
    var MAPBG = '<rect width="100" height="100" fill="#EEF3F1"/>'+
      '<path d="M0 82 C20 76 34 90 52 84 S82 70 100 78 V100 H0Z" fill="#CFE7F0"/>'+
      '<rect x="8" y="10" width="20" height="16" rx="2" fill="#D6EBDD"/><rect x="58" y="52" width="16" height="12" rx="2" fill="#D6EBDD"/>'+
      '<g stroke="#FFFFFF" stroke-width="3.2" fill="none" stroke-linecap="round"><path d="M0 40 H100"/><path d="M40 0 V100"/><path d="M0 18 C30 22 60 12 100 20"/><path d="M70 0 C66 30 76 60 72 100"/><path d="M14 100 C18 70 10 50 20 30"/></g>'+
      '<g stroke="#E2E9E7" stroke-width=".6"><path d="M50 40 V82M86 20 V40M20 52 H40M74 58 H100"/></g>';
    var pinSvg = function(x, y, col, label, big){
      return '<g transform="translate('+x+' '+y+')" class="pin-g"><path d="M0 0 C-3.2 -4 -4.4 -6 -4.4 -8 a4.4 4.4 0 0 1 8.8 0 C4.4 -6 3.2 -4 0 0Z" fill="'+col+'" stroke="#fff" stroke-width=".8"'+(big?' transform="scale(1.25)"':'')+'/>'+(label?'<text y="-6.6" text-anchor="middle" font-size="3" font-weight="600" fill="#fff">'+label+'</text>':'')+'</g>';
    };
    var colFor = function(j){ return j.status==='Done' ? '#17703F' : j.status==='Assigned' ? '#2F6690' : '#E0663F'; };

    function renderOffice(){
      var pins = J.map(function(j, i){ return pinSvg(j.x, j.y, colFor(j), String(i+1), j.id===officeSel); }).join('');
      var vanG = '<g transform="translate('+van.x+' '+van.y+')"><circle r="3.6" fill="#0E1B22"/><circle r="6" fill="none" stroke="#0E1B22" stroke-opacity=".25"><animate attributeName="r" values="3.6;7;3.6" dur="2s" repeatCount="indefinite"/></circle><path d="M-1.6 .6h3.2v-1.4l-.8-.9h-2.4z" fill="#FFA88F"/></g>';
      var marks = J.filter(function(j){ return j.proof; }).map(function(j){ return '<circle cx="'+j.x+'" cy="'+j.y+'" r="1.2" fill="#fff" stroke="#17703F" stroke-width=".6"/>'; }).join('');
      var sel = job(officeSel);
      var proof = sel && sel.proof ? '<div class="proof"><div class="proof-h"><b>Proof of '+sel.type.toLowerCase()+' · '+sel.id+'</b><span class="pill p-ok">Verified</span></div>'+
          '<dl><div><dt>Customer</dt><dd>'+esc(sel.cust)+'</dd></div><div><dt>Completed</dt><dd>Today, '+sel.proof.time+'</dd></div><div><dt>GPS</dt><dd>'+sel.proof.geo.lat+', '+sel.proof.geo.lng+' (±'+sel.proof.acc+' m)</dd></div><div><dt>Signed by</dt><dd>'+esc(sel.proof.name)+'</dd></div></dl>'+
          (sel.proof.photos.length ? '<div class="proof-photos">'+sel.proof.photos.map(function(p){ return '<img src="'+p+'" alt="Proof photo">'; }).join('')+'</div>' : '<p class="note">Photos stored in the job file.</p>')+
          (sel.proof.sig ? '<img class="proof-sig" src="'+sel.proof.sig+'" alt="Customer signature">' : '')+
          '<div class="ai-box"><div class="ai-h">AI check</div>'+(sel.type==='Delivery'?'Photo shows the delivered goods at the drop-off point. Location is within 15 m of the delivery address. Signature present.':'All checklist items confirmed. Location matches the customer address. No follow-up needed.')+'</div>'+
          '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-f="mail">Email proof to customer</button></div></div>'
        : sel ? '<div class="proof"><p class="note">'+esc(sel.id)+' is '+sel.status.toLowerCase()+'. Proof appears here as soon as the technician submits it.</p></div>' : '';
      office.innerHTML = '<div class="f-head"><b>Office · live view</b><span class="note">Today · 3 jobs · 1 technician</span></div>'+
        '<svg class="f-map" viewBox="0 0 100 100" role="img" aria-label="Map with job locations">'+MAPBG+marks+pins+vanG+'</svg>'+
        '<div class="f-legend"><span><i style="background:#2F6690"></i>Assigned</span><span><i style="background:#E0663F"></i>In progress</span><span><i style="background:#17703F"></i>Done</span><span><i style="background:#0E1B22"></i>Technician</span></div>'+
        '<div class="f-jobs">'+J.map(function(j, i){ return '<button type="button" class="f-job'+(j.id===officeSel?' sel':'')+'" data-oj="'+j.id+'"><span class="f-n">'+(i+1)+'</span><span><b>'+esc(j.title)+'</b><small>'+esc(j.cust)+' · '+j.eta+'</small></span><span class="pill '+stCls2(j.status)+'">'+j.status+'</span></button>'; }).join('')+'</div>'+proof;
    }

    function phoneHead(title, back){ return '<div class="ph-top">'+(back?'<button type="button" class="ph-back" data-f="'+back+'" aria-label="Back">‹</button>':'<span></span>')+'<b>'+title+'</b><span class="ph-time">'+new Date().toTimeString().slice(0,5)+'</span></div>'; }
    function stepper(n){ return '<ol class="ph-steps">'+['Location','Photos','Sign'].map(function(t,i){ return '<li class="'+(i<n?'done':i===n?'cur':'')+'">'+t+'</li>'; }).join('')+'</ol>'; }
    function renderPhone(){
      var j = cur && job(cur), h = '';
      if(stepN==='list'){
        h = phoneHead('My jobs today')+'<div class="ph-body">'+J.map(function(x){ return '<button type="button" class="ph-job" data-pj="'+x.id+'"><span class="ph-type t-'+x.type.toLowerCase()+'">'+x.type+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.addr)+' · '+x.eta+'</small><span class="pill '+stCls2(x.status)+'">'+x.status+'</span></button>'; }).join('')+'</div>';
      } else if(stepN==='job'){
        h = phoneHead(j.id, 'list')+'<div class="ph-body"><span class="ph-type t-'+j.type.toLowerCase()+'">'+j.type+'</span><h4>'+esc(j.title)+'</h4><p class="ph-meta">'+esc(j.cust)+'<br>'+esc(j.addr)+' · planned '+j.eta+'</p>'+
          '<ul class="ph-list">'+j.check.map(function(c){ return '<li>'+esc(c)+'</li>'; }).join('')+'</ul>'+
          (j.status==='Done' ? '<div class="ai-box"><div class="ai-h">Completed</div>Proof submitted at '+j.proof.time+'.</div>' :
           j.status==='Assigned' ? '<button type="button" class="btn btn-ink" data-f="route">Start route</button>' :
           '<button type="button" class="btn btn-ink" data-f="checkin">I have arrived · check in</button>')+'</div>';
      } else if(stepN==='checkin'){
        var mk = mark ? pinSvg(mark.x, mark.y, '#E0663F', '', true) : '';
        h = phoneHead('Check in', 'job')+stepper(0)+'<div class="ph-body"><p class="ph-meta">Tap the map to mark where you are, or use your device location.</p>'+
          '<svg class="ph-map" viewBox="0 0 100 100" role="img" aria-label="Tap to mark your location">'+MAPBG+pinSvg(j.x, j.y, '#2F6690', '')+mk+'</svg>'+
          '<button type="button" class="btn btn-ghost btn-sm" data-f="gps">Use device location</button>'+
          '<p class="ph-geo" id="f-geo" role="status">'+(mark ? 'Location '+mark.geo.lat+', '+mark.geo.lng+' · ±'+mark.acc+' m'+(mark.dist!=null?' · '+mark.dist+' m from address':'') : 'No location yet')+'</p>'+
          '<button type="button" class="btn btn-ink" data-f="to-photos"'+(mark?'':' disabled')+'>Confirm location</button></div>';
      } else if(stepN==='photos'){
        h = phoneHead('Photos', 'checkin')+stepper(1)+'<div class="ph-body"><p class="ph-meta">Take photos as proof: the goods, the work, the meter reading.</p>'+
          '<label class="ph-cam" for="f-cam"><input type="file" id="f-cam" accept="image/*" capture="environment" multiple><b>Take or upload photos</b><span>Opens the camera on phones</span></label>'+
          '<button type="button" class="btn btn-ghost btn-sm" data-f="sample">Add a sample photo</button>'+
          '<div class="ph-thumbs">'+photos.map(function(p, i){ return '<span><img src="'+p+'" alt="Photo '+(i+1)+'"><button type="button" data-rmph="'+i+'" aria-label="Remove photo '+(i+1)+'">×</button></span>'; }).join('')+'</div>'+
          '<button type="button" class="btn btn-ink" data-f="to-sign"'+(photos.length?'':' disabled')+'>Continue ('+photos.length+' photo'+(photos.length===1?'':'s')+')</button></div>';
      } else if(stepN==='sign'){
        h = phoneHead('Confirm & sign', 'photos')+stepper(2)+'<div class="ph-body"><fieldset class="ph-checks"><legend>Checklist</legend>'+j.check.map(function(c, i){ return '<label class="chk"><input type="checkbox" data-ci="'+i+'" checked> '+esc(c)+'</label>'; }).join('')+'</fieldset>'+
          '<label for="f-note">Notes<textarea id="f-note" placeholder="Anything the office should know"></textarea></label>'+
          '<label for="f-name">Received by<input id="f-name" placeholder="Customer name"></label>'+
          '<div class="sig-wrap"><span>Customer signature</span><canvas id="f-sig" width="560" height="200" aria-label="Signature pad"></canvas><button type="button" class="btn btn-ghost btn-sm" data-f="clear">Clear</button></div>'+
          '<p class="note" id="f-err" role="status"></p><button type="button" class="btn btn-ink" data-f="submit">Submit proof</button></div>';
      } else if(stepN==='done'){
        h = phoneHead('Submitted')+'<div class="ph-body ph-done"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="var(--teal-soft)"/><path d="m15 24.5 6 6 12-13" fill="none" stroke="var(--teal)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg><h4>Proof sent</h4><p class="ph-meta">'+j.id+' is complete. The office and the customer have the proof with time, location, photos and signature.</p><button type="button" class="btn btn-ink" data-f="list">Back to my jobs</button></div>';
      }
      phone.innerHTML = h;
      if(stepN==='sign') initSig();
    }
    function initSig(){
      var c = $('#f-sig', fld), g = c.getContext('2d'), down = false; sigDirty = false;
      g.lineWidth = 3.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#0E1B22';
      var pt = function(e){ var r = c.getBoundingClientRect(); return {x:(e.clientX-r.left)*c.width/r.width, y:(e.clientY-r.top)*c.height/r.height}; };
      c.addEventListener('pointerdown', function(e){ down = true; c.setPointerCapture(e.pointerId); var p = pt(e); g.beginPath(); g.moveTo(p.x, p.y); });
      c.addEventListener('pointermove', function(e){ if(!down) return; var p = pt(e); g.lineTo(p.x, p.y); g.stroke(); sigDirty = true; });
      c.addEventListener('pointerup', function(){ down = false; });
    }
    function samplePhoto(){
      var c = document.createElement('canvas'); c.width = 320; c.height = 240; var g = c.getContext('2d'), j = job(cur);
      var grd = g.createLinearGradient(0,0,0,240); grd.addColorStop(0,'#CFE3EA'); grd.addColorStop(1,'#E9E2D6'); g.fillStyle = grd; g.fillRect(0,0,320,240);
      g.fillStyle = '#B9AE9C'; g.fillRect(0,170,320,70);
      if(j.type==='Delivery'){ g.fillStyle = '#C8A27A'; g.fillRect(60,110,90,70); g.fillRect(170,120,90,60); g.fillStyle = '#8A6A4A'; g.fillRect(60,176,90,8); g.fillRect(170,176,90,8); }
      else { g.fillStyle = '#E8ECEC'; g.fillRect(110,50,100,130); g.fillStyle = '#5B6B73'; g.beginPath(); g.arc(160,100,22,0,7); g.fill(); g.fillStyle = '#17A39D'; g.fillRect(130,140,60,10); }
      g.fillStyle = 'rgba(14,27,34,.65)'; g.fillRect(0,214,320,26); g.fillStyle = '#fff'; g.font = '12px sans-serif';
      g.fillText(j.id+' · '+new Date().toTimeString().slice(0,5)+' · '+(mark?mark.geo.lat+', '+mark.geo.lng:''), 8, 231);
      return c.toDataURL('image/jpeg', .8);
    }
    function moveVan(to, done){
      var from = {x:van.x, y:van.y}, t0 = performance.now(), dur = 2200;
      var tick = function(now){ var k = Math.min(1, (now-t0)/dur), e2 = k<.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2;
        van.x = from.x + (to.x-from.x)*e2; van.y = from.y + (to.y-from.y)*e2; renderOffice();
        if(k<1) requestAnimationFrame(tick); else done && done(); };
      if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ van.x = to.x; van.y = to.y; renderOffice(); done && done(); } else requestAnimationFrame(tick);
    }

    fld.addEventListener('click', function(e){
      var map = e.target.closest('.ph-map');
      if(map && stepN==='checkin'){
        var r = map.getBoundingClientRect(), x = (e.clientX-r.left)/r.width*100, y = (e.clientY-r.top)/r.height*100, j = job(cur);
        mark = {x:x, y:y, geo:toGeo(x,y), acc:8, dist:Math.round(Math.hypot(x-j.x, y-j.y)*9)}; renderPhone(); return;
      }
      var t = e.target.closest('button'); if(!t || !fld.contains(t)) return;
      if(t.dataset.pj){ cur = t.dataset.pj; stepN = 'job'; officeSel = cur; renderPhone(); renderOffice(); return; }
      if(t.dataset.oj){ officeSel = t.dataset.oj; renderOffice(); return; }
      if(t.dataset.rmph!=null){ photos.splice(+t.dataset.rmph, 1); renderPhone(); return; }
      var f = t.dataset.f, j = cur && job(cur);
      if(f==='list'){ stepN = 'list'; cur = null; renderPhone(); }
      else if(f==='job'){ stepN = 'job'; renderPhone(); }
      else if(f==='route'){ j.status = 'On the way'; renderPhone(); renderOffice(); toastF('Route started. Customer gets a live arrival link.'); moveVan({x:j.x, y:j.y+4}, function(){ toastF('Arrived at '+j.addr); }); }
      else if(f==='checkin'){ stepN = 'checkin'; mark = null; renderPhone(); }
      else if(f==='gps'){
        var out = $('#f-geo', fld);
        if(!navigator.geolocation){ out.textContent = 'Location is not available here. Tap the map instead.'; return; }
        out.textContent = 'Getting your location…';
        navigator.geolocation.getCurrentPosition(function(p){ mark = {x:j.x+1, y:j.y+1, geo:{lat:p.coords.latitude.toFixed(5), lng:p.coords.longitude.toFixed(5)}, acc:Math.round(p.coords.accuracy), dist:null}; renderPhone(); },
          function(){ out.textContent = 'Location access was blocked. Tap the map to mark your position instead.'; }, {timeout:6000});
      }
      else if(f==='to-photos'){ j.status = 'On site'; j.checkin = new Date().toTimeString().slice(0,5); stepN = 'photos'; renderPhone(); renderOffice(); toastF('Checked in at '+j.checkin); }
      else if(f==='sample'){ photos.push(samplePhoto()); renderPhone(); }
      else if(f==='to-sign'){ stepN = 'sign'; renderPhone(); }
      else if(f==='clear'){ var c = $('#f-sig', fld); c.getContext('2d').clearRect(0,0,c.width,c.height); sigDirty = false; }
      else if(f==='submit'){
        var name = $('#f-name', fld).value.trim(), err = $('#f-err', fld);
        if(!name){ err.className='note err'; err.textContent='Enter the name of the person who received it.'; $('#f-name', fld).focus(); return; }
        if(!sigDirty){ err.className='note err'; err.textContent='Ask the customer to sign in the box.'; return; }
        var done = [].filter.call(fld.querySelectorAll('[data-ci]'), function(x){ return x.checked; }).map(function(x){ return j.check[+x.dataset.ci]; });
        j.proof = {time:new Date().toTimeString().slice(0,5), geo:mark.geo, acc:mark.acc, photos:photos.slice(), sig:$('#f-sig', fld).toDataURL(), name:name, notes:$('#f-note', fld).value, done:done};
        j.status = 'Done'; officeSel = j.id; photos = []; mark = null; stepN = 'done'; renderPhone(); renderOffice(); toastF('Proof received in the office');
      }
      else if(f==='mail'){ toastF('Proof emailed to '+job(officeSel).cust); }
    });
    fld.addEventListener('change', function(e){
      if(e.target.id==='f-cam' && e.target.files.length){
        var files = [].slice.call(e.target.files, 0, 6), left = files.length;
        files.forEach(function(file){ var rd = new FileReader(); rd.onload = function(){ photos.push(rd.result); if(--left===0) renderPhone(); }; rd.readAsDataURL(file); });
      }
    });
    renderPhone(); renderOffice();
  }
  })();
})();

/* Facility Management demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
  (function(){
  /* =================== FACILITY MANAGEMENT =================== */
  var fac = $('#demo-facility');
  if(fac){
    var R = {
      lobby:{n:'Lobby', t:21.4}, meetA:{n:'Meeting A', t:22.0}, meetB:{n:'Meeting B', t:24.8}, kitchen:{n:'Kitchen', t:22.3},
      east:{n:'Office East', t:21.8}, west:{n:'Office West', t:22.1}, server:{n:'Server room', t:27.9}, wc:{n:'Restrooms', t:21.0},
      stairs:{n:'Stairs', t:20.4}, wh:{n:'Warehouse', t:17.6}, dock:{n:'Loading dock', t:15.2}
    };
    var T = [
      {id:'FM-1041', room:'server', txt:'Server room temperature above threshold', cat:'HVAC', pri:'Critical', team:'HVAC contractor', st:'Dispatched'},
      {id:'FM-1040', room:'meetB', txt:'Projector not turning on', cat:'IT / AV', pri:'Medium', team:'IT service desk', st:'Open'}
    ];
    var RULES = [
      {cat:'HVAC', re:/(hot|cold|temperat|heat|air ?con|hvac|ventilat|warm|stuffy)/i, team:'HVAC contractor'},
      {cat:'Plumbing', re:/(leak|water|tap|toilet|drain|flood|pipe|drip)/i, team:'Plumbing team'},
      {cat:'Electrical', re:/(light|power|socket|electric|outage|flicker|lamp|breaker)/i, team:'Electrician'},
      {cat:'IT / AV', re:/(wifi|wi-fi|network|projector|screen|printer|internet|display|beamer)/i, team:'IT service desk'},
      {cat:'Security', re:/(door|lock|badge|access|alarm|camera|window broken)/i, team:'Security'},
      {cat:'Cleaning', re:/(clean|spill|dirty|trash|bin|smell|mess)/i, team:'Cleaning crew'}
    ];
    var ROOMWORDS = {lobby:/lobby|entrance|reception/i, meetA:/meeting ?a|room a/i, meetB:/meeting ?b|room b/i, kitchen:/kitchen|coffee|canteen/i, east:/east/i, west:/west/i, server:/server/i, wc:/restroom|toilet|wc|bathroom/i, stairs:/stair/i, wh:/warehouse|storage/i, dock:/dock|loading/i};
    var next = 1042;
    var priCls = {Critical:'p-bad', High:'p-warn', Medium:'p-info', Low:'p-ok'};
    function roomState(k){
      var open = T.filter(function(t){ return t.room===k && t.st!=='Resolved'; });
      if(open.some(function(t){ return t.pri==='Critical'||t.pri==='High'; })) return 'bad';
      if(open.length || R[k].t>24.5 || R[k].t<16) return 'warn';
      return '';
    }
    function renderPlan(sel){
      $('#fplan', fac).innerHTML = Object.keys(R).map(function(k){
        return '<button type="button" class="room r-'+k+' '+roomState(k)+(sel===k?' sel flash':'')+'" data-k="'+k+'">'+R[k].n+'<small>'+R[k].t.toFixed(1)+' °C</small></button>';
      }).join('');
    }
    function renderTickets(){
      $('#fm-list', fac).innerHTML = T.map(function(t){
        return '<div class="ticket"><span class="id">'+t.id+'</span><div><b>'+esc(t.txt)+'</b><div class="meta">'+R[t.room].n+' · '+t.cat+' · '+t.team+' · '+t.st+'</div>'+(t.st!=='Resolved'?'<div class="btn-row" style="margin-top:8px">'+(t.st==='Open'?'<button type="button" class="btn btn-ghost btn-sm" data-tk="'+t.id+'" data-to="Dispatched">Dispatch team</button>':'')+'<button type="button" class="btn btn-ink btn-sm" data-tk="'+t.id+'" data-to="Resolved">Mark resolved</button></div>':'')+'</div><span class="pill '+(t.st==='Resolved'?'p-ok':priCls[t.pri])+'">'+(t.st==='Resolved'?'Resolved':t.pri)+'</span></div>';
      }).join('');
      var open = T.filter(function(t){return t.st!=='Resolved';});
      $('#fk-open', fac).textContent = open.length;
      $('#fk-crit', fac).textContent = open.filter(function(t){return t.pri==='Critical';}).length;
    }
    function triage(text){
      var rule = RULES.filter(function(r){ return r.re.test(text); })[0] || {cat:'General', team:'Facility manager'};
      var room = Object.keys(ROOMWORDS).filter(function(k){ return ROOMWORDS[k].test(text); })[0] || 'lobby';
      var pri = /(flood|fire|smoke|outage|alarm|urgent|server|danger|broken window)/i.test(text) ? 'Critical' :
                /(leak|no power|not working|broken|stuck)/i.test(text) ? 'High' :
                /(clean|smell|bin|flicker)/i.test(text) ? 'Low' : 'Medium';
      var eta = {Critical:'within 1 hour', High:'today', Medium:'within 2 business days', Low:'next scheduled round'}[pri];
      return {cat:rule.cat, team:rule.team, room:room, pri:pri, eta:eta};
    }
    function submit(text){
      text = text.trim(); var out = $('#fm-ai', fac);
      if(!text){ out.innerHTML = '<p>Describe the problem first, for example “Water leaking under the sink in the kitchen”.</p>'; return; }
      var r = triage(text), id = 'FM-'+(next++);
      T.unshift({id:id, room:r.room, txt:text, cat:r.cat, pri:r.pri, team:r.team, st:'Open'});
      renderTickets(); renderPlan(r.room);
      typeInto(out, '<p>Created <b>'+id+'</b>.</p><ul><li>Location: <b>'+R[r.room].n+'</b></li><li>Category: <b>'+r.cat+'</b></li><li>Priority: <b>'+r.pri+'</b>, response '+r.eta+'</li><li>Assigned to: <b>'+r.team+'</b></li></ul>'+(r.cat==='Plumbing'?'<p style="margin-top:6px">Tip sent to reporter: close the local shut-off valve if safe to do so.</p>':''));
      $('#fm-text', fac).value = '';
    }
    $('#fm-go', fac).addEventListener('click', function(){ submit($('#fm-text', fac).value); });
    $('#fm-text', fac).addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(e.target.value); } });
    fac.querySelectorAll('[data-sample]').forEach(function(b){ b.addEventListener('click', function(){ $('#fm-text', fac).value = b.dataset.sample; $('#fm-text', fac).focus(); }); });
    $('#fplan', fac).addEventListener('click', function(e){
      var b = e.target.closest('.room'); if(!b) return; var k = b.dataset.k;
      renderPlan(k);
      var open = T.filter(function(t){return t.room===k && t.st!=='Resolved';});
      $('#fm-room', fac).innerHTML = '<b>'+R[k].n+'</b> · '+R[k].t.toFixed(1)+' °C · '+(open.length? open.length+' open ticket'+(open.length>1?'s':'') : 'no open tickets');
    });
    /* simulated sensor drift */
    setInterval(function(){
      Object.keys(R).forEach(function(k){ R[k].t += (Math.random()-.5)*0.2; if(k==='server') R[k].t = Math.max(26.5, Math.min(29, R[k].t)); });
      var sel = (fac.querySelector('.room.sel')||{}).dataset; renderPlan(sel ? sel.k : null);
      fac.querySelectorAll('.room.flash').forEach(function(x){ x.classList.remove('flash'); });
    }, 4000);
    $('#fm-list', fac).addEventListener('click', function(e){ var b = e.target.closest('[data-tk]'); if(!b) return; T.forEach(function(t){ if(t.id===b.dataset.tk) t.st = b.dataset.to; }); renderTickets(); var sel = (fac.querySelector('.room.sel')||{}).dataset; renderPlan(sel ? sel.k : null); });
    renderPlan(); renderTickets();
  }
  })();
})();

/* Hr Tool demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
  (function(){
  /* =================== HR TOOL =================== */
  var hr = $('#demo-hr');
  if(hr){
    /* tabs */
    var tabs = hr.querySelectorAll('[role=tab]');
    tabs.forEach(function(t){ t.addEventListener('click', function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected', x===t); $('#'+x.getAttribute('aria-controls')).hidden = x!==t; });
    }); });

    /* recruiting */
    var STAGES = ['Applied','Screening','Interview','Offer'];
    var C = [
      {n:'Laura White', r:'fe', st:0, yrs:5, skills:{React:5,TypeScript:5,Testing:3,Accessibility:3}, note:'Led a design-system migration; strong accessibility focus.'},
      {n:'Daniel Clark', r:'fe', st:0, yrs:2, skills:{React:3,TypeScript:2,Testing:2,Accessibility:1}, note:'Junior profile, quick learner, limited TypeScript experience.'},
      {n:'Julia Young', r:'fe', st:1, yrs:7, skills:{React:5,TypeScript:4,Testing:5,Accessibility:3}, note:'Senior engineer from e-commerce; owned CI test strategy.'},
      {n:'Michael Brown', r:'fe', st:2, yrs:4, skills:{React:4,TypeScript:4,Testing:3,Accessibility:3}, note:'Solid all-rounder; available in 4 weeks.'},
      {n:'Lisa Miller', r:'fe', st:3, yrs:6, skills:{React:5,TypeScript:5,Testing:3,Accessibility:5}, note:'Excellent technical interview; salary expectation within band.'},
      {n:'John Smith', r:'sm', st:0, yrs:8, skills:{'B2B sales':5,Negotiation:4,CRM:4,Languages:5}, note:'Exceeded quota three years running in industrial SaaS.'},
      {n:'Sarah Johnsonč', r:'sm', st:1, yrs:3, skills:{'B2B sales':3,Negotiation:3,CRM:5,Languages:3}, note:'Strong CRM hygiene; less enterprise experience.'},
      {n:'Mark Lewis', r:'sm', st:2, yrs:10, skills:{'B2B sales':5,Negotiation:5,CRM:2,Languages:5}, note:'Enterprise closer; wants a team-lead path.'}
    ];
    var ROLE = {fe:{t:'Frontend Engineer', need:{React:5,TypeScript:5,Testing:4,Accessibility:4}, yrs:5}, sm:{t:'Sales Manager EMEA', need:{'B2B sales':5,Negotiation:5,CRM:4,Languages:5}, yrs:6}};
    C.forEach(function(c){
      var need = ROLE[c.r].need, tot=0, got=0;
      Object.keys(need).forEach(function(k){ tot += need[k]; got += Math.min(c.skills[k]||0, need[k]); });
      c.score = Math.round((got/tot)*80 + Math.min(c.yrs/ROLE[c.r].yrs,1)*20);
    });
    var role = 'fe', selC = null;
    var initials = function(n){ return n.split(' ').map(function(x){return x[0];}).join(''); };
    var sc = function(s){ return s>=85?'s-hi':s>=70?'s-mid':'s-lo'; };
    function renderBoard(){
      $('#kanban', hr).innerHTML = STAGES.map(function(stg, i){
        var cs = C.filter(function(c){ return c.r===role && c.st===i; }).sort(function(a,b){return b.score-a.score;});
        return '<div class="col"><h4>'+stg+'<span>'+cs.length+'</span></h4>'+(cs.map(function(c){
          return '<button type="button" class="cand'+(selC===c.n?' sel':'')+'" data-n="'+esc(c.n)+'"><span class="av">'+initials(c.n)+'</span><span><b>'+esc(c.n)+'</b><small>'+c.yrs+' yrs experience</small></span><span class="score '+sc(c.score)+'">'+c.score+'</span></button>';
        }).join('') || '<div class="empty" style="padding:12px">No candidates</div>')+'</div>';
      }).join('');
    }
    function showCand(n){
      selC = n; renderBoard();
      var c = C.filter(function(x){return x.n===n;})[0], need = ROLE[c.r].need;
      var rows = Object.keys(need).map(function(k){
        var v = c.skills[k]||0, ok = v>=need[k];
        return '<div class="meter" style="font-size:13px;margin-top:8px"><span style="width:110px">'+k+'</span><i><b style="width:'+(v*20)+'%;background:'+(ok?'var(--ok)':'var(--warn)')+'"></b></i><span style="width:44px;text-align:right">'+v+'/'+need[k]+'</span></div>';
      }).join('');
      var gaps = Object.keys(need).filter(function(k){ return (c.skills[k]||0) < need[k]; });
      var q = gaps.length ? gaps.map(function(g){ return 'Walk me through a recent project where you used '+g+'. What would you do differently?'; }) : ['Which part of this role would you change in your first 90 days, and why?'];
      $('#cand-detail', hr).innerHTML =
        '<div style="display:flex;gap:12px;align-items:center"><span class="av" style="width:44px;height:44px">'+initials(c.n)+'</span><div><h3>'+esc(c.n)+'</h3><div style="font-size:13.5px;color:var(--dim)">'+ROLE[c.r].t+' · '+STAGES[c.st]+'</div></div><span class="score '+sc(c.score)+'" style="margin-left:auto;font-size:16px">'+c.score+'%</span></div>'+
        '<h4>Skill match vs. job profile</h4>'+rows+
        '<div class="ai-box"><div class="ai-h">AI summary</div><div id="cand-ai"></div></div>'+
        '<div class="btn-row">'+(c.st<3?'<button type="button" class="btn btn-ink btn-sm" id="adv">Move to '+STAGES[c.st+1]+'</button>':'<span class="pill p-ok">Offer stage</span>')+'</div>';
      typeInto($('#cand-ai', hr), '<p>'+esc(c.note)+' '+(gaps.length?'Gaps: <b>'+gaps.join(', ')+'</b>.':'Meets every core requirement.')+'</p><p style="margin-top:6px"><b>Suggested interview questions</b></p><ul><li>'+q.slice(0,2).map(esc).join('</li><li>')+'</li></ul>');
      var a = $('#adv', hr); if(a) a.onclick = function(){ c.st++; showCand(c.n); };
    }
    $('#role', hr).addEventListener('change', function(e){ role = e.target.value; var first = C.filter(function(c){return c.r===role;}).sort(function(a,b){return b.score-a.score;})[0]; showCand(first.n); });
    $('#kanban', hr).addEventListener('click', function(e){ var b = e.target.closest('.cand'); if(b) showCand(b.dataset.n); });
    renderBoard(); showCand('Lisa Miller');

    /* leave */
    var DAYS = ['Mo 7','Tu 8','We 9','Th 10','Fr 11','Mo 14','Tu 15','We 16','Th 17','Fr 18'];
    var TEAM = [
      {n:'Anna Moore', on:[0,1,2], st:'approved'},
      {n:'David Wilson', on:[3,4,5,6], st:'pending', reason:'Family visit', bal:14},
      {n:'Emma Davis', on:[5,6,7], st:'pending', reason:'Vacation', bal:9},
      {n:'James Taylor', on:[8,9], st:'pending', reason:'Training course', bal:21},
      {n:'Chris Walker', on:[], st:'none'}
    ];
    var MINSTAFF = 3;
    function renderLeave(){
      var cal = '<span></span>'+DAYS.map(function(d){return '<span style="text-align:center">'+d+'</span>';}).join('');
      TEAM.forEach(function(p){
        cal += '<span class="nm">'+p.n+'</span>'+DAYS.map(function(d,i){
          var on = p.on.indexOf(i)>-1 && p.st!=='declined';
          return '<span class="c '+(on?(p.st==='approved'?'on':'pend'):'')+'"></span>';
        }).join('');
      });
      $('#cal', hr).innerHTML = cal;
      $('#leave-list', hr).innerHTML = TEAM.filter(function(p){return p.reason;}).map(function(p, idx){
        var clash = p.on.filter(function(d){
          var away = TEAM.filter(function(o){ return o!==p && o.on.indexOf(d)>-1 && (o.st==='approved'); }).length + 1;
          return TEAM.length - away < MINSTAFF;
        });
        var hint = p.st!=='pending' ? '' : clash.length ?
          '<span class="pill p-warn">Coverage below '+MINSTAFF+' on '+clash.map(function(d){return DAYS[d];}).join(', ')+'</span>' :
          '<span class="pill p-ok">AI check: coverage OK, balance '+p.bal+' days</span>';
        return '<div class="leave"><div><b>'+p.n+'</b> · '+p.reason+'<div class="meta">'+DAYS[p.on[0]]+' – '+DAYS[p.on[p.on.length-1]]+' · '+p.on.length+' days</div><div style="margin-top:6px">'+hint+'</div></div><div class="btn-row" style="margin:0">'+
          (p.st==='pending' ? '<button type="button" class="btn btn-ink btn-sm" data-a="approved" data-n="'+esc(p.n)+'">Approve</button><button type="button" class="btn btn-ghost btn-sm" data-a="declined" data-n="'+esc(p.n)+'">Decline</button>' :
          '<span class="pill '+(p.st==='approved'?'p-ok':'p-bad')+'">'+(p.st==='approved'?'Approved':'Declined')+'</span>')+'</div></div>';
      }).join('');
    }
    $('#leave-list', hr).addEventListener('click', function(e){
      var b = e.target.closest('[data-a]'); if(!b) return;
      TEAM.forEach(function(p){ if(p.n===b.dataset.n) p.st = b.dataset.a; }); renderLeave();
    });
    renderLeave();

    /* assistant */
    var KB = [
      {re:/(vacation|holiday|leave|days off|annual)/i, a:'Full-time employees receive <b>30 days</b> of paid annual leave per calendar year. Up to 5 unused days carry over until 31 March of the following year.', src:'Example Handbook §4.1 Annual leave'},
      {re:/(sick|ill|doctor|medical)/i, a:'Report sickness to your manager before your shift starts. From the <b>third day</b> of absence, a medical certificate is required.', src:'Example Handbook §4.3 Sick leave'},
      {re:/(remote|home office|work from home|wfh|hybrid)/i, a:'You can work remotely up to <b>3 days per week</b> after agreeing with your team lead. Working from abroad needs HR approval for each stay.', src:'Example Handbook §5.2 Hybrid work'},
      {re:/(expense|travel|reimburse|mileage|receipt)/i, a:'Submit expenses within <b>30 days</b> with receipts attached. Private car use is reimbursed at $0.30 per km.', src:'Example Handbook §7.1 Travel & expenses'},
      {re:/(parental|maternity|paternity|baby|child)/i, a:'Parental leave follows the statutory rules. Notify HR at least <b>7 weeks</b> before the planned start so we can arrange cover.', src:'Example Handbook §4.6 Parental leave'},
      {re:/(onboard|first day|laptop|new hire|equipment)/i, a:'New hires receive their laptop and accounts on <b>day one</b>. Your onboarding buddy and a 30-60-90 day plan are assigned in the HR portal.', src:'Example Handbook §2.1 Onboarding'}
    ];
    var chat = $('#chat', hr);
    function say(cls, html){ var d = document.createElement('div'); d.className='msg '+cls; d.innerHTML = html; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; }
    function ask(q){
      q = q.trim(); if(!q) return;
      say('me', esc(q));
      var hit = KB.filter(function(k){ return k.re.test(q); })[0];
      var d = say('bot', '');
      var html = hit ? hit.a + '<span class="src">Source: '+hit.src+'</span>' :
        'I could not find that in the employee handbook. I have forwarded your question to the HR team, who usually reply within one business day.<span class="src">Routed to: hr-team queue</span>';
      setTimeout(function(){ typeInto(d, html, function(){ chat.scrollTop = chat.scrollHeight; }); }, 350);
      $('#ask', hr).value = '';
    }
    $('#ask-go', hr).addEventListener('click', function(){ ask($('#ask', hr).value); });
    $('#ask', hr).addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); ask(e.target.value); } });
    hr.querySelectorAll('[data-q]').forEach(function(b){ b.addEventListener('click', function(){ ask(b.dataset.q); }); });
    say('bot', 'Hi, I am the HR assistant. Ask me about leave, sickness, remote work, expenses or onboarding.<span class="src">Answers come from the example employee handbook</span>');
  }
  })();
})();
