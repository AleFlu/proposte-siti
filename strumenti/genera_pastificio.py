"""Genera le pagine statiche del Pastificio Carta Blu.

Uso: python3 strumenti/genera_pastificio.py
Dati (formati, banco, orari), testata, piede e meta SEO stanno qui: modificare
questo file e rigenerare, invece di toccare a mano gli HTML in samples/pastificio/.
Tutto il contenuto è scritto nell'HTML; assets/sito.js aggiunge solo l'interazione.
"""
import html
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "samples" / "pastificio"
BASE = "https://aleflu.github.io/proposte-siti/pastificio/"
TELEFONO = "0521 000 000"
TEL_LINK = "+390521000000"
PIVA = "00000000000"
CUR = ' aria-current="page"'
e = html.escape

FORMATI = {
    "tagliatelle": dict(nome="Tagliatelle", regione="Bologna e Parma", prezzo=14, cottura="2 minuti dal bollore",
        con="Ragù di carne, o burro e Parmigiano 30 mesi", nota="Larghe 8 mm, come da tradizione"),
    "tortellini": dict(nome="Tortellini", regione="Bologna", prezzo=48, cottura="3–4 minuti, in brodo di cappone",
        con="Brodo, oppure panna solo se nessuno guarda", nota="Lombo di maiale, prosciutto crudo, mortadella"),
    "anolini": dict(nome="Anolini", regione="Parma e Piacenza", prezzo=42, cottura="3 minuti in brodo di terza",
        con="Brodo di manzo, gallina e cappone", nota="Ripieno di stracotto cotto 24 ore"),
    "erbetta": dict(nome="Tortelli d’erbetta", regione="Parma", prezzo=26, cottura="4 minuti, scolare con la schiumarola",
        con="Burro fuso e tanto Parmigiano", nota="Bietola, ricotta e Parmigiano"),
    "garganelli": dict(nome="Garganelli", regione="Romagna", prezzo=16, cottura="4 minuti",
        con="Ragù bianco, piselli e prosciutto", nota="Rigati uno a uno sul pettine"),
    "strichetti": dict(nome="Strichetti", regione="Bologna e Modena", prezzo=15, cottura="3 minuti",
        con="Zucchine e salsiccia, o in brodo", nota="Le farfalle emiliane, pizzicate a mano"),
    "maltagliati": dict(nome="Maltagliati", regione="Tutta l’Emilia", prezzo=12, cottura="3 minuti",
        con="Minestra di fagioli", nota="I ritagli della sfoglia: niente si butta"),
    "passatelli": dict(nome="Passatelli", regione="Romagna", prezzo=18, cottura="Finché salgono a galla, poi 1 minuto",
        con="Brodo di cappone, o asciutti con funghi", nota="Pane, uovo, Parmigiano, noce moscata"),
}
ORDINABILI = ["tortellini", "anolini", "erbetta", "tagliatelle", "garganelli", "passatelli"]
GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
# indice JavaScript del giorno (0 = domenica) per ogni giorno in ordine da lunedì
JS_GIORNO = [1, 2, 3, 4, 5, 6, 0]
BANCO = {
    "Lunedì": dict(orari=None, lista=[]),
    "Martedì": dict(orari="7:30 – 13:30, 16:30 – 19:30", lista=["tagliatelle", "garganelli", "erbetta"]),
    "Mercoledì": dict(orari="7:30 – 13:30, 16:30 – 19:30", lista=["tagliatelle", "maltagliati", "passatelli"]),
    "Giovedì": dict(orari="7:30 – 13:30, 16:30 – 19:30", lista=["tagliatelle", "tortellini", "anolini"]),
    "Venerdì": dict(orari="7:30 – 13:30, 16:30 – 19:30", lista=["tagliatelle", "strichetti", "erbetta"]),
    "Sabato": dict(orari="7:30 – 13:30", lista=["tagliatelle", "tortellini", "anolini", "garganelli", "erbetta"]),
    "Domenica": dict(orari="8:00 – 12:00, solo ritiro ordini", lista=[]),
}
euro = lambda n: f"{n:.2f}".replace(".", ",") + " €"
slug = lambda s: s.lower().replace("ì", "i")

SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <g id="g-tagliatelle" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M14 34 q15 -13 30 0 t30 0 t30 0"/><path d="M14 50 q15 -13 30 0 t30 0 t30 0"/><path d="M14 66 q15 -13 30 0 t30 0 t30 0"/><path d="M14 82 q15 -13 30 0 t30 0 t30 0"/></g>
  <g id="g-strichetti" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M20 28 L14 36 L20 44 L14 52 L20 60 L14 68 L20 76 L14 84 L20 92 L56 66 L56 54 Z"/><path d="M100 28 L106 36 L100 44 L106 52 L100 60 L106 68 L100 76 L106 84 L100 92 L64 66 L64 54 Z"/><path d="M56 54 q4 -4 8 0 M56 66 q4 4 8 0"/><path d="M30 44 L48 56 M30 76 L48 64 M90 44 L72 56 M90 76 L72 64"/></g>
  <g id="g-tortellini" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M36 82 C16 62 28 24 60 22 C92 24 104 62 84 82"/><path d="M47 76 C36 62 44 42 60 42 C76 42 84 62 73 76"/><path d="M36 82 Q56 98 73 76"/><path d="M84 82 Q64 98 47 76"/><path d="M27 52 C38 34 82 34 93 52"/></g>
  <g id="g-garganelli" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><g transform="rotate(-28 60 60)"><path d="M24 44 L84 44 L96 76 L36 76 Z"/><path d="M34 46 L44 74 M44 46 L54 74 M54 46 L64 74 M64 46 L74 74 M74 46 L84 74"/></g></g>
  <g id="g-anolini" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="60" cy="60" r="30"/><circle cx="60" cy="60" r="38" stroke-dasharray="3 6"/><circle cx="60" cy="60" r="13"/></g>
  <g id="g-erbetta" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><rect x="24" y="24" width="72" height="72" rx="3"/><rect x="31" y="31" width="58" height="58" stroke-dasharray="4 5"/><rect x="44" y="44" width="32" height="32" rx="14"/></g>
  <g id="g-maltagliati" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"><path d="M18 34 L52 22 L60 52 L24 58 Z"/><path d="M66 30 L102 40 L88 66 Z"/><path d="M30 70 L70 64 L80 96 L40 98 Z"/></g>
  <g id="g-passatelli" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="18" y="30" width="58" height="12" rx="6" transform="rotate(-8 47 36)"/><rect x="44" y="50" width="60" height="12" rx="6" transform="rotate(6 74 56)"/><rect x="16" y="70" width="54" height="12" rx="6" transform="rotate(4 43 76)"/><rect x="60" y="86" width="44" height="12" rx="6" transform="rotate(-10 82 92)"/></g>
