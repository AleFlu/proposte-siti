// Pastificio Carta Blu — dati e comportamenti comuni a tutte le pagine

// ---------- glifi dei formati (inseriti una volta in ogni pagina) ----------
const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <g id="g-tagliatelle" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
    <path d="M14 34 q15 -13 30 0 t30 0 t30 0"/><path d="M14 50 q15 -13 30 0 t30 0 t30 0"/>
    <path d="M14 66 q15 -13 30 0 t30 0 t30 0"/><path d="M14 82 q15 -13 30 0 t30 0 t30 0"/>
  </g>
  <g id="g-strichetti" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M20 28 L14 36 L20 44 L14 52 L20 60 L14 68 L20 76 L14 84 L20 92 L56 66 L56 54 Z"/>
    <path d="M100 28 L106 36 L100 44 L106 52 L100 60 L106 68 L100 76 L106 84 L100 92 L64 66 L64 54 Z"/>
    <path d="M56 54 q4 -4 8 0 M56 66 q4 4 8 0"/>
    <path d="M30 44 L48 56 M30 76 L48 64 M90 44 L72 56 M90 76 L72 64"/>
  </g>
  <g id="g-tortellini" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
    <path d="M36 82 C16 62 28 24 60 22 C92 24 104 62 84 82"/>
    <path d="M47 76 C36 62 44 42 60 42 C76 42 84 62 73 76"/>
    <path d="M36 82 Q56 98 73 76"/>
    <path d="M84 82 Q64 98 47 76"/>
    <path d="M27 52 C38 34 82 34 93 52"/>
  </g>
  <g id="g-garganelli" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <g transform="rotate(-28 60 60)">
      <path d="M24 44 L84 44 L96 76 L36 76 Z"/>
      <path d="M34 46 L44 74 M44 46 L54 74 M54 46 L64 74 M64 46 L74 74 M74 46 L84 74"/>
    </g>
  </g>
  <g id="g-anolini" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
    <circle cx="60" cy="60" r="30"/>
    <circle cx="60" cy="60" r="38" stroke-dasharray="3 6"/>
    <circle cx="60" cy="60" r="13"/>
  </g>
  <g id="g-erbetta" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <rect x="24" y="24" width="72" height="72" rx="3"/>
    <rect x="31" y="31" width="58" height="58" stroke-dasharray="4 5"/>
    <rect x="44" y="44" width="32" height="32" rx="14"/>
  </g>
  <g id="g-maltagliati" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">
    <path d="M18 34 L52 22 L60 52 L24 58 Z"/>
    <path d="M66 30 L102 40 L88 66 Z"/>
    <path d="M30 70 L70 64 L80 96 L40 98 Z"/>
  </g>
  <g id="g-passatelli" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
    <rect x="18" y="30" width="58" height="12" rx="6" transform="rotate(-8 47 36)"/>
    <rect x="44" y="50" width="60" height="12" rx="6" transform="rotate(6 74 56)"/>
    <rect x="16" y="70" width="54" height="12" rx="6" transform="rotate(4 43 76)"/>
    <rect x="60" y="86" width="44" height="12" rx="6" transform="rotate(-10 82 92)"/>
  </g>
