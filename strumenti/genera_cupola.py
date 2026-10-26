"""Genera le pagine statiche della Pizzeria La Cupola.

Uso: python3 strumenti/genera_cupola.py
Il menu, la testata, il piede e i meta SEO stanno qui: modificare questo file
e rigenerare, invece di toccare a mano gli HTML in samples/la-cupola/.
"""
import html
import json
import pathlib
import urllib.parse

import comune

OUT = pathlib.Path(__file__).resolve().parent.parent / "samples" / "la-cupola"
BASE = "https://aleflu.github.io/proposte-siti/la-cupola/"
TELEFONO = "011 000 0000"
TEL_LINK = "+390110000000"
PIVA = "00000000000"
EMAIL = "ciao@lacupola.example"
# indicazioni a un tocco: apre Google Maps (app o sito) sull'indirizzo
MAPPA = "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote_plus("Via Belfiore 31, 10125 Torino")
CUR = ' aria-current="page"'

# ---------- allergeni (Regolamento UE 1169/2011, allegato II) ----------
ALLERGENI = {
    1: "Cereali con glutine", 2: "Crostacei", 3: "Uova", 4: "Pesce", 5: "Arachidi",
    6: "Soia", 7: "Latte", 8: "Frutta a guscio", 9: "Sedano", 10: "Senape",
    11: "Sesamo", 12: "Solfiti", 13: "Lupini", 14: "Molluschi",
}

