"""Genera le pagine statiche di __NOME__.

Uso: python3 strumenti/genera___SITO__.py
Creato da strumenti/nuovo_sito.py a partire da standard/modello_generatore.py.
Dati dell'attività, testata, piede, meta SEO e JSON-LD stanno qui: modificare questo file e
rigenerare, invece di toccare a mano gli HTML in samples/__SITO__/.
Dopo ogni modifica: python3 strumenti/controlla.py samples/__SITO__ --demo
"""
import html
import json
import pathlib
import shutil

import comune

RADICE = pathlib.Path(__file__).resolve().parent.parent
OUT = RADICE / "samples" / "__SITO__"
BASE = "https://aleflu.github.io/proposte-siti/__SITO__/"   # URL definitivo, con la barra finale
DEMO = True   # attività di fantasia: noindex e nota nel piede. Per un cliente vero: False.

# ---------- dati dell'attività: identici a Google Business Profile e social ----------
DATI = {
    "nome": "__NOME__",
    "tipo": "LocalBusiness",            # il più specifico: Restaurant, Bakery, Store, HairSalon, ProfessionalService…
    "sottotitolo": "[TESTO: cosa fa, in tre parole]",
    "descrizione": "[TESTO: una frase per Google, che dica cosa e dove]",
    "via": "Via [TESTO] 1", "cap": "00000", "citta": "[Città]", "provincia": "XX",
    "lat": 45.0, "lng": 9.0,
    "telefono": "000 000 0000", "telefono_link": "+390000000000",
    "email": "info@example.com",
    "ragione_sociale": "__NOME__",
    "piva": "00000000000",
    "fascia_prezzo": "€€",
    "profili": [],                      # Instagram, Facebook, TripAdvisor…: gli stessi del Google Business Profile
    "colore_tema": "#222222", "colore_fondo": "#FFFFFF",
}
# 0 = domenica … 6 = sabato; fasce in ore decimali (7.5 = 7:30)
ORARI = {2: [(9, 13), (15.5, 19.5)], 3: [(9, 13), (15.5, 19.5)], 4: [(9, 13), (15.5, 19.5)],
         5: [(9, 13), (15.5, 19.5)], 6: [(9, 13)]}
# chiusure e orari speciali (regole in comune.py): avviso in cima alle pagine, stato «aperto ora», tabella
# sotto gli orari e dati per Google. Vanno messe anche su Google Business Profile («Orari speciali»).
# Se l'attività chiude in tutti i festivi: comune.festivi(2026, 2027, patrono=("MM-GG", "nome del santo")).
CHIUSURE = comune.prossime_chiusure([
    # {"dal": "2026-08-10", "al": "2026-08-23", "motivo": "ferie"},
    # {"dal": "2026-12-24", "al": "2026-12-24", "motivo": "vigilia di Natale", "fasce": [(9, 13)]},
])
# azioni della barra su telefono: al massimo due, la principale per ultima
AZIONI = [(f"tel:{DATI['telefono_link']}", "Chiama", False), ("dove.html", "Come arrivare", True)]
NAV = [("dove.html", "Orari e dove siamo")]
# icona quadrata a tutto campo, senza angoli arrotondati (iPhone li arrotonda da solo)
ICONA_SVG = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#222222"/>'
             '<circle cx="16" cy="16" r="8" fill="#FFFFFF"/></svg>')

e = html.escape
CUR = ' aria-current="page"'
PRIMARIA = ' class="primaria"'
GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"]
GIORNI_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
ora = lambda h: f"{int(h)}:{round(h % 1 * 60):02d}"
hhmm = lambda h: f"{int(h):02d}:{round(h % 1 * 60):02d}"   # per Google: "09:00"
indirizzo = f"{DATI['via']}, {DATI['cap']} {DATI['citta']}"

