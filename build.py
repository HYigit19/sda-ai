#!/usr/bin/env python3
"""Builds the static SDA AI Services website into ./site.

Edit content in this file (SERVICES, USE_CASES, page functions), then run:
    python3 build.py
Change SITE_URL and EMAIL before going live.
"""
import json, shutil, html
from pathlib import Path

SITE_URL = "https://sda-ai.pages.dev"      # Cloudflare Pages address. Change to your own domain once it is connected.
EMAIL = "hello@sda-ai.services"            # TODO: your real email
BRAND = "SDA AI Services"
ROOT = Path(__file__).parent
# Cache-busting: a short hash of the CSS and JS goes into every asset URL,
# so browsers fetch new files right after each deploy.
import hashlib as _hl
ASSET_V = _hl.sha1(b"".join(p.read_bytes() for p in sorted([*(ROOT / "src" / "assets").glob("*.css"), *(ROOT / "src" / "assets").glob("*.js"), *(ROOT / "src" / "demos").rglob("*.*")]) if p.suffix in (".css", ".js", ".py"))).hexdigest()[:8]
OUT = ROOT / "site"

e = html.escape

# --------------------------------------------------------------------------
# Content
# --------------------------------------------------------------------------
ICONS = {
  "agents": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6"/></svg>',
  "flow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h10M4 12h16M4 17h7"/><circle cx="18" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>',
  "web": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8"/></svg>',
  "mobile": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
  "chart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  "data": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6.5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V5.5M4.5 12v6.5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V12"/></svg>',
  "plug": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"/></svg>',
}

