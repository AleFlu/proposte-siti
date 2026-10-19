// Pizzeria La Cupola — dati e comportamenti comuni a tutte le pagine

// ---------- dati ----------
// 0 = domenica; fasce in ore decimali
const SERVIZI = { 0: [[12.5, 14.5], [19, 23.5]], 1: [], 2: [[19, 23.5]], 3: [[19, 23.5]], 4: [[19, 23.5]], 5: [[19, 23.5]], 6: [[12.5, 14.5], [19, 23.5]] };
const ORARI_PRANZO = ["12:30", "13:00", "13:30"];
const ORARI_CENA = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const POSTI_SALA = 32;
const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const ETICHETTE = { veg: "vegetariana", nolatt: "senza lattosio", picc: "piccante" };

const MENU = [
  { gruppo: "Le classiche", nota: "Ogni pizza anche con impasto integrale al 30%, per 1,50 € in più.", voci: [
    { nome: "Marinara", ingr: "Pomodoro San Marzano DOP, aglio, origano di Sicilia, olio extravergine", prezzo: 7, tag: ["veg", "nolatt"] },
    { nome: "Margherita", ingr: "Pomodoro San Marzano DOP, fiordilatte di Agerola, basilico, olio extravergine", prezzo: 8.5, tag: ["veg"] },
    { nome: "Margherita con bufala", ingr: "Pomodoro San Marzano DOP, mozzarella di bufala campana DOP aggiunta a crudo, basilico", prezzo: 11, tag: ["veg"] },
    { nome: "Cosacca", ingr: "Pomodoro, pecorino romano, basilico, olio extravergine. Dopo la marinara, la pizza più antica", prezzo: 8, tag: ["veg"] },
    { nome: "Diavola", ingr: "Pomodoro, fiordilatte, salame piccante calabrese, olio al peperoncino", prezzo: 10, tag: ["picc"] },
    { nome: "Ripieno al forno", ingr: "Ricotta di bufala, salame napoletano, fiordilatte e pepe nero, con pomodoro sopra", prezzo: 11.5, tag: [] }
  ]},
  { gruppo: "Fuori menu di ottobre", nota: "Cambiano ogni mese, con quello che arriva dal mercato di Porta Palazzo.", voci: [
    { nome: "Zucca e salsiccia di Bra", ingr: "Crema di zucca, salsiccia di Bra, provola affumicata, salvia", prezzo: 12.5, tag: [] },
    { nome: "Porcini e Castelmagno", ingr: "Porcini trifolati, fonduta di Castelmagno DOP, timo", prezzo: 14, tag: ["veg"] },
    { nome: "Scarola", ingr: "Scarola ripassata, olive di Gaeta, capperi, acciughe del Cantabrico. Senza latticini", prezzo: 12, tag: ["nolatt"] }
  ]},
  { gruppo: "Fritti", nota: "Fritti al momento, in olio di arachide.", voci: [
    { nome: "Frittatina di pasta", ingr: "Bucatini, besciamella, piselli e provola, impanata e fritta", prezzo: 4.5, tag: [] },
    { nome: "Crocchè", ingr: "Patate, pecorino e prezzemolo, con un cuore di fiordilatte", prezzo: 3, tag: ["veg"] },
    { nome: "Montanarina", ingr: "Pizza fritta piccola con pomodoro, Parmigiano e basilico", prezzo: 4, tag: ["veg"] },
    { nome: "Montanarina piccante", ingr: "Pizza fritta piccola con pomodoro, peperoncino di Calabria e pecorino", prezzo: 4.5, tag: ["veg", "picc"] }
  ]},
  { gruppo: "Da bere", nota: "", filtrabile: false, voci: [
    { nome: "Birra artigianale di Cuneo", ingr: "Bionda non filtrata, bottiglia da 33 cl", prezzo: 5.5, tag: [] },
    { nome: "Falanghina del Sannio", ingr: "Bianco campano, al calice", prezzo: 5, tag: [] },
    { nome: "Aglianico del Taburno", ingr: "Rosso campano, al calice", prezzo: 5.5, tag: [] },
    { nome: "Acqua minerale", ingr: "Naturale o frizzante, 75 cl", prezzo: 2.5, tag: [] }
  ]}
];