# ---------- dati strutturati ----------
ATTIVITA = {
    "@context": "https://schema.org", "@type": DATI["tipo"], "name": DATI["nome"],
    "description": DATI["descrizione"], "url": BASE, "image": [BASE + "assets/anteprima.jpg"],
    "telephone": "+39 " + DATI["telefono"], "email": DATI["email"], "priceRange": DATI["fascia_prezzo"],
    "address": {"@type": "PostalAddress", "streetAddress": DATI["via"], "addressLocality": DATI["citta"],
                "postalCode": DATI["cap"], "addressRegion": DATI["provincia"], "addressCountry": "IT"},
    "geo": {"@type": "GeoCoordinates", "latitude": DATI["lat"], "longitude": DATI["lng"]},
    "openingHoursSpecification": [
        *({"@type": "OpeningHoursSpecification", "dayOfWeek": GIORNI_EN[g], "opens": hhmm(a), "closes": hhmm(b)}
          for g, fasce in sorted(ORARI.items()) for a, b in fasce),
        *comune.orari_ld(CHIUSURE),
    ],
    **({"sameAs": DATI["profili"]} if DATI["profili"] else {}),
}
json_ld = lambda dati: f'<script type="application/ld+json">\n{json.dumps(dati, ensure_ascii=False, indent=1)}\n</script>'
orari_dati = f'<script type="application/json" id="orari-dati">{json.dumps({str(g): f for g, f in ORARI.items()})}</script>'


def tabella_orari():
    righe = []
    for g in [1, 2, 3, 4, 5, 6, 0]:
        fasce = ", ".join(f"{ora(a)} – {ora(b)}" for a, b in ORARI.get(g, [])) or "chiuso"
        righe.append(f'<tr data-giorno="{g}"><th scope="row">{GIORNI[g].capitalize()}</th><td>{fasce}</td></tr>')
    tabella = '<table class="orari"><caption class="vh">Orari di apertura</caption><tbody>\n' + "\n".join(righe) + "\n</tbody></table>"
    if CHIUSURE:
        tabella += (f'\n<div class="chiusure" data-orizzonte="{comune.ORIZZONTE}">\n<h2 id="t-chiusure">Prossime chiusure</h2>\n'
                    f'<table class="orari" aria-labelledby="t-chiusure"><tbody>\n{comune.righe_chiusure(CHIUSURE)}\n</tbody></table>\n</div>')
    return tabella


def pagina(file, titolo, descrizione, chiave, corpo, extra_head=""):
    url = BASE + ("" if file == "index.html" else file)
    voci = "\n".join(f'      <a href="{h}"{CUR if h == file else ""}>{e(t)}</a>' for h, t in NAV)
    azioni = "".join(f'<a{PRIMARIA if p else ""} href="{h}">{e(t)}</a>' for h, t, p in AZIONI)
    robots = ('<!-- demo con attività di fantasia: non indicizzare (vedi CLAUDE.md) -->\n<meta name="robots" content="noindex">\n'
              if DEMO else "")
    nota = ('<p class="nota-demo">Proposta grafica dimostrativa: attività, indirizzo, recapiti e partita IVA sono di fantasia.</p>'
            if DEMO else "")
    testo = f"""<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(titolo)}</title>
<meta name="description" content="{e(descrizione)}">
{robots}<link rel="canonical" href="{url}">
<meta name="theme-color" content="{DATI['colore_tema']}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{e(DATI['nome'])}">
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
<link rel="stylesheet" href="{comune.con_versione(OUT, "assets/base.css")}">
<link rel="stylesheet" href="{comune.con_versione(OUT, "assets/stile.css")}">
{orari_dati}
{comune.dati_chiusure(CHIUSURE)}
{comune.script(OUT, "assets/base.js")}
{comune.script(OUT, "assets/sito.js")}
{extra_head}
</head>
<body data-pagina="{chiave}">
<a class="salta" href="#contenuto">Vai al contenuto</a>

<header class="wrap testata">
  <a class="marchio" href="index.html"{CUR if file == "index.html" else ""}>{e(DATI['nome'])}</a>
  <button class="menu-apri" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  <nav class="nav" id="nav" aria-label="Principale">
{voci}
  </nav>
</header>

<main id="contenuto">
{comune.avvisi_chiusure(CHIUSURE)}
{corpo.strip()}
</main>

<footer>
  <div class="wrap piede-legale">
    <p><strong>{e(DATI['nome'])}</strong>, {e(indirizzo)}</p>
    <p>Telefono <a href="tel:{DATI['telefono_link']}">{e(DATI['telefono'])}</a> · <a href="mailto:{DATI['email']}">{e(DATI['email'])}</a></p>
    <p>{e(DATI['ragione_sociale'])} · Partita IVA {DATI['piva']} · Prezzi in euro, IVA inclusa</p>
    <p><a href="privacy.html"{CUR if file == "privacy.html" else ""}>Privacy e cookie</a></p>
    {nota}
  </div>
</footer>

<nav class="barra-azioni" aria-label="Azioni rapide">{azioni}</nav>

</body>
</html>
"""
    (OUT / file).write_text(testo)


