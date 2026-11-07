"""Markup for the Real Estate Agency demo. build.py calls markup()."""


def markup():
    return """<div class="demo-shell re" id="demo-realestate">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">PropertyDesk</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Demo · sample data</span></div>
  <div class="re-roles"></div>
  <div class="re-guide"></div>
  <div class="app-body re-body">
    <nav class="app-nav re-nav" aria-label="PropertyDesk sections"></nav>
    <div class="app-main re-main" aria-live="polite"></div>
  </div>
  <p class="re-foot">All people, properties and companies are fictional. E-mails, e-signatures and notifications are simulated and never sent. AI steps are simulated.</p>
</div>"""
