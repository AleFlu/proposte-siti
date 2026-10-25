// Pastificio Carta Blu — comportamenti comuni. Tutto il contenuto è già nell'HTML:
// qui si aggiunge solo l'interazione (stato aperto, giorno di oggi, schede, modulo).

// 0 = domenica; fasce di apertura in ore decimali
const FASCE = { 0: [[8, 12]], 2: [[7.5, 13.5], [16.5, 19.5]], 3: [[7.5, 13.5], [16.5, 19.5]], 4: [[7.5, 13.5], [16.5, 19.5]], 5: [[7.5, 13.5], [16.5, 19.5]], 6: [[7.5, 13.5]] };
const ORARI = { 0: "8:00 – 12:00", 2: "7:30 – 13:30, 16:30 – 19:30", 3: "7:30 – 13:30, 16:30 – 19:30", 4: "7:30 – 13:30, 16:30 – 19:30", 5: "7:30 – 13:30, 16:30 – 19:30", 6: "7:30 – 13:30" };
const NOMI_GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const euro = n => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const ora = h => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;
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
  const fasce = FASCE[oggi] || [];
  const aperta = fasce.find(([a, b]) => h >= a && h < b);
  let html, chiuso = !aperta;
  if (aperta) html = `<span class="pallino"></span><strong>Aperto ora</strong>, fino alle ${ora(aperta[1])}`;
  else {
    const prossima = fasce.find(([a]) => h < a);
    let testo = prossima ? `riapre alle ${ora(prossima[0])}` : "";
    for (let i = 1; !prossima && i <= 7; i++) {
      const g = (oggi + i) % 7;
      if (FASCE[g]) { testo = `riapre ${i === 1 ? "domani" : NOMI_GIORNI[g]} alle ${ora(FASCE[g][0][0])}`; break; }
    }
    html = `<span class="pallino"></span><strong>Chiuso</strong>, ${testo}`;
  }
  document.querySelectorAll("[data-stato]").forEach(el => { el.innerHTML = html; el.classList.toggle("chiuso", chiuso); });
  document.querySelectorAll("[data-orari-oggi]").forEach(el => { el.textContent = ORARI[oggi] ? `Oggi ${ORARI[oggi]}` : "Oggi chiuso"; });
  document.querySelectorAll(".orari tr[data-giorno]").forEach(tr => tr.classList.toggle("oggi", +tr.dataset.giorno === oggi));
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

  // il banco di oggi, o del prossimo giorno in cui c'è pasta al banco
  const pannelli = [...document.querySelectorAll(".giorno-home")];
  let g = oggi, salto = 0, scelto;
  while (!(scelto = pannelli.find(p => +p.dataset.giorno === g)) && salto < 7) { g = (g + 1) % 7; salto++; }
  if (scelto) {
    pannelli.forEach(p => { p.hidden = p !== scelto; });
    $("banco-oggi-titolo").textContent = salto === 0 ? "Oggi al banco" : salto === 1 ? "Domani al banco" : scelto.dataset.titolo;
    if (salto > 0) {
      const avviso = $("banco-avviso");
      avviso.textContent = `${oggi === 1 ? "Il lunedì il laboratorio riposa." : "Oggi il banco è chiuso."} Ecco cosa troverai ${salto === 1 ? "domani" : NOMI_GIORNI[g]}.`;
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
if (pagina === "bottega" && oggi !== 1) {
  const h = adesso.getHours() + adesso.getMinutes() / 60;
  const corrente = [...document.querySelectorAll(".giornata li")].filter(li => +li.dataset.ore <= h).pop();
  if (corrente) corrente.classList.add("adesso");
}

// ---------- ordine della domenica ----------
if (pagina === "ordina") {
  const sel = $("f-formato"), peso = $("f-peso"), stima = $("stima");
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
    conferma.innerHTML = `Prenotato. ${formato} per ${esc(nome.value.trim().split(" ")[0])}, da ritirare domenica tra le 8 e le 12.<br><small>Questa è una demo: nessun ordine è stato registrato.</small>`;
  });
}
