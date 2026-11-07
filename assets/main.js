(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s, r){ return (r||document).querySelector(s); };
  var esc = function(x){ return String(x).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

  /* mobile menu */
  var nav = $('.nav'), burger = $('.burger');
  if(burger){ burger.addEventListener('click', function(){ var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }); }
  var yr = $('#yr'); if(yr) yr.textContent = new Date().getFullYear();

  /* ---------- hero: AI prompt bar ---------- */
  var ask = $('#prompt');
  if(ask){
    var data = JSON.parse($('#ask-data').textContent), input = $('#ask-q'), ans = $('#answer'), auto = true, typer, cycle, idx = 0, swapT;
    var KEYS = [
      [/(invoice|approv|email|inbox|process|automat|workflow|order entry|form|paper)/i, 0],
      [/(customer|support|question|chat|assistant|faq|help ?desk|answer)/i, 1],
      [/(data|duplicate|master|clean|quality|report|warehouse|migrat)/i, 2],
      [/(mobile|field|technician|app for|inspection|offline|phone)/i, 3]
    ];
    var EXTRA = {
      'sap-integration': {title:'AI connected to the systems you already run', steps:['Map the data and actions the AI needs in your ERP and CRM','Build secure, approved interfaces with permission checks','Roll out step by step, with testing before go-live'], time:'Scoping in 1–2 weeks', slug:'sap-integration', svc:'Enterprise & SAP integration'},
      'web-applications': {title:'A custom web app with AI built in', steps:['Shape the workflow with your users in a clickable prototype','Build the app in two-week sprints with a demo each time','Add AI features such as search, summaries and assistants'], time:'MVP in 6–12 weeks', slug:'web-applications', svc:'Custom web applications'}
    };
    var match = function(q){
      if(/(sap|erp|crm|integrat|connect|legacy)/i.test(q)) return EXTRA['sap-integration'];
      if(/(portal|web ?app|platform|dashboard|tool|saas|website|shop)/i.test(q)) return EXTRA['web-applications'];
      for(var i=0;i<KEYS.length;i++) if(KEYS[i][0].test(q)) return data[KEYS[i][1]];
      return {title:'Let’s scope this together', steps:['Tell us the process and the systems involved','We map where AI saves the most time','You get a short plan with effort and a first prototype'], time:'Reply within one business day', slug:null, svc:'Discovery call'};
    };
    var render = function(p){
      var steps = p.steps.map(function(t, i){ return '<li><b>Step '+(i+1)+'</b>'+esc(t)+'</li>'; }).join('');
      var link = p.slug ? '<a class="link" href="services/'+p.slug+'.html">See the service <span class="arr">→</span></a>' : '<a class="link" href="contact.html">Book a discovery call <span class="arr">→</span></a>';
      return '<div class="answer-h"><span class="orb"></span><span>Here is how we would build it</span></div><h2>'+esc(p.title)+'</h2><ol class="answer-steps">'+steps+'</ol><div class="answer-foot"><span class="tag"><i></i>'+esc(p.time)+' · '+esc(p.svc)+'</span>'+link+'</div>';
    };
    var show = function(p){
      clearTimeout(swapT);
      if(reduce){ ans.innerHTML = render(p); return; }
      ans.classList.add('out');
      swapT = setTimeout(function(){ ans.innerHTML = render(p); ans.classList.remove('out'); }, 200);
    };
    var typeQ = function(text, done){
      clearInterval(typer); var i = 0; input.value = '';
      if(reduce){ input.value = text; done && done(); return; }
      typer = setInterval(function(){ input.value = text.slice(0, ++i); if(i >= text.length){ clearInterval(typer); done && done(); } }, 38);
    };
    var stopAuto = function(){ auto = false; clearTimeout(cycle); clearInterval(typer); };
    var run = function(){
      if(!auto) return;
      idx = (idx + 1) % data.length;
      typeQ(data[idx].q, function(){ cycle = setTimeout(function(){ if(!auto) return; show(data[idx]); cycle = setTimeout(run, 5200); }, 350); });
    };
    input.value = data[0].q;
    if(!reduce) cycle = setTimeout(run, 4200);
    ['focus','pointerdown','keydown'].forEach(function(ev){ input.addEventListener(ev, function(){ if(auto){ stopAuto(); if(ev==='focus') input.select(); } }); });
    ask.querySelectorAll('.ask-chips button').forEach(function(b){
      b.addEventListener('click', function(){ stopAuto(); var p = data[+b.dataset.i]; input.value = p.q; show(p); });
    });
    $('#ask-form').addEventListener('submit', function(e){
      e.preventDefault(); stopAuto();
      var q = input.value.trim();
      if(!q){ input.focus(); input.placeholder = 'Describe a task, for example “Automate our invoice approvals”'; return; }
      show(match(q));
    });
  }

  /* ---------- tiles: soft spotlight follows the pointer; flow pulse width ---------- */
  document.querySelectorAll('.tile').forEach(function(t){
    t.addEventListener('pointermove', function(e){ var r=t.getBoundingClientRect(); t.style.setProperty('--mx',(e.clientX-r.left)+'px'); t.style.setProperty('--my',(e.clientY-r.top)+'px'); });
  });
  var setFlow = function(){ document.querySelectorAll('.flowv').forEach(function(f){ f.style.setProperty('--w', f.clientWidth+'px'); }); };
  setFlow(); window.addEventListener('resize', setFlow);

  /* ---------- use-case switcher (ARIA tabs) ---------- */
  document.querySelectorAll('.uc-switch').forEach(function(sw){
    var tabs = sw.querySelectorAll(':scope > .uc-tabs [role=tab]');
    var select = function(t, focus){
      tabs.forEach(function(x){
        var on = x === t, p = document.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        p.hidden = !on; p.classList.toggle('in', on && !reduce);
      });
      if(focus) t.focus();
      document.dispatchEvent(new CustomEvent('uc:shown', {detail: t.getAttribute('aria-controls')}));
    };
    tabs.forEach(function(t, n){
      t.addEventListener('click', function(){ select(t); });
      t.addEventListener('keydown', function(e){
        var d = e.key==='ArrowRight' ? 1 : e.key==='ArrowLeft' ? -1 : 0;
        if(d){ e.preventDefault(); select(tabs[(n + d + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* copy email */
  var copy = $('#copy');
  if(copy){ copy.addEventListener('click', function(){
    var el = $('#mail'), t = el.textContent;
    var sel = function(){ var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r); copy.textContent='Selected, press Ctrl+C'; };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){ copy.textContent='Copied'; }, sel); } else sel();
  }); }

  /* lead form */
  var form = $('form.lead');
  if(form){ form.addEventListener('submit', function(e){
    e.preventDefault();
    var n=$('#note'), name=$('#f-name'), em=$('#f-email');
    [name, em].forEach(function(x){ x.removeAttribute('aria-invalid'); });
    if(!name.value.trim()){ n.className='note err'; n.textContent='Please add your name.'; name.setAttribute('aria-invalid','true'); name.focus(); return; }
    if(!/^\S+@\S+\.\S+$/.test(em.value)){ n.className='note err'; n.textContent='Please enter a valid work email, such as jane@company.com.'; em.setAttribute('aria-invalid','true'); em.focus(); return; }
    var btn = form.querySelector('button[type=submit]'), first = name.value.trim().split(' ')[0];
    var data = {}; new FormData(form).forEach(function(v, k){ data[k] = v; });
    btn.disabled = true; n.className = 'note'; n.textContent = 'Sending…';
    fetch(form.getAttribute('action') || '/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)})
      .then(function(r){ return r.json().catch(function(){ return {}; }).then(function(j){ if(!r.ok || !j.ok) throw new Error(j.error || 'failed'); }); })
      .then(function(){ form.reset(); n.className = 'note done'; n.textContent = 'Thanks, '+first+'. We received your request and reply within one business day.'; })
      .catch(function(){ n.className = 'note err'; n.textContent = 'Sending did not work just now. Please email us at '+form.dataset.mail+' and we will reply within one business day.'; })
      .then(function(){ btn.disabled = false; });
  }); }
})();
