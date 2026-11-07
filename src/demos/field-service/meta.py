"""Page content for the Field Service & Proof Of Delivery demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>'

USE_CASE = dict(slug="field-service", name="Field service & proof of delivery", label="Field teams",
    title="Field Service App Demo: GPS Check-in, Photos, Signatures & Proof of Delivery",
    meta="Try an interactive field service demo: a technician phone app with route, GPS check-in, photos, checklist and signature, a live dispatch board, automatic proof checks and a generated proof-of-delivery PDF.",
    h1="Proof of delivery and service, straight from the field.",
    lede="Technicians run their day from a phone app: route, check-in, photos, checklist, notes and the customer's signature. Dispatch assigns jobs on a live board, and every proof is checked automatically for location, photos, checklist and signature before it goes to the customer.",
    card="Phone app for field teams, live dispatch board, checked proof of delivery and a PDF for every job.",
    how=[("Do the job on the phone", "Start the route, check in at the address, take photos, tick the checklist and capture the customer's signature."),
         ("Let the checks run", "Distance to the address, GPS accuracy, photos, checklist and signature are checked. The proof is Verified only if all four pass, otherwise it goes to the office as Needs review with the reasons."),
         ("Review and send", "Dispatch sees every status change live, approves the proof-of-delivery PDF and sends it to the customer. Managers track first-time-fix rate, time on site and exceptions.")],
    services=["mobile-apps", "workflow-automation", "web-applications", "data-management"],
    cta="Want this for your field team?")