# ---------- menu ----------
# segni: "veg" vegetariana, "picc" piccante
MENU = [
    {"id": "rosse", "titolo": "Le rosse", "indice": "Rosse",
     "sotto": "Con pomodoro San Marzano DOP schiacciato a mano, mai cotto prima del forno.",
     "piatti": [
        {"nome": "Marinara", "ingr": "pomodoro San Marzano DOP, aglio, origano di Sicilia, olio extravergine", "prezzo": 7, "all": [1], "segni": ["veg"]},
        {"nome": "Margherita", "ingr": "pomodoro San Marzano DOP, fiordilatte di Agerola, basilico, olio extravergine", "prezzo": 8.5, "all": [1, 7], "segni": ["veg"],
         "consiglio": "Chiedila con un filo d’olio a crudo e il basilico aggiunto all’uscita."},
        {"nome": "Margherita con bufala", "ingr": "pomodoro San Marzano DOP, mozzarella di bufala campana DOP a crudo, basilico", "prezzo": 11, "all": [1, 7], "segni": ["veg"]},
        {"nome": "Cosacca", "ingr": "pomodoro San Marzano DOP, pecorino romano, basilico, olio extravergine", "prezzo": 8, "all": [1, 7], "segni": ["veg"],
         "consiglio": "Dopo la marinara è la pizza più antica di Napoli. Pochi la conoscono, nessuno se ne pente."},
        {"nome": "Diavola", "ingr": "pomodoro, fiordilatte, salame piccante calabrese, olio al peperoncino", "prezzo": 10, "all": [1, 7], "segni": ["picc"]},
        {"nome": "Ripieno al forno", "ingr": "ricotta di bufala, salame napoletano, fiordilatte, pepe nero, pomodoro sopra", "prezzo": 11.5, "all": [1, 7], "segni": []},
     ]},
    {"id": "bianche", "titolo": "Le bianche", "indice": "Bianche",
     "sotto": "Senza pomodoro: il fiordilatte e la provola fanno da base.",
     "piatti": [
        {"nome": "Salsiccia e friarielli", "ingr": "provola affumicata, salsiccia di maiale, friarielli ripassati in padella, peperoncino", "prezzo": 11, "all": [1, 7], "segni": []},
        {"nome": "Patate e provola", "ingr": "provola affumicata, patate al forno, rosmarino, pepe nero", "prezzo": 10, "all": [1, 7], "segni": ["veg"]},
        {"nome": "Ricotta e pepe", "ingr": "fiordilatte, ricotta di bufala, pepe nero, basilico, scorza di limone", "prezzo": 9.5, "all": [1, 7], "segni": ["veg"]},
     ]},
    {"id": "fuori-menu", "titolo": "Fuori menu di stagione", "indice": "Fuori menu", "evidenza": True,
     "sotto": "Cambiano con le stagioni: quello che arriva dal mercato di Porta Palazzo.",
     "piatti": [
        {"nome": "Zucca e salsiccia di Bra", "ingr": "crema di zucca, salsiccia di Bra, provola affumicata, salvia", "prezzo": 12.5, "all": [1, 7], "segni": []},
        {"nome": "Porcini e Castelmagno", "ingr": "porcini trifolati, fonduta di Castelmagno DOP, timo", "prezzo": 14, "all": [1, 7], "segni": ["veg"],
         "consiglio": "Con un calice di Aglianico è la cena che consigliamo di più."},
        {"nome": "Scarola", "ingr": "scarola ripassata, olive di Gaeta, capperi, acciughe del Cantabrico, senza latticini", "prezzo": 12, "all": [1, 4], "segni": []},
     ]},
    {"id": "fritti", "titolo": "Fritti", "indice": "Fritti",
     "sotto": "Fritti al momento, in olio di arachide alto oleico.",
     "piatti": [
        {"nome": "Frittatina di pasta", "ingr": "bucatini, besciamella, piselli e provola, impanata e fritta", "prezzo": 4.5, "all": [1, 3, 5, 7], "segni": []},
        {"nome": "Crocchè", "ingr": "patate, pecorino, prezzemolo, cuore di fiordilatte", "prezzo": 3, "all": [1, 3, 5, 7], "segni": ["veg"]},
        {"nome": "Montanarina", "ingr": "pizza fritta piccola con pomodoro, Parmigiano e basilico", "prezzo": 4, "all": [1, 5, 7], "segni": ["veg"]},
        {"nome": "Montanarina piccante", "ingr": "pizza fritta piccola con pomodoro, peperoncino di Calabria e pecorino", "prezzo": 4.5, "all": [1, 5, 7], "segni": ["veg", "picc"]},
     ]},
    {"id": "dolci", "titolo": "Dolci", "indice": "Dolci",
     "sotto": "Li fa la pasticceria di Ciro, due porte più in là.",
     "piatti": [
        {"nome": "Graffa calda", "ingr": "ciambella di patate fritta, passata nello zucchero", "prezzo": 4, "all": [1, 3, 5, 7], "segni": ["veg"]},
        {"nome": "Babà al rum", "ingr": "babà bagnato al rum, panna montata", "prezzo": 5, "all": [1, 3, 7], "segni": ["veg"]},
     ]},
    {"id": "da-bere", "titolo": "Da bere", "indice": "Da bere",
     "sotto": "",
     "piatti": [
        {"nome": "Birra artigianale di Cuneo", "ingr": "bionda non filtrata, bottiglia da 33 cl", "prezzo": 5.5, "all": [1], "segni": []},
        {"nome": "Falanghina del Sannio", "ingr": "bianco campano, al calice", "prezzo": 5, "all": [12], "segni": []},
        {"nome": "Aglianico del Taburno", "ingr": "rosso campano, al calice", "prezzo": 5.5, "all": [12], "segni": []},
        {"nome": "Acqua minerale", "ingr": "naturale o frizzante, 75 cl", "prezzo": 2.5, "all": [], "segni": []},
     ]},
]
VARIANTI = [
    ("Impasto integrale al 30%", "+ 1,50"),
    ("Bufala al posto del fiordilatte", "+ 2,50"),
    ("Un ingrediente in più", "da + 1,00"),
    ("Margherita piccola, per bambini", "5,00"),
]
SEGNI = {"veg": "vegetariana", "picc": "piccante"}
# orari scritti nell'HTML (Google e senza JavaScript); cupola.js evidenzia solo il giorno di oggi
ORARI_SETTIMANA = [(1, "Lunedì", "Chiuso"), (2, "Martedì", "19:00 – 23:30"), (3, "Mercoledì", "19:00 – 23:30"),
                   (4, "Giovedì", "19:00 – 23:30"), (5, "Venerdì", "19:00 – 23:30"),
                   (6, "Sabato", "12:30 – 14:30, 19:00 – 23:30"), (0, "Domenica", "12:30 – 14:30, 19:00 – 23:30")]
righe_orari = "\n".join(f'          <tr data-giorno="{g}"><th scope="row">{n}</th><td>{o}</td></tr>' for g, n, o in ORARI_SETTIMANA)
# chiusure e orari speciali (regole in comune.py): avviso in cima alle pagine, stato «aperto ora», giorni
# prenotabili, tabella in Dove siamo e dati per Google. Vanno messe anche su Google Business Profile.
CHIUSURE = comune.prossime_chiusure([
    {"dal": "2026-11-03", "al": "2026-11-03", "motivo": "la manutenzione del forno"},
    {"dal": "2026-12-24", "al": "2026-12-25", "motivo": "Natale"},
])

prezzo = lambda p: f"{p:.2f}".replace(".", ",")
e = html.escape