</defs></svg>`;
document.body.insertAdjacentHTML("afterbegin", SPRITE);

// ---------- dati ----------
const FORMATI = {
  tagliatelle: { nome: "Tagliatelle", regione: "Bologna e Parma", glifo: "g-tagliatelle", prezzo: 14,
    cottura: "2 minuti dal bollore", con: "Ragù di carne, o burro e Parmigiano 30 mesi", nota: "Larghe 8 mm, come da tradizione" },
  tortellini: { nome: "Tortellini", regione: "Bologna", glifo: "g-tortellini", prezzo: 48,
    cottura: "3–4 minuti, in brodo di cappone", con: "Brodo, oppure panna solo se nessuno guarda", nota: "Lombo di maiale, prosciutto crudo, mortadella" },
  anolini: { nome: "Anolini", regione: "Parma e Piacenza", glifo: "g-anolini", prezzo: 42,
    cottura: "3 minuti in brodo di terza", con: "Brodo di manzo, gallina e cappone", nota: "Ripieno di stracotto cotto 24 ore" },
  erbetta: { nome: "Tortelli d’erbetta", regione: "Parma", glifo: "g-erbetta", prezzo: 26,
    cottura: "4 minuti, scolare con la schiumarola", con: "Burro fuso e tanto Parmigiano", nota: "Bietola, ricotta e Parmigiano" },
  garganelli: { nome: "Garganelli", regione: "Romagna", glifo: "g-garganelli", prezzo: 16,
    cottura: "4 minuti", con: "Ragù bianco, piselli e prosciutto", nota: "Rigati uno a uno sul pettine" },
  strichetti: { nome: "Strichetti", regione: "Bologna e Modena", glifo: "g-strichetti", prezzo: 15,
    cottura: "3 minuti", con: "Zucchine e salsiccia, o in brodo", nota: "Le farfalle emiliane, pizzicate a mano" },
  maltagliati: { nome: "Maltagliati", regione: "Tutta l’Emilia", glifo: "g-maltagliati", prezzo: 12,
    cottura: "3 minuti", con: "Minestra di fagioli", nota: "I ritagli della sfoglia: niente si butta" },
  passatelli: { nome: "Passatelli", regione: "Romagna", glifo: "g-passatelli", prezzo: 18,
    cottura: "Finché salgono a galla, poi 1 minuto", con: "Brodo di cappone, o asciutti con funghi", nota: "Pane, uovo, Parmigiano, noce moscata" }
};

// 0 = domenica
const BANCO = {
  0: { orari: "8:00 – 12:00", note: "Solo ritiro ordini", lista: [] },
  1: { orari: null, lista: [] },
  2: { orari: "7:30 – 13:30, 16:30 – 19:30", lista: ["tagliatelle", "garganelli", "erbetta"] },
  3: { orari: "7:30 – 13:30, 16:30 – 19:30", lista: ["tagliatelle", "maltagliati", "passatelli"] },
  4: { orari: "7:30 – 13:30, 16:30 – 19:30", lista: ["tagliatelle", "tortellini", "anolini"] },
  5: { orari: "7:30 – 13:30, 16:30 – 19:30", lista: ["tagliatelle", "strichetti", "erbetta"] },
  6: { orari: "7:30 – 13:30", lista: ["tagliatelle", "tortellini", "anolini", "garganelli", "erbetta"] }
};
const FASCE = { 0: [[8, 12]], 2: [[7.5, 13.5], [16.5, 19.5]], 3: [[7.5, 13.5], [16.5, 19.5]], 4: [[7.5, 13.5], [16.5, 19.5]], 5: [[7.5, 13.5], [16.5, 19.5]], 6: [[7.5, 13.5]] };
const NOMI_GIORNI = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const ORDINE_SETTIMANA = [1, 2, 3, 4, 5, 6, 0];
const ORDINABILI = ["tortellini", "anolini", "erbetta", "tagliatelle", "garganelli", "passatelli"];
const euro = n => n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
const ora = h => `${Math.floor(h)}:${h % 1 ? "30" : "00"}`;
const adesso = new Date();
const oggi = adesso.getDay();
const $ = id => document.getElementById(id);

const voceListino = id => {
  const f = FORMATI[id];
  return `<li><span><a class="piatto" href="formati.html#${id}">${f.nome}</a><span class="nota">${f.nota}</span></span><span class="prezzo">${euro(f.prezzo)}/kg</span></li>`;
};
const righeOrari = () => ORDINE_SETTIMANA.map(g =>
  `<tr class="${g === oggi ? "oggi" : ""}"><th scope="row">${NOMI_GIORNI[g]}</th><td>${BANCO[g].orari ? BANCO[g].orari + (BANCO[g].note ? `, ${BANCO[g].note.toLowerCase()}` : "") : "Chiuso"}</td></tr>`
).join("");

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
function testoStato() {
  const h = adesso.getHours() + adesso.getMinutes() / 60;
  const fasce = FASCE[oggi] || [];
  const aperta = fasce.find(([a, b]) => h >= a && h < b);
  if (aperta) return { aperto: true, html: `<span class="pallino"></span><strong>Aperto ora</strong>, fino alle ${ora(aperta[1])}` };
  const prossima = fasce.find(([a]) => h < a);
  let testo = prossima ? `riapre alle ${ora(prossima[0])}` : "";
  if (!prossima) {
    for (let i = 1; i <= 7; i++) {
      const g = (oggi + i) % 7;
      if (FASCE[g]) { testo = `riapre ${i === 1 ? "domani" : NOMI_GIORNI[g].toLowerCase()} alle ${ora(FASCE[g][0][0])}`; break; }
    }
  }
  return { aperto: false, html: `<span class="pallino"></span><strong>Chiuso</strong>, ${testo}` };
}
const stato = testoStato();
document.querySelectorAll("[data-stato]").forEach(el => {
  el.innerHTML = stato.html;
  el.classList.toggle("chiuso", !stato.aperto);
});
document.querySelectorAll("[data-orari-oggi]").forEach(el => {
  el.textContent = BANCO[oggi].orari ? `Oggi ${BANCO[oggi].orari}` : "Oggi chiuso";
});

// ---------- pagine ----------
const pagina = document.body.dataset.pagina;

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

  // banco di oggi, o del prossimo giorno di apertura
  let g = oggi, i = 0;
  while (!BANCO[g].lista.length && i < 7) { g = (g + 1) % 7; i++; }
  $("banco-oggi-titolo").textContent = g === oggi ? "Oggi al banco" : `${i === 1 ? "Domani" : NOMI_GIORNI[g]} al banco`;
  $("banco-oggi").innerHTML = (g === oggi ? "" : `<p class="vuoto">${oggi === 1 ? "Il lunedì il laboratorio riposa." : "Oggi il banco è chiuso."} Ecco cosa troverai ${i === 1 ? "domani" : NOMI_GIORNI[g].toLowerCase()}.</p>`)
    + `<ul class="listino">${BANCO[g].lista.map(voceListino).join("")}</ul>`;

  $("striscia").innerHTML = Object.entries(FORMATI).map(([id, f]) =>
    `<li><a href="formati.html#${id}"><svg viewBox="0 0 120 120" aria-hidden="true"><use href="#${f.glifo}"/></svg><span>${f.nome}</span></a></li>`
  ).join("");
}

if (pagina === "formati") {
  const lista = $("lista-formati"), scheda = $("scheda");
  lista.innerHTML = Object.entries(FORMATI).map(([id, f]) =>
    `<li class="formato"><button type="button" aria-expanded="false" aria-controls="scheda" data-id="${id}">
      <svg viewBox="0 0 120 120" aria-hidden="true"><use href="#${f.glifo}"/></svg>
      <span class="nome">${f.nome}</span>
      <span class="regione">${f.regione}</span>
    </button></li>`).join("");

  const apri = (id, scorri) => {
    const b = lista.querySelector(`[data-id="${id}"]`);
    lista.querySelectorAll("button").forEach(x => x.setAttribute("aria-expanded", "false"));
    if (!b) { scheda.hidden = true; return; }
    b.setAttribute("aria-expanded", "true");
    const f = FORMATI[id];
    const giorni = ORDINE_SETTIMANA.filter(g => BANCO[g].lista.includes(id)).map(g => NOMI_GIORNI[g].toLowerCase());
    scheda.innerHTML = `<div><h3>${f.nome}</h3><p>${f.nota}.</p></div>
      <dl>
        <dt>Cottura</dt><dd>${f.cottura}</dd>
        <dt>Con cosa</dt><dd>${f.con}</dd>
        <dt>Al banco</dt><dd>${giorni.length ? giorni.join(", ") : "solo su ordinazione"}</dd>
        <dt>Prezzo</dt><dd>${euro(f.prezzo)} al kg</dd>
      </dl>
      ${ORDINABILI.includes(id) ? `<a class="rimando" href="ordina.html?formato=${id}">Ordinali per domenica</a>` : ""}`;
    scheda.hidden = false;
    if (scorri) scheda.scrollIntoView({ block: "nearest" });
  };
  lista.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.getAttribute("aria-expanded") === "true") {
      b.setAttribute("aria-expanded", "false"); scheda.hidden = true;
      history.replaceState(null, "", location.pathname);
      return;
    }
    apri(b.dataset.id, false);
    history.replaceState(null, "", `#${b.dataset.id}`);
  });
  const daLink = location.hash.slice(1);
  if (FORMATI[daLink]) apri(daLink, true);
}