SERVICES = [
  dict(slug="ai-agents", icon="agents", name="AI agents & assistants",
    title="AI Agent Development & Custom AI Assistants",
    meta="We build custom AI agents and chat assistants that answer from your documents and act in your tools. RAG, tool calling, guardrails and secure hosting.",
    h1="AI agents that answer, decide and act.",
    lede="We build assistants that answer from your own knowledge and agents that complete tasks in your systems, with guardrails and human approval where it matters.",
    short="Assistants that answer from your documents and agents that take actions in your tools, with guardrails and human approval.",
    chips=["RAG", "Tool calling", "Chat & voice"],
    facts=[("Typical first release", "4–8 weeks"), ("Hosting", "Your cloud or ours"), ("Models", "Claude, GPT, Gemini, open source"), ("Channels", "Web, Teams, Slack, phone")],
    intro=["An AI agent is software that understands a request in plain language, looks up the right information and carries out the next step. A support agent can read a ticket, check the order in your ERP and draft the reply. An internal assistant can answer policy questions with a link to the source.",
           "We design the agent around one measurable job, connect it to your data with retrieval-augmented generation (RAG), and add the controls an enterprise needs: permissions, logging, evaluation and a clear hand-off to people."],
    deliver=[("Knowledge assistants", "Chat over manuals, policies, contracts and wikis, with citations so users can check every answer."),
             ("Customer support agents", "Agents that resolve common tickets, update CRM records and escalate the rest with a summary."),
             ("Task agents", "Agents that call your APIs to create orders, book appointments or update records, with approval steps."),
             ("Voice & chat channels", "Deploy on your website, Microsoft Teams, Slack, WhatsApp or the phone."),
             ("Evaluation & guardrails", "Test sets, accuracy tracking, PII redaction and topic limits before and after launch."),
             ("Agent operations", "Monitoring, cost tracking and continuous improvement once the agent is live.")],
    examples=[("Customer service", "Resolve order-status and returns questions automatically, 24/7."),
              ("Internal helpdesk", "Answer IT and HR questions from your handbook with source links."),
              ("Sales", "Qualify inbound leads and prepare meeting briefs from CRM data."),
              ("Procurement", "Compare supplier offers and flag contract risks.")],
    faq=[("What is the difference between a chatbot and an AI agent?", "A chatbot answers questions. An AI agent can also take actions, such as looking up an order, updating a record or sending an email, using tools you give it access to."),
         ("Can the AI use our internal documents securely?", "Yes. We use retrieval-augmented generation, so documents stay in your storage and the agent only sees what the user is allowed to see. Your data is not used to train public models."),
         ("Which AI model do you use?", "We choose per project based on accuracy, cost and data-protection needs. We work with Claude, GPT, Gemini and open-source models that can run in your own cloud."),
         ("How do you prevent wrong answers?", "We build a test set from real questions, measure accuracy before launch, require citations, and route uncertain cases to a person.")],
    usecase="hr-tool"),
  dict(slug="workflow-automation", icon="flow", name="Workflow automation",
    title="AI Workflow Automation & Business Process Automation",
    meta="Automate approvals, document processing, complaints and reporting with AI. We map your processes and automate them end to end with clear human hand-offs.",
    h1="Automate the work nobody should do by hand.",
    lede="We find the repetitive steps in approvals, documents, complaints and reporting, and automate them end to end with clear hand-offs to your team.",
    short="Approvals, complaints, reporting and data entry, automated end to end with clear hand-offs to people.",
    chips=["Process mining", "Document AI", "Approvals"],
    facts=[("Typical first release", "3–6 weeks"), ("Works with", "ERP, CRM, email, SharePoint"), ("Approach", "Measure, automate, report"), ("Support", "Ongoing optimisation")],
    intro=["Most companies run on processes that move data between emails, PDFs, spreadsheets and business systems. Each step is small, but together they cost hours every day and cause delays and errors.",
           "We map the process with the people who run it, decide which steps AI can handle reliably, and build the automation with exception queues, audit trails and dashboards so you can see the time saved."],
    deliver=[("Process discovery", "Workshops and data analysis to find the steps with the highest automation value."),
             ("Document processing", "Read invoices, delivery notes, forms and contracts and extract the data into your systems."),
             ("Smart routing", "Classify emails, tickets and complaints and send them to the right team with a priority."),
             ("Approval workflows", "Digital approvals with rules, reminders, escalation and full history."),
             ("Report automation", "Recurring reports generated and sent automatically, with AI-written summaries."),
             ("Monitoring", "Dashboards for volumes, processing times and exceptions.")],
    examples=[("Accounts payable", "Capture invoices, match them to orders and route exceptions."),
              ("Complaints", "Classify incoming complaints and draft responses for review."),
              ("Order entry", "Turn customer emails and PDFs into ERP sales orders."),
              ("Facility requests", "Triage maintenance tickets and dispatch the right team.")],
    faq=[("Which processes are best to automate first?", "High-volume, rule-based processes with digital inputs, such as invoice capture, ticket routing or order entry. We usually start with one process and measure the result."),
         ("Do we need to replace our existing systems?", "No. We connect to the systems you already use through APIs, email, file shares or, where needed, robotic process automation."),
         ("What happens when the AI is unsure?", "Uncertain cases go to an exception queue where a person decides. Their decisions can be used to improve the automation over time."),
         ("How do we measure success?", "We agree on a baseline before we start, such as hours per week or processing time, and report against it after launch.")],
    usecase="facility-management"),
  dict(slug="web-applications", icon="web", name="Custom web applications",
    title="Custom Web Application Development with AI",
    meta="Custom web apps, portals and SaaS products with AI built in. React, Next.js and Python, delivered fast, accessible and maintainable.",
    h1="Web applications with AI built in.",
    lede="Portals, internal tools and SaaS products, designed around your users and delivered as fast, accessible web apps your team can maintain.",
    short="Portals, internal tools and SaaS products with AI built in, delivered as fast, maintainable web apps.",
    chips=["React / Next.js", "APIs", "Cloud native"],
    facts=[("Typical MVP", "6–12 weeks"), ("Frontend", "React, Next.js, TypeScript"), ("Backend", "Node.js, Python, PostgreSQL"), ("Hosting", "AWS, Azure, GCP")],
    intro=["Off-the-shelf software rarely fits how your business actually works. A custom web application can match your process exactly, connect to your existing systems and include AI features where they add real value.",
           "We take a product from first concept through design, development and launch, with automated tests, CI/CD and documentation so your team or ours can keep improving it."],
    deliver=[("Product discovery", "User interviews, scope and a clickable prototype before development starts."),
             ("UX/UI design", "Clean, accessible interfaces that follow WCAG and your brand."),
             ("Full-stack development", "TypeScript frontends, robust APIs and well-modelled databases."),
             ("AI features", "Search, summaries, document upload, recommendations and assistants inside your app."),
             ("Customer & partner portals", "Secure self-service portals with single sign-on and role-based access."),
             ("DevOps & hosting", "CI/CD pipelines, monitoring, backups and cloud infrastructure as code.")],
    examples=[("Supplier portal", "Suppliers upload documents, confirm orders and see their scorecard."),
              ("Internal tools", "Replace spreadsheets with a proper app for planning or approvals."),
              ("SaaS MVP", "Launch a new AI product to your first customers."),
              ("Customer portal", "Let customers track orders, tickets and invoices online.")],
    faq=[("How long does it take to build a web application?", "A focused MVP usually takes 6 to 12 weeks. We deliver in two-week sprints so you see working software early and can adjust priorities."),
         ("Who owns the code?", "You do. All source code, designs and documentation are transferred to you."),
         ("Can you take over an existing application?", "Yes. We start with a code and architecture review, then stabilise and extend the application."),
         ("Do you provide support after launch?", "Yes. We offer maintenance and further development packages with agreed response times.")],
    usecase="vendor-management"),
  dict(slug="mobile-apps", icon="mobile", name="Mobile & field apps",
    title="Mobile App & Field Service App Development",
    meta="iOS, Android and progressive web apps for field teams: job reports, photos, GPS, signatures and offline capture that syncs back to your systems.",
    h1="Apps for teams that work on the move.",
    lede="Mobile apps for technicians, inspectors and sales teams: capture photos, GPS and signatures on site, work offline, and sync to the office in real time.",
    short="Apps for teams on the move: job reports, photos, GPS and offline capture with instant sync to the office.",
    chips=["iOS & Android", "Offline-first", "PWA"],
    facts=[("Typical first release", "8–12 weeks"), ("Platforms", "iOS, Android, web"), ("Tech", "Flutter, React Native, PWA"), ("Works offline", "Yes")],
    intro=["Field teams still lose time with paper forms, phone calls and re-typing data back at the office. A well-designed mobile app removes that work and gives managers a live view of what is happening.",
           "We build cross-platform apps that are simple enough to use with gloves on, work without a signal and connect to your ERP, CRM or maintenance system. AI features such as photo recognition and voice notes speed up reporting further."],
    deliver=[("Field service apps", "Job lists, checklists, time tracking, photos and customer signatures."),
             ("Inspection & audit apps", "Digital checklists with photo evidence and automatic PDF reports."),
             ("Offline sync", "Reliable offline mode that syncs as soon as a connection is available."),
             ("AI on the device", "Voice-to-text reports, photo classification and damage detection."),
             ("Back-office web app", "Planning, dispatch and reporting for the office team."),
             ("App store release", "Publishing, updates and device management for your company.")],
    examples=[("Maintenance", "Technicians close jobs on site with photos and signatures."),
              ("Facility rounds", "Guided inspection rounds with automatic defect tickets."),
              ("Construction", "Daily site reports with GPS-tagged photos."),
              ("Sales visits", "Visit reports and orders captured in the field.")],
    faq=[("Native app or progressive web app?", "A progressive web app is faster and cheaper to roll out. Native or cross-platform apps make sense when you need offline mode, camera features or app store distribution. We advise per project."),
         ("Does the app work without internet?", "Yes. We design offline-first, so data is stored on the device and synced when a connection returns."),
         ("Can the app connect to our ERP?", "Yes, we connect it to your ERP and other business systems."),
         ("How do you handle data protection?", "Data is encrypted on the device and in transit, and we follow GDPR requirements for location and photo data.")],
    usecase="field-service"),
  dict(slug="data-management", icon="data", name="Data management",
    title="Data Management Services for AI: Integration, Quality & Governance",
    meta="Get your data ready for AI. We connect, clean and govern data from ERP, CRM and files, and build the pipelines, master data and knowledge bases your AI can trust.",
    h1="Clean, connected data your AI can trust.",
    lede="AI is only as good as the data behind it. We connect your sources, fix quality issues and set up the pipelines, master data and governance that keep your data reliable.",
    short="Connect, clean and govern data from all your systems so AI and reporting can rely on it.",
    chips=["Data pipelines", "Data quality", "Governance"],
    facts=[("Typical first release", "3–6 weeks"), ("Sources", "ERP, CRM, files, APIs"), ("Storage", "Warehouse, lakehouse, vector DB"), ("Focus", "Quality & governance")],
    intro=["Most AI projects that stall do so because of data, not models. Customer records exist three times, supplier names are spelled five ways, and the documents an assistant needs are scattered across drives and inboxes.",
           "We bring your data into shape: we connect the sources, clean and deduplicate records, define who owns what, and build pipelines that keep everything current. The result is a reliable foundation for AI agents, automation and reporting."],
    deliver=[("Data integration", "Reliable pipelines from ERP, CRM, databases, files and APIs into one governed platform."),
             ("Data quality & cleansing", "Find and fix duplicates, gaps and inconsistencies, with AI-assisted matching."),
             ("Master data management", "One trusted record for customers, suppliers, materials and products."),
             ("Knowledge bases for AI", "Prepare documents and records for retrieval, with vector search and access rules."),
             ("Governance & access", "Ownership, data catalog, lineage and role-based access, documented and auditable."),
             ("Reporting foundation", "Clean, modelled data that feeds your BI tools and management reports.")],
    examples=[("Supplier master data", "Merge duplicate suppliers and keep certifications and contracts current."),
              ("Customer 360", "Combine CRM, orders and support history into one customer view."),
              ("Document knowledge base", "Turn manuals, policies and contracts into a searchable source for AI assistants."),
              ("System migration", "Cleanse and validate data before moving to a new ERP or CRM.")],
    faq=[("Why does data quality matter for AI?", "AI agents and forecasts repeat whatever is in your data. Duplicates, gaps and outdated records lead directly to wrong answers and bad decisions."),
         ("Do we need a data warehouse first?", "Not necessarily. We start with the data the first use case needs and grow the platform when volume or complexity requires it."),
         ("How do you handle sensitive data?", "We apply role-based access, encryption and masking, and keep data in the environment you choose."),
         ("Can you work with our existing tools?", "Yes. We build on the databases, cloud platforms and BI tools you already use wherever that makes sense.")],
    usecase="vendor-management"),
  dict(slug="sap-integration", icon="plug", name="Enterprise & SAP integration",
    title="SAP AI Integration, SAP BTP Extensions & ERP Integration",
    meta="Connect AI to SAP S/4HANA, SAP BTP, CRMs and legacy systems. Side-by-side extensions, APIs and middleware without disrupting operations.",
    h1="Bring AI to the systems you already run.",
    lede="We connect AI agents, apps and dashboards to SAP S/4HANA, SAP BTP, CRMs and legacy databases, safely and without disrupting daily operations.",
    short="Connect AI to SAP S/4HANA, SAP BTP extensions, CRMs and legacy databases without disrupting operations.",
    chips=["SAP BTP", "S/4HANA", "Middleware"],
    facts=[("Systems", "SAP ECC, S/4HANA, BTP"), ("Also", "Dynamics, Salesforce, custom DBs"), ("Approach", "Clean core, side-by-side"), ("Integration", "APIs, events, middleware")],
    intro=["Your ERP holds the data that makes AI useful: orders, materials, suppliers, quality records and customers. The challenge is connecting to it securely without modifying the core system.",
           "We build side-by-side extensions on SAP BTP and integration layers that expose the right data to AI applications through governed APIs. That keeps your SAP core clean and upgrade-safe."],
    deliver=[("Integration architecture", "Target architecture, API strategy and security concept."),
             ("SAP BTP extensions", "Side-by-side apps with SAP Build, CAP and Fiori."),
             ("AI on ERP data", "Agents and assistants that read and write SAP data through approved APIs."),
             ("API & middleware", "SAP Integration Suite, REST and OData services, event-driven integration."),
             ("Legacy integration", "Connect older databases and file-based interfaces safely."),
             ("Data migration support", "Data cleansing and validation with AI for S/4HANA projects.")],
    examples=[("Quality management", "Summarise inspection results and suggest usage decisions."),
              ("Purchasing", "Draft purchase orders and flag supplier risks from SAP data."),
              ("Sales", "Turn customer emails into sales orders in S/4HANA."),
              ("Maintenance", "Create maintenance notifications from mobile reports.")],
    faq=[("Can you connect AI to SAP?", "Yes, we connect AI to SAP and other ERP systems through secure, approved APIs."),
         ("Will the integration disrupt daily operations?", "No. We build alongside your existing systems and roll out in steps, with testing before anything goes live."),
         ("Can AI write data back into our systems?", "Yes, with permission checks, and with a human approval step for critical transactions."),
         ("Which other systems can you integrate?", "CRMs, document management, databases and most systems with an API, including older file-based interfaces.")],
    usecase="vendor-management"),
]

