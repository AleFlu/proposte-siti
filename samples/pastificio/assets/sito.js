// Pastificio Carta Blu — comportamenti comuni. Tutto il contenuto è già nell'HTML:
// qui si aggiunge solo l'interazione (stato aperto, giorno di oggi, schede, modulo).

// 0 = domenica; fasce di apertura in ore decimali
const FASCE = { 0: [[8, 12]], 2: [[7.5, 13.5], [16.5, 19.5]], 3: [[7.5, 13.5], [16.5, 19.5]], 4: [[7.5, 13.5], [16.5, 19.5]], 5: [[7.5, 13.5], [16.5, 19.5]], 6: [[7.5, 13.5]] };
const NOMI_GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const euro = n => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const ora = h => `${Math.floor(h)}:${String(Math.round(h % 1 * 60)).padStart(2, "0")}`;
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const giornoDopo = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
const dataLunga = d => `${NOMI_GIORNI[d.getDay()]} ${d.getDate() === 1 ? "1°" : d.getDate()} ${MESI[d.getMonth()]}`;
// "domani", "giovedì", e oltre la settimana "martedì 3 novembre"
const quando = (d, salto) => salto === 1 ? "domani" : salto < 7 ? NOMI_GIORNI[d.getDay()] : dataLunga(d);
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
const oggi = adesso.getDay();
const $ = id => document.getElementById(id);
const pagina = document.body.dataset.pagina;

// chiusure e orari speciali scritti dal generatore (comune.py): "al" compreso, senza fasce il giorno è chiuso
const CHIUSURE = JSON.parse($("chiusure-dati")?.textContent || "[]");
const chiusuraDel = d => CHIUSURE.find(c => c.dal <= iso(d) && iso(d) <= c.al);
const fasceDel = d => { const c = chiusuraDel(d); return c ? c.fasce : FASCE[d.getDay()] || []; };
const chiusoPer = c => c && !c.fasce.length ? `chiuso${c.motivo ? ` per ${c.motivo}` : ""}` : "";

// ---------- menu su telefono ----------
const menuApri = document.querySelector(".menu-apri");
const nav = $("nav");
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

// ---------- stato apertura in tempo reale ----------
(function () {
  const h = adesso.getHours() + adesso.getMinutes() / 60;
  const fasce = fasceDel(adesso), chiuso = chiusoPer(chiusuraDel(adesso));
  const aperta = fasce.find(([a, b]) => h >= a && h < b);
  let html;
  if (aperta) html = `<span class="pallino"></span><strong>Aperto ora</strong>, fino alle ${ora(aperta[1])}`;
  else {
    const prossima = fasce.find(([a]) => h < a);
    let testo = prossima ? `riapre alle ${ora(prossima[0])}` : "";
    for (let i = 1; !prossima && i <= 120; i++) {
      const d = giornoDopo(adesso, i), f = fasceDel(d);
      if (f.length) { testo = `riapre ${quando(d, i)} alle ${ora(f[0][0])}`; break; }
    }
    html = `<span class="pallino"></span><strong>${chiuso ? chiuso.charAt(0).toUpperCase() + chiuso.slice(1) : "Chiuso"}</strong>, ${testo}`;
  }
  document.querySelectorAll("[data-stato]").forEach(el => { el.innerHTML = html; el.classList.toggle("chiuso", !aperta); });
  document.querySelectorAll("[data-orari-oggi]").forEach(el => {
    el.textContent = fasce.length ? `Oggi ${fasce.map(([a, b]) => `${ora(a)} – ${ora(b)}`).join(", ")}` : `Oggi ${chiuso || "chiuso"}`;
  });
  // il giorno della settimana si evidenzia solo se oggi non è un giorno di chiusura
  document.querySelectorAll(".orari tr[data-giorno]").forEach(tr => tr.classList.toggle("oggi", +tr.dataset.giorno === oggi && !chiusuraDel(adesso)));

  // chiusure: l'avviso in cima compare qualche giorno prima, la tabella mostra solo le prossime
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
})();

// ---------- home ----------
if (pagina === "home") {
  // disegno a tratto dei glifi in apertura
  document.querySelectorAll(".disegna svg").forEach(svg => {
    const g = document.querySelector(svg.querySelector("use").getAttribute("href"));
    const copia = g.cloneNode(true);
    copia.removeAttribute("id");
    copia.querySelectorAll("path, ellipse, circle, rect").forEach(el => {
      if (!el.hasAttribute("stroke-dasharray")) el.setAttribute("pathLength", "1");
    });
    svg.replaceChildren(copia);
  });

  // il banco di oggi, o del prossimo giorno aperto in cui c'è pasta al banco
  const pannelli = [...document.querySelectorAll(".giorno-home")];
  let salto, giorno, scelto;
  for (salto = 0; salto < 120; salto++) {
    giorno = giornoDopo(adesso, salto);
    if (fasceDel(giorno).length && (scelto = pannelli.find(p => +p.dataset.giorno === giorno.getDay()))) break;
  }
  if (scelto) {
    pannelli.forEach(p => { p.hidden = p !== scelto; });
    const titolo = salto === 0 ? "Oggi" : salto === 1 ? "Domani" : null;
    $("banco-oggi-titolo").textContent = titolo ? `${titolo} al banco` : salto < 7 ? scelto.dataset.titolo : `${dataLunga(giorno).replace(/^./, c => c.toUpperCase())} al banco`;
    if (salto > 0) {
      const avviso = $("banco-avviso"), chiuso = chiusoPer(chiusuraDel(adesso));
      const perche = chiuso ? `Oggi ${chiuso}.` : oggi === 1 ? "Il lunedì il laboratorio riposa." : "Oggi il banco è chiuso.";
      avviso.textContent = `${perche} Ecco cosa troverai ${quando(giorno, salto)}.`;
      avviso.hidden = false;
    }
  }
}

