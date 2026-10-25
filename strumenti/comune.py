"""Pezzi comuni a tutti i generatori di sito (vedi standard/README.md).

- icone: favicon SVG, icone PNG per iPhone/Android e manifest, da un solo SVG;
- sitemap.xml del sito;
- testa_icone(): i tag <link> da mettere nel <head> di ogni pagina.
Le icone PNG si ricavano dall'SVG con qlmanage (macOS) e Pillow.
"""
import datetime
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
