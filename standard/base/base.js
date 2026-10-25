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

// ---------- aperto ora / chiuso, dagli orari scritti dal generatore in <script id="orari-dati"> ----------
(function () {
  const dati = $("orari-dati");
  if (!dati) return;
  const fasce = JSON.parse(dati.textContent);          // { "0": [[8, 12]], "2": [[7.5, 13.5], [16.5, 19.5]], … } 0 = domenica
  const giorni = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const ora = h => `${Math.floor(h)}:${String(Math.round(h % 1 * 60)).padStart(2, "0")}`;
  const adesso = oraItalia(), oggi = adesso.getDay();
  const h = adesso.getHours() + adesso.getMinutes() / 60;
  const diOggi = fasce[oggi] || [];
  const aperta = diOggi.find(([a, b]) => h >= a && h < b);
  let testo;
  if (aperta) testo = `<strong>Aperto ora</strong>, fino alle ${ora(aperta[1])}`;
  else {
    const dopo = diOggi.find(([a]) => h < a);
    let quando = dopo ? `riapre alle ${ora(dopo[0])}` : "";
    for (let i = 1; !dopo && i <= 7; i++) {
      const g = (oggi + i) % 7;
      if (fasce[g]) { quando = `riapre ${i === 1 ? "domani" : giorni[g]} alle ${ora(fasce[g][0][0])}`; break; }
    }
    testo = `<strong>Chiuso</strong>, ${quando}`;
  }
  document.querySelectorAll("[data-stato]").forEach(el => { el.innerHTML = testo; el.classList.toggle("chiuso", !aperta); });
  document.querySelectorAll("tr[data-giorno]").forEach(tr => tr.classList.toggle("oggi", +tr.dataset.giorno === oggi));
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