// ---------- utilità ----------
const $ = id => document.getElementById(id);
const adesso = new Date();
const euro = n => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const hhmm = h => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
const oreDa = s => { const [h, m] = s.split(":").map(Number); return h + m / 60; };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const giornoDopo = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
const conOra = (d, h) => { const x = new Date(d); x.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); return x; };
const fasceTesto = g => SERVIZI[g].length ? SERVIZI[g].map(([a, b]) => `${hhmm(a)} – ${hhmm(b)}`).join(", ") : "Chiuso";
const nomeGiorno = (d, rispetto = adesso) => {
  const diff = Math.round((giornoDopo(d, 0) - giornoDopo(rispetto, 0)) / 864e5);
  return diff === 0 ? "oggi" : diff === 1 ? "domani" : GIORNI[d.getDay()];
};
const dataLunga = d => `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
const maiuscola = s => s.charAt(0).toUpperCase() + s.slice(1);

// il prossimo servizio che non è ancora finito
function prossimoServizio(da = adesso) {
  for (let i = 0; i < 8; i++) {
    const giorno = giornoDopo(da, i);
    for (const [a, b] of SERVIZI[giorno.getDay()]) {
      const fine = conOra(giorno, b);
      if (fine > da) return { inizio: conOra(giorno, a), fine, giorno };
    }
  }
}

// posti liberi simulati, sempre uguali per lo stesso giorno e orario
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function postiLiberi(giornoIso, orario) {
  const g = new Date(`${giornoIso}T12:00`).getDay();
  const base = { 5: .72, 6: .84, 0: .62 }[g] ?? .42;
  const picco = ["20:00", "20:30", "13:00"].includes(orario) ? .2 : 0;
  const caso = (hash(giornoIso + orario) % 1000) / 1000 - .5;
  return Math.max(0, Math.round(POSTI_SALA * (1 - Math.min(1, base + picco + caso * .5))));
}
const orariDelGiorno = d => {
  const g = d.getDay();
  return SERVIZI[g].length ? [...(SERVIZI[g].length > 1 ? ORARI_PRANZO : []), ...ORARI_CENA] : [];
};
const orarioPassato = (d, orario) => conOra(d, oreDa(orario)) - adesso < 30 * 60e3;

// stato dell'impasto per il prossimo servizio
const FASI = [
  { ore: 0, testo: l => `L’impasto ${l} è appena stato fatto: farina, acqua, sale e un grammo di lievito per chilo.` },
  { ore: 1, testo: l => `L’impasto ${l} riposa nella madia. È la puntata, la prima lievitazione.` },
  { ore: 2, testo: l => `L’impasto ${l} è in frigo a 4 gradi e lievita piano, per tutta la notte.` },
  { ore: 22, testo: l => `L’impasto ${l} è diviso in panetti da 260 grammi e riposa ancora in frigo.` },
  { ore: 29, testo: l => `I panetti ${l} sono fuori dal frigo e prendono la temperatura della sala.` },
  { ore: 32, testo: () => "Si inforna: 450 gradi, da 60 a 90 secondi a pizza." }
];
function statoImpasto() {
  const s = prossimoServizio();
  const impasto = conOra(giornoDopo(s.giorno, -1), 11);
  const quale = nomeGiorno(s.giorno);
  const etichetta = quale === "oggi" ? (s.inizio.getHours() >= 18 ? "di stasera" : "di oggi") : `di ${quale}`;
  const oreTrascorse = (adesso - impasto) / 36e5;
  const oreAlForno = Math.round((s.inizio - impasto) / 36e5);
  const fase = oreTrascorse >= 0 ? FASI.filter(f => f.ore <= oreTrascorse).pop() : null;
  return { s, impasto, quale, etichetta, oreTrascorse, oreAlForno, fase };
}

// ---------- menu su telefono ----------
const menuApri = document.querySelector(".menu-apri"), nav = $("nav");
if (menuApri && nav) {
  menuApri.addEventListener("click", () => {
    const aperto = nav.classList.toggle("aperta");
    menuApri.setAttribute("aria-expanded", String(aperto));
    menuApri.textContent = aperto ? "Chiudi" : "Menu";
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("aperta")) { menuApri.click(); menuApri.focus(); }
  });
}

// ---------- stato di apertura ----------
function testoApertura() {
  const s = prossimoServizio();
  const quale = nomeGiorno(s.giorno);
  if (s.inizio <= adesso) return { aperto: true, testo: `<span class="pallino"></span><strong>Aperti adesso</strong>, fino alle ${hhmm(s.fine.getHours() + s.fine.getMinutes() / 60)}` };
  const quando = quale === "oggi" ? (s.inizio.getHours() >= 18 ? "Stasera" : "Oggi") : maiuscola(quale);
  const prefisso = quale === "oggi" ? "" : "Oggi chiuso. ";
  return { aperto: false, testo: `<span class="pallino"></span><strong>${prefisso}${quando} apriamo alle ${hhmm(s.inizio.getHours() + s.inizio.getMinutes() / 60)}</strong>` };
}
const apertura = testoApertura();
document.querySelectorAll("[data-apertura]").forEach(el => { el.innerHTML = apertura.testo; el.classList.toggle("chiuso", !apertura.aperto); });
document.querySelectorAll("[data-orari-oggi]").forEach(el => { el.textContent = SERVIZI[adesso.getDay()].length ? `Oggi ${fasceTesto(adesso.getDay())}` : "Oggi chiuso"; });

// ---------- voci di menu ----------
const voceHtml = v => `<li class="voce" data-tag="${v.tag.join(" ")}">
  <h3>${v.nome}</h3>
  <p class="prezzo">${euro(v.prezzo)}</p>
  <p class="ingredienti">${v.ingr}</p>
  ${v.tag.length ? `<ul class="etichette">${v.tag.map(t => `<li>${ETICHETTE[t]}</li>`).join("")}</ul>` : ""}
