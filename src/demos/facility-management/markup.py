"""Markup for the Facility Management demo. build.py calls markup()."""
from html import escape as e


def markup():
    samples = ["It's really hot in meeting room B", "Water leaking under the sink in the kitchen", "Lights flickering in Office East", "Loading dock door is stuck open", "Coffee spilled in the lobby"]
    return f"""<div class="demo-shell" id="demo-facility">
  <div class="demo-top"><span class="dots"><i></i><i></i><i></i></span><span class="app">Facility Desk · HQ Building, Floor 1</span><span class="badge">Demo · example data</span></div>
  <div class="demo-body">
    <div class="kpi-row">
      <div class="kpi"><span>Open tickets</span><b id="fk-open">2</b><small>this building</small></div>
      <div class="kpi"><span>Critical</span><b id="fk-crit">1</b><small>response &lt; 1 h</small></div>
      <div class="kpi"><span>Sensors online</span><b>42/42</b><small>temp · humidity · CO₂</small></div>
      <div class="kpi"><span>Energy today</span><b>1,284</b><small>kWh, −6% vs. avg</small></div>
    </div>
    <div class="split">
      <div class="panel">
        <h3>Floor plan</h3>
        <div id="fm-room" style="font-size:13.5px;color:var(--dim);margin-top:4px">Click a room for details. Temperatures update live.</div>
        <div class="fplan" id="fplan"></div>
        <div class="legend"><span><i style="background:var(--cobalt-soft);border-color:#D3DDFB"></i>Normal</span><span><i style="background:var(--warn-soft);border-color:#F3D7A6"></i>Attention</span><span><i style="background:var(--bad-soft);border-color:#F2C2C9"></i>Urgent ticket</span></div>
        <h4>Predictive maintenance</h4>
        <div class="asset"><div>Chiller unit CH-02<small>Compressor vibration rising, service in 9 days</small></div><div class="meter"><i><b style="width:58%;background:var(--warn)"></b></i>58%</div></div>
        <div class="asset"><div>Elevator EL-01<small>Door motor cycles normal</small></div><div class="meter"><i><b style="width:91%;background:var(--ok)"></b></i>91%</div></div>
        <div class="asset"><div>Server room CRAC unit<small>Running at 96% load, check filter</small></div><div class="meter"><i><b style="width:34%;background:var(--bad)"></b></i>34%</div></div>
      </div>
      <div class="panel">
        <h3>Report an issue</h3>
        <label for="fm-text" style="margin-top:12px">Describe the problem<textarea id="fm-text" placeholder="e.g. Water leaking under the sink in the kitchen"></textarea></label>
        <div class="samples">{''.join(f'<button type="button" data-sample="{e(x)}">{e(x)}</button>' for x in samples)}</div>
        <div class="btn-row"><button class="btn btn-ink btn-sm" id="fm-go" type="button">Triage with AI</button></div>
        <div class="ai-box"><div class="ai-h">AI triage</div><div id="fm-ai"><p>Type an issue or pick an example. The assistant sets location, category, priority and team.</p></div></div>
        <h4>Ticket queue</h4>
        <div id="fm-list"></div>
      </div>
    </div>
  </div>
</div>"""
