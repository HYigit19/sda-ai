"""Markup for the Workflow Management demo. build.py calls markup()."""


def markup():
    return """<div class="demo-shell wf" id="demo-workflow">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">TaskFlow</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Demo · example data</span></div>
  <div class="wf-roles"></div>
  <div class="wf-guide"></div>
  <div class="app-body wf-body">
    <nav class="app-nav wf-nav" aria-label="TaskFlow sections"></nav>
    <div class="app-main wf-main"></div>
    <div class="wf-scrim" hidden></div>
    <aside class="wf-drawer" hidden aria-label="Task details" tabindex="-1"></aside>
  </div>
  <p class="wf-live" aria-live="polite"></p>
</div>"""
