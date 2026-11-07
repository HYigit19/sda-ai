/* Facility Management demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
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
})();
