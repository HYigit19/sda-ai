/* Vendor Management demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
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
})();
