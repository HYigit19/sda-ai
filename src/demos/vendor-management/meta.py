"""Page content for the Vendor Management demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M3 9v6l9 5 9-5V9M12 14v6"/></svg>'

USE_CASE = dict(slug="vendor-management", name="Vendor management", label="Procurement",
    title="AI Vendor Management Software Demo: RFQs, Quote Comparison, 8D Complaints, Approvals & DMS",
    meta="Try an interactive vendor management demo: RFQs (requests for quotation) with transparent quote scoring, supplier complaints with 8D (eight-step problem solving), manager approvals, spend overview and a document management system.",
    h1="Vendor management, from RFQ to complaint.",
    lede="One app for buyers, quality engineers and managers: run RFQs (requests for quotation) and compare quotes with a transparent score, handle supplier complaints with 8D (eight-step problem solving), approve awards and keep every certificate and contract on file.",
    card="RFQs, transparent quote comparison, 8D complaints, approvals, spend and supplier documents in one app.",
    how=[("Compare and award", "As the buyer, compare quotes side by side: exact totals, delivery time, payment terms and a score with visible weights. Award one and a contract draft is filed automatically."),
         ("Approve with a comment", "As the purchasing manager, approve or reject awards and new suppliers with a comment, and see spend by category and supplier."),
         ("Fix supplier problems", "As the quality engineer, run complaints through the 8D steps, rate suppliers and renew expiring certificates such as IATF 16949.")],
    services=["web-applications", "workflow-automation", "data-management"],
    cta="Want this for your purchasing team?")
