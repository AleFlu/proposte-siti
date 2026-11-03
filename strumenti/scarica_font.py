"""Scarica i font da Google Fonts e li serve dal sito (niente richieste a Google: GDPR).

Uso: python3 strumenti/scarica_font.py <cartella-assets> "<URL css2 di Google Fonts>"
Scrive <cartella-assets>/font/*.woff2 e <cartella-assets>/font.css con i @font-face locali
(solo i sottoinsiemi latin e latin-ext, che bastano per l'italiano).
Per un font variabile chiesto con più pesi (wght@400;500;600) Google ripete lo stesso file
in un @font-face per peso: qui diventano un solo @font-face con l'intervallo (400 600),
così il browser lo scarica una volta sola.

Accanto ai file scrive anche la licenza di ogni famiglia (font/OFL-<famiglia>.txt), presa dal repository
google/fonts: la SIL Open Font License chiede che accompagni il font a ogni distribuzione.
Solo le licenze, per un sito che ha già i font: python3 strumenti/scarica_font.py <cartella-assets> --licenze
"""
import pathlib
import re
import sys
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
LICENZE = "https://raw.githubusercontent.com/google/fonts/main/ofl/{}/OFL.txt"


def scarica_licenze(assets):
    """Una licenza per ogni famiglia citata in font.css: font/OFL-alfa-slab-one.txt e così via."""
    famiglie = sorted(set(re.findall(r"font-family: '([^']+)'", (assets / "font.css").read_text())))
    for famiglia in famiglie:
        dest = assets / "font" / f"OFL-{famiglia.lower().replace(' ', '-')}.txt"
        try:
            testo = urllib.request.urlopen(LICENZE.format(famiglia.lower().replace(" ", ""))).read()
        except OSError as ex:
            print(f"licenza di {famiglia} non trovata ({ex}): aggiungila a mano in {dest}")
            continue
        dest.write_bytes(testo)
    print(f"{len(famiglie)} licenze in {assets / 'font'}")


assets = pathlib.Path(sys.argv[1])
if sys.argv[2:] == ["--licenze"]:
    scarica_licenze(assets)
    sys.exit()
url = sys.argv[2]
cartella = assets / "font"
cartella.mkdir(parents=True, exist_ok=True)

css = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read().decode()
blocchi = re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S)
gruppi = {}  # un file di Google → il primo @font-face che lo usa e tutti i pesi
for sottoinsieme, blocco in blocchi:
    if sottoinsieme not in ("latin", "latin-ext"):
        continue
    sorgente = re.search(r"url\((https://[^)]+\.woff2)\)", blocco).group(1)
    pesi = [int(p) for p in re.search(r"font-weight: ([\d ]+);", blocco).group(1).split()]
    gruppi.setdefault(sorgente, (sottoinsieme, blocco, []))[2].extend(pesi)

uscita = ["/* Font serviti dal sito: generato da strumenti/scarica_font.py */"]
for sorgente, (sottoinsieme, blocco, pesi) in gruppi.items():
    famiglia = re.search(r"font-family: '([^']+)'", blocco).group(1)
    stile = re.search(r"font-style: (\w+)", blocco).group(1)
    peso = f"{min(pesi)} {max(pesi)}" if min(pesi) != max(pesi) else str(pesi[0])
    nome = f"{famiglia.lower().replace(' ', '-')}-{stile}-{peso.replace(' ', '-')}-{sottoinsieme}.woff2"
    dest = cartella / nome
    if not dest.exists():
        dest.write_bytes(urllib.request.urlopen(urllib.request.Request(sorgente, headers={"User-Agent": UA})).read())
    blocco = re.sub(r"font-weight: [\d ]+;", f"font-weight: {peso};", blocco)
    uscita.append(blocco.replace(sorgente, f"font/{nome}"))
(assets / "font.css").write_text("\n".join(uscita) + "\n")
print(f"{len(uscita) - 1} @font-face, {sum(f.stat().st_size for f in cartella.glob('*.woff2')) // 1024} KB in {cartella}")
scarica_licenze(assets)