</defs></svg>"""
glifo = lambda fid: f'<svg viewBox="0 0 120 120" aria-hidden="true"><use href="#g-{fid}"/></svg>'

NEGOZIO = {
    "@context": "https://schema.org", "@type": "Store",
    "name": "Pastificio Carta Blu",
    "description": "Pasta fresca all’uovo e ripiena fatta a mano ogni mattina a Parma, venduta al banco a peso.",
    "url": BASE, "image": [BASE + "assets/anteprima.jpg"], "telephone": "+39 0521 000 000", "priceRange": "€€",
    "address": {"@type": "PostalAddress", "streetAddress": "Borgo Riccio 14", "addressLocality": "Parma",
                "postalCode": "43121", "addressRegion": "PR", "addressCountry": "IT"},
    "geo": {"@type": "GeoCoordinates", "latitude": 44.8015, "longitude": 10.3279},
    "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "07:30", "closes": "13:30"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "16:30", "closes": "19:30"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "07:30", "closes": "13:30"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "08:00", "closes": "12:00"},
    ],
}
json_ld = lambda d: f'<script type="application/ld+json">\n{json.dumps(d, ensure_ascii=False, indent=1)}\n</script>'
FAVICON = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27%3E%3Crect width=%2732%27 height=%2732%27 fill=%27%232F4C93%27/%3E%3Ccircle cx=%2716%27 cy=%2716%27 r=%279%27 fill=%27none%27 stroke=%27%23F3D27C%27 stroke-width=%273%27/%3E%3C/svg%3E"
NAV = [("formati.html", "Formati"), ("banco.html", "Al banco"), ("bottega.html", "La bottega")]


def voce_listino(fid):
    f = FORMATI[fid]
    return f'<li><span><a class="piatto" href="formati.html#{fid}">{e(f["nome"])}</a><span class="nota">{e(f["nota"])}</span></span><span class="prezzo">{euro(f["prezzo"])}/kg</span></li>'


def pannello_giorno(giorno, prefisso, compatto=False):
    b = BANCO[giorno]
    if not b["orari"]:
        corpo = '<p class="vuoto">Il lunedì il laboratorio riposa. Le tagliatelle di sabato reggono bene fino a stasera.</p>'
    elif not b["lista"]:
        corpo = '<p class="vuoto">La domenica il banco è chiuso: prepariamo solo gli ordini prenotati entro venerdì.</p><a class="rimando" href="ordina.html">Ordina per domenica</a>'
    else:
        corpo = f'<ul class="listino">{"".join(voce_listino(x) for x in b["lista"])}</ul>'
    return corpo


def righe_orari():
    return "".join(f'<tr data-giorno="{JS_GIORNO[i]}"><th scope="row">{g}</th><td>{BANCO[g]["orari"] or "Chiuso"}</td></tr>' for i, g in enumerate(GIORNI))


def pagina(file, titolo, descrizione, chiave, corpo, extra_head="", barra="tutte"):
    voci = "\n".join(f'    <a href="{h}"{CUR if h == file else ""}>{t}</a>' for h, t in NAV)
    url = BASE + ("" if file == "index.html" else file)
    azioni = (f'<a href="tel:{TEL_LINK}">Chiama {TELEFONO}</a>' if barra == "solo-chiama"
              else f'<a href="tel:{TEL_LINK}">Chiama</a><a class="primaria" href="ordina.html">Ordina per domenica</a>')
    testo = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(titolo)}</title>
<meta name="description" content="{e(descrizione)}">
<!-- demo con attività di fantasia: non indicizzare (vedi CLAUDE.md) -->
<meta name="robots" content="noindex">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#2F4C93">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pastificio Carta Blu">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{e(titolo)}">
<meta property="og:description" content="{e(descrizione)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}assets/anteprima.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{FAVICON}">
<link rel="stylesheet" href="assets/font.css">
<link rel="stylesheet" href="assets/stile.css">
{extra_head}
</head>
<body data-pagina="{chiave}">
<a class="salta" href="#contenuto">Vai al contenuto</a>
{SPRITE}

<header class="wrap testata">
  <a class="marchio" href="index.html"{CUR if file == "index.html" else ""}>Pastificio <span>Carta Blu</span></a>
  <button class="menu-apri" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav class="nav" id="nav" aria-label="Principale">
{voci}
    <a class="nav-ordina" href="ordina.html"{CUR if file == "ordina.html" else ""}>Ordina per domenica</a>
  </nav>
</header>

<main id="contenuto">
{corpo.strip()}
</main>

<footer>
  <div class="wrap">
    <div class="piede">
      <div>
        <h2>Pastificio Carta Blu</h2>
        <p>Borgo Riccio 14, 43121 Parma</p>
        <p>Telefono {TELEFONO}</p>
        <p>Partita IVA {PIVA}</p>
      </div>
      <div>
        <h2>Orari</h2>
        <p data-orari-oggi>Dal martedì al sabato dalle 7:30</p>
        <p><a href="banco.html#orari-settimana">Orari di tutta la settimana</a></p>
      </div>
      <div>
        <h2>Pagine</h2>
        <ul>
          <li><a href="formati.html">Formati</a></li>
          <li><a href="banco.html">Al banco</a></li>
          <li><a href="bottega.html">La bottega e dove siamo</a></li>
          <li><a href="ordina.html">Ordina per domenica</a></li>
          <li><a href="privacy.html">Privacy e cookie</a></li>
        </ul>
      </div>
    </div>
    <p class="nota-demo">Proposta grafica dimostrativa: attività, persone, indirizzo, recapiti e partita IVA sono di fantasia.</p>
  </div>
</footer>

<nav class="barra-azioni" aria-label="Azioni rapide">{azioni}</nav>

<script src="assets/sito.js"></script>
</body>
</html>
"""
    (OUT / file).write_text(testo)


STATO = """
  <div class="stato">
    <div class="wrap">
      <span data-stato><span class="pallino"></span><strong>Orari</strong> dal martedì al sabato</span>
      <span>Borgo Riccio 14, Parma</span>
      <span>{tel}</span>
    </div>
  </div>
""".format(tel=TELEFONO)