# Demos live in src/demos/<slug>/ (meta.py: page content, markup.py: HTML, demo.js, demo.css).
# The order here is the order on the site.
import importlib.util as _ilu
DEMO_DIR = ROOT / "src" / "demos"
DEMO_ORDER = ["vendor-management", "field-service", "facility-management", "hr-tool"]
def _load(slug, name):
    spec = _ilu.spec_from_file_location(f"demo_{slug.replace('-', '_')}_{name}", DEMO_DIR / slug / f"{name}.py")
    mod = _ilu.module_from_spec(spec); spec.loader.exec_module(mod); return mod
USE_CASES, UC_ICONS, DEMOS = [], {}, {}
for _slug in DEMO_ORDER:
    _meta = _load(_slug, "meta")
    USE_CASES.append(_meta.USE_CASE); UC_ICONS[_slug] = _meta.ICON; DEMOS[_slug] = _load(_slug, "markup").markup
IND_ICON = lambda d: f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">{d}</svg>'
INDUSTRIES = [
  dict(slug="manufacturing", name="Manufacturing",
    icon=IND_ICON('<path d="M3 21V10l6 4V10l6 4V6l6-3v18H3z"/><path d="M7 17h2M12 17h2M17 17h1"/>'),
    line="Supplier quality, complaints and production data in one connected flow.",
    links=[("Vendor management demo", "use-cases/vendor-management.html"), ("SAP integration", "services/sap-integration.html")]),
  dict(slug="logistics", name="Logistics & wholesale",
    icon=IND_ICON('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>'),
    line="Order intake, proof of delivery and customer updates without manual steps.",
    links=[("Field service demo", "use-cases/field-service.html"), ("Workflow automation", "services/workflow-automation.html")]),
  dict(slug="construction", name="Construction & field service",
    icon=IND_ICON('<path d="M4 18h16M6 18v-3a6 6 0 0 1 12 0v3M12 9V5M9 6l3-1 3 1"/>'),
    line="Jobs, photos, timesheets and signatures from the site straight to the invoice.",
    links=[("Field service demo", "use-cases/field-service.html"), ("Mobile & field apps", "services/mobile-apps.html")]),
  dict(slug="real-estate", name="Real estate & facilities",
    icon=IND_ICON('<path d="M4 21V5l8-3v19M12 9h8v12M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1M2 21h20"/>'),
    line="Tickets, assets, inspections and service partners under one roof.",
    links=[("Facility management demo", "use-cases/facility-management.html"), ("Custom web apps", "services/web-applications.html")]),
  dict(slug="professional-services", name="Professional services",
    icon=IND_ICON('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'),
    line="Documents, knowledge and client requests answered in minutes, not days.",
    links=[("AI agents & assistants", "services/ai-agents.html"), ("Data management", "services/data-management.html")]),
  dict(slug="energy", name="Energy & utilities",
    icon=IND_ICON('<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>'),
    line="Field crews, asset data and maintenance plans connected to your core systems.",
    links=[("Mobile & field apps", "services/mobile-apps.html"), ("SAP integration", "services/sap-integration.html")]),
]

def industries_block(r):
    cards = "".join(f"""<article class="ind glass" id="ind-{i['slug']}"><span class="ind-ic" aria-hidden="true">{i['icon']}</span><h3>{e(i['name'])}</h3><p>{e(i['line'])}</p><div class="ind-links">{"".join(f'<a href="{r}{h}">{e(t)} <span class="arr">→</span></a>' for t, h in i['links'])}</div></article>""" for i in INDUSTRIES)
    return f"""<div class="sec-head"><h2>Built for your industry</h2><p>The same building blocks, shaped around the processes, data and rules of your sector.</p></div><div class="inds">{cards}</div>"""

SVC = {s["slug"]: s for s in SERVICES}
UC = {u["slug"]: u for u in USE_CASES}
# --------------------------------------------------------------------------
# Layout
# --------------------------------------------------------------------------
SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.6 5.8 3.4 9.9 12 12-8.6 2.1-11.4 6.2-12 12-.6-5.8-3.4-9.9-12-12 8.6-2.1 11.4-6.2 12-12z" fill="currentColor"/></svg>'
# gradient sparkle for headings + logo (teal -> coral), ids made unique per use
_spark_n = [0]
def spark_g():
    _spark_n[0] += 1
    i = f"sg{_spark_n[0]}"
    return (f'<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="{i}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" style="stop-color:var(--teal-2)"/><stop offset="1" style="stop-color:var(--coral)"/></linearGradient></defs>'
            f'<path d="M12 0c.6 5.8 3.4 9.9 12 12-8.6 2.1-11.4 6.2-12 12-.6-5.8-3.4-9.9-12-12 8.6-2.1 11.4-6.2 12-12z" fill="url(#{i})"/></svg>')
def SPG():
    return f'<span class="sp">{spark_g()}</span>'
SP = '<span class="sp" style="color:var(--teal-2)">' + SPARK + '</span>'
CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.2" fill="currentColor" opacity=".16"/><path d="M4.8 8.3 7 10.4l4.2-4.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
FAVICON = "data:image/svg+xml," + ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%2317A39D'/><stop offset='1' stop-color='%23FF7D5E'/></linearGradient></defs>"
           "<rect width='32' height='32' rx='9' fill='%23ffffff'/><path d='M16 4c.5 5 2.8 8.3 12 12-9.2 3.7-11.5 7-12 12-.5-5-2.8-8.3-12-12 9.2-3.7 11.5-7 12-12z' fill='url(%23g)'/></svg>")

