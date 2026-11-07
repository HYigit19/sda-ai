"""Markup for the Freight Forwarding & Customs demo. build.py calls markup()."""


def markup():
    return """<div class="demo-shell fx" id="demo-freight">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">ShipDesk</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Demo · sample data</span></div>
  <div class="fx-roles"></div>
  <div class="fx-guide"></div>
  <div class="app-body fx-body">
    <nav class="app-nav fx-nav" aria-label="ShipDesk sections"></nav>
    <div class="app-main fx-main"></div>
    <div class="fx-scrim" hidden></div>
    <aside class="fx-drawer" hidden aria-label="Shipment details" tabindex="-1"></aside>
  </div>
  <p class="fx-foot">All people, companies and shipments are fictional. Customs submissions, WhatsApp and e-mail messages and driver notifications are simulated and never sent. AI steps are simulated. Duty figures are illustrative (5% of CIF value as an example), not customs advice.</p>
</div>"""