# ---------- dati strutturati ----------
RISTORANTE = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "La Cupola",
    "description": "Pizzeria napoletana in San Salvario: impasto a lunga lievitazione e forno a legna a 450 gradi.",
    "url": BASE,
    "image": [BASE + "assets/anteprima.jpg"],
    "telephone": "+39 011 000 0000",
    "email": EMAIL,
    "priceRange": "€€",
    "servesCuisine": ["Pizza napoletana", "Cucina campana"],
    "menu": BASE + "pizze.html",
    "acceptsReservations": BASE + "prenota.html",
    "address": {"@type": "PostalAddress", "streetAddress": "Via Belfiore 31", "addressLocality": "Torino",
                "postalCode": "10125", "addressRegion": "TO", "addressCountry": "IT"},
    "geo": {"@type": "GeoCoordinates", "latitude": 45.0566, "longitude": 7.6812},
    "openingHoursSpecification": [
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "19:00", "closes": "23:30"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday", "Sunday"], "opens": "12:30", "closes": "14:30"},
        {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday", "Sunday"], "opens": "19:00", "closes": "23:30"},
        *comune.orari_ld(CHIUSURE),
    ],
}
MENU_LD = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "Menu della Cupola",
    "url": BASE + "pizze.html",
    "inLanguage": "it",
    "hasMenuSection": [
        {"@type": "MenuSection", "name": s["titolo"], "hasMenuItem": [
            {"@type": "MenuItem", "name": p["nome"], "description": p["ingr"],
             "offers": {"@type": "Offer", "price": f"{p['prezzo']:.2f}", "priceCurrency": "EUR"},
             **({"suitableForDiet": "https://schema.org/VegetarianDiet"} if "veg" in p["segni"] else {})}
            for p in s["piatti"]]}
        for s in MENU],
}
json_ld = lambda dati: f'<script type="application/ld+json">\n{json.dumps(dati, ensure_ascii=False, indent=1)}\n</script>'

# ---------- pezzi di pagina ----------
ICONA_SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0F2B2A"/>'
             '<path d="M5 25 A11 17 0 0 1 27 25 Z" fill="#D9A62E"/><path d="M12.5 25 V21 a3.5 3.5 0 0 1 7 0 V25 Z" fill="#0F2B2A"/></svg>')
MARCHIO = ('<svg viewBox="0 0 40 34" aria-hidden="true"><path d="M3 30 A17 26 0 0 1 37 30 Z" fill="currentColor"/>'
           '<path d="M14.5 30 V24.5 a5.5 5.5 0 0 1 11 0 V30 Z" fill="#0F2B2A"/><rect x="1" y="30.5" width="38" height="3" fill="currentColor"/></svg>')
NAV = [("pizze.html", "Menu"), ("impasto.html", "L’impasto"), ("dove.html", "Dove siamo")]


def segni_html(segni):
    return "".join(f'<span class="segno {s}" title="{SEGNI[s]}"><span class="vh">{SEGNI[s]}</span></span>' for s in segni)


def piatto_html(p, sezione):
    pid = f"{sezione}-{p['nome'].lower().replace(' ', '-').replace('’', '')}"
    allergeni = ""
    if p["all"]:
        numeri = ", ".join(str(n) for n in p["all"])
        nomi = ", ".join(ALLERGENI[n].lower() for n in p["all"])
        allergeni = (f'<button class="allergeni" type="button" aria-expanded="false" aria-controls="al-{pid}">Allergeni {numeri}</button>'
                     f'<p class="allergeni-nomi" id="al-{pid}">Contiene: {nomi}.</p>')
    consiglio = f'<p class="consiglio">{e(p["consiglio"])}</p>' if p.get("consiglio") else ""
    return f"""<li class="piatto">
            <div class="riga"><h3>{e(p["nome"])}{segni_html(p["segni"])}</h3><p class="prezzo">{prezzo(p["prezzo"])}</p></div>
            <p class="ingr">{e(p["ingr"])}</p>
            {consiglio}{allergeni}
          </li>"""


def sezione_html(s):
    piatti = "\n          ".join(piatto_html(p, s["id"]) for p in s["piatti"])
    sotto = f'<p class="sotto">{e(s["sotto"])}</p>' if s["sotto"] else ""
    classe = "sezione-menu in-evidenza" if s.get("evidenza") else "sezione-menu"
    return f"""<section class="{classe}" id="{s["id"]}" aria-labelledby="t-{s["id"]}">
        <h2 id="t-{s["id"]}">{e(s["titolo"])}</h2>
        {sotto}
        <div class="fila-tessere" aria-hidden="true"></div>
        <ul class="piatti">
          {piatti}
        </ul>
      </section>"""


