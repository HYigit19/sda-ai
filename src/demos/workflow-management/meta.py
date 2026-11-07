"""Page content for the Workflow Management demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="6" height="6" rx="1.6"/><rect x="15" y="4" width="6" height="6" rx="1.6"/><rect x="9" y="15" width="6" height="6" rx="1.6"/><path d="M9 7h6M6 10v3a2 2 0 0 0 2 2h1M18 10v3a2 2 0 0 1-2 2h-1"/></svg>'

USE_CASE = dict(slug="workflow-management", name="Workflow management", label="Operations",
    title="Workflow Management Software Demo: Tasks, Approvals, Templates & DMS",
    meta="Try an interactive workflow and task management demo: assign tasks to people or teams, claim, accept or reject work, approval steps, workflow templates with dependencies, SLA tracking and linked documents.",
    h1="Internal workflows that never fall through the cracks.",
    lede="Assign work to a person or a whole team, let anyone in the team claim it, and track every hand-off, approval and document in one place. Templates turn recurring processes like onboarding or large purchases into linked tasks across departments.",
    card="Tasks for people and teams, approvals, workflow templates, SLA tracking and linked documents.",
    how=[("Assign the work", "As team lead, create a task for a team or a person. AI suggests the right team and priority from the description."),
         ("Claim and deliver", "Switch to an employee, claim the team task, attach a document from the library and finish it."),
         ("Approve and track", "The team lead approves or sends it back. The admin sees workload, overdue tasks and the full audit trail.")],
    services=["workflow-automation", "web-applications", "ai-agents"],
    cta="Want this for your internal workflows?")
