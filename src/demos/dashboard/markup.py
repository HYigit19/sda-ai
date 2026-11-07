"""Markup for the Management Dashboard demo (Insight Board). build.py calls markup()."""


def markup():
    ico = lambda d: f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
    items = [("dash", "Dashboard", ico('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>')),
             ("sch", "Scheduled reports", ico('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3"/>')),
             ("docs", "Documents", ico('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'))]
    nav = "".join(f'<button type="button" role="tab" data-v="{k}" aria-selected="{"true" if k == "dash" else "false"}">{ic}<span>{t}</span><i class="cnt" hidden></i></button>' for k, t, ic in items)
    return f"""<div class="demo-shell dash" id="demo-dash">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">Insight Board</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Northfield Industries · USD</span></div>
  <div class="dash-roles"></div>
  <div class="dash-guide"></div>
  <div class="app-body">
    <nav class="app-nav" role="tablist" aria-label="Insight Board sections">{nav}</nav>
    <div class="app-main">
      <section class="dash-view" data-view="dash" role="tabpanel" aria-label="Dashboard"></section>
      <section class="dash-view" data-view="sch" role="tabpanel" aria-label="Scheduled reports" hidden></section>
      <section class="dash-view" data-view="docs" role="tabpanel" aria-label="Documents" hidden><div class="dash-dms"></div><p class="note dash-dms-note">Report archive, uploaded Excel source files and KPI definitions. Uploads stay in your browser.</p></section>
    </div>
  </div>
  <p class="dash-live" aria-live="polite"></p>
</div>"""
