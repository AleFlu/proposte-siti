"""Controllo automatico delle pagine di un sito, prima di metterlo online.

Uso: python3 strumenti/controlla.py samples/<nome> [--demo]
     python3 strumenti/controlla.py samples --demo        (tutti i siti)

--demo: il sito è una proposta con attività di fantasia, quindi il noindex è obbligatorio.
Senza --demo il noindex è un errore (un sito vero deve finire su Google).

Controlla le regole di CLAUDE.md che si possono verificare leggendo l'HTML: SEO,
legale, accessibilità di base, link interni. Non sostituisce Lighthouse, gli screenshot
ai 4 breakpoint e il Rich Results Test (vedi standard/checklist.md).
Esce con codice 1 se trova errori.
"""
import json
import pathlib
import re
import sys
from html.parser import HTMLParser

VUOTI = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
TERZE_PARTI = ["fonts.googleapis.com", "fonts.gstatic.com", "googletagmanager.com", "google-analytics.com",
               "connect.facebook.net", "maps.googleapis.com", "google.com/maps/embed", "youtube.com/embed"]
CAMPI_AUTOCOMPLETE = {"nome": "name", "name": "name", "email": "email", "tel": "tel", "telefono": "tel"}


class Pagina(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.elementi = []          # (tag, attributi, testo interno)
        self.aperti = []
        self.titoli = []            # (livello, testo)
        self.title = ""
        self.jsonld = []
        self._in = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        el = [tag, a, ""]
        self.elementi.append(el)
        if tag not in VUOTI:
            self.aperti.append(el)
        if tag == "script" and a.get("type") == "application/ld+json":
            self._in = "jsonld"
            self.jsonld.append("")
        elif tag == "title":
            self._in = "title"

    def handle_endtag(self, tag):
        for i in range(len(self.aperti) - 1, -1, -1):
            if self.aperti[i][0] == tag:
                el = self.aperti.pop(i)
                if re.fullmatch(r"h[1-6]", tag):
                    self.titoli.append((int(tag[1]), el[2].strip()))
                break
        self._in = None

    def handle_data(self, data):
        for el in self.aperti:
            el[2] += data
        if self._in == "jsonld":
            self.jsonld[-1] += data
        elif self._in == "title":
            self.title += data


def controlla_sito(cartella, demo, problemi):
    pagine = sorted(cartella.glob("*.html"))
    lette = {}
    for p in pagine:
        par = Pagina()
        sorgente = p.read_text()
        par.feed(sorgente)
        lette[p.name] = (par, sorgente)

    titoli_visti, descrizioni_viste = {}, {}
    for nome, (par, src) in lette.items():
        err = lambda m: problemi.append(("ERRORE", f"{cartella.name}/{nome}", m))
        avv = lambda m: problemi.append(("avviso", f"{cartella.name}/{nome}", m))
        meta = {(el[1].get("name") or el[1].get("property")): el[1].get("content", "")
                for el in par.elementi if el[0] == "meta"}
        link = [el[1] for el in par.elementi if el[0] == "link"]
        e404 = nome == "404.html"

        if not src.lower().startswith("<!doctype html>"):
            err("manca <!doctype html>")
        if 'lang="it"' not in src[:200]:
            err('manca <html lang="it">')
        if "viewport" not in meta:
            err("manca il meta viewport")

        # SEO
        t, d = par.title.strip(), meta.get("description", "")
        if not e404:
            if not 50 <= len(t) <= 60:
                avv(f"title di {len(t)} caratteri (50–60): {t!r}")
            if not 140 <= len(d) <= 160:
                avv(f"description di {len(d)} caratteri (140–160)")
            if t in titoli_visti:
                err(f"title uguale a {titoli_visti[t]}")
            if d and d in descrizioni_viste:
                err(f"description uguale a {descrizioni_viste[d]}")
            titoli_visti[t], descrizioni_viste[d] = nome, nome
            canonical = [l for l in link if l.get("rel") == "canonical"]
            if not canonical or not canonical[0].get("href", "").startswith("https://"):
                err("canonical mancante o non assoluto")
            for k in ("og:title", "og:description", "og:url", "og:image"):
                if not meta.get(k):
                    err(f"manca {k}")
            if meta.get("og:locale") != "it_IT":
                err("og:locale non è it_IT")
            if meta.get("og:image") and not meta["og:image"].startswith("https://"):
                err("og:image non è un URL assoluto")
            segno = f"/{cartella.name}/"
            if segno in meta.get("og:image", "") and not (cartella / meta["og:image"].split(segno, 1)[1]).exists():
                err(f"l'immagine di anteprima non esiste: {meta['og:image'].split(segno, 1)[1]}")
        noindex = "noindex" in meta.get("robots", "")
        if demo and not noindex and not e404:
            err("demo senza noindex: indirizzi e telefoni inventati finirebbero su Google")
        if not demo and noindex:
            err("noindex su un sito vero: Google non lo indicizzerà")
        if not any(l.get("rel") == "apple-touch-icon" for l in link) and not e404:
            avv("manca apple-touch-icon (icona per la schermata Home)")

        # titoli
        livelli = [l for l, _ in par.titoli]
        if livelli.count(1) != 1:
            err(f"{livelli.count(1)} h1 nella pagina (deve essere uno)")
        main = next((el for el in par.elementi if el[0] == "main"), None)
        for prima, dopo in zip(livelli, livelli[1:]):
            if dopo > prima + 1:
                avv(f"salto di livello h{prima} → h{dopo}")
                break

        # accessibilità di base
        if not main:
            err("manca <main>")
        if not e404 and not re.search(r'class="salta"|href="#contenuto"', src):
            avv("manca il link per saltare al contenuto")
        ids = [el[1]["id"] for el in par.elementi if "id" in el[1]]
        doppi = {i for i in ids if ids.count(i) > 1}
        if doppi:
            err(f"id duplicati: {', '.join(sorted(doppi))}")
        for el in par.elementi:
            tag, a, testo = el
            if tag == "img":
                if "alt" not in a:
                    err(f"immagine senza alt: {a.get('src')}")
                if not (a.get("width") and a.get("height")):
                    avv(f"immagine senza width/height (spostamenti di layout): {a.get('src')}")
            if tag in ("a", "button") and not testo.strip() and not a.get("aria-label") and not a.get("aria-labelledby"):
                err(f"<{tag}> senza testo leggibile: {a.get('href') or a.get('class')}")
            if tag == "a" and a.get("href", "").startswith("tel:") and not a["href"].startswith("tel:+39"):
                avv(f"link telefonico senza +39: {a['href']}")
            if tag == "input" and a.get("type") not in ("hidden", "submit", "radio", "checkbox"):
                campo = (a.get("name") or a.get("id") or "").lower().removeprefix("f-")
                if campo in CAMPI_AUTOCOMPLETE and not a.get("autocomplete"):
                    avv(f"campo {campo} senza autocomplete")
                if campo in ("tel", "telefono") and a.get("type") != "tel":
                    err(f"campo {campo} senza type=tel")
                if not a.get("id") or f'for="{a.get("id")}"' not in src:
                    if not a.get("aria-label"):
                        err(f"campo senza <label>: {a.get('name') or a.get('id')}")

        # legale
        for dominio in TERZE_PARTI:
            if dominio in src:
                err(f"risorsa di terze parti senza consenso: {dominio}")
        if not e404:
            # l'hub delle proposte non è il sito di un'attività: lì è solo un promemoria
            legale = avv if cartella.name == "samples" else err
            if not re.search(r"Partita IVA|P\.\s?IVA", src):
                legale("manca la partita IVA nel piede")
            if 'href="privacy.html"' not in src and nome != "privacy.html":
                legale("manca il link all'informativa privacy")
            if "<form" in src:
                modulo = src[src.index("<form"):src.index("</form>")]
                if "privacy" not in modulo.lower():
                    err("modulo senza rimando all'informativa privacy vicino al pulsante")
            if re.search(r"\d+,\d{2}\s?(€|<)|class=\"prezzo\"", src) and not re.search(r"IVA (e [\w ]+ )?inclus", src):
                avv("ci sono prezzi ma non c'è scritto «IVA inclusa»")

        # dati strutturati
        for blocco in par.jsonld:
            try:
                dati = json.loads(blocco)
            except json.JSONDecodeError as ex:
                err(f"JSON-LD non valido: {ex}")
                continue
            tipo = dati.get("@type")
            if tipo in ("Restaurant", "Bakery", "Store", "LocalBusiness", "ProfessionalService", "FoodEstablishment"):
                for k in ("name", "address", "telephone", "url", "image", "openingHoursSpecification"):
                    if k not in dati:
                        err(f"JSON-LD {tipo} senza {k}")
                if not str(dati.get("telephone", "")).startswith("+39"):
                    avv("JSON-LD: telefono senza +39")

        # link interni
        for el in par.elementi:
            href = el[1].get("href") or (el[1].get("src") if el[0] in ("script", "img", "source") else None)
            if not href or re.match(r"(https?:|mailto:|tel:|data:|sms:|//)", href) or href.startswith("/"):
                continue
            percorso, _, ancora = href.partition("#")
            percorso = percorso.split("?")[0]
            destinazione = (cartella / percorso) if percorso else cartella / nome
            if percorso and not destinazione.exists():
                err(f"link rotto: {href}")
            elif ancora and destinazione.suffix == ".html":
                testo_dest = lette.get(destinazione.name, (None, destinazione.read_text()))[1]
                if f'id="{ancora}"' not in testo_dest:
                    err(f"ancora inesistente: {href}")

    # testo reso tenue con la trasparenza: il contrasto cala e Lighthouse lo boccia (vedi standard/lezioni.md)
    for css in sorted((cartella / "assets").glob("*.css")):
        for n, riga in enumerate(css.read_text().splitlines(), 1):
            if re.search(r"opacity:\s*0?\.\d", riga) and "transition" not in riga:
                problemi.append(("avviso", f"{cartella.name}/{css.name}:{n}",
                                 "opacity sotto 1: se riguarda del testo usa un colore, non la trasparenza"))

    if pagine and not (cartella / "sitemap.xml").exists() and cartella.name != "samples":
        problemi.append(("avviso", cartella.name, "manca sitemap.xml"))


def main():
    argomenti = [a for a in sys.argv[1:] if not a.startswith("--")]
    demo = "--demo" in sys.argv
    radice = pathlib.Path(argomenti[0] if argomenti else "samples")
    cartelle = [radice] + sorted(p for p in radice.iterdir() if p.is_dir() and any(p.glob("*.html")))
    problemi = []
    for c in cartelle:
        controlla_sito(c, demo, problemi)
    for livello, dove, messaggio in problemi:
        print(f"{livello:7} {dove:28} {messaggio}")
    errori = sum(1 for l, *_ in problemi if l == "ERRORE")
    pagine = sum(len(list(c.glob('*.html'))) for c in cartelle)
    print(f"\n{pagine} pagine controllate: {errori} errori, {len(problemi) - errori} avvisi.")
    sys.exit(1 if errori else 0)


if __name__ == "__main__":
    main()
