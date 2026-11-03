/* This is not red! — calcolo comune a test e simulatore.
   Matrici di Machado, colorimetria, procedura di analisi: copiati senza modifiche dall'artifact originale
   (le righe tra «inizio copia» e «fine copia» devono restare identiche; vedi docs/not-red/01-brief.md).
   Cambia solo da dove arrivano i testi: dal blocco #testi della pagina, nella lingua della pagina. */
(()=>{
"use strict";
/* inizio copia: matrici e utilità */
const MAC_RAW={"protan":[[[1.0,0.0,-0.0],[0.0,1.0,0.0],[-0.0,-0.0,1.0]],[[0.856167,0.182038,-0.038205],[0.029342,0.955115,0.015544],[-0.00288,-0.001563,1.004443]],[[0.734766,0.334872,-0.069637],[0.05184,0.919198,0.028963],[-0.004928,-0.004209,1.009137]],[[0.630323,0.465641,-0.095964],[0.069181,0.890046,0.040773],[-0.006308,-0.007724,1.014032]],[[0.539009,0.579343,-0.118352],[0.082546,0.866121,0.051332],[-0.007136,-0.011959,1.019095]],[[0.458064,0.679578,-0.137642],[0.092785,0.846313,0.060902],[-0.007494,-0.016807,1.024301]],[[0.38545,0.769005,-0.154455],[0.100526,0.829802,0.069673],[-0.007442,-0.02219,1.029632]],[[0.319627,0.849633,-0.169261],[0.106241,0.815969,0.07779],[-0.007025,-0.028051,1.035076]],[[0.259411,0.923008,-0.18242],[0.110296,0.80434,0.085364],[-0.006276,-0.034346,1.040622]],[[0.203876,0.990338,-0.194214],[0.112975,0.794542,0.092483],[-0.005222,-0.041043,1.046265]],[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]],"deuteran":[[[1.0,0.0,-0.0],[0.0,1.0,0.0],[-0.0,-0.0,1.0]],[[0.866435,0.177704,-0.044139],[0.049567,0.939063,0.01137],[-0.003453,0.007233,0.99622]],[[0.760729,0.319078,-0.079807],[0.090568,0.889315,0.020117],[-0.006027,0.013325,0.992702]],[[0.675425,0.43385,-0.109275],[0.125303,0.847755,0.026942],[-0.00795,0.018572,0.989378]],[[0.605511,0.52856,-0.134071],[0.155318,0.812366,0.032316],[-0.009376,0.023176,0.9862]],[[0.547494,0.607765,-0.155259],[0.181692,0.781742,0.036566],[-0.01041,0.027275,0.983136]],[[0.498864,0.674741,-0.173604],[0.205199,0.754872,0.039929],[-0.011131,0.030969,0.980162]],[[0.457771,0.731899,-0.18967],[0.226409,0.731012,0.042579],[-0.011595,0.034333,0.977261]],[[0.422823,0.781057,-0.203881],[0.245752,0.709602,0.044646],[-0.011843,0.037423,0.974421]],[[0.392952,0.82361,-0.216562],[0.263559,0.69021,0.046232],[-0.01191,0.040281,0.97163]],[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.01182,0.04294,0.968881]]],"tritan":[[[1.0,0.0,-0.0],[0.0,1.0,0.0],[-0.0,-0.0,1.0]],[[0.92667,0.092514,-0.019184],[0.021191,0.964503,0.014306],[0.008437,0.054813,0.93675]],[[0.89572,0.13333,-0.02905],[0.029997,0.9454,0.024603],[0.013027,0.104707,0.882266]],[[0.905871,0.127791,-0.033662],[0.026856,0.941251,0.031893],[0.01341,0.148296,0.838294]],[[0.948035,0.08949,-0.037526],[0.014364,0.946792,0.038844],[0.010853,0.193991,0.795156]],[[1.017277,0.027029,-0.044306],[-0.006113,0.958479,0.047634],[0.006379,0.248708,0.744913]],[[1.104996,-0.046633,-0.058363],[-0.032137,0.971635,0.060503],[0.001336,0.317922,0.680742]],[[1.193214,-0.109812,-0.083402],[-0.058496,0.97941,0.079086],[-0.002346,0.403492,0.598854]],[[1.257728,-0.139648,-0.118081],[-0.078003,0.975409,0.102594],[-0.003316,0.501214,0.502102]],[[1.278864,-0.125333,-0.153531],[-0.084748,0.957674,0.127074],[-0.000989,0.601151,0.399838]],[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.3039]]]};
const MAC={protan:MAC_RAW.protan,deutan:MAC_RAW.deuteran,tritan:MAC_RAW.tritan};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* fine copia */
const TESTI=JSON.parse(document.getElementById('testi').textContent);
const LANG=document.documentElement.lang;
const D=()=>TESTI;
const t=(k,v)=>{let x=D()[k];if(x==null)return k;if(v)for(const n in v)x=x.split('{'+n+'}').join(v[n]);return x};
const fmt=(x,n=0)=>x.toLocaleString(D()._locale,{minimumFractionDigits:n,maximumFractionDigits:n});

