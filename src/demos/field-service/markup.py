"""Markup for the Field Service & Proof Of Delivery demo. build.py calls markup()."""
from html import escape as e


def markup():
    return """<div class="demo-shell field" id="demo-field">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">FieldProof · technician app + office</span><span class="badge">Demo · example data</span></div>
  <div class="field-body">
    <div class="phone-wrap"><div class="phone" id="f-phone" aria-live="polite"></div><p class="note" style="text-align:center;margin-top:10px">Technician app</p></div>
    <div class="f-office" id="f-office" aria-live="polite"></div>
  </div>
  <div class="d-toast" id="f-toast" role="status"></div>
</div>"""
