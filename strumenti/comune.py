"""Pezzi comuni a tutti i generatori di sito (vedi standard/README.md).

- icone: favicon SVG, icone PNG per iPhone/Android e manifest, da un solo SVG;
- sitemap.xml del sito;
- testa_icone(): i tag <link> da mettere nel <head> di ogni pagina;
- con_versione(): link a CSS e JS che cambia quando cambia il file;
- chiusure, festivi e orari speciali: avvisi, tabella, dati per lo script e per Google.
Le icone PNG si ricavano dall'SVG con qlmanage (macOS) e Pillow.
"""
import datetime
import hashlib
import html
import json
import pathlib
import subprocess
import tempfile


def scrivi_icone(assets, svg, nome, colore_tema, colore_fondo):
    """Scrive in assets/: favicon.svg, icona-180.png, icona-192.png, icona-512.png, sito.webmanifest.

    svg: un'icona quadrata a tutto campo (niente angoli arrotondati: iPhone li arrotonda da solo).
    """
    from PIL import Image

    assets = pathlib.Path(assets)
    assets.mkdir(parents=True, exist_ok=True)
    (assets / "favicon.svg").write_text(svg)
    with tempfile.TemporaryDirectory() as tmp:
        sorgente = pathlib.Path(tmp) / "icona.svg"
        sorgente.write_text(svg)
        subprocess.run(["qlmanage", "-t", "-s", "512", "-o", tmp, str(sorgente)],
                       check=True, capture_output=True)
        grande = Image.open(pathlib.Path(tmp) / "icona.svg.png").convert("RGB")
    for lato in (180, 192, 512):
        grande.resize((lato, lato), Image.LANCZOS).save(assets / f"icona-{lato}.png", optimize=True)
    manifest = {
        "name": nome, "short_name": nome, "start_url": "../", "display": "browser",
        "theme_color": colore_tema, "background_color": colore_fondo,
        "icons": [{"src": f"icona-{l}.png", "sizes": f"{l}x{l}", "type": "image/png"} for l in (192, 512)],
    }
    (assets / "sito.webmanifest").write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n")


def testa_icone(cartella="assets/"):
    return (f'<link rel="icon" href="{cartella}favicon.svg" type="image/svg+xml">\n'
            f'<link rel="icon" href="{cartella}icona-192.png" sizes="192x192" type="image/png">\n'
            f'<link rel="apple-touch-icon" href="{cartella}icona-180.png">\n'
            f'<link rel="manifest" href="{cartella}sito.webmanifest">')


def scrivi_sitemap(out, base, pagine):
    """pagine: i nomi dei file HTML da indicizzare (la home come "index.html")."""
    oggi = datetime.date.today().isoformat()
    righe = "\n".join(
        f"  <url><loc>{base}{'' if p == 'index.html' else p}</loc><lastmod>{oggi}</lastmod></url>" for p in pagine)
    (pathlib.Path(out) / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{righe}\n</urlset>\n")


def con_versione(sito, percorso):
    """"assets/stile.css?v=1a2b3c4d": l'impronta cambia solo quando cambia il file.

    Così dopo un aggiornamento il telefono scarica il CSS nuovo invece di usare per minuti la copia in
    cache (GitHub Pages dichiara max-age=600). controlla.py segnala le impronte non aggiornate.
    """
    impronta = hashlib.sha256((pathlib.Path(sito) / percorso).read_bytes()).hexdigest()[:8]
    return f"{percorso}?v={impronta}"


# ---------- chiusure, festivi e orari speciali ----------
# Una chiusura è {"dal": "2026-12-25", "al": "2026-12-26", "motivo": "Natale"}: date in ora italiana, "al"
# compreso, "motivo" da leggere dopo "chiuso per". Con "fasce": [(7, 14)] il giorno non è chiuso ma ha un
# orario speciale (e allora "motivo" si legge da solo: "vigilia di Natale").
PREAVVISO = 14    # giorni prima di una chiusura in cui compare l'avviso in cima alle pagine
ORIZZONTE = 90    # giorni coperti dalla tabella "Prossime chiusure"
MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto",
        "settembre", "ottobre", "novembre", "dicembre"]
