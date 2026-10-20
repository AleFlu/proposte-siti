"""Scarica i font da Google Fonts e li serve dal sito (niente richieste a Google: GDPR).

Uso: python3 strumenti/scarica_font.py <cartella-assets> "<URL css2 di Google Fonts>"
Scrive <cartella-assets>/font/*.woff2 e <cartella-assets>/font.css con i @font-face locali
(solo i sottoinsiemi latin e latin-ext, che bastano per l'italiano).
"""
import pathlib
import re
import sys
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
assets = pathlib.Path(sys.argv[1])
url = sys.argv[2]
cartella = assets / "font"
cartella.mkdir(parents=True, exist_ok=True)

css = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read().decode()
blocchi = re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S)
uscita = ["/* Font serviti dal sito: generato da strumenti/scarica_font.py */"]
for sottoinsieme, blocco in blocchi:
    if sottoinsieme not in ("latin", "latin-ext"):
        continue
    famiglia = re.search(r"font-family: '([^']+)'", blocco).group(1)
    stile = re.search(r"font-style: (\w+)", blocco).group(1)
    peso = re.search(r"font-weight: ([\d ]+)", blocco).group(1).replace(" ", "-")
    sorgente = re.search(r"url\((https://[^)]+\.woff2)\)", blocco).group(1)
    nome = f"{famiglia.lower().replace(' ', '-')}-{stile}-{peso}-{sottoinsieme}.woff2"
    dest = cartella / nome
    if not dest.exists():
        dest.write_bytes(urllib.request.urlopen(urllib.request.Request(sorgente, headers={"User-Agent": UA})).read())
    uscita.append(blocco.replace(sorgente, f"font/{nome}").replace("format('woff2')", "format('woff2')"))
(assets / "font.css").write_text("\n".join(uscita) + "\n")
print(f"{len(uscita) - 1} @font-face, {sum(f.stat().st_size for f in cartella.iterdir()) // 1024} KB in {cartella}")
