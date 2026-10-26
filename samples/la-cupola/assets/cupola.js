// Pizzeria La Cupola — dati e comportamenti comuni a tutte le pagine

// ---------- dati ----------
// 0 = domenica; fasce in ore decimali
const SERVIZI = { 0: [[12.5, 14.5], [19, 23.5]], 1: [], 2: [[19, 23.5]], 3: [[19, 23.5]], 4: [[19, 23.5]], 5: [[19, 23.5]], 6: [[12.5, 14.5], [19, 23.5]] };
const ORARI_PRANZO = ["12:30", "13:00", "13:30"];
const ORARI_CENA = ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const POSTI_SALA = 32;
const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
// ---------- utilità ----------
const $ = id => document.getElementById(id);
// ora italiana, qualunque sia il fuso del telefono: gli orari dell'attività sono quelli di Roma
function oraItalia() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome", hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric"
  }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return new Date(+p.year, p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
}
// il testo scritto da chi visita va sempre trattato come testo, mai come HTML
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const adesso = oraItalia();
const euro = n => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const hhmm = h => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
const oreDa = s => { const [h, m] = s.split(":").map(Number); return h + m / 60; };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const giornoDopo = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
const conOra = (d, h) => { const x = new Date(d); x.setHours(Math.floor(h), Math.round((h % 1) * 60), 0, 0); return x; };
const fasceTesto = d => fasceDel(d).map(([a, b]) => `${hhmm(a)} – ${hhmm(b)}`).join(", ") || "Chiuso";
// oltre la settimana il nome del giorno non basta: "martedì 3 novembre"
const nomeGiorno = (d, rispetto = adesso) => {
  const diff = Math.round((giornoDopo(d, 0) - giornoDopo(rispetto, 0)) / 864e5);
  return diff === 0 ? "oggi" : diff === 1 ? "domani" : diff < 7 ? GIORNI[d.getDay()] : dataLunga(d);
};
const dataLunga = d => `${GIORNI[d.getDay()]} ${d.getDate() === 1 ? "1°" : d.getDate()} ${MESI[d.getMonth()]}`;
const maiuscola = s => s.charAt(0).toUpperCase() + s.slice(1);

// chiusure e orari speciali scritti dal generatore (comune.py): "al" compreso, senza fasce il giorno è chiuso
const CHIUSURE = JSON.parse($("chiusure-dati")?.textContent || "[]");
const chiusuraDel = d => CHIUSURE.find(c => c.dal <= iso(d) && iso(d) <= c.al);
const fasceDel = d => { const c = chiusuraDel(d); return c ? c.fasce : SERVIZI[d.getDay()]; };
const chiusoPer = c => c && !c.fasce.length ? `chiuso${c.motivo ? ` per ${c.motivo}` : ""}` : "";