# pannelli del banco in home: uno per giorno, lo script mostra quello di oggi (o del prossimo giorno aperto)
pannelli_home = "\n".join(
    f'<div class="giorno-home" data-giorno="{JS_GIORNO[i]}" data-titolo="{g} al banco"{"" if g == "Sabato" else " hidden"}>{pannello_giorno(g, "h")}</div>'
    for i, g in enumerate(GIORNI) if BANCO[g]["lista"])
striscia = "".join(f'<li><a href="formati.html#{fid}">{glifo(fid)}<span>{e(f["nome"])}</span></a></li>' for fid, f in FORMATI.items())

pagina("index.html", "Pasta fresca fatta a mano a Parma | Pastificio Carta Blu",
  "Pasta fresca all’uovo e ripiena tirata a mano ogni mattina in Borgo Riccio a Parma: tortellini, anolini e tagliatelle al banco, a peso, e ordini per domenica.",
  "home", f"""
  <div class="wrap apertura">
    <div>
      <h1>La sfoglia di oggi l’abbiamo tirata alle sei.</h1>
      <p>Pasta fresca all’uovo e ripiena, fatta a mano in Borgo Riccio dal 1962. Si compra al banco, a peso, incartata nella carta blu.</p>
    </div>
    <div class="tris disegna" aria-hidden="true">
      {glifo("tortellini")}
      {glifo("tagliatelle")}
      {glifo("strichetti")}
    </div>
  </div>
{STATO}
  <section aria-labelledby="banco-oggi-titolo">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="banco-oggi-titolo">Sabato al banco</h2>
        <p>Prezzi al chilo. Le tagliatelle ci sono tutti i giorni, il resto gira con la settimana.</p>
      </div>
      <p class="vuoto" id="banco-avviso" hidden></p>
      {pannelli_home}
      <a class="rimando" href="banco.html">Il banco di tutta la settimana</a>
    </div>
  </section>

  <section class="campionario" aria-labelledby="t-striscia">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-striscia">Otto formati, nessun sacchetto di plastica</h2>
        <p>Ogni formato ha il suo giorno: lo facciamo quando la farina e il ripieno sono giusti, non per riempire il banco.</p>
      </div>
      <ul class="striscia">{striscia}</ul>
      <a class="rimando" href="formati.html">Come si cuoce ogni formato</a>
    </div>
  </section>

  <section class="ordina" aria-labelledby="t-domenica">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-domenica">Il pranzo della domenica</h2>
        <p>La domenica apriamo solo per gli ordini. Prenota entro venerdì alle 19 e ritira tra le 8 e le 12: tortellini e anolini sono già pronti da buttare.</p>
      </div>
      <a class="bottone" href="ordina.html">Ordina per domenica</a>
    </div>
  </section>
""", extra_head=json_ld(NEGOZIO))


def scheda(fid):
    f = FORMATI[fid]
    giorni = [g.lower() for g in GIORNI if fid in BANCO[g]["lista"]]
    ordina = f'<a class="rimando" href="ordina.html?formato={fid}">Ordinali per domenica</a>' if fid in ORDINABILI else ""
    return f"""<div class="scheda" id="scheda-{fid}" data-formato="{fid}" hidden tabindex="-1">
        <div><h3>{e(f["nome"])}</h3><p>{e(f["nota"])}.</p></div>
        <div>
          <dl>
            <dt>Cottura</dt><dd>{e(f["cottura"])}</dd>
            <dt>Con cosa</dt><dd>{e(f["con"])}</dd>
            <dt>Al banco</dt><dd>{", ".join(giorni) if giorni else "solo su ordinazione"}</dd>
            <dt>Prezzo</dt><dd>{euro(f["prezzo"])} al kg</dd>
          </dl>
          {ordina}
        </div>
      </div>"""


griglia = "\n".join(f"""<li class="formato" id="{fid}"><button type="button" aria-expanded="false" aria-controls="scheda-{fid}" data-id="{fid}">
          {glifo(fid)}
          <span class="nome">{e(f["nome"])}</span>
          <span class="regione">{e(f["regione"])}</span>
        </button></li>""" for fid, f in FORMATI.items())

