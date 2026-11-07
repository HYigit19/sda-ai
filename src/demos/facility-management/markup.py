"""Markup for the Facility Management demo. build.py calls markup().

The interactive views are rendered by demo.js (SDA.demo pattern: role switcher,
guided task, per-role views and a document management system)."""


def markup():
    return """<div class="demo-shell fac" id="demo-facility">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">Facility Desk · HQ Building, Floor 1</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Demo · example data</span></div>
  <div class="fac-roles"></div>
  <div class="fac-guide"></div>
  <div class="fac-main"><p class="fac-loading">Loading the Facility Desk…</p></div>
  <p class="fac-sr" aria-live="polite"></p>
</div>"""