if (pagina === "banco") {
  const giorniEl = $("giorni"), bancoEl = $("banco-giorno");
  const mostra = g => {
    giorniEl.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(+b.dataset.g === g)));
    const b = BANCO[g];
    if (!b.orari) { bancoEl.innerHTML = `<p class="vuoto">Il lunedì il laboratorio riposa. Le tagliatelle di sabato reggono bene fino a stasera.</p>`; return; }
    if (!b.lista.length) { bancoEl.innerHTML = `<p class="vuoto">La domenica il banco è chiuso: prepariamo solo gli ordini prenotati entro venerdì.</p><a class="rimando" href="ordina.html">Ordina per domenica</a>`; return; }
    bancoEl.innerHTML = `<ul class="listino">${b.lista.map(voceListino).join("")}</ul>`;
  };
  ORDINE_SETTIMANA.forEach(g => {
    const b = document.createElement("button");
    b.type = "button"; b.role = "tab"; b.dataset.g = g;
    b.innerHTML = NOMI_GIORNI[g] + (g === oggi ? ' <span class="oggi">(oggi)</span>' : "");
    b.addEventListener("click", () => mostra(g));
    giorniEl.append(b);
  });
  mostra(oggi);
  $("orari").innerHTML = righeOrari();
}

if (pagina === "bottega") {
  $("orari").innerHTML = righeOrari();
  // la tappa della giornata in corso, nei giorni in cui il laboratorio lavora
  if (oggi !== 1) {
    const h = adesso.getHours() + adesso.getMinutes() / 60;
    const tappe = [...document.querySelectorAll(".giornata li")];
    const corrente = tappe.filter(li => +li.dataset.ore <= h).pop();
    if (corrente) corrente.classList.add("adesso");
  }
}

