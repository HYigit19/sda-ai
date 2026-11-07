"""Markup for the Hr Tool demo. build.py calls markup()."""
from html import escape as e


def markup():
    qs = ["How many vacation days do I get?", "Can I work from home?", "When do I need a sick note?", "How do I claim travel expenses?"]
    return f"""<div class="demo-shell" id="demo-hr">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">People Desk</span><span class="badge">Demo · example data</span></div>
  <div class="demo-body">
    <div class="tabs" role="tablist">
      <button role="tab" aria-selected="true" aria-controls="t-rec" id="tb-rec">Recruiting</button>
      <button role="tab" aria-selected="false" aria-controls="t-leave" id="tb-leave">Leave &amp; absence</button>
      <button role="tab" aria-selected="false" aria-controls="t-ask" id="tb-ask">HR assistant</button>
    </div>
    <div id="t-rec" role="tabpanel" aria-labelledby="tb-rec">
      <div class="toolbar"><label for="role" style="flex-direction:row;display:flex;align-items:center;gap:10px">Open role<select id="role"><option value="fe">Frontend Engineer</option><option value="sm">Sales Manager EMEA</option></select></label><span class="note">Scores compare each CV with the job profile.</span></div>
      <div class="split" style="grid-template-columns:1.25fr 1fr">
        <div class="kanban" id="kanban"></div>
        <aside class="panel" id="cand-detail" aria-live="polite"></aside>
      </div>
    </div>
    <div id="t-leave" role="tabpanel" aria-labelledby="tb-leave" hidden>
      <div class="split">
        <div class="panel"><h3>Pending requests</h3><p class="note" style="margin-top:4px">Team: Customer Success · minimum staffing 3 people</p><div id="leave-list"></div></div>
        <div class="panel"><h3>Team calendar</h3><div style="overflow-x:auto"><div class="cal" id="cal"></div></div>
          <div class="legend"><span><i style="background:var(--cobalt);border-color:var(--cobalt)"></i>Approved</span><span><i style="background:var(--signal);border-color:var(--signal)"></i>Pending</span></div></div>
      </div>
    </div>
    <div id="t-ask" role="tabpanel" aria-labelledby="tb-ask" hidden>
      <div class="panel" style="max-width:760px">
        <div class="chat" id="chat" aria-live="polite"></div>
        <div class="qchips">{''.join(f'<button type="button" data-q="{e(q)}">{e(q)}</button>' for q in qs)}</div>
        <div class="chat-in"><input id="ask" placeholder="Ask an HR question" aria-label="Ask an HR question"><button class="btn btn-ink btn-sm" id="ask-go" type="button">Ask</button></div>
      </div>
    </div>
  </div>
</div>"""
