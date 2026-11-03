"""Genera le pagine statiche di «This is not red!», il test del daltonismo (variante web app dello standard).

Uso: python3 strumenti/genera_notred.py
Quattro pagine (test, simulatore, come funziona, privacy) in sei lingue: l'italiano alla radice di
samples/not-red/, le altre in en/, de/, fr/, es/, pt/. I testi stanno in strumenti/notred_testi.json:
modificare quel file e rigenerare, invece di toccare a mano gli HTML.
Le istruzioni sono scritte nell'HTML; gli script disegnano stimoli, calibrazione, risultato e simulatore.
Il calcolo (assets/misura.js) è quello dell'artifact originale, invariato.
"""
import hashlib
import html
import json
import pathlib

import comune

QUI = pathlib.Path(__file__).resolve().parent
OUT = QUI.parent / "samples" / "not-red"
BASE = "https://aleflu.github.io/proposte-siti/not-red/"
NOME = "This is not red!"
LINGUE = ["it", "en", "de", "fr", "es", "pt"]
TESTI = json.loads((QUI / "notred_testi.json").read_text())
PAGINE = ["index.html", "simulatore.html", "metodo.html", "privacy.html"]
# testi che servono solo nell'HTML: non si ripetono nel blocco per gli script
SOLO_HTML = {"_og", "_nomeLingua", "how1", "how2", "how3", "calP", "calWhy", "flP", "flWhy", "tagline", "facts",
             "mTh1", "mLim1", "p1", "pGamma", "pSessions", "pCheck", "pPrefs", "pOffline", "pPhotos", "pShare", "pHost",
             "pDel", "simIntro", "noscript", "notDiag", "flWarn", "dprWarn", "testP1", "testP2", "keysHint"}
SOLO_HTML |= {f"c{i}" for i in range(1, 7)} | {f"calS{i}" for i in range(1, 5)} | {f"flS{i}" for i in range(1, 5)}
e = html.escape

CORRENTE = ' aria-current="true"'
PASSI = [("preparazione", "nav1"), ("calibrazione", "nav2"), ("test", "nav3"), ("tremolio", "nav4"), ("risultato", "nav5")]
# fonti del metodo: titoli originali, uguali in ogni lingua
FONTI = [
    "Regan B. C., Reffin J. P., Mollon J. D. (1994). Luminance noise and the rapid determination of discrimination "
    "ellipses in colour deficiency. <i>Vision Research</i>, 34(10).",
    "Smith V. C., Pokorny J. (1975). Spectral sensitivity of the foveal cone photopigments between 400 and 500 nm. "
    "<i>Vision Research</i>, 15(2).",
    "Machado G. M., Oliveira M. M., Fernandes L. A. F. (2009). A physiologically-based model for simulation of color "
    "vision deficiency. <i>IEEE Transactions on Visualization and Computer Graphics</i>, 15(6).",
    "CIE (1976). Spazio colore uniforme CIE 1976 UCS (u′, v′).",
]

ICONA = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#161616"/>
{punti}
</svg>"""


def icona():
    """Una C di Landolt fatta di puntini grigi, aperta a destra, con due puntini rossi: l'oggetto del test."""
    import math
    punti = []
    for anello, raggio_p, n in ((92, 13, 26), (128, 15, 34), (164, 13, 44)):
        for i in range(n):
            a = 2 * math.pi * i / n
            if abs(math.atan2(math.sin(a), math.cos(a))) < 0.42:     # l'apertura della C, a destra
                continue
            x, y = 256 + anello * math.cos(a), 256 + anello * math.sin(a)
            colore = "#d03833" if (anello, i) in ((128, 9), (128, 25)) else ("#9e9e9e" if i % 3 else "#bebebe")
            punti.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{raggio_p}" fill="{colore}"/>')
    return ICONA.format(punti="\n".join(punti))


def t(lingua, chiave):
    return TESTI[lingua][chiave]


