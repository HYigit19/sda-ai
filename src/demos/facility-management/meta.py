"""Page content for the Facility Management demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l8-3v19M12 9h8v12M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1M2 21h20"/></svg>'

USE_CASE = dict(slug="facility-management", name="Facility management", label="Facilities",
    title="AI Facility Management Software Demo: Tickets, Technician App, Sensors & DMS",
    meta="Try an interactive AI facility management demo: employees report issues in plain language, AI triages them, managers assign teams on a live sensor floor plan, technicians resolve jobs on mobile with manuals and safety notes, and every contract and certificate is on file.",
    h1="Facility management that triages itself.",
    lede="Employees report a problem in their own words. AI works out category, priority and location, and asks when it is unsure. The facility manager assigns the team on a live floor plan, the technician fixes it on a phone with the right manual and safety notes, and the reporter sees it closed.",
    card="Issue reporting with AI triage, a mobile technician app, live sensors, predictive maintenance, contracts and documents.",
    how=[("Report it in plain language", "As an employee, describe the issue or pick an example. AI (simulated) splits multiple problems into separate tickets and asks for the room when the location is unclear."),
         ("Assign and plan", "As the facility manager, watch live sensors on the floor plan, filter all tickets, assign or reassign teams, plan predictive maintenance and keep contracts, certificates and costs in view."),
         ("Fix it on the go", "As the technician, accept the job on a phone-sized work list, check safety notes and the asset manual, add photos and notes, and resolve it. The reporter sees it closed.")],
    services=["ai-agents", "workflow-automation", "mobile-apps", "web-applications", "data-management"],
    cta="Want this for your buildings?")
