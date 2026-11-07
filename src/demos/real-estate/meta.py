"""Page content for the Real Estate Agency demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/></svg>'

USE_CASE = dict(slug="real-estate", name="Real estate agency", label="Real estate",
    title="Real Estate CRM Demo: Listings, Leads, Viewings, Pipeline & Contracts",
    meta="Try an interactive real estate agency CRM: listings with price approvals, AI lead scoring and property matching, viewings with feedback, a deals pipeline, contract generation and a document management system.",
    h1="Run your agency from first inquiry to signed contract.",
    lede="One app for agents, back office and owners: score and match leads, book viewings, move deals through the pipeline, generate contracts from templates and keep every exposé, floor plan and certificate on file.",
    card="Listings, AI lead matching, viewings, deal pipeline, contracts and documents for an agency.",
    how=[("Qualify and match", "An inquiry comes in. AI scores the lead and suggests the best-matching listings, and the agent adds one to the pipeline."),
         ("View and offer", "Schedule a viewing, log the feedback on the phone, create the offer and record the seller's answer."),
         ("Contract and close", "Back office generates the purchase agreement from a template, the owner approves it and it goes out for signature, with a task checklist for the whole team.")],
    services=["web-applications", "workflow-automation", "ai-agents"],
    cta="Want this for your agency?")
