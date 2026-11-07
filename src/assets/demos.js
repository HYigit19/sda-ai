/* Interactive demos. All data is fictional example data. */
(function(){
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var usd = function(n){ return '$' + (n>=1e6 ? (n/1e6).toFixed(2)+'M' : Math.round(n/1e3)+'k'); };
  function typeInto(el, html, done){
    // reveal text word by word for an "AI is writing" feel
    var tmp = document.createElement('div'); tmp.innerHTML = html;
    var full = tmp.innerHTML, words = full.split(/(\s+)/), i = 0;
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ el.innerHTML = full; done && done(); return; }
    el.classList.add('typing'); clearInterval(el._t);
    el._t = setInterval(function(){
      i += 3; el.innerHTML = words.slice(0,i).join('');
      if(i >= words.length){ clearInterval(el._t); el.innerHTML = full; el.classList.remove('typing'); done && done(); }
    }, 28);
  }

  (function(){
  /* =================== VENDOR MANAGEMENT =================== */
  var ven = $('#demo-vendor');
  if(ven){
    var TODAY = new Date('2026-11-07T12:00:00');
    var fmtD = function(d){ return d.toISOString().slice(0,10); };
    var addDays = function(n){ var d = new Date(TODAY); d.setDate(d.getDate()+n); return fmtD(d); };
    var daysTo = function(s){ return Math.round((new Date(s+'T12:00:00') - TODAY)/864e5); };
    var S = [
      {n:'Nordwerk Metals', c:'Raw materials', co:'Germany', otd:97, q:96, spend:2410000, price:2, dep:38},
      {n:'Baltic Polymers', c:'Raw materials', co:'Poland', otd:88, q:91, spend:1180000, price:9, dep:22},
      {n:'Kestrel Electronics', c:'Electronics', co:'Taiwan', otd:79, q:94, spend:3050000, price:6, dep:61},
      {n:'Volta Components', c:'Electronics', co:'Czechia', otd:93, q:89, spend:860000, price:3, dep:14},
      {n:'Alpina Logistics', c:'Logistics', co:'Austria', otd:95, q:92, spend:640000, price:4, dep:45},
      {n:'Rheinfracht', c:'Logistics', co:'Germany', otd:84, q:86, spend:520000, price:11, dep:31},
      {n:'Corvex Packaging', c:'Packaging', co:'Netherlands', otd:98, q:97, spend:410000, price:1, dep:18},
      {n:'Medina Cartons', c:'Packaging', co:'Spain', otd:81, q:83, spend:295000, price:7, dep:72}
    ];
    var risk = function(s){
      s.risk = Math.round((100-s.otd)*1.6 + (100-s.q)*1.4 + s.price*1.5 + Math.max(0,s.dep-40)*0.6);
      s.lvl = s.risk>=40 ? 'bad' : s.risk>=25 ? 'warn' : 'ok';
    };
    S.forEach(risk);
    var sup = function(n){ return S.filter(function(x){ return x.n===n; })[0]; };
    var RFQ = [
      {id:'RFQ-1031', item:'Aluminium profiles 6063', qty:'12,000 m', due:addDays(14), sup:['Nordwerk Metals','Baltic Polymers'], status:'Quotes in',
       quotes:[{s:'Nordwerk Metals', price:4.12, lead:14, terms:'30 days'},{s:'Baltic Polymers', price:3.95, lead:21, terms:'45 days'}], units:12000},
      {id:'RFQ-1030', item:'PCB assemblies rev. C', qty:'2,500 pcs', due:addDays(-6), sup:['Kestrel Electronics','Volta Components'], status:'Awarded', award:'Volta Components',
       quotes:[{s:'Kestrel Electronics', price:38.4, lead:35, terms:'60 days'},{s:'Volta Components', price:39.1, lead:18, terms:'30 days'}], units:2500}
    ];
    var CMP = [
      {id:'CMP-208', s:'Kestrel Electronics', part:'PCB lot 22-117', issue:'Solder bridges found on 4% of boards during incoming inspection.', qty:100, cat:'Workmanship', sev:'High', status:'8D requested', created:addDays(-5)},
      {id:'CMP-207', s:'Medina Cartons', part:'Shipping cartons 60x40', issue:'Cartons crushed in transit, product scratched.', qty:340, cat:'Transport damage', sev:'Medium', status:'Closed', created:addDays(-21), rc:'Pallet stacking height exceeded. New packing specification agreed and rolled out.'}
    ];
    var APV = [
      {id:'APV-77', type:'Supplier onboarding', title:'Onboard Volta Components as second source for electronics', by:'Michael Brown', amount:0, steps:['Requested','Procurement','Quality','Approved'], step:1, status:'Pending'},
      {id:'APV-76', type:'Contract renewal', title:'Renew framework agreement with Corvex Packaging for 2 years', by:'Emma Davis', amount:820000, steps:['Requested','Procurement','Finance','Approved'], step:2, status:'Pending'}
    ];
    var DOCS = [
      {n:'ISO 9001 certificate', s:'Nordwerk Metals', t:'Certificate', exp:'2027-03-31'},
      {n:'Framework agreement 2025–2027', s:'Kestrel Electronics', t:'Contract', exp:'2027-06-30'},
      {n:'IATF 16949 certificate', s:'Kestrel Electronics', t:'Certificate', exp:addDays(38)},
      {n:'Non-disclosure agreement', s:'Baltic Polymers', t:'NDA', exp:'2028-01-01'},
      {n:'Price list Q4 2026', s:'Alpina Logistics', t:'Price list', exp:addDays(54)},
      {n:'FSC certificate', s:'Medina Cartons', t:'Certificate', exp:addDays(-7)},
      {n:'Quality agreement', s:'Volta Components', t:'Contract', exp:addDays(23)},
      {n:'Insurance certificate', s:'Rheinfracht', t:'Certificate', exp:'2027-02-28'}
    ];
    var nRfq = 1032, nCmp = 209, nApv = 78;
    var view = 'sup', selSup = 'Kestrel Electronics', selRfq = 'RFQ-1031', selCmp = 'CMP-208', rfqDraft = null, cmpDraft = null, dmsF = {q:'', t:'All', st:'All', s:'All'};
    var lvlTxt = {ok:'Low', warn:'Medium', bad:'High'}, lvlCls = {ok:'p-ok', warn:'p-warn', bad:'p-bad'};
    var barCol = function(v){ return v>=93 ? 'var(--ok)' : v>=85 ? 'var(--warn)' : 'var(--bad)'; };
    var stCls = function(st){ return /Awarded|Closed|Approved|Valid|Renewal requested/.test(st) ? 'p-ok' : /Rejected|Expired|Open/.test(st) ? 'p-bad' : /Draft/.test(st) ? 'p-info' : 'p-warn'; };
    var docState = function(d){ if(d.renew) return 'Renewal requested'; var n = daysTo(d.exp); return n < 0 ? 'Expired' : n <= 60 ? 'Expiring' : 'Valid'; };
    var main = $('#v-main', ven), toastEl = $('#v-toast', ven), toastT;
    var toast = function(t){ toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 2600); };
    var typeVal = function(el, text){ var i = 0; clearInterval(el._t); if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ el.value = text; return; } el._t = setInterval(function(){ i += 4; el.value = text.slice(0, i); if(i >= text.length){ clearInterval(el._t); el.value = text; } }, 16); };
    var supOpts = function(sel){ return S.map(function(s){ return '<option'+(s.n===sel?' selected':'')+'>'+esc(s.n)+'</option>'; }).join(''); };

    function counts(){
      var c = {
        rfq: RFQ.filter(function(r){ return !/Awarded|Closed/.test(r.status); }).length,
        cmp: CMP.filter(function(r){ return r.status!=='Closed'; }).length,
        apv: APV.filter(function(r){ return r.status==='Pending'; }).length,
        dms: DOCS.filter(function(d){ return /Expired|Expiring/.test(docState(d)); }).length
      };
      ven.querySelectorAll('[data-v]').forEach(function(b){
        var k = b.dataset.v, el = $('.cnt', b);
        if(el){ el.textContent = c[k] || ''; el.hidden = !c[k]; }
        b.setAttribute('aria-selected', k===view);
      });
    }
    function go(v){ view = v; counts(); render(); main.scrollTop = 0; }

    /* ---- suppliers ---- */
    var supQ = '', supCat = 'All';
    function vSup(){
      var L = S.filter(function(s){ return (supCat==='All'||s.c===supCat) && (s.n+' '+s.co).toLowerCase().indexOf(supQ.toLowerCase())>-1; });
      var s = sup(selSup);
      var rows = L.map(function(x){
        return '<tr data-n="'+esc(x.n)+'" tabindex="0" class="'+(x.n===selSup?'sel':'')+'"><td><b>'+esc(x.n)+'</b><span class="sub">'+esc(x.co)+'</span></td><td>'+esc(x.c)+'</td>'+
          '<td><div class="meter">'+x.otd+'%<i><b style="width:'+x.otd+'%;background:'+barCol(x.otd)+'"></b></i></div></td>'+
          '<td><div class="meter">'+x.q+'<i><b style="width:'+x.q+'%;background:'+barCol(x.q)+'"></b></i></div></td>'+
          '<td>'+usd(x.spend)+'</td><td><span class="pill '+lvlCls[x.lvl]+'">'+lvlTxt[x.lvl]+' · '+x.risk+'</span></td></tr>';
      }).join('') || '<tr><td colspan="6" class="empty">No suppliers match. Clear the search or pick All.</td></tr>';
      var pts = [];
      if(s.otd<90) pts.push('On-time delivery is <b>'+s.otd+'%</b>, below the 90% target.');
      if(s.q<90) pts.push('Quality score <b>'+s.q+'</b> points to recurring defects.');
      if(s.price>=6) pts.push('Price volatility of <b>'+s.price+'%</b> exceeds the category average.');
      if(s.dep>=50) pts.push('<b>'+s.dep+'%</b> of category spend sits with this supplier.');
      var openC = CMP.filter(function(c){ return c.s===s.n && c.status!=='Closed'; }).length;
      if(openC) pts.push('<b>'+openC+'</b> open complaint'+(openC>1?'s':'')+'.');
      var ex = DOCS.filter(function(d){ return d.s===s.n && /Expired|Expiring/.test(docState(d)); });
      if(ex.length) pts.push(esc(ex[0].n)+' is <b>'+docState(ex[0]).toLowerCase()+'</b>.');
      if(!pts.length) pts.push('Stable across delivery, quality and price. No action needed.');
      var act = s.lvl==='bad' ? 'Qualify a second source and agree a corrective-action plan.' : s.lvl==='warn' ? 'Schedule a quarterly review with improvement targets.' : 'Consider a longer framework agreement for better prices.';
      return '<div class="v-head"><h3>Suppliers</h3><div class="toolbar" style="margin:0"><input type="search" id="v-sq" placeholder="Search supplier or country" aria-label="Search suppliers" value="'+esc(supQ)+'"><select id="v-sc" aria-label="Category">'+
        ['All','Raw materials','Electronics','Logistics','Packaging'].map(function(c){ return '<option'+(c===supCat?' selected':'')+'>'+c+'</option>'; }).join('')+'</select></div></div>'+
        '<div class="split"><div class="tbl-wrap"><table><thead><tr><th>Supplier</th><th>Category</th><th>On-time</th><th>Quality</th><th>Spend / yr</th><th>Risk</th></tr></thead><tbody id="v-rows">'+rows+'</tbody></table></div>'+
        '<aside class="panel"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><h3>'+esc(s.n)+'</h3><div style="color:var(--dim);font-size:13.5px">'+esc(s.c)+' · '+esc(s.co)+'</div></div><span class="pill '+lvlCls[s.lvl]+'">'+lvlTxt[s.lvl]+' risk</span></div>'+
        '<div class="ai-box"><div class="ai-h">AI risk analysis</div><ul><li>'+pts.join('</li><li>')+'</li></ul><p style="margin-top:8px"><b>Recommended:</b> '+act+'</p></div>'+
        '<div class="btn-row"><button class="btn btn-ink btn-sm" data-act="new-rfq" type="button">Create RFQ</button><button class="btn btn-ghost btn-sm" data-act="new-cmp" type="button">Log complaint</button><button class="btn btn-ghost btn-sm" data-act="docs" type="button">Documents</button></div></aside></div>';
    }

    /* ---- RFQs ---- */
    function rfqList(){
      return '<div class="v-list">'+'<button type="button" class="v-item new" data-rfq="new">+ New RFQ</button>'+RFQ.map(function(r){
        return '<button type="button" class="v-item'+(r.id===selRfq?' sel':'')+'" data-rfq="'+r.id+'"><span class="v-id">'+r.id+'</span><b>'+esc(r.item)+'</b><span class="pill '+stCls(r.status)+'">'+r.status+'</span></button>';
      }).join('')+'</div>';
    }
    function rfqForm(){
      var d = rfqDraft || {};
      var cat = d.cat || 'Raw materials';
      var boxes = S.map(function(s){ var on = d.sup ? d.sup.indexOf(s.n)>-1 : s.c===cat; return '<label class="chk"><input type="checkbox" value="'+esc(s.n)+'"'+(on?' checked':'')+'> '+esc(s.n)+' <small>'+esc(s.c)+'</small></label>'; }).join('');
      return '<div class="panel"><h3>New request for quotation</h3>'+
        '<div class="row2" style="margin-top:14px"><label for="r-item">Item<input id="r-item" value="'+esc(d.item||'')+'" placeholder="e.g. Stainless steel sheets 2 mm"></label><label for="r-qty">Quantity<input id="r-qty" value="'+esc(d.qty||'')+'" placeholder="e.g. 5,000 kg"></label></div>'+
        '<label for="r-due" style="margin-top:12px">Quotes due<input id="r-due" type="date" value="'+(d.due||addDays(14))+'"></label>'+
        '<h4>Invite suppliers</h4><div class="chks">'+boxes+'</div>'+
        '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-ai">Draft text with AI</button></div>'+
        '<label for="r-msg" style="margin-top:12px">Message to suppliers<textarea id="r-msg" placeholder="Click “Draft text with AI” or write your own.">'+esc(d.msg||'')+'</textarea></label>'+
        '<p class="note" id="r-note" role="status"></p>'+
        '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="rfq-send">Send RFQ</button><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-cancel">Cancel</button></div></div>';
    }
    function rfqDetail(r){
      var q = r.quotes.length ? '<div class="tbl-wrap" style="margin-top:12px"><table style="min-width:480px"><thead><tr><th>Supplier</th><th>Unit price</th><th>Total</th><th>Lead time</th><th>Terms</th><th></th></tr></thead><tbody>'+
        r.quotes.map(function(x){
          var canAward = r.status==='Quotes in';
          return '<tr style="cursor:default"><td><b>'+esc(x.s)+'</b>'+(r.award===x.s?' <span class="pill p-ok">Awarded</span>':'')+'</td><td>$'+x.price.toFixed(2)+'</td><td>'+usd(x.price*r.units)+'</td><td>'+x.lead+' days</td><td>'+x.terms+'</td><td>'+(canAward?'<button class="btn btn-ink btn-sm" type="button" data-award="'+esc(x.s)+'">Award</button>':'')+'</td></tr>';
        }).join('')+'</tbody></table></div>' : '';
      var waiting = r.sup.filter(function(s){ return !r.quotes.some(function(x){ return x.s===s; }); });
      return '<div class="panel"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="v-id">'+r.id+'</span><h3>'+esc(r.item)+'</h3><div style="color:var(--dim);font-size:14px">'+esc(r.qty)+' · quotes due '+r.due+'</div></div><span class="pill '+stCls(r.status)+'">'+r.status+'</span></div>'+
        '<div class="v-steps">'+['Sent','Quotes in','Awaiting approval','Awarded'].map(function(st, i){ var order = ['Sent','Quotes in','Awaiting approval','Awarded'].indexOf(r.status); return '<span class="'+(i<=order?'done':'')+'">'+st+'</span>'; }).join('')+'</div>'+
        (waiting.length && r.status==='Sent' ? '<p class="note" style="margin-top:10px">Waiting for quotes from '+waiting.map(esc).join(', ')+'…</p>' : '')+ q +
        (r.quotes.length>1 && r.status==='Quotes in' ? '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="rfq-compare">Compare with AI</button></div><div id="r-ai"></div>' : '')+
        (r.status==='Awaiting approval' ? '<div class="ai-box"><div class="ai-h">Workflow</div>Award to <b>'+esc(r.pending)+'</b> is waiting for approval. <button class="btn btn-ink btn-sm" type="button" data-act="to-apv" style="margin-left:6px">Open approvals</button></div>' : '')+
        (r.status==='Awarded' ? '<div class="ai-box"><div class="ai-h">Done</div>Purchase order issued to <b>'+esc(r.award)+'</b>. The supplier has been notified.</div>' : '')+'</div>';
    }
    function vRfq(){
      var r = RFQ.filter(function(x){ return x.id===selRfq; })[0];
      return '<div class="v-head"><h3>Requests for quotation</h3></div><div class="v-two">'+rfqList()+'<div>'+(selRfq==='new'||!r ? rfqForm() : rfqDetail(r))+'</div></div>';
    }
    function quoteArrival(r){
      r.sup.forEach(function(name, i){
        setTimeout(function(){
          var s = sup(name), base = 3 + (name.length % 7) * 0.9;
          r.quotes.push({s:name, price:+(base * (1 + s.price/100)).toFixed(2), lead: 10 + (name.length*3) % 25, terms: ['30 days','45 days','60 days'][i%3]});
          if(r.quotes.length === r.sup.length) r.status = 'Quotes in';
          if(view==='rfq'){ render(); }
          counts(); toast('Quote received from '+name);
        }, 1400 + i*1100);
      });
    }

    /* ---- complaints ---- */
    function cmpAnalyze(text){
      var cat = /crack|scratch|dent|crush|transit|damag/i.test(text) ? 'Transport damage' : /solder|weld|assembly|bridge|workmanship/i.test(text) ? 'Workmanship' : /dimension|size|toleran|mm/i.test(text) ? 'Dimensional' : /label|document|certificate|paper/i.test(text) ? 'Documentation' : /wrong|missing|quantity|short/i.test(text) ? 'Wrong or missing delivery' : 'Material defect';
      var sev = /safety|all|100%|recall|stop|line down|critical/i.test(text) ? 'Critical' : /\d+%|several|batch|lot|crack|bridge/i.test(text) ? 'High' : 'Medium';
      return {cat:cat, sev:sev};
    }
    function vCmp(){
      var c = CMP.filter(function(x){ return x.id===selCmp; })[0];
      var list = '<div class="v-list"><button type="button" class="v-item new" data-cmp="new">+ New complaint</button>'+CMP.map(function(x){
        return '<button type="button" class="v-item'+(x.id===selCmp?' sel':'')+'" data-cmp="'+x.id+'"><span class="v-id">'+x.id+' · '+esc(x.s)+'</span><b>'+esc(x.part)+'</b><span class="pill '+stCls(x.status)+'">'+x.status+'</span></button>';
      }).join('')+'</div>';
      var right;
      if(selCmp==='new' || !c){
        var d = cmpDraft || {};
        right = '<div class="panel"><h3>Log a supplier complaint</h3>'+
          '<div class="row2" style="margin-top:14px"><label for="c-sup">Supplier<select id="c-sup">'+supOpts(d.s||selSup)+'</select></label><label for="c-part">Part or lot<input id="c-part" value="'+esc(d.part||'')+'" placeholder="e.g. Housing A-200, lot 4471"></label></div>'+
          '<label for="c-issue" style="margin-top:12px">What is wrong?<textarea id="c-issue" placeholder="e.g. 12% of housings have cracks at the mounting point">'+esc(d.issue||'')+'</textarea></label>'+
          '<label for="c-qty" style="margin-top:12px">Affected quantity<input id="c-qty" type="number" min="1" value="'+(d.qty||'')+'" placeholder="e.g. 240"></label>'+
          '<div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="cmp-ai">Analyze with AI</button></div><div id="c-ai"></div><p class="note" id="c-note" role="status"></p>'+
          '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-act="cmp-create">Create complaint</button></div></div>';
      } else {
        var flow = ['Open','8D requested','Root cause received','Closed'], at = flow.indexOf(c.status);
        var btn = c.status==='Open' ? '<button class="btn btn-ink btn-sm" type="button" data-act="cmp-8d">Send 8D request to supplier</button>' :
                  c.status==='8D requested' ? '<button class="btn btn-ink btn-sm" type="button" data-act="cmp-reply">Simulate supplier reply</button>' :
                  c.status==='Root cause received' ? '<button class="btn btn-ink btn-sm" type="button" data-act="cmp-close">Accept and close</button>' : '';
        right = '<div class="panel"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="v-id">'+c.id+' · created '+c.created+'</span><h3>'+esc(c.part)+'</h3><div style="color:var(--dim);font-size:14px">'+esc(c.s)+' · '+c.qty+' pcs affected</div></div><span class="pill '+stCls(c.status)+'">'+c.status+'</span></div>'+
          '<div class="v-steps">'+flow.map(function(st,i){ return '<span class="'+(i<=at?'done':'')+'">'+st+'</span>'; }).join('')+'</div>'+
          '<p style="margin-top:12px">'+esc(c.issue)+'</p>'+
          '<div class="ai-box"><div class="ai-h">AI classification</div>Category <b>'+c.cat+'</b> · severity <b>'+c.sev+'</b>. Suggested containment: block remaining stock of '+esc(c.part)+' and run a 100% check on the next delivery.</div>'+
          (c.rc ? '<div class="ai-box" style="margin-top:10px"><div class="ai-h">Supplier root cause</div>'+esc(c.rc)+'</div>' : '')+
          '<div id="c-draft"></div><div class="btn-row">'+btn+'</div></div>';
      }
      return '<div class="v-head"><h3>Complaints</h3></div><div class="v-two">'+list+'<div>'+right+'</div></div>';
    }

    /* ---- approvals ---- */
    function vApv(){
      var cards = APV.map(function(a){
        var steps = a.steps.map(function(st, i){ return '<span class="'+(i<a.step || a.status==='Approved' ? 'done' : i===a.step && a.status==='Pending' ? 'cur' : '')+'">'+st+'</span>'; }).join('');
        return '<div class="panel apv"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><div><span class="v-id">'+a.id+' · '+a.type+'</span><h3 style="font-size:17px">'+esc(a.title)+'</h3><div style="color:var(--dim);font-size:13.5px">Requested by '+esc(a.by)+(a.amount?' · '+usd(a.amount):'')+'</div></div><span class="pill '+stCls(a.status)+'">'+a.status+'</span></div>'+
          '<div class="v-steps">'+steps+'</div>'+
          (a.status==='Pending' ? '<div class="btn-row"><button class="btn btn-ink btn-sm" type="button" data-apv="'+a.id+'" data-d="ok">Approve '+a.steps[a.step].toLowerCase()+' step</button><button class="btn btn-ghost btn-sm" type="button" data-apv="'+a.id+'" data-d="no">Reject</button></div>' : '')+'</div>';
      }).join('');
      return '<div class="v-head"><h3>Approval workflows</h3><span class="note">Each request moves through its steps. Approve to see it advance.</span></div><div class="apv-list">'+cards+'</div>';
    }
    function decide(id, ok){
      var a = APV.filter(function(x){ return x.id===id; })[0];
      if(!ok){ a.status = 'Rejected'; if(a.rfq){ var r = RFQ.filter(function(x){ return x.id===a.rfq; })[0]; r.status='Quotes in'; delete r.pending; } toast(a.id+' rejected'); }
      else {
        a.step++;
        if(a.step >= a.steps.length-1){ a.status = 'Approved'; a.step = a.steps.length-1;
          if(a.rfq){ var r2 = RFQ.filter(function(x){ return x.id===a.rfq; })[0]; r2.status='Awarded'; r2.award=r2.pending; toast('Approved. Purchase order sent to '+r2.award+'.'); }
          else toast(a.id+' fully approved');
        } else toast('Approved. Next step: '+a.steps[a.step]);
      }
      counts(); render();
    }

    /* ---- documents (DMS) ---- */
    var SUMMARY = {
      'Certificate':'Valid certification for the scope listed. Issued by an accredited body. Renewal audit required before expiry.',
      'Contract':'Framework terms: 30-day payment, annual price review capped at 3%, 12-month warranty, termination with 6 months notice.',
      'NDA':'Mutual confidentiality for 5 years, covers drawings and pricing, governed by local law.',
      'Price list':'Rates valid until the expiry date. Fuel surcharge applies above index level 120.',
      'Other':'Document filed. No key dates detected.'
    };
    function vDms(){
      var L = DOCS.filter(function(d){
        var st = docState(d);
        return (dmsF.t==='All'||d.t===dmsF.t) && (dmsF.s==='All'||d.s===dmsF.s) && (dmsF.st==='All'||st===dmsF.st) && (d.n+' '+d.s).toLowerCase().indexOf(dmsF.q.toLowerCase())>-1;
      });
      var rows = L.map(function(d){
        var st = docState(d), i = DOCS.indexOf(d);
        return '<tr style="cursor:default"><td><b>'+esc(d.n)+'</b>'+(d.isNew?' <span class="pill p-info">New</span>':'')+'<span class="sub">'+esc(d.file||'PDF')+'</span></td><td>'+esc(d.s)+'</td><td>'+d.t+'</td><td>'+d.exp+'</td><td><span class="pill '+stCls(st==='Expiring'?'Pending':st)+'">'+st+'</span></td>'+
          '<td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" type="button" data-sum="'+i+'">Summarize</button>'+(/Expired|Expiring/.test(st)?' <button class="btn btn-ink btn-sm" type="button" data-renew="'+i+'">Renew</button>':'')+'</td></tr>';
      }).join('') || '<tr><td colspan="6" class="empty">No documents match these filters.</td></tr>';
      var sel = function(id, arr, val, label){ return '<select id="'+id+'" aria-label="'+label+'">'+arr.map(function(x){ return '<option'+(x===val?' selected':'')+'>'+esc(x)+'</option>'; }).join('')+'</select>'; };
      return '<div class="v-head"><h3>Documents</h3><span class="note">Certificates, contracts and price lists with expiry tracking.</span></div>'+
        '<label class="drop-zone" for="d-file"><input type="file" id="d-file" multiple><b>Upload documents</b><span>Drop files here or click. AI files them by type, supplier and expiry date.</span></label>'+
        '<div class="toolbar" style="margin-top:14px"><input type="search" id="d-q" placeholder="Search documents" aria-label="Search documents" value="'+esc(dmsF.q)+'">'+
        sel('d-t',['All','Certificate','Contract','NDA','Price list','Other'],dmsF.t,'Type')+sel('d-s',['All'].concat(S.map(function(s){return s.n;})).concat(['Unassigned']),dmsF.s,'Supplier')+sel('d-st',['All','Valid','Expiring','Expired','Renewal requested'],dmsF.st,'Status')+'</div>'+
        '<div class="tbl-wrap"><table><thead><tr><th>Document</th><th>Supplier</th><th>Type</th><th>Expires</th><th>Status</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div id="d-out"></div>';
    }
    function fileIn(files){
      [].forEach.call(files, function(f){
        var n = f.name.toLowerCase();
        var t = /cert|iso|iatf|fsc/.test(n) ? 'Certificate' : /contract|agreement|framework|vertrag/.test(n) ? 'Contract' : /nda|confiden/.test(n) ? 'NDA' : /price|preis|rate/.test(n) ? 'Price list' : 'Other';
        var s = S.filter(function(x){ return n.indexOf(x.n.split(' ')[0].toLowerCase())>-1; })[0];
        DOCS.unshift({n:f.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' '), s:s?s.n:'Unassigned', t:t, exp:addDays(365), file:f.name+' · '+Math.max(1,Math.round(f.size/1024))+' KB', isNew:true});
      });
      toast(files.length+' document'+(files.length>1?'s':'')+' filed by AI');
      counts(); render();
    }

    /* ---- render + events ---- */
    function render(){
      main.innerHTML = view==='sup' ? vSup() : view==='rfq' ? vRfq() : view==='cmp' ? vCmp() : view==='apv' ? vApv() : vDms();
    }
    ven.querySelectorAll('[data-v]').forEach(function(b){ b.addEventListener('click', function(){ go(b.dataset.v); }); });
    main.addEventListener('input', function(e){
      var t = e.target;
      if(t.id==='v-sq'){ supQ = t.value; var p = t.selectionStart; render(); var n = $('#v-sq', ven); n.focus(); n.setSelectionRange(p,p); }
      if(t.id==='d-q'){ dmsF.q = t.value; var p2 = t.selectionStart; render(); var n2 = $('#d-q', ven); n2.focus(); n2.setSelectionRange(p2,p2); }
    });
    main.addEventListener('change', function(e){
      var t = e.target;
      if(t.id==='v-sc'){ supCat = t.value; render(); }
      if(t.id==='d-t'){ dmsF.t = t.value; render(); } if(t.id==='d-s'){ dmsF.s = t.value; render(); } if(t.id==='d-st'){ dmsF.st = t.value; render(); }
      if(t.id==='d-file' && t.files.length){ fileIn(t.files); }
    });
    main.addEventListener('dragover', function(e){ var z = e.target.closest('.drop-zone'); if(z){ e.preventDefault(); z.classList.add('over'); } });
    main.addEventListener('dragleave', function(e){ var z = e.target.closest('.drop-zone'); if(z) z.classList.remove('over'); });
    main.addEventListener('drop', function(e){ var z = e.target.closest('.drop-zone'); if(z){ e.preventDefault(); z.classList.remove('over'); if(e.dataTransfer.files.length) fileIn(e.dataTransfer.files); } });
    var readRfq = function(){ return {item:$('#r-item',ven).value.trim(), qty:$('#r-qty',ven).value.trim(), due:$('#r-due',ven).value, msg:$('#r-msg',ven).value, sup:[].map.call(ven.querySelectorAll('.chks input:checked'), function(x){ return x.value; })}; };
    main.addEventListener('keydown', function(e){ var tr = e.target.closest('tr[data-n]'); if(tr && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); selSup = tr.dataset.n; render(); } });
    main.addEventListener('click', function(e){
      var t = e.target.closest('button, tr[data-n]'); if(!t) return;
      if(t.matches('tr[data-n]')){ selSup = t.dataset.n; render(); return; }
      var a = t.dataset.act;
      if(t.dataset.rfq){ selRfq = t.dataset.rfq; if(selRfq==='new') rfqDraft = null; render(); return; }
      if(t.dataset.cmp){ selCmp = t.dataset.cmp; if(selCmp==='new') cmpDraft = null; render(); return; }
      if(t.dataset.apv){ decide(t.dataset.apv, t.dataset.d==='ok'); return; }
      if(t.dataset.award){
        var r = RFQ.filter(function(x){ return x.id===selRfq; })[0], q = r.quotes.filter(function(x){ return x.s===t.dataset.award; })[0];
        r.status = 'Awaiting approval'; r.pending = q.s;
        APV.unshift({id:'APV-'+(nApv++), type:'Purchase order', title:'Award '+r.item+' to '+q.s, by:'You', amount:Math.round(q.price*r.units), steps:['Requested','Procurement','Finance','Approved'], step:1, status:'Pending', rfq:r.id});
        toast('Sent to the approval workflow'); counts(); render(); return;
      }
      if(t.dataset.sum!=null){ var d = DOCS[+t.dataset.sum], out = $('#d-out', ven); out.innerHTML = '<div class="ai-box"><div class="ai-h">AI summary · '+esc(d.n)+'</div><div id="d-sum"></div></div>'; typeInto($('#d-sum', ven), esc(SUMMARY[d.t])+' Expires <b>'+d.exp+'</b>.'); out.scrollIntoView({block:'nearest'}); return; }
      if(t.dataset.renew!=null){ var d2 = DOCS[+t.dataset.renew]; d2.renew = true; render(); var o = $('#d-out', ven); o.innerHTML = '<div class="draft" id="d-mail"></div>'; typeInto($('#d-mail', ven), esc('To: '+d2.s+'\nSubject: Renewal of '+d2.n+'\n\nHello,\n\nour records show that your '+d2.n+' expires on '+d2.exp+'. Please upload the renewed document to our supplier portal within 14 days.\n\nThank you,\nProcurement')); counts(); toast('Renewal request sent to '+d2.s); return; }
      switch(a){
        case 'new-rfq': rfqDraft = {cat: sup(selSup).c, sup: S.filter(function(x){ return x.c===sup(selSup).c && x.n!==selSup; }).map(function(x){ return x.n; })}; selRfq = 'new'; go('rfq'); break;
        case 'new-cmp': cmpDraft = {s: selSup}; selCmp = 'new'; go('cmp'); break;
        case 'docs': dmsF = {q:'', t:'All', st:'All', s:selSup}; go('dms'); break;
        case 'to-apv': go('apv'); break;
        case 'rfq-cancel': selRfq = RFQ[0].id; render(); break;
        case 'rfq-ai':
          var d3 = readRfq();
          if(!d3.item){ $('#r-note',ven).className='note err'; $('#r-note',ven).textContent='Add the item first, so the AI knows what to ask for.'; $('#r-item',ven).focus(); break; }
          rfqDraft = d3; typeVal($('#r-msg', ven), 'Dear supplier,\n\nwe invite you to quote for '+d3.item+(d3.qty?' ('+d3.qty+')':'')+'.\n\nPlease include unit price, lead time, payment terms and any minimum order quantity. Delivery DAP to our main plant.\n\nQuotes are due by '+d3.due+'.\n\nKind regards,\nProcurement');
          break;
        case 'rfq-send':
          var d4 = readRfq(), note = $('#r-note', ven);
          if(!d4.item){ note.className='note err'; note.textContent='Add the item you need quotes for.'; $('#r-item',ven).focus(); break; }
          if(!d4.sup.length){ note.className='note err'; note.textContent='Select at least one supplier to invite.'; break; }
          var nr = {id:'RFQ-'+(nRfq++), item:d4.item, qty:d4.qty||'1 lot', due:d4.due, sup:d4.sup, status:'Sent', quotes:[], units: parseInt((d4.qty||'1000').replace(/\D/g,''),10) || 1000};
          RFQ.unshift(nr); selRfq = nr.id; rfqDraft = null; counts(); render(); toast(nr.id+' sent to '+nr.sup.length+' supplier'+(nr.sup.length>1?'s':'')); quoteArrival(nr);
          break;
        case 'rfq-compare':
          var r3 = RFQ.filter(function(x){ return x.id===selRfq; })[0];
          var scored = r3.quotes.map(function(x){ var s = sup(x.s), minP = Math.min.apply(null, r3.quotes.map(function(y){return y.price;})), minL = Math.min.apply(null, r3.quotes.map(function(y){return y.lead;}));
            return {x:x, score: Math.round((minP/x.price)*50 + (minL/x.lead)*25 + (100-s.risk)/4)}; }).sort(function(a,b){ return b.score-a.score; });
          var best = scored[0];
          typeInto($('#r-ai', ven), '<div class="ai-box"><div class="ai-h">AI recommendation</div><ul>'+scored.map(function(s){ return '<li><b>'+esc(s.x.s)+'</b>: score '+s.score+' ($'+s.x.price.toFixed(2)+', '+s.x.lead+' days, '+lvlTxt[sup(s.x.s).lvl].toLowerCase()+' supplier risk)</li>'; }).join('')+'</ul><p style="margin-top:8px"><b>Recommended:</b> award to '+esc(best.x.s)+'. It balances price, lead time and supplier risk best.</p></div>');
          break;
        case 'cmp-ai':
          var txt = $('#c-issue', ven).value;
          if(!txt.trim()){ $('#c-note',ven).className='note err'; $('#c-note',ven).textContent='Describe the problem first.'; $('#c-issue',ven).focus(); break; }
          var an = cmpAnalyze(txt); typeInto($('#c-ai', ven), '<div class="ai-box"><div class="ai-h">AI analysis</div>Category <b>'+an.cat+'</b> · severity <b>'+an.sev+'</b>.<br>Suggested containment: block remaining stock and run a 100% check on the next delivery.</div>');
          break;
        case 'cmp-create':
          var sN = $('#c-sup',ven).value, part = $('#c-part',ven).value.trim(), iss = $('#c-issue',ven).value.trim(), qty = +$('#c-qty',ven).value, cn = $('#c-note', ven);
          if(!part){ cn.className='note err'; cn.textContent='Add the part or lot number.'; $('#c-part',ven).focus(); break; }
          if(!iss){ cn.className='note err'; cn.textContent='Describe what is wrong.'; $('#c-issue',ven).focus(); break; }
          var an2 = cmpAnalyze(iss), nc = {id:'CMP-'+(nCmp++), s:sN, part:part, issue:iss, qty:qty||1, cat:an2.cat, sev:an2.sev, status:'Open', created:fmtD(TODAY)};
          CMP.unshift(nc); selCmp = nc.id; var sp = sup(sN); sp.q = Math.max(60, sp.q-2); risk(sp); counts(); render(); toast(nc.id+' created. Quality score of '+sN+' updated.');
          break;
        case 'cmp-8d':
          var c1 = CMP.filter(function(x){ return x.id===selCmp; })[0]; c1.status = '8D requested'; counts(); render();
          typeInto($('#c-draft', ven), '<div class="draft">'+esc('To: '+c1.s+'\nSubject: 8D request – '+c1.id+' – '+c1.part+'\n\nHello,\n\nwe found the following issue: '+c1.issue+' ('+c1.qty+' pcs affected).\n\nPlease send containment actions (D3) within 24 hours and the root cause analysis (D4) within 10 days.\n\nThank you,\nQuality team')+'</div>');
          toast('8D request sent to '+c1.s); break;
        case 'cmp-reply':
          var c2 = CMP.filter(function(x){ return x.id===selCmp; })[0]; c2.status = 'Root cause received';
          c2.rc = c2.cat==='Workmanship' ? 'Reflow oven profile drifted after maintenance. Profile corrected, AOI check added after soldering.' : c2.cat==='Transport damage' ? 'Insufficient edge protection on pallets. Corner protectors and new stacking limit introduced.' : 'Raw material batch out of specification. Incoming inspection tightened and batch quarantined.';
          counts(); render(); toast('Root cause received from '+c2.s); break;
        case 'cmp-close':
          var c3 = CMP.filter(function(x){ return x.id===selCmp; })[0]; c3.status = 'Closed'; counts(); render(); toast(c3.id+' closed'); break;
      }
    });
    counts(); render();
  }
  })();

  (function(){
  /* =================== FACILITY MANAGEMENT =================== */
  var fac = $('#demo-facility');
  if(fac){
    var R = {
      lobby:{n:'Lobby', t:21.4}, meetA:{n:'Meeting A', t:22.0}, meetB:{n:'Meeting B', t:24.8}, kitchen:{n:'Kitchen', t:22.3},
      east:{n:'Office East', t:21.8}, west:{n:'Office West', t:22.1}, server:{n:'Server room', t:27.9}, wc:{n:'Restrooms', t:21.0},
      stairs:{n:'Stairs', t:20.4}, wh:{n:'Warehouse', t:17.6}, dock:{n:'Loading dock', t:15.2}
    };
    var T = [
      {id:'FM-1041', room:'server', txt:'Server room temperature above threshold', cat:'HVAC', pri:'Critical', team:'HVAC contractor', st:'Dispatched'},
      {id:'FM-1040', room:'meetB', txt:'Projector not turning on', cat:'IT / AV', pri:'Medium', team:'IT service desk', st:'Open'}
    ];
    var RULES = [
      {cat:'HVAC', re:/(hot|cold|temperat|heat|air ?con|hvac|ventilat|warm|stuffy)/i, team:'HVAC contractor'},
      {cat:'Plumbing', re:/(leak|water|tap|toilet|drain|flood|pipe|drip)/i, team:'Plumbing team'},
      {cat:'Electrical', re:/(light|power|socket|electric|outage|flicker|lamp|breaker)/i, team:'Electrician'},
      {cat:'IT / AV', re:/(wifi|wi-fi|network|projector|screen|printer|internet|display|beamer)/i, team:'IT service desk'},
      {cat:'Security', re:/(door|lock|badge|access|alarm|camera|window broken)/i, team:'Security'},
      {cat:'Cleaning', re:/(clean|spill|dirty|trash|bin|smell|mess)/i, team:'Cleaning crew'}
    ];
    var ROOMWORDS = {lobby:/lobby|entrance|reception/i, meetA:/meeting ?a|room a/i, meetB:/meeting ?b|room b/i, kitchen:/kitchen|coffee|canteen/i, east:/east/i, west:/west/i, server:/server/i, wc:/restroom|toilet|wc|bathroom/i, stairs:/stair/i, wh:/warehouse|storage/i, dock:/dock|loading/i};
    var next = 1042;
    var priCls = {Critical:'p-bad', High:'p-warn', Medium:'p-info', Low:'p-ok'};
    function roomState(k){
      var open = T.filter(function(t){ return t.room===k && t.st!=='Resolved'; });
      if(open.some(function(t){ return t.pri==='Critical'||t.pri==='High'; })) return 'bad';
      if(open.length || R[k].t>24.5 || R[k].t<16) return 'warn';
      return '';
    }
    function renderPlan(sel){
      $('#fplan', fac).innerHTML = Object.keys(R).map(function(k){
        return '<button type="button" class="room r-'+k+' '+roomState(k)+(sel===k?' sel flash':'')+'" data-k="'+k+'">'+R[k].n+'<small>'+R[k].t.toFixed(1)+' °C</small></button>';
      }).join('');
    }
    function renderTickets(){
      $('#fm-list', fac).innerHTML = T.map(function(t){
        return '<div class="ticket"><span class="id">'+t.id+'</span><div><b>'+esc(t.txt)+'</b><div class="meta">'+R[t.room].n+' · '+t.cat+' · '+t.team+' · '+t.st+'</div>'+(t.st!=='Resolved'?'<div class="btn-row" style="margin-top:8px">'+(t.st==='Open'?'<button type="button" class="btn btn-ghost btn-sm" data-tk="'+t.id+'" data-to="Dispatched">Dispatch team</button>':'')+'<button type="button" class="btn btn-ink btn-sm" data-tk="'+t.id+'" data-to="Resolved">Mark resolved</button></div>':'')+'</div><span class="pill '+(t.st==='Resolved'?'p-ok':priCls[t.pri])+'">'+(t.st==='Resolved'?'Resolved':t.pri)+'</span></div>';
      }).join('');
      var open = T.filter(function(t){return t.st!=='Resolved';});
      $('#fk-open', fac).textContent = open.length;
      $('#fk-crit', fac).textContent = open.filter(function(t){return t.pri==='Critical';}).length;
    }
    function triage(text){
      var rule = RULES.filter(function(r){ return r.re.test(text); })[0] || {cat:'General', team:'Facility manager'};
      var room = Object.keys(ROOMWORDS).filter(function(k){ return ROOMWORDS[k].test(text); })[0] || 'lobby';
      var pri = /(flood|fire|smoke|outage|alarm|urgent|server|danger|broken window)/i.test(text) ? 'Critical' :
                /(leak|no power|not working|broken|stuck)/i.test(text) ? 'High' :
                /(clean|smell|bin|flicker)/i.test(text) ? 'Low' : 'Medium';
      var eta = {Critical:'within 1 hour', High:'today', Medium:'within 2 business days', Low:'next scheduled round'}[pri];
      return {cat:rule.cat, team:rule.team, room:room, pri:pri, eta:eta};
    }
    function submit(text){
      text = text.trim(); var out = $('#fm-ai', fac);
      if(!text){ out.innerHTML = '<p>Describe the problem first, for example “Water leaking under the sink in the kitchen”.</p>'; return; }
      var r = triage(text), id = 'FM-'+(next++);
      T.unshift({id:id, room:r.room, txt:text, cat:r.cat, pri:r.pri, team:r.team, st:'Open'});
      renderTickets(); renderPlan(r.room);
      typeInto(out, '<p>Created <b>'+id+'</b>.</p><ul><li>Location: <b>'+R[r.room].n+'</b></li><li>Category: <b>'+r.cat+'</b></li><li>Priority: <b>'+r.pri+'</b>, response '+r.eta+'</li><li>Assigned to: <b>'+r.team+'</b></li></ul>'+(r.cat==='Plumbing'?'<p style="margin-top:6px">Tip sent to reporter: close the local shut-off valve if safe to do so.</p>':''));
      $('#fm-text', fac).value = '';
    }
    $('#fm-go', fac).addEventListener('click', function(){ submit($('#fm-text', fac).value); });
    $('#fm-text', fac).addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(e.target.value); } });
    fac.querySelectorAll('[data-sample]').forEach(function(b){ b.addEventListener('click', function(){ $('#fm-text', fac).value = b.dataset.sample; $('#fm-text', fac).focus(); }); });
    $('#fplan', fac).addEventListener('click', function(e){
      var b = e.target.closest('.room'); if(!b) return; var k = b.dataset.k;
      renderPlan(k);
      var open = T.filter(function(t){return t.room===k && t.st!=='Resolved';});
      $('#fm-room', fac).innerHTML = '<b>'+R[k].n+'</b> · '+R[k].t.toFixed(1)+' °C · '+(open.length? open.length+' open ticket'+(open.length>1?'s':'') : 'no open tickets');
    });
    /* simulated sensor drift */
    setInterval(function(){
      Object.keys(R).forEach(function(k){ R[k].t += (Math.random()-.5)*0.2; if(k==='server') R[k].t = Math.max(26.5, Math.min(29, R[k].t)); });
      var sel = (fac.querySelector('.room.sel')||{}).dataset; renderPlan(sel ? sel.k : null);
      fac.querySelectorAll('.room.flash').forEach(function(x){ x.classList.remove('flash'); });
    }, 4000);
    $('#fm-list', fac).addEventListener('click', function(e){ var b = e.target.closest('[data-tk]'); if(!b) return; T.forEach(function(t){ if(t.id===b.dataset.tk) t.st = b.dataset.to; }); renderTickets(); var sel = (fac.querySelector('.room.sel')||{}).dataset; renderPlan(sel ? sel.k : null); });
    renderPlan(); renderTickets();
  }
  })();

  (function(){
  /* =================== HR TOOL =================== */
  var hr = $('#demo-hr');
  if(hr){
    /* tabs */
    var tabs = hr.querySelectorAll('[role=tab]');
    tabs.forEach(function(t){ t.addEventListener('click', function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected', x===t); $('#'+x.getAttribute('aria-controls')).hidden = x!==t; });
    }); });

    /* recruiting */
    var STAGES = ['Applied','Screening','Interview','Offer'];
    var C = [
      {n:'Laura White', r:'fe', st:0, yrs:5, skills:{React:5,TypeScript:5,Testing:3,Accessibility:3}, note:'Led a design-system migration; strong accessibility focus.'},
      {n:'Daniel Clark', r:'fe', st:0, yrs:2, skills:{React:3,TypeScript:2,Testing:2,Accessibility:1}, note:'Junior profile, quick learner, limited TypeScript experience.'},
      {n:'Julia Young', r:'fe', st:1, yrs:7, skills:{React:5,TypeScript:4,Testing:5,Accessibility:3}, note:'Senior engineer from e-commerce; owned CI test strategy.'},
      {n:'Michael Brown', r:'fe', st:2, yrs:4, skills:{React:4,TypeScript:4,Testing:3,Accessibility:3}, note:'Solid all-rounder; available in 4 weeks.'},
      {n:'Lisa Miller', r:'fe', st:3, yrs:6, skills:{React:5,TypeScript:5,Testing:3,Accessibility:5}, note:'Excellent technical interview; salary expectation within band.'},
      {n:'John Smith', r:'sm', st:0, yrs:8, skills:{'B2B sales':5,Negotiation:4,CRM:4,Languages:5}, note:'Exceeded quota three years running in industrial SaaS.'},
      {n:'Sarah Johnsonč', r:'sm', st:1, yrs:3, skills:{'B2B sales':3,Negotiation:3,CRM:5,Languages:3}, note:'Strong CRM hygiene; less enterprise experience.'},
      {n:'Mark Lewis', r:'sm', st:2, yrs:10, skills:{'B2B sales':5,Negotiation:5,CRM:2,Languages:5}, note:'Enterprise closer; wants a team-lead path.'}
    ];
    var ROLE = {fe:{t:'Frontend Engineer', need:{React:5,TypeScript:5,Testing:4,Accessibility:4}, yrs:5}, sm:{t:'Sales Manager EMEA', need:{'B2B sales':5,Negotiation:5,CRM:4,Languages:5}, yrs:6}};
    C.forEach(function(c){
      var need = ROLE[c.r].need, tot=0, got=0;
      Object.keys(need).forEach(function(k){ tot += need[k]; got += Math.min(c.skills[k]||0, need[k]); });
      c.score = Math.round((got/tot)*80 + Math.min(c.yrs/ROLE[c.r].yrs,1)*20);
    });
    var role = 'fe', selC = null;
    var initials = function(n){ return n.split(' ').map(function(x){return x[0];}).join(''); };
    var sc = function(s){ return s>=85?'s-hi':s>=70?'s-mid':'s-lo'; };
    function renderBoard(){
      $('#kanban', hr).innerHTML = STAGES.map(function(stg, i){
        var cs = C.filter(function(c){ return c.r===role && c.st===i; }).sort(function(a,b){return b.score-a.score;});
        return '<div class="col"><h4>'+stg+'<span>'+cs.length+'</span></h4>'+(cs.map(function(c){
          return '<button type="button" class="cand'+(selC===c.n?' sel':'')+'" data-n="'+esc(c.n)+'"><span class="av">'+initials(c.n)+'</span><span><b>'+esc(c.n)+'</b><small>'+c.yrs+' yrs experience</small></span><span class="score '+sc(c.score)+'">'+c.score+'</span></button>';
        }).join('') || '<div class="empty" style="padding:12px">No candidates</div>')+'</div>';
      }).join('');
    }
    function showCand(n){
      selC = n; renderBoard();
      var c = C.filter(function(x){return x.n===n;})[0], need = ROLE[c.r].need;
      var rows = Object.keys(need).map(function(k){
        var v = c.skills[k]||0, ok = v>=need[k];
        return '<div class="meter" style="font-size:13px;margin-top:8px"><span style="width:110px">'+k+'</span><i><b style="width:'+(v*20)+'%;background:'+(ok?'var(--ok)':'var(--warn)')+'"></b></i><span style="width:44px;text-align:right">'+v+'/'+need[k]+'</span></div>';
      }).join('');
      var gaps = Object.keys(need).filter(function(k){ return (c.skills[k]||0) < need[k]; });
      var q = gaps.length ? gaps.map(function(g){ return 'Walk me through a recent project where you used '+g+'. What would you do differently?'; }) : ['Which part of this role would you change in your first 90 days, and why?'];
      $('#cand-detail', hr).innerHTML =
        '<div style="display:flex;gap:12px;align-items:center"><span class="av" style="width:44px;height:44px">'+initials(c.n)+'</span><div><h3>'+esc(c.n)+'</h3><div style="font-size:13.5px;color:var(--dim)">'+ROLE[c.r].t+' · '+STAGES[c.st]+'</div></div><span class="score '+sc(c.score)+'" style="margin-left:auto;font-size:16px">'+c.score+'%</span></div>'+
        '<h4>Skill match vs. job profile</h4>'+rows+
        '<div class="ai-box"><div class="ai-h">AI summary</div><div id="cand-ai"></div></div>'+
        '<div class="btn-row">'+(c.st<3?'<button type="button" class="btn btn-ink btn-sm" id="adv">Move to '+STAGES[c.st+1]+'</button>':'<span class="pill p-ok">Offer stage</span>')+'</div>';
      typeInto($('#cand-ai', hr), '<p>'+esc(c.note)+' '+(gaps.length?'Gaps: <b>'+gaps.join(', ')+'</b>.':'Meets every core requirement.')+'</p><p style="margin-top:6px"><b>Suggested interview questions</b></p><ul><li>'+q.slice(0,2).map(esc).join('</li><li>')+'</li></ul>');
      var a = $('#adv', hr); if(a) a.onclick = function(){ c.st++; showCand(c.n); };
    }
    $('#role', hr).addEventListener('change', function(e){ role = e.target.value; var first = C.filter(function(c){return c.r===role;}).sort(function(a,b){return b.score-a.score;})[0]; showCand(first.n); });
    $('#kanban', hr).addEventListener('click', function(e){ var b = e.target.closest('.cand'); if(b) showCand(b.dataset.n); });
    renderBoard(); showCand('Lisa Miller');

    /* leave */
    var DAYS = ['Mo 7','Tu 8','We 9','Th 10','Fr 11','Mo 14','Tu 15','We 16','Th 17','Fr 18'];
    var TEAM = [
      {n:'Anna Moore', on:[0,1,2], st:'approved'},
      {n:'David Wilson', on:[3,4,5,6], st:'pending', reason:'Family visit', bal:14},
      {n:'Emma Davis', on:[5,6,7], st:'pending', reason:'Vacation', bal:9},
      {n:'James Taylor', on:[8,9], st:'pending', reason:'Training course', bal:21},
      {n:'Chris Walker', on:[], st:'none'}
    ];
    var MINSTAFF = 3;
    function renderLeave(){
      var cal = '<span></span>'+DAYS.map(function(d){return '<span style="text-align:center">'+d+'</span>';}).join('');
      TEAM.forEach(function(p){
        cal += '<span class="nm">'+p.n+'</span>'+DAYS.map(function(d,i){
          var on = p.on.indexOf(i)>-1 && p.st!=='declined';
          return '<span class="c '+(on?(p.st==='approved'?'on':'pend'):'')+'"></span>';
        }).join('');
      });
      $('#cal', hr).innerHTML = cal;
      $('#leave-list', hr).innerHTML = TEAM.filter(function(p){return p.reason;}).map(function(p, idx){
        var clash = p.on.filter(function(d){
          var away = TEAM.filter(function(o){ return o!==p && o.on.indexOf(d)>-1 && (o.st==='approved'); }).length + 1;
          return TEAM.length - away < MINSTAFF;
        });
        var hint = p.st!=='pending' ? '' : clash.length ?
          '<span class="pill p-warn">Coverage below '+MINSTAFF+' on '+clash.map(function(d){return DAYS[d];}).join(', ')+'</span>' :
          '<span class="pill p-ok">AI check: coverage OK, balance '+p.bal+' days</span>';
        return '<div class="leave"><div><b>'+p.n+'</b> · '+p.reason+'<div class="meta">'+DAYS[p.on[0]]+' – '+DAYS[p.on[p.on.length-1]]+' · '+p.on.length+' days</div><div style="margin-top:6px">'+hint+'</div></div><div class="btn-row" style="margin:0">'+
          (p.st==='pending' ? '<button type="button" class="btn btn-ink btn-sm" data-a="approved" data-n="'+esc(p.n)+'">Approve</button><button type="button" class="btn btn-ghost btn-sm" data-a="declined" data-n="'+esc(p.n)+'">Decline</button>' :
          '<span class="pill '+(p.st==='approved'?'p-ok':'p-bad')+'">'+(p.st==='approved'?'Approved':'Declined')+'</span>')+'</div></div>';
      }).join('');
    }
    $('#leave-list', hr).addEventListener('click', function(e){
      var b = e.target.closest('[data-a]'); if(!b) return;
      TEAM.forEach(function(p){ if(p.n===b.dataset.n) p.st = b.dataset.a; }); renderLeave();
    });
    renderLeave();

    /* assistant */
    var KB = [
      {re:/(vacation|holiday|leave|days off|annual)/i, a:'Full-time employees receive <b>30 days</b> of paid annual leave per calendar year. Up to 5 unused days carry over until 31 March of the following year.', src:'Example Handbook §4.1 Annual leave'},
      {re:/(sick|ill|doctor|medical)/i, a:'Report sickness to your manager before your shift starts. From the <b>third day</b> of absence, a medical certificate is required.', src:'Example Handbook §4.3 Sick leave'},
      {re:/(remote|home office|work from home|wfh|hybrid)/i, a:'You can work remotely up to <b>3 days per week</b> after agreeing with your team lead. Working from abroad needs HR approval for each stay.', src:'Example Handbook §5.2 Hybrid work'},
      {re:/(expense|travel|reimburse|mileage|receipt)/i, a:'Submit expenses within <b>30 days</b> with receipts attached. Private car use is reimbursed at $0.30 per km.', src:'Example Handbook §7.1 Travel & expenses'},
      {re:/(parental|maternity|paternity|baby|child)/i, a:'Parental leave follows the statutory rules. Notify HR at least <b>7 weeks</b> before the planned start so we can arrange cover.', src:'Example Handbook §4.6 Parental leave'},
      {re:/(onboard|first day|laptop|new hire|equipment)/i, a:'New hires receive their laptop and accounts on <b>day one</b>. Your onboarding buddy and a 30-60-90 day plan are assigned in the HR portal.', src:'Example Handbook §2.1 Onboarding'}
    ];
    var chat = $('#chat', hr);
    function say(cls, html){ var d = document.createElement('div'); d.className='msg '+cls; d.innerHTML = html; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; }
    function ask(q){
      q = q.trim(); if(!q) return;
      say('me', esc(q));
      var hit = KB.filter(function(k){ return k.re.test(q); })[0];
      var d = say('bot', '');
      var html = hit ? hit.a + '<span class="src">Source: '+hit.src+'</span>' :
        'I could not find that in the employee handbook. I have forwarded your question to the HR team, who usually reply within one business day.<span class="src">Routed to: hr-team queue</span>';
      setTimeout(function(){ typeInto(d, html, function(){ chat.scrollTop = chat.scrollHeight; }); }, 350);
      $('#ask', hr).value = '';
    }
    $('#ask-go', hr).addEventListener('click', function(){ ask($('#ask', hr).value); });
    $('#ask', hr).addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); ask(e.target.value); } });
    hr.querySelectorAll('[data-q]').forEach(function(b){ b.addEventListener('click', function(){ ask(b.dataset.q); }); });
    say('bot', 'Hi, I am the HR assistant. Ask me about leave, sickness, remote work, expenses or onboarding.<span class="src">Answers come from the example employee handbook</span>');
  }
  })();

  (function(){
  /* =================== FURNITURE SHOP =================== */
  var shop = $('#demo-shop');
  if(shop){
    var P = [
      {id:1, n:'Fjord 3-seat sofa', cat:'Sofas', price:1290, mat:'Linen', col:'#C9C2B4', w:212, r:4.8, d:'Deep seats, removable linen covers and solid oak legs.'},
      {id:2, n:'Alba 2-seat sofa', cat:'Sofas', price:890, mat:'Velvet', col:'#2F6B66', w:168, r:4.6, d:'Compact velvet sofa that fits small living rooms.'},
      {id:3, n:'Nook lounge chair', cat:'Chairs', price:540, mat:'Velvet', col:'#D9825F', w:78, r:4.9, d:'Wraparound shell with a soft velvet seat. Made for reading.'},
      {id:4, n:'Hale dining chair', cat:'Chairs', price:189, mat:'Oak', col:'#C8A27A', w:46, r:4.7, d:'Light oak frame with a woven paper-cord seat.'},
      {id:5, n:'Loop office chair', cat:'Chairs', price:420, mat:'Metal', col:'#3A4750', w:62, r:4.5, d:'Ergonomic office chair with adjustable lumbar support.'},
      {id:6, n:'Grain dining table', cat:'Tables', price:980, mat:'Oak', col:'#C8A27A', w:200, r:4.8, d:'Solid oak table for six, oiled finish.'},
      {id:7, n:'Rune coffee table', cat:'Tables', price:340, mat:'Walnut', col:'#7A5238', w:110, r:4.6, d:'Round walnut coffee table with a lower shelf.'},
      {id:8, n:'Duo work desk', cat:'Tables', price:690, mat:'Oak', col:'#D2B48C', w:160, r:4.7, d:'Wide desk with cable tray. Room for two people.'},
      {id:9, n:'Halo floor lamp', cat:'Lighting', price:229, mat:'Metal', col:'#E8C07A', w:40, r:4.8, d:'Dimmable arc lamp with a linen shade.'},
      {id:10, n:'Ember table lamp', cat:'Lighting', price:119, mat:'Rattan', col:'#C49A5A', w:28, r:4.5, d:'Hand-woven rattan shade with a warm glow.'},
      {id:11, n:'Stack shelf', cat:'Storage', price:460, mat:'Oak', col:'#C8A27A', w:90, r:4.7, d:'Modular open shelving, five levels.'},
      {id:12, n:'Haven bed 160', cat:'Beds', price:1150, mat:'Walnut', col:'#7A5238', w:166, r:4.9, d:'Walnut bed frame with an upholstered headboard.'}
    ];
    var art = function(p){
      var c = p.col, sh = 'rgba(14,27,34,.12)';
      var body = {
        Sofas:'<rect x="20" y="58" width="120" height="34" rx="10" fill="'+c+'"/><rect x="28" y="38" width="104" height="30" rx="10" fill="'+c+'" opacity=".85"/><rect x="14" y="52" width="18" height="40" rx="8" fill="'+c+'"/><rect x="128" y="52" width="18" height="40" rx="8" fill="'+c+'"/><rect x="30" y="92" width="6" height="12" fill="#8A6A4A"/><rect x="124" y="92" width="6" height="12" fill="#8A6A4A"/>',
        Chairs:'<rect x="56" y="28" width="48" height="40" rx="12" fill="'+c+'"/><rect x="50" y="64" width="60" height="16" rx="7" fill="'+c+'" opacity=".9"/><path d="M58 80 52 106M102 80l6 26" stroke="#5A4A3A" stroke-width="4" stroke-linecap="round"/>',
        Tables:'<rect x="22" y="48" width="116" height="10" rx="4" fill="'+c+'"/><path d="M34 58 30 104M126 58l4 46" stroke="'+c+'" stroke-width="7" stroke-linecap="round"/>',
        Lighting:'<path d="M80 104V44" stroke="#3A4750" stroke-width="3"/><ellipse cx="80" cy="104" rx="22" ry="4" fill="#3A4750"/><path d="M58 44h44l-8-26H66z" fill="'+c+'"/><circle cx="80" cy="50" r="10" fill="#FFE6B0" opacity=".7"/>',
        Storage:'<rect x="44" y="18" width="72" height="88" rx="3" fill="none" stroke="'+c+'" stroke-width="5"/><path d="M44 40h72M44 62h72M44 84h72" stroke="'+c+'" stroke-width="4"/><rect x="54" y="26" width="10" height="14" fill="#2F6B66"/><rect x="88" y="70" width="18" height="14" fill="#D9825F"/>',
        Beds:'<rect x="18" y="60" width="124" height="28" rx="6" fill="'+c+'"/><rect x="18" y="34" width="20" height="54" rx="6" fill="'+c+'"/><rect x="40" y="52" width="96" height="14" rx="6" fill="#F3EEE6"/><rect x="44" y="44" width="26" height="12" rx="5" fill="#FFFFFF"/>'
      }[p.cat];
      return '<svg viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="108" rx="62" ry="6" fill="'+sh+'"/>'+body+'</svg>';
    };
    var money = function(n){ return '$' + n.toLocaleString('en-US'); };
    var st = {cat:'All', mat:'All', max:1500, sort:'pop', q:''}, cart = [], ship = 'std', assembly = false, addr = {}, orderNo = 4100;
    var grid = $('#s-grid', shop), panel = $('#s-panel', shop), scrim = $('#s-scrim', shop), lastFocus;
    var byId = function(id){ return P.filter(function(p){ return p.id===id; })[0]; };
    var count = function(){ return cart.reduce(function(a,x){ return a+x.qty; },0); };
    var subtotal = function(){ return cart.reduce(function(a,x){ return a + byId(x.id).price*x.qty; },0); };
    var shipCost = function(){ return ship==='exp' ? 89 : subtotal() >= 999 ? 0 : 49; };
    var total = function(){ return subtotal() + shipCost() + (assembly ? 79 : 0); };
    var bump = function(){ var b = $('#s-cartn', shop); b.textContent = count(); b.hidden = !count(); var btn = $('#s-cart', shop); btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); };
    var add = function(id, qty){ var it = cart.filter(function(x){ return x.id===id; })[0]; if(it) it.qty += qty||1; else cart.push({id:id, qty:qty||1}); bump(); };
    var toastS = function(t){ var el = $('#s-toast', shop); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('on'); }, 2200); };

    function list(){
      var L = P.filter(function(p){ return (st.cat==='All'||p.cat===st.cat) && (st.mat==='All'||p.mat===st.mat) && p.price<=st.max && (p.n+' '+p.cat+' '+p.mat).toLowerCase().indexOf(st.q.toLowerCase())>-1; });
      if(st.sort==='low') L.sort(function(a,b){ return a.price-b.price; }); else if(st.sort==='high') L.sort(function(a,b){ return b.price-a.price; }); else L.sort(function(a,b){ return b.r-a.r; });
      return L;
    }
    function renderGrid(){
      var L = list();
      $('#s-count', shop).textContent = L.length + ' product' + (L.length===1?'':'s');
      grid.innerHTML = L.length ? L.map(function(p){
        return '<article class="prod"><button type="button" class="prod-open" data-open="'+p.id+'" aria-label="View '+esc(p.n)+'"><span class="prod-art">'+art(p)+'</span></button>'+
          '<div class="prod-info"><b>'+esc(p.n)+'</b><span>'+p.mat+' · '+p.w+' cm wide</span><div class="prod-row"><strong>'+money(p.price)+'</strong><span class="stars">★ '+p.r+'</span></div>'+
          '<button type="button" class="btn btn-ink btn-sm" data-add="'+p.id+'">Add to cart</button></div></article>';
      }).join('') : '<p class="empty" style="grid-column:1/-1">Nothing matches these filters. Raise the price limit or choose “All”.</p>';
      shop.querySelectorAll('[data-cat]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.cat===st.cat); });
    }
    function open(html, label){
      if(panel.hidden) lastFocus = document.activeElement;
      panel.innerHTML = '<button type="button" class="s-close" data-close aria-label="Close">×</button>' + html;
      panel.setAttribute('aria-label', label); panel.hidden = false; scrim.hidden = false;
      requestAnimationFrame(function(){ panel.classList.add('on'); scrim.classList.add('on'); var f = panel.querySelector('input, button:not(.s-close)'); (f || panel).focus(); });
    }
    function close(){
      panel.classList.remove('on'); scrim.classList.remove('on');
      setTimeout(function(){ panel.hidden = true; scrim.hidden = true; }, 220);
      if(lastFocus) lastFocus.focus();
    }
    function detail(id){
      var p = byId(id), pairs = P.filter(function(x){ return x.id!==p.id && x.cat!==p.cat && (x.mat===p.mat || x.cat==='Lighting'); }).slice(0,2);
      open('<div class="pd-art">'+art(p)+'</div><h3>'+esc(p.n)+'</h3><p class="pd-meta">'+p.cat+' · '+p.mat+' · '+p.w+' cm wide · ★ '+p.r+'</p><p>'+esc(p.d)+'</p>'+
        '<div class="pd-buy"><strong>'+money(p.price)+'</strong><label for="pd-q" class="qty">Qty<select id="pd-q">'+[1,2,3,4].map(function(n){ return '<option>'+n+'</option>'; }).join('')+'</select></label><button type="button" class="btn btn-ink" data-addq="'+p.id+'">Add to cart</button></div>'+
        '<div class="ai-box"><div class="ai-h">Pairs well with</div>'+pairs.map(function(x){ return '<div class="pair"><span>'+art(x)+'</span><div><b>'+esc(x.n)+'</b><br>'+money(x.price)+'</div><button type="button" class="btn btn-ghost btn-sm" data-add="'+x.id+'">Add</button></div>'; }).join('')+'</div>', p.n);
    }
    function cartView(){
      if(!cart.length){ open('<h3>Your cart</h3><p class="empty">Your cart is empty. Add something you like, or ask the AI advisor for ideas.</p><button type="button" class="btn btn-ink" data-close>Keep shopping</button>', 'Cart'); return; }
      open('<h3>Your cart</h3><ul class="cart">'+cart.map(function(x){ var p = byId(x.id);
          return '<li><span class="c-art">'+art(p)+'</span><div><b>'+esc(p.n)+'</b><span>'+money(p.price)+'</span></div><div class="stepper"><button type="button" data-dec="'+p.id+'" aria-label="One less">−</button><span aria-live="polite">'+x.qty+'</span><button type="button" data-inc="'+p.id+'" aria-label="One more">+</button></div><button type="button" class="c-rm" data-rm="'+p.id+'" aria-label="Remove '+esc(p.n)+'">Remove</button></li>'; }).join('')+'</ul>'+
        sums()+'<button type="button" class="btn btn-ink" style="width:100%" data-step="1">Checkout <span class="arr">→</span></button>', 'Cart');
    }
    function sums(){
      var sc = shipCost();
      return '<dl class="sums"><div><dt>Subtotal</dt><dd>'+money(subtotal())+'</dd></div><div><dt>Delivery</dt><dd>'+(sc?money(sc):'Free')+'</dd></div>'+(assembly?'<div><dt>Assembly</dt><dd>'+money(79)+'</dd></div>':'')+'<div class="tot"><dt>Total</dt><dd>'+money(total())+'</dd></div></dl>'+
        (subtotal()<999 && ship==='std' ? '<p class="note">Add '+money(999-subtotal())+' more for free standard delivery.</p>' : '');
    }
    var stepsBar = function(n){ return '<ol class="co-steps">'+['Address','Delivery','Review'].map(function(t,i){ return '<li class="'+(i+1<n?'done':i+1===n?'cur':'')+'">'+t+'</li>'; }).join('')+'</ol>'; };
    function step(n){
      if(n===1){
        open(stepsBar(1)+'<h3>Delivery address</h3><form id="co-a" class="co" novalidate><label for="co-n">Full name<input id="co-n" autocomplete="name" value="'+esc(addr.n||'')+'"></label><label for="co-s">Street and number<input id="co-s" autocomplete="street-address" value="'+esc(addr.s||'')+'"></label><div class="row2"><label for="co-z">Postal code<input id="co-z" autocomplete="postal-code" value="'+esc(addr.z||'')+'"></label><label for="co-c">City<input id="co-c" autocomplete="address-level2" value="'+esc(addr.c||'')+'"></label></div><p class="note" id="co-e" role="status"></p><button class="btn btn-ink" type="submit">Continue to delivery <span class="arr">→</span></button><button class="btn btn-ghost" type="button" data-cartv>Back to cart</button></form>', 'Checkout: address');
      } else if(n===2){
        var opt = function(v, t, s, p){ return '<label class="radio"><input type="radio" name="ship" value="'+v+'"'+(ship===v?' checked':'')+'><span><b>'+t+'</b><small>'+s+'</small></span><em>'+p+'</em></label>'; };
        open(stepsBar(2)+'<h3>Delivery</h3><div class="co">'+opt('std','Standard delivery','5–7 working days, to your door', subtotal()>=999?'Free':money(49))+opt('exp','Express delivery','2–3 working days, choose a time slot', money(89))+
          '<label class="chk big"><input type="checkbox" id="co-asm"'+(assembly?' checked':'')+'> <span><b>Assembly service</b><small>Our team assembles everything and takes the packaging away. +'+money(79)+'</small></span></label>'+
          '<div class="ai-box"><div class="ai-h">AI delivery estimate</div>Based on stock and your postal code '+esc(addr.z)+', everything can arrive in <b>one delivery</b> '+(ship==='exp'?'within 3 working days':'within 6 working days')+'.</div>'+
          '<button class="btn btn-ink" type="button" data-step="3">Review order <span class="arr">→</span></button><button class="btn btn-ghost" type="button" data-step="1">Back</button></div>', 'Checkout: delivery');
      } else if(n===3){
        open(stepsBar(3)+'<h3>Review and place order</h3><div class="co"><div class="rev"><b>Deliver to</b><span>'+esc(addr.n)+', '+esc(addr.s)+', '+esc(addr.z)+' '+esc(addr.c)+'</span></div>'+
          '<div class="rev"><b>Items</b><span>'+cart.map(function(x){ return x.qty+' × '+esc(byId(x.id).n); }).join('<br>')+'</span></div>'+sums()+
          '<label class="radio"><input type="radio" checked name="pay"><span><b>Demo payment</b><small>No real payment is taken in this demo.</small></span></label>'+
          '<button class="btn btn-ink" type="button" data-place>Place order · '+money(total())+'</button><button class="btn btn-ghost" type="button" data-step="2">Back</button></div>', 'Checkout: review');
      }
    }
    function placed(){
      var no = 'LL-' + (orderNo++), items = count(), tot = total();
      cart = []; bump();
      open('<div class="done-ico">'+'<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="var(--teal-soft)"/><path d="m15 24.5 6 6 12-13" fill="none" stroke="var(--teal)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'+'</div><h3>Thank you, '+esc((addr.n||'').split(' ')[0])+'!</h3><p>Order <b>'+no+'</b> is confirmed: '+items+' item'+(items>1?'s':'')+', '+money(tot)+'.</p>'+
        '<div class="ai-box"><div class="ai-h">What happens next</div><ul><li>Confirmation email with your invoice</li><li>Delivery slot by text message the day before</li><li>'+(assembly?'Assembly team arrives with the delivery':'Assembly instructions and video in your account')+'</li></ul></div><button type="button" class="btn btn-ink" data-close>Continue shopping</button>', 'Order confirmed');
      ship = 'std'; assembly = false;
    }

    /* AI room advisor */
    function advise(q){
      var budget = (q.match(/(?:\$|€|usd|eur|under|below|max)\s*([\d.,]+)/i) || q.match(/([\d.,]{3,})\s*(?:\$|€|usd|eur)/i) || [])[1];
      budget = budget ? parseInt(budget.replace(/[.,]/g,''),10) : 2500;
      var want = [], why = [];
      var pick = function(cat, pref){ var c = P.filter(function(p){ return p.cat===cat && want.indexOf(p)<0; }); if(pref) c.sort(function(a,b){ return (pref(b)?1:0)-(pref(a)?1:0); }); return c; };
      var light = /light|bright|scandi|nordic|oak/i.test(q), dark = /dark|walnut|warm/i.test(q), small = /small|compact|tiny|studio|apartment/i.test(q), cozy = /cozy|cosy|reading|relax/i.test(q);
      var matPref = function(p){ return (light && p.mat==='Oak') || (dark && p.mat==='Walnut') || (cozy && (p.mat==='Velvet'||p.mat==='Linen')); };
      var plan = /office|desk|work/i.test(q) ? ['Tables','Chairs','Lighting'] : /bed|sleep/i.test(q) ? ['Beds','Lighting','Storage'] : /dining|eat|kitchen/i.test(q) ? ['Tables','Chairs','Lighting'] : cozy ? ['Chairs','Lighting','Tables'] : ['Sofas','Tables','Lighting'];
      plan.forEach(function(cat){
        var c = pick(cat, function(p){ return matPref(p) || (small && p.w < 180) || (cat==='Tables' && /office|desk/i.test(q) && p.n.indexOf('desk')>-1) || (cat==='Chairs' && /office|desk/i.test(q) && p.n.indexOf('office')>-1); });
        var spent = want.reduce(function(a,p){ return a+p.price; },0);
        var fit = c.filter(function(p){ return spent + p.price <= budget; });
        if(fit.length) want.push(fit[0]);
      });
      if(small) why.push('pieces under 180 cm wide for a small room');
      if(light) why.push('light oak and natural tones');
      if(dark) why.push('warm walnut');
      if(cozy) why.push('soft fabrics and a warm lamp');
      var sum = want.reduce(function(a,p){ return a+p.price; },0);
      return {items:want, why:why, sum:sum, budget:budget};
    }
    function showAdvice(q){
      var out = $('#s-ai-out', shop), a = advise(q);
      if(!a.items.length){ out.innerHTML = '<div class="ai-box"><div class="ai-h">AI advisor</div>Nothing fits a budget of '+money(a.budget)+'. Try a higher budget.</div>'; return; }
      out.innerHTML = '<div class="ai-box advice"><div class="ai-h">AI advisor · a set for your room</div><p>I picked '+(a.why.length?a.why.join(', '):'our best-rated pieces')+'. Total <b>'+money(a.sum)+'</b>'+(a.budget!==2500?' of your '+money(a.budget)+' budget':'')+'.</p><div class="adv-row">'+
        a.items.map(function(p){ return '<button type="button" class="adv" data-open="'+p.id+'"><span>'+art(p)+'</span><b>'+esc(p.n)+'</b><small>'+money(p.price)+'</small></button>'; }).join('')+
        '</div><button type="button" class="btn btn-ink btn-sm" data-addset="'+a.items.map(function(p){return p.id;}).join(',')+'">Add all '+a.items.length+' to cart · '+money(a.sum)+'</button></div>';
    }

    /* events */
    shop.addEventListener('click', function(e){
      var t = e.target.closest('button, [data-close]'); if(!t || !shop.contains(t)) return;
      if(t.dataset.cat){ st.cat = t.dataset.cat; renderGrid(); return; }
      if(t.dataset.add){ add(+t.dataset.add); toastS(byId(+t.dataset.add).n + ' added to cart'); return; }
      if(t.dataset.addq){ add(+t.dataset.addq, +$('#pd-q', shop).value); toastS('Added to cart'); close(); return; }
      if(t.dataset.addset){ t.dataset.addset.split(',').forEach(function(id){ add(+id); }); toastS('Set added to cart'); return; }
      if(t.dataset.open){ detail(+t.dataset.open); return; }
      if(t.id==='s-cart' || t.hasAttribute('data-cartv')){ cartView(); return; }
      if(t.hasAttribute('data-close')){ close(); return; }
      if(t.dataset.inc||t.dataset.dec||t.dataset.rm){
        var id = +(t.dataset.inc||t.dataset.dec||t.dataset.rm), it = cart.filter(function(x){ return x.id===id; })[0];
        if(t.dataset.inc) it.qty++; else if(t.dataset.dec) it.qty--; if(t.dataset.rm || it.qty<1) cart = cart.filter(function(x){ return x.id!==id; });
        bump(); cartView(); return;
      }
      if(t.dataset.step){ step(+t.dataset.step); return; }
      if(t.hasAttribute('data-place')){ placed(); return; }
      if(t.dataset.ask!=null){ $('#s-ai-q', shop).value = t.textContent; showAdvice(t.textContent); return; }
    });
    shop.addEventListener('change', function(e){
      var t = e.target;
      if(t.id==='s-mat'){ st.mat = t.value; renderGrid(); }
      if(t.id==='s-sort'){ st.sort = t.value; renderGrid(); }
      if(t.name==='ship'){ ship = t.value; step(2); }
      if(t.id==='co-asm'){ assembly = t.checked; }
    });
    shop.addEventListener('input', function(e){
      var t = e.target;
      if(t.id==='s-max'){ st.max = +t.value; $('#s-maxv', shop).textContent = money(st.max); renderGrid(); }
      if(t.id==='s-q'){ st.q = t.value; renderGrid(); }
    });
    shop.addEventListener('submit', function(e){
      e.preventDefault();
      if(e.target.id==='s-ai'){ var q = $('#s-ai-q', shop).value.trim(); if(q) showAdvice(q); else $('#s-ai-q', shop).focus(); }
      if(e.target.id==='co-a'){
        var f = {n:$('#co-n',shop).value.trim(), s:$('#co-s',shop).value.trim(), z:$('#co-z',shop).value.trim(), c:$('#co-c',shop).value.trim()}, er = $('#co-e', shop);
        var miss = !f.n ? ['co-n','Add your full name.'] : !f.s ? ['co-s','Add the street and house number.'] : !/^\w{3,10}$/.test(f.z.replace(/\s/g,'')) ? ['co-z','Enter a valid postal code.'] : !f.c ? ['co-c','Add your city.'] : null;
        if(miss){ er.className='note err'; er.textContent = miss[1]; var el = $('#'+miss[0], shop); el.setAttribute('aria-invalid','true'); el.focus(); return; }
        addr = f; step(2);
      }
    });
    shop.addEventListener('keydown', function(e){ if(e.key==='Escape' && !panel.hidden) close(); });
    scrim.addEventListener('click', close);
    renderGrid();
    showAdvice('Small living room, light wood, under $1,500');
  }
  })();

  (function(){
  /* =================== FIELD SERVICE & PROOF OF DELIVERY =================== */
  var fld = $('#demo-field');
  if(fld){
    var BASE = {lat:52.5200, lng:13.4050};
    var toGeo = function(x, y){ return {lat:(BASE.lat + (50-y)*0.0006).toFixed(5), lng:(BASE.lng + (x-50)*0.0009).toFixed(5)}; };
    var J = [
      {id:'J-5201', type:'Delivery', title:'Deliver 2 pallets of floor tiles', cust:'Reed Building Supplies', addr:'Harbour Street 12', x:66, y:30, status:'Assigned', eta:'10:30',
       check:['2 pallets unloaded','Packaging undamaged','Placed at agreed spot']},
      {id:'J-5202', type:'Service', title:'Annual boiler maintenance', cust:'Kate Hall', addr:'Linden Avenue 4', x:24, y:62, status:'Assigned', eta:'13:00',
       check:['Burner cleaned','Pressure checked (1.5 bar)','Exhaust values measured','Customer briefed']},
      {id:'J-5203', type:'Inspection', title:'Elevator safety inspection', cust:'Parkside Offices', addr:'Park Road 88', x:80, y:74, status:'Done', eta:'08:15',
       check:['Brakes tested','Door sensors OK','Emergency call tested'],
       proof:{time:'08:41', geo:toGeo(80,74), acc:6, photos:[], sig:null, name:'M. Brooks', notes:'All checks passed.', done:['Brakes tested','Door sensors OK','Emergency call tested']}}
    ];
    var van = {x:46, y:48};
    var cur = null, stepN = 'list', mark = null, photos = [], sigDirty = false, officeSel = 'J-5203';
    var phone = $('#f-phone', fld), office = $('#f-office', fld), toastF = function(t){ var el = $('#f-toast', fld); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('on'); }, 2400); };
    var job = function(id){ return J.filter(function(j){ return j.id===id; })[0]; };
    var stCls2 = function(s){ return s==='Done' ? 'p-ok' : s==='On the way' || s==='On site' ? 'p-warn' : 'p-info'; };
    var MAPBG = '<rect width="100" height="100" fill="#EEF3F1"/>'+
      '<path d="M0 82 C20 76 34 90 52 84 S82 70 100 78 V100 H0Z" fill="#CFE7F0"/>'+
      '<rect x="8" y="10" width="20" height="16" rx="2" fill="#D6EBDD"/><rect x="58" y="52" width="16" height="12" rx="2" fill="#D6EBDD"/>'+
      '<g stroke="#FFFFFF" stroke-width="3.2" fill="none" stroke-linecap="round"><path d="M0 40 H100"/><path d="M40 0 V100"/><path d="M0 18 C30 22 60 12 100 20"/><path d="M70 0 C66 30 76 60 72 100"/><path d="M14 100 C18 70 10 50 20 30"/></g>'+
      '<g stroke="#E2E9E7" stroke-width=".6"><path d="M50 40 V82M86 20 V40M20 52 H40M74 58 H100"/></g>';
    var pinSvg = function(x, y, col, label, big){
      return '<g transform="translate('+x+' '+y+')" class="pin-g"><path d="M0 0 C-3.2 -4 -4.4 -6 -4.4 -8 a4.4 4.4 0 0 1 8.8 0 C4.4 -6 3.2 -4 0 0Z" fill="'+col+'" stroke="#fff" stroke-width=".8"'+(big?' transform="scale(1.25)"':'')+'/>'+(label?'<text y="-6.6" text-anchor="middle" font-size="3" font-weight="600" fill="#fff">'+label+'</text>':'')+'</g>';
    };
    var colFor = function(j){ return j.status==='Done' ? '#17703F' : j.status==='Assigned' ? '#2F6690' : '#E0663F'; };

    function renderOffice(){
      var pins = J.map(function(j, i){ return pinSvg(j.x, j.y, colFor(j), String(i+1), j.id===officeSel); }).join('');
      var vanG = '<g transform="translate('+van.x+' '+van.y+')"><circle r="3.6" fill="#0E1B22"/><circle r="6" fill="none" stroke="#0E1B22" stroke-opacity=".25"><animate attributeName="r" values="3.6;7;3.6" dur="2s" repeatCount="indefinite"/></circle><path d="M-1.6 .6h3.2v-1.4l-.8-.9h-2.4z" fill="#FFA88F"/></g>';
      var marks = J.filter(function(j){ return j.proof; }).map(function(j){ return '<circle cx="'+j.x+'" cy="'+j.y+'" r="1.2" fill="#fff" stroke="#17703F" stroke-width=".6"/>'; }).join('');
      var sel = job(officeSel);
      var proof = sel && sel.proof ? '<div class="proof"><div class="proof-h"><b>Proof of '+sel.type.toLowerCase()+' · '+sel.id+'</b><span class="pill p-ok">Verified</span></div>'+
          '<dl><div><dt>Customer</dt><dd>'+esc(sel.cust)+'</dd></div><div><dt>Completed</dt><dd>Today, '+sel.proof.time+'</dd></div><div><dt>GPS</dt><dd>'+sel.proof.geo.lat+', '+sel.proof.geo.lng+' (±'+sel.proof.acc+' m)</dd></div><div><dt>Signed by</dt><dd>'+esc(sel.proof.name)+'</dd></div></dl>'+
          (sel.proof.photos.length ? '<div class="proof-photos">'+sel.proof.photos.map(function(p){ return '<img src="'+p+'" alt="Proof photo">'; }).join('')+'</div>' : '<p class="note">Photos stored in the job file.</p>')+
          (sel.proof.sig ? '<img class="proof-sig" src="'+sel.proof.sig+'" alt="Customer signature">' : '')+
          '<div class="ai-box"><div class="ai-h">AI check</div>'+(sel.type==='Delivery'?'Photo shows the delivered goods at the drop-off point. Location is within 15 m of the delivery address. Signature present.':'All checklist items confirmed. Location matches the customer address. No follow-up needed.')+'</div>'+
          '<div class="btn-row"><button type="button" class="btn btn-ink btn-sm" data-f="mail">Email proof to customer</button></div></div>'
        : sel ? '<div class="proof"><p class="note">'+esc(sel.id)+' is '+sel.status.toLowerCase()+'. Proof appears here as soon as the technician submits it.</p></div>' : '';
      office.innerHTML = '<div class="f-head"><b>Office · live view</b><span class="note">Today · 3 jobs · 1 technician</span></div>'+
        '<svg class="f-map" viewBox="0 0 100 100" role="img" aria-label="Map with job locations">'+MAPBG+marks+pins+vanG+'</svg>'+
        '<div class="f-legend"><span><i style="background:#2F6690"></i>Assigned</span><span><i style="background:#E0663F"></i>In progress</span><span><i style="background:#17703F"></i>Done</span><span><i style="background:#0E1B22"></i>Technician</span></div>'+
        '<div class="f-jobs">'+J.map(function(j, i){ return '<button type="button" class="f-job'+(j.id===officeSel?' sel':'')+'" data-oj="'+j.id+'"><span class="f-n">'+(i+1)+'</span><span><b>'+esc(j.title)+'</b><small>'+esc(j.cust)+' · '+j.eta+'</small></span><span class="pill '+stCls2(j.status)+'">'+j.status+'</span></button>'; }).join('')+'</div>'+proof;
    }

    function phoneHead(title, back){ return '<div class="ph-top">'+(back?'<button type="button" class="ph-back" data-f="'+back+'" aria-label="Back">‹</button>':'<span></span>')+'<b>'+title+'</b><span class="ph-time">'+new Date().toTimeString().slice(0,5)+'</span></div>'; }
    function stepper(n){ return '<ol class="ph-steps">'+['Location','Photos','Sign'].map(function(t,i){ return '<li class="'+(i<n?'done':i===n?'cur':'')+'">'+t+'</li>'; }).join('')+'</ol>'; }
    function renderPhone(){
      var j = cur && job(cur), h = '';
      if(stepN==='list'){
        h = phoneHead('My jobs today')+'<div class="ph-body">'+J.map(function(x){ return '<button type="button" class="ph-job" data-pj="'+x.id+'"><span class="ph-type t-'+x.type.toLowerCase()+'">'+x.type+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.addr)+' · '+x.eta+'</small><span class="pill '+stCls2(x.status)+'">'+x.status+'</span></button>'; }).join('')+'</div>';
      } else if(stepN==='job'){
        h = phoneHead(j.id, 'list')+'<div class="ph-body"><span class="ph-type t-'+j.type.toLowerCase()+'">'+j.type+'</span><h4>'+esc(j.title)+'</h4><p class="ph-meta">'+esc(j.cust)+'<br>'+esc(j.addr)+' · planned '+j.eta+'</p>'+
          '<ul class="ph-list">'+j.check.map(function(c){ return '<li>'+esc(c)+'</li>'; }).join('')+'</ul>'+
          (j.status==='Done' ? '<div class="ai-box"><div class="ai-h">Completed</div>Proof submitted at '+j.proof.time+'.</div>' :
           j.status==='Assigned' ? '<button type="button" class="btn btn-ink" data-f="route">Start route</button>' :
           '<button type="button" class="btn btn-ink" data-f="checkin">I have arrived · check in</button>')+'</div>';
      } else if(stepN==='checkin'){
        var mk = mark ? pinSvg(mark.x, mark.y, '#E0663F', '', true) : '';
        h = phoneHead('Check in', 'job')+stepper(0)+'<div class="ph-body"><p class="ph-meta">Tap the map to mark where you are, or use your device location.</p>'+
          '<svg class="ph-map" viewBox="0 0 100 100" role="img" aria-label="Tap to mark your location">'+MAPBG+pinSvg(j.x, j.y, '#2F6690', '')+mk+'</svg>'+
          '<button type="button" class="btn btn-ghost btn-sm" data-f="gps">Use device location</button>'+
          '<p class="ph-geo" id="f-geo" role="status">'+(mark ? 'Location '+mark.geo.lat+', '+mark.geo.lng+' · ±'+mark.acc+' m'+(mark.dist!=null?' · '+mark.dist+' m from address':'') : 'No location yet')+'</p>'+
          '<button type="button" class="btn btn-ink" data-f="to-photos"'+(mark?'':' disabled')+'>Confirm location</button></div>';
      } else if(stepN==='photos'){
        h = phoneHead('Photos', 'checkin')+stepper(1)+'<div class="ph-body"><p class="ph-meta">Take photos as proof: the goods, the work, the meter reading.</p>'+
          '<label class="ph-cam" for="f-cam"><input type="file" id="f-cam" accept="image/*" capture="environment" multiple><b>Take or upload photos</b><span>Opens the camera on phones</span></label>'+
          '<button type="button" class="btn btn-ghost btn-sm" data-f="sample">Add a sample photo</button>'+
          '<div class="ph-thumbs">'+photos.map(function(p, i){ return '<span><img src="'+p+'" alt="Photo '+(i+1)+'"><button type="button" data-rmph="'+i+'" aria-label="Remove photo '+(i+1)+'">×</button></span>'; }).join('')+'</div>'+
          '<button type="button" class="btn btn-ink" data-f="to-sign"'+(photos.length?'':' disabled')+'>Continue ('+photos.length+' photo'+(photos.length===1?'':'s')+')</button></div>';
      } else if(stepN==='sign'){
        h = phoneHead('Confirm & sign', 'photos')+stepper(2)+'<div class="ph-body"><fieldset class="ph-checks"><legend>Checklist</legend>'+j.check.map(function(c, i){ return '<label class="chk"><input type="checkbox" data-ci="'+i+'" checked> '+esc(c)+'</label>'; }).join('')+'</fieldset>'+
          '<label for="f-note">Notes<textarea id="f-note" placeholder="Anything the office should know"></textarea></label>'+
          '<label for="f-name">Received by<input id="f-name" placeholder="Customer name"></label>'+
          '<div class="sig-wrap"><span>Customer signature</span><canvas id="f-sig" width="560" height="200" aria-label="Signature pad"></canvas><button type="button" class="btn btn-ghost btn-sm" data-f="clear">Clear</button></div>'+
          '<p class="note" id="f-err" role="status"></p><button type="button" class="btn btn-ink" data-f="submit">Submit proof</button></div>';
      } else if(stepN==='done'){
        h = phoneHead('Submitted')+'<div class="ph-body ph-done"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="var(--teal-soft)"/><path d="m15 24.5 6 6 12-13" fill="none" stroke="var(--teal)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg><h4>Proof sent</h4><p class="ph-meta">'+j.id+' is complete. The office and the customer have the proof with time, location, photos and signature.</p><button type="button" class="btn btn-ink" data-f="list">Back to my jobs</button></div>';
      }
      phone.innerHTML = h;
      if(stepN==='sign') initSig();
    }
    function initSig(){
      var c = $('#f-sig', fld), g = c.getContext('2d'), down = false; sigDirty = false;
      g.lineWidth = 3.2; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#0E1B22';
      var pt = function(e){ var r = c.getBoundingClientRect(); return {x:(e.clientX-r.left)*c.width/r.width, y:(e.clientY-r.top)*c.height/r.height}; };
      c.addEventListener('pointerdown', function(e){ down = true; c.setPointerCapture(e.pointerId); var p = pt(e); g.beginPath(); g.moveTo(p.x, p.y); });
      c.addEventListener('pointermove', function(e){ if(!down) return; var p = pt(e); g.lineTo(p.x, p.y); g.stroke(); sigDirty = true; });
      c.addEventListener('pointerup', function(){ down = false; });
    }
    function samplePhoto(){
      var c = document.createElement('canvas'); c.width = 320; c.height = 240; var g = c.getContext('2d'), j = job(cur);
      var grd = g.createLinearGradient(0,0,0,240); grd.addColorStop(0,'#CFE3EA'); grd.addColorStop(1,'#E9E2D6'); g.fillStyle = grd; g.fillRect(0,0,320,240);
      g.fillStyle = '#B9AE9C'; g.fillRect(0,170,320,70);
      if(j.type==='Delivery'){ g.fillStyle = '#C8A27A'; g.fillRect(60,110,90,70); g.fillRect(170,120,90,60); g.fillStyle = '#8A6A4A'; g.fillRect(60,176,90,8); g.fillRect(170,176,90,8); }
      else { g.fillStyle = '#E8ECEC'; g.fillRect(110,50,100,130); g.fillStyle = '#5B6B73'; g.beginPath(); g.arc(160,100,22,0,7); g.fill(); g.fillStyle = '#17A39D'; g.fillRect(130,140,60,10); }
      g.fillStyle = 'rgba(14,27,34,.65)'; g.fillRect(0,214,320,26); g.fillStyle = '#fff'; g.font = '12px sans-serif';
      g.fillText(j.id+' · '+new Date().toTimeString().slice(0,5)+' · '+(mark?mark.geo.lat+', '+mark.geo.lng:''), 8, 231);
      return c.toDataURL('image/jpeg', .8);
    }
    function moveVan(to, done){
      var from = {x:van.x, y:van.y}, t0 = performance.now(), dur = 2200;
      var tick = function(now){ var k = Math.min(1, (now-t0)/dur), e2 = k<.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2;
        van.x = from.x + (to.x-from.x)*e2; van.y = from.y + (to.y-from.y)*e2; renderOffice();
        if(k<1) requestAnimationFrame(tick); else done && done(); };
      if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ van.x = to.x; van.y = to.y; renderOffice(); done && done(); } else requestAnimationFrame(tick);
    }

    fld.addEventListener('click', function(e){
      var map = e.target.closest('.ph-map');
      if(map && stepN==='checkin'){
        var r = map.getBoundingClientRect(), x = (e.clientX-r.left)/r.width*100, y = (e.clientY-r.top)/r.height*100, j = job(cur);
        mark = {x:x, y:y, geo:toGeo(x,y), acc:8, dist:Math.round(Math.hypot(x-j.x, y-j.y)*9)}; renderPhone(); return;
      }
      var t = e.target.closest('button'); if(!t || !fld.contains(t)) return;
      if(t.dataset.pj){ cur = t.dataset.pj; stepN = 'job'; officeSel = cur; renderPhone(); renderOffice(); return; }
      if(t.dataset.oj){ officeSel = t.dataset.oj; renderOffice(); return; }
      if(t.dataset.rmph!=null){ photos.splice(+t.dataset.rmph, 1); renderPhone(); return; }
      var f = t.dataset.f, j = cur && job(cur);
      if(f==='list'){ stepN = 'list'; cur = null; renderPhone(); }
      else if(f==='job'){ stepN = 'job'; renderPhone(); }
      else if(f==='route'){ j.status = 'On the way'; renderPhone(); renderOffice(); toastF('Route started. Customer gets a live arrival link.'); moveVan({x:j.x, y:j.y+4}, function(){ toastF('Arrived at '+j.addr); }); }
      else if(f==='checkin'){ stepN = 'checkin'; mark = null; renderPhone(); }
      else if(f==='gps'){
        var out = $('#f-geo', fld);
        if(!navigator.geolocation){ out.textContent = 'Location is not available here. Tap the map instead.'; return; }
        out.textContent = 'Getting your location…';
        navigator.geolocation.getCurrentPosition(function(p){ mark = {x:j.x+1, y:j.y+1, geo:{lat:p.coords.latitude.toFixed(5), lng:p.coords.longitude.toFixed(5)}, acc:Math.round(p.coords.accuracy), dist:null}; renderPhone(); },
          function(){ out.textContent = 'Location access was blocked. Tap the map to mark your position instead.'; }, {timeout:6000});
      }
      else if(f==='to-photos'){ j.status = 'On site'; j.checkin = new Date().toTimeString().slice(0,5); stepN = 'photos'; renderPhone(); renderOffice(); toastF('Checked in at '+j.checkin); }
      else if(f==='sample'){ photos.push(samplePhoto()); renderPhone(); }
      else if(f==='to-sign'){ stepN = 'sign'; renderPhone(); }
      else if(f==='clear'){ var c = $('#f-sig', fld); c.getContext('2d').clearRect(0,0,c.width,c.height); sigDirty = false; }
      else if(f==='submit'){
        var name = $('#f-name', fld).value.trim(), err = $('#f-err', fld);
        if(!name){ err.className='note err'; err.textContent='Enter the name of the person who received it.'; $('#f-name', fld).focus(); return; }
        if(!sigDirty){ err.className='note err'; err.textContent='Ask the customer to sign in the box.'; return; }
        var done = [].filter.call(fld.querySelectorAll('[data-ci]'), function(x){ return x.checked; }).map(function(x){ return j.check[+x.dataset.ci]; });
        j.proof = {time:new Date().toTimeString().slice(0,5), geo:mark.geo, acc:mark.acc, photos:photos.slice(), sig:$('#f-sig', fld).toDataURL(), name:name, notes:$('#f-note', fld).value, done:done};
        j.status = 'Done'; officeSel = j.id; photos = []; mark = null; stepN = 'done'; renderPhone(); renderOffice(); toastF('Proof received in the office');
      }
      else if(f==='mail'){ toastF('Proof emailed to '+job(officeSel).cust); }
    });
    fld.addEventListener('change', function(e){
      if(e.target.id==='f-cam' && e.target.files.length){
        var files = [].slice.call(e.target.files, 0, 6), left = files.length;
        files.forEach(function(file){ var rd = new FileReader(); rd.onload = function(){ photos.push(rd.result); if(--left===0) renderPhone(); }; rd.readAsDataURL(file); });
      }
    });
    renderPhone(); renderOffice();
  }
  })();

  (function(){
  /* =================== CAR DEALER MARKETPLACE =================== */
  var car = $('#demo-car');
  if(car){
    var C = [
      {id:1, make:'Volkswagen', model:'ID.4 Pro', year:2023, km:18500, fuel:'Electric', gear:'Automatic', hp:204, price:36900, market:38600, body:'SUV', col:'#2F5D8A', seats:5, feat:['Heat pump','Adaptive cruise','Wireless CarPlay','Range 520 km']},
      {id:2, make:'BMW', model:'320d Touring', year:2021, km:54200, fuel:'Diesel', gear:'Automatic', hp:190, price:29900, market:30400, body:'Estate', col:'#1E2A33', seats:5, feat:['M Sport package','LED headlights','Tow bar','Parking assistant']},
      {id:3, make:'Toyota', model:'Corolla Hybrid', year:2022, km:31800, fuel:'Hybrid', gear:'Automatic', hp:140, price:22400, market:23900, body:'Hatchback', col:'#C8CDD2', seats:5, feat:['Lane keeping','Reversing camera','Keyless entry','5-year warranty']},
      {id:4, make:'Tesla', model:'Model 3 Long Range', year:2022, km:42000, fuel:'Electric', gear:'Automatic', hp:351, price:31900, market:31500, body:'Sedan', col:'#B3262E', seats:5, feat:['Autopilot','Glass roof','Premium audio','Range 600 km']},
      {id:5, make:'Skoda', model:'Octavia Combi', year:2020, km:78900, fuel:'Petrol', gear:'Manual', hp:150, price:16900, market:17800, body:'Estate', col:'#4E7A5A', seats:5, feat:['Navigation','Heated seats','Large boot 640 l','Full service history']},
      {id:6, make:'Audi', model:'Q5 40 TDI quattro', year:2021, km:61500, fuel:'Diesel', gear:'Automatic', hp:204, price:37500, market:36200, body:'SUV', col:'#6B7176', seats:5, feat:['All-wheel drive','Virtual cockpit','Matrix LED','Panorama roof']},
      {id:7, make:'Hyundai', model:'Ioniq 5', year:2023, km:12400, fuel:'Electric', gear:'Automatic', hp:229, price:39900, market:41900, body:'SUV', col:'#D8D2C4', seats:5, feat:['800 V fast charging','Heat pump','Vehicle-to-load','Range 480 km']},
      {id:8, make:'Ford', model:'Fiesta ST-Line', year:2019, km:48300, fuel:'Petrol', gear:'Manual', hp:100, price:11900, market:12200, body:'Hatchback', col:'#E0663F', seats:5, feat:['Sport seats','Apple CarPlay','Cruise control','Low running costs']},
      {id:9, make:'Mercedes-Benz', model:'C 300 e', year:2022, km:27600, fuel:'Hybrid', gear:'Automatic', hp:313, price:42900, market:44100, body:'Sedan', col:'#ECEDEE', seats:5, feat:['Plug-in hybrid','Burmester audio','Ambient lighting','MBUX assistant']},
      {id:10, make:'Volvo', model:'XC40 Recharge', year:2021, km:39800, fuel:'Electric', gear:'Automatic', hp:231, price:30900, market:32300, body:'SUV', col:'#3B4C5C', seats:5, feat:['Google built-in','360° camera','Pilot assist','Range 420 km']}
    ];
    var draw = function(c){
      var k = c.col, glass = '#BFD3DD', w = '<circle cx="46" cy="86" r="11" fill="#1B232A"/><circle cx="46" cy="86" r="5" fill="#9AA6AE"/><circle cx="134" cy="86" r="11" fill="#1B232A"/><circle cx="134" cy="86" r="5" fill="#9AA6AE"/>';
      var b = {
        SUV:'<path d="M18 80 V62 Q20 54 30 52 L52 36 Q58 32 66 32 H122 Q132 32 138 40 L150 52 Q164 54 166 64 V80 Z" fill="'+k+'"/><path d="M58 40 H90 V54 H44 Z M96 40 H124 L136 54 H96 Z" fill="'+glass+'"/>',
        Sedan:'<path d="M14 80 V66 Q16 58 30 56 L56 40 Q64 36 74 36 H112 Q122 36 130 44 L144 56 Q164 58 166 68 V80 Z" fill="'+k+'"/><path d="M62 44 H90 V56 H48 Z M96 44 H118 Q124 44 128 50 L134 56 H96 Z" fill="'+glass+'"/>',
        Hatchback:'<path d="M22 80 V64 Q24 56 34 54 L56 38 Q62 34 70 34 H118 Q126 34 132 42 L146 58 Q158 60 158 68 V80 Z" fill="'+k+'"/><path d="M62 42 H90 V56 H46 Z M96 42 H120 L134 56 H96 Z" fill="'+glass+'"/>',
        Estate:'<path d="M14 80 V64 Q16 56 28 54 L50 38 Q56 34 64 34 H150 Q158 34 160 44 L164 58 Q168 62 168 68 V80 Z" fill="'+k+'"/><path d="M56 42 H88 V56 H42 Z M94 42 H124 V56 H94 Z M130 42 H152 L156 56 H130 Z" fill="'+glass+'"/>'
      }[c.body];
      return '<svg viewBox="0 0 180 104" aria-hidden="true"><ellipse cx="90" cy="96" rx="78" ry="5" fill="rgba(14,27,34,.12)"/>'+b+'<rect x="18" y="68" width="10" height="4" rx="2" fill="#FFE6A8"/>'+w+'</svg>';
    };
    var money = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
    var kmf = function(n){ return n.toLocaleString('en-US') + ' km'; };
    var rating = function(c){ var d = c.market - c.price; return d >= 1200 ? ['Great price','p-ok'] : d >= 0 ? ['Fair price','p-info'] : ['Above market','p-warn']; };
    var f = {make:'All', body:'All', fuel:'All', max:45000, kmMax:100000, sort:'best'}, saved = [], cmp = [], reserved = [], lastF;
    var grid = $('#c-grid', car), panel = $('#c-panel', car), scrim = $('#c-scrim', car);
    var byId = function(id){ return C.filter(function(c){ return c.id===id; })[0]; };
    var toastC = function(t){ var el = $('#c-toast', car); el.textContent = t; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('on'); }, 2400); };
    function topCounts(){ $('#c-savedn', car).textContent = saved.length; $('#c-cmpn', car).textContent = cmp.length; $('#c-cmpbtn', car).disabled = cmp.length < 2; }
    function list(){
      var L = C.filter(function(c){ return (f.make==='All'||c.make===f.make) && (f.body==='All'||c.body===f.body) && (f.fuel==='All'||c.fuel===f.fuel) && c.price<=f.max && c.km<=f.kmMax; });
      var s = {best:function(a,b){ return (b.market-b.price)-(a.market-a.price); }, low:function(a,b){ return a.price-b.price; }, km:function(a,b){ return a.km-b.km; }, new:function(a,b){ return b.year-a.year; }}[f.sort];
      return L.sort(s);
    }
    function renderGrid(){
      var L = list();
      $('#c-count', car).textContent = L.length + ' car' + (L.length===1?'':'s') + ' in stock';
      grid.innerHTML = L.length ? L.map(function(c){ var r = rating(c), sv = saved.indexOf(c.id)>-1, cp = cmp.indexOf(c.id)>-1, rs = reserved.indexOf(c.id)>-1;
        return '<article class="car"><button type="button" class="car-art" data-open="'+c.id+'" aria-label="View '+esc(c.make+' '+c.model)+'">'+draw(c)+(rs?'<span class="pill p-warn car-res">Reserved</span>':'')+'</button>'+
          '<button type="button" class="heart'+(sv?' on':'')+'" data-save="'+c.id+'" aria-pressed="'+sv+'" aria-label="Save '+esc(c.make+' '+c.model)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>'+
          '<div class="car-info"><span class="pill '+r[1]+'">'+r[0]+'</span><b>'+esc(c.make)+' '+esc(c.model)+'</b><span class="car-spec">'+c.year+' · '+kmf(c.km)+' · '+c.fuel+' · '+c.gear+'</span>'+
          '<div class="car-row"><strong>'+money(c.price)+'</strong><span>or '+money(rate(c.price, c.price*.2, 48))+'/mo</span></div>'+
          '<label class="chk cmp"><input type="checkbox" data-cmp="'+c.id+'"'+(cp?' checked':'')+'> Compare</label></div></article>'; }).join('')
        : '<p class="empty" style="grid-column:1/-1">No cars match. Raise the price or mileage limit, or set the filters back to All.</p>';
      car.querySelectorAll('[data-body]').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.body===f.body); });
    }
    function rate(price, down, months){ var p = Math.max(0, price-down), i = 0.049/12; return p ? p*i/(1-Math.pow(1+i,-months)) : 0; }
    function open(html, label){ if(panel.hidden) lastF = document.activeElement; panel.innerHTML = '<button type="button" class="s-close" data-close aria-label="Close">×</button>'+html; panel.setAttribute('aria-label', label); panel.hidden = false; scrim.hidden = false; requestAnimationFrame(function(){ panel.classList.add('on'); scrim.classList.add('on'); (panel.querySelector('input,select,button:not(.s-close)')||panel).focus(); }); }
    function close(){ panel.classList.remove('on'); scrim.classList.remove('on'); setTimeout(function(){ panel.hidden = true; scrim.hidden = true; }, 220); if(lastF) lastF.focus(); }
    function detail(id){
      var c = byId(id), r = rating(c), d = c.market - c.price;
      open('<div class="pd-art car-big">'+draw(c)+'</div><span class="pill '+r[1]+'">'+r[0]+'</span><h3 style="margin-top:8px">'+esc(c.make+' '+c.model)+'</h3>'+
        '<dl class="specs"><div><dt>First registration</dt><dd>'+c.year+'</dd></div><div><dt>Mileage</dt><dd>'+kmf(c.km)+'</dd></div><div><dt>Fuel</dt><dd>'+c.fuel+'</dd></div><div><dt>Gearbox</dt><dd>'+c.gear+'</dd></div><div><dt>Power</dt><dd>'+c.hp+' hp</dd></div><div><dt>Body</dt><dd>'+c.body+'</dd></div></dl>'+
        '<ul class="feat">'+c.feat.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ul>'+
        '<div class="ai-box"><div class="ai-h">AI price analysis</div>'+(d>=0 ? 'This car is <b>'+money(d)+' below</b> the market average of '+money(c.market)+' for comparable '+c.make+' '+c.model.split(' ')[0]+' models with similar mileage.' : 'This car is <b>'+money(-d)+' above</b> the market average, explained by low mileage and extra equipment.')+'</div>'+
        '<div class="fin"><b>Financing</b><label for="fin-d">Down payment <span id="fin-dv">'+money(c.price*.2)+'</span><input type="range" id="fin-d" min="0" max="'+Math.round(c.price*.6)+'" step="500" value="'+Math.round(c.price*.2/500)*500+'"></label>'+
        '<label for="fin-t">Term<select id="fin-t"><option>24</option><option>36</option><option selected>48</option><option>60</option></select></label>'+
        '<p class="fin-rate"><span id="fin-r">'+money(rate(c.price, c.price*.2, 48))+'</span> per month · 4.9% APR</p></div>'+
        '<div class="pd-buy"><strong>'+money(c.price)+'</strong></div><div class="co"><button type="button" class="btn btn-ink" data-td="'+c.id+'">Book a test drive</button><button type="button" class="btn btn-ghost" data-res="'+c.id+'"'+(reserved.indexOf(c.id)>-1?' disabled':'')+'>'+(reserved.indexOf(c.id)>-1?'Reserved for you':'Reserve for 48 hours')+'</button></div>', c.make+' '+c.model);
      panel.dataset.car = c.id;
    }
    function days(){ var out = [], d = new Date(); for(var i=1;i<=7;i++){ var x = new Date(d); x.setDate(d.getDate()+i); if(x.getDay()!==0) out.push(x.toLocaleDateString('en-GB',{weekday:'short', day:'numeric', month:'short'})); } return out; }
    function testDrive(id){
      var c = byId(id);
      open('<h3>Book a test drive</h3><p>'+esc(c.make+' '+c.model)+' · '+money(c.price)+'</p><form id="td-f" class="co" novalidate style="margin-top:12px"><label for="td-n">Name<input id="td-n" autocomplete="name"></label><label for="td-e">Email<input id="td-e" type="email" autocomplete="email"></label>'+
        '<label for="td-d">Day<select id="td-d">'+days().map(function(x){ return '<option>'+x+'</option>'; }).join('')+'</select></label><fieldset class="slots"><legend>Time</legend>'+['09:00','11:00','14:00','16:30'].map(function(t,i){ return '<label class="radio"><input type="radio" name="td-t" value="'+t+'"'+(i===1?' checked':'')+'><span><b>'+t+'</b></span></label>'; }).join('')+'</fieldset>'+
        '<label class="chk big"><input type="checkbox" id="td-ti"> <span><b>I have a car to trade in</b><small>We prepare a valuation for the appointment.</small></span></label><p class="note" id="td-err" role="status"></p><button class="btn btn-ink" type="submit">Confirm test drive</button><button class="btn btn-ghost" type="button" data-open="'+c.id+'">Back to the car</button></form>', 'Book a test drive');
      panel.dataset.car = c.id;
    }
    function compare(){
      var L = cmp.map(byId), rows = [['Price',function(c){ return money(c.price); }],['Year',function(c){ return c.year; }],['Mileage',function(c){ return kmf(c.km); }],['Fuel',function(c){ return c.fuel; }],['Power',function(c){ return c.hp+' hp'; }],['Price rating',function(c){ return rating(c)[0]; }],['Monthly (48 mo)',function(c){ return money(rate(c.price,c.price*.2,48)); }]];
      var best = L.slice().sort(function(a,b){ return (b.market-b.price)/b.market*100 - b.km/20000 - ((a.market-a.price)/a.market*100 - a.km/20000); })[0];
      open('<h3>Compare cars</h3><div class="cmp-wrap"><table class="cmp-t"><thead><tr><th></th>'+L.map(function(c){ return '<th>'+draw(c)+'<b>'+esc(c.make+' '+c.model)+'</b></th>'; }).join('')+'</tr></thead><tbody>'+
        rows.map(function(r){ return '<tr><th>'+r[0]+'</th>'+L.map(function(c){ return '<td>'+r[1](c)+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table></div>'+
        '<div class="ai-box"><div class="ai-h">AI recommendation</div>The <b>'+esc(best.make+' '+best.model)+'</b> gives the best value: '+(best.market-best.price>=0?money(best.market-best.price)+' under market price':'well equipped')+' with '+kmf(best.km)+'.</div><button type="button" class="btn btn-ink" style="width:100%;margin-top:12px" data-open="'+best.id+'">View the '+esc(best.model)+'</button>', 'Compare cars');
    }
    function tradeIn(){
      open('<h3>What is my car worth?</h3><p>Get an instant AI estimate. We confirm the price at the inspection.</p><form id="ti-f" class="co" novalidate style="margin-top:12px"><div class="row2"><label for="ti-m">Make<input id="ti-m" placeholder="e.g. Volkswagen"></label><label for="ti-mo">Model<input id="ti-mo" placeholder="e.g. Golf"></label></div>'+
        '<div class="row2"><label for="ti-y">Year<select id="ti-y">'+[2024,2023,2022,2021,2020,2019,2018,2017,2016,2015].map(function(y){ return '<option>'+y+'</option>'; }).join('')+'</select></label><label for="ti-k">Mileage (km)<input id="ti-k" type="number" min="0" step="1000" placeholder="e.g. 65000"></label></div>'+
        '<label for="ti-c">Condition<select id="ti-c"><option value="1.06">Very good</option><option value="1" selected>Good</option><option value=".88">Fair</option></select></label><p class="note" id="ti-err" role="status"></p><button class="btn btn-ink" type="submit">Get my estimate</button></form><div id="ti-out"></div>', 'Trade-in valuation');
    }
    function aiSearch(q){
      var o = {make:'All', body:'All', fuel:'All', max:45000, kmMax:100000, sort:'best'}, why = [];
      var m = q.match(/(?:under|below|max|up to|\$|€)\s*[$€]?\s*([\d.,]+)\s*(k)?/i); if(m){ o.max = parseInt(m[1].replace(/[.,]/g,''),10) * (m[2]?1000:1); if(o.max < 1000) o.max *= 1000; why.push('under '+money(o.max)); }
      if(/electric|ev\b/i.test(q)){ o.fuel = 'Electric'; why.push('electric'); } else if(/hybrid/i.test(q)){ o.fuel = 'Hybrid'; why.push('hybrid'); } else if(/diesel/i.test(q)){ o.fuel = 'Diesel'; why.push('diesel'); }
      if(/suv|family|kids|space/i.test(q)){ o.body = /estate|wagon|kombi|touring/i.test(q) ? 'Estate' : 'SUV'; why.push(o.body==='SUV'?'SUV for space':'estate'); }
      else if(/estate|wagon|touring|boot/i.test(q)){ o.body = 'Estate'; why.push('estate with a big boot'); }
      else if(/city|small|first car|cheap|student/i.test(q)){ o.body = 'Hatchback'; why.push('compact hatchback'); }
      if(/low (km|mileage)|few km|almost new/i.test(q)){ o.kmMax = 30000; why.push('low mileage'); }
      C.forEach(function(c){ if(q.toLowerCase().indexOf(c.make.toLowerCase())>-1){ o.make = c.make; } }); if(o.make!=='All') why.push(o.make);
      f = o; syncFilters(); renderGrid();
      var n = list().length;
      $('#c-ai-out', car).innerHTML = '<div class="ai-box"><div class="ai-h">AI car finder</div>'+(n ? 'Found <b>'+n+' car'+(n>1?'s':'')+'</b>'+(why.length?' that match: '+why.join(', '):'')+'. Sorted by best value.' : 'No exact match'+(why.length?' for '+why.join(', '):'')+'. Try a higher budget.')+'</div>';
    }
    function syncFilters(){ $('#c-make', car).value = f.make; $('#c-fuel', car).value = f.fuel; $('#c-max', car).value = f.max; $('#c-maxv', car).textContent = money(f.max); $('#c-km', car).value = f.kmMax; $('#c-kmv', car).textContent = kmf(f.kmMax); $('#c-sort', car).value = f.sort; }

    car.addEventListener('click', function(e){
      var t = e.target.closest('button, [data-close]'); if(!t || !car.contains(t)) return;
      if(t.dataset.body){ f.body = t.dataset.body; renderGrid(); return; }
      if(t.dataset.open){ detail(+t.dataset.open); return; }
      if(t.dataset.save){ var id = +t.dataset.save, i = saved.indexOf(id); if(i>-1) saved.splice(i,1); else { saved.push(id); toastC('Saved. We tell you if the price drops.'); } topCounts(); renderGrid(); return; }
      if(t.dataset.td){ testDrive(+t.dataset.td); return; }
      if(t.dataset.res){ var c = byId(+t.dataset.res); reserved.push(c.id); renderGrid(); open('<div class="done-ico"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="var(--teal-soft)"/><path d="m15 24.5 6 6 12-13" fill="none" stroke="var(--teal)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h3>Reserved for 48 hours</h3><p>The '+esc(c.make+' '+c.model)+' is held for you until '+new Date(Date.now()+1728e5).toLocaleDateString('en-GB',{weekday:'long', day:'numeric', month:'long'})+'. A salesperson will call you to arrange the next steps.</p><button type="button" class="btn btn-ink" data-td="'+c.id+'" style="margin-top:16px;width:100%">Also book a test drive</button>', 'Reserved'); return; }
      if(t.id==='c-cmpbtn'){ compare(); return; }
      if(t.id==='c-savedbtn'){ if(!saved.length){ toastC('Tap the heart on a car to save it.'); return; } open('<h3>Saved cars</h3><div class="saved">'+saved.map(function(id){ var c = byId(id); return '<button type="button" class="adv" data-open="'+id+'"><span>'+draw(c)+'</span><b>'+esc(c.make+' '+c.model)+'</b><small>'+money(c.price)+'</small></button>'; }).join('')+'</div>', 'Saved cars'); return; }
      if(t.id==='c-trade'){ tradeIn(); return; }
      if(t.hasAttribute('data-close')){ close(); return; }
      if(t.dataset.ask!=null){ $('#c-ai-q', car).value = t.textContent; aiSearch(t.textContent); return; }
      if(t.id==='c-reset'){ f = {make:'All', body:'All', fuel:'All', max:45000, kmMax:100000, sort:'best'}; syncFilters(); renderGrid(); $('#c-ai-out', car).innerHTML = ''; return; }
    });
    car.addEventListener('change', function(e){
      var t = e.target;
      if(t.dataset.cmp){ var id = +t.dataset.cmp, i = cmp.indexOf(id); if(t.checked){ if(cmp.length>=3){ t.checked = false; toastC('You can compare up to 3 cars.'); return; } cmp.push(id); } else cmp.splice(i,1); topCounts(); return; }
      if(t.id==='c-make'){ f.make = t.value; renderGrid(); } if(t.id==='c-fuel'){ f.fuel = t.value; renderGrid(); } if(t.id==='c-sort'){ f.sort = t.value; renderGrid(); }
      if(t.id==='fin-t'){ upd(); }
    });
    var upd = function(){ var c = byId(+panel.dataset.car), d = +$('#fin-d', car).value, m = +$('#fin-t', car).value; $('#fin-dv', car).textContent = money(d); $('#fin-r', car).textContent = money(rate(c.price, d, m)); };
    car.addEventListener('input', function(e){
      var t = e.target;
      if(t.id==='c-max'){ f.max = +t.value; $('#c-maxv', car).textContent = money(f.max); renderGrid(); }
      if(t.id==='c-km'){ f.kmMax = +t.value; $('#c-kmv', car).textContent = kmf(f.kmMax); renderGrid(); }
      if(t.id==='fin-d'){ upd(); }
    });
    car.addEventListener('submit', function(e){
      e.preventDefault(); var t = e.target;
      if(t.id==='c-ai'){ var q = $('#c-ai-q', car).value.trim(); if(q) aiSearch(q); else $('#c-ai-q', car).focus(); }
      if(t.id==='td-f'){
        var n = $('#td-n', car).value.trim(), em = $('#td-e', car).value.trim(), er = $('#td-err', car);
        if(!n){ er.className='note err'; er.textContent='Add your name.'; $('#td-n', car).focus(); return; }
        if(!/^\S+@\S+\.\S+$/.test(em)){ er.className='note err'; er.textContent='Enter a valid email so we can send the confirmation.'; $('#td-e', car).focus(); return; }
        var c = byId(+panel.dataset.car), day = $('#td-d', car).value, time = (car.querySelector('[name=td-t]:checked')||{}).value, ti = $('#td-ti', car).checked;
        open('<div class="done-ico"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="var(--teal-soft)"/><path d="m15 24.5 6 6 12-13" fill="none" stroke="var(--teal)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h3>See you on '+esc(day)+'</h3><p>Test drive in the <b>'+esc(c.make+' '+c.model)+'</b> at '+time+'. A confirmation is on its way to '+esc(em)+'.</p><div class="ai-box"><div class="ai-h">Prepared for you</div><ul><li>The car is charged or fuelled and ready at the entrance</li><li>Bring your driving licence</li>'+(ti?'<li>Bring your car: we value it during the test drive</li>':'')+'</ul></div><button type="button" class="btn btn-ink" data-close style="width:100%;margin-top:14px">Back to the cars</button>', 'Test drive booked');
      }
      if(t.id==='ti-f'){
        var mk = $('#ti-m', car).value.trim(), mo = $('#ti-mo', car).value.trim(), y = +$('#ti-y', car).value, k = +$('#ti-k', car).value, cond = +$('#ti-c', car).value, er2 = $('#ti-err', car);
        if(!mk || !mo){ er2.className='note err'; er2.textContent='Add the make and model.'; (mk?$('#ti-mo', car):$('#ti-m', car)).focus(); return; }
        if(!k){ er2.className='note err'; er2.textContent='Add the mileage in kilometres.'; $('#ti-k', car).focus(); return; }
        er2.textContent = '';
        var premium = /bmw|audi|mercedes|tesla|volvo|porsche/i.test(mk) ? 1.35 : 1, base = 26000*premium*Math.pow(0.86, 2026-y)*Math.max(0.45, 1-k/300000)*cond;
        typeInto($('#ti-out', car), '<div class="ai-box"><div class="ai-h">AI estimate</div>Your '+esc(mk+' '+mo)+' ('+y+', '+kmf(k)+') is worth about <b>'+money(base*.94)+' – '+money(base*1.06)+'</b>. Based on recent sales of similar cars in your region.</div>');
      }
    });
    car.addEventListener('keydown', function(e){ if(e.key==='Escape' && !panel.hidden) close(); });
    scrim.addEventListener('click', close);
    topCounts(); renderGrid();
  }
  })();

})();
