"""Markup for the Field Service & Proof Of Delivery demo. build.py calls markup().

Everything inside is rendered by demo.js (SDA.demo pattern): role switcher, guided task,
the role view (field worker phone / dispatch board / manager KPIs) and the document area.
"""


def markup():
    return """<div class="demo-shell fs" id="demo-field">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">FieldProof · field app + dispatch</span><span class="sim">Interactive simulation · sample data</span><span class="badge">Demo · example data</span></div>
  <div class="fs-roles"></div>
  <div class="fs-guide"></div>
  <div class="fs-view"></div>
  <section class="fs-docs" aria-label="Job documents"><div class="fs-dms"></div></section>
</div>"""