pagina("formati.html", "Formati di pasta fresca emiliana | Pastificio Carta Blu",
  "Gli otto formati del Pastificio Carta Blu a Parma, dai tortellini ai passatelli: come cuocerli, con cosa condirli, quando trovarli al banco e quanto costano.",
  "formati", f"""
  <div class="wrap testa-pagina">
    <h1>Formati</h1>
    <p>Otto formati della tradizione emiliana. Tocca un formato per sapere come cuocerlo, con cosa condirlo e in che giorno lo trovi.</p>
  </div>

  <section class="campionario" aria-label="Campionario dei formati">
    <div class="wrap">
      <ul class="formati">
        {griglia}
      </ul>
      {"".join(scheda(fid) for fid in FORMATI)}
    </div>
  </section>

  <section aria-labelledby="t-conserva">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-conserva">Come si conserva</h2>
        <p>La pasta fresca non ha conservanti: trattala come il pane buono.</p>
      </div>
      <dl class="conserva">
        <div><dt>In frigo</dt><dd>Fino a due giorni, nella sua carta blu. Le tagliatelle si asciugano un po’ e cuociono meglio.</dd></div>
        <div><dt>In freezer</dt><dd>Crudi, stesi su un vassoio infarinato, poi in un sacchetto. Si buttano nell’acqua senza scongelarli.</dd></div>
        <div><dt>I ripieni</dt><dd>Tortellini, anolini e tortelli vanno cotti entro il giorno dopo, o congelati il giorno stesso.</dd></div>
      </dl>
    </div>
  </section>
""")

schede_giorni = "".join(
    f'<button type="button" role="tab" id="tab-{slug(g)}" aria-controls="giorno-{slug(g)}" data-giorno="{JS_GIORNO[i]}" aria-selected="{"true" if g == "Sabato" else "false"}" tabindex="{0 if g == "Sabato" else -1}">{g}</button>'
    for i, g in enumerate(GIORNI))
pannelli = "\n".join(
    f'<div role="tabpanel" id="giorno-{slug(g)}" aria-labelledby="tab-{slug(g)}" data-giorno="{JS_GIORNO[i]}" tabindex="0"{"" if g == "Sabato" else " hidden"}>{pannello_giorno(g, "b")}</div>'
    for i, g in enumerate(GIORNI))

pagina("banco.html", "Banco del giorno e prezzi al chilo | Pastificio Carta Blu",
  "Cosa trovi al banco del Pastificio Carta Blu a Parma giorno per giorno, dalle tagliatelle quotidiane ai tortellini del giovedì, con prezzi al chilo e orari.",
  "banco", f"""
  <div class="wrap testa-pagina">
    <h1>Al banco</h1>
    <p>Le tagliatelle ci sono tutti i giorni. Il resto gira con la settimana: i tortellini il giovedì e il sabato.</p>
  </div>
{STATO}
  <section aria-label="Banco giorno per giorno">
    <div class="wrap">
      <div class="giorni" role="tablist" aria-label="Giorno della settimana">{schede_giorni}</div>
      {pannelli}
    </div>
  </section>

  <section class="campionario" aria-labelledby="orari-settimana">
    <div class="wrap due-colonne">
      <div>
        <h2 class="sottotitolo" id="orari-settimana">Orari</h2>
        <table class="orari orari-chiari" aria-labelledby="orari-settimana"><tbody>{righe_orari()}</tbody></table>
      </div>
      <div>
        <h2 class="sottotitolo">Buono a sapersi</h2>
        <ul class="buono buono-chiaro">
          <li>Si paga anche con carta e bancomat, pure per un etto di tagliatelle.</li>
          <li>Se porti il tuo contenitore, la pasta va lì e la carta resta a noi.</li>
          <li>Il sabato alle 11 i tortellini spesso sono finiti: chiama prima, li mettiamo da parte.</li>
        </ul>
      </div>
    </div>
  </section>
""")

