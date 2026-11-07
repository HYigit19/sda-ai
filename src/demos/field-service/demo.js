/* Field Service & Proof Of Delivery demo. All data is fictional example data. */
(function(){
  var $ = SDA.$, esc = SDA.esc, usd = SDA.usd, typeInto = SDA.typeInto;
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
})();
