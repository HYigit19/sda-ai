"""Page content for the Freight Forwarding & Customs demo (used by build.py)."""

ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 14.5h19l-2.2 4.4a1.5 1.5 0 0 1-1.3.8H6a1.5 1.5 0 0 1-1.3-.8z"/><path d="M4.5 14.5v-4h5v4M9.5 14.5v-4h5v4M7 10.5v-4h5v4"/><path d="M16.5 14.5V8h3v6.5"/></svg>'

USE_CASE = dict(slug="freight-forwarding", name="Freight forwarding & customs", label="Logistics",
    title="Freight Forwarding & Customs Clearance Software Demo for UAE Forwarders",
    meta="Try an interactive freight forwarding and customs clearance app for UAE logistics companies: AI document intake, shipment board, customs declarations with duty estimates, Arabic and English customer updates, last-mile delivery and a customer portal.",
    h1="From shipping documents to delivered cargo, in one place.",
    lede="Built for forwarders working with Jebel Ali, Khalifa Port and the free zones: AI reads invoices, packing lists and bills of lading, flags differences, drafts the customs declaration and keeps importers updated in English and Arabic.",
    card="AI document intake, shipment board, customs clearance, bilingual customer updates and last-mile delivery.",
    how=[("Import the documents", "Drop the commercial invoice, packing list, B/L and certificate of origin. AI extracts shipper, consignee, HS codes, weights and containers into a new shipment and flags mismatches for a person to confirm."),
         ("Clear customs", "Operations drafts the declaration with a duty estimate, the customs broker reviews and submits it, and answers customs queries with the right documents attached."),
         ("Update and deliver", "Send the importer a status update in English and Arabic, assign a truck from port to warehouse and capture proof of delivery. Importers follow everything in their own portal.")],
    services=["ai-agents", "workflow-automation", "web-applications"],
    cta="Want this for your forwarding team?")