def pagina(file, titolo, descrizione, chiave, corpo, extra_head="", barra="tutte"):
    voci = "\n".join(f'      <a href="{h}"{CUR if h == file else ""}>{t}</a>' for h, t in NAV)
    url = BASE + ("" if file == "index.html" else file)
    if barra == "solo-chiama":
        azioni = f'<a href="tel:{TEL_LINK}">Chiama {TELEFONO}</a>'
    elif barra == "indicazioni":
        azioni = f'<a href="tel:{TEL_LINK}">Chiama</a><a class="primaria" href="{e(MAPPA)}">Indicazioni</a>'
    else:
        azioni = f'<a href="tel:{TEL_LINK}">Chiama</a><a class="primaria" href="prenota.html">Prenota un tavolo</a>'
    pagina_html = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(titolo)}</title>
<meta name="description" content="{e(descrizione)}">
<!-- demo con attività di fantasia: non indicizzare (vedi CLAUDE.md) -->
<meta name="robots" content="noindex">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0F2B2A">
<meta property="og:type" content="website">
<meta property="og:site_name" content="La Cupola">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{e(titolo)}">
<meta property="og:description" content="{e(descrizione)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}assets/anteprima.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
{comune.testa_icone()}
<link rel="stylesheet" href="{comune.con_versione(OUT, "assets/font.css")}">
<link rel="stylesheet" href="{comune.con_versione(OUT, "assets/stile.css")}">
{comune.dati_chiusure(CHIUSURE)}
{extra_head}
</head>
<body data-pagina="{chiave}">
<a class="salta" href="#contenuto">Vai al contenuto</a>

<div class="testata-fondo">
  <header class="wrap testata">
    <a class="marchio" href="index.html"{CUR if file == "index.html" else ""}>{MARCHIO}<span><b>La Cupola</b><small>Pizzeria napoletana</small></span></a>
    <button class="menu-apri" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Principale">
{voci}
      <a class="nav-prenota" href="prenota.html"{CUR if file == "prenota.html" else ""}>Prenota</a>
    </nav>
  </header>
</div>

<main id="contenuto">
{comune.avvisi_chiusure(CHIUSURE)}
{corpo.strip()}
</main>

<footer>
  <div class="wrap">
    <div class="piede">
      <div>
        <h2>La Cupola</h2>
        <p>Pizzeria napoletana</p>
        <p>Via Belfiore 31, 10125 Torino</p>
        <p>Telefono {TELEFONO}</p>
        <p><a href="mailto:{EMAIL}">{EMAIL}</a></p>
        <p>Partita IVA {PIVA}</p>
      </div>
      <div>
        <h2>Orari</h2>
        <p data-orari-oggi>Dal martedì alla domenica, dalle 19</p>
        <p><a href="dove.html">Orari di tutta la settimana</a></p>
      </div>
      <div>
        <h2>Pagine</h2>
        <ul>
          <li><a href="pizze.html">Menu e prezzi</a></li>
          <li><a href="impasto.html">L’impasto</a></li>
          <li><a href="prenota.html">Prenota un tavolo</a></li>
          <li><a href="dove.html">Dove siamo</a></li>
          <li><a href="privacy.html">Privacy e cookie</a></li>
        </ul>
      </div>
    </div>
    <p class="nota-demo">Proposta grafica dimostrativa: pizzeria, indirizzo, recapiti e partita IVA sono di fantasia.</p>
  </div>
</footer>

<nav class="barra-azioni" aria-label="Azioni rapide">{azioni}</nav>