if (pagina === "ordina") {
  const sel = $("f-formato"), peso = $("f-peso"), stima = $("stima");
  sel.innerHTML = ORDINABILI
    .map(id => `<option value="${id}">${FORMATI[id].nome}, ${euro(FORMATI[id].prezzo)}/kg</option>`).join("");
  const scelto = new URLSearchParams(location.search).get("formato");
  if (scelto && sel.querySelector(`[value="${scelto}"]`)) sel.value = scelto;
  const aggiorna = () => { stima.textContent = `Totale indicativo: ${euro(FORMATI[sel.value].prezzo * +peso.value)}. Si paga al ritiro.`; };
  sel.addEventListener("change", aggiorna); peso.addEventListener("change", aggiorna); aggiorna();

  $("modulo").addEventListener("submit", e => {
    e.preventDefault();
    const nome = $("f-nome"), tel = $("f-tel"), conferma = $("conferma");
    if (!nome.value.trim() || !tel.value.trim()) {
      conferma.textContent = "Servono nome e telefono: ti chiamiamo solo se manca qualcosa.";
      conferma.hidden = false;
      (nome.value.trim() ? tel : nome).focus();
      return;
    }
    conferma.textContent = `Prenotato. ${FORMATI[sel.value].nome} per ${nome.value.trim().split(" ")[0]}, da ritirare domenica tra le 8 e le 12.`;
    conferma.hidden = false;
  });
}
