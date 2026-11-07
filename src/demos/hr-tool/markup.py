"""Markup for the Hr Tool demo. build.py calls markup().

The app shell is static; demo.js renders the role switcher, guided task,
navigation and every view into it (see SDA.demo in _shared/shared.js)."""


def markup():
    return """<div class="demo-shell hr-app" id="demo-hr">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">People Desk</span><span class="sim">Interactive simulation · sample data</span><span class="badge">HR suite</span></div>
  <div class="hr-roles"></div>
  <div class="hr-guide"></div>
  <div class="hr-body">
    <nav class="hr-nav" aria-label="People Desk sections"></nav>
    <div class="hr-main" tabindex="-1"><p class="hr-loading">Loading People Desk…</p></div>
    <div class="hr-scrim" data-h="close-dr" hidden></div>
    <aside class="hr-drawer" aria-label="Candidate details" tabindex="-1" hidden></aside>
  </div>
  <p class="hr-vh" aria-live="polite" data-live></p>
</div>"""