<script src="{comune.con_versione(OUT, "assets/cupola.js")}"></script>
</body>
</html>
"""
    (OUT / file).write_text(pagina_html)


fuori = next(s for s in MENU if s["id"] == "fuori-menu")

pagina("index.html", "Pizzeria napoletana a Torino, San Salvario | La Cupola",
  "Pizza napoletana in San Salvario, Torino: impasto lievitato oltre 30 ore e forno a legna a 450 gradi. Guarda il menu e prenota un tavolo per stasera.",
  "home", f"""
  <div class="scuro">
    <div class="wrap apertura">
      <div>
        <h1 id="titolo-impasto">L’impasto di stasera lievita da più di trenta ore.</h1>
        <p class="pronto" id="pronto"></p>
        <p class="intro">Pizza napoletana in San Salvario. Forno a legna costruito a Napoli, 450 gradi, sessanta secondi di cottura.</p>
        <div class="azioni">
          <a class="bottone" href="prenota.html">Prenota un tavolo</a>
          <a class="link-forte" href="pizze.html">Menu e prezzi</a>
        </div>
      </div>
      <div class="forno-tela"><canvas id="mosaico" aria-hidden="true"></canvas></div>
    </div>
  </div>

  <div class="stasera chiaro">
    <div class="wrap">
      <p data-apertura><span class="pallino"></span><strong>Dal martedì alla domenica, dalle 19</strong></p>
      <div class="prenota-veloce">
        <p id="quando-prenoti">Prenota per stasera</p>
        <ul class="orari-brevi" id="orari-stasera">
          <li><a href="prenota.html"><b>19:30</b><span>primo turno</span></a></li>
          <li><a href="prenota.html"><b>21:30</b><span>secondo turno</span></a></li>
        </ul>
      </div>
      <a class="link-forte" href="prenota.html">Altri giorni</a>
    </div>
  </div>

  <section class="chiaro" aria-labelledby="t-fuori">
    <div class="wrap">
      <div class="intestazione">
        <h2 id="t-fuori">{e(fuori["titolo"])}</h2>
        <p>Tre pizze che ci sono solo in questa stagione, con quello che arriva dal mercato di Porta Palazzo. Prezzi in euro, IVA inclusa.</p>
      </div>
      <ul class="legenda-segni" aria-label="Legenda">
        <li><span class="segno veg" aria-hidden="true"></span>vegetariana</li>
        <li><span class="segno picc" aria-hidden="true"></span>piccante</li>
      </ul>
      <ul class="piatti piatti-home">
        {"".join(piatto_html(p, "home") for p in fuori["piatti"])}
      </ul>
      <p class="rimando-menu"><a class="link-forte" href="pizze.html">Tutto il menu</a></p>
    </div>
  </section>

  <section class="scuro" aria-label="L’impasto in numeri">
    <div class="wrap">
      <p class="frase-tecnica">Ogni pizza è un panetto da <b>260</b> grammi, con il <b>72%</b> d’acqua, che riposa almeno <b>30</b> ore e cuoce <b>60</b> secondi a <b>450</b> gradi.</p>
      <p><a class="link-forte" href="impasto.html">Come lavoriamo l’impasto</a></p>
    </div>
  </section>
""", extra_head=json_ld(RISTORANTE))

indice = "\n".join(f'        <li><a href="#{s["id"]}">{e(s["indice"])}</a></li>' for s in MENU)
sezioni = "\n\n      ".join(sezione_html(s) for s in MENU)
varianti = "\n".join(f'            <tr><th scope="row">{e(n)}</th><td>{v}</td></tr>' for n, v in VARIANTI)
lista_allergeni = "\n".join(f'          <li><b>{n}</b>{e(nome)}</li>' for n, nome in ALLERGENI.items())

pagina("pizze.html", "Menu: pizze napoletane, fritti e prezzi | La Cupola, Torino",
  "Il menu della Cupola a Torino: pizze rosse e bianche, fuori menu di stagione, fritti napoletani, dolci e vini campani, con prezzi e allergeni.",
  "pizze", f"""
  <div class="scuro">
    <div class="wrap testa-pagina">
      <h1>Il menu</h1>
      <p>Pizze rosse e bianche, il fuori menu di stagione, fritti e dolci. Prezzi in euro, IVA e coperto inclusi.</p>
    </div>
  </div>

  <div class="wrap menu-layout chiaro">
    <nav class="indice-menu" aria-label="Sezioni del menu">
      <p class="indice-titolo">Sezioni</p>
      <ul>
{indice}
        <li><a href="#varianti">Varianti</a></li>
        <li><a href="#allergeni">Allergeni</a></li>
      </ul>
      <div class="indice-extra">
        <ul class="legenda-segni legenda-colonna" aria-label="Legenda">
          <li><span class="segno veg" aria-hidden="true"></span>vegetariana</li>
          <li><span class="segno picc" aria-hidden="true"></span>piccante</li>
        </ul>
        <p class="indice-nota">Prezzi in euro, IVA e coperto inclusi. Tocca “Allergeni” sotto un piatto per leggere cosa contiene.</p>
        <a class="bottone su-chiaro" href="prenota.html">Prenota un tavolo</a>
      </div>
    </nav>

    <div class="menu-corpo">
      <ul class="legenda-segni legenda-telefono" aria-label="Legenda">
        <li><span class="segno veg" aria-hidden="true"></span>vegetariana</li>
        <li><span class="segno picc" aria-hidden="true"></span>piccante</li>
        <li>Tocca “Allergeni” per leggere cosa contiene un piatto</li>
      </ul>

      {sezioni}

      <section class="sezione-menu" id="varianti" aria-labelledby="t-varianti">
        <h2 id="t-varianti">Varianti</h2>
        <p class="sotto">Le pizze sono pensate così, ma le cambiamo volentieri.</p>
        <div class="fila-tessere" aria-hidden="true"></div>
        <table class="varianti">
          <tbody>
{varianti}
          </tbody>
        </table>
        <ul class="note-menu">
          <li>La pizza senza glutine non riusciamo a farla bene: il forno è uno solo e la farina vola. Preferiamo dirtelo prima.</li>
          <li>Il fiordilatte arriva fresco due volte a settimana. Alcuni prodotti, come i friarielli fuori stagione, possono essere surgelati.</li>
        </ul>
      </section>

      <section class="sezione-menu" id="allergeni" aria-labelledby="t-allergeni">
        <h2 id="t-allergeni">Allergeni</h2>
        <p class="sotto">I numeri accanto ai piatti indicano gli allergeni presenti, secondo il Regolamento UE 1169/2011. In cucina usiamo farina, latte e uova ogni giorno: se hai un’allergia grave dillo a chi ti serve, ti spieghiamo cosa possiamo garantire.</p>
        <div class="fila-tessere" aria-hidden="true"></div>
        <ol class="lista-allergeni">
{lista_allergeni}
        </ol>
      </section>
    </div>
  </div>