# la base dello standard si copia prima delle pagine: i link portano l'impronta della copia appena fatta
for nome in ("base.css", "base.js"):
    shutil.copy(RADICE / "standard" / "base" / nome, OUT / "assets" / nome)

# ---------- pagine ----------
# Ogni pagina nasce da docs/__SITO__/02-ia.md. Title "Cosa | Nome attività, Città" (50–60 caratteri),
# description 140–160 caratteri. I testi [TESTO: …] vanno sostituiti con contenuti veri.

pagina("index.html", f"[TESTO: cosa, 30–40 caratteri] | {DATI['nome']}, {DATI['citta']}",
  "[TESTO: description di 140–160 caratteri: cosa fa l'attività, dove, e perché cliccare proprio qui invece che sul risultato sotto.]",
  "home", f"""
  <section class="wrap apertura">
    <h1>[TESTO: la frase che solo questa attività può dire]</h1>
    <p data-stato>{e(DATI['sottotitolo'])}</p>
  </section>
""", extra_head=json_ld(ATTIVITA))

pagina("dove.html", f"Orari e indirizzo | {DATI['nome']}, {DATI['citta']}",
  f"Orari di apertura giorno per giorno, indirizzo e telefono di {DATI['nome']} a {DATI['citta']}: come arrivare a piedi, in auto e con i mezzi pubblici. [TESTO]",
  "dove", f"""
  <section class="wrap">
    <h1>Orari e dove siamo</h1>
    <p data-stato></p>
    {tabella_orari()}
    <h2>Indirizzo</h2>
    <p>{e(indirizzo)}</p>
    <p><a href="https://www.google.com/maps/search/?api=1&amp;query={DATI['lat']},{DATI['lng']}">Apri in Google Maps</a></p>
  </section>
""", extra_head=json_ld(ATTIVITA))

pagina("privacy.html", f"Informativa privacy e cookie | {DATI['nome']}, {DATI['citta']}",
  f"Come {DATI['nome']} tratta i dati lasciati sul sito, per quanto tempo li conserva, quali diritti hai e quali cookie usa il sito. Testo da verificare.",
  "privacy", f"""
  <section class="wrap testo-legale">
    <h1>Privacy e cookie</h1>
    <p>Chi tratta i tuoi dati, quali, perché e per quanto tempo.{" Testo di esempio per la demo, da far verificare prima della messa online." if DEMO else ""}</p>
    <h2>Titolare del trattamento</h2>
    <p>{e(DATI['ragione_sociale'])}, {e(indirizzo)}, partita IVA {DATI['piva']}, telefono {e(DATI['telefono'])}, email {e(DATI['email'])}.</p>
    <h2>Quali dati raccogliamo</h2>
    <p>[TESTO: solo quelli scritti nei moduli, elencati uno per uno. Se il sito non ha moduli: nessuno, oltre ai dati tecnici di accesso.]</p>
    <h2>Perché e su quale base</h2>
    <p>[TESTO: lo scopo.] La base giuridica è l’esecuzione di misure richieste da te (art. 6, par. 1, lettera b del Regolamento UE 2016/679). Non usiamo i dati per pubblicità e non li cediamo a nessuno.</p>
    <h2>Chi li riceve</h2>
    <p>[TESTO: hosting, servizio di moduli, gestionale. Ciascuno con sede e ruolo di responsabile del trattamento.]</p>
    <h2>Per quanto tempo</h2>
    <p>[TESTO: es. fino alla data della prenotazione e per i 30 giorni successivi, poi li cancelliamo.]</p>
    <h2>I tuoi diritti</h2>
    <p>Puoi chiedere di vedere, correggere o cancellare i tuoi dati, o opporti al trattamento (articoli 15–22 del Regolamento), con i recapiti qui sopra. Puoi anche rivolgerti al Garante per la protezione dei dati personali.</p>
    <h2>Cookie</h2>
    <p>Il sito non usa cookie di profilazione né statistiche di terze parti, quindi non serve il banner per il consenso. I caratteri tipografici sono serviti dal sito stesso, senza collegamenti a Google. Il servizio che ospita il sito registra, come ogni server, dati tecnici di accesso (indirizzo IP, data e ora) per ragioni di sicurezza.</p>
  </section>
""")

# ---------- file comuni: icone, sitemap ----------
comune.scrivi_icone(OUT / "assets", ICONA_SVG, DATI["nome"], DATI["colore_tema"], DATI["colore_fondo"])
comune.scrivi_sitemap(OUT, BASE, ["index.html", "dove.html", "privacy.html"])
print("ok")