/* inizio copia: colorimetria */
/* ---------- colorimetria ---------- */
const WP={u:0.1978,v:0.4683};                          // D65 in u'v'
const COP={protan:{u:0.678,v:0.501},deutan:{u:-1.217,v:0.782},tritan:{u:0.257,v:0.0}}; // punti copuntali (Smith & Pokorny)
const AXES=['protan','deutan','tritan'];
const NORM={protan:100,deutan:100,tritan:150};          // limite superiore normale (CCT, ×1e-4)
const BORDER={protan:150,deutan:150,tritan:230};
const DICH={protan:1100,deutan:1100,tritan:1000};       // soglie tipiche di dicromazia
const SHORT={protan:'Protan',deutan:'Deutan',tritan:'Tritan'};
const NM=a=>({...D().names[a],short:SHORT[a]});
const gradeIdx=s=>s<0.35?0:s<0.7?1:2;
function cvdName(type,sev){const N=NM(type);if(sev>=0.93)return N.opia;const g=D()._grades[gradeIdx(sev)];return D()._nameTpl.replace('{n}',N.omalia).replace('{nl}',N.omalia.toLowerCase()).replace('{g}',g)}
const Y_LEVELS=[0.07,0.09,0.11,0.13,0.15,0.17];
const Y_BG=0.006;
let gamma=store.get('cvd-gamma',{r:2.2,g:2.2,b:2.2,cal:false});

function uvY2lin(u,v,Y){const den=6*u-16*v+12,x=9*u/den,y=4*v/den,X=x/y*Y,Z=(1-x-y)/y*Y;
  return[3.2404542*X-1.5371385*Y-0.4985314*Z,-0.969266*X+1.8760108*Y+0.041556*Z,0.0556434*X-0.2040259*Y+1.0572252*Z]}
function lin2dev(l){return[255*Math.pow(clamp(l[0],0,1),1/gamma.r),255*Math.pow(clamp(l[1],0,1),1/gamma.g),255*Math.pow(clamp(l[2],0,1),1/gamma.b)]}
const AX={};
for(const a of AXES){const c=COP[a];let du=WP.u-c.u,dv=WP.v-c.v;const n=Math.hypot(du,dv);du/=n;dv/=n;
  let best={d:0,s:1};
  for(const s of[1,-1]){let lo=0,hi=0.3;for(let i=0;i<40;i++){const m=(lo+hi)/2;
      const ok=Y_LEVELS.every(Y=>uvY2lin(WP.u+s*du*m,WP.v+s*dv*m,Y).every(x=>x>0.0005&&x<0.9995));ok?lo=m:hi=m}
    if(lo>best.d)best={d:lo,s}}
  AX[a]={du:du*best.s,dv:dv*best.s,max:best.d*0.98};}
/* fine copia */

