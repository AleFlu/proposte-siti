/* This is not red! — il simulatore. Filtro di Machado, scena di prova, caricamento e strumenti sono quelli
   dell'artifact originale; cambiano l'arrivo dai link condivisi (ora è una pagina sua) e il font della scena. */
(()=>{
"use strict";
const {$,$$,clamp,store,D,t,fmt,cvdName,combine,analyze,macMatrix,DEC,ENC}=NR;
const current='simulatore';
const resMode='last';
// un link condiviso porta qui con #profilo-deutan-60 (stesso formato dell'originale)
let sharedProfile=null;
(()=>{const m=decodeURIComponent(location.hash.slice(1)).match(/^profilo-(protan|deutan|tritan)-(\d{1,3})$/);
  if(m)sharedProfile={type:m[1],sev:clamp(+m[2],0,100)/100};})();
let SIM={type:'deutan',sev:0.6,mode:'split',src:null,inited:false,split:0.5};
function setProfile(t,s){SIM.type=t;SIM.sev=s;$$('#segType button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===t)));$('#sev').value=String(Math.round(s*100));updProfileText();process()}
function updProfileText(){const s=SIM.sev;$('#sevOut').textContent=Math.round(s*100)+'%';
  $('#sevName').textContent=s<0.05?t('noAlt'):cvdName(SIM.type,s);
  const link=location.href.split('#')[0]+`#profilo-${SIM.type}-${Math.round(s*100)}`;$('#shareLink').textContent=link;
  const M=macMatrix(SIM.type,s);const v=M.map(r=>r.map(x=>x.toFixed(4)).join(' ')+' 0 0').join('\n  ')+'\n  0 0 0 1 0';
  $('#svgCode').textContent=`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
 <filter id="mio-daltonismo" color-interpolation-filters="linearRGB">
  <feColorMatrix type="matrix" values="
  ${v}"/>
 </filter>
</svg>
<style>img, video { filter: url(#mio-daltonismo); }</style>`;}
function renderBanner(){const b=$('#simBanner'),B=SIM.banner;if(!B){b.hidden=true;return}b.hidden=false;
  const nm=`${cvdName(B.type,B.sev)}, ${t('intensityPct',{p:Math.round(B.sev*100)})}`;
  // un riquadro sopra il simulatore: di chi è il profilo che stai guardando
  const riga=(eti,suggerimento,azione)=>`<div><p class="etichetta-gruppo">${eti}</p><p class="profilo-nome">${nm}</p>${suggerimento?`<p class="tenue">${suggerimento}</p>`:''}</div>${azione}`;
  if(B.kind==='shared')b.innerHTML=riga(t('sharedEyebrow'),t('sharedHint'),`<a class="btn" href="./">${t('doTestToo')}</a>`);
  else if(B.kind==='mine')b.innerHTML=riga(t('yourProfile'),t('refineHint'),'');
  else b.innerHTML=riga(t('exampleProfile'),t('exampleHint'),`<a class="btn primario" href="./">${t('doTest')}</a>`);}
function initSim(){
  const all=store.get('cvd-sessions',[]);let mine=null;
  if(all.length){const R=resMode==='all'&&all.length>1?combine(all):{th:all[all.length-1].th,flicker:all[all.length-1].flicker||null,catch:all[all.length-1].catch};const A=analyze(R);if(A.status==='rg'||A.status==='tritan')mine={type:A.type,sev:A.sev}}
  $('#useMine').hidden=!mine;if(mine)$('#useMine').onclick=()=>setProfile(mine.type,mine.sev);
  if(sharedProfile){const p=sharedProfile;sharedProfile=null;SIM.banner={kind:'shared',type:p.type,sev:p.sev};SIM.type=p.type;SIM.sev=p.sev;}
  else if(!SIM.inited&&mine){SIM.type=mine.type;SIM.sev=mine.sev;SIM.banner={kind:'mine',type:mine.type,sev:mine.sev}}
  else if(!SIM.inited){SIM.banner={kind:'example',type:'deutan',sev:0.6}}
  renderBanner();
  if(!SIM.inited){SIM.inited=true;loadSample()}
  setProfile(SIM.type,SIM.sev);
}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function loadSample(){
  const W=1200,H=800,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');const R=rng(7);
  g.fillStyle='#f4f2ee';g.fillRect(0,0,W,H);
  g.fillStyle='#1d1d1d';g.font='700 34px "Atkinson Hyperlegible Next",Arial,sans-serif';g.fillText(t('sceneTitle'),40,58);
  const sw=['#c8321e','#3f7d2a','#ef8a1c','#f1d43a','#d8283f','#98c93a','#4b2a4f','#a28fd1','#6fa8dc','#24b0a3','#f2a1b6','#6f4325'].map((c,i)=>[D().sw[i],c]);
  g.font='500 19px "Atkinson Hyperlegible Next",Arial,sans-serif';
  sw.forEach(([n,c],i)=>{const x=40+(i%4)*165,y=90+Math.floor(i/4)*148;g.fillStyle=c;g.beginPath();g.roundRect?g.roundRect(x,y,145,98,10):g.rect(x,y,145,98);g.fill();g.fillStyle='#2a2a2a';g.fillText(n,x,y+124)});
  // tavola a puntini con numero
  const pcx=930,pcy=300,pr=215;const mk=document.createElement('canvas');mk.width=W;mk.height=H;const m=mk.getContext('2d');m.fillStyle='#000';m.font='800 250px Arial,sans-serif';m.textAlign='center';m.textBaseline='middle';m.fillText('74',pcx,pcy+8);
  const md=m.getImageData(0,0,W,H).data;const fig=['#d1784f','#df8f5c','#c66a4a','#e3a06d','#cf8a58'],grd=['#8fa552','#a1b25d','#7f9b4c','#acb96c','#93a35a'];
  const placed=[];g.fillStyle='#e7e2d8';g.beginPath();g.arc(pcx,pcy,pr+8,0,7);g.fill();
  for(let k=0;k<5000;k++){const r=5+R()*11*(1-k/6000);const a=R()*6.283,rho=Math.sqrt(R())*(pr-r);const x=pcx+rho*Math.cos(a),y=pcy+rho*Math.sin(a);
    if(placed.some(p=>Math.hypot(p[0]-x,p[1]-y)<p[2]+r+1.5))continue;placed.push([x,y,r]);
    const inF=md[((y|0)*W+(x|0))*4+3]>128;const pal=inF?fig:grd;g.fillStyle=pal[(R()*pal.length)|0];g.beginPath();g.arc(x,y,r,0,7);g.fill()}
  // grafico
  const gx=40,gy=560,gw=640,gh=190;g.strokeStyle='#cfcac0';g.lineWidth=1;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(gx,gy+i*gh/4);g.lineTo(gx+gw,gy+i*gh/4);g.stroke()}
  const SN=D().series;const series=[[SN[0],'#d62f2f',[.2,.35,.3,.5,.62,.58,.8]],[SN[1],'#3a9a3a',[.3,.32,.4,.45,.5,.6,.65]],[SN[2],'#9a6a2a',[.15,.25,.35,.3,.42,.5,.55]]];
  series.forEach(([n,c,v],si)=>{g.strokeStyle=c;g.lineWidth=4;g.beginPath();v.forEach((y,i)=>{const X=gx+i*gw/6,Y=gy+gh-y*gh;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.stroke();
    g.fillStyle=c;g.fillRect(gx+si*190,gy-34,16,16);g.fillStyle='#2a2a2a';g.font='500 17px "Atkinson Hyperlegible Next",Arial,sans-serif';g.fillText(n,gx+22+si*190,gy-20)});
  // semaforo e LED
  g.fillStyle='#2b2b2b';g.beginPath();g.roundRect?g.roundRect(790,560,90,200,14):g.rect(790,560,90,200);g.fill();
  [['#e0261f',600],['#f2b01e',660],['#2fa64a',720]].forEach(([c,y])=>{g.fillStyle=c;g.beginPath();g.arc(835,y,24,0,7);g.fill()});
  [[D().leds[0],'#e0261f',600],[D().leds[1],'#2fa64a',660],[D().leds[2],'#f08a1c',720]].forEach(([n,c,y])=>{g.fillStyle=c;g.beginPath();g.arc(930,y,12,0,7);g.fill();g.fillStyle='#2a2a2a';g.font='500 19px "Atkinson Hyperlegible Next",Arial,sans-serif';g.fillText(n,952,y+7)});
  // spettro
  const sp=g.createLinearGradient(40,0,W-40,0);['#ff0000','#ff8000','#ffff00','#80ff00','#00ff00','#00ff80','#00ffff','#0080ff','#0000ff','#8000ff','#ff00ff'].forEach((c,i,a)=>sp.addColorStop(i/(a.length-1),c));
  g.fillStyle=sp;g.fillRect(40,776,W-80,14);
  setSource(cv);SIM.isSample=true;
}
function setSource(img){
  const max=1600;let w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;const s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);
  const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);SIM.src=c;
  SIM.srcData=c.getContext('2d').getImageData(0,0,w,h);const vecchia=$('#outImg');if(vecchia)vecchia.hidden=true;process();
}
function process(){
  if(!SIM.src)return;const {width:w,height:h}=SIM.src;const M=macMatrix(SIM.type,SIM.sev);const S=SIM.srcData.data;
  const out=new ImageData(w,h);const D=out.data;
  const [a,b,c]=M[0],[d,e,f]=M[1],[g,hh,i]=M[2];
  for(let p=0;p<S.length;p+=4){const r=DEC[S[p]],gg=DEC[S[p+1]],bb=DEC[S[p+2]];
    D[p]=ENC[(clamp(a*r+b*gg+c*bb,0,1)*4095+.5)|0];D[p+1]=ENC[(clamp(d*r+e*gg+f*bb,0,1)*4095+.5)|0];D[p+2]=ENC[(clamp(g*r+hh*gg+i*bb,0,1)*4095+.5)|0];D[p+3]=S[p+3]}
  SIM.out=out;
  const put=(id,data)=>{const cv=$(id);cv.width=w;cv.height=h;cv.getContext('2d').putImageData(data,0,0)};
  put('#cvOrig',SIM.srcData);put('#cvSim',out);put('#cvOrig2',SIM.srcData);put('#cvSim2',out);put('#cvSim3',out);
  fitViewer();applySplit();
}
function fitViewer(){if(!SIM.src)return;const v=$('#viewSplit');const host=v.parentElement.clientWidth;const maxH=Math.max(260,window.innerHeight*0.72);const w=Math.min(host,maxH*SIM.src.width/SIM.src.height);v.style.width=Math.floor(w)+'px'}
window.addEventListener('resize',()=>{if(current==='simulatore')fitViewer()});
function applySplit(){$('#cvSim').style.clipPath=`inset(0 0 0 ${(SIM.split*100).toFixed(2)}%)`;$('#handle').style.left=`calc(${(SIM.split*100).toFixed(2)}% - 1px)`;const sr=$('#splitRange');if(sr)sr.value=String(Math.round(SIM.split*1000))}
(()=>{const v=$('#viewSplit');let drag=false;
  const set=x=>{const r=v.getBoundingClientRect();if(!r.width)return;SIM.split=clamp((x-r.left)/r.width,0,1);applySplit()};
  const start=x=>{drag=true;set(x)};
  if(window.PointerEvent){
    v.addEventListener('pointerdown',e=>{e.preventDefault();try{v.setPointerCapture(e.pointerId)}catch(_){}start(e.clientX)});
    v.addEventListener('pointermove',e=>{if(drag){e.preventDefault();set(e.clientX)}});
    ['pointerup','pointercancel','lostpointercapture'].forEach(t=>v.addEventListener(t,()=>drag=false));
  }
  v.addEventListener('mousedown',e=>{e.preventDefault();start(e.clientX)});
  window.addEventListener('mousemove',e=>{if(drag)set(e.clientX)});
  window.addEventListener('mouseup',()=>drag=false);
  v.addEventListener('touchstart',e=>{start(e.touches[0].clientX)},{passive:true});
  v.addEventListener('touchmove',e=>{if(drag){e.preventDefault();set(e.touches[0].clientX)}},{passive:false});
  v.addEventListener('touchend',()=>drag=false);
  v.addEventListener('dragstart',e=>e.preventDefault());
  $('#splitRange').addEventListener('input',e=>{SIM.split=+e.target.value/1000;applySplit()});})();
$('#segType').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setProfile(b.dataset.t,SIM.sev)});
$('#sev').addEventListener('input',()=>{SIM.sev=+$('#sev').value/100;updProfileText();cancelAnimationFrame(SIM.pr);SIM.pr=requestAnimationFrame(process)});
$('#segMode').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;SIM.mode=b.dataset.m;$$('#segMode button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  $('#viewSplit').hidden=SIM.mode!=='split';$('#splitCtl').hidden=SIM.mode!=='split';fitViewer();$('#viewSide').hidden=SIM.mode!=='side';$('#viewSim').hidden=SIM.mode!=='sim'});
$('#srcSample').addEventListener('click',loadSample);
const imgMsg=t=>{$('#loadMsg').textContent=t};
async function loadFile(f){
  if(!f){return}
  SIM.isSample=false;
  const isHeic=/hei[cf]$/i.test(f.name||'')||/hei[cf]/i.test(f.type||'');
  if(f.type&&!f.type.startsWith('image/')&&!isHeic){imgMsg(t('notImage'));return}
  imgMsg(t('opening'));
  try{
    if(window.createImageBitmap){try{const bm=await createImageBitmap(f);setSource(bm);imgMsg(t('loaded',{f:f.name||t('pasted')}));SIM.isSample=false;return}catch(_){}}
    const url=URL.createObjectURL(f);
    await new Promise((res,rej)=>{const im=new Image();im.onload=()=>{setSource(im);URL.revokeObjectURL(url);res()};im.onerror=()=>{URL.revokeObjectURL(url);rej()};im.src=url});
    imgMsg(t('loaded',{f:f.name||t('pasted')}));SIM.isSample=false;
  }catch(e){
    imgMsg(isHeic?t('heicFail'):t('imgFail'));
  }
}
$('#file').addEventListener('change',e=>{loadFile(e.target.files[0]);e.target.value=''});
const dropTargets=[$('#drop'),$('#viewSplit'),$('#viewSide'),$('#viewSim')];
dropTargets.forEach(bersaglio=>{
  ['dragenter','dragover'].forEach(ev=>bersaglio.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();try{e.dataTransfer.dropEffect='copy'}catch(_){}$('#drop').classList.add('over')}));
  bersaglio.addEventListener('dragleave',e=>{e.preventDefault();$('#drop').classList.remove('over')});
  bersaglio.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();$('#drop').classList.remove('over');const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)loadFile(f);else imgMsg(t('noFile'))});
});
window.addEventListener('dragover',e=>{if(current==='simulatore')e.preventDefault()});
window.addEventListener('drop',e=>{if(current==='simulatore'){e.preventDefault();const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f)loadFile(f)}});
document.addEventListener('paste',e=>{if(current!=='simulatore')return;const it=[...(e.clipboardData?.items||[])].find(i=>i.kind==='file');if(it){e.preventDefault();loadFile(it.getAsFile())}});
function simBlob(){return new Promise(r=>{const c=document.createElement('canvas');c.width=SIM.out.width;c.height=SIM.out.height;c.getContext('2d').putImageData(SIM.out,0,0);c.toBlob(r,'image/png')})}
// l'immagine da salvare nasce al primo «Prepara immagine» (un <img> senza src non è HTML valido)
function immagineDaSalvare(){let img=$('#outImg');if(!img){img=Object.assign(document.createElement('img'),{id:'outImg',className:'da-salvare',alt:t('outAlt')});$('#mkImg').closest('.strumento').append(img)}return img}
$('#mkImg').addEventListener('click',async()=>{if(!SIM.out)return;const b=await simBlob();const img=immagineDaSalvare();if(img.src)URL.revokeObjectURL(img.src);img.src=URL.createObjectURL(b);img.hidden=false;$('#imgMsg').textContent=t('readyBelow')});
$('#cpImg').addEventListener('click',async()=>{if(!SIM.out)return;try{const b=await simBlob();await navigator.clipboard.write([new ClipboardItem({'image/png':b})]);$('#imgMsg').textContent=t('copiedImg')}catch(e){$('#imgMsg').textContent=t('copyImgFail')}});
function copyText(el,msg){const testo=el.textContent;navigator.clipboard.writeText(testo).then(()=>msg.textContent=t('copied')).catch(()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);msg.textContent=t('selected')})}
$('#cpLink').addEventListener('click',()=>copyText($('#shareLink'),$('#linkMsg')));
$('#cpSvg').addEventListener('click',()=>copyText($('#svgCode'),$('#svgMsg')));


initSim();
// la scena di prova scrive i nomi con il font del sito: la si ridisegna quando il font è arrivato
if(document.fonts)document.fonts.ready.then(()=>{if(SIM.isSample)loadSample()});
window.addEventListener("hashchange",()=>{const m=decodeURIComponent(location.hash.slice(1)).match(/^profilo-(protan|deutan|tritan)-(\d{1,3})$/);if(m){sharedProfile={type:m[1],sev:clamp(+m[2],0,100)/100};initSim()}});
})();
