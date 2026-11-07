"""Page content for the Management Dashboard demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/><circle cx="19" cy="8" r="1.2"/></svg>'

USE_CASE = dict(slug="dashboard", name="Management dashboard", label="Management",
    title="AI Management Dashboard Demo: KPIs, Drilldowns, AI Summaries & Report Export",
    meta="Try an interactive BI dashboard demo: KPI tiles with targets, revenue and delivery charts, filters by period, region and product line, drilldowns to customers and orders, AI summaries of what changed, scheduled reports and PDF export.",
    h1="Your numbers in one dashboard, with the reasons behind them.",
    lede="Revenue, margin, delivery and complaints in one view, with a different view for each role. Filter by period, region and product line, open the customers and orders behind any bar, and let AI explain what changed before you send the report.",
    card="KPIs against target, drilldowns, AI summaries, scheduled reports and PDF export for every role.",
    how=[("Filter and spot the gap", "Switch the period, region or product line. Every tile and chart updates, and anomalies are flagged automatically."),
         ("Drill in and ask why", "Click the weakest bar to see the customers and orders behind it, then let AI summarise what changed and why."),
         ("Report and schedule", "Export the current view as a PDF to the document archive or schedule it as a weekly or monthly e-mail.")],
    services=["data-management", "web-applications", "ai-agents"],
    cta="Want this dashboard with your numbers?")
