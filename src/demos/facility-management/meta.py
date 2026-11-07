"""Page content for the Facility Management demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l8-3v19M12 9h8v12M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1M2 21h20"/></svg>'

USE_CASE = dict(slug="facility-management", name="Facility management", label="Facilities",
    title="AI Facility Management Software Demo",
    meta="Try an interactive AI facility management demo: live floor plan with sensors, AI ticket triage and predictive maintenance.",
    h1="Facility management that triages itself.",
    lede="Report a problem in plain language. AI finds the location, sets the priority and assigns the right team, while sensors and maintenance forecasts keep the building running.",
    card="Live floor plan, AI ticket triage and predictive maintenance for buildings.",
    how=[("Report an issue", "Type a problem in plain language or pick one of the examples."), ("Watch the triage", "AI sets category, priority, location and team, and the ticket appears on the plan."), ("Close the loop", "Dispatch the team or mark tickets resolved, and click rooms for live temperatures.")],
    services=["workflow-automation", "mobile-apps", "data-management"])