""", extra_head=json_ld(MENU_LD))

pagina("impasto.html", "L’impasto: 30 ore di lievitazione | La Cupola, Torino",
  "Come nasce la pizza della Cupola: impasto con un grammo di lievito per chilo, oltre 30 ore di riposo, panetti da 260 grammi e forno a legna a 450 gradi.",
  "impasto", """
  <div class="scuro">
    <div class="wrap testa-pagina">
      <div>
        <h1>L’impasto</h1>
        <div class="fase-ora" aria-live="polite">
          <span class="numero" id="fase-numero">30 ore</span>
          <p id="fase-testo">L’impasto del prossimo servizio riposa in frigo a 4 gradi.</p>
        </div>
      </div>
      <p>Farina, acqua, sale e un grammo di lievito per chilo. Il resto lo fa il tempo: almeno trenta ore tra l’impasto e il forno.</p>
    </div>
  </div>

  <section class="chiaro" aria-labelledby="t-tempo">
    <div class="wrap">
      <div class="intestazione">
        <h2 id="t-tempo">Dall’impasto al forno</h2>
        <p>Ogni servizio usa l’impasto fatto il giorno prima alle 11. La tessera gialla segna dove si trova adesso quello del prossimo servizio.</p>
      </div>
      <ol class="tempo">
        <li data-ore="0"><time datetime="11:00">11:00<small>Il giorno prima</small></time><div><h3>Impasto</h3><p>Farina tipo 1 macinata a pietra, acqua a 18 gradi, sale marino e un grammo di lievito di birra per chilo. Si impasta piano, per venti minuti.</p></div></li>
        <li data-ore="1"><time datetime="12:00">12:00<small>Il giorno prima</small></time><div><h3>Puntata</h3><p>Un’ora nella madia di legno, coperto. È la prima lievitazione, quella che dà forza alla pasta.</p></div></li>
        <li data-ore="2"><time datetime="13:00">13:00<small>Il giorno prima</small></time><div><h3>In frigo a 4 gradi</h3><p>Il lievito lavora lentissimo e intanto la pasta diventa più leggera da digerire.</p></div></li>
        <li data-ore="22"><time datetime="09:00">9:00<small>Il giorno della pizza</small></time><div><h3>Staglio</h3><p>La massa si divide a mano in panetti da 260 grammi, che tornano in frigo nelle cassette.</p></div></li>
        <li data-ore="29"><time datetime="16:00">16:00<small>Il giorno della pizza</small></time><div><h3>Fuori dal frigo</h3><p>Tre ore a temperatura ambiente, così i panetti si stendono a mano senza strapparsi.</p></div></li>
        <li data-ore="32"><time datetime="19:00">19:00<small>Il giorno della pizza</small></time><div><h3>Al forno</h3><p>450 gradi sul piano di biscotto di Sorrento. Da 60 a 90 secondi, girando la pizza due volte.</p></div></li>
      </ol>
    </div>
  </section>

  <section class="scuro" aria-labelledby="t-forno">
    <div class="wrap">
      <div class="intestazione">
        <h2 id="t-forno">Il forno</h2>
        <p>L’ha costruito a mano un fornaio di Sant’Anastasia, vicino a Napoli: una cupola di mattoni refrattari rivestita di 14.000 tessere di mosaico.</p>
      </div>
      <dl class="ingredienti-lista">
        <div><dt>La legna</dt><dd>Faggio e quercia stagionati due anni, da un bosco delle Valli di Lanzo.</dd></div>
        <div><dt>Il piano</dt><dd>Biscotto di Sorrento: argilla cotta che tiene il calore senza bruciare il fondo.</dd></div>
        <div><dt>Il pomodoro</dt><dd>San Marzano DOP, schiacciato a mano con un pizzico di sale. Non si cuoce prima del forno.</dd></div>
        <div><dt>Il fiordilatte</dt><dd>Da Agerola, arriva due volte a settimana e si taglia al mattino perché sgoccioli.</dd></div>
      </dl>
    </div>
  </section>