_logo_n = [0]
def logo_svg(cls="logo-svg"):
    """Cloud logo (from the brand artwork), drawn with the theme colours."""
    _logo_n[0] += 1
    g = f"lg{_logo_n[0]}"
    return (f'<svg class="{cls}" viewBox="0 0 172 56" role="img" aria-label="{BRAND}"><defs><linearGradient id="{g}" x1="0" y1="1" x2="1" y2="0">'
            f'<stop offset="0" style="stop-color:var(--teal)"/><stop offset="1" style="stop-color:var(--teal-glow)"/></linearGradient></defs>'
            f'<circle cx="28" cy="28" r="27" fill="url(#{g})"/>'
            '<path d="M17.5 34.5a6.6 6.6 0 0 1 .9-13.1 9.6 9.6 0 0 1 18.4-3 7.6 7.6 0 0 1 3.3 16.1z" fill="#fff" fill-opacity=".95"/>'
            '<path d="M26.5 20.2a7.4 7.4 0 0 1 9.6 6.6 7 7 0 0 0-6.6 7.7h-4.4a8.7 8.7 0 0 1 1.4-14.3z" fill="#fff" fill-opacity=".55" style="mix-blend-mode:multiply"/>'
            '<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M23 34.5v3.6h-4"/><path d="M28 34.5v6.4"/><path d="M33 34.5v3.6h4"/></g>'
            '<circle cx="17" cy="38.1" r="1.9" fill="none" stroke="#fff" stroke-width="1.5"/>'
            '<circle cx="28" cy="42.8" r="2.3" style="fill:var(--coral)" stroke="#fff" stroke-width="1.4"/>'
            '<circle cx="39" cy="38.1" r="1.9" style="fill:var(--coral)" stroke="#fff" stroke-width="1.3"/>'
            '<text x="64" y="31" font-family="Geist, system-ui, sans-serif" font-size="28" font-weight="800" letter-spacing="-.5" style="fill:var(--ink)">SDA</text>'
            '<text x="65" y="46.5" font-family="Geist, system-ui, sans-serif" font-size="9.4" font-weight="600" letter-spacing="2.9" style="fill:var(--teal)">AI SERVICES</text></svg>')

def logo(r):
    return f'<a class="logo" href="{r}index.html" aria-label="{BRAND} home">{logo_svg()}</a>'

def head(r, path, title, meta, schema=None, demo=False):
    url = SITE_URL + "/" + path
    full_title = title if title.endswith(BRAND) else f"{title} | {BRAND}"
    ld = ""
    for s in (schema or []):
        ld += '<script type="application/ld+json">' + json.dumps(s, ensure_ascii=False) + "</script>\n"
    return f"""<title>{e(full_title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{e(meta)}">
<meta name="theme-color" content="#F7F9F9">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{e(full_title)}">
<meta property="og:description" content="{e(meta)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE_URL}/assets/brand/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:image" content="{SITE_URL}/assets/brand/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{r}assets/brand/logo-mark.svg" type="image/svg+xml">
<link rel="icon" href="{r}assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{r}assets/brand/apple-touch-icon.png">
<link rel="manifest" href="{r}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap">
<script>try{{var t=new URLSearchParams(location.search).get("theme")||localStorage.getItem("sda-theme");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<link rel="stylesheet" href="{r}assets/style.css?v={ASSET_V}">{chr(10) + f'<link rel="stylesheet" href="{r}assets/demos.css?v={ASSET_V}">' if demo else ""}
{ld}"""

BURGER = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.5h14M3 13.5h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'

def nav(r, active):
    drop = "".join(f'<li><a href="{r}services/{s["slug"]}.html"><span class="d-ic" aria-hidden="true">{ICONS[s["icon"]]}</span><span class="d-tx"><b>{e(s["name"])}</b><span>{e(", ".join(s["chips"]))}</span></span></a></li>' for s in SERVICES)
    drop += f'<li class="d-feature"><a href="{r}services/index.html"><span class="d-kick">All services</span><b>From first prototype to production</b><span>See how we design, build and run AI software for your team.</span><span class="d-go">Explore services <span class="arr">→</span></span></a></li>'
    cur = lambda k: ' aria-current="page"' if active == k else ""
    return f"""<div class="aurora" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i></div><div class="grain" aria-hidden="true"></div>
<a class="skip" href="#main">Skip to content</a>
<nav class="nav" aria-label="Main">
  <div class="nav-in glass-strong">
    {logo(r)}
    <ul class="menu">
      <li class="m-ind" aria-hidden="true"></li>
      <li><a href="{r}index.html"{cur("home")}>Home</a></li>
      <li class="has-drop"><a href="{r}services/index.html"{cur("services")}>Services <svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></a><ul class="drop mega glass-strong">{drop}</ul></li>
      <li><a href="{r}use-cases/index.html"{cur("use-cases")}><i class="pulse-dot" aria-hidden="true"></i>Live demos</a></li>
      <li><a href="{r}index.html#process">Process</a></li>
      <li><a href="{r}contact.html"{cur("contact")}>Contact</a></li>
      <li class="m-cta"><a class="btn btn-primary" href="{r}contact.html">Start a project <span class="arr">→</span></a></li>
    </ul>
    <div class="nav-cta">
      <a class="btn btn-primary btn-sm btn-shine" href="{r}contact.html">Start a project <span class="arr">→</span></a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false">{BURGER}</button>
    </div>
  </div>
</nav>"""

def footer(r, demo=False):
    svc = "".join(f'<li><a href="{r}services/{s["slug"]}.html">{e(s["name"])}</a></li>' for s in SERVICES)
    inds = "".join(f'<li><a href="{r}index.html#ind-{i["slug"]}">{e(i["name"])}</a></li>' for i in INDUSTRIES)
    demo_js = f'\n<script src="{r}assets/demos.js?v={ASSET_V}"></script>' if demo else ""
    return f"""<footer>
  <div class="wrap">
    <div class="foot glass">
      <div>{logo(r)}<p>AI software, web and app development for companies that want working systems in production.</p></div>
      <div><h4>Services</h4><ul>{svc}</ul></div>
      <div><h4>Industries</h4><ul>{inds}</ul></div>
      <div><h4>Company</h4><ul><li><a href="{r}index.html#process">Process</a></li><li><a href="{r}index.html#stack">Technology</a></li><li><a href="{r}contact.html">Contact</a></li><li>{EMAIL}</li></ul></div>
    </div>
    <div class="foot-base"><span>© <span id="yr">2026</span> {BRAND}</span><span><a href="{r}privacy.html">Privacy policy</a> · <a href="{r}legal-notice.html">Legal notice</a></span></div>
  </div>
</footer>
<script src="{r}assets/main.js?v={ASSET_V}"></script>{demo_js}"""

def cta_band(r, h="Ready to put AI to work?", p="Tell us about your process. We reply within one business day with first ideas and a proposed next step."):
    return f"""<section class="block" style="padding-top:0"><div class="wrap"><div class="cta-card glass-strong"><h2>{h}</h2><p>{p}</p>
<div class="cta-row"><a class="btn btn-primary" href="{r}contact.html">Book a discovery call <span class="arr">→</span></a><a class="btn btn-glass" href="{r}use-cases/index.html">Try the live demos</a></div></div></div></section>"""

def crumbs(r, items):
    home_ic = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 9 10 3.5 16.5 9v7.5h-4.5V12H8v4.5H3.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    li = "".join((f'<li><a href="{r}{href}">{home_ic if n == "Home" else ""}<span>{e(n)}</span></a></li>' if href else f'<li aria-current="page"><span>{e(n)}</span></li>') for n, href in items)
    return f'<nav aria-label="Breadcrumb"><ol class="crumbs">{li}</ol></nav>'

def crumb_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": SITE_URL + "/" + (p or "")} for i, (n, p) in enumerate(items)]}

ORG_LD = {"@context": "https://schema.org", "@type": "Organization", "name": BRAND, "url": SITE_URL + "/", "email": EMAIL,
          "logo": SITE_URL + "/assets/brand/logo.png",
          "description": "AI software, web and app development: AI agents, workflow automation, custom web and mobile apps, data management and enterprise integration.",
          "knowsLanguage": ["en"]}