SETTIMANA = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"]
_data = datetime.date.fromisoformat
ora = lambda h: f"{int(h)}:{round(h % 1 * 60):02d}"


def _pasqua(anno):
    """Domenica di Pasqua (algoritmo di Meeus/Jones/Butcher, calendario gregoriano)."""
    a, b, c = anno % 19, anno // 100, anno % 100
    d, e = divmod(b, 4)
    g = (8 * b + 13) // 25
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    mese, giorno = divmod(h + l - 7 * m + 114, 31)
    return datetime.date(anno, mese, giorno + 1)


def festivi(*anni, patrono=None):
    """Chiusure in tutte le festività nazionali degli anni dati, Pasqua e Pasquetta comprese.

    patrono: ("MM-GG", "nome"), per esempio ("06-24", "San Giovanni") a Torino.
    Il 4 ottobre (San Francesco) è festa nazionale dal 2026 (legge 151/2025).
    """
    voci = []
    for anno in anni:
        fissi = [("01-01", "Capodanno"), ("01-06", "l’Epifania"), ("04-25", "la Festa della Liberazione"),
                 ("05-01", "la Festa dei lavoratori"), ("06-02", "la Festa della Repubblica"), ("08-15", "Ferragosto"),
                 ("11-01", "Ognissanti"), ("12-08", "l’Immacolata"), ("12-25", "Natale"), ("12-26", "Santo Stefano")]
        if anno >= 2026:
            fissi.append(("10-04", "San Francesco"))
        if patrono:
            fissi.append(patrono)
        giorni = [(_data(f"{anno}-{md}"), nome) for md, nome in fissi]
        pasqua = _pasqua(anno)
        giorni += [(pasqua, "Pasqua"), (pasqua + datetime.timedelta(days=1), "Pasquetta")]
        voci += [{"dal": d.isoformat(), "al": d.isoformat(), "motivo": nome} for d, nome in sorted(giorni)]
    return voci


def prossime_chiusure(chiusure, oggi=None):
    """Le chiusure non ancora finite, in ordine. Giorni chiusi consecutivi diventano un solo periodo
    ("Natale e Santo Stefano"); una chiusura che sta dentro un'altra sparisce."""
    oggi = (oggi or datetime.date.today()).isoformat()
    voci = sorted(({**c, "fasce": [list(f) for f in c.get("fasce", [])]} for c in chiusure if c["al"] >= oggi),
                  key=lambda c: (c["dal"], c["al"]))
    unite, motivi = [], []
    for c in voci:
        prima = unite[-1] if unite else None
        if prima and not prima["fasce"] and not c["fasce"]:
            if c["al"] <= prima["al"]:
                continue
            if _data(c["dal"]) <= _data(prima["al"]) + datetime.timedelta(days=1):
                prima["al"] = c["al"]
                motivi[-1] += [c["motivo"]] if c.get("motivo") else []
                continue
        unite.append(dict(c))
        motivi.append([c["motivo"]] if c.get("motivo") else [])
    for c, m in zip(unite, motivi):
        if m:
            c["motivo"] = m[0] if len(m) == 1 else ", ".join(m[:-1]) + " e " + m[-1]
    return unite


def _num(d):
    return "1°" if d.day == 1 else str(d.day)


def _con(articolo, d):
    """"il 9", "l’8", "dal 9", "dall’11", "al 23", "all’8": otto e undici vogliono l'apostrofo."""
    if _num(d) in ("8", "11"):
        return {"il": "l’", "dal": "dall’", "al": "all’"}[articolo] + _num(d)
    return f"{articolo} {_num(d)}"