// ---------- formati: una scheda alla volta ----------
if (pagina === "formati") {
  const pulsanti = [...document.querySelectorAll(".formato button")];
  const apri = (id, porta) => {
    pulsanti.forEach(b => {
      const aperto = b.dataset.id === id;
      b.setAttribute("aria-expanded", String(aperto));
      $("scheda-" + b.dataset.id).hidden = !aperto;
    });
    const scheda = $("scheda-" + id);
    if (scheda && porta) scheda.scrollIntoView({ block: "nearest" });
  };
  pulsanti.forEach(b => b.addEventListener("click", () => {
    if (b.getAttribute("aria-expanded") === "true") {
      apri(null); history.replaceState(null, "", location.pathname);
    } else {
      apri(b.dataset.id, true); history.replaceState(null, "", "#" + b.dataset.id);
    }
  }));
  const daLink = location.hash.slice(1);
  if ($("scheda-" + daLink)) apri(daLink, true);
}

// ---------- banco: schede dei giorni, con frecce, Home e Fine ----------
if (pagina === "banco") {
  const schede = [...document.querySelectorAll('[role="tab"]')];
  const seleziona = (tab, focus) => {
    schede.forEach(t => {
      const s = t === tab;
      t.setAttribute("aria-selected", String(s));
      t.tabIndex = s ? 0 : -1;
      $(t.getAttribute("aria-controls")).hidden = !s;
    });
    if (focus) tab.focus();
  };
  schede.forEach((t, i) => {
    if (+t.dataset.giorno === oggi) t.insertAdjacentHTML("beforeend", ' <span class="oggi">(oggi)</span>');
    t.addEventListener("click", () => seleziona(t));
    t.addEventListener("keydown", e => {
      const vai = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: schede.length - 1 }[e.key];
      if (vai === undefined) return;
      e.preventDefault();
      seleziona(schede[(vai + schede.length) % schede.length], true);
    });
  });
  seleziona(schede.find(t => +t.dataset.giorno === oggi) || schede[0]);
}

// ---------- bottega: la tappa della giornata in corso ----------
if (pagina === "bottega" && oggi >= 2 && oggi <= 6 && !chiusuraDel(adesso)) {
  const h = adesso.getHours() + adesso.getMinutes() / 60;
  const corrente = [...document.querySelectorAll(".giornata li")].filter(li => +li.dataset.ore <= h).pop();
  if (corrente) corrente.classList.add("adesso");
}

// ---------- ordine della domenica ----------
if (pagina === "ordina") {
  const sel = $("f-formato"), peso = $("f-peso"), stima = $("stima");
  // la prossima domenica di ritiro: si ordina entro il venerdì prima alle 19, le domeniche di chiusura si saltano
  const saltate = [];
  let ritiro;
  for (let i = 0; i < 120 && !ritiro; i++) {
    const d = giornoDopo(adesso, i), entro = giornoDopo(d, -2);
    entro.setHours(19);
    if (d.getDay() !== 0 || entro <= adesso) continue;
    if (fasceDel(d).length) ritiro = { d, entro }; else saltate.push(d);
  }
  if (ritiro) {
    const chiuse = saltate.map(d => `${dataLunga(d).replace(/^./, c => c.toUpperCase())} ${chiusoPer(chiusuraDel(d))}. `).join("");
    $("quando-ritiro").textContent = `${chiuse}Ritiro ${dataLunga(ritiro.d)} tra le 8 e le 12: prenota entro ${dataLunga(ritiro.entro)} alle 19.`;
  }
  const scelto = new URLSearchParams(location.search).get("formato");
  if (scelto && sel.querySelector(`[value="${CSS.escape(scelto)}"]`)) sel.value = scelto;
  const aggiorna = () => {
    const prezzo = +sel.selectedOptions[0].dataset.prezzo;
    stima.textContent = `Totale indicativo: ${euro(prezzo * +peso.value)}. Si paga al ritiro.`;
  };
  sel.addEventListener("change", aggiorna); peso.addEventListener("change", aggiorna); aggiorna();
  ["f-nome", "f-tel"].forEach(id => $(id).addEventListener("input", e => e.target.removeAttribute("aria-invalid")));

  $("modulo").addEventListener("submit", e => {
    e.preventDefault();
    const nome = $("f-nome"), tel = $("f-tel"), conferma = $("conferma");
    conferma.hidden = false;
    [nome, tel].forEach(c => c.value.trim() ? c.removeAttribute("aria-invalid") : c.setAttribute("aria-invalid", "true"));
    if (!nome.value.trim() || !tel.value.trim()) {
      conferma.textContent = "Servono nome e telefono: ti chiamiamo solo se manca qualcosa.";
      (nome.value.trim() ? tel : nome).focus();
      return;
    }
    const formato = sel.selectedOptions[0].textContent.split(",")[0];
    conferma.innerHTML = `Prenotato. ${formato} per ${esc(nome.value.trim().split(" ")[0])}, da ritirare ${ritiro ? dataLunga(ritiro.d) : "domenica"} tra le 8 e le 12.<br><small>Questa è una demo: nessun ordine è stato registrato.</small>`;
  });
}