# ---- small visuals for the bento tiles ----
_I = lambda p: f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'
VIS = {
  "ai-agents": '''<div class="chatv" aria-hidden="true">
    <div class="bub u">Where is order 4471, and can I change the delivery address?</div>
    <div class="bub a">It shipped this morning and arrives Thursday. I updated the address to Harbour Street 12 and sent you a new tracking link.<small>Checked: order system · carrier API</small></div>
    <div class="bub u">Great. Can you also send me the invoice?</div>
    <div class="typing-dots"><i></i><i></i><i></i></div></div>''',
  "workflow-automation": '<div aria-hidden="true"><div class="flowv"><span>' + _I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>') + '</span><span>' + _I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>') + '</span><span>' + _I('<path d="M20 6 9 17l-5-5"/>') + '</span><span>' + _I('<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/>') + '</span><i class="pulse"></i></div><div class="flowv-l"><span>Email</span><span>Extract</span><span>Approve</span><span>ERP</span></div></div>',
  "data-management": '<div class="dedupe" aria-hidden="true"><span><s>NORDWERK METALS GMBH</s></span><span><s>Nordwerk Metal</s></span><span class="keep">Nordwerk Metals</span></div>',
  "web-applications": '<div class="appv" aria-hidden="true"><div class="appv-bar"><i></i><i></i><i></i><span>portal.yourcompany.com</span></div><div class="appv-bd"><div class="appv-nav"><b class="on">Orders</b><b>Invoices</b><b>Support</b></div><div class="appv-main"><div class="appv-h"><span>Your orders</span><em>+ New request</em></div><div class="appv-row"><span><b>#4471</b> 40 units</span><i class="st ok">Shipped</i></div><div class="appv-row"><span><b>#4468</b> 12 units</span><i class="st">Delivered</i></div><div class="appv-row"><span><b>#4502</b> Quote ready</span><i class="st act">Approve</i></div></div></div></div>',
  "mobile-apps": '<div class="phonev" aria-hidden="true"><span class="ok"><i></i>Photo added</span><span class="ok"><i></i>GPS confirmed</span><span class="ok"><i></i>Checklist done</span><span><i></i>Customer signature</span></div>',
  "sap-integration": '''<svg class="hubv" viewBox="0 0 300 110" aria-hidden="true">
    <defs><linearGradient id="hl" x1="0" x2="1"><stop offset="0" style="stop-color:var(--teal-glow)"/><stop offset="1" style="stop-color:var(--coral-glow)"/></linearGradient></defs>
    <path d="M150 55 L40 22 M150 55 L40 88 M150 55 L260 22 M150 55 L260 88" stroke="url(#hl)" stroke-width="2" fill="none" stroke-dasharray="4 5"/>
    <circle cx="150" cy="55" r="22" style="fill:var(--ink)"/><path d="M150 43c.3 3.1 1.8 5.3 6.5 7-4.7 1.7-6.2 3.9-6.5 7-.3-3.1-1.8-5.3-6.5-7 4.7-1.7 6.2-3.9 6.5-7z" style="fill:var(--coral-glow)" transform="translate(0 5)"/>
    <g font-family="Geist, system-ui" font-size="12" fill="#243640" text-anchor="middle">
      <rect x="10" y="10" width="60" height="24" rx="12" fill="#fff" stroke="rgba(14,27,34,.12)"/><text x="40" y="26">ERP</text>
      <rect x="10" y="76" width="60" height="24" rx="12" fill="#fff" stroke="rgba(14,27,34,.12)"/><text x="40" y="92">CRM</text>
      <rect x="230" y="10" width="60" height="24" rx="12" fill="#fff" stroke="rgba(14,27,34,.12)"/><text x="260" y="26">Docs</text>
      <rect x="230" y="76" width="60" height="24" rx="12" fill="#fff" stroke="rgba(14,27,34,.12)"/><text x="260" y="92">APIs</text></g></svg>''',
}
TILE_CLASS = {"ai-agents": "t-agents"}

def bento(r):
    out = []
    for s in SERVICES:
        cls = TILE_CLASS.get(s["slug"], "")
        out.append(f"""<a class="tile glass {cls}" href="{r}services/{s['slug']}.html">
  <div class="tile-vis">{VIS[s['slug']]}</div>
  <h3>{e(s['name'])}</h3><p>{e(s['short'])}</p>
  <span class="link">Learn more <span class="arr">→</span></span></a>""")
    return '<div class="bento">' + "".join(out) + "</div>"

def svc_card(r, s, i):
    return f"""<a class="tile glass" href="{r}services/{s['slug']}.html">
  <div class="tile-vis">{VIS[s['slug']]}</div>
  <h3>{e(s['name'])}</h3><p>{e(s['short'])}</p>
  <span class="link">Learn more <span class="arr">→</span></span></a>"""


def uc_switch(r):
    tabs = "".join(f'<button type="button" role="tab" id="uct-{u["slug"]}" aria-controls="ucp-{u["slug"]}" aria-selected="{"true" if i == 0 else "false"}"{"" if i == 0 else " tabindex=\"-1\""}><span class="uct-ic" aria-hidden="true">{UC_ICONS[u["slug"]]}</span><span class="uct-tx"><b>{e(u["name"])}</b><small>{e(u["label"])}</small></span></button>' for i, u in enumerate(USE_CASES))
    panels = ""
    for i, u in enumerate(USE_CASES):
        panels += f"""<div class="uc-panel" role="tabpanel" id="ucp-{u['slug']}" aria-labelledby="uct-{u['slug']}"{"" if i == 0 else " hidden"}>
  <div class="uc-copy"><div><h3>{e(u['name'])}</h3><p>{e(u['lede'])}</p></div><a class="btn btn-glass btn-sm" href="{r}use-cases/{u['slug']}.html">Open full page <span class="arr">→</span></a></div>
  {DEMOS[u['slug']]()}
</div>"""
    return f'<div class="uc-switch"><div class="uc-tabs glass-strong" role="tablist" aria-label="Live demos">{tabs}</div>{panels}</div>'

def uc_card(r, u):
    return f"""<a class="related glass-card" href="{r}use-cases/{u['slug']}.html"><b>{e(u['name'])} demo</b><span>{e(u['card'])}</span></a>"""

PROCESS = """<div class="steps">
  <div class="step glass"><div class="step-dot">1</div><h3>Discover</h3><div class="dur">About 1 week</div><p>We map the process, the data and the success metric, and agree on what to build first.</p></div>
  <div class="step glass"><div class="step-dot">2</div><h3>Prototype</h3><div class="dur">2–3 weeks</div><p>A working prototype on your real data that proves the idea before larger spend.</p></div>
  <div class="step glass"><div class="step-dot">3</div><h3>Build</h3><div class="dur">Two-week sprints</div><p>Production code with a demo at the end of every sprint.</p></div>
  <div class="step glass"><div class="step-dot">4</div><h3>Integrate</h3><div class="dur">In parallel</div><p>Connections to your business systems, plus security review and user testing.</p></div>
  <div class="step glass"><div class="step-dot">5</div><h3>Operate</h3><div class="dur">Ongoing</div><p>Monitoring, model evaluation and support, so quality holds up after launch.</p></div>
</div>"""