""")

pagina("prenota.html", "Prenota un tavolo | La Cupola, pizzeria napoletana a Torino",
  "Prenota un tavolo alla Cupola, pizzeria napoletana in San Salvario a Torino: scegli giorno, persone e orario e vedi subito quanti posti sono liberi.",
  "prenota", f"""
  <div class="scuro">
    <div class="wrap testa-pagina">
      <h1>Prenota un tavolo</h1>
      <p>Scegli giorno, persone e orario. Per più di 8 persone chiamaci al {TELEFONO}.</p>
    </div>
  </div>

  <section class="chiaro" aria-label="Prenotazione">
    <div class="wrap prenota-griglia">
      <form id="modulo" novalidate>
        <div class="campo">
          <label for="f-giorno">Giorno</label>
          <select id="f-giorno" name="giorno">{"".join(f'<option>{n}</option>' for g, n, o in ORARI_SETTIMANA if o != "Chiuso")}</select>
        </div>
        <div class="campo">
          <label for="f-persone">Persone</label>
          <select id="f-persone" name="persone">{"".join(f'<option value="{i}"{" selected" if i == 2 else ""}>{i} {"persona" if i == 1 else "persone"}</option>' for i in range(1, 9))}</select>
        </div>
        <fieldset class="campo largo">
          <legend>Orario</legend>
          <div class="orari-scelta" id="orari">
            <!-- orari di cena senza JavaScript, e spazio già occupato: niente salto quando lo script li aggiorna -->
            <label><input type="radio" name="ora" value="19:00"><b>19:00</b><span>cena</span></label><label><input type="radio" name="ora" value="19:30"><b>19:30</b><span>cena</span></label><label><input type="radio" name="ora" value="20:00"><b>20:00</b><span>cena</span></label><label><input type="radio" name="ora" value="20:30"><b>20:30</b><span>cena</span></label><label><input type="radio" name="ora" value="21:00"><b>21:00</b><span>cena</span></label><label><input type="radio" name="ora" value="21:30"><b>21:30</b><span>cena</span></label>
          </div>
          <p class="aiuto">Sotto ogni orario ci sono i posti ancora liberi.</p>
        </fieldset>
        <div class="campo">
          <label for="f-nome">Nome</label>
          <input id="f-nome" name="nome" autocomplete="name" required>
        </div>
        <div class="campo">
          <label for="f-tel">Telefono</label>
          <input id="f-tel" name="tel" type="tel" inputmode="tel" autocomplete="tel" required>
        </div>
        <div class="campo largo">
          <label for="f-note">Note (facoltativo)</label>
          <textarea id="f-note" name="note" placeholder="Allergie, seggiolone, un compleanno"></textarea>
        </div>
        <button class="bottone" type="submit">Invia la richiesta</button>
        <p class="aiuto campo largo">Usiamo nome e telefono solo per gestire questa prenotazione. Leggi l’<a href="privacy.html">informativa privacy</a>.</p>
        <p class="esito" id="esito" role="status"></p>
      </form>

      <aside aria-labelledby="t-buono">
        <h2 id="t-buono">Buono a sapersi</h2>
        <ul class="buono">
          <li><div><h3>Il tavolo resta tuo per 15 minuti</h3><p>Se fai tardi, chiamaci: lo teniamo volentieri, basta saperlo.</p></div></li>
          <li><div><h3>Con i bambini</h3><p>Seggiolone, matite colorate e la margherita piccola a 5 €.</p></div></li>
          <li><div><h3>Gruppi oltre le 8 persone</h3><p>Al telefono: uniamo i tavoli e prepariamo i fritti da dividere.</p></div></li>
          <li><div><h3>Il lunedì siamo chiusi</h3><p>Il forno riposa e si fa l’impasto per martedì.</p></div></li>
        </ul>
      </aside>
    </div>
  </section>
