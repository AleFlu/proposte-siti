/* This is not red! — il percorso del test: preparazione, calibrazione, test, tremolio, risultato.
   Procedura a scala, stimoli, tremolio e analisi sono quelli dell'artifact originale (tra «inizio copia» e
   «fine copia»); cambiano la navigazione a passi, i nomi delle classi e il diagramma senza colore. */
(()=>{
"use strict";
const {MAC,$,$$,clamp,store,D,t,fmt,WP,AXES,NORM,BORDER,DICH,SHORT,NM,cvdName,Y_LEVELS,Y_BG,gamma,uvY2lin,lin2dev,AX,
  combine,level,analyze}=NR;

/* ---------- navigazione a passi ---------- */
const VIEWS=['preparazione','calibrazione','test','tremolio','risultato'];
let current='';
function route(){
  const h=decodeURIComponent(location.hash.slice(1));
  // i link al profilo e al simulatore dell'originale stavano su questa pagina: ora il simulatore ha la sua
  if(/^profilo-(protan|deutan|tritan)-(\d{1,3})$/.test(h)||h==='simulatore'){location.replace('simulatore.html'+(h==='simulatore'?'':'#'+h));return}
  show(VIEWS.includes(h)?h:'preparazione',!!h);
}
function show(v,scorri){
  if(current==='test'&&v!=='test')pauseTest(true);
  if(current==='tremolio'&&v!=='tremolio')stopFlicker();
  current=v;window.NR_testInCorso=false;
  VIEWS.forEach(x=>{$('#'+x).hidden=x!==v});
  $$('.passi a').forEach(a=>{if(a.dataset.v===v)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current')});
  // sul telefono i passi sono solo numeri: accanto c'è il nome di quello in corso
  $('#passoDi').textContent=$(`.passi a[data-v="${v}"] .etichetta`).textContent;
  markDone();
  if(v==='preparazione')prevHint();
  if(v==='calibrazione')buildCal();
  if(v==='risultato')renderResult();
  if(v==='test')prepTest();
  // il passo nuovo comincia dal suo titolo, non da metà pagina
  if(scorri)$('.percorso').scrollIntoView({block:'start'});
}
function markDone(){
  const s=store.get('cvd-sessions',[]);
  const done={calibrazione:gamma.cal,test:s.length>0,tremolio:!!(s.length&&s[s.length-1].flicker),risultato:false,preparazione:false};
  $$('.passi a').forEach(a=>{const d=!!done[a.dataset.v]&&a.dataset.v!==current;a.classList.toggle('fatto',d);a.querySelector('.stato').textContent=d?' ('+t('stepDone')+')':''});
}
window.addEventListener('hashchange',route);

/* ---------- 1 preparazione ---------- */
(()=>{const ck=store.get('cvd-check',{});$$('.caselle input').forEach(i=>{i.checked=!!ck[i.id];i.addEventListener('change',()=>{ck[i.id]=i.checked;store.set('cvd-check',ck)})});
  })();
function prevHint(){const s=store.get('cvd-sessions',[]);$('#prevHint').innerHTML=s.length?(s.length===1?t('prevHint1'):t('prevHintN',{n:s.length})):''}

/* ---------- 2 calibrazione ---------- */
let calBuilt=false;
const calVal={r:Math.round(255*Math.pow(.5,1/gamma.r)),g:Math.round(255*Math.pow(.5,1/gamma.g)),b:Math.round(255*Math.pow(.5,1/gamma.b))};
function buildCal(){
  const dpr=window.devicePixelRatio||1;
  $('#dprWarn').hidden=Math.abs(dpr-Math.round(dpr))<0.01;
  if(calBuilt)return;calBuilt=true;
  const rows=$('#calRows');rows.innerHTML='';
  const names={r:t('red'),g:t('green'),b:t('blue')};
  for(const ch of['r','g','b']){
    const row=document.createElement('div');row.className='cal-riga';
    row.innerHTML=`<div class="cal-nome"><strong>${names[ch]}</strong><span class="tenue numeri" id="gv-${ch}"></span></div>
      <div class="cal-coppia"><div class="cal-quadri"><canvas id="cs-${ch}"></canvas><div class="cal-pieno" id="cb-${ch}"></div></div><div class="cal-didascalie"><span>${t('calRef')}</span><span>${t('calAdj')}</span></div></div>
      <div class="cal-cursore"><input type="range" id="cr-${ch}" min="110" max="245" value="${calVal[ch]}" aria-label="${t('calLum',{c:names[ch]})}"><div class="direzioni"><span>${t('calDarker')}</span><span>${t('calBrighter')}</span></div></div>`;
    rows.appendChild(row);
    const cv=row.querySelector('canvas');const px=Math.round(110*dpr);cv.width=px;cv.height=px;cv.style.width=(px/dpr)+'px';cv.style.height=(px/dpr)+'px';
    row.querySelector('.cal-pieno').style.height=(px/dpr)+'px';row.querySelector('.cal-pieno').style.width=(px/dpr)+'px';
    const ctx=cv.getContext('2d');const im=ctx.createImageData(px,px);const ci={r:0,g:1,b:2}[ch];const lw=Math.max(1,Math.round(dpr));
    for(let y=0;y<px;y++)for(let x=0;x<px;x++){const i=(y*px+x)*4;im.data[i+ci]=(Math.floor(y/lw)%2===0)?255:0;im.data[i+3]=255}
    ctx.putImageData(im,0,0);
    const sl=row.querySelector('input');const upd=()=>{calVal[ch]=+sl.value;const c=[0,0,0];c[ci]=calVal[ch];row.querySelector('.cal-pieno').style.background=`rgb(${c})`;
      $('#gv-'+ch).textContent='γ ≈ '+fmt(Math.log(.5)/Math.log(calVal[ch]/255),2)};
    sl.addEventListener('input',upd);upd();
  }
  $('#calState').textContent=gamma.cal?t('calSaved',{r:fmt(gamma.r,2),g:fmt(gamma.g,2),b:fmt(gamma.b,2)}):'';
}
$('#calSave').addEventListener('click',()=>{
  const g=ch=>clamp(Math.log(.5)/Math.log(calVal[ch]/255),1.5,3.2);
  // stesso oggetto di misura.js, che lo legge in lin2dev: si aggiorna, non si sostituisce
  Object.assign(gamma,{r:g('r'),g:g('g'),b:g('b'),cal:true});store.set('cvd-gamma',gamma);location.hash='test';});
$('#calSkip').addEventListener('click',()=>{Object.assign(gamma,{r:2.2,g:2.2,b:2.2,cal:false});store.set('cvd-gamma',gamma);location.hash='test';});

/* ---------- 3 test di discriminazione ---------- */
const stage=$('#stage');
let T=null;
const NOISE=new Float32Array(1<<16);for(let i=0;i<NOISE.length;i++)NOISE[i]=Math.random()-0.5;

class Stair{
  constructor(axis){this.axis=axis;this.max=AX[axis].max;this.d=Math.min(0.06,this.max);this.step=1.6;this.wrong=false;this.cc=0;this.last=0;this.rev=[];this.n=0;this.ceil=0;this.log=[]}
  get done(){return this.rev.length>=9||this.n>=48||this.ceil>=4}
  move(dir){if(this.last!==0&&dir!==this.last){this.rev.push(this.d);if(this.rev.length>=2)this.step=1.3;if(this.rev.length>=4)this.step=1.18}
    this.last=dir;this.d=dir<0?Math.max(this.d/this.step,0.0008):Math.min(this.d*this.step,this.max)}
  update(ok){this.n++;this.log.push([this.d,ok?1:0]);
    if(ok){if(!this.wrong)this.move(-1);else if(++this.cc>=2){this.cc=0;this.move(-1)}}
    else{this.wrong=true;this.cc=0;if(this.d>=this.max*0.999)this.ceil++;this.move(1)}}
  result(){const max=this.max*1e4;
    if(this.ceil>=4)return{v:max,ceil:true,max,n:this.n,rev:this.rev.length};
    const r=this.rev.slice(-6);const g=r.length>=3?Math.exp(r.reduce((s,x)=>s+Math.log(x),0)/r.length):this.d;
    return{v:Math.min(g*1e4,max),ceil:g>=this.max*0.97,max,n:this.n,rev:this.rev.length}}
}

function prepTest(){
  if(!T||T.finished){
    $('#testIntro').hidden=false;$('#testDone').hidden=true;
    ['#stage','#pad','#stageActions','#stageStatus','#progBar'].forEach(s=>$(s).hidden=true);$('#feedback').textContent='';
  }
}
function sizeStage(){const dpr=window.devicePixelRatio||1;const css=Math.min(500,$('#stageWrap').clientWidth-32);const S=Math.round(css*dpr);stage.width=S;stage.height=S;stage.style.width=(S/dpr)+'px';stage.style.height=(S/dpr)+'px';}
$('#testStart').addEventListener('click',()=>{
  T={st:{},practice:4,n:0,catchOk:0,catchN:0,trial:null,accept:false,paused:false,finished:false,started:Date.now()};
  AXES.forEach(a=>T.st[a]=new Stair(a));
  $('#testIntro').hidden=true;['#stage','#pad','#stageActions','#stageStatus','#progBar'].forEach(s=>$(s).hidden=false);
  sizeStage();window.NR_testInCorso=true;
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch(e){}
  nextTrial();
});
function makeField(S){
  const R=S*0.47,c=S/2,rmin=S*0.011,rmax=S*0.031,gap=Math.max(1,S*0.004);
  const cell=2*rmax+gap,gw=Math.ceil(S/cell);const grid=new Map();const dots=[];const N=9000;
  for(let k=0;k<N;k++){
    const r=rmin+(rmax-rmin)*(1-k/N)*(0.55+0.45*Math.random());
    const a=Math.random()*Math.PI*2,rho=Math.sqrt(Math.random())*(R-r);
    const x=c+rho*Math.cos(a),y=c+rho*Math.sin(a);
    const gx=Math.floor(x/cell),gy=Math.floor(y/cell);let ok=true;
    for(let i=-1;i<=1&&ok;i++)for(let j=-1;j<=1&&ok;j++){const L=grid.get((gx+i)*gw+gy+j);if(L)for(const d of L){if(Math.hypot(d.x-x,d.y-y)<d.r+r+gap){ok=false;break}}}
    if(!ok)continue;const d={x,y,r};dots.push(d);const key=gx*gw+gy;(grid.get(key)||grid.set(key,[]).get(key)).push(d);
  }
  const map=new Int16Array(S*S).fill(-1);
  dots.forEach((d,id)=>{const x0=Math.max(0,Math.floor(d.x-d.r)),x1=Math.min(S-1,Math.ceil(d.x+d.r)),y0=Math.max(0,Math.floor(d.y-d.r)),y1=Math.min(S-1,Math.ceil(d.y+d.r));const r2=d.r*d.r;
    for(let y=y0;y<=y1;y++){const dy=y+.5-d.y;for(let x=x0;x<=x1;x++){const dx=x+.5-d.x;if(dx*dx+dy*dy<=r2)map[y*S+x]=id}}});
  return{dots,map};
}
function renderTrial(tr){
  const S=stage.width,c=S/2,Ro=S*0.30,Ri=S*0.165,t=Ro-Ri,gh=t*0.55;
  const {dots,map}=makeField(S);
  const col=new Float32Array(dots.length*3);
  const tu=tr.kind==='catch'?WP.u:WP.u+AX[tr.axis].du*tr.d, tv=tr.kind==='catch'?WP.v:WP.v+AX[tr.axis].dv*tr.d;
  dots.forEach((d,i)=>{const x=d.x-c,y=d.y-c,rr=Math.hypot(x,y);
    let gap=false;switch(tr.ori){case'up':gap=y<0&&Math.abs(x)<gh;break;case'down':gap=y>0&&Math.abs(x)<gh;break;case'left':gap=x<0&&Math.abs(y)<gh;break;case'right':gap=x>0&&Math.abs(y)<gh}
    const inC=rr>=Ri&&rr<=Ro&&!gap;
    let Y=Y_LEVELS[(Math.random()*Y_LEVELS.length)|0];
    let u=WP.u,v=WP.v;
    if(inC){if(tr.kind==='catch')Y=Math.min(Y*1.8,0.32);else{u=tu;v=tv}}
    const dv=lin2dev(uvY2lin(u,v,Y));col[i*3]=dv[0];col[i*3+1]=dv[1];col[i*3+2]=dv[2];});
  const bg=lin2dev(uvY2lin(WP.u,WP.v,Y_BG));
  const ctx=stage.getContext('2d');const im=ctx.createImageData(S,S);const D=im.data;let o=(Math.random()*65536)|0;
  for(let p=0;p<S*S;p++){const id=map[p];const q=p*4;let r,g,b;
    if(id<0){r=bg[0];g=bg[1];b=bg[2]}else{r=col[id*3];g=col[id*3+1];b=col[id*3+2]}
    D[q]=r+NOISE[o++&65535]+.5;D[q+1]=g+NOISE[o++&65535]+.5;D[q+2]=b+NOISE[o++&65535]+.5;D[q+3]=255}
  ctx.putImageData(im,0,0);
}
function blank(){const ctx=stage.getContext('2d');const bg=lin2dev(uvY2lin(WP.u,WP.v,Y_BG));ctx.fillStyle=`rgb(${bg.map(Math.round)})`;ctx.fillRect(0,0,stage.width,stage.height)}
const ORI=['up','right','down','left'];
function nextTrial(){
  if(T.paused)return;
  const active=AXES.filter(a=>!T.st[a].done);
  if(!active.length&&T.practice<=0){return finishTest()}
  let tr;const ori=ORI[(Math.random()*4)|0];
  if(T.practice>0){const a=AXES[(Math.random()*3)|0];tr={kind:'practice',axis:a,d:Math.min(0.07,AX[a].max),ori}}
  else if(T.n>0&&T.n%11===0&&!T.lastCatch){tr={kind:'catch',ori}}
  else{const a=active[(Math.random()*active.length)|0];tr={kind:'stair',axis:a,d:T.st[a].d,ori}}
  T.lastCatch=tr.kind==='catch';
  T.trial=tr;T.accept=false;blank();
  setTimeout(()=>{if(T.paused||T.trial!==tr)return;renderTrial(tr);T.accept=true;T.shownAt=performance.now()},350);
  updStatus();
}
function updStatus(){
  const tot=AXES.reduce((s,a)=>s+Math.min(1,Math.max(T.st[a].rev.length/9,T.st[a].n/48,T.st[a].ceil/4)),0)/3;
  $('#progBar i').style.width=(tot*100).toFixed(1)+'%';
  $('#stLeft').textContent=T.practice>0?t('practice',{i:5-T.practice}):t('trial',{n:T.n+1});
  $('#stRight').textContent=t('pctDone',{p:Math.round(tot*100)});
}
function answer(o){
  if(!T||!T.accept||T.paused)return;T.accept=false;const tr=T.trial;const ok=o===tr.ori;
  if(tr.kind==='practice'){T.practice--;$('#feedback').textContent=ok?t('correct'):t('was'+tr.ori)}
  else{$('#feedback').textContent='';T.n++;
    if(tr.kind==='catch'){T.catchN++;if(ok)T.catchOk++}else T.st[tr.axis].update(ok)}
  nextTrial();
}
$('#pad').addEventListener('click',e=>{const b=e.target.closest('button');if(b)answer(b.dataset.o)});
document.addEventListener('keydown',e=>{
  if(current!=='test'||!T||T.finished)return;
  const k={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',' ':'none',n:'none',N:'none'}[e.key];
  if(k){e.preventDefault();answer(k)}else if(e.key==='p'||e.key==='P'){pauseTest()}
});
function pauseTest(force){if(!T||T.finished||$('#stage').hidden)return;
  T.paused=force?true:!T.paused;$('#testPause').textContent=T.paused?t('resume'):t('pause');
  if(T.paused){T.accept=false;blank();$('#feedback').textContent=t('pausedMsg')}
  else{$('#feedback').textContent='';nextTrial()}}
$('#testPause').addEventListener('click',()=>pauseTest());
$('#testAbort').addEventListener('click',()=>{T=null;window.NR_testInCorso=false;prepTest()});
function finishTest(){
  T.finished=true;T.accept=false;window.NR_testInCorso=false;
  const th={};AXES.forEach(a=>th[a]=T.st[a].result());
  const sess={date:new Date().toISOString(),gamma:{...gamma},dpr:window.devicePixelRatio||1,th,catch:{ok:T.catchOk,n:T.catchN},trials:T.n,mins:(Date.now()-T.started)/60000};
  const all=store.get('cvd-sessions',[]);all.push(sess);store.set('cvd-sessions',all.slice(-10));
  ['#stage','#pad','#stageActions','#stageStatus','#progBar'].forEach(s=>$(s).hidden=true);$('#feedback').textContent='';
  $('#testDone').hidden=false;
  $('#testDoneTxt').textContent=t('testDoneTxt',{n:sess.trials,m:fmt(Math.max(1,sess.mins),0)});
  markDone();
}
window.addEventListener('resize',()=>{if(current==='test'&&T&&!T.finished&&!$('#stage').hidden){sizeStage();if(T.trial&&T.accept)renderTrial(T.trial)}});

/* ---------- 4 tremolio ---------- */
const G_LIN=0.09,YG=0.7152*G_LIN,RMIN=0.33,RMAX=0.2126/YG*0.999;
let FL=null;
function flRatio(){const t=+$('#flSlider').value/1000;return Math.exp(Math.log(RMIN)+t*(Math.log(RMAX)-Math.log(RMIN)))}
function flStartRun(){$('#flSlider').value=String(150+Math.floor(Math.random()*700));$('#flMsg').textContent=t('flMsg',{i:FL.runs.length+1})}
$('#flGo').addEventListener('click',()=>{
  FL={runs:[],raf:0};$('#flStart').hidden=true;$('#flField').hidden=false;$('#flDone').hidden=true;flStartRun();
  const surround=lin2dev([YG,YG,YG]).map(Math.round);$('#flField').style.background=`rgb(${surround})`;
  const gcol=`rgb(0,${Math.round(255*Math.pow(G_LIN,1/gamma.g))},0)`;
  const loop=t=>{if(!FL)return;const half=Math.floor(t/(1000/30))%2;
    const rl=flRatio()*YG/0.2126;const rcol=`rgb(${Math.round(255*Math.pow(clamp(rl,0,1),1/gamma.r))},0,0)`;
    $('#flPatch').style.background=half?rcol:gcol;FL.raf=requestAnimationFrame(loop)};
  FL.raf=requestAnimationFrame(loop);
});
$('#flMinus').addEventListener('click',()=>{$('#flSlider').value=String(+$('#flSlider').value-8)});
$('#flPlus').addEventListener('click',()=>{$('#flSlider').value=String(+$('#flSlider').value+8)});
$('#flOk').addEventListener('click',()=>{if(!FL)return;FL.runs.push(flRatio());
  if(FL.runs.length<4){flStartRun();return}
  const r=[...FL.runs].sort((a,b)=>a-b);const med=Math.sqrt(r[1]*r[2]);const spread=r[3]/r[0];
  stopFlicker();
  const all=store.get('cvd-sessions',[]);
  if(all.length){all[all.length-1].flicker={ratio:med,runs:FL_runs_copy,spread};store.set('cvd-sessions',all)}
  $('#flField').hidden=true;$('#flDone').hidden=false;
  $('#flDoneTxt').innerHTML=t('flDone',{r:fmt(med,2),one:fmt(1,2),s:fmt(spread,2)})+(all.length?'':t('flDoneNoTest'));
  markDone();
});
let FL_runs_copy=[];
function stopFlicker(){if(FL){FL_runs_copy=[...FL.runs];cancelAnimationFrame(FL.raf)}FL=null;$('#flPatch').style.background='#555'}
$('#flStop').addEventListener('click',()=>{stopFlicker();$('#flField').hidden=true;$('#flStart').hidden=false});
$('#flRedo').addEventListener('click',()=>{$('#flDone').hidden=true;$('#flStart').hidden=false});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&FL){stopFlicker();$('#flField').hidden=true;$('#flStart').hidden=false}});

// il livello si legge dalla parola e dal segno (vuoto, mezzo, pieno), mai dal solo colore
function chip(l){return`<span class="livello lv${l}"><span aria-hidden="true">${['○','◐','●'][l]}</span> ${t('lv'+l)}</span>`}
function diagramSVG(R){
  const W=440,H=440,cx=W/2,cy=H/2,span=0.115,k=(W/2-36)/span;
  const P=(u,v)=>[cx+(u-WP.u)*k,cy-(v-WP.v)*k];
  const prim=[[0.4507,0.5229],[0.1250,0.5625],[0.1754,0.1579]].map(p=>P(...p).map(n=>n.toFixed(1)).join(',')).join(' ');
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t('svgAria')}"><defs><pattern id="trama" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--inchiostro)" stroke-width="1.5"/></pattern><clipPath id="clp"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>`;
  s+=`<rect x="0" y="0" width="${W}" height="${H}" fill="var(--carta)"/>`;
  for(let g=-0.1;g<=0.1001;g+=0.05){const [x]=P(WP.u+g,0),[,y]=P(0,WP.v+g);s+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="var(--filo)" stroke-width="1"/><line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="var(--filo)" stroke-width="1"/>`}
  s+=`<polygon points="${prim}" fill="none" stroke="var(--grafite)" stroke-dasharray="1 4" clip-path="url(#clp)"/>`;
  const lab={protan:'P',deutan:'D',tritan:'T'};const meas=[],norm=[];
  AXES.forEach(a=>{const {du,dv}=AX[a];const e=0.2;const [x1,y1]=P(WP.u-du*e,WP.v-dv*e),[x2,y2]=P(WP.u+du*e,WP.v+dv*e);
    s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--grafite)" stroke-width="1" clip-path="url(#clp)"/>`;
    const lp=P(WP.u+du*0.104,WP.v+dv*0.104);s+=`<text x="${lp[0]}" y="${lp[1]}" fill="var(--inchiostro)" font-family="var(--numeri)" font-size="13" font-weight="600" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="var(--carta)" stroke-width="4">${lab[a]}</text>`;
    const t=R.th[a].v/1e4,n=NORM[a]/1e4;
    meas.push([P(WP.u+du*t,WP.v+dv*t),P(WP.u-du*t,WP.v-dv*t)]);norm.push([P(WP.u+du*n,WP.v+dv*n),P(WP.u-du*n,WP.v-dv*n)]);});
  const ring=arr=>[arr[0][0],arr[1][1],arr[2][0],arr[0][1],arr[1][0],arr[2][1]];
  const order=pts=>{const c=[cx,cy];return pts.slice().sort((a,b)=>Math.atan2(a[1]-c[1],a[0]-c[0])-Math.atan2(b[1]-c[1],b[0]-c[0]))};
  const poly=pts=>order(pts.flat()).map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ');
  s+=`<polygon points="${poly(norm)}" fill="none" stroke="var(--grafite)" stroke-dasharray="5 4" stroke-width="1.5"/>`;
  s+=`<polygon points="${poly(meas)}" fill="url(#trama)" stroke="var(--inchiostro)" stroke-width="2.5" clip-path="url(#clp)"/>`;
  meas.flat().forEach(p=>{s+=`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="var(--inchiostro)" clip-path="url(#clp)"/>`});
  s+=`<circle cx="${cx}" cy="${cy}" r="3" fill="var(--inchiostro)"/>`;
  s+=`<text x="12" y="${H-12}" fill="var(--grafite)" font-family="var(--numeri)" font-size="11">u′ →  ${t('grid')} ${fmt(0.05,2)}</text><text x="12" y="20" fill="var(--grafite)" font-family="var(--numeri)" font-size="11">v′ ↑</text>`;
  return s+'</svg>';
}
function renderResult(){
  const all=store.get('cvd-sessions',[]);
  $('#resEmpty').hidden=!!all.length;$('#resBody').hidden=!all.length;if(!all.length)return;
  const last=all[all.length-1];
  const useAll=all.length>1&&resMode==='all';
  const R=useAll?combine(all):{th:last.th,flicker:last.flicker||null,catch:last.catch,n:1};
  const A=analyze(R);
  let head,desc,sevBlock='';
  if(A.status==='normal'){head=t('headNormal');desc=t('descNormal')}
  else if(A.status==='border'){head=t('headBorder');desc=t('descBorder')}
  else{head=A.name;const N=NM(A.type);
    desc=A.dich?t('descDich',{cone:N.cone,short:N.short.toLowerCase()}):t('descAnom',{cone:N.cone,short:N.short.toLowerCase(),x:fmt(R.th[A.type].v/NORM[A.type],1)});
    sevBlock=`<div class="misura-intensita"><p class="etichette"><span>${t('sevLabel')}: <strong class="numeri">${Math.round(A.sev*100)}%</strong></span><span>${t('confLabel')}: ${t(A.conf)}</span></p>
      <div class="barra" aria-hidden="true"><i style="width:${(A.sev*100).toFixed(1)}%"></i></div>
      <p class="scala" aria-hidden="true"><span>${t('scaleNormal')}</span>${D()._scale.map(x=>`<span>${x}</span>`).join('')}<span>${NM(A.type).opia.toLowerCase()}</span></p></div>`;}
  const rows=AXES.map(a=>{const t=R.th[a];return`<tr><th scope="row">${SHORT[a]}<span class="tenue">${NM(a).cone}</span></th>
    <td class="num">${t.ceil?'≥ ':''}${Math.round(t.v)}</td><td class="num tenue">≤ ${NORM[a]}</td><td class="num tenue">${Math.round(t.max)}</td><td>${chip(level(a,t.v))}</td></tr>`}).join('');
  const fl=R.flicker?`<section class="riquadro"><h3>${t('flResTitle')}</h3><p>${t('flRes',{r:fmt(R.flicker.ratio,2),a:fmt(1,1),b:fmt(1.35,2),c:fmt(0.9,1)})} ${R.flicker.ratio>1.35?t('flProtan'):R.flicker.ratio<0.9?t('flDeutan'):t('flNorm')}</p></section>`
    :`<p class="nota non-stampa">${t('noFlicker')}</p>`;
  const rel=[];
  rel.push(t('catchRel',{ok:R.catch.ok,n:R.catch.n}));
  rel.push(gamma.cal||last.gamma.cal?t('gammaCal'):t('gammaStd'));
  if(useAll)rel.push(t('meanOf',{n:all.length}));
  const hist=all.length>1?`<section class="riquadro"><div class="riga-titolo"><h3>${t('histTitle')}</h3><div class="scelta-voci non-stampa" id="resSeg"><button type="button" data-r="last" aria-pressed="${resMode!=='all'}">${t('last')}</button><button type="button" data-r="all" aria-pressed="${resMode==='all'}">${t('meanAll')}</button></div></div>
    <div class="tabella" tabindex="0" role="region" aria-label="${t('histTitle')}"><table><thead><tr><th scope="col">${t('colDate')}</th><th scope="col" class="num">Protan</th><th scope="col" class="num">Deutan</th><th scope="col" class="num">Tritan</th><th scope="col" class="num">${t('colFlicker')}</th></tr></thead><tbody>
    ${all.map(s=>`<tr><td>${new Date(s.date).toLocaleString(D()._locale,{dateStyle:'short',timeStyle:'short'})}</td>${AXES.map(a=>`<td class="num">${s.th[a].ceil?'≥':''}${Math.round(s.th[a].v)}</td>`).join('')}<td class="num">${s.flicker?fmt(s.flicker.ratio,2):'—'}</td></tr>`).join('')}
    </tbody></table></div><p class="tenue">${t('histNote')}</p></section>`:'';
  const quando=new Date(last.date).toLocaleString(D()._locale,{dateStyle:'long',timeStyle:'short'});
  $('#resBody').innerHTML=`
    <p class="solo-stampa">${t('printHead',{d:quando})}</p>
    <section class="verdetto"><p class="etichetta-gruppo">${useAll?t('resCombined'):t('resLast')}</p><p class="esito">${head}</p><p>${desc}</p>${sevBlock}
      ${A.notes.map(n=>`<p class="nota attenzione">${n}</p>`).join('')}
      <div class="azioni non-stampa">${A.status==='rg'||A.status==='tritan'?`<a class="btn primario" href="simulatore.html#profilo-${A.type}-${Math.round(A.sev*100)}">${t('openSim')}</a>`:`<a class="btn primario" href="simulatore.html">${t('trySim')}</a>`}
      <a class="btn" href="#test" id="redo">${t('redo')}</a><button type="button" class="btn" id="stampa">${t('printBtn')}</button></div>
      <p class="tenue">${rel.join('. ')}. ${t('adviceRepeat')}</p></section>
    <section class="riquadro"><h3>${t('thTitle')}</h3><div class="tabella" tabindex="0" role="region" aria-label="${t('thTitle')}"><table><thead><tr><th scope="col">${t('colAxis')}</th><th scope="col" class="num">${t('colYour')}</th><th scope="col" class="num">${t('colNormal')}</th><th scope="col" class="num">${t('colMax')}</th><th scope="col">${t('colOutcome')}</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="tenue">${t('thNote')}</p></section>
    <section class="riquadro"><h3>${t('shapeTitle')}</h3><div class="diagramma"><div class="diagramma-figura">${diagramSVG(R)}</div>
      <div class="diagramma-testo"><p>${t('shapeP1')}</p><p>${t('shapeP2')}</p></div></div></section>
    ${fl}${hist}`;
  $('#redo').addEventListener('click',()=>{T=null});
  $('#stampa').addEventListener('click',()=>print());
  const seg=$('#resSeg');if(seg)seg.addEventListener('click',e=>{const b=e.target.closest('button');if(b){resMode=b.dataset.r;renderResult()}});
}
let resMode='last';

route();
})();