def contact_block(heading_tag="h2"):
    opts = "".join(f"<option>{e(s['name'])}</option>" for s in SERVICES) + "<option>Not sure yet</option>"
    return f"""<div class="contact">
  <div class="contact-copy">
    <{heading_tag}>Have a process that <em>should</em> run itself?</{heading_tag}>
    <p>Tell us what you want to automate or build. We reply within one business day with first ideas and a proposed next step.</p>
    <div class="mail"><code id="mail">{EMAIL}</code><button class="btn btn-glass btn-sm" id="copy" type="button">Copy email</button></div>
  </div>
  <form class="lead glass-strong" method="POST" action="/api/contact" novalidate data-mail="{EMAIL}">
    <p hidden><label>Leave this empty<input name="company-website" tabindex="-1" autocomplete="off"></label></p>
    <div class="row2">
      <label for="f-name">Name<input id="f-name" name="name" autocomplete="name" placeholder="Jane Doe"></label>
      <label for="f-email">Work email<input id="f-email" name="email" type="email" autocomplete="email" placeholder="jane@company.com"></label>
    </div>
    <label for="f-company">Company<input id="f-company" name="company" autocomplete="organization" placeholder="Acme Inc."></label>
    <label for="f-topic">What do you need?<select id="f-topic" name="topic">{opts}</select></label>
    <label for="f-msg">Project details<textarea id="f-msg" name="message" placeholder="What process, which systems, and what would success look like?"></textarea></label>
    <button class="btn btn-primary" type="submit" style="justify-self:start">Send request <span class="arr">→</span></button>
    <p class="note" id="note" role="status">We use your details only to reply to this request.</p>
  </form>
</div>"""

def page(r, path, title, meta, active, body, schema=None, demo=False):
    return head(r, path, title, meta, schema, demo) + nav(r, active) + f'\n<main id="main">\n{body}\n</main>\n' + footer(r, demo)

def page_hero(r, items, h1, lede, extra="", side=""):
    solo = "" if side else " solo"
    return f"""<header class="page-hero{solo}"><div class="wrap">
  <div>{crumbs(r, items)}<h1>{h1}{SPG()}</h1><p class="lede">{lede}</p>{extra}</div>{side}
</div></header>"""

# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
PROMPTS = [
  dict(q="Automate our invoice approvals", title="An invoice agent that reads, matches and routes", slug="workflow-automation",
       steps=["Read invoices from the inbox and extract line items", "Match each invoice to its purchase order and contract price", "Post clean invoices to your ERP and route exceptions to Finance"],
       time="Prototype in 3–4 weeks"),
  dict(q="Answer customer questions 24/7", title="A support agent that knows your orders and policies", slug="ai-agents",
       steps=["Connect the agent to your help center, orders and CRM", "Answer routine questions and take simple actions, with sources", "Hand complex cases to your team with a summary"],
       time="Prototype in 4–6 weeks"),
  dict(q="Clean up our supplier data", title="One trusted record for every supplier", slug="data-management",
       steps=["Find and merge duplicate suppliers across systems", "Fill gaps such as certificates, contacts and contract dates", "Keep the record current with automatic quality checks"],
       time="First results in 3 weeks"),
  dict(q="Give our technicians a mobile app", title="A field app with photo proof and offline mode", slug="mobile-apps",
       steps=["Job lists, checklists, photos, GPS and signatures on the phone", "Works without signal and syncs when back online", "Reports flow straight into your back office"],
       time="First release in 8–12 weeks"),
]
ASK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.6 5.8 3.4 9.9 12 12-8.6 2.1-11.4 6.2-12 12-.6-5.8-3.4-9.9-12-12 8.6-2.1 11.4-6.2 12-12z" fill="currentColor"/></svg>'
SEND_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'

def answer_html(p, r=""):
    steps = "".join(f"<li><b>Step {i+1}</b>{e(t)}</li>" for i, t in enumerate(p["steps"]))
    return f"""<div class="answer-h"><span class="orb"></span><span>Here is how we would build it</span></div>
<h2>{e(p['title'])}</h2><ol class="answer-steps">{steps}</ol>
<div class="answer-foot"><span class="tag"><i></i>{e(p['time'])} · {e(SVC[p['slug']]['name'])}</span><a class="link" href="{r}services/{p['slug']}.html">See the service <span class="arr">→</span></a></div>"""

def home():
    r = ""
    chips = "".join(f'<button type="button" data-i="{i}">{e(p["q"])}</button>' for i, p in enumerate(PROMPTS))
    pdata = json.dumps([dict(q=p["q"], title=p["title"], steps=p["steps"], time=p["time"], slug=p["slug"], svc=SVC[p["slug"]]["name"]) for p in PROMPTS])
    body = f"""<header class="hero"><div class="wrap">
  <h1 class="rise">AI that works the way your <span class="soft">team</span> does{SPG()}</h1>
  <p class="lede rise d1">SDA AI Services designs, builds and runs <b>AI agents, automation and custom software</b> for companies that want working systems in production, not slide decks.</p>
  <div class="cta-row rise d2"><a class="btn btn-primary" href="contact.html">Book a discovery call <span class="arr">→</span></a><a class="btn btn-glass" href="use-cases/index.html">Try the live demos</a></div>
  <div class="ask rise d3" id="prompt">
    <form class="ask-bar" id="ask-form" role="search" aria-label="Describe what you want to automate">
      <div class="ask-in">{ASK_ICON}<label for="ask-q" class="skip" style="position:absolute;left:-999px">What should AI do for you?</label>
        <input id="ask-q" name="q" autocomplete="off" placeholder="What should AI do for your business?">
        <button class="ask-go" type="submit" aria-label="Show how we would build it">{SEND_ICON}</button></div>
    </form>
    <div class="ask-chips">{chips}</div>
    <div class="answer glass-strong" id="answer" aria-live="polite">{answer_html(PROMPTS[0])}</div>
    <script type="application/json" id="ask-data">{pdata}</script>
  </div>
</div></header>

<section class="video-sec" aria-label="Video: our services in 35 seconds"><div class="wrap"><figure class="video-wide"><video src="assets/media/sda-ai-services.mp4" poster="assets/media/sda-ai-services.jpg" width="1920" height="1080" muted loop playsinline autoplay controls preload="metadata" aria-label="Video: our services in 35 seconds"></video><figcaption><i class="pulse-dot" aria-hidden="true"></i>Our services in 35 seconds</figcaption></figure></div></section>

<section class="block" id="services"><div class="wrap">
  <div class="sec-head"><h2>Six ways we put AI to work</h2><p>Each engagement goes from first prototype to production code, with the integrations, security and monitoring an operations team needs.</p></div>
  {bento(r)}
</div></section>

<section class="block" id="use-cases" style="padding-top:20px"><div class="wrap">
  <div class="sec-head"><h2>Try it before you talk to us</h2><p>Four working demos of the kind of software we build. Click through them right here: they run in your browser on example data.</p></div>
  {uc_switch(r)}
</div></section>

<section class="block" id="industries" style="padding-top:20px"><div class="wrap">{industries_block(r)}</div></section>

<section class="block" id="process" style="padding-top:20px"><div class="wrap">
  <div class="sec-head"><h2>From idea to production in five steps</h2><p>Short cycles, working software at every checkpoint, and a fixed scope for each phase so budget and timeline stay predictable.</p></div>
  {PROCESS}
</div></section>

<section class="block" id="stack" style="padding-top:20px"><div class="wrap">
  <div class="sec-head"><h2>Built to last, not just to demo</h2><p>We pick models and infrastructure by cost, accuracy and data-protection needs, and we build so your team can run it.</p></div>
  <div class="trust">
    <div class="princ glass">
      <div><span class="pi">{_I('<path d="M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6z"/>')}</span><h3>Enterprise experience</h3><p>Our team has delivered large enterprise projects, so we plan for security, compliance and change management from day one.</p></div>
      <div><span class="pi">{_I('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>')}</span><h3>Your data stays yours</h3><p>Privacy-first architecture, hosting in the environment you choose, and no training on your data without your consent.</p></div>
      <div><span class="pi">{_I('<path d="M4 19V9M10 19V5M16 19v-6M22 19H2"/>')}</span><h3>Measured results</h3><p>Every project starts with a metric, such as hours saved or response time, and we report against it.</p></div>
      <div><span class="pi">{_I('<path d="M8 7 3 12l5 5M16 7l5 5-5 5"/>')}</span><h3>Built to hand over</h3><p>Clean code, documentation and training, so your team can own and extend what we build.</p></div>
    </div>
    <div class="stackc glass"><h3>Proven tools, chosen per project</h3><p>Models, frameworks and platforms we work with every day.</p>
      <ul class="cloud">{''.join(f'<li class="{"k" if k else ""}">{t}</li>' for t, k in [("Claude",1),("GPT",1),("Gemini",1),("Llama",0),("Mistral",0),("RAG",1),("MCP",0),("Vector databases",0),("Evals & tracing",0),("TypeScript",0),("React",0),("Next.js",0),("Python",0),("FastAPI",0),("Flutter",0),("AWS",0),("Azure",0),("Google Cloud",0),("SAP BTP",0),("Docker",0),("Kubernetes",0)])}</ul></div>
  </div>
</div></section>

<section class="block" id="contact" style="padding-top:20px"><div class="wrap">{contact_block()}</div></section>"""
    return page(r, "", f"{BRAND} | AI Software, Web & App Development",
                "SDA AI Services builds AI agents, workflow automation, custom web and mobile apps, data management and enterprise integrations. From prototype to production.",
                "home", body, [ORG_LD, {"@context": "https://schema.org", "@type": "WebSite", "name": BRAND, "url": SITE_URL + "/"}], demo=True)