def url(lingua, pagina):
    return f"{BASE}{'' if lingua == 'it' else lingua + '/'}{'' if pagina == 'index.html' else pagina}"


def rel(da, a, pagina):
    """Link relativo dalla pagina nella lingua `da` alla stessa pagina nella lingua `a`."""
    file = "" if pagina == "index.html" else pagina
    if da == a:
        return file or "./"
    if da == "it":
        return f"{a}/{file}"
    return f"../{file}" if a == "it" else f"../{a}/{file}"


def testi_script(lingua):
    voci = {k: v for k, v in TESTI[lingua].items() if k not in SOLO_HTML and not k.startswith("seo")}
    return json.dumps(voci, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def suggerimenti(pagina):
    """Sulle pagine italiane: la frase per proporre la stessa pagina nella lingua del browser."""
    voci = {l: [t(l, "langSuggest"), t(l, "langSuggestGo"), t(l, "langSuggestNo"), rel("it", l, pagina)]
            for l in LINGUE if l != "it"}
    return json.dumps(voci, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def pagina(lingua, file, corpo, script=()):
    pre = "" if lingua == "it" else "../"
    chiave = file.removesuffix(".html")
    titolo, descrizione = t(lingua, "seoTitle_" + chiave), t(lingua, "seoDesc_" + chiave)
    cur = lambda f: ' aria-current="page"' if f == file else ""
    nav = "".join(f'<a href="{f if f != "index.html" else "./"}"{cur(f)}>{t(lingua, k)}</a>'
                  for f, k in (("index.html", "navTest"), ("simulatore.html", "navSim"), ("metodo.html", "navMetodo")))
    lingue = "\n".join(
        f'<li><a href="{rel(lingua, l, file)}" hreflang="{l}" lang="{l}"{CORRENTE if l == lingua else ""}>'
        f'<span class="sigla" aria-hidden="true">{l.upper()}</span> {t(l, "_nomeLingua")}</a></li>' for l in LINGUE)
    piede_pagine = "".join(f'<li><a href="{f if f != "index.html" else "./"}">{t(lingua, k)}</a></li>'
                           for f, k in (("index.html", "navTest"), ("simulatore.html", "navSim"),
                                        ("metodo.html", "navMetodo"), ("privacy.html", "navPrivacy")))
    ld = ""
    if file == "index.html":
        ld = json.dumps({
            "@context": "https://schema.org", "@type": "WebApplication", "name": NOME, "url": url(lingua, file),
            "description": descrizione, "inLanguage": lingua, "applicationCategory": "HealthApplication",
            "operatingSystem": "Any", "browserRequirements": "JavaScript", "isAccessibleForFree": True,
            "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"},
            "image": BASE + "assets/anteprima.jpg",
        }, ensure_ascii=False, indent=1)
        ld = f'<script type="application/ld+json">\n{ld}\n</script>\n'
    sugg = f'<script type="application/json" id="lingue-dati">{suggerimenti(file)}</script>\n' if lingua == "it" else ""
    testo = f"""<!doctype html>
<html lang="{lingua}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(titolo)}</title>
<meta name="description" content="{e(descrizione)}">
<!-- proposta dimostrativa: non indicizzare finché non si decide dove va online (docs/not-red/01-brief.md) -->
<meta name="robots" content="noindex">
<link rel="canonical" href="{url(lingua, file)}">
{comune.alternative(BASE, LINGUE, file)}
<meta name="theme-color" content="#f3f3f3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0f0f0f" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{NOME}">
<meta property="og:locale" content="{t(lingua, "_og")}">
<meta property="og:title" content="{e(titolo)}">
<meta property="og:description" content="{e(descrizione)}">
<meta property="og:url" content="{url(lingua, file)}">
<meta property="og:image" content="{BASE}assets/anteprima.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
{comune.testa_icone(pre + "assets/")}
<script>document.documentElement.classList.add("js");{{const h=location.hash.slice(1);document.documentElement.dataset.vista=["calibrazione","test","tremolio","risultato"].includes(h)?h:"preparazione"}}try{{const s=localStorage.getItem("cvd-theme");if(s==="dark"||s==="light")document.documentElement.dataset.theme=s}}catch(_){{}}</script>
<link rel="stylesheet" href="{pre}{comune.con_versione(OUT, "assets/font.css")}">
<link rel="stylesheet" href="{pre}{comune.con_versione(OUT, "assets/stile.css")}">
<script type="application/json" id="testi">{testi_script(lingua)}</script>
{sugg}{"".join(comune.script(OUT, f"assets/{s}.js", pre) + chr(10) for s in ("misura",) * bool(script) + tuple(script) + ("sito",))}{ld}</head>
<body data-pagina="{chiave}">
<a class="salta" href="#contenuto">{t(lingua, "skip")}</a>
<header class="testata">
  <div class="testata-riga">
    <a class="marchio" href="./"{' aria-current="page"' if file == "index.html" else ""}>{NOME}</a>
    <nav class="nav" aria-label="{t(lingua, "navMain")}">{nav}</nav>
    <div class="comandi">
      <button class="tema" id="tema" type="button"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor"/></svg><span class="se-chiaro">{t(lingua, "themeDark")}</span><span class="se-scuro">{t(lingua, "themeLight")}</span></button>
      <details class="lingue" id="lingue">
        <summary><span class="sr">{t(lingua, "langLabel")}: </span><span aria-hidden="true">{lingua.upper()}</span><span class="sr">{t(lingua, "_nomeLingua")}</span></summary>
        <ul>
{lingue}
        </ul>
      </details>
    </div>
  </div>
</header>

<main id="contenuto">
{corpo.strip()}
</main>

<footer class="piede">
  <div class="piede-riga">
    <p class="piede-nota">{t(lingua, "footNote")}</p>
    <ul class="piede-pagine">{piede_pagine}</ul>
    <p>{t(lingua, "footContact")}: [TESTO: nome ed email di chi gestisce il sito]</p>
    <p>{t(lingua, "footDemo")}</p>
  </div>
</footer>
</body>
</html>
"""
    destinazione = OUT / ("" if lingua == "it" else lingua) / file
    destinazione.parent.mkdir(parents=True, exist_ok=True)
    destinazione.write_text(testo)


def corpo_test(l):
    passi = "\n".join(
        f'<li><a href="#{v}" data-v="{v}"><span class="n" aria-hidden="true">{i}</span>'
        f'<span class="etichetta">{t(l, k)}</span><span class="sr stato"></span></a></li>'
        for i, (v, k) in enumerate(PASSI, 1))
    caselle = "\n".join(
        f'<li><input type="checkbox" id="c{i}"><label for="c{i}">{t(l, f"c{i}")}</label></li>' for i in range(1, 7))
    pad = "".join(f'<button type="button" class="{c}" data-o="{o}" aria-label="{e(t(l, a))}">'
                  f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="{d}"/></svg></button>'
                  for c, o, a, d in (("su", "up", "ariaUp", "M12 4 4 14h5v6h6v-6h5z"),
                                     ("sx", "left", "ariaLeft", "M4 12 14 4v5h6v6h-6v5z"),
                                     ("dx", "right", "ariaRight", "M20 12 10 4v5H4v6h6v5z"),
                                     ("giu", "down", "ariaDown", "M12 20 4 10h5V4h6v6h5z")))
    return f"""
<div class="apertura">
  <h1 class="titolo" id="titolo"><canvas aria-hidden="true"></canvas><span class="titolo-testo">{NOME}</span></h1>
  <p class="tagline">{t(l, "tagline")}</p>
  <p class="fatti">{t(l, "facts")}</p>
</div>
<noscript><p class="nota attenzione">{t(l, "noscript")}</p></noscript>

<div class="percorso">
  <nav class="passi" aria-label="{t(l, "stepsAria")}">
    <p class="passo-di solo-js" id="passoDi"></p>
    <ol>
{passi}
    </ol>
  </nav>

  <div class="viste">
    <section class="vista" id="preparazione" aria-labelledby="h-preparazione">
      <h2 id="h-preparazione" tabindex="-1">{t(l, "prepTitle")}</h2>
      <p>{t(l, "prepIntro")}</p>
      <ul class="caselle">
{caselle}
      </ul>
      <p><a href="metodo.html#condizioni">{t(l, "prepWhy")}</a></p>
      <p class="nota">{t(l, "notDiag")}</p>
      <div class="azioni solo-js"><a class="btn primario" href="#calibrazione">{t(l, "goCal")}</a><span class="tenue" id="prevHint"></span></div>
    </section>

    <section class="vista" id="calibrazione" aria-labelledby="h-calibrazione">
      <h2 id="h-calibrazione" tabindex="-1">{t(l, "calTitle")}</h2>
      <p>{t(l, "calWhy")}</p>
      <ol class="istruzioni">{"".join(f"<li>{t(l, k)}</li>" for k in ("calS1", "calS2", "calS3", "calS4"))}</ol>
      <p class="nota attenzione" id="dprWarn" hidden>{t(l, "dprWarn")}</p>
      <div class="cal-righe solo-js" id="calRows"></div>
      <div class="azioni solo-js">
        <button type="button" class="btn primario" id="calSave">{t(l, "calSave")}</button>
        <button type="button" class="btn" id="calSkip">{t(l, "calSkip")}</button>
        <span class="tenue numeri" id="calState"></span>
      </div>
    </section>

    <section class="vista" id="test" aria-labelledby="h-test">
      <h2 id="h-test" tabindex="-1">{t(l, "testTitle")}</h2>
      <div class="palco solo-js" id="stageWrap">
        <div class="palco-avvio" id="testIntro">
          <p>{t(l, "testP1")}</p>
          <p>{t(l, "testP2")}</p>
          <button type="button" class="btn primario" id="testStart">{t(l, "start")}</button>
        </div>
        <div class="palco-stato numeri" id="stageStatus" hidden><span id="stLeft"></span><span id="stRight"></span></div>
        <div class="avanzamento" id="progBar" hidden><i></i></div>
        <canvas id="stage" hidden role="img" aria-label="{e(t(l, "stageAria"))}"></canvas>
        <p class="riscontro" id="feedback" aria-live="polite"></p>
        <div class="croce" id="pad" hidden>{pad}<button type="button" class="nessuna" data-o="none">{t(l, "noSee")}</button></div>
        <div class="palco-comandi" id="stageActions" hidden>
          <button type="button" class="btn" id="testPause">{t(l, "pause")}</button>
          <button type="button" class="btn" id="testAbort">{t(l, "abort")}</button>
        </div>
        <div class="palco-avvio" id="testDone" hidden>
          <h3 tabindex="-1">{t(l, "doneTitle")}</h3>
          <p id="testDoneTxt"></p>
          <div class="azioni"><a class="btn primario" href="#tremolio">{t(l, "goFlicker")}</a><a class="btn" href="#risultato">{t(l, "goResult")}</a></div>
        </div>
      </div>
      <p class="tenue">{t(l, "keysHint")}</p>
    </section>

    <section class="vista" id="tremolio" aria-labelledby="h-tremolio">
      <h2 id="h-tremolio" tabindex="-1">{t(l, "flTitle")}</h2>
      <p>{t(l, "flWhy")}</p>
      <ol class="istruzioni">{"".join(f"<li>{t(l, k)}</li>" for k in ("flS1", "flS2", "flS3", "flS4"))}</ol>
      <p class="nota attenzione"><svg class="segnale" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20zm0 6v6m0 2.5v1.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>{t(l, "flWarn")}</p>
      <div class="azioni solo-js" id="flStart">
        <button type="button" class="btn primario" id="flGo">{t(l, "flGo")}</button>
        <a class="btn" href="#risultato">{t(l, "flSkip")}</a>
      </div>
      <div class="palco tremolio" id="flField" hidden>
        <div class="disco" id="flPatch"></div>
        <div class="tremolio-comandi">
          <button type="button" class="btn" id="flMinus" aria-label="{e(t(l, "flMinus"))}">−</button>
          <input type="range" id="flSlider" min="0" max="1000" value="500" aria-label="{e(t(l, "flSlider"))}">
          <button type="button" class="btn" id="flPlus" aria-label="{e(t(l, "flPlus"))}">+</button>
        </div>
        <div class="direzioni"><span>{t(l, "flLessLbl")}</span><span>{t(l, "flMoreLbl")}</span></div>
        <p class="palco-messaggio" id="flMsg" aria-live="polite"></p>
        <div class="azioni"><button type="button" class="btn primario" id="flOk">{t(l, "flOk")}</button><button type="button" class="btn" id="flStop">{t(l, "flStop")}</button></div>
      </div>
      <div id="flDone" hidden>
        <p id="flDoneTxt"></p>
        <div class="azioni"><a class="btn primario" href="#risultato">{t(l, "goResult")}</a><button type="button" class="btn" id="flRedo">{t(l, "flRedo")}</button></div>
      </div>
    </section>

    <section class="vista" id="risultato" aria-labelledby="h-risultato">
      <h2 id="h-risultato" tabindex="-1">{t(l, "resTitle")}</h2>
      <div id="resEmpty">
        <p>{t(l, "resEmptyP")}</p>
        <div class="azioni solo-js"><a class="btn primario" href="#preparazione">{t(l, "resEmptyBtn")}</a></div>
      </div>
      <div class="scheda" id="resBody" hidden></div>
    </section>
  </div>
</div>
"""


def corpo_simulatore(l):
    gruppo = lambda id_, chiave, voci, attr: (
        f'<div class="scelta" role="group" aria-labelledby="{id_}-t"><span class="etichetta-gruppo" id="{id_}-t">{t(l, chiave)}</span>'
        f'<div class="scelta-voci" id="{id_}">' + "".join(
            f'<button type="button" data-{attr}="{v}" aria-pressed="{str(premuto).lower()}">{testo}</button>'
            for v, testo, premuto in voci) + "</div></div>")
    tipo = gruppo("segType", "type", [("protan", "Protan", False), ("deutan", "Deutan", True), ("tritan", "Tritan", False)], "t")
    vista = gruppo("segMode", "view", [("split", t(l, "vSplit"), True), ("side", t(l, "vSide"), False),
                                       ("sim", t(l, "vSim"), False)], "m")
    return f"""
<div class="intestazione">
  <h1>{t(l, "simH1")}</h1>
  <p class="tagline">{t(l, "simIntro")}</p>
</div>
<noscript><p class="nota attenzione">{t(l, "noscript")}</p></noscript>
<div class="profilo solo-js" id="simBanner" hidden></div>
<div class="sim solo-js">
  <section class="sim-controlli" aria-labelledby="h-controlli">
    <h2 class="sr" id="h-controlli">{t(l, "simControls")}</h2>
    {tipo}
    <div class="scelta">
      <div class="riga-etichetta"><label class="etichetta-gruppo" for="sev">{t(l, "intensity")}</label><output class="numeri" id="sevOut" for="sev">60%</output></div>
      <input type="range" id="sev" min="0" max="100" value="60">
      <span class="tenue" id="sevName"></span>
    </div>
    {vista}
    <div class="scelta">
      <span class="etichetta-gruppo">{t(l, "image")}</span>
      <div class="azioni">
        <button type="button" class="btn" id="srcSample">{t(l, "sample")}</button>
        <label class="btn file" for="file">{t(l, "upload")}<input type="file" id="file" accept="image/*,.heic,.heif"></label>
      </div>
      <p class="trascina" id="drop">{t(l, "drop")}</p>
      <p class="tenue" id="loadMsg" aria-live="polite"></p>
    </div>
    <button type="button" class="btn" id="useMine" hidden>{t(l, "useMine")}</button>
  </section>
  <div class="sim-vista">
    <div class="visore" id="viewSplit">
      <canvas id="cvOrig"></canvas><canvas id="cvSim" class="sopra"></canvas>
      <div class="maniglia" id="handle"></div>
      <span class="cartellino sx">{t(l, "original")}</span><span class="cartellino dx">{t(l, "howISee")}</span>
    </div>
    <div class="divisione" id="splitCtl"><span>{t(l, "howISee")}</span><input type="range" id="splitRange" min="0" max="1000" value="500" aria-label="{e(t(l, "splitAria"))}"><span>{t(l, "original")}</span></div>
    <div class="affiancate" id="viewSide" hidden>
      <figure><canvas id="cvOrig2"></canvas><figcaption>{t(l, "original")}</figcaption></figure>
      <figure><canvas id="cvSim2"></canvas><figcaption>{t(l, "howISee")}</figcaption></figure>
    </div>
    <div id="viewSim" hidden><canvas id="cvSim3"></canvas></div>
    <p class="tenue">{t(l, "simNote")}</p>
  </div>
</div>
<section class="sim-strumenti solo-js" aria-labelledby="h-strumenti">
  <h2 id="h-strumenti">{t(l, "simTools")}</h2>
  <div class="strumento">
    <h3>{t(l, "saveTitle")}</h3>
    <p>{t(l, "saveP")}</p>
    <div class="azioni"><button type="button" class="btn" id="mkImg">{t(l, "mkImg")}</button><button type="button" class="btn" id="cpImg">{t(l, "cpImg")}</button><span class="tenue" id="imgMsg" aria-live="polite"></span></div>
  </div>
  <div class="strumento">
    <h3>{t(l, "shareTitle")}</h3>
    <p>{t(l, "shareP")}</p>
    <pre class="codice" id="shareLink"></pre>
    <div class="azioni"><button type="button" class="btn" id="cpLink">{t(l, "cpLink")}</button><span class="tenue" id="linkMsg" aria-live="polite"></span></div>
  </div>
  <div class="strumento">
    <h3>{t(l, "webTitle")}</h3>
    <p>{t(l, "webP")}</p>
    <pre class="codice" id="svgCode"></pre>
    <div class="azioni"><button type="button" class="btn" id="cpSvg">{t(l, "cpSvg")}</button><span class="tenue" id="svgMsg" aria-live="polite"></span></div>
  </div>
</section>
"""


def corpo_metodo(l):
    caselle = "".join(f"<li>{t(l, f'c{i}')}</li>" for i in range(1, 7))
    fonti = "".join(f"<li>{f}</li>" for f in FONTI)
    return f"""
<article class="testo">
  <h1>{t(l, "mH1")}</h1>
  <p>{t(l, "how1")}</p>
  <p>{t(l, "how2")}</p>
  <p>{t(l, "how3")}</p>
  <dl class="dati">
    <dt>{t(l, "dtDur")}</dt><dd>{t(l, "ddDur")}</dd>
    <dt>{t(l, "dtTrials")}</dt><dd>{t(l, "ddTrials")}</dd>
    <dt>{t(l, "dtUnit")}</dt><dd>{t(l, "ddUnit")}</dd>
  </dl>
  <h2 id="condizioni">{t(l, "mPrepTitle")}</h2>
  <ul>{caselle}</ul>
  <h2>{t(l, "calTitle")}</h2>
  <p>{t(l, "calWhy")}</p>
  <p>{t(l, "calP")}</p>
  <h2>{t(l, "mThTitle")}</h2>
  <p>{t(l, "mTh1")}</p>
  <p>{t(l, "thNote")}</p>
  <h2>{t(l, "flTitle")}</h2>
  <p>{t(l, "flP")}</p>
  <h2>{t(l, "navSim")}</h2>
  <p>{t(l, "simNote")}</p>
  <h2>{t(l, "mLimTitle")}</h2>
  <p>{t(l, "mLim1")}</p>
  <p>{t(l, "noteTritanRare")}</p>
  <h2>{t(l, "mFontiTitle")}</h2>
  <ul class="fonti">{fonti}</ul>
  <p><a class="btn primario" href="./">{t(l, "doTest")}</a></p>
</article>
"""


def corpo_privacy(l):
    voci = "".join(f"<li>{t(l, k)}</li>" for k in ("pGamma", "pSessions", "pCheck", "pPrefs", "pOffline"))
    return f"""
<article class="testo">
  <h1>{t(l, "pH1")}</h1>
  <p>{t(l, "p1")}</p>
  <h2>{t(l, "pStoredTitle")}</h2>
  <ul>{voci}</ul>
  <p>{t(l, "pPhotos")}</p>
  <h2>{t(l, "pShareTitle")}</h2>
  <p>{t(l, "pShare")}</p>
  <h2>{t(l, "pHostTitle")}</h2>
  <p>{t(l, "pHost")}</p>
  <h2>{t(l, "pDelTitle")}</h2>
  <p>{t(l, "pDel")}</p>
  <div class="azioni solo-js"><button type="button" class="btn" id="cancella">{t(l, "pDelBtn")}</button><span class="tenue" id="cancellaMsg" aria-live="polite"></span></div>
</article>
"""


def scrivi_sw():
    """Il service worker: alla prima visita salva pagine e file, così il test funziona anche senza rete.

    La cache prende il nome dall'impronta di tutti i file: dopo un aggiornamento ne nasce una nuova e la vecchia
    si cancella, quindi una pagina non incontra mai CSS o JS di un'altra versione.
    """
    file = sorted(p for p in OUT.rglob("*") if p.is_file() and p.name not in ("sw.js", "sitemap.xml")
                  and not p.name.startswith("."))
    impronta = hashlib.sha256(b"".join(p.relative_to(OUT).as_posix().encode() + p.read_bytes() for p in file)).hexdigest()[:8]
    elenco = []
    for p in file:
        r = p.relative_to(OUT).as_posix()
        if r.endswith(".css") or r.endswith(".js"):
            r = comune.con_versione(OUT, r)
        elenco.append("./" + r.removesuffix("index.html"))
    (OUT / "sw.js").write_text(f"""// Generato da strumenti/genera_notred.py: pagine e file per usare il sito senza rete.
const CACHE = "notred-{impronta}";
const FILE = {json.dumps(elenco, indent=1)};
self.addEventListener("install", e => {{
  // cache: "reload" salta la cache HTTP: dopo un aggiornamento non entrano pagine vecchie con impronte che qui non ci sono
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE.map(u => new Request(u, {{ cache: "reload" }})))).then(() => self.skipWaiting()));
}});
self.addEventListener("activate", e => {{
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("notred-") && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
}});
// pagine: prima la rete (testi sempre aggiornati), la copia solo senza rete; file con impronta: prima la copia
self.addEventListener("fetch", e => {{
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {{
    e.respondWith(fetch(e.request).then(r => {{
      if (r.ok) {{ const copia = r.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(e.request, copia))); }}
      return r;
    }}).catch(() => caches.match(e.request, {{ ignoreSearch: true }}).then(r => r || caches.match("./"))));
    return;
  }}
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
}});
""")


for lingua in LINGUE:
    pagina(lingua, "index.html", corpo_test(lingua), ("test",))
    pagina(lingua, "simulatore.html", corpo_simulatore(lingua), ("simulatore",))
    pagina(lingua, "metodo.html", corpo_metodo(lingua))
    pagina(lingua, "privacy.html", corpo_privacy(lingua))

comune.scrivi_icone(OUT / "assets", icona(), NOME, "#161616", "#f3f3f3", display="standalone")
comune.scrivi_sitemap(OUT, BASE, [p if l == "it" else f"{l}/{p}" for l in LINGUE for p in PAGINE])
scrivi_sw()