</li>`;

// ---------- il mosaico del forno ----------
function mosaico(tela, anima) {
  const box = tela.parentElement.getBoundingClientRect();
  const W = Math.floor(box.width), H = Math.floor(box.height);
  if (!W || !H) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  tela.width = W * dpr; tela.height = H * dpr;
  const ctx = tela.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // caso ripetibile: il mosaico è sempre lo stesso
  let seme = 1962;
  const caso = () => { seme |= 0; seme = seme + 0x6D2B79F5 | 0; let t = Math.imul(seme ^ seme >>> 15, 1 | seme); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  const cx = W / 2, base = H * .8, rx = W * .47, ry = H * .74;
  const lato = Math.max(5, W / 62), fuga = Math.max(1, lato * .17);
  const bocca = { l: W * .15, alto: base - H * .22 };
  const dentroCupola = (x, y, m = 0) => y < base && ((x - cx) / (rx - m)) ** 2 + ((y - base) / (ry - m)) ** 2 <= 1;
  const dentroBocca = (x, y, m = 0) => y < base && ((Math.abs(x - cx) <= bocca.l + m && y >= bocca.alto) || Math.hypot(x - cx, y - bocca.alto) <= bocca.l + m);
  // decori d'oro: una fascia che segue la bocca e una rosetta in cima alla cupola
  const fascia = (x, y) => dentroBocca(x, y, lato * 3.3) && !dentroBocca(x, y, lato * 2.2);
  const rosa = { y: H * .2, r: lato * 4.2 };
  const rosetta = (x, y) => Math.abs(x - cx) + Math.abs(y - rosa.y) <= rosa.r;
  const cuoreRosetta = (x, y) => Math.abs(x - cx) + Math.abs(y - rosa.y) <= lato * 1.2;
  const verdi = ["#14807A", "#117570", "#1A8C85", "#0F6964", "#168A82"];
  const ori = ["#D9A62E", "#E3B347", "#C9952A", "#E8BE5A"];
  const bianchi = ["#EEF2F0", "#E4EAE7", "#F5F7F6", "#DCE4E1"];
  const misto = (a, b, t) => {
    const n = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const [r1, g1, b1] = n(a), [r2, g2, b2] = n(b);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  };
  const scegli = lista => lista[Math.floor(caso() * lista.length)];

  const tessere = [];
  for (let r = 0, y = lato / 2; y < H; r++, y += lato) {
    const sfalsa = (r % 2) * lato * .5;
    for (let x = lato / 2 - sfalsa; x < W + lato; x += lato) {
      let colore = null;
      if (dentroBocca(x, y)) {
        const t = Math.max(0, (y - (bocca.alto - bocca.l)) / (base - (bocca.alto - bocca.l)));
        colore = misto("#140B08", t > .55 ? "#F2933F" : "#5A2414", Math.pow(t, 2.2) + caso() * .08);
      } else if (dentroBocca(x, y, lato * 1.05)) colore = scegli(bianchi);
      else if (dentroCupola(x, y)) {
        if (!dentroCupola(x, y, lato * 1.1)) colore = scegli(ori);
        else if (cuoreRosetta(x, y)) colore = scegli(bianchi);
        else if (rosetta(x, y) || fascia(x, y)) colore = scegli(ori);
        else colore = caso() < .005 ? scegli(ori) : scegli(verdi);
      } else if (y >= base && y < H * .985 && Math.abs(x - cx) < W * .46) {
        colore = y < base + lato ? "#0C5F5A" : scegli(bianchi);
      }
      if (colore) tessere.push({ x: x + (caso() - .5) * lato * .1, y: y + (caso() - .5) * lato * .1, a: (caso() - .5) * .12, colore, ordine: -y + caso() * lato * 4 });
    }
  }

  const sfondo = getComputedStyle(document.documentElement).getPropertyValue("--forno").trim() || "#0F2B2A";
  const disegnaTessera = t => {
    const s = lato - fuga;
    ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.a);
    ctx.fillStyle = t.colore; ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  };
  const luce = () => {
    const g = ctx.createRadialGradient(cx, base, 0, cx, base, bocca.l * 2.4);
    g.addColorStop(0, "rgba(242,147,63,.30)"); g.addColorStop(1, "rgba(242,147,63,0)");
    ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";
  };

  ctx.fillStyle = sfondo; ctx.fillRect(0, 0, W, H);
  if (!anima) { tessere.forEach(disegnaTessera); luce(); return; }
  tessere.sort((a, b) => a.ordine - b.ordine);
  const durata = 1100, partenza = performance.now();
  let fatte = 0;
  const passo = ora => {
    const fino = Math.min(tessere.length, Math.round(tessere.length * Math.min(1, (ora - partenza) / durata)));
    for (; fatte < fino; fatte++) disegnaTessera(tessere[fatte]);
    if (fatte < tessere.length) requestAnimationFrame(passo); else luce();
  };
  requestAnimationFrame(passo);
}

// ---------- pagine ----------
const pagina = document.body.dataset.pagina;

if (pagina === "home") {
  const st = statoImpasto();
  const h1 = $("titolo-impasto"), pronto = $("pronto");
  const scriviTitolo = () => {
    const ore = Math.floor((new Date() - st.impasto) / 36e5);
    if (st.oreTrascorse < 0) {
      const quando = nomeGiorno(st.impasto);
      h1.textContent = `${quando === "oggi" ? "Alle 11" : `${maiuscola(quando)} alle 11`} impastiamo per ${st.quale === "domani" ? "domani" : st.quale}.`;
    } else {
      h1.innerHTML = ore < 1 ? `L’impasto ${st.etichetta} è appena stato fatto.` : `L’impasto ${st.etichetta} lievita da <span class="ore">${ore}</span> ${ore === 1 ? "ora" : "ore"}.`;
    }
  };
  scriviTitolo();
  setInterval(scriviTitolo, 60e3);
  const inizioOre = st.s.inizio.getHours() + st.s.inizio.getMinutes() / 60;
  pronto.textContent = st.s.inizio <= adesso
    ? `Il forno è acceso: ogni pizza cuoce in 60–90 secondi.`
    : `Al forno ${st.quale === "oggi" ? "alle" : `${st.quale} alle`} ${hhmm(inizioOre)}, quando avrà ${st.oreAlForno} ore.`;

  // stasera: i prossimi orari prenotabili
  const s = prossimoServizio();
  const liberi = orariDelGiorno(s.giorno).filter(o => !orarioPassato(s.giorno, o) && oreDa(o) >= s.inizio.getHours() - .01).slice(0, 4);
  $("orari-stasera").innerHTML = liberi.map(o => {
    const p = postiLiberi(iso(s.giorno), o);
    return `<li><a class="${p < 2 ? "pieno" : ""}" href="prenota.html?giorno=${iso(s.giorno)}&ora=${encodeURIComponent(o)}"><b>${o}</b><span>${p < 2 ? "pieno" : `${p} posti`}</span></a></li>`;
  }).join("");
  $("quando-prenoti").textContent = `Posti liberi ${nomeGiorno(s.giorno) === "oggi" ? (s.inizio.getHours() >= 18 ? "stasera" : "oggi") : nomeGiorno(s.giorno)}`;

  $("fuori-menu").innerHTML = MENU[1].voci.map(voceHtml).join("");

  // mosaico
  const tela = $("mosaico");
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let primo = true, attesa = null;
  const avvia = () => { mosaico(tela, primo && !calmo); primo = false; };
  const carattere = document.fonts ? Promise.race([document.fonts.load('40px "Alfa Slab One"'), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve();
  carattere.then(() => {
    avvia();
    new ResizeObserver(() => { cancelAnimationFrame(attesa); attesa = requestAnimationFrame(() => mosaico(tela, false)); }).observe(tela.parentElement);
  });
}

if (pagina === "pizze") {
  const contenitore = $("menu");
  contenitore.innerHTML = MENU.map((g, i) => `<div class="gruppo" data-filtrabile="${g.filtrabile !== false}">
    <h2 id="gruppo-${i}">${g.gruppo}</h2>
    ${g.nota ? `<p>${g.nota}</p>` : ""}
    <ul class="voci" aria-labelledby="gruppo-${i}">${g.voci.map(voceHtml).join("")}</ul>
  </div>`).join("");
  const esito = $("esito-filtro");
  document.querySelector(".filtri").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    document.querySelectorAll(".filtri button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    const f = b.dataset.filtro;
    let mostrate = 0;
    contenitore.querySelectorAll(".gruppo").forEach(g => {
      if (g.dataset.filtrabile === "false") { g.hidden = f !== "tutte"; return; }
      let visibili = 0;
      g.querySelectorAll(".voce").forEach(v => {
        const ok = f === "tutte" || v.dataset.tag.split(" ").includes(f);
        v.hidden = !ok; if (ok) visibili++;
      });
      g.hidden = visibili === 0; mostrate += visibili;
    });
    esito.textContent = f === "tutte" ? "" : `${mostrate} ${mostrate === 1 ? "voce" : "voci"} ${ETICHETTE[f] === "vegetariana" ? "vegetariane" : ETICHETTE[f] === "piccante" ? "piccanti" : "senza lattosio"}.`;
  });
}

if (pagina === "impasto") {
  const st = statoImpasto();
  const numero = $("fase-numero"), testo = $("fase-testo");
  if (st.oreTrascorse < 0) {
    numero.textContent = "0";
    testo.textContent = `Il prossimo impasto si fa ${nomeGiorno(st.impasto) === "oggi" ? "oggi" : nomeGiorno(st.impasto)} alle 11, per ${st.quale === "oggi" ? "stasera" : st.quale}.`;
  } else {
    const ore = Math.floor(st.oreTrascorse);
    numero.textContent = `${ore} ${ore === 1 ? "ora" : "ore"}`;
    testo.textContent = st.fase.testo(st.etichetta);
    document.querySelectorAll(".tempo li").forEach(li => {
      const o = +li.dataset.ore;
      if (o === st.fase.ore) li.classList.add("ora");
      else if (o < st.fase.ore) li.classList.add("fatto");
    });
  }
}

if (pagina === "prenota") {
  const selGiorno = $("f-giorno"), selPersone = $("f-persone"), orari = $("orari"), esito = $("esito");
  const parametri = new URLSearchParams(location.search);
  const giorni = [];
  for (let i = 0; i < 15 && giorni.length < 14; i++) {
    const d = giornoDopo(adesso, i);
    if (orariDelGiorno(d).some(o => !orarioPassato(d, o))) giorni.push(d);
  }
  selGiorno.innerHTML = giorni.map(d => {
    const n = nomeGiorno(d);
    return `<option value="${iso(d)}">${n === "oggi" || n === "domani" ? `${maiuscola(n)}, ${dataLunga(d)}` : maiuscola(dataLunga(d))}</option>`;
  }).join("");
  if (parametri.get("giorno") && giorni.some(d => iso(d) === parametri.get("giorno"))) selGiorno.value = parametri.get("giorno");
  selPersone.innerHTML = Array.from({ length: 8 }, (_, i) => `<option value="${i + 1}"${i === 1 ? " selected" : ""}>${i + 1} ${i ? "persone" : "persona"}</option>`).join("");

  const disegnaOrari = (preferito) => {
    const d = new Date(`${selGiorno.value}T00:00`), persone = +selPersone.value;
    const precedente = preferito || orari.querySelector("input:checked")?.value;
    const lista = orariDelGiorno(d).map(o => {
      const passato = orarioPassato(d, o), p = postiLiberi(selGiorno.value, o);
      const no = passato || p < persone;
      return `<label><input type="radio" name="ora" value="${o}"${no ? " disabled" : ""}${!no && o === precedente ? " checked" : ""}><b>${o}</b><span>${passato ? "passato" : p < persone ? "pieno" : `${p} posti`}</span></label>`;
    });
    orari.innerHTML = lista.join("") || `<p class="vuoto">Questo giorno siamo chiusi.</p>`;
  };
  disegnaOrari(parametri.get("ora"));
  selGiorno.addEventListener("change", () => disegnaOrari());
  selPersone.addEventListener("change", () => disegnaOrari());

  $("modulo").addEventListener("submit", e => {
    e.preventDefault();
    const scelto = orari.querySelector("input:checked"), nome = $("f-nome"), tel = $("f-tel");
    const mancano = [];
    if (!scelto) mancano.push(["l’orario", orari.querySelector("input:not(:disabled)")]);
    if (!nome.value.trim()) mancano.push(["il nome", nome]);
    if (!tel.value.trim()) mancano.push(["il telefono", tel]);
    esito.hidden = false;
    if (mancano.length) {
      esito.className = "esito errore";
      esito.innerHTML = `<strong>${mancano.length > 1 ? "Mancano" : "Manca"} ${mancano.map(m => m[0]).join(", ").replace(/, ([^,]*)$/, " e $1")}.</strong> Completa e invia di nuovo.`;
      mancano[0][1]?.focus();
      return;
    }
    const d = new Date(`${selGiorno.value}T00:00`), persone = +selPersone.value;
    esito.className = "esito";
    esito.innerHTML = `<strong>Richiesta inviata.</strong> Tavolo per ${persone} ${persone === 1 ? "persona" : "persone"}, ${dataLunga(d)} alle ${scelto.value}, a nome ${nome.value.trim()}. Ti confermiamo con un SMS entro un’ora.<br><small>Questa è una demo: nessuna prenotazione è stata registrata.</small>`;
  });
}

if (pagina === "dove") {
  const ordine = [1, 2, 3, 4, 5, 6, 0];
  $("orari-settimana").innerHTML = ordine.map(g =>
    `<tr class="${g === adesso.getDay() ? "oggi" : ""}"><th scope="row">${maiuscola(GIORNI[g])}</th><td>${fasceTesto(g)}</td></tr>`
  ).join("");
}
