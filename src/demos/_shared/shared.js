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
