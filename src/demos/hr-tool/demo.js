/* Hr Tool demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
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
})();