def periodo(c):
    """(per la tabella, dentro una frase): ("Domenica 1° novembre", "domenica 1° novembre"),
    ("25 e 26 dicembre", "il 25 e il 26 dicembre"), ("Dal 9 al 23 agosto", "dal 9 al 23 agosto")."""
    d1, d2 = _data(c["dal"]), _data(c["al"])
    m1, m2 = MESI[d1.month - 1], MESI[d2.month - 1]
    if d1 == d2:
        frase = f"{SETTIMANA[d1.weekday()]} {_num(d1)} {m1}"
        return frase[0].upper() + frase[1:], frase
    if d2 - d1 == datetime.timedelta(days=1):
        if m1 == m2:
            return f"{_num(d1)} e {_num(d2)} {m2}", f"{_con('il', d1)} e {_con('il', d2)} {m2}"
        return f"{_num(d1)} {m1} e {_num(d2)} {m2}", f"{_con('il', d1)} {m1} e {_con('il', d2)} {m2}"
    frase = f"{_con('dal', d1)}{' ' + m1 if m1 != m2 else ''} {_con('al', d2)} {m2}"
    return frase[0].upper() + frase[1:], frase


def _fasce_frase(fasce):
    return " e ".join(f"dalle {ora(a)} alle {ora(b)}" for a, b in fasce)


def testo_avviso(c):
    """La frase dell'avviso in cima alle pagine."""
    breve, frase = periodo(c)
    motivo = c.get("motivo")
    if c["fasce"]:
        return f"{frase[0].upper() + frase[1:]}{', ' + motivo if motivo else ''}: aperto {_fasce_frase(c['fasce'])}."
    per = f" per {motivo}" if motivo else ""
    if c["dal"] == c["al"]:
        return f"{frase[0].upper() + frase[1:]} chiuso{per}."
    return f"Chiuso{per} {frase}."


def avvisi_chiusure(chiusure, preavviso=PREAVVISO):
    """Un avviso per chiusura, nascosto: lo script lo mostra da `preavviso` giorni prima fino all'ultimo giorno."""
    righe = []
    for c in chiusure:
        da = (_data(c["dal"]) - datetime.timedelta(days=preavviso)).isoformat()
        righe.append(f'<div class="avviso-chiusura" data-da="{da}" data-al="{c["al"]}" hidden>'
                     f'<p class="wrap">{html.escape(testo_avviso(c))}</p></div>')
    return "\n".join(righe)


def righe_chiusure(chiusure, oggi=None, orizzonte=ORIZZONTE):
    """Le righe della tabella "Prossime chiusure". Quelle oltre l'orizzonte sono nascoste: lo script
    ricalcola ogni giorno quali mostrare, anche se il sito non viene rigenerato."""
    fino = ((oggi or datetime.date.today()) + datetime.timedelta(days=orizzonte)).isoformat()
    righe = []
    for c in chiusure:
        breve, _ = periodo(c)
        motivo = c.get("motivo")
        if c["fasce"]:
            cella = ", ".join(f"{ora(a)} – {ora(b)}" for a, b in c["fasce"]) + (f" ({motivo})" if motivo else "")
        else:
            cella = "Chiuso" + (f" per {motivo}" if motivo else "")
        nascosta = " hidden" if c["dal"] > fino else ""
        righe.append(f'<tr data-dal="{c["dal"]}" data-al="{c["al"]}"{nascosta}>'
                     f'<th scope="row">{html.escape(breve)}</th><td>{html.escape(cella)}</td></tr>')
    return "\n".join(righe)


def dati_chiusure(chiusure):
    """Le chiusure per lo script della pagina (stato "aperto ora", giorni prenotabili)."""
    voci = [{k: c[k] for k in ("dal", "al", "motivo", "fasce") if k in c} for c in chiusure]
    return f'<script type="application/json" id="chiusure-dati">{json.dumps(voci, ensure_ascii=False)}</script>'


def orari_ld(chiusure):
    """Le chiusure per Google, come chiede la guida LocalBusiness: openingHoursSpecification con
    validFrom e validThrough; "00:00"–"00:00" vuol dire chiuso tutto il giorno."""
    hhmm = lambda h: f"{int(h):02d}:{round(h % 1 * 60):02d}"
    voci = []
    for c in chiusure:
        for a, b in c["fasce"] or [(0, 0)]:
            voci.append({"@type": "OpeningHoursSpecification", "opens": hhmm(a), "closes": hhmm(b),
                         "validFrom": c["dal"], "validThrough": c["al"]})
    return voci