def services_hub():
    r = "../"
    body = page_hero(r, [("Home", "index.html"), ("Services", None)], "AI software and app development services",
                     "From AI agents to enterprise integration, we cover the full path from idea to production software. Pick a service to see what we deliver, typical projects and answers to common questions.") + f"""
<section class="block" style="padding-top:20px"><div class="wrap">{bento(r)}</div></section>
<section class="block" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2>One process for every service</h2><p>Short cycles and working software at every checkpoint.</p></div>{PROCESS}
</div></section>
{cta_band(r)}"""
    ld = [crumb_ld([("Home", ""), ("Services", "services/")]),
          {"@context": "https://schema.org", "@type": "ItemList", "itemListElement": [
              {"@type": "ListItem", "position": i + 1, "url": f"{SITE_URL}/services/{s['slug']}.html", "name": s["name"]} for i, s in enumerate(SERVICES)]}]
    return page(r, "services/", "AI Software & App Development Services",
                "Overview of SDA AI Services: AI agents, workflow automation, custom web apps, mobile apps, data management and enterprise integration.", "services", body, ld)

def service_page(s):
    r = "../"
    path = f"services/{s['slug']}.html"
    items = [("Home", "index.html"), ("Services", "services/index.html"), (s["name"], None)]
    facts = "".join(f"<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>" for k, v in s["facts"])
    deliver = "".join(f'<div class="glass"><h3>{SP}{e(t)}</h3><p>{e(d)}</p></div>' for t, d in s["deliver"])
    ex = "".join(f"<li><b>{e(t)}</b><span>{e(d)}</span></li>" for t, d in s["examples"])
    faq = "".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q, a in s["faq"])
    others = [x for x in SERVICES if x["slug"] != s["slug"]][:3]
    rel = "".join(f'<a class="glass" href="{x["slug"]}.html"><b>{e(x["name"])}</b><span>{e(x["short"])}</span></a>' for x in others)
    u = UC[s["usecase"]]
    extra = f'<div class="cta-row"><a class="btn btn-primary" href="{r}contact.html">Discuss your project <span class="arr">→</span></a><a class="btn btn-glass" href="{r}use-cases/{u["slug"]}.html">See the {e(u["name"])} demo</a></div>'
    body = page_hero(r, items, e(s["h1"]).rstrip("."), e(s["lede"]), extra, f'<dl class="facts glass-strong">{facts}</dl>') + f"""
<section class="block" style="padding-top:48px"><div class="wrap two">
  <h2>{e(s['title'])}</h2>
  <div class="prose">{''.join(f'<p>{e(p)}</p>' for p in s['intro'])}</div>
</div></section>

<section class="block" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2>What we deliver</h2><p>Choose the parts you need. We can deliver a complete solution or work alongside your own team.</p></div>
  <div class="deliv">{deliver}</div>
</div></section>

<section class="block" style="padding-top:0"><div class="wrap two">
  <div><h2>Where it pays off</h2><p class="intro">Examples of where companies put {e(s['name'])} to work today.</p></div>
  <ul class="ex-list glass">{ex}</ul>
</div></section>

<section class="block" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2>How a project runs</h2><p>Working software at every checkpoint, so you can decide with real results in hand.</p></div>{PROCESS}
</div></section>

<section class="block" style="padding-top:0"><div class="wrap two">
  <h2>Common questions</h2>
  <div class="faq glass">{faq}</div>
</div></section>

<section class="block" style="padding-top:0"><div class="wrap">
  <div class="sec-head left" style="margin-bottom:28px"><h2>Often combined with</h2></div>
  <div class="related">{rel}</div>
</div></section>
{cta_band(r, f"Ready to talk about {e(s['name'])}?")}"""
    ld = [crumb_ld([("Home", ""), ("Services", "services/"), (s["name"], path)]),
          {"@context": "https://schema.org", "@type": "Service", "name": s["title"], "serviceType": s["name"], "description": s["meta"],
           "provider": {"@type": "Organization", "name": BRAND, "url": SITE_URL + "/"}, "areaServed": ["Europe", "United States"], "url": f"{SITE_URL}/{path}"},
          {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
              {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in s["faq"]]}]
    return page(r, path, s["title"], s["meta"], "services", body, ld)

def uc_hub():
    r = "../"
    body = page_hero(r, [("Home", "index.html"), ("Use cases", None)], "See what AI software can do for your team",
                     "Four interactive demos of the software we build. Each runs in your browser on example data, and each can be adapted to your processes and connected to your systems.") + f"""
<section class="block" style="padding-top:20px"><div class="wrap">{uc_switch(r)}</div></section>
{cta_band(r, "Need something similar?", "We adapt these demos to your data, processes and systems, usually starting with a two-week prototype.")}"""
    return page(r, "use-cases/", "AI Software Use Cases & Live Demos",
                "Interactive AI software demos: vendor management, field service with proof of delivery, facility management, and an HR tool. See what SDA AI Services can build for you.",
                "use-cases", body, [crumb_ld([("Home", ""), ("Use cases", "use-cases/")])], demo=True)