// il prossimo servizio che non è ancora finito (le chiusure per ferie possono durare settimane)
function prossimoServizio(da = adesso) {
  for (let i = 0; i < 120; i++) {
    const giorno = giornoDopo(da, i);
    for (const [a, b] of fasceDel(giorno)) {
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
// orari prenotabili: quelli che stanno nelle fasce del giorno, fino a un'ora prima della chiusura
const orariDelGiorno = d => fasceDel(d).flatMap(([a, b]) => [...ORARI_PRANZO, ...ORARI_CENA].filter(o => oreDa(o) >= a && oreDa(o) <= b - 1));
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
  const quale = nomeGiorno(s.giorno), chiuso = chiusoPer(chiusuraDel(adesso));
  if (s.inizio <= adesso) return { aperto: true, testo: `<span class="pallino"></span><strong>Aperti adesso</strong>, fino alle ${hhmm(s.fine.getHours() + s.fine.getMinutes() / 60)}` };
  const quando = quale === "oggi" ? (s.inizio.getHours() >= 18 ? "Stasera" : "Oggi") : maiuscola(quale);
  const prefisso = quale === "oggi" ? "" : chiuso ? `${maiuscola(chiuso)}. ` : "Oggi chiuso. ";
  return { aperto: false, testo: `<span class="pallino"></span><strong>${prefisso}${quando} ${chiuso ? "riapriamo" : "apriamo"} alle ${hhmm(s.inizio.getHours() + s.inizio.getMinutes() / 60)}</strong>` };
}
const apertura = testoApertura();
document.querySelectorAll("[data-apertura]").forEach(el => { el.innerHTML = apertura.testo; el.classList.toggle("chiuso", !apertura.aperto); });
document.querySelectorAll("[data-orari-oggi]").forEach(el => {
  el.textContent = fasceDel(adesso).length ? `Oggi ${fasceTesto(adesso)}` : `Oggi ${chiusoPer(chiusuraDel(adesso)) || "chiuso"}`;
});

// ---------- chiusure: l'avviso in cima compare qualche giorno prima, la tabella mostra solo le prossime ----------
const oggiIso = iso(adesso);
// al massimo due avvisi alla volta, i più vicini (sono già in ordine di data)
let avvisi = 0;
document.querySelectorAll(".avviso-chiusura").forEach(el => { el.hidden = !(el.dataset.da <= oggiIso && oggiIso <= el.dataset.al && avvisi++ < 2); });
document.querySelectorAll(".chiusure").forEach(box => {
  const fino = iso(giornoDopo(adesso, +box.dataset.orizzonte));
  box.querySelectorAll("tr[data-dal]").forEach(tr => {
    tr.hidden = tr.dataset.al < oggiIso || tr.dataset.dal > fino;
    tr.classList.toggle("oggi", tr.dataset.dal <= oggiIso && oggiIso <= tr.dataset.al);
  });
  box.hidden = !box.querySelector("tr[data-dal]:not([hidden])");
});

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
    const ore = Math.floor((oraItalia() - st.impasto) / 36e5);
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

// ---------- allergeni: i nomi si aprono toccando i numeri ----------
document.querySelectorAll(".allergeni").forEach(b => {
  const nomi = $(b.getAttribute("aria-controls"));
  if (!nomi) return;
  nomi.hidden = true;
  b.addEventListener("click", () => {
    const aperto = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(aperto));
    nomi.hidden = !aperto;
  });
});

if (pagina === "pizze") {
  // l'indice segue la sezione che si sta leggendo
  const voci = [...document.querySelectorAll(".indice-menu a")];
  const lista = document.querySelector(".indice-menu ul");
  const evidenzia = id => {
    voci.forEach(a => {
      const attiva = a.getAttribute("href") === `#${id}`;
      a.toggleAttribute("aria-current", attiva);
      if (attiva) a.setAttribute("aria-current", "true");
      if (attiva && lista.scrollWidth > lista.clientWidth) {
        lista.scrollTo({ left: a.offsetLeft - lista.clientWidth / 2 + a.offsetWidth / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    });
  };
  const osservatore = new IntersectionObserver(voci_ => {
    const visibili = voci_.filter(v => v.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visibili.length) evidenzia(visibili[0].target.id);
  }, { rootMargin: "-20% 0px -65% 0px" });
  document.querySelectorAll(".sezione-menu").forEach(sez => osservatore.observe(sez));
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
  for (let i = 0; i < 60 && giorni.length < 14; i++) {
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
  ["f-nome", "f-tel"].forEach(id => $(id).addEventListener("input", e => e.target.removeAttribute("aria-invalid")));
  selPersone.addEventListener("change", () => disegnaOrari());

  $("modulo").addEventListener("submit", e => {
    e.preventDefault();
    const scelto = orari.querySelector("input:checked"), nome = $("f-nome"), tel = $("f-tel");
    const mancano = [];
    if (!scelto) mancano.push(["l’orario", orari.querySelector("input:not(:disabled)")]);
    if (!nome.value.trim()) mancano.push(["il nome", nome]);
    if (!tel.value.trim()) mancano.push(["il telefono", tel]);
    [nome, tel].forEach(c => c.value.trim() ? c.removeAttribute("aria-invalid") : c.setAttribute("aria-invalid", "true"));
    esito.hidden = false;
    if (mancano.length) {
      esito.className = "esito errore";
      esito.innerHTML = `<strong>${mancano.length > 1 ? "Mancano" : "Manca"} ${mancano.map(m => m[0]).join(", ").replace(/, ([^,]*)$/, " e $1")}.</strong> Completa e invia di nuovo.`;
      mancano[0][1]?.focus();
      return;
    }
    const d = new Date(`${selGiorno.value}T00:00`), persone = +selPersone.value;
    esito.className = "esito";
    esito.innerHTML = `<strong>Richiesta inviata.</strong> Tavolo per ${persone} ${persone === 1 ? "persona" : "persone"}, ${dataLunga(d)} alle ${scelto.value}, a nome ${esc(nome.value.trim())}. Ti confermiamo con un SMS entro un’ora.<br><small>Questa è una demo: nessuna prenotazione è stata registrata.</small>`;
  });
}

if (pagina === "dove") {
  // la tabella è già nell'HTML: qui si evidenzia solo il giorno di oggi, se non è un giorno di chiusura
  document.querySelectorAll("#orari-settimana tr[data-giorno]").forEach(tr => tr.classList.toggle("oggi", +tr.dataset.giorno === adesso.getDay() && !chiusuraDel(adesso)));
}
