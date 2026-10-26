// Base comune a tutti i siti (standard/base/base.js), copiata dal generatore in assets/base.js.
// Tutto il contenuto è già nell'HTML: qui si aggiunge solo interazione, e senza JavaScript la pagina resta completa.
// Il JavaScript proprio del sito va in assets/sito.js.

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

// ---------- menu su telefono, chiudibile con Esc ----------
(function () {
  const bottone = document.querySelector(".menu-apri"), nav = $("nav");
  if (!bottone || !nav) return;
  bottone.addEventListener("click", () => {
    const aperto = nav.classList.toggle("aperta");
    bottone.setAttribute("aria-expanded", String(aperto));
    bottone.textContent = aperto ? "Chiudi" : "Menu";
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("aperta")) { bottone.click(); bottone.focus(); }
  });
})();

// ---------- aperto ora / chiuso, dagli orari e dalle chiusure scritti dal generatore ----------
// <script id="orari-dati">     { "0": [[8, 12]], "2": [[7.5, 13.5], [16.5, 19.5]], … }   0 = domenica, ore decimali
// <script id="chiusure-dati">  [{ "dal": "2026-12-25", "al": "2026-12-26", "motivo": "Natale", "fasce": [] }, …]
//                              "al" compreso; con delle fasce il giorno ha un orario speciale invece di essere chiuso
(function () {
  const dati = $("orari-dati");
  if (!dati) return;
  const settimana = JSON.parse(dati.textContent);
  const chiusure = JSON.parse($("chiusure-dati")?.textContent || "[]");
  const giorni = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const mesi = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const ora = h => `${Math.floor(h)}:${String(Math.round(h % 1 * 60)).padStart(2, "0")}`;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const giornoDopo = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x; };
  const chiusuraDel = d => chiusure.find(c => c.dal <= iso(d) && iso(d) <= c.al);
  const fasceDel = d => { const c = chiusuraDel(d); return c ? c.fasce : settimana[d.getDay()] || []; };
  // "domani", "giovedì", e oltre la settimana "martedì 3 novembre"
  const quando = (d, salto) => salto === 1 ? "domani" : salto < 7 ? giorni[d.getDay()] : `${giorni[d.getDay()]} ${d.getDate() === 1 ? "1°" : d.getDate()} ${mesi[d.getMonth()]}`;

  const adesso = oraItalia(), oggiIso = iso(adesso), chiusa = chiusuraDel(adesso);
  const h = adesso.getHours() + adesso.getMinutes() / 60;
  const diOggi = fasceDel(adesso);
  const aperta = diOggi.find(([a, b]) => h >= a && h < b);
  let testo;
  if (aperta) testo = `<strong>Aperto ora</strong>, fino alle ${ora(aperta[1])}`;
  else {
    const dopo = diOggi.find(([a]) => h < a);
    let riapre = dopo ? `riapre alle ${ora(dopo[0])}` : "";
    for (let i = 1; !dopo && i <= 120; i++) {      // le ferie possono durare settimane
      const d = giornoDopo(adesso, i), f = fasceDel(d);
      if (f.length) { riapre = `riapre ${quando(d, i)} alle ${ora(f[0][0])}`; break; }
    }
    const perche = chiusa && !chiusa.fasce.length && chiusa.motivo ? `Chiuso per ${esc(chiusa.motivo)}` : "Chiuso";
    testo = `<strong>${perche}</strong>${riapre ? `, ${riapre}` : ""}`;
  }
  document.querySelectorAll("[data-stato]").forEach(el => { el.innerHTML = testo; el.classList.toggle("chiuso", !aperta); });
  // il giorno della settimana si evidenzia solo se oggi non è un giorno di chiusura
  document.querySelectorAll("tr[data-giorno]").forEach(tr => tr.classList.toggle("oggi", +tr.dataset.giorno === adesso.getDay() && !chiusa));

  // gli avvisi in cima alle pagine li mostra lo script accanto a loro (comune.avvisi_chiusure), prima che la pagina compaia
  // tabella delle prossime chiusure: niente righe passate, niente oltre l'orizzonte
  document.querySelectorAll(".chiusure").forEach(box => {
    const fino = iso(giornoDopo(adesso, +box.dataset.orizzonte));
    box.querySelectorAll("tr[data-dal]").forEach(tr => {
      tr.hidden = tr.dataset.al < oggiIso || tr.dataset.dal > fino;
      tr.classList.toggle("oggi", tr.dataset.dal <= oggiIso && oggiIso <= tr.dataset.al);
    });
    box.hidden = !box.querySelector("tr[data-dal]:not([hidden])");
  });
})();

// ---------- indice di un contenuto lungo: evidenzia la sezione che si sta leggendo ----------
(function () {
  const voci = [...document.querySelectorAll('.indice a[href^="#"]')];
  if (!voci.length || !("IntersectionObserver" in window)) return;
  const evidenzia = id => voci.forEach(a => {
    if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
  const osservatore = new IntersectionObserver(sezioni => {
    const visibili = sezioni.filter(s => s.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visibili.length) evidenzia(visibili[0].target.id);
  }, { rootMargin: "-20% 0px -65% 0px" });
  document.querySelectorAll(".sezione-indice").forEach(s => osservatore.observe(s));
})();

// ---------- schede (tab): frecce, Home e Fine ----------
document.querySelectorAll('[role="tablist"]').forEach(lista => {
  const schede = [...lista.querySelectorAll('[role="tab"]')];
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
    t.addEventListener("click", () => seleziona(t));
    t.addEventListener("keydown", e => {
      const vai = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: schede.length - 1 }[e.key];
      if (vai === undefined) return;
      e.preventDefault();
      seleziona(schede[(vai + schede.length) % schede.length], true);
    });
  });
});
