"""Markup for the Vendor Management demo. build.py calls markup()."""
from html import escape as e


def markup():
    ico = lambda d: f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
    items = [("sup", "Suppliers", ico('<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6"/>')),
             ("rfq", "RFQs", ico('<path d="M4 4h16v12H5.2L4 17.2z"/><path d="M8 9h8M8 12h5"/>')),
             ("cmp", "Complaints", ico('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>')),
             ("apv", "Approvals", ico('<path d="M9 12l2 2 4-4"/><rect x="3" y="3" width="18" height="18" rx="4"/>')),
             ("dms", "Documents", ico('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>'))]
    nav = "".join(f'<button type="button" data-v="{k}" aria-selected="{"true" if k == "sup" else "false"}">{ic}<span>{t}</span><i class="cnt" hidden></i></button>' for k, t, ic in items)
    return f"""<div class="demo-shell" id="demo-vendor">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">Vendor Hub</span><span class="badge">Demo · example data</span></div>
  <div class="app-body">
    <nav class="app-nav" aria-label="Vendor Hub sections">{nav}</nav>
    <div class="app-main" id="v-main" aria-live="polite"></div>
  </div>
  <div class="d-toast" id="v-toast" role="status"></div>
</div>"""
