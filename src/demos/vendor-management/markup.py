"""Markup for the Vendor Management demo (Vendor Hub). build.py calls markup().

The app content (role switcher, guided task, navigation, views, documents) is rendered by demo.js
through the shared SDA toolkit when the demo scrolls into view.
"""


def markup():
    return """<div class="demo-shell vm" id="demo-vendor">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">Vendor Hub</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Procurement</span></div>
  <div class="vm-roles"></div>
  <div class="vm-guide"></div>
  <div class="app-body">
    <nav class="app-nav vm-nav" role="tablist" aria-label="Vendor Hub sections"></nav>
    <div class="app-main vm-main" id="vm-main" role="tabpanel" aria-label="Vendor Hub"><p class="vm-boot">Loading Vendor Hub…</p></div>
  </div>
</div>"""
