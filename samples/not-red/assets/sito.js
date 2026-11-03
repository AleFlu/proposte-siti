/* This is not red! — parti comuni a tutte le pagine: tema, lingue, titolo a puntini, cancellazione dei dati,
   copia per l'uso senza rete. Non dipende da misura.js. */
(()=>{
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const TESTI=JSON.parse($('#testi').textContent);
const prova=f=>{try{return f()}catch(_){return null}};

/* ---------- tema: la scelta resta, altrimenti segue il sistema ---------- */
const scuro=()=>{const a=document.documentElement.dataset.theme;return a?a==='dark':matchMedia('(prefers-color-scheme: dark)').matches};
$('#tema').addEventListener('click',()=>{const n=scuro()?'light':'dark';document.documentElement.dataset.theme=n;prova(()=>localStorage.setItem('cvd-theme',n));disegnaTitolo()});

/* ---------- lingue: un menu <details>; si chiude cliccando fuori o con Esc ---------- */
const lingue=$('#lingue');
document.addEventListener('click',e=>{if(lingue.open&&!lingue.contains(e.target))lingue.open=false});
lingue.addEventListener('keydown',e=>{if(e.key==='Escape'&&lingue.open){lingue.open=false;lingue.querySelector('summary').focus()}});
$$('#lingue a').forEach(a=>a.addEventListener('click',e=>{
  // la lingua è un'altra pagina: il test in corso si perderebbe
  if(window.NR_testInCorso&&!confirm(TESTI.langWarn)){e.preventDefault();return}
  prova(()=>localStorage.setItem('cvd-lang',a.hreflang));
}));

/* ---------- sulle pagine italiane, una proposta nella lingua del browser (una volta sola) ---------- */
const datiLingue=$('#lingue-dati');
if(datiLingue&&!prova(()=>localStorage.getItem('cvd-lang'))){
  const voci=JSON.parse(datiLingue.textContent);
  const l=(navigator.languages||[navigator.language||'']).map(x=>String(x).slice(0,2).toLowerCase()).find(x=>x==='it'||voci[x]);
  if(l&&l!=='it'){
    const [frase,vai,no,href]=voci[l];
    const p=document.createElement('div');p.className='proposta-lingua';p.lang=l;
    p.innerHTML=`<p>${frase}</p><a class="btn primario" hreflang="${l}" href="${href}">${vai}</a><button type="button" class="btn">${no}</button>`;
    p.querySelector('a').addEventListener('click',()=>prova(()=>localStorage.setItem('cvd-lang',l)));
    p.querySelector('button').addEventListener('click',()=>{prova(()=>localStorage.setItem('cvd-lang','it'));p.remove()});
    $('.testata').after(p);
  }
}

/* ---------- titolo a puntini: grigi, e «red» di puntini rossi della stessa luminosità ----------
   I puntini di «red» sono più piccoli e fitti, così la parola si legge anche dalla forma (vedi 03-design-direction).
   L'altezza dipende solo dalla larghezza, uguale a quella riservata dal CSS: il disegno non sposta la pagina. */
const titolo=$('#titolo');
function disegnaTitolo(){
  if(!titolo)return;
  const cv=titolo.querySelector('canvas');const W=Math.floor(titolo.clientWidth);if(!W)return;
  const due=W<640, righe=due?['This is','not red!']:['This is not red!'];
  const size=W*(due?0.2:0.105), lh=size*0.98, H=Math.round(W*(due?0.416:0.1155));
  const dpr=Math.min(2,window.devicePixelRatio||1);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.height=H+'px';
  const cs=getComputedStyle(document.documentElement), tok=n=>cs.getPropertyValue(n).trim();
  const grigio=tok('--punto'), rosso=tok('--punto-rosso');
  const F=s=>`800 ${s}px "Atkinson Hyperlegible Next", "Arial Black", sans-serif`;
  // due maschere: tutto il testo, e la sola parola «red»
  const tutto=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
  const red=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
  for(const k of[tutto,red]){k.canvas.width=W;k.canvas.height=H}
  tutto.font=F(100);const wmax=Math.max(...righe.map(r=>tutto.measureText(r).width));
  const fs=Math.min(size,W*0.97/wmax*100);
  righe.forEach((r,i)=>{const y=fs*0.82+i*lh;
    tutto.font=F(fs);tutto.fillText(r,0,y);
    const at=r.indexOf('red');if(at>=0){red.font=F(fs);red.fillText('red',tutto.measureText(r.slice(0,at)).width,y)}});
  const mt=tutto.getImageData(0,0,W,H).data, mr=red.getImageData(0,0,W,H).data;
  const dentro=(m,x,y)=>{x|=0;y|=0;return x>=0&&y>=0&&x<W&&y<H&&m[(y*W+x)*4+3]>110};
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
  let seme=11;const R=()=>{seme=(seme*16807)%2147483647;return seme/2147483647};
  const rmin=Math.max(1.3,fs*0.012),rmax=Math.max(2.4,fs*0.032),gap=Math.max(0.7,fs*0.006);
  const cella=2*rmax+gap,gw=Math.ceil(W/cella)+2;const griglia=new Map();const prove=Math.round(W*H/(rmin*rmin)*1.4);
  for(let n=0;n<prove;n++){
    const x=R()*W,y=R()*H;const inRed=dentro(mr,x,y);
    // nella parola «red» puntini fino a metà della misura e più vicini
    const top=inRed?rmin+(rmax-rmin)*0.45:rmax, sp=inRed?gap*0.6:gap;
    const r=rmin+(top-rmin)*Math.pow(1-n/prove,1.4)*(0.5+0.5*R());
    const gx=Math.floor(x/cella),gy=Math.floor(y/cella);let ok=true;
    for(let i=-1;i<=1&&ok;i++)for(let j=-1;j<=1&&ok;j++){const L=griglia.get((gx+i)*gw+gy+j);if(L)for(const d of L){const dx=d[0]-x,dy=d[1]-y,rr=d[2]+r+sp;if(dx*dx+dy*dy<rr*rr){ok=false;break}}}
    if(!ok)continue;
    const voti=[[0,0],[.7,0],[-.7,0],[0,.7],[0,-.7]].reduce((s,[a,b])=>s+dentro(mt,x+r*a,y+r*b),0);
    if(voti<3||(voti<5&&r>rmin*1.15))continue;
    const k=gx*gw+gy;(griglia.get(k)||griglia.set(k,[]).get(k)).push([x,y,r]);
    g.fillStyle=inRed?rosso:grigio;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  }
}
if(titolo){
  disegnaTitolo();
  if(document.fonts)document.fonts.load('800 100px "Atkinson Hyperlegible Next"').then(disegnaTitolo,()=>{});
  let attesa=0;const piu_tardi=()=>{clearTimeout(attesa);attesa=setTimeout(disegnaTitolo,120)};
  window.addEventListener('resize',piu_tardi);
  prova(()=>matchMedia('(prefers-color-scheme: dark)').addEventListener('change',piu_tardi));
}

/* ---------- privacy: cancellare tutto quello che il sito ha salvato su questo dispositivo ---------- */
const cancella=$('#cancella');
if(cancella)cancella.addEventListener('click',async()=>{
  ['cvd-gamma','cvd-sessions','cvd-check','cvd-lang','cvd-theme'].forEach(k=>prova(()=>localStorage.removeItem(k)));
  delete document.documentElement.dataset.theme;
  if(window.caches)await prova(async()=>{for(const k of await caches.keys())if(k.startsWith('notred-'))await caches.delete(k)});
  if(navigator.serviceWorker)await prova(async()=>{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()});
  $('#cancellaMsg').textContent=TESTI.pDelDone;
});

/* ---------- copia per l'uso senza rete (sw.js accanto alle pagine italiane) ---------- */
const qui=document.currentScript&&document.currentScript.src;
if('serviceWorker' in navigator&&qui&&!cancella)navigator.serviceWorker.register(new URL('../sw.js',qui)).catch(()=>{});
})();
