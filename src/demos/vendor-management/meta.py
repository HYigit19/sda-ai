"""Page content for the Vendor Management demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M3 9v6l9 5 9-5V9M12 14v6"/></svg>'

USE_CASE = dict(slug="vendor-management", name="Vendor management", label="Procurement",
    title="AI Vendor Management Software Demo: RFQs, Complaints, Workflows & DMS",
    meta="Try an interactive AI vendor management demo: supplier risk scoring, RFQs with quote comparison, supplier complaints and 8D, approval workflows and a document management system.",
    h1="Vendor management, from RFQ to complaint.",
    lede="One app for the whole supplier lifecycle: score risks, send RFQs and compare quotes, handle complaints with 8D, run approvals, and keep every certificate and contract on file.",
    card="Supplier risk, RFQs, complaints, approval workflows and documents in one app.",
    how=[("Send an RFQ", "Open RFQs, invite suppliers, let AI draft the text, then watch quotes arrive and compare them."), ("Handle a complaint", "Log a defect, let AI classify it, send the 8D request and close it when the root cause comes back."), ("Approve and file", "Award a quote through the approval workflow and upload documents that AI files automatically.")],
    services=["web-applications", "workflow-automation", "data-management"])