pagina("bottega.html", "La bottega e dove siamo, Parma | Pastificio Carta Blu",
  "La storia del Pastificio Carta Blu dal 1962, la giornata del laboratorio dalle 5:30 alla chiusura e come arrivare in Borgo Riccio 14, in centro a Parma.",
  "bottega", f"""
  <div class="wrap testa-pagina">
    <h1>La bottega</h1>
    <p>Dal 1962 in Borgo Riccio, con la stessa spianatoia di faggio.</p>
  </div>

  <section aria-label="La storia">
    <div class="wrap storia">
      <p class="citazione">“La sfoglia si capisce con le mani: quando la vedi in controluce, è pronta.”</p>
      <div class="testo">
        <p>Ada Riva ha aperto il banco nel 1962, con un mattarello lungo un metro e mezzo e una spianatoia di faggio comprata da un falegname di Langhirano. È la stessa su cui oggi chiudiamo i tortellini.</p>
        <p>Adesso la sfoglia la tira sua nipote Marta, con altre tre sfogline. Niente macchine per stendere: solo mattarello, uova di un allevamento di Collecchio e farina macinata a pietra.</p>
        <p>La carta blu è quella di sempre. Si usava perché non lascia odori e tiene la pasta asciutta. Noi la usiamo anche perché i clienti la riconoscono dall’altra parte della strada.</p>
      </div>
    </div>
  </section>

  <section class="campionario" aria-labelledby="t-giornata">
    <div class="wrap">
      <div class="titolo-sezione">
        <h2 id="t-giornata">La giornata del laboratorio</h2>
        <p>Dal martedì al sabato, sempre con lo stesso ordine. Il lunedì si riposa e si lava tutto.</p>
      </div>
      <ol class="giornata">
        <li data-ore="5.5"><time>5:30</time><div><h3>L’impasto</h3><p>Un uovo ogni cento grammi di farina, a mano sulla spianatoia. Poi riposa coperto per mezz’ora.</p></div></li>
        <li data-ore="6"><time>6:00</time><div><h3>La sfoglia</h3><p>Si tira al mattarello finché si vede la venatura del legno attraverso la pasta.</p></div></li>
        <li data-ore="6.75"><time>6:45</time><div><h3>I ripieni</h3><p>Tortellini, anolini e tortelli si chiudono uno a uno. Un chilo di tortellini sono circa mille pieghe.</p></div></li>
        <li data-ore="7.5"><time>7:30</time><div><h3>Apre il banco</h3><p>La pasta del mattino è pronta e si comincia a incartare.</p></div></li>
        <li data-ore="11"><time>11:00</time><div><h3>La seconda sfoglia</h3><p>Le tagliatelle per il pomeriggio, così la sera sono fresche come al mattino.</p></div></li>
        <li data-ore="19.5"><time>19:30</time><div><h3>Si chiude</h3><p>La spianatoia si pulisce solo con il raschietto e un panno asciutto. Mai acqua sul faggio.</p></div></li>
      </ol>
    </div>
  </section>

  <section id="dove" aria-labelledby="t-dove">
    <div class="wrap dove-griglia">
      <div>
        <h2 class="indirizzo" id="t-dove">Borgo Riccio 14,<br>Parma</h2>
        <p>A due passi da piazza Garibaldi. Si parcheggia in viale Toschi, poi sono tre minuti a piedi.</p>
        <p>Telefono {TELEFONO}</p>
      </div>
      <table class="orari" aria-label="Orari di apertura"><tbody>{righe_orari()}</tbody></table>
    </div>
  </section>
""", extra_head=json_ld(NEGOZIO))