def uc_page(u):
    r = "../"
    path = f"use-cases/{u['slug']}.html"
    items = [("Home", "index.html"), ("Use cases", "use-cases/index.html"), (u["name"], None)]
    how = '<div class="howto">' + "".join(f'<div class="glass"><b>{e(t)}</b><span>{e(d)}</span></div>' for t, d in u["how"]) + "</div>"
    rel = "".join(f'<a class="glass" href="{r}services/{k}.html"><b>{e(SVC[k]["name"])}</b><span>{e(SVC[k]["short"])}</span></a>' for k in u["services"])
    others = "".join(f'<a class="glass" href="{r}use-cases/{x["slug"]}.html"><b>{e(x["name"])} demo</b><span>{e(x["card"])}</span></a>' for x in USE_CASES if x["slug"] != u["slug"])
    body = page_hero(r, items, e(u["h1"]).rstrip("."), e(u["lede"]), how) + f"""
<section class="demo-stage"><div class="wrap">{DEMOS[u['slug']]()}
  <p class="note" style="margin-top:16px">This demo runs in your browser with fictional example data. In a real project it connects to your systems and uses a language model for the AI steps.</p>
</div></section>
<section class="block" style="padding-top:20px"><div class="wrap">
  <div class="sec-head left" style="margin-bottom:28px"><h2>Services behind this demo</h2><p>We combine these services to build solutions like this one around your processes.</p></div>
  <div class="related">{rel}</div>
</div></section>
<section class="block" style="padding-top:0"><div class="wrap">
  <div class="sec-head left" style="margin-bottom:28px"><h2>More demos</h2></div>
  <div class="related" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">{others}</div>
</div></section>
{cta_band(r, f"Want this for your {e(u['label'].lower())} team?", "We adapt the demo to your data and systems, usually starting with a two-week prototype.")}"""
    ld = [crumb_ld([("Home", ""), ("Use cases", "use-cases/"), (u["name"], path)]),
          {"@context": "https://schema.org", "@type": "SoftwareApplication", "name": f"{u['name']} demo", "applicationCategory": "BusinessApplication",
           "operatingSystem": "Web", "description": u["meta"], "url": f"{SITE_URL}/{path}", "creator": {"@type": "Organization", "name": BRAND}}]
    return page(r, path, u["title"], u["meta"], "use-cases", body, ld, demo=True)

def contact():
    r = ""
    body = f"""<section class="block" style="padding-top:64px"><div class="wrap">{crumbs(r, [("Home", "index.html"), ("Contact", None)])}{contact_block("h1")}</div></section>"""
    return page(r, "contact.html", "Contact SDA AI Services",
                "Talk to SDA AI Services about your AI, web or app project. We reply within one business day with first ideas and a next step.",
                "contact", body, [ORG_LD])


def simple_page(path, title, meta, h1, body_html, noindex=False):
    r = ""
    hdr = page_hero(r, [("Home", "index.html"), (title, None)], h1, meta)
    body = hdr + f'<section class="block" style="padding-top:12px"><div class="wrap"><div class="prose legal glass">{body_html}</div></div></section>'
    html_ = page(r, path, title, meta, "", body)
    if noindex:
        html_ = html_.replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"', 1)
    return html_

# NOTE: legal texts are templates. Replace every [bracketed] value and have them reviewed before going live.
def privacy():
    return simple_page("privacy.html", "Privacy policy", "How SDA AI Services handles personal data on this website.", "Privacy policy", f"""
<p><b>Last updated:</b> [date]</p>
<h2>Who is responsible</h2><p>[Company legal name], [street], [postal code] [city], [country]. Email: {EMAIL}.</p>
<h2>Data we process</h2><p>When you visit this website, our hosting provider processes technical data such as your IP address, browser type and the pages you request. This is necessary to deliver the website securely (legitimate interest).</p>
<p>When you send the contact form, we process your name, email address, company and message to answer your request. We delete this data when it is no longer needed for that purpose, unless we must keep it by law.</p>
<h2>Demos on this website</h2><p>The interactive demos run entirely in your browser. Text, photos and signatures you enter in a demo are not sent to us or stored.</p>
<h2>Service providers</h2><p>Hosting: [hosting provider and location]. Web fonts: Google Fonts (Google Ireland Ltd.); your browser connects to Google servers to load the fonts. [List any analytics or other tools here, or state that none are used.]</p>
<h2>Your rights</h2><p>You can request access to, correction or deletion of your data, restrict or object to processing, and receive your data in a portable format. You can also complain to a data protection authority. Contact us at {EMAIL}.</p>""")

def legal():
    return simple_page("legal-notice.html", "Legal notice", "Company information for SDA AI Services.", "Legal notice", f"""
<h2>Company</h2><p>[Company legal name]<br>[Street and number]<br>[Postal code, city]<br>[Country]</p>
<h2>Contact</h2><p>Email: {EMAIL}<br>Phone: [phone number]</p>
<h2>Registration</h2><p>Registered at [court or registry], number [registration number]<br>VAT ID: [VAT number]</p>
<h2>Represented by</h2><p>[Managing director name]</p>""")

def thanks():
    return simple_page("thanks.html", "Thank you", "We received your request.", "Thanks, we received your request",
        '<p>We reply within one business day with first ideas and a proposed next step.</p><p><a class="btn btn-primary" href="index.html">Back to the homepage <span class="arr">→</span></a></p>', noindex=True)

def not_found():
    return simple_page("404.html", "Page not found", "This page does not exist.", "This page does not exist",
        '<p>The link may be old or mistyped. Try one of these instead:</p><p><a class="link" href="/index.html">Homepage</a> · <a class="link" href="/services/index.html">Services</a> · <a class="link" href="/use-cases/index.html">Live demos</a> · <a class="link" href="/contact.html">Contact</a></p>', noindex=True)

# --------------------------------------------------------------------------
# Build
# --------------------------------------------------------------------------
def standalone(fragment):
    """Wrap a page fragment into a complete HTML document for hosting."""
    head_part, _, rest = fragment.partition('<a class="skip"')
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            + head_part + '</head>\n<body>\n<a class="skip"' + rest + '\n</body>\n</html>\n')

def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "assets").mkdir(parents=True)
    for f in (ROOT / "src" / "assets").iterdir():
        if f.is_dir():
            shutil.copytree(f, OUT / "assets" / f.name)
        else:
            shutil.copy(f, OUT / "assets" / f.name)
    pages = {"index.html": home(), "contact.html": contact(), "services/index.html": services_hub(), "use-cases/index.html": uc_hub(),
             "privacy.html": privacy(), "legal-notice.html": legal(), "thanks.html": thanks(), "404.html": not_found()}
    for s in SERVICES:
        pages[f"services/{s['slug']}.html"] = service_page(s)
    for u in USE_CASES:
        pages[f"use-cases/{u['slug']}.html"] = uc_page(u)
    for p, frag in pages.items():
        out = OUT / p
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(standalone(frag), encoding="utf-8")
    # preview entry for the claude.ai artifact (skeleton is added by the host)
    # bundle the demos: shared toolkit first, then each demo in site order
    parts = [DEMO_DIR / "_shared"] + [DEMO_DIR / s for s in DEMO_ORDER]
    (OUT / "assets" / "demos.js").write_text("\n".join((d / f).read_text(encoding="utf-8") for d in parts for f in (["shared.js"] if d.name == "_shared" else ["demo.js"])), encoding="utf-8")
    (OUT / "assets" / "demos.css").write_text("\n".join((d / f).read_text(encoding="utf-8") for d in parts for f in (["shared.css"] if d.name == "_shared" else ["demo.css"])), encoding="utf-8")
    (ROOT / "preview.html").write_text(pages["index.html"], encoding="utf-8")
    urls = "".join(f"  <url><loc>{SITE_URL}/{'' if p == 'index.html' else p}</loc></url>\n" for p in pages if p not in ("404.html", "thanks.html"))
    (OUT / "sitemap.xml").write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    shutil.copy(ROOT / "src" / "_headers", OUT / "_headers")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n")
    (OUT / "site.webmanifest").write_text(json.dumps({"name": BRAND, "short_name": "SDA AI", "start_url": "/", "display": "standalone",
        "background_color": "#F7F9F9", "theme_color": "#0D7270", "icons": [
            {"src": "/assets/brand/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/assets/brand/icon-512.png", "sizes": "512x512", "type": "image/png"}]}, indent=2))
    # Cloudflare Pages serves the repository root, so mirror the finished site there as well.
    for item in OUT.iterdir():
        target = ROOT / item.name
        if item.is_dir():
            shutil.copytree(item, target, dirs_exist_ok=True)
        else:
            shutil.copy(item, target)
    print(f"Built {len(pages)} pages into {OUT} and mirrored them to the repository root")

if __name__ == "__main__":
    main()
