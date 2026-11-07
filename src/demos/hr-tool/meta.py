"""Page content for the Hr Tool demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M16.5 14.6c2.3.3 4 1.9 4.5 4.6"/></svg>'

USE_CASE = dict(slug="hr-tool", name="HR tool", label="People",
    title="AI HR Software Demo: Recruiting Pipeline, AI Inbox, Leave & HR Assistant",
    meta="Try an interactive AI HR tool demo: turn application e-mails into candidates with AI, match CVs to the job profile, approve leave with a coverage check and answer HR questions from the handbook.",
    h1="An HR tool that does the busywork.",
    lede="Application e-mails become candidate records with the CV attached, managers approve leave with a team coverage check, and employees get handbook answers or a ticket for HR. Every file sits in one document store with role-based access.",
    card="AI inbox for applications, candidate pipeline, leave approvals with coverage check, HR assistant and documents.",
    how=[("Let AI read applications", "Open the AI inbox: name, contact, role, experience and skills are pulled from each e-mail and CV, and duplicates update the existing candidate."),
         ("Run the pipeline", "Compare each CV with the job profile, move candidates from Applied to Hired, plan interviews and collect scored feedback from the hiring manager."),
         ("Handle leave and questions", "Employees request leave and ask the assistant. Managers approve with a coverage check, and unanswered questions become tickets for HR.")],
    services=["ai-agents", "workflow-automation", "web-applications", "data-management"],
    cta="Want this for your HR team?")
