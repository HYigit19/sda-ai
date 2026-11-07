"""Page content for the Field Service & Proof Of Delivery demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>'

USE_CASE = dict(slug="field-service", name="Field service & proof of delivery", label="Field teams",
    title="Field Service App Demo: GPS Check-in, Photos & Proof of Delivery",
    meta="Try an interactive field service app demo: technicians check in on a map, take photos, collect a customer signature and send proof of delivery or service to the office in real time.",
    h1="Proof of delivery and service, straight from the field.",
    lede="Drivers and technicians mark their location, take photos, tick off the checklist and collect a signature. The office sees every job live on the map, with a verified proof for each one.",
    card="GPS check-in, photos, signatures and live proof of delivery or service.",
    how=[("Start a job", "Pick a job in the technician app and start the route. The van moves on the office map."), ("Check in and take photos", "Tap the map or use your device location, then take or add photos."), ("Sign and send", "Tick the checklist, let the customer sign, and see the proof arrive in the office.")],
    services=["mobile-apps", "workflow-automation", "web-applications"])
