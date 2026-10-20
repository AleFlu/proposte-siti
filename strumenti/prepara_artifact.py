"""Prepara la copia di un sample da pubblicare come artifact su claude.ai.

Uso: python3 strumenti/prepara_artifact.py pastificio

La fonte è sempre samples/<nome>/ su git: l'artifact non si modifica mai a mano.
Scrive in .artifact/<nome>/ (ignorata da git):
- index.html senza doctype/html/head/body, perché l'artifact aggiunge il proprio scheletro;
- le altre pagine e assets/ copiati così come sono.
Poi si pubblica con lo strumento Artifact: file_path = .artifact/<nome>/index.html,
files = tutte le altre pagine e gli assets, url = l'artifact esistente (vedi ARTIFACT).
"""
import pathlib
import re
import shutil
import sys

ARTIFACT = {
    "pastificio": "https://claude.ai/code/artifact/0700d175-c57f-449d-ae4d-360a80249c14",
    "la-cupola": "https://claude.ai/artifact/5RsbSNaxjQyyr8X373NkvR",
}

radice = pathlib.Path(__file__).resolve().parent.parent
nome = sys.argv[1]
fonte = radice / "samples" / nome
dest = radice / ".artifact" / nome
if dest.exists():
    shutil.rmtree(dest)
shutil.copytree(fonte, dest)

pagina = (fonte / "index.html").read_text()
testa = re.search(r"<head>(.*?)</head>", pagina, re.S).group(1)
testa = re.sub(r'\s*<meta charset="utf-8">|\s*<meta name="viewport"[^>]*>', "", testa)
apertura_body = re.search(r"<body([^>]*)>", pagina).group(1)
corpo = re.search(r"<body[^>]*>(.*)</body>", pagina, re.S).group(1)
# gli attributi di <body> (es. data-pagina) si perdono nello scheletro: li rimette uno script
attributi = re.findall(r'(data-[\w-]+)="([^"]*)"', apertura_body)
rimetti = "".join(f'document.body.setAttribute("{k}", "{v}");' for k, v in attributi)
uscita = '<meta name="claude:viewport-fit-sides" content="cover">\n' + testa.strip() + "\n"
if rimetti:
    uscita += f"<script>{rimetti}</script>\n"
uscita += corpo.strip() + "\n"
(dest / "index.html").write_text(uscita)

altri = sorted(str(p.relative_to(dest)) for p in dest.rglob("*") if p.is_file() and p.name != "index.html")
print("pagina:", dest / "index.html")
print("files:", altri)
print("artifact:", ARTIFACT.get(nome, "(nuovo)"))
