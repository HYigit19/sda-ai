"""Page content for the Construction & Fit-out demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V3"/><path d="M3 6h18"/><path d="M7 3 3 6M7 3l11 3"/><path d="M7 10l3-4M7 14l3-4"/><path d="M17 6v4"/><path d="M17 10v2.2a1.6 1.6 0 1 1-1.6 1.6"/><path d="M4 21h6"/></svg>'

USE_CASE = dict(slug="construction", name="Construction & fit-out", label="Construction",
    title="Construction & Fit-Out Project Control Demo: Site Reports, Snags, Permits & Claims",
    meta="Try an interactive project control app for UAE fit-out and construction contractors: daily site reports from the phone, snag lists on the floor plan, authority permits and NOC tracking, material requests and subcontractor progress claims with retention.",
    h1="Run every site from one screen, from the first snag to the last payment certificate.",
    lede="Built for fit-out and construction contractors in the UAE: site engineers report from the phone, subcontractors close snags with after-photos, and project managers see progress, permits, materials and claims across all projects in Dubai and Abu Dhabi.",
    card="Daily site reports, snags on the floor plan, permits and NOCs, material requests and subcontractor claims.",
    how=[("Report from site", "The site engineer dictates a short note on the phone. AI turns it into a structured daily report with manpower by trade, work done, delays and the heat-stress reminder, and pins snags with photos on the floor plan."),
         ("Subcontractors close the loop", "Each subcontractor sees only its own snags and requests, uploads after-photos, sends quotes and submits progress claims. The engineer verifies the fix on site and closes or rejects it."),
         ("Control every project", "The project manager approves quotes and payment certificates with 10% retention, tracks landlord NOCs, civil defence inspections and permit expiry, and sees progress, programme and budget vs committed for every project.")],
    services=["mobile-apps", "workflow-automation", "web-applications"],
    cta="Want this for your projects?")
