"""Page content for the Hr Tool demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4"/><circle cx="17.5" cy="9.5" r="2.4"/><path d="M16.5 14.6c2.3.3 4 1.9 4.5 4.6"/></svg>'

USE_CASE = dict(slug="hr-tool", name="HR tool", label="People",
    title="AI HR Software Demo: Recruiting, Leave & HR Assistant",
    meta="Try an interactive AI HR tool demo: candidate matching, leave approvals with coverage checks and an HR assistant that answers from your handbook.",
    h1="An HR tool that does the busywork.",
    lede="Match candidates to the job profile, approve leave with an automatic coverage check, and let employees get answers from the handbook any time.",
    card="Candidate matching, leave approvals with coverage checks and an HR assistant.",
    how=[("Review candidates", "Open a candidate to see the skill match and suggested interview questions."), ("Approve leave", "The coverage check warns you before the team is short-staffed."), ("Ask the assistant", "Employees get policy answers with the source section.")],
    services=["ai-agents", "workflow-automation", "web-applications"])
