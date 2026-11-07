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