opzioni = "".join(f'<option value="{fid}" data-prezzo="{FORMATI[fid]["prezzo"]}">{e(FORMATI[fid]["nome"])}, {euro(FORMATI[fid]["prezzo"])}/kg</option>' for fid in ORDINABILI)
pagina("ordina.html", "Ordina la pasta per domenica | Pastificio Carta Blu, Parma",
  "Prenota tortellini, anolini e tagliatelle del Pastificio Carta Blu per la domenica: ordini entro venerdì alle 19, ritiro in Borgo Riccio tra le 8 e le 12.",
  "ordina", f"""
  <div class="wrap testa-pagina">
    <h1>Ordina per domenica</h1>
    <p>Prenota entro venerdì alle 19, ritira domenica tra le 8 e le 12.</p>
  </div>

  <section class="ordina" aria-label="Modulo di prenotazione">
    <div class="wrap due-colonne">
      <form id="modulo" novalidate>
        <div class="campo">
          <label for="f-nome">Nome</label>
          <input id="f-nome" name="nome" autocomplete="name" required>
        </div>
        <div class="campo">
          <label for="f-tel">Telefono</label>
          <input id="f-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required>
        </div>
        <div class="campo">
          <label for="f-formato">Formato</label>
          <select id="f-formato" name="formato">{opzioni}</select>
        </div>
        <div class="campo">
          <label for="f-peso">Quantità</label>
          <select id="f-peso" name="peso">
            <option value="0.5">500 g, per 4 persone</option>
            <option value="1" selected>1 kg, per 8 persone</option>
            <option value="1.5">1,5 kg, per 12 persone</option>
            <option value="2">2 kg, per 16 persone</option>
          </select>
        </div>
        <div class="campo largo">
          <label for="f-note">Note</label>
          <input id="f-note" name="note" placeholder="Per esempio: metà tortellini e metà anolini">
        </div>
        <p class="aiuto campo largo" id="stima" aria-live="polite">Totale indicativo: 48,00 €. Si paga al ritiro.</p>
        <button class="bottone" type="submit">Prenota il ritiro</button>
        <p class="aiuto campo largo">Usiamo nome e telefono solo per preparare questo ordine e, se serve, chiamarti. Leggi l’<a href="privacy.html">informativa privacy</a>.</p>
        <p class="conferma" id="conferma" hidden aria-live="polite"></p>
      </form>

      <div>
        <h2 class="sottotitolo">Come funziona</h2>
        <ol class="passi-ordine">
          <li><div><h3>Prenoti entro venerdì alle 19</h3><p>Da qui o al telefono. Il sabato ci serve per tirare la sfoglia della domenica.</p></div></li>
          <li><div><h3>Ti chiamiamo solo se serve</h3><p>Se un formato finisce o manca qualcosa, ti telefoniamo il sabato mattina.</p></div></li>
          <li><div><h3>Ritiri domenica tra le 8 e le 12</h3><p>Paghi al banco. La pasta è incartata e pronta: non serve fare la fila.</p></div></li>
        </ol>
      </div>
    </div>
  </section>
""", barra="solo-chiama")

pagina("privacy.html", "Informativa privacy e cookie | Pastificio Carta Blu, Parma",
  "Come il Pastificio Carta Blu tratta nome e telefono lasciati negli ordini per la domenica, per quanto li conserva, quali diritti hai e quali cookie usa il sito.",
  "privacy", f"""
  <div class="wrap testa-pagina">
    <h1>Privacy e cookie</h1>
    <p>Chi tratta i tuoi dati, quali, perché e per quanto tempo. Testo di esempio per la demo, da far verificare prima della messa online.</p>
  </div>

  <section class="campionario" aria-label="Informativa">
    <div class="wrap testo-legale">
      <h2>Titolare del trattamento</h2>
      <p>Pastificio Carta Blu, Borgo Riccio 14, 43121 Parma, partita IVA {PIVA}, telefono {TELEFONO}.</p>
      <h2>Quali dati raccogliamo</h2>
      <p>Solo quelli che scrivi nel modulo “Ordina per domenica”: nome, telefono, formato, quantità ed eventuali note. Non chiediamo email, indirizzo o dati di pagamento: si paga al banco.</p>
      <h2>Perché e su quale base</h2>
      <p>Per preparare l’ordine e, se manca qualcosa, chiamarti. La base giuridica è l’esecuzione di misure richieste da te prima di un acquisto (art. 6, par. 1, lettera b del Regolamento UE 2016/679). Non usiamo i dati per pubblicità e non li cediamo a nessuno.</p>
      <h2>Per quanto tempo</h2>
      <p>Fino al ritiro dell’ordine e per i 30 giorni successivi, poi li cancelliamo.</p>
      <h2>I tuoi diritti</h2>
      <p>Puoi chiedere di vedere, correggere o cancellare i tuoi dati, o opporti al trattamento (articoli 15–22 del Regolamento), chiamando il numero qui sopra o passando al banco. Se pensi che i tuoi dati siano trattati male puoi rivolgerti al Garante per la protezione dei dati personali.</p>
      <h2>Cookie</h2>
      <p>Il sito non usa cookie di profilazione né statistiche di terze parti, quindi non serve il banner per il consenso. I caratteri tipografici sono serviti dal sito stesso, senza collegamenti a Google. Il servizio che ospita il sito registra, come ogni server, dati tecnici di accesso (indirizzo IP, data e ora) per ragioni di sicurezza.</p>
    </div>
  </section>
""")
print("ok")