/* inizio copia: analisi */
function geoMean(a){return Math.exp(a.reduce((s,x)=>s+Math.log(x),0)/a.length)}
function combine(sessions){
  const th={};AXES.forEach(a=>{const vs=sessions.map(s=>s.th[a]);th[a]={v:geoMean(vs.map(x=>x.v)),ceil:vs.filter(x=>x.ceil).length>vs.length/2,max:Math.min(...vs.map(x=>x.max))}});
  const fl=sessions.filter(s=>s.flicker).map(s=>s.flicker.ratio);
  return{th,flicker:fl.length?{ratio:geoMean(fl)}:null,catch:{ok:sessions.reduce((s,x)=>s+x.catch.ok,0),n:sessions.reduce((s,x)=>s+x.catch.n,0)},n:sessions.length};
}
function level(a,v){return v<=NORM[a]?0:v<=BORDER[a]?1:2}
function sevOf(a,t){if(t.ceil)return 1;const top=Math.min(DICH[a],t.max*0.95);return clamp(Math.log(t.v/NORM[a])/Math.log(top/NORM[a]),0,1)}
function analyze(R){
  const L={};AXES.forEach(a=>L[a]=level(a,R.th[a].v));
  const out={L,notes:[]};
  const ratio=a=>R.th[a].v/NORM[a];
  if(R.catch.n>=3&&R.catch.ok/R.catch.n<0.8)out.notes.push(t('noteCatch'));
  const rg=Math.max(L.protan,L.deutan);
  if(rg===2){
    let sT=0;const bothCeil=R.th.protan.ceil&&R.th.deutan.ceil;
    if(!bothCeil)sT=clamp(Math.log(R.th.protan.v/R.th.deutan.v)/Math.log(1.5),-2,2);
    let sF=null;if(R.flicker)sF=clamp(Math.log(R.flicker.ratio)/Math.log(1.35),-2,2);
    const score=sT+(sF??0);
    out.type=score>=0?'protan':'deutan';
    const a=Math.abs(score);out.conf=a>=2?'confHigh':a>=0.9?'confMed':'confLow';
    if(sF!==null&&sT!==0&&Math.sign(sF)!==Math.sign(sT)&&Math.abs(sF)>0.6&&Math.abs(sT)>0.6)out.notes.push(t('noteConflict'));
    if(bothCeil&&!R.flicker)out.notes.push(t('noteBothCeil'));
    out.sev=sevOf(out.type,R.th[out.type]);
    out.dich=out.sev>=0.93;
    out.status='rg';
    if(L.tritan===2&&ratio('tritan')>=0.7*Math.min(ratio('protan'),ratio('deutan')))out.notes.push(t('noteTritanToo'));
  }else if(L.tritan===2){
    out.type='tritan';out.sev=sevOf('tritan',R.th.tritan);out.dich=out.sev>=0.93;out.status='tritan';out.conf=rg===0?'confMed':'confLow';
    out.notes.push(t('noteTritanRare'));
  }else if(rg===1||L.tritan===1){out.status='border';}
  else out.status='normal';
  if(out.status==='rg'||out.status==='tritan'){
    out.name=cvdName(out.type,out.dich?1:Math.min(out.sev,0.92));
  }
  return out;
}
/* fine copia */

/* inizio copia: filtro */
function macMatrix(type,sev){const s=clamp(sev,0,1)*10;const i=Math.min(9,Math.floor(s)),f=s-i;const A=MAC[type][i],B=MAC[type][i+1];return A.map((row,r)=>row.map((x,c)=>x*(1-f)+B[r][c]*f))}
const DEC=new Float32Array(256);for(let i=0;i<256;i++){const c=i/255;DEC[i]=c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
const ENC=new Uint8Array(4096);for(let i=0;i<4096;i++){const l=i/4095;ENC[i]=Math.round(255*(l<=0.0031308?12.92*l:1.055*Math.pow(l,1/2.4)-0.055))}
/* fine copia */

window.NR={MAC,$,$$,clamp,store,LANG,D,t,fmt,WP,COP,AXES,NORM,BORDER,DICH,SHORT,NM,gradeIdx,cvdName,Y_LEVELS,Y_BG,
  gamma,uvY2lin,lin2dev,AX,geoMean,combine,level,sevOf,analyze,macMatrix,DEC,ENC};
})();