""", barra="solo-chiama")

tabella_chiusure = f"""<table class="orari chiusure" data-orizzonte="{comune.ORIZZONTE}">
          <caption>Prossime chiusure</caption>
          <tbody>
{comune.righe_chiusure(CHIUSURE)}
          </tbody>
        </table>""" if CHIUSURE else ""

pagina("dove.html", "Dove siamo e orari | La Cupola, pizzeria napoletana a Torino",
  "La Cupola è in via Belfiore 31, nel quartiere San Salvario a Torino. Come arrivare in metro, treno o bici e gli orari di apertura giorno per giorno.",
  "dove", f"""
  <div class="scuro">
    <div class="wrap testa-pagina">
      <h1>Dove siamo</h1>
      <p data-apertura><span class="pallino"></span><strong>Dal martedì alla domenica, dalle 19</strong></p>
    </div>
  </div>

  <section class="chiaro" aria-label="Indirizzo e orari">
    <div class="wrap dove-griglia">
      <div>
        <address class="indirizzo">Via Belfiore 31<br>10125 Torino</address>
        <p><a class="link-forte" href="{e(MAPPA)}">Apri le indicazioni in Google Maps</a></p>
        <p>In San Salvario, tra il parco del Valentino e la stazione di Porta Nuova.</p>
        <dl class="arrivare">
          <dt>Metro</dt><dd>Linea 1, fermata Marconi, poi 5 minuti a piedi.</dd>
          <dt>Treno</dt><dd>Stazione di Porta Nuova, 8 minuti a piedi.</dd>
          <dt>Bici</dt><dd>Rastrelliera davanti all’ingresso.</dd>
          <dt>Telefono</dt><dd>{TELEFONO}, dalle 17 in poi.</dd>
        </dl>
      </div>
      <div>
        <table class="orari">
          <caption>Orari</caption>
          <tbody id="orari-settimana">
{righe_orari}
          </tbody>
        </table>
        {tabella_chiusure}
      </div>
    </div>
  </section>
""", extra_head=json_ld(RISTORANTE), barra="indicazioni")

pagina("privacy.html", "Informativa privacy e cookie | La Cupola, pizzeria a Torino",
  "Come la pizzeria La Cupola tratta nome e telefono lasciati per prenotare un tavolo, per quanto tempo li conserva, quali diritti hai e quali cookie usa il sito.",
  "privacy", f"""
  <div class="scuro">
    <div class="wrap testa-pagina">
      <h1>Privacy e cookie</h1>
      <p>Chi tratta i tuoi dati, quali, perché e per quanto tempo. Testo di esempio per la demo, da far verificare prima della messa online.</p>
    </div>
  </div>

  <section class="chiaro" aria-label="Informativa">
    <div class="wrap testo-legale">
      <h2>Titolare del trattamento</h2>
      <p>La Cupola, via Belfiore 31, 10125 Torino, partita IVA {PIVA}, telefono {TELEFONO}.</p>
      <h2>Quali dati raccogliamo</h2>
      <p>Solo quelli che scrivi nel modulo di prenotazione: nome, telefono, giorno, orario, numero di persone ed eventuali note, per esempio su allergie o seggiolone.</p>
      <h2>Perché e su quale base</h2>
      <p>Per riservarti il tavolo e avvisarti se qualcosa cambia. La base giuridica è l’esecuzione di misure richieste da te (art. 6, par. 1, lettera b del Regolamento UE 2016/679). Le note su allergie le usiamo solo in cucina per quella sera. Non usiamo i dati per pubblicità e non li cediamo a nessuno.</p>
      <h2>Per quanto tempo</h2>
      <p>Fino alla data della prenotazione e per i 30 giorni successivi, poi li cancelliamo.</p>
      <h2>I tuoi diritti</h2>
      <p>Puoi chiedere di vedere, correggere o cancellare i tuoi dati, o opporti al trattamento (articoli 15–22 del Regolamento), chiamando il numero qui sopra. Puoi anche rivolgerti al Garante per la protezione dei dati personali.</p>
      <h2>Cookie</h2>
      <p>Il sito non usa cookie di profilazione né statistiche di terze parti, quindi non serve il banner per il consenso. I caratteri tipografici sono serviti dal sito stesso, senza collegamenti a Google. Il servizio che ospita il sito registra, come ogni server, dati tecnici di accesso (indirizzo IP, data e ora) per ragioni di sicurezza.</p>
    </div>
  </section>
""")
print("ok")

comune.scrivi_icone(OUT / "assets", ICONA_SVG, "La Cupola", "#0F2B2A", "#0F2B2A")
comune.scrivi_sitemap(OUT, BASE, ["index.html", "pizze.html", "impasto.html", "prenota.html", "dove.html", "privacy.html"])
